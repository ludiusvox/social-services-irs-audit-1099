import React from 'react';
import { LedgerProvider, useLedger } from './context/LedgerContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OverviewScreen } from './screens/OverviewScreen';
import { LogTransactionScreen } from './screens/LogTransactionScreen';
import { LedgerScreen } from './screens/LedgerScreen';
import { TaxAnalyticsScreen } from './screens/TaxAnalyticsScreen';
import { StartupProfileScreen } from './screens/StartupProfileScreen';
import { ReceiptModal } from './components/ReceiptModal';
import { AttachReceiptModal } from './components/AttachReceiptModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileModal } from './components/ProfileModal';
import { ShareCpaModal } from './components/ShareCpaModal';
import { SocialServicesModal } from './components/SocialServicesModal';

const AppContent: React.FC = () => {
  const { activeScreen } = useLedger();

  if (activeScreen === 'startup-profile') {
    return (
      <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between relative selection:bg-[#82f5c1] selection:text-[#00714e]">
        <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto bg-[#f8f9ff]">
          <StartupProfileScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between relative selection:bg-[#82f5c1] selection:text-[#00714e]">
      {/* Top Header */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto pt-[118px] pb-[108px] bg-[#f8f9ff]">
        {activeScreen === 'overview' && <OverviewScreen />}
        {activeScreen === 'log' && <LogTransactionScreen />}
        {activeScreen === 'ledger' && <LedgerScreen />}
        {activeScreen === 'tax-and-analytics' && <TaxAnalyticsScreen />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Modals */}
      <ReceiptModal />
      <AttachReceiptModal />
      <NotificationsModal />
      <ProfileModal />
      <ShareCpaModal />
      <SocialServicesModal />
    </div>
  );
};

export default function App() {
  return (
    <LedgerProvider>
      <AppContent />
    </LedgerProvider>
  );
}
