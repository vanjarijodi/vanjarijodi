import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';
import { InstagramPhotoCarousel } from './InstagramPhotoCarousel';
import { VerifiedBadge } from './VerifiedBadge';
import { SmartBadgeRow } from './SmartBadgeRow';
import { KundaliMilanModal } from './KundaliMilanModal';
import { calculateMatchScore } from '../utils/matchScore';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
import { getProfessionBadges, getTagStyleClass } from '../utils/professionUtils';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  FileText,
  Send,
  Scroll,
  Lock,
  Sparkles,
  MapPin,
  Briefcase,
  Users,
  Eye,
  RotateCcw,
} from 'lucide-react';

interface HorizontalBiodataDeckProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
}

export const HorizontalBiodataDeck: React.FC<HorizontalBiodataDeckProps> = ({
  profiles,
  onSelectProfile,
}) => {
  const {
    t,
    language,
    shortlistedIds,
    toggleShortlist,
    sendInterest,
    interests,
    likedProfileIds,
    currentUser,
    isContactAuthorizedForUser,
    contactRequests,
    siteConfig,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [kundaliModalCandidate, setKundaliModalCandidate] = useState<UserProfile | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-[#FFFDF9] rounded-3xl border-2 border-amber-200 p-8 shadow-sm max-w-xl mx-auto space-y-3">
        <Users className="w-12 h-12 text-[#800C1E] mx-auto" />
        <h3 className="text-base font-black text-[#800C1E]">
          {language === 'mr' ? 'कोणतेही जुळणारे प्रोफाईल उपलब्ध नाहीत' : 'No matching profiles available'}
        </h3>
      </div>
    );
  }

  const safeIndex = currentIndex >= profiles.length ? 0 : currentIndex;
  const currentProfile = profiles[safeIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 < profiles.length ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : profiles.length - 1));
  };

  // Touch gesture swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Biodata
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Biodata
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Profile Specific Calculations
  const isShortlisted = shortlistedIds.includes(currentProfile.id);
  const isAuthorized = isContactAuthorizedForUser(currentProfile.id);
  const isUnapprovedUser = Boolean(currentUser && currentUser.isApproved === false && !currentUser.isAdmin);
  const interestObj = interests.find(
    (i) => currentUser && i.fromUserId === currentUser.id && i.toUserId === currentProfile.id
  );
  const isMutualMatch = currentUser && (
    (likedProfileIds.includes(currentProfile.id) || !!interestObj) &&
    (interests.some((i) => i.fromUserId === currentProfile.id && i.toUserId === currentUser.id) || (currentProfile.shortlistedByUsers || []).includes(currentUser.id))
  );

  const matchScore = calculateMatchScore(currentUser, currentProfile);

  const isOverride = siteConfig?.adminOverrideMemberPrivacy === true;
  const isGuest = !currentUser || currentUser?.id?.startsWith('guest') || currentUser?.isGuest;
  const isPhotoBlurred = isAuthorized ? false : (
    isGuest ||
    isUnapprovedUser ||
    (currentProfile.privacy?.hidePhoto && !isOverride) ||
    siteConfig?.blurPhotosForFreeUsers === true ||
    siteConfig?.blurProfilePhotos === true ||
    (!currentUser && siteConfig?.allowPublicVisitorsToViewPhotos === false)
  );

  const blurPct = siteConfig?.photoBlurPercentage || 50;
  const blurClass = blurPct >= 100 ? 'blur-2xl scale-125' : blurPct >= 75 ? 'blur-lg scale-110' : blurPct >= 50 ? 'blur-md scale-105' : 'blur-xs scale-102';

  const photosArray = currentProfile.photos && currentProfile.photos.length > 0
    ? currentProfile.photos
    : currentProfile.photoUrl
    ? [currentProfile.photoUrl]
    : [];

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      
      {/* Top Slider Navigation & Progress Status Bar */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 p-3 rounded-2xl border-2 border-amber-300 shadow-sm flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrev}
          className="px-3 py-2 rounded-xl bg-white hover:bg-amber-200 text-[#800C1E] font-black text-xs border border-amber-300 flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 transition-transform shrink-0"
          title="मागील बायोडाटा"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">मागील</span>
        </button>

        <div className="text-center font-black text-[#800C1E] text-xs sm:text-sm">
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
            <span>बायोडाटा {safeIndex + 1} / {profiles.length}</span>
          </div>
          <span className="text-[10px] text-slate-600 font-bold block mt-0.5">
            👉 पुढील बायोडाटा पाहण्यासाठी उजवीकडे सरकवा (Swipe Left/Right)
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#600816] hover:to-[#800C1E] text-amber-100 font-black text-xs border border-amber-300 flex items-center gap-1 shadow-md cursor-pointer active:scale-95 transition-transform shrink-0"
          title="पुढील बायोडाटा"
        >
          <span>पुढील</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Swipeable Card Deck */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white border-2 border-amber-300 hover:border-amber-400 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 relative flex flex-col justify-between"
      >
        {/* Card Header Area with Instagram Photo Carousel */}
        <div className="relative w-full h-88 sm:h-96 bg-gradient-to-b from-slate-900 to-black overflow-hidden border-b border-amber-200">
          
          {/* Gemini AI Extracted Sparkle Badge */}
          <div className="absolute top-3 left-3 z-30 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-200 tracking-wide uppercase">
            <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950 animate-pulse" />
            <span>Gemini AI Extracted</span>
          </div>

          {/* Top Right Shortlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleShortlist(currentProfile.id);
            }}
            className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-amber-200 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title={isShortlisted ? 'पसंती यादीतून काढा' : 'पसंती यादीत जोडा'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isShortlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
              }`}
            />
          </button>

          {/* Floating Left & Right Navigation Arrows inside Card */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-amber-300 backdrop-blur-md shadow-2xl border border-amber-400/40 cursor-pointer active:scale-95"
            title="मागील बायोडाटा"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-amber-300 backdrop-blur-md shadow-2xl border border-amber-400/40 cursor-pointer active:scale-95 animate-pulse"
            title="पुढील बायोडाटा"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Instagram Photo Carousel */}
          <InstagramPhotoCarousel
            photos={photosArray}
            defaultGender={currentProfile.gender}
            fullName={currentProfile.fullName}
            isBlurred={isPhotoBlurred}
            blurClass={blurClass}
            onPhotoClick={() => onSelectProfile(currentProfile)}
            aspectRatioClass="h-88 sm:h-96"
          />

          {/* Overlaid Float Information Panel */}
          <div 
            onClick={() => onSelectProfile(currentProfile)}
            className="absolute bottom-3 inset-x-3 text-white z-20 cursor-pointer"
          >
            <div className="backdrop-blur-md bg-[#1A0307]/80 border border-white/20 p-3.5 rounded-2xl shadow-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/25 px-2.5 py-0.5 rounded-md">
                  {language === 'en' ? 'ID:' : 'आयडी:'} {currentProfile.id}
                </span>
                <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-mono">
                  {matchScore}% जुळवणी
                </span>
              </div>
              
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 flex-wrap">
                <span className={`drop-shadow-md ${
                  (!isAuthorized && (!currentUser || currentUser?.membership === 'free') && siteConfig?.nameDisplayModeForFreeUsers === 'blurred_name')
                    ? ((siteConfig?.nameBlurPercentage || 50) >= 75 ? 'blur-sm select-none opacity-60' : 'blur-xs select-none opacity-80')
                    : ''
                }`}>
                  {formatProfileDisplayName(currentProfile.fullName, currentUser, false, isAuthorized || Boolean(isMutualMatch), siteConfig, language, Boolean(isMutualMatch), currentProfile.id)}
                </span>
                <VerifiedBadge profile={currentProfile} size="sm" />
              </h3>

              <div className="flex items-center gap-2 text-xs text-amber-100 font-bold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    {language === 'en' 
                      ? transliterateMarathiToEnglish(currentProfile.district || 'Maharashtra') 
                      : (currentProfile.district || 'महाराष्ट्र')}
                  </span>
                </span>
                <span>•</span>
                <span>{currentProfile.age} {language === 'en' ? 'Yrs' : 'वर्षे'}</span>
                <span>•</span>
                <span className="text-amber-300">
                  {language === 'en' ? transliterateMarathiToEnglish(currentProfile.subCaste) : currentProfile.subCaste}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Body */}
        <div className="p-4 space-y-3 text-xs text-slate-700 flex-1">
          
          {/* Smart Badge & Quick Info Capsule Row */}
          <SmartBadgeRow profile={currentProfile} showQuickInfo={true} />

          <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-amber-100">
            <div>
              <span className="text-slate-500 text-[11px] block font-semibold">{t('height')}</span>
              <span className="font-bold text-slate-800">{currentProfile.height}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block font-semibold">{t('sub_caste')}</span>
              <span className="font-bold text-[#800C1E]">
                {language === 'en' ? transliterateMarathiToEnglish(currentProfile.subCaste) : currentProfile.subCaste}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
              <span className="truncate font-bold">
                {language === 'en' 
                  ? transliterateMarathiToEnglish(currentProfile.occupation || 'Information Not Available') 
                  : (currentProfile.occupation || 'माहिती उपलब्ध नाही')}
              </span>
            </div>

            {/* Dynamic Profession & Govt Badges */}
            {(siteConfig?.showProfessionBadgesOnCards !== false) && (() => {
              const badges = getProfessionBadges(currentProfile);
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
                <div className="flex items-center justify-between font-bold text-sky-700">
                  <span className="flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Telegram:' : 'टेलिग्राम चॅट:'}</span>
                  </span>
                  <a
                    href={`https://t.me/${currentProfile.telegramUsername || siteConfig?.telegramUsername || 'Primemultiservice'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-700 underline hover:text-sky-900"
                  >
                    @{currentProfile.telegramUsername || siteConfig?.telegramUsername || 'Primemultiservice'}
                  </a>
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

        {/* Action Buttons */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200 rounded-b-3xl space-y-2">
          
          {/* View Complete Biodata Button */}
          <button
            type="button"
            onClick={() => onSelectProfile(currentProfile)}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-amber-100/70 text-[#800C1E] font-black text-xs border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4 text-[#800C1E]" />
            <span>{t('view_full_biodata')}</span>
          </button>

          {/* Kundali Matching Trigger Button */}
          <button
            type="button"
            onClick={() => setKundaliModalCandidate(currentProfile)}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-[#800C1E] font-black text-xs border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <Scroll className="w-3.5 h-3.5 text-[#800C1E]" />
            <span>📜 ३६ गुण जुळवा (Kundali Match)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Send Interest / Like Button */}
            <button
              type="button"
              onClick={() => sendInterest(currentProfile.id)}
              disabled={!!interestObj || likedProfileIds.includes(currentProfile.id)}
              className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                likedProfileIds.includes(currentProfile.id) || !!interestObj
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#600816] hover:to-[#800C1E] text-amber-100 shadow-md'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${likedProfileIds.includes(currentProfile.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>
                {likedProfileIds.includes(currentProfile.id) || !!interestObj ? 'पसंती पाठवली' : 'पसंती पाठवा'}
              </span>
            </button>

            {/* Next Candidate Swipe Button */}
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-slate-950 font-black text-xs border border-amber-400 flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            >
              <span>पुढील बायोडाटा 👉</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Quick Jump & Navigation Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-2">
        <button
          type="button"
          onClick={() => setCurrentIndex(0)}
          className="text-[#800C1E] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>सुरुवातीपासून पाहा</span>
        </button>

        <span className="text-slate-500 text-[11px]">
          अस्सल वंजारी वधू-वर बायोडाटा
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="text-[#800C1E] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>पुढचा बायोडाटा</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Kundali Matching Modal */}
      {kundaliModalCandidate && (
        <KundaliMilanModal
          candidate={kundaliModalCandidate}
          onClose={() => setKundaliModalCandidate(null)}
        />
      )}
    </div>
  );
};
