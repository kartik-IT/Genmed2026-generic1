import React, { useEffect, useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (location: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
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

  const locations = [
    { name: 'Austin, TX (3.2 mi)', sub: 'South Congress & Downtown Medical District' },
    { name: 'Austin, TX (0.8 mi)', sub: 'Downtown Austin • E 7th St' },
    { name: 'Austin, TX (1.2 mi)', sub: 'West Campus & University Medical' },
    { name: 'Austin, TX (4.5 mi)', sub: 'The Domain & North Austin Hub' },
    { name: 'Round Rock, TX (12.4 mi)', sub: 'Williamson County Regional Health' },
  ];

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
        aria-label="Change dispensing radius"
        className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-surface-container flex flex-col"
      >
        <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]" aria-hidden="true">
              location_on
            </span>
            <span className="font-headline-sm text-[15px] font-bold text-on-surface">
              Change Dispensing Radius
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close location picker"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <ul className="p-3 flex flex-col gap-2" role="listbox" aria-label="Select location">
          {locations.map((loc) => {
            const isSelected = currentLocation === loc.name;
            return (
              <li key={loc.name} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => { onSelectLocation(loc.name); onClose(); }}
                  className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-all border ${
                    isSelected
                      ? 'bg-secondary-container/40 border-secondary text-on-surface'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <div>
                    <span className="font-label-md text-[13px] font-bold block">{loc.name}</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">{loc.sub}</span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-secondary text-[20px]" aria-hidden="true">
                      check_circle
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
