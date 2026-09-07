import React from 'react';
import { UserProfile } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { X, Scale, Heart, Sparkles, MapPin, Briefcase, GraduationCap, Calendar, Check, Scroll, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { getPhotoAccessStatus } from '../utils/photoAccess';

interface ProfileCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profilesToCompare: UserProfile[];
  onRemoveProfile: (profileId: string) => void;
  onSelectForKundli?: (profile: UserProfile) => void;
}

export const ProfileCompareModal: React.FC<ProfileCompareModalProps> = ({
  isOpen,
  onClose,
  profilesToCompare,
  onRemoveProfile,
  onSelectForKundli,
}) => {
  const {
    setSelectedProfileForModal,
    toggleShortlist,
    shortlistedIds,
    sendInterest,
    likedProfileIds,
    currentUser,
    siteConfig,
    language,
    isContactAuthorizedForUser,
    interests,
    isAdminLoggedIn,
    isProfilePlanExpired,
  } = useApp();

  if (!isOpen || profilesToCompare.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-[#FFFDF9] w-full max-w-5xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-300/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-amber-100 flex items-center gap-2">
                <span>⚔️ बायोडाटा आमने-सामने तुलना (Profile Comparison)</span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                निवडलेल्या {profilesToCompare.length} प्रोफाईल्सची शिक्षण, नोकरी, शहर व अपेक्षांची तुलना
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable Comparison Table */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profilesToCompare.map((profile) => {
              const isShortlisted = shortlistedIds.includes(profile.id);
              const isLiked = likedProfileIds.includes(profile.id);
              const mainPhoto = profile.photos?.[0] || profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';

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
                isAdminLoggedIn,
                isAuthorized || isMutualMatch,
                siteConfig,
                language,
                isMutualMatch,
                profile.id
              );
              const photoAccess = getPhotoAccessStatus({
                currentUser,
                targetProfile: profile,
                isProfilePlanExpired,
                isMutualMatch,
                siteConfig,
              });
              const isPhotoBlurred = photoAccess.isBlurred;

              return (
                <div
                  key={profile.id}
                  className="bg-white border-2 border-amber-200 rounded-3xl p-4 shadow-md flex flex-col relative space-y-4 hover:border-[#800C1E] transition-all"
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveProfile(profile.id)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white transition cursor-pointer"
                    title="तुलनेतून काढा"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Photo & Name Header */}
                  <div className="text-center space-y-2">
                    <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm">
                      <img
                        src={mainPhoto}
                        alt={displayName}
                        className={`w-full h-full object-cover ${isPhotoBlurred ? 'filter blur-md scale-110 opacity-70' : ''}`}
                      />
                      {isPhotoBlurred && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                          <Lock className="w-6 h-6 text-amber-300 drop-shadow" />
                        </div>
                      )}
                      {profile.isVerified && (
                        <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full shadow">
                          <VerifiedBadge profile={profile} size="sm" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-snug">
                        {displayName}
                      </h3>
                      <div className="text-xs font-bold text-[#800C1E] mt-0.5">
                        {profile.age} वर्षे • {profile.height}
                      </div>
                    </div>
                  </div>

                  {/* Comparison Field Cards */}
                  <div className="space-y-2 text-xs divide-y divide-amber-100 flex-1">
                    <div className="pt-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">📍 स्थान (City / District):</span>
                      <span className="font-bold text-slate-800">{profile.city || profile.district}</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">🎓 शिक्षण (Education):</span>
                      <span className="font-bold text-slate-800">{profile.education || 'माहिती दिलेली नाही'}</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">💼 नोकरी / व्यवसाय (Occupation):</span>
                      <span className="font-bold text-slate-800">{profile.occupation || 'माहिती दिलेली नाही'}</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">💰 वार्षिक उत्पन्न (Income):</span>
                      <span className="font-bold text-slate-800">{profile.income || 'गोपनीय'}</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">💍 वैवाहिक स्थिती (Marital Status):</span>
                      <span className="font-bold text-slate-800">
                        {profile.maritalStatus === 'never_married' ? 'अविवाहित' : 'घटस्फोटीत / इतर'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">🌌 मंगळ स्थिती (Manglik):</span>
                      <span className="font-bold text-slate-800">
                        {profile.horoscopeManglik === 'manglik' ? '⚠️ मंगळ आहे' : '✅ मंगळ नाही'}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">🎯 अपेक्षा (Expectations):</span>
                      <p className="font-medium text-slate-700 line-clamp-3 italic bg-amber-50/60 p-2 rounded-xl border border-amber-100 mt-1">
                        "{profile.expectations || 'अनुरूप वधू/वर अपेक्षा'}"
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => sendInterest(profile.id)}
                        className={`py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                          isLiked
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#800C1E] hover:bg-[#A71930] text-amber-100'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{isLiked ? 'पसंत केले' : 'पसंती (Like)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProfileForModal(profile)}
                        className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-extrabold text-xs transition cursor-pointer text-center"
                      >
                        बायोडाटा पहा
                      </button>
                    </div>

                    {onSelectForKundli && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectForKundli(profile);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Scroll className="w-3.5 h-3.5" />
                        <span>🔮 ३६ गुण जुळवणी करा</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
