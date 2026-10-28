import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLedger } from '../context/LedgerContext';
import { PaymentMethod, TransactionType } from '../types';
import { INITIAL_RECEIPTS } from '../data/initialData';
import { takeReceiptPhotoNative } from '../utils/capacitorNative';

export const LogTransactionScreen: React.FC = () => {
  const { addTransaction, setActiveScreen, logFormPreset, setLogFormPreset, transactions } = useLedger();

  const [type, setType] = useState<TransactionType>(logFormPreset?.type || 'income');
  const [amount, setAmount] = useState<string>('142.50');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [counterparty, setCounterparty] = useState<string>('');
  const [category, setCategory] = useState<string>('client-payment');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState<string>('');
  
  // Attached receipt state
  const [hasReceipt, setHasReceipt] = useState<boolean>(true);
  const [receiptImage, setReceiptImage] = useState<string>(INITIAL_RECEIPTS.apexSampleScan.imageUrl);
  const [receiptFileName, setReceiptFileName] = useState<string>('IMG_20240518_APX.jpg');
  const [receiptFileSize, setReceiptFileSize] = useState<string>('2.4 MB');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = async () => {
    const photo = await takeReceiptPhotoNative();
    if (photo) {
      setReceiptImage(photo.url);
      setReceiptFileName(photo.fileName);
      setReceiptFileSize(photo.size);
      setHasReceipt(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (logFormPreset?.type) {
      setType(logFormPreset.type);
    }
    if (logFormPreset?.triggerCamera) {
      setType('expense');
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 300);
    }
    setLogFormPreset(null);
  }, [logFormPreset, setLogFormPreset]);

  const handleTypeSwitch = (newType: TransactionType) => {
    setType(newType);
  };

  const recentCounterparties = useMemo(() => {
    const unique = new Set<string>();
    for (const tx of transactions) {
      if (tx.type === type && tx.counterparty) {
        unique.add(tx.counterparty);
      }
      if (unique.size >= 3) break;
    }
    const list = Array.from(unique);
    if (list.length === 0) {
       return type === 'income' ? ['Client Payment', 'Stripe Payout', 'Upwork'] : ['Office Supplies', 'Software Sub', 'Travel'];
    }
    return list.slice(0, 3);
  }, [transactions, type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setReceiptFileName(file.name);
        setReceiptFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
        setHasReceipt(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);

      const categoryMap: Record<string, { label: string; line: string }> = {
        'client-payment': { label: 'Client Payment', line: 'Gross Receipts (Line 1)' },
        'retainer': { label: 'Monthly Retainer', line: 'Gross Receipts (Line 1)' },
        'software': { label: 'Software & SaaS', line: 'Line 18' },
        'travel': { label: 'Travel & Meals', line: 'Line 9' },
        'supplies': { label: 'Office Supplies', line: 'Line 22' },
        'equipment': { label: 'Hardware Equipment', line: 'Line 27a' },
      };

      const matchedCat = categoryMap[category] || { label: category, line: 'Line 27a' };

      addTransaction({
        type,
        amount: parsedAmount,
        counterparty: counterparty || (type === 'income' ? 'Client Payer' : 'Merchant Payee'),
        category: matchedCat.label,
        categoryLine: matchedCat.line,
        date: date || new Date().toISOString().split('T')[0],
        time: 'Just now',
        paymentMethod: method,
        accountLabel: method === 'cash' ? 'Cash' : method === 'paypal' ? 'PayPal' : method === 'card' ? 'Card' : 'Direct Deposit',
        memo,
        tag: type === 'income' ? 'Invoice Cleared' : 'Logged',
        taxTag: type === 'income' ? 'Gross Inflow' : '100% Write-off',
        hasReceipt,
        receipt: hasReceipt
          ? {
              id: `rc-new-${Date.now()}`,
              fileName: receiptFileName,
              imageUrl: receiptImage,
              thumbnailUrl: receiptImage,
              title: `${counterparty} Document`,
              ocrAmount: `$${parsedAmount.toFixed(2)}`,
              ocrConfidence: 100,
              timestamp: 'Just now',
              fileSize: receiptFileSize,
              taxDeductibleType: matchedCat.line,
            }
          : undefined,
      });

      setTimeout(() => {
        setIsSaved(false);
        setActiveScreen('ledger');
      }, 1200);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-12 space-y-4">
      {/* Hidden file input for camera / file upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Interactive Segmented Type Switch */}
      <div className="bg-[#e5eeff] p-1 rounded-xl flex items-center justify-between shadow-sm relative">
        <button
          type="button"
          onClick={() => handleTypeSwitch('income')}
          className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-label-lg text-[14px] transition-all duration-200 select-none ${
            type === 'income'
              ? 'bg-[#ffffff] text-[#0b1c30] shadow-sm font-semibold'
              : 'text-[#45464d] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#006c4a]">
            arrow_downward_alt
          </span>
          <span>Income Received</span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeSwitch('expense')}
          className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 font-label-lg text-[14px] transition-all duration-200 select-none ${
            type === 'expense'
              ? 'bg-[#ffffff] text-[#0b1c30] shadow-sm font-semibold'
              : 'text-[#45464d] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#f83256]">
            arrow_upward_alt
          </span>
          <span>Expense Paid</span>
        </button>
      </div>

      {/* Currency Big Numeric Entry & Presets */}
      <div className="bg-[#ffffff] rounded-xl p-5 shadow-sm flex flex-col items-center border border-[#e5eeff]/60">
        <span className="font-label-sm text-[11px] text-[#45464d] uppercase tracking-wider mb-1 font-semibold">
          {type === 'income' ? 'Received Amount' : 'Expense Total'}
        </span>

        <div className="flex items-center justify-center w-full my-1">
          <span className="font-headline-xl-mobile text-[32px] text-[#45464d] font-semibold select-none mr-1">
            $
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-48 bg-transparent text-center font-headline-xl-mobile text-[34px] text-[#0b1c30] font-bold focus:outline-none placeholder:text-[#c6c6cd] caret-[#006c4a] tabular-nums"
          />
        </div>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
          {['50.00', '100.00', '250.00', '500.00', '1000.00'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-[12px] font-semibold transition-all active:scale-95 ${
                amount === preset
                  ? 'bg-[#000000] text-[#ffffff] shadow-sm'
                  : 'bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30]'
              }`}
            >
              ${parseInt(preset).toLocaleString('en-US')}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="flex flex-col space-y-1">
        <label className="font-label-md text-[12px] text-[#0b1c30] font-semibold flex items-center justify-between px-0.5">
          <span>Payment Method</span>
          <span className="font-body-sm text-[11px] text-[#45464d] font-normal">
            {type === 'income' ? 'Inflow Account' : 'Paid From'}
          </span>
        </label>

        <div className={`grid ${type === 'expense' ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
          {/* Cash */}
          <button
            type="button"
            onClick={() => setMethod('cash')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
              method === 'cash'
                ? 'bg-[#82f5c1]/40 text-[#00714e] ring-2 ring-[#006c4a]/50 shadow-sm'
                : 'bg-[#e5eeff] text-[#45464d] hover:bg-[#dce9ff]'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                method === 'cash' ? 'bg-[#82f5c1]' : 'bg-[#d3e4fe]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-[#006c4a]">payments</span>
            </div>
            <span className="font-label-sm text-[12px] font-semibold">Cash</span>
          </button>

          {/* PayPal */}
          <button
            type="button"
            onClick={() => setMethod('paypal')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
              method === 'paypal'
                ? 'bg-[#d3e4fe] text-[#0b1c30] ring-2 ring-[#565e74]/50 shadow-sm'
                : 'bg-[#e5eeff] text-[#45464d] hover:bg-[#dce9ff]'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                method === 'paypal' ? 'bg-[#bec6e0]' : 'bg-[#d3e4fe]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-[#131b2e]">
                account_balance_wallet
              </span>
            </div>
            <span className="font-label-sm text-[12px] font-semibold">PayPal</span>
          </button>

          {/* Direct Deposit */}
          <button
            type="button"
            onClick={() => setMethod('deposit')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
              method === 'deposit'
                ? 'bg-[#d3e4fe] text-[#0b1c30] ring-2 ring-[#0b1c30]/50 shadow-sm'
                : 'bg-[#e5eeff] text-[#45464d] hover:bg-[#dce9ff]'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                method === 'deposit' ? 'bg-[#cbdbf5]' : 'bg-[#d3e4fe]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] text-[#45464d]">
                account_balance
              </span>
            </div>
            <span className="font-label-sm text-[12px] font-semibold">{type === 'income' ? 'Direct Dep.' : 'Bank Acct'}</span>
          </button>

          {/* Card (Expense Only) */}
          {type === 'expense' && (
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                method === 'card'
                  ? 'bg-[#d3e4fe] text-[#0b1c30] ring-2 ring-[#0b1c30]/50 shadow-sm'
                  : 'bg-[#e5eeff] text-[#45464d] hover:bg-[#dce9ff]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                  method === 'card' ? 'bg-[#cbdbf5]' : 'bg-[#d3e4fe]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-[#45464d]">
                  credit_card
                </span>
              </div>
              <span className="font-label-sm text-[12px] font-semibold">Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Detailed Ledger Metadata Inputs */}
      <div className="bg-[#ffffff] rounded-xl p-4 shadow-sm space-y-3 border border-[#e5eeff]/60">
        {/* Vendor / Client Name with Quick Suggestions */}
        <div className="space-y-1">
          <label className="font-label-md text-[12px] text-[#0b1c30] font-semibold">
            {type === 'income' ? 'Client or Payer' : 'Vendor or Payee'}
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[20px] text-[#76777d]">
              storefront
            </span>
            <input
              type="text"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="e.g. Acme Corp, Client Name"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] font-body-md text-[14px] focus:outline-none focus:bg-[#ffffff] border border-transparent focus:border-[#0b1c30]/20 transition-colors"
            />
          </div>

          {/* Suggestion chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
            <span className="font-label-sm text-[11px] text-[#45464d] whitespace-nowrap">
              Recent:
            </span>
            {recentCounterparties.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCounterparty(name)}
                className="px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] font-label-sm text-[11px] whitespace-nowrap hover:bg-[#d3e4fe] transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Date Picker */}
        <div className="grid grid-cols-2 gap-3">
          {/* Category */}
          <div className="space-y-1">
            <label className="font-label-md text-[12px] text-[#0b1c30] font-semibold">Category</label>
            <div className="relative flex items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-body-md text-[13px] appearance-none focus:outline-none focus:bg-[#ffffff] border border-transparent focus:border-[#0b1c30]/20 transition-colors"
              >
                <option value="client-payment">Client Payment</option>
                <option value="retainer">Monthly Retainer</option>
                <option value="software">Software & SaaS</option>
                <option value="travel">Travel & Meals</option>
                <option value="supplies">Office Supplies</option>
                <option value="equipment">Hardware Equipment</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-[18px] text-[#76777d]">
                expand_more
              </span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="font-label-md text-[12px] text-[#0b1c30] font-semibold">Date</label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-body-md text-[13px] focus:outline-none focus:bg-[#ffffff] border border-transparent focus:border-[#0b1c30]/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Optional Memo/Notes */}
        <div className="space-y-1">
          <label className="font-label-md text-[12px] text-[#0b1c30] font-semibold flex items-center justify-between">
            <span>Memo / Reference Notes</span>
            <span className="font-body-sm text-[11px] text-[#45464d] font-normal">Optional</span>
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add invoice #, project tags, or audit notes..."
            rows={2}
            className="w-full p-2.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] font-body-md text-[13px] focus:outline-none focus:bg-[#ffffff] border border-transparent focus:border-[#0b1c30]/20 transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Receipt & Proof of Payment Section */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-[#006c4a]">
              receipt_long
            </span>
            <h3 className="font-headline-sm text-[16px] text-[#0b1c30] font-bold">
              Receipt & Photo Proof
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#82f5c1]/60 text-[#00714e] font-label-sm text-[11px] font-semibold">
            IndexedDB Ready
          </span>
        </div>

        {/* Active Attached Preview Card */}
        {hasReceipt && (
          <div className="bg-[#ffffff] rounded-xl p-3.5 shadow-sm flex flex-col space-y-2 border border-[#e5eeff]/60 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#d3e4fe] shadow-sm">
                <img
                  src={receiptImage}
                  alt="Receipt Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/60 via-transparent to-transparent" />
                <span className="material-symbols-outlined absolute bottom-1 right-1 text-[#f8f9ff] text-[16px]">
                  verified
                </span>
              </div>

              {/* Metadata & OCR Tag */}
              <div className="flex-1 flex flex-col justify-between h-24 py-0.5 min-w-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] font-label-sm text-[11px] font-semibold truncate">
                      <span className="material-symbols-outlined text-[12px]">document_scanner</span>
                      Auto-scanned ${amount}
                    </span>
                  </div>
                  <p className="font-label-md text-[13px] text-[#0b1c30] font-semibold truncate">
                    {receiptFileName}
                  </p>
                  <p className="font-body-sm text-[11px] text-[#45464d]">
                    May 18, 2024 • 14:32 PM ({receiptFileSize})
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="flex items-center gap-1 font-label-sm text-[11px] text-[#0b1c30] hover:text-[#006c4a] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">cached</span> Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasReceipt(false)}
                    className="flex items-center gap-1 font-label-sm text-[11px] text-[#ba1a1a] font-semibold hover:opacity-80 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Capture Box / Android Photos Trigger */}
        <div
          onClick={handleCameraCapture}
          className="relative rounded-xl p-5 bg-[#eff4ff]/70 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#e5eeff] transition-all active:scale-[0.99] group border-2 border-dashed border-[#76777d]/40"
        >
          <div className="w-12 h-12 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#0b1c30] group-hover:scale-110 transition-transform mb-1 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">photo_camera</span>
          </div>
          <h4 className="font-headline-sm text-[15px] text-[#0b1c30] font-bold">
            Tap to capture or upload receipt
          </h4>
          <p className="font-body-sm text-[12px] text-[#45464d] max-w-xs mt-0.5">
            Direct from Android Photos, Camera, or Files
          </p>
          <div className="flex items-center gap-1 mt-2 text-[#00714e] bg-[#82f5c1]/40 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]">lock_open</span>
            <span className="font-label-sm text-[11px]">
              Stored locally in DOM / IndexedDB database
            </span>
          </div>
        </div>
      </div>

      {/* Primary Confirmation Action CTA */}
      <div className="pt-2 pb-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-3.5 px-4 rounded-xl font-label-lg text-[14px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all select-none ${
            isSaved
              ? 'bg-[#006c4a] text-[#ffffff]'
              : 'bg-[#000000] text-[#ffffff] hover:opacity-95'
          }`}
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span>Securing to Vault...</span>
            </>
          ) : isSaved ? (
            <>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Entry Vaulted!</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              <span>Save to Ledger & Photo Vault</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-2 text-center">
          <span className="material-symbols-outlined text-[14px] text-[#006c4a]">check_circle</span>
          <span className="font-label-sm text-[11px] text-[#45464d]">
            Instant double-entry sync • 256-bit client-side encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
