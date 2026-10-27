import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { CASH_FLOW_WEEK, INITIAL_RECEIPTS } from '../data/initialData';

export const OverviewScreen: React.FC = () => {
  const {
    setActiveScreen,
    setLogFormPreset,
    setSelectedReceipt,
    netProfit,
    grossIncome,
    cashIncome,
    paypalIncome,
    totalExpenses,
    unreconciledCount,
    transactions,
  } = useLedger();

  const [activeDay, setActiveDay] = useState<string>('T');

  const netProfitParts = netProfit.toFixed(2).split('.');
  const wholeProfit = parseInt(netProfitParts[0]).toLocaleString('en-US');
  const decimalProfit = netProfitParts[1];

  // Recent transactions to display on overview
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="flex flex-col w-full px-4 space-y-4 pb-8">
      {/* Status & Welcome Card */}
      <section className="bg-[#ffffff] rounded-xl p-4 shadow-sm border border-[#e5eeff]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#82f5c1]/30 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[#006c4a]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-[16px] font-bold text-[#0b1c30] truncate">
                  Good morning, Alex
                </span>
                <span className="inline-flex w-2 h-2 rounded-full bg-[#006c4a] animate-pulse" title="System Live" />
              </div>
              <p className="font-body-sm text-[12px] text-[#45464d] truncate">
                Thursday, Oct 24 • Q4 Tax Window
              </p>
            </div>
          </div>
          <div className="flex items-center bg-[#e5eeff] px-2.5 py-1 rounded-full space-x-1 shrink-0">
            <span className="material-symbols-outlined text-[#006c4a] text-[16px]">cloud_done</span>
            <span className="font-label-sm text-[11px] text-[#45464d] font-medium">Cloud Synced</span>
          </div>
        </div>
      </section>

      {/* Net Profit Highlight Card */}
      <section className="bg-[#131b2e] text-[#ffffff] rounded-xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#006c4a]/20 blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-2">
          <span className="font-label-md text-[12px] text-[#7c839b] tracking-wider uppercase font-semibold">
            Total Net Profit
          </span>
          <span className="inline-flex items-center gap-1 bg-[#006c4a]/30 text-[#85f8c4] px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +14.2%
          </span>
        </div>

        <div className="flex items-baseline space-x-1 mb-4">
          <span className="font-headline-xl-mobile text-[32px] font-bold tracking-tight text-[#ffffff] tabular-nums">
            ${wholeProfit}
          </span>
          <span className="font-headline-lg-mobile text-[22px] text-[#7c839b] tabular-nums">
            .{decimalProfit}
          </span>
        </div>

        {/* Income by Source Toggle / Breakdown */}
        <div className="bg-[#ffffff]/10 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-between border border-white/5">
          <div className="flex-1 flex items-center space-x-2 px-2.5 py-1.5 rounded bg-[#ffffff]/15">
            <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">payments</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-[#dce9ff] leading-none">Cash In</span>
              <span className="font-label-md text-[13px] text-[#ffffff] font-semibold mt-0.5 tabular-nums">
                ${cashIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="w-px h-6 bg-[#ffffff]/20 mx-1" />
          <div className="flex-1 flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-[#bec6e0] text-[18px]">
              account_balance_wallet
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-[#dce9ff] leading-none">PayPal</span>
              <span className="font-label-md text-[13px] text-[#ffffff] font-semibold mt-0.5 tabular-nums">
                ${paypalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Expenses & Receipt Audit Tile */}
      <section className="bg-[#ffffff] rounded-xl p-4 shadow-sm flex items-center justify-between border border-[#e5eeff]/60">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-lg bg-[#dce9ff] flex items-center justify-center text-[#0b1c30]">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <div>
            <p className="font-label-sm text-[11px] text-[#45464d] uppercase tracking-wider font-semibold">
              Total Expenses
            </p>
            <p className="font-headline-md text-[20px] text-[#0b1c30] font-bold tabular-nums">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="inline-flex items-center gap-1 bg-[#82f5c1]/40 text-[#00714e] px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold">
            <span
              className="material-symbols-outlined text-[13px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            {unreconciledCount === 0 ? '100% Captured' : `${transactions.filter(t => t.hasReceipt).length} Vaulted`}
          </span>
          <span className="font-body-sm text-[12px] text-[#45464d] mt-1 font-medium">
            Audit-Ready
          </span>
        </div>
      </section>

      {/* Quick Action Matrix */}
      <section className="space-y-2">
        <h2 className="font-label-lg text-[14px] text-[#0b1c30] font-semibold px-0.5">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {/* Action 1: Income */}
          <button
            onClick={() => {
              setLogFormPreset({ type: 'income' });
              setActiveScreen('log');
            }}
            className="bg-[#ffffff] hover:bg-[#e5eeff]/50 p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 transition-transform active:scale-95 border border-[#e5eeff]/60"
            type="button"
          >
            <div className="w-10 h-10 rounded-full bg-[#82f5c1]/40 text-[#006c4a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_card</span>
            </div>
            <span className="font-label-sm text-[12px] text-[#0b1c30] leading-tight font-medium">
              Log Income
            </span>
          </button>

          {/* Action 2: Snap Receipt */}
          <button
            onClick={() => {
              setLogFormPreset({ triggerCamera: true });
              setActiveScreen('log');
            }}
            className="bg-[#ffffff] hover:bg-[#e5eeff]/50 p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 transition-transform active:scale-95 border border-[#e5eeff]/60"
            type="button"
          >
            <div className="w-10 h-10 rounded-full bg-[#d3e4fe] text-[#0b1c30] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </div>
            <span className="font-label-sm text-[12px] text-[#0b1c30] leading-tight font-medium">
              Snap Receipt
            </span>
          </button>

          {/* Action 3: Export Taxes */}
          <button
            onClick={() => setActiveScreen('tax-and-analytics')}
            className="bg-[#ffffff] hover:bg-[#e5eeff]/50 p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 transition-transform active:scale-95 border border-[#e5eeff]/60"
            type="button"
          >
            <div className="w-10 h-10 rounded-full bg-[#e5eeff] text-[#45464d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">file_upload</span>
            </div>
            <span className="font-label-sm text-[12px] text-[#0b1c30] leading-tight font-medium">
              Tax Export
            </span>
          </button>
        </div>
      </section>

      {/* Weekly Cashflow Visual Spark */}
      <section className="bg-[#ffffff] rounded-xl p-4 shadow-sm space-y-2 border border-[#e5eeff]/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-sm text-[16px] text-[#0b1c30] font-bold">
              Weekly Cash Flow
            </h3>
            <p className="font-body-sm text-[12px] text-[#45464d]">Inflow vs. Outflow rhythm</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a]" />
              <span className="font-label-sm text-[11px] text-[#45464d]">In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f83256]" />
              <span className="font-label-sm text-[11px] text-[#45464d]">Out</span>
            </div>
          </div>
        </div>

        {/* Mini SVG Bar Visual */}
        <div className="w-full pt-2">
          <svg
            className="w-full h-20 overflow-visible"
            fill="none"
            viewBox="0 0 320 80"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gridlines */}
            <line stroke="#e5eeff" strokeWidth="1.5" x1="0" x2="320" y1="72" y2="72" />
            <line stroke="#eff4ff" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="36" y2="36" />

            {/* Mon */}
            <rect className="fill-[#006c4a]" height="48" rx="4" width="8" x="20" y="24" />
            <rect className="fill-[#f83256]" height="20" rx="4" width="8" x="31" y="52" />
            <text className="fill-[#45464d] text-[10px] font-medium font-sans" textAnchor="middle" x="29" y="86">
              M
            </text>

            {/* Tue */}
            <rect className="fill-[#006c4a]" height="56" rx="4" width="8" x="75" y="16" />
            <rect className="fill-[#f83256]" height="28" rx="4" width="8" x="86" y="44" />
            <text className="fill-[#45464d] text-[10px] font-medium font-sans" textAnchor="middle" x="84" y="86">
              T
            </text>

            {/* Wed */}
            <rect className="fill-[#006c4a]" height="40" rx="4" width="8" x="130" y="32" />
            <rect className="fill-[#f83256]" height="12" rx="4" width="8" x="141" y="60" />
            <text className="fill-[#45464d] text-[10px] font-medium font-sans" textAnchor="middle" x="139" y="86">
              W
            </text>

            {/* Thu (Today - Highlighted) */}
            <rect className="fill-[#006c4a]" height="64" rx="4" width="8" x="185" y="8" />
            <rect className="fill-[#f83256]" height="24" rx="4" width="8" x="196" y="48" />
            <text className="fill-[#0b1c30] text-[10px] font-bold font-sans" textAnchor="middle" x="194" y="86">
              T
            </text>

            {/* Fri */}
            <rect className="fill-[#006c4a] opacity-40" height="44" rx="4" width="8" x="240" y="28" />
            <rect className="fill-[#f83256] opacity-40" height="16" rx="4" width="8" x="251" y="56" />
            <text className="fill-[#45464d] text-[10px] font-medium font-sans" textAnchor="middle" x="249" y="86">
              F
            </text>

            {/* Sat/Sun combo */}
            <rect className="fill-[#006c4a] opacity-40" height="30" rx="4" width="8" x="295" y="42" />
            <rect className="fill-[#f83256] opacity-40" height="8" rx="4" width="8" x="306" y="64" />
            <text className="fill-[#45464d] text-[10px] font-medium font-sans" textAnchor="middle" x="304" y="86">
              S
            </text>
          </svg>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-[16px] text-[#0b1c30] font-bold">
            Recent Transactions
          </h3>
          <button
            onClick={() => setActiveScreen('ledger')}
            className="font-label-sm text-[12px] text-[#006c4a] font-semibold hover:underline"
          >
            View All ({transactions.length})
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => {
            const isCredit = tx.type === 'income';
            return (
              <div
                key={tx.id}
                onClick={() => {
                  if (tx.receipt) {
                    setSelectedReceipt(tx.receipt);
                  } else {
                    setActiveScreen('ledger');
                  }
                }}
                className="bg-[#ffffff] p-3 rounded-xl shadow-sm flex items-center justify-between hover:bg-[#eff4ff]/60 transition-colors border border-[#e5eeff]/60 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Method / Photo thumbnail */}
                  {tx.receipt ? (
                    <div className="relative shrink-0">
                      <img
                        src={tx.receipt.thumbnailUrl || tx.receipt.imageUrl}
                        alt="Receipt proof"
                        className="w-10 h-10 rounded-xl object-cover shadow-xs border border-[#e5eeff]"
                        onError={(e) => {
                          e.currentTarget.src = INITIAL_RECEIPTS.officeDepot.thumbnailUrl;
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#006c4a] text-[#ffffff] rounded-full p-0.5 flex items-center justify-center shadow-xs">
                        <span
                          className="material-symbols-outlined text-[10px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? tx.paymentMethod === 'cash'
                            ? 'bg-[#82f5c1]/30 text-[#006c4a]'
                            : 'bg-[#e5eeff] text-[#0b1c30]'
                          : 'bg-[#dce9ff] text-[#0b1c30]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {tx.paymentMethod === 'cash'
                          ? 'payments'
                          : tx.paymentMethod === 'paypal'
                          ? 'account_balance_wallet'
                          : tx.paymentMethod === 'deposit'
                          ? 'account_balance'
                          : 'credit_card'}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-body-md text-[14px] font-medium text-[#0b1c30] truncate">
                        {tx.counterparty}
                      </p>
                      {tx.tag && (
                        <span
                          className={`font-label-sm text-[10px] px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5 ${
                            tx.tag === 'Audit Alert' || tx.tag === 'No Invoice'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : 'bg-[#82f5c1]/40 text-[#00714e]'
                          }`}
                        >
                          {tx.tag === 'Verified' && (
                            <span className="material-symbols-outlined text-[11px]">verified</span>
                          )}
                          {tx.tag}
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-[12px] text-[#45464d] truncate">
                      {tx.accountLabel || tx.paymentMethod} • {tx.time || tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span
                    className={`font-label-lg text-[14px] font-bold tabular-nums ${
                      isCredit ? 'text-[#006c4a]' : 'text-[#0b1c30]'
                    }`}
                  >
                    {isCredit ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                  </span>
                  <p className="font-label-sm text-[11px] text-[#45464d] truncate max-w-[100px]">
                    {tx.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Receipt Quick-Upload Hint / AI Matcher */}
      <section
        onClick={() => setActiveScreen('ledger')}
        className="bg-[#e5eeff] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#dce9ff] transition-colors border border-[#d3e4fe]"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#ffffff] flex items-center justify-center text-[#006c4a] shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="min-w-0">
            <p className="font-label-md text-[13px] text-[#0b1c30] font-semibold truncate">
              AI Receipt Matcher
            </p>
            <p className="font-body-sm text-[12px] text-[#45464d] truncate">
              {unreconciledCount === 0
                ? '0 missing receipts detected'
                : `${unreconciledCount} missing receipts detected — Tap to view`}
            </p>
          </div>
        </div>
        <span
          className={`font-label-sm text-[11px] px-2.5 py-1 rounded-full font-semibold shrink-0 shadow-xs ${
            unreconciledCount === 0
              ? 'text-[#006c4a] bg-[#ffffff]'
              : 'text-[#ba1a1a] bg-[#ffdad6]'
          }`}
        >
          {unreconciledCount === 0 ? 'Optimal' : `${unreconciledCount} Action`}
        </span>
      </section>
    </div>
  );
};
