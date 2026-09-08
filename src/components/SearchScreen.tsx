import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DrugProfile, Pharmacy } from '../types';

interface SearchScreenProps {
  drug: DrugProfile;
  allDrugs: DrugProfile[];
  onSelectDrug: (drug: DrugProfile) => void;
  pharmacies?: Pharmacy[];
  onNavigateToPharmacies: (pharmacyId?: string) => void;
  onNavigateToCompare: () => void;
  onOpenBarcodeScanner?: () => void;
  onOpenVoucher: () => void;
  onOpenHoldLock: (pharmacy: Pharmacy) => void;
  onOpenPillVisualizer?: (drug: DrugProfile) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', icon?: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  drug,
  allDrugs,
  onSelectDrug,
  pharmacies,
  onNavigateToPharmacies,
  onNavigateToCompare,
  onOpenBarcodeScanner,
  onOpenVoucher,
  onOpenHoldLock,
  onOpenPillVisualizer,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Trending Generics');
  const [isMonographOpen, setIsMonographOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [savedPharmacies, setSavedPharmacies] = useState<Record<string, boolean>>({});
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [supplyDays, setSupplyDays] = useState<'30' | '90'>('30');
  const [selectedStrength, setSelectedStrength] = useState(drug.strength);
  const [savingsTimeframe, setSavingsTimeframe] = useState<'month' | 'year' | '3years'>('year');
  const [isFamilyPlan, setIsFamilyPlan] = useState(false);
  const [isEquivalenceExpanded, setIsEquivalenceExpanded] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Update selected strength when active drug changes
  useEffect(() => {
    setSelectedStrength(drug.strength);
  }, [drug.id, drug.strength]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activePharmacies = pharmacies && pharmacies.length > 0 ? pharmacies : drug.pharmacies || [];

  const filters = [
    { name: 'Trending Generics', icon: 'trending_up' },
    { name: 'Heart & Blood Pressure', icon: 'favorite' },
    { name: 'Diabetes & Endocrine', icon: 'water_drop' },
    { name: 'Under $10', icon: 'verified' },
    { name: 'In Stock Nearby', icon: 'near_me' },
  ];

  // Quick brand jump buttons
  const quickDrugs = allDrugs.slice(0, 6);

  // Autocomplete search filtering
  const matchingDrugs = useMemo(() => {
    if (!searchQuery.trim()) {
      return allDrugs;
    }
    const q = searchQuery.toLowerCase().trim();
    return allDrugs.filter(
      (d) =>
        d.genericName.toLowerCase().includes(q) ||
        d.brandName.toLowerCase().includes(q) ||
        d.therapeuticClass.toLowerCase().includes(q) ||
        d.therapeuticDescription.toLowerCase().includes(q) ||
        (q.includes('cholesterol') && d.genericName.toLowerCase().includes('atorvastatin')) ||
        (q.includes('diabetes') && d.genericName.toLowerCase().includes('metformin')) ||
        (q.includes('depression') && d.genericName.toLowerCase().includes('sertraline')) ||
        (q.includes('pressure') && d.genericName.toLowerCase().includes('amlodipine')) ||
        (q.includes('reflux') && d.genericName.toLowerCase().includes('omeprazole')) ||
        (q.includes('thyroid') && d.genericName.toLowerCase().includes('levothyroxine'))
    );
  }, [searchQuery, allDrugs]);

  // Dosage options based on the drug
  const dosageOptions = useMemo(() => {
    const name = drug.genericName.toLowerCase();
    if (name.includes('atorvastatin')) return ['10 mg', '20 mg', '40 mg', '80 mg'];
    if (name.includes('metformin')) return ['500 mg', '750 mg', '1000 mg'];
    if (name.includes('sertraline')) return ['25 mg', '50 mg', '100 mg'];
    if (name.includes('amlodipine')) return ['2.5 mg', '5 mg', '10 mg'];
    if (name.includes('omeprazole')) return ['10 mg', '20 mg', '40 mg'];
    if (name.includes('levothyroxine')) return ['25 mcg', '50 mcg', '75 mcg', '100 mcg'];
    return [drug.strength];
  }, [drug.genericName, drug.strength]);

  // Pricing calculations
  const multiplier = supplyDays === '90' ? 2.8 : 1.0;
  const brandMultiplier = supplyDays === '90' ? 3.0 : 1.0;
  const currentGenericRate = drug.bestGenericRate * multiplier;
  const currentBrandRate = drug.brandReferencePrice * brandMultiplier;
  const currentSavings = currentBrandRate - currentGenericRate;

  const handleCopyVoucher = () => {
    const textToCopy = `Low & Best Verified Savings Pass\nDrug: ${drug.genericName} ${selectedStrength}\nNDC: ${drug.ndc}\nRxBIN: 015298\nRxPCN: PRXGEN\nRxGRP: GENBEST01\nRate: $${currentGenericRate.toFixed(2)} Fixed Adjudication Lock`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setIsCopied(true);
    if (onShowToast) {
      onShowToast('Adjudication info copied to clipboard!', 'success', 'content_copy');
    }
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleSaveToWallet = () => {
    if (onShowToast) {
      onShowToast('Pass added to Apple & Google Wallet ready file', 'success', 'account_balance_wallet');
    }
  };

  const toggleSavePharmacy = (id: string, name: string) => {
    const next = !savedPharmacies[id];
    setSavedPharmacies((prev) => ({
      ...prev,
      [id]: next,
    }));
    if (onShowToast) {
      onShowToast(
        next ? `Saved ${name} to your preferred locations` : `Removed ${name} from saved`,
        'info',
        next ? 'bookmark_added' : 'bookmark_remove'
      );
    }
  };

  const handleVoiceSearch = () => {
    setVoiceSearchActive(true);
    if (onShowToast) {
      onShowToast('Listening for medication name...', 'info', 'mic');
    }
    setTimeout(() => {
      setVoiceSearchActive(false);
      setSearchQuery('Atorvastatin');
      setIsSearchFocused(true);
      if (onShowToast) {
        onShowToast('Recognized: Atorvastatin Calcium', 'success', 'check_circle');
      }
    }, 1400);
  };

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
    if (filterName === 'Heart & Blood Pressure') {
      const found = allDrugs.find((d) => d.id.includes('lipitor') || d.id.includes('norvasc'));
      if (found) {
        onSelectDrug(found);
        if (onShowToast) onShowToast(`Filtered for Cardiovascular: ${found.genericName}`, 'info', 'favorite');
      }
    } else if (filterName === 'Diabetes & Endocrine') {
      const found = allDrugs.find((d) => d.id.includes('glucophage') || d.id.includes('synthroid'));
      if (found) {
        onSelectDrug(found);
        if (onShowToast) onShowToast(`Filtered for Endocrine: ${found.genericName}`, 'info', 'water_drop');
      }
    } else if (filterName === 'Under $10') {
      const found = allDrugs.find((d) => d.bestGenericRate < 10);
      if (found) {
        onSelectDrug(found);
        if (onShowToast) onShowToast(`Sorted by lowest generic rate: $${found.bestGenericRate.toFixed(2)}`, 'info', 'savings');
      }
    } else {
      if (onShowToast) onShowToast(`Viewing ${filterName}`, 'info', 'tune');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-24 pt-16 animate-fadeIn">
      {/* Search & Fast Filters Shell */}
      <section className="px-3 pt-2 pb-1 flex flex-col gap-2">
        <div className="relative w-full" ref={searchContainerRef}>
          <div className="flex items-center bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container px-3 py-2 gap-2 transition-all focus-within:shadow-md focus-within:border-secondary">
            <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0">
              search
            </span>
            <input
              id="drug-search-input"
              className="w-full bg-transparent border-0 outline-none text-on-surface font-body-md text-[14px] placeholder:text-outline/70 min-w-0"
              placeholder={`Search ${drug.brandName} (${drug.genericName}), or condition...`}
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface text-[14px] rounded-full hover:bg-surface-container"
                title="Clear search"
              >
                ✕
              </button>
            )}
            {onOpenBarcodeScanner && (
              <button
                onClick={onOpenBarcodeScanner}
                type="button"
                aria-label="Scan Rx Barcode"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors flex-shrink-0"
                title="Barcode Rx Scan"
              >
                <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
              </button>
            )}
            <button
              onClick={handleVoiceSearch}
              type="button"
              aria-label="Voice Search"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                voiceSearchActive
                  ? 'text-error bg-error-container animate-pulse'
                  : 'text-on-surface-variant hover:text-secondary hover:bg-surface-container'
              }`}
              title="Voice Search"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container z-40 max-h-72 overflow-y-auto no-scrollbar py-1 divide-y divide-surface-container/60">
              <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-on-surface-variant bg-surface-container-low">
                <span>{searchQuery ? `Matching medications (${matchingDrugs.length})` : 'Popular Generic Equivalents'}</span>
                <span className="text-[10px] text-secondary font-bold">Tap to switch</span>
              </div>
              {matchingDrugs.map((d) => {
                const isSelected = d.id === drug.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      onSelectDrug(d);
                      setSearchQuery('');
                      setIsSearchFocused(false);
                      if (onShowToast) {
                        onShowToast(`Switched to ${d.genericName} (Generic ${d.brandName})`, 'success', 'check_circle');
                      }
                    }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors ${
                      isSelected ? 'bg-secondary-container/20 border-l-3 border-secondary' : ''
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-headline-sm text-[14px] font-bold text-on-surface truncate">
                          {d.genericName}
                        </span>
                        <span className="text-[12px] text-secondary font-semibold">
                          {d.strength}
                        </span>
                        <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] text-on-surface-variant font-medium">
                          {d.brandName}
                        </span>
                      </div>
                      <span className="font-body-sm text-[11px] text-on-surface-variant truncate mt-0.5">
                        {d.therapeuticClass}
                      </span>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[10px] text-on-surface-variant uppercase font-medium">from</span>
                      <span className="font-headline-sm text-[15px] font-extrabold text-secondary">
                        ${d.bestGenericRate.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-on-surface-variant line-through opacity-70">
                        ${d.brandReferencePrice.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
              {matchingDrugs.length === 0 && (
                <div className="p-4 text-center text-on-surface-variant text-[13px]">
                  No matching generic molecule found for &quot;{searchQuery}&quot;. Try searching active ingredient or brand name.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Horizontal Medication Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-3 px-3">
          {quickDrugs.map((qd) => {
            const isSelected = qd.id === drug.id;
            return (
              <button
                key={qd.id}
                type="button"
                onClick={() => {
                  onSelectDrug(qd);
                  if (onShowToast) {
                    onShowToast(`Selected ${qd.brandName} (${qd.genericName})`, 'info', 'medication');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-[12px] whitespace-nowrap transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-secondary text-on-secondary font-bold ring-2 ring-secondary/30'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container font-medium border border-surface-container'
                }`}
              >
                <span>{qd.brandName.replace('®', '')}</span>
                <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-on-secondary/20 text-on-secondary' : 'bg-surface-container text-secondary font-semibold'}`}>
                  ${qd.bestGenericRate.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Micro-Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-3 px-3">
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.name;
            return (
              <button
                key={filter.name}
                onClick={() => handleFilterClick(filter.name)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-[12px] whitespace-nowrap transition-all shadow-xs ${
                  isSelected
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isSelected ? 'text-secondary-fixed' : 'text-secondary'
                  }`}
                >
                  {filter.icon}
                </span>
                {filter.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Bioequivalent Comparison Card */}
      <section className="px-3 pt-1 pb-2">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 p-4 flex flex-col gap-3 relative overflow-hidden">
          {/* Ambient Glow Accents */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-secondary-container/40 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Clinical Rating Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-semibold">
              <span
                className="material-symbols-outlined text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              {drug.genericEquivalenceCode} Bioequivalent Match
            </div>
            <button
              onClick={onNavigateToCompare}
              type="button"
              className="flex items-center gap-1 text-secondary font-label-sm text-[12px] font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
              FDA Orange Book Specs
            </button>
          </div>

          {/* Hero Delta Highlight Card */}
          <div className="bg-surface-container-low rounded-lg p-3.5 flex flex-col gap-2.5 relative z-10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant block uppercase tracking-wider font-semibold">
                  Active Molecule Match
                </span>
                <h2 className="font-headline-lg-mobile text-[22px] font-bold text-on-surface leading-snug">
                  {drug.genericName}
                </h2>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  {selectedStrength} • {drug.dosageForm}
                </span>
              </div>
              {/* Hero Savings Indicator Tag */}
              <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl px-3 py-1.5 flex flex-col items-end shadow-xs">
                <span className="font-label-sm text-[10px] uppercase tracking-wide opacity-90 font-bold">
                  Net Savings
                </span>
                <span className="font-headline-md text-[20px] font-extrabold leading-tight">
                  {drug.instantNetSavePercent}%
                </span>
                <span className="font-code-sm text-[11px] font-bold opacity-90">
                  -${currentSavings.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dosage & Supply Interactive Selectors */}
            <div className="flex flex-col gap-2 pt-1 border-t border-surface-container/60">
              {/* Dosage Chips */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-on-surface-variant">Strength:</span>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {dosageOptions.map((str) => (
                    <button
                      key={str}
                      type="button"
                      onClick={() => {
                        setSelectedStrength(str);
                        if (onShowToast) onShowToast(`Selected ${str} strength`, 'info', 'tune');
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        selectedStrength === str
                          ? 'bg-primary text-on-primary shadow-2xs'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {str}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supply Duration Switch */}
              <div className="flex items-center justify-between bg-surface-container-lowest/80 p-1 rounded-lg border border-surface-container/60">
                <span className="text-[11px] font-semibold text-on-surface-variant pl-1.5">Supply Days:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSupplyDays('30')}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                      supplyDays === '30'
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplyDays('90')}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                      supplyDays === '90'
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    90 Days (Best Value)
                  </button>
                </div>
              </div>
            </div>

            {/* Comparative Side-by-Side Strip */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Brand Reference Box */}
              <div className="bg-surface-container-lowest/90 rounded-lg p-2.5 flex flex-col gap-0.5 border border-surface-container">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">branding_watermark</span>
                  <span className="font-label-sm text-[11px] font-medium">Brand Reference</span>
                </div>
                <div className="font-headline-sm text-[16px] text-on-surface-variant line-through opacity-75 leading-tight font-bold">
                  ${currentBrandRate.toFixed(2)}
                </div>
                <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
                  {drug.brandName} {selectedStrength}
                </span>
              </div>

              {/* Generic Best Verified Box */}
              <div className="bg-secondary text-on-secondary rounded-lg p-2.5 flex flex-col gap-0.5 shadow-xs">
                <div className="flex items-center gap-1 text-secondary-fixed">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span className="font-label-sm text-[11px] font-bold">Best Generic Rate</span>
                </div>
                <div className="font-headline-md text-[20px] text-on-secondary font-extrabold leading-tight">
                  ${currentGenericRate.toFixed(2)}
                </div>
                <span className="font-label-sm text-[11px] text-secondary-fixed-dim">
                  Verified Local Austin Rate
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Bioequivalence Validation Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-on-surface-variant">
            <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded text-on-surface font-label-sm text-[11px] font-medium">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                check_circle
              </span>
              Identical Pharmacokinetics
            </span>
            <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded text-on-surface font-label-sm text-[11px] font-medium">
              <span className="material-symbols-outlined text-[14px] text-secondary">science</span>
              Equal Active Moiety
            </span>
            {onOpenPillVisualizer && (
              <button
                type="button"
                onClick={() => onOpenPillVisualizer(drug)}
                className="inline-flex items-center gap-1 bg-secondary-container/50 hover:bg-secondary-container px-2.5 py-1 rounded text-on-secondary-container font-label-sm text-[11px] font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  visibility
                </span>
                Inspect Pill &amp; Imprint
              </button>
            )}
          </div>

          {/* Mandatory Regulatory Disclosure Notice */}
          <div className="bg-surface-container-high/60 rounded-lg p-2.5 flex items-start gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-secondary flex-shrink-0 mt-0.5">
              info
            </span>
            <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
              Non-clinical informational comparison. Does not replace physician prescription,
              therapeutic substitution authorization, or pharmacist professional consultation.
            </p>
          </div>
        </div>
      </section>

      {/* Local Verified Pharmacy Stock Feed Header */}
      <section className="px-3 pt-2 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[22px]">storefront</span>
          <h3 className="font-headline-sm text-[16px] font-bold text-on-surface">
            Dispensing Pharmacies
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToPharmacies()}
          className="font-label-sm text-[12px] text-secondary font-semibold hover:underline"
        >
          {activePharmacies.length} Verified Nearby
        </button>
      </section>

      {/* Pharmacy Cards Stack */}
      <section className="px-3 flex flex-col gap-2.5 pb-2">
        {activePharmacies.slice(0, 3).map((pharm, idx) => {
          const isFirst = idx === 0;
          const isSaved = savedPharmacies[pharm.id];
          const calculatedRate = pharm.cashPrice * multiplier;

          return (
            <article
              key={pharm.id}
              className={`bg-surface-container-lowest rounded-xl shadow-xs border p-3.5 flex flex-col gap-2.5 transition-shadow hover:shadow-md ${
                isFirst ? 'border-secondary/40' : 'border-surface-container'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isFirst && (
                      <span className="bg-secondary text-on-secondary font-label-sm text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                        Lowest Price
                      </span>
                    )}
                    <span className="font-label-sm text-[12px] text-secondary font-semibold">
                      {pharm.distance}
                    </span>
                    {pharm.driveThru && (
                      <span className="text-on-surface-variant text-[11px] flex items-center gap-0.5">
                        • Drive-Thru
                      </span>
                    )}
                  </div>
                  <h4 className="font-headline-sm text-[15px] font-bold text-on-surface truncate mt-1">
                    {pharm.name}
                  </h4>
                  <p className="font-body-sm text-[12px] text-on-surface-variant truncate">
                    {pharm.address} • {pharm.neighborhood}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    {supplyDays === '90' ? '90-Day Rate' : 'Cash / Co-pay'}
                  </span>
                  <span className={`font-headline-md text-[20px] font-bold leading-tight ${isFirst ? 'text-secondary' : 'text-on-surface'}`}>
                    ${calculatedRate.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Freshness Indicator & Pill Availability */}
              <div className="flex items-center justify-between bg-surface-container-low rounded-lg px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed-dim opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                  </span>
                  <span className="font-label-sm text-[11px] text-on-surface font-medium">
                    {pharm.verifiedTime}
                  </span>
                </div>
                <span className="font-code-sm text-[11px] text-on-secondary-container font-semibold">
                  {pharm.stockUnitsText}
                </span>
              </div>

              {/* Action Footer */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenHoldLock(pharm)}
                  className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                  Hold at ${calculatedRate.toFixed(2)} &amp; Lock Rate
                </button>
                <button
                  type="button"
                  onClick={() => toggleSavePharmacy(pharm.id, pharm.name)}
                  aria-label={`Save ${pharm.name}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isSaved
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                  title={isSaved ? 'Saved Pharmacy' : 'Bookmark Pharmacy'}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isSaved ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                </button>
                {pharm.phone && (
                  <a
                    href={`tel:${pharm.phone.replace(/[^0-9]/g, '')}`}
                    aria-label={`Call ${pharm.name}`}
                    className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Call Pharmacy"
                  >
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Instant Digital Voucher / Counter Handshake Card */}
      <section className="px-3 pt-1 pb-3" id="instant-voucher-section">
        <div className="bg-primary-container text-on-primary rounded-xl shadow-md p-4 flex flex-col gap-3 relative overflow-hidden">
          {/* Decorative background wave */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 400 240"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 80C120 40 280 120 400 60V240H0V80Z" fill="currentColor"></path>
            </svg>
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="font-label-sm text-[11px] text-secondary-container uppercase tracking-wider font-bold">
                Counter Pass Handshake
              </span>
              <h3 className="font-headline-md text-[18px] font-bold text-on-primary">
                Verified Savings Pass
              </h3>
              <p className="font-body-sm text-[12px] text-primary-fixed-dim mt-0.5">
                Show this to dispensing pharmacist at checkout
              </p>
            </div>
            <button
              onClick={onOpenVoucher}
              type="button"
              className="w-10 h-10 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-secondary-fixed hover:bg-surface-container-lowest/25 transition-colors"
              title="Expand Full Voucher Card"
            >
              <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </button>
          </div>

          {/* High-Fidelity SVG Barcode with Medical Data Matrix Styling */}
          <div
            onClick={onOpenVoucher}
            className="bg-surface-container-lowest text-on-surface rounded-lg p-3 flex flex-col items-center gap-1 shadow-inner relative z-10 cursor-pointer hover:ring-2 hover:ring-secondary/40 transition-all"
            title="Tap to enlarge voucher barcode"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-label-sm text-[12px] text-on-surface-variant font-semibold truncate">
                {drug.genericName} {selectedStrength} • {supplyDays}-Day Fill
              </span>
              <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-bold">
                ${currentGenericRate.toFixed(2)} Lock
              </span>
            </div>
            {/* Barcode Lines Rendering */}
            <div className="w-full h-14 flex items-center justify-center gap-[3px] py-1 px-2 overflow-hidden">
              <span className="w-[3px] h-full bg-primary inline-block"></span>
              <span className="w-[1px] h-full bg-primary inline-block"></span>
              <span className="w-[4px] h-full bg-primary inline-block"></span>
              <span className="w-[2px] h-full bg-primary inline-block"></span>
              <span className="w-[1px] h-full bg-primary inline-block"></span>
              <span className="w-[5px] h-full bg-primary inline-block"></span>
              <span className="w-[2px] h-full bg-primary inline-block"></span>
              <span className="w-[3px] h-full bg-primary inline-block"></span>
              <span className="w-[1px] h-full bg-primary inline-block"></span>
              <span className="w-[4px] h-full bg-primary inline-block"></span>
              <span className="w-[2px] h-full bg-primary inline-block"></span>
              <span className="w-[6px] h-full bg-primary inline-block"></span>
              <span className="w-[2px] h-full bg-primary inline-block"></span>
              <span className="w-[1px] h-full bg-primary inline-block"></span>
              <span className="w-[3px] h-full bg-primary inline-block"></span>
              <span className="w-[4px] h-full bg-primary inline-block"></span>
              <span className="w-[2px] h-full bg-primary inline-block"></span>
              <span className="w-[5px] h-full bg-primary inline-block"></span>
              <span className="w-[1px] h-full bg-primary inline-block"></span>
              <span className="w-[3px] h-full bg-primary inline-block"></span>
              <span className="w-[4px] h-full bg-primary inline-block"></span>
              <span className="w-[2px] h-full bg-primary inline-block"></span>
              <span className="w-[1px] h-full bg-primary inline-block"></span>
              <span className="w-[3px] h-full bg-primary inline-block"></span>
              <span className="w-[5px] h-full bg-primary inline-block"></span>
              <span className="w-[2px] h-full bg-primary inline-block"></span>
            </div>
            <div className="flex items-center justify-between w-full pt-0.5">
              <span className="font-code-sm text-[11px] tracking-wider text-on-surface font-bold">
                NDC: {drug.ndc}
              </span>
              <span className="text-[10px] text-secondary font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">fullscreen</span>
                Tap to expand
              </span>
            </div>
          </div>

          {/* Adjudication Electronic Claims Info Grid */}
          <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest/10 p-2.5 rounded-lg relative z-10 font-code-sm text-[12px]">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-primary-fixed-dim">RxBIN</span>
              <span className="text-on-primary font-bold">015298</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-primary-fixed-dim">RxPCN</span>
              <span className="text-on-primary font-bold">PRXGEN</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-primary-fixed-dim">RxGRP</span>
              <span className="text-on-primary font-bold">GENBEST01</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-secondary-fixed text-[11px] font-semibold relative z-10 pt-1 flex-wrap">
            <button
              type="button"
              onClick={handleSaveToWallet}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-primary text-[11px] transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">wallet</span>
              Add to Wallet
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyVoucher}
                type="button"
                className="hover:underline flex items-center gap-1 text-on-primary font-bold bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 px-2.5 py-1 rounded-md transition-colors"
                id="copy-card-details"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCopied ? 'check' : 'content_copy'}
                </span>
                {isCopied ? 'Copied!' : 'Copy Info'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Life Household Impact Calculator */}
      <section className="px-3 pb-2">
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">calculate</span>
              </span>
              <div>
                <h4 className="font-headline-sm text-[15px] font-bold text-on-surface leading-tight">
                  Real-World Value Translation
                </h4>
                <p className="font-label-sm text-[11px] text-on-surface-variant">
                  What switching to generic {drug.genericName} means for your household
                </p>
              </div>
            </div>

            {/* Family Toggle */}
            <button
              type="button"
              onClick={() => setIsFamilyPlan(!isFamilyPlan)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                isFamilyPlan
                  ? 'bg-secondary text-on-secondary border-secondary'
                  : 'bg-surface-container text-on-surface-variant border-surface-container-high hover:text-on-surface'
              }`}
              title="Toggle Household (2 People) Savings"
            >
              <span className="material-symbols-outlined text-[14px]">group</span>
              <span>{isFamilyPlan ? '2 People' : '1 Person'}</span>
            </button>
          </div>

          {/* Timeframe Selector Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-lg border border-surface-container/60">
            <button
              type="button"
              onClick={() => setSavingsTimeframe('month')}
              className={`flex-1 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                savingsTimeframe === 'month'
                  ? 'bg-surface-container-lowest text-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              1 Month
            </button>
            <button
              type="button"
              onClick={() => setSavingsTimeframe('year')}
              className={`flex-1 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                savingsTimeframe === 'year'
                  ? 'bg-surface-container-lowest text-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              1 Year (Annual)
            </button>
            <button
              type="button"
              onClick={() => setSavingsTimeframe('3years')}
              className={`flex-1 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                savingsTimeframe === '3years'
                  ? 'bg-surface-container-lowest text-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              3 Years
            </button>
          </div>

          {/* Highlighted Net Retained Dollars */}
          {(() => {
            const periodMonths = savingsTimeframe === 'month' ? 1 : savingsTimeframe === 'year' ? 12 : 36;
            const multiplierPeople = isFamilyPlan ? 2 : 1;
            const totalRetained = currentSavings * periodMonths * multiplierPeople;
            const weeksGroceries = Math.max(1, Math.round(totalRetained / 115));
            const monthsUtilities = (totalRetained / 170).toFixed(1);
            const preventativeVisits = Math.max(1, Math.round(totalRetained / 160));

            return (
              <div className="flex flex-col gap-2.5">
                <div className="p-3 rounded-xl bg-gradient-to-r from-secondary-container/30 to-surface-container-high/40 border border-secondary/20 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-label-sm text-[11px] font-semibold text-secondary uppercase tracking-wider block">
                      Guaranteed Net Retained Capital
                    </span>
                    <span className="font-headline-lg text-[24px] font-black text-on-surface">
                      ${totalRetained.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    {drug.instantNetSavePercent}% Saved
                  </span>
                </div>

                {/* 3 Meaningful Real-World Equivalents */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      shopping_cart
                    </span>
                    <span className="font-headline-sm text-[14px] font-black text-on-surface leading-tight">
                      ~{weeksGroceries} Wks
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">
                      Fresh Produce &amp; Food
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      bolt
                    </span>
                    <span className="font-headline-sm text-[14px] font-black text-on-surface leading-tight">
                      {monthsUtilities} Mos
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">
                      Home Electric &amp; Water
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      health_and_safety
                    </span>
                    <span className="font-headline-sm text-[14px] font-black text-on-surface leading-tight">
                      {preventativeVisits} Visits
                    </span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">
                      Dental &amp; Vision Care
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Meaningful FDA Bioequivalence Science & Truth */}
      <section className="px-3 pb-2">
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </span>
              <div>
                <h4 className="font-headline-sm text-[15px] font-bold text-on-surface leading-tight">
                  The Science Behind Generic Equality
                </h4>
                <p className="font-label-sm text-[11px] text-on-surface-variant">
                  Why a $9.20 generic provides 100% of the clinical outcome of a $142.80 brand
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEquivalenceExpanded(!isEquivalenceExpanded)}
              className="text-secondary font-label-sm text-[11px] font-bold hover:underline flex-shrink-0"
            >
              {isEquivalenceExpanded ? 'Show Less' : 'Learn Why'}
            </button>
          </div>

          {/* 3 Pillars of Generic Equivalence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
              <div className="flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                <span className="font-label-sm text-[11px] font-extrabold uppercase">Exact Molecule</span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
                Contains identical active pharmaceutical ingredient (API) in the exact same strength ({drug.strength}).
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
              <div className="flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[16px]">insights</span>
                <span className="font-label-sm text-[11px] font-extrabold uppercase">99.4% Bio-AUC</span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
                Absorbs at the identical rate and delivers equal blood plasma concentration as the original brand.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
              <div className="flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[16px]">savings</span>
                <span className="font-label-sm text-[11px] font-extrabold uppercase">Zero Marketing Markups</span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
                No $2B advertising campaigns or expired patent monopolies. Only pure, safe medication.
              </p>
            </div>
          </div>

          {/* Expandable Deep Science Details */}
          {isEquivalenceExpanded && (
            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-2 animate-fadeIn text-[12px] text-on-surface-variant leading-relaxed">
              <div className="flex items-center gap-1.5 text-on-surface font-bold">
                <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                <span>FDA Orange Book &quot;AB&quot; Therapeutic Rating Standard</span>
              </div>
              <p>
                Under FDA Code of Federal Regulations Title 21, generic products marked &quot;AB&quot; have demonstrated bioequivalence in controlled human in-vivo pharmacokinetic trials. Neither your physician nor pharmacist needs to alter the therapeutic dosing when transitioning to AB-rated generic {drug.genericName}.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-surface-container text-[11px] text-secondary font-semibold">
                <span>Verified Reference Drug: {drug.brandName}</span>
                <span>NDC: {drug.ndc}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cash vs Insurance Copay Clarity Card */}
      <section className="px-3 pb-2">
        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-3">
          <span className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">credit_card_off</span>
          </span>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-headline-sm text-[13px] font-bold text-on-surface">
                Did You Know? Cash Is Often Cheaper Than Copays
              </span>
              <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-secondary text-on-secondary font-bold">
                PRO-TIP
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
              Standard commercial insurance often imposes fixed copays of $20.00–$40.00 or requires meeting high annual deductibles. Low &amp; Best&apos;s direct cash adjudication rate is fixed at <strong>${currentGenericRate.toFixed(2)}</strong> with zero deductible hurdles or pre-authorization delays.
            </p>
          </div>
        </div>
      </section>
      <section className="px-3 pb-6">
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container overflow-hidden">
          <button
            onClick={() => setIsMonographOpen(!isMonographOpen)}
            type="button"
            aria-expanded={isMonographOpen}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                clinical_notes
              </span>
              <div>
                <h4 className="font-headline-sm text-[15px] font-bold leading-tight">
                  Pharmacological Monograph
                </h4>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  FDA therapeutic indices, dosing, interactions
                </span>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                isMonographOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Monograph Content Body */}
          {isMonographOpen && (
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-surface-container/50 animate-fadeIn">
              {/* Indications & Clinical Class */}
              <div className="flex flex-col gap-1 pt-1">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                  Therapeutic Class
                </span>
                <p className="font-body-md text-[14px] text-on-surface font-semibold">
                  {drug.therapeuticClass}
                </p>
                <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                  {drug.therapeuticDescription}
                </p>
              </div>

              {/* Narrow Therapeutic Index & Equivalence */}
              <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    Therapeutic Index
                  </span>
                  <span className="font-body-md text-[13px] text-on-surface font-bold">
                    {drug.therapeuticIndex}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    Generic Equivalence Code
                  </span>
                  <span className="font-body-md text-[13px] text-secondary font-bold">
                    {drug.genericEquivalenceCode}
                  </span>
                </div>
              </div>

              {/* Clinical Safety Box */}
              <div className="bg-surface-container-high/60 rounded-lg p-2.5 flex flex-col gap-1">
                <div className="flex items-center gap-1 text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-error">
                    gpp_maybe
                  </span>
                  <span className="font-label-sm text-[11px] font-bold">
                    Key Precautions &amp; Clinical Notice
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                  {drug.cypNotice}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
