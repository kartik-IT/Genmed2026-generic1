import React from 'react';

export type TabType = 'search' | 'compare' | 'pharmacies' | 'saved-rx';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'search', label: 'Search', icon: 'search_insights' },
    { id: 'compare', label: 'Compare', icon: 'swap_horiz' },
    { id: 'pharmacies', label: 'Pharmacies', icon: 'local_pharmacy' },
    { id: 'saved-rx', label: 'Saved Rx', icon: 'bookmark' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl border-t border-surface-container/60 shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-3 max-w-xl mx-auto w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] h-12 transition-all rounded-lg ${
                isActive
                  ? 'text-secondary font-bold scale-102'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                }}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[11px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
