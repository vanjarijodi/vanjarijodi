import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plan } from '../types';
import { isGooglePlayReviewActive, isActivationCodeOnlyMode, isCompliantMobileApp } from '../utils/playStorePaymentHelper';
import { CompliantAssistedMembershipModal } from './CompliantAssistedMembershipModal';
import {
  X,
  Crown,
  Sparkles,
  CheckCircle2,
  Zap,
  Flame,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  Scroll,
  Lock,
  LogIn,
  UserPlus,
  ArrowRight,
  HelpCircle,
  Send
} from 'lucide-react';

interface MembershipPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: Plan) => void;
}

export const MembershipPlansModal: React.FC<MembershipPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const {
    language,
    plansList,
    currentUser,
    setCurrentUser,
    setSelectedPlanForPayment,
    setIsPaymentOpen,
    setIsLoginOpen,
    setIsRegisterOpen,
    setLoginModalMode,
    siteConfig,
  } = useApp();

  const isEn = language === 'en';
  const isReviewMode = isGooglePlayReviewActive(siteConfig);
  const isMobileApp = isCompliantMobileApp();
  const showOnlyWelcome = siteConfig?.showOnlyWelcomePlan !== false;

  const customerPlans = showOnlyWelcome
    ? plansList.filter((p) => p.id === 'welcome_offer' && p.isActive !== false)
    : plansList.filter((p) => p.isActive !== false && p.id !== 'single_kundli' && p.planType !== 'single_use');

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    customerPlans.find((p) => p.id === 'welcome_offer')?.id || customerPlans[0]?.id || 'welcome_offer'
  );

  if (!isOpen) return null;

  // On Mobile App, strictly render the Google Play Compliant Assisted Verification Bottom Sheet
  if (isMobileApp || isReviewMode) {
    return (
      <CompliantAssistedMembershipModal
        isOpen={isOpen}
        onClose={onClose}
        featureTitle="प्रीमियम सदस्यता सेवा"
      />
    );
  }

  const handlePlanProceed = (plan: Plan) => {
    if (isReviewMode) {
      if (!currentUser || currentUser.isGuest || currentUser.id?.startsWith('guest')) {
        setLoginModalMode('member_otp');
        setIsLoginOpen(true);
        onClose();
        return;
      }
      // Instant 100% Free Activation during Review Mode
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              membership: plan.id as any,
              isCustomAccessGranted: true,
              kundliCredits: 999,
            }
          : null
      );
      alert(
        isEn
          ? '🎉 Congratulations! Your plan is activated 100% free of charge under Community Service.'
          : '🎉 अभिनंदन! वंजारी समाज सेवेअंतर्गत तुमचा प्लॅन १००% मोफत सक्रिय करण्यात आला आहे! सर्व संपर्क व सेवा सुरू झाल्या आहेत.'
      );
      onClose();
      return;
    }

    setSelectedPlanForPayment(plan);
    if (!currentUser || currentUser.isGuest || currentUser.id?.startsWith('guest')) {
      // Guide unauthenticated users to login/register first so payment attaches to their profile
      setLoginModalMode('member_otp');
      setIsLoginOpen(true);
      onClose();
    } else {
      if (onSelectPlan) {
        onSelectPlan(plan);
      } else {
        setIsPaymentOpen(true);
        onClose();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-black/75 overflow-y-auto select-none animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#FFFDF8] via-[#FFFBF2] to-white rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#5E0715] via-[#850F22] to-[#5E0715] p-5 sm:p-6 text-white relative border-b-2 border-amber-400/80">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-amber-200 transition cursor-pointer border border-amber-300/40"
            title="बंद करा (Close)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>
                {isReviewMode
                  ? '१००% मोफत समाज सेवा'
                  : isEn
                  ? 'Official VIP Plans'
                  : 'अधिकृत मेंबरशिप योजना'}
              </span>
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/90 text-white text-[11px] font-bold rounded-full">
              {isReviewMode ? 'विनामूल्य नोंदणी व संपर्क' : '१००% पारदर्शक व सुरक्षित'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-amber-100 tracking-tight leading-tight">
            {isReviewMode
              ? 'वंजारी जोडी मॅट्रिमोनी — मोफत समाज सेवा मंच'
              : isEn
              ? 'Vanjari Jodi Matrimony Membership Plans'
              : 'वंजारी जोडी मॅट्रिमोनी — मेंबरशिप योजना व सवलती'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 font-medium">
            {isReviewMode
              ? 'गुगल प्ले स्टोअर वापरकर्त्यांसाठी सर्व वधू-वर प्रोफाईल्स, बायोडाटा, पत्रिका मिलन व संपर्क पूर्णपणे विनामूल्य उपलब्ध आहेत.'
              : isEn
              ? 'Choose a verified membership plan to unlock contact numbers, photos, and direct chat.'
              : 'वधू-वरांचे थेट फोन नंबर, फोटो, कुंडली गुणमिलन आणि अमर्याद चॅट अनलॉक करण्यासाठी योग्य प्लॅन निवडा.'}
          </p>
        </div>

        {/* 🛡️ Google Play Compliance Banner during Review Mode */}
        {isReviewMode && (
          <div className="bg-emerald-950 text-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between border-b border-emerald-700">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Google Play Policy: ॲपमधील सर्व मूलभूत प्रोफाईल शोध, संपर्क व नोंदणी १००% मोफत आहे.</span>
            </span>
            <span className="text-[11px] text-amber-300 font-bold shrink-0 ml-2">
              विनामूल्य सेवा ✓
            </span>
          </div>
        )}

        {/* Unauthenticated Guest Alert Banner */}
        {(!currentUser || currentUser.isGuest || currentUser.id?.startsWith('guest')) && (
          <div className="bg-amber-100/90 border-b border-amber-300 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-amber-950 font-bold">
            <div className="flex items-center gap-2 min-w-0">
              <Lock className="w-4 h-4 text-[#800C1E] shrink-0" />
              <span className="truncate">
                {isEn ? 'Login / Register to link membership with your profile:' : 'तुमच्या खात्यावर मेंबरशिप सक्रिय करण्यासाठी आधी लॉगिन करा:'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#800C1E] text-amber-100 text-[11px] font-black hover:bg-[#600714] transition cursor-pointer shadow-xs"
              >
                लॉगिन
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterOpen(true);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black hover:bg-amber-300 transition cursor-pointer shadow-xs border border-amber-500"
              >
                नोंदणी
              </button>
            </div>
          </div>
        )}

        {/* Plans List Cards */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3.5">
            {customerPlans.map((plan) => {
              const isWelcome = plan.id === 'welcome_offer';
              const isSelected = selectedPlanId === plan.id;
              
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-50 via-white to-amber-100/40 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  {isWelcome && (
                    <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-[#800C1E] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>विशेष सवलत ऑफर</span>
                    </span>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl ${isWelcome ? 'bg-[#800C1E] text-amber-300' : 'bg-amber-400/20 text-amber-700'}`}>
                          <Crown className="w-4 h-4" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {isEn ? plan.name : plan.nameMr || plan.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {plan.durationLabelMr || `${plan.durationMonths} महिने पूर्ण वैधता`} • {plan.contactLimit ? `${plan.contactLimit} थेट संपर्क क्रमांक` : 'अमर्याद संपर्क्स'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-emerald-700">
                          {isReviewMode || isActivationCodeOnlyMode(siteConfig) ? '🔑 मोफत सेवा' : `₹${plan.price}`}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          {isReviewMode || isActivationCodeOnlyMode(siteConfig) ? '(Free Access)' : 'INR'}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-0.5">
                        {isReviewMode || isActivationCodeOnlyMode(siteConfig) ? '✓ १-क्लिक मोफत अ‍ॅक्टिव्हेशन' : '✓ सर्व कर समाविष्ट (Inclusive of Taxes)'}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                    {(language === 'mr' ? plan.featuresMr : plan.features).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanProceed(plan);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2 ${
                        isReviewMode
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:brightness-110'
                          : isWelcome
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-105 border border-amber-300'
                          : 'bg-gradient-to-r from-amber-500 to-[#800C1E] text-white hover:brightness-110'
                      }`}
                    >
                      <span>
                        {isReviewMode || isActivationCodeOnlyMode(siteConfig)
                          ? (!currentUser || currentUser.isGuest
                            ? (isEn ? 'Login for Free Access' : 'मोफत लॉगिन करा')
                            : (isEn ? 'Activate via Code / Free' : '🔑 ऍक्टिव्हेशन कोडने सुरू करा'))
                          : !currentUser || currentUser.isGuest
                          ? (isEn ? 'Login & Activate Plan' : 'लॉगिन करून हा प्लॅन निवडा')
                          : (isEn ? 'Proceed to Payment (₹' + plan.price + ')' : 'हा प्लॅन निवडा व सुरू करा (₹' + plan.price + ')')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transparent Guarantees Strip */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>सुरक्षा व सेवा खात्री:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {isActivationCodeOnlyMode(siteConfig)
                ? '• ॲपमध्ये कोणत्याही पैशांचा किंवा पेमेंटचा व्यवहार केला जात नाही • ऍक्टिव्हेशन कोडद्वारे खाते मोफत चालू होते • ऑनलाईन पेमेंट सेवा फक्त अधिकृत वेबसाईट vanjarijodi.web.app वर उपलब्ध आहे.'
                : '• UPI / Razorpay द्वारे सुरक्षित पेमेंट • पेमेंट होताच खात्यावर इन्स्टंट सक्रियता • ग्राहक सेवा व टेलिग्राम सपोर्ट उपलब्ध.'}
            </p>
          </div>
        </div>

        {/* Footer Support */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium text-center sm:text-left">
            काही अडचण किंवा प्रश्न असल्यास थेट संपर्क करा:
          </span>
          <a
            href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>टेलिग्राम सपोर्ट (Telegram)</span>
          </a>
        </div>

      </div>
    </div>
  );
};
