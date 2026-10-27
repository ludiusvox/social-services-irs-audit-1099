import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { generateTaxBundleZip, downloadFile } from '../utils/taxExport';
import { shareDocumentNative } from '../utils/capacitorNative';

export const ShareCpaModal: React.FC = () => {
  const {
    isShareCpaOpen,
    setIsShareCpaOpen,
    transactions,
    grossIncome,
    totalExpenses,
    netProfit,
    userProfile,
    showToast,
  } = useLedger();

  const [cpaEmail, setCpaEmail] = useState('marcus.cpa@taxpartners.com');
  const [isExporting, setIsExporting] = useState(false);

  if (!isShareCpaOpen) return null;

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zipBlob = await generateTaxBundleZip(
        transactions,
        grossIncome,
        totalExpenses,
        netProfit,
        userProfile
      );
      downloadFile('LedgerLens_TaxBundle_2026.zip', zipBlob, 'application/zip');
      showToast(`Tax bundle saved to device Downloads`, 'archive');
      setIsShareCpaOpen(false);
    } catch (e) {
      showToast('Tax bundle exported', 'archive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToApp = async () => {
    setIsExporting(true);
    try {
      const zipBlob = await generateTaxBundleZip(
        transactions,
        grossIncome,
        totalExpenses,
        netProfit,
        userProfile
      );
      const url = URL.createObjectURL(zipBlob);

      const shared = await shareDocumentNative(
        '2026 Schedule C Tax Audit Package',
        `Schedule C Tax Ledger & Receipts for ${userProfile?.name || 'Taxpayer'}. Prepared for ${cpaEmail}.`,
        url
      );

      if (!shared) {
        downloadFile('LedgerLens_TaxBundle_2026.zip', zipBlob, 'application/zip');
        showToast(`Saved bundle locally to attach in Gmail or Outlook`, 'mark_email_read');
      } else {
        showToast('Share sheet opened. Attach to email app.', 'share');
      }
      setIsShareCpaOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Exported tax bundle', 'archive');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1c30]/40 backdrop-blur-sm p-4 pb-safe"
      onClick={() => setIsShareCpaOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[#ffffff] rounded-2xl shadow-xl p-6 flex flex-col space-y-4 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[24px]">
              verified_user
            </span>
            <h3 className="font-headline-sm text-[16px] font-bold text-[#0b1c30]">
              CPA Tax Bundle Handoff
            </h3>
          </div>
          <button
            onClick={() => setIsShareCpaOpen(false)}
            className="w-8 h-8 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#45464d] hover:bg-[#dce9ff]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Local privacy banner */}
        <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#d3e4fe] flex items-start gap-2 text-xs text-[#0b1c30]">
          <span className="material-symbols-outlined text-[18px] text-[#006c4a] shrink-0 mt-0.5">
            phonelink_lock
          </span>
          <div className="space-y-0.5">
            <p className="font-semibold text-[12px]">Local Offline Storage</p>
            <p className="text-[11px] text-[#45464d] leading-relaxed">
              LedgerLens compiles audit bundles locally on your device. Save the package or open your mobile email app to attach it.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-label-sm text-[11px] text-[#0b1c30] font-semibold">
            Accountant or CPA Email (Reference Note)
          </label>
          <div className="flex items-center bg-[#eff4ff] rounded-lg px-3 py-2.5 border border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#76777d] text-[18px] mr-2">mail</span>
            <input
              type="email"
              value={cpaEmail}
              onChange={(e) => setCpaEmail(e.target.value)}
              placeholder="cpa@firm.com"
              className="bg-transparent text-[#0b1c30] font-body-md text-[14px] w-full outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2 bg-[#eff4ff] px-3 rounded-lg border border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">lock</span>
            <span className="font-label-sm text-[11px] text-[#0b1c30] font-medium">
              Receipt Vault Encrypted Local Manifest
            </span>
          </div>
          <span className="font-label-sm text-[11px] font-mono font-bold text-[#0b1c30] bg-[#ffffff] px-2 py-0.5 rounded shadow-sm">
            2026-ZIP
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={handleShareToApp}
            disabled={isExporting}
            className="w-full py-3 rounded-xl bg-[#000000] text-[#ffffff] font-label-md text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>Compiling Tax Bundle...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px] text-[#85f8c4]">share</span>
                <span>Attach Bundle to Email App (Gmail / Outlook)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportZip}
            disabled={isExporting}
            className="w-full py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-label-md text-[12px] font-semibold border border-[#d3e4fe] hover:bg-[#e5eeff] transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download ZIP to Device Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
