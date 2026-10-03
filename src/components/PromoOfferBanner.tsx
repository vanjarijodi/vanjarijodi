import React, { useState } from 'react';
import { Sparkles, Copy, Check, X, Tag, ArrowRight, Crown, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PromoCode } from '../types';

export const PromoOfferBanner: React.FC = () => {
  const { promoCodes, addNotification, setSelectedPlanForPayment, plansList } = useApp();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Find active public promo codes
  const publicPromos = promoCodes.filter(
    (p) => p.isActive && p.showInBanner && !p.isSecret
  );

  if (isDismissed || publicPromos.length === 0) {
    return null;
  }

  // Display the first active public promo
  const promo: PromoCode = publicPromos[0];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promo.code);
    setCopiedCode(promo.code);
    setTimeout(() => setCopiedCode(null), 2000);
    addNotification?.({
      type: 'success',
      title: 'ऑफर कोड कॉपी झाला',
      message: `कूपन कोड '${promo.code}' कॉपी झाला! पेमेंट करताना वापरा.`,
    });
  };

  const handleOpenUpgrade = () => {
    const targetPlan = plansList.find((p) => p.id === 'welcome_offer') || plansList[0];
    if (targetPlan) {
      setSelectedPlanForPayment(targetPlan);
    }
  };

  const discountBadgeText =
    promo.discountType === 'vip_free'
      ? '१००% मोफत VIP (₹०)'
      : promo.discountType === 'percentage'
      ? `${promo.discountValue}% भरघोस सूट`
      : `₹${promo.discountValue} थेट सूट`;

  return (
    <aside aria-label="विशेष सवलत व कूपन ऑफर" className="relative z-30 bg-gradient-to-r from-[#700B1A] via-[#9B132B] to-[#700B1A] text-white border-b-2 border-amber-400 shadow-md py-1.5 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        {/* Left Side: Offer text */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs shrink-0 animate-pulse">
            <Gift className="w-3 h-3" />
            <span>विशेष ऑफर</span>
          </div>

          <p className="font-bold text-amber-100 text-center sm:text-left text-[11px] sm:text-xs">
            {promo.bannerText || `वापरा कूपन कोड आणि मिळवा ${discountBadgeText}!`}
          </p>

          {/* Promo Code Chip */}
          <div className="flex items-center gap-1 bg-black/40 border border-amber-300/80 rounded-lg px-2 py-0.5">
            <span className="text-[10px] text-amber-200 font-medium">कोड:</span>
            <span className="font-mono font-black text-amber-300 tracking-wider text-xs">
              {promo.code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-black transition cursor-pointer flex items-center gap-0.5 ${
                copiedCode === promo.code
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
              title="कोड कॉपी करा"
            >
              {copiedCode === promo.code ? (
                <>
                  <Check className="w-2.5 h-2.5" />
                  <span>कॉपी झाला</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  <span>कॉपी</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: CTA Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenUpgrade}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition active:scale-95"
          >
            <Crown className="w-3 h-3 text-slate-950" />
            <span>ऑफर मिळवा</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="बॅनर लपवा"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
