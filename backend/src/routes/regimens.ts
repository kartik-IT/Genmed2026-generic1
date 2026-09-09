import { Router, Request, Response } from 'express';
import { getAllRegimens, getRegimenById, getLedger } from '../services/dataService.js';

const router = Router();

/**
 * GET /api/regimens
 * List all tracked regimens.
 */
router.get('/', (_req: Request, res: Response) => {
  const regimens = getAllRegimens();
  res.json({ regimens, total: regimens.length });
});

/**
 * GET /api/regimens/:id
 * Get a single regimen by ID.
 */
/**
 * GET /api/regimens/ledger/all
 * Get the full fill ledger history.
 */
router.get('/ledger/all', (_req: Request, res: Response) => {
  const items = getLedger();
  res.json({ ledger: items, total: items.length });
});

/**
 * GET /api/regimens/:id
 * Get a single regimen. This must remain after fixed sub-routes.
 */
router.get('/:id', (req: Request, res: Response) => {
  const regimen = getRegimenById(req.params.id);

  if (!regimen) {
    return res.status(404).json({ error: 'Regimen not found', id: req.params.id });
  }

  res.json({ regimen });
});

export default router;
