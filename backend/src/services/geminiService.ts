import { GoogleGenAI } from '@google/genai';
import { config, isGeminiConfigured } from '../config.js';
import { getAllDrugs, getDrugById } from './dataService.js';
import { DrugProfile } from '../types.js';

// ── Gemini client initialization ────────────────────────────────────

let genai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) return null;
  if (!genai) {
    genai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return genai;
}

// ── Simple LRU Cache ────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  // Evict oldest if cache exceeds 100 entries
  if (cache.size >= 100) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// ── AI-powered drug search ──────────────────────────────────────────

export async function aiSearchDrugs(query: string): Promise<{
  matches: DrugProfile[];
  aiSummary: string;
}> {
  const allDrugs = getAllDrugs();

  // Build drug catalog context for Gemini
  const drugCatalog = allDrugs.map((d) => ({
    id: d.id,
    genericName: d.genericName,
    brandName: d.brandName,
    strength: d.strength,
    therapeuticClass: d.therapeuticClass,
    bestGenericRate: d.bestGenericRate,
    brandReferencePrice: d.brandReferencePrice,
    savingsPercent: d.instantNetSavePercent,
  }));

  const client = getClient();
  if (!client) {
    // Fallback: basic text matching
    const q = query.toLowerCase();
    const matches = allDrugs.filter(
      (d) =>
        d.genericName.toLowerCase().includes(q) ||
        d.brandName.toLowerCase().includes(q) ||
        d.therapeuticClass.toLowerCase().includes(q) ||
        d.therapeuticDescription.toLowerCase().includes(q)
    );
    return {
      matches: matches.length > 0 ? matches : allDrugs.slice(0, 3),
      aiSummary: 'AI search unavailable — showing text-matched results.',
    };
  }

  const cacheKey = `ai-search:${query.toLowerCase().trim()}`;
  const cached = getCached<{ matchedIds: string[]; aiSummary: string }>(cacheKey);
  if (cached) {
    const matches = cached.matchedIds
      .map((id) => getDrugById(id))
      .filter(Boolean) as DrugProfile[];
    return { matches, aiSummary: cached.aiSummary };
  }

  try {
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: `You are a pharmacist assistant. A patient asks: "${query}"

Here is our drug catalog:
${JSON.stringify(drugCatalog, null, 2)}

Based on the patient's query, identify which drugs from the catalog are relevant.
Return a JSON object with:
1. "matchedIds": an array of drug IDs from the catalog that match the query
2. "aiSummary": a brief, friendly 1-2 sentence summary explaining why these drugs match

Return ONLY valid JSON, no markdown or code fences.`,
    });

    const text = response?.text || '';
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const matchedIds: string[] = parsed.matchedIds || [];
      const aiSummary: string = parsed.aiSummary || '';

      setCache(cacheKey, { matchedIds, aiSummary });

      const matches = matchedIds
        .map((id) => getDrugById(id))
        .filter(Boolean) as DrugProfile[];

      return {
        matches: matches.length > 0 ? matches : allDrugs.slice(0, 3),
        aiSummary: aiSummary || 'Here are the best matches from our catalog.',
      };
    }
  } catch (error) {
    console.error('[GeminiService] AI search error:', error);
  }

  // Fallback on error
  return {
    matches: allDrugs.slice(0, 3),
    aiSummary: 'AI search encountered an issue — showing top results.',
  };
}

// ── AI-powered recommendation ───────────────────────────────────────

export async function aiRecommend(drugId: string): Promise<string> {
  const drug = getDrugById(drugId);
  if (!drug) return 'Drug not found.';

  const client = getClient();
  if (!client) {
    return `Switch from ${drug.brandName} to generic ${drug.genericName} and save up to $${drug.instantNetSaveMonthly.toFixed(2)}/month (${drug.instantNetSavePercent}% savings). The generic is ${drug.alternatives.find((a) => a.isTopPick)?.ratingCode || 'AB'} rated by the FDA.`;
  }

  const cacheKey = `ai-recommend:${drugId}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    const topGeneric = drug.alternatives.find((a) => a.isTopPick);
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: `You are a helpful pharmacist savings advisor. Generate a personalized, friendly savings recommendation for a patient considering:

Drug: ${drug.genericName} (${drug.strength}) — generic for ${drug.brandName}
Brand price: $${drug.brandReferencePrice}/month
Best generic price: $${drug.bestGenericRate}/month
Savings: ${drug.instantNetSavePercent}% ($${drug.instantNetSaveMonthly}/month)
Top generic: ${topGeneric?.manufacturer || 'Various'} — ${topGeneric?.ratingCode || 'AB rated'}
Therapeutic class: ${drug.therapeuticClass}

Write 2-3 concise sentences. Be warm but clinical. Mention the specific savings amount and FDA equivalence rating. Do not include disclaimers about consulting a doctor.`,
    });

    const text = response?.text || '';
    if (text) {
      setCache(cacheKey, text.trim());
      return text.trim();
    }
  } catch (error) {
    console.error('[GeminiService] Recommendation error:', error);
  }

  return `Switch from ${drug.brandName} to generic ${drug.genericName} and save up to $${drug.instantNetSaveMonthly.toFixed(2)}/month (${drug.instantNetSavePercent}% savings).`;
}

// ── AI-powered comparison summary ───────────────────────────────────

export async function aiCompareSummary(drugId: string, alternativeIds: string[]): Promise<string> {
  const drug = getDrugById(drugId);
  if (!drug) return 'Drug not found.';

  const altsToCompare = drug.alternatives.filter((a) => alternativeIds.includes(a.id));
  if (altsToCompare.length === 0) return 'No alternatives found to compare.';

  const client = getClient();
  if (!client) {
    return altsToCompare
      .map(
        (a) =>
          `${a.manufacturer} ${a.name}: $${a.price30Day}/mo, ${a.matchPercent}% bioequivalent match, ${a.ratingCode}`
      )
      .join('. ');
  }

  const cacheKey = `ai-compare:${drugId}:${alternativeIds.sort().join(',')}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: `You are a clinical pharmacist. Compare these generic alternatives for ${drug.brandName} (${drug.genericName} ${drug.strength}):

${JSON.stringify(
  altsToCompare.map((a) => ({
    manufacturer: a.manufacturer,
    name: a.name,
    price30Day: a.price30Day,
    matchPercent: a.matchPercent,
    ratingCode: a.ratingCode,
    bioavailability: a.bioavailability,
    allergenSafety: a.allergenSafety,
    pharmacokineticsAUC: a.pharmacokineticsAUC,
  })),
  null,
  2
)}

Write a concise 2-3 sentence clinical comparison highlighting price differences, bioequivalence ratings, and any allergen considerations. Be objective and factual.`,
    });

    const text = response?.text || '';
    if (text) {
      setCache(cacheKey, text.trim());
      return text.trim();
    }
  } catch (error) {
    console.error('[GeminiService] Compare error:', error);
  }

  return altsToCompare
    .map(
      (a) =>
        `${a.manufacturer} ${a.name}: $${a.price30Day}/mo, ${a.matchPercent}% match`
    )
    .join('. ');
}
