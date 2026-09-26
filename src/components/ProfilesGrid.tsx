import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, Gender } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { SmartBadgeRow } from './SmartBadgeRow';
import { InstagramPhotoCarousel } from './InstagramPhotoCarousel';
import { KundaliMilanModal } from './KundaliMilanModal';
import { FullMobileInstaDeck } from './FullMobileInstaDeck';
import { ProfileCompareModal } from './ProfileCompareModal';
import { AdminEditProfileModal } from './AdminEditProfileModal';
import { getProfessionBadges, getTagStyleClass } from '../utils/professionUtils';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
import { calculateMatchScore } from '../utils/matchScore';
import { getPhotoAccessStatus } from '../utils/photoAccess';
import {
  ShieldCheck,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  PhoneCall,
  MessageCircle,
  Send,
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
  Smartphone,
  LayoutGrid,
  Calendar,
  Ruler,
  Scale,
  List,
  Home,
  Edit3
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
    markProfileAsViewed,
    viewedProfileIds,
    resetViewedProfiles,
    setActiveChatUser,
    contactRequests,
    requestContactAuthorization,
    isContactAuthorizedForUser,
    siteConfig,
    currentView,
    setCurrentView,
    checkGuestPermission,
    unlockContact,
    profiles,
    setIsLoginOpen,
    setLoginModalMode,
    setIsRegisterOpen,
    setIsPaymentOpen,
    isProfilePlanExpired,
    isAdminLoggedIn,
    updateProfileDirect,
    addNotification,
  } = useApp();

  const isUserAdmin = Boolean(isAdminLoggedIn || currentUser?.isAdmin || currentUser?.id === 'admin');

  // Smart Initial Gender Selection:
  const defaultTab = currentUser && !currentUser.isAdmin
    ? currentUser.gender === 'groom'
      ? 'bride'
      : currentUser.gender === 'bride'
      ? 'groom'
      : 'all'
    : 'all';

  const [activeTab, setActiveTab] = useState<'all' | 'bride' | 'groom' | 'shortlisted'>(defaultTab);
  const [kundaliModalCandidate, setKundaliModalCandidate] = useState<UserProfile | null>(null);
  const [adminEditingProfile, setAdminEditingProfile] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'reels'>('grid');
  const [comparedProfileIds, setComparedProfileIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(16);

  // Reset pagination when active tab or filtered profiles change
  useEffect(() => {
    setVisibleCount(16);
  }, [activeTab, filteredProfiles.length]);

  const toggleCompare = (id: string) => {
    setComparedProfileIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      }
      if (prev.length >= 3) {
        if (addNotification) {
          addNotification({
            type: 'warning',
            title: 'तुलना मर्यादा',
            message: 'तुम्ही एकावेळी जास्तीत जास्त ३ प्रोफाईल्सची तुलना करू शकता.',
          });
        }
        return prev;
      }
      return [...prev, id];
    });
  };

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

  const handleOpenProfileModal = (p: UserProfile) => {
    if (p && p.id) {
      markProfileAsViewed(p.id);
    }
    setSelectedProfileForModal(p);
  };

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

  // If on home page and user is not logged in, do not render profiles grid on home
  if (currentView === 'home' && !currentUser) {
    return null;
  }

  // On home page, check siteConfig.showProfilesOnIndexPage
  if (currentView === 'home' && siteConfig?.showProfilesOnIndexPage === false) {
    return null;
  }

  // Hide empty section if admin configured hideEmptyProfilesSection and there are 0 profiles
  if (siteConfig?.hideEmptyProfilesSection && filteredProfiles.length === 0) {
    return null;
  }

  // If user is not logged in when viewing profiles page directly, show strict login gate
  if (!currentUser) {
    return (
      <section id="profiles-section" className="py-20 bg-[#FFFDF9] text-slate-800 min-h-[600px] flex items-center justify-center border-b border-amber-200">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#800C1E] text-amber-300 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#800C1E] tracking-tight">
            {language === 'mr' ? '🔒 बायोडाटा पाहण्यासाठी लॉगिन आवश्यक आहे' : 'Login Required to View BioDatas'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
            {language === 'mr'
              ? 'वंजारी समाजातील उच्चशिक्षित व सुसंस्कारी वधू-वरांचे बायोडाटा, शिक्षण, नोकरी, छायाचित्रे व संपर्क माहिती पाहण्यासाठी कृपया प्रथम मोफत नोंदणी करा किंवा मोबाईल नंबरने लॉगिन करा.'
              : 'To view educated and verified Vanjari candidate biodatas, photos and contact details, please log in with your mobile number or create a free account.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-3">
            <button
              type="button"
              onClick={() => {
                setLoginModalMode('member_otp');
                setIsLoginOpen(true);
              }}
              className="py-3 px-4 rounded-2xl bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border border-amber-400/40"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>{language === 'mr' ? '📱 मोबाईल / OTP ने लॉगिन' : 'Mobile OTP Login'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border border-amber-500"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{language === 'mr' ? '✨ नवीन मोफत नोंदणी' : 'New Free Registration'}</span>
            </button>
          </div>
        </div>
      </section>
    );
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
    <section id="profiles-section" className="py-2.5 sm:py-5 bg-[#FFFDF9] text-slate-800 min-h-[500px]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Compact Section Header */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base sm:text-2xl font-black text-[#800C1E] tracking-tight">
                {language === 'mr' ? 'वंजारी समाज वधू-वर स्थळे' : 'Vanjari Matrimonial Profiles'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#800C1E] text-[10px] font-black border border-amber-300">
                {currentUser && !currentUser.isAdmin
                  ? currentUser.gender === 'groom'
                    ? '👰 वधू स्थळे'
                    : '🤵 वर स्थळे'
                  : 'सर्व स्थळे'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] text-xs font-black border border-amber-300 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="मुख्यपृष्ठावर परत जा"
            >
              <Home className="w-3.5 h-3.5 text-[#800C1E]" />
              <span className="hidden sm:inline">{language === 'mr' ? 'मुख्यपृष्ठ' : 'Home'}</span>
            </button>
          </div>
        </div>

        {/* Festive Free Mutual Like Unlock Banner */}
        {siteConfig?.isFestiveFreeModeEnabled && (
          <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xs flex items-center justify-between gap-2 border border-emerald-300 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-base shrink-0">🎊</span>
              <p className="text-[11px] text-emerald-100 font-bold truncate">
                🎉 <strong className="text-amber-200">{siteConfig.festiveFreeModeTitle || 'सण-उत्सव विशेष:'}</strong> दोघांनी एकमेकांना लाईक केल्यावर मोफत संपर्क!
              </p>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded-lg bg-white text-emerald-900 font-black text-[10px]">
              १००% FREE
            </span>
          </div>
        )}

        {/* Smart Loop Feed Status Banner */}
        {viewedProfileIds.length > 0 && (
          <div className="mb-2 p-2 bg-gradient-to-r from-amber-500/10 via-amber-100 to-amber-500/10 border border-amber-300 rounded-xl flex items-center justify-between gap-2 text-xs font-bold text-amber-950">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
              <span className="truncate text-[11px]">
                {viewedProfileIds.length >= displayedProfiles.length && displayedProfiles.length > 0
                  ? '🎉 सर्व उपलब्ध बायोडाटा पाहिले आहेत! (पुन्हा दाखवले जात आहेत)'
                  : `स्मार्ट फीड: ${viewedProfileIds.length} पाहिलेले बायोडाटा शेवटी ठेवले आहेत.`}
              </span>
            </div>
            <button
              type="button"
              onClick={resetViewedProfiles}
              className="px-2 py-0.5 rounded-lg bg-white hover:bg-amber-200 text-[#800C1E] border border-amber-300 font-extrabold text-[10px] transition active:scale-95 cursor-pointer shrink-0"
            >
              🔄 रीसेट
            </button>
          </div>
        )}

        {/* Modern App-Style Horizontal Filter Chips (Takes Only 36px Height!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('bride')}
            className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bride'
                ? 'bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>👰 वधू (मुली)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'bride' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalBridesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('groom')}
            className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'groom'
                ? 'bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>🤵 वर (मुले)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'groom' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalGroomsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>सर्व</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'all' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalAllCount}
            </span>
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('shortlisted')}
              className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shortlisted'
                  ? 'bg-gradient-to-r from-rose-700 to-rose-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-rose-50 border border-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>आवडते</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'shortlisted' ? 'bg-white text-rose-900' : 'bg-slate-100 text-slate-600'
              }`}>
                {shortlistedIds.length}
              </span>
            </button>
          )}
        </div>

        {/* Pending Admin Approval Announcement Banner for Newly Registered Unapproved User */}
        {currentUser && currentUser.isApproved === false && !currentUser.isAdmin && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-amber-500/15 border-2 border-amber-400 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-400 text-amber-950 rounded-2xl text-2xl font-black shrink-0 shadow-xs">
                ⏳
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black text-[#A71930] flex items-center gap-2">
                  <span>आपले प्रोफाईल ॲडमिन मंजुरीसाठी प्रलंबित आहे (Pending Admin Approval)</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded-md text-[10px] font-black border border-amber-300">
                    लॉगिन सक्रिय
                  </span>
                </h4>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  आपले लॉगिन यशस्वी झाले आहे! सुरक्षिततेच्या नियमांनुसार ॲडमिनने आपले प्रोफाईल मंजूर (Approve) करेपर्यंत आपल्याला इतर सदस्यांची केवळ <strong>जिल्हा, शिक्षण, सरकारी नोकरी/व्यवसाय</strong> ही माहिती दिसेल. ॲडमिन मंजुरी मिळताच <strong>सर्व फोटो, नावे, बायोडाटा व मोबाईल नंबर</strong> पूर्णपणे अनलॉक होतील.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3.5 py-2 rounded-xl bg-amber-200/90 text-amber-950 border border-amber-400 text-xs font-black shadow-xs">
                🔒 मर्यादित व्ह्यू सक्रिय
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Display: Full-Screen Reels Deck vs Grid */}
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
        ) : viewMode === 'reels' ? (
          <FullMobileInstaDeck
            profiles={displayedProfiles}
            onSelectProfile={handleOpenProfileModal}
            onOpenKundali={setKundaliModalCandidate}
          />
        ) : viewMode === 'compact' ? (
          /* Compact Table / Row View */
          <div className="space-y-3">
            {displayedProfiles.slice(0, visibleCount).map((profile) => {
              const isShortlisted = shortlistedIds.includes(profile.id);
              const isLiked = likedProfileIds.includes(profile.id);
              const isAuthorized = isContactAuthorizedForUser(profile.id);
              const interestObj = interests.find((i) => currentUser && i.fromUserId === currentUser.id && i.toUserId === profile.id);
              const isMutualMatch = Boolean(
                currentUser &&
                (isLiked || !!interestObj) &&
                (interests.some((i) => i.fromUserId === profile.id && i.toUserId === currentUser.id) || (profile.shortlistedByUsers || []).includes(currentUser.id))
              );
              const displayName = formatProfileDisplayName(
                profile.fullName,
                currentUser,
                false,
                isAuthorized || isMutualMatch,
                siteConfig,
                language,
                isMutualMatch,
                profile.id
              );
              const mainPhoto = profile.photos?.[0] || profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
              const photoAccess = getPhotoAccessStatus({
                currentUser,
                targetProfile: profile,
                isProfilePlanExpired,
                isMutualMatch: Boolean(isMutualMatch),
                siteConfig,
              });
              const isListPhotoBlurred = photoAccess.isBlurred;

              return (
                <div
                  key={profile.id}
                  className="bg-white border border-amber-200 rounded-2xl p-3 shadow-xs hover:border-[#800C1E] transition flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-300 shrink-0 cursor-pointer"
                      onClick={() => handleOpenProfileModal(profile)}
                    >
                      {photoAccess.isCompletelyHidden ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-amber-300 drop-shadow" />
                        </div>
                      ) : (
                        <>
                          <img
                            src={mainPhoto}
                            alt={displayName}
                            className={`w-full h-full object-cover ${isListPhotoBlurred ? 'filter blur-md scale-110 opacity-70' : ''}`}
                          />
                          {isListPhotoBlurred && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                              <Lock className="w-5 h-5 text-amber-300 drop-shadow" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => handleOpenProfileModal(profile)}
                          className="font-black text-slate-900 text-sm hover:text-[#800C1E] cursor-pointer"
                        >
                          {displayName}
                        </h4>
                        <VerifiedBadge profile={profile} size="sm" />
                      </div>
                      <div className="text-xs text-slate-600 font-bold flex flex-wrap gap-2 mt-0.5">
                        <span>{profile.age} वर्षे</span>
                        <span>•</span>
                        <span>{profile.height}</span>
                        <span>•</span>
                        <span className="text-[#800C1E]">{profile.district || profile.city}</span>
                        <span>•</span>
                        <span className="text-emerald-700">{profile.education}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleCompare(profile.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        comparedProfileIds.includes(profile.id)
                          ? 'bg-[#800C1E] text-amber-200 border-amber-400'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                      }`}
                      title="तुलना करा"
                    >
                      <Scale className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setKundaliModalCandidate(profile)}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-black text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Scroll className="w-3.5 h-3.5" />
                      <span>३६ गुण</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => sendInterest(profile.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                        isLiked
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#800C1E] hover:bg-[#A71930] text-amber-100'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{isLiked ? 'पसंत' : 'पसंती'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenProfileModal(profile)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
                    >
                      बायोडाटा
                    </button>

                    {/* Admin Direct Edit Button in Compact View */}
                    {isUserAdmin && (
                      <button
                        type="button"
                        onClick={() => setAdminEditingProfile(profile)}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#A71930] hover:from-amber-600 hover:to-[#800C1E] text-white font-black text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                        title="✏️ ॲडमिन: प्रोफाईल एडिट करा"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-200" />
                        <span>एडिट</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
            {displayedProfiles.slice(0, visibleCount).map((profile) => {
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

              const isUnapprovedUser = Boolean(currentUser && currentUser.isApproved === false && !currentUser.isAdmin);

              // Match score with logged-in user
              const matchScore = calculateMatchScore(currentUser, profile);

              // Strict Photo Access Verification (Paid members only)
              const photoAccess = getPhotoAccessStatus({
                currentUser,
                targetProfile: profile,
                isProfilePlanExpired,
                isMutualMatch: Boolean(isMutualMatch),
                siteConfig,
              });
              const isPhotoBlurred = photoAccess.isBlurred;

              const blurPct = siteConfig?.photoBlurPercentage || 80;
              const blurClass = blurPct >= 100 ? 'blur-2xl scale-125' : blurPct >= 75 ? 'blur-lg scale-110' : 'blur-md scale-105';

              const photosArray = profile.photos && profile.photos.length > 0
                ? profile.photos
                : profile.photoUrl
                ? [profile.photoUrl]
                : [];

              return (
                <div
                  key={profile.id}
                  className="bg-white border border-slate-200/80 hover:border-amber-400/80 rounded-[16px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group flex flex-col justify-between relative ring-1 ring-slate-900/5"
                >
                  {/* Card Header Area with Instagram-Style Photo Carousel */}
                  <div className="relative w-full aspect-[4/5] sm:h-92 bg-gradient-to-b from-slate-900 to-black overflow-hidden border-b border-slate-100">
                    
                    {/* Gemini AI Extracted Sparkle Badge */}
                    <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-200 tracking-wide uppercase">
                      <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950 animate-pulse" />
                      <span>Gemini AI Extracted</span>
                    </div>

                    {/* Top Right Action Pill: Shortlist & Compare */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(profile.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md shadow-md border transition-all cursor-pointer ${
                          comparedProfileIds.includes(profile.id)
                            ? 'bg-[#800C1E] text-amber-300 border-amber-400 scale-105'
                            : 'bg-white/95 text-slate-700 border-slate-200/80 hover:scale-105'
                        }`}
                        title={comparedProfileIds.includes(profile.id) ? 'तुलनेतून काढा' : 'तुलनेसाठी निवडा'}
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist(profile.id);
                        }}
                        className="p-2 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        title={isShortlisted ? 'पसंती यादीतून काढा' : 'पसंती यादीत जोडा'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            isShortlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Instagram Photo Carousel */}
                    <InstagramPhotoCarousel
                      photos={photosArray}
                      defaultGender={profile.gender}
                      fullName={formatProfileDisplayName(profile.fullName, currentUser, false, isAuthorized || Boolean(isMutualMatch), siteConfig, language, Boolean(isMutualMatch), profile.id)}
                      isBlurred={isPhotoBlurred}
                      isCompletelyHidden={photoAccess.isCompletelyHidden}
                      blurClass={blurClass}
                      lockMessage={photoAccess.message}
                      onLockClick={() => {
                        if (!currentUser || currentUser.isGuest) {
                          setLoginModalMode('member_otp');
                          setIsLoginOpen(true);
                        } else {
                          setIsPaymentOpen(true);
                        }
                      }}
                      onPhotoClick={() => handleOpenProfileModal(profile)}
                      aspectRatioClass="w-full h-full"
                    />

                    {/* Overlaid Float Information Panel (Bumble style) */}
                    <div 
                      onClick={() => handleOpenProfileModal(profile)}
                      className="absolute bottom-3 inset-x-3 text-white z-10 cursor-pointer"
                    >
                      <div className="backdrop-blur-md bg-[#1A0307]/80 border border-white/20 p-3 rounded-[14px] shadow-xl space-y-1 ring-1 ring-black/20">
                        <div className="flex items-center justify-between">
                          <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/25 px-2 py-0.5 rounded-md border border-amber-400/30">
                            {language === 'en' ? 'ID:' : 'आयडी:'} {profile.id}
                          </span>
                          <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-mono">
                            {matchScore}% जुळवणी
                          </span>
                        </div>
                        
                        <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 flex-wrap">
                          <span className={`drop-shadow-md ${
                            (!isAuthorized && (!currentUser || currentUser?.membership === 'free') && siteConfig?.nameDisplayModeForFreeUsers === 'blurred_name')
                              ? ((siteConfig?.nameBlurPercentage || 50) >= 75 ? 'blur-sm select-none opacity-60' : 'blur-xs select-none opacity-80')
                              : ''
                          }`}>
                            {formatProfileDisplayName(profile.fullName, currentUser, false, isAuthorized || Boolean(isMutualMatch), siteConfig, language, Boolean(isMutualMatch), profile.id)}
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
                          <span className="text-amber-400/60">•</span>
                          <span>{profile.age} {language === 'en' ? 'Yrs' : 'वर्षे'}</span>
                          <span className="text-amber-400/60">•</span>
                          <span className="text-amber-300">
                            {language === 'en' ? transliterateMarathiToEnglish(profile.subCaste) : profile.subCaste}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Body: Clean Structured 2-Column Compact Layout with Minimal Vector Icons */}
                  <div className="p-3.5 space-y-2.5 text-xs text-slate-700 flex-1">
                    
                    {/* Smart Badge & Quick Info Capsule Row */}
                    <SmartBadgeRow profile={profile} showQuickInfo={true} />

                    {/* Structured 2-Column Info Grid */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/80 rounded-[12px] border border-slate-100">
                      {/* Age & Height */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-medium leading-none">वय</span>
                          <span className="font-bold text-slate-800 text-xs">{profile.age} वर्षे</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Ruler className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-medium leading-none">उंची</span>
                          <span className="font-bold text-slate-800 text-xs">{profile.height || '-'}</span>
                        </div>
                      </div>

                      {/* Location & Sub-caste */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-medium leading-none">जिल्हा</span>
                          <span className="font-bold text-slate-800 text-xs truncate block">
                            {language === 'en'
                              ? transliterateMarathiToEnglish(profile.district || 'Maharashtra')
                              : (profile.district || 'महाराष्ट्र')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block font-medium leading-none">शाखा</span>
                          <span className="font-bold text-[#800C1E] text-xs truncate block">
                            {language === 'en' ? transliterateMarathiToEnglish(profile.subCaste) : (profile.subCaste || 'वंजारी')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Education & Profession Grid Rows */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50/50 rounded-[10px] border border-amber-200/60 text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                        <span className="truncate font-semibold text-xs">
                          {language === 'en'
                            ? transliterateMarathiToEnglish(profile.education || 'Graduate')
                            : (profile.education || 'पदवीधर')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50/70 rounded-[10px] border border-slate-200/60 text-slate-700">
                        <Briefcase className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                        <span className="truncate font-semibold text-xs">
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
                          <div className="flex flex-wrap gap-1 pt-0.5">
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
                    <div className="p-2 rounded-[10px] bg-amber-50/70 border border-amber-200/80 text-[11px]">
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
                      ) : isUnapprovedUser ? (
                        <div className="flex items-center justify-between text-amber-900 font-bold">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>{language === 'en' ? 'Mobile:' : 'मोबाईल:'}</span>
                          </span>
                          <span className="text-[10px] text-amber-900 font-extrabold bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300">
                            🔒 ॲडमिन मंजुरीनंतर दिसेल
                          </span>
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
                    <div className="mx-3.5 my-1 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-[12px] text-[11px] font-black flex items-center justify-between shadow border border-emerald-300 animate-pulse">
                      <span className="flex items-center gap-1">🎉 म्युचुअल मॅच! (नंबर अनलॉक)</span>
                      <span className="text-amber-300 font-mono font-extrabold">{profile.mobile}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-3 bg-amber-50/50 border-t border-amber-200/80 rounded-b-[16px] space-y-2">
                    
                    {/* View Complete Biodata Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenProfileModal(profile)}
                      className="w-full py-2.5 rounded-[12px] bg-white hover:bg-amber-100/70 text-[#800C1E] font-black text-xs border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-[#800C1E]" />
                      <span>{t('view_full_biodata')}</span>
                    </button>

                    {/* Admin Direct Edit Button in Grid View */}
                    {isUserAdmin && (
                      <button
                        type="button"
                        onClick={() => setAdminEditingProfile(profile)}
                        className="w-full py-2 rounded-[12px] bg-gradient-to-r from-amber-500 to-[#A71930] hover:from-amber-600 hover:to-[#800C1E] text-white font-black text-xs border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-200" />
                        <span>✏️ ॲडमिन: प्रोफाईल एडिट करा</span>
                      </button>
                    )}

                    {/* 36 Guna Kundali Matching Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setKundaliModalCandidate(profile)}
                      className="w-full py-2 rounded-[12px] bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-[#800C1E] font-black text-xs border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
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
                        className={`py-2 rounded-[12px] text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          interestObj || likedProfileIds.includes(profile.id)
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 cursor-default active:scale-100'
                            : 'bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#650817] text-amber-100 shadow-sm'
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

                      {/* Telegram Connect Button */}
                      <a
                        href={`https://t.me/${profile.telegramUsername || siteConfig?.telegramUsername || 'Primemultiservice'}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 rounded-[12px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-sm active:scale-95 text-center cursor-pointer"
                        title="टेलिग्राम चॅट"
                      >
                        <Send className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>टेलिग्राम चॅट</span>
                      </a>
                    </div>

                    {/* Contact Request (Secondary triggers) */}
                    <div className="pt-0.5">
                      {isAuthorized ? (
                        <button
                          type="button"
                          onClick={() => setActiveChatUser(profile)}
                          className="w-full py-1.5 rounded-[10px] bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center gap-1 border border-emerald-200 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>ॲप चॅट सुरू करा</span>
                        </button>
                      ) : pendingReq ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-1.5 rounded-[10px] bg-amber-50 text-amber-700 text-[10px] font-extrabold flex items-center justify-center gap-1 border border-amber-200 cursor-default"
                        >
                          <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                          <span>संपर्क विनंती प्रलंबित</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requestContactAuthorization(profile.id)}
                          className="w-full py-1.5 rounded-[10px] bg-amber-50 hover:bg-amber-100 text-[#800C1E] border border-amber-200 text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Send className="w-3 h-3 text-[#800C1E]" />
                          <span>थेट संपर्क विनंती पाठवा</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Pagination / Load More Profiles Bar */}
        {displayedProfiles.length > 16 && (
          <div className="mt-10 pt-6 border-t border-amber-200/80 flex flex-col items-center justify-center space-y-3">
            <div className="text-xs text-slate-600 font-bold flex items-center gap-2">
              <span>एकूण {displayedProfiles.length} पैकी {Math.min(visibleCount, displayedProfiles.length)} बायोडाटा दाखवत आहे</span>
              <div className="w-24 bg-amber-100 rounded-full h-2 overflow-hidden border border-amber-300">
                <div
                  className="bg-[#800C1E] h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((Math.min(visibleCount, displayedProfiles.length) / displayedProfiles.length) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {visibleCount < displayedProfiles.length ? (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 16)}
                className="px-6 py-3 rounded-2xl bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-400/40"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>आणखी बायोडाटा पाहा (Load More +16)</span>
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>सर्व {displayedProfiles.length} उपलब्ध बायोडाटा लोड झाले आहेत.</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Floating Side-by-Side Profile Compare Bar */}
      {comparedProfileIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white border-2 border-amber-400 rounded-full px-5 py-3 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-black text-amber-100">
              {comparedProfileIds.length} स्थळे तुलना करण्यासाठी निवडली आहेत
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow hover:scale-105 transition cursor-pointer"
            >
              ⚔️ आमने-सामने तुलना करा
            </button>

            <button
              type="button"
              onClick={() => setComparedProfileIds([])}
              className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs text-white font-bold transition cursor-pointer"
            >
              रीसेट
            </button>
          </div>
        </div>
      )}

      {/* 36 Guna Kundali Milan Modal */}
      {kundaliModalCandidate && (
        <KundaliMilanModal
          isOpen={!!kundaliModalCandidate}
          onClose={() => setKundaliModalCandidate(null)}
          candidateProfile={kundaliModalCandidate}
        />
      )}

      {/* Profile Comparison Modal */}
      {isCompareModalOpen && (
        <ProfileCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          profilesToCompare={profiles.filter((p) => comparedProfileIds.includes(p.id))}
          onRemoveProfile={(pId) => setComparedProfileIds((prev) => prev.filter((id) => id !== pId))}
          onSelectForKundli={(p) => setKundaliModalCandidate(p)}
        />
      )}

      {/* Admin Edit Profile Modal (Directly from Profiles Grid) */}
      {adminEditingProfile && (
        <AdminEditProfileModal
          isOpen={!!adminEditingProfile}
          profile={adminEditingProfile}
          onClose={() => setAdminEditingProfile(null)}
          onSave={(profileId, updatedFields) => {
            updateProfileDirect(profileId, updatedFields);
            if (addNotification) {
              addNotification({
                type: 'success',
                title: 'प्रोफाईल सेव्ह झाली',
                message: `${updatedFields.fullName || adminEditingProfile.fullName} यांची माहिती यशस्वीरित्या सेव्ह झाली!`,
              });
            }
            setAdminEditingProfile(null);
          }}
          canEdit={true}
        />
      )}
    </section>
  );
};
