import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, UserCheck, UserPlus, LogIn, Heart, Handshake, Building2, ChevronRight, Store, Scroll, Search, Send, X, Loader2 } from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { transliterateMarathiToEnglish } from '../utils/transliterate';

export const Hero: React.FC = () => {
  const {
    heroSlides,
    siteConfig,
    language,
    setIsRegisterOpen,
    setIsLoginOpen,
    setLoginModalMode,
    setIsBusinessVendorDirectoryOpen,
    setIsBusinessVendorRegisterModalOpen,
    setIsBioDataMakerOpen,
    setSearchFilters,
    setCurrentView,
    currentUser,
    loginWithGoogle,
  } = useApp();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [quickGender, setQuickGender] = useState<'all' | 'bride' | 'groom'>('all');
  const [quickDistrict, setQuickDistrict] = useState<string>('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isTelegramDismissed, setIsTelegramDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('vanjari_hide_telegram') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const handleOpenRegister = () => {
    setIsRegisterOpen(true);
  };

  const handleOpenLogin = () => {
    setLoginModalMode('member_otp');
    setIsLoginOpen(true);
  };

  const handleOpenGuest = () => {
    setLoginModalMode('guest');
    setIsLoginOpen(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const res = await loginWithGoogle();
      if (res.success && res.user) {
        if (res.isNewUser) {
          setIsLoginOpen(true);
        } else {
          setCurrentView('profiles');
        }
      } else if (res.message && res.message !== 'Google login cancelled') {
        alert(res.message);
      }
    } catch (err: any) {
      console.error('Hero Google sign in error:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickSearch = () => {
    setSearchFilters((prev: any) => ({
      ...prev,
      gender: quickGender,
      district: quickDistrict,
    }));
    
    if (currentUser) {
      setCurrentView('profiles');
      // smooth scroll to profiles list
      setTimeout(() => {
        const gridElement = document.getElementById('profiles-grid-section');
        if (gridElement) {
          gridElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Not logged in: auto-trigger Guest log in or registration to view profiles immediately
      setLoginModalMode('guest');
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="relative py-2 sm:py-3.5 overflow-hidden bg-gradient-to-b from-[#FFFDFB] via-[#FFF9F2] to-[#FFFDFB] text-slate-800 border-b border-amber-200/80">
      
      {/* BACKGROUND DECORATIVE GLOW ACCENTS */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-rose-300/30 blur-3xl" />
      </div>

      {/* HERO CONTENT CONTAINER */}
      <div className="relative z-10 max-w-2xl mx-auto px-3.5 text-center flex flex-col items-center justify-center space-y-2 sm:space-y-3">
        
        {/* CELESTIAL HEADER SECTION (NO BOX, PROMINENT EMBLEM, UNCLIPPED TYPOGRAPHY) */}
        <div className="relative w-full flex flex-col items-center justify-center text-center py-2 z-10">
          
          {/* Saffron / Golden Spiritual Sunburst Background Aura behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-amber-500/18 blur-3xl z-0 pointer-events-none animate-pulse duration-[4000ms]" />
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2">
            
            {/* Top Blessing Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#800C1E]/8 border border-[#800C1E]/15 text-[#800C1E] text-[9px] sm:text-[10px] font-black tracking-widest shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0 animate-pulse" />
              <span>॥ संत भगवान बाबा प्रसन्न ॥</span>
            </div>

            {/* Logo + Vanjari Jodi Title (Prominent, Central, Stacked for High Premium Look) */}
            <div className="flex flex-col items-center justify-center gap-1 w-full mt-1.5">
              
              {/* Logo: Increased by 30% from 54px to 74px, centered, with prominent shadow */}
              <div className="transform hover:scale-105 transition-transform duration-350 filter drop-shadow-xl shrink-0">
                <VanjariJodiLogo variant="emblem" size={74} />
              </div>

              {/* Title & Subtitle with complete vertical clearance to prevent any vowel/velanti clipping */}
              <div className="flex flex-col items-center text-center justify-center w-full overflow-visible py-1">
                
                {/* Traditional Auspicious Ornament Header Wrapper */}
                <div className="flex items-center justify-center gap-2.5 w-full py-0.5 overflow-visible">
                  <span className="hidden sm:inline-block w-8 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></span>
                  
                  {/* Title: Styled with font-normal to let the script's native lines flow beautifully, avoiding double-bolding clipping */}
                  <h1 
                    className="text-2.5xl sm:text-[36px] md:text-[40px] font-normal tracking-wide py-2 px-1 leading-normal overflow-visible text-slate-950 select-none"
                    style={{
                      fontFamily: "'Yatra One', serif",
                      color: '#800C1E', // Royal maroon
                      textShadow: '0.75px 0.75px 0px #F59E0B, 1.5px 1.5px 0px #F59E0B, 3px 3px 6px rgba(128,12,30,0.22)'
                    }}
                  >
                    {language === 'en' ? 'VanjariJodi Matrimony' : (siteConfig?.logoTitle || 'वंजारी जोडी')}
                  </h1>
                  
                  <span className="hidden sm:inline-block w-8 sm:w-16 h-[1.5px] bg-gradient-to-l from-transparent via-amber-400 to-transparent"></span>
                </div>
                
                {/* Tagline directly below */}
                <p className="text-[10px] sm:text-xs font-extrabold text-[#A71930] tracking-wider mt-0.5 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {language === 'en' ? 'Trusted Vanjari Community Matrimonial Portal' : (siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात')}
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                </p>
              </div>
            </div>

            {/* Official Vanjari Jodi Slogan Pill */}
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-rose-50/90 border border-rose-200/70 shadow-2xs backdrop-blur-xs text-[#800C1E] text-[8.5px] sm:text-[10px] font-bold tracking-wide text-center mt-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0 animate-pulse" />
              <span>
                {language === 'en' 
                  ? 'Connecting Hearts across Vanjari Families worldwide.' 
                  : 'हृदयाला हृदयाची मिळावी साथ, वंजारी जोडीचा हातात हात.'}
              </span>
            </div>
            {/* Telegram Group Join Banner on Index Hero */}
            {siteConfig?.showTelegramBanner !== false &&
              siteConfig?.telegramGroupUrl &&
              siteConfig.telegramGroupUrl.trim() !== '' &&
              !isTelegramDismissed && (
                <div className="relative w-full max-w-lg my-1">
                  <a
                    href={siteConfig.telegramGroupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 pl-3.5 pr-10 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 text-white hover:from-sky-500 hover:to-sky-600 rounded-2xl font-black text-xs sm:text-sm shadow-md border border-sky-300 flex items-center justify-between gap-2 active:scale-98 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden text-left">
                      <div className="p-1.5 bg-white/20 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                        <Send className="w-4 h-4 text-white animate-bounce" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-extrabold flex items-center gap-1">
                          📢 अधिकृत टेलिग्राम ग्रुप जॉईन करा
                        </span>
                        <span className="text-[10px] text-sky-100 font-medium">नवीन वधू-वर प्रोफाईल्सच्या जलद अपडेट्ससाठी</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-white text-sky-800 rounded-xl text-[10px] sm:text-xs font-black shrink-0 shadow-xs group-hover:bg-amber-300 transition-colors">
                      जॉईन करा 🚀
                    </span>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTelegramDismissed(true);
                      try {
                        sessionStorage.setItem('vanjari_hide_telegram', 'true');
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer z-10"
                    title="हे बॅनर लपवा (Hide Banner)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* MODERN GLASSMORPHISM QUICK SEARCH SYSTEM (नवीन जलद शोध प्रणाली) */}
        {currentUser && siteConfig?.enableSearchFilters !== false && (
          <div className="w-full bg-[#FFFDFB]/85 backdrop-blur-md border border-amber-300/60 shadow-lg rounded-[20px] p-3 sm:p-4 text-left relative z-10 transition-all duration-300">
            <div className="flex items-center gap-2 text-[#800C1E] font-black text-xs border-b border-amber-200/50 pb-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{language === 'en' ? 'Quick Bride/Groom Search' : 'झटपट वधू-वर शोध प्रणाली (Quick Search)'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              {/* 1. Looking for (Gender) */}
              <div className="sm:col-span-5 flex flex-col gap-1">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  {language === 'en' ? '1. Looking For' : '१. मला शोधायचे आहे'}
                </label>
                <div className="grid grid-cols-3 gap-0.5 bg-amber-50/60 border border-amber-200 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuickGender('all')}
                    className={`py-1 rounded-md text-[9px] sm:text-[10px] font-black transition-all ${
                      quickGender === 'all'
                        ? 'bg-[#800C1E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#800C1E]'
                    }`}
                  >
                    {language === 'en' ? 'Both' : 'दोन्ही'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickGender('bride')}
                    className={`py-1 rounded-md text-[9px] sm:text-[10px] font-black transition-all ${
                      quickGender === 'bride'
                        ? 'bg-[#800C1E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#800C1E]'
                    }`}
                  >
                    👰 {language === 'en' ? 'Bride' : 'वधू'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickGender('groom')}
                    className={`py-1 rounded-md text-[9px] sm:text-[10px] font-black transition-all ${
                      quickGender === 'groom'
                        ? 'bg-[#800C1E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#800C1E]'
                    }`}
                  >
                    🤵 {language === 'en' ? 'Groom' : 'वर'}
                  </button>
                </div>
              </div>

              {/* 2. District Selection */}
              <div className="sm:col-span-4 flex flex-col gap-1">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  {language === 'en' ? '2. Select District' : '२. जिल्हा निवडा'}
                </label>
                <select
                  value={quickDistrict}
                  onChange={(e) => setQuickDistrict(e.target.value)}
                  className="w-full bg-amber-50/60 border border-amber-200 rounded-lg px-2 py-1 text-[11px] sm:text-xs font-bold text-slate-800 outline-none focus:border-[#800C1E] transition-colors"
                >
                  <option value="">{language === 'en' ? '-- All Districts --' : '-- सर्व महाराष्ट्र --'}</option>
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {language === 'en' ? transliterateMarathiToEnglish(d) : d}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Action Search Button */}
              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleQuickSearch}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-[11px] sm:text-xs shadow-xs hover:shadow flex items-center justify-center gap-1 transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'en' ? 'Search Now' : 'शोध सुरू करा'}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats bar inside search system */}
            <div className="flex items-center justify-center gap-2 flex-wrap mt-2 pt-1.5 border-t border-amber-200/40 text-[8px] sm:text-[9px] font-bold text-slate-500">
              <span className="flex items-center gap-0.5">
                {language === 'en' ? '🛡️ Verified Profiles' : '🛡️ सत्यापित वधू-वर'}
              </span>
              <span className="text-amber-300">•</span>
              <span className="flex items-center gap-0.5">
                {language === 'en' ? '🔒 100% Private & Safe' : '🔒 १००% खाजगी आणि सुरक्षित'}
              </span>
              <span className="text-amber-300">•</span>
              <span className="flex items-center gap-0.5">
                {language === 'en' ? '🤝 Easy Matchmaking' : '🤝 सोपी विवाह जुळवणी'}
              </span>
            </div>
          </div>
        )}

        {/* MODERN TILES & 1-CLICK AUTH - SHOWN ONLY IF USER IS NOT LOGGED IN */}
        {!currentUser && (
          <div className="flex flex-col items-center justify-center gap-1.5 w-full max-w-md sm:max-w-lg mx-auto relative z-20">
            
            {/* Card 0: 1-Click Google Login / Fast Access */}
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-amber-50/70 border-2 border-amber-400 shadow-sm flex items-center justify-between gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98 group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 text-left">
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-slate-900 group-hover:text-[#A71930] leading-tight flex items-center gap-1">
                    <span>{language === 'en' ? 'Google 1-Click Login' : 'Google द्वारे १-क्लिक लॉगिन'}</span>
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold leading-none truncate">
                    {language === 'en' ? 'Sign in directly & complete profile later' : '१ सेकंदात थेट सुरू • नोंदणी नंतर केली तरी चालेल'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-2 py-1 rounded-full text-[8.5px] font-black shadow-xs shrink-0 transition-colors">
                <span>{language === 'en' ? 'GOOGLE LOGIN' : 'गुगल लॉगिन'}</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </div>
            </button>

            {/* Card 1: New Free Registration (Amber/Gold Soft Gradient Glass) */}
            <button
              type="button"
              onClick={handleOpenRegister}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/8 to-amber-600/4 hover:from-amber-500/12 hover:to-amber-600/6 backdrop-blur-md border border-amber-200/60 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98 group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 text-left">
                <div className="p-1 rounded-lg bg-amber-500/15 text-amber-800 group-hover:scale-105 transition-transform shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight">
                    {language === 'en' ? '1. Free New Registration' : '१. नवीन मोफत नोंदणी करा'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold leading-none truncate">
                    {language === 'en' ? 'Create new Bride/Groom profile' : 'नवीन वधू-वर प्रोफाईल जोडण्यासाठी'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-[#A71930] hover:bg-[#800C1E] text-white px-2 py-1 rounded-full text-[8.5px] font-black shadow-xs shrink-0 transition-colors">
                <span>{language === 'en' ? 'FREE' : 'मोफत (FREE)'}</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </div>
            </button>

            {/* Card 2: Existing Member Login (Rose/Red Soft Gradient Glass) */}
            <button
              type="button"
              onClick={handleOpenLogin}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-rose-500/8 to-rose-600/4 hover:from-rose-500/12 hover:to-rose-600/6 backdrop-blur-md border border-rose-200/60 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98 group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 text-left">
                <div className="p-1 rounded-lg bg-rose-500/15 text-[#A71930] group-hover:scale-105 transition-transform shrink-0">
                  <LogIn className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight">
                    {language === 'en' ? '2. Existing Member Login' : '२. विद्यमान सदस्य लॉगिन'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold leading-none truncate">
                    {language === 'en' ? 'Login with Mobile OTP or Password' : 'OTP द्वारे तुमचे खाते उघडा'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-[#A71930] hover:bg-[#800C1E] text-white px-2 py-1 rounded-full text-[8.5px] font-black shadow-xs shrink-0 transition-colors">
                <span>{language === 'en' ? 'LOGIN' : 'लॉगिन (LOGIN)'}</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </div>
            </button>

            {/* Card 3: Guest Entry (Indigo Soft Gradient Glass) */}
            <button
              type="button"
              onClick={handleOpenGuest}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-indigo-500/8 to-indigo-600/4 hover:from-indigo-500/12 hover:to-indigo-600/6 backdrop-blur-md border border-indigo-200/60 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98 group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 text-left">
                <div className="p-1 rounded-lg bg-indigo-500/15 text-indigo-700 group-hover:scale-105 transition-transform shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight">
                    {language === 'en' ? '3. Guest Visitor Entry' : '३. पाहुणे / गेस्ट प्रवेश'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold leading-none truncate">
                    {language === 'en' ? 'Quick view of all profiles' : 'थेट सर्व प्रोफाईल्स पाहण्यासाठी'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-slate-900 hover:bg-slate-850 text-amber-300 px-2 py-1 rounded-full text-[8.5px] font-black shadow-xs shrink-0 transition-colors">
                <span>{language === 'en' ? 'GUEST' : 'प्रवेश (GUEST)'}</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </div>
            </button>

            {/* Card 4: Wedding Vendor & Hall Directory (Emerald Soft Gradient Glass) */}
            {siteConfig?.enableBusinessVendors !== false && (
              <div className="w-full flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setIsBusinessVendorDirectoryOpen(true)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500/8 to-emerald-600/4 hover:from-emerald-500/12 hover:to-emerald-600/6 backdrop-blur-md border border-emerald-200/60 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98 group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0 text-left">
                    <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-800 group-hover:scale-105 transition-transform shrink-0">
                      <Handshake className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight">
                        {language === 'en' ? '4. Wedding Vendors & Halls' : '४. लग्न व्यवसाय व हॉल नेटवर्किंग'}
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold leading-none truncate">
                        {language === 'en' ? 'Halls, Catering & Photography' : 'मंगल कार्यालय, कॅटरिंग व इतर सेवा'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-0.5 bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-1 rounded-full text-[8.5px] font-black shadow-xs shrink-0 transition-colors">
                    <span>{language === 'en' ? 'VENDORS' : 'सेवा (VENDORS)'}</span>
                    <ChevronRight className="w-3 h-3 shrink-0" />
                  </div>
                </button>

                <div className="flex items-center justify-between gap-2 w-full px-2 text-[8px] sm:text-[9px] font-bold text-slate-600">
                  <span className="truncate">
                    {language === 'en' ? 'Wedding halls, catering, photo services' : 'मंगल कार्यालय, कॅटरिंग, फोटोग्राफी व लग्न सेवा'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsBusinessVendorRegisterModalOpen(true)}
                    className="text-[#A71930] hover:text-amber-700 font-black underline shrink-0 cursor-pointer"
                  >
                    {language === 'en' ? '+ Register Vendor' : '+ नवीन नोंदणी'}
                  </button>
                </div>
              </div>
            )}

            {/* Card 5: Online Marathi BioData Maker Card (Amber/Orange Glass) */}
            <button
              type="button"
              onClick={() => setIsBioDataMakerOpen(true)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/6 hover:from-amber-500/16 hover:to-orange-500/10 backdrop-blur-md border border-amber-300/80 shadow-xs flex items-center justify-between gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-98 group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0 text-left">
                <div className="p-1 rounded-lg bg-amber-500/15 text-amber-900 group-hover:scale-105 transition-transform shrink-0">
                  <Scroll className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight">
                    {language === 'en' ? '5. Online BioData Maker' : '५. ऑनलाईन बायोडाटा मेकर'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold leading-none truncate">
                    {language === 'en' ? 'Create free PDF biodata' : 'मोफत आकर्षक PDF बायोडाटा बनवा'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-amber-600 hover:bg-amber-700 text-slate-950 px-2 py-1 rounded-full text-[8.5px] font-black shadow-xs shrink-0 transition-colors">
                <span>{language === 'en' ? 'CREATE' : 'बनवा (CREATE)'}</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </div>
            </button>

          </div>
        )}

      </div>

    </div>
  );
};
