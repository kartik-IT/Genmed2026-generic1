/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, Pharmacy, TrackedRegimen, DrugProfile, GenericAlternative, ThemeMode } from './types';
import {
  MOCK_DRUGS,
  MOCK_PHARMACIES,
  MOCK_REGIMENS,
  MOCK_LEDGER,
} from './data/mockData';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('search');
  const [currentLocation, setCurrentLocation] = useState('Austin, TX (3.2 mi)');
  const [activeDrug, setActiveDrug] = useState<DrugProfile>(MOCK_DRUGS[0]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy>(MOCK_PHARMACIES[0]);
  const [selectedRegimen, setSelectedRegimen] = useState<TrackedRegimen | null>(null);
  const [selectedAlternativeForPill, setSelectedAlternativeForPill] = useState<GenericAlternative | undefined>(undefined);

  // Theme state with localStorage persistence
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('lowbest-theme') as ThemeMode;
      if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'clinical-teal';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply theme to document root and manage dark mode class
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', currentTheme);
      const isDark = currentTheme === 'midnight-dark' || currentTheme === 'obsidian-emerald';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('lowbest-theme', currentTheme);
    } catch {
      // Ignore
    }
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

  // Modals state
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isHoldLockOpen, setIsHoldLockOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSavingsHistoryOpen, setIsSavingsHistoryOpen] = useState(false);
  const [isPillModalOpen, setIsPillModalOpen] = useState(false);

  // Dynamic Toast Notifications
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

  // Notification action handler
  const handleNotificationAction = (type: string) => {
    if (type === 'price') {
      setCurrentTab('compare');
    } else if (type === 'refill') {
      setCurrentTab('saved-rx');
    } else if (type === 'stock') {
      setCurrentTab('pharmacies');
    }
  };

  // Barcode scan outcome handler
  const handleScanSuccess = (scannedDrugName: string) => {
    const matched = MOCK_DRUGS.find((d) =>
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

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface selection:bg-secondary/20 selection:text-secondary">
      {/* Toast Alert Engine */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Persistent Global Header */}
      <Header
        currentLocation={currentLocation}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onToggleDarkMode={handleToggleDarkMode}
        isDarkMode={isDarkMode}
        currentThemeName={activeThemeObj.name}
        unreadCount={2}
      />

      {/* Main Screens Container */}
      <main className="w-full">
        {currentTab === 'search' && (
          <SearchScreen
            drug={activeDrug}
            allDrugs={MOCK_DRUGS}
            onSelectDrug={handleSelectDrug}
            onNavigateToCompare={() => setCurrentTab('compare')}
            onNavigateToPharmacies={(pharmacyId) => {
              if (pharmacyId) {
                const found = MOCK_PHARMACIES.find((p) => p.id === pharmacyId);
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
                const found = MOCK_PHARMACIES.find((p) => p.id === pharmacyId);
                if (found) setSelectedPharmacy(found);
              }
              setCurrentTab('pharmacies');
            }}
            onOpenHoldLock={() => handleHoldLockPharmacy(MOCK_PHARMACIES[0])}
            onOpenPillVisualizer={handleOpenPillModal}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'pharmacies' && (
          <PharmaciesScreen
            pharmacies={MOCK_PHARMACIES}
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
            regimens={MOCK_REGIMENS}
            ledgerItems={MOCK_LEDGER}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onReserveRegimen={(regimen) => {
              const matchedPharm =
                MOCK_PHARMACIES.find((p) => p.name.includes(regimen.pharmacyName)) ||
                MOCK_PHARMACIES[0];
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
        savedCount={MOCK_REGIMENS.length}
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
        title="Change App Colors & Theme"
      >
        <span
          className="w-3.5 h-3.5 rounded-full ring-2 ring-surface shadow-xs transition-transform group-hover:rotate-45"
          style={{ backgroundColor: activeThemeObj.accentHex }}
        />
        <span className="font-label-sm text-[11px] font-bold tracking-tight text-on-surface hidden sm:inline">
          {activeThemeObj.name}
        </span>
        <span className="material-symbols-outlined text-[16px] text-secondary">palette</span>
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
  );
}
