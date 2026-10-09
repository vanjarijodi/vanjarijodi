import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, Sparkles, Zap, Crown, ShieldCheck, Flame, Users, AlertTriangle } from 'lucide-react';
import { Plan } from '../types';

export const PremiumPlans: React.FC = () => {
  const {
    t,
    language,
    plansList,
    setSelectedPlanForPayment,
    setIsPaymentOpen,
    currentUser,
    setIsLoginOpen,
    isPaidPlansEnabled,
    siteConfig
  } = useApp();

  // Hidden by default. Only visible when Admin enables it.
  if (!isPaidPlansEnabled) return null;

  const handleSelectPlan = (plan: Plan) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedPlanForPayment(plan);
    setIsPaymentOpen(true);
  };

  return (
    <section id="membership-section" className="py-20 bg-gradient-to-b from-[#180408] via-[#0E0205] to-[#140407] text-white border-t border-amber-500/30 relative overflow-hidden">
      {/* Background Radiant Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-rose-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 text-amber-300 text-xs font-black border border-amber-400/40 uppercase tracking-wider shadow-sm">
            <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>प्रीमियम सदस्यत्व योजना (Premium Plans)</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {t('plans_title')}
          </h2>
          <p className="text-amber-100/80 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            {t('plans_subtitle')}
          </p>
        </div>

        {/* PAID PRICING CARDS GRID */}
        {(() => {
          const showOnlyWelcome = siteConfig?.showOnlyWelcomePlan !== false;
          const customerPlans = showOnlyWelcome
            ? plansList.filter((p) => p.id === 'welcome_offer' && p.isActive !== false)
            : plansList.filter((p) => p.isActive !== false);

          return (
            <div className={`grid grid-cols-1 ${customerPlans.length === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-3'} gap-8 items-stretch`}>
              {customerPlans.map((plan) => {
                const isRecommended = plan.recommended;
                const isWelcome = plan.id === 'welcome_offer';
                const isDisabled = plan.isActive === false;
                const isLimited = !!plan.isLimitedSlotsPlan;
                const maxLimit = plan.maxMemberLimit || 100;
                const currentCount = plan.currentMemberCount || 0;
                const remaining = Math.max(0, maxLimit - currentCount);
                const isSoldOut = isLimited && currentCount >= maxLimit;

                return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl ${
                  isDisabled || isSoldOut
                    ? 'opacity-70 bg-slate-900/90 border border-slate-800 grayscale-30'
                    : isWelcome
                    ? 'border-2 border-amber-400/90 shadow-[0_0_40px_rgba(245,158,11,0.22)] ring-1 ring-amber-300/60 bg-gradient-to-b from-[#2B060D] via-[#1A0307] to-[#120205]'
                    : isRecommended
                    ? 'border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/50 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900'
                    : 'bg-slate-900/90 border border-slate-800 hover:border-amber-400/40'
                }`}
              >
                {isWelcome ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-[#4A000B] font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-amber-200 ring-2 ring-amber-500/30">
                    <Flame className="w-4 h-4 fill-[#4A000B] text-[#4A000B]" />
                    <span>🔥 वेलकम स्पेशल ऑफर 🔥</span>
                  </div>
                ) : isRecommended ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-amber-300">
                    <Zap className="w-4 h-4 fill-white" />
                    <span>सर्वोत्तम लोकप्रिय प्लॅन</span>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between mb-4 pt-1">
                    <h3 className="text-xl sm:text-2xl font-black text-amber-100 tracking-tight">
                      {language === 'mr' ? plan.nameMr : plan.name}
                    </h3>
                    <div className="p-2.5 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-inner">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b border-amber-500/20">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 tracking-tight drop-shadow-sm">
                        ₹{plan.price}
                      </span>
                      <span className="text-sm font-black text-amber-400">INR</span>
                      <span className="text-xs text-amber-200/80 font-bold ml-1">
                        / {plan.durationLabelMr || `${plan.durationMonths} महिने`}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/70 mt-1.5 font-medium">
                      (Inclusive of applicable taxes • सर्व कर समाविष्ट)
                    </p>
                    <p className="text-xs text-amber-300 font-bold mt-1">
                      {language === 'mr' ? 'कालावधी:' : 'Validity:'} {plan.durationLabelMr || `${plan.durationMonths} महिने पूर्ण वैधता`}
                    </p>

                    {/* RELAUNCH ANNOUNCEMENT BANNER */}
                    {plan.relaunchBannerText && (
                      <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-400/60 text-amber-200 font-black text-xs text-center shadow-inner animate-pulse">
                        📢 {plan.relaunchBannerText}
                      </div>
                    )}

                    {/* LIMITED SLOT BADGE AND PROGRESS BAR */}
                    {isLimited && (
                      <div className="mt-3.5 p-3 rounded-2xl bg-black/40 border border-amber-400/30 text-xs space-y-2 backdrop-blur-xs">
                        {plan.showRemainingSeatsToPublic !== false ? (
                          <>
                            <div className="flex justify-between font-black text-xs">
                              <span className="text-slate-200">लिमिटेड मेम्बर्स Quota:</span>
                              <span className="text-amber-300">{currentCount} / {maxLimit} मेम्बर्स</span>
                            </div>
                            <div className="w-full bg-slate-800/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isSoldOut ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400'}`}
                                style={{ width: `${Math.min(100, Math.round((currentCount / maxLimit) * 100))}%` }}
                              />
                            </div>
                            <p className={`text-[11px] font-black ${isSoldOut ? 'text-rose-400' : 'text-emerald-300'}`}>
                              {isSoldOut ? '⚠️ ऑफर मर्यादा पूर्ण भरली आहे' : `🔥 केवळ ${remaining} जागा शिल्लक! त्वरा करा.`}
                            </p>
                          </>
                        ) : (
                          <div className="py-1 px-2 text-center text-amber-200 font-black text-xs">
                            🔥 मर्यादित जागा सवलत ऑफर - घाई करा!
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-200 mb-8">
                    {(language === 'mr' ? plan.featuresMr : plan.features).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-400/50 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </div>
                        <span className="leading-snug font-medium text-amber-50">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isDisabled || isSoldOut}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    isDisabled || isSoldOut
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : isWelcome || isRecommended
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-300/70'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black'
                  }`}
                >
                  {isDisabled || isSoldOut ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{isSoldOut ? 'सीट फुल (Sold Out)' : 'सध्या अनुपलब्ध'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                      <span>
                        {language === 'mr' ? 'हा प्लॅन निवडा (सुरू करा)' : 'Choose Plan & Activate'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
              })}
            </div>
          );
        })()}

        {/* Trust Guarantee Banner removed per user request */}
      </div>
    </section>
  );
};


