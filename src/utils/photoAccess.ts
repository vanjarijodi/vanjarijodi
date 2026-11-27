import { UserProfile, SiteConfig } from '../types';
import { isGooglePlayReviewActive } from './playStorePaymentHelper';

export interface PhotoAccessStatus {
  canView: boolean;
  isBlurred: boolean;
  isCompletelyHidden?: boolean;
  reason:
    | 'own_profile'
    | 'admin'
    | 'paid_member'
    | 'unpaid_free'
    | 'guest'
    | 'unapproved'
    | 'plan_expired'
    | 'candidate_hidden';
  message: string;
}

/**
 * Checks whether the current user is authorized to view clear profile photos.
 * Strict rule:
 * - Guests CANNOT see photos at all (isCompletelyHidden: true)
 * - Free/unpaid members see heavily blurred photos with a lock badge.
 * - Only paid members (or admin/subadmin, or viewing own profile) see clear photos.
 */
export function getPhotoAccessStatus({
  currentUser,
  targetProfile,
  isProfilePlanExpired,
  isMutualMatch = false,
  siteConfig,
}: {
  currentUser?: UserProfile | null;
  targetProfile?: UserProfile | null;
  isProfilePlanExpired?: (p: UserProfile | null) => boolean;
  isMutualMatch?: boolean;
  siteConfig?: SiteConfig | null;
}): PhotoAccessStatus {
  // 1. Viewing own profile -> Always allowed
  if (currentUser && targetProfile && (currentUser.id === targetProfile.id || currentUser.mobile === targetProfile.mobile)) {
    return {
      canView: true,
      isBlurred: false,
      isCompletelyHidden: false,
      reason: 'own_profile',
      message: '',
    };
  }

  // 2. Admin or Sub-Admin -> Always allowed for administrative & moderation purposes
  if (currentUser?.isAdmin) {
    return {
      canView: true,
      isBlurred: false,
      isCompletelyHidden: false,
      reason: 'admin',
      message: '',
    };
  }

  // 3. Guest or not logged in ("गेस्ट लॉगिनला फोटो नाही दिसला पाहिजे")
  if (!currentUser || currentUser.isGuest || currentUser.id?.startsWith('guest')) {
    return {
      canView: false,
      isBlurred: true,
      isCompletelyHidden: true,
      reason: 'guest',
      message: '🔒 फोटो पाहण्यासाठी मोफत नोंदणी करा / लॉगिन करा',
    };
  }

  // 4. Pending Admin Approval
  if (currentUser.isApproved === false) {
    return {
      canView: false,
      isBlurred: true,
      reason: 'unapproved',
      message: '🔒 ॲडमिन मंजुरी प्रलंबित आहे (Approval Pending)',
    };
  }

  // 5. Subscription plan expired
  if (isProfilePlanExpired && isProfilePlanExpired(currentUser)) {
    return {
      canView: false,
      isBlurred: true,
      reason: 'plan_expired',
      message: '🔒 आपली सदस्यता वैधता संपली आहे. फोटो पाहण्यासाठी कृपया खाते पडताळणी नूतनीकरण करा',
    };
  }

  // 5.5. Verified/Activated Member OR Mutual Like Achieved -> Always unlock all uploaded photos & biodata photos!
  const isReviewActive = isGooglePlayReviewActive(siteConfig);
  const isPaidMember = Boolean(
    isReviewActive ||
    currentUser.hasPaidMembership ||
    currentUser.isCustomAccessGranted ||
    (currentUser.membership &&
      currentUser.membership !== 'free' &&
      (!isProfilePlanExpired || !isProfilePlanExpired(currentUser)))
  );

  if (isPaidMember || isMutualMatch) {
    return {
      canView: true,
      isBlurred: false,
      isCompletelyHidden: false,
      reason: 'paid_member',
      message: '',
    };
  }

  // 5.6. If primary photo is a direct Biodata Sheet (contains name & phone number), blur for non-activated users until Activated or Mutual Like!
  const isPrimaryPhotoBiodataSheet = Boolean(
    targetProfile?.biodataPdfUrl &&
    (!targetProfile?.photos || targetProfile.photos.length === 0 || targetProfile.photos[0] === targetProfile.biodataPdfUrl)
  );
  if (isPrimaryPhotoBiodataSheet) {
    return {
      canView: false,
      isBlurred: true,
      isCompletelyHidden: false,
      reason: 'candidate_hidden',
      message: '🔒 बायोडाटा फोटो पडताळणीकृत सदस्यांना (Verified Members) किंवा एकमेकांना ❤️ लाईक केल्यावर स्पष्ट दिसेल',
    };
  }

  // 6. If NOT an activated member -> Check Admin Setting: blurPhotosForNonActivatedMembers
  const shouldBlurNonActivated = siteConfig?.blurPhotosForNonActivatedMembers === true;
  if (!shouldBlurNonActivated) {
    // Allow clear candidate portrait view in feed for logged-in members
    return {
      canView: true,
      isBlurred: false,
      isCompletelyHidden: false,
      reason: 'unpaid_free',
      message: '',
    };
  }

  return {
    canView: false,
    isBlurred: true,
    reason: 'unpaid_free',
    message: '🔒 अपलोड केलेले सर्व फोटो पाहण्यासाठी खाते ॲक्सेस सक्रिय करा किंवा ❤️ लाईक करा',
  };
}
