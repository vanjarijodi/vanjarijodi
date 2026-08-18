import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, Gender } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { SmartBadgeRow } from './SmartBadgeRow';
import { DynamicGestureView } from './DynamicGestureView';
import { getProfessionBadges, getTagStyleClass } from '../utils/professionUtils';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
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
  ShieldAlert
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
    unlockContact
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'bride' | 'groom' | 'shortlisted'>('all');
  const [displayView, setDisplayView] = useState<'grid' | 'gesture'>('grid');

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
    
    // Strict Opposite Gender Rule for logged-in members (Groom sees Bride only, Bride sees Groom only)
    if (currentUser && !currentUser.isAdmin) {
      if (currentUser.gender === 'groom' && p.gender !== 'bride') return false;
      if (currentUser.gender === 'bride' && p.gender !== 'groom') return false;
    }

    if (activeTab === 'bride') return p.gender === 'bride';
    if (activeTab === 'groom') return p.gender === 'groom';
    if (activeTab === 'shortlisted') return shortlistedIds.includes(p.id);
    return true;
  });

  return (
    <section id="profiles-section" className="py-16 bg-[#FFFDFB] text-slate-800 min-h-[600px] border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-amber-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#A71930] text-xs font-bold mb-2 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-[#A71930]" />
              <span>
                {currentUser && !currentUser.isAdmin
                  ? currentUser.gender === 'groom'
                    ? 'विशेष वधू बायोडाटा यादी (Brides for Groom)'
                    : 'विशेष वर बायोडाटा यादी (Grooms for Bride)'
                  : 'नवीन नोंदणीकृत वधू-वर'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#A71930]">
              {language === 'mr' ? 'वंजारी वधू-वर यादी (Recent Profiles)' : 'Vanjari Matrimonial Members'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              {language === 'mr'
                ? 'बीड, नाशिक, अहमदनगर, छत्रपती संभाजीनगर, पुणे, मुंबई आणि इतर सर्व जिल्ह्यातील उच्चशिक्षित बायोडाटा'
                : 'Recent matrimonial listings from all districts of Maharashtra'}
            </p>
          </div>

          {/* Clean Category Filter Tabs & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 pb-2 md:pb-0">
            {/* View Mode Toggle Button */}
            <div className="flex items-center bg-amber-100 p-1 rounded-2xl border border-amber-300">
              <button
                type="button"
                onClick={() => setDisplayView('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  displayView === 'grid'
                    ? 'bg-[#A71930] text-amber-100 shadow'
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
                    ? 'bg-[#A71930] text-amber-100 shadow'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>✨ 4D स्वाइप / जेस्चर</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#A71930] text-amber-100 shadow'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              {language === 'mr'
                ? currentUser && !currentUser.isAdmin
                  ? currentUser.gender === 'groom'
                    ? '👰 सर्व वधू बायोडाटा'
                    : '🤵 सर्व वर बायोडाटा'
                  : 'सर्व सदस्य'
                : 'All Members'}{' '}
              ({filteredProfiles.length})
            </button>

            {/* Show Bride/Groom tabs only if User is Admin or Not Logged In */}
            {(!currentUser || currentUser.isAdmin) && (
              <>
                <button
                  onClick={() => setActiveTab('bride')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'bride'
                      ? 'bg-[#A71930] text-amber-100 shadow'
                      : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  👰 {t('bride')} ({filteredProfiles.filter((p) => p.gender === 'bride').length})
                </button>
                <button
                  onClick={() => setActiveTab('groom')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'groom'
                      ? 'bg-[#A71930] text-amber-100 shadow'
                      : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  🤵 {t('groom')} ({filteredProfiles.filter((p) => p.gender === 'groom').length})
                </button>
              </>
            )}

            {currentUser && (
              <button
                onClick={() => setActiveTab('shortlisted')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'shortlisted'
                    ? 'bg-[#A71930] text-amber-100 shadow'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>{language === 'mr' ? 'माझे आवडते' : 'Shortlisted'}</span>
                <span>({shortlistedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Profiles Grid or 4D Dynamic Gesture View */}
        {displayedProfiles.length === 0 ? (
          <div className="text-center py-12 px-6 bg-gradient-to-b from-amber-50/50 to-white rounded-3xl border-2 border-amber-200 p-8 shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-[#A71930] border border-amber-300">
              <User className="w-8 h-8 text-[#A71930]" />
            </div>
            <h3 className="text-lg font-black text-[#A71930]">
              {language === 'mr' ? 'कोणतेही जुळणारे प्रोफाईल आढळले नाहीत' : 'No matching profiles found.'}
            </h3>
            <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed">
              {language === 'mr'
                ? 'सध्या प्रणालीत या श्रेणीमध्ये कोणतेही बायोडाटा उपलब्ध नाहीत किंवा सर्च फिल्टरनुसार शोध लागला नाही.'
                : 'Currently there are no profiles available in this category or matching your search filter.'}
            </p>
            {currentUser?.isAdmin && (
              <div className="p-3 bg-amber-100/70 rounded-2xl border border-amber-300 text-xs text-amber-900 font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#A71930] shrink-0" />
                  <span>
                    {language === 'mr'
                      ? 'ॲडमिन टीप: मुख्य पानावरून हा विभाग दाखवणे/लपवणे ॲडमिन पॅनेलमध्ये शक्य आहे.'
                      : 'Admin Note: Show/hide this section on index page via Admin Panel settings.'}
                  </span>
                </span>
              </div>
            )}
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

              return (
                <div
                  key={profile.id}
                  className="bg-white border-2 border-[#FFF1C2] hover:border-amber-400 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between relative"
                >
                  {/* Card Header Area */}
                  <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-amber-50 to-amber-100 overflow-hidden flex items-center justify-center border-b border-[#FFF1C2]">
                    
                    {/* Gemini AI Extracted Sparkle Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-200 tracking-wide uppercase">
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-pulse" />
                      <span>Gemini AI Extracted</span>
                    </div>

                    {/* Top Right Shortlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleShortlist(profile.id)}
                      className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-amber-200 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title={isShortlisted ? 'पसंती यादीतून काढा' : 'पसंती यादीत जोडा'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isShortlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
                        }`}
                      />
                    </button>

                    {/* Clear High-Res Photo Avatar Container */}
                    {(() => {
                      const mainPhoto = (profile.photos && profile.photos.length > 0 && profile.photos[0]) ? profile.photos[0] : (profile.photoUrl || null);
                      const isOverride = siteConfig?.adminOverrideMemberPrivacy === true;
                      const isPhotoBlurred = isAuthorized ? false : (
                        (profile.privacy?.hidePhoto && !isOverride) ||
                        siteConfig?.blurPhotosForFreeUsers === true ||
                        siteConfig?.blurProfilePhotos === true ||
                        (!currentUser && siteConfig?.allowPublicVisitorsToViewPhotos === false) ||
                        (currentUser?.id?.startsWith('guest') && siteConfig?.allowGuestsToViewPhotos === false)
                      );

                      const blurPct = siteConfig?.photoBlurPercentage || 50;
                      const blurClass = blurPct >= 100 ? 'blur-2xl scale-125' : blurPct >= 75 ? 'blur-lg scale-110' : blurPct >= 50 ? 'blur-md scale-105' : 'blur-xs scale-102';

                      if (mainPhoto) {
                        return (
                          <div
                            onClick={() => setSelectedProfileForModal(profile)}
                            className="w-full h-full relative cursor-pointer overflow-hidden bg-slate-900"
                          >
                            <img
                              src={mainPhoto}
                              alt={profile.fullName}
                              referrerPolicy="no-referrer"
                              className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                                isPhotoBlurred ? blurClass : ''
                              }`}
                            />
                            {isPhotoBlurred && (
                              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
                                <Lock className="w-5 h-5 text-amber-200" />
                              </div>
                            )}
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/60 text-[9px] text-amber-200 font-medium backdrop-blur-xs">
                              {(profile.photos && profile.photos.length) || 1} 📷
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1A0307]/95 via-[#1A0307]/40 to-transparent pointer-events-none" />
                          </div>
                        );
                      }

                      return (
                        <div
                          onClick={() => setSelectedProfileForModal(profile)}
                          className="w-full h-full bg-gradient-to-tr from-[#800C1E] via-[#A71930] to-[#C82333] flex flex-col items-center justify-center text-white cursor-pointer relative"
                        >
                          <span className="text-6xl mb-2">{profile.gender === 'bride' ? '👰' : '🤵'}</span>
                          <span className="text-xs font-bold text-amber-200 uppercase tracking-widest">
                            {language === 'en' ? 'Photo Not Available' : 'फोटो उपलब्ध नाही'}
                          </span>
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        </div>
                      );
                    })()}

                    {/* Overlaid Float Information Panel (Bumble style) */}
                    <div className="absolute bottom-4 inset-x-4 text-white z-10 pointer-events-none">
                      <div className="backdrop-blur-md bg-[#1A0307]/65 border border-white/20 p-3 rounded-2xl shadow-xl space-y-1">
                        <span className="inline-block text-[8px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/25 px-2 py-0.5 rounded-md">
                          {language === 'en' ? 'ID:' : 'आयडी:'} {profile.id}
                        </span>
                        
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

                  {/* Profile Details */}
                  <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-700 flex-1">
                    
                    {/* Smart Badge & Quick Info Capsule Row */}
                    <SmartBadgeRow profile={profile} showQuickInfo={true} />

                    <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-amber-100">
                      <div>
                        <span className="text-slate-500 text-[11px] block font-semibold">{t('height')}</span>
                        <span className="font-bold text-slate-800">{profile.height}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block font-semibold">{t('sub_caste')}</span>
                        <span className="font-bold text-[#A71930]">
                          {language === 'en' ? transliterateMarathiToEnglish(profile.subCaste) : profile.subCaste}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
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
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-[11px]">
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
                            <Lock className="w-3 h-3 text-[#A71930]" />
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
                  <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-3xl space-y-2">
                    
                    {/* View Complete Biodata Button */}
                    <button
                      onClick={() => setSelectedProfileForModal(profile)}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-amber-50 text-[#A71930] font-black text-xs border border-amber-200 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-[#A71930]" />
                      <span>{t('view_full_biodata')}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Send Interest / Like Button */}
                      <button
                        onClick={() => sendInterest(profile.id)}
                        disabled={!!interestObj || likedProfileIds.includes(profile.id)}
                        className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          interestObj || likedProfileIds.includes(profile.id)
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 cursor-default active:scale-100'
                            : 'bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 shadow-md'
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
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md active:scale-95 text-center flex justify-center items-center"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-white shrink-0 fill-white/10" />
                          <span>व्हॉट्सॲप</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            if (checkGuestPermission('viewProfiles', 'व्हॉट्सॲप संपर्क')) {
                              unlockContact(profile.id);
                            }
                          }}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md active:scale-95 text-center flex justify-center items-center cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-white shrink-0 fill-white/10" />
                          <span>व्हॉट्सॲप</span>
                        </button>
                      )}
                    </div>

                    {/* Contact Number Request (Secondary triggers for rich logic flow) */}
                    <div className="pt-1">
                      {isAuthorized ? (
                        <button
                          onClick={() => setActiveChatUser(profile)}
                          className="w-full py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center gap-1 border border-emerald-200"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>ॲप चॅट सुरू करा</span>
                        </button>
                      ) : pendingReq ? (
                        <button
                          disabled
                          className="w-full py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-extrabold flex items-center justify-center gap-1 border border-amber-200 cursor-default"
                        >
                          <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                          <span>मोबाईल नंबर विनंती प्रलंबित</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => requestContactAuthorization(profile.id)}
                          className="w-full py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#A71930] border border-amber-200 text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all"
                        >
                          <PhoneCall className="w-3 h-3 text-[#A71930]" />
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
    </section>
  );
};

