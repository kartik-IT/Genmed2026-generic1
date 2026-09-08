import React, { useState, useEffect, useMemo } from 'react';
import { Pharmacy, DrugProfile } from '../types';
import { ASSET_IMAGES } from '../data/mockData';

interface PharmaciesScreenProps {
  pharmacies: Pharmacy[];
  currentLocation: string;
  drug?: DrugProfile;
  onOpenLocation: () => void;
  onHoldLock: (pharmacy: Pharmacy) => void;
  onShowVoucher: () => void;
  onNavigateToCompare: () => void;
  selectedPharmacyId?: string;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', icon?: string) => void;
}

export const PharmaciesScreen: React.FC<PharmaciesScreenProps> = ({
  pharmacies,
  currentLocation,
  drug,
  onOpenLocation,
  onHoldLock,
  onShowVoucher,
  onNavigateToCompare,
  selectedPharmacyId,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Verified');
  const [activePinId, setActivePinId] = useState(selectedPharmacyId || pharmacies[0]?.id || 'metro-health-austin');
  const [sortBy, setSortBy] = useState<'lowest' | 'distance'>('lowest');
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [savedPharmacies, setSavedPharmacies] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(3 * 3600 + 42 * 60 + 12);

  // Live countdown timer for active price guarantee
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedPharmacyId) {
      setActivePinId(selectedPharmacyId);
    }
  }, [selectedPharmacyId]);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  };

  const microFilters = [
    { name: 'All Verified', icon: 'verified' },
    { name: 'Under $10', icon: 'savings' },
    { name: 'Drive-Thru', icon: 'directions_car' },
    { name: '24 Hours', icon: 'schedule' },
    { name: 'Same-Day Stock', icon: 'inventory_2' },
  ];

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesAddress = p.address.toLowerCase().includes(q);
        const matchesNeighborhood = p.neighborhood.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress && !matchesNeighborhood) return false;
      }

      // Quick category pill filter
      if (activeFilter === 'Under $10') return p.cashPrice <= 10;
      if (activeFilter === 'Drive-Thru') return p.driveThru;
      if (activeFilter === '24 Hours') return p.hours.includes('24');
      if (activeFilter === 'Same-Day Stock') return p.stockUnits > 0;
      return true;
    });
  }, [pharmacies, searchQuery, activeFilter]);

  const sortedPharmacies = useMemo(() => {
    return [...filteredPharmacies].sort((a, b) => {
      if (sortBy === 'lowest') return a.cashPrice - b.cashPrice;
      return a.distanceMiles - b.distanceMiles;
    });
  }, [filteredPharmacies, sortBy]);

  const toggleSavePharmacy = (id: string, name: string) => {
    const next = !savedPharmacies[id];
    setSavedPharmacies((prev) => ({
      ...prev,
      [id]: next,
    }));
    if (onShowToast) {
      onShowToast(
        next ? `Saved ${name} to your favorites` : `Removed ${name} from saved`,
        'info',
        next ? 'bookmark_added' : 'bookmark_remove'
      );
    }
  };

  const handleSelectPin = (pharmacyId: string) => {
    setActivePinId(pharmacyId);
    const element = document.getElementById(`pharmacy-card-${pharmacyId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-16 animate-fadeIn">
      {/* Search & Location Top Deck */}
      <section className="px-3 pt-2 pb-1 flex flex-col gap-2">
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">search</span>
            <input
              className="w-full bg-transparent font-body-md text-[14px] text-on-surface focus:outline-none placeholder:text-on-surface-variant/60"
              placeholder={drug ? `Search pharmacies stocking ${drug.genericName}...` : 'Search pharmacy name or neighborhood...'}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-on-surface-variant hover:text-on-surface text-xs w-5 h-5 flex items-center justify-center rounded-full bg-surface-container"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 bg-surface-container-low rounded-lg px-2.5 py-1.5 border border-surface-container/50">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                my_location
              </span>
              <span className="font-label-sm text-[11px] text-on-surface truncate font-semibold">
                {currentLocation}
              </span>
            </div>
            <button
              onClick={onOpenLocation}
              type="button"
              className="flex items-center gap-0.5 text-secondary font-label-sm text-[11px] font-bold hover:underline"
            >
              <span>Change</span>
              <span className="material-symbols-outlined text-[14px]">tune</span>
            </button>
          </div>
        </div>

        {/* Quick Micro-Filter Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-3 px-3">
          {microFilters.map((filter) => {
            const isSelected = activeFilter === filter.name;
            return (
              <button
                key={filter.name}
                onClick={() => {
                  setActiveFilter(filter.name);
                  if (onShowToast) onShowToast(`Filtered by ${filter.name}`, 'info', 'tune');
                }}
                type="button"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-label-sm text-[11px] whitespace-nowrap shadow-xs transition-all ${
                  isSelected
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'bg-surface-container text-on-surface hover:bg-surface-variant font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {filter.icon}
                </span>
                <span>{filter.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Map Header & View Toggle */}
      <section className="px-3 pt-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-secondary text-[18px]">map</span>
          <span className="font-headline-sm text-[13px] font-bold text-on-surface">
            Geolocated Stock Radar
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="text-secondary font-label-sm text-[11px] font-semibold flex items-center gap-0.5 hover:underline"
        >
          <span>{isMapVisible ? 'Hide Map' : 'Show Map'}</span>
          <span className="material-symbols-outlined text-[14px]">
            {isMapVisible ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </section>

      {/* Interactive Map & Geolocation Radar Card */}
      {isMapVisible && (
        <section className="px-3 my-1">
          <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-md bg-surface-container-high border border-surface-container">
            {/* Map background image */}
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 hover:scale-102"
              style={{ backgroundImage: `url('${ASSET_IMAGES.map}')` }}
            />

            {/* Live Sync Status Pill */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-surface-container/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="font-label-sm text-[11px] text-on-surface font-bold">
                {sortedPharmacies.length} Synced • Within 5 mi
              </span>
            </div>

            {/* Recenter View Button */}
            <button
              onClick={() => {
                if (sortedPharmacies[0]) {
                  handleSelectPin(sortedPharmacies[0].id);
                  if (onShowToast) onShowToast('Recentered to closest verified dispensary', 'info', 'my_location');
                }
              }}
              aria-label="Recenter map"
              type="button"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface-container-lowest/95 backdrop-blur-md flex items-center justify-center text-on-surface shadow-xs active:scale-95 transition-transform hover:bg-surface-container"
              title="Recenter Map"
            >
              <span className="material-symbols-outlined text-[18px]">near_me</span>
            </button>

            {/* Dynamic Map Pins for top pharmacies */}
            {sortedPharmacies.slice(0, 3).map((pharm, idx) => {
              const isSelected = activePinId === pharm.id;
              // Coordinates spread across the map
              const positions = [
                'top-1/2 left-1/3',
                'top-1/4 right-1/4',
                'bottom-6 right-1/3',
              ];
              const posClass = positions[idx] || 'top-1/3 left-1/2';

              return (
                <div
                  key={pharm.id}
                  onClick={() => handleSelectPin(pharm.id)}
                  className={`absolute ${posClass} -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer transition-transform ${
                    isSelected ? 'scale-115 z-30' : 'opacity-90 hover:scale-105'
                  }`}
                  title={`${pharm.name}: $${pharm.cashPrice.toFixed(2)}`}
                >
                  <div
                    className={`px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 ${
                      isSelected
                        ? 'bg-secondary text-on-secondary ring-2 ring-surface-container-lowest'
                        : 'bg-inverse-surface text-inverse-on-surface'
                    }`}
                  >
                    {idx === 0 && (
                      <span
                        className="material-symbols-outlined text-[12px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        stars
                      </span>
                    )}
                    <span className="font-code-sm text-[11px] font-extrabold">
                      ${pharm.cashPrice.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] ${
                      isSelected ? 'border-t-secondary' : 'border-t-inverse-surface'
                    }`}
                  ></div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full shadow-xs mt-0.5 ${
                      isSelected
                        ? 'bg-surface-container-lowest ring-2 ring-secondary'
                        : 'bg-surface-container-lowest'
                    }`}
                  ></div>
                </div>
              );
            })}

            {/* Current Location Blue Pulse Marker */}
            <div className="absolute bottom-8 left-12 z-10 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-secondary/30 flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 rounded-full bg-secondary ring-2 ring-surface-container-lowest shadow-xs"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live Stock Results Header */}
      <section className="px-3 pt-2 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-headline-sm text-[15px] font-bold text-on-surface">
            Verified Stock Near You
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-code-sm text-[11px] font-extrabold">
            {sortedPharmacies.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-[11px]">
          <span>Sort:</span>
          <button
            onClick={() => setSortBy(sortBy === 'lowest' ? 'distance' : 'lowest')}
            type="button"
            className="text-secondary font-bold hover:underline"
          >
            {sortBy === 'lowest' ? 'Lowest Price' : 'Closest Distance'}
          </button>
        </div>
      </section>

      {/* Dynamic Pharmacy Cards Stack */}
      <section className="px-3 flex flex-col gap-2.5 pb-3">
        {sortedPharmacies.map((pharm, idx) => {
          const isSelected = activePinId === pharm.id;
          const isFirst = idx === 0;
          const isSaved = savedPharmacies[pharm.id];

          return (
            <div
              key={pharm.id}
              id={`pharmacy-card-${pharm.id}`}
              onClick={() => setActivePinId(pharm.id)}
              className={`bg-surface-container-lowest rounded-xl shadow-xs border p-3.5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-secondary border-secondary/40'
                  : 'border-surface-container hover:shadow-md'
              }`}
            >
              {/* Top Row: Identification & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-headline-sm text-[15px] font-bold text-on-surface truncate">
                      {pharm.name}
                    </h3>
                    {isFirst && (
                      <span className="bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-label-sm text-[10px] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">award_star</span>
                        Lowest Guaranteed
                      </span>
                    )}
                    {pharm.driveThru && (
                      <span className="bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-label-sm text-[10px] font-semibold">
                        Drive-Thru
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-on-surface">{pharm.distance}</span>
                    <span>•</span>
                    <span>{pharm.hours}</span>
                    <span>•</span>
                    <span className="text-on-surface-variant">{pharm.neighborhood}</span>
                  </p>
                </div>

                {/* Price Display Block */}
                <div className="text-right flex-shrink-0 bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-surface-container/50">
                  <span className={`font-headline-md text-[20px] font-extrabold ${isFirst ? 'text-secondary' : 'text-on-surface'}`}>
                    ${pharm.cashPrice.toFixed(2)}
                  </span>
                  <p className="font-label-sm text-[10px] text-on-surface-variant line-through font-medium">
                    ${(pharm.cashPrice * 3.8).toFixed(2)} avg
                  </p>
                </div>
              </div>

              {/* Real-Time Stock Status Meter */}
              <div className="bg-surface-container-low rounded-lg p-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    inventory_2
                  </span>
                  <span className="font-label-sm text-[11px] text-on-surface truncate font-bold">
                    {pharm.stockUnitsText}
                  </span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">
                    | {pharm.lotNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-secondary font-label-sm text-[11px] font-semibold whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>{pharm.verifiedTime}</span>
                </div>
              </div>

              {/* Pharmacy Thumbnail & Address */}
              <div className="flex items-center gap-2.5">
                <img
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-xs ring-1 ring-surface-container"
                  alt={pharm.name}
                  src={pharm.imageUrl || ASSET_IMAGES.metroHealth}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="font-body-sm text-[12px] text-on-surface truncate font-semibold">
                    {pharm.address}
                  </p>
                  <div className="flex items-center gap-1.5 font-label-sm text-[11px] text-on-surface-variant">
                    <span className="flex items-center gap-0.5 text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[14px]">star</span> {pharm.rating} ({pharm.reviewCount} reviews)
                    </span>
                    <span>•</span>
                    <span className="text-on-surface font-medium">Generic Bio-Match: {pharm.genericBioMatch}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSavePharmacy(pharm.id, pharm.name);
                  }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSaved
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                  title={isSaved ? 'Saved Pharmacy' : 'Bookmark Pharmacy'}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isSaved ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                </button>
              </div>

              {/* Action Row */}
              <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(pharm.address + ' ' + pharm.neighborhood)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-2 bg-surface-container text-on-surface rounded-lg font-label-md text-[13px] font-semibold flex items-center justify-center gap-1 hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  <span>Directions ({pharm.distance})</span>
                </a>
                <button
                  onClick={() => onHoldLock(pharm)}
                  type="button"
                  className="h-10 px-2 bg-secondary text-on-secondary rounded-lg font-label-md text-[13px] font-bold flex items-center justify-center gap-1 hover:opacity-95 shadow-xs active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Hold &amp; Lock ${pharm.cashPrice.toFixed(2)}</span>
                </button>
              </div>
            </div>
          );
        })}
        {sortedPharmacies.length === 0 && (
          <div className="bg-surface-container-lowest p-6 rounded-xl text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] text-outline mb-1">storefront</span>
            <p className="font-headline-sm text-[15px] font-bold text-on-surface">No pharmacies match filter</p>
            <p className="text-xs text-on-surface-variant mt-1">Try resetting filters or expanding distance radius.</p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('All Verified');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-1.5 bg-secondary text-on-secondary text-xs font-bold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Active Rate Lock Voucher Sticky Drawer Banner */}
      <section className="px-3 mb-2">
        <div className="bg-primary-container text-on-primary rounded-xl p-3.5 shadow-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shadow-xs">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-secondary-fixed tracking-wider uppercase font-bold">
                  Active Price Guarantee
                </span>
                <span className="font-headline-sm text-[15px] font-extrabold text-on-primary truncate max-w-[200px]">
                  {sortedPharmacies[0]?.name || 'Metro Health Rx'} • ${sortedPharmacies[0]?.cashPrice.toFixed(2) || '9.20'}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-code-sm text-[13px] text-secondary-fixed-dim font-extrabold tracking-tight">
                {formatCountdown(secondsRemaining)}
              </div>
              <span className="font-label-sm text-[10px] text-on-primary-container">
                Time Remaining
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 bg-surface-container-lowest/10 rounded-lg px-3 py-2">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-on-primary-container">
                Rx Voucher ID
              </span>
              <span className="font-code-sm text-[12px] font-bold tracking-wider text-on-primary">
                LB-TX-99420-AT20
              </span>
            </div>
            <button
              onClick={onShowVoucher}
              type="button"
              className="px-3 py-1.5 rounded-md bg-secondary text-on-secondary font-label-md text-[12px] font-bold flex items-center gap-1 shadow-xs hover:opacity-95"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>Show Voucher</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
