import React, { useState, useRef } from 'react';
import { useLedger } from '../context/LedgerContext';

export const StartupProfileScreen: React.FC = () => {
  const { saveUserProfile } = useLedger();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [accountingMethod, setAccountingMethod] = useState('Cash / Schedule C');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !businessName.trim()) return;
    saveUserProfile({
      name: name.trim(),
      businessName: businessName.trim(),
      accountingMethod,
      profileImageUrl: profileImageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name.trim()) + '&background=82f5c1&color=006c4a'
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0b1c30]">Welcome!</h2>
          <p className="text-sm text-[#45464d] mt-1">Please set up your business profile</p>
        </div>

        {/* Photo Upload Area */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-[#c6c6cd] hover:border-[#006c4a] flex flex-col items-center justify-center transition-colors group"
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[#76777d] group-hover:text-[#006c4a] text-3xl mb-1">
                  add_a_photo
                </span>
                <span className="text-[10px] text-[#76777d] group-hover:text-[#006c4a] font-semibold">
                  Add Photo
                </span>
              </>
            )}
            {profileImageUrl && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-2xl">edit</span>
              </div>
            )}
          </button>
        </div>

        <div className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#45464d] mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex Vance"
              className="w-full bg-[#f8f9ff] text-[#0b1c30] p-3 rounded-xl border border-[#e5eeff] focus:outline-none focus:ring-2 focus:ring-[#82f5c1] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#45464d] mb-1">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Design Studio LLC"
              className="w-full bg-[#f8f9ff] text-[#0b1c30] p-3 rounded-xl border border-[#e5eeff] focus:outline-none focus:ring-2 focus:ring-[#82f5c1] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#45464d] mb-1">Accounting Method</label>
            <select
              value={accountingMethod}
              onChange={e => setAccountingMethod(e.target.value)}
              className="w-full bg-[#f8f9ff] text-[#0b1c30] p-3 rounded-xl border border-[#e5eeff] focus:outline-none focus:ring-2 focus:ring-[#82f5c1] text-sm appearance-none"
            >
              <option value="Cash / Schedule C">Cash / Schedule C</option>
              <option value="Accrual / 1120S">Accrual / 1120S</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !businessName.trim()}
          className="w-full py-3 bg-[#006c4a] text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};
