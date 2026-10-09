import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { downloadApkFile } from '../utils/apkDownloader';
import {
  Lock,
  FileText,
  LogIn,
  UserPlus,
  HelpCircle,
  ChevronRight,
  Scale,
  Users,
  MessageCircle,
  ShieldCheck,
  Mail,
  Handshake,
  Send,
  Scroll,
  Smartphone,
  Download,
  Crown,
  Headphones,
} from 'lucide-react';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';
import { MarqueeTickerBanner } from './MarqueeTickerBanner';

export const WelcomeScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    setIsLoginOpen,
    setIsRegisterOpen,
    setIsBusinessVendorRegisterModalOpen,
    setIsBioDataMakerOpen,
    setIsPaymentOpen,
    isMembershipPlansModalOpen,
    setIsMembershipPlansModalOpen,
    setSelectedPlanForPayment,
    plansList,
    incrementApkDownloadCount,
    setLoginModalMode,
    setIsAdminOpen,
    siteConfig,
    addNotification,
  } = useApp();

  const isEn = language === 'en';

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTabType>('privacy');
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);

  const handleLanguageSwitch = (newLang: 'mr' | 'en') => {
    if (newLang === language) return;
    setLanguage(newLang);
    addNotification?.({
      type: 'success',
      title: newLang === 'mr' ? 'भाषा बदलली' : 'Language Changed',
      message: newLang === 'mr' ? '🇮🇳 मराठी भाषा निवडली आहे.' : '🌐 Switched to English successfully.',
    });
  };

  const openLogin = () => {
    setLoginModalMode('member_otp');
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsRegisterOpen(true);
  };

  const openBioDataMaker = () => {
    setIsBioDataMakerOpen(true);
  };

  const handleApkDownload = () => {
    downloadApkFile(
      siteConfig?.apkSettings?.apkUrl || siteConfig?.apkDownloadUrl,
      siteConfig?.apkSettings?.appVersion || siteConfig?.apkVersion || 'v2.4.0',
      incrementApkDownloadCount
    );
  };

  const openPolicy = (tab: PolicyTabType) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF8] via-[#FFF9EE] to-[#FFF5E4] text-slate-800 flex flex-col justify-between selection:bg-[#6B0818] selection:text-amber-100 relative overflow-x-hidden">
      {/* Subtle Background Golden Auras */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-64 h-64 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================ */}
      {/* A. Top Devotional Header Strip with Language Switcher (Mobile Only, hidden on md where Navbar is present) */}
      {/* ============================================================ */}
      <header
        className="md:hidden w-full bg-gradient-to-r from-[#5E0715] via-[#850F22] to-[#5E0715] text-amber-100 py-2 px-3 sm:px-5 shadow-md border-b-2 border-amber-400/60 flex items-center justify-between select-none pt-[max(0.6rem,env(safe-area-inset-top))] relative z-10"
      >
        <div className="flex items-center gap-1.5 font-black tracking-wide">
          <span className="text-amber-300 text-xs sm:text-sm">॥</span>
          <span className="text-amber-200 font-black text-xs sm:text-sm tracking-wider">
            {isEn ? 'Shri Sant Bhagwan Baba Prasanna' : 'श्री संत भगवान बाबा प्रसन्न'}
          </span>
          <span className="text-amber-300 text-xs sm:text-sm">॥</span>
        </div>

        {/* 🌐 PROMINENT SCREEN LANGUAGE SWITCHER (मराठी | English) */}
        <div className="flex items-center bg-black/40 border border-amber-300/80 rounded-full p-0.5 shadow-md">
          <button
            type="button"
            onClick={() => handleLanguageSwitch('mr')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              language === 'mr'
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-md scale-105'
                : 'text-amber-200 hover:text-white'
            }`}
            title="मराठी भाषेत ॲप पहा"
          >
            मराठी
          </button>
          <button
            type="button"
            onClick={() => handleLanguageSwitch('en')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-md scale-105'
                : 'text-amber-200 hover:text-white'
            }`}
            title="View app in English"
          >
            English
          </button>
        </div>
      </header>

      {/* 📢 TOP RUNNING MARQUEE TICKER BANNER */}
      <MarqueeTickerBanner />

      {/* ============================================================ */}
      {/* Main Content Container (Responsive Grid: Single Column Mobile, Executive 2-Column Desktop) */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-md lg:max-w-7xl mx-auto px-3.5 pt-4 pb-28 md:pb-12 sm:px-4 lg:px-8 sm:pt-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN ON DESKTOP: Master Brand Logo (CLEAN & BORDERLESS) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-2">
            <div className="flex flex-col items-center text-center p-2 sm:p-3">
              <div className="relative group my-1">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 opacity-40 blur-sm group-hover:opacity-60 transition duration-300" />
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-xl flex items-center justify-center cursor-pointer"
                  onClick={() => window.dispatchEvent(new CustomEvent('open_admin_standalone_app'))}
                  title="Vanjari Jodi"
                >
                  <img
                    src="/vanjari-jodi-official-logo.png?v=20260928-clean"
                    alt={isEn ? 'Vanjari Jodi Matrimony' : 'वंजारी जोडी वधू-वर सूचक केंद्र'}
                    className="w-full h-full object-cover rounded-full select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Community Portal Tag & Subtitle */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-400/90 text-[#6B0818] text-xs sm:text-sm font-black tracking-wide shadow-xs">
                <Users className="w-4 h-4 text-[#6B0818] shrink-0" />
                <span>{isEn ? 'Vanjari Community Matrimonial Portal' : 'वंजारी समाज वधू-वर सूचक केंद्र'}</span>
              </div>

              {/* Long text description - hidden on mobile & tablet screens */}
              <p className="hidden lg:block mt-2 text-xs text-slate-800 font-bold leading-relaxed max-w-md mx-auto">
                {isEn
                  ? 'Sacred beginning of trusted relationships with 100% verified profiles, Aadhaar check, and instant contact unlock.'
                  : 'संत भगवान बाबांच्या पावन आशीर्वादाने १,००,०००+ समाधानी कुटुंबे. १००% आधार पडताळलेली व सुशिक्षित वंजारी वधू-वर स्थळे.'}
              </p>

              {/* Desktop Trust Highlights Strip - hidden on mobile & tablet screens */}
              <div className="hidden lg:grid mt-3 pt-3 border-t border-amber-200/80 grid-cols-3 gap-2 w-full text-center">
                <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200">
                  <div className="text-sm font-black text-[#800C1E]">१,००,०००+</div>
                  <div className="text-[10px] text-slate-700 font-bold">नोंदणीकृत स्थळे</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200">
                  <div className="text-sm font-black text-emerald-700">१००%</div>
                  <div className="text-[10px] text-slate-700 font-bold">आधार पडताळणी</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/90 border border-amber-200">
                  <div className="text-sm font-black text-amber-900">१४,२००+</div>
                  <div className="text-[10px] text-slate-700 font-bold">यशस्वी रेशीमगाठी</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN ON DESKTOP: Primary Action Buttons Card */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-3">

          {/* ============================================================ */}
          {/* D. 4 PRIMARY ACTION BUTTONS (HIGH VISIBILITY & PROMINENT) */}
          {/* ============================================================ */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-5 border-2 border-amber-400 shadow-2xl space-y-3">
            
            {/* OPTION 1: 🟢 नवीन मोफत नोंदणी करा (Register Free) */}
            <button
              type="button"
              id="welcome-free-register-btn"
              onClick={openRegister}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-base shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border-2 border-emerald-300 ring-2 ring-emerald-400/40"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="p-2.5 rounded-xl bg-black/25 text-emerald-100 shrink-0 shadow-inner">
                  <UserPlus className="w-5 h-5 text-emerald-100" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-base font-black leading-tight text-white whitespace-nowrap">
                    {isEn ? 'Free Registration (Create Profile)' : '१. नवीन मोफत नोंदणी करा (Register Free)'}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-emerald-100 font-bold leading-none mt-1">
                    {isEn ? '1-minute fast biodata registration with mobile OTP' : 'मोबाईल नंबरने १ मिनिटात मोफत बायोडाटा नोंदणी'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-100 shrink-0 ml-1" />
            </button>

            {/* OPTION 2: 🔑 खात्यात लॉगिन करा (Member Login) */}
            <button
              type="button"
              id="welcome-member-login-btn"
              onClick={openLogin}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#7A0C1E] via-[#9B111E] to-[#600714] hover:brightness-110 text-white font-black text-xs sm:text-base shadow-lg hover:shadow-rose-900/40 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border-2 border-amber-300/80 ring-2 ring-amber-400/30"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="p-2.5 rounded-xl bg-black/30 text-amber-300 shrink-0 shadow-inner">
                  <LogIn className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-base font-black text-amber-100 leading-tight whitespace-nowrap">
                    {isEn ? '🔑 Member Login (Access Account)' : '२. खात्यात लॉगिन करा (Member Login)'}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-amber-200 font-bold leading-none mt-1">
                    {isEn ? 'Direct login for registered candidates' : 'नोंदणीकृत सदस्यांसाठी थेट मोबाईल OTP प्रवेश'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-300 shrink-0 ml-1" />
            </button>

            {/* OPTION 3: 📄 मोफत बायोडाटा PDF बनवा (Biodata Maker) */}
            <button
              type="button"
              id="welcome-biodata-maker-btn"
              onClick={openBioDataMaker}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-lg border-2 border-amber-500 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer ring-2 ring-amber-400/60"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="p-2.5 rounded-xl bg-[#6B0818] text-amber-200 shrink-0 shadow-inner">
                  <Scroll className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-base font-black text-slate-950 block leading-tight whitespace-nowrap">
                      {isEn ? '📄 Create Free Biodata PDF' : '३. मोफत बायोडाटा PDF बनवा'}
                    </span>
                    <span className="text-[10px] font-black bg-[#6B0818] text-amber-200 px-2 py-0.5 rounded shrink-0 shadow-xs">
                      FREE
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-900 font-bold block leading-none mt-1">
                    {isEn ? 'Generate and download marriage biodata PDF' : 'आकर्षक विवाह बायोडाटा PDF डाऊनलोड करा'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B0818] shrink-0 ml-1" />
            </button>

            {/* 🏛️ SEPARATE VENDOR CARD: लग्नाचे व्यावसायिक (मंगल कार्यालय, कॅटरिंग, डेकोरेशन) */}
            {siteConfig?.enableBusinessVendors !== false && (
              <div className="pt-2 border-t border-slate-200">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/60 border border-amber-300 shadow-xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-[#800C1E] text-amber-300 shadow-sm shrink-0 mt-0.5">
                      <Handshake className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-[#800C1E]">
                          {isEn ? '🏛️ Wedding Business & Vendors' : '🏛️ विवाह व्यावसायिक नोंदणी (व्हेंडर)'}
                        </span>
                        <span className="text-[10px] font-bold bg-[#800C1E] text-amber-200 px-2 py-0.5 rounded-full">
                          {isEn ? 'Business Only' : 'केवळ व्यावसायिकांसाठी'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                        {isEn
                          ? 'Are you a Marriage Hall, Caterer, Florist or Decorator? Register your wedding business and rates here.'
                          : 'आपले मंगल कार्यालय, कॅटरिंग (जेवण/आचारी), मंडप, डेकोरेशन किंवा विवाह सेवांचा व्यवसाय असल्यास आपले दर व माहिती येथे नोंदवा.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="welcome-vendor-register-btn"
                    onClick={() => setIsBusinessVendorRegisterModalOpen(true)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#800C1E] via-[#9B1229] to-[#800C1E] hover:from-[#600816] hover:to-[#800C1E] text-amber-200 font-bold text-xs shadow-md border border-amber-400/40 active:scale-[0.98] transition flex items-center justify-between cursor-pointer"
                  >
                    <span>🤝 {isEn ? 'Register Wedding Business' : 'आपल्या विवाह व्यवसायाची नोंदणी करा'}</span>
                    <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-slate-500 text-center">
              <Lock className="w-3 h-3 text-slate-400 shrink-0 inline" />
              <span>{isEn ? 'Login is required to view full verified candidate profiles.' : 'सुरक्षित व सत्यापित प्रोफाइल पाहण्यासाठी लॉगिन आवश्यक आहे.'}</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* E. Important Statutory Legal Notice & Disclaimer */}
          {/* ============================================================ */}
          <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-[#800C1E] shrink-0" />
              <span>{isEn ? 'Legal Notice & Intermediary Disclaimer' : 'महत्त्वाची कायदेशीर सूचना (Legal Disclaimer)'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {isEn
                ? 'This platform functions solely as a matchmaking information exchange intermediary for the Vanjari community. Profiles are submitted directly by users. Both parties are strongly advised to independently verify background, education, and character.'
                : 'हे व्यासपीठ केवळ वंजारी समाज बांधवांसाठी प्राथमिक माहिती देवाणघेवाणीचे माध्यम (Intermediary) आहे. नोंदणीकृत प्रोफाईलची माहिती संबंधित सदस्यांनी स्वतः भरलेली असते. शिक्षण, नोकरी, चारित्र्य व कौटुंबिक पार्श्वभूमीची दोन्ही पक्षांनी प्रत्यक्ष भेटून स्वतः पूर्ण खातरजमा करावी.'}
            </p>
            <div className="pt-1 flex items-center gap-3 text-[11px] text-[#800C1E] font-bold">
              <button
                type="button"
                onClick={() => openPolicy('terms')}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>• {isEn ? 'Terms & Conditions' : 'नियम व अटी (Terms)'}</span>
              </button>
              <button
                type="button"
                onClick={() => openPolicy('privacy')}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>• {isEn ? 'Privacy Policy' : 'गोपनीयता धोरण (Privacy)'}</span>
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* G. Informative Links Section */}
          {/* ============================================================ */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsHelpDrawerOpen(true)}
              className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 text-left transition-all text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-50 text-[#800C1E]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span>{isEn ? 'Help & Support Helpline' : 'मदत आणि हेल्पलाइन सपोर्ट (Help & Support)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => openPolicy('terms')}
              className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 text-left transition-all text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <FileText className="w-4 h-4" />
                </div>
                <span>{isEn ? 'Terms & Conditions Policy' : 'नियम व अटी (Terms & Conditions)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => openPolicy('privacy')}
              className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 text-left transition-all text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>{isEn ? 'Privacy Policy' : 'गोपनीयता धोरण (Privacy Policy)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

        {/* ============================================================ */}
        {/* Footer */}
        {/* ============================================================ */}
        <footer className="pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-slate-500 space-y-2 border-t border-slate-200/60 mt-5">
          <p
            onClick={() => window.dispatchEvent(new CustomEvent('open_admin_standalone_app'))}
            className="cursor-pointer hover:text-slate-700 select-none"
            title="Vanjari Jodi Matrimony"
          >
            © {new Date().getFullYear()} Vanjari Jodi Matrimony. {isEn ? 'All rights reserved.' : 'सर्व हक्क सुरक्षित.'}
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => openPolicy('about')}
              className="hover:text-slate-600 hover:underline cursor-pointer"
            >
              {isEn ? 'About Us' : 'आमच्याबद्दल'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openPolicy('contact')}
              className="hover:text-slate-600 hover:underline cursor-pointer"
            >
              {isEn ? 'Contact' : 'संपर्क'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_admin_standalone_app'))}
              className="hover:text-slate-600 hover:underline cursor-pointer text-slate-400/80"
              title="Admin Portal"
            >
              {isEn ? 'Admin' : 'व्यवस्थापक'}
            </button>
          </div>
        </footer>
      </main>

      {/* ============================================================ */}
      {/* Help & Support Bottom Drawer */}
      {/* ============================================================ */}
      {isHelpDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl p-6 shadow-2xl border-t md:border border-amber-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">मदत आणि सपोर्ट</h3>
                  <p className="text-xs text-slate-500">वंजारी जोडी हेल्पलाइन</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <p className="text-xs text-slate-600">
                नोंदणी किंवा लॉगिन करण्यास काही अडचण आल्यास आमच्या अधिकृत हेल्पलाईनवर संपर्क साधा:
              </p>

              <a
                href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold hover:bg-amber-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-[#800C1E] shrink-0" />
                <div>
                  <div className="text-xs text-[#800C1E] font-bold">ॲडमिन सोबत थेट टेलिग्राम चॅट (Admin Chat)</div>
                  <div className="text-xs font-mono font-black">@{siteConfig?.telegramUsername || 'Primemultiservice'}</div>
                </div>
              </a>

              <a
                href={`mailto:${siteConfig?.contactEmail || 'gitevijay123@gmail.com'}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold hover:bg-slate-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-[#800C1E] shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 font-normal">अधिकृत ई-मेल सपोर्ट (Official Email)</div>
                  <div className="text-xs font-medium text-slate-900">{siteConfig?.contactEmail || 'gitevijay123@gmail.com'}</div>
                </div>
              </a>

              <a
                href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 border border-sky-300 text-sky-950 font-bold hover:bg-sky-100 transition-colors"
              >
                <Send className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <div className="text-xs text-sky-700 font-bold">अधिकृत टेलिग्राम ग्रुप</div>
                  <div className="text-xs font-extrabold text-sky-800">📢 नवीन स्थळे व अपडेट्ससाठी जॉईन करा</div>
                </div>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setIsHelpDrawerOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              बंद करा
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Legal Policies Modal */}
      {/* ============================================================ */}
      {isLegalModalOpen && (
        <LegalPoliciesModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalModalTab}
        />
      )}
    </div>
  );
};
