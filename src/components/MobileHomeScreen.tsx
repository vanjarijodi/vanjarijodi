import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ModernProfileCard } from './ModernProfileCard';
import {
  Sparkles,
  FileText,
  Crown,
  MessageCircle,
  Send,
  Shuffle,
  RotateCcw,
  Users,
} from 'lucide-react';
import { UserProfile } from '../types';

export const MobileHomeScreen: React.FC = () => {
  const {
    profiles,
    currentUser,
    setSearchFilters,
    setSelectedProfileForModal,
    setIsRegisterOpen,
    setIsKundaliModalOpen,
    setIsBioDataMakerOpen,
    setIsPaymentOpen,
    siteConfig,
  } = useApp();

  const [activeFilterChip, setActiveFilterChip] = useState('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'bride' | 'groom'>('all');
  const [shuffleKey, setShuffleKey] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Track viewed profile IDs in localStorage
  const [viewedProfileIds, setViewedProfileIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vanjari_viewed_profile_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Mark profile as viewed when opened
  const handleProfileView = (profile: UserProfile) => {
    if (profile?.id && !viewedProfileIds.includes(profile.id)) {
      const updated = [...viewedProfileIds, profile.id];
      setViewedProfileIds(updated);
      try {
        localStorage.setItem('vanjari_viewed_profile_ids', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save viewed profiles', err);
      }
    }
    setSelectedProfileForModal(profile);
  };

  // Reset viewed history
  const handleResetViewed = () => {
    setViewedProfileIds([]);
    try {
      localStorage.removeItem('vanjari_viewed_profile_ids');
    } catch {}
    setShuffleKey((prev) => prev + 1);
  };

  // Trigger Random Shuffle
  const handleShuffle = () => {
    setIsShuffling(true);
    setShuffleKey((prev) => prev + 1);
    setTimeout(() => {
      setIsShuffling(false);
    }, 400);
  };

  // 1. Filter Profiles by gender and category, completely deduplicated
  const filteredProfiles = useMemo(() => {
    const rawList = profiles || [];
    
    // Deduplicate by profile ID
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
        return Boolean(p.aadhaarVerified || p.isVerified);
      }
      return true;
    });
  }, [profiles, selectedGender, activeFilterChip]);

  // 2. Smart Ordering & Random Shuffle Algorithm:
  // Unviewed profiles are randomized and shown FIRST.
  // Already viewed profiles are placed AFTER unviewed ones, also randomized.
  const shuffledProfiles = useMemo(() => {
    // Deterministic pseudo-random shuffle function based on shuffleKey
    const shuffleArray = (arr: UserProfile[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const unviewed: UserProfile[] = [];
    const viewed: UserProfile[] = [];

    filteredProfiles.forEach((p) => {
      if (viewedProfileIds.includes(p.id)) {
        viewed.push(p);
      } else {
        unviewed.push(p);
      }
    });

    const shuffledUnviewed = shuffleArray(unviewed);
    const shuffledViewed = shuffleArray(viewed);

    // Unviewed profiles come first, followed by viewed profiles
    return [...shuffledUnviewed, ...shuffledViewed];
  }, [filteredProfiles, viewedProfileIds, shuffleKey]);

  const displayedProfiles = shuffledProfiles.slice(0, visibleCount);

  const handleGenderChange = (gender: 'all' | 'bride' | 'groom') => {
    setSelectedGender(gender);
    setVisibleCount(12);
    setSearchFilters((prev: any) => ({
      ...prev,
      gender: gender,
    }));
  };

  const handleChipClick = (chipId: string) => {
    setActiveFilterChip(chipId);
    setVisibleCount(12);
    if (chipId === 'all') {
      setSearchFilters((prev: any) => ({ ...prev, minEducation: '', occupationType: '', verifiedOnly: false }));
    } else if (chipId === 'doctors') {
      setSearchFilters((prev: any) => ({ ...prev, minEducation: 'MBBS/MD/BAMS/BHMS' }));
    } else if (chipId === 'engineers') {
      setSearchFilters((prev: any) => ({ ...prev, minEducation: 'BE/BTech/MCA' }));
    } else if (chipId === 'govt') {
      setSearchFilters((prev: any) => ({ ...prev, occupationType: 'Government' }));
    } else if (chipId === 'business') {
      setSearchFilters((prev: any) => ({ ...prev, occupationType: 'Business' }));
    } else if (chipId === 'verified') {
      setSearchFilters((prev: any) => ({ ...prev, verifiedOnly: true }));
    }
  };

  return (
    <div className="w-full space-y-3.5 px-3 pt-1 pb-10 text-slate-800">
      
      {/* 1. TOP SLEEK GENDER TABS & QUICK FILTER PILLS */}
      <div className="space-y-2 pt-0.5">
        {/* Gender Segmented Control */}
        <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => handleGenderChange('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedGender === 'all'
                ? 'bg-[#800C1E] text-white shadow-xs scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>👥 सर्व स्थळे</span>
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('bride')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedGender === 'bride'
                ? 'bg-gradient-to-r from-rose-600 to-[#800C1E] text-white shadow-xs scale-[1.01]'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/50'
            }`}
          >
            <span>👰 वधू (Brides)</span>
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('groom')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedGender === 'groom'
                ? 'bg-gradient-to-r from-sky-700 to-[#0F4C81] text-white shadow-xs scale-[1.01]'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/50'
            }`}
          >
            <span>🤵 वर (Grooms)</span>
          </button>
        </div>

        {/* Quick Category Chips Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar scrollbar-none">
          {[
            { id: 'all', label: 'सर्व' },
            { id: 'verified', label: '🛡️ आधार सत्यापित' },
            { id: 'doctors', label: '🩺 डॉक्टर / मेडिकल' },
            { id: 'engineers', label: '💻 इंजिनिअर / IT' },
            { id: 'govt', label: '🏛️ शासकीय सेवा' },
            { id: 'business', label: '💼 व्यवसाय' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer shrink-0 min-h-[34px] border ${
                activeFilterChip === chip.id
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. UNIFIED SINGLE MATCH FEED WITH RANDOM SHUFFLE */}
      <div className="space-y-2.5 pt-1">
        {/* Stream Header & Shuffle Button */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <span>सर्व स्थळे</span>
              <span className="text-[10px] bg-amber-100 text-[#800C1E] font-black px-2 py-0.5 rounded-full border border-amber-300">
                {shuffledProfiles.length} उपलब्ध
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {viewedProfileIds.length > 0 && (
              <button
                type="button"
                onClick={handleResetViewed}
                title="पाहिलेली स्थळे रीसेट करा"
                className="text-[10px] text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 font-bold active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>रीसेट ({viewedProfileIds.length})</span>
              </button>
            )}

            {/* 🔀 Interactive Shuffle Matches Button */}
            <button
              type="button"
              onClick={handleShuffle}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs border border-amber-300 transition-all active:scale-95 cursor-pointer"
              title="नवीन स्थळे रँडम शेफल करा"
            >
              <Shuffle className={`w-3.5 h-3.5 text-slate-950 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>शेफल करा</span>
            </button>
          </div>
        </div>

        {/* Profiles Grid - 100% Unique / Deduplicated */}
        {displayedProfiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {displayedProfiles.map((profile) => (
              <ModernProfileCard
                key={`unified-${profile.id}`}
                profile={profile}
                onView={handleProfileView}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-black text-slate-700">कोणतेही स्थळ सापडले नाही</p>
            <p className="text-xs text-slate-500">कृपया वरील फिल्टर बदलून पुन्हा प्रयत्न करा.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedGender('all');
                setActiveFilterChip('all');
                handleChipClick('all');
              }}
              className="px-4 py-1.5 bg-[#800C1E] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
            >
              सर्व स्थळे पहा
            </button>
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < shuffledProfiles.length && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition active:scale-98 border border-slate-200 flex items-center justify-center gap-1.5"
            >
              <span>आणखी स्थळे पहा (+{shuffledProfiles.length - visibleCount} अधिक)</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. COMPACT QUICK SERVICES & TOOLS (Proportional, Non-Intrusive) */}
      <div className="bg-white border border-amber-200 rounded-2xl p-3 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-[#800C1E] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>त्वरित सेवा व साधने</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">वंजारी जोडी मॅट्रिमोनी</span>
        </div>

        <div className={`grid ${currentUser ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
          {/* Kundali Milan Button */}
          <button
            type="button"
            onClick={() => setIsKundaliModalOpen(true)}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left flex flex-col justify-between gap-1 transition active:scale-95 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-[9px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">वैदिक</span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">३६ गुण कुंडली</p>
              <p className="text-[10px] text-amber-700 leading-tight">गुण जुळवा</p>
            </div>
          </button>

          {/* VIP Membership */}
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                setIsPaymentOpen(true);
              } else {
                setIsRegisterOpen(true);
              }
            }}
            className="p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-left flex flex-col justify-between gap-1 transition active:scale-95 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="text-[9px] font-bold text-orange-800 bg-orange-200/70 px-1.5 py-0.5 rounded">VIP</span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 leading-tight">सभासद योजना</p>
              <p className="text-[10px] text-orange-700 leading-tight">योजना पहा</p>
            </div>
          </button>

          {/* Guest Only: Free Biodata Maker */}
          {!currentUser && (
            <button
              type="button"
              onClick={() => setIsBioDataMakerOpen(true)}
              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left flex flex-col justify-between gap-1 transition active:scale-95 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <FileText className="w-4 h-4 text-[#800C1E]" />
                <span className="text-[9px] font-bold text-rose-800 bg-rose-200/70 px-1.5 py-0.5 rounded">PDF</span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 leading-tight">बायोडाटा मेकर</p>
                <p className="text-[10px] text-rose-700 leading-tight">PDF बनवा</p>
              </div>
            </button>
          )}
        </div>

        {/* Telegram Chat Help Bar */}
        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <MessageCircle className="w-3.5 h-3.5 text-[#800C1E]" />
            <span>मदत हवी आहे? टेलिग्राम सहाय्यता</span>
          </div>
          <a
            href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-[#800C1E] hover:bg-[#A71930] text-amber-200 font-bold rounded-lg text-[10px] flex items-center gap-1 transition active:scale-95"
          >
            <Send className="w-2.5 h-2.5" />
            <span>चॅट</span>
          </a>
        </div>
      </div>

    </div>
  );
};
