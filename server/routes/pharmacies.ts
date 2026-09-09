import { Router, Request, Response } from 'express';
import {
  getAllPharmacies,
  getPharmacyById,
  getPharmaciesForDrug,
} from '../services/dataService';
import { verifyStock } from '../services/marketDataService';

const router = Router();

/**
 * GET /api/pharmacies
 * List all pharmacies. Optional ?drugId= to get drug-specific pricing.
 */
router.get('/', (req: Request, res: Response) => {
  const drugId = req.query.drugId as string | undefined;

  const pharmacies = drugId
    ? getPharmaciesForDrug(drugId)
    : getAllPharmacies();

  res.json({ pharmacies, total: pharmacies.length });
});

/**
 * GET /api/pharmacies/:id
 * Get a single pharmacy by ID.
 */
router.get('/:id', (req: Request, res: Response) => {
  const pharmacy = getPharmacyById(req.params.id);

  if (!pharmacy) {
    return res.status(404).json({ error: 'Pharmacy not found', id: req.params.id });
  }

  res.json({ pharmacy });
});

/**
 * GET /api/pharmacies/:id/stock?drugId=
 * Check stock status for a specific drug at a pharmacy.
 */
router.get('/:id/stock', async (req: Request, res: Response) => {
  const drugId = req.query.drugId as string;

  if (!drugId) {
    return res.status(400).json({ error: 'drugId query parameter is required' });
  }

  const pharmacy = getPharmacyById(req.params.id);

  if (!pharmacy) {
    return res.status(404).json({ error: 'Pharmacy or drug not found' });
  }

  const stock = await verifyStock(pharmacy, drugId);
  res.json({ stock });
});

export default router;
