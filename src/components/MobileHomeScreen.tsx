import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ModernProfileCard } from './ModernProfileCard';
import { VerifiedBadge } from './VerifiedBadge';
import { formatProfileDisplayName } from '../utils/nameFormatter';
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
} from 'lucide-react';
import { UserProfile } from '../types';

export const MobileHomeScreen: React.FC = () => {
  const {
    profiles,
    currentUser,
    isAdminLoggedIn,
    isContactAuthorizedForUser,
    setSearchFilters,
    setSelectedProfileForModal,
    setIsRightDrawerOpen,
    setIsPaymentOpen,
    setSelectedPlanForPayment,
    plansList,
    successStories = [],
    isSuccessStoriesEnabled,
    setCurrentView,
    setIsLoginOpen,
    setIsRegisterOpen,
    siteConfig,
    language,
    setLanguage,
  } = useApp();

  const [activeFilterChip, setActiveFilterChip] = useState<'all' | 'verified' | 'doctors' | 'engineers' | 'govt' | 'business'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'bride' | 'groom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [visibleCount, setVisibleCount] = useState(20);
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

  const displayedProfiles = filteredProfiles.slice(0, visibleCount);

  const handleGenderChange = (gender: 'all' | 'bride' | 'groom') => {
    setSelectedGender(gender);
    setVisibleCount(20);
    setSearchFilters((prev: any) => ({
      ...prev,
      gender: gender,
    }));
  };

  const handleProfileClick = (profile: UserProfile) => {
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
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#800C1E] via-[#9B111E] to-[#800C1E] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <img
            src="/vanjari-jodi-official-logo.png"
            alt="Logo"
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
          <button
            type="button"
            onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
            className="px-2 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-amber-300/40 text-amber-200 text-[11px] font-black tracking-wide transition active:scale-90 flex items-center gap-1"
            title="भाषा बदला (Change Language)"
          >
            <span className="text-xs">🌐</span>
            <span>{language === 'mr' ? 'EN' : 'मराठी'}</span>
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

      {/* 3. WELCOME BANNER - MATERIAL 3 HERO CARD */}
      <section className="px-4 pt-4 pb-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800C1E] via-[#9B111E] to-[#600512] text-white p-5 shadow-lg border border-amber-400/30">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10.5px] font-black tracking-wide border border-amber-300/30">
                <Sparkles className="w-3 h-3" />
                {isEn ? 'Official Vanjari Matrimony' : 'संत भगवान बाबांच्या आशीर्वादाने'}
              </span>
              <h2 className="text-lg font-black tracking-tight leading-tight text-white">
                {currentUser
                  ? `नमस्कार, ${currentUser.fullName?.split(' ')[0] || 'सभासद'}!`
                  : (isEn ? 'Find Your Perfect Match' : 'आपल्या वंजारी समाजातील अनुरूप स्थळ शोधा')}
              </h2>
              <p className="text-xs text-white/90 leading-relaxed font-normal line-clamp-2">
                {isEn
                  ? 'Connect with verified brides and grooms across Maharashtra with 100% trust and security.'
                  : 'महाराष्ट्रभरातील हजारो सुशिक्षित वंजारी वधू-वर प्रोफाइल्स — खात्रीशीर व सुरक्षित.'}
              </p>
            </div>
            <img
              src="/vanjari-jodi-official-logo.png"
              alt="Brand Badge"
              className="w-16 h-16 rounded-full border-2 border-amber-300 shadow-md shrink-0 object-cover"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{profiles?.length || 500}+ सक्रिय सभासद</span>
            </div>
            {!currentUser ? (
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>{isEn ? 'Register Free' : 'मोफत नोंदणी करा'}</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('matches')}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer backdrop-blur-xs"
              >
                <span>{isEn ? 'View Matches' : 'माझी स्थळे पहा'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. PROFILE COMPLETION PERCENTAGE WIDGET (LOGGED IN USER) */}
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

      {/* 5. RECOMMENDED MATCHES CAROUSEL */}
      {recommendedProfiles.length > 0 && (
        <section className="pt-4 pb-2">
          <div className="px-4 flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {isEn ? 'Recommended Matches' : 'शिफारस केलेली स्थळे'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('matches')}
              className="text-xs font-bold text-[#800C1E] dark:text-rose-400 hover:underline flex items-center gap-0.5"
            >
              <span>{isEn ? 'See all' : 'सर्व पहा'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto px-4 pb-2 no-scrollbar scrollbar-none">
            {recommendedProfiles.map((profile) => {
              const photoUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0] : null;
              const isVerified = Boolean(profile.verification_status === 'Approved' || profile.aadhaarVerified);
              return (
                <div
                  key={`rec-${profile.id}`}
                  onClick={() => handleProfileClick(profile)}
                  className="w-36 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition p-2.5 cursor-pointer active:scale-98 text-center"
                >
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-300 shadow-inner bg-slate-100 dark:bg-slate-800 mb-2">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={profile.fullName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-10 h-10 stroke-1" />
                      </div>
                    )}
                    {isVerified && (
                      <div className="absolute bottom-0 right-1 translate-y-0.5">
                        <VerifiedBadge isVerified={true} size="sm" showLabel={false} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {profile.fullName?.split(' ')[0] || 'सभासद'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {profile.age} वर्षे, {profile.city || profile.district || 'महाराष्ट्र'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#800C1E] dark:text-rose-300 text-[9.5px] font-bold">
                    {profile.education?.split(' ')?.[0] || 'सुशिक्षित'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. RECENTLY JOINED PROFILES (HORIZONTAL AVATARS) */}
      {recentlyJoinedProfiles.length > 0 && (
        <section className="py-2">
          <div className="px-4 flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {isEn ? 'Recently Joined Profiles' : 'नवीन सभासद'}
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">नवीन नोंदणी</span>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar scrollbar-none">
            {recentlyJoinedProfiles.map((p) => {
              const photo = p.photos && p.photos.length > 0 ? p.photos[0] : null;
              return (
                <div
                  key={`recent-${p.id}`}
                  onClick={() => handleProfileClick(p)}
                  className="flex flex-col items-center shrink-0 cursor-pointer active:scale-95 group"
                >
                  <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-[#800C1E]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-900 border border-white dark:border-slate-800">
                      {photo ? (
                        <img
                          src={photo}
                          alt={p.fullName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <User className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider shadow-xs">
                      New
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate w-14 text-center mt-1.5 leading-tight">
                    {p.fullName?.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. PREMIUM MEMBERSHIP PLANS SHOWCASE & CAROUSEL */}
      <section className="px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {isEn ? 'Membership Plans & Offers' : '💎 मेंबरशिप योजना व ऑफर्स'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="text-[11px] font-bold text-[#800C1E] dark:text-amber-400 hover:underline"
          >
            {isEn ? 'View All' : 'सर्व पहा'} →
          </button>
        </div>

        {/* Scrollable Mobile Plan Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scrollbar-none snap-x snap-mandatory">
          {(siteConfig?.showOnlyWelcomePlan !== false
            ? plansList.filter((p) => p.id === 'welcome_offer' && p.isActive !== false)
            : plansList.filter((p) => p.isActive !== false && p.id !== 'single_kundli' && p.planType !== 'single_use')
          ).map((plan) => {
              const isWelcome = plan.id === 'welcome_offer';
              return (
                <div
                  key={plan.id}
                  className={`shrink-0 w-64 rounded-2xl p-3.5 snap-center transition-all shadow-sm border ${
                    isWelcome
                      ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-[#800C1E] text-white border-amber-300/60 ring-2 ring-amber-400/40'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isWelcome
                          ? 'bg-amber-300 text-[#800C1E]'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isWelcome ? '🔥 स्पेशल ऑफर' : plan.recommended ? '🌟 शिफारस' : 'प्रीमियम'}
                    </span>
                    <span className={`text-[10px] font-bold ${isWelcome ? 'text-amber-100' : 'text-slate-500'}`}>
                      {plan.durationMonths ? `${plan.durationMonths} महिने` : 'कालावधी'}
                    </span>
                  </div>

                  <h3 className={`text-sm font-black truncate ${isWelcome ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className={`text-xl font-black ${isWelcome ? 'text-amber-200' : 'text-[#800C1E] dark:text-amber-400'}`}>
                      ₹{plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className={`text-xs line-through ${isWelcome ? 'text-white/60' : 'text-slate-400'}`}>
                        ₹{plan.originalPrice}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-1 mb-3 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isWelcome ? 'text-amber-200' : 'text-emerald-500'}`} />
                      <span className={isWelcome ? 'text-amber-50' : 'text-slate-600 dark:text-slate-300'}>
                        {plan.contactLimit ? `${plan.contactLimit} थेट फोन नंबर` : 'फोन नंबर अनलॉक'}
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isWelcome ? 'text-amber-200' : 'text-emerald-500'}`} />
                      <span className={isWelcome ? 'text-amber-50' : 'text-slate-600 dark:text-slate-300'}>
                        अमर्याद चॅट व मेसेजिंग
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isWelcome ? 'text-amber-200' : 'text-emerald-500'}`} />
                      <span className={isWelcome ? 'text-amber-50' : 'text-slate-600 dark:text-slate-300'}>
                        गुणमिलन व कुंडली पाहण्याची सुविधा
                      </span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanForPayment(plan);
                      setIsPaymentOpen(true);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-black shadow-xs transition active:scale-95 cursor-pointer text-center ${
                      isWelcome
                        ? 'bg-white text-[#800C1E] hover:bg-amber-50'
                        : 'bg-gradient-to-r from-amber-500 to-[#800C1E] text-white hover:brightness-105'
                    }`}
                  >
                    {isEn ? 'Choose Plan' : 'हा प्लॅन सक्रिय करा'}
                  </button>
                </div>
              );
            })}
        </div>
      </section>

      {/* 8. VERIFIED PROFILES SPOTLIGHT */}
      {verifiedProfiles.length > 0 && (
        <section className="py-2">
          <div className="px-4 flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {isEn ? 'Verified Profiles' : 'ब्लू टिक पडताळलेली स्थळे'}
              </h2>
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">100% खात्रीशीर</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto px-4 pb-2 no-scrollbar scrollbar-none">
            {verifiedProfiles.map((p) => {
              const photo = p.photos && p.photos.length > 0 ? p.photos[0] : null;
              return (
                <div
                  key={`ver-${p.id}`}
                  onClick={() => handleProfileClick(p)}
                  className="w-32 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-2.5 text-center shadow-xs cursor-pointer active:scale-95"
                >
                  <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-blue-400 bg-slate-100 dark:bg-slate-800 mb-1.5">
                    {photo ? (
                      <img
                        src={photo}
                        alt={p.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-8 h-8 stroke-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[80px]">
                      {p.fullName?.split(' ')[0]}
                    </span>
                    <VerifiedBadge isVerified={true} size="sm" showLabel={false} />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {p.city || p.district}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 9. SUCCESS STORIES TESTIMONIAL PREVIEW */}
      {isSuccessStoriesEnabled !== false && successStories && successStories.length > 0 && (
        <section className="px-4 py-3">
          <div className="rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-[#800C1E] fill-[#800C1E]" />
              <h3 className="text-xs font-black text-[#800C1E] dark:text-rose-300 uppercase tracking-wide">
                {isEn ? 'Vanjari Jodi Success Stories' : 'यशोगाथा — विवाह जुळले'}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {(successStories[0] as any)?.image && (
                <img
                  src={(successStories[0] as any).image}
                  alt={successStories[0]?.coupleName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {successStories[0]?.coupleName || 'आनंदी जोडपे'}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                  "{(successStories[0] as any)?.story || (successStories[0] as any)?.storyMr || 'वंजारी जोडीच्या माध्यमातून आमचा शुभविवाह यशस्वीरित्या जुळला. मनापासून धन्यवाद!'}"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10. GENDER FILTER TABS & VIEW TOGGLE (LIST / GRID) */}
      <div className="sticky top-[58px] z-20 px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
        {/* Gender Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => handleGenderChange('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedGender === 'all'
                ? 'bg-[#800C1E] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            सर्व ({profiles?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('bride')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedGender === 'bride'
                ? 'bg-[#800C1E] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            👰 वधू
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('groom')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedGender === 'groom'
                ? 'bg-[#800C1E] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🤵 वर
          </button>
        </div>

        {/* View Switcher (List vs Grid) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List View"
            className={`p-1.5 rounded-lg transition min-w-[34px] min-h-[34px] flex items-center justify-center ${
              viewMode === 'list' ? 'bg-[#800C1E] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title="साधी यादी"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
            className={`p-1.5 rounded-lg transition min-w-[34px] min-h-[34px] flex items-center justify-center ${
              viewMode === 'grid' ? 'bg-[#800C1E] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title="ग्रिड व्ह्यू"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 11. CATEGORY FILTER CHIPS */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveFilterChip('all')}
          className={`min-h-[36px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'all'
              ? 'bg-amber-400 text-slate-950 font-black'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          सर्व स्थळे
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('verified')}
          className={`min-h-[36px] px-3 py-1 rounded-xl font-bold shrink-0 transition flex items-center gap-1 ${
            activeFilterChip === 'verified'
              ? 'bg-blue-600 text-white font-black'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          ब्लू टिक
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('engineers')}
          className={`min-h-[36px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'engineers'
              ? 'bg-[#800C1E] text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          इंजिनिअर / IT
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('doctors')}
          className={`min-h-[36px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'doctors'
              ? 'bg-[#800C1E] text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          डॉक्टर / मेडिकल
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('govt')}
          className={`min-h-[36px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'govt'
              ? 'bg-[#800C1E] text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          शासकीय नोकरी
        </button>
        <button
          type="button"
          onClick={() => setActiveFilterChip('business')}
          className={`min-h-[36px] px-3 py-1 rounded-xl font-bold shrink-0 transition ${
            activeFilterChip === 'business'
              ? 'bg-[#800C1E] text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          व्यवसाय / उद्योजक
        </button>
      </div>

      {/* 12. PROFILES STREAM: CLEAN SIMPLE LIST OR GRID */}
      {viewMode === 'list' ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
          {displayedProfiles.length === 0 ? (
            <div className="py-16 text-center space-y-2 px-4">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">कोणतेही स्थळ सापडले नाही</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">कृपया वरील फिल्टर बदलून पुन्हा प्रयत्न करा.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedGender('all');
                  setSearchQuery('');
                  setActiveFilterChip('all');
                }}
                className="px-5 py-2.5 bg-[#800C1E] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
              >
                सर्व स्थळे पहा
              </button>
            </div>
          ) : (
            displayedProfiles.map((profile) => {
              const hasPhoto = profile.photos && profile.photos.length > 0;
              const photoUrl = hasPhoto ? profile.photos[0] : null;
              const isAuthorized = Boolean(isContactAuthorizedForUser && isContactAuthorizedForUser(profile.id));
              const displayName = formatProfileDisplayName(
                profile.fullName,
                currentUser,
                isAdminLoggedIn,
                isAuthorized,
                siteConfig,
                language,
                false,
                profile.id
              );
              const isVerified = Boolean(profile.verification_status === 'Approved' || profile.aadhaarVerified);

              return (
                <div
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className="px-4 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 active:bg-slate-100 dark:active:bg-slate-800 transition cursor-pointer"
                >
                  {/* Circular Avatar (Left) */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-9 h-9 stroke-1" />
                      </div>
                    )}
                  </div>

                  {/* Profile Details Stack (Right) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                        {displayName}
                      </h3>
                      {isVerified && <VerifiedBadge isVerified={true} size="sm" showLabel={false} />}
                    </div>
                    <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-tight mt-0.5">
                      {profile.age} वर्षे, {formatHeight(profile.height)}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                      {formatLocation(profile)} • {profile.education || 'सुशिक्षित'}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Grid Mode */
        <div className="p-3 grid grid-cols-2 gap-2.5">
          {displayedProfiles.map((profile) => (
            <ModernProfileCard
              key={`grid-${profile.id}`}
              profile={profile}
              onView={handleProfileClick}
            />
          ))}
        </div>
      )}

      {/* 13. LOAD MORE BUTTON */}
      {visibleCount < filteredProfiles.length && (
        <div className="p-4 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="w-full py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition active:scale-98 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            आणखी स्थळे पहा (+{filteredProfiles.length - visibleCount} अधिक)
          </button>
        </div>
      )}
    </div>
  );
};
