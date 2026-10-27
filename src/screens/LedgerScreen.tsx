import React, { useState, useMemo } from 'react';
import { useLedger } from '../context/LedgerContext';
import { Transaction } from '../types';

export const LedgerScreen: React.FC = () => {
  const {
    transactions,
    setSelectedReceipt,
    setAttachingTxId,
    deleteTransaction,
    totalLogs,
    vaultedCount,
    unreconciledCount,
    showToast,
  } = useLedger();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  const recentMonths = useMemo(() => {
    const months = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    return months;
  }, []);
  const [activeFilter, setActiveFilter] = useState<'all' | 'cash' | 'paypal' | 'has-receipt' | 'missing-receipt'>('all');
  const [activeMenuTxId, setActiveMenuTxId] = useState<string | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          tx.counterparty.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.memo && tx.memo.toLowerCase().includes(q)) ||
          (tx.tag && tx.tag.toLowerCase().includes(q)) ||
          (tx.taxTag && tx.taxTag.toLowerCase().includes(q)) ||
          tx.amount.toString().includes(q);
        if (!matchesQuery) return false;
      }

      // Category filter pills
      if (activeFilter === 'cash') {
        return tx.paymentMethod === 'cash';
      }
      if (activeFilter === 'paypal') {
        return tx.paymentMethod === 'paypal';
      }
      if (activeFilter === 'has-receipt') {
        return tx.hasReceipt;
      }
      if (activeFilter === 'missing-receipt') {
        return !tx.hasReceipt;
      }

      return true;
    });
  }, [transactions, searchQuery, activeFilter]);

  // Group transactions by group property
  const groupedTransactions = useMemo(() => {
    const groups: { name: string; dateSubtitle: string; netTotal: number; items: Transaction[] }[] = [];
    
    const todayItems = filteredTransactions.filter((t) => t.group === 'Today');
    const yesterdayItems = filteredTransactions.filter((t) => t.group === 'Yesterday');
    const lastWeekItems = filteredTransactions.filter((t) => t.group === 'Last Week');
    const earlierItems = filteredTransactions.filter((t) => t.group === 'Earlier');

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (todayItems.length > 0) {
      const net = todayItems.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
      groups.push({ name: 'Today', dateSubtitle: formatDate(today), netTotal: net, items: todayItems });
    }
    if (yesterdayItems.length > 0) {
      const net = yesterdayItems.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
      groups.push({ name: 'Yesterday', dateSubtitle: formatDate(yesterday), netTotal: net, items: yesterdayItems });
    }
    if (lastWeekItems.length > 0) {
      const net = lastWeekItems.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
      groups.push({ name: 'Last Week', dateSubtitle: 'Past 7 Days', netTotal: net, items: lastWeekItems });
    }
    if (earlierItems.length > 0) {
      const net = earlierItems.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
      groups.push({ name: 'Earlier Records', dateSubtitle: 'Historical Vault', netTotal: net, items: earlierItems });
    }

    return groups;
  }, [filteredTransactions]);

  const vaultedPercent = totalLogs > 0 ? Math.round((vaultedCount / totalLogs) * 100) : 94;

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Search & Micro Header Area */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#76777d]">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, tag, amount..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#ffffff] rounded-xl font-body-md text-[14px] text-[#0b1c30] shadow-sm focus:outline-none placeholder:text-[#76777d] border border-[#e5eeff]/80 transition-all"
          />
          {searchQuery && (
            <button
              aria-label="Clear Search"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#76777d] hover:text-[#0b1c30]"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Quick Month Selector Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {recentMonths.map((month) => {
            const isSelected = selectedMonth === month;
            return (
              <button
                key={month}
                type="button"
                onClick={() => {
                  setSelectedMonth(month);
                  showToast(`Viewing ${month}`, 'calendar_today');
                }}
                className={`px-3.5 py-1.5 rounded-full font-label-sm text-[11px] shadow-xs transition-all whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? 'bg-[#131b2e] text-[#ffffff] font-semibold'
                    : 'bg-[#ffffff] text-[#45464d] hover:bg-[#e5eeff] border border-[#e5eeff]'
                }`}
              >
                {month}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => showToast('Custom date range filter opened', 'date_range')}
            className="px-3 py-1.5 rounded-full font-label-sm text-[11px] bg-[#ffffff] text-[#45464d] shadow-xs transition-all flex items-center gap-1 whitespace-nowrap border border-[#e5eeff] hover:bg-[#e5eeff]"
          >
            <span className="material-symbols-outlined text-[15px]">calendar_month</span>
            Custom
          </button>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full font-label-sm text-[11px] shadow-xs transition-all whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#0b1c30] text-[#ffffff] font-semibold'
                : 'bg-[#ffffff] text-[#0b1c30] border border-[#e5eeff]'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('cash')}
            className={`px-3 py-1 rounded-full font-label-sm text-[11px] shadow-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'cash'
                ? 'bg-[#0b1c30] text-[#ffffff] font-semibold'
                : 'bg-[#ffffff] text-[#0b1c30] border border-[#e5eeff]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]" />
            Cash Only
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('paypal')}
            className={`px-3 py-1 rounded-full font-label-sm text-[11px] shadow-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'paypal'
                ? 'bg-[#0b1c30] text-[#ffffff] font-semibold'
                : 'bg-[#ffffff] text-[#0b1c30] border border-[#e5eeff]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#565e74]" />
            PayPal
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('has-receipt')}
            className={`px-3 py-1 rounded-full font-label-sm text-[11px] shadow-xs transition-all whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'has-receipt'
                ? 'bg-[#0b1c30] text-[#ffffff] font-semibold'
                : 'bg-[#ffffff] text-[#0b1c30] border border-[#e5eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#006c4a]">receipt_long</span>
            With Receipt
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('missing-receipt')}
            className={`px-3 py-1 rounded-full font-label-sm text-[11px] shadow-xs transition-all whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'missing-receipt'
                ? 'bg-[#ba1a1a] text-[#ffffff] font-semibold'
                : 'bg-[#ffffff] text-[#f83256] border border-[#e5eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#ba1a1a]">warning</span>
            Missing Receipt ({unreconciledCount})
          </button>
        </div>
      </div>

      {/* Monthly Metric Summary Ribbon */}
      <div className="px-4 my-1">
        <div className="w-full bg-[#ffffff] rounded-xl p-3.5 shadow-sm flex items-center justify-between border border-[#e5eeff]/60">
          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] text-[#45464d] uppercase tracking-wider font-semibold">
              Total Logs
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline-md text-[20px] text-[#0b1c30] font-bold tabular-nums">
                {totalLogs}
              </span>
              <span className="font-label-sm text-[11px] text-[#006c4a] flex items-center font-semibold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>+4
              </span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-[#d3e4fe]" />

          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] text-[#45464d] uppercase tracking-wider font-semibold">
              Vaulted
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline-md text-[20px] text-[#0b1c30] font-bold tabular-nums">
                {vaultedCount}
              </span>
              <span className="font-label-sm text-[11px] text-[#006c4a] bg-[#82f5c1]/30 px-1 rounded font-medium">
                {vaultedPercent}%
              </span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-[#d3e4fe]" />

          <div className="flex flex-col">
            <span className="font-label-sm text-[11px] text-[#45464d] uppercase tracking-wider font-semibold">
              Unreconciled
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline-md text-[20px] text-[#ba1a1a] font-bold tabular-nums">
                {unreconciledCount}
              </span>
              {unreconciledCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Transaction Groups */}
      {groupedTransactions.length > 0 ? (
        <div className="flex flex-col gap-4 px-4 mt-2">
          {groupedTransactions.map((group) => {
            const isNetPositive = group.netTotal >= 0;
            return (
              <div key={group.name} className="flex flex-col gap-2">
                {/* Group Header */}
                <div className="flex items-center justify-between py-1 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-[16px] text-[#0b1c30] font-bold">
                      {group.name}
                    </span>
                    <span className="font-label-sm text-[12px] text-[#45464d] font-medium">
                      {group.dateSubtitle}
                    </span>
                  </div>
                  <span
                    className={`font-label-sm text-[12px] font-semibold tabular-nums ${
                      isNetPositive ? 'text-[#006c4a]' : 'text-[#45464d]'
                    }`}
                  >
                    {isNetPositive
                      ? `+$${group.netTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} Net`
                      : `-$${Math.abs(group.netTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} Net`}
                  </span>
                </div>

                {/* Items in group */}
                {group.items.map((item) => {
                  const isCredit = item.type === 'income';
                  return (
                    <div
                      key={item.id}
                      className="relative bg-[#ffffff] rounded-xl p-3 shadow-sm flex flex-col gap-2 border border-[#e5eeff]/60 transition-transform"
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Method Badge Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isCredit
                                ? item.paymentMethod === 'cash'
                                  ? 'bg-[#82f5c1]/40 text-[#006c4a]'
                                  : 'bg-[#e5eeff] text-[#0b1c30]'
                                : 'bg-[#dce9ff] text-[#0b1c30]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {item.paymentMethod === 'cash'
                                ? 'payments'
                                : item.paymentMethod === 'paypal'
                                ? 'account_balance_wallet'
                                : item.paymentMethod === 'deposit'
                                ? 'account_balance'
                                : item.paymentMethod === 'mastercard'
                                ? 'print'
                                : 'credit_card'}
                            </span>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-label-lg text-[14px] text-[#0b1c30] font-semibold truncate">
                                {item.counterparty}
                              </span>
                              <span className="font-body-sm text-[11px] text-[#76777d]">
                                {new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {item.tag && (
                                <span
                                  className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-semibold ${
                                    item.tag === 'Audit Alert' || item.tag === 'No Invoice'
                                      ? 'bg-[#ffdad6] text-[#93000a]'
                                      : item.tag === 'Invoice #104'
                                      ? 'bg-[#82f5c1] text-[#00714e]'
                                      : 'bg-[#d3e4fe] text-[#0b1c30]'
                                  }`}
                                >
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-body-sm text-[12px] text-[#45464d] truncate">
                                {item.category}
                              </span>
                              <span className="text-[#45464d] text-[12px]">·</span>
                              <span className="font-body-sm text-[12px] text-[#45464d]">
                                {item.time || item.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col items-end shrink-0 pl-2">
                          <span
                            className={`font-headline-sm text-[16px] font-bold tabular-nums ${
                              isCredit ? 'text-[#006c4a]' : 'text-[#0b1c30]'
                            }`}
                          >
                            {isCredit
                              ? `+$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                              : `-$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                          </span>
                          <span
                            className={`font-label-sm text-[11px] ${
                              isCredit ? 'text-[#006c4a]' : 'text-[#76777d]'
                            }`}
                          >
                            {item.accountLabel || item.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Action / Receipt Status Strip */}
                      <div className="flex items-center justify-between pt-1.5 bg-[#eff4ff]/60 -mx-3 -mb-3 p-2.5 rounded-b-xl border-t border-[#e5eeff]/50">
                        {item.hasReceipt && item.receipt ? (
                          /* Thumbnail View Trigger */
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(item.receipt!)}
                            className="flex items-center gap-2 group text-left"
                          >
                            <img
                              src={item.receipt.thumbnailUrl || item.receipt.imageUrl}
                              alt="Receipt proof"
                              className="w-7 h-7 rounded-md object-cover ring-1 ring-[#d3e4fe] group-hover:opacity-90"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23d3e4fe"/><text x="50" y="50" font-family="sans-serif" font-size="20" text-anchor="middle" alignment-baseline="middle" fill="%230b1c30">Receipt</text></svg>';
                              }}
                            />
                            <div className="flex items-center gap-1 font-label-sm text-[11px] text-[#006c4a] font-semibold">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              <span>
                                {item.tag === 'Invoice #104'
                                  ? 'Vaulted PDF'
                                  : item.tag === 'Consulting'
                                  ? 'Signed Voucher'
                                  : 'View Photo'}
                              </span>
                            </div>
                          </button>
                        ) : (
                          /* Missing Proof Alert Strip */
                          <div className="flex items-center gap-1.5 text-[#ba1a1a]">
                            <span className="material-symbols-outlined text-[16px]">
                              {item.tag === 'No Invoice' ? 'help_center' : 'no_photography'}
                            </span>
                            <span className="font-label-sm text-[11px] font-bold">
                              {item.missingProofReason || 'Missing Proof'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {!item.hasReceipt && (
                            <button
                              type="button"
                              onClick={() => setAttachingTxId(item.id)}
                              className="px-2.5 py-1 bg-[#d3e4fe] hover:bg-[#cbdbf5] text-[#0b1c30] rounded-lg font-label-sm text-[11px] font-semibold flex items-center gap-1 transition-colors active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {item.tag === 'No Invoice' ? 'upload_file' : 'photo_camera'}
                              </span>
                              <span>{item.tag === 'No Invoice' ? 'Upload' : 'Attach'}</span>
                            </button>
                          )}

                          {item.taxTag && (
                            <button
                              type="button"
                              onClick={() => showToast(`Tax Tag: ${item.taxTag}`, 'sell')}
                              className="px-2 py-0.5 rounded-md bg-[#dce9ff] text-[#0b1c30] font-label-sm text-[11px] font-medium flex items-center gap-1 hover:bg-[#d3e4fe] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[12px]">sell</span>
                              {item.taxTag}
                            </button>
                          )}

                          <button
                            type="button"
                            aria-label="Actions"
                            onClick={() => {
                              if (activeMenuTxId === item.id) {
                                setActiveMenuTxId(null);
                              } else {
                                setActiveMenuTxId(item.id);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#ffffff] text-[#45464d] hover:text-[#0b1c30] shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">more_vert</span>
                          </button>
                        </div>
                      </div>

                      {/* Dropdown menu for more options if opened */}
                      {activeMenuTxId === item.id && (
                        <div className="p-2 bg-[#ffffff] rounded-lg border border-[#e5eeff] shadow-md flex items-center justify-between text-xs animate-in fade-in duration-150">
                          <span className="text-[#45464d]">ID: {item.id.slice(0,8)}...</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setAttachingTxId(item.id);
                                setActiveMenuTxId(null);
                              }}
                              className="text-[#006c4a] font-medium hover:underline"
                            >
                              Re-scan
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => {
                                deleteTransaction(item.id);
                                setActiveMenuTxId(null);
                              }}
                              className="text-[#ba1a1a] font-medium hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#45464d] mb-3">
            <span className="material-symbols-outlined text-[32px]">folder_off</span>
          </div>
          <span className="font-headline-sm text-[16px] font-bold text-[#0b1c30]">
            No matching transactions
          </span>
          <p className="font-body-md text-[13px] text-[#45464d] max-w-xs mt-1">
            Try tweaking your search keywords or switching filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-[#0b1c30] text-[#ffffff] rounded-xl font-label-md text-[12px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Floating Camera Capture Quick-Button */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
        <div className="relative">
          <span className="absolute -inset-1 rounded-full bg-[#68dba9] opacity-75 blur-sm animate-pulse" />
          <button
            type="button"
            aria-label="Capture Receipt Photo"
            onClick={() => {
              // Open photo attach for the first unreconciled transaction or notify
              const unreconciled = transactions.find((t) => !t.hasReceipt);
              if (unreconciled) {
                setAttachingTxId(unreconciled.id);
              } else {
                showToast('Camera active: Align receipt', 'photo_camera');
              }
            }}
            className="relative w-14 h-14 rounded-full bg-[#131b2e] text-[#ffffff] shadow-xl flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px] text-[#85f8c4]">
              photo_camera
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
