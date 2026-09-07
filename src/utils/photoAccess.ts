import { UserProfile, SiteConfig } from '../types';

export interface PhotoAccessStatus {
  canView: boolean;
  isBlurred: boolean;
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
 * Strict rule: Only members who have paid the fee (or admin/subadmin, or viewing own profile)
 * are allowed to see clear photos. Free/unpaid members see heavily blurred photos with a lock badge.
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
      reason: 'own_profile',
      message: '',
    };
  }

  // 2. Admin or Sub-Admin -> Always allowed for administrative & moderation purposes
  if (currentUser?.isAdmin) {
    return {
      canView: true,
      isBlurred: false,
      reason: 'admin',
      message: '',
    };
  }

  // 3. Guest or not logged in
  if (!currentUser || currentUser.isGuest || currentUser.id?.startsWith('guest')) {
    return {
      canView: false,
      isBlurred: true,
      reason: 'guest',
      message: '🔒 फोटो पाहण्यासाठी कृपया नोंदणी / लॉगिन करा व शुल्क भरा',
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
      message: '🔒 आपला प्लॅन संपला आहे. फोटो पाहण्यासाठी कृपया प्लॅन रिन्यू करा',
    };
  }

  // 6. Strict Paid Membership Verification
  // Must have an active, non-free membership tier or custom access granted
  const isPaidMember = Boolean(
    currentUser.isCustomAccessGranted ||
      (currentUser.membership &&
        currentUser.membership !== 'free' &&
        (!isProfilePlanExpired || !isProfilePlanExpired(currentUser)))
  );

  // If NOT a paid member -> Heavily blur/lock the photo
  if (!isPaidMember) {
    return {
      canView: false,
      isBlurred: true,
      reason: 'unpaid_free',
      message: '🔒 फोटो फक्त शुल्क भरलेल्या सदस्यांनाच दिसतील (Paid Members Only)',
    };
  }

  // 7. If paid, check if candidate specifically hid photo in their privacy settings
  const isCandidatePrivate = Boolean(
    targetProfile?.privacy?.hidePhoto ||
      targetProfile?.privacy?.photoVisibility === 'hidden' ||
      (targetProfile?.privacy?.photoVisibility === 'visible_to_verified_only' && !currentUser.aadhaarVerified)
  );

  if (isCandidatePrivate && !isMutualMatch && !siteConfig?.adminOverrideMemberPrivacy) {
    return {
      canView: false,
      isBlurred: true,
      reason: 'candidate_hidden',
      message: '🔒 उमेदवाराने फोटो परस्पर पसंतीनंतर दृश्यमान ठेवला आहे',
    };
  }

  return {
    canView: true,
    isBlurred: false,
    reason: 'paid_member',
    message: '',
  };
}
