import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useAndroidBackHandler } from './hooks/useAndroidBackHandler';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MobileHomeScreen } from './components/MobileHomeScreen';
import { FeaturesSection } from './components/FeaturesSection';
import { StatsSection } from './components/StatsSection';
import { ProfilesGrid } from './components/ProfilesGrid';
import { SuccessStories } from './components/SuccessStories';
import { CommunityAds } from './components/CommunityAds';
import { PremiumPlans } from './components/PremiumPlans';
import { FAQSection } from './components/FAQSection';
import { AndroidAppBanner } from './components/AndroidAppBanner';
import { Footer } from './components/Footer';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { SearchFiltersModal } from './components/SearchFiltersModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminSupportChatWidget } from './components/AdminSupportChatWidget';
import { ContactUnlockModal } from './components/ContactUnlockModal';
import { GuestRestrictionModal } from './components/GuestRestrictionModal';
import { ProfileRemovalModal } from './components/ProfileRemovalModal';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MatchesScreen } from './components/MatchesScreen';
import { BlessingsSection } from './components/BlessingsSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileAccountScreen } from './components/MobileAccountScreen';
import { MobileChatScreen } from './components/MobileChatScreen';
import { MobileNotificationScreen } from './components/MobileNotificationScreen';
import { LeftDrawer } from './components/LeftDrawer';
import { RightFilterDrawer } from './components/RightFilterDrawer';
import { FlashAdPopup } from './components/FlashAdPopup';
import { DynamicActionDock } from './components/DynamicActionDock';
import { DynamicSeoHead } from './components/DynamicSeoHead';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { LivePushNotificationToast } from './components/LivePushNotificationToast';

// Code-split heavy modals to ensure lightning-fast initial mobile startup
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const ChatModal = lazy(() => import('./components/ChatModal').then(m => ({ default: m.ChatModal })));
const VideoCallModal = lazy(() => import('./components/VideoCallModal').then(m => ({ default: m.VideoCallModal })));
const PaymentModal = lazy(() => import('./components/PaymentModal').then(m => ({ default: m.PaymentModal })));
const BioDataMakerModal = lazy(() => import('./components/BioDataMakerModal').then(m => ({ default: m.BioDataMakerModal })));
const KundaliMilanModal = lazy(() => import('./components/KundaliMilanModal').then(m => ({ default: m.KundaliMilanModal })));
const SingleKundliReportModal = lazy(() => import('./components/SingleKundliReportModal').then(m => ({ default: m.SingleKundliReportModal })));
const BusinessVendorDirectoryModal = lazy(() => import('./components/BusinessVendorDirectoryModal').then(m => ({ default: m.BusinessVendorDirectoryModal })));
const BusinessVendorRegisterModal = lazy(() => import('./components/BusinessVendorRegisterModal').then(m => ({ default: m.BusinessVendorRegisterModal })));
const BusinessVendorPortalModal = lazy(() => import('./components/BusinessVendorPortalModal').then(m => ({ default: m.BusinessVendorPortalModal })));
const ProgrammaticSeoModal = lazy(() => import('./components/ProgrammaticSeoModal').then(m => ({ default: m.ProgrammaticSeoModal })));
const UserSecurityPortalModal = lazy(() => import('./components/UserSecurityPortalModal').then(m => ({ default: m.UserSecurityPortalModal })));
const AdminSecurityCenterModal = lazy(() => import('./components/AdminSecurityCenterModal').then(m => ({ default: m.AdminSecurityCenterModal })));
const TruecallerVerificationModal = lazy(() => import('./components/TruecallerVerificationModal').then(m => ({ default: m.TruecallerVerificationModal })));
const DigitalMarketingAdModal = lazy(() => import('./components/DigitalMarketingAdModal').then(m => ({ default: m.DigitalMarketingAdModal })));
const AppShareModal = lazy(() => import('./components/AppShareModal').then(m => ({ default: m.AppShareModal })));

const MainAppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    selectedProfileForModal,
    setSelectedProfileForModal,
    isFilterOpen,
    setIsFilterOpen,
    isRegisterOpen,
    setIsRegisterOpen,
    isLoginOpen,
    setIsLoginOpen,
    isAdminOpen,
    setIsAdminOpen,
    activeChatUser,
    setActiveChatUser,
    activeVideoUser,
    setActiveVideoUser,
    isPaymentOpen,
    setIsPaymentOpen,
    selectedPlanForPayment,
    siteConfig,
    currentUser,
    isBusinessVendorDirectoryOpen,
    setIsBusinessVendorDirectoryOpen,
    isBusinessVendorRegisterModalOpen,
    setIsBusinessVendorRegisterModalOpen,
    isVendorPortalOpen,
    setIsVendorPortalOpen,
    isBioDataMakerOpen,
    setIsBioDataMakerOpen,
    isSeoHubOpen,
    setIsSeoHubOpen,
    seoTargetCommunity,
    seoTargetCity,
    isUserSecurityOpen,
    setIsUserSecurityOpen,
    isAdminSecurityOpen,
    setIsAdminSecurityOpen,
    isPhoneAuthModalOpen,
    setIsPhoneAuthModalOpen,
    isMarketingAdModalOpen,
    setIsMarketingAdModalOpen,
    isKundaliModalOpen,
    setIsKundaliModalOpen,
    selectedKundaliCandidate,
    isSingleKundliModalOpen,
    setIsSingleKundliModalOpen,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    isAppShareOpen,
    setIsAppShareOpen,
    language,
    vendorSettings,
  } = useApp();

  const { showExitToast } = useAndroidBackHandler();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser && (currentView === 'profiles' || currentView === 'dashboard')) {
      setCurrentView('home');
    }
  }, [currentUser, currentView, setCurrentView]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const isEn = language === 'en';

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-800 flex flex-col font-sans selection:bg-[#A71930] selection:text-white overflow-x-hidden w-full max-w-full relative">
      {/* 🚀 Dynamic Technical SEO Meta, Title & Schema.org JSON-LD Injector */}
      <DynamicSeoHead />
      
      {/* 🔔 Push Notification Permission Banner & Live Dropdown Toast */}
      <PushNotificationBanner />
      <LivePushNotificationToast />

      {/* Guest Mode: Pristine Welcome & Login/Register Screen (Zero-Trust Policy: No Guest Browsing) */}
      {!currentUser ? (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <WelcomeScreen />
        </main>
      ) : (
        <>
          {/* Header with Sticky Container on Desktop (on mobile, each screen has its dedicated clean app bar) */}
          <div className="hidden md:block">
            <Navbar />
          </div>

          {/* Main Content Area for Authenticated Members */}
          {currentView === 'home' && (
            <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
              {/* Mobile-first clean screen matching user reference screenshot */}
              <div className="block md:hidden">
                <MobileHomeScreen />
              </div>

              {/* Desktop full hero & sections */}
              <div className="hidden md:block space-y-4">
                <Hero />
                <BlessingsSection />
                <FeaturesSection />
                <SuccessStories />
                <FAQSection />
                <PremiumPlans />
              </div>
            </main>
          )}

          {currentView === 'chat' && (
            <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
              <MobileChatScreen />
            </main>
          )}

          {currentView === 'notifications' && (
            <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
              <MobileNotificationScreen />
            </main>
          )}

          {currentView === 'account' && (
            <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
              <MobileAccountScreen />
            </main>
          )}

          {currentView === 'matches' && (
            <main className="flex-1 pb-24 md:pb-0 pt-2 w-full max-w-full overflow-x-hidden">
              <MatchesScreen />
            </main>
          )}

          {currentView === 'dashboard' && (
            <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
              <div className="block md:hidden">
                <MobileAccountScreen />
              </div>
              <div className="hidden md:block">
                <MemberDashboard />
              </div>
            </main>
          )}

          {currentView === 'profiles' && (
            <main className="flex-1 pb-24 md:pb-0 pt-4 w-full max-w-full overflow-x-hidden">
              <ProfilesGrid />
            </main>
          )}

          {/* Footer */}
          <Footer />

          {/* Drawers for Mobile Navigation & Filters */}
          <LeftDrawer />
          <RightFilterDrawer />

          {/* Mobile Sticky Bottom Navigation Bar */}
          <MobileBottomNav />
        </>
      )}

      {/* Android Exit Double Back Press Toast Notification */}
      {showExitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-full shadow-2xl border border-amber-400/50 flex items-center gap-2 text-xs font-black animate-bounce select-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{isEn ? 'Press Back again to exit app' : 'पुन्हा Back दाबा — ॲप बंद होईल'}</span>
        </div>
      )}

      {/* Core Fast Modals Container */}
      <ProfileDetailModal
        profile={selectedProfileForModal}
        onClose={() => setSelectedProfileForModal(null)}
      />

      <SearchFiltersModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Heavy Code-Split Lazy Modals (Wrapped with Suspense) */}
      <Suspense fallback={null}>
        {isAdminOpen && (
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
          />
        )}

        {activeChatUser && (
          <ChatModal
            user={activeChatUser}
            onClose={() => setActiveChatUser(null)}
          />
        )}

        {activeVideoUser && (
          <VideoCallModal
            user={activeVideoUser}
            onClose={() => setActiveVideoUser(null)}
          />
        )}

        {isPaymentOpen && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            plan={selectedPlanForPayment}
          />
        )}

        {/* Real-time In-App Notification Center Modal */}
        <NotificationCenterModal
          isOpen={isNotificationCenterOpen}
          onClose={() => setIsNotificationCenterOpen(false)}
        />

        {/* Business Vendor Directory, Registration & Portal Modals */}
        {isBusinessVendorDirectoryOpen && (vendorSettings?.enableVendorModule !== false) && (
          <BusinessVendorDirectoryModal onClose={() => setIsBusinessVendorDirectoryOpen(false)} />
        )}
        {isBusinessVendorRegisterModalOpen && (vendorSettings?.enableVendorModule !== false) && (
          <BusinessVendorRegisterModal onClose={() => setIsBusinessVendorRegisterModalOpen(false)} />
        )}
        {isVendorPortalOpen && (vendorSettings?.enableVendorModule !== false) && (
          <BusinessVendorPortalModal onClose={() => setIsVendorPortalOpen(false)} />
        )}

        {/* Online Marathi BioData Maker Modal */}
        {isBioDataMakerOpen && (
          <BioDataMakerModal
            isOpen={isBioDataMakerOpen}
            onClose={() => setIsBioDataMakerOpen(false)}
          />
        )}

        {/* Programmatic SEO Landing Pages Hub */}
        {isSeoHubOpen && (
          <ProgrammaticSeoModal
            isOpen={isSeoHubOpen}
            onClose={() => setIsSeoHubOpen(false)}
            initialCommunitySlug={seoTargetCommunity}
            initialCitySlug={seoTargetCity}
          />
        )}

        {/* User Security & Active Device Sessions Portal */}
        {isUserSecurityOpen && (
          <UserSecurityPortalModal
            isOpen={isUserSecurityOpen}
            onClose={() => setIsUserSecurityOpen(false)}
          />
        )}

        {/* Administrator Security & Threat Monitoring Center */}
        {isAdminSecurityOpen && (
          <AdminSecurityCenterModal
            isOpen={isAdminSecurityOpen}
            onClose={() => setIsAdminSecurityOpen(false)}
          />
        )}

        {/* Truecaller & Mobile Number Verification Modal */}
        {isPhoneAuthModalOpen && (
          <TruecallerVerificationModal
            isOpen={isPhoneAuthModalOpen}
            onClose={() => setIsPhoneAuthModalOpen(false)}
          />
        )}

        {/* Digital Ad & Marketing Creative / WhatsApp Poster Modal */}
        {isMarketingAdModalOpen && (
          <DigitalMarketingAdModal
            isOpen={isMarketingAdModalOpen}
            onClose={() => setIsMarketingAdModalOpen(false)}
          />
        )}

        {/* Official Prokerala Vedic Kundali Milan (36 Gun Matching) Modal */}
        {isKundaliModalOpen && (
          <ErrorBoundary fallbackTitle="कुंडली जुळवणी लोड करताना समस्या आली">
            <KundaliMilanModal
              isOpen={isKundaliModalOpen}
              onClose={() => setIsKundaliModalOpen(false)}
              candidateProfile={selectedKundaliCandidate}
            />
          </ErrorBoundary>
        )}

        {/* Single Birth Horoscope / Kundli Report Generator Modal */}
        {isSingleKundliModalOpen && (
          <ErrorBoundary fallbackTitle="जन्म कुंडली अहवाल लोड करताना समस्या आली">
            <SingleKundliReportModal
              isOpen={isSingleKundliModalOpen}
              onClose={() => setIsSingleKundliModalOpen(false)}
            />
          </ErrorBoundary>
        )}

        {/* Official Vanjari Jodi App Download & Share Modal */}
        {isAppShareOpen && (
          <AppShareModal
            isOpen={isAppShareOpen}
            onClose={() => setIsAppShareOpen(false)}
          />
        )}
      </Suspense>

      {/* Manual Pay-Per-Contact Unlock Modal */}
      <ContactUnlockModal />

      {/* Granular Guest Access Restriction Popup */}
      <GuestRestrictionModal />

      {/* Member Profile Removal / Marriage Fixed Modal */}
      <ProfileRemovalModal />

      {/* Floating Direct Member-to-Admin Support Chat Widget */}
      <AdminSupportChatWidget />

      {/* Interactive Timed Flash / Popup Ad Banner */}
      <FlashAdPopup />

      {/* Server-Driven Dynamic Action Dock (Speed-dial, Bottom Sheet, Side-Rail, Chip-Bar) */}
      <DynamicActionDock />

      {/* Network Status & Offline Reconnect Indicator */}
      <NetworkStatusIndicator />

    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
