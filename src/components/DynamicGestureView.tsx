import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import {
  Heart,
  X,
  Star,
  Sparkles,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Phone,
  MessageCircle,
  Share2,
  Lock,
  Eye,
  Info,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, GestureMode } from '../types';
import { SmartBadgeRow } from './SmartBadgeRow';
import { useApp } from '../context/AppContext';
import { getActiveThemeConfig } from '../utils/themePresets';
import { formatProfileDisplayName } from '../utils/nameFormatter';

interface DynamicGestureViewProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onOpenContactUnlock?: (profile: UserProfile) => void;
}

export const DynamicGestureView: React.FC<DynamicGestureViewProps> = ({
  profiles,
  onSelectProfile,
  onOpenContactUnlock,
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
    language,
    isContactAuthorizedForUser,
  } = useApp();

  const isEn = language === 'en';
  const gestureMode: GestureMode = siteConfig.activeGestureMode || 'four_way_swipe';
  const theme = getActiveThemeConfig(siteConfig.activeThemePreset);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);
  const [swipeActionText, setSwipeActionText] = useState<string | null>(null);

  const currentProfile: UserProfile | undefined = profiles[currentIndex];
  const isUnapproved = Boolean(currentUser && currentUser.isApproved === false && !currentUser.isAdmin);
  const isAuthorized = currentProfile ? isContactAuthorizedForUser(currentProfile.id) : false;
  const isLiked = currentProfile ? likedProfileIds.includes(currentProfile.id) : false;
  const interestObj = currentProfile ? interests.find(
    (i) => currentUser && i.fromUserId === currentUser.id && i.toUserId === currentProfile.id
  ) : undefined;
  const isMutualMatch = Boolean(
    currentUser && currentProfile &&
    (isLiked || !!interestObj) &&
    (interests.some((i) => i.fromUserId === currentProfile.id && i.toUserId === currentUser.id) || (currentProfile.shortlistedByUsers || []).includes(currentUser.id))
  );

  const isPhotoBlurred = isAuthorized ? false : (
    !currentUser ||
    currentUser?.id?.startsWith('guest') ||
    isUnapproved ||
    (currentProfile?.privacy?.hidePhoto && !siteConfig?.adminOverrideMemberPrivacy) ||
    siteConfig?.blurPhotosForFreeUsers === true ||
    siteConfig?.blurProfilePhotos === true
  );

  // Motion values for 4-way drag
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const cardRotate = useTransform(dragX, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(dragX, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-20, -100], [0, 1]);
  const superOpacity = useTransform(dragY, [-20, -100], [0, 1]);
  const starOpacity = useTransform(dragY, [20, 100], [0, 1]);

  if (!currentProfile || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-amber-200 text-center max-w-lg mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-[#A71930]">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-800">
          {isEn ? 'All profiles viewed!' : 'सर्व प्रोफाईल्स पाहून झाल्या आहेत!'}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
          {isEn
            ? 'You have viewed all matching profiles. Click the button below to view again.'
            : 'तुम्ही सर्व अनुरूप स्थळे पाहिली आहेत. पुन्हा सुरुवातीपासून पाहण्यासाठी खालील बटण दाबा.'}
        </p>
        <button
          type="button"
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-2.5 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer"
        >
          {isEn ? '🔄 View Again' : '🔄 पुन्हा पाहा'}
        </button>
      </div>
    );
  }

  const photos = currentProfile.photos && currentProfile.photos.length > 0
    ? currentProfile.photos
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'];

  const isShortlisted = shortlistedIds.includes(currentProfile.id);

  const nextProfile = () => {
    setIsFlipped(false);
    setActivePhotoIdx(0);
    setIsBioExpanded(false);
    setSwipeActionText(null);
    setCurrentIndex((prev) => (prev + 1 < profiles.length ? prev + 1 : 0));
  };

  const prevProfile = () => {
    setIsFlipped(false);
    setActivePhotoIdx(0);
    setIsBioExpanded(false);
    setSwipeActionText(null);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : profiles.length - 1));
  };

  // Handlers for 4-Way Swipe
  const handleDragEnd = (event: any, info: any) => {
    const { offset, velocity } = info;
    const swipeThreshold = 80;

    // Horizontal Swipes
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > swipeThreshold || velocity.x > 500) {
        // Right Swipe: Like / Send Interest
        toggleLikeProfile(currentProfile.id);
        sendInterest(currentProfile.id);
        setSwipeActionText(isEn ? '💖 LIKED!' : '💖 आवडले (LIKE)!');
        setTimeout(nextProfile, 250);
        return;
      } else if (offset.x < -swipeThreshold || velocity.x < -500) {
        // Left Swipe: Skip
        setSwipeActionText(isEn ? '✖️ PASS' : '✖️ पुढील स्थळ (PASS)');
        setTimeout(nextProfile, 250);
        return;
      }
    } else {
      // Vertical Swipes
      if (offset.y < -swipeThreshold || velocity.y < -500) {
        // Up Swipe: Super Match / Open Bio
        onSelectProfile(currentProfile);
        setSwipeActionText(isEn ? '⭐ Opening Biodata...' : '⭐ बायोडाटा उघडत आहे...');
        return;
      } else if (offset.y > swipeThreshold || velocity.y > 500) {
        // Down Swipe: Shortlist
        toggleShortlist(currentProfile.id);
        setSwipeActionText(isEn ? '🌟 SHORTLISTED!' : '🌟 सेव्ह केले (SHORTLIST)!');
        setTimeout(nextProfile, 250);
        return;
      }
    }
  };

  // Render Story Tap + Pull Up System
  if (gestureMode === 'story_tap_pullup') {
    return (
      <div className="relative w-full max-w-md mx-auto h-[620px] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border-2 border-amber-300 select-none flex flex-col">
        {/* Story Segment Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden backdrop-blur-xs"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx <= activePhotoIdx ? 'bg-amber-300 w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Story Background Photo */}
        <div className="relative flex-1 bg-black">
          <img
            src={photos[activePhotoIdx]}
            alt={currentProfile.fullName}
            style={{ filter: isPhotoBlurred ? 'blur(16px)' : 'none' }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

          {/* Left & Right Tap Zones for Story Navigation */}
          <div
            className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-pointer"
            onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-pointer"
            onClick={() => setActivePhotoIdx((prev) => (prev + 1 < photos.length ? prev + 1 : 0))}
          />

          {/* Top Info Overlay */}
          <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between text-white">
            <span className="px-3 py-1 bg-black/60 rounded-full text-xs font-black text-amber-300 border border-white/20">
              📸 {activePhotoIdx + 1} / {photos.length}
            </span>
            <span className="px-3 py-1 bg-[#A71930]/90 rounded-full text-xs font-black text-white border border-amber-400">
              {currentIndex + 1} of {profiles.length}
            </span>
          </div>

          {/* Bottom Profile Details Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2 text-white">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white drop-shadow-md">
                {formatProfileDisplayName(currentProfile.fullName, currentUser, false, isAuthorized || isMutualMatch, siteConfig, language, isMutualMatch, currentProfile.id)}, {currentProfile.age}
              </h3>
              {(currentProfile.isVerified || currentProfile.aadhaarVerified) && (
                <ShieldCheck className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
            </div>

            <SmartBadgeRow profile={currentProfile} showQuickInfo={false} />

            {/* Quick Summary Row */}
            <p className="text-xs text-amber-100 font-semibold drop-shadow">
              {[currentProfile.education, currentProfile.occupation, currentProfile.city]
                .filter(Boolean)
                .join(' • ')}
            </p>

            {/* Expand Drawer Button */}
            <button
              type="button"
              onClick={() => onSelectProfile(currentProfile)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
            >
              <ChevronUp className="w-4 h-4 text-slate-950" />
              <span>{isEn ? 'View Complete Biodata & Contact' : 'संपूर्ण बायोडाटा व संपर्क पाहा (Pull Up Bio)'}</span>
            </button>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={prevProfile}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white cursor-pointer"
                title={isEn ? 'Previous Profile' : 'मागील स्थळ'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleLikeProfile(currentProfile.id);
                  sendInterest(currentProfile.id);
                }}
                className={`flex-1 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                  isLiked
                    ? 'bg-rose-600 text-white'
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-md text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? (isEn ? 'Liked ✓' : 'आवडले ✓') : (isEn ? 'Like Profile' : 'लाईक करा')}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleShortlist(currentProfile.id)}
                className={`p-3 rounded-2xl cursor-pointer ${
                  isShortlisted
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
                }`}
                title={isEn ? 'Shortlist' : 'शॉर्टलिस्ट'}
              >
                <Star className={`w-5 h-5 ${isShortlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={nextProfile}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white cursor-pointer"
                title={isEn ? 'Next Profile' : 'पुढील स्थळ'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render 3D Flip Card System
  if (gestureMode === 'three_d_flip') {
    return (
      <div className="w-full max-w-md mx-auto [perspective:1200px] my-4 select-none">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-full h-[620px] rounded-3xl shadow-2xl [transform-style:preserve-3d] border-2 border-amber-300 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* CARD FRONT: Photos + Quick Info + Badges */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white [backface-visibility:hidden] flex flex-col">
            <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
              <img
                src={photos[0]}
                alt={currentProfile.fullName}
                style={{ filter: isPhotoBlurred ? 'blur(16px)' : 'none' }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* 3D Flip Hint Badge */}
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow flex items-center gap-1.5 animate-pulse">
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isEn ? 'Tap for Horoscope & Family details (3D Flip)' : 'पत्रिका व कुटुंब माहितीसाठी टॅप करा (3D Flip)'}</span>
              </div>

              {/* Name & Age Overlay */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-2xl font-black drop-shadow-md">{formatProfileDisplayName(currentProfile.fullName, currentUser, false, isAuthorized, siteConfig, language)}, {currentProfile.age} {isEn ? 'Yrs' : 'वर्षे'}</h3>
                <p className="text-xs text-amber-200 font-bold drop-shadow">
                  {[currentProfile.city, currentProfile.district].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <SmartBadgeRow profile={currentProfile} showQuickInfo={true} />

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-bold bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">{isEn ? 'Education:' : 'शिक्षण:'}</span>
                  <span className="text-slate-900">{currentProfile.education || (isEn ? 'Not specified' : 'उल्लेख नाही')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isEn ? 'Profession:' : 'व्यवसाय / नोकरी:'}</span>
                  <span className="text-slate-900">{currentProfile.occupation || (isEn ? 'Not specified' : 'उल्लेख नाही')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProfile(currentProfile);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer text-center"
                >
                  {isEn ? 'View Biodata' : 'बायोडाटा पाहा'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextProfile();
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 cursor-pointer"
                >
                  {isEn ? 'Next ❯' : 'पुढील स्थळ ❯'}
                </button>
              </div>
            </div>
          </div>

          {/* CARD BACK: Kundali, Gotra, Family Details, Relative Surnames */}
          <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-amber-50 [transform:rotateY(180deg)] [backface-visibility:hidden] p-5 flex flex-col justify-between border-2 border-amber-400 shadow-2xl">
            <div className="space-y-3 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-[#A71930]" />
                  <h4 className="font-black text-[#A71930] text-base">
                    {isEn ? 'Horoscope, Gotra & Family Details' : 'पत्रिका, गोत्र व कौटुंबिक माहिती'}
                  </h4>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full">
                  {isEn ? 'Tap to flip back' : 'पुन्हा फोटोसाठी टॅप करा'}
                </span>
              </div>

              {/* Horoscope & Gotra Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-2xl border border-amber-200 shadow-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isEn ? 'Gotra / Sub-caste:' : 'गोत्र / उपजात:'}</span>
                  <span className="text-slate-900 font-black">{currentProfile.gotra || currentProfile.subCaste || (isEn ? 'Vanjari' : 'वंजारी')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isEn ? 'Rashi & Nakshatra:' : 'रास व नक्षत्र:'}</span>
                  <span className="text-slate-900 font-black">{[currentProfile.rashi, currentProfile.nakshatra].filter(Boolean).join(' / ') || (isEn ? 'Nirdosh' : 'निर्दोष')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isEn ? 'Nadi & Gan:' : 'नाडी व गण:'}</span>
                  <span className="text-slate-900 font-black">{[currentProfile.nadi, currentProfile.gan].filter(Boolean).join(' • ') || (isEn ? 'Not available' : 'उपलब्ध नाही')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isEn ? 'Manglik Status:' : 'मांगलिक / दोष:'}</span>
                  <span className="text-emerald-700 font-black">{currentProfile.horoscopeManglik === 'manglik' ? (isEn ? 'Manglik' : 'मांगलिक') : (isEn ? 'Non-Manglik' : 'निर्दोष पत्रिका')}</span>
                </div>
              </div>

              {/* Family Details */}
              <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-xs space-y-1.5 text-xs text-slate-800">
                <p><strong>{isEn ? "Father's Name:" : 'वडिलांचे नाव:'}</strong> {currentProfile.fatherName || (isEn ? 'Not specified' : 'माहिती उपलब्ध नाही')} ({currentProfile.fatherOccupation || ''})</p>
                <p><strong>{isEn ? "Mother's Name:" : 'आईचे नाव:'}</strong> {currentProfile.motherName || (isEn ? 'Not specified' : 'माहिती उपलब्ध नाही')} ({currentProfile.motherOccupation || ''})</p>
                <p><strong>{isEn ? 'Siblings:' : 'भाऊ / बहीण:'}</strong> {currentProfile.brothers || 0} {isEn ? 'Brothers' : 'भाऊ'}, {currentProfile.sisters || 0} {isEn ? 'Sisters' : 'बहिणी'}</p>
                <p><strong>{isEn ? "Uncle (Mama's) Details:" : 'मामांचे गाव/नाव:'}</strong> {currentProfile.mamaName || ''} {currentProfile.mamaNative ? `(${currentProfile.mamaNative})` : ''}</p>
                {currentProfile.relativeSurnames && currentProfile.relativeSurnames.length > 0 && (
                  <p><strong>{isEn ? 'Relative Surnames:' : 'नातेगोते / पाहुणे आडनावे:'}</strong> {currentProfile.relativeSurnames.join(', ')}</p>
                )}
              </div>

              {/* Expectations */}
              {currentProfile.expectations && (
                <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-300 text-xs">
                  <span className="font-extrabold text-[#A71930] block mb-1">{isEn ? 'Partner Preferences:' : 'अपेक्षा (Expectations):'}</span>
                  <p className="text-slate-800 font-medium italic">"{currentProfile.expectations}"</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectProfile(currentProfile);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer mt-2"
            >
              {isEn ? 'Unlock Contact Info' : 'संपर्क माहिती अनलॉक करा'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Vertical Reels / Hinge Style System
  if (gestureMode === 'vertical_reels') {
    return (
      <div className="relative w-full max-w-md mx-auto h-[640px] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border-2 border-amber-300 flex flex-col select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative flex-1 w-full h-full flex flex-col justify-end p-5"
          >
            {/* Background Photo */}
            <img
              src={photos[0]}
              alt={currentProfile.fullName}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            {/* Vertical Controls Sidebar */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={prevProfile}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white cursor-pointer shadow-lg"
                title={isEn ? 'Previous Profile' : 'मागील प्रोफाईल (Swipe Down)'}
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleLikeProfile(currentProfile.id);
                  sendInterest(currentProfile.id);
                }}
                className={`p-3.5 rounded-full cursor-pointer shadow-lg transition-transform active:scale-90 ${
                  isLiked ? 'bg-rose-600 text-white' : 'bg-white/20 backdrop-blur-md text-white'
                }`}
                title={isEn ? 'Like' : 'लाईक / पसंती'}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleShortlist(currentProfile.id)}
                className={`p-3.5 rounded-full cursor-pointer shadow-lg transition-transform active:scale-90 ${
                  isShortlisted ? 'bg-amber-400 text-slate-950' : 'bg-white/20 backdrop-blur-md text-white'
                }`}
                title={isEn ? 'Shortlist' : 'शॉर्टलिस्ट'}
              >
                <Star className={`w-6 h-6 ${isShortlisted ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => onSelectProfile(currentProfile)}
                className="p-3.5 bg-emerald-600 text-white rounded-full cursor-pointer shadow-lg"
                title={isEn ? 'View Biodata' : 'बायोडाटा उघडा'}
              >
                <Info className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={nextProfile}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white cursor-pointer shadow-lg"
                title={isEn ? 'Next Profile' : 'पुढील प्रोफाईल (Swipe Up)'}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Overlay at Bottom */}
            <div className="relative z-10 space-y-2 pr-14 text-white">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black drop-shadow">{currentProfile.fullName}, {currentProfile.age}</h3>
                {(currentProfile.isVerified || currentProfile.aadhaarVerified) && (
                  <ShieldCheck className="w-5 h-5 text-amber-400 fill-amber-400" />
                )}
              </div>

              <SmartBadgeRow profile={currentProfile} showQuickInfo={false} />

              <p className="text-xs text-amber-100 font-semibold drop-shadow">
                {[currentProfile.education, currentProfile.occupation, currentProfile.city, currentProfile.district]
                  .filter(Boolean)
                  .join(' • ')}
              </p>

              <button
                type="button"
                onClick={() => onSelectProfile(currentProfile)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg mt-2 cursor-pointer"
              >
                {isEn ? 'Unlock Details & Contact' : 'संपूर्ण माहिती व संपर्क अनलॉक करा'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // DEFAULT: 4-WAY MULTI-ACTION SWIPE (Left: Skip, Right: Like, Up: Super/Bio, Down: Star)
  return (
    <div className="relative w-full max-w-md mx-auto h-[620px] select-none my-4 flex flex-col items-center justify-center">
      {/* Background Next Card Preview */}
      {profiles[currentIndex + 1] && (
        <div className="absolute inset-x-4 inset-y-2 rounded-3xl bg-slate-200 border border-slate-300 overflow-hidden opacity-60 scale-95 pointer-events-none" />
      )}

      {/* Active Draggable Card */}
      <motion.div
        style={{ x: dragX, y: dragY, rotate: cardRotate }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        className="relative w-full h-full rounded-3xl bg-white shadow-2xl border-2 border-amber-300 overflow-hidden cursor-grab active:cursor-grabbing flex flex-col"
      >
        {/* Swipe Stamp Indicators */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-8 z-30 px-4 py-1.5 rounded-xl border-4 border-emerald-500 bg-emerald-500/20 text-emerald-600 font-black text-2xl tracking-wider -rotate-12 pointer-events-none"
        >
          LIKE 💖
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-8 z-30 px-4 py-1.5 rounded-xl border-4 border-rose-500 bg-rose-500/20 text-rose-600 font-black text-2xl tracking-wider rotate-12 pointer-events-none"
        >
          SKIP ✖️
        </motion.div>

        <motion.div
          style={{ opacity: superOpacity }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-xl border-4 border-sky-500 bg-sky-500/20 text-sky-600 font-black text-xl tracking-wider pointer-events-none"
        >
          BIODATA 📖
        </motion.div>

        <motion.div
          style={{ opacity: starOpacity }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-xl border-4 border-amber-500 bg-amber-500/20 text-amber-600 font-black text-xl tracking-wider pointer-events-none"
        >
          SHORTLIST ⭐
        </motion.div>

        {/* Profile Image Top */}
        <div className="relative h-[380px] w-full bg-slate-900">
          <img
            src={photos[0]}
            alt={currentProfile.fullName}
            style={{ filter: isPhotoBlurred ? 'blur(16px)' : 'none' }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Profile Index Tag */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs border border-white/20">
            {currentIndex + 1} / {profiles.length}
          </div>

          {/* Name & Location Overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black drop-shadow">{formatProfileDisplayName(currentProfile.fullName, currentUser, false, isAuthorized, siteConfig, language)}, {currentProfile.age}</h3>
              {(currentProfile.isVerified || currentProfile.aadhaarVerified) && (
                <ShieldCheck className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
            </div>
            <p className="text-xs text-amber-200 font-bold drop-shadow">
              {[currentProfile.city, currentProfile.district].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        {/* Bottom Details & Actions */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-white">
          <SmartBadgeRow profile={currentProfile} showQuickInfo={true} />

          {/* Gesture Instruction Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>{isEn ? '👈 Left: Skip' : '👈 डावीकडे: Skip'}</span>
            <span>{isEn ? '👆 Up: Biodata' : '👆 वर: बायोडाटा'}</span>
            <span>{isEn ? 'Right: Like 👉' : 'उजवीकडे: Like 👉'}</span>
          </div>

          {/* 4 Interactive Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={nextProfile}
              className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-sm cursor-pointer transition-transform active:scale-90"
              title={isEn ? 'Pass (Skip)' : 'पुढील स्थळ (Pass)'}
            >
              <X className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => toggleShortlist(currentProfile.id)}
              className={`p-3.5 rounded-2xl border shadow-sm cursor-pointer transition-transform active:scale-90 ${
                isShortlisted
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
              }`}
              title={isEn ? 'Shortlist (Save)' : 'शॉर्टलिस्ट (Save)'}
            >
              <Star className={`w-6 h-6 ${isShortlisted ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                toggleLikeProfile(currentProfile.id);
                sendInterest(currentProfile.id);
              }}
              className={`p-3.5 rounded-2xl border shadow-sm cursor-pointer transition-transform active:scale-90 ${
                isLiked
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
              title={isEn ? 'Like Profile' : 'लाईक / पसंती (Like)'}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onSelectProfile(currentProfile)}
              className="flex-1 py-3 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 font-black text-xs rounded-2xl shadow cursor-pointer text-center"
            >
              {isEn ? 'Open Biodata' : 'बायोडाटा उघडा'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
