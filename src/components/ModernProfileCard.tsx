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
  Crown,
} from 'lucide-react';
import { SafeAvatar } from './SafeAvatar';
import { getPhotoAccessStatus } from '../utils/photoAccess';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { formatMemberId } from '../utils/idUtils';
import { AdminEditProfileModal } from './AdminEditProfileModal';
import { ReportProfileModal } from './ReportProfileModal';
import { ActivationCodeModal } from './ActivationCodeModal';
import { Edit3, ShieldAlert } from 'lucide-react';

interface ModernProfileCardProps {
  profile: UserProfile;
  onView?: (profile: UserProfile) => void;
  onLike?: (profileId: string) => void;
  onContact?: (profile: UserProfile) => void;
}

export const ModernProfileCard: React.FC<ModernProfileCardProps> = React.memo(({
  profile,
  onView,
  onLike,
  onContact,
}) => {
  const {
    currentUser,
    language,
    likedProfileIds,
    toggleLikeProfile,
    setSelectedProfileForModal,
    setIsLoginOpen,
    setLoginModalMode,
    setIsPaymentOpen,
    interests,
    pendingLikes,
    unlockedContacts,
    setActiveChatUser,
    siteConfig,
    isAdminLoggedIn,
    isProfilePlanExpired,
    updateProfileDirect,
    addNotification,
    openCompliantAssistedModal,
  } = useApp();

  const isEn = language === 'en';

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

  const isUserAdmin = Boolean(isAdminLoggedIn || currentUser?.isAdmin || currentUser?.id === 'admin');
  const isLiked = Boolean(
    currentUser &&
      (likedProfileIds?.includes(profile.id) ||
        (currentUser.likedProfileIds || []).includes(profile.id) ||
        (profile.likedByUsers || []).includes(currentUser.id) ||
        interests?.some(
          (i) => i.fromUserId === currentUser.id && i.toUserId === profile.id && i.status !== 'rejected'
        ) ||
        (pendingLikes || []).some((l) => l.fromUserId === currentUser.id && l.toProfileId === profile.id))
  );
  const hasTargetLikedMe = Boolean(
    currentUser &&
      ((profile.likedProfileIds || []).includes(currentUser.id) ||
        (currentUser.likedByUsers || []).includes(profile.id) ||
        interests?.some(
          (i) => i.fromUserId === profile.id && i.toUserId === currentUser.id && i.status !== 'rejected'
        ) ||
        (pendingLikes || []).some((l) => l.fromUserId === profile.id && l.toProfileId === currentUser.id) ||
        (profile.shortlistedByUsers || []).includes(currentUser.id))
  );
  const isAadhaarVerified = profile.aadhaarVerified || profile.isVerified;

  // Mutual Match Calculation
  const isMutualMatch = Boolean(currentUser && isLiked && hasTargetLikedMe);

  const isContactUnlocked = Boolean(currentUser && (unlockedContacts?.includes(profile.id) || isMutualMatch));

  // Photo Access Verification
  const photoAccess = getPhotoAccessStatus({
    currentUser,
    targetProfile: profile,
    isProfilePlanExpired,
    isMutualMatch,
    siteConfig,
  });
  const isPhotoBlurred = photoAccess.isBlurred;

  const displayName = formatProfileDisplayName(
    profile.fullName,
    currentUser,
    Boolean(currentUser?.isAdmin || isAdminLoggedIn),
    isContactUnlocked || isMutualMatch,
    siteConfig,
    language,
    isMutualMatch,
    profile.id
  );

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

    if (onContact) {
      onContact(profile);
    } else {
      setSelectedProfileForModal(profile);
    }
  };

  const allUploadedPhotosCount = Array.from(
    new Set(
      [
        ...(profile.photos || []),
        ...(profile.photoUrl ? [profile.photoUrl] : []),
        ...(profile.biodataPdfUrl ? [profile.biodataPdfUrl] : []),
      ].filter(Boolean)
    )
  ).length || 1;

  return (
    <div
      onClick={handleView}
      className={`group bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EE] to-[#F7EFE0] rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative ${
        isMutualMatch
          ? 'border-emerald-500 ring-2 ring-emerald-400/40'
          : 'border-amber-400/80 hover:border-[#800C1E]'
      }`}
    >
      {/* Royal Biodata Top Header Bar */}
      <div className="bg-gradient-to-r from-[#6B0818] via-[#8F1125] to-[#5E0715] text-white px-3 py-2 flex items-center justify-between gap-2 border-b border-amber-400/50">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shrink-0 shadow-2xs">
            {profile.gender === 'bride' ? (isEn ? '👰 Bride' : '👰 वधू बायोडाटा') : (isEn ? '🤵 Groom' : '🤵 वर बायोडाटा')}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/35 text-amber-300 font-mono text-[10px] font-black border border-amber-400/30 shrink-0">
            {formatMemberId(profile.id)}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isUserAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAdminEditOpen(true);
              }}
              className="px-2 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3 h-3 text-slate-950" />
              <span>{isEn ? 'Edit' : 'एडिट'}</span>
            </button>
          )}
          {isAadhaarVerified && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center gap-0.5 border border-emerald-300/50">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>{isEn ? 'Verified' : 'सत्यापित'}</span>
            </span>
          )}
          {currentUser?.id !== profile.id && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReportModalOpen(true);
              }}
              className="p-1 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
              title="रिपोर्ट प्रोफाइल"
            >
              <ShieldAlert className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Strictly Admin-Only Status Bar (Never visible to regular users) */}
      {isUserAdmin && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 text-white px-2.5 py-1 flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-black border-b border-amber-400/30"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {(profile.isRegisteredByAdmin || profile.registrationType === 'admin_direct') ? (
              <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/50">
                🛡️ ॲडमिनने भरलेला प्रोफाईल
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                👤 युजरने स्वतः भरलेला
              </span>
            )}
            {profile.isFreeAdminPlan ? (
              <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/50">
                🎁 मोफत प्लॅन (Free Granted)
              </span>
            ) : profile.hasPaidMembership ? (
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                💎 पेड मेंबर
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-400/40">
                ⏳ अनपेड
              </span>
            )}
          </div>
          {profile.mobile && (
            <span className="font-mono text-amber-300">{profile.mobile}</span>
          )}
        </div>
      )}

      {/* Compact Traditional & Modern Marathi Biodata Body (Photo + Identity Side-by-Side) */}
      <div className="p-2.5 flex-1 flex flex-col">
        <div className="bg-white rounded-xl p-3 border-2 border-amber-300/80 shadow-xs space-y-2.5 text-xs text-slate-800 flex-1">
          
          {/* Top Row: Compact Passport Portrait Photo (Left) + Candidate Identity & Quick Facts (Right) */}
          <div className="flex items-start gap-3 border-b-2 border-amber-200/80 pb-2.5">
            {/* Compact Passport-Size Portrait Photo (Takes minimal vertical space while scrolling!) */}
            <div className="relative w-24 h-28 sm:w-28 sm:h-32 bg-slate-900 rounded-xl overflow-hidden border-2 border-amber-400/90 shadow-sm shrink-0">
              {photoAccess.isCompletelyHidden ? (
                <div className="w-full h-full bg-gradient-to-b from-[#2B060D] via-[#1A0307] to-slate-900 flex flex-col items-center justify-center p-1.5 text-center select-none">
                  <div className="p-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 mb-1">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] text-amber-200 font-black leading-tight">
                    🔒 फोटो सुरक्षित
                  </span>
                </div>
              ) : (
                <>
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-amber-50/50 to-slate-200 animate-pulse" />
                  )}

                  <img
                    src={imageError ? defaultPhoto : photoUrl}
                    alt={displayName}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageLoaded(true);
                      setImageError(true);
                    }}
                    className={`w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 ${
                      isPhotoBlurred ? 'filter blur-md scale-110 opacity-75' : ''
                    } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />

                  {/* Masked/Blurred Photo Compact Lock Overlay */}
                  {isPhotoBlurred && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1.5 text-center bg-black/45 backdrop-blur-[1px] z-10 select-none">
                      <div className="p-1.5 rounded-full bg-black/80 border border-amber-300/70 text-amber-300 mb-1 shadow">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9px] text-amber-200 font-black px-1.5 py-0.5 rounded bg-black/80 border border-amber-300/40 leading-tight">
                        🔒 लॉक फोटो
                      </span>
                    </div>
                  )}

                  {/* Bottom Photo Counter Pill */}
                  <div className="absolute bottom-1 inset-x-1 flex items-center justify-center z-10 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded bg-black/80 text-amber-300 text-[9px] font-black border border-amber-400/40 flex items-center gap-0.5 shadow">
                      <span>📸 {allUploadedPhotosCount} फोटो</span>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Devotional Header + Candidate Name + Age/Height/District */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] sm:text-[10px] font-black text-amber-800 tracking-wide truncate">
                  ॥ श्री संत भगवान बाबा प्रसन्न ॥
                </span>
                {isMutualMatch && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black shrink-0">
                    💕 जुळले
                  </span>
                )}
              </div>

              <h3 className="font-black text-[#800C1E] text-sm sm:text-base leading-snug break-words">
                {displayName}
              </h3>

              {/* Compact 2x2 Grid right next to photo */}
              <div className="grid grid-cols-2 gap-1 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/90 text-[11px]">
                <div>
                  <span className="text-slate-500 font-bold block text-[9.5px]">🎂 वय / जन्म:</span>
                  <span className="font-black text-slate-900">
                    {profile.age ? `${profile.age} वर्षे` : '24 वर्षे'} {profile.dob ? `(${profile.dob.slice(0, 4)})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[9.5px]">📏 उंची:</span>
                  <span className="font-black text-slate-900">
                    {profile.height || '5 ft 4 in'}{profile.bloodGroup ? ` (${profile.bloodGroup})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 text-[10.5px] font-black">
                <span className="px-2 py-0.5 rounded-md bg-[#800C1E]/10 text-[#800C1E] border border-[#800C1E]/25 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#800C1E] shrink-0" />
                  <span>{profile.district || 'महाराष्ट्र'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                  {profile.subCaste || 'वंजारी'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Biodata Rows */}
          <div className="space-y-1.5 text-[12px] sm:text-[12.5px] leading-snug pt-0.5">
            <div className="flex items-start gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200/70">
              <GraduationCap className="w-4 h-4 text-[#800C1E] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-600">शिक्षण: </span>
                <span className="font-black text-[#800C1E] break-words">
                  {profile.education || 'पदवीधर / उच्चशिक्षित'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-200/70">
              <Briefcase className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-600">नोकरी / व्यवसाय: </span>
                <span className="font-black text-emerald-950 break-words">
                  {profile.occupation || 'नोकरी / व्यवसाय'}
                </span>
                {profile.income ? (
                  <span className="block text-[11px] font-extrabold text-emerald-800 mt-0.5">
                    💰 उत्पन्न: {profile.income}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-1.5 px-1">
              <MapPin className="w-3.5 h-3.5 text-[#800C1E] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-600">गाव / जिल्हा: </span>
                <span className="font-extrabold text-slate-900">
                  {profile.city ? `${profile.city}, ` : ''}
                  {profile.taluka && profile.taluka !== profile.city ? `ता. ${profile.taluka}, ` : ''}
                  जि. {profile.district || 'महाराष्ट्र'}
                </span>
                <span className="text-slate-400 mx-1">•</span>
                <span className="font-bold text-[#800C1E]">{profile.subCaste || 'वंजारी'}</span>
              </div>
            </div>

            {(profile.gotra || profile.rashi || profile.nakshatra) && (
              <div className="px-1 text-[11.5px] text-slate-700 border-t border-slate-100 pt-1">
                {profile.gotra ? <><strong className="text-slate-900">गोत्र:</strong> {profile.gotra} </> : null}
                {profile.rashi ? <>| <strong className="text-slate-900">राशी:</strong> {profile.rashi} </> : null}
                {profile.nakshatra ? <>| <strong className="text-slate-900">नक्षत्र:</strong> {profile.nakshatra}</> : null}
              </div>
            )}

            {(profile.fatherName || profile.mamaName || profile.brothers !== undefined) && (
              <div className="px-1 text-[11.5px] text-slate-700 border-t border-slate-100 pt-1">
                <strong className="text-slate-900">कौटुंबिक: </strong>
                {profile.fatherName ? `वडील: ${profile.fatherName} ` : ''}
                {profile.brothers !== undefined || profile.sisters !== undefined
                  ? `(${profile.brothers || 0} भाऊ, ${profile.sisters || 0} बहीण)`
                  : ''}
              </div>
            )}

            {profile.expectations && (
              <div className="px-1 text-[11.5px] text-slate-700 border-t border-slate-100 pt-1 line-clamp-2">
                <strong className="text-[#800C1E]">🤝 अपेक्षा:</strong> {profile.expectations}
              </div>
            )}
          </div>

          {/* Mobile Number Line inside Biodata Card */}
          <div className="pt-1.5 mt-1 border-t border-amber-200/80">
            {isMutualMatch || isContactUnlocked || isUserAdmin ? (
              <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-1 text-emerald-900 font-black text-xs">
                <span className="flex items-center gap-1 truncate font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>📞 मोबाईल: {profile.mobile || 'संपर्क अनलॉक'}</span>
                </span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                  ✓ अनलॉक
                </span>
              </div>
            ) : hasTargetLikedMe && !isLiked ? (
              <div className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 font-black text-[11px] flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600 shrink-0" />
                <span className="truncate">💝 यांनी तुम्हाला लाईक केले! परत ❤️ लाईक करा</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-700 font-bold flex items-center justify-between bg-amber-50/60 px-2 py-1 rounded-lg border border-amber-200/70">
                <span>
                  📱 <strong>मोबाईल:</strong>{' '}
                  <span className="font-mono text-slate-900">
                    {profile.mobile ? `${profile.mobile.slice(0, 2)}XXXXXX${profile.mobile.slice(-2)}` : '98XXXXXX10'}
                  </span>
                </span>
                <span className="text-[10px] text-[#800C1E] font-extrabold">
                  🔒 पसंतीनंतर खुला
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-2.5 pt-0 space-y-1.5">
        {/* Primary CTA: Click to View Full Biodata Sheet & Uploaded Photos */}
        <button
          type="button"
          onClick={handleView}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#800C1E] via-[#9B111E] to-[#6B0818] hover:brightness-110 text-amber-100 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm border border-amber-400/50 transition active:scale-95 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-amber-300 shrink-0" />
          <span>📄 संपूर्ण बायोडाटा पत्रक व फोटो पहा</span>
        </button>

        {/* Like & Chat Row */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleLike}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border transition active:scale-95 cursor-pointer ${
              isLiked
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : hasTargetLikedMe
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white hover:bg-rose-50 text-[#800C1E] border-amber-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-rose-600 fill-rose-600' : hasTargetLikedMe ? 'text-white fill-white' : 'text-[#800C1E]'}`} />
            <span>{isLiked ? '❤️ लाईक केले' : hasTargetLikedMe ? '💝 परत लाईक करा' : '❤️ पसंती पाठवा'}</span>
          </button>

          {isMutualMatch || isContactUnlocked ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveChatUser(profile);
              }}
              className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>💬 थेट चॅट करा</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContact}
              className="py-2 px-2 rounded-xl bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#800C1E]" />
              <span>संपर्क पहा</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Edit Profile Modal */}
      {isAdminEditOpen && (
        <AdminEditProfileModal
          isOpen={isAdminEditOpen}
          profile={profile}
          onClose={() => setIsAdminEditOpen(false)}
          onSave={(profileId, updatedFields) => {
            updateProfileDirect(profileId, updatedFields);
            if (addNotification) {
              addNotification({
                type: 'success',
                title: 'प्रोफाईल सेव्ह झाली',
                message: `${updatedFields.fullName || profile.fullName} यांची माहिती यशस्वीरित्या सेव्ह झाली!`,
              });
            }
            setIsAdminEditOpen(false);
          }}
          canEdit={true}
        />
      )}

      {/* Report Profile Modal */}
      {isReportModalOpen && (
        <ReportProfileModal
          isOpen={isReportModalOpen}
          profile={profile}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Activation Code Modal */}
      <ActivationCodeModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
      />
    </div>
  );
});
ModernProfileCard.displayName = 'ModernProfileCard';
