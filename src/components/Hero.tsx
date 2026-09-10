import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  UserCheck,
  UserPlus,
  LogIn,
  Heart,
  Handshake,
  ChevronRight,
  Scroll,
  Search,
  X,
  CheckCircle2,
  BookOpen,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Send,
  Eye,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
import { ModernProfileCard } from './ModernProfileCard';

export const Hero: React.FC = () => {
  const {
    siteConfig,
    language,
    profiles,
    setIsRegisterOpen,
    setIsLoginOpen,
    setLoginModalMode,
    setIsBusinessVendorDirectoryOpen,
    setIsBioDataMakerOpen,
    setSearchFilters,
    setCurrentView,
    currentUser,
    openSingleKundliGenerator,
  } = useApp();

  const isEn = language === 'en';
  const activeProfilesCount = profiles?.length || 0;
  const marathiProfileCount = isEn
    ? `${activeProfilesCount}`
    : String(activeProfilesCount)
        .split('')
        .map((d) => ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'][parseInt(d, 10)] || d)
        .join('');

  const [quickGender, setQuickGender] = useState<'all' | 'bride' | 'groom'>('all');
  const [quickDistrict, setQuickDistrict] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isTelegramDismissed, setIsTelegramDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('vanjari_hide_telegram') === 'true';
    } catch {
      return false;
    }
  });

  const isGuestLoginEnabled = siteConfig?.enableGuestLogin !== false;
  const isVendorsEnabled = siteConfig?.enableBusinessVendors !== false;

  const handleQuickSearch = () => {
    setSearchFilters((prev: any) => ({
      ...prev,
      gender: quickGender,
      district: quickDistrict,
    }));

    if (currentUser) {
      setCurrentView('profiles');
      setTimeout(() => {
        const gridElement = document.getElementById('profiles-section');
        if (gridElement) {
          gridElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setLoginModalMode(isGuestLoginEnabled ? 'guest' : 'member_otp');
      setIsLoginOpen(true);
    }
  };

  const handleCategoryClick = (catKey: string) => {
    setActiveCategory(catKey);
    if (catKey === 'all') {
      setSearchFilters((prev: any) => ({ ...prev, gender: 'all', minEducation: '' }));
    } else if (catKey === 'bride') {
      setSearchFilters((prev: any) => ({ ...prev, gender: 'bride', minEducation: '' }));
    } else if (catKey === 'groom') {
      setSearchFilters((prev: any) => ({ ...prev, gender: 'groom', minEducation: '' }));
    } else if (catKey === 'doctors') {
      setSearchFilters((prev: any) => ({ ...prev, gender: 'all', minEducation: 'MBBS/MD/MS/BE/BTech' }));
    } else if (catKey === 'govt') {
      setSearchFilters((prev: any) => ({ ...prev, gender: 'all', occupationType: 'Government' }));
    } else if (catKey === 'business') {
      setSearchFilters((prev: any) => ({ ...prev, gender: 'all', occupationType: 'Business' }));
    } else if (catKey === 'biodata') {
      setIsBioDataMakerOpen(true);
      return;
    }

    if (currentUser) {
      setCurrentView('profiles');
    } else {
      setLoginModalMode(isGuestLoginEnabled ? 'guest' : 'member_otp');
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="relative py-4 sm:py-6 overflow-hidden bg-gradient-to-b from-slate-50 via-amber-50/20 to-slate-50 text-slate-800 border-b border-amber-200/60">
      
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. SINGLE UNIFIED PREMIUM HERO CARD                                      */}
        {/* ========================================================================= */}
        <div className="w-full bg-gradient-to-br from-[#0F4C81] via-[#800C1E] to-[#4A0510] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-amber-400/40 relative overflow-hidden text-left">
          {/* Subtle background glow */}
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-amber-500/10 pointer-events-none blur-2xl" />
          
          <div className="relative z-10 space-y-3 sm:space-y-4">
            
            {/* Top Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-amber-400/30 text-amber-200 text-xs font-black shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? 'Official Vanjari Portal' : 'महाराष्ट्र - अधिकृत वंजारी समाज सेवा'}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black">
                🚩 {isEn ? 'Blessings of Sant Bhagwan Baba' : '॥ श्री संत भगवान बाबा प्रसन्न ॥'}
              </span>
            </div>

            {/* Main Headline & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-xs">
                {isEn ? 'Vanjari Jodi Matrimony Portal' : 'वंजारी जोडी वधू-वर सूचक केंद्र'}
              </h1>
              <p className="text-amber-100 text-xs sm:text-sm font-medium mt-1.5 leading-relaxed opacity-95 max-w-2xl">
                {isEn
                  ? 'Official and trusted matrimonial platform for educated and cultured Vanjari brides & grooms across Maharashtra.'
                  : 'महाराष्ट्रातील बीड, नाशिक, अहमदनगर, संभाजीनगर, पुणे, मुंबई सह सर्व ३६ जिल्ह्यातील उच्चशिक्षित व सुसंस्कारी वंजारी वधू-वरांचे अधिकृत व्यासपीठ.'}
              </p>
            </div>

            {/* Hero Navigation Buttons (When Logged In) */}
            {currentUser && (
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentView('profiles')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isEn ? 'Browse Matrimony Profiles' : '👰🤵 सर्व वधू-वर स्थळे पहा'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-black text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-300" />
                  <span>{isEn ? 'My Profile' : 'माझे प्रोफाईल'}</span>
                </button>
              </div>
            )}

            {/* Trust Pill Bar */}
            <div className="flex items-center gap-3 pt-2 text-[10px] sm:text-xs text-amber-200/90 font-bold border-t border-white/10">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> १००% आधार पडताळणी</span>
              <span className="flex items-center gap-1">📜 ३६ गुण कुंडली मिलन</span>
              <span className="flex items-center gap-1">🔒 संपूर्ण गोपनीयता</span>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. AUTHENTICATION GATE (When NOT logged in) OR SEARCH (When logged in)    */}
        {/* ========================================================================= */}
        {!currentUser ? (
          /* Mandatory Login / Registration Gate Card */
          <div className="w-full bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-md text-center space-y-4 relative overflow-hidden">
            <div className="w-13 h-13 rounded-2xl bg-[#800C1E] text-amber-300 flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-black tracking-wider uppercase mb-1.5 border border-amber-300">
                🔒 प्रवेश आवश्यक
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-[#800C1E] leading-snug">
                {isEn ? 'Login Required to Search & View BioDatas' : 'वधू-वर स्थळे, जिल्हा शोध व बायोडाटा पाहण्यासाठी लॉगिन करा'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl mx-auto mt-2 leading-relaxed">
                {isEn
                  ? 'To protect member privacy, all candidate biodatas, photos, education, occupation, Kundli matching and district search across 36 Maharashtra districts are accessible only after logging in.'
                  : 'वंजारी समाजातील वधू-वरांचे बायोडाटा, छायाचित्रे, शिक्षण, नोकरी, ३६ गुण जन्मपत्रिका आणि सर्व ३६ जिल्ह्यांतील स्थळे शोधण्यासाठी कृपया प्रथम आपला मोबाईल नंबर टाकून लॉगिन करा किंवा मोफत नोंदणी करा.'}
              </p>
            </div>

            {/* Login & Register Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              <button
                type="button"
                onClick={() => {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                }}
                className="py-3 px-4 rounded-2xl bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border border-amber-400/40"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>{isEn ? 'Login with Mobile OTP' : '📱 मोबाईल / OTP ने लॉगिन करा'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border border-amber-500"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>{isEn ? 'New Free Registration' : '✨ नवीन मोफत नोंदणी करा'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* When Logged In: Full Categories & Quick Search System */
          <>
            {/* Category Filter Tabs */}
            <div className="w-full">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#800C1E]" />
                  <span>{isEn ? 'Browse Categories' : 'शाखा व विभाग निवडा (Categories)'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
                {[
                  { id: 'all', label: isEn ? 'All Profiles' : 'सर्व स्थळे', icon: Sparkles },
                  { id: 'bride', label: isEn ? 'Brides (वधू)' : '👰 वधू', icon: Heart },
                  { id: 'groom', label: isEn ? 'Grooms (वर)' : '🤵 वर', icon: UserCheck },
                  { id: 'doctors', label: isEn ? 'Engineers & Doctors' : '🎓 इंजिनिअर व डॉक्टर', icon: Stethoscope },
                  { id: 'govt', label: isEn ? 'Govt Services' : '🏛️ शासकीय सेवा', icon: GraduationCap },
                  { id: 'business', label: isEn ? 'Business' : '💼 व्यवसाय', icon: Briefcase },
                  { id: 'biodata', label: isEn ? 'BioData Maker' : '📄 बायोडाटा मेकर', icon: Scroll },
                ].map((cat) => {
                  const IconComp = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isActive
                          ? 'bg-[#800C1E] text-amber-200 border-[#800C1E] shadow-sm'
                          : 'bg-white text-slate-700 hover:text-[#800C1E] border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Search System */}
            {siteConfig?.enableSearchFilters !== false && (
              <div className="w-full bg-white border border-amber-200/80 shadow-sm rounded-2xl p-3.5 sm:p-4 text-left relative z-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs">
                    <Search className="w-3.5 h-3.5 text-[#800C1E]" />
                    <span>{isEn ? 'Filter Profiles by District & Gender' : 'जलद शोध प्रणाली (Quick Filter)'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">महाराष्ट्रातील ३६ जिल्हे</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  {/* Gender Choice */}
                  <div className="sm:col-span-5 flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {isEn ? '1. Looking For' : '१. मला शोधायचे आहे'}
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setQuickGender('all')}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          quickGender === 'all'
                            ? 'bg-[#800C1E] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isEn ? 'Both' : 'दोन्ही'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickGender('bride')}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          quickGender === 'bride'
                            ? 'bg-[#800C1E] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        👰 {isEn ? 'Bride' : 'वधू'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickGender('groom')}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          quickGender === 'groom'
                            ? 'bg-[#800C1E] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        🤵 {isEn ? 'Groom' : 'वर'}
                      </button>
                    </div>
                  </div>

                  {/* District Selection */}
                  <div className="sm:col-span-4 flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {isEn ? '2. Select District' : '२. जिल्हा निवडा'}
                    </label>
                    <select
                      value={quickDistrict}
                      onChange={(e) => setQuickDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#800C1E] transition-colors"
                    >
                      <option value="">{isEn ? '-- All Districts --' : '-- सर्व महाराष्ट्र --'}</option>
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {isEn ? transliterateMarathiToEnglish(d) : d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Search Button */}
                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleQuickSearch}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 shrink-0" />
                      <span>{isEn ? 'Search Now' : 'शोध सुरू करा'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 5. CLEAN QUICK ACTION GRID (Non-repetitive, 2x2 grid)                    */}
        {/* ========================================================================= */}
        <div className="w-full pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Action 1: BioData Maker */}
            <button
              type="button"
              onClick={() => setIsBioDataMakerOpen(true)}
              className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/60 border border-amber-200/80 hover:border-amber-300 shadow-xs flex items-center justify-between gap-3 transition-all duration-200 active:scale-98 group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                  <Scroll className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {isEn ? 'Online Marathi BioData Maker' : 'ऑनलाईन बायोडाटा मेकर'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {isEn ? 'Create free PDF biodata in Marathi' : 'मोफत आकर्षक PDF बायोडाटा बनवा'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0">
                <span>बनवा</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>

            {/* Action 2: Wedding Vendor Network (Only for non-logged-in visitors) */}
            {!currentUser && isVendorsEnabled && (
              <button
                type="button"
                onClick={() => setIsBusinessVendorDirectoryOpen(true)}
                className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/60 border border-emerald-200/80 hover:border-emerald-300 shadow-xs flex items-center justify-between gap-3 transition-all duration-200 active:scale-98 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                      {isEn ? 'Wedding Vendors & Halls' : 'लग्न व्यवसाय व हॉल नेटवर्किंग'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {isEn ? 'Halls, Catering & Photography' : 'मंगल कार्यालय, कॅटरिंग व इतर सेवा'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0">
                  <span>पहा</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            )}

            {/* Action 3: Single Kundli Birth Horoscope Report Generator */}
            <button
              type="button"
              onClick={() => openSingleKundliGenerator()}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-white to-amber-500/10 hover:bg-amber-100/60 border border-amber-300/90 shadow-xs flex items-center justify-between gap-3 transition-all duration-200 active:scale-98 group cursor-pointer text-left sm:col-span-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#800C1E] to-[#A71930] text-amber-200 group-hover:scale-105 transition-transform shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-[#800C1E] leading-tight flex items-center gap-1.5">
                    <span>{isEn ? '🔮 Complete Vedic Single Kundli Report' : '🔮 संपूर्ण वैदिक जन्मपत्रिका व ग्रहस्थिती अहवाल'}</span>
                    <span className="text-[9px] bg-[#800C1E] text-amber-100 font-bold px-1.5 py-0.2 rounded">100% Free</span>
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                    {isEn ? 'Lagna chart, planet degrees, Dasha, Manglik & PDF Download' : 'लग्न कुंडली, नवमांश, महादशा, मंगळ दोष, राशी-नक्षत्र व मोफत PDF डाउनलोड'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-0.5 bg-[#800C1E] text-amber-200 px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 shadow-xs">
                <span>अहवाल काढा</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </div>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. RECOMMENDED PROFILES GRID (DESKTOP HOME FEATURED PROFILES)            */}
        {/* ========================================================================= */}
        {currentUser && profiles && profiles.length > 0 && (
          <div className="w-full space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
                <h2 className="font-black text-lg sm:text-xl text-slate-900">
                  {isEn ? 'Recommended Matrimony Matches' : 'शिफारस केलेली प्रमुख वधू-वर स्थळे'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('profiles')}
                className="px-3.5 py-1.5 rounded-xl bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span>{isEn ? 'View All Matches' : 'सर्व स्थळे पहा'} ({profiles.length})</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {profiles.slice(0, 8).map((profile) => (
                <ModernProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
