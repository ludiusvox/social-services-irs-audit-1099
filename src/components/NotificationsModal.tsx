import React from 'react';
import { useLedger } from '../context/LedgerContext';

export const NotificationsModal: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, unreconciledCount } = useLedger();

  if (!isNotificationsOpen) return null;

  const NOTIFICATIONS = [
    {
      id: '1',
      title: 'Q4 Estimated Tax Safe Harbor Achieved',
      desc: 'Based on your $18,420.50 net profit, you have satisfied IRS safe harbor thresholds for quarter 4.',
      time: '2h ago',
      icon: 'verified',
      color: 'text-[#006c4a] bg-[#82f5c1]/30',
    },
    {
      id: '2',
      title: `${unreconciledCount} Transactions Require Attention`,
      desc: 'Uber Technologies ($38.40) & Figma Professional ($110.00) are flagged for missing receipt photo proof.',
      time: '5h ago',
      icon: 'warning',
      color: 'text-[#ba1a1a] bg-[#ffdad6]',
    },
    {
      id: '3',
      title: 'Double-Entry Vault Synced',
      desc: 'All 34 entries backed up to client-side encrypted IndexedDB store.',
      time: 'Yesterday',
      icon: 'cloud_done',
      color: 'text-[#565e74] bg-[#e5eeff]',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#0b1c30]/40 backdrop-blur-sm p-4 pt-16"
      onClick={() => setIsNotificationsOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[#ffffff] rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#0b1c30]">notifications</span>
            <h3 className="font-headline-sm text-[16px] font-bold text-[#0b1c30]">Notifications</h3>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#45464d]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3">
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-xl bg-[#eff4ff]/60 hover:bg-[#eff4ff] flex items-start gap-3 transition-colors"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-semibold text-[#0b1c30] truncate">{n.title}</h4>
                  <span className="text-[10px] text-[#76777d]">{n.time}</span>
                </div>
                <p className="text-[12px] text-[#45464d] mt-0.5 leading-snug">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
