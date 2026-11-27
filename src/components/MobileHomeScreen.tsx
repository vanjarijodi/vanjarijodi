import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ModernProfileCard } from './ModernProfileCard';
import { VerifiedBadge } from './VerifiedBadge';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { isGooglePlayReviewActive } from '../utils/playStorePaymentHelper';
import {
  Search,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  X,
  Sparkles,
  Crown,
  Users,
  User,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Heart,
  Star,
  Sun,
  Moon,
  Award,
  TrendingUp,
  Handshake,
  Send,
  Headphones,
  Phone,
  KeyRound,
  Smartphone,
  Zap,
  FileText,
  Upload,
} from 'lucide-react';
import { UserProfile } from '../types';
import { ActivationCodeModal } from './ActivationCodeModal';
import { MarqueeTickerBanner } from './MarqueeTickerBanner';
import { HelplineEmailBadge } from './HelplineEmailBadge';
import { TelegramGroupNoticeBanner } from './TelegramGroupNoticeBanner';

export const MobileHomeScreen: React.FC = () => {
  const {
    profiles,
    currentUser,
    isAdminLoggedIn,
    isContactAuthorizedForUser,
    setSearchFilters,
    setSelectedProfileForModal,
    setModalProfileList,
    setIsRightDrawerOpen,
    setIsPaymentOpen,
    setIsMembershipPlansModalOpen,
    setIsBusinessVendorDirectoryOpen,
    setIsBusinessVendorRegisterModalOpen,
    setSelectedPlanForPayment,
    plansList,
    successStories = [],
    isSuccessStoriesEnabled,
    setCurrentView,
    setIsLoginOpen,
    setIsRegisterOpen,
    setIsBioDataMakerOpen,
    setRegistrationStep,
    siteConfig,
    language,
    setLanguage,
    setIsAudioCallModalOpen,
    setIsPhoneAuthModalOpen,
  } = useApp();

  const [activeFilterChip, setActiveFilterChip] = useState<'all' | 'verified' | 'doctors' | 'engineers' | 'govt' | 'business'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'bride' | 'groom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const isEn = language === 'en';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Profile Completion Calculation
  const profileCompletion = useMemo(() => {
    if (!currentUser) return null;
    const items = [
      { label: isEn ? 'Photo' : 'फोटो', isDone: Boolean(currentUser.photos && currentUser.photos.length > 0), weight: 20 },
      { label: isEn ? 'Education' : 'शिक्षण', isDone: Boolean(currentUser.education), weight: 15 },
      { label: isEn ? 'Occupation' : 'व्यवसाय', isDone: Boolean(currentUser.occupation), weight: 15 },
      { label: isEn ? 'District' : 'जिल्हा', isDone: Boolean(currentUser.district || currentUser.city), weight: 15 },
      { label: isEn ? 'Family Info' : 'कुटुंब माहिती', isDone: Boolean(currentUser.fatherName || currentUser.motherName), weight: 15 },
      { label: isEn ? 'KYC Verification' : 'आधार KYC', isDone: Boolean(currentUser.verification_status === 'Approved' || currentUser.aadhaarVerified), weight: 20 },
    ];
    const score = items.reduce((acc, it) => acc + (it.isDone ? it.weight : 0), 0);
    const pending = items.filter(it => !it.isDone);
    return { score: Math.min(100, score), pending };
  }, [currentUser, isEn]);

  // Recommended Matches
  const recommendedProfiles = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];
    const targetGender = currentUser?.gender === 'bride' ? 'groom' : currentUser?.gender === 'groom' ? 'bride' : null;
    return profiles
      .filter(p => p.id !== currentUser?.id && (!targetGender || p.gender === targetGender))
      .slice(0, 8);
  }, [profiles, currentUser]);

  // Recently Joined Profiles
  const recentlyJoinedProfiles = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];
    return [...profiles]
      .filter(p => p.id !== currentUser?.id)
      .reverse()
      .slice(0, 10);
  }, [profiles, currentUser]);

  // Verified Profiles
  const verifiedProfiles = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];
    return profiles
      .filter(p => p.verification_status === 'Approved' || p.aadhaarVerified || p.isVerified)
      .slice(0, 8);
  }, [profiles]);

  // Format height nicely (e.g. 5ft 2in)
  const formatHeight = (heightStr?: string) => {
    if (!heightStr) return '5ft 2in';
    if (heightStr.includes('ft') || heightStr.includes("'")) return heightStr;
    const num = parseFloat(heightStr);
    if (!isNaN(num) && num > 100) {
      const totalInches = num / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}ft ${inches}in`;
    }
    return heightStr;
  };

  // Format location (e.g. "Pune, Maharashtra")
  const formatLocation = (profile: UserProfile) => {
    const city = profile.city || profile.district || 'महाराष्ट्र';
    const state = (profile as any).state || 'Maharashtra';
    return `${city}, ${state}`;
  };

  // 1. Filter Profiles by gender, search text, and category
  const filteredProfiles = useMemo(() => {
    const rawList = profiles || [];
    const uniqueMap = new Map<string, UserProfile>();
    rawList.forEach((p) => {
      if (p && p.id && !uniqueMap.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    });
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.filter((p) => {
      if (selectedGender !== 'all' && p.gender !== selectedGender) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.fullName?.toLowerCase().includes(q);
        const matchesCity = p.city?.toLowerCase().includes(q) || p.district?.toLowerCase().includes(q);
        const matchesEdu = p.education?.toLowerCase().includes(q);
        const matchesOcc = p.occupation?.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesEdu && !matchesOcc) {
          return false;
        }
      }
      if (activeFilterChip === 'doctors') {
        return (
          p.education?.toLowerCase().includes('mbbs') ||
          p.education?.toLowerCase().includes('md') ||
          p.education?.toLowerCase().includes('bams') ||
          p.education?.toLowerCase().includes('bhms') ||
          p.education?.toLowerCase().includes('doctor') ||
          p.occupation?.toLowerCase().includes('doctor') ||
          p.occupation?.toLowerCase().includes('medical')
        );
      }
      if (activeFilterChip === 'engineers') {
        return (
          p.education?.toLowerCase().includes('be') ||
          p.education?.toLowerCase().includes('btech') ||
          p.education?.toLowerCase().includes('mca') ||
          p.education?.toLowerCase().includes('engineer') ||
          p.occupation?.toLowerCase().includes('software') ||
          p.occupation?.toLowerCase().includes('it')
        );
      }
      if (activeFilterChip === 'govt') {
        return (
          (p as any).occupationType === 'Government' ||
          p.occupation?.toLowerCase().includes('govt') ||
          p.occupation?.toLowerCase().includes('शासकीय') ||
          p.occupation?.toLowerCase().includes('government')
        );
      }
      if (activeFilterChip === 'business') {
        return (
          (p as any).occupationType === 'Business' ||
          p.occupation?.toLowerCase().includes('business') ||
          p.occupation?.toLowerCase().includes('व्यवसाय') ||
          p.occupation?.toLowerCase().includes('उद्योग')
        );
      }
      if (activeFilterChip === 'verified') {
        return Boolean(p.verification_status === 'Approved' || p.aadhaarVerified || p.isVerified);
      }
      return true;
    });
  }, [profiles, selectedGender, searchQuery, activeFilterChip]);

  const displayedProfiles = useMemo(
    () => filteredProfiles.slice(0, visibleCount),
    [filteredProfiles, visibleCount]
  );

  const handleGenderChange = (gender: 'all' | 'bride' | 'groom') => {
    setSelectedGender(gender);
    setVisibleCount(20);
    setSearchFilters((prev: any) => ({
      ...prev,
      gender: gender,
    }));
  };

  const handleProfileClick = (profile: UserProfile) => {
    setModalProfileList(filteredProfiles);
    setSelectedProfileForModal(profile);
  };

  const handleUpgradeClick = () => {
    const goldPlan = plansList?.[0] || null;
    setSelectedPlanForPayment(goldPlan);
    setIsPaymentOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-28 select-none transition-colors">
      
      {/* 1. TOP BRAND APP BAR - MATERIAL 3 */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#800C1E] via-[#9B111E] to-[#800C1E] text-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <img
            src="/vanjari-jodi-official-logo.png"
            alt="Logo"
            loading="lazy"
            decoding="async"
            className="w-11 h-11 rounded-full bg-white/20 p-0.5 object-cover border-2 border-amber-300 shadow-md"
          />
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-amber-200">
              {siteConfig?.logoTitle || (isEn ? 'Vanjari Jodi' : 'वंजारी जोडी')}
            </h1>
            <p className="text-[10px] text-white/80 font-medium leading-tight mt-0.5">
              {isEn ? 'Vanjari Community Matrimony' : 'वधू-वर परिचय केंद्र'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Switcher Button (Marathi / English) */}
          <div className="flex items-center bg-black/40 border border-amber-300/50 rounded-full p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                language === 'mr'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-amber-200/90 hover:text-white'
              }`}
              title="मराठी भाषा निवडा"
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-amber-200/90 hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
          </div>

          {/* Quick Call / Helpline Contact Button in Header */}
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                setIsLoginOpen(true);
              } else {
                setIsAudioCallModalOpen(true);
              }
            }}
            aria-label="Call Admin Support"
            className="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-300/60 flex items-center justify-center text-amber-200 hover:text-white hover:bg-emerald-500/50 transition active:scale-90 shadow-xs"
            title="📞 ॲडमिनला कॉल करा (संपर्क साधा)"
          >
            <Phone className="w-4 h-4 text-emerald-300 animate-pulse" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(prev => !prev)}
            aria-label="Toggle Theme"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition active:scale-90"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
          </button>

          {/* Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="Search"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition active:scale-90"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setIsRightDrawerOpen(true)}
            aria-label="Filter"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition active:scale-90"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 📧 ADMIN-CUSTOMIZABLE TOP HELPLINE EMAIL STRIP (Mobile App) */}
      {siteConfig?.showHelplineEmailInHeader !== false && (
        <div className="w-full bg-gradient-to-r from-[#5E0715] via-[#800C1E] to-[#5E0715] px-3 py-1.5 flex items-center justify-center border-b border-amber-400/30">
          <HelplineEmailBadge compactMobile />
        </div>
      )}

      {/* 📢 FULL-WIDTH ANNOUNCEMENT TICKER (No wide label eating space) */}
      <MarqueeTickerBanner />

      {/* 🚀 TOP COMPACT WELCOME & COMMUNITY SUPPORT BAR */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#9B111E] to-[#600512] text-white px-3 py-2 border-b border-amber-400/40 flex items-center justify-between gap-2 shadow-xs">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-amber-300 truncate">
              {currentUser
                ? `🙏 नमस्कार, ${currentUser.fullName?.split(' ')[0] || 'सभासद'}!`
                : '🙏 श्री संत भगवान बाबा प्रसन्न'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold border border-amber-300/30 shrink-0">
              {profiles?.length || 500}+ बायोडाटा
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-[11px] shadow-2xs flex items-center gap-1 border border-sky-300/60"
            title="अधिकृत टेलिग्राम ग्रुप जॉईन करा"
          >
            <Send className="w-3 h-3 text-white shrink-0" />
            <span>{isEn ? 'Telegram' : 'टेलिग्राम'}</span>
          </a>
          <button
            type="button"
            onClick={() => setCurrentView('matches')}
            className="py-1 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] shadow-2xs flex items-center gap-0.5 cursor-pointer"
          >
            <span>{isEn ? 'Matches' : 'माझी स्थळे'}</span>
            <ChevronRight className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* 📢 TELEGRAM GROUP JOIN NOTICE BANNER */}
      <TelegramGroupNoticeBanner compact />

      {/* 2. EXPANDABLE INSTANT SEARCH BAR */}
      {isSearchOpen && (
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 animate-fadeIn shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाव, जिल्हा किंवा शिक्षण शोधा..."
              autoFocus
              className="w-full pl-9 pr-8 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-hidden border border-slate-200 dark:border-slate-700 focus:border-[#800C1E] dark:focus:border-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#800C1E] dark:text-amber-400 hover:underline px-2 py-1"
          >
            {isEn ? 'Close' : 'बंद'}
          </button>
        </div>
      )}

      {/* 3.1 MANDATORY EMAIL OTP VERIFICATION BANNER (FOR ACTIVE PLAN MEMBERS) */}
      {currentUser && !currentUser.isPhoneVerified && (() => {
        const isPlanActive = Boolean(
          currentUser.membershipTier === 'paid' ||
          currentUser.membershipTier === 'premium' ||
          currentUser.membershipTier === 'vip' ||
          currentUser.hasPaidMembership ||
          (currentUser.membershipExpiresAt && new Date(currentUser.membershipExpiresAt).getTime() > Date.now())
        );
        const isMandatory = Boolean(siteConfig?.requireTruecallerForActivePlanMembers && isPlanActive);

        if (!isMandatory) return null;

        return (
          <section className="px-4 py-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900 via-[#800C1E] to-emerald-950 p-4 text-white shadow-lg border-2 border-amber-400 ring-2 ring-amber-400/20 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/40 shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                      ⚠️ अनिवार्य पडताळणी
                    </span>
                    <h3 className="font-extrabold text-xs text-white">
                      ईमेल OTP पडताळणी प्रलंबित आहे
                    </h3>
                  </div>
                  <p className="text-[11px] text-amber-100/90 leading-relaxed font-medium">
                    आपले वंजारी जोडी खाते सक्रिय झाले आहे. सुरक्षा नियमांनुसार तुमचा ईमेल पत्ता OTP द्वारे व्हेरिफाय करा.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPhoneAuthModalOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-200"
                    >
                      <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                      <span>📧 त्वरित ईमेल OTP व्हेरिफाय करा</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* 📤 UPLOAD BIODATA & CREATE BIODATA HUB (१००% मोफत बायोडाटा अपलोड) */}
      <section className="px-4 py-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#600816] text-white p-3.5 shadow-lg border border-amber-400/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
                <FileText className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-amber-100 flex items-center gap-1.5">
                  <span>बायोडाटा अपलोड व मोफत नोंदणी</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
                    Free
                  </span>
                </h3>
                <p className="text-[10px] text-amber-200/90 font-medium">
                  फोटो किंवा PDF बायोडाटा अपलोड करा • बायोडाटा मोफत पहा
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setRegistrationStep('ocr_photo');
                setIsRegisterOpen(true);
              }}
              className="py-2 px-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">बायोडाटा अपलोड करा</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBioDataMakerOpen(true)}
              className="py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" />
              <span className="truncate">बायोडाटा तयार करा</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. WHATSAPP-STYLE BIODATA & PHOTO FEED (IMMEDIATELY VISIBLE AFTER LOGIN) */}
      <div className="sticky top-[58px] z-20 px-4 py-2.5 bg-[#075E54] text-white flex items-center justify-between gap-2 shadow-md border-b border-emerald-700">
        {/* Gender Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => handleGenderChange('all')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer shrink-0 ${
              selectedGender === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            सर्व बायोडाटा ({profiles?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('bride')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer shrink-0 ${
              selectedGender === 'bride'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            👰 वधू बायोडाटा
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('groom')}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer shrink-0 ${
              selectedGender === 'groom'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            🤵 वर बायोडाटा
          </button>
        </div>

        {/* View Switcher (1-Col WhatsApp Feed vs 2-Col Grid) */}
        <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="WhatsApp Biodata Feed View"
            className={`p-1.5 rounded-lg transition min-w-[32px] min-h-[32px] flex items-center justify-center ${
              viewMode === 'list' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
            title="व्हॉट्सॲप बायोडाटा फीड"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
            className={`p-1.5 rounded-lg transition min-w-[32px] min-h-[32px] flex items-center justify-center ${
              viewMode === 'grid' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
            title="ग्रिड व्ह्यू"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="px-3 py-2 bg-[#ECE5DD] dark:bg-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none text-xs border-b border-amber-200/70">
        <button
          type="button"
          onClick={() => setActiveFilterChip('all')}
          className={`min-h-[34px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'all'
              ? 'bg-[#075E54] text-white font-black shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          सर्व स्थळे
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('verified')}
          className={`min-h-[34px] px-3 py-1 rounded-xl font-bold shrink-0 transition flex items-center gap-1 ${
            activeFilterChip === 'verified'
              ? 'bg-blue-600 text-white font-black shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          ब्लू टिक
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('engineers')}
          className={`min-h-[34px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'engineers'
              ? 'bg-[#075E54] text-white font-black'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          इंजिनिअर / IT
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('doctors')}
          className={`min-h-[34px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'doctors'
              ? 'bg-[#075E54] text-white font-black'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          डॉक्टर / मेडिकल
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('govt')}
          className={`min-h-[34px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'govt'
              ? 'bg-[#075E54] text-white font-black'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          शासकीय नोकरी
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('business')}
          className={`min-h-[34px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'business'
              ? 'bg-[#075E54] text-white font-black'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          व्यवसाय / उद्योजक
        </button>
      </div>

      {/* WHATSAPP-STYLE BIODATA + PHOTO STREAM */}
      <div className="bg-[#ECE5DD]/80 dark:bg-slate-950 py-3 px-2.5 sm:px-4">
        {displayedProfiles.length === 0 ? (
          <div className="py-16 text-center space-y-2 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">कोणतेही स्थळ सापडले नाही</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">कृपया वरील फिल्टर बदलून पुन्हा प्रयत्न करा.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedGender('all');
                setSearchQuery('');
                setActiveFilterChip('all');
              }}
              className="px-5 py-2.5 bg-[#075E54] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
            >
              सर्व बायोडाटा पहा
            </button>
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
            {displayedProfiles.map((profile) => (
              <ModernProfileCard
                key={`wa-feed-${profile.id}`}
                profile={profile}
                onView={handleProfileClick}
              />
            ))}
          </div>
        )}

        {/* LOAD MORE BUTTON */}
        {visibleCount < filteredProfiles.length && (
          <div className="pt-4 pb-2 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="w-full py-3.5 rounded-2xl bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-xs sm:text-sm transition active:scale-98 border border-emerald-500 shadow-md"
            >
              📜 आणखी बायोडाटा व फोटो पहा (+{filteredProfiles.length - visibleCount} अधिक स्थळे)
            </button>
          </div>
        )}
      </div>

      {/* 5. PROFILE COMPLETION PERCENTAGE WIDGET (LOGGED IN USER) */}
      {currentUser && profileCompletion && profileCompletion.score < 100 && (
        <section className="px-4 py-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xs">
                  {profileCompletion.score}%
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
                    {isEn ? 'Profile Completion' : 'आपली प्रोफाइल पूर्णता'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {profileCompletion.score >= 80 ? 'छान! अधिक स्थळांसाठी 100% पूर्ण करा' : 'पूर्ण प्रोफाइलला ५ पट अधिक प्रतिसाद मिळतात'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('account')}
                className="px-3 py-1.5 rounded-lg bg-[#800C1E] dark:bg-rose-900 text-white text-[11px] font-bold shadow-xs active:scale-95"
              >
                {isEn ? 'Complete' : 'पूर्ण करा'}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-[#800C1E] h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion.score}%` }}
              />
            </div>

            {/* Missing Items Chips */}
            {profileCompletion.pending.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none text-[10.5px]">
                <span className="text-slate-400 shrink-0 font-medium">शिल्लक:</span>
                {profileCompletion.pending.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 shrink-0 font-medium"
                  >
                    + {item.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 🤝 WEDDING VENDOR DIRECTORY & REGISTRATION */}
      <section className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Handshake className="w-4 h-4 text-[#800C1E] dark:text-amber-400" />
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {isEn ? 'Wedding Business Services' : '🤝 विवाह व्यवसाय व व्हेंडर डिरेक्टरी'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsBusinessVendorDirectoryOpen(true)}
            className="text-[11px] font-bold text-[#800C1E] dark:text-amber-400 hover:underline"
          >
            {isEn ? 'Browse Directory' : 'डिरेक्टरी पहा'} →
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50/60 dark:bg-slate-900 border border-amber-300/80 dark:border-amber-900/40 shadow-xs space-y-2.5">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
            कॅटरिंग, मंगल कार्यालय, मंडप, डेकोरेशन, फोटोग्राफर किंवा भटजी शोधा आणि थेट संपर्क साधा.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBusinessVendorRegisterModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs shadow-xs transition active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 border border-amber-400/50"
            >
              <Handshake className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">{isEn ? 'Register Business' : '🤝 व्यवसाय नोंदणी करा'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBusinessVendorDirectoryOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xs transition active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 border border-amber-500"
            >
              <Search className="w-3.5 h-3.5 text-slate-950" />
              <span>{isEn ? 'Browse Vendors' : '🔍 लग्नासाठी व्यवसाय व सेवा शोधा'}</span>
            </button>
          </div>
        </div>
      </section>

      <ActivationCodeModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
      />
    </div>
  );
};
