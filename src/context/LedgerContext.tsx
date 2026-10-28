import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { ScreenId, Transaction, ReceiptData, UserProfile } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/initialData';
import { db, enablePersistentStorage } from '../db/ledgerDatabase';
import { getGroupForDate, normalizeTransactionGroups } from '../utils/dateGrouping';

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
        return normalizeTransactionGroups(parsed);
      }
    } catch (e) {
      console.error('Failed to parse transactions from localStorage fallback', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [allocatedTaxReserve, setAllocatedTaxReserve] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(RESERVE_KEY);
      if (saved) return parseFloat(saved);
    } catch {}
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

  // Load and sync from Dexie embedded NoSQL Database on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeNoSQLStore() {
      // 1. Request persistent, non-volatile storage from engine
      await enablePersistentStorage();

      try {
        // 2. Load transactions from Dexie NoSQL DB
        const dbTxs = await db.transactions.toArray();

        if (dbTxs && dbTxs.length > 0) {
          // Normalize groups based on current date
          const normalized = normalizeTransactionGroups(dbTxs);
          if (isMounted) {
            setTransactions(normalized);
          }
          await db.transactions.bulkPut(normalized);
        } else {
          // Fallback to legacy localStorage or initial state
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed: Transaction[] = JSON.parse(saved);
            const normalized = normalizeTransactionGroups(parsed);
            if (isMounted) {
              setTransactions(normalized);
            }
            await db.transactions.bulkPut(normalized);
          }
        }

        // 3. Load user profile from Dexie NoSQL DB
        const dbProfile = await db.userProfile.get('main_profile');
        if (dbProfile) {
          const { id, ...prof } = dbProfile;
          if (isMounted) {
            setUserProfile(prof);
          }
        }

        // 4. Load allocated tax reserve setting
        const reserveSetting = await db.settings.get('allocatedTaxReserve');
        if (reserveSetting && typeof reserveSetting.value === 'number') {
          if (isMounted) {
            setAllocatedTaxReserve(reserveSetting.value);
          }
        }
      } catch (err) {
        console.error('[LedgerLens NoSQL] Database init error:', err);
      }
    }

    initializeNoSQLStore();

    return () => {
      isMounted = false;
    };
  }, []);

  // Re-normalize date groups on visibilitychange (e.g. app reopened after midnight rollover)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTransactions((prev) => {
          const updated = normalizeTransactionGroups(prev);
          db.transactions.bulkPut(updated).catch(console.error);
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Sync state changes to localStorage backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to sync secondary storage', e);
    }
  }, [transactions]);

  const showToast = (text: string, icon: string = 'check_circle') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const saveUserProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      await db.userProfile.put({ ...profile, id: 'main_profile' });
    } catch (err) {
      console.error('[LedgerLens NoSQL] Failed saving user profile', err);
    }
    setActiveScreen('overview');
    showToast('Profile saved to embedded NoSQL database', 'database');
  };

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt' | 'group'>) => {
    const createdAt = Date.now();
    const group = getGroupForDate(txData.date, createdAt);

    const newTx: Transaction = {
      ...txData,
      id: `tx-user-${createdAt}`,
      group,
      createdAt,
    };

    setTransactions((prev) => [newTx, ...prev]);

    try {
      await db.transactions.put(newTx);
    } catch (err) {
      console.error('[LedgerLens NoSQL] Failed inserting transaction', err);
    }

    showToast('Saved to embedded NoSQL DB & Vault', 'database');
  };

  const attachReceiptToTransaction = async (txId: string, receipt: ReceiptData) => {
    let updatedTx: Transaction | null = null;

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          updatedTx = {
            ...tx,
            hasReceipt: true,
            missingProofReason: undefined,
            tag: tx.tag === 'Audit Alert' || tx.tag === 'No Invoice' ? 'Verified' : tx.tag,
            receipt,
          };
          return updatedTx;
        }
        return tx;
      })
    );

    if (updatedTx) {
      try {
        await db.transactions.put(updatedTx);
      } catch (err) {
        console.error('[LedgerLens NoSQL] Failed updating receipt', err);
      }
    }

    setAttachingTxId(null);
    showToast('Proof attached & persisted in NoSQL Vault', 'task_alt');
  };

  const deleteTransaction = async (txId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
    try {
      await db.transactions.delete(txId);
    } catch (err) {
      console.error('[LedgerLens NoSQL] Failed deleting transaction', err);
    }
    showToast('Transaction removed from NoSQL DB', 'delete');
  };

  const allocateReserve = async (amount: number) => {
    setAllocatedTaxReserve(amount);
    try {
      localStorage.setItem(RESERVE_KEY, amount.toString());
      await db.settings.put({ key: 'allocatedTaxReserve', value: amount });
    } catch (err) {
      console.error('[LedgerLens NoSQL] Failed storing tax reserve setting', err);
    }
    showToast(`Allocated $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to Tax Vault NoSQL store`, 'savings');
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
