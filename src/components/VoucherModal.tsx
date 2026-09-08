import React, { useState } from 'react';

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

  if (!isOpen) return null;

  const handleCopy = () => {
    const info = `Low & Best Verified Savings Pass\nPharmacy: ${pharmacyName}\nDrug: ${drugName}\nRate: $${rate.toFixed(2)}\nRxBIN: 015298\nRxPCN: PRXGEN\nRxGRP: GENBEST01\nMember ID: LB-TX-99420-AT20\nAdjudication Lock: Verified Active`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(info);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[90vh]">
        {/* Top bar */}
        <div className="px-4 py-3 bg-primary-container text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
              verified_user
            </span>
            <span className="font-headline-sm text-[15px] font-bold">
              Official Dispensing Voucher
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-on-primary hover:bg-surface-container-lowest/25"
          >
            ✕
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
                <h3 className="font-headline-md text-[18px] font-extrabold text-on-primary">
                  Verified Savings Pass
                </h3>
                <p className="font-body-sm text-[12px] text-primary-fixed-dim">
                  Show this screen or print for pharmacist
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-secondary-fixed">
                <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
              </div>
            </div>

            {/* Barcode & NDC container */}
            <div className="bg-surface-container-lowest text-on-surface rounded-lg p-3 flex flex-col items-center gap-1 shadow-inner">
              <span className="font-label-sm text-[12px] text-on-surface-variant font-bold">
                {drugName} • 30-Day Dispense
              </span>
              {/* Scaled Barcode */}
              <div className="w-full h-16 flex items-center justify-center gap-[3px] py-1 px-4 overflow-hidden">
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
              <span className="font-code-sm text-[12px] tracking-widest text-on-surface font-extrabold">
                NDC: 60505-2579-03
              </span>
            </div>

            {/* Claims Table */}
            <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest/10 p-2.5 rounded-lg font-code-sm text-[12px]">
              <div>
                <span className="font-label-sm text-[10px] text-primary-fixed-dim block">RxBIN</span>
                <span className="text-on-primary font-extrabold text-[13px]">015298</span>
              </div>
              <div>
                <span className="font-label-sm text-[10px] text-primary-fixed-dim block">RxPCN</span>
                <span className="text-on-primary font-extrabold text-[13px]">PRXGEN</span>
              </div>
              <div>
                <span className="font-label-sm text-[10px] text-primary-fixed-dim block">RxGRP</span>
                <span className="text-on-primary font-extrabold text-[13px]">GENBEST01</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-secondary-fixed font-label-sm text-[11px] font-bold pt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                ${rate.toFixed(2)} Rate Guarantee • {pharmacyName}
              </span>
            </div>
          </div>

          {/* Pharmacist instructions note */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex flex-col gap-1.5 text-xs text-on-surface-variant">
            <span className="font-bold text-on-surface text-[12px]">
              Instructions for Dispensing Pharmacist:
            </span>
            <p className="leading-relaxed">
              1. Submit electronic claim through Switch / NCPDP processor with the BIN/PCN/Group above.
              <br />
              2. Product is an FDA Orange Book AB-rated bioequivalent formulation.
              <br />
              3. Patient pays negotiated adjudicated co-pay / cash price of ${rate.toFixed(2)}.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="flex-1 h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Adjudication Info'}</span>
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
