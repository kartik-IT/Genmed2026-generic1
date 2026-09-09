import { DrugProfile, Pharmacy, TrackedRegimen, FillLedgerItem } from '../types';

// ── In-memory data store ────────────────────────────────────────────
// Seeded from the existing mock data. When a real database is added,
// only this file needs to change — all route handlers go through here.

import {
  MOCK_DRUGS,
  MOCK_PHARMACIES,
  MOCK_REGIMENS,
  MOCK_LEDGER,
} from '../data/mockData';

// ── Drug queries ────────────────────────────────────────────────────

export function getAllDrugs(): DrugProfile[] {
  return MOCK_DRUGS;
}

export function getDrugById(id: string): DrugProfile | undefined {
  return MOCK_DRUGS.find((d) => d.id === id);
}

export function searchDrugs(query: string): DrugProfile[] {
  const q = query.toLowerCase().trim();
  if (!q) return MOCK_DRUGS;

  return MOCK_DRUGS.filter(
    (d) =>
      d.genericName.toLowerCase().includes(q) ||
      d.brandName.toLowerCase().includes(q) ||
      d.ndc.includes(q) ||
      d.therapeuticClass.toLowerCase().includes(q) ||
      d.dosageForm.toLowerCase().includes(q)
  );
}

// ── Pharmacy queries ────────────────────────────────────────────────

export function getAllPharmacies(): Pharmacy[] {
  return MOCK_PHARMACIES;
}

export function getPharmacyById(id: string): Pharmacy | undefined {
  return MOCK_PHARMACIES.find((p) => p.id === id);
}

export function getPharmaciesForDrug(drugId: string): Pharmacy[] {
  const drug = getDrugById(drugId);
  if (!drug) return MOCK_PHARMACIES;
  return drug.pharmacies;
}

export function getStockStatus(pharmacyId: string, drugId: string) {
  const drug = getDrugById(drugId);
  const pharmacy = drug
    ? drug.pharmacies.find((p) => p.id === pharmacyId)
    : getPharmacyById(pharmacyId);

  if (!pharmacy) return null;

  return {
    pharmacyId: pharmacy.id,
    drugId: drugId,
    status: pharmacy.stockStatus,
    count: pharmacy.stockCount,
    unitsText: pharmacy.stockUnitsText,
    verifiedTime: pharmacy.verifiedTime,
    isLimitedSupply: pharmacy.isLimitedSupply || false,
  };
}

// ── Regimen queries ─────────────────────────────────────────────────

export function getAllRegimens(): TrackedRegimen[] {
  return MOCK_REGIMENS;
}

export function getRegimenById(id: string): TrackedRegimen | undefined {
  return MOCK_REGIMENS.find((r) => r.id === id);
}

// ── Ledger queries ──────────────────────────────────────────────────

export function getLedger(): FillLedgerItem[] {
  return MOCK_LEDGER;
}

// ── Pharmacy search ─────────────────────────────────────────────────

export function searchPharmacies(query: string): Pharmacy[] {
  const q = query.toLowerCase().trim();
  if (!q) return MOCK_PHARMACIES;

  return MOCK_PHARMACIES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q)
  );
}

// ── Pricing queries ─────────────────────────────────────────────────

export interface PricingSummary {
  drugId: string;
  drugName: string;
  brandName: string;
  strength: string;
  bestPrice: number;
  averagePrice: number;
  brandReferencePrice: number;
  pharmacyCount: number;
}

export function getPricingForDrug(drugId: string): PricingSummary | null {
  const drug = getDrugById(drugId);
  if (!drug) return null;

  const prices = drug.pharmacies.map((p) => p.cashPrice);
  if (prices.length === 0) return null;

  return {
    drugId: drug.id,
    drugName: drug.genericName,
    brandName: drug.brandName,
    strength: drug.strength,
    bestPrice: Math.min(...prices),
    averagePrice: +(prices.reduce((s, p) => s + p, 0) / prices.length).toFixed(2),
    brandReferencePrice: drug.brandReferencePrice,
    pharmacyCount: drug.pharmacies.length,
  };
}

export function comparePricing(drugIds: string[]): PricingSummary[] {
  return drugIds
    .map((id) => getPricingForDrug(id))
    .filter(Boolean) as PricingSummary[];
}
