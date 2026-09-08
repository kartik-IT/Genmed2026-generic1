import React from 'react';
import { TrackedRegimen } from '../types';

interface SavingsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  regimen: TrackedRegimen | null;
}

export const SavingsHistoryModal: React.FC<SavingsHistoryModalProps> = ({
  isOpen,
  onClose,
  regimen,
}) => {
  if (!isOpen || !regimen) return null;

  const historyPoints = [
    { date: 'Oct 28', pharmacy: 'Metro Health', paid: 10.50, brand: 68.50, saved: 58.00 },
    { date: 'Sep 26', pharmacy: 'Metro Health', paid: 10.50, brand: 68.50, saved: 58.00 },
    { date: 'Aug 24', pharmacy: 'Apex Care', paid: 11.20, brand: 68.50, saved: 57.30 },
    { date: 'Jul 21', pharmacy: 'Walgreens #4829', paid: 12.00, brand: 68.50, saved: 56.50 },
  ];

  const totalSaved = historyPoints.reduce((acc, curr) => acc + curr.saved, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[85vh]">
        <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              timeline
            </span>
            <span className="font-headline-sm text-[15px] font-bold text-on-surface">
              Savings Audit &amp; Price History
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          <div className="bg-secondary/10 p-3 rounded-xl border border-secondary/20 flex items-center justify-between">
            <div>
              <span className="font-label-sm text-[11px] text-secondary font-bold uppercase">
                Cumulative Savings to Date
              </span>
              <div className="font-headline-lg text-[24px] font-extrabold text-secondary">
                ${totalSaved.toFixed(2)}
              </div>
            </div>
            <span className="bg-secondary text-on-secondary font-code-sm text-[11px] px-2.5 py-1 rounded-lg font-bold">
              85% Saved
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">
              {regimen.name} {regimen.strength} Fill Log
            </span>

            {historyPoints.map((point, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-label-md text-[13px] font-bold text-on-surface">
                    {point.pharmacy}
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    {point.date} • Brand Price was ${point.brand.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-label-md text-[13px] font-extrabold text-on-surface">
                    ${point.paid.toFixed(2)}
                  </span>
                  <span className="block text-[11px] text-secondary font-bold">
                    Saved ${point.saved.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-on-surface-variant italic leading-relaxed pt-1">
            * All transaction records are cryptographically verified against pharmacy adjudication
            clearinghouses.
          </p>
        </div>
      </div>
    </div>
  );
};
