import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { downloadApkFile } from '../utils/apkDownloader';
import {
  Heart,
  Globe,
  LogIn,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  UserCheck,
  LayoutDashboard,
  Download,
  Smartphone,
  SlidersHorizontal,
  Handshake,
  Building2,
  Scroll,
  Headphones,
  Send,
  Search,
  User,
  Crown,
  Lock,
  Share2,
  Bell,
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { NoticeBanner } from './NoticeBanner';
import { VanjariJodiLogo } from './VanjariJodiLogo';

export const Navbar: React.FC<{
  onOpenSearch?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}> = ({ onOpenSearch }) => {
  const {
    language,
    setLanguage,
    currentUser,
    notifications,
    setIsNotificationCenterOpen,
    setIsLoginOpen,
    setIsRegisterOpen,
    setIsAdminOpen,
    siteConfig,
    setCurrentView,
    incrementApkDownloadCount,
    setLoginModalMode,
    setIsLeftDrawerOpen,
    setIsRightDrawerOpen,
    setIsBusinessVendorDirectoryOpen,
    setIsBioDataMakerOpen,
    setIsUserSecurityOpen,
    setIsAdminSecurityOpen,
    isAdminLoggedIn,
    setIsPaymentOpen,
    setIsGitHubSyncOpen,
    setIsAppShareOpen,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const isEn = language === 'en';

  const unreadNotificationCount = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.userId === 'broadcast' || n.userId === 'all' || n.userId === currentUser?.id)
  ).length;

  const handleApkDownload = () => {
    downloadApkFile(
      siteConfig?.apkSettings?.apkUrl,
      siteConfig?.apkSettings?.appVersion || 'v2.4.0',
      incrementApkDownloadCount
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white/95 backdrop-blur-md border-b border-amber-200 text-slate-800 flex flex-col transition-all">
      {/* 🏛️ TOP COMMUNITY TRUST & ADMIN RIBBON (Visible on desktop only to keep mobile header clean) */}
      <div className="hidden md:flex w-full bg-gradient-to-r from-[#0F4C81] via-[#1E5F99] to-[#0F4C81] text-white py-1 px-3 sm:px-6 items-center justify-between text-[11px] font-extrabold border-b border-sky-400/30 select-none shadow-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="px-2 py-0.5 rounded-md bg-[#0066FF] text-white text-[10px] sm:text-[11px] font-black shadow-xs flex items-center gap-1 shrink-0">
            🚩 <span>{isEn ? 'Maharashtra - Vanjari Community' : 'महाराष्ट्र - वंजारी समाज सेवा'}</span>
          </span>
          <span className="text-sky-200 font-semibold text-[11px]">
            • अधिकृत व विश्वसनीय वधू-वर सूचक केंद्र
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Top Bar Share App Button */}
          <button
            onClick={() => setIsAppShareOpen(true)}
            className="px-2 sm:px-2.5 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] sm:text-[11px] flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs border border-emerald-300/50"
            title={isEn ? 'Share App' : 'ॲप शेअर करा'}
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            <span>{isEn ? 'Share App' : 'ॲप शेअर करा'}</span>
          </button>

          {/* Top Bar Download App Button */}
          <button
            onClick={handleApkDownload}
            className="px-2 sm:px-2.5 py-0.5 rounded-md bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-[10px] sm:text-[11px] flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs border border-amber-300"
            title={isEn ? 'Download App (APK)' : 'ॲप डाऊनलोड करा (APK)'}
          >
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-900" />
            <span>{isEn ? 'Download App' : 'ॲप डाऊनलोड'}</span>
          </button>

          <button
            onClick={() => setIsAdminOpen(true)}
            className="px-2 sm:px-2.5 py-0.5 rounded-md bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-white border border-amber-400/60 font-black text-[10px] sm:text-[11px] flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
            title="Admin Login"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Brand Logo & Navigation Bar */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-15 gap-2">
          
          {/* Left section: Drawer Menu [☰] + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Hamburger Menu Trigger [☰] */}
            <button
              onClick={() => setIsLeftDrawerOpen(true)}
              className="flex p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all text-slate-800 active:scale-95 cursor-pointer items-center justify-center shadow-2xs shrink-0 min-h-[44px] min-w-[44px]"
              title={isEn ? 'Main Menu' : 'मुख्य मेनू'}
              aria-label="Toggle drawer menu"
            >
              <Menu className="w-5 h-5 text-[#800C1E]" />
            </button>

            {/* BRAND LOGO */}
            <div
              className="flex items-center cursor-pointer group min-w-0 shrink-0"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <VanjariJodiLogo
                variant="full"
                size={38}
                autoCompactOnMobile={false}
                className="transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* RIGHT SIDE CONTROLS: Strictly [🔍] and [👤] on Mobile! Desktop gets extra badges */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* 1. QUICK SEARCH [🔍] */}
            <button
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                else setIsRightDrawerOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 active:scale-95 cursor-pointer flex items-center justify-center shadow-2xs transition min-h-[44px] min-w-[44px]"
              title={isEn ? 'Search Profiles' : 'वर-वधू शोध'}
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-slate-700" />
            </button>

            {/* 2. NOTIFICATIONS BELL [🔔] */}
            <button
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 active:scale-95 cursor-pointer flex items-center justify-center shadow-2xs transition min-h-[44px] min-w-[44px]"
              title={isEn ? 'Notification Center' : 'सूचना केंद्र'}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] text-[10px] font-black text-white bg-[#A71930] rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* 3. PROFILE / LOGIN [👤] */}
            {currentUser ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#800C1E] text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition shadow-2xs cursor-pointer min-h-[44px] min-w-[44px]"
                title={isEn ? 'My Profile' : 'माझे प्रोफाईल'}
                aria-label="Profile"
              >
                <User className="w-5 h-5 text-[#800C1E]" />
                <span className="hidden sm:inline-block truncate max-w-[80px] font-black">{currentUser.fullName.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#800C1E] hover:bg-[#A71930] text-amber-100 text-xs font-black border border-amber-400/40 flex items-center gap-1.5 transition shadow-xs cursor-pointer min-h-[44px] min-w-[44px]"
                title={isEn ? 'Login' : 'लॉगिन करा'}
                aria-label="Login"
              >
                <LogIn className="w-5 h-5 text-amber-300" />
                <span className="hidden sm:inline-block">{isEn ? 'Login' : 'लॉगिन'}</span>
              </button>
            )}

            {/* DESKTOP-ONLY EXTRA BADGES (Language, VIP, APK, Menu) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Dual Language Toggle */}
              <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-black shadow-inner">
                <button
                  onClick={() => setLanguage('mr')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    language === 'mr'
                      ? 'bg-[#0066FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="मराठी भाषा"
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#0066FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="English Language"
                >
                  EN
                </button>
              </div>

              {/* VIP Badge */}
              <button
                onClick={() => {
                  if (currentUser) {
                    setIsPaymentOpen(true);
                  } else {
                    setIsRegisterOpen(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-white text-xs font-black shadow-xs border border-amber-300/60 flex items-center gap-1 cursor-pointer transition active:scale-95"
                title="मोफत नोंदणी / VIP Membership"
              >
                <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                <span>{currentUser?.membershipTier === 'free' || !currentUser ? '₹० मोफत' : 'VIP'}</span>
              </button>

              {/* Direct APK Download Button */}
              {siteConfig?.apkSettings?.isEnabled !== false && (
                <button
                  onClick={handleApkDownload}
                  title={isEn ? 'Download Android App (APK)' : 'एंड्रॉइड ॲप (APK) डाउनलोड करा'}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs border border-emerald-400 flex items-center gap-1 cursor-pointer transition active:scale-95 shrink-0"
                >
                  <Smartphone className="w-3.5 h-3.5 text-white" />
                  <span>ॲप डाऊनलोड</span>
                </button>
              )}

              {/* Share App Button */}
              <button
                onClick={() => setIsAppShareOpen(true)}
                title={isEn ? 'Share App with Friends & Family' : 'नातेवाईक व मित्रांना ॲप शेअर करा'}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:brightness-110 text-white text-xs font-black shadow-xs border border-sky-400 flex items-center gap-1 cursor-pointer transition active:scale-95 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-white" />
                <span>ॲप शेअर</span>
              </button>
            </div>

            {/* DESKTOP MENU TRIGGER & DROPDOWN */}
            <div className="relative shrink-0 hidden md:block">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-all flex items-center justify-center cursor-pointer shadow-2xs min-h-[44px] min-w-[44px]"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-4 h-4 text-[#A71930]" /> : <Menu className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Menu Dropdown Modal / Popup */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-amber-300 rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2 border-b border-amber-100 flex justify-between items-center">
                    <span className="font-bold text-[#A71930] text-xs uppercase tracking-wider">{isEn ? 'Navigation & Options' : 'नेव्हिगेशन व पर्याय'}</span>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Action Links inside Dropdown Menu */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => { setIsRegisterOpen(true); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 font-extrabold cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{isEn ? 'Register Profile' : 'नोंदणी करा'}</span>
                    </button>

                    {siteConfig?.enableBusinessVendors !== false && (
                      <button
                        onClick={() => {
                          setIsBusinessVendorDirectoryOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-[#800C1E] font-black cursor-pointer border border-amber-300 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Handshake className="w-4 h-4 text-[#A71930]" />
                          <span>{isEn ? 'Wedding Vendors & Halls' : 'लग्न व्यवसाय व नेटवर्किंग'}</span>
                        </div>
                        <span className="text-[9px] bg-[#A71930] text-amber-100 px-1.5 py-0.5 rounded font-bold">
                          10% OFF
                        </span>
                      </button>
                    )}

                     {/* USER SECURITY & SESSIONS MODAL TRIGGER */}
                    {currentUser && (
                      <button
                        onClick={() => {
                          setIsUserSecurityOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold cursor-pointer border border-slate-200 shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{isEn ? '🛡️ Security & Active Sessions' : '🛡️ खाते सुरक्षा व सेशन्स'}</span>
                      </button>
                    )}

                    {/* ADMIN SECURITY & THREAT MONITORING */}
                    {(isAdminLoggedIn || currentUser?.isAdmin) && (
                      <button
                        onClick={() => {
                          setIsAdminSecurityOpen(true);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-bold cursor-pointer border border-red-200 shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>{isEn ? '🚨 Security & Cyber Defense' : '🚨 सायबर सुरक्षा नियंत्रण केंद्र'}</span>
                      </button>
                    )}

                    {!currentUser && (
                      <>
                        <button
                          onClick={() => {
                            setLoginModalMode('member_otp');
                            setIsLoginOpen(true);
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                        >
                          <LogIn className="w-4 h-4 text-[#A71930]" />
                          <span>{isEn ? 'Member Login' : 'सदस्य लॉगिन'}</span>
                        </button>

                        {siteConfig?.enableGuestLogin !== false && (
                          <button
                            onClick={() => {
                              setLoginModalMode('guest');
                              setIsLoginOpen(true);
                              setMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-extrabold cursor-pointer border border-amber-300"
                          >
                            <UserCheck className="w-4 h-4 text-[#A71930]" />
                            <span>{isEn ? '👤 Guest Login' : '👤 गेस्ट प्रवेश'}</span>
                          </button>
                        )}
                      </>
                    )}

                    {siteConfig?.apkSettings?.isEnabled && (
                      <button
                        onClick={() => { handleApkDownload(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold cursor-pointer border border-emerald-200"
                      >
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>{isEn ? 'Download Android App (APK)' : 'एंड्रॉइड ॲप (APK) डाउनलोड'}</span>
                      </button>
                    )}

                    {siteConfig?.telegramUsername && (
                      <a
                        href={`https://t.me/${siteConfig.telegramUsername.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black cursor-pointer border border-sky-300 shadow-sm"
                      >
                        <Send className="w-4 h-4 text-white animate-pulse" />
                        <span>{isEn ? `💬 Chat on Telegram Support` : `💬 टेलिग्रामवर चॅट करा (@${siteConfig.telegramUsername.replace(/^@/, '')})`}</span>
                      </a>
                    )}

                    {siteConfig?.showTelegramBanner !== false && siteConfig?.telegramGroupUrl && siteConfig.telegramGroupUrl.trim() !== '' && (
                      <a
                        href={siteConfig.telegramGroupUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold cursor-pointer border border-sky-400 shadow-xs"
                      >
                        <Send className="w-4 h-4 text-white animate-bounce" />
                        <span>{isEn ? '📢 Join Telegram Group' : '📢 टेलिग्राम ग्रुप जॉईन करा'}</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        const supportBtn = document.getElementById('support-chat-trigger-btn');
                        if (supportBtn) {
                          supportBtn.click();
                        } else {
                          alert(isEn ? 'Please click the Admin Chat icon on the screen.' : 'मदत व सहाय्यासाठी कृपया स्क्रीनवरील ॲडमिन चॅट आयकॉनवर क्लिक करा.');
                        }
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 text-[#800C1E] font-extrabold cursor-pointer border border-amber-300 shadow-xs"
                    >
                      <Headphones className="w-4 h-4 text-[#A71930] animate-pulse" />
                      <span>{isEn ? '🎧 Support & Admin Chat' : '🎧 मदत व ॲडमिन सपोर्ट चॅट'}</span>
                    </button>
                  </div>

                  {/* Language Selector */}
                  <div className="space-y-1 pt-2 border-t border-amber-100">
                    <p className="text-[11px] text-slate-500 font-semibold">{isEn ? 'Select Language:' : 'भाषा निवडा (Language):'}</p>
                    <button
                      onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[#A71930] font-bold transition-all hover:bg-amber-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#A71930]" />
                        <span>{language === 'mr' ? 'मराठी (Marathi)' : 'English'}</span>
                      </div>
                      <span className="text-[10px] bg-[#A71930] text-amber-100 px-2 py-0.5 rounded-full font-bold">
                        {language === 'mr' ? 'मराठी चालू' : 'Active'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Notice Banner strip rendered directly below the main white logo bar */}
      <NoticeBanner />
    </header>
  );
};
