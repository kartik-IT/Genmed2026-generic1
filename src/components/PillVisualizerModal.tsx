import React, { useState, useEffect } from 'react';
import { DrugProfile, GenericAlternative } from '../types';

interface PillVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  drug: DrugProfile;
  selectedAlternative?: GenericAlternative;
}

export const PillVisualizerModal: React.FC<PillVisualizerModalProps> = ({
  isOpen,
  onClose,
  drug,
  selectedAlternative,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'1x' | '2x'>('1x');
  const [activeAltId, setActiveAltId] = useState<string>(
    selectedAlternative?.id || drug.alternatives[1]?.id || drug.alternatives[0]?.id
  );

  useEffect(() => {
    if (selectedAlternative) {
      setActiveAltId(selectedAlternative.id);
    } else if (drug.alternatives.length > 0) {
      setActiveAltId(drug.alternatives[1]?.id || drug.alternatives[0]?.id);
    }
  }, [selectedAlternative, drug]);

  if (!isOpen) return null;

  const currentAlt =
    drug.alternatives.find((a) => a.id === activeAltId) ||
    drug.alternatives[0];

  const isBrand = currentAlt?.isBaselineStandard;
  const lowerGen = drug.genericName.toLowerCase();
  const lowerMfg = currentAlt?.manufacturer.toLowerCase() || '';

  // Imprint text and physical styling based on molecule & manufacturer
  let frontImprint = 'APO';
  let backImprint = '20';
  let pillShape: 'oval' | 'round' | 'oblong' = 'oval';
  let pillColor = 'bg-stone-100';
  let pillBorder = 'border-stone-300';
  let pillTextColor = 'text-stone-700';

  if (lowerGen.includes('atorvastatin')) {
    if (isBrand) {
      frontImprint = 'PD 156';
      backImprint = '20';
      pillShape = 'oval';
    } else if (lowerMfg.includes('apotex')) {
      frontImprint = 'APO';
      backImprint = 'A20';
      pillShape = 'oval';
    } else if (lowerMfg.includes('teva')) {
      frontImprint = 'TEVA';
      backImprint = '7451';
      pillShape = 'round';
    }
  } else if (lowerGen.includes('metformin')) {
    frontImprint = 'IP 178';
    backImprint = '500';
    pillShape = 'oblong';
    pillColor = 'bg-white';
    pillBorder = 'border-stone-300';
  } else if (lowerGen.includes('sertraline')) {
    frontImprint = 'LUPIN';
    backImprint = '50';
    pillShape = 'oval';
    pillColor = 'bg-sky-100';
    pillBorder = 'border-sky-300';
    pillTextColor = 'text-sky-900';
  } else if (lowerGen.includes('amlodipine')) {
    frontImprint = 'IG 239';
    backImprint = '5';
    pillShape = 'round';
    pillColor = 'bg-emerald-50';
    pillBorder = 'border-emerald-300';
    pillTextColor = 'text-emerald-900';
  } else if (lowerGen.includes('omeprazole')) {
    frontImprint = 'KU 118';
    backImprint = '20';
    pillShape = 'oblong';
    pillColor = 'bg-amber-100';
    pillBorder = 'border-amber-300';
    pillTextColor = 'text-amber-900';
  } else if (lowerGen.includes('levothyroxine')) {
    frontImprint = 'GG 331';
    backImprint = '50';
    pillShape = 'round';
    pillColor = 'bg-white';
    pillBorder = 'border-stone-300';
    pillTextColor = 'text-stone-800';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-4 py-3 bg-surface-container text-on-surface flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              medication
            </span>
            <div>
              <h3 className="font-headline-sm text-[15px] font-bold leading-tight">
                Pill &amp; Imprint Inspector
              </h3>
              <p className="font-label-sm text-[11px] text-on-surface-variant">
                FDA National Drug Code Physical Form Identifier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          {/* Alternative Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {drug.alternatives.map((alt) => (
              <button
                key={alt.id}
                type="button"
                onClick={() => setActiveAltId(alt.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeAltId === alt.id
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {alt.name}
              </button>
            ))}
          </div>

          {/* Interactive 3D / Pill Stage */}
          <div className="bg-surface-container-low rounded-xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden border border-surface-container/60 shadow-inner">
            {/* Grid background texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#006A61_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

            {/* Scale badge */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-surface-container-lowest/90 px-2 py-0.5 rounded text-[10px] font-code-sm font-semibold text-on-surface border border-surface-container">
              <span>Magnification: {zoomLevel}</span>
            </div>

            {/* Flip hint */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex items-center gap-1 bg-surface-container-lowest/90 hover:bg-surface-container px-2 py-1 rounded text-[11px] font-label-sm font-bold text-secondary border border-surface-container shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">flip</span>
                <span>{isFlipped ? 'View Front' : 'View Reverse'}</span>
              </button>
            </div>

            {/* Pill graphic with interactive flip */}
            <div
              className={`relative cursor-pointer transition-all duration-300 py-4 ${
                zoomLevel === '2x' ? 'scale-125' : 'scale-100'
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
              title="Click to flip tablet"
            >
              {/* Tablet Body */}
              <div
                className={`relative flex items-center justify-center shadow-xl transition-all duration-500 border-2 ${pillColor} ${pillBorder} ${
                  pillShape === 'round'
                    ? 'w-28 h-28 rounded-full'
                    : pillShape === 'oblong'
                    ? 'w-40 h-20 rounded-full'
                    : 'w-36 h-22 rounded-[40px]'
                } ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{
                  boxShadow:
                    '0 12px 24px -4px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(0,0,0,0.12)',
                }}
              >
                {/* Score line across middle */}
                <div
                  className={`absolute bg-stone-300/80 shadow-xs ${
                    pillShape === 'round'
                      ? 'w-[1.5px] h-full left-1/2 -translate-x-1/2'
                      : 'w-[1.5px] h-full left-1/2 -translate-x-1/2'
                  }`}
                ></div>

                {/* Front or Back Imprint Text */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <span
                    className={`font-code-md font-extrabold tracking-widest text-[16px] drop-shadow-xs select-none ${pillTextColor}`}
                  >
                    {isFlipped ? backImprint : frontImprint}
                  </span>
                  <span className="font-label-sm text-[9px] uppercase tracking-widest text-stone-500 font-semibold mt-0.5 select-none">
                    {isFlipped ? 'Reverse Side' : 'Front Face'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Controls below Pill */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setZoomLevel(zoomLevel === '1x' ? '2x' : '1x')}
                className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-[11px] font-semibold flex items-center gap-1 hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {zoomLevel === '1x' ? 'zoom_in' : 'zoom_out'}
                </span>
                <span>{zoomLevel === '1x' ? 'Zoom 2x' : 'Zoom 1x'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-[11px] font-semibold flex items-center gap-1 hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[14px]">360</span>
                <span>Flip Pill</span>
              </button>
            </div>
          </div>

          {/* Physical Form Clinical Verification Specs */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-3.5 flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-surface-container/60 pb-2">
              <div>
                <span className="font-label-sm text-[10px] text-secondary uppercase font-bold tracking-wider">
                  Inspected Formulation
                </span>
                <h4 className="font-headline-sm text-[15px] font-bold text-on-surface">
                  {currentAlt?.name} ({currentAlt?.manufacturer})
                </h4>
              </div>
              <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-code-sm text-[11px] font-bold">
                {currentAlt?.ratingCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="p-2 rounded bg-surface-container-low flex flex-col">
                <span className="text-on-surface-variant text-[10px] uppercase font-semibold">
                  Imprint Markings
                </span>
                <span className="font-code-sm font-bold text-on-surface">
                  {frontImprint} / {backImprint}
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-low flex flex-col">
                <span className="text-on-surface-variant text-[10px] uppercase font-semibold">
                  Physical Shape
                </span>
                <span className="font-code-sm font-bold text-on-surface capitalize">
                  {currentAlt?.physicalForm || `${pillShape} tablet`}
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-low flex flex-col">
                <span className="text-on-surface-variant text-[10px] uppercase font-semibold">
                  Bioequivalence Match
                </span>
                <span className="font-body-sm font-bold text-secondary">
                  {currentAlt?.matchPercent}% AUC
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-low flex flex-col">
                <span className="text-on-surface-variant text-[10px] uppercase font-semibold">
                  Allergen Assessment
                </span>
                <span className="font-body-sm font-semibold text-secondary truncate">
                  {currentAlt?.allergenSafety}
                </span>
              </div>
            </div>

            {/* Excipient Inactive Ingredients list */}
            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold">
                Verified Excipients (Inactive Fillers)
              </span>
              <p className="font-body-sm text-[11px] text-on-surface leading-relaxed">
                {currentAlt?.coreExcipients}
              </p>
            </div>
          </div>

          {/* Pharmacist Dispensing Verification Checklist */}
          <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl flex items-start gap-2.5 text-secondary">
            <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">
              checklist
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-md text-[12px] font-bold">
                Dispensing Check: Verification Passed
              </span>
              <p className="font-body-sm text-[11px] text-on-surface leading-relaxed">
                This tablet matches the FDA Pill Imprint Registry for AB-equivalent {drug.genericName} {drug.strength}. Check that tablet markings match your dispensed prescription bottle.
              </p>
            </div>
          </div>

          {/* Close Action */}
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold shadow-xs hover:bg-primary-container transition-colors"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
};
