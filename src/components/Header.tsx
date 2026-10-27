import React from 'react';
import { useLedger } from '../context/LedgerContext';

export const Header: React.FC = () => {
  const {
    activeScreen,
    setIsNotificationsOpen,
    setIsProfileOpen,
  } = useLedger();

  const getScreenSubtitle = () => {
    switch (activeScreen) {
      case 'overview':
        return 'Overview';
      case 'log':
        return 'Log Transaction';
      case 'ledger':
        return 'Ledger';
      case 'tax-and-analytics':
        return 'Tax & Analytics';
      default:
        return 'LedgerLens';
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#ffffff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e5eeff]/50">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
        {/* Brand identity lockup */}
        <div className="flex items-center gap-2.5">
          <img
            alt="LedgerLens Brand Icon"
            className="h-8 w-8 object-contain rounded-lg shadow-sm"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VYXAojS6AQ8fjTo7qBnsIU2_vAbzsZrfHmD930Vwv59tXS1Uh0ch_Nw1zTZqF6hrwbObM69bbQ1QBSdipR1lo7vcDM2nnemsEkzaJ_IhBL1Ghj2yhriMkEfhI8UJtyJiMT_iF-SRy9Jp5zDHWi97Iqp2aqR3SOq_miFBYhmGdF42mRYKjvBM7z0l7CTLXdCh-1VM0RGLaomzjToMYRrztaQYwab927KD8TTCFhpkv3G1UZ7Ze2GCjjXH2J"
            onError={(e) => {
              // Fallback to stylized SVG icon if blocked
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.brand-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'brand-fallback w-8 h-8 rounded-lg bg-[#006c4a] text-white flex items-center justify-center font-bold text-sm';
                fallback.innerText = 'L';
                parent.prepend(fallback);
              }
            }}
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-[16px] text-[#0b1c30] leading-tight tracking-tight font-bold">
              LedgerLens
            </span>
            <span className="font-label-sm text-[11px] text-[#45464d] font-medium">
              {getScreenSubtitle()}
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Notifications"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-11 h-11 flex items-center justify-center rounded-full text-[#45464d] hover:text-[#0b1c30] hover:bg-[#e5eeff]/50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
          </button>

          <button
            aria-label="Profile and settings"
            onClick={() => setIsProfileOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:ring-2 hover:ring-[#82f5c1] transition-all"
          >
            <img
              alt="Alex profile avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e5eeff] shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhpIvo9EJtWOeVGQbWQMTGndLgaCNEyu33Z38tOxdJmK7NMvSI_6ajwsnj4MXXQ5LSuMRW-TJVCAGzqnh-w7NyJBzmOYRskPcbxjJrUn3xbYmRYlIhUXvNYLxGIoAhp0nlE7HcvT1oUylV-j4mUYu3xU3oQWMxhW8Wm8hmmH87JlPiotssJIT75Q9KOKnd9ABaTdoHcCJRp7vPVAvOILkK-MOAZuE9M50vMpoW-e5Z9J55aGVijCi91Q"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.profile-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'profile-fallback w-8 h-8 rounded-full bg-[#131b2e] text-[#f8f9ff] flex items-center justify-center font-bold text-xs';
                  fallback.innerText = 'A';
                  parent.appendChild(fallback);
                }
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
