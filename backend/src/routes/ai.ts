import { Router, Request, Response } from 'express';
import { aiSearchDrugs, aiRecommend, aiCompareSummary } from '../services/geminiService.js';
import { isGeminiConfigured } from '../config.js';

const router = Router();

/**
 * GET /api/ai/status
 * Check if Gemini AI is configured and available.
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    configured: isGeminiConfigured(),
    model: isGeminiConfigured() ? 'gemini-2.5-flash' : null,
  });
});

/**
 * POST /api/ai/search
 * Natural-language drug search powered by Gemini.
 * Body: { query: string }
 */
router.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'query field is required' });
  }

  try {
    const result = await aiSearchDrugs(query);
    res.json({
      drugs: result.matches,
      total: result.matches.length,
      aiSummary: result.aiSummary,
      aiPowered: isGeminiConfigured(),
    });
  } catch (error) {
    console.error('[AI Route] Search error:', error);
    res.status(500).json({ error: 'AI search failed' });
  }
});

/**
 * POST /api/ai/recommend
 * Get AI-generated savings recommendation for a drug.
 * Body: { drugId: string }
 */
router.post('/recommend', async (req: Request, res: Response) => {
  const { drugId } = req.body;

  if (!drugId || typeof drugId !== 'string') {
    return res.status(400).json({ error: 'drugId field is required' });
  }

  try {
    const recommendation = await aiRecommend(drugId);
    res.json({
      drugId,
      recommendation,
      aiPowered: isGeminiConfigured(),
    });
  } catch (error) {
    console.error('[AI Route] Recommend error:', error);
    res.status(500).json({ error: 'AI recommendation failed' });
  }
});

/**
 * POST /api/ai/compare
 * Get AI-generated comparison summary between generic alternatives.
 * Body: { drugId: string, alternativeIds: string[] }
 */
router.post('/compare', async (req: Request, res: Response) => {
  const { drugId, alternativeIds } = req.body;

  if (!drugId || typeof drugId !== 'string') {
    return res.status(400).json({ error: 'drugId field is required' });
  }

  if (!alternativeIds || !Array.isArray(alternativeIds)) {
    return res.status(400).json({ error: 'alternativeIds array is required' });
  }

  try {
    const summary = await aiCompareSummary(drugId, alternativeIds);
    res.json({
      drugId,
      alternativeIds,
      summary,
      aiPowered: isGeminiConfigured(),
    });
  } catch (error) {
    console.error('[AI Route] Compare error:', error);
    res.status(500).json({ error: 'AI comparison failed' });
  }
});

export default router;
