import React from 'react';
import { useLedger } from '../context/LedgerContext';
import { INITIAL_TRANSACTIONS } from '../data/initialData';

export const ProfileModal: React.FC = () => {
  const { isProfileOpen, setIsProfileOpen, showToast, transactions, userProfile, saveUserProfile } = useLedger();

  if (!isProfileOpen) return null;

  const handleSignOut = () => {
    try {
      localStorage.removeItem('ledgerlens_profile_v1');
      window.location.reload();
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1c30]/40 backdrop-blur-sm p-4 pb-safe"
      onClick={() => setIsProfileOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[#ffffff] rounded-2xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <img
              src={userProfile?.profileImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAhpIvo9EJtWOeVGQbWQMTGndLgaCNEyu33Z38tOxdJmK7NMvSI_6ajwsnj4MXXQ5LSuMRW-TJVCAGzqnh-w7NyJBzmOYRskPcbxjJrUn3xbYmRYlIhUXvNYLxGIoAhp0nlE7HcvT1oUylV-j4mUYu3xU3oQWMxhW8Wm8hmmH87JlPiotssJIT75Q9KOKnd9ABaTdoHcCJRp7vPVAvOILkK-MOAZuE9M50vMpoW-e5Z9J55aGVijCi91Q"}
              alt={userProfile?.name || "Profile"}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#82f5c1]"
            />
            <div>
              <h3 className="font-headline-sm text-[16px] font-bold text-[#0b1c30]">{userProfile?.name || "User"}</h3>
              <p className="text-[12px] text-[#45464d]">{userProfile?.businessName || "Business Name"}</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#45464d]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-2 text-[13px]">
          <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0b1c30]">
              <span className="material-symbols-outlined text-[18px] text-[#006c4a]">sd_storage</span>
              <span>Double-Entry Local Storage</span>
            </div>
            <span className="text-[11px] font-semibold text-[#006c4a] bg-[#82f5c1]/30 px-2 py-0.5 rounded-full">
              Encrypted Offline
            </span>
          </div>

          <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0b1c30]">
              <span className="material-symbols-outlined text-[18px] text-[#565e74]">folder_zip</span>
              <span>IndexedDB Photo Vault</span>
            </div>
            <span className="text-[11px] font-mono text-[#45464d]">
              {transactions.filter((t) => t.hasReceipt).length} files cached
            </span>
          </div>

          <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0b1c30]">
              <span className="material-symbols-outlined text-[18px] text-[#565e74]">account_balance</span>
              <span>Accounting Method</span>
            </div>
            <span className="text-[11px] font-semibold text-[#0b1c30]">{userProfile?.accountingMethod || "Cash / Schedule C"}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 rounded-xl border border-[#c6c6cd] text-[#45464d] hover:text-[#ba1a1a] hover:border-[#ba1a1a] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
