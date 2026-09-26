import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Sparkles, Megaphone, Clock, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FlashAdPopup: React.FC = () => {
  const { siteConfig, language } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const isEnabled = siteConfig?.isFlashAdEnabled ?? false;
  const imageUrl = siteConfig?.flashAdImageUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200';
  const title = language === 'en'
    ? (siteConfig?.flashAdTitleEn || siteConfig?.flashAdTitle || '🎯 State Level Grand Vanjari Matrimonial Meet 2026')
    : (siteConfig?.flashAdTitle || '🎯 राज्यस्तरीय भव्य वंजारी वधू-वर परिचय मेळावा २०२६');
  const subtitle = language === 'en'
    ? (siteConfig?.flashAdSubtitleEn || siteConfig?.flashAdSubtitle || 'Free bio-data book distribution & direct family meetings at Parli, Beed, Pune & Nashik!')
    : (siteConfig?.flashAdSubtitle || 'परळी वैजनाथ, बीड, पुणे व नाशिक येथे मोफत बायोडाटा पुस्तक वाटप व प्रत्यक्ष गाठीभेटी!');
  const linkUrl = siteConfig?.flashAdLinkUrl || `https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}?text=मेळावा_जाहिरात_चौकशी`;
  const buttonText = language === 'en'
    ? (siteConfig?.flashAdButtonTextEn || siteConfig?.flashAdButtonText || 'More Info / Register')
    : (siteConfig?.flashAdButtonText || 'अधिक माहिती व नोंदणी');
  const badgeText = siteConfig?.flashAdBadgeText || (language === 'en' ? 'Special Sponsored Feature' : 'विशेष प्रायोजित जाहिरात');
  const theme = siteConfig?.flashAdTheme || 'gold';
  const displayMode = siteConfig?.flashAdDisplayMode || 'popup_modal';
  const autoCloseSecs = siteConfig?.flashAdAutoCloseSeconds ?? 8;
  const delaySecs = siteConfig?.flashAdDelaySeconds ?? 1;

  // Theme styling map
  const themeMap = {
    gold: {
      border: 'border-amber-400/90',
      header: 'from-amber-500 via-amber-400 to-amber-600 text-slate-950',
      title: 'text-amber-300',
      button: 'from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 border-amber-200',
      badge: 'bg-red-600 text-amber-200 border-amber-400/50',
      container: 'from-slate-900 via-slate-900 to-amber-950/90'
    },
    crimson: {
      border: 'border-rose-400/90',
      header: 'from-[#800C1E] via-rose-600 to-[#800C1E] text-white',
      title: 'text-rose-300',
      button: 'from-rose-600 via-red-500 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 border-rose-300',
      badge: 'bg-amber-400 text-slate-950 border-amber-300',
      container: 'from-slate-950 via-slate-900 to-[#800C1E]/90'
    },
    emerald: {
      border: 'border-emerald-400/90',
      header: 'from-emerald-700 via-emerald-600 to-teal-700 text-white',
      title: 'text-emerald-300',
      button: 'from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 border-emerald-200',
      badge: 'bg-emerald-600 text-white border-emerald-300/40',
      container: 'from-slate-950 via-slate-900 to-emerald-950/90'
    },
    sapphire: {
      border: 'border-blue-400/90',
      header: 'from-indigo-700 via-blue-600 to-indigo-800 text-white',
      title: 'text-sky-300',
      button: 'from-blue-500 via-indigo-400 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 border-blue-300',
      badge: 'bg-amber-400 text-slate-950 border-amber-300',
      container: 'from-slate-950 via-slate-900 to-indigo-950/90'
    },
    custom: {
      border: 'border-slate-500',
      header: 'from-slate-700 via-slate-600 to-slate-800 text-white',
      title: 'text-white',
      button: 'from-slate-200 via-white to-slate-300 text-slate-950 hover:bg-white border-white',
      badge: 'bg-slate-700 text-slate-200 border-slate-500',
      container: 'from-slate-950 via-slate-900 to-slate-900'
    }
  };

  const currentTheme = themeMap[theme] || themeMap.gold;

  useEffect(() => {
    if (!isEnabled) {
      setIsVisible(false);
      return;
    }

    const isAlreadyDismissed = sessionStorage.getItem('flash_ad_dismissed') === 'true';
    if (isAlreadyDismissed) {
      setIsVisible(false);
      return;
    }

    // Delay before showing ad
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      if (autoCloseSecs > 0) {
        setRemainingSeconds(autoCloseSecs);
      } else {
        setRemainingSeconds(null);
      }
    }, Math.max(delaySecs, 0.2) * 1000);

    return () => clearTimeout(showTimer);
  }, [isEnabled, imageUrl, title, autoCloseSecs, delaySecs]);

  // Countdown timer for auto-close
  useEffect(() => {
    if (!isVisible || remainingSeconds === null) return;

    if (remainingSeconds <= 0) {
      setIsVisible(false);
      return;
    }

    const countdown = setInterval(() => {
      setRemainingSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [isVisible, remainingSeconds]);

  if (!isEnabled || !isVisible) return null;

  const handleClose = () => {
    sessionStorage.setItem('flash_ad_dismissed', 'true');
    setIsVisible(false);
  };

  const handleActionClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {/* MODE 1: POPUP MODAL (सेंट्रल आकर्षक पॉपअप जाहिरात) */}
      {displayMode === 'popup_modal' && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className={`relative w-full max-w-lg bg-gradient-to-b ${currentTheme.container} text-white rounded-3xl border-2 ${currentTheme.border} shadow-2xl overflow-hidden z-10`}
          >
            {/* Countdown / Auto-close Bar Header */}
            <div className={`bg-gradient-to-r ${currentTheme.header} px-4 py-2 flex items-center justify-between font-black text-xs`}>
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 animate-bounce" />
                <span className="uppercase tracking-wider truncate">{badgeText}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {remainingSeconds !== null && remainingSeconds > 0 && (
                  <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{remainingSeconds} {language === 'en' ? 's' : 'से'}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-inherit hover:text-white transition-colors cursor-pointer"
                  title={language === 'en' ? 'Close' : 'बंद करा'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ad Image Container */}
            {imageUrl && (
              <div className="relative w-full h-52 sm:h-64 overflow-hidden bg-slate-950 group cursor-pointer" onClick={handleActionClick}>
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                
                {/* Floating Ribbon Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1 border ${currentTheme.badge}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>★ {badgeText}</span>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-3.5 text-center">
              <h3 className={`text-lg sm:text-xl font-black ${currentTheme.title} leading-snug drop-shadow`}>
                {title}
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {subtitle}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                {linkUrl && (
                  <button
                    type="button"
                    onClick={handleActionClick}
                    className={`w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-gradient-to-r ${currentTheme.button} font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 border cursor-pointer transform active:scale-95 transition-all`}
                  >
                    <span>{buttonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Close' : 'बंद करा'} {remainingSeconds !== null && `(${remainingSeconds}s)`}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar at Bottom */}
            {remainingSeconds !== null && autoCloseSecs > 0 && (
              <div className="w-full h-1 bg-slate-800">
                <div
                  className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${(remainingSeconds / autoCloseSecs) * 100}%` }}
                />
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* MODE 2: TOP SLIDE-IN BANNER (वरून स्लाईड जाहिरात) */}
      {displayMode === 'top_slide' && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className={`fixed top-0 left-0 right-0 z-[99999] bg-gradient-to-r ${currentTheme.container} text-white border-b-2 ${currentTheme.border} shadow-2xl p-3 sm:p-4`}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={title}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border-2 ${currentTheme.border} shrink-0 shadow`}
                />
              )}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 ${currentTheme.badge} text-[10px] font-black rounded-full uppercase`}>
                    {badgeText}
                  </span>
                  <h4 className={`text-xs sm:text-sm font-black ${currentTheme.title} line-clamp-1`}>
                    {title}
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-200 font-medium line-clamp-1 mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {linkUrl && (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r ${currentTheme.button} font-black text-xs shadow-lg flex items-center gap-1.5 shrink-0 cursor-pointer`}
                >
                  <span>{buttonText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODE 3: BOTTOM FLOAT BANNER */}
      {displayMode === 'bottom_float' && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[99999] w-72 sm:w-80 bg-slate-900/95 text-white rounded-2xl border-2 ${currentTheme.border} shadow-2xl overflow-hidden backdrop-blur-md`}
        >
          <div className="relative p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className={`px-2 py-0.5 ${currentTheme.badge} text-[9px] font-black rounded-full uppercase`}>
                {badgeText}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-28 rounded-xl object-cover border border-amber-400/40 cursor-pointer"
                onClick={handleActionClick}
              />
            )}

            <h5 className={`text-xs font-black ${currentTheme.title} line-clamp-2 leading-snug`}>
              {title}
            </h5>

            <div className="pt-1 flex items-center justify-between">
              {remainingSeconds !== null && remainingSeconds > 0 && (
                <span className="text-[10px] font-mono text-slate-400">
                  {remainingSeconds}s
                </span>
              )}

              {linkUrl && (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className={`w-full px-3 py-1.5 rounded-lg bg-gradient-to-r ${currentTheme.button} font-black text-xs flex items-center justify-center gap-1 cursor-pointer`}
                >
                  <span>{buttonText}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
