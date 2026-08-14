import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Megaphone, ArrowRight, X } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  const { siteConfig, setIsRegisterOpen, language, currentUser } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!siteConfig?.isNoticeBannerEnabled || !siteConfig?.noticeBannerText || dismissed || currentUser) {
    return null;
  }

  const noticeText = language === 'en'
    ? (siteConfig.noticeBannerTextEn || siteConfig.noticeBannerText)
    : siteConfig.noticeBannerText;

  const bgStyles: Record<string, string> = {
    crimson: 'bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-amber-100 border-amber-300/40',
    saffron: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 border-amber-300',
    emerald: 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-emerald-50 border-emerald-400',
    maroon: 'bg-gradient-to-r from-amber-950 via-rose-950 to-amber-950 text-amber-100 border-amber-400/40'
  };

  const activeBg = bgStyles[siteConfig.noticeBannerBg || 'crimson'] || bgStyles['crimson'];

  return (
    <div className={`w-full py-2 px-3 sm:px-6 border-b text-xs sm:text-sm font-bold shadow-sm relative z-30 flex items-center justify-between gap-2 ${activeBg}`}>
      <div className="flex items-center gap-2 overflow-hidden flex-1 max-w-7xl mx-auto">
        <span className="p-1 bg-black/15 rounded-lg shrink-0 flex items-center justify-center">
          <Megaphone className="w-4 h-4 animate-bounce text-amber-300" />
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee pl-4 hover:pause">
            <span className="font-extrabold tracking-wide">
              {noticeText}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="hidden xs:flex px-2.5 py-1 bg-white/20 hover:bg-white/30 text-current rounded-lg text-xs font-black transition cursor-pointer items-center gap-1 border border-current/20 shrink-0 shadow-sm"
        >
          <span>{language === 'en' ? 'Register' : 'नोंदणी करा'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-black/20 rounded-lg transition cursor-pointer text-current opacity-80 hover:opacity-100"
          title={language === 'en' ? 'Close' : 'बंद करा'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

