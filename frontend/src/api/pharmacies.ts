import { get } from './client';
import { Pharmacy } from '../types';
import { getCachedPharmacies } from '../lib/offlineCache';

interface PharmacyResponse {
  pharmacy: Pharmacy;
}

export interface StockStatus {
  pharmacyId: string;
  drugId: string;
  status: string;
  count: number;
  unitsText: string;
  verifiedTime: string;
  isLimitedSupply: boolean;
  /** `partner` is a configured inventory vendor; `seeded` is development fallback data. */
  source: 'partner' | 'seeded';
  fetchedAt: string;
}

interface StockResponse {
  stock: StockStatus;
}

// ── Pharmacy API functions ──────────────────────────────────────────

/** Fetches pharmacies — uses offline-first IndexedDB cache. */
export async function fetchPharmacies(_drugId?: string): Promise<Pharmacy[]> {
  return getCachedPharmacies();
}

export async function fetchPharmacy(id: string): Promise<Pharmacy> {
  const data = await get<PharmacyResponse>(`/api/pharmacies/${encodeURIComponent(id)}`);
  return data.pharmacy;
}

export async function checkStock(pharmacyId: string, drugId: string): Promise<StockStatus> {
  const data = await get<StockResponse>(
    `/api/pharmacies/${encodeURIComponent(pharmacyId)}/stock?drugId=${encodeURIComponent(drugId)}`
  );
  return data.stock;
}
