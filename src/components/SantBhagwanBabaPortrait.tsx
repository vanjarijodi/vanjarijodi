import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface PortraitProps {
  className?: string;
}

export const SantBhagwanBabaPortrait: React.FC<PortraitProps> = ({ className = '' }) => {
  // Official Vanjari Jodi logo crest
  const officialLogoImg = "/vanjari-jodi-official-logo.png";

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      
      {/* ROYAL ORNATE TEMPLE ARCH FRAME (कमानीदार सुवर्ण चौकट) */}
      <div className="relative w-full max-w-[290px] sm:max-w-[340px] rounded-t-full rounded-b-3xl p-3.5 sm:p-4 bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 border-4 border-amber-400 shadow-2xl overflow-hidden group glow-gold">
        
        {/* Decorative Golden Outer Borders */}
        <div className="absolute inset-1 rounded-t-full rounded-b-2xl border-2 border-amber-700/60 pointer-events-none z-20" />
        <div className="absolute inset-2 rounded-t-full rounded-b-xl border stroke-dashed border-amber-100/90 pointer-events-none z-20" />

        {/* Top Decorative Shrine Crest / Crown */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-[#5E0715] via-[#8C0F22] to-[#5E0715] text-amber-200 text-[10px] sm:text-xs font-black px-4 py-0.5 rounded-full border-2 border-amber-300 shadow-lg whitespace-nowrap flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
          <span>॥ वंजारी जोडी मॅट्रिमोनी ॥</span>
        </div>

        {/* Inner Shrine Canvas with Official Logo Photo */}
        <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gradient-to-b from-amber-950 via-[#3D030C] to-slate-950 shadow-inner flex items-center justify-center p-3 my-2 ring-2 ring-amber-400/80">
          
          {/* Background Aura Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.45)_0%,rgba(107,8,24,0.85)_65%,rgba(10,15,30,0.98)_100%)] pointer-events-none" />

          {/* Official Logo Emblem Image */}
          <img
            src={officialLogoImg}
            alt="वंजारी जोडी - अधिकृत लोगो"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 relative z-10 drop-shadow-2xl rounded-full"
          />

          {/* Diyas (दीपक) in Corners */}
          <div className="absolute top-3 left-3 text-amber-300 z-30 bg-black/50 p-1.5 rounded-full border border-amber-400 shadow-md">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <div className="absolute top-3 right-3 text-amber-300 z-30 bg-black/50 p-1.5 rounded-full border border-amber-400 shadow-md">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Bottom Garland / Devotional Footer */}
        <div className="mt-2 bg-gradient-to-r from-[#5E0715] via-[#8C0F22] to-[#5E0715] rounded-2xl p-3 border-2 border-amber-300 text-center shadow-xl">
          <p className="text-xs sm:text-sm font-black text-amber-200 tracking-wide drop-shadow-sm">
            ॥ वंजारी जोडी वधू-वर परिचय केंद्र ॥
          </p>
          <p className="text-[10.5px] sm:text-xs text-amber-100 font-extrabold italic mt-0.5">
            "पवित्र व संस्कारयुक्त नात्यांची सुंदर सुरुवात"
          </p>
        </div>

      </div>

    </div>
  );
};
