import React from 'react';
import { ASSET_IMAGES } from '../data/assets';

interface HeaderProps {
  currentLocation: string;
  onOpenLocation: () => void;
  onOpenNotifications: () => void;
<<<<<<< HEAD
  onOpenThemeModal: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  currentThemeName?: string;
=======
  isAuthenticationAvailable?: boolean;
  onSignIn?: () => void;
>>>>>>> 5ce7349 (My project is completely pushed)
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onOpenLocation,
  onOpenNotifications,
<<<<<<< HEAD
  onOpenThemeModal,
  onToggleDarkMode,
  isDarkMode,
  currentThemeName = 'Clinical Teal',
=======
  isAuthenticationAvailable = false,
  onSignIn,
>>>>>>> 5ce7349 (My project is completely pushed)
  unreadCount = 2,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe border-b border-surface-container/60 transition-colors">
      <div className="h-16 px-3 flex items-center justify-between gap-2 max-w-xl mx-auto w-full">
        {/* Brand & Location */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            alt="Low & Best Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
            src={ASSET_IMAGES.logo}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-[16px] font-bold text-on-surface truncate leading-tight tracking-tight">
              Low &amp; Best
            </span>
            <button
              onClick={onOpenLocation}
              type="button"
              className="flex items-center gap-0.5 text-secondary leading-none hover:opacity-80 transition-opacity text-left"
              title="Change location"
            >
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span className="font-label-sm text-[11px] font-semibold text-secondary truncate">
                {currentLocation}
              </span>
            </button>
          </div>
        </div>

        {/* Action icons & Theme Switcher */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Quick Theme Switcher Pill */}
          <button
            onClick={onOpenThemeModal}
            aria-label="Change Color Theme"
            type="button"
            className="h-9 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-container-high flex items-center gap-1.5 text-on-surface transition-all active:scale-95 shadow-xs"
            title={`Active Theme: ${currentThemeName}. Click to change color mode.`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-secondary ring-1 ring-surface-container-lowest animate-pulse"></span>
            <span className="material-symbols-outlined text-[17px] text-secondary">palette</span>
            <span className="font-label-sm text-[11px] font-bold hidden sm:inline text-on-surface">
              Theme
            </span>
          </button>

          {/* Quick Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface"></span>
            )}
          </button>
<<<<<<< HEAD

          {/* User Profile */}
          <div
            aria-label="User Profile"
            className="w-9 h-9 flex items-center justify-center rounded-lg"
          >
            <img
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-surface-container"
=======
          <button
            type="button"
            aria-label={isAuthenticationAvailable ? 'Sign in' : 'Authentication is not configured'}
            disabled={!isAuthenticationAvailable}
            onClick={onSignIn}
            title={isAuthenticationAvailable ? 'Sign in' : 'Sign-in will be available when authentication is configured'}
            className="w-10 h-10 flex items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img
              alt=""
              className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container"
>>>>>>> 5ce7349 (My project is completely pushed)
              src={ASSET_IMAGES.profile}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

