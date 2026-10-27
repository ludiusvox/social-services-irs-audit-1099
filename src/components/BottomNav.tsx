import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { ScreenId } from '../types';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'log', label: 'Log', icon: 'add_circle' },
  { id: 'ledger', label: 'Ledger', icon: 'receipt_long' },
  { id: 'tax-and-analytics', label: 'Tax & Analytics', icon: 'query_stats' },
];

export const BottomNav: React.FC = () => {
  const { activeScreen, setActiveScreen, unreconciledCount } = useLedger();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)] border-t border-[#e5eeff]/60">
      <div className="max-w-md mx-auto h-16 px-1 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveScreen(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 transition-colors select-none ${
                isActive
                  ? 'text-[#000000] font-semibold'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>

                {/* Micro badge on Ledger if there are unreconciled items */}
                {item.id === 'ledger' && unreconciledCount > 0 && !isActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#ba1a1a]" />
                )}
              </div>

              <span className="font-label-sm text-[11px] mt-0.5 tracking-tight">
                {item.label}
              </span>

              {/* Active subtle pill highlight indicator */}
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#006c4a]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
