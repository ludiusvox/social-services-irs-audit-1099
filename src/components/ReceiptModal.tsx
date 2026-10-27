import React from 'react';
import { useLedger } from '../context/LedgerContext';

export const ReceiptModal: React.FC = () => {
  const { selectedReceipt, setSelectedReceipt, showToast } = useLedger();

  if (!selectedReceipt) return null;

  const handleExportPDF = () => {
    showToast(`Exported ${selectedReceipt.fileName} statement PDF`, 'picture_as_pdf');
  };

  const handleRescan = () => {
    showToast('Scanner recalibrated. Align document in frame.', 'crop');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0b1c30]/70 backdrop-blur-sm flex flex-col justify-end transition-opacity duration-200"
      onClick={() => setSelectedReceipt(null)}
    >
      <div
        className="bg-[#ffffff] w-full max-w-md mx-auto rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between bg-[#eff4ff]">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-headline-sm text-[16px] text-[#0b1c30] font-bold truncate">
              {selectedReceipt.title || 'Receipt Document'}
            </span>
            <span className="font-body-sm text-[12px] text-[#45464d] truncate">
              {selectedReceipt.fileName} • {selectedReceipt.ocrAmount || 'Verified'}
            </span>
          </div>
          <button
            onClick={() => setSelectedReceipt(null)}
            className="w-9 h-9 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#0b1c30] hover:bg-[#cbdbf5] active:scale-95 transition-all shrink-0"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Image View Body */}
        <div className="p-4 flex flex-col items-center gap-3 overflow-y-auto">
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#dce9ff] shadow-inner aspect-[3/4] max-h-[440px] flex items-center justify-center">
            <img
              className="w-full h-full object-contain"
              alt={selectedReceipt.title}
              src={selectedReceipt.imageUrl}
              onError={(e) => {
                const target = e.currentTarget;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="%23ffdad6"/><text x="200" y="280" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="%23ba1a1a">Not Found</text><text x="200" y="320" font-family="sans-serif" font-size="16" text-anchor="middle" fill="%2393000a">Receipt image is broken or expired</text></svg>';
              }}
            />
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-[#0b1c30]/80 backdrop-blur-md rounded-full text-[#ffffff] font-label-sm text-[11px] flex items-center gap-1.5 shadow-md">
              <span className="material-symbols-outlined text-[14px] text-[#85f8c4]">
                verified_user
              </span>
              <span>Audit Ready</span>
            </div>
          </div>

          {/* Quick Detail Badge Bar */}
          <div className="w-full grid grid-cols-2 gap-2">
            <div className="p-3 bg-[#eff4ff] rounded-xl flex flex-col">
              <span className="font-label-sm text-[11px] text-[#45464d]">OCR Recognition</span>
              <span className="font-label-lg text-[14px] text-[#006c4a] font-semibold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>{' '}
                {selectedReceipt.ocrConfidence ?? 100}% Matched
              </span>
            </div>
            <div className="p-3 bg-[#eff4ff] rounded-xl flex flex-col">
              <span className="font-label-sm text-[11px] text-[#45464d]">Deductibility</span>
              <span className="font-label-lg text-[14px] text-[#0b1c30] font-semibold mt-0.5 truncate">
                {selectedReceipt.taxDeductibleType || 'Business • Schedule C'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="w-full flex items-center gap-2 pt-1 pb-4">
            <button
              onClick={handleExportPDF}
              className="flex-1 py-3 bg-[#131b2e] text-[#ffffff] rounded-xl font-label-lg text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all hover:bg-[#213145]"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleRescan}
              className="py-3 px-4 bg-[#d3e4fe] text-[#0b1c30] rounded-xl font-label-lg text-[14px] font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-[#cbdbf5]"
            >
              <span className="material-symbols-outlined text-[18px]">crop</span>
              <span>Re-scan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
