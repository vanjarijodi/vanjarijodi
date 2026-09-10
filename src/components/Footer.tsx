import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Send, Users, Building } from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';
import { WadheBhauModal } from './WadheBhauModal';

export const Footer: React.FC = () => {
  const { t, language, siteConfig, setIsAdminOpen, openSeoLanding, setIsGitHubSyncOpen } = useApp();
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isWadheBhauOpen, setIsWadheBhauOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<PolicyTabType>('terms');
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);

  const openPolicy = (tab: PolicyTabType) => {
    setLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  const isEn = language === 'en';

  const telegramUsername = (siteConfig?.telegramUsername || 'Primemultiservice')
    .replace(/^@/, '')
    .replace(/^https?:\/\/t\.me\//, '');

  const disclaimerShort = isEn
    ? "Notice: VanjariJodi is a digital matchmaking portal. Families are advised to independently verify all profile credentials before finalizing alliances."
    : "महत्त्वाची सूचना: 'वंजारी जोडी' हे डिजिटल वधू-वर सूचक व्यासपीठ आहे. विवाह निश्चितीपूर्वी कुटुंबीयांनी सर्व माहितीची प्रत्यक्ष खात्री (Verification) करून घ्यावी.";

  const disclaimerFull = isEn
    ? (siteConfig?.disclaimerTextEn || "Mandatory Disclaimer: 'VanjariJodi' is a digital matrimonial platform providing connecting services for brides, grooms, and their families. Users and families are strongly advised to independently verify all profile details, family background, and credentials before finalizing any alliance or transaction.")
    : (siteConfig?.disclaimerText || `महत्त्वाची सूचना / टीप: 'वंजारी जोडी' हे केवळ वधू-वरांना आणि त्यांच्या कुटुंबांना परस्परांशी संपर्क साधण्यासाठी उपलब्ध करून दिलेले एक डिजिटल व्यासपीठ आहे. या मंचावर नोंदणी केलेल्या कोणत्याही प्रोफाईलची माहिती, कौटुंबिक पार्श्वभूमी, आर्थिक किंवा शैक्षणिक कागदपत्रांची पडताळणी आम्ही करत नाही. त्यामुळे कोणताही विवाह निश्चित करण्यापूर्वी किंवा आर्थिक व्यवहार करण्यापूर्वी वधू आणि वराच्या पालकांनी/कुटुंबीयांनी स्वतःच्या स्तरावर सर्व माहितीची प्रत्यक्ष खात्री (Verification) करून घ्यावी.`);

  return (
    <footer id="contact-section" className="bg-[#4D0612] text-amber-100 border-t border-amber-400/40 w-full max-w-full overflow-hidden text-xs">
      
      {/* 1. COMPACT BRAND & MERCHANT DETAILS ROW */}
      <div className="max-w-6xl mx-auto py-5 px-4 sm:px-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left border-b border-amber-400/20 pb-4">
          
          {/* Brand Col */}
          <div className="space-y-1 max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <VanjariJodiLogo variant="emblem" size={32} />
              <span className="font-black text-white text-base tracking-wide">वंजारी जोडी मॅट्रिमोनी</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-snug">
              {isEn
                ? 'Official trusted matrimonial platform for Vanjari community across Maharashtra.'
                : 'महाराष्ट्रभरातील वंजारी समाजासाठी अधिकृत आणि विश्वासू वधू-वर सूचक केंद्र.'}
            </p>
          </div>

          {/* Merchant & Support Contacts */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-[11px]">
            {/* Telegram Direct Support */}
            <a
              href={`https://t.me/${telegramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-400/40 font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>मदत: @{telegramUsername}</span>
            </a>

            {/* Wadhe Bhau Guide */}
            <button
              onClick={() => setIsWadheBhauOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>वाढे भाऊ मार्गदर्शिका ↗</span>
            </button>

            {/* Registered Business */}
            <div className="px-3 py-1.5 rounded-xl bg-black/20 text-amber-200/70 border border-amber-400/20 font-medium flex items-center gap-1">
              <Building className="w-3 h-3 text-amber-400" />
              <span>Prime Multi Services (Beed)</span>
            </div>
          </div>
        </div>

        {/* 2. COMPACT & CLEAN LEGAL LINKS STRIP */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-amber-200/90">
          <button
            onClick={() => openPolicy('terms')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            Terms & Conditions
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('privacy')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('refund')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            Return & Refund
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('cancellation')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            Cancellation Policy
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('shipping')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            Shipping Policy
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('pricing')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            Pricing (INR)
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('about')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            About Us
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('contact')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors"
          >
            Contact
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('grievance')}
            className="hover:text-white underline decoration-amber-400/60 underline-offset-2 cursor-pointer transition-colors text-amber-300"
          >
            Grievance Officer
          </button>
        </div>

        {/* 3. MINIMAL COMPACT DISCLAIMER */}
        <div className="bg-[#3A040D] rounded-xl p-2.5 border border-amber-400/20 text-[10.5px] text-amber-200/80 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{showFullDisclaimer ? disclaimerFull : disclaimerShort}</span>
              <button
                type="button"
                onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
                className="ml-1.5 font-bold text-amber-300 hover:text-white underline cursor-pointer inline"
              >
                {showFullDisclaimer ? 'कमी करा' : 'अधिक वाचा'}
              </button>
            </div>
          </div>
        </div>

        {/* 4. COPYRIGHT & ADMIN LOGIN */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-amber-200/60 border-t border-amber-400/10">
          <p>© 2026 Vanjarijodi Matrimony • All Rights Reserved</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-amber-300 hover:text-white font-bold underline cursor-pointer"
            >
              🔐 {isEn ? 'Admin Login' : 'प्रशासक लॉगिन'}
            </button>
          </div>
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
