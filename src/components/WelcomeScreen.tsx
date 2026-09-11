import React, { useState } from 'react';
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
} from 'lucide-react';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';

export const WelcomeScreen: React.FC = () => {
  const {
    setIsLoginOpen,
    setIsRegisterOpen,
    setIsBusinessVendorRegisterModalOpen,
    setIsBioDataMakerOpen,
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
    <div className="min-h-screen bg-[#FFFDF5] text-slate-800 flex flex-col justify-between selection:bg-[#800C1E] selection:text-white">
      {/* ============================================================ */}
      {/* A. Top Devotional Header Strip (॥ श्री संत भगवान बाबा प्रसन्न ॥) */}
      {/* ============================================================ */}
      <header className="w-full bg-[#800C1E] text-amber-100 py-2.5 px-3 sm:px-4 shadow-xs border-b border-amber-500/40 flex items-center justify-center select-none pt-[max(0.6rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 font-black tracking-wide text-center">
          <span className="text-amber-300 text-sm sm:text-base">॥</span>
          <span className="text-amber-100 font-extrabold text-xs sm:text-sm tracking-wider">
            श्री संत भगवान बाबा प्रसन्न
          </span>
          <span className="text-amber-300 text-sm sm:text-base">॥</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* Main Content Container (Mobile-First, Clean Layout) */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 py-4 sm:px-4 sm:py-5 flex flex-col justify-between">
        <div className="space-y-3.5 sm:space-y-4">
          
          {/* ============================================================ */}
          {/* B. Centered MASTER OFFICIAL LOGO */}
          {/* ============================================================ */}
          <div className="flex flex-col items-center text-center">
            
            <div className="relative group my-1">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 opacity-30 blur-sm group-hover:opacity-50 transition duration-300" />
              <img
                src="/vanjari-jodi-official-logo-v3.png?v=3"
                alt="वंजारी जोडी वधू-वर सूचक केंद्र"
                className="relative w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-md select-none rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* C. Community Portal Tag & Subtitle */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300/90 text-[#800C1E] text-xs font-black tracking-wide shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
              <span>वंजारी समाज वधू-वर सूचक केंद्र</span>
            </div>

            <p className="mt-1 text-[11.5px] sm:text-xs text-slate-700 font-medium leading-relaxed max-w-xs mx-auto">
              पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात. मोफत नोंदणी व लॉगिन करा.
            </p>
          </div>

          {/* ============================================================ */}
          {/* D. 4 PRIMARY ACTION BUTTONS (STRICT 4 CARDS ONLY) */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-amber-200/90 shadow-md space-y-2.5">
            
            {/* 1. नवीन मोफत नोंदणी करा (Register Free) */}
            <button
              type="button"
              id="welcome-free-register-btn"
              onClick={openRegister}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border border-emerald-400"
            >
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-800/40 text-emerald-200 shrink-0">
                  <UserPlus className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-black leading-tight text-white whitespace-nowrap">
                    नवीन मोफत नोंदणी करा (Register Free)
                  </span>
                  <span className="block text-[10px] text-emerald-100 font-medium leading-none mt-0.5">
                    मोबाईल नंबरने १ मिनिटात बायोडाटा नोंदणी
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0 ml-1" />
            </button>

            {/* 2. सदस्य लॉगिन करा (Member Login) */}
            <button
              type="button"
              id="welcome-member-login-btn"
              onClick={openLogin}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#800C1E] via-[#941327] to-[#A71930] hover:from-[#941327] hover:to-[#800C1E] text-white font-black text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer border border-amber-300/40"
            >
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <div className="p-1.5 rounded-lg bg-black/30 text-amber-300 shrink-0">
                  <LogIn className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-black text-amber-100 leading-tight whitespace-nowrap">
                    🔑 खात्यात लॉगिन करा (Member Login)
                  </span>
                  <span className="block text-[10px] text-amber-200/80 font-medium leading-none mt-0.5">
                    नोंदणीकृत सदस्यांसाठी थेट प्रवेश
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-300 shrink-0 ml-1" />
            </button>

            {/* 3. मोफत बायोडाटा PDF बनवा (Biodata Maker) */}
            <button
              type="button"
              id="welcome-biodata-maker-btn"
              onClick={openBioDataMaker}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black shadow-xs border border-amber-400 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <div className="p-1.5 rounded-lg bg-[#800C1E] text-amber-200 shrink-0">
                  <Scroll className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11.5px] xs:text-xs sm:text-sm font-black text-slate-950 block leading-tight whitespace-nowrap">
                      📄 मोफत बायोडाटा PDF बनवा
                    </span>
                    <span className="text-[8.5px] font-black bg-[#800C1E] text-amber-200 px-1 py-0.2 rounded shrink-0">
                      FREE
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-800 font-medium block leading-none mt-0.5">
                    आकर्षक विवाह बायोडाटा PDF डाऊनलोड करा
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#800C1E] shrink-0 ml-1" />
            </button>

            {/* 4. लग्न व्यवसाय / व्हेंडर नोंदणी (Vendor Registration) */}
            {siteConfig?.enableBusinessVendors !== false && (
              <button
                type="button"
                id="welcome-vendor-register-btn"
                onClick={() => setIsBusinessVendorRegisterModalOpen(true)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/90 text-slate-900 font-black shadow-2xs active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left min-w-0">
                  <div className="p-1.5 rounded-lg bg-amber-400 text-[#800C1E] shrink-0">
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-black text-slate-950 block leading-tight whitespace-nowrap">
                      🤝 लग्न व्यवसाय / व्हेंडर नोंदणी (Vendor)
                    </span>
                    <span className="text-[10px] text-slate-600 block leading-none mt-0.5">
                      कॅटरिंग, डेकोरेशन, हॉल, फोटोग्राफर नोंदवा
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-700 shrink-0 ml-1" />
              </button>
            )}

            {/* Clean Telegram & Admin Support Strip */}
            <div className="pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-[10.5px] shadow-2xs flex items-center justify-center gap-1 transition cursor-pointer border border-sky-400 active:scale-95"
                >
                  <Send className="w-3 h-3 text-white shrink-0" />
                  <span className="truncate">📢 टेलिग्राम ग्रुप</span>
                </a>

                <a
                  href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 text-slate-950 font-black text-[10.5px] shadow-2xs flex items-center justify-center gap-1 transition cursor-pointer border border-amber-300 active:scale-95"
                >
                  <MessageCircle className="w-3 h-3 text-slate-950 shrink-0" />
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
          {/* E. SECONDARY COMPACT APP DOWNLOAD CARD (SEPARATE FROM MAIN 4 BUTTONS) */}
          {/* ============================================================ */}
          {siteConfig?.showApkDownloadButton !== false && (
            <div className="bg-gradient-to-r from-[#42020B] via-[#800C1E] to-[#5B0513] text-white rounded-2xl p-3 border border-amber-300/40 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  <Smartphone className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-100 truncate">📱 ॲप डाउनलोड करा</span>
                    <span className="text-[8.5px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                      APK
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-200/80 font-medium truncate">
                    Android App • Fast &amp; Easy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApkDownload}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition shrink-0 cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>APK डाऊनलोड</span>
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* F. Important Statutory Legal Notice & Disclaimer */}
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
