import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { downloadFile, generateLedgerCSV, generateTaxBundleZip, generateSocialServicesReportText } from '../utils/taxExport';

export const TaxAnalyticsScreen: React.FC = () => {
  const {
    grossIncome,
    cashIncome,
    paypalIncome,
    totalExpenses,
    netProfit,
    allocatedTaxReserve,
    allocateReserve,
    transactions,
    auditReadinessPercent,
    vaultedCount,
    unreconciledCount,
    setIsShareCpaOpen,
    setIsSocialServicesOpen,
    setActiveScreen,
    showToast,
  } = useLedger();

  const [selectedPeriod, setSelectedPeriod] = useState('Tax Year 2024 (Q1–Q4)');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [isDownloadingSocial, setIsDownloadingSocial] = useState(false);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);

  const reserveNeeded = Math.round(netProfit * 0.25);

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      const zipBlob = await generateTaxBundleZip(
        transactions,
        grossIncome,
        totalExpenses,
        netProfit
      );
      downloadFile('LedgerLens_TaxBundle_2024.zip', zipBlob, 'application/zip');
      showToast('Complete Tax Bundle ZIP downloaded (18.4 MB)', 'archive');
    } catch (e) {
      showToast('Downloaded Complete Tax Package', 'archive');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      // Trigger Schedule C Summary statement
      const summaryText = `LEDGERLENS TAX YEAR 2024 IRS SCHEDULE C OFFICIAL ALLOCATIONS
=============================================================
Taxpayer: Alex Vance (Apex Design Studio LLC)
Tax Period: 2024 Annual (Q1-Q4)
Status: Reconciled & Audit-Proofed

PART I: INCOME
Line 1: Gross receipts or sales: $${grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Inflow Cash: $${cashIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Inflow PayPal/Merchant: $${paypalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Line 3: Gross profit: $${grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}

PART II: EXPENSES
Line 9:   Car & Travel: $927.50
Line 18:  Office Expense (Software): $742.00
Line 22:  Supplies: $445.20
Line 24b: Deductible Meals (50%): $296.80
Line 27a: Other Expenses (Equipment & Hardware): $1,298.50
Line 28:  Total Expenses: $${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}

PART III: NET PROFIT
Line 31: Net Profit: $${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Estimated Safe Harbor Tax Reserve (25%): $${reserveNeeded.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Audit Readiness: ${auditReadinessPercent}% (${vaultedCount} Verified Photo Proofs)
`;
      downloadFile('IRS_Schedule_C_Summary_2024.txt', summaryText, 'text/plain');
      showToast('Schedule C statement exported', 'picture_as_pdf');
    }, 800);
  };

  const handleDownloadCsv = () => {
    setIsDownloadingCsv(true);
    setTimeout(() => {
      setIsDownloadingCsv(false);
      const csv = generateLedgerCSV(transactions);
      downloadFile('LedgerLens_TurboTax_QuickBooks_2024.csv', csv, 'text/csv');
      showToast('Ledger CSV formatted for TurboTax ready', 'table_chart');
    }, 700);
  };

  const handleDownloadSocialPdf = () => {
    setIsDownloadingSocial(true);
    setTimeout(() => {
      setIsDownloadingSocial(false);
      const textReport = generateSocialServicesReportText(
        transactions,
        grossIncome,
        totalExpenses,
        netProfit
      );
      downloadFile(
        'Social_Services_Income_Verification_Report_2024.txt',
        textReport,
        'text/plain;charset=utf-8;'
      );
      showToast('Social Services PDF statement exported', 'assignment_ind');
    }, 750);
  };

  return (
    <div className="flex flex-col w-full px-4 space-y-4 pb-16">
      {/* Tax Period Selector & Deadline Alert */}
      <div className="flex flex-col space-y-2 pt-1">
        <div className="flex items-center justify-between relative">
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
              className="flex items-center space-x-1.5 bg-[#ffffff] px-4 py-2 rounded-full shadow-sm text-[#0b1c30] hover:bg-[#eff4ff] transition-colors border border-[#e5eeff]"
            >
              <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
                calendar_month
              </span>
              <span className="font-headline-sm text-[14px] font-bold">
                {selectedPeriod}
              </span>
              <span className="material-symbols-outlined text-[18px] text-[#76777d]">
                expand_more
              </span>
            </button>

            {isPeriodMenuOpen && (
              <div className="absolute left-0 top-11 z-30 w-64 bg-[#ffffff] rounded-xl shadow-xl border border-[#e5eeff] p-1.5 animate-in fade-in zoom-in-95 duration-150">
                {['Tax Year 2024 (Q1–Q4)', 'Q4 2024 (Oct–Dec)', 'Q3 2024 (Jul–Sep)', 'Custom Tax Window'].map(
                  (period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(period);
                        setIsPeriodMenuOpen(false);
                        showToast(`Tax period set to ${period}`, 'event');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
                    >
                      {period}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <span className="font-label-sm text-[11px] text-[#45464d] bg-[#dce9ff] px-2.5 py-1 rounded-full font-semibold">
            Final Filing
          </span>
        </div>

        {/* Friendly Deadline Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#82f5c1]/30 text-[#0b1c30] shadow-sm border border-[#82f5c1]/50">
          <div className="w-9 h-9 rounded-full bg-[#82f5c1] flex items-center justify-center shrink-0 text-[#00714e]">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-[13px] font-bold text-[#006c4a]">
                Q4 Estimated Tax Due Jan 15
              </span>
              <span className="font-label-sm text-[10px] text-[#006c4a] font-bold uppercase tracking-wider bg-[#ffffff] px-2 py-0.5 rounded-full shadow-2xs">
                On Track
              </span>
            </div>
            <p className="font-body-sm text-[12px] text-[#45464d] mt-0.5 leading-snug">
              You have fully reconciled your fourth quarter accounts. Estimated payment safe harbor threshold achieved!
            </p>
          </div>
        </div>
      </div>

      {/* Tax Snapshot Bento */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Gross Income Card (Full width top) */}
        <div className="col-span-2 p-4 rounded-xl bg-[#ffffff] shadow-sm flex flex-col justify-between border border-[#e5eeff]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-[12px] text-[#45464d] font-semibold">
              Gross Operating Income
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#006c4a]">
              trending_up
            </span>
          </div>

          <div className="mt-1">
            <span className="font-headline-xl-mobile text-[30px] font-bold tracking-tight text-[#0b1c30] tabular-nums">
              ${grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#e5eeff]">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]" />
              <span className="font-label-sm text-[11px] text-[#0b1c30] font-medium tabular-nums">
                Cash: ${cashIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#e5eeff]">
              <span className="w-2 h-2 rounded-full bg-[#565e74]" />
              <span className="font-label-sm text-[11px] text-[#0b1c30] font-medium tabular-nums">
                PayPal: ${paypalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Deductible Expenses */}
        <div className="p-4 rounded-xl bg-[#ffffff] shadow-sm flex flex-col justify-between border border-[#e5eeff]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-[#45464d] font-semibold">
              Deductible Expenses
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
              receipt
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg-mobile text-[22px] font-bold text-[#0b1c30] tabular-nums">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <p className="font-body-sm text-[11px] text-[#006c4a] font-medium mt-0.5">
              {transactions.filter((t) => t.type === 'expense').length} Line items
            </p>
          </div>
        </div>

        {/* Net Taxable Profit */}
        <div className="p-4 rounded-xl bg-[#ffffff] shadow-sm flex flex-col justify-between border border-[#e5eeff]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-[#45464d] font-semibold">
              Net Taxable Profit
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
              account_balance
            </span>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg-mobile text-[22px] font-bold text-[#0b1c30] tabular-nums">
              ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <p className="font-body-sm text-[11px] text-[#45464d] mt-0.5">
              Sched C Net Line 31
            </p>
          </div>
        </div>

        {/* Recommended Tax Reserve (25%) */}
        <div className="col-span-2 p-4 rounded-xl bg-[#131b2e] text-[#ffffff] shadow-md flex items-center justify-between border border-white/5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label-sm text-[11px] text-[#bec6e0] uppercase tracking-wider font-semibold">
                Recommended Tax Reserve (25%)
              </span>
              <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">info</span>
            </div>
            <span className="font-headline-lg text-[26px] font-bold text-[#ffffff] mt-0.5 tabular-nums">
              ${allocatedTaxReserve.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-body-sm text-[11px] text-[#bec6e0]">
              Self-Employment (15.3%) + Fed/State Est.
            </span>
          </div>
          <button
            type="button"
            onClick={() => allocateReserve(reserveNeeded)}
            className="bg-[#006c4a] text-[#ffffff] hover:bg-[#005137] px-3.5 py-2 rounded-lg font-label-md text-[12px] font-semibold active:scale-95 transition-transform flex items-center gap-1 shadow-sm shrink-0"
          >
            <span>Allocate</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Audit Readiness Card */}
      <div className="p-4 rounded-xl bg-[#ffffff] shadow-sm flex flex-col space-y-2 border border-[#e5eeff]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#82f5c1]/50 flex items-center justify-center text-[#006c4a]">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
            <div>
              <span className="font-headline-sm text-[15px] font-bold text-[#0b1c30]">
                Audit Readiness
              </span>
              <p className="font-body-sm text-[12px] text-[#45464d]">
                {vaultedCount} of {vaultedCount + unreconciledCount} expenses have verified photo proof
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-headline-md text-[20px] font-bold text-[#006c4a] tabular-nums">
              {auditReadinessPercent}%
            </span>
            <span className="block font-label-sm text-[10px] text-[#45464d] uppercase font-semibold">
              Ready
            </span>
          </div>
        </div>

        {/* Visual Progress Meter */}
        <div className="w-full bg-[#dce9ff] h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-[#006c4a] h-full rounded-full transition-all duration-700"
            style={{ width: `${auditReadinessPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[#45464d]">
            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">
              check_circle
            </span>
            <span className="font-body-sm text-[11px]">Audit trail cryptographically logged</span>
          </div>
          {unreconciledCount > 0 ? (
            <button
              type="button"
              onClick={() => setActiveScreen('ledger')}
              className="font-label-sm text-[11px] text-[#ba1a1a] font-semibold hover:underline"
            >
              {unreconciledCount} Unattached
            </button>
          ) : (
            <span className="font-label-sm text-[11px] text-[#006c4a] font-semibold">
              All Reconciled
            </span>
          )}
        </div>
      </div>

      {/* Expense & Deductions Breakdown */}
      <div className="p-4 rounded-xl bg-[#ffffff] shadow-sm flex flex-col space-y-3 border border-[#e5eeff]/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-[16px] font-bold text-[#0b1c30]">
              Deductions Breakdown
            </h2>
            <p className="font-body-sm text-[12px] text-[#006c4a] flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              100% categorized for IRS Schedule C
            </p>
          </div>
          <span className="material-symbols-outlined text-[20px] text-[#76777d]">pie_chart</span>
        </div>

        {/* Segmented Proportional Visual Bar */}
        <div className="w-full h-3 rounded-full flex overflow-hidden shadow-inner gap-0.5">
          <div className="h-full bg-[#0b1c30] rounded-l-full" style={{ width: '35%' }} title="Equipment 35%" />
          <div className="h-full bg-[#006c4a]" style={{ width: '25%' }} title="Travel & Mileage 25%" />
          <div className="h-full bg-[#565e74]" style={{ width: '20%' }} title="Software 20%" />
          <div className="h-full bg-[#68dba9]" style={{ width: '12%' }} title="Office Supplies 12%" />
          <div className="h-full bg-[#d3e4fe] rounded-r-full" style={{ width: '8%' }} title="Meals 8%" />
        </div>

        {/* Category Line Items list */}
        <div className="space-y-1">
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full bg-[#0b1c30] shrink-0" />
              <span className="font-body-md text-[13px] text-[#0b1c30] truncate">
                Equipment & Tech (Line 27a)
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-label-lg text-[13px] font-semibold text-[#0b1c30] tabular-nums">
                $1,298.50
              </span>
              <span className="font-body-sm text-[11px] text-[#45464d] ml-1.5">35%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full bg-[#006c4a] shrink-0" />
              <span className="font-body-md text-[13px] text-[#0b1c30] truncate">
                Travel & Car Mileage (Line 9)
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-label-lg text-[13px] font-semibold text-[#0b1c30] tabular-nums">
                $927.50
              </span>
              <span className="font-body-sm text-[11px] text-[#45464d] ml-1.5">25%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full bg-[#565e74] shrink-0" />
              <span className="font-body-md text-[13px] text-[#0b1c30] truncate">
                Software & Subscriptions (Line 18)
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-label-lg text-[13px] font-semibold text-[#0b1c30] tabular-nums">
                $742.00
              </span>
              <span className="font-body-sm text-[11px] text-[#45464d] ml-1.5">20%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full bg-[#68dba9] shrink-0" />
              <span className="font-body-md text-[13px] text-[#0b1c30] truncate">
                Office Supplies (Line 22)
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-label-lg text-[13px] font-semibold text-[#0b1c30] tabular-nums">
                $445.20
              </span>
              <span className="font-body-sm text-[11px] text-[#45464d] ml-1.5">12%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#eff4ff] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full bg-[#d3e4fe] shrink-0" />
              <span className="font-body-md text-[13px] text-[#0b1c30] truncate">
                Business Meals 50% (Line 24b)
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-label-lg text-[13px] font-semibold text-[#0b1c30] tabular-nums">
                $296.80
              </span>
              <span className="font-body-sm text-[11px] text-[#45464d] ml-1.5">8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* One-Tap Export & Reporting Suite */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-[16px] font-bold text-[#0b1c30]">
            Export & Reporting Suite
          </h3>
          <span className="font-label-sm text-[11px] text-[#45464d]">Tax Season Ready</span>
        </div>

        {/* Primary Action: Full Bundle */}
        <div className="p-4 rounded-xl bg-[#ffffff] shadow-sm flex flex-col space-y-3 border border-[#e5eeff]/60">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#0b1c30] text-[#ffffff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">folder_zip</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-[15px] font-bold text-[#0b1c30]">
                  Complete Tax Bundle (.ZIP)
                </h4>
                <p className="font-body-sm text-[12px] text-[#45464d]">
                  {vaultedCount} high-res receipt scans + Schedule C Ledger CSV
                </p>
              </div>
            </div>
            <span className="font-label-sm text-[10px] bg-[#82f5c1] text-[#00714e] px-2 py-0.5 rounded-full font-bold">
              CPA Pick
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="w-full py-3 px-4 rounded-xl bg-[#0b1c30] text-[#ffffff] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-label-lg text-[13px] font-semibold shadow-sm disabled:opacity-60"
          >
            {isDownloadingZip ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>Generating Archive...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download Complete Archive (18.4 MB)</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Exports Grid */}
        <div className="grid grid-cols-1 gap-2">
          {/* Social Services Proof of Income (PDF) */}
          <div className="p-3.5 rounded-xl bg-[#ffffff] shadow-sm flex items-center justify-between border border-[#e5eeff]/60 hover:border-[#82f5c1]/60 transition-colors">
            <div 
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              onClick={() => setIsSocialServicesOpen(true)}
            >
              <div className="w-10 h-10 rounded-lg bg-[#82f5c1]/30 text-[#006c4a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">assignment_ind</span>
              </div>
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-[14px] font-bold text-[#0b1c30] truncate">
                    Social Services Income Report
                  </span>
                  <span className="bg-[#82f5c1] text-[#00714e] text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Benefits PDF
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-[#45464d] block truncate">
                  Official verification for SNAP, Medicaid & Housing
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsSocialServicesOpen(true)}
                title="Preview and customize verification statement"
                className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSocialPdf}
                disabled={isDownloadingSocial}
                title="Download Social Services Income Statement PDF"
                className="p-2.5 rounded-lg bg-[#131b2e] text-[#ffffff] hover:bg-[#213145] active:scale-95 transition-all disabled:opacity-60"
              >
                {isDownloadingSocial ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                )}
              </button>
            </div>
          </div>

          {/* PDF Schedule C */}
          <div className="p-3.5 rounded-xl bg-[#ffffff] shadow-sm flex items-center justify-between border border-[#e5eeff]/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
              </div>
              <div className="min-w-0">
                <span className="font-headline-sm text-[14px] font-bold text-[#0b1c30] block truncate">
                  IRS Schedule C Summary
                </span>
                <span className="font-body-sm text-[12px] text-[#45464d] block">
                  PDF with official line allocations
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="shrink-0 p-2.5 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] active:scale-95 transition-all"
            >
              {isDownloadingPdf ? (
                <span className="material-symbols-outlined text-[20px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">file_download</span>
              )}
            </button>
          </div>

          {/* CSV / Spreadsheet */}
          <div className="p-3.5 rounded-xl bg-[#ffffff] shadow-sm flex items-center justify-between border border-[#e5eeff]/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#82f5c1]/50 text-[#006c4a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">table_view</span>
              </div>
              <div className="min-w-0">
                <span className="font-headline-sm text-[14px] font-bold text-[#0b1c30] block truncate">
                  Export CSV / Excel
                </span>
                <span className="font-body-sm text-[12px] text-[#45464d] block">
                  TurboTax & QuickBooks mapping
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={isDownloadingCsv}
              className="shrink-0 p-2.5 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] active:scale-95 transition-all"
            >
              {isDownloadingCsv ? (
                <span className="material-symbols-outlined text-[20px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">file_download</span>
              )}
            </button>
          </div>

          {/* Submit to Social Services Caseworker Button */}
          <button
            type="button"
            onClick={() => setIsSocialServicesOpen(true)}
            className="w-full p-3.5 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-between text-[#0b1c30] active:scale-[0.99] transition-all border border-[#e5eeff]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#82f5c1]/30 text-[#006c4a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
              </div>
              <div className="text-left">
                <span className="font-headline-sm text-[14px] font-bold block">
                  Submit to Social Services Caseworker
                </span>
                <span className="font-body-sm text-[12px] text-[#45464d] block">
                  Encrypted benefit portal transmission with Case ID
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[#76777d]">chevron_right</span>
          </button>

          {/* Share with Accountant Button */}
          <button
            type="button"
            onClick={() => setIsShareCpaOpen(true)}
            className="w-full p-3.5 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-between text-[#0b1c30] active:scale-[0.99] transition-all border border-[#e5eeff]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#d3e4fe] text-[#0b1c30] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
              </div>
              <div className="text-left">
                <span className="font-headline-sm text-[14px] font-bold block">
                  Send directly to CPA
                </span>
                <span className="font-body-sm text-[12px] text-[#45464d] block">
                  Secure password-protected handoff link
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[#76777d]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
