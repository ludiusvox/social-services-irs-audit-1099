import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { downloadFile, generateSocialServicesReportHTML } from '../utils/taxExport';
import { shareDocumentNative } from '../utils/capacitorNative';
// @ts-ignore
import html2pdf from 'html2pdf.js';

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
    userProfile,
  } = useLedger();

  const [caseNumber, setCaseNumber] = useState('CASE-SS-2024-89421');
  const [agencyName, setAgencyName] = useState('County Dept of Social Services (SNAP / Medicaid / Housing)');
  const [programType, setProgramType] = useState('SNAP & Medicaid');
  const [isExporting, setIsExporting] = useState(false);

  if (!isSocialServicesOpen) return null;

  const monthlyGross = (grossIncome / 12).toFixed(2);
  const monthlyExp = (totalExpenses / 12).toFixed(2);
  const monthlyNet = (netProfit / 12).toFixed(2);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const htmlContent = generateSocialServicesReportHTML(
        transactions,
        grossIncome,
        totalExpenses,
        netProfit,
        caseNumber,
        agencyName,
        userProfile
      );

      const element = document.createElement('div');
      element.innerHTML = htmlContent;

      const filename = `Social_Services_Income_Verification_${caseNumber}.pdf`;

      const opt = {
        margin:       10,
        filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, allowTaint: true },
        jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().from(element).set(opt).save();

      showToast('PDF Statement saved to device. Attach file in Gmail/Outlook.', 'picture_as_pdf');
    } catch (error) {
      showToast('Error generating PDF statement', 'error');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToEmail = async () => {
    setIsExporting(true);
    try {
      const htmlContent = generateSocialServicesReportHTML(
        transactions,
        grossIncome,
        totalExpenses,
        netProfit,
        caseNumber,
        agencyName,
        userProfile
      );

      // Create a blob and share/launch native share dialog
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileUrl = URL.createObjectURL(blob);

      const shared = await shareDocumentNative(
        `Income Verification - Case ${caseNumber}`,
        `Official Proof of Income PDF for ${agencyName} (${programType}). Case Ref: ${caseNumber}`,
        fileUrl
      );

      if (!shared) {
        // Fallback to downloading printable HTML / PDF
        downloadFile(`Social_Services_Verification_${caseNumber}.html`, htmlContent, 'text/html');
        showToast('Verification document generated. Ready to attach in email.', 'mark_email_read');
      } else {
        showToast('Share sheet opened. Select Gmail or Outlook to send.', 'share');
      }
    } catch (e) {
      console.error('Error sharing report', e);
      showToast('Downloaded verification report', 'download');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintHTML = () => {
    const htmlContent = generateSocialServicesReportHTML(
      transactions,
      grossIncome,
      totalExpenses,
      netProfit,
      caseNumber,
      agencyName,
      userProfile
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
      downloadFile(`Social_Services_Verification_${caseNumber}.html`, htmlContent, 'text/html');
      showToast('Printable verification document ready', 'print');
    }
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
                Official proof of earnings & allowable deductions for benefit programs
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

        {/* Local device privacy banner */}
        <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#d3e4fe] flex items-start gap-2 text-xs text-[#0b1c30]">
          <span className="material-symbols-outlined text-[18px] text-[#006c4a] shrink-0 mt-0.5">
            phonelink_lock
          </span>
          <div className="space-y-0.5">
            <p className="font-semibold text-[12px]">Local Offline Storage & Privacy</p>
            <p className="text-[11px] text-[#45464d] leading-relaxed">
              LedgerLens runs entirely on your device. Generate a PDF report to save locally or attach directly in Gmail, Outlook Mobile, or Mail app.
            </p>
          </div>
        </div>

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

          <div>
            <label className="font-semibold text-[#0b1c30] text-xs block mb-1">
              Social Services Agency / County Department Name
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#eff4ff] text-[#0b1c30] border border-[#e5eeff] outline-none"
            />
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
                {vaultedCount} of {transactions.length} items verified with full digital receipt vouchers
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#000000] text-[#ffffff] text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Generating Local PDF...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  <span>Save PDF Report to Device (Attach to Gmail/Outlook)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareToEmail}
                className="py-2.5 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-[#d3e4fe]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006c4a]">share</span>
                <span>Share / Attach via Email App</span>
              </button>

              <button
                type="button"
                onClick={handlePrintHTML}
                className="py-2.5 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-[#d3e4fe]"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Official Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
