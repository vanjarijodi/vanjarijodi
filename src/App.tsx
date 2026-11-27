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
import { AndroidPushNotificationBanner } from './components/AndroidPushNotificationBanner';
import { AppUpdateNotifierModal } from './components/AppUpdateNotifierModal';
import { LegalPoliciesModal, PolicyTabType } from './components/LegalPoliciesModal';
import { AudioCallModal } from './components/AudioCallModal';
import { TelegramGroupNoticeBanner } from './components/TelegramGroupNoticeBanner';
import { initAudioUnlock } from './utils/pushNotificationHelper';
import { isNativeAndroidApp } from './utils/playStorePaymentHelper';

// Resilient lazy loader helper for dynamic module imports with backoff & graceful fallback
function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<any>,
  exportName?: string
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const attempts = [0, 600, 1500];
    let lastError: any = null;

    for (let i = 0; i < attempts.length; i++) {
      if (attempts[i] > 0) {
        await new Promise((resolve) => setTimeout(resolve, attempts[i]));
      }
      try {
        const mod = await importFn();
        if (exportName && mod[exportName]) {
          return { default: mod[exportName] };
        }
        return { default: mod.default || (exportName ? mod[exportName] : Object.values(mod)[0]) };
      } catch (err) {
        lastError = err;
        console.warn(`[LazyLoad] Chunk fetch attempt ${i + 1} failed for ${exportName || 'module'}:`, err);
      }
    }

    console.error('[LazyLoad] All retry attempts failed for module:', exportName || 'Unknown', lastError);

    // Return a resilient Fallback Component instead of throwing to prevent top-level ErrorBoundary crash
    const ResilientChunkFallback: React.FC<any> = (props) => {
      const [isRetrying, setIsRetrying] = React.useState(false);

      const handleManualRetry = () => {
        setIsRetrying(true);
        window.location.reload();
      };

      return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-300 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-[#800C1E] shadow-inner">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-[#800C1E]">
                {exportName === 'AdminPanel' ? 'ॲडमिन पॅनेल लोड करताना अडचण आली' : 'घटक लोड करताना तात्पुरती अडचण आली'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                नवीन अपडेट किंवा इंटरनेट कनेक्शनच्या अडचणीमुळे हा घटक वेळेत लोड होऊ शकला नाही.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={handleManualRetry}
                disabled={isRetrying}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRetrying ? 'लोड होत आहे...' : 'पुन्हा लोड करा (Reload)'}</span>
              </button>
              {props.onClose && (
                <button
                  type="button"
                  onClick={props.onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  बंद करा (Close)
                </button>
              )}
            </div>
          </div>
        </div>
      );
    };

    return { default: ResilientChunkFallback as unknown as T };
  });
}

