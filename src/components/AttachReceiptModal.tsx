import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { INITIAL_RECEIPTS } from '../data/initialData';
import { ReceiptData } from '../types';

export const AttachReceiptModal: React.FC = () => {
  const { attachingTxId, setAttachingTxId, attachReceiptToTransaction, transactions } = useLedger();
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof INITIAL_RECEIPTS>('apexSampleScan');
  const [isScanning, setIsScanning] = useState(false);
  const [customFile, setCustomFile] = useState<{ name: string; url: string; size: string } | null>(null);

  if (!attachingTxId) return null;

  const targetTx = transactions.find((t) => t.id === attachingTxId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomFile({
        name: file.name,
        url,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  const handleConfirmAttach = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      let receiptToAttach: ReceiptData;

      if (customFile) {
        receiptToAttach = {
          id: `rc-user-${Date.now()}`,
          fileName: customFile.name,
          imageUrl: customFile.url,
          thumbnailUrl: customFile.url,
          title: `${targetTx?.counterparty || 'Transaction'} Verified Voucher`,
          ocrAmount: targetTx ? `$${targetTx.amount.toFixed(2)}` : '$142.50',
          ocrConfidence: 100,
          timestamp: 'Just now',
          fileSize: customFile.size,
          taxDeductibleType: targetTx?.categoryLine || 'Business Expense',
        };
      } else {
        const preset = INITIAL_RECEIPTS[selectedPreset];
        receiptToAttach = {
          ...preset,
          title: `${targetTx?.counterparty || 'Merchant'} Verified Slip`,
          ocrAmount: targetTx ? `$${targetTx.amount.toFixed(2)}` : preset.ocrAmount,
        };
      }

      attachReceiptToTransaction(attachingTxId, receiptToAttach);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0b1c30]/70 backdrop-blur-sm flex flex-col justify-end transition-opacity"
      onClick={() => setAttachingTxId(null)}
    >
      <div
        className="bg-[#ffffff] w-full max-w-md mx-auto rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between bg-[#eff4ff] border-b border-[#e5eeff]">
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-[16px] text-[#0b1c30] font-bold">
              Attach Proof of Payment
            </span>
            <span className="font-body-sm text-[12px] text-[#45464d] truncate">
              {targetTx?.counterparty} • ${targetTx?.amount.toFixed(2)} ({targetTx?.accountLabel || 'Unreconciled'})
            </span>
          </div>
          <button
            onClick={() => setAttachingTxId(null)}
            className="w-8 h-8 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#0b1c30] hover:bg-[#cbdbf5]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Native photo capture trigger */}
          <label className="block border-2 border-dashed border-[#76777d]/40 rounded-xl p-5 bg-[#eff4ff]/60 hover:bg-[#e5eeff]/50 transition-colors text-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-full bg-[#d3e4fe] mx-auto flex items-center justify-center text-[#0b1c30] mb-2">
              <span className="material-symbols-outlined text-[26px]">photo_camera</span>
            </div>
            <p className="font-headline-sm text-[14px] text-[#0b1c30] font-semibold">
              {customFile ? customFile.name : 'Take photo or choose from library'}
            </p>
            <p className="font-body-sm text-[12px] text-[#45464d] mt-0.5">
              Instant double-entry OCR matching & 256-bit vaulting
            </p>
          </label>

          {/* Preset sample vouchers */}
          <div className="space-y-2">
            <label className="font-label-sm text-[11px] text-[#45464d] uppercase tracking-wider font-semibold">
              Or Select Verified Sample Voucher:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['apexSampleScan', 'officeSupplies', 'blueBottle', 'vanguard'] as const).map((key) => {
                const item = INITIAL_RECEIPTS[key];
                const isSelected = selectedPreset === key && !customFile;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(key);
                      setCustomFile(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-[#006c4a] bg-[#82f5c1]/20 ring-1 ring-[#006c4a]'
                        : 'border-[#c6c6cd]/50 bg-[#ffffff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-9 h-11 object-cover rounded shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-[#0b1c30] truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[#006c4a] font-medium flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">verified</span>
                        {item.ocrAmount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmAttach}
            disabled={isScanning}
            className="w-full py-3.5 px-4 rounded-xl bg-[#000000] text-[#ffffff] font-label-lg text-[14px] font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isScanning ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                <span>Auto-scanning & Vaulting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">
                  check_circle
                </span>
                <span>Attach Proof & Vault Entry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
