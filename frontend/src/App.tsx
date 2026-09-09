/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, Pharmacy, TrackedRegimen, DrugProfile, GenericAlternative, ThemeMode } from './types';
import { useApi } from './hooks/useApi';
import { fetchAllDrugs } from './api/drugs';
import { fetchPharmacies } from './api/pharmacies';
import { fetchRegimens, fetchLedger } from './api/regimens';
import { fetchAuthStatus, fetchCurrentUser, signOut, AuthUser } from './api/auth';
import { THEME_OPTIONS } from './data/themeOptions';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SearchScreen } from './components/SearchScreen';
import { CompareScreen } from './components/CompareScreen';
import { PharmaciesScreen } from './components/PharmaciesScreen';
import { SavedRxScreen } from './components/SavedRxScreen';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { VoucherModal } from './components/VoucherModal';
import { HoldLockModal } from './components/HoldLockModal';
import { LocationModal } from './components/LocationModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SavingsHistoryModal } from './components/SavingsHistoryModal';
import { PillVisualizerModal } from './components/PillVisualizerModal';
import { ThemeModal } from './components/ThemeModal';
import { ToastContainer, ToastData } from './components/Toast';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorBoundary, ErrorFallback } from './components/ErrorBoundary';
import { InstallPrompt } from './components/InstallPrompt';

