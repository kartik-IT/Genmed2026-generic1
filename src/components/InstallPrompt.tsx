/**
 * InstallPrompt
 *
 * Shows a bottom-sheet prompt when the browser fires `beforeinstallprompt`,
 * allowing users to add Low & Best to their home screen.
 *
 * Also registers the service worker on first render.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning', icon?: string) => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onShowToast }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered, scope:', reg.scope);
        })
        .catch((err) => {
          console.error('[SW] Registration failed:', err);
        });
    }
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Don't show if user already dismissed in this session
      if (!isDismissed) {
        // Delay slightly so it doesn't pop over initial loading
        setTimeout(() => setIsVisible(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isDismissed]);

  // Hide if already installed
  useEffect(() => {
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      onShowToast?.('Low & Best installed to your home screen!', 'success', 'install_mobile');
    });
  }, [onShowToast]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      onShowToast?.('Installing Low & Best…', 'info', 'download');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt, onShowToast]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          role="dialog"
          aria-modal="true"
          aria-label="Install Low &amp; Best app"
          className="fixed bottom-20 left-3 right-3 z-50 max-w-md mx-auto"
        >
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-[28px]" aria-hidden="true">install_mobile</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-headline-sm text-[14px] font-bold text-on-surface leading-tight">
                Add to Home Screen
              </p>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                Get instant access to drug pricing &amp; pharmacy savings.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstall}
                className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm text-[12px] font-bold hover:opacity-90 transition-opacity"
              >
                Install
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss install prompt"
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-[12px] font-semibold hover:bg-surface-container-high transition-colors text-center"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
