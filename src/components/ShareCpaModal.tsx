import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';

export const ShareCpaModal: React.FC = () => {
  const { isShareCpaOpen, setIsShareCpaOpen, showToast } = useLedger();
  const [email, setEmail] = useState('marcus.cpa@taxpartners.com');
  const [isSending, setIsSending] = useState(false);

  if (!isShareCpaOpen) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsShareCpaOpen(false);
      showToast(`Encrypted bundle sent to ${email}`, 'mark_email_read');
    }, 800);
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
              Secure CPA Handoff
            </h3>
          </div>
          <button
            onClick={() => setIsShareCpaOpen(false)}
            className="w-8 h-8 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#45464d] hover:bg-[#dce9ff]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-[12px] text-[#45464d] leading-relaxed">
          LedgerLens will compile a clean audited ledger package and deliver an encrypted 7-day download link to your tax preparer.
        </p>

        <div className="space-y-1">
          <label className="font-label-sm text-[11px] text-[#0b1c30] font-semibold">
            Accountant or CPA Email
          </label>
          <div className="flex items-center bg-[#eff4ff] rounded-lg px-3 py-2.5 border border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#76777d] text-[18px] mr-2">mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cpa@firm.com"
              className="bg-transparent text-[#0b1c30] font-body-md text-[14px] w-full outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2 bg-[#eff4ff] px-3 rounded-lg border border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">lock</span>
            <span className="font-label-sm text-[11px] text-[#0b1c30] font-medium">
              Require PIN to unpack receipts
            </span>
          </div>
          <span className="font-label-sm text-[11px] font-mono font-bold text-[#0b1c30] bg-[#ffffff] px-2 py-0.5 rounded shadow-sm">
            4920
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsShareCpaOpen(false)}
            className="flex-1 py-2.5 rounded-lg bg-[#e5eeff] font-label-md text-[12px] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="flex-1 py-2.5 rounded-lg bg-[#000000] text-[#ffffff] font-label-md text-[12px] font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            {isSending ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Send Package</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
