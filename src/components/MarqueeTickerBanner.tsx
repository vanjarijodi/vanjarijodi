import React from 'react';
import { useApp } from '../context/AppContext';
import { Megaphone } from 'lucide-react';

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
  if (speedSetting === 'fast') durationSecs = 14;
  if (speedSetting === 'slow') durationSecs = 34;
  if (typeof speedSetting === 'number') durationSecs = speedSetting;

  return (
    <div
      aria-label="महत्त्वाची घोषणा पट्टी"
      className="relative z-30 w-full bg-gradient-to-r from-[#4A0511] via-[#7D0D20] to-[#4A0511] text-amber-100 border-b border-amber-400/70 shadow-xs overflow-hidden select-none py-1.5 px-2"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {/* Compact Icon-Only Indicator so 95%+ width is available for the announcement text */}
        <div
          className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 shadow-xs shrink-0 z-10 border border-amber-200"
          title={isEn ? 'Announcement' : 'महत्त्वाची घोषणा'}
        >
          <Megaphone className="w-3.5 h-3.5 text-[#800C1E] animate-pulse" />
        </div>

        {/* Full-Width Scrolling Ticker Track */}
        <div className="flex-1 min-w-0 overflow-hidden relative whitespace-nowrap">
          <div
            className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-pointer"
            style={{
              animationDuration: `${durationSecs}s`,
            }}
          >
            <span className="font-extrabold text-xs sm:text-sm text-amber-100 tracking-wide pr-8">
              {tickerText}
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-amber-200 tracking-wide pr-8">
              • {tickerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