// Code-split heavy modals to ensure lightning-fast initial mobile startup
const AdminPanel = safeLazy(() => import('./components/AdminPanel'), 'AdminPanel');
const ChatModal = safeLazy(() => import('./components/ChatModal'), 'ChatModal');
const VideoCallModal = safeLazy(() => import('./components/VideoCallModal'), 'VideoCallModal');
const PaymentModal = safeLazy(() => import('./components/PaymentModal'), 'PaymentModal');
const MembershipPlansModal = safeLazy(() => import('./components/MembershipPlansModal'), 'MembershipPlansModal');
const CompliantAssistedMembershipModal = safeLazy(() => import('./components/CompliantAssistedMembershipModal'), 'CompliantAssistedMembershipModal');
const BioDataMakerModal = safeLazy(() => import('./components/BioDataMakerModal'), 'BioDataMakerModal');
const KundaliMilanModal = safeLazy(() => import('./components/KundaliMilanModal'), 'KundaliMilanModal');
const SingleKundliReportModal = safeLazy(() => import('./components/SingleKundliReportModal'), 'SingleKundliReportModal');
const BusinessVendorDirectoryModal = safeLazy(() => import('./components/BusinessVendorDirectoryModal'), 'BusinessVendorDirectoryModal');
const BusinessVendorRegisterModal = safeLazy(() => import('./components/BusinessVendorRegisterModal'), 'BusinessVendorRegisterModal');
const BusinessVendorPortalModal = safeLazy(() => import('./components/BusinessVendorPortalModal'), 'BusinessVendorPortalModal');
const ProgrammaticSeoModal = safeLazy(() => import('./components/ProgrammaticSeoModal'), 'ProgrammaticSeoModal');
const UserSecurityPortalModal = safeLazy(() => import('./components/UserSecurityPortalModal'), 'UserSecurityPortalModal');
const AdminSecurityCenterModal = safeLazy(() => import('./components/AdminSecurityCenterModal'), 'AdminSecurityCenterModal');
const TruecallerVerificationModal = safeLazy(() => import('./components/TruecallerVerificationModal'), 'TruecallerVerificationModal');
const VerificationCenterModal = safeLazy(() => import('./components/VerificationCenterModal'), 'VerificationCenterModal');
const AdminGitHubSyncModal = safeLazy(() => import('./components/AdminGitHubSyncModal'), 'AdminGitHubSyncModal');
const DigitalMarketingAdModal = safeLazy(() => import('./components/DigitalMarketingAdModal'), 'DigitalMarketingAdModal');
const AppShareModal = safeLazy(() => import('./components/AppShareModal'), 'AppShareModal');
const AdminIncomingCallNotification = safeLazy(() => import('./components/AdminIncomingCallNotification'), 'AdminIncomingCallNotification');
const AdminStandaloneApp = safeLazy(() => import('./components/AdminStandaloneApp'), 'AdminStandaloneApp');
const WebPaymentPage = safeLazy(() => import('./components/WebPaymentPage'), 'WebPaymentPage');

const MainAppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    selectedProfileForModal,
    setSelectedProfileForModal,
    modalProfileList,
    filteredProfiles,
    profiles,
    isFilterOpen,
    setIsFilterOpen,
    isRegisterOpen,
    setIsRegisterOpen,
    isLoginOpen,
    setIsLoginOpen,
    isAdminOpen,
    setIsAdminOpen,
    setIsAdminLoggedIn,
    activeChatUser,
    setActiveChatUser,
    activeVideoUser,
    setActiveVideoUser,
    isPaymentOpen,
    setIsPaymentOpen,
    isMembershipPlansModalOpen,
    setIsMembershipPlansModalOpen,
    isCompliantAssistedModalOpen,
    setIsCompliantAssistedModalOpen,
    compliantModalData,
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
    isKycModalOpen,
    setIsKycModalOpen,
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
    isGitHubSyncOpen,
    setIsGitHubSyncOpen,
    language,
    vendorSettings,
    isAudioCallModalOpen,
    setIsAudioCallModalOpen,
    isAdminLoggedIn,
  } = useApp();

  const { showExitToast } = useAndroidBackHandler();
  const [showSplash, setShowSplash] = React.useState(true);
  const [policyModalState, setPolicyModalState] = React.useState<{
    isOpen: boolean;
    tab: PolicyTabType;
  }>({ isOpen: false, tab: 'privacy' });

  // 🌐 WEBSITE MODE:
  // Root URL ('/') renders the full professional Matrimony Website (Hero, Profiles, Search, Register, Login).
  // Dedicated Payment Portal is shown only on '/pay', '/payment', or when ?pay=true or user switches to web pay mode.
  const [isWebPayMode, setIsWebPayMode] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/pay' ||
        path === '/pay/' ||
        path.startsWith('/pay') ||
        path === '/payment' ||
        path === '/payment/' ||
        path.startsWith('/payment') ||
        search.includes('pay=true') ||
        search.includes('mode=payment')
      ) {
        return true;
      }
      return false;
    }
    return false;
  });

  React.useEffect(() => {
    const handleOpenAdmin = () => {
      setShowSplash(false);
      setIsAdminOpen(true);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/admin');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A shortcut to toggle Admin Login
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        handleOpenAdmin();
      }
    };

    window.addEventListener('open_admin_standalone_app', handleOpenAdmin);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open_admin_standalone_app', handleOpenAdmin);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsAdminOpen]);

  React.useEffect(() => {
    // Unlock and warm up AudioContext & Notification sounds on first touch/click
    initAudioUnlock();

    // Check direct deep-link URLs (e.g., /admin, /privacy, /privacy-policy, /terms, /account-deletion)
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.startsWith('/admin') || search.includes('admin=true') || search.includes('app=admin')) {
        setShowSplash(false);
        // Do not enter admin mode if currently logged in as a normal member
        const storedUser = localStorage.getItem('vanjari_jodi_current_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.id !== 'admin') {
              window.history.replaceState({}, '', '/');
              return;
            }
          } catch (e) {}
        }
        setIsAdminOpen(true);
      } else if (path === '/pay' || path === '/pay/' || path.startsWith('/pay') || path === '/payment' || path === '/payment/' || path.startsWith('/payment')) {
        setShowSplash(false);
        setIsWebPayMode(true);
      } else if (
        path === '/privacy' ||
        path === '/privacy-policy' ||
        path === '/privacy.html' ||
        path === '/privacy-policy.html' ||
        path === '/razorpay-privacy'
      ) {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'privacy' });
      } else if (
        path === '/terms' ||
        path === '/terms-and-conditions' ||
        path === '/terms.html' ||
        path === '/razorpay-terms'
      ) {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'terms' });
      } else if (
        path === '/refund' ||
        path === '/refund-policy' ||
        path === '/cancellation' ||
        path === '/cancellation-policy' ||
        path === '/razorpay-refund'
      ) {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'refund' });
      } else if (
        path === '/shipping' ||
        path === '/shipping-policy' ||
        path === '/shipping-and-delivery' ||
        path === '/razorpay-shipping'
      ) {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'shipping' });
      } else if (path === '/pricing' || path === '/razorpay-pricing') {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'pricing' });
      } else if (path === '/account-deletion' || path === '/delete-account' || path === '/app-account-deletion') {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'privacy' });
      } else if (path === '/about' || path === '/about-us') {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'about' });
      } else if (path === '/contact' || path === '/contact-us' || path === '/razorpay-contact') {
        setShowSplash(false);
        setPolicyModalState({ isOpen: true, tab: 'contact' });
      }
    }
  }, [setIsAdminOpen]);

  const isStandaloneAdminBuild =
    typeof import.meta !== 'undefined' &&
    String((import.meta as any).env?.VITE_ADMIN_STANDALONE || '').toLowerCase() === 'true';

  if (isStandaloneAdminBuild) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300 font-black text-sm">
            वंजारी जोडी — ॲडमिन कंट्रोल ॲप लोड होत आहे...
          </div>
        }
      >
        <AdminStandaloneApp />
      </Suspense>
    );
  }

  // 🌐 DEDICATED WEBSITE PORTAL (Only Payment + Set Login ID & Password + Forgot Password SMS OTP + SMS Gateway Setup)
  if (isWebPayMode) {
    return (
      <>
        <Suspense
          fallback={
            <div className="min-h-screen bg-amber-50 flex items-center justify-center text-[#800C1E] font-black text-sm">
              वंजारी जोडी — अधिकृत वेब पेमेंट व लॉगिन पासवर्ड पोर्टल लोड होत आहे...
            </div>
          }
        >
          <WebPaymentPage
            onSwitchToAppMode={() => {
              setShowSplash(false);
              setIsWebPayMode(false);
            }}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
          {isRegisterOpen && (
            <RegisterModal
              isOpen={isRegisterOpen}
              onClose={() => setIsRegisterOpen(false)}
            />
          )}
          {isLoginOpen && (
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
            />
          )}
          {isBioDataMakerOpen && (
            <BioDataMakerModal
              isOpen={isBioDataMakerOpen}
              onClose={() => setIsBioDataMakerOpen(false)}
            />
          )}
          {isAdminOpen && (
            <ErrorBoundary fallbackTitle="ॲडमिन पॅनेल लोड करताना अडचण आली">
              <Suspense
                fallback={
                  <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-amber-200 text-center max-w-sm w-full">
                      <div className="animate-spin w-10 h-10 border-4 border-[#800C1E] border-t-transparent rounded-full mx-auto mb-3" />
                      <p className="text-sm font-black text-[#800C1E]">ॲडमिन पॅनेल लोड होत आहे...</p>
                      <p className="text-xs text-slate-500 mt-1">कृपया थोडा वेळ थांबा</p>
                    </div>
                  </div>
                }
              >
                <AdminPanel
                  isOpen={isAdminOpen}
                  onClose={() => {
                    setIsAdminOpen(false);
                    setIsAdminLoggedIn(false);
                  }}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </Suspense>
        <LegalPoliciesModal
          isOpen={policyModalState.isOpen}
          initialTab={policyModalState.tab}
          onClose={() => setPolicyModalState((prev) => ({ ...prev, isOpen: false }))}
        />
      </>
    );
  }

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

      {/* 🛡️ Official Helpline & Account Sync Support Bar (Mobile only; desktop shows inside Navbar) */}
      <div className="md:hidden bg-gradient-to-r from-[#6b0818] via-[#800C1E] to-[#550613] text-amber-100 text-xs py-1.5 px-3 flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-amber-500/20 z-40">
        <div className="flex items-center gap-2 font-medium min-w-0">
          <a
            href="mailto:gitevijay123@gmail.com"
            className="text-amber-200 hover:text-white underline font-semibold flex items-center gap-1 text-[11px] truncate"
          >
            <span>📧 हेल्पलाईन: gitevijay123@gmail.com</span>
          </a>
        </div>
        <button
          type="button"
          onClick={() => setIsCompliantAssistedModalOpen(true)}
          className="ml-auto bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/40 font-bold px-2.5 py-0.5 rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
        >
          🔄 खाते स्टेटस सिंक
        </button>
      </div>

      {/* Header with Sticky Container on Desktop */}
      <div className="hidden md:block">
        <Navbar />
        <TelegramGroupNoticeBanner />
      </div>

      {/* Main Content Area - Seamless Android-Style Views */}
      {currentView === 'home' && (
        !currentUser ? (
          <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
            {/* Desktop / Website: Professional full Matrimony landing page with Admin-controllable sections */}
            <div className="hidden md:block space-y-6">
              {siteConfig.showHeroSection !== false && <Hero />}
              {siteConfig.showProfilesOnIndexPage !== false && <ProfilesGrid />}
              {siteConfig.showStatsSection === true && <StatsSection />}
              {siteConfig.showBlessingsSection !== false && <BlessingsSection />}
              {siteConfig.showFeaturesSection !== false && <FeaturesSection />}
              {siteConfig.showCommunityAdsSection === true && <CommunityAds />}
              {siteConfig.showSuccessStoriesSection !== false && <SuccessStories />}
              {siteConfig.showFaqSection !== false && <FAQSection />}
            </div>

            {/* Mobile App & Mobile Browser Screen */}
            <div className="block md:hidden">
              <WelcomeScreen />
            </div>
          </main>
        ) : (
          <main className="flex-1 pb-24 md:pb-0 w-full max-w-full overflow-x-hidden">
            {/* Mobile-first clean screen matching user reference screenshot */}
            <div className="block md:hidden">
              <MobileHomeScreen />
            </div>

            {/* Desktop full hero & sections - Show Biodata & Photo Feed immediately after login */}
            <div className="hidden md:block space-y-4">
              {siteConfig.showProfilesOnIndexPage !== false && <ProfilesGrid />}
              {siteConfig.showHeroSection !== false && <Hero />}
              {siteConfig.showStatsSection === true && <StatsSection />}
              {siteConfig.showBlessingsSection !== false && <BlessingsSection />}
              {siteConfig.showFeaturesSection !== false && <FeaturesSection />}
              {siteConfig.showCommunityAdsSection === true && <CommunityAds />}
              {siteConfig.showSuccessStoriesSection !== false && <SuccessStories />}
              {siteConfig.showFaqSection !== false && <FAQSection />}
            </div>
          </main>
        )
      )}

      {currentView === 'profiles' && (
        <main className="flex-1 pb-24 md:pb-0 pt-0 md:pt-2 w-full max-w-full overflow-x-hidden">
          <ProfilesGrid />
        </main>
      )}

      {currentView === 'matches' && (
        <main className="flex-1 pb-24 md:pb-0 pt-2 w-full max-w-full overflow-x-hidden">
          <MatchesScreen />
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

      {/* Footer */}
      <Footer />

      {/* Drawers for Mobile Navigation & Filters */}
      <LeftDrawer />
      <RightFilterDrawer />

      {/* Mobile Sticky Bottom Navigation Bar (Always Visible on Mobile) */}
      <MobileBottomNav />

      {/* Android Exit Double Back Press Toast Notification */}
      {showExitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-full shadow-2xl border border-amber-400/50 flex items-center gap-2 text-xs font-black animate-bounce select-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{isEn ? 'Press Back again to exit app' : 'पुन्हा Back दाबा — ॲप बंद होईल'}</span>
        </div>
      )}

      {/* Core Fast Modals Container */}
      {(() => {
        const activeList =
          modalProfileList.length > 0 &&
          selectedProfileForModal &&
          modalProfileList.some((p) => p.id === selectedProfileForModal.id)
            ? modalProfileList
            : filteredProfiles.length > 0 &&
              selectedProfileForModal &&
              filteredProfiles.some((p) => p.id === selectedProfileForModal.id)
            ? filteredProfiles
            : profiles.filter((p) => p.isApproved !== false);
        const currentModalIdx = selectedProfileForModal
          ? activeList.findIndex((p) => p.id === selectedProfileForModal.id)
          : -1;
        const hasPrevProfile = currentModalIdx > 0;
        const hasNextProfile = currentModalIdx >= 0 && currentModalIdx < activeList.length - 1;

        return (
          <ProfileDetailModal
            profile={selectedProfileForModal}
            onClose={() => setSelectedProfileForModal(null)}
            hasPrev={hasPrevProfile}
            hasNext={hasNextProfile}
            onPrevProfile={
              hasPrevProfile
                ? () => setSelectedProfileForModal(activeList[currentModalIdx - 1])
                : undefined
            }
            onNextProfile={
              hasNextProfile
                ? () => setSelectedProfileForModal(activeList[currentModalIdx + 1])
                : undefined
            }
          />
        );
      })()}

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
          <ErrorBoundary fallbackTitle="ॲडमिन पॅनेल लोड करताना अडचण आली">
            <Suspense
              fallback={
                <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 shadow-2xl border border-amber-200 text-center max-w-sm w-full">
                    <div className="animate-spin w-10 h-10 border-4 border-[#800C1E] border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm font-black text-[#800C1E]">ॲडमिन पॅनेल लोड होत आहे...</p>
                    <p className="text-xs text-slate-500 mt-1">कृपया थोडा वेळ थांबा</p>
                  </div>
                </div>
              }
            >
              <AdminPanel
                isOpen={isAdminOpen}
                onClose={() => {
                  setIsAdminOpen(false);
                  setIsAdminLoggedIn(false);
                  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                    window.history.pushState({}, '', '/');
                  }
                }}
              />
            </Suspense>
          </ErrorBoundary>
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

        {/* Google Play Policy Compliant Account Access & Verification Modal (Zero Payment UI in App) */}
        {(isPaymentOpen || isMembershipPlansModalOpen || isCompliantAssistedModalOpen) && (
          <CompliantAssistedMembershipModal
            isOpen={Boolean(isPaymentOpen || isMembershipPlansModalOpen || isCompliantAssistedModalOpen)}
            onClose={() => {
              setIsPaymentOpen(false);
              setIsMembershipPlansModalOpen(false);
              setIsCompliantAssistedModalOpen(false);
            }}
            featureTitle={compliantModalData?.featureTitle || selectedPlanForPayment?.nameMr || 'खाते ॲक्सेस व पडताळणी'}
            targetProfileName={compliantModalData?.targetProfileName}
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

        {/* Aadhaar & Selfie KYC Profile Verification Center Modal */}
        {isKycModalOpen && (
          <VerificationCenterModal
            isOpen={isKycModalOpen}
            onClose={() => setIsKycModalOpen(false)}
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
        {isKundaliModalOpen && siteConfig?.enableKundaliFeature !== false && (
          <ErrorBoundary fallbackTitle="कुंडली जुळवणी लोड करताना समस्या आली">
            <KundaliMilanModal
              isOpen={isKundaliModalOpen}
              onClose={() => setIsKundaliModalOpen(false)}
              candidateProfile={selectedKundaliCandidate}
            />
          </ErrorBoundary>
        )}

        {/* Single Birth Horoscope / Kundli Report Generator Modal */}
        {isSingleKundliModalOpen && siteConfig?.enableKundaliFeature !== false && (
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

        {/* GitHub Deploy & Code Sync Center Modal */}
        {isGitHubSyncOpen && (
          <AdminGitHubSyncModal
            isOpen={isGitHubSyncOpen}
            onClose={() => setIsGitHubSyncOpen(false)}
          />
        )}

        {/* Agora Voice RTC In-App Audio Calling Modal */}
        {isAudioCallModalOpen && (
          <ErrorBoundary fallbackTitle="ऑडिओ कॉल सुरू करताना तात्पुरती अडचण आली">
            <AudioCallModal
              isOpen={isAudioCallModalOpen}
              onClose={() => setIsAudioCallModalOpen(false)}
            />
          </ErrorBoundary>
        )}

        {/* Admin Real-Time Incoming Audio Call Alert */}
        {isAdminLoggedIn && (
          <AdminIncomingCallNotification />
        )}
      </Suspense>

      {/* Manual Pay-Per-Contact Unlock Modal */}
      <ContactUnlockModal />

      {/* Granular Guest Access Restriction Popup */}
      <GuestRestrictionModal />

      {/* Member Profile Removal / Marriage Fixed Modal */}
      <ProfileRemovalModal />

      {/* Interactive Timed Flash / Popup Ad Banner */}
      <FlashAdPopup />

      {/* Android System Push Notification Banner (Slide down heads-up popup with emblem, title & sound) */}
      <AndroidPushNotificationBanner />

      {/* Server-Driven Dynamic Action Dock (Speed-dial, Bottom Sheet, Side-Rail, Chip-Bar) */}
      <DynamicActionDock />

      {/* Network Status & Offline Reconnect Indicator */}
      <NetworkStatusIndicator />

      {/* Force / In-App Update Notifier Modal (Semver version check & mandatory update blocker) */}
      <AppUpdateNotifierModal />

      {/* Direct Deep-link Legal Policies Modal (/privacy, /terms, /refund, etc.) */}
      <LegalPoliciesModal
        isOpen={policyModalState.isOpen}
        initialTab={policyModalState.tab}
        onClose={() => {
          setPolicyModalState((prev) => ({ ...prev, isOpen: false }));
          if (typeof window !== 'undefined' && window.history && window.history.pushState) {
            window.history.pushState({}, '', '/');
          }
        }}
      />

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
