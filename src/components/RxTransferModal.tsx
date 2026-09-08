import React, { useState } from 'react';
import { Pharmacy, DrugProfile } from '../types';

interface RxTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPharmacy: Pharmacy;
  drug: DrugProfile;
  onTransferComplete: (transferId: string, pharmacyName: string) => void;
}

export const RxTransferModal: React.FC<RxTransferModalProps> = ({
  isOpen,
  onClose,
  targetPharmacy,
  drug,
  onTransferComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sourcePharmacy, setSourcePharmacy] = useState('CVS Pharmacy');
  const [rxNumber, setRxNumber] = useState('6482910');
  const [patientName, setPatientName] = useState('Alex Morgan');
  const [patientDob, setPatientDob] = useState('1984-06-14');
  const [patientPhone, setPatientPhone] = useState('(512) 893-4102');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferToken, setTransferToken] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsSubmitting(true);
      setTimeout(() => {
        const token = `TX-XFER-${Math.floor(1000 + Math.random() * 9000)}`;
        setTransferToken(token);
        setIsSubmitting(false);
        setStep(3);
        onTransferComplete(token, targetPharmacy.name);
      }, 900);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-surface-container text-on-surface flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              sync_alt
            </span>
            <div>
              <h3 className="font-headline-sm text-[15px] font-bold leading-tight">
                Transfer Prescription
              </h3>
              <p className="font-label-sm text-[11px] text-on-surface-variant">
                Move prescription to {targetPharmacy.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-4 pt-3 pb-2 bg-surface-container-low border-b border-surface-container/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-sm text-[11px] font-bold text-secondary uppercase tracking-wider">
              Step {step} of 3:{' '}
              {step === 1
                ? 'Current Pharmacy & Rx'
                : step === 2
                ? 'Patient Verification'
                : 'Transfer Confirmed'}
            </span>
            <span className="font-code-sm text-[11px] text-on-surface-variant font-semibold">
              {step === 1 ? '33%' : step === 2 ? '66%' : '100%'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex flex-col gap-4">
          {/* Step 1: Current Pharmacy & Rx */}
          {step === 1 && (
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              {/* Target Savings Callout */}
              <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-label-sm text-[10px] text-secondary font-bold uppercase tracking-wider block">
                    Transfer Target Savings
                  </span>
                  <span className="font-headline-sm text-[15px] font-extrabold text-on-surface">
                    Lock ${targetPharmacy.cashPrice.toFixed(2)} at {targetPharmacy.name}
                  </span>
                </div>
                <span className="bg-secondary text-on-secondary px-2 py-1 rounded font-code-sm text-[11px] font-bold">
                  Save ~80%
                </span>
              </div>

              {/* Source Pharmacy selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Where is your prescription currently filled?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['CVS Pharmacy', 'Walgreens', 'Walmart Pharmacy', 'Other Pharmacy'].map(
                    (pharm) => (
                      <button
                        key={pharm}
                        type="button"
                        onClick={() => setSourcePharmacy(pharm)}
                        className={`p-2.5 rounded-lg border text-left font-body-sm text-[13px] transition-all ${
                          sourcePharmacy === pharm
                            ? 'border-secondary bg-secondary-container/30 font-bold text-on-surface'
                            : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {pharm}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Rx Number */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Prescription (Rx) Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={rxNumber}
                    onChange={(e) => setRxNumber(e.target.value)}
                    placeholder="Found on your current pill bottle"
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container rounded-lg font-code-sm text-[14px] text-on-surface focus:outline-none focus:border-secondary"
                  />
                  <span className="absolute right-3 top-2.5 text-on-surface-variant font-label-sm text-[11px]">
                    e.g. 7 digits
                  </span>
                </div>
                <p className="font-label-sm text-[11px] text-on-surface-variant">
                  Usually printed above or below your name on the pharmacy label.
                </p>
              </div>

              {/* Medication to transfer */}
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    medication
                  </span>
                  <div>
                    <span className="font-body-sm text-[13px] font-bold text-on-surface block">
                      {drug.genericName} {drug.strength}
                    </span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant">
                      Generic for {drug.brandName}
                    </span>
                  </div>
                </div>
                <span className="font-code-sm text-[12px] text-secondary font-bold">
                  ${targetPharmacy.cashPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Patient Verification */}
          {step === 2 && (
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container text-xs text-on-surface-variant">
                Pharmacists require matching patient identity data to authenticate electronic
                prescription transfer from {sourcePharmacy}.
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[12px] font-bold text-on-surface">
                  Patient Full Legal Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container rounded-lg font-body-sm text-[13px] text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[12px] font-bold text-on-surface">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={patientDob}
                    onChange={(e) => setPatientDob(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg font-code-sm text-[12px] text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[12px] font-bold text-on-surface">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg font-code-sm text-[12px] text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="bg-surface-container-high/40 p-2.5 rounded-lg flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                  lock
                </span>
                <span className="font-label-sm text-[11px] leading-relaxed">
                  HIPAA encrypted. Your data is strictly transmitted to {targetPharmacy.name} for
                  clinical fulfillment.
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Confirmed Protocol */}
          {step === 3 && (
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              <div className="bg-secondary/15 border border-secondary/30 p-4 rounded-xl flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <h4 className="font-headline-md text-[18px] font-extrabold text-on-surface">
                  Transfer Initiated!
                </h4>
                <p className="font-body-sm text-[12px] text-on-surface-variant max-w-xs">
                  {targetPharmacy.name} pharmacist has received your electronic transfer request.
                </p>
                <div className="mt-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container font-code-md text-[14px] font-extrabold text-secondary tracking-wider">
                  {transferToken}
                </div>
              </div>

              {/* Transfer Details Card */}
              <div className="bg-surface-container-low rounded-xl p-3 border border-surface-container flex flex-col gap-2 font-body-sm text-[12px]">
                <div className="flex justify-between py-1 border-b border-surface-container/60">
                  <span className="text-on-surface-variant">Medication:</span>
                  <span className="font-bold text-on-surface">
                    {drug.genericName} {drug.strength}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container/60">
                  <span className="text-on-surface-variant">From Pharmacy:</span>
                  <span className="font-semibold text-on-surface">
                    {sourcePharmacy} (Rx #{rxNumber})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container/60">
                  <span className="text-on-surface-variant">To Pharmacy:</span>
                  <span className="font-semibold text-on-surface">{targetPharmacy.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-container/60">
                  <span className="text-on-surface-variant">Locked Rate:</span>
                  <span className="font-bold text-secondary">
                    ${targetPharmacy.cashPrice.toFixed(2)} (Held for 4 hours)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">Estimated Ready:</span>
                  <span className="font-bold text-on-surface">Today by 4:30 PM</span>
                </div>
              </div>

              <div className="bg-surface-container-high/60 p-2.5 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                  notifications_active
                </span>
                <span className="font-label-sm text-[11px] text-on-surface leading-relaxed">
                  You will receive an SMS notification as soon as {targetPharmacy.name} completes
                  the bottle fill.
                </span>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex gap-2">
            {step < 3 ? (
              <>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                    className="h-11 px-4 rounded-xl bg-surface-container text-on-surface font-label-md text-[13px] font-semibold hover:bg-surface-container-high"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleNext}
                  className="flex-1 h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Transfer...</span>
                  ) : (
                    <>
                      <span>{step === 1 ? 'Continue to Verification' : 'Confirm & Send Request'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold shadow-xs hover:bg-primary-container"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
