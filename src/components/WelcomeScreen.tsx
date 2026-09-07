import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VanjariJodiLogo } from './VanjariJodiLogo';
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
} from 'lucide-react';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';

export const WelcomeScreen: React.FC = () => {
  const {
    setIsLoginOpen,
    setIsRegisterOpen,
    setIsBusinessVendorRegisterModalOpen,
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

  const openPolicy = (tab: PolicyTabType) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Authentic seated portrait image of Shri Sant Bhagwan Baba
  const bhagwanBabaImg = "https://upload.wikimedia.org/wikipedia/commons/5/50/Bhagawanbaba.png";

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col justify-between selection:bg-[#800C1E] selection:text-white">
      {/* ============================================================ */}
      {/* A. Top Devotional / Header Strip (॥ श्री संत भगवान बाबा प्रसन्न ॥) */}
      {/* ============================================================ */}
      <header className="w-full bg-[#800C1E] text-amber-100 text-xs py-2.5 px-4 text-center font-bold shadow-xs border-b border-amber-500/40 flex items-center justify-center gap-2 select-none pt-[max(0.6rem,env(safe-area-inset-top))]">
        <span className="text-amber-300">॥</span>
        <span>श्री संत भगवान बाबा प्रसन्न</span>
        <span className="text-amber-300">॥</span>
      </header>

      {/* ============================================================ */}
      {/* Main Content Container (Mobile-First, Controlled Clean Layout) */}
      {/* ============================================================ */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col justify-between">
        <div className="space-y-4 sm:space-y-5">
          
          {/* ============================================================ */}
          {/* B. Brand & Logo Area (Independent, Clean & Centered) */}
          {/* ============================================================ */}
          <div className="flex flex-col items-center text-center">
            
            {/* 1. Sant Bhagwan Baba Sacred Portrait Medallion */}
            <div className="flex flex-col items-center mb-3">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-amber-400 flex items-center justify-center">
                  <img
                    src={bhagwanBabaImg}
                    alt="राष्ट्रसंत श्री संत भगवान बाबा"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-black text-[#800C1E] tracking-tight mt-1.5 block">
                राष्ट्रसंत श्री संत भगवान बाबा
              </span>
            </div>

            {/* 2. Vanjari Jodi Official Logo */}
            <div className="flex flex-col items-center justify-center w-full">
              <VanjariJodiLogo
                variant="stacked"
                size={56}
                showSubtitle={true}
                className="w-full"
              />
            </div>

            {/* C. Community Portal Tag */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300/90 text-[#800C1E] text-xs font-black tracking-wide shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
              <span>वंजारी समाज वधू-वर सूचक केंद्र</span>
            </div>

            {/* D. Welcome Description */}
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs sm:max-w-sm mx-auto font-medium">
              पवित्र व संस्कारक्षम नात्यांची सुंदर सुरुवात. आपल्या समाजातील सुसंस्कृत वधू-वर स्थळे शोधण्यासाठी लॉगिन करा.
            </p>
          </div>

          {/* ============================================================ */}
          {/* E, F, G. Primary Action Buttons */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm space-y-3">
            {/* E. Login Button */}
            <button
              type="button"
              onClick={openLogin}
              className="w-full min-h-[48px] py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#800C1E] via-[#941327] to-[#A71930] hover:from-[#941327] hover:to-[#800C1E] text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-amber-300/30"
            >
              <LogIn className="w-5 h-5 text-amber-300 shrink-0" />
              <span>लॉगिन करा (Login)</span>
            </button>

            {/* F. Free Registration Button */}
            <button
              type="button"
              onClick={openRegister}
              className="w-full min-h-[48px] py-3.5 px-5 rounded-xl bg-amber-50 hover:bg-amber-100/90 border-2 border-amber-400/90 text-[#800C1E] font-black text-sm sm:text-base shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-amber-800 shrink-0" />
              <span>नवीन नोंदणी करा (मोफत)</span>
            </button>

            {/* F2. Wedding Vendor Registration Button (Catering, Decoration, Florists, Halls etc.) */}
            {siteConfig?.enableBusinessVendors !== false && (
              <button
                type="button"
                onClick={() => setIsBusinessVendorRegisterModalOpen(true)}
                className="w-full min-h-[52px] p-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-between gap-2.5 cursor-pointer border-2 border-amber-300"
              >
                <div className="flex items-center gap-2.5 text-left min-w-0">
                  <div className="p-2 rounded-xl bg-slate-950 text-amber-300 shadow-xs shrink-0">
                    <Handshake className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-slate-950">
                        🤝 व्हेंडर नोंदणी (Vendor Registration)
                      </span>
                      <span className="text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full font-black">
                        नवीन
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">
                      जेवण (कॅटरिंग), डेकोरेशन, फुलवाले, हॉल — दर व माहिती भरा
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-950 shrink-0" />
              </button>
            )}

            {/* G. Clean Access Notice */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>प्रोफाईल पाहण्यासाठी व संपर्क करण्यासाठी सभासद लॉगिन आवश्यक आहे.</span>
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

              {paymentConfig?.adminMobileNumber ? (
                <a
                  href={`tel:${paymentConfig.adminMobileNumber}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold hover:bg-emerald-100 transition-colors"
                >
                  <PhoneCall className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="text-xs text-emerald-700 font-normal">कॉल सपोर्ट</div>
                    <div>+91 {paymentConfig.adminMobileNumber}</div>
                  </div>
                </a>
              ) : null}

              {paymentConfig?.whatsappNumber ? (
                <a
                  href={`https://wa.me/91${paymentConfig.whatsappNumber}?text=Hello%20Vanjari%20Jodi%2C%20I%20need%20assistance.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-900 font-bold hover:bg-green-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-700 shrink-0" />
                  <div>
                    <div className="text-xs text-green-700 font-normal">WhatsApp सपोर्ट</div>
                    <div>+91 {paymentConfig.whatsappNumber}</div>
                  </div>
                </a>
              ) : null}

              <a
                href="mailto:support@vanjarijodi.com?subject=Vanjari%20Jodi%20Support%20Request"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold hover:bg-blue-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <div className="text-xs text-blue-700 font-normal">अधिकृत ईमेल सपोर्ट</div>
                  <div className="text-xs">support@vanjarijodi.com</div>
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
