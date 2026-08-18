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
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { NoticeBanner } from './NoticeBanner';
import { VanjariJodiLogo } from './VanjariJodiLogo';

export const Navbar: React.FC<{
  onOpenSearch?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}> = () => {
  const {
    language,
    setLanguage,
    currentUser,
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
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const isEn = language === 'en';

  const handleApkDownload = () => {
    downloadApkFile(
      siteConfig?.apkSettings?.apkUrl,
      siteConfig?.apkSettings?.appVersion || 'v2.4.0',
      incrementApkDownloadCount
    );
  };

  return (
    <header className="sticky top-0 z-50 shadow-md bg-white border-b border-amber-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Hamburger Menu on Mobile Left */}
          <button
            onClick={() => setIsLeftDrawerOpen(true)}
            className="flex md:hidden p-2 mr-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all text-[#A71930] active:scale-95 cursor-pointer items-center justify-center"
            title={isEn ? 'Main Menu' : 'मुख्य मेनू'}
          >
            <Menu className="w-5 h-5 text-[#A71930]" />
          </button>

          {/* 2. LOGO & BRANDING */}
          <div
            className="flex items-center cursor-pointer group py-1 min-w-0 shrink"
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <VanjariJodiLogo variant="full" size={44} className="md:scale-110 md:origin-left transition-transform duration-300" />
          </div>

          {/* RIGHT SIDE CONTROLS: Registration, Login, APK Download, Menu */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            
            {/* WEDDING VENDORS & HALLS DIRECTORY BUTTON */}
            {siteConfig?.enableBusinessVendors !== false && (
              <button
                onClick={() => setIsBusinessVendorDirectoryOpen(true)}
                title={isEn ? 'Wedding Halls, Catering & Vendor Directory' : 'मंगल कार्यालये, कॅटरिंग व लग्न व्यवसाय डिरेक्टरी'}
                className="hidden lg:flex px-3 py-1.5 sm:py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-[#800C1E] text-[10px] sm:text-xs font-black shadow-sm items-center gap-1.5 transition-transform active:scale-95 border border-amber-300 cursor-pointer shrink-0"
              >
                <Handshake className="w-3.5 h-3.5 text-[#A71930]" />
                <span>{isEn ? 'Vendors & Halls' : 'लग्न व्यवसाय'}</span>
                <span className="bg-[#A71930] text-amber-100 px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                  {isEn ? '10% OFF' : '१०% बंद'}
                </span>
              </button>
            )}

            {/* DIRECT APK DOWNLOAD BUTTON */}
            {siteConfig?.apkSettings?.isEnabled && (
              <button
                onClick={handleApkDownload}
                title={isEn ? 'Download Android App (APK)' : 'एंड्रॉइड ॲप (APK) डाउनलोड करा'}
                className="hidden md:flex px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold shadow-sm items-center gap-1 transition-transform active:scale-95 border border-emerald-400 cursor-pointer shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">{isEn ? 'Download App' : 'ॲप डाउनलोड'}</span>
                <span className="sm:hidden">APK</span>
                <Download className="w-3 h-3 text-emerald-200 hidden sm:inline" />
              </button>
            )}

            {/* REGISTRATION BUTTON */}
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="hidden md:flex px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] hover:to-[#A71930] text-amber-100 text-[10px] sm:text-xs md:text-sm font-black shadow-md border border-amber-300/40 items-center gap-1 transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
              <span>{isEn ? 'Register' : 'नोंदणी'}</span>
            </button>

            {/* LOGIN / DASHBOARD BUTTONS */}
            {currentUser ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-[#A71930] text-[11px] sm:text-xs font-bold border border-amber-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#A71930]" />
                <span className="flex items-center gap-1">
                  <span>{currentUser.fullName.split(' ')[0]}</span>
                  <VerifiedBadge profile={currentUser} size="sm" />
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* EXISTING MEMBER LOGIN BUTTON */}
                <button
                  onClick={() => {
                    setLoginModalMode('member_otp');
                    setIsLoginOpen(true);
                  }}
                  title={isEn ? 'Login for Registered Members' : 'हयात नोंदणीकृत सदस्यांसाठी लॉगिन'}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] sm:text-xs font-extrabold border border-slate-300 flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#A71930]" />
                  <span>{isEn ? 'Login' : 'लॉगिन'}</span>
                </button>

                {/* GUEST LOGIN BUTTON NEXT TO EXISTING MEMBER LOGIN */}
                {siteConfig?.enableGuestLogin !== false && (
                  <button
                    onClick={() => {
                      setLoginModalMode('guest');
                      setIsLoginOpen(true);
                    }}
                    title={isEn ? 'Guest Preview Access with Mobile + OTP' : 'मोबाईल नंबर + OTP पडताळणीसह पाहुणे / गेस्ट प्रवेश'}
                    className="hidden md:flex px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-[#800C1E] text-[10px] sm:text-xs font-black border border-amber-300/90 flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                    <span className="whitespace-nowrap">{isEn ? '👤 Guest Login' : '👤 गेस्ट प्रवेश'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Language Switcher Pill */}
            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-300 text-[#800C1E] text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0 mr-1"
              title={isEn ? 'Switch to Marathi' : 'इंग्रजीत पाहा (Switch to English)'}
            >
              <Globe className="w-3.5 h-3.5 text-[#A71930]" />
              <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
            </button>

            {/* Quick Filter button on Mobile */}
            {currentUser && siteConfig?.enableSearchFilters && (
              <button
                onClick={() => setIsRightDrawerOpen(true)}
                className="flex md:hidden p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all text-[#A71930] active:scale-95 cursor-pointer items-center justify-center mr-1"
                title={isEn ? 'Search Filters' : 'शोध फिल्टर'}
              >
                <SlidersHorizontal className="w-4.5 h-4.5 text-[#A71930]" />
              </button>
            )}

            {/* MENU TRIGGER & DROPDOWN */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 sm:p-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-slate-800 border border-amber-300 transition-all flex items-center justify-center cursor-pointer"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#A71930]" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#A71930]" />}
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
