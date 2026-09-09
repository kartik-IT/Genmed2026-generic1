import React, { useState, useEffect, useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (drugName: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [manualNdc, setManualNdc] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);

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

  const handleSimulateScan = (drugName: string, ndcCode: string) => {
    setIsScanning(false);
    setTimeout(() => {
      onScanSuccess(drugName);
      onClose();
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualNdc.trim()) {
      handleSimulateScan('Atorvastatin Calcium 20mg', manualNdc.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Scan Rx Prescription or NDC barcode"
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]" aria-hidden="true">
              barcode_scanner
            </span>
            <span className="font-headline-sm text-[15px] font-bold text-on-surface">
              Scan Rx Prescription / NDC
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close barcode scanner"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Viewfinder Simulator */}
        <div className="relative bg-black h-64 flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Scanning Reticle Frame */}
          <div className="relative w-64 h-36 border-2 border-secondary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,106,97,0.5)]">
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-secondary-fixed"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-secondary-fixed"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-secondary-fixed"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-secondary-fixed"></div>

            {/* Laser scanning beam line */}
            <div className="absolute left-2 right-2 h-0.5 bg-secondary-fixed shadow-[0_0_8px_#89f5e7] animate-pulse"></div>

            <p className="text-white/80 text-[11px] font-mono tracking-wider bg-black/60 px-2 py-1 rounded">
              Align Rx Barcode or QR
            </p>
          </div>

          <p className="text-white/60 text-xs mt-3 text-center">
            Camera active • FDA National Drug Code optical recognition
          </p>
        </div>

        {/* Preset demo triggers */}
        <div className="p-4 flex flex-col gap-3">
          <span className="font-label-sm text-[11px] text-on-surface-variant font-bold uppercase tracking-wide">
            Test With Demo Prescriptions
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSimulateScan('Atorvastatin Calcium 20mg', '60505-2579-03')}
              type="button"
              className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-left border border-surface-container transition-colors"
            >
              <span className="font-label-md text-[12px] font-bold text-on-surface block truncate">
                Lipitor® 20mg Rx
              </span>
              <span className="font-code-sm text-[10px] text-secondary font-semibold block">
                NDC 60505-2579-03
              </span>
            </button>

            <button
              onClick={() => handleSimulateScan('Metformin HCl ER 500mg', '50383-028-16')}
              type="button"
              className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-left border border-surface-container transition-colors"
            >
              <span className="font-label-md text-[12px] font-bold text-on-surface block truncate">
                Glucophage® XR
              </span>
              <span className="font-code-sm text-[10px] text-secondary font-semibold block">
                NDC 50383-028-16
              </span>
            </button>
          </div>

          {/* Manual input */}
          <form onSubmit={handleManualSubmit} className="pt-2 flex gap-2">
            <label htmlFor="manual-ndc" className="sr-only">Enter 11-digit NDC code</label>
            <input
              id="manual-ndc"
              type="text"
              placeholder="Or enter 11-digit NDC..."
              value={manualNdc}
              onChange={(e) => setManualNdc(e.target.value)}
              className="flex-1 bg-surface-container-low border border-surface-container rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-secondary font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-secondary text-on-secondary font-label-md text-xs font-bold rounded-lg hover:opacity-95"
            >
              Lookup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
