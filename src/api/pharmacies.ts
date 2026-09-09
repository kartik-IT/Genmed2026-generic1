import { get } from './client';
import { Pharmacy } from '../types';

interface PharmaciesResponse {
  pharmacies: Pharmacy[];
  total: number;
}

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

export async function fetchPharmacies(drugId?: string): Promise<Pharmacy[]> {
  const endpoint = drugId
    ? `/api/pharmacies?drugId=${encodeURIComponent(drugId)}`
    : '/api/pharmacies';
  const data = await get<PharmaciesResponse>(endpoint);
  return data.pharmacies;
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
