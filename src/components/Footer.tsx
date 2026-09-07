import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Phone, Mail, MapPin, Download, ShieldCheck, Sparkles, ShieldAlert, MessageCircle, Send, FileText, Lock, RefreshCw, CreditCard, Globe, Users, Award, Scale, UserCheck, Clock, Building } from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';
import { WadheBhauModal } from './WadheBhauModal';
import { VANJARI_FOUR_DIVISIONS } from '../data/vanjariKuliData';
import { VANJARI_CITIES } from '../utils/seoData';

export const Footer: React.FC = () => {
  const { t, language, siteConfig, setIsAdminOpen, openSeoLanding, setIsGitHubSyncOpen } = useApp();
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isWadheBhauOpen, setIsWadheBhauOpen] = useState(false);
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
    <footer id="contact-section" className="bg-[#800C1E] text-amber-100 border-t-2 border-amber-400 w-full max-w-full overflow-hidden">
      
      {/* 1. MANDATORY MARATHI DISCLAIMER BOX */}
      <div className="bg-[#5C0815] py-4 px-4 sm:px-6 lg:px-8 border-b border-amber-400/30">
        <div className="max-w-7xl mx-auto bg-[#800C1E]/80 border border-amber-400/40 rounded-xl p-3 sm:p-4 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-400 text-[#800C1E] shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4 font-bold" />
            </div>
            <div className="space-y-1 text-xs text-amber-100/90 leading-relaxed font-medium">
              <h4 className="font-extrabold text-amber-300 text-xs sm:text-sm underline underline-offset-2 decoration-amber-400">
                {language === 'en' ? 'Disclaimer / Notice' : 'महत्त्वाची सूचना (Disclaimer)'}
              </h4>
              <p className="pt-0.5 text-slate-200">{disclaimer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER INFO (PayU Mandatory Merchant Details) */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand Column */}
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <VanjariJodiLogo variant="full" size={50} />
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
              {language === 'en'
                ? (siteConfig?.aboutUsTextEn || 'Vanjari Jodi Matrimony is the official trusted matrimonial portal for Vanjari brides and grooms across Maharashtra and worldwide, offering verified matchmaking and biodata services.')
                : (siteConfig?.aboutUsText || 'वंजारी जोडी मॅट्रिमोनी हे वंजारी समाजातील वधू-वरांसाठी अधिकृत आणि विश्वासू वधू-वर सूचक केंद्र आहे; जिथे राज्यभरातील उच्चशिक्षित वंजारी स्थळे उपलब्ध आहेत.')}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{language === 'en' ? 'Safe & Confidential Matrimonial Service' : 'सुरक्षित व गोपनीय विवाह सेवा'}</span>
            </div>
          </div>

          {/* Central Verified Merchant Business Details Box (Mandatory for PayU) */}
          <div className="bg-[#5C0815] px-5 py-4 rounded-2xl border-2 border-amber-400/50 shadow-inner text-left space-y-2 text-xs text-amber-100 max-w-md w-full">
            <div className="flex items-center justify-between border-b border-amber-400/20 pb-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase">
                <Building className="w-4 h-4 text-amber-400 shrink-0" />
                <span>PRIME MULTI SERVICES AND SUPPLIERS</span>
              </div>
              <span className="text-[10px] text-amber-200 bg-amber-400/20 px-2 py-0.5 rounded font-bold">
                Brand: Vanjarijodi Matrimony
              </span>
            </div>
            
            <div className="space-y-1 text-[11px] font-medium text-amber-100/90">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span><strong>Registered Address:</strong> At Post Padali, Taluka Shirur (Kasar), District Beed, Maharashtra - 413249</span>
              </p>
              <p className="flex items-center gap-1.5 text-sky-200">
                <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  <strong>Official Support:</strong>{' '}
                  <a
                    href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sky-300 font-extrabold bg-sky-900/60 px-2 py-0.5 rounded border border-sky-400/40 inline-flex items-center gap-1"
                  >
                    <span>@{siteConfig?.telegramUsername || 'Primemultiservice'}</span>
                    <span className="text-[10px] bg-sky-400 text-sky-950 px-1 rounded font-black">थेट चॅट करा ↗</span>
                  </a>
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-sky-200">
                <Send className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>
                  <strong>Telegram Community Group:</strong>{' '}
                  <a
                    href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sky-200 font-extrabold bg-sky-800/60 px-2 py-0.5 rounded border border-sky-300/40 inline-flex items-center gap-1"
                  >
                    <span>📢 Join Telegram Group</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1 rounded font-black">जॉईन व्हा ↗</span>
                  </a>
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span><strong>Customer Support Email:</strong> <a href={`mailto:${siteConfig?.contactEmail || 'gitevijay123@gmail.com'}`} className="hover:underline text-amber-200 font-bold">{siteConfig?.contactEmail || 'gitevijay123@gmail.com'}</a></span>
              </p>
              <p className="flex items-center gap-1.5 text-emerald-300 font-semibold pt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Working Hours:</strong> Monday to Saturday | 10:00 AM – 06:00 PM</span>
              </p>
            </div>
          </div>
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

          {/* Four Major Vanjari Divisions & Wadhe Bhau Guide */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] bg-[#5C0815]/90 p-3 rounded-2xl border border-amber-400/30">
            <span className="font-bold text-amber-300 flex items-center gap-1 shrink-0">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{language === 'en' ? '4 Major Divisions:' : 'वंजारी समाज ४ मुख्य विभाग:'}</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {VANJARI_FOUR_DIVISIONS.map((div) => (
                <span
                  key={div.code}
                  className="px-2.5 py-1 rounded-lg bg-[#800C1E] border border-amber-400/30 text-amber-100 font-bold text-[11px]"
                >
                  {div.name}
                </span>
              ))}
            </div>
            <button
              onClick={() => setIsWadheBhauOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#800C1E] font-black text-xs hover:from-amber-300 hover:to-amber-400 transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>🚩 वंजारी जातकुळी, गोत्र व वाढे भाऊ मार्गदर्शिका ↗</span>
            </button>
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

      {/* LEGAL POLICY LINKS BAR (100% PAYU & RBI COMPLIANT) */}
      <div className="bg-[#5C0815] border-t border-b border-amber-400/30 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-amber-200">
          <button
            onClick={() => openPolicy('terms')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Terms & Conditions</span>
          </button>

          <button
            onClick={() => openPolicy('privacy')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => openPolicy('refund')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Return & Refund Policy</span>
          </button>

          <button
            onClick={() => openPolicy('cancellation')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>Cancellation Policy</span>
          </button>

          <button
            onClick={() => openPolicy('shipping')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Shipping & Delivery Policy</span>
          </button>

          <button
            onClick={() => openPolicy('about')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => openPolicy('pricing')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Pricing & Products (INR)</span>
          </button>

          <button
            onClick={() => openPolicy('contact')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Contact Us & Address</span>
          </button>

          <button
            onClick={() => openPolicy('grievance')}
            className="hover:text-amber-100 underline decoration-amber-400 underline-offset-4 flex items-center gap-1 cursor-pointer transition-all bg-amber-400/15 px-2.5 py-1 rounded-lg border border-amber-400/40 text-amber-300"
          >
            <Scale className="w-3.5 h-3.5 text-amber-300" />
            <span>Grievance Officer (IT Rules)</span>
          </button>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-amber-400/20 py-4 px-4 text-center text-xs text-amber-200/70 font-medium flex flex-wrap items-center justify-between max-w-7xl mx-auto gap-2">
        <p>© 2026 Vanjarijodi Matrimony. All Rights Reserved. Owned and Operated by PRIME MULTI SERVICES AND SUPPLIERS</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsAdminOpen(true);
            }}
            className="text-[11px] text-amber-300 hover:text-amber-100 font-bold underline cursor-pointer flex items-center gap-1"
          >
            <span>{language === 'en' ? 'Admin Panel Login' : 'प्रशासक प्रवेश (Admin Panel)'}</span>
          </button>
        </div>
      </div>

      {/* Policy Modal */}
      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        initialTab={legalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* Wadhe Bhau & Kuli Guide Modal */}
      <WadheBhauModal
        isOpen={isWadheBhauOpen}
        onClose={() => setIsWadheBhauOpen(false)}
      />
    </footer>
  );
};
