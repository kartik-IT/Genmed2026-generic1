import React from 'react';
import { ASSET_IMAGES } from '../data/mockData';

interface HeaderProps {
  currentLocation: string;
  onOpenLocation: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onOpenLocation,
  onOpenNotifications,
  unreadCount = 2,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe border-b border-surface-container/50">
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

        {/* Action icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface"></span>
            )}
          </button>
          <div
            aria-label="User Profile"
            className="w-10 h-10 flex items-center justify-center rounded-lg"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-surface-container"
              src={ASSET_IMAGES.profile}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
