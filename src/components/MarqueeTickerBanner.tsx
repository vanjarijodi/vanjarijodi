import React from 'react';
import { useApp } from '../context/AppContext';
import { Megaphone, Sparkles, Award } from 'lucide-react';

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

  return (
    <div
      aria-label="महत्त्वाची सूचना व जाहिरात पट्टी"
      className="relative z-30 w-full bg-gradient-to-r from-[#5E0715] via-[#850F22] to-[#5E0715] text-amber-100 border-b-2 border-amber-400 shadow-md overflow-hidden select-none py-1.5 px-2"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {/* Fixed Badge Indicator */}
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-xs shrink-0 z-10 animate-pulse border border-amber-200">
          <Megaphone className="w-3.5 h-3.5 text-slate-950" />
          <span>{isEn ? 'NOTICE' : 'सूचना / अपडेट'}</span>
        </div>

        {/* Scrolling Ticker Track */}
        <div className="flex-1 overflow-hidden relative whitespace-nowrap mask-gradient">
          <div
            className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-pointer"
            style={{
              animationDuration: `${durationSecs}s`,
            }}
          >
            <span className="font-extrabold text-xs sm:text-sm text-amber-100 tracking-wide px-4">
              {tickerText}
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-amber-200 tracking-wide px-4">
              • {tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
