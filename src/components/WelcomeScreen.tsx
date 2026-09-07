import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { downloadApkFile } from '../utils/apkDownloader';
import {
  Lock,
  FileText,
  PhoneCall,
  LogIn,
  UserPlus,
  HelpCircle,
  ChevronRight,
  Scale,
  Users,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Mail,
  Building2,
  Sparkles,
  Handshake,
  Send,
  Download,
  Scroll,
  Smartphone,
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
    paymentConfig,
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
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col justify-between selection:bg-[#800C1E] selection:text-white">
      {/* ============================================================ */}
      {/* A. Top Devotional Header Strip (॥ श्री संत भगवान बाबा प्रसन्न ॥) */}
      {/* ============================================================ */}
      <header className="w-full bg-[#800C1E] text-amber-100 text-xs py-2 px-3 sm:px-4 shadow-xs border-b border-amber-500/40 flex items-center justify-center select-none pt-[max(0.6rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 font-black tracking-wide text-center">
          <span className="text-amber-300">॥</span>
          <span className="text-amber-100 font-extrabold text-xs sm:text-sm">श्री संत भगवान बाबा प्रसन्न</span>
          <span className="text-amber-300">॥</span>
        </div>
      </header>

      {/* ============================================================ */}
      {/* Main Content Container (Mobile-First, Controlled Clean Layout) */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col justify-between">
        <div className="space-y-4 sm:space-y-5">
          
          {/* ============================================================ */}
          {/* B. Official Royal Insignia Logo (Centered & Complete) */}
          {/* ============================================================ */}
          <div className="flex flex-col items-center text-center">
            
            {/* The Official Emblem contains Saint Bhagwan Baba's portrait & complete insignia */}
            <div className="flex flex-col items-center justify-center w-full py-1">
              <VanjariJodiLogo
                variant="emblem"
                size={180}
                className="w-full transition-transform hover:scale-105 duration-300"
              />
            </div>

            {/* C. Community Portal Tag */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300/90 text-[#800C1E] text-xs font-black tracking-wide shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
              <span>वंजारी समाज वधू-वर सूचक केंद्र</span>
            </div>

            {/* D. Welcome Description */}
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-xs sm:max-w-sm mx-auto font-medium">
              पवित्र व संस्कारक्षम नात्यांची सुंदर सुरुवात. समाजातील सुसंस्कृत वधू-वर स्थळे शोधण्यासाठी मोफत नोंदणी व लॉगिन करा.
            </p>
          </div>

          {/* ============================================================ */}
          {/* E, F, G. Primary Action Buttons (PROMINENT AT TOP) */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-md space-y-2.5">
            
            {/* 1. Primary Free Registration Button (Top Spotlight) */}
            <button
              type="button"
              id="welcome-free-register-btn"
              onClick={openRegister}
              className="w-full min-h-[50px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-emerald-400"
            >
              <UserPlus className="w-5 h-5 text-emerald-200 shrink-0 animate-bounce" />
              <div className="text-left sm:text-center">
                <span className="block text-sm sm:text-base font-black">नवीन मोफत नोंदणी करा (Register Free)</span>
                <span className="block text-[10px] text-emerald-100 font-medium">मोबाईल नंबरने १ मिनिटात बायोडाटा नोंदणी</span>
              </div>
            </button>

            {/* 2. Free Biodata PDF Maker Button (Requested Old Favorite Feature Restored to Top) */}
            <button
              type="button"
              id="welcome-biodata-maker-btn"
              onClick={openBioDataMaker}
              className="w-full min-h-[46px] p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black shadow-md border-2 border-amber-300 active:scale-[0.98] transition-all flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <div className="p-1.5 rounded-lg bg-[#800C1E] text-amber-200 shadow-2xs shrink-0">
                  <Scroll className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-slate-950 block">
                      📄 मोफत बायोडाटा PDF बनवा (Biodata Maker)
                    </span>
                    <span className="text-[9px] font-black bg-[#800C1E] text-amber-200 px-1.5 py-0.5 rounded shadow-2xs">
                      FREE
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-800 font-bold block">
                    आकर्षक डिझाईनमध्ये मोफत विवाह बायोडाटा बनवा व PDF डाउनलोड करा
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#800C1E] shrink-0" />
            </button>

            {/* 3. Android APK Download Button (Requested Direct App Download) */}
            {siteConfig?.showApkDownloadButton !== false && (
              <button
                type="button"
                id="welcome-apk-download-btn"
                onClick={handleApkDownload}
                className="w-full min-h-[44px] p-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black shadow-md border border-sky-300 active:scale-[0.98] transition-all flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-left min-w-0">
                  <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-2xs shrink-0">
                    <Smartphone className="w-4 h-4 text-sky-200" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-white block">
                        📲 ॲप डाऊनलोड करा (Download Android App)
                      </span>
                      <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded shadow-2xs">
                        APK
                      </span>
                    </div>
                    <span className="text-[10px] text-sky-100 font-medium block">
                      मोबाईलवर जलद व सोप्या वापरासाठी अधिकृत ॲप इन्स्टॉल करा
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-white shrink-0" />
              </button>
            )}

            {/* 4. Login Button */}
            <button
              type="button"
              id="welcome-member-login-btn"
              onClick={openLogin}
              className="w-full min-h-[46px] py-3 px-5 rounded-xl bg-gradient-to-r from-[#800C1E] via-[#941327] to-[#A71930] hover:from-[#941327] hover:to-[#800C1E] text-white font-black text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-amber-300/40"
            >
              <LogIn className="w-4 h-4 text-amber-300 shrink-0" />
              <span>🔑 खात्यात लॉगिन करा (Member Login)</span>
            </button>

            {/* 5. Wedding Vendor Registration Button */}
            {siteConfig?.enableBusinessVendors !== false && (
              <button
                type="button"
                id="welcome-vendor-register-btn"
                onClick={() => setIsBusinessVendorRegisterModalOpen(true)}
                className="w-full min-h-[42px] p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-900 font-black shadow-xs active:scale-[0.98] transition-all flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left min-w-0">
                  <div className="p-1 rounded-lg bg-amber-400 text-[#800C1E] shadow-2xs shrink-0">
                    <Handshake className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-950 block">
                      🤝 लग्न व्यवसाय / व्हेंडर नोंदणी (Vendor)
                    </span>
                    <span className="text-[9.5px] text-slate-600 block">
                      कॅटरिंग, डेकोरेशन, हॉल, फोटोग्राफर मोफत नोंदवा
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              </button>
            )}

            {/* 6. Clean Unified Telegram & Direct Admin Support Strip (No Repetition) */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                {/* A. Official Telegram Group */}
                <a
                  href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-400 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
                  <span className="truncate">📢 ग्रुप जॉईन करा</span>
                </a>

                {/* B. Direct Admin Chat with Username */}
                <a
                  href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 text-slate-950 font-black text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-300 active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span className="truncate">💬 ॲडमिन थेट चॅट</span>
                </a>
              </div>
            </div>

            {/* G. Clean Access Notice */}
            <div className="pt-0.5 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-500 text-center">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>सुरक्षित व सत्यापित प्रोफाइल पाहण्यासाठी लॉगिन आवश्यक आहे.</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* H. Important Statutory Legal Notice & Disclaimer */}
          {/* (Legally Compliant Intermediary Disclaimer - Zero Liability) */}
          {/* ============================================================ */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-2 text-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-[#800C1E] shrink-0" />
              <span>महत्त्वाची कायदेशीर सूचना (Legal Disclaimer)</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-600">
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
          {/* I. Informative Links Section */}
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
        {/* Footer with Android Safe-Area Inset Handling */}
        {/* ============================================================ */}
        <footer className="pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-slate-500 space-y-2 border-t border-slate-200/60 mt-5">
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

              {/* Direct Admin Telegram Chat */}
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

              {/* Official Support Email */}
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

              {/* Join Official Telegram Group */}
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

              <a
                href="mailto:support@vanjarijodi.web.app?subject=Vanjari%20Jodi%20Support%20Request"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold hover:bg-blue-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <div className="text-xs text-blue-700 font-normal">अधिकृत ईमेल सपोर्ट</div>
                  <div className="text-xs">support@vanjarijodi.web.app</div>
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
