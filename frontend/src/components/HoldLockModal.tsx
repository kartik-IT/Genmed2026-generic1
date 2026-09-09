import React, { useState, useEffect, useCallback } from 'react';
import { Pharmacy } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface HoldLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy | null;
  onSuccess: (code: string) => void;
}

export const HoldLockModal: React.FC<HoldLockModalProps> = ({
  isOpen,
  onClose,
  pharmacy,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('(512) 555-0199');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [holdCode, setHoldCode] = useState('');
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !pharmacy) return null;

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) return 'Please enter a valid 10-digit phone number.';
    return '';
  };

  const handleHoldLock = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validatePhone(phoneNumber);
    if (error) { setPhoneError(error); return; }
    setPhoneError('');
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedCode = `HL-${Math.floor(100000 + Math.random() * 900000)}`;
      setHoldCode(generatedCode);
      setIsSubmitting(false);
      setIsSuccess(true);
      onSuccess(generatedCode);
    }, 800);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setPhoneError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Lock rate at ${pharmacy.name}`}
        aria-live="polite"
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-secondary text-on-secondary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">lock_clock</span>
            <span className="font-headline-sm text-[15px] font-bold">
              Lock Rate &amp; Reserve Batch
            </span>
          </div>
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close hold lock dialog"
            className="w-8 h-8 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-on-secondary hover:bg-surface-container-lowest/25 transition-colors"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {!isSuccess ? (
            <form onSubmit={handleHoldLock} className="flex flex-col gap-3" noValidate>
              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex flex-col gap-1">
                <span className="font-label-sm text-[11px] text-secondary font-bold uppercase tracking-wider">
                  Pharmacy Dispensary
                </span>
                <span className="font-headline-sm text-[15px] font-bold text-on-surface">
                  {pharmacy.name}
                </span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  {pharmacy.address} · {pharmacy.distance}
                </span>
              </div>

              {/* Price guarantee breakdown */}
              <dl className="grid grid-cols-2 gap-2 bg-surface-container-high/60 p-3 rounded-xl">
                <div>
                  <dt className="font-label-sm text-[11px] text-on-surface-variant">Guaranteed Rate Lock</dt>
                  <dd className="font-headline-md text-[20px] font-extrabold text-secondary">
                    ${pharmacy.cashPrice.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="font-label-sm text-[11px] text-on-surface-variant">Hold Window</dt>
                  <dd className="font-headline-md text-[18px] font-bold text-on-surface">4 Hours Max</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="hold-phone"
                  className="font-label-sm text-[12px] font-bold text-on-surface"
                >
                  SMS Confirmation &amp; Pickup Pass
                </label>
                <input
                  id="hold-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); setPhoneError(''); }}
                  aria-describedby={phoneError ? 'hold-phone-error' : 'hold-phone-hint'}
                  aria-invalid={phoneError ? 'true' : 'false'}
                  className={`w-full bg-surface-container-low border rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 font-mono transition-colors ${
                    phoneError
                      ? 'border-error focus:ring-error/40'
                      : 'border-surface-container focus:border-secondary focus:ring-secondary/30'
                  }`}
                  required
                />
                {phoneError ? (
                  <span id="hold-phone-error" role="alert" className="text-[11px] text-error font-medium">
                    {phoneError}
                  </span>
                ) : (
                  <span id="hold-phone-hint" className="text-[11px] text-on-surface-variant">
                    We'll text you the counter pickup code and adjudication PIN.
                  </span>
                )}
              </div>

              <div className="bg-secondary/10 p-2.5 rounded-lg text-secondary text-xs font-medium flex items-center gap-1.5" role="note">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">verified</span>
                <span>No pre-payment required. Pay locked rate at pharmacy counter.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-bold hover:opacity-95 shadow-xs flex items-center justify-center gap-1 transition-opacity disabled:opacity-70"
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Securing Batch…</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">lock</span>
                      <span>Lock Rate Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2 text-center animate-fadeIn" aria-live="assertive">
              <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg" aria-hidden="true">
                <span className="material-symbols-outlined text-[32px]">check</span>
              </div>

              <div>
                <h2 className="font-headline-md text-[18px] font-bold text-on-surface">
                  Rate Locked &amp; Stock Reserved!
                </h2>
                <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">
                  Your batch has been placed on hold at {pharmacy.name}.
                </p>
              </div>

              <div className="bg-primary-container text-on-primary px-4 py-2.5 rounded-xl flex flex-col items-center w-full">
                <span className="font-label-sm text-[10px] text-secondary-fixed uppercase tracking-wider font-bold">
                  Counter Reservation PIN
                </span>
                <output
                  htmlFor="hold-phone"
                  className="font-code-sm text-[20px] font-bold tracking-widest text-secondary-fixed"
                  aria-label={`Your PIN is ${holdCode}`}
                >
                  {holdCode}
                </output>
                <span className="font-label-sm text-[11px] text-primary-fixed-dim mt-0.5">
                  Expires in 4 hours · Locked at ${pharmacy.cashPrice.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full h-11 bg-primary text-on-primary rounded-xl font-label-md text-[13px] font-bold mt-2 hover:opacity-90 transition-opacity"
              >
                Done &amp; View Savings Pass
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
