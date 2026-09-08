import React, { useState, useMemo } from 'react';
import { TrackedRegimen, FillLedgerItem } from '../types';

interface SavedRxScreenProps {
  regimens: TrackedRegimen[];
  ledgerItems: FillLedgerItem[];
  onOpenBarcodeScanner: () => void;
  onReserveRegimen: (regimen: TrackedRegimen) => void;
  onOpenSavingsHistory: (regimen: TrackedRegimen) => void;
  onNavigateToSearch?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', icon?: string) => void;
}

export const SavedRxScreen: React.FC<SavedRxScreenProps> = ({
  regimens,
  ledgerItems,
  onOpenBarcodeScanner,
  onReserveRegimen,
  onOpenSavingsHistory,
  onNavigateToSearch,
  onShowToast,
}) => {
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [alertsState, setAlertsState] = useState<Record<string, boolean>>({
    'regimen-1': true,
    'regimen-2': true,
    'regimen-3': true,
  });

  const toggleAlert = (id: string, name: string) => {
    const next = !alertsState[id];
    setAlertsState((prev) => ({
      ...prev,
      [id]: next,
    }));
    if (onShowToast) {
      onShowToast(
        next ? `Refill reminder enabled for ${name}` : `Refill reminder paused for ${name}`,
        'info',
        next ? 'notifications_active' : 'notifications_off'
      );
    }
  };

  const handleExportLedger = () => {
    if (onShowToast) {
      onShowToast('Adjudication ledger exported to secure CSV file', 'success', 'download');
    }
  };

  // Dynamic savings calculations
  const totalMonthlySavings = useMemo(() => {
    return regimens.reduce((acc, r) => {
      const brandCostPerMonth = (r.brandPrice / r.supplyDays) * 30;
      const genericCostPerMonth = (r.currentPrice / r.supplyDays) * 30;
      return acc + (brandCostPerMonth - genericCostPerMonth);
    }, 0);
  }, [regimens]);

  const totalAnnualSavings = totalMonthlySavings * 12;

  const totalLifetimeSaved = useMemo(() => {
    return ledgerItems.reduce((acc, item) => acc + item.savedAmount, 0);
  }, [ledgerItems]);

  const displayedRegimens = filterActiveOnly
    ? regimens.filter((r) => r.refillDaysLeft <= 14)
    : regimens;

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-3 gap-3 pb-32 pt-16 animate-fadeIn">
      {/* Monthly Savings & Cabinet Hero Card */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3 relative overflow-hidden">
        {/* Subtle clinical gradient backdrop */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-secondary-container/25 blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label-sm text-[11px] text-secondary uppercase tracking-wide font-bold">
              Live Price Engine Active
            </span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-container-low text-on-surface-variant font-code-sm text-[11px] font-bold border border-surface-container">
            {regimens.length} Rx Active
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[32px] text-on-surface font-extrabold tracking-tight">
              ${totalMonthlySavings.toFixed(2)}
            </span>
            <span className="font-label-md text-[13px] text-secondary font-bold">saved / month</span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
            Therapeutic generic equivalents reduce patient out-of-pocket costs by an audited{' '}
            <strong className="font-bold text-on-surface">86% avg reduction</strong> across
            verified Austin local pharmacies.
          </p>
        </div>

        {/* Micro Stat Barometer */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col border border-surface-container/50">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-medium">
              Annual Projected
            </span>
            <span className="font-headline-sm text-[16px] text-on-surface font-extrabold">
              ${totalAnnualSavings.toFixed(2)}
            </span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col border border-surface-container/50">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-medium">
              Lifetime Claim Savings
            </span>
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined text-[16px] text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="font-headline-sm text-[15px] text-secondary font-bold">
                ${totalLifetimeSaved.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions Header & Fast Filter */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="font-headline-md text-[18px] font-bold text-on-surface">Tracked Regimens</h2>
        <div className="flex items-center gap-1.5">
          {onNavigateToSearch && (
            <button
              type="button"
              onClick={onNavigateToSearch}
              className="inline-flex items-center gap-1 font-label-md text-[12px] px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Rx</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className={`inline-flex items-center gap-1 font-label-md text-[12px] px-2.5 py-1 rounded-lg transition-all ${
              filterActiveOnly
                ? 'bg-secondary text-on-secondary font-bold'
                : 'text-secondary hover:bg-surface-container font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>{filterActiveOnly ? 'Due Soon' : 'All'}</span>
          </button>
        </div>
      </div>

      {/* Prescription Cards List */}
      <div className="flex flex-col gap-3">
        {displayedRegimens.map((regimen) => {
          const isAlertOn = alertsState[regimen.id] ?? true;

          return (
            <div
              key={regimen.id}
              className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3 relative transition-all hover:shadow-md"
            >
              {/* Top Badges */}
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {regimen.priceDropAlert && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-container/50 text-secondary font-label-sm text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[14px]">price_change</span>
                      {regimen.alertText || 'Price Drop Alert'}
                    </span>
                  )}
                  {regimen.isBestValueEligible && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-sm text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[14px] text-secondary">
                        verified
                      </span>
                      90-Day Best Value
                    </span>
                  )}
                  {regimen.isLowStock && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-label-sm text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Stock Low
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-label-sm text-[11px] font-bold flex items-center gap-1 ${
                      regimen.refillDaysLeft <= 7 ? 'text-error' : 'text-on-surface-variant'
                    }`}
                  >
                    {regimen.refillDaysLeft <= 7 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                    )}
                    Refill in {regimen.refillDaysLeft}d
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAlert(regimen.id, regimen.name)}
                    aria-label={`Toggle alerts for ${regimen.name}`}
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                      isAlertOn
                        ? 'text-secondary hover:bg-secondary-container/30'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                    title={isAlertOn ? 'Refill Alerts Active' : 'Enable Refill Alerts'}
                  >
                    <span
                      className="material-symbols-outlined text-[17px]"
                      style={{ fontVariationSettings: isAlertOn ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {isAlertOn ? 'notifications_active' : 'notifications_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Medicine Details */}
              <div className="flex gap-3 items-start">
                <img
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-surface-container border border-surface-container"
                  alt={regimen.name}
                  src={regimen.imageUrl}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <h3 className="font-headline-sm text-[15px] font-bold text-on-surface truncate">
                    {regimen.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-[12px]">
                    <span className="font-semibold text-secondary">{regimen.strength}</span>
                    <span>•</span>
                    <span className="truncate">Generic for {regimen.brandName}</span>
                  </div>
                  <span className="font-code-sm text-[11px] text-on-surface-variant mt-0.5">
                    {regimen.supplyDays}-day supply • {regimen.regimenNote}
                  </span>
                </div>
              </div>

              {/* Price Comparison Module */}
              <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col gap-1 border border-surface-container/50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                      {regimen.pharmacyName}
                    </span>
                    {regimen.previousPrice > regimen.currentPrice ? (
                      <span className="font-body-sm text-[11px] text-secondary font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                        Down ${(regimen.previousPrice - regimen.currentPrice).toFixed(2)} vs prior fill
                      </span>
                    ) : (
                      <span className="font-label-sm text-[11px] text-secondary font-semibold">
                        {regimen.verifiedTime}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline-sm text-[16px] text-on-surface font-extrabold">
                        ${regimen.currentPrice.toFixed(2)}
                      </span>
                      <span className="font-label-sm text-[11px] text-on-surface-variant line-through">
                        ${regimen.brandPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="font-code-sm text-[10px] text-secondary font-bold">
                      Verified Rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onOpenSavingsHistory(regimen)}
                  className="h-10 px-2 rounded-lg bg-surface-container text-on-surface font-label-md text-[13px] font-semibold flex items-center justify-center gap-1 hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">timeline</span>
                  <span>Savings History</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReserveRegimen(regimen)}
                  className="h-10 px-2 rounded-lg bg-primary text-on-primary font-label-md text-[13px] font-bold flex items-center justify-center gap-1 hover:bg-primary-container transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span>Reserve (${regimen.currentPrice.toFixed(2)})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cumulative Savings Insights & Audited History */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              verified_user
            </span>
            <h3 className="font-headline-sm text-[15px] font-bold text-on-surface">
              Verified Fill Ledger
            </h3>
          </div>
          <button
            type="button"
            onClick={handleExportLedger}
            className="text-secondary font-label-sm text-[11px] font-bold hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span>Export</span>
          </button>
        </div>

        {/* Timeline Entries */}
        <div className="flex flex-col gap-2">
          {ledgerItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-container/50 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-[13px] font-bold text-on-surface">
                    {item.medicineName}
                  </span>
                  <span className="font-code-sm text-[11px] text-on-surface-variant">
                    {item.pharmacyName} • {item.date} • Hash: {item.hash}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label-md text-[13px] text-on-surface font-extrabold">
                  ${item.paidPrice.toFixed(2)}
                </span>
                <span className="font-label-sm text-[11px] text-secondary font-bold">
                  Saved ${item.savedAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Quick Action: Scan Rx Barcode */}
      <div className="fixed bottom-20 left-0 right-0 z-40 w-full flex justify-center pointer-events-none px-4">
        <button
          onClick={onOpenBarcodeScanner}
          aria-label="Scan New Rx or Barcode"
          type="button"
          className="pointer-events-auto h-12 px-6 bg-primary text-on-primary rounded-full shadow-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform border border-surface-container/30"
          id="scanRxBtn"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
            photo_camera
          </span>
          <span className="font-label-md text-[13px] font-bold tracking-wide">
            Scan New Rx / Barcode
          </span>
        </button>
      </div>
    </div>
  );
};
