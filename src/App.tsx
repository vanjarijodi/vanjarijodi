import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
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
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ChatModal } from './components/ChatModal';
import { VideoCallModal } from './components/VideoCallModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminSupportChatWidget } from './components/AdminSupportChatWidget';
import { ContactUnlockModal } from './components/ContactUnlockModal';
import { GuestRestrictionModal } from './components/GuestRestrictionModal';
import { ProfileRemovalModal } from './components/ProfileRemovalModal';
import { SplashScreen } from './components/SplashScreen';
import { BlessingsSection } from './components/BlessingsSection';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LeftDrawer } from './components/LeftDrawer';
import { RightFilterDrawer } from './components/RightFilterDrawer';
import { BusinessVendorDirectoryModal } from './components/BusinessVendorDirectoryModal';
import { BusinessVendorRegisterModal } from './components/BusinessVendorRegisterModal';
import { BusinessVendorPortalModal } from './components/BusinessVendorPortalModal';
import { FlashAdPopup } from './components/FlashAdPopup';
import { BioDataMakerModal } from './components/BioDataMakerModal';

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
  } = useApp();

  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser && (currentView === 'profiles' || currentView === 'dashboard')) {
      setCurrentView('home');
    }
  }, [currentUser, currentView, setCurrentView]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-slate-800 flex flex-col font-sans selection:bg-[#A71930] selection:text-white">
      
      {/* Header with Sticky Container & Integrated Site-wide Notice Banner */}
      <Navbar />

      {/* Main Content Area */}
      {currentView === 'home' && (
        <main className="flex-1 pb-16 md:pb-0">
          {/* Full Screen Hero with Auto Sliding Images & Dark Overlay & Quick Search */}
          <Hero />

          {/* Sacred Blessings & Heritage Section */}
          <BlessingsSection />

          {/* Key Features Cards */}
          <FeaturesSection />

          {/* Animated Counters */}
          <StatsSection />

          {/* Featured Advertisements & Community Notices (डिजिटल जाहिरात व प्रायोजित उपक्रम मंच) */}
          <CommunityAds />

          {/* Main Profiles Section */}
          {currentUser && siteConfig?.showProfilesOnIndexPage !== false && <ProfilesGrid />}

          {/* Success Stories Image Slider */}
          <SuccessStories />

          {/* Premium Paid Plans (Hidden by default, Admin toggle) */}
          <PremiumPlans />

          {/* Android Mobile App Banner */}
          <AndroidAppBanner />

          {/* Community FAQs */}
          <FAQSection />
        </main>
      )}

      {currentView === 'dashboard' && (
        <main className="flex-1 pb-16 md:pb-0">
          <MemberDashboard />
        </main>
      )}

      {currentView === 'profiles' && (
        <main className="flex-1 pb-16 md:pb-0 pt-4">
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

      {/* Modals Container */}
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

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <ChatModal
        user={activeChatUser}
        onClose={() => setActiveChatUser(null)}
      />

      <VideoCallModal
        user={activeVideoUser}
        onClose={() => setActiveVideoUser(null)}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        plan={selectedPlanForPayment}
      />

      {/* Manual Pay-Per-Contact Unlock Modal */}
      <ContactUnlockModal />

      {/* Granular Guest Access Restriction Popup */}
      <GuestRestrictionModal />

      {/* Member Profile Removal / Marriage Fixed Modal */}
      <ProfileRemovalModal />

      {/* Floating Direct Member-to-Admin Support Chat Widget */}
      <AdminSupportChatWidget />

      {/* Prompts to Install PWA Call-to-Action Banner */}
      <PWAInstallPrompt />

      {/* Interactive Timed Flash / Popup Ad Banner */}
      <FlashAdPopup />

      {/* Business Vendor Directory, Registration & Portal Modals */}
      {isBusinessVendorDirectoryOpen && (
        <BusinessVendorDirectoryModal onClose={() => setIsBusinessVendorDirectoryOpen(false)} />
      )}
      {isBusinessVendorRegisterModalOpen && (
        <BusinessVendorRegisterModal onClose={() => setIsBusinessVendorRegisterModalOpen(false)} />
      )}
      {isVendorPortalOpen && (
        <BusinessVendorPortalModal onClose={() => setIsVendorPortalOpen(false)} />
      )}

      {/* Online Marathi BioData Maker Modal */}
      <BioDataMakerModal
        isOpen={isBioDataMakerOpen}
        onClose={() => setIsBioDataMakerOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
