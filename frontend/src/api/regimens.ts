import { TrackedRegimen, FillLedgerItem } from '../types';
import { getCachedRegimens, getCachedLedger } from '../lib/offlineCache';

// ── Regimen API functions — offline-first ───────────────────────────

export async function fetchRegimens(): Promise<TrackedRegimen[]> {
  return getCachedRegimens();
}

export async function fetchLedger(): Promise<FillLedgerItem[]> {
  return getCachedLedger();
}
