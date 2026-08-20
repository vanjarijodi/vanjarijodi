import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, Gender } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { SmartBadgeRow } from './SmartBadgeRow';
import { DynamicGestureView } from './DynamicGestureView';
import { InstagramPhotoCarousel } from './InstagramPhotoCarousel';
import { KundaliMilanModal } from './KundaliMilanModal';
import { getProfessionBadges, getTagStyleClass } from '../utils/professionUtils';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
import { calculateMatchScore } from '../utils/matchScore';
import {
  ShieldCheck,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Lock,
  CheckCircle,
  FileText,
  Clock,
  User,
  ShieldAlert,
  Scroll,
  Users,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const ProfilesGrid: React.FC<{
  onOpenSearchFilter?: () => void;
}> = () => {
  const {
    t,
    language,
    filteredProfiles,
    shortlistedIds,
    toggleShortlist,
    sendInterest,
    interests,
    likedProfileIds,
    currentUser,
    setSelectedProfileForModal,
    setActiveChatUser,
    contactRequests,
    requestContactAuthorization,
    isContactAuthorizedForUser,
    siteConfig,
    currentView,
    checkGuestPermission,
    unlockContact,
  } = useApp();

  // Smart Initial Gender Selection:
  // If Groom is logged in -> Default to 'bride' (मुलींची प्रोफाइल)
  // If Bride is logged in -> Default to 'groom' (मुलांची प्रोफाइल)
  // Otherwise -> Default to 'all'
  const defaultTab = currentUser && !currentUser.isAdmin
    ? currentUser.gender === 'groom'
      ? 'bride'
      : currentUser.gender === 'bride'
      ? 'groom'
      : 'all'
    : 'all';

  const [activeTab, setActiveTab] = useState<'all' | 'bride' | 'groom' | 'shortlisted'>(defaultTab);
  const [displayView, setDisplayView] = useState<'grid' | 'gesture'>('grid');
  const [kundaliModalCandidate, setKundaliModalCandidate] = useState<UserProfile | null>(null);

  // Sync tab if user logs in or gender changes
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      if (currentUser.gender === 'groom') {
        setActiveTab('bride');
      } else if (currentUser.gender === 'bride') {
        setActiveTab('groom');
      }
    }
  }, [currentUser?.id, currentUser?.gender]);

  const cleanLocation = (district?: string, city?: string) => {
    if (!district && !city) return '';
    if (!district) return city || '';
    if (!city) return district;
    const dLower = district.trim().toLowerCase();
    const cLower = city.trim().toLowerCase();
    if (dLower === cLower || dLower.includes(cLower) || cLower.includes(dLower)) {
      return district;
    }
    return `${district}, ${city}`;
  };

  // On home page, check siteConfig.showProfilesOnIndexPage
  if (currentView === 'home' && siteConfig?.showProfilesOnIndexPage === false) {
    return null;
  }

  // Hide empty section if admin configured hideEmptyProfilesSection and there are 0 profiles
  if (siteConfig?.hideEmptyProfilesSection && filteredProfiles.length === 0) {
    return null;
  }

  const displayedProfiles = filteredProfiles.filter((p) => {
    if (currentUser && p.id === currentUser.id) return false;

    if (activeTab === 'bride') return p.gender === 'bride';
    if (activeTab === 'groom') return p.gender === 'groom';
    if (activeTab === 'shortlisted') return shortlistedIds.includes(p.id);
    return true; // 'all' tab shows all profiles
  });

  const totalBridesCount = filteredProfiles.filter((p) => p.gender === 'bride').length;
  const totalGroomsCount = filteredProfiles.filter((p) => p.gender === 'groom').length;
  const totalAllCount = filteredProfiles.length;

  return (
    <section id="profiles-section" className="py-16 bg-[#FFFDF9] text-slate-800 min-h-[600px] border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 pb-6 border-b border-amber-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 text-[#800C1E] text-xs font-black mb-2 border border-amber-300 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>
                {currentUser && !currentUser.isAdmin
                  ? currentUser.gender === 'groom'
                    ? '👰 आपल्यासाठी अनुरूप वधू स्थळे (Brides for You)'
                    : '🤵 आपल्यासाठी अनुरूप वर स्थळे (Grooms for You)'
                  : 'नवीन नोंदणीकृत वधू-वर बायोडाटा'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#800C1E] tracking-tight">
              {language === 'mr' ? 'वंजारी समाज वधू-वर स्थळे' : 'Vanjari Matrimonial Profiles'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium max-w-2xl">
              {language === 'mr'
                ? 'महाराष्ट्रभरातील बीड, नाशिक, अहमदनगर, छत्रपती संभाजीनगर, पुणे, मुंबई, जळगाव व इतर सर्व भागातील अस्सल बायोडाटा'
                : 'Verified matrimonial listings from all districts of Maharashtra'}
            </p>
          </div>

          {/* View Mode Switcher (Grid vs 4D Swipe) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-amber-100/80 p-1 rounded-2xl border border-amber-300">
              <button
                type="button"
                onClick={() => setDisplayView('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  displayView === 'grid'
                    ? 'bg-[#800C1E] text-amber-100 shadow'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                🎴 ग्रीड व्ह्यू
              </button>
              <button
                type="button"
                onClick={() => setDisplayView('gesture')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  displayView === 'gesture'
                    ? 'bg-[#800C1E] text-amber-100 shadow'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>✨ 4D स्वाइप व्ह्यू</span>
              </button>
            </div>
          </div>
        </div>

        {/* Smart Personalized Banner for Grooms/Brides with Quick "View All" Override */}
        {currentUser && !currentUser.isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50/50 to-amber-50 border-2 border-amber-300/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">
                {currentUser.gender === 'groom' ? '👰' : '🤵'}
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#800C1E]">
                  {currentUser.gender === 'groom'
                    ? `तुम्ही मुलगा (वर) असल्याने तुम्हाला फक्त वधू (मुलींची) प्रोफाईल्स दाखवली जात आहेत.`
                    : `तुम्ही मुलगी (वधू) असल्याने तुम्हाला फक्त वर (मुलांची) प्रोफाईल्स दाखवली जात आहेत.`}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  तुम्हाला जर सर्व प्रोफाईल्स (मुले व मुली एकत्र) पाहायच्या असतील तर समोरील बटणावर क्लिक करा.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeTab === 'all'
                  ? 'bg-[#800C1E] text-white border border-[#800C1E]'
                  : 'bg-white hover:bg-amber-100 text-[#800C1E] border-2 border-[#800C1E]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>👥 सर्व प्रोफाइल पहा ({totalAllCount})</span>
            </button>
          </div>
        )}

        {/* Segmented Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-amber-200 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('bride')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bride'
                ? 'bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow-md scale-102'
                : 'bg-slate-50 text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>👰 वधू प्रोफाईल्स (मुली)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'bride' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalBridesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('groom')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'groom'
                ? 'bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow-md scale-102'
                : 'bg-slate-50 text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>🤵 वर प्रोफाईल्स (मुले)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'groom' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalGroomsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow-md scale-102'
                : 'bg-slate-50 text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 सर्व प्रोफाईल्स एकत्र पहा</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'all' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalAllCount}
            </span>
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('shortlisted')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ml-auto ${
                activeTab === 'shortlisted'
                  ? 'bg-gradient-to-r from-rose-700 to-rose-800 text-white shadow-md scale-102'
                  : 'bg-slate-50 text-slate-700 hover:bg-rose-50 border border-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>{language === 'mr' ? 'माझे आवडते (Shortlisted)' : 'Shortlisted'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'shortlisted' ? 'bg-white text-rose-900 font-black' : 'bg-slate-200 text-slate-700'
              }`}>
                {shortlistedIds.length}
              </span>
            </button>
          )}
        </div>

        {/* Profiles Grid or 4D Dynamic Gesture View */}
        {displayedProfiles.length === 0 ? (
          <div className="text-center py-12 px-6 bg-gradient-to-b from-amber-50/50 to-white rounded-3xl border-2 border-amber-200 p-8 shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-[#800C1E] border border-amber-300">
              <User className="w-8 h-8 text-[#800C1E]" />
            </div>
            <h3 className="text-lg font-black text-[#800C1E]">
              {language === 'mr' ? 'कोणतेही जुळणारे प्रोफाईल आढळले नाहीत' : 'No matching profiles found.'}
            </h3>
            <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed">
              {language === 'mr'
                ? 'सध्या प्रणालीत या श्रेणीमध्ये कोणतेही बायोडाटा उपलब्ध नाहीत किंवा सर्च फिल्टरनुसार शोध लागला नाही. कृपया सर्व प्रोफाईल्स टॅब निवडा.'
                : 'Currently there are no profiles available in this category or matching your search filter.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 bg-[#800C1E] hover:bg-[#A71930] text-white rounded-xl font-bold text-xs shadow cursor-pointer inline-flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>सर्व प्रोफाईल्स पहा (Show All)</span>
              </button>
            </div>
          </div>
        ) : displayView === 'gesture' ? (
          <DynamicGestureView
            profiles={displayedProfiles}
            onSelectProfile={setSelectedProfileForModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProfiles.map((profile) => {
              const isShortlisted = shortlistedIds.includes(profile.id);
              const isAuthorized = isContactAuthorizedForUser(profile.id);
              const pendingReq = currentUser && contactRequests.find(
                (r) => r.requesterId === currentUser.id && r.targetProfileId === profile.id && r.status === 'pending'
              );
              const interestObj = interests.find(
                (i) => currentUser && i.fromUserId === currentUser.id && i.toUserId === profile.id
              );
              const isMutualMatch = currentUser && (
                (likedProfileIds.includes(profile.id) || !!interestObj) &&
                (interests.some((i) => i.fromUserId === profile.id && i.toUserId === currentUser.id) || (profile.shortlistedByUsers || []).includes(currentUser.id))
              );

              // Match score with logged-in user
              const matchScore = calculateMatchScore(currentUser, profile);

              // Photo blurring logic
              const isOverride = siteConfig?.adminOverrideMemberPrivacy === true;
              const isGuest = !currentUser || currentUser?.id?.startsWith('guest') || currentUser?.isGuest;
              const isPhotoBlurred = isAuthorized ? false : (
                isGuest ||
                (profile.privacy?.hidePhoto && !isOverride) ||
                siteConfig?.blurPhotosForFreeUsers === true ||
                siteConfig?.blurProfilePhotos === true ||
                (!currentUser && siteConfig?.allowPublicVisitorsToViewPhotos === false)
              );

              const blurPct = siteConfig?.photoBlurPercentage || 50;
              const blurClass = blurPct >= 100 ? 'blur-2xl scale-125' : blurPct >= 75 ? 'blur-lg scale-110' : blurPct >= 50 ? 'blur-md scale-105' : 'blur-xs scale-102';

              const photosArray = profile.photos && profile.photos.length > 0
                ? profile.photos
                : profile.photoUrl
                ? [profile.photoUrl]
                : [];

              return (
                <div
                  key={profile.id}
                  className="bg-white border-2 border-amber-200/80 hover:border-amber-400 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between relative"
                >
                  {/* Card Header Area with Instagram-Style Photo Carousel */}
                  <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-slate-900 to-black overflow-hidden border-b border-amber-200">
                    
                    {/* Gemini AI Extracted Sparkle Badge */}
                    <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-200 tracking-wide uppercase">
                      <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950 animate-pulse" />
                      <span>Gemini AI Extracted</span>
                    </div>

                    {/* Top Right Shortlist Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShortlist(profile.id);
                      }}
                      className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-amber-200 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title={isShortlisted ? 'पसंती यादीतून काढा' : 'पसंती यादीत जोडा'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isShortlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
                        }`}
                      />
                    </button>

                    {/* Instagram Photo Carousel */}
                    <InstagramPhotoCarousel
                      photos={photosArray}
                      defaultGender={profile.gender}
                      fullName={profile.fullName}
                      isBlurred={isPhotoBlurred}
                      blurClass={blurClass}
                      onPhotoClick={() => setSelectedProfileForModal(profile)}
                      aspectRatioClass="h-80 sm:h-96"
                    />

                    {/* Overlaid Float Information Panel (Bumble style) */}
                    <div 
                      onClick={() => setSelectedProfileForModal(profile)}
                      className="absolute bottom-3 inset-x-3 text-white z-10 cursor-pointer"
                    >
                      <div className="backdrop-blur-md bg-[#1A0307]/75 border border-white/20 p-3 rounded-2xl shadow-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="inline-block text-[8px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/25 px-2 py-0.5 rounded-md">
                            {language === 'en' ? 'ID:' : 'आयडी:'} {profile.id}
                          </span>
                          <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/70 border border-emerald-400/40 px-2 py-0.5 rounded-full font-mono">
                            {matchScore}% जुळवणी
                          </span>
                        </div>
                        
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 flex-wrap">
                          <span className={`drop-shadow-md ${
                            (!isAuthorized && (!currentUser || currentUser?.membership === 'free') && siteConfig?.nameDisplayModeForFreeUsers === 'blurred_name')
                              ? ((siteConfig?.nameBlurPercentage || 50) >= 75 ? 'blur-sm select-none opacity-60' : 'blur-xs select-none opacity-80')
                              : ''
                          }`}>
                            {formatProfileDisplayName(profile.fullName, currentUser, false, isAuthorized, siteConfig, language)}
                          </span>
                          <VerifiedBadge profile={profile} size="sm" />
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-amber-100 font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>
                              {language === 'en' 
                                ? transliterateMarathiToEnglish(profile.district || 'Maharashtra') 
                                : (profile.district || 'महाराष्ट्र')}
                            </span>
                          </span>
                          <span>•</span>
                          <span>{profile.age} {language === 'en' ? 'Yrs' : 'वर्षे'}</span>
                          <span>•</span>
                          <span className="text-amber-300">
                            {language === 'en' ? transliterateMarathiToEnglish(profile.subCaste) : profile.subCaste}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Body */}
                  <div className="p-4 space-y-3 text-xs text-slate-700 flex-1">
                    
                    {/* Smart Badge & Quick Info Capsule Row */}
                    <SmartBadgeRow profile={profile} showQuickInfo={true} />

                    <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-amber-100">
                      <div>
                        <span className="text-slate-500 text-[11px] block font-semibold">{t('height')}</span>
                        <span className="font-bold text-slate-800">{profile.height}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block font-semibold">{t('sub_caste')}</span>
                        <span className="font-bold text-[#800C1E]">
                          {language === 'en' ? transliterateMarathiToEnglish(profile.subCaste) : profile.subCaste}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
                        <span className="truncate font-bold">
                          {language === 'en' 
                            ? transliterateMarathiToEnglish(profile.occupation || 'Information Not Available') 
                            : (profile.occupation || 'माहिती उपलब्ध नाही')}
                        </span>
                      </div>

                      {/* Dynamic Profession & Govt Badges */}
                      {(siteConfig?.showProfessionBadgesOnCards !== false) && (() => {
                        const badges = getProfessionBadges(profile);
                        if (badges.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {badges.map((tag, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black border tracking-wide ${getTagStyleClass(tag)}`}
                              >
                                {language === 'en' ? transliterateMarathiToEnglish(tag) : tag}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Contact Phone Status */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px]">
                      {isAuthorized ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-700">
                            <span className="flex items-center gap-1">
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Contact:' : 'संपर्क:'}</span>
                            </span>
                            <span>{profile.mobile}</span>
                          </div>
                          {isMutualMatch && (
                            <p className="text-[10px] font-black text-rose-700 flex items-center gap-1 pt-0.5 border-t border-amber-200/50">
                              <span>
                                {language === 'en' 
                                  ? '💞 Contact unlocked via mutual like!' 
                                  : '💞 म्युचुअल लाईकमुळे संपर्क अनलॉक झाला आहे!'}
                              </span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#800C1E]" />
                            <span>{language === 'en' ? 'Mobile:' : 'मोबाईल नंबर:'}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-900">+91 98*****234</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mutual Like Match Badge */}
                  {isMutualMatch && (
                    <div className="mx-4 my-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-xl text-[11px] font-black flex items-center justify-between shadow border border-emerald-300 animate-pulse">
                      <span className="flex items-center gap-1">🎉 म्युचुअल मॅच! (नंबर अनलॉक)</span>
                      <span className="text-amber-300 font-mono font-extrabold">{profile.mobile}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-4 bg-amber-50/50 border-t border-amber-200 rounded-b-3xl space-y-2">
                    
                    {/* View Complete Biodata Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedProfileForModal(profile)}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-amber-100/70 text-[#800C1E] font-black text-xs border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-[#800C1E]" />
                      <span>{t('view_full_biodata')}</span>
                    </button>

                    {/* 36 Guna Kundali Matching Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setKundaliModalCandidate(profile)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-[#800C1E] font-black text-xs border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Scroll className="w-3.5 h-3.5 text-[#800C1E]" />
                      <span>📜 ३६ गुण जुळवा (Kundali Match)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Send Interest / Like Button */}
                      <button
                        type="button"
                        onClick={() => sendInterest(profile.id)}
                        disabled={!!interestObj || likedProfileIds.includes(profile.id)}
                        className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          interestObj || likedProfileIds.includes(profile.id)
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 cursor-default active:scale-100'
                            : 'bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#650817] text-amber-100 shadow-md'
                        }`}
                      >
                        {interestObj || likedProfileIds.includes(profile.id) ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-rose-700" />
                            <span>{language === 'en' ? 'Liked' : 'लाईक केले'}</span>
                          </>
                        ) : (
                          <>
                            <Heart className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                            <span>{language === 'en' ? 'Like' : 'लाईक करा'}</span>
                          </>
                        )}
                      </button>

                      {/* WhatsApp Connect Button */}
                      {isAuthorized ? (
                        <a
                          href={`https://wa.me/91${profile.mobile || '0000000000'}?text=नमस्कार, मी वंजारी जोडी (VanjariJodi) वरून आपली प्रोफाईल (ID: ${profile.id}) पाहिली. मला आपल्याबद्दल अधिक जाणून घेण्यात रस आहे.`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md active:scale-95 text-center cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-white shrink-0 fill-white/10" />
                          <span>व्हॉट्सॲप</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (checkGuestPermission('viewProfiles', 'व्हॉट्सॲप संपर्क')) {
                              unlockContact(profile.id);
                            }
                          }}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md active:scale-95 text-center cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-white shrink-0 fill-white/10" />
                          <span>व्हॉट्सॲप</span>
                        </button>
                      )}
                    </div>

                    {/* Contact Number Request (Secondary triggers) */}
                    <div className="pt-1">
                      {isAuthorized ? (
                        <button
                          type="button"
                          onClick={() => setActiveChatUser(profile)}
                          className="w-full py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center gap-1 border border-emerald-200 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>ॲप चॅट सुरू करा</span>
                        </button>
                      ) : pendingReq ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-extrabold flex items-center justify-center gap-1 border border-amber-200 cursor-default"
                        >
                          <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                          <span>मोबाईल नंबर विनंती प्रलंबित</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requestContactAuthorization(profile.id)}
                          className="w-full py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#800C1E] border border-amber-200 text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <PhoneCall className="w-3 h-3 text-[#800C1E]" />
                          <span>मोबाईल नंबरसाठी थेट विनंती पाठवा</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 36 Guna Kundali Milan Modal */}
      {kundaliModalCandidate && (
        <KundaliMilanModal
          isOpen={!!kundaliModalCandidate}
          onClose={() => setKundaliModalCandidate(null)}
          candidateProfile={kundaliModalCandidate}
        />
      )}
    </section>
  );
};
