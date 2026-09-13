import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ModernProfileCard } from './ModernProfileCard';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import {
  Search,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  X,
  Sparkles,
  Crown,
  RotateCcw,
  Shuffle,
  Users,
  User,
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
    siteConfig,
    language,
  } = useApp();

  const [activeFilterChip, setActiveFilterChip] = useState<'all' | 'verified' | 'doctors' | 'engineers' | 'govt' | 'business'>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'bride' | 'groom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // Default to clean simple list like in screenshot!
  const [visibleCount, setVisibleCount] = useState(20);

  const isEn = language === 'en';

  // Format height nicely (e.g. 5ft 2in)
  const formatHeight = (heightStr?: string) => {
    if (!heightStr) return '5ft 2in';
    if (heightStr.includes('ft') || heightStr.includes("'")) return heightStr;
    const num = parseFloat(heightStr);
    if (!isNaN(num) && num > 100) {
      // cm to ft in
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
    
    // Deduplicate by profile ID
    const uniqueMap = new Map<string, UserProfile>();
    rawList.forEach((p) => {
      if (p && p.id && !uniqueMap.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    });
    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.filter((p) => {
      // Gender filter
      if (selectedGender !== 'all' && p.gender !== selectedGender) {
        return false;
      }

      // Search query filter
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

      // Chip filters
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

  return (
    <div className="w-full min-h-screen bg-white text-slate-800 pb-24 select-none">
      
      {/* 1. TOP BRAND APP BAR - EXACT MATCH TO REFERENCE SCREENSHOT 1 */}
      <div className="sticky top-0 z-30 bg-[#A71930] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold tracking-tight">
          {siteConfig?.logoTitle || (isEn ? 'Vanjari Jodi' : 'वंजारी जोडी')}
        </h1>

        <div className="flex items-center gap-3">
          {/* 🔍 Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="Search"
            className="p-1 text-white hover:text-amber-200 transition active:scale-95 cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* ☰ Filter Button */}
          <button
            type="button"
            onClick={() => setIsRightDrawerOpen(true)}
            aria-label="Filter"
            className="p-1 text-white hover:text-amber-200 transition active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. EXPANDABLE SEARCH BAR */}
      {isSearchOpen && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 animate-fadeIn">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाव, शहर किंवा शिक्षण शोधा..."
              autoFocus
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl text-xs font-medium text-slate-800 outline-hidden border border-slate-300 focus:border-[#A71930]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1"
          >
            बंद
          </button>
        </div>
      )}

      {/* 3. CLEAN GENDER FILTER TABS & VIEW TOGGLE */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        {/* Gender Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => handleGenderChange('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedGender === 'all'
                ? 'bg-[#A71930] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            सर्व ({profiles?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('bride')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedGender === 'bride'
                ? 'bg-[#A71930] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            👰 वधू (Brides)
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('groom')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedGender === 'groom'
                ? 'bg-[#A71930] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            🤵 वर (Grooms)
          </button>
        </div>

        {/* View Switcher (List vs Grid) */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List View"
            className={`p-1 rounded transition ${
              viewMode === 'list' ? 'bg-[#A71930] text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="साधी यादी (Simple List)"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
            className={`p-1 rounded transition ${
              viewMode === 'grid' ? 'bg-[#A71930] text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="ग्रिड व्ह्यू (Grid View)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. PROFILES STREAM: DEFAULT IS CLEAN SIMPLE LIST (EXACT MATCH TO SCREENSHOT 1) */}
      {viewMode === 'list' ? (
        <div className="divide-y divide-slate-100">
          {displayedProfiles.length === 0 ? (
            <div className="py-16 text-center space-y-2 px-4">
              <p className="text-sm font-bold text-slate-700">कोणतेही स्थळ सापडले नाही</p>
              <p className="text-xs text-slate-500">कृपया वरील फिल्टर बदलून पुन्हा प्रयत्न करा.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedGender('all');
                  setSearchQuery('');
                  setActiveFilterChip('all');
                }}
                className="px-4 py-1.5 bg-[#A71930] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
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

              return (
                <div
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className="px-4 py-3.5 flex items-center gap-4 hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer"
                >
                  {/* Circular Avatar (Left) */}
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      /* Clean silhouette placeholder matching Screenshot 1 */
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <User className="w-10 h-10 stroke-1" />
                      </div>
                    )}
                  </div>

                  {/* Profile Details Stack (Right) */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-slate-900 leading-snug truncate">
                      {displayName}
                    </h2>
                    <p className="text-[13px] text-slate-600 leading-tight mt-0.5">
                      {profile.age} yrs, {formatHeight(profile.height)},
                    </p>
                    <p className="text-[13px] text-slate-600 leading-tight mt-0.5 truncate">
                      {formatLocation(profile)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Grid Mode (Optional toggle) */
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

      {/* 5. LOAD MORE BUTTON */}
      {visibleCount < filteredProfiles.length && (
        <div className="p-4 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition active:scale-98 border border-slate-200"
          >
            आणखी स्थळे पहा (+{filteredProfiles.length - visibleCount} अधिक)
          </button>
        </div>
      )}
    </div>
  );
};
