import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Sparkles, Megaphone } from 'lucide-react';

export const MarqueeTickerBanner: React.FC = () => {
  const { siteConfig, language } = useApp();

  // If disabled by Admin, don't render
  if (siteConfig?.enableTickerBanner === false) {
    return null;
  }

  const isEn = language === 'en';
  const defaultText = isEn
    ? '🚩 Official Vanjari Matrimony Portal • 100% Aadhaar Verified Profiles • Create Free Profile & PDF BioData Today!'
    : '🚩 ॥ श्री संत भगवान बाबा प्रसन्न ॥ वंजारी जोडी अधिकृत वधू-वर सूचक केंद्र • १००% आधार पडताळलेली व सुशिक्षित स्थळे • नवीन मोफत नोंदणी करा व आकर्षक बायोडाटा PDF डाऊनलोड करा!';

  const tickerText = isEn
    ? (siteConfig?.tickerTextEn || siteConfig?.tickerText || defaultText)
    : (siteConfig?.tickerText || defaultText);

  // Speed calculation
  const speedSetting = siteConfig?.tickerSpeed || 'medium';
  let durationSecs = 22;
  if (speedSetting === 'fast') durationSecs = 12;
  if (speedSetting === 'slow') durationSecs = 36;
  if (typeof speedSetting === 'number') durationSecs = speedSetting;

  const badgeTitle = isEn
    ? (siteConfig?.tickerBadgeTitleEn || '⚡ LIVE ANNOUNCEMENTS')
    : (siteConfig?.tickerBadgeTitle || '🚩 ताजी विशेष घोषणा');

  return (
    <div
      aria-label="महत्त्वाची घोषणा व जाहिरात पट्टी"
      className="relative z-30 w-full bg-gradient-to-r from-[#4A0511] via-[#7D0D20] to-[#4A0511] text-amber-100 border-b-2 border-amber-400/80 shadow-md overflow-hidden select-none py-1.5 px-2"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {/* Animated & Glowing Eye-Catching Permanent Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(251,191,36,0.85)] shrink-0 z-10 border border-amber-100 relative overflow-hidden group scale-100 hover:scale-105 transition-transform duration-200">
          {/* Pulsing Live Red Glowing Dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,1)]"></span>
          </span>

          <Sparkles className="w-3.5 h-3.5 text-rose-800 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
          <span className="tracking-tight font-black text-[11.5px] uppercase text-slate-950 drop-shadow-xs">
            {badgeTitle}
          </span>

          {/* Continuous Light Shimmering Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></div>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex-1 overflow-hidden relative whitespace-nowrap mask-gradient">
          <div
            className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-pointer"
            style={{
              animationDuration: `${durationSecs}s`,
            }}
          >
            <span className="font-black text-xs sm:text-sm text-amber-100 tracking-wide px-4">
              {tickerText}
            </span>
            <span className="font-black text-xs sm:text-sm text-amber-200 tracking-wide px-4">
              • {tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
