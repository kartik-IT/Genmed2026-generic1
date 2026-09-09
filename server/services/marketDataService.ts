import { Pharmacy } from '../../src/types';
import { config } from '../config';

export type MarketDataSource = 'partner' | 'seeded';

export interface StockVerification {
  pharmacyId: string;
  drugId: string;
  status: string;
  count: number;
  unitsText: string;
  verifiedTime: string;
  isLimitedSupply: boolean;
  source: MarketDataSource;
  fetchedAt: string;
}

export interface MarketPrice {
  pharmacyId: string;
  pharmacyName: string;
  cashPrice: number;
  brandPrice: number;
  genericRate: number;
  distance: string;
  stockStatus: string;
}

const REQUEST_TIMEOUT_MS = 8_000;

function seededStock(pharmacy: Pharmacy, drugId: string): StockVerification {
  return {
    pharmacyId: pharmacy.id,
    drugId,
    status: pharmacy.stockStatus,
    count: pharmacy.stockCount,
    unitsText: pharmacy.stockUnitsText,
    verifiedTime: pharmacy.verifiedTime,
    isLimitedSupply: pharmacy.isLimitedSupply || false,
    source: 'seeded',
    fetchedAt: new Date().toISOString(),
  };
}

async function partnerRequest<T>(baseUrl: string, path: string, key: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(new URL(path, baseUrl), {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Partner request failed with ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Retrieves stock from the configured partner using the documented adapter
 * contract. A partner response must have status, count, unitsText, and
 * verifiedTime fields. Until configured, seeded development data is clearly
 * identified as such rather than presented as verified inventory.
 */
export async function verifyStock(pharmacy: Pharmacy, drugId: string): Promise<StockVerification> {
  if (!config.pharmacyStockProviderUrl) return seededStock(pharmacy, drugId);

  try {
    const path = `stock?pharmacyId=${encodeURIComponent(pharmacy.id)}&drugId=${encodeURIComponent(drugId)}`;
    const payload = await partnerRequest<Partial<StockVerification>>(
      config.pharmacyStockProviderUrl,
      path,
      config.pharmacyStockProviderKey
    );
    if (typeof payload.status !== 'string' || typeof payload.count !== 'number' || typeof payload.unitsText !== 'string' || typeof payload.verifiedTime !== 'string') {
      throw new Error('Partner stock response does not match the adapter contract');
    }
    return {
      pharmacyId: pharmacy.id,
      drugId,
      status: payload.status,
      count: Math.max(0, Math.floor(payload.count)),
      unitsText: payload.unitsText,
      verifiedTime: payload.verifiedTime,
      isLimitedSupply: Boolean(payload.isLimitedSupply),
      source: 'partner',
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('[MarketData] Partner stock verification failed; returning labeled seeded fallback.', error);
    return seededStock(pharmacy, drugId);
  }
}

/**
 * Retrieves price rows from a configured partner. The partner response must be
 * `{ pharmacyPricing: MarketPrice[] }`; malformed/unavailable data falls back
 * to the catalog and is always labeled with source: seeded.
 */
export async function fetchPartnerPrices(drugId: string): Promise<{ prices: MarketPrice[]; source: MarketDataSource }> {
  if (!config.pricingProviderUrl) return { prices: [], source: 'seeded' };
  try {
    const payload = await partnerRequest<{ pharmacyPricing?: MarketPrice[] }>(
      config.pricingProviderUrl,
      `prices?drugId=${encodeURIComponent(drugId)}`,
      config.pricingProviderKey
    );
    if (!Array.isArray(payload.pharmacyPricing) || payload.pharmacyPricing.some((row) => !isValidPrice(row))) {
      throw new Error('Partner pricing response does not match the adapter contract');
    }
    return { prices: payload.pharmacyPricing, source: 'partner' };
  } catch (error) {
    console.warn('[MarketData] Partner pricing request failed; returning labeled seeded fallback.', error);
    return { prices: [], source: 'seeded' };
  }
}

function isValidPrice(row: MarketPrice): boolean {
  return typeof row.pharmacyId === 'string' && typeof row.pharmacyName === 'string' &&
    Number.isFinite(row.cashPrice) && Number.isFinite(row.brandPrice) &&
    Number.isFinite(row.genericRate) && typeof row.distance === 'string' && typeof row.stockStatus === 'string';
}

export function marketProviderStatus() {
  return {
    pharmacyStock: config.pharmacyStockProviderUrl ? 'configured' : 'seeded-fallback',
    pricing: config.pricingProviderUrl ? 'configured' : 'seeded-fallback',
  } as const;
}
