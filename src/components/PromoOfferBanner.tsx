import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, X, ArrowRight, Crown, Gift, BellRing } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PromoCode } from '../types';

export const PromoOfferBanner: React.FC = () => {
  const { promoCodes, addNotification, setSelectedPlanForPayment, plansList, currentUser, isCurrentUserPlanExpired } = useApp();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Check if current user already has an active paid subscription
  const hasActivePaidPlan =
    currentUser &&
    currentUser.membership &&
    currentUser.membership !== 'free' &&
    currentUser.membership !== 'guest' &&
    !isCurrentUserPlanExpired;

  // If user already has an active plan, do not show the promo banner
  if (hasActivePaidPlan) {
    return null;
  }

  // Find active public promo codes
  const publicPromos = promoCodes.filter(
    (p) => p.isActive && p.showInBanner && !p.isSecret
  );

  if (isDismissed || publicPromos.length === 0) {
    return null;
  }

  // Display the primary active public promo
  const promo: PromoCode = publicPromos[0];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promo.code);
    setCopiedCode(promo.code);
    setTimeout(() => setCopiedCode(null), 2500);
    addNotification?.({
      type: 'approval',
      title: '🎁 ऑफर कोड कॉपी झाला!',
      message: `कूपन कोड '${promo.code}' कॉपी झाला! पेमेंट करताना वापरा आणि थेट सवलत मिळवा.`,
    });
  };

  const handleOpenUpgrade = () => {
    const targetPlan = plansList.find((p) => p.id === 'welcome_offer') || plansList[0];
    if (targetPlan) {
      setSelectedPlanForPayment(targetPlan);
      setIsDismissed(true);
    }
  };

  const discountBadgeText =
    promo.discountType === 'vip_free'
      ? '१००% मोफत VIP (₹०)'
      : promo.discountType === 'percentage'
      ? `${promo.discountValue}% भरघोस सूट`
      : `₹${promo.discountValue} थेट सूट`;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl px-2 animate-in slide-in-from-top-4 duration-400 fade-in">
      <div className="relative bg-gradient-to-r from-[#5B0813]/95 via-[#800C1E]/95 to-[#A71930]/95 backdrop-blur-md text-white border-2 border-amber-400 rounded-2xl shadow-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Glow Aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 rounded-2xl blur-sm -z-10 animate-pulse pointer-events-none" />

        {/* Left Side: Badge & Message */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Gift className="w-5 h-5 text-slate-950 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-amber-400/30 border border-amber-300 text-amber-200 text-[10px] font-black uppercase tracking-wider">
                विशेष सवलत ऑफर
              </span>
              <span className="text-[10px] text-amber-300 font-bold">
                {discountBadgeText}
              </span>
            </div>
            <p className="font-bold text-white text-xs truncate mt-0.5">
              {promo.bannerText || `वापरा कूपन कोड '${promo.code}' आणि मिळवा भरघोस सूट!`}
            </p>
          </div>
        </div>

        {/* Right Side: Copy & Claim Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10">
          {/* Coupon Code Pill */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-black/50 hover:bg-black/70 border border-amber-300/80 rounded-xl px-2.5 py-1 text-xs transition cursor-pointer active:scale-95"
            title="क्लिक करून कूपन कॉपी करा"
          >
            <span className="font-mono font-black text-amber-300 tracking-wider text-xs">
              {promo.code}
            </span>
            {copiedCode === promo.code ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-amber-200" />
            )}
          </button>

          {/* Claim Button */}
          <button
            type="button"
            onClick={handleOpenUpgrade}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer transition active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 text-slate-950" />
            <span>ऑफर मिळवा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Close Dismiss Button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition cursor-pointer"
            title="लपवा"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
