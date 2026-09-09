import { Router, Request, Response } from 'express';
import { getDrugById } from '../services/dataService.js';
import { fetchPartnerPrices, MarketDataSource, MarketPrice } from '../services/marketDataService.js';

const router = Router();

/**
 * GET /api/pricing?drugId=
 * Get pricing breakdown for a specific drug across all pharmacies.
 */
router.get('/', async (req: Request, res: Response) => {
  const drugId = req.query.drugId as string | undefined;

  if (!drugId) {
    return res.status(400).json({ error: 'drugId query parameter is required' });
  }

  const drug = getDrugById(drugId);
  if (!drug) {
    return res.status(404).json({ error: 'Drug not found', drugId });
  }

  const partnerResult = await fetchPartnerPrices(drug.id);
  const source = partnerResult.prices.length > 0 ? partnerResult.source : 'seeded';
  const priceRows = partnerResult.prices.length > 0 ? partnerResult.prices : drug.pharmacies.map((p) => ({
    pharmacyId: p.id,
    pharmacyName: p.name,
    cashPrice: p.cashPrice,
    brandPrice: p.brandPrice,
    genericRate: p.genericRate,
    savingsPercent: Math.round(((p.brandPrice - p.cashPrice) / p.brandPrice) * 100),
    savingsAmount: +(p.brandPrice - p.cashPrice).toFixed(2),
    distance: p.distance,
    stockStatus: p.stockStatus,
  }));
  res.json(buildPricingResponse(drug, priceRows, source));
});

/**
 * GET /api/pricing/compare?drugIds=id1&drugIds=id2
 * Bulk pricing comparison for multiple drugs.
 */
router.get('/compare', async (req: Request, res: Response) => {
  let drugIds = req.query.drugIds;

  if (!drugIds) {
    return res.status(400).json({ error: 'drugIds query parameter is required' });
  }

  // Normalize to array
  if (typeof drugIds === 'string') {
    drugIds = [drugIds];
  }

  if (!Array.isArray(drugIds) || drugIds.length === 0) {
    return res.status(400).json({ error: 'drugIds must be a non-empty array' });
  }

  // Cap at 10 drugs for performance
  const ids = (drugIds as string[]).slice(0, 10);

  const comparisons = (await Promise.all(ids.map(async (drugId) => {
      const drug = getDrugById(drugId);
      if (!drug) return null;
      const partnerResult = await fetchPartnerPrices(drug.id);
      const source = partnerResult.prices.length > 0 ? partnerResult.source : 'seeded';
      const priceRows = partnerResult.prices.length > 0 ? partnerResult.prices : drug.pharmacies.map((p) => ({
        pharmacyId: p.id,
        pharmacyName: p.name,
        cashPrice: p.cashPrice,
        brandPrice: p.brandPrice,
        genericRate: p.genericRate,
        savingsPercent: Math.round(((p.brandPrice - p.cashPrice) / p.brandPrice) * 100),
        savingsAmount: +(p.brandPrice - p.cashPrice).toFixed(2),
        distance: p.distance,
        stockStatus: p.stockStatus,
      }));
      return buildPricingResponse(drug, priceRows, source);
    })))
    .filter(Boolean);

  res.json({
    comparisons,
    total: comparisons.length,
  });
});

function buildPricingResponse(
  drug: NonNullable<ReturnType<typeof getDrugById>>,
  rows: MarketPrice[],
  source: MarketDataSource
) {
  const pharmacyPricing = rows.map((p) => ({
    ...p,
    savingsPercent: p.brandPrice > 0 ? Math.round(((p.brandPrice - p.cashPrice) / p.brandPrice) * 100) : 0,
    savingsAmount: +(p.brandPrice - p.cashPrice).toFixed(2),
  }));
  const prices = pharmacyPricing.map((p) => p.cashPrice);
  return {
    drugId: drug.id,
    drugName: drug.genericName,
    brandName: drug.brandName,
    strength: drug.strength,
    bestPrice: prices.length > 0 ? Math.min(...prices) : 0,
    averagePrice: prices.length > 0 ? +(prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2) : 0,
    brandReferencePrice: drug.brandReferencePrice,
    pharmacyPricing,
    total: pharmacyPricing.length,
    source,
    fetchedAt: new Date().toISOString(),
    isLive: source === 'partner',
  };
}

export default router;
