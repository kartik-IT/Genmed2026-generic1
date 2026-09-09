import React, { useState, useEffect, useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyName?: string;
  rate?: number;
  drugName?: string;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  pharmacyName = 'Metro Health Community Rx',
  rate = 9.20,
  drugName = 'Atorvastatin Ca 20mg',
}) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const info = `Low & Best Verified Savings Pass\nPharmacy: ${pharmacyName}\nDrug: ${drugName}\nRate: $${rate.toFixed(2)}\nRxBIN: 015298\nRxPCN: PRXGEN\nRxGRP: GENBEST01\nMember ID: LB-TX-99420-AT20\nAdjudication Lock: Verified Active`;
    if (navigator.clipboard) navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Verified Savings Pass for ${drugName} at ${pharmacyName}`}
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[90vh]"
      >
        {/* Top bar */}
        <div className="px-4 py-3 bg-primary-container text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-fixed text-[22px]" aria-hidden="true">
              verified_user
            </span>
            <span className="font-headline-sm text-[15px] font-bold">
              Official Dispensing Voucher
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close voucher"
            className="w-8 h-8 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-on-primary hover:bg-surface-container-lowest/25 transition-colors"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex flex-col gap-4">
          {/* Main Pass Card */}
          <div className="bg-primary-container text-on-primary rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-lg">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="font-label-sm text-[10px] text-secondary-fixed uppercase tracking-wider font-extrabold">
                  Counter Pass Handshake
                </span>
                <h2 className="font-headline-md text-[18px] font-extrabold text-on-primary">
                  Verified Savings Pass
                </h2>
                <p className="font-body-sm text-[12px] text-primary-fixed-dim">
                  Show this screen or print for pharmacist
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-secondary-fixed" aria-hidden="true">
                <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
              </div>
            </div>

            {/* Barcode & NDC container */}
            <div className="bg-surface-container-lowest text-on-surface rounded-lg p-3 flex flex-col items-center gap-1 shadow-inner" aria-label="Prescription barcode">
              <span className="font-label-sm text-[12px] text-on-surface-variant font-bold">
                {drugName} • 30-Day Dispense
              </span>
              <div
                className="w-full h-16 flex items-center justify-center gap-[3px] py-1 px-4 overflow-hidden"
                role="img"
                aria-label="Barcode"
              >
                {[3,1,4,2,1,5,2,3,1,4,2,6,2,1,3,4,2,5,1,3,4,2,1,3,5,2].map((w, i) => (
                  <span key={i} className="h-full bg-primary inline-block" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="font-code-sm text-[12px] tracking-widest text-on-surface font-extrabold">
                NDC: 60505-2579-03
              </span>
            </div>

            {/* Claims Table */}
            <dl className="grid grid-cols-3 gap-2 bg-surface-container-lowest/10 p-2.5 rounded-lg font-code-sm text-[12px]">
              {[['RxBIN', '015298'], ['RxPCN', 'PRXGEN'], ['RxGRP', 'GENBEST01']].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-label-sm text-[10px] text-primary-fixed-dim">{label}</dt>
                  <dd className="text-on-primary font-extrabold text-[13px]">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="text-secondary-fixed font-label-sm text-[11px] font-bold pt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">verified</span>
              ${rate.toFixed(2)} Rate Guarantee · {pharmacyName}
            </p>
          </div>

          {/* Pharmacist instructions */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex flex-col gap-1.5 text-xs text-on-surface-variant">
            <span className="font-bold text-on-surface text-[12px]">
              Instructions for Dispensing Pharmacist:
            </span>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Submit electronic claim through Switch / NCPDP processor with the BIN/PCN/Group above.</li>
              <li>Product is an FDA Orange Book AB-rated bioequivalent formulation.</li>
              <li>Patient pays negotiated adjudicated co-pay / cash price of ${rate.toFixed(2)}.</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="flex-1 h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied!' : 'Copy Adjudication Info'}</span>
            </button>
            <button
              onClick={() => window.print()}
              type="button"
              className="h-11 px-4 rounded-xl bg-surface-container text-on-surface font-label-md text-[13px] font-semibold hover:bg-surface-container-high transition-colors"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
