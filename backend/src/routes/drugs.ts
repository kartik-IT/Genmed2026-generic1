import { Router, Request, Response } from 'express';
import { getAllDrugs, getDrugById, searchDrugs } from '../services/dataService.js';
import { lookupNdc } from '../services/openFdaService.js';
import { config } from '../config.js';

const router = Router();

/**
 * GET /api/drugs
 * List all drug profiles. Optional ?q= for text search.
 */
router.get('/', (req: Request, res: Response) => {
  const query = req.query.q as string | undefined;

  if (query && query.length > 120) {
    return res.status(400).json({ error: 'q must be 120 characters or fewer' });
  }

  if (query) {
    const results = searchDrugs(query);
    return res.json({ drugs: results, total: results.length, query });
  }

  const drugs = getAllDrugs();
  res.json({ drugs, total: drugs.length });
});

/**
 * GET /api/drugs/search?q=
 * Dedicated search endpoint (alias for GET /api/drugs?q=)
 */
router.get('/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (query.length > 120) {
    return res.status(400).json({ error: 'q must be 120 characters or fewer' });
  }
  const results = searchDrugs(query);
  res.json({ drugs: results, total: results.length, query });
});

/**
 * GET /api/drugs/ndc/:ndc
 * Live FDA NDC Directory lookup. Kept before /:id so it is not captured by
 * the generic profile route.
 */
router.get('/ndc/:ndc', async (req: Request, res: Response) => {
  const ndc = req.params.ndc.trim();
  if (!/^[0-9-]{8,14}$/.test(ndc)) {
    return res.status(400).json({ error: 'ndc must contain 8–14 digits and optional hyphens' });
  }

  try {
    const product = await lookupNdc(ndc, config.openFdaApiKey);
    if (!product) return res.status(404).json({ error: 'NDC product not found', ndc });
    res.json({ product });
  } catch (error) {
    console.error('[Drugs Route] openFDA NDC lookup failed:', error);
    res.status(502).json({ error: 'FDA NDC directory is temporarily unavailable' });
  }
});

/**
 * GET /api/drugs/:id
 * Get a single drug profile by ID, including alternatives and pharmacies.
 */
router.get('/:id', (req: Request, res: Response) => {
  const drug = getDrugById(req.params.id);

  if (!drug) {
    return res.status(404).json({ error: 'Drug not found', id: req.params.id });
  }

  res.json({ drug });
});

export default router;
