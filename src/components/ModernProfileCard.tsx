import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';
import {
  Heart,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Eye,
  Phone,
  Lock,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { SafeAvatar } from './SafeAvatar';

interface ModernProfileCardProps {
  profile: UserProfile;
  onView?: (profile: UserProfile) => void;
  onLike?: (profileId: string) => void;
  onContact?: (profile: UserProfile) => void;
}

export const ModernProfileCard: React.FC<ModernProfileCardProps> = ({
  profile,
  onView,
  onLike,
  onContact,
}) => {
  const {
    currentUser,
    likedProfileIds,
    toggleLikeProfile,
    setSelectedProfileForModal,
    setIsLoginOpen,
    setLoginModalMode,
    setIsPaymentOpen,
    interests,
    unlockedContacts,
    setActiveChatUser,
    siteConfig,
  } = useApp();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLiked = likedProfileIds?.includes(profile.id);
  const isAadhaarVerified = profile.aadhaarVerified || profile.isVerified;

  // Mutual Match Calculation
  const isMutualMatch = Boolean(
    currentUser &&
      (isLiked ||
        interests?.some(
          (i) => i.fromUserId === currentUser.id && i.toUserId === profile.id && i.status !== 'rejected'
        )) &&
      ((profile.likedProfileIds || []).includes(currentUser.id) ||
        (currentUser.likedByUsers || []).includes(profile.id) ||
        interests?.some(
          (i) => i.fromUserId === profile.id && i.toUserId === currentUser.id && i.status !== 'rejected'
        ))
  );

  const isContactUnlocked = Boolean(currentUser && unlockedContacts?.includes(profile.id));

  // Name and Photo Privacy: If mutual match or owner, show full name.
  const isPhotoPrivate = Boolean(
    profile.privacy?.hidePhoto ||
      profile.privacy?.photoVisibility === 'hidden' ||
      (profile.privacy?.photoVisibility === 'visible_to_verified_only' && !currentUser?.aadhaarVerified)
  );
  const shouldMaskPhoto = isPhotoPrivate && !isMutualMatch;

  const displayName =
    isMutualMatch || !shouldMaskPhoto
      ? profile.fullName || `VJ-${profile.registrationId || profile.id.slice(0, 5)}`
      : `VJ-${profile.registrationId || profile.id.slice(0, 5)}`;

  const defaultPhoto =
    profile.gender === 'bride'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';

  const photoUrl =
    profile.photos && profile.photos.length > 0
      ? profile.photos[0]
      : profile.photoUrl || defaultPhoto;

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setLoginModalMode('member_otp');
      setIsLoginOpen(true);
      return;
    }
    if (onView) {
      onView(profile);
    } else {
      setSelectedProfileForModal(profile);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setLoginModalMode('member_otp');
      setIsLoginOpen(true);
      return;
    }
    if (onLike) {
      onLike(profile.id);
    } else {
      toggleLikeProfile(profile.id);
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setLoginModalMode('member_otp');
      setIsLoginOpen(true);
      return;
    }

    if (isMutualMatch && isContactUnlocked) {
      alert(`📞 मोबाईल क्रमांक: ${profile.mobile || 'माहिती उपलब्ध नाही'}`);
      return;
    }

    if (!isMutualMatch) {
      alert(
        '🔒 गोपनीयता सुरक्षा नियम: थेट मोबाईल क्रमांक पाहण्यासाठी दोघांची परस्पर पसंती (Mutual Like Match) आवश्यक आहे.\n\nकृपया या स्थळाला ❤️ लाईक करा. समोरून पसंती आल्यास संपर्क क्रमांक अनलॉक होईल.'
      );
      return;
    }

    if (onContact) {
      onContact(profile);
    } else {
      setSelectedProfileForModal(profile);
    }
  };

  return (
    <div
      onClick={handleView}
      className={`group bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative ${
        isMutualMatch
          ? 'border-rose-300 ring-2 ring-rose-400/20'
          : 'border-amber-200/80 hover:border-amber-400'
      }`}
    >
      {/* Photo Container */}
      <div className="relative w-full aspect-4/5 sm:aspect-square bg-slate-100 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
        )}

        <img
          src={imageError ? defaultPhoto : photoUrl}
          alt={displayName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageLoaded(true);
            setImageError(true);
          }}
          className={`w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 ${
            shouldMaskPhoto ? 'filter blur-md scale-105 opacity-80' : ''
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Masked Photo Lock Overlay */}
        {shouldMaskPhoto && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center pointer-events-none bg-black/20">
            <div className="p-2 rounded-full bg-black/60 backdrop-blur-xs text-amber-200 mb-1">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs">
              फोटो परस्पर पसंतीनंतर दृश्यमान
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Gender / Mutual Match Badge */}
          {isMutualMatch ? (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>💕 Mutual Match</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-[#800C1E]/85 backdrop-blur-md text-amber-100 text-[10px] font-bold">
              {profile.gender === 'bride' ? '👰 वधू' : '🤵 वर'}
            </span>
          )}

          {/* Verified Badge */}
          {isAadhaarVerified && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>सत्यापित</span>
            </span>
          )}
        </div>

        {/* Bottom Floating Info on Photo */}
        <div className="absolute bottom-2 left-2.5 right-2.5 text-white pointer-events-none">
          <div className="flex items-center gap-1.5">
            <h3 className="font-black text-sm sm:text-base leading-snug drop-shadow-md truncate">
              {displayName}
            </h3>
            {!isMutualMatch && shouldMaskPhoto && (
              <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-amber-200 font-bold drop-shadow-xs">
            {profile.age ? `${profile.age} वर्षे` : ''}
            {profile.height ? ` • ${profile.height}` : ''}
            {profile.maritalStatus === 'never_married' ? ' • अविवाहित' : ''}
          </p>
        </div>
      </div>

      {/* Info Details Body */}
      <div className="p-3 space-y-2 text-slate-700 text-xs flex-1">
        {/* Education */}
        <div className="flex items-center gap-1.5 truncate">
          <GraduationCap className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
          <span className="font-semibold text-slate-800 truncate">
            {profile.education || 'पदवीधर / उच्चशिक्षित'}
          </span>
        </div>

        {/* Occupation */}
        <div className="flex items-center gap-1.5 truncate">
          <Briefcase className="w-3.5 h-3.5 text-[#800C1E] shrink-0" />
          <span className="text-slate-600 truncate">
            {profile.occupation || 'नोकरी / व्यवसाय'}
          </span>
        </div>

        {/* Location & Caste */}
        <div className="flex items-center gap-1.5 text-slate-600 truncate">
          <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="truncate">
            {profile.district ? `${profile.district}` : 'महाराष्ट्र'}
            {profile.city ? `, ${profile.city}` : ''}
            {' • वंजारी'}
          </span>
        </div>
      </div>

      {/* 3 Essential Clean Action Buttons (❤️ Like, 👁 View, 📞 Contact) */}
      <div className="p-2.5 pt-0 border-t border-slate-100 grid grid-cols-3 gap-1.5 mt-auto">
        {/* ❤️ Like */}
        <button
          type="button"
          onClick={handleLike}
          className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition active:scale-95 cursor-pointer min-h-[44px] ${
            isLiked
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200'
          }`}
          title="पसंती कळवा"
          aria-label="Like Profile"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-600 fill-rose-600' : ''}`} />
          <span className="text-[11px]">{isLiked ? 'पसंत' : 'लाईक'}</span>
        </button>

        {/* 👁 View */}
        <button
          type="button"
          onClick={handleView}
          className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800 border border-slate-200 hover:border-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer min-h-[44px]"
          title="संपूर्ण बायोडाटा पहा"
          aria-label="View Profile"
        >
          <Eye className="w-4 h-4 text-slate-600" />
          <span className="text-[11px]">पहा</span>
        </button>

        {/* 📞 Contact / Chat */}
        {isMutualMatch ? (
          <button
            type="button"
            onClick={() => setActiveChatUser(profile)}
            className="py-2 px-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer min-h-[44px] shadow-xs"
            title="थेट चॅट करा"
            aria-label="Chat with Mutual Match"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="text-[11px]">चॅट</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContact}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer min-h-[44px] ${
              isContactUnlocked
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}
            title="संपर्क (परस्पर पसंतीनंतर)"
            aria-label="Contact Family"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">संपर्क</span>
          </button>
        )}
      </div>
    </div>
  );
};
