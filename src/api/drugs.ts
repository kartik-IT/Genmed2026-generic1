import { get } from './client';
import { DrugProfile } from '../types';

// Re-export AI functions for backward compatibility
export { aiSearch, aiRecommend, aiCompare } from './ai';
export type { AiSearchResponse, AiRecommendResponse, AiCompareResponse } from './ai';

interface DrugsResponse {
  drugs: DrugProfile[];
  total: number;
  query?: string;
}

interface DrugResponse {
  drug: DrugProfile;
}

// ── Drug API functions ──────────────────────────────────────────────

export async function fetchAllDrugs(): Promise<DrugProfile[]> {
  const data = await get<DrugsResponse>('/api/drugs');
  return data.drugs;
}

export async function fetchDrug(id: string): Promise<DrugProfile> {
  const data = await get<DrugResponse>(`/api/drugs/${encodeURIComponent(id)}`);
  return data.drug;
}

export async function searchDrugs(query: string): Promise<DrugProfile[]> {
  const data = await get<DrugsResponse>(`/api/drugs/search?q=${encodeURIComponent(query)}`);
  return data.drugs;
}
