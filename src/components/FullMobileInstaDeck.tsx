import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Star,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Phone,
  MessageCircle,
  Share2,
  Lock,
  Eye,
  Info,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  Sun,
  ShieldCheck,
  FileText,
  PhoneCall,
  CheckCircle2,
  RotateCw,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { UserProfile } from '../types';
import { SmartBadgeRow } from './SmartBadgeRow';
import { InstagramPhotoCarousel } from './InstagramPhotoCarousel';
import { VerifiedBadge } from './VerifiedBadge';
import { useApp } from '../context/AppContext';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
import { calculateMatchScore } from '../utils/matchScore';
import { getProfessionBadges, getTagStyleClass } from '../utils/professionUtils';
import { getPhotoAccessStatus } from '../utils/photoAccess';

interface FullMobileInstaDeckProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onOpenKundali?: (profile: UserProfile) => void;
}

export const FullMobileInstaDeck: React.FC<FullMobileInstaDeckProps> = ({
  profiles,
  onSelectProfile,
  onOpenKundali,
}) => {
  const {
    siteConfig,
    currentUser,
    likedProfileIds,
    toggleLikeProfile,
    shortlistedIds,
    toggleShortlist,
    sendInterest,
    interests,
    contactRequests,
    language,
    isContactAuthorizedForUser,
    t,
    isProfilePlanExpired,
    setIsLoginOpen,
    setLoginModalMode,
    setIsPaymentOpen,
  } = useApp();

  const isEn = language === 'en';
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const verticalTouchStartY = useRef<number | null>(null);
  const verticalTouchStartX = useRef<number | null>(null);

  // Keep index within bounds if profiles array changes
  useEffect(() => {
    if (currentIndex >= profiles.length) {
      setCurrentIndex(Math.max(0, profiles.length - 1));
    }
  }, [profiles.length, currentIndex]);

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-amber-200 text-center max-w-sm mx-auto shadow-sm my-6">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3 text-[#A71930]">
          <Users className="w-7 h-7" />
        </div>
        <h3 className="text-base font-black text-slate-800">
          {isEn ? 'No profiles found' : 'कोणतीही प्रोफाईल्स उपलब्ध नाहीत'}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
          {isEn ? 'Try adjusting your search filters.' : 'कृपया शोध फिल्टर बदलून पुन्हा प्रयत्न करा.'}
        </p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex] || profiles[0];
  const isShortlisted = shortlistedIds.includes(currentProfile.id);
  const isLiked = likedProfileIds.includes(currentProfile.id);
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

  // Strict Photo Access Verification (Paid members only)
  const photoAccess = getPhotoAccessStatus({
    currentUser,
    targetProfile: currentProfile,
    isProfilePlanExpired,
    isMutualMatch: Boolean(isMutualMatch),
    siteConfig,
  });
  const isPhotoBlurred = photoAccess.isBlurred;

  const blurPct = siteConfig?.photoBlurPercentage || 80;
  const blurClass = blurPct >= 100 ? 'blur-2xl scale-125' : blurPct >= 75 ? 'blur-lg scale-110' : 'blur-md scale-105';

  const photosArray = currentProfile.photos && currentProfile.photos.length > 0
    ? currentProfile.photos
    : currentProfile.photoUrl
    ? [currentProfile.photoUrl]
    : [];

  const handleNextProfile = () => {
    setSwipeDirection('up');
    setIsBioExpanded(false);
    setCurrentIndex((prev) => (prev + 1 < profiles.length ? prev + 1 : 0));
  };

  const handlePrevProfile = () => {
    setSwipeDirection('down');
    setIsBioExpanded(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : profiles.length - 1));
  };

  const handleLike = () => {
    toggleLikeProfile(currentProfile.id);
    sendInterest(currentProfile.id);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  // Vertical Touch swipe detection for moving Up / Down between profiles
  const handleTouchStart = (e: React.TouchEvent) => {
    verticalTouchStartY.current = e.touches[0].clientY;
    verticalTouchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (verticalTouchStartY.current === null || verticalTouchStartX.current === null) return;
    const deltaY = e.changedTouches[0].clientY - verticalTouchStartY.current;
    const deltaX = e.changedTouches[0].clientX - verticalTouchStartX.current;

    // If movement is predominantly vertical and greater than 45px
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.3 && Math.abs(deltaY) > 45) {
      if (deltaY < 0) {
        // Swiped UP -> Next Profile
        handleNextProfile();
      } else {
        // Swiped DOWN -> Prev Profile
        handlePrevProfile();
      }
    }

    verticalTouchStartY.current = null;
    verticalTouchStartX.current = null;
  };

  const handleWhatsAppShare = () => {
    const text = `वंजारी जोडीवरील अनुरूप स्थळ: ${currentProfile.fullName} (${currentProfile.age} वर्षे, ${currentProfile.district || 'महाराष्ट्र'}) - अधिक माहितीसाठी पहा: https://vanjarijodi.web.app`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto my-2 select-none px-2 sm:px-0 overflow-hidden">
      
      {/* Interactive Top Controller Banner */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 rounded-2xl shadow-sm border border-amber-400/40 text-xs font-bold">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <span className="text-[11px] font-black tracking-wide text-amber-300">
            {isEn ? 'Full-Screen Reel Mode' : '📱 इन्स्टा रील्स मोड (पूर्ण स्क्रीन)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-mono text-amber-200 border border-white/10">
            {currentIndex + 1} / {profiles.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevProfile}
              className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer active:scale-95 transition"
              title="मागचे स्थळ (खाली)"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextProfile}
              className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer active:scale-95 transition"
              title="पुढचे स्थळ (वर)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Reel Card with Gestures */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[74vh] min-h-[520px] max-h-[680px] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border-2 border-amber-400/80 flex flex-col group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            initial={{ opacity: 0, y: swipeDirection === 'up' ? 60 : swipeDirection === 'down' ? -60 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: swipeDirection === 'up' ? -60 : swipeDirection === 'down' ? 60 : 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="relative w-full h-full flex flex-col justify-between"
          >
            {/* Background Full Photo Carousel (Smooth Horizontal Swipe) */}
            <div className="absolute inset-0 z-0">
              <InstagramPhotoCarousel
                photos={photosArray}
                defaultGender={currentProfile.gender}
                fullName={currentProfile.fullName}
                isBlurred={isPhotoBlurred}
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
                onDoubleTapLike={handleLike}
                onPhotoClick={() => onSelectProfile(currentProfile)}
                aspectRatioClass="w-full h-full"
              />
            </div>

            {/* Top Bar Badges */}
            <div className="relative z-20 p-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/40 shadow">
                  आयडी: {currentProfile.id}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md text-[10px] font-black text-emerald-300 border border-emerald-400/50 shadow font-mono">
                  {matchScore}% जुळवणी
                </span>
              </div>

              {/* Swipe Up/Down hint badge */}
              <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-white/90 border border-white/20 flex items-center gap-1 animate-pulse">
                <span>↕ वर/खाली स्वाइप</span>
              </div>
            </div>

            {/* Exploding Heart Animation on Double Tap / Like */}
            {showHeartBurst && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-250">
                <div className="p-5 rounded-full bg-rose-600/90 text-white shadow-2xl backdrop-blur-md scale-125 border-2 border-white/80 animate-bounce">
                  <Heart className="w-20 h-20 fill-white text-white filter drop-shadow-xl" />
                </div>
              </div>
            )}

            {/* Floating Right Action Dock (Instagram / TikTok Style) */}
            <div className="absolute right-2.5 bottom-24 z-30 flex flex-col items-center gap-2.5 pointer-events-auto">
              
              {/* Like / Interest Action */}
              <button
                type="button"
                onClick={handleLike}
                className={`p-3 rounded-full backdrop-blur-md shadow-xl transition-transform active:scale-85 cursor-pointer border flex flex-col items-center gap-0.5 ${
                  isLiked
                    ? 'bg-rose-600 text-white border-rose-400 shadow-rose-900/50'
                    : 'bg-black/65 text-white hover:bg-black/85 border-white/30'
                }`}
                title="लाईक करा (Like)"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                <span className="text-[8px] font-black">{isLiked ? 'Liked' : 'Like'}</span>
              </button>

              {/* Shortlist Action */}
              <button
                type="button"
                onClick={() => toggleShortlist(currentProfile.id)}
                className={`p-3 rounded-full backdrop-blur-md shadow-xl transition-transform active:scale-85 cursor-pointer border flex flex-col items-center gap-0.5 ${
                  isShortlisted
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-900/50'
                    : 'bg-black/65 text-white hover:bg-black/85 border-white/30'
                }`}
                title="पसंती यादी (Shortlist)"
              >
                <Star className={`w-5 h-5 ${isShortlisted ? 'fill-slate-950 text-slate-950' : 'text-amber-300'}`} />
                <span className="text-[8px] font-black">{isShortlisted ? 'Saved' : 'Save'}</span>
              </button>

              {/* 36 Guna Kundali Milan Trigger */}
              {onOpenKundali && (
                <button
                  type="button"
                  onClick={() => onOpenKundali(currentProfile)}
                  className="p-3 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-xl transition-transform active:scale-85 cursor-pointer flex flex-col items-center gap-0.5"
                  title="३६ गुण पत्रिका जुळवणी"
                >
                  <Sun className="w-5 h-5 text-amber-400 animate-spin duration-[8000ms]" />
                  <span className="text-[8px] font-black">पत्रिका</span>
                </button>
              )}

              {/* WhatsApp Share Action */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="p-3 rounded-full bg-emerald-600/90 hover:bg-emerald-700 backdrop-blur-md text-white border border-emerald-400/50 shadow-xl transition-transform active:scale-85 cursor-pointer flex flex-col items-center gap-0.5"
                title="व्हॉट्सॲपवर शेअर करा"
              >
                <Share2 className="w-5 h-5 text-white" />
                <span className="text-[8px] font-black">शेअर</span>
              </button>
            </div>

            {/* Bottom Profile Details Glass Sheet Overlay */}
            <div className="relative z-20 p-3.5 text-white space-y-2 pointer-events-auto bg-gradient-to-t from-black via-black/85 to-transparent pt-8">
              
              {/* Profile Main Header */}
              <div 
                onClick={() => onSelectProfile(currentProfile)}
                className="cursor-pointer space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white drop-shadow flex items-center gap-1.5">
                    <span>
                      {formatProfileDisplayName(currentProfile.fullName, currentUser, false, isAuthorized || Boolean(isMutualMatch), siteConfig, language, Boolean(isMutualMatch), currentProfile.id)}
                    </span>
                    <VerifiedBadge profile={currentProfile} size="sm" />
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{currentProfile.district || currentProfile.city || 'महाराष्ट्र'}</span>
                  </span>
                  <span>•</span>
                  <span>{currentProfile.age} {isEn ? 'Yrs' : 'वर्षे'}</span>
                  <span>•</span>
                  <span>{currentProfile.height || '५ फूट ५ इंच'}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-extrabold">{currentProfile.subCaste || 'वंजारी'}</span>
                </div>

                {/* Profession / Education Chip */}
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium truncate pt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{currentProfile.occupation || currentProfile.education || 'माहिती उपलब्ध'}</span>
                </div>
              </div>

              {/* Dynamic Badges Row */}
              <div className="pt-0.5">
                <SmartBadgeRow profile={currentProfile} showQuickInfo={false} />
              </div>

              {/* One Click Full Biodata Pull-Up Action Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectProfile(currentProfile)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-transform"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>{isEn ? 'View Complete Biodata' : 'संपूर्ण बायोडाटा उघडा (View Full Bio)'}</span>
                </button>

                {/* Direct Next Profile Quick Arrow */}
                <button
                  type="button"
                  onClick={handleNextProfile}
                  className="px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs border border-white/20 cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-1"
                  title="पुढील स्थळ (Next)"
                >
                  <span>{isEn ? 'Next' : 'पुढील'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Bottom Swipe Navigation Tip */}
      <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-500 font-extrabold">
        <span className="flex items-center gap-1">
          <span className="text-amber-600">↔</span> फोटोसाठी आडवे स्वाइप
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="text-amber-600">↕</span> स्थळांसाठी उभे स्वाइप
        </span>
      </div>

    </div>
  );
};
