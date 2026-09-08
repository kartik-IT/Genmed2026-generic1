export type NavTab = 'search' | 'compare' | 'pharmacies' | 'saved-rx';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  distance: string;
  distanceMiles: number;
  cashPrice: number;
  brandPrice: number;
  genericRate: number;
  badge?: string;
  badgeType?: 'lowest' | 'partner' | 'hours';
  hours: string;
  driveThru: boolean;
  driveThruText?: string;
  stockStatus: string;
  stockCount: number;
  stockUnitsText: string;
  verifiedTime: string;
  updatedTimeAgo: string;
  lotNumber?: string;
  rating: number;
  reviewCount: number;
  bioMatchPercent: number;
  phone: string;
  imageUrl: string;
  lat: number;
  lng: number;
  isLimitedSupply?: boolean;
}

export interface GenericAlternative {
  id: string;
  manufacturer: string;
  name: string;
  brandEquivalent: string;
  ratingCode: string;
  matchPercent: number;
  price30Day: number;
  price90Day: number;
  brandPrice30Day: number;
  brandPrice90Day: number;
  savingsMonthly: number;
  savingsAnnual: number;
  equivalenceText: string;
  physicalForm: string;
  bioavailability: string;
  pharmacokineticsAUC: number; // e.g. 99.4
  coreExcipients: string;
  allergenSafety: string;
  isTopPick?: boolean;
  isBaselineStandard?: boolean;
  inStockCount?: string;
}

export interface TrackedRegimen {
  id: string;
  name: string;
  strength: string;
  brandName: string;
  supplyDays: number;
  regimenNote: string;
  refillDaysLeft: number;
  priceDropAlert: boolean;
  alertText?: string;
  pharmacyName: string;
  pharmacyDistance: string;
  currentPrice: number;
  previousPrice: number;
  brandPrice: number;
  verifiedTime: string;
  imageUrl: string;
  isBestValueEligible?: boolean;
  isLowStock?: boolean;
  priceAlertsOn: boolean;
}

export interface FillLedgerItem {
  id: string;
  medicineName: string;
  pharmacyName: string;
  date: string;
  hash: string;
  paidPrice: number;
  savedAmount: number;
}

export interface DrugProfile {
  id: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  ndc: string;
  rxNumber: string;
  bestGenericRate: number;
  brandReferencePrice: number;
  instantNetSavePercent: number;
  instantNetSaveMonthly: number;
  therapeuticClass: string;
  therapeuticDescription: string;
  therapeuticIndex: string;
  genericEquivalenceCode: string;
  cypNotice: string;
  alternatives: GenericAlternative[];
  pharmacies: Pharmacy[];
}
