/**
 * Offline-first data helpers.
 *
 * Each helper tries the network first; on failure it falls back to
 * IndexedDB. Successful network responses are persisted to IndexedDB
 * so the next offline session has data to show.
 *
 * If both network and cache fail, falls back to hardcoded mock data.
 *
 * STALE_THRESHOLD_MS: data older than 10 minutes is treated as
 * potentially stale and a background network refresh is attempted,
 * but the cached data is returned immediately (stale-while-revalidate).
 */

import { putAll, getAll, cacheAgeMs } from './db';
import { DrugProfile, Pharmacy, TrackedRegimen, FillLedgerItem } from '../types';
import { MOCK_DRUGS, MOCK_PHARMACIES, MOCK_REGIMENS, MOCK_LEDGER } from '../data/mockData';

const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Drugs ──────────────────────────────────────────────────────────

export async function getCachedDrugs(): Promise<DrugProfile[]> {
  const age = await cacheAgeMs('drugs');

  async function fetchAndCache(): Promise<DrugProfile[]> {
    const data = await fetchJson<{ drugs: DrugProfile[] }>('/api/drugs');
    await putAll('drugs', data.drugs);
    return data.drugs;
  }

  if (age < STALE_THRESHOLD_MS) {
    // Fresh enough — use cache and revalidate in background if stale
    const cached = await getAll<DrugProfile>('drugs');
    if (cached.length > 0) {
      if (age > STALE_THRESHOLD_MS / 2) {
        fetchAndCache().catch(() => {}); // background refresh
      }
      return cached;
    }
  }

  try {
    return await fetchAndCache();
  } catch {
    // Network unavailable — try cache first
    const cached = await getAll<DrugProfile>('drugs');
    if (cached.length > 0) return cached;
    
    // No cache — use mock data as last resort
    console.warn('[Offline Cache] Using mock drug data (backend unavailable)');
    return MOCK_DRUGS;
  }
}

// ── Pharmacies ─────────────────────────────────────────────────────

export async function getCachedPharmacies(): Promise<Pharmacy[]> {
  const age = await cacheAgeMs('pharmacies');

  async function fetchAndCache(): Promise<Pharmacy[]> {
    const data = await fetchJson<{ pharmacies: Pharmacy[] }>('/api/pharmacies');
    await putAll('pharmacies', data.pharmacies);
    return data.pharmacies;
  }

  if (age < STALE_THRESHOLD_MS) {
    const cached = await getAll<Pharmacy>('pharmacies');
    if (cached.length > 0) {
      if (age > STALE_THRESHOLD_MS / 2) fetchAndCache().catch(() => {});
      return cached;
    }
  }

  try {
    return await fetchAndCache();
  } catch {
    const cached = await getAll<Pharmacy>('pharmacies');
    if (cached.length > 0) return cached;
    
    // No cache — use mock data
    console.warn('[Offline Cache] Using mock pharmacy data (backend unavailable)');
    return MOCK_PHARMACIES;
  }
}

// ── Regimens ───────────────────────────────────────────────────────

export async function getCachedRegimens(): Promise<TrackedRegimen[]> {
  const age = await cacheAgeMs('regimens');

  async function fetchAndCache(): Promise<TrackedRegimen[]> {
    const data = await fetchJson<{ regimens: TrackedRegimen[] }>('/api/regimens');
    await putAll('regimens', data.regimens);
    return data.regimens;
  }

  if (age < STALE_THRESHOLD_MS) {
    const cached = await getAll<TrackedRegimen>('regimens');
    if (cached.length > 0) {
      if (age > STALE_THRESHOLD_MS / 2) fetchAndCache().catch(() => {});
      return cached;
    }
  }

  try {
    return await fetchAndCache();
  } catch {
    const cached = await getAll<TrackedRegimen>('regimens');
    if (cached.length > 0) return cached;
    
    // No cache — use mock data
    console.warn('[Offline Cache] Using mock regimen data (backend unavailable)');
    return MOCK_REGIMENS;
  }
}

// ── Ledger ─────────────────────────────────────────────────────────

export async function getCachedLedger(): Promise<FillLedgerItem[]> {
  const age = await cacheAgeMs('ledger');

  async function fetchAndCache(): Promise<FillLedgerItem[]> {
    const data = await fetchJson<{ ledger: FillLedgerItem[] }>('/api/regimens/ledger/all');
    await putAll('ledger', data.ledger);
    return data.ledger;
  }

  if (age < STALE_THRESHOLD_MS) {
    const cached = await getAll<FillLedgerItem>('ledger');
    if (cached.length > 0) {
      if (age > STALE_THRESHOLD_MS / 2) fetchAndCache().catch(() => {});
      return cached;
    }
  }

  try {
    return await fetchAndCache();
  } catch {
    const cached = await getAll<FillLedgerItem>('ledger');
    if (cached.length > 0) return cached;
    
    // No cache — use mock data
    console.warn('[Offline Cache] Using mock ledger data (backend unavailable)');
    return MOCK_LEDGER;
  }
}
