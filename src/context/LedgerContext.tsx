import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ScreenId, Transaction, ReceiptData, UserProfile } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_RECEIPTS } from '../data/initialData';

interface ToastState {
  id: number;
  text: string;
  icon?: string;
}

interface LogFormPreset {
  type?: 'income' | 'expense';
  triggerCamera?: boolean;
}

interface LedgerContextType {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  userProfile: UserProfile | null;
  saveUserProfile: (profile: UserProfile) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'group'>) => void;
  attachReceiptToTransaction: (txId: string, receipt: ReceiptData) => void;
  deleteTransaction: (txId: string) => void;
  selectedReceipt: ReceiptData | null;
  setSelectedReceipt: (receipt: ReceiptData | null) => void;
  attachingTxId: string | null;
  setAttachingTxId: (id: string | null) => void;
  logFormPreset: LogFormPreset | null;
  setLogFormPreset: (preset: LogFormPreset | null) => void;
  allocatedTaxReserve: number;
  allocateReserve: (amount: number) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isShareCpaOpen: boolean;
  setIsShareCpaOpen: (open: boolean) => void;
  isSocialServicesOpen: boolean;
  setIsSocialServicesOpen: (open: boolean) => void;
  showToast: (text: string, icon?: string) => void;
  
  // Computed metrics
  totalLogs: number;
  vaultedCount: number;
  unreconciledCount: number;
  grossIncome: number;
  cashIncome: number;
  paypalIncome: number;
  totalExpenses: number;
  netProfit: number;
  auditReadinessPercent: number;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

const STORAGE_KEY = 'ledgerlens_txs_v1';
const RESERVE_KEY = 'ledgerlens_reserve_v1';
const PROFILE_KEY = 'ledgerlens_profile_v1';

export const LedgerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.profileImageUrl && parsed.profileImageUrl.startsWith('blob:')) {
           parsed.profileImageUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(parsed.name || 'User') + '&background=82f5c1&color=006c4a';
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  const [activeScreen, setActiveScreen] = useState<ScreenId>(userProfile ? 'overview' : 'startup-profile');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Transaction[] = JSON.parse(saved);
        // Clean up any stale blob URLs from receipts that might have been saved in a prior session
        return parsed.map(tx => {
           if (tx.receipt && tx.receipt.imageUrl && tx.receipt.imageUrl.startsWith('blob:')) {
              return {
                 ...tx,
                 receipt: {
                    ...tx.receipt,
                    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="%23f1f5f9"/><text x="200" y="280" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="%23475569">Image Expired</text><text x="200" y="320" font-family="sans-serif" font-size="16" text-anchor="middle" fill="%2364748b">Please re-attach receipt</text></svg>',
                    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50" y="55" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="%23ba1a1a">Expired</text></svg>'
                 }
              };
           }
           return tx;
        });
      }
    } catch (e) {
      console.error('Failed to load transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [allocatedTaxReserve, setAllocatedTaxReserve] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(RESERVE_KEY);
      if (saved) return parseFloat(saved);
    } catch {
      // fallback
    }
    return 4605.00;
  });

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [attachingTxId, setAttachingTxId] = useState<string | null>(null);
  const [logFormPreset, setLogFormPreset] = useState<LogFormPreset | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShareCpaOpen, setIsShareCpaOpen] = useState(false);
  const [isSocialServicesOpen, setIsSocialServicesOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to persist transactions', e);
    }
  }, [transactions]);

  const showToast = (text: string, icon: string = 'check_circle') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const saveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {}
    setActiveScreen('overview');
    showToast('Profile saved successfully', 'person');
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'group'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-user-${Date.now()}`,
      group: 'Today',
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast('Transaction saved to Ledger & Photo Vault', 'inventory_2');
  };

  const attachReceiptToTransaction = (txId: string, receipt: ReceiptData) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          return {
            ...tx,
            hasReceipt: true,
            missingProofReason: undefined,
            tag: tx.tag === 'Audit Alert' || tx.tag === 'No Invoice' ? 'Verified' : tx.tag,
            receipt,
          };
        }
        return tx;
      })
    );
    setAttachingTxId(null);
    showToast('Proof attached & 100% audit verified', 'task_alt');
  };

  const deleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
    showToast('Transaction removed from ledger', 'delete');
  };

  const allocateReserve = (amount: number) => {
    setAllocatedTaxReserve(amount);
    try {
      localStorage.setItem(RESERVE_KEY, amount.toString());
    } catch {}
    showToast(`Allocated $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to Tax Vault sub-account`, 'savings');
  };

  // Metrics computation
  const metrics = useMemo(() => {
    let income = 0;
    let cashInc = 0;
    let paypalInc = 0;
    let expenses = 0;
    let vaulted = 0;
    let unreconciled = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
        if (tx.paymentMethod === 'cash') cashInc += tx.amount;
        else paypalInc += tx.amount;
      } else {
        expenses += tx.amount;
        if (tx.hasReceipt) {
          vaulted += 1;
        } else {
          unreconciled += 1;
        }
      }
    });

    const net = income - expenses;
    const totalExpCount = vaulted + unreconciled;
    const readiness = totalExpCount > 0 ? Math.round((vaulted / totalExpCount) * 100) : 100;

    return {
      totalLogs: transactions.length,
      vaultedCount: vaulted,
      unreconciledCount: unreconciled,
      grossIncome: income,
      cashIncome: cashInc,
      paypalIncome: paypalInc,
      totalExpenses: expenses,
      netProfit: net,
      auditReadinessPercent: readiness,
    };
  }, [transactions]);

  return (
    <LedgerContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        userProfile,
        saveUserProfile,
        transactions,
        addTransaction,
        attachReceiptToTransaction,
        deleteTransaction,
        selectedReceipt,
        setSelectedReceipt,
        attachingTxId,
        setAttachingTxId,
        logFormPreset,
        setLogFormPreset,
        allocatedTaxReserve,
        allocateReserve,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isProfileOpen,
        setIsProfileOpen,
        isShareCpaOpen,
        setIsShareCpaOpen,
        isSocialServicesOpen,
        setIsSocialServicesOpen,
        showToast,
        ...metrics,
      }}
    >
      {children}

      {/* Global floating toast feedback */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[#131b2e] text-[#f8f9ff] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold tracking-wide border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">
              {toast.icon || 'check_circle'}
            </span>
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};
