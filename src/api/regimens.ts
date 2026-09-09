import { get } from './client';
import { TrackedRegimen, FillLedgerItem } from '../types';

interface RegimensResponse {
  regimens: TrackedRegimen[];
  total: number;
}

interface LedgerResponse {
  ledger: FillLedgerItem[];
  total: number;
}

// ── Regimen API functions ───────────────────────────────────────────

export async function fetchRegimens(): Promise<TrackedRegimen[]> {
  const data = await get<RegimensResponse>('/api/regimens');
  return data.regimens;
}

export async function fetchLedger(): Promise<FillLedgerItem[]> {
  const data = await get<LedgerResponse>('/api/regimens/ledger/all');
  return data.ledger;
}
