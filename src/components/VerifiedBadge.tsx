import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Award, Camera, Smartphone } from 'lucide-react';
import { UserProfile } from '../types';

interface VerifiedBadgeProps {
  profile?: UserProfile;
  isVerified?: boolean;
  isFaceVerified?: boolean;
  isPhoneVerified?: boolean;
  isIdVerified?: boolean;
  isPhotoVerified?: boolean;
  isPremiumVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  profile,
  isVerified: propIsVerified,
  isFaceVerified: propIsFaceVerified,
  isPhoneVerified: propIsPhoneVerified,
  isIdVerified: propIsIdVerified,
  isPhotoVerified: propIsPhotoVerified,
  isPremiumVerified: propIsPremiumVerified,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Custom badge assigned by Admin (e.g. 'सरकारी अधिकारी', 'VIP Gold', '100% Genuine')
  const customBadgeText = profile?.hideBadge ? null : (profile?.badge || profile?.customBadge || profile?.adminBadge);

  const showManualVerified = Boolean(
    profile?.showVerifiedBadge || profile?.manuallyVerified || profile?.isVerified || propIsVerified || profile?.verification_status === 'Approved'
  );

  const isKycApproved = Boolean(
    profile?.verification_status === 'Approved' || profile?.isVerified || profile?.showVerifiedBadge
  );

  const showFaceVerified = Boolean(
    profile?.isFaceVerified || propIsFaceVerified
  );

  const showPhoneVerified = Boolean(
    profile?.isPhoneVerified || profile?.truecallerVerified || propIsPhoneVerified
  );

  const isPremiumVerified = profile ? Boolean(profile.isPremiumVerified) : Boolean(propIsPremiumVerified);

  if (!showManualVerified && !isPremiumVerified && !customBadgeText && !showFaceVerified && !showPhoneVerified) {
    return null;
  }

  const textSizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  return (
    <div className={`inline-flex items-center flex-wrap gap-1 ${className}`}>
      {/* Phone Verified Badge (📱 मोबाईल नंबर व्हेरिफाइड / Truecaller) */}
      {showPhoneVerified && (
        <span
          className={`rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black border border-blue-300 shadow-xs inline-flex items-center gap-1 ${textSizes[size]}`}
          title={profile?.truecallerName ? `Truecaller व्हेरिफाइड: ${profile.truecallerName}` : "ट्रू कॉलर / OTP द्वारे अधिकृत पडताळणी झालेला मोबाईल नंबर"}
        >
          <Smartphone className="w-3 h-3 text-cyan-100 shrink-0" />
          <span>{showLabel ? (profile?.phoneVerificationMethod === 'truecaller' ? 'Truecaller व्हेरिफाइड' : 'नंबर व्हेरिफाइड') : '✓'}</span>
        </span>
      )}

      {/* Face Verified Badge (📸 फेस व्हेरिफाइड) */}
      {showFaceVerified && (
        <span
          className={`rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black border border-teal-300 shadow-xs inline-flex items-center gap-1 ${textSizes[size]}`}
          title="लाईव्ह सेल्फी / फेस व्हेरिफिकेशन पूर्ण झालेले प्रोफाइल"
        >
          <Camera className="w-3 h-3 text-teal-100 shrink-0" />
          <span>{showLabel ? 'फेस व्हेरिफाइड' : '✓'}</span>
        </span>
      )}

      {/* Custom Admin Assigned Badge */}
      {customBadgeText && (
        <span
          className={`rounded-full bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 text-[#800C1E] border-2 border-amber-400 font-black ${textSizes[size]} inline-flex items-center gap-1 shadow-xs`}
        >
          <Award className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
          <span>{customBadgeText}</span>
        </span>
      )}

      {/* Official KYC Approved Blue Tick Badge */}
      {isKycApproved && (
        <span
          className={`rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-300 font-black ${textSizes[size]} inline-flex items-center gap-1 shadow-sm`}
          title="अधिकृत ओळखपत्र व पडताळणी पूर्ण (Verified Profile)"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-200 fill-blue-500 shrink-0" />
          <span>{showLabel ? 'प्रमाणित (Verified)' : ''}</span>
        </span>
      )}

      {/* Manual Admin Verified / 100% Verified Badge */}
      {showManualVerified && !isKycApproved && (
        <span
          className={`rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold ${textSizes[size]} inline-flex items-center gap-1 shadow-2xs`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{showLabel ? 'प्रमाणित' : ''}</span>
        </span>
      )}

      {/* Premium Member Badge */}
      {isPremiumVerified && (
        <span
          className={`rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold ${textSizes[size]} inline-flex items-center gap-1 shadow-2xs`}
        >
          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{showLabel ? 'प्रीमियम' : ''}</span>
        </span>
      )}
    </div>
  );
};
