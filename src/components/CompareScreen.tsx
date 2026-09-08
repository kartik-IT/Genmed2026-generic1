import React, { useState, useMemo } from 'react';
import { DrugProfile, GenericAlternative } from '../types';
import { PRESCRIBER_QUESTIONS } from '../data/mockData';

interface CompareScreenProps {
  drug: DrugProfile;
  onNavigateToPharmacies: (pharmacyId?: string) => void;
  onOpenHoldLock?: () => void;
  onOpenPillVisualizer?: (drug: DrugProfile, alt?: GenericAlternative) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', icon?: string) => void;
}

export const CompareScreen: React.FC<CompareScreenProps> = ({
  drug,
  onNavigateToPharmacies,
  onOpenPillVisualizer,
  onShowToast,
}) => {
  const [activeSegmentTab, setActiveSegmentTab] = useState<'quick' | 'pharma' | 'pricing'>('quick');
  const [dispenseHorizon, setDispenseHorizon] = useState<'30' | '90'>('90');
  const [paymentType, setPaymentType] = useState<'cash' | 'copay'>('cash');
  const [copayTier, setCopayTier] = useState<number>(25);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Active generic selection
  const topAlternative = useMemo(() => {
    return (
      drug.alternatives.find((a) => a.isTopPick) ||
      drug.alternatives.find((a) => !a.isBaselineStandard) ||
      drug.alternatives[0]
    );
  }, [drug.alternatives]);

  const [selectedAltId, setSelectedAltId] = useState(topAlternative.id);

  // Sync selected alt when drug changes
  React.useEffect(() => {
    if (topAlternative) {
      setSelectedAltId(topAlternative.id);
    }
  }, [drug.id, topAlternative]);

  const activeSelectedAlt = useMemo(() => {
    return drug.alternatives.find((a) => a.id === selectedAltId) || topAlternative;
  }, [drug.alternatives, selectedAltId, topAlternative]);

  const brandAlt = useMemo(() => {
    return drug.alternatives.find((a) => a.isBaselineStandard) || drug.alternatives[0];
  }, [drug.alternatives]);

  // Pricing calculations
  const is90 = dispenseHorizon === '90';
  const brandPrice = is90 ? (brandAlt?.price90Day || drug.brandReferencePrice * 3) : (brandAlt?.price30Day || drug.brandReferencePrice);
  const genericPrice = is90 ? (activeSelectedAlt?.price90Day || drug.bestGenericRate * 2.8) : (activeSelectedAlt?.price30Day || drug.bestGenericRate);
  const cadenceText = is90 ? 'per 90-day fill' : 'per 30-day fill';

  const monthlySavings = (brandAlt?.price30Day || drug.brandReferencePrice) - (activeSelectedAlt?.price30Day || drug.bestGenericRate);
  const annualSavings = monthlySavings * 12;

  const handleCopyQuestion = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    if (onShowToast) {
      onShowToast('Prescriber question copied to clipboard!', 'success', 'content_copy');
    }
  };

  const handleShare = () => {
    const text = `Save on ${drug.genericName} (${drug.brandName} Equivalent) at $${genericPrice.toFixed(2)} (${cadenceText}). FDA AB Bioequivalent match verified.`;
    if (navigator.share) {
      navigator.share({
        title: `${drug.genericName} Generic Savings Pass`,
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${text} ${window.location.href}`);
      }
      if (onShowToast) {
        onShowToast('Comparison link copied to clipboard!', 'success', 'share');
      }
    }
  };

  const handleBookmarkToggle = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    if (onShowToast) {
      onShowToast(
        next ? `Bookmarked ${drug.genericName} comparison` : 'Removed comparison bookmark',
        'info',
        next ? 'bookmark_added' : 'bookmark_remove'
      );
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-16 animate-fadeIn">
      {/* Top Prescription Header Context */}
      <section className="px-3 pt-3 pb-2">
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-surface-container text-on-surface-variant font-code-sm text-[12px] px-2 py-0.5 rounded font-semibold">
                Rx# {drug.rxNumber}
              </span>
              <span className="bg-secondary-container text-on-secondary-container font-label-sm text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {drug.genericEquivalenceCode} Bioequivalent
              </span>
            </div>
            <button
              onClick={handleBookmarkToggle}
              aria-label="Save comparison"
              type="button"
              className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:text-secondary hover:bg-surface-container transition-colors"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <h1 className="font-headline-lg-mobile text-[22px] font-bold text-on-surface tracking-tight">
                {drug.genericName}
              </h1>
              <span className="font-label-md text-[14px] font-bold text-secondary">
                {drug.strength}
              </span>
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
              Comparing Brand <strong className="font-bold text-on-surface">{drug.brandName}</strong> vs {drug.alternatives.length} FDA Approved Generics
            </p>
          </div>

          {/* Segmented Navigation Tabs */}
          <div className="flex p-0.5 bg-surface-container-low rounded-lg text-center" role="tablist">
            <button
              onClick={() => setActiveSegmentTab('quick')}
              type="button"
              className={`flex-1 py-1.5 px-2 rounded font-label-sm text-[12px] transition-all ${
                activeSegmentTab === 'quick'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              Quick Compare
            </button>
            <button
              onClick={() => setActiveSegmentTab('pharma')}
              type="button"
              className={`flex-1 py-1.5 px-2 rounded font-label-sm text-[12px] transition-all ${
                activeSegmentTab === 'pharma'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              Pharmacology
            </button>
            <button
              onClick={() => setActiveSegmentTab('pricing')}
              type="button"
              className={`flex-1 py-1.5 px-2 rounded font-label-sm text-[12px] transition-all ${
                activeSegmentTab === 'pricing'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              Price Breakdown
            </button>
          </div>
        </div>
      </section>

      {/* QUICK COMPARE VIEW */}
      {activeSegmentTab === 'quick' && (
        <>
          {/* Interactive Savings Calculator Card */}
          <section className="px-3 py-1">
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">savings</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-[15px] font-bold text-on-surface leading-tight">
                      Patient Savings Projection
                    </h2>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">
                      Real-time out-of-pocket delta
                    </p>
                  </div>
                </div>

                {/* Insurance vs Cash Toggle */}
                <div className="flex bg-surface-container-high rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setPaymentType('cash')}
                    className={`px-2.5 py-1 rounded font-label-sm text-[11px] font-semibold transition-all ${
                      paymentType === 'cash'
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('copay')}
                    className={`px-2.5 py-1 rounded font-label-sm text-[11px] font-semibold transition-all ${
                      paymentType === 'copay'
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Co-pay
                  </button>
                </div>
              </div>

              {/* Co-pay tier selector when Co-pay is active */}
              {paymentType === 'copay' && (
                <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-lg border border-surface-container">
                  <span className="text-[11px] font-semibold text-on-surface-variant">Insurance Co-pay Tier:</span>
                  <div className="flex items-center gap-1.5">
                    {[15, 25, 40, 60].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setCopayTier(tier)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                          copayTier === tier
                            ? 'bg-secondary text-on-secondary shadow-xs'
                            : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        ${tier}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pill Duration Switcher */}
              <div className="flex items-center justify-between bg-surface-container-low p-1.5 rounded-lg">
                <span className="font-label-sm text-[11px] text-on-surface-variant pl-1.5 font-medium">
                  Dispense Horizon:
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setDispenseHorizon('30')}
                    className={`px-3 py-1 rounded font-label-sm text-[11px] transition-all font-medium ${
                      dispenseHorizon === '30'
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispenseHorizon('90')}
                    className={`px-3 py-1 rounded font-label-sm text-[11px] transition-all font-medium ${
                      dispenseHorizon === '90'
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    90 Days (Best Value)
                  </button>
                </div>
              </div>

              {/* Visual Metric Comparison */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="bg-surface-container-low rounded-lg p-3 flex flex-col justify-between border border-surface-container/40">
                  <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                    Brand ({drug.brandName})
                  </span>
                  <div className="mt-1">
                    <div className="font-headline-md text-[18px] text-on-surface line-through opacity-75 font-bold">
                      ${brandPrice.toFixed(2)}
                    </div>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      {cadenceText}
                    </span>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden border border-secondary/20">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-[11px] text-secondary font-bold truncate">
                      {activeSelectedAlt.name}
                    </span>
                    <span className="material-symbols-outlined text-secondary text-[16px] flex-shrink-0">
                      verified_user
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="font-headline-md text-[20px] text-secondary font-extrabold">
                      ${genericPrice.toFixed(2)}
                    </div>
                    <span className="font-body-sm text-[11px] text-secondary font-semibold">
                      {cadenceText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Wallet Highlight Banner */}
              <div className="bg-surface-container-high rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    trending_down
                  </span>
                  <div>
                    <span className="font-label-sm text-[11px] text-on-surface-variant block">
                      Net Annual Pocket Savings
                    </span>
                    <span className="font-headline-sm text-[15px] text-on-surface font-bold">
                      Save ${annualSavings.toFixed(2)} / year
                    </span>
                  </div>
                </div>
                <span className="bg-secondary text-on-secondary font-code-sm text-[11px] px-2 py-1 rounded font-bold">
                  {Math.round(((brandPrice - genericPrice) / brandPrice) * 100)}% Cheaper
                </span>
              </div>
            </div>
          </section>

          {/* Side-by-Side Bioequivalence Cards (Horizontal Scroll Gallery) */}
          <section className="py-2">
            <div className="px-3 flex items-center justify-between mb-1.5">
              <div>
                <h2 className="font-headline-sm text-[15px] font-bold text-on-surface">
                  Bioequivalence Comparison
                </h2>
                <p className="font-label-sm text-[11px] text-on-surface-variant">
                  Swipe across FDA Approved Therapeutics
                </p>
              </div>
              <span className="font-code-sm text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded font-bold">
                {drug.alternatives.length} Formulations
              </span>
            </div>

            {/* Horizontal Swipe Deck */}
            <div className="flex gap-2.5 overflow-x-auto px-3 snap-x snap-mandatory py-1 no-scrollbar">
              {drug.alternatives.map((alt) => {
                const isSelected = selectedAltId === alt.id;
                const altPrice = is90 ? alt.price90Day : alt.price30Day;

                return (
                  <div
                    key={alt.id}
                    className={`w-[285px] flex-shrink-0 snap-start bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-between relative overflow-hidden transition-all ${
                      isSelected
                        ? 'shadow-md ring-2 ring-secondary'
                        : 'shadow-xs border border-surface-container'
                    }`}
                  >
                    {alt.isTopPick && (
                      <div className="absolute top-0 right-0">
                        <span className="bg-secondary text-on-secondary font-label-sm text-[11px] px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">star</span> Top Pick
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-code-sm text-[11px] px-2 py-0.5 rounded font-semibold uppercase ${
                            alt.isBaselineStandard
                              ? 'bg-surface-container text-on-surface-variant'
                              : 'bg-secondary-container text-on-secondary-container font-bold'
                          }`}
                        >
                          {alt.ratingCode}
                        </span>
                        <span className="font-code-sm text-[11px] text-secondary font-bold">
                          {alt.matchPercent}% Match
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <h3 className="font-headline-md text-[18px] font-bold text-on-surface truncate">
                          {alt.name}
                        </h3>
                        <p className="font-body-sm text-[12px] text-on-surface-variant truncate">
                          {alt.manufacturer}
                        </p>
                      </div>

                      <div className="mt-3 p-2 bg-surface-container-low rounded-lg">
                        <div className="flex justify-between items-baseline">
                          <span className="font-label-sm text-[11px] text-on-surface-variant">
                            {dispenseHorizon}-Day Rate
                          </span>
                          <div className="text-right">
                            <span className={`font-headline-sm text-[16px] font-extrabold ${alt.isBaselineStandard ? 'text-on-surface' : 'text-secondary'}`}>
                              ${altPrice.toFixed(2)}
                            </span>
                            {!alt.isBaselineStandard && (
                              <span className="font-label-sm text-[10px] text-secondary block font-bold">
                                Save ${(brandPrice - altPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-baseline mt-1 text-on-surface-variant">
                          <span className="font-label-sm text-[11px]">Equivalence</span>
                          <span className="font-code-sm text-[11px] font-bold text-on-surface">
                            {alt.equivalenceText}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                            medication
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase">
                              Physical Form
                            </span>
                            <span className="font-body-sm text-[12px] text-on-surface line-clamp-2">
                              {alt.physicalForm}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                            science
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase">
                              Bioavailability &amp; AUC
                            </span>
                            <span className="font-body-sm text-[12px] text-on-surface line-clamp-2">
                              {alt.bioavailability} ({alt.pharmacokineticsAUC}% AUC)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">
                            verified
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase">
                              Allergen Safety
                            </span>
                            <span className="font-body-sm text-[12px] text-on-surface truncate">
                              {alt.allergenSafety}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-1 flex flex-col gap-1.5">
                      {onOpenPillVisualizer && (
                        <button
                          type="button"
                          onClick={() => onOpenPillVisualizer(drug, alt)}
                          className="w-full py-1.5 text-xs text-secondary font-semibold bg-secondary-container/30 hover:bg-secondary-container/50 rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          Inspect Physical Pill Imprint
                        </button>
                      )}
                      {!alt.isBaselineStandard ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAltId(alt.id);
                            if (onShowToast) onShowToast(`Selected ${alt.name} (${alt.manufacturer})`, 'success', 'check_circle');
                          }}
                          className={`w-full py-2 px-3 rounded-lg font-label-md text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-secondary text-on-secondary shadow-xs'
                              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <span>{isSelected ? 'Selected Formulation ✓' : `Select ${alt.name}`}</span>
                        </button>
                      ) : (
                        <span className="block text-center font-label-sm text-[12px] text-on-surface-variant py-2 bg-surface-container rounded font-medium">
                          Baseline Reference Standard
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Clinical Laboratory & Bioequivalence AUC Visualization */}
          <section className="px-3 py-1">
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-[15px] font-bold text-on-surface">
                    Pharmacokinetic Match (AUC)
                  </h2>
                  <p className="font-label-sm text-[11px] text-on-surface-variant">
                    FDA 90% Bioequivalence Confidence Interval Bounds
                  </p>
                </div>
                <span className="material-symbols-outlined text-secondary text-[22px]">ssid_chart</span>
              </div>

              {/* AUC Visualization Card */}
              <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-on-surface-variant font-code-sm text-[11px]">
                  <span>80% Min Threshold</span>
                  <span className="text-secondary font-bold">100% Target Reference</span>
                  <span>125% Max Threshold</span>
                </div>

                {/* Custom Visual Track Bar */}
                <div className="relative w-full h-7 bg-surface-container rounded-md flex items-center px-1">
                  {/* Allowed FDA Safe Window */}
                  <div className="absolute left-[15%] right-[15%] h-5 bg-secondary-container/50 rounded flex items-center justify-center">
                    <span className="font-code-sm text-[9px] text-secondary uppercase tracking-widest font-extrabold">
                      FDA Equivalent Zone (80 - 125%)
                    </span>
                  </div>
                  {/* Active Selected Alt Marker */}
                  <div
                    className="absolute left-[50.2%] -translate-x-1/2 w-4 h-4 bg-secondary rounded-full flex items-center justify-center shadow-md z-10"
                    title={`${activeSelectedAlt.name}: ${activeSelectedAlt.pharmacokineticsAUC}% AUC`}
                  >
                    <div className="w-1.5 h-1.5 bg-surface rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[11px] pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span>
                      {activeSelectedAlt.name}: <strong className="text-on-surface">{activeSelectedAlt.pharmacokineticsAUC}% AUC Match</strong>
                    </span>
                  </div>
                  <span className="text-[10px] bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-bold">
                    FDA AB Approved
                  </span>
                </div>
              </div>

              {/* Mandatory Medical Disclosure */}
              <div className="flex gap-2 p-2.5 bg-surface-container-high rounded-lg text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5">
                  verified_user
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-[11px] font-bold">
                    Therapeutic Equivalence Standard
                  </span>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                    {drug.genericName} is affirmed by the FDA as bioequivalent to {drug.brandName}. Generic formulations deliver indistinguishable clinical bioavailability and active moiety delivery.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Doctor Question Helper */}
          <section className="px-3 py-2 pb-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-surface-container text-on-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">forum</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-[15px] font-bold text-on-surface">
                      Prescriber Discussion Guide
                    </h2>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">
                      Tap any question to copy for doctor or portal
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                {PRESCRIBER_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleCopyQuestion(q.fullText)}
                    type="button"
                    className="text-left p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-all flex items-center justify-between group border border-surface-container/50"
                  >
                    <span className="font-body-sm text-[12px] font-medium leading-relaxed">
                      {q.display}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-secondary ml-2 flex-shrink-0">
                      content_copy
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* PHARMACOLOGY VIEW */}
      {activeSegmentTab === 'pharma' && (
        <section className="px-3 py-2 flex flex-col gap-3">
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3">
            <h2 className="font-headline-sm text-[16px] font-bold text-on-surface">
              FDA Pharmacological Comparison
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface-container-low p-2.5 rounded-lg">
                <span className="text-on-surface-variant font-medium block">Therapeutic Class</span>
                <span className="font-bold text-on-surface mt-0.5 block">{drug.therapeuticClass}</span>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-lg">
                <span className="text-on-surface-variant font-medium block">Therapeutic Index</span>
                <span className="font-bold text-on-surface mt-0.5 block">{drug.therapeuticIndex}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-xs font-bold text-secondary uppercase tracking-wide">
                Active Moiety &amp; Mechanism
              </span>
              <p className="text-xs text-on-surface leading-relaxed">
                {drug.therapeuticDescription}
              </p>
            </div>

            <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-on-surface">Excipients &amp; Inactive Ingredients</span>
              <div className="space-y-1.5 text-xs text-on-surface-variant">
                {drug.alternatives.map((alt) => (
                  <div key={alt.id} className="border-b border-surface-container pb-1.5 last:border-0">
                    <span className="font-bold text-on-surface">{alt.name} ({alt.manufacturer}):</span>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{alt.coreExcipients}</p>
                    <span className="text-[10px] text-secondary font-semibold">{alt.allergenSafety}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-high/60 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-error">warning</span>
                Clinical Considerations &amp; Safety Notice
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {drug.cypNotice}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PRICING BREAKDOWN VIEW */}
      {activeSegmentTab === 'pricing' && (
        <section className="px-3 py-2 flex flex-col gap-3">
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col gap-3">
            <h2 className="font-headline-sm text-[16px] font-bold text-on-surface">
              Comprehensive Price Architecture
            </h2>
            <p className="text-xs text-on-surface-variant">
              Audited retail cash benchmarks vs Low &amp; Best verified local adjudication rates.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-container text-on-surface-variant">
                    <th className="pb-2 font-semibold">Formulation</th>
                    <th className="pb-2 font-semibold">30-Day</th>
                    <th className="pb-2 font-semibold">90-Day</th>
                    <th className="pb-2 font-semibold text-right">Annual Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  {drug.alternatives.map((alt) => (
                    <tr key={alt.id} className="py-2">
                      <td className="py-2.5 pr-2">
                        <span className="font-bold text-on-surface block">{alt.name}</span>
                        <span className="text-[10px] text-on-surface-variant">{alt.manufacturer}</span>
                      </td>
                      <td className="py-2.5 font-semibold text-on-surface">
                        ${alt.price30Day.toFixed(2)}
                      </td>
                      <td className="py-2.5 font-semibold text-on-surface">
                        ${alt.price90Day.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-secondary">
                        {alt.isBaselineStandard ? 'Baseline' : `+$${alt.savingsAnnual.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-secondary-container/40 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-on-secondary-container block">
                  Best 90-Day Volume Advantage
                </span>
                <span className="text-xs text-on-surface">
                  Switching from 30 to 90 days unlocks additional wholesale pack discounts.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDispenseHorizon('90');
                  setActiveSegmentTab('quick');
                  if (onShowToast) onShowToast('Switched to 90-Day horizon', 'success', 'check');
                }}
                className="px-3 py-1.5 bg-secondary text-on-secondary text-xs font-bold rounded-lg whitespace-nowrap"
              >
                Apply 90-Day
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Sticky Bottom Floating Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 pt-1 bg-surface/90 backdrop-blur-md max-w-xl mx-auto border-t border-surface-container/40">
        <div className="bg-primary-container text-on-primary rounded-xl shadow-xl p-3 flex items-center justify-between gap-3">
          <div className="min-w-0 pl-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
              <span className="font-label-sm text-[11px] text-primary-fixed-dim uppercase tracking-wider font-bold truncate">
                {activeSelectedAlt.name} Chosen
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-[16px] font-extrabold text-on-primary">
                ${genericPrice.toFixed(2)}
              </span>
              <span className="font-label-sm text-[11px] text-on-primary-container font-medium">
                / {dispenseHorizon} days
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              aria-label="Share Rx Details"
              type="button"
              className="w-10 h-10 rounded-lg bg-surface-container-highest/20 hover:bg-surface-container-highest/30 text-on-primary flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            <button
              onClick={() => onNavigateToPharmacies()}
              type="button"
              className="h-10 px-4 bg-secondary text-on-secondary rounded-lg font-label-md text-[13px] font-bold flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-transform hover:opacity-95"
            >
              <span>Find Pharmacies</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
