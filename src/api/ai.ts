import { get, post } from './client';
import { DrugProfile } from '../types';

// ── AI API response types ───────────────────────────────────────────

export interface AiStatusResponse {
  configured: boolean;
  model: string | null;
}

export interface AiSearchResponse {
  drugs: DrugProfile[];
  total: number;
  aiSummary: string;
  aiPowered: boolean;
}

export interface AiRecommendResponse {
  drugId: string;
  recommendation: string;
  aiPowered: boolean;
}

export interface AiCompareResponse {
  drugId: string;
  alternativeIds: string[];
  summary: string;
  aiPowered: boolean;
}

// ── AI API functions ────────────────────────────────────────────────

/**
 * Check whether the Gemini AI backend is configured and available.
 */
export async function fetchAiStatus(): Promise<AiStatusResponse> {
  return get<AiStatusResponse>('/api/ai/status');
}

/**
 * Natural-language drug search powered by Gemini AI.
 * Falls back to text matching if AI is not configured.
 */
export async function aiSearch(query: string): Promise<AiSearchResponse> {
  return post<AiSearchResponse>('/api/ai/search', { query });
}

/**
 * Get AI-generated savings recommendation for a specific drug.
 */
export async function aiRecommend(drugId: string): Promise<AiRecommendResponse> {
  return post<AiRecommendResponse>('/api/ai/recommend', { drugId });
}

/**
 * Get AI-generated comparison summary between generic alternatives.
 */
export async function aiCompare(
  drugId: string,
  alternativeIds: string[]
): Promise<AiCompareResponse> {
  return post<AiCompareResponse>('/api/ai/compare', { drugId, alternativeIds });
}
