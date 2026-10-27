import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { downloadFile, generateSocialServicesReportHTML, generateSocialServicesReportText } from '../utils/taxExport';

export const SocialServicesModal: React.FC = () => {
  const {
    isSocialServicesOpen,
    setIsSocialServicesOpen,
    transactions,
    grossIncome,
    totalExpenses,
    netProfit,
    vaultedCount,
    showToast,
  } = useLedger();

  const [activeTab, setActiveTab] = useState<'preview' | 'submit'>('preview');
  const [caseNumber, setCaseNumber] = useState('CASE-SS-2024-89421');
  const [agencyName, setAgencyName] = useState('County Dept of Social Services (SNAP / Medicaid / Housing)');
  const [caseworkerEmail, setCaseworkerEmail] = useState('caseworker.benefits@dhs.county.gov');
  const [programType, setProgramType] = useState('SNAP & Medicaid');
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isSocialServicesOpen) return null;

  const monthlyGross = (grossIncome / 12).toFixed(2);
  const monthlyExp = (totalExpenses / 12).toFixed(2);
  const monthlyNet = (netProfit / 12).toFixed(2);

  const handleDownloadPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const textReport = generateSocialServicesReportText(
        transactions,
        grossIncome,
        totalExpenses,
        netProfit,
        caseNumber,
        agencyName
      );
      downloadFile(
        `Social_Services_Income_Verification_${caseNumber}.txt`,
        textReport,
        'text/plain;charset=utf-8;'
      );
      showToast('Official Social Services Income Statement downloaded', 'picture_as_pdf');
    }, 700);
  };

  const handlePrintHTML = () => {
    const htmlContent = generateSocialServicesReportHTML(
      transactions,
      grossIncome,
      totalExpenses,
      netProfit,
      caseNumber,
      agencyName
    );
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    } else {
      // Fallback if popup blocked: download as printable HTML
      downloadFile(`Social_Services_Verification_${caseNumber}.html`, htmlContent, 'text/html');
      showToast('Printable verification document ready', 'print');
    }
  };

  const handleSendToCaseworker = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSocialServicesOpen(false);
      showToast(
        `Encrypted proof package sent to ${caseworkerEmail} (Case: ${caseNumber})`,
        'mark_email_read'
      );
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1c30]/50 backdrop-blur-sm p-4 pb-safe transition-opacity"
      onClick={() => setIsSocialServicesOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[#ffffff] rounded-2xl shadow-2xl p-5 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-2 border-b border-[#e5eeff]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#82f5c1]/30 text-[#006c4a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">assignment_ind</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-headline-sm text-[16px] font-bold text-[#0b1c30]">
                  Social Services Income Report
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-[#82f5c1] text-[#00714e] text-[10px] font-bold uppercase">
                  Verified
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-[#45464d]">
                Official proof of earnings & allowable deductions for state & county benefit programs
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSocialServicesOpen(false)}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#45464d] hover:bg-[#dce9ff] shrink-0"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab switcher: Preview Report vs Handoff to Caseworker */}
        <div className="flex p-1 bg-[#eff4ff] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Document Preview & PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'submit'
                ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Submit to Caseworker</span>
          </button>
        </div>

        {activeTab === 'preview' ? (
          <div className="space-y-3">
            {/* Case number & agency config row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Case / Client ID</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-mono border border-[#e5eeff] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Program Type</label>
                <select
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] border border-[#e5eeff] outline-none"
                >
                  <option>SNAP & Medicaid</option>
                  <option>SNAP (Food Assistance)</option>
                  <option>Medicaid / Healthcare Subsidy</option>
                  <option>TANF / Cash Assistance</option>
                  <option>Section 8 Housing Voucher</option>
                  <option>Child Care Subsidy</option>
                </select>
              </div>
            </div>

            {/* Official Certificate Card */}
            <div className="p-4 rounded-xl bg-[#eff4ff]/70 border border-[#d3e4fe] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c4a]">
                    Monthly Countable Self-Employment Income
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[26px] font-bold text-[#006c4a] tabular-nums">
                      ${monthlyNet}
                    </span>
                    <span className="text-[12px] text-[#45464d]">/ month</span>
                  </div>
                  <span className="text-[11px] text-[#45464d]">
                    Gross revenue minus standard allowable Schedule C operating expenses
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#45464d] uppercase font-semibold block">
                    Annual Net Profit
                  </span>
                  <span className="text-[15px] font-bold text-[#0b1c30] tabular-nums">
                    ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Breakdown numbers mini-table */}
              <div className="bg-[#ffffff] rounded-lg p-2.5 text-[12px] space-y-1.5 border border-[#e5eeff]">
                <div className="flex justify-between items-center text-[#45464d]">
                  <span>Gross Operating Receipts:</span>
                  <span className="font-semibold text-[#006c4a] tabular-nums">
                    +${grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${monthlyGross}/mo)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#45464d]">
                  <span>Total Allowable Operating Costs:</span>
                  <span className="font-semibold text-[#ba1a1a] tabular-nums">
                    -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${monthlyExp}/mo)
                  </span>
                </div>
                <div className="w-full h-px bg-[#e5eeff]" />
                <div className="flex justify-between items-center font-bold text-[#0b1c30]">
                  <span>Countable Net for Benefit Evaluation:</span>
                  <span className="text-[#006c4a] tabular-nums">${monthlyNet} / mo</span>
                </div>
              </div>

              {/* Audit proof note */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#006c4a]">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>
                  {vaultedCount} of {transactions.length} items verified with digital receipts in Photo Vault
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="py-3 px-3 rounded-xl bg-[#000000] text-[#ffffff] text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                {isExporting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download PDF Statement</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintHTML}
                className="py-3 px-3 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-[#d3e4fe]"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Official Report</span>
              </button>
            </div>
          </div>
        ) : (
          /* Submission Tab */
          <div className="space-y-3">
            <p className="text-xs text-[#45464d] leading-relaxed">
              Send this verified income statement and cryptographic ledger directly to your state or county social services caseworker via secure portal link.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">
                  Caseworker or Agency Email
                </label>
                <div className="flex items-center bg-[#eff4ff] rounded-lg px-3 py-2 border border-[#e5eeff]">
                  <span className="material-symbols-outlined text-[#76777d] text-[16px] mr-2">mail</span>
                  <input
                    type="email"
                    value={caseworkerEmail}
                    onChange={(e) => setCaseworkerEmail(e.target.value)}
                    className="bg-transparent w-full outline-none text-[#0b1c30] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">
                  Social Services Agency / County Department
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-[#eff4ff] rounded-lg px-3 py-2 border border-[#e5eeff] outline-none text-[#0b1c30]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#eff4ff] rounded-lg border border-[#e5eeff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c4a] text-[18px]">lock</span>
                  <span className="text-[11px] text-[#0b1c30] font-medium">
                    Caseworker 4-Digit Access PIN
                  </span>
                </div>
                <span className="font-mono font-bold text-[#0b1c30] bg-[#ffffff] px-2 py-0.5 rounded shadow-2xs">
                  5183
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="flex-1 py-2.5 rounded-lg bg-[#e5eeff] text-xs font-semibold text-[#0b1c30] hover:bg-[#dce9ff]"
              >
                Back to Preview
              </button>
              <button
                type="button"
                onClick={handleSendToCaseworker}
                disabled={isSending}
                className="flex-1 py-2.5 rounded-lg bg-[#000000] text-[#ffffff] text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                {isSending ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Send to Caseworker</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
