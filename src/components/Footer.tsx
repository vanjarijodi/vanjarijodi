import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Phone, Mail, MapPin, Download, ShieldCheck, Sparkles, ShieldAlert, MessageCircle, Send, FileText, Lock, RefreshCw, CreditCard, Globe, Users, Award } from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';
import { VANJARI_SUB_CASTES, VANJARI_CITIES } from '../utils/seoData';

export const Footer: React.FC = () => {
  const { t, language, siteConfig, setIsAdminOpen, openSeoLanding } = useApp();
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<PolicyTabType>('terms');

  const openPolicy = (tab: PolicyTabType) => {
    setLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const disclaimer = language === 'en'
    ? (siteConfig?.disclaimerTextEn || "Mandatory Disclaimer / Notice: 'VanjariJodi' is a digital matrimonial platform providing connecting services for brides, grooms, and their families. Users and families are strongly advised to independently verify all profile details, family background, and credentials before finalizing any alliance or transaction.")
    : (siteConfig?.disclaimerText || `महत्त्वाची सूचना / टीप: 'वंजारी जोडी' हे केवळ वधू-वरांना आणि त्यांच्या कुटुंबांना परस्परांशी संपर्क साधण्यासाठी उपलब्ध करून दिलेले एक डिजिटल व्यासपीठ आहे. या मंचावर नोंदणी केलेल्या कोणत्याही प्रोफाईलची माहिती, कौटुंबिक पार्श्वभूमी, आर्थिक किंवा शैक्षणिक कागदपत्रांची पडताळणी आम्ही करत नाही. त्यामुळे कोणताही विवाह निश्चित करण्यापूर्वी किंवा आर्थिक व्यवहार करण्यापूर्वी वधू आणि वराच्या पालकांनी/कुटुंबीयांनी स्वतःच्या स्तरावर सर्व माहितीची प्रत्यक्ष खात्री (Verification) करून घ्यावी.`);

  return (
    <footer id="contact-section" className="bg-[#800C1E] text-amber-100 border-t-2 border-amber-400">
      
      {/* 1. MANDATORY MARATHI DISCLAIMER BOX */}
      <div className="bg-[#5C0815] py-6 px-4 sm:px-6 lg:px-8 border-b border-amber-400/30">
        <div className="max-w-7xl mx-auto bg-[#800C1E]/80 border-2 border-amber-400/60 rounded-2xl p-4 sm:p-6 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-400 text-[#800C1E] shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 font-bold" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
              <h4 className="font-extrabold text-amber-300 text-sm sm:text-base underline underline-offset-4 decoration-amber-400">
                {language === 'en' ? 'Mandatory Disclaimer / Notice' : 'महत्त्वाची सूचना / टीप (Mandatory Disclaimer)'}
              </h4>
              <p className="pt-1 text-slate-100">{disclaimer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTACT HELPLINE BANNER */}
      {!siteConfig?.hideContactAndAddressGlobal && (
        <div className="bg-[#A71930] py-6 px-4 sm:px-6 lg:px-8 border-b border-amber-400/20 text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-bold flex items-center justify-center md:justify-start gap-2 text-amber-200">
                <Sparkles className="w-5 h-5 fill-amber-300 text-amber-300" />
                <span>
                  {language === 'en'
                    ? 'Contact & Helpline'
                    : (siteConfig?.contactHeaderTitle || 'संपर्क व मदत कक्ष (Contact & Helpline)')}
                </span>
              </h3>
              <p className="text-xs text-amber-100">
                {siteConfig?.contactHeaderSubtitle || (language === 'mr' ? 'कोणतीही अडचण किंवा चौकशीसाठी आमच्याशी संपर्क साधा.' : 'Have queries? Call our helpline anytime.')}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  const btn = document.getElementById('support-chat-trigger-btn');
                  if (btn) btn.click();
                  else alert(language === 'en' ? 'Please click on the Admin Chat icon on the screen.' : 'मदत व सहाय्यासाठी कृपया स्क्रीनवरील ॲडमिन चॅट आयकॉनवर क्लिक करा.');
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-300 to-amber-200 text-[#800C1E] hover:from-amber-200 hover:to-amber-100 rounded-xl font-black shadow-md flex items-center gap-2 border border-amber-400 cursor-pointer active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#A71930]" />
                <span>{language === 'en' ? '💬 Chat with Admin' : '💬 थेट ॲडमिन चॅट करा'}</span>
              </button>

              <a
                href={`tel:${siteConfig?.contactPhone || '0000000000'}`}
                className="px-4 py-2 bg-white text-[#A71930] hover:bg-amber-100 rounded-xl font-black shadow flex items-center gap-2 border border-amber-300"
              >
                <Phone className="w-4 h-4 text-[#A71930]" />
                <span>{siteConfig?.contactPhone || '0000000000'}</span>
              </a>
              {siteConfig?.contactWhatsapp && (
                <a
                  href={`https://wa.me/${siteConfig.contactWhatsapp.replace(/\D/g, '') || '0000000000'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold shadow flex items-center gap-2"
                >
                  <span>WhatsApp: {siteConfig.contactWhatsapp || '0000000000'}</span>
                </a>
              )}
              {siteConfig?.telegramGroupUrl && siteConfig.telegramGroupUrl.trim() !== '' && (
                <a
                  href={siteConfig.telegramGroupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#229ED9] text-white hover:bg-[#1d8cb0] rounded-xl font-bold shadow flex items-center gap-2 border border-sky-300/50"
                >
                  <Send className="w-4 h-4 text-white animate-bounce" />
                  <span>{language === 'en' ? '📢 Join Telegram Group' : '📢 टेलिग्राम ग्रुप जॉईन करा'}</span>
                </a>
              )}
              {siteConfig?.contactEmail && siteConfig.contactEmail.trim() !== '' && (
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="px-4 py-2 bg-[#800C1E] text-amber-200 hover:bg-[#5C0815] rounded-xl font-bold border border-amber-300/40 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>{siteConfig.contactEmail}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN FOOTER INFO */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Brand Column */}
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <VanjariJodiLogo variant="full" size={50} />
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
            {language === 'en'
              ? (siteConfig?.aboutUsTextEn || 'Trusted digital matrimonial platform for Vanjari community brides & grooms with full safety & privacy features.')
              : (siteConfig?.aboutUsText || 'वंजारी समाजातील वधू-वरांसाठी विश्वासाचे आणि सर्व सोयींनी युक्त डिजिटल मॅट्रिमोनी व्यासपीठ.')}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{language === 'en' ? 'Safe & Confidential Matrimonial Service' : 'सुरक्षित व गोपनीय विवाह सेवा'}</span>
          </div>
        </div>

        {/* Central Blessing Banner */}
        <div className="bg-[#5C0815] px-6 py-4 rounded-2xl border-2 border-amber-400/50 shadow-inner text-center space-y-1">
          <span className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-widest block">
            {language === 'en' ? '॥ Shree Sant Bhagwan Baba Prasanna ॥' : '॥ श्री संत भगवान बाबा प्रसन्न ॥'}
          </span>
          <p className="text-[11px] text-amber-200 font-bold">
            {language === 'en'
              ? 'Thousands of successful Vanjari marriages with the divine blessings of Sant Bhagwan Baba!'
              : 'संत भगवान बाबा व जगदंबा माता यांच्या आशीर्वादाने हजारो यशस्वी वंजारी विवाह जोड्या!'}
          </p>
        </div>

      </div>

      {/* 4. PROGRAMMATIC SEO & DIRECTORY CRAWLER HUB (100% VANJARI SAMAJ) */}
      <div className="bg-[#4D0612] py-5 px-4 sm:px-6 lg:px-8 border-t border-amber-400/30 text-amber-100">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'en'
                  ? 'Vanjari Matrimony Directory (Sub-Castes & Major Belts):'
                  : 'वंजारी समाज पोटजात व जिल्हानिहाय विवाह शोध निर्देशिका:'}
              </span>
            </h4>

            <button
              onClick={() => openSeoLanding()}
              className="text-[11px] font-bold text-amber-200 hover:text-white underline decoration-amber-400 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>{language === 'en' ? 'View All Vanjari Landing Pages ↗' : 'सर्व वंजारी पोटजात व जिल्हा पेजेस पहा ↗'}</span>
            </button>
          </div>

          {/* Sub-Castes Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-bold text-amber-300/80 mr-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              <span>{language === 'en' ? 'Sub-Castes:' : 'वंजारी पोटजाती:'}</span>
            </span>
            {VANJARI_SUB_CASTES.map((c) => (
              <button
                key={c.slug}
                onClick={() => openSeoLanding({ community: c.slug })}
                className="px-2.5 py-1 rounded-lg bg-[#5C0815] hover:bg-amber-400 hover:text-[#800C1E] transition border border-amber-400/30 cursor-pointer text-amber-100 font-medium"
              >
                {language === 'mr' ? c.nameMr.split(' (')[0] : c.nameEn}
              </button>
            ))}
          </div>

          {/* Major Districts Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
            <span className="font-bold text-amber-300/80 mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{language === 'en' ? 'Key Districts & Belts:' : 'प्रमुख वंजारी बालेकिल्ले / जिल्हे:'}</span>
            </span>
            {VANJARI_CITIES.map((city) => (
              <button
                key={city.slug}
                onClick={() => openSeoLanding({ city: city.slug })}
                className="px-2.5 py-1 rounded-lg bg-[#5C0815] hover:bg-amber-400 hover:text-[#800C1E] transition border border-amber-400/30 cursor-pointer text-amber-100 font-medium"
              >
                {language === 'mr' ? city.nameMr.split(' (')[0] : city.nameEn}
              </button>
            ))}
          </div>

          {/* XML Sitemap & Robots direct links for Web Crawlers */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-[10px] text-amber-200/70 border-t border-amber-400/15">
            <span>🚩 Official Vanjari Community Crawlers & Fast Indexing:</span>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-amber-100 underline">
              XML Sitemap (/sitemap.xml)
            </a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-amber-100 underline">
              Robots Directives (/robots.txt)
            </a>
            <a href="https://schema.org/MarriageAgency" target="_blank" rel="noopener noreferrer" className="hover:text-amber-100 underline">
              Vanjari Matrimony Schema
            </a>
          </div>
        </div>
      </div>

      {/* LEGAL POLICY LINKS BAR */}
      <div className="bg-[#5C0815] border-t border-b border-amber-400/30 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-amber-200">
          <button
            onClick={() => openPolicy('terms')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'Terms & Conditions' : 'अटी व शर्ती (Terms)'}</span>
          </button>

          <button
            onClick={() => openPolicy('privacy')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'Privacy Policy' : 'गोपनीयता धोरण (Privacy)'}</span>
          </button>

          <button
            onClick={() => openPolicy('refund')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'Refund & Cancellation' : 'परतावा व रद्द धोरण (Refund)'}</span>
          </button>

          <button
            onClick={() => openPolicy('contact')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'Contact Us' : 'संपर्क साधा (Contact Us)'}</span>
          </button>

          <button
            onClick={() => openPolicy('about_pricing')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'About & Pricing Plans' : 'आमच्याबद्दल व वर्गणी (Pricing)'}</span>
          </button>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-amber-400/20 py-4 px-4 text-center text-xs text-amber-200/70 font-medium flex flex-wrap items-center justify-between max-w-7xl mx-auto">
        <p>© 2026 {language === 'en' ? 'VanjariJodi Matrimony' : 'वंजारी जोडी मॅट्रिमोनी'} ({siteConfig?.logoTitle || 'VanjariJodi'}). {language === 'en' ? 'All rights reserved.' : 'सर्व हक्क सुरक्षित.'}</p>
        <button
          onClick={() => {
            setIsAdminOpen(true);
          }}
          className="text-[11px] text-amber-300 hover:text-amber-100 font-bold underline cursor-pointer mt-1 sm:mt-0 flex items-center gap-1"
        >
          <span>{language === 'en' ? 'Admin Panel Login' : 'प्रशासक प्रवेश (Admin Panel)'}</span>
        </button>
      </div>

      {/* Policy Modal */}
      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        initialTab={legalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </footer>
  );
};