export default function App() {
  // ── API data fetching ───────────────────────────────────────────
  const { data: allDrugs, loading: drugsLoading, error: drugsError, refetch: refetchDrugs } = useApi(fetchAllDrugs);
  const { data: allPharmacies, loading: pharmaciesLoading, error: pharmaciesError } = useApi(fetchPharmacies);
  const { data: allRegimens, loading: regimensLoading } = useApi(fetchRegimens);
  const { data: allLedger, loading: ledgerLoading } = useApi(fetchLedger);
  const { data: authStatus } = useApi(fetchAuthStatus);

  // Suppress unused-variable warnings for loading states not yet consumed in UI
  void regimensLoading;
  void ledgerLoading;

  const isInitialLoading = drugsLoading || pharmaciesLoading;

  // ── Navigation & selection state ───────────────────────────────
  const [currentTab, setCurrentTab] = useState<NavTab>('search');
  const [currentLocation, setCurrentLocation] = useState('Austin, TX (3.2 mi)');
  const [activeDrug, setActiveDrug] = useState<DrugProfile | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [selectedRegimen, setSelectedRegimen] = useState<TrackedRegimen | null>(null);
  const [selectedAlternativeForPill, setSelectedAlternativeForPill] = useState<GenericAlternative | undefined>(undefined);

  // ── Theme state with localStorage persistence ──────────────────
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('lowbest-theme') as ThemeMode;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) return saved;
    } catch { /* ignore */ }
    return 'clinical-teal';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply theme to document root and manage dark mode class
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', currentTheme);
      const isDark = currentTheme === 'midnight-dark' || currentTheme === 'obsidian-emerald';
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('lowbest-theme', currentTheme);
    } catch { /* ignore */ }
  }, [currentTheme]);

  const activeThemeObj = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];
  const isDarkMode = activeThemeObj.isDark;

  const handleToggleDarkMode = () => {
    if (isDarkMode) {
      setCurrentTheme('clinical-teal');
      showToast('Switched to Clinical Teal Light theme', 'info', 'light_mode');
    } else {
      setCurrentTheme('midnight-dark');
      showToast('Switched to Midnight Slate Dark theme', 'info', 'dark_mode');
    }
  };

  // ── Auth state ─────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Attempt to load the current session on mount (non-blocking)
  useEffect(() => {
    if (!authStatus?.configured) return;
    fetchCurrentUser()
      .then(({ user }) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, [authStatus?.configured]);

  const handleSignIn = () => {
    window.location.assign('/api/auth/login');
  };

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setCurrentUser(null);
      showToast('Signed out successfully', 'info', 'logout');
    } catch {
      showToast('Sign-out failed. Please try again.', 'warning', 'error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Set initial selections once data arrives ───────────────────
  useEffect(() => {
    if (allDrugs && allDrugs.length > 0 && !activeDrug) {
      setActiveDrug(allDrugs[0]);
    }
  }, [allDrugs, activeDrug]);

  useEffect(() => {
    if (allPharmacies && allPharmacies.length > 0 && !selectedPharmacy) {
      setSelectedPharmacy(allPharmacies[0]);
    }
  }, [allPharmacies, selectedPharmacy]);

  // ── Modal state ────────────────────────────────────────────────
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isHoldLockOpen, setIsHoldLockOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSavingsHistoryOpen, setIsSavingsHistoryOpen] = useState(false);
  const [isPillModalOpen, setIsPillModalOpen] = useState(false);

  // ── Toast notifications ────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success', icon?: string) => {
    const newToast: ToastData = {
      id: `toast-${Date.now()}-${Math.random()}`,
      message,
      type,
      icon,
    };
    setToasts((prev) => [...prev.slice(-2), newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Cross-screen handlers ──────────────────────────────────────
  const handleNotificationAction = (type: string) => {
    if (type === 'price') setCurrentTab('compare');
    else if (type === 'refill') setCurrentTab('saved-rx');
    else if (type === 'stock') setCurrentTab('pharmacies');
  };

  const handleScanSuccess = (scannedDrugName: string) => {
    const drugs = allDrugs || [];
    const matched = drugs.find(
      (d) =>
        d.genericName.toLowerCase().includes(scannedDrugName.toLowerCase()) ||
        scannedDrugName.toLowerCase().includes(d.genericName.toLowerCase())
    );
    if (matched) {
      setActiveDrug(matched);
      showToast(`Scanned and matched ${matched.genericName}`, 'success', 'qr_code_scanner');
    } else {
      showToast(`Matched generic profile for ${scannedDrugName}`, 'info', 'medication');
    }
    setCurrentTab('compare');
  };

  const handleHoldLockPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsHoldLockOpen(true);
  };

  const handleHoldLockSuccess = (code: string) => {
    if (!selectedPharmacy) return;
    showToast(`Rate locked for 4h at ${selectedPharmacy.name} (PIN: ${code})`, 'success', 'lock');
  };

  const handleOpenSavingsHistory = (regimen: TrackedRegimen) => {
    setSelectedRegimen(regimen);
    setIsSavingsHistoryOpen(true);
  };

  const handleSelectDrug = (drug: DrugProfile) => {
    setActiveDrug(drug);
  };

  const handleOpenPillModal = (alt?: GenericAlternative) => {
    setSelectedAlternativeForPill(alt);
    setIsPillModalOpen(true);
  };

  // ── Derived data ───────────────────────────────────────────────
  const drugs = allDrugs || [];
  const pharmacies = allPharmacies || [];
  const regimens = allRegimens || [];
  const ledger = allLedger || [];

  // ── Loading state ──────────────────────────────────────────────
  if (isInitialLoading) return <LoadingSkeleton />;

  // ── Error state ────────────────────────────────────────────────
  if (drugsError || pharmaciesError) {
    return (
      <ErrorFallback
        error={drugsError || pharmaciesError}
        onRetry={refetchDrugs}
      />
    );
  }

  // ── Guard: wait for initial selections ─────────────────────────
  if (!activeDrug || !selectedPharmacy) return <LoadingSkeleton />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-surface font-sans text-on-surface selection:bg-secondary/20 selection:text-secondary">
        {/* Toast Alert Engine */}
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

        {/* App-install PWA prompt */}
        <InstallPrompt onShowToast={showToast} />

        {/* Persistent Global Header */}
        <Header
          currentLocation={currentLocation}
          onOpenLocation={() => setIsLocationModalOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onToggleDarkMode={handleToggleDarkMode}
          isDarkMode={isDarkMode}
          currentThemeName={activeThemeObj.name}
          isAuthenticationAvailable={authStatus?.configured ?? false}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          currentUser={currentUser}
          unreadCount={2}
        />

        {/* Main Screens Container */}
        <main id="main-content" className="w-full">
          {currentTab === 'search' && (
            <SearchScreen
              drug={activeDrug}
              allDrugs={drugs}
              onSelectDrug={handleSelectDrug}
              pharmacies={pharmacies}
              onNavigateToCompare={() => setCurrentTab('compare')}
              onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
              onNavigateToPharmacies={(pharmacyId) => {
                if (pharmacyId) {
                  const found = pharmacies.find((p) => p.id === pharmacyId);
                  if (found) setSelectedPharmacy(found);
                }
                setCurrentTab('pharmacies');
              }}
              onOpenVoucher={() => setIsVoucherOpen(true)}
              onOpenHoldLock={(pharmacy) => handleHoldLockPharmacy(pharmacy)}
              onOpenPillVisualizer={() => handleOpenPillModal()}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'compare' && (
            <CompareScreen
              drug={activeDrug}
              onNavigateToPharmacies={(pharmacyId) => {
                if (pharmacyId) {
                  const found = pharmacies.find((p) => p.id === pharmacyId);
                  if (found) setSelectedPharmacy(found);
                }
                setCurrentTab('pharmacies');
              }}
              onOpenHoldLock={() => handleHoldLockPharmacy(pharmacies[0])}
              onOpenPillVisualizer={(selectedDrug, alternative) => {
                setActiveDrug(selectedDrug);
                handleOpenPillModal(alternative);
              }}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'pharmacies' && (
            <PharmaciesScreen
              pharmacies={pharmacies}
              currentLocation={currentLocation}
              drug={activeDrug}
              onOpenLocation={() => setIsLocationModalOpen(true)}
              onHoldLock={(pharmacy) => handleHoldLockPharmacy(pharmacy)}
              onShowVoucher={() => setIsVoucherOpen(true)}
              onNavigateToCompare={() => setCurrentTab('compare')}
              selectedPharmacyId={selectedPharmacy.id}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'saved-rx' && (
            <SavedRxScreen
              regimens={regimens}
              ledgerItems={ledger}
              onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
              onReserveRegimen={(regimen) => {
                const matchedPharm =
                  pharmacies.find((p) => p.name.includes(regimen.pharmacyName)) ||
                  pharmacies[0];
                handleHoldLockPharmacy(matchedPharm);
              }}
              onOpenSavingsHistory={handleOpenSavingsHistory}
              onNavigateToSearch={() => setCurrentTab('search')}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Persistent Bottom Tab Navigation */}
        <BottomNav
          activeTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />

        {/* Interactive Modals */}
        <BarcodeScannerModal
          isOpen={isBarcodeScannerOpen}
          onClose={() => setIsBarcodeScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />

        <VoucherModal
          isOpen={isVoucherOpen}
          onClose={() => setIsVoucherOpen(false)}
          pharmacyName={selectedPharmacy?.name || 'Metro Health Community Rx'}
          rate={selectedPharmacy?.cashPrice || 9.20}
          drugName={`${activeDrug.genericName} ${activeDrug.strength}`}
        />

        <HoldLockModal
          isOpen={isHoldLockOpen}
          onClose={() => setIsHoldLockOpen(false)}
          pharmacy={selectedPharmacy}
          onSuccess={handleHoldLockSuccess}
        />

        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={currentLocation}
          onSelectLocation={(loc) => {
            setCurrentLocation(loc);
            showToast(`Location updated to ${loc}`, 'info', 'my_location');
          }}
        />

        <NotificationsDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onSelectAction={handleNotificationAction}
        />

        <SavingsHistoryModal
          isOpen={isSavingsHistoryOpen}
          onClose={() => setIsSavingsHistoryOpen(false)}
          regimen={selectedRegimen}
        />

        <PillVisualizerModal
          isOpen={isPillModalOpen}
          onClose={() => setIsPillModalOpen(false)}
          drug={activeDrug}
          selectedAlternative={selectedAlternativeForPill}
        />

        {/* Floating Theme Quick Switcher Button */}
        <button
          type="button"
          onClick={() => setIsThemeModalOpen(true)}
          className="fixed bottom-20 right-3.5 z-40 px-3 py-2 rounded-full bg-surface-container-lowest text-on-surface border border-surface-container-high shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group backdrop-blur-md"
          aria-label={`Theme: ${activeThemeObj.name}. Click to change.`}
        >
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-surface shadow-xs transition-transform group-hover:rotate-45"
            style={{ backgroundColor: activeThemeObj.accentHex }}
            aria-hidden="true"
          />
          <span className="font-label-sm text-[11px] font-bold tracking-tight text-on-surface hidden sm:inline">
            {activeThemeObj.name}
          </span>
          <span className="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">palette</span>
        </button>

        {/* Color Mode & Theme Studio Modal */}
        <ThemeModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={currentTheme}
          onSelectTheme={(t) => setCurrentTheme(t)}
          onToggleDarkMode={handleToggleDarkMode}
          isDarkMode={isDarkMode}
          onShowToast={showToast}
        />
      </div>
    </ErrorBoundary>
  );
}
