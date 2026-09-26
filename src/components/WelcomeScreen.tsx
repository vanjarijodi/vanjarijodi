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
} from 'lucide-react';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';

export const WelcomeScreen: React.FC = () => {
  const {
    setIsLoginOpen,
    setIsRegisterOpen,
    setIsBusinessVendorRegisterModalOpen,
    setIsBioDataMakerOpen,
    setIsPaymentOpen,
    setSelectedPlanForPayment,
    plansList,
    incrementApkDownloadCount,
    setLoginModalMode,
    setIsAdminOpen,
    siteConfig,
  } = useApp();

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTabType>('privacy');
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);

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
      {/* A. Top Devotional Header Strip */}
      {/* ============================================================ */}
      <header
        className="w-full bg-gradient-to-r from-[#5E0715] via-[#850F22] to-[#5E0715] text-amber-100 py-2.5 px-3 sm:px-4 shadow-md border-b-2 border-amber-400/60 flex items-center justify-center select-none pt-[max(0.6rem,env(safe-area-inset-top))] relative z-10"
      >
        <div className="flex items-center gap-1.5 font-black tracking-wide">
          <span className="text-amber-300 text-xs sm:text-sm">॥</span>
          <span className="text-amber-200 font-black text-xs sm:text-sm tracking-wider">
            श्री संत भगवान बाबा प्रसन्न
          </span>
          <span className="text-amber-300 text-xs sm:text-sm">॥</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* Main Content Container (Mobile-First, Clean Layout) */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 pt-4 pb-28 sm:px-4 sm:pt-5 sm:pb-28 flex flex-col justify-between relative z-10">
        <div className="space-y-3.5 sm:space-y-4">
          
          {/* ============================================================ */}
          {/* B. Centered MASTER OFFICIAL LOGO */}
          {/* ============================================================ */}
          <div className="flex flex-col items-center text-center">
            
            <div className="relative group my-1">
              <div className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 opacity-40 blur-md group-hover:opacity-60 transition duration-500" />
              <img
                src={siteConfig?.logoUrl || "/vanjari-jodi-official-logo.png"}
                alt="वंजारी जोडी वधू-वर सूचक केंद्र"
                className="relative w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-xl select-none rounded-full ring-2 ring-amber-300/80 p-0.5 bg-white/60"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* C. Community Portal Tag & Subtitle */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-400/90 text-[#6B0818] text-xs font-black tracking-wide shadow-xs">
              <Users className="w-3.5 h-3.5 text-[#6B0818] shrink-0" />
              <span>वंजारी समाज वधू-वर सूचक केंद्र</span>
            </div>

            <p className="mt-1.5 text-xs text-slate-800 font-bold leading-relaxed max-w-xs mx-auto">
              पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात. मोफत नोंदणी व लॉगिन करा.
            </p>
          </div>

          {/* ============================================================ */}
          {/* D. 4 PRIMARY ACTION BUTTONS (STRICT 4 CARDS ONLY) */}
          {/* ============================================================ */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-xl space-y-3">
            
            {/* 1. नवीन मोफत नोंदणी करा (Register Free) */}
            <button
              type="button"
              id="welcome-free-register-btn"
              onClick={openRegister}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border border-emerald-300/80 ring-1 ring-emerald-400/40"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="p-2 rounded-xl bg-black/20 text-emerald-100 shrink-0 shadow-inner">
                  <UserPlus className="w-4 h-4 text-emerald-100" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-black leading-tight text-white whitespace-nowrap">
                    नवीन मोफत नोंदणी करा (Register Free)
                  </span>
                  <span className="block text-[10.5px] text-emerald-100/90 font-medium leading-none mt-1">
                    मोबाईल नंबरने १ मिनिटात बायोडाटा नोंदणी
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-100 shrink-0 ml-1" />
            </button>

            {/* 2. सदस्य लॉगिन करा (Member Login) */}
            <button
              type="button"
              id="welcome-member-login-btn"
              onClick={openLogin}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#6B0818] via-[#8C0F22] to-[#5E0715] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-rose-900/30 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border border-amber-300/60 ring-1 ring-amber-400/30"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="p-2 rounded-xl bg-black/30 text-amber-300 shrink-0 shadow-inner">
                  <LogIn className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-black text-amber-100 leading-tight whitespace-nowrap">
                    🔑 खात्यात लॉगिन करा (Member Login)
                  </span>
                  <span className="block text-[10.5px] text-amber-200/90 font-medium leading-none mt-1">
                    नोंदणीकृत सदस्यांसाठी थेट प्रवेश
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-300 shrink-0 ml-1" />
            </button>

            {/* 3. मोफत बायोडाटा PDF बनवा (Biodata Maker) */}
            <button
              type="button"
              id="welcome-biodata-maker-btn"
              onClick={openBioDataMaker}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-md border border-amber-300 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer ring-1 ring-amber-400/50"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="p-2 rounded-xl bg-[#6B0818] text-amber-200 shrink-0 shadow-inner">
                  <Scroll className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-slate-950 block leading-tight whitespace-nowrap">
                      📄 मोफत बायोडाटा PDF बनवा
                    </span>
                    <span className="text-[9px] font-black bg-[#6B0818] text-amber-200 px-1.5 py-0.2 rounded shrink-0">
                      FREE
                    </span>
                  </div>
                  <span className="text-[10.5px] text-slate-900 font-bold block leading-none mt-1">
                    आकर्षक विवाह बायोडाटा PDF डाऊनलोड करा
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6B0818] shrink-0 ml-1" />
            </button>

            {/* 4. लग्न व्यवसाय / व्हेंडर नोंदणी (Vendor Registration) */}
            {siteConfig?.enableBusinessVendors !== false && (
              <button
                type="button"
                id="welcome-vendor-register-btn"
                onClick={() => setIsBusinessVendorRegisterModalOpen(true)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-amber-50/90 hover:bg-amber-100 border border-amber-300 text-slate-900 font-black shadow-xs active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  <div className="p-1.5 rounded-xl bg-amber-300 text-[#6B0818] shrink-0">
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-black text-slate-950 block leading-tight whitespace-nowrap">
                      🤝 लग्न व्यवसाय / व्हेंडर नोंदणी (Vendor)
                    </span>
                    <span className="text-[10px] text-slate-700 font-medium block leading-none mt-0.5">
                      कॅटरिंग, डेकोरेशन, हॉल, फोटोग्राफर नोंदवा
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-800 shrink-0 ml-1" />
              </button>
            )}

            {/* 5. मेंबरशिप योजना पहा (VIP Premium Plans) */}
            <button
              type="button"
              id="welcome-premium-plans-btn"
              onClick={() => {
                const defaultPlan = plansList.find((p) => p.id === 'welcome_offer' && p.isActive !== false) || plansList[0];
                setSelectedPlanForPayment(defaultPlan);
                setIsPaymentOpen(true);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#6B0818] hover:brightness-110 text-white font-black shadow-lg border border-amber-300/80 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer ring-1 ring-amber-400/50"
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="p-2 rounded-xl bg-black/25 text-amber-200 shrink-0 shadow-inner">
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-white block leading-tight whitespace-nowrap">
                      💎 मेंबरशिप योजना व फी (VIP Plans)
                    </span>
                    <span className="text-[9px] bg-amber-300 text-[#6B0818] font-black px-1.5 py-0.2 rounded-full">
                      सवलत
                    </span>
                  </div>
                  <span className="text-[10.5px] text-amber-100 font-bold block leading-none mt-1">
                    {siteConfig?.showOnlyWelcomePlan !== false
                      ? 'वेलकम स्पेशल ऑफर ₹३९८ (६ महिने - ५० संपर्क अनलॉक)'
                      : 'वेलकम स्पेशल ₹३९८ • सिल्व्हर • गोल्ड • प्लॅटिनम'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-200 shrink-0 ml-1" />
            </button>

            {/* Clean Telegram & Admin Support Strip */}
            <div className="pt-2 border-t border-amber-200/60">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-300 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="truncate">📢 टेलिग्राम ग्रुप</span>
                </a>

                <a
                  href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 text-slate-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-400 active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span className="truncate">💬 ॲडमिन थेट चॅट</span>
                </a>
              </div>
            </div>

            <div className="pt-0.5 flex items-center justify-center gap-1 text-[10px] text-slate-500 text-center">
              <Lock className="w-3 h-3 text-slate-400 shrink-0 inline" />
              <span>सुरक्षित व सत्यापित प्रोफाइल पाहण्यासाठी लॉगिन आवश्यक आहे.</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* E. Important Statutory Legal Notice & Disclaimer */}
          {/* ============================================================ */}
          <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-[#800C1E] shrink-0" />
              <span>महत्त्वाची कायदेशीर सूचना (Legal Disclaimer)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              हे व्यासपीठ केवळ वंजारी समाज बांधवांसाठी प्राथमिक माहिती देवाणघेवाणीचे माध्यम (Intermediary) आहे. नोंदणीकृत प्रोफाईलची माहिती संबंधित सदस्यांनी स्वतः भरलेली असते. शिक्षण, नोकरी, चारित्र्य व कौटुंबिक पार्श्वभूमीची दोन्ही पक्षांनी प्रत्यक्ष भेटून स्वतः पूर्ण खातरजमा करावी.
            </p>
            <div className="pt-1 flex items-center gap-3 text-[11px] text-[#800C1E] font-bold">
              <button
                type="button"
                onClick={() => openPolicy('terms')}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>• नियम व अटी (Terms)</span>
              </button>
              <button
                type="button"
                onClick={() => openPolicy('privacy')}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>• गोपनीयता धोरण (Privacy)</span>
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
                <span>मदत आणि हेल्पलाइन सपोर्ट (Help & Support)</span>
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
                <span>नियम व अटी (Terms & Conditions)</span>
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
                <span>गोपनीयता धोरण (Privacy Policy)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Footer */}
        {/* ============================================================ */}
        <footer className="pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-slate-500 space-y-2 border-t border-slate-200/60 mt-5">
          <p>© {new Date().getFullYear()} Vanjari Jodi Matrimony. सर्व हक्क सुरक्षित.</p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => openPolicy('about')}
              className="hover:text-slate-600 hover:underline cursor-pointer"
            >
              आमच्याबद्दल
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openPolicy('contact')}
              className="hover:text-slate-600 hover:underline cursor-pointer"
            >
              संपर्क
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-[#800C1E] font-bold cursor-pointer"
            >
              प्रशासक (Admin)
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
