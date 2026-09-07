import { UserProfile, SiteConfig } from '../types';

export type ContactUnlockResult =
  | 'UNLOCKED_BY_PAID'
  | 'UNLOCKED_BY_MUTUAL_LIKE'
  | 'UNLOCKED_BY_SPECIAL_PREMIUM'
  | 'UNLOCKED_BY_FESTIVAL'
  | 'UNLOCKED_BY_DIRECT_CREDIT'
  | 'LOCKED';

export interface ContactUnlockStatus {
  status: ContactUnlockResult;
  isUnlocked: boolean;
  reasonMr: string;
}

/**
 * Centralized rule to determine if a viewer can access target member's contact number.
 */
export function getContactUnlockStatus(
  viewer: UserProfile | null | undefined,
  targetProfile: UserProfile | null | undefined,
  siteConfig?: SiteConfig | null,
  isMutualLike?: boolean,
  unlockedContactsList?: string[]
): ContactUnlockStatus {
  if (!viewer || !targetProfile) {
    return { status: 'LOCKED', isUnlocked: false, reasonMr: 'लॉगिन आवश्यक आहे.' };
  }

  // 1. Same user
  if (viewer.id === targetProfile.id) {
    return { status: 'UNLOCKED_BY_PAID', isUnlocked: true, reasonMr: 'तुमची स्वतःची प्रोफाईल' };
  }

  // 2. Admin or Sub-Admin
  if (viewer.membership === 'admin') {
    return { status: 'UNLOCKED_BY_PAID', isUnlocked: true, reasonMr: 'प्रशासक प्रवेश' };
  }

  // 3. Special Premium Access (Grant without payment record)
  if (viewer.specialPremiumAccess?.enabled) {
    const exp = viewer.specialPremiumAccess.expiryDate;
    if (!exp || new Date(exp) > new Date()) {
      return { status: 'UNLOCKED_BY_SPECIAL_PREMIUM', isUnlocked: true, reasonMr: 'विशेष प्रीमियम प्रवेश (Special Premium Access)' };
    }
  }

  // 4. Festival Free Unlock Mode
  if (siteConfig?.isFestivalFreeModeActive) {
    return { status: 'UNLOCKED_BY_FESTIVAL', isUnlocked: true, reasonMr: 'महोत्सव ऑफर अंतर्गत विनामूल्य संपर्क' };
  }

  // 5. Explicitly Unlocked via Credit or Direct List
  if (unlockedContactsList?.includes(targetProfile.id)) {
    return { status: 'UNLOCKED_BY_DIRECT_CREDIT', isUnlocked: true, reasonMr: 'संपर्क अनलॉक केलेला आहे' };
  }

  const unlockRule = siteConfig?.contactUnlockRule || siteConfig?.contactUnlockMode || 'paid_or_mutual';

  const isPaid = viewer.membership && viewer.membership !== 'free';

  if (unlockRule === 'mutual_like_only') {
    if (isMutualLike) {
      return { status: 'UNLOCKED_BY_MUTUAL_LIKE', isUnlocked: true, reasonMr: 'दोघांची परस्पर पसंती (Mutual Like)' };
    }
    return { status: 'LOCKED', isUnlocked: false, reasonMr: 'फक्त परस्पर पसंती (Mutual Like) असल्यास नंबर दिसेल' };
  }

  if (unlockRule === 'paid_members') {
    if (isPaid) {
      return { status: 'UNLOCKED_BY_PAID', isUnlocked: true, reasonMr: 'सशुल्क सदस्य (Paid Member)' };
    }
    return { status: 'LOCKED', isUnlocked: false, reasonMr: 'फक्त सशुल्क सदस्यांना (Paid Members) संपर्क दिसेल' };
  }

  if (unlockRule === 'paid_and_mutual') {
    if (isPaid && isMutualLike) {
      return { status: 'UNLOCKED_BY_PAID', isUnlocked: true, reasonMr: 'सशुल्क + परस्पर पसंती' };
    }
    return { status: 'LOCKED', isUnlocked: false, reasonMr: 'सशुल्क सदस्यता + परस्पर पसंती आवश्यक' };
  }

  // 'both_allowed' or 'paid_or_mutual'
  if (isPaid) {
    return { status: 'UNLOCKED_BY_PAID', isUnlocked: true, reasonMr: 'सशुल्क सदस्य (Paid Member)' };
  }
  if (isMutualLike) {
    return { status: 'UNLOCKED_BY_MUTUAL_LIKE', isUnlocked: true, reasonMr: 'दोघांची परस्पर पसंती (Mutual Like)' };
  }

  return { status: 'LOCKED', isUnlocked: false, reasonMr: 'संपर्क पाहण्यासाठी प्लॅन घ्या किंवा पसंती पाठवा' };
}
