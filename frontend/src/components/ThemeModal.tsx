import React from 'react';
import { ThemeMode } from '../types';
import { THEME_OPTIONS } from '../data/themeOptions';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', icon?: string) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  onToggleDarkMode,
  isDarkMode,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const activeThemeObj =
    THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  const handleSelect = (themeId: ThemeMode, themeName: string) => {
    onSelectTheme(themeId);
    if (onShowToast) {
      onShowToast(`Theme changed to ${themeName}`, 'success', 'palette');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface-container-lowest text-on-surface rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Palette Icon & Quick Dark Toggle */}
        <div className="px-5 py-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">palette</span>
            </span>
            <div>
              <h2 className="font-headline-sm text-[16px] font-extrabold leading-tight">
                Color Modes &amp; Theme Studio
              </h2>
              <p className="font-label-sm text-[11px] text-on-surface-variant">
                Select your preferred visual aesthetic &amp; contrast balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`px-2.5 py-1.5 rounded-lg font-label-sm text-[11px] font-bold flex items-center gap-1 border transition-all ${
                isDarkMode
                  ? 'bg-secondary text-on-secondary border-secondary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-variant border-surface-container-high'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Close theme modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Active Theme Preview Card */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-surface shadow-xs"
                  style={{ backgroundColor: activeThemeObj.accentHex }}
                />
                <span className="font-headline-sm text-[14px] font-bold text-on-surface">
                  Active: {activeThemeObj.name}
                </span>
              </div>
              <span className="font-code-sm text-[10px] px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-extrabold uppercase">
                {activeThemeObj.badgeTag}
              </span>
            </div>

            <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
              {activeThemeObj.tagline}
            </p>

            {/* Interactive Component Sample in active theme */}
            <div className="mt-1 p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">medication</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-[12px] font-bold text-on-surface truncate">
                    Atorvastatin Calcium
                  </span>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold">
                    FDA AB • 99.4% Bio-Matched
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-headline-sm text-[14px] font-extrabold text-secondary">
                  $9.20
                </span>
                <span className="text-[10px] block text-on-surface-variant line-through">
                  $142.80
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Grid Selector */}
        <div className="p-5 pt-2 overflow-y-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-[11px] px-1">
            <span className="font-semibold uppercase tracking-wider">
              Select Curated Palette ({THEME_OPTIONS.length})
            </span>
            <span>Tap to apply instantly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelect(theme.id, theme.name)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all relative cursor-pointer group ${
                    isSelected
                      ? 'bg-surface-container border-secondary ring-2 ring-secondary/50 shadow-md'
                      : 'bg-surface-container-lowest border-surface-container hover:border-secondary/40 hover:bg-surface-container-low shadow-xs'
                  }`}
                >
                  {/* Top row: Color Swatches & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Swatch 1: Accent */}
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shadow-xs flex items-center justify-center"
                        style={{ backgroundColor: theme.accentHex }}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[13px] text-white font-bold">
                            check
                          </span>
                        )}
                      </span>
                      {/* Swatch 2: Container Secondary */}
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: theme.secondaryHex }}
                      />
                      {/* Swatch 3: Surface Tone */}
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shadow-xs"
                        style={{ backgroundColor: theme.surfaceHex }}
                      />
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        theme.isDark
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {theme.badgeTag}
                    </span>
                  </div>

                  {/* Theme Info */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-headline-sm text-[13px] font-bold text-on-surface truncate">
                        {theme.name}
                      </span>
                      {theme.isDark && (
                        <span className="material-symbols-outlined text-[13px] text-on-surface-variant">
                          dark_mode
                        </span>
                      )}
                    </div>
                    <span className="font-body-sm text-[11px] text-on-surface-variant line-clamp-1">
                      {theme.subtitle}
                    </span>
                  </div>

                  {/* Selection Indicator Bar */}
                  <div
                    className={`h-1 w-full rounded-full transition-all ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`}
                    style={{ backgroundColor: theme.accentHex }}
                  />
                </button>
              );
            })}
          </div>

          {/* Meaningful Medical Design Notes */}
          <div className="mt-2 p-3 rounded-xl bg-surface-container-low border border-surface-container/60 flex items-start gap-2.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5">
              auto_awesome
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-md text-[12px] font-bold text-on-surface">
                Meaningful Color Accessibility
              </span>
              <p className="font-body-sm text-[11px] leading-relaxed">
                All themes maintain WCAG 2.1 AA compliant contrast ratios (minimum 4.5:1) for critical clinical drug dosages, FDA bioequivalence indicators, and pharmacy cash rates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Done button */}
        <div className="px-5 py-3 bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleSelect('clinical-teal', 'Clinical Teal')}
            className="text-secondary font-label-sm text-[12px] font-bold hover:underline"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-primary text-on-primary font-label-md text-[12px] font-bold shadow-xs hover:opacity-95 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
