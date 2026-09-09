import React from 'react';
import { ASSET_IMAGES } from '../data/assets';
import { AuthUser } from '../api/auth';

interface HeaderProps {
  currentLocation: string;
  onOpenLocation: () => void;
  onOpenNotifications: () => void;
  onOpenThemeModal: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  currentThemeName?: string;
  isAuthenticationAvailable?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
  currentUser?: AuthUser | null;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onOpenLocation,
  onOpenNotifications,
  onOpenThemeModal,
  onToggleDarkMode,
  isDarkMode,
  currentThemeName = 'Clinical Teal',
  isAuthenticationAvailable = false,
  onSignIn,
  onSignOut,
  currentUser,
  unreadCount = 2,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe border-b border-surface-container/60 transition-colors">
      <div className="h-16 px-3 flex items-center justify-between gap-2 max-w-xl mx-auto w-full">
        {/* Brand & Location */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            alt="Low &amp; Best Logo"
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
              aria-label={`Current location: ${currentLocation}. Tap to change.`}
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">location_on</span>
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
            aria-label={`Change color theme. Current: ${currentThemeName}`}
            type="button"
            className="h-9 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-surface-container-high flex items-center gap-1.5 text-on-surface transition-all active:scale-95 shadow-xs"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-secondary ring-1 ring-surface-container-lowest animate-pulse" aria-hidden="true"></span>
            <span className="material-symbols-outlined text-[17px] text-secondary" aria-hidden="true">palette</span>
            <span className="font-label-sm text-[11px] font-bold hidden sm:inline text-on-surface">
              Theme
            </span>
          </button>

          {/* Quick Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">notifications</span>
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface"
                aria-hidden="true"
              ></span>
            )}
          </button>

          {/* User Profile / Sign-In Button */}
          {currentUser ? (
            <button
              type="button"
              aria-label={`Signed in as ${currentUser.name || currentUser.email || 'User'}. Click to sign out.`}
              onClick={onSignOut}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:ring-2 hover:ring-secondary/40 transition-all"
              title="Sign out"
            >
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt=""
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-surface-container"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[13px] font-bold">
                  {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              aria-label={
                isAuthenticationAvailable
                  ? 'Sign in to your account'
                  : 'Sign-in is not configured'
              }
              disabled={!isAuthenticationAvailable}
              onClick={onSignIn}
              title={
                isAuthenticationAvailable
                  ? 'Sign in'
                  : 'Sign-in will be available when authentication is configured'
              }
              className="w-9 h-9 flex items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-60 hover:bg-surface-container transition-colors"
            >
              <img
                src={ASSET_IMAGES.profile}
                alt=""
                aria-hidden="true"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-surface-container"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
