import { get } from './client';

// ── Pricing API response types ──────────────────────────────────────

export interface PharmacyPricing {
  pharmacyId: string;
  pharmacyName: string;
  cashPrice: number;
  brandPrice: number;
  genericRate: number;
  savingsPercent: number;
  savingsAmount: number;
  distance: string;
  stockStatus: string;
}

export interface DrugPricingResponse {
  drugId: string;
  drugName: string;
  brandName: string;
  strength: string;
  bestPrice: number;
  averagePrice: number;
  brandReferencePrice: number;
  pharmacyPricing: PharmacyPricing[];
  total: number;
  /** `partner` is a configured pricing vendor; `seeded` is development fallback data. */
  source: 'partner' | 'seeded';
  fetchedAt: string;
  isLive: boolean;
}

export interface PricingCompareResponse {
  comparisons: DrugPricingResponse[];
  total: number;
}

// ── Pricing API functions ───────────────────────────────────────────

/**
 * Fetch pricing breakdown for a specific drug across all pharmacies.
 */
export async function fetchPricing(drugId: string): Promise<DrugPricingResponse> {
  return get<DrugPricingResponse>(`/api/pricing?drugId=${encodeURIComponent(drugId)}`);
}

/**
 * Fetch bulk pricing comparison for multiple drugs.
 */
export async function comparePricing(drugIds: string[]): Promise<PricingCompareResponse> {
  const params = drugIds.map((id) => `drugIds=${encodeURIComponent(id)}`).join('&');
  return get<PricingCompareResponse>(`/api/pricing/compare?${params}`);
}
