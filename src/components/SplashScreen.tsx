import React, { useState, useEffect } from 'react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { Sparkles, Heart } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Quick, smooth progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 80);

    // Fade out trigger
    const fadeTimeout = setTimeout(() => {
      setFade(true);
    }, 950);

    // Completion callback
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-between p-6 bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F2] to-[#FFFDF9] text-slate-800 transition-all duration-500 ease-out ${
        fade ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. TOP DIVINE BLESSING BAR */}
      <div className="w-full flex flex-col items-center pt-8 sm:pt-12 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-amber-100 text-[#A71930] border border-amber-300 font-black text-xs sm:text-sm shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>॥ श्री संत भगवान बाबा प्रसन्न ॥</span>
        </div>
        <p className="text-[10px] sm:text-xs font-black text-amber-700 tracking-widest uppercase">
          ॥ श्री क्षेत्र भगवानगड प्रसन्न ॥
        </p>
      </div>

      {/* 2. CENTER PIECE: BRAND LOGO */}
      <div className="flex flex-col items-center justify-center flex-1 py-12">
        <div className="relative p-6 sm:p-8 bg-white border-2 border-amber-300/60 rounded-[40px] shadow-2xl flex flex-col items-center justify-center transform scale-95 sm:scale-100 animate-fade-in">
          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 bg-amber-400/5 rounded-[40px] blur-xl animate-pulse" />
          
          <VanjariJodiLogo variant="stacked" size={140} className="relative z-10" />

          {/* Slogan */}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#A71930] font-black border-t border-amber-100 pt-3 w-full justify-center">
            <Heart className="w-4 h-4 fill-[#A71930]" />
            <span>पवित्र सोयरणीचे हक्काचे दालन</span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM LOADER & FOOTER INFO */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center pb-8 space-y-5">
        
        {/* Loading Progress Slider */}
        <div className="w-full space-y-1.5">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-black text-slate-500 px-1">
            <span>प्रवेश प्रक्रिया सुरू आहे...</span>
            <span className="text-[#A71930]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
            <div
              className="h-full bg-gradient-to-r from-[#A71930] to-[#E11D48] rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Security & Reliability Badges */}
        <div className="flex items-center gap-4 text-[9px] sm:text-[10px] font-bold text-slate-500">
          <span className="flex items-center gap-1">
            🛡️ १००% सुरक्षित व पडताळणीकृत
          </span>
          <span className="h-3 w-px bg-slate-300" />
          <span className="flex items-center gap-1">
            🤝 मोफत बायोडाटा नोंदणी
          </span>
        </div>

        {/* Brand Copyright */}
        <div className="text-center space-y-0.5">
          <p className="text-[10px] text-slate-400 font-extrabold">
            © {new Date().getFullYear()} VanjariJodi. All Rights Reserved.
          </p>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
            Designed for Vanjari Community Android App & Web
          </p>
        </div>

      </div>
    </div>
  );
};
