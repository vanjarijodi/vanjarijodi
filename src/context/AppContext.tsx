import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Language,
  ThemeMode,
  UserProfile,
  SearchFilterState,
  Interest,
  ChatMessage,
  NotificationItem,
  SuccessStory,
  MembershipTier,
  Plan,
  ContactRequest,
  CommunityAd,
  HeroSlide,
  CounterItem,
  SiteConfig,
  PaymentRequest,
  AdminSupportMessage,
  RecycleBinItem,
  AuditLog,
  SubAdmin,
  SubAdminPermission,
  PromoCode,
  PendingProfileEdit,
  TrashedPhoto,
  FaceVerificationLog,
  SocialLinkItem,
  ApkSettings,
  PendingLike,
  FeatureBoxItem,
  GuestPermissions,
  PayPerContactRequest,
  GuestSessionLog,
  UserActivityLog,
  ProfileRemovalRequest,
  ProfileReport,
  BusinessVendor,
  VendorBookingInquiry
} from '../types';
import {
  INITIAL_PROFILES,
  SUCCESS_STORIES,
  MEMBERSHIP_PLANS,
  INITIAL_COMMUNITY_ADS,
  INITIAL_CONTACT_REQUESTS,
  INITIAL_HERO_SLIDES,
  INITIAL_COUNTERS,
  INITIAL_SITE_CONFIG,
  INITIAL_PAYMENT_REQUESTS,
  INITIAL_SUB_ADMINS,
  INITIAL_PROMO_CODES,
  INITIAL_PENDING_PROFILES,
  INITIAL_FACE_VERIFICATIONS,
  INITIAL_BUSINESS_VENDORS
} from '../data/initialData';
import { translations } from '../data/translations';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  syncDocToFirestore,
  deleteDocFromFirestore,
  listenToProfiles,
  listenToSiteConfig,
  listenToChatMessages,
  listenToAdminSupport,
  listenToNotifications
} from '../utils/firestoreSync';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;
  t: (key: string) => string;
  profiles: UserProfile[];
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  searchFilters: SearchFilterState;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  resetFilters: () => void;
  filteredProfiles: UserProfile[];
  
  // Interactions
  shortlistedIds: string[];
  toggleShortlist: (profileId: string) => void;
  likedProfileIds: string[];
  toggleLikeProfile: (profileId: string) => void;
  interests: Interest[];
  sendInterest: (toUserId: string) => void;
  respondInterest: (interestId: string, status: 'accepted' | 'rejected') => void;
  
  // Chat & Calls
  chatMessages: ChatMessage[];
  sendChatMessage: (
    receiverId: string,
    text: string,
    imageUrl?: string,
    voiceUrl?: string,
    pdfUrl?: string,
    pdfName?: string,
    fileType?: 'image' | 'pdf' | 'voice'
  ) => { success: boolean; message?: string };
  deleteChatMessage: (messageId: string) => void;
  toggleBlockUserChat: (profileId: string) => void;
  activeChatUser: UserProfile | null;
  setActiveChatUser: (user: UserProfile | null) => void;
  activeVideoUser: UserProfile | null;
  setActiveVideoUser: (user: UserProfile | null) => void;

  // Modals & UI States
  currentView: 'home' | 'dashboard' | 'profiles';
  setCurrentView: (view: 'home' | 'dashboard' | 'profiles') => void;
  isLeftDrawerOpen: boolean;
  setIsLeftDrawerOpen: (open: boolean) => void;
  isRightDrawerOpen: boolean;
  setIsRightDrawerOpen: (open: boolean) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  loginModalMode: 'member_otp' | 'member_pass' | 'guest';
  setLoginModalMode: (mode: 'member_otp' | 'member_pass' | 'guest') => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (open: boolean) => void;
  registrationStep: 'selector' | 'manual' | 'ocr_photo';
  setRegistrationStep: (step: 'selector' | 'manual' | 'ocr_photo') => void;
  selectedProfileForModal: UserProfile | null;
  setSelectedProfileForModal: (profile: UserProfile | null) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isPaymentOpen: boolean;
  setIsPaymentOpen: (open: boolean) => void;
  selectedPlanForPayment: Plan | null;
  setSelectedPlanForPayment: (plan: Plan | null) => void;
  isPaidPlansEnabled: boolean;
  setIsPaidPlansEnabled: (enabled: boolean) => void;
  
  // Homepage Builder & Toggles
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  updateSiteConfig: (partial: Partial<SiteConfig>) => void;
  heroSlides: HeroSlide[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  deleteHeroSlide: (slideId: string) => void;
  counters: CounterItem[];
  updateCounter: (id: string, value: string, labelMr?: string) => void;
  isSuccessStoriesEnabled: boolean;
  setIsSuccessStoriesEnabled: (val: boolean) => void;
  isAdsEnabled: boolean;
  setIsAdsEnabled: (val: boolean) => void;
  isCountersEnabled: boolean;
  setIsCountersEnabled: (val: boolean) => void;

  // Authorization & Contact Request System
  contactRequests: ContactRequest[];
  requestContactAuthorization: (targetProfileId: string, note?: string) => void;
  authorizeContactRequest: (requestId: string) => void;
  rejectContactRequest: (requestId: string) => void;
  authorizeAllContactRequests: () => void;
  isContactAuthorizedForUser: (targetProfileId: string) => boolean;
  toggleHideContact: (profileId: string) => void;

  // Pre-Plans & Ads Management
  plansList: Plan[];
  updatePlan: (updatedPlan: Plan) => void;
  communityAds: CommunityAd[];
  addCommunityAd: (ad: Omit<CommunityAd, 'id' | 'createdAt'>) => void;
  toggleAdStatus: (adId: string) => void;
  deleteCommunityAd: (adId: string) => void;

  // Success Stories Management
  successStories: SuccessStory[];
  addSuccessStory: (story: SuccessStory) => void;
  submitSuccessStory: (storyData: Omit<SuccessStory, 'id' | 'createdAt' | 'status'>) => void;
  approveSuccessStory: (id: string) => void;
  rejectSuccessStory: (id: string) => void;
  updateSuccessStory: (story: SuccessStory) => void;
  deleteSuccessStory: (id: string) => void;
  bulkDeleteSuccessStories: (ids: string[]) => void;

  // Offline Payment Requests Engine
  paymentRequests: PaymentRequest[];
  addPaymentRequest: (req: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>) => void;
  approvePaymentRequest: (id: string) => void;
  rejectPaymentRequest: (id: string) => void;
  deletePaymentRequest: (id: string) => void;
  bulkApprovePaymentRequests: (ids: string[]) => void;
  bulkDeletePaymentRequests: (ids: string[]) => void;

  // Admin Actions
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  approveProfile: (profileId: string) => void;
  rejectProfile: (profileId: string) => void;
  toggleBlockProfile: (profileId: string) => void;
  toggleBlockMemberAccess: (profileId: string) => void;
  toggleCustomAccess: (profileId: string) => void;
  toggleProfileVisibility: (profileId: string) => void;
  adminSuggestMatch: (targetUserId: string, suggestedProfileId: string, note?: string) => void;
  updateMemberTier: (profileId: string, tier: MembershipTier) => void;
  addProfile: (newProfile: UserProfile) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  addBroadcastNotification: (titleMr: string, messageMr: string) => void;
  sendPushNotification: (targetUserId: string, titleMr: string, messageMr: string) => void;
  unlockContact: (profileId: string) => void;
  unlockedContacts: string[];

  // Admin Direct Support Chat
  adminSupportMessages: AdminSupportMessage[];
  sendAdminSupportMessage: (message: string, fileUrl?: string, fileName?: string, userMobile?: string, customName?: string, customSenderId?: string) => void;
  replyAdminSupportMessage: (targetSenderId: string, message: string, fileUrl?: string, fileName?: string) => void;
  markAdminSupportMessagesRead: (targetSenderId?: string) => void;
  unreadAdminChatCount: number;

  // Recycle Bin & Storage Purge
  recycleBin: RecycleBinItem[];
  deletedPhotosTrash: TrashedPhoto[];
  softDeleteProfile: (profileId: string) => void;
  restoreRecycleItem: (id: string) => void;
  permanentDeleteRecycleItem: (id: string) => void;
  bulkPurgeRecycleBin: () => void;
  trashPhoto: (profileId: string, photoUrl: string, photoType: 'avatar' | 'gallery', profileName?: string) => void;
  restorePhotoFromTrash: (trashId: string) => void;
  permanentlyDeletePhotoFromTrash: (trashId: string) => void;
  purgeAllPhotosTrash: () => void;

  // Activity Audit Log
  auditLogs: AuditLog[];
  logActivity: (action: string, details: string, user?: string) => void;

  // Sub-Admin Management & Roles
  subAdmins: SubAdmin[];
  currentSubAdmin: SubAdmin | null;
  setCurrentSubAdmin: (subAdmin: SubAdmin | null) => void;
  addSubAdmin: (subAdmin: Omit<SubAdmin, 'id' | 'createdAt'>) => void;
  updateSubAdmin: (subAdmin: SubAdmin) => void;
  deleteSubAdmin: (id: string) => void;

  // Promo Codes & Discounts Engine
  promoCodes: PromoCode[];
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'createdAt' | 'usedCount'>) => void;
  deletePromoCode: (id: string) => void;
  togglePromoCodeStatus: (id: string) => void;
  validatePromoCode: (codeStr: string, originalAmount: number) => {
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
    isVipFree: boolean;
    promo?: PromoCode;
    message: string;
  };

  // Member Profile Edits Re-Approval Queue
  pendingProfileEdits: PendingProfileEdit[];
  submitProfileEditRequest: (profileId: string, updatedFields: Partial<UserProfile>) => void;
  approveProfileEditRequest: (editId: string) => void;
  rejectProfileEditRequest: (editId: string) => void;

  // Face Authentication & Verification
  isFaceAuthModalOpen: boolean;
  setIsFaceAuthModalOpen: (open: boolean) => void;
  faceVerificationLogs: FaceVerificationLog[];
  submitFaceVerification: (logData: Omit<FaceVerificationLog, 'id' | 'submittedAt'>) => void;
  approveFaceVerification: (logId: string) => void;
  rejectFaceVerification: (logId: string) => void;

  // Plan Expiry & Auto Paid Revocation
  isProfilePlanExpired: (p: UserProfile | null) => boolean;
  isCurrentUserPlanExpired: boolean;

  // APK Uploader & Download Link
  updateApkSettings: (settings: Partial<ApkSettings>) => void;
  incrementApkDownloadCount: () => void;

  // Social Media Controls
  updateSocialLinks: (links: SocialLinkItem[]) => void;
  addSocialLink: (link: Omit<SocialLinkItem, 'id'>) => void;
  deleteSocialLink: (id: string) => void;

  // Master Admin Security Credentials
  updateAdminCredentials: (credentials: { name: string; username: string; password: string }) => void;

  // Profile Likes Approval & Guest Login
  pendingLikes: PendingLike[];
  approveLike: (id: string) => void;
  rejectLike: (id: string) => void;
  bulkApproveLikes: (ids: string[]) => void;
  loginAsGuest: (mobile?: string, name?: string) => void;
  loginWithGoogle: () => Promise<{ success: boolean; isNewUser: boolean; user?: UserProfile; message?: string }>;
  loginWithEmail: (email: string, passwordOrOtp?: string) => Promise<{ success: boolean; isNewUser: boolean; user?: UserProfile; message?: string }>;
  updateFeatureBoxes: (boxes: FeatureBoxItem[]) => void;

  // Manual UPI Pay-Per-Contact System
  payPerContactRequests: PayPerContactRequest[];
  addPayPerContactRequest: (req: Omit<PayPerContactRequest, 'id' | 'createdAt' | 'status'>) => void;
  approvePayPerContactRequest: (id: string) => void;
  rejectPayPerContactRequest: (id: string) => void;
  deletePayPerContactRequest: (id: string) => void;
  selectedProfileForUnlock: UserProfile | null;
  setSelectedProfileForUnlock: (profile: UserProfile | null) => void;
  isContactUnlockModalOpen: boolean;
  setIsContactUnlockModalOpen: (open: boolean) => void;

  // Granular Guest Access Control & Modal
  isGuestRestrictionModalOpen: boolean;
  setIsGuestRestrictionModalOpen: (open: boolean) => void;
  restrictedFeatureName: string;
  checkGuestPermission: (featureKey: keyof GuestPermissions, featureLabelMr: string) => boolean;

  // Smart Guest Nudge
  isGuestNudgeOpen: boolean;
  setIsGuestNudgeOpen: (open: boolean) => void;

  // Live User Activity & Analytics
  userActivityLogs: UserActivityLog[];
  guestSessions: GuestSessionLog[];
  trackUserAction: (action: string, details: string) => void;

  // Admin Chat Archiving & Deletion
  archiveAdminSupportChat: (senderId: string) => void;
  deleteAdminSupportMessage: (messageId: string, deleteOnlyImage?: boolean) => void;
  bulkDeleteAdminSupportMessages: (messageIds: string[]) => void;

  // Profile Removal & Marriage Fixed Requests
  profileRemovalRequests: ProfileRemovalRequest[];
  submitProfileRemovalRequest: (reqData: Omit<ProfileRemovalRequest, 'id' | 'createdAt' | 'status'>) => void;
  approveProfileRemovalRequest: (id: string, createSuccessStory?: boolean) => void;
  rejectProfileRemovalRequest: (id: string) => void;
  deleteProfileRemovalRequest: (id: string) => void;
  isProfileRemovalModalOpen: boolean;
  setIsProfileRemovalModalOpen: (open: boolean) => void;

  // Admin Bulk & Toggle Actions
  bulkSoftDeleteProfiles: (profileIds: string[]) => void;
  bulkPermanentDeleteRecycleItems: (ids: string[]) => void;
  bulkRestoreRecycleItems: (ids: string[]) => void;

  // Photo & Profile Direct Actions
  setPrimaryPhoto: (profileId: string, photoIndex: number) => void;
  deleteMemberPhoto: (profileId: string, photoIndex: number) => void;
  addMemberPhoto: (profileId: string, newPhotoUrl: string) => { success: boolean; message: string };
  approvePhotoChanges: (profileId: string) => void;
  uploadAadhaarCard: (profileId: string, aadhaarUrl: string) => void;
  updateProfileDirect: (profileId: string, updatedFields: Partial<UserProfile>) => void;
  incrementProfileViews: (profileId: string) => void;

  // Profile Reports & Privacy Controls
  profileReports: ProfileReport[];
  submitProfileReport: (report: ProfileReport) => void;
  resolveProfileReport: (reportId: string, action: 'warning' | 'hide' | 'suspend' | 'dismiss') => void;
  updateMemberPrivacy: (profileId: string, newPrivacy: UserProfile['privacy'], notifyMember?: boolean) => void;
  updateMemberBadges: (profileId: string, badges: { isIdVerified?: boolean; isPhotoVerified?: boolean; isPremiumVerified?: boolean; isVerified?: boolean }) => void;
  resetSampleProfiles: () => void;

  // Business Vendors & Wedding Network
  isBioDataMakerOpen: boolean;
  setIsBioDataMakerOpen: (open: boolean) => void;
  businessVendors: BusinessVendor[];
  isBusinessVendorDirectoryOpen: boolean;
  setIsBusinessVendorDirectoryOpen: (open: boolean) => void;
  isBusinessVendorRegisterModalOpen: boolean;
  setIsBusinessVendorRegisterModalOpen: (open: boolean) => void;
  isVendorPortalOpen: boolean;
  setIsVendorPortalOpen: (open: boolean) => void;
  currentVendorUser: BusinessVendor | null;
  setCurrentVendorUser: (vendor: BusinessVendor | null) => void;
  vendorBookingInquiries: VendorBookingInquiry[];
  addBusinessVendor: (vendor: Omit<BusinessVendor, 'id' | 'createdAt' | 'status'> & { status?: 'pending' | 'approved' | 'rejected' }) => void;
  updateBusinessVendorStatus: (id: string, status: 'approved' | 'rejected') => void;
  deleteBusinessVendor: (id: string) => void;
  addCustomVendorCategory: (categoryName: string) => void;
  toggleVendorBookedDate: (vendorId: string, dateStr: string) => void;
  submitVendorBookingInquiry: (inquiry: Omit<VendorBookingInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateVendorBookingInquiryStatus: (id: string, status: VendorBookingInquiry['status']) => void;
  updateVendorDetails: (vendorId: string, updatedFields: Partial<BusinessVendor>) => void;

  // Technical SEO & Programmatic Landing Modals
  isSeoHubOpen: boolean;
  setIsSeoHubOpen: (open: boolean) => void;
  seoTargetCommunity: string | undefined;
  setSeoTargetCommunity: (slug?: string) => void;
  seoTargetCity: string | undefined;
  setSeoTargetCity: (slug?: string) => void;
  openSeoLanding: (params?: { community?: string; city?: string }) => void;

  // Security & Threat Management Portals
  isUserSecurityOpen: boolean;
  setIsUserSecurityOpen: (open: boolean) => void;
  isAdminSecurityOpen: boolean;
  setIsAdminSecurityOpen: (open: boolean) => void;
}

const defaultSearchFilters: SearchFilterState = {
  gender: 'all',
  minAge: 18,
  maxAge: 80,
  district: '',
  taluka: '',
  education: '',
  occupation: '',
  income: '',
  maritalStatus: '',
  subCaste: '',
  verifiedOnly: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language default to Marathi ('mr')
  const [language, setLanguage] = useState<Language>('mr');

  // Theme Mode ('crimson-gold' by default)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('vanjari_jodi_theme') as ThemeMode) || 'crimson-gold';
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_theme', themeMode);
  }, [themeMode]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['mr']?.[key] || key;
  };

  // 2. Profiles list persistence
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed.filter((p: UserProfile) => p && p.id) : INITIAL_PROFILES;
      } catch (e) {
        return INITIAL_PROFILES;
      }
    }
    return INITIAL_PROFILES;
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Real-time Firestore Sync Listeners
  useEffect(() => {
    const unsubProfiles = listenToProfiles((firestoreProfiles) => {
      if (firestoreProfiles && firestoreProfiles.length > 0) {
        setProfiles(firestoreProfiles);
      }
    }, INITIAL_PROFILES);

    const unsubConfig = listenToSiteConfig((remoteConfig) => {
      if (remoteConfig) {
        setSiteConfig((prev) => ({ ...prev, ...remoteConfig }));
      }
    }, INITIAL_SITE_CONFIG);

    const unsubChats = listenToChatMessages((remoteChats) => {
      if (remoteChats) {
        setChatMessages(remoteChats);
      }
    });

    const unsubSupport = listenToAdminSupport((remoteSupport) => {
      if (remoteSupport) {
        setAdminSupportMessages(remoteSupport);
      }
    });

    const unsubNotifications = listenToNotifications((remoteNotifs) => {
      if (remoteNotifs && remoteNotifs.length > 0) {
        setNotifications(remoteNotifs);
      }
    });

    return () => {
      unsubProfiles();
      unsubConfig();
      unsubChats();
      unsubSupport();
      unsubNotifications();
    };
  }, []);

  // 3. Current logged in user (or default demo user)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('vanjari_jodi_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          // If profile is unapproved and has no face/ID verification, strip unearned verified flag
          if (parsed.isApproved === false && !parsed.isFaceVerified && !parsed.isIdVerified && !parsed.aadhaarVerified) {
            parsed.isVerified = false;
          }
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vanjari_jodi_current_user', JSON.stringify(currentUser));
      // Strict role isolation: When a regular member is logged in, immediately revoke admin mode
      if (!currentUser.isAdmin && currentUser.id !== 'admin') {
        setIsAdminLoggedInState(false);
        localStorage.removeItem('vanjari_jodi_is_admin_logged_in');
      }
    } else {
      localStorage.removeItem('vanjari_jodi_current_user');
    }
  }, [currentUser]);

  // Keep currentUser in sync when profiles are updated from Firestore/local changes
  useEffect(() => {
    if (currentUser && profiles.length > 0) {
      const updatedProfile = profiles.find((p) => p.id === currentUser.id);
      if (updatedProfile && JSON.stringify(updatedProfile) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedProfile);
      }
    }
  }, [profiles]);

  // Site Configuration & SEO
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const defaultText = '📢 ॥ श्री संत भगवान बाबा प्रसन्न ॥ — वंजारी समाजातील वधू-वरांसाठी अधिकृत नोंदणी व संपर्क सुविधा उपलब्ध!';
    const saved = localStorage.getItem('vanjari_jodi_site_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SITE_CONFIG,
          ...parsed,
          isNoticeBannerEnabled: parsed.isNoticeBannerEnabled !== undefined ? parsed.isNoticeBannerEnabled : true,
          noticeBannerText: parsed.noticeBannerText || defaultText,
          noticeBannerBg: parsed.noticeBannerBg || 'crimson',
          heroHeading: parsed.heroHeading && !parsed.heroHeading.includes('सुसंस्कृत') ? parsed.heroHeading : 'वंजारी समाजातील वधू-वर शोधा',
          heroSubheading: 'संत भगवान बाबा यांच्या आशीर्वादाने स्थापित - पवित्र नात्यांची सुंदर सुरुवात',
          heroDescription: 'हजारो विश्वासू वंजारी कुटुंब जोडणारा महाराष्ट्रातील नंबर १ विवाह मंच',
          logoSubtitle: parsed.logoSubtitle || 'वर-वधू शोध',
          contactEmail: parsed.contactEmail || 'gitevijay123@gmail.com'
        };
      } catch (e) {
        return {
          ...INITIAL_SITE_CONFIG,
          isNoticeBannerEnabled: true,
          noticeBannerText: defaultText
        };
      }
    }
    return {
      ...INITIAL_SITE_CONFIG,
      isNoticeBannerEnabled: true,
      noticeBannerText: defaultText
    };
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_site_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  const updateSiteConfig = (partial: Partial<SiteConfig>) => {
    setSiteConfig((prev) => {
      const updated = { ...prev, ...partial };
      syncDocToFirestore('siteConfig', 'mainConfig', updated);
      return updated;
    });
  };

  // 4. Search filters
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>(defaultSearchFilters);

  const resetFilters = () => setSearchFilters(defaultSearchFilters);

  const filteredProfiles = profiles.filter((p) => {
    if (!p.isApproved && p.id !== currentUser?.id) return false;
    if (p.isHiddenByAdmin) return false;
    
    // Strict Opposite Gender Rule: Groom sees Bride only, Bride sees Groom only
    if (currentUser && !currentUser.isAdmin) {
      if (currentUser.gender === 'groom' && p.gender !== 'bride') return false;
      if (currentUser.gender === 'bride' && p.gender !== 'groom') return false;
    }

    // If search filters are completely disabled, show all profiles cleanly without any search filter constraints.
    if (siteConfig?.enableSearchFilters === false) {
      return true;
    }

    if (siteConfig?.filterShowGender !== false && searchFilters.gender !== 'all' && p.gender !== searchFilters.gender) return false;
    if (siteConfig?.filterShowAge !== false && (p.age < searchFilters.minAge || p.age > searchFilters.maxAge)) return false;
    if (siteConfig?.filterShowDistrict !== false && searchFilters.district && !(p.district || '').toLowerCase().includes(searchFilters.district.toLowerCase())) return false;
    if (siteConfig?.filterShowEducation !== false && searchFilters.education && !(p.education || '').toLowerCase().includes(searchFilters.education.toLowerCase())) return false;
    if (searchFilters.occupation) {
      const occLower = searchFilters.occupation.toLowerCase();
      const pOcc = (p.occupation || '').toLowerCase();
      const pEdu = (p.education || '').toLowerCase();
      const pComp = (p.companyName || '').toLowerCase();
      const pTags = (p.professionTags || []).map((t) => t.toLowerCase()).join(' ');
      const combined = `${pOcc} ${pEdu} ${pComp} ${pTags}`;

      if (occLower === 'doctor') {
        if (!/doctor|doc|डॉक्टर|mbbs|bams|bhms|md\b|bds|medical|वैद्यकीय/i.test(combined)) return false;
      } else if (occLower === 'govt') {
        if (!/govt|government|सरकारी|शासकीय|mpsc|upsc|talathi|police|पोलीस|तलाठी|महसूल/i.test(combined)) return false;
      } else if (occLower === 'engineer') {
        if (!/engineer|engg|इंजिनिअर|अभियंता|be\b|btech|software|developer|it\b|आयटी/i.test(combined)) return false;
      } else if (occLower === 'teacher') {
        if (!/teacher|professor|lecturer|शिक्षक|शिक्षिका|प्राध्यापक|गुरुजी/i.test(combined)) return false;
      } else if (occLower === 'business') {
        if (!/business|self employed|व्यवसाय|धंदा|उद्योग|व्यापारी/i.test(combined)) return false;
      } else if (occLower === 'farmer') {
        if (!/farmer|agriculture|शेतकरी|शेती|कृषी/i.test(combined)) return false;
      } else if (occLower === 'lawyer_ca') {
        if (!/lawyer|advocate|वकील|ca\b|chartered|accountant/i.test(combined)) return false;
      } else {
        if (!combined.includes(occLower)) return false;
      }
    }
    if (siteConfig?.filterShowMaritalStatus !== false && searchFilters.maritalStatus && p.maritalStatus !== searchFilters.maritalStatus) return false;
    if (siteConfig?.filterShowVerified !== false && searchFilters.verifiedOnly && !p.isVerified) return false;
    return true;
  });

  // 5. Shortlisting
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_shortlists');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleShortlist = (profileId: string) => {
    setShortlistedIds((prev) => {
      const next = prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId];
      localStorage.setItem('vanjari_jodi_shortlists', JSON.stringify(next));
      return next;
    });
  };

  // 6. Interests
  const [interests, setInterests] = useState<Interest[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_interests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_interests', JSON.stringify(interests));
  }, [interests]);

  const sendInterest = (toUserId: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    // Check if Like option is restricted to Paid Members only
    const isRequirePaidForLikes = siteConfig?.requirePaidForLikes !== false;
    const isUserPaidForLikes =
      currentUser.membership &&
      currentUser.membership !== 'free' &&
      !isProfilePlanExpired(currentUser);

    if (isRequirePaidForLikes && !isUserPaidForLikes && !isAdminLoggedIn) {
      const activeOfferPlan =
        plansList.find((p) => p.isActive !== false && p.id !== 'free') || plansList[0];
      setSelectedPlanForPayment(activeOfferPlan);
      setIsPaymentOpen(true);
      alert(
        `❤️ प्रोफाईल लाईक करणे व संपर्क एक्सचेंज (Mutual Like Contact Exchange) करण्याची सुविधा फक्त चालू सबस्क्रिप्शन (Paid) प्लॅन असलेल्या सदस्यांसाठी आहे!\n\nकृपया खालीलपैकी कोणताही ऑफर प्लॅन निवडून आजच प्लॅन नूतनीकरण किंवा सुरू करा.`
      );
      return;
    }

    if (currentUser.id === toUserId) {
      alert('तुम्ही स्वतःच्या प्रोफाईलला लाईक करू शकत नाही.');
      return;
    }

    const targetUser = profiles.find((p) => p.id === toUserId);
    const exists = interests.some((i) => i.fromUserId === currentUser.id && i.toUserId === toUserId);
    const alreadyLiked = likedProfileIds.includes(toUserId);

    if (exists || alreadyLiked) {
      alert('तुम्ही याआधीच या प्रोफाईलला लाईक केले आहे.');
      return;
    }

    const autoApprove = siteConfig?.autoApproveLikes !== false;
    const status = autoApprove ? 'accepted' : 'pending';

    const newInt: Interest = {
      id: 'int-' + Date.now(),
      fromUserId: currentUser.id,
      toUserId,
      status,
      createdAt: new Date().toISOString(),
    };

    setInterests((prev) => [...prev, newInt]);
    setLikedProfileIds((prev) => (prev.includes(toUserId) ? prev : [...prev, toUserId]));

    const newLikeReq = {
      id: 'like-' + Date.now(),
      fromUserId: currentUser.id,
      fromUserName: currentUser.fullName,
      fromUserPhoto: currentUser.photoUrl || currentUser.photos?.[0] || '',
      toUserId,
      toUserName: targetUser?.fullName || toUserId,
      toUserPhoto: targetUser?.photoUrl || targetUser?.photos?.[0] || '',
      createdAt: new Date().toISOString(),
      status: autoApprove ? 'approved' : 'pending'
    };
    setPendingLikes((prev) => [newLikeReq, ...prev]);

    // Audit Log & Notification
    logActivity(
      'Profile Like',
      `${currentUser.fullName} (${currentUser.id}) यांनी ${targetUser?.fullName || toUserId} (${toUserId}) यांच्या प्रोफाईलला 'लाईक' केले. (स्थिती: ${autoApprove ? 'थेट पाठवले' : 'ॲडमिन मंजुरी प्रलंबित'})`,
      currentUser.fullName
    );

    const targetLikesMe =
      interests.some((i) => i.fromUserId === toUserId && i.toUserId === currentUser.id && i.status !== 'rejected') ||
      pendingLikes.some((l) => l.fromUserId === toUserId && l.toUserId === currentUser.id && l.status !== 'rejected') ||
      (targetUser?.shortlistedByUsers || []).includes(currentUser.id);

    const isMutualUnlockEnabled = siteConfig?.enableMutualLikeContactUnlock !== false;
    const isUserPaid = currentUser.membership && currentUser.membership !== 'free' && !isProfilePlanExpired(currentUser);

    if (targetUser && autoApprove) {
      if (targetLikesMe && isMutualUnlockEnabled) {
        if (isUserPaid) {
          setUnlockedContacts((prev) => (prev.includes(toUserId) ? prev : [...prev, toUserId]));
          addNotification({
            userId: toUserId,
            title: '🎉 Mutual Like Match! Contact Unlocked',
            titleMr: '🎉 म्युचुअल मॅच! मोबाईल नंबर अनलॉक झाला!',
            message: `You and ${currentUser.fullName} liked each other! Contact number is now unlocked.`,
            messageMr: `तुम्ही व ${currentUser.fullName} यांनी एकमेकांना लाईक केले आहे! दोघांचे मोबाईल नंबर आता अनलॉक झाले आहेत.`,
            type: 'interest',
          });
          alert(`🎉 म्युचुअल मॅच (Mutual Match)! ${targetUser.fullName || 'सदस्याने'} सुद्धा तुम्हाला आधीच लाईक केले होते. एकमेकांनी लाईक केल्यामुळे तुम्हा दोघांचे मोबाईल नंबर आता अनलॉक झाले आहेत!`);
        } else {
          addNotification({
            userId: toUserId,
            title: '🎉 Mutual Like Match!',
            titleMr: '🎉 म्युचुअल मॅच! एकमेकांना लाईक प्राप्त!',
            message: `You and ${currentUser.fullName} liked each other! Upgrade plan to view contact number.`,
            messageMr: `तुम्ही व ${currentUser.fullName} यांनी एकमेकांना लाईक केले आहे! नंबर अनलॉक करण्यासाठी प्लॅन खरेदी करा.`,
            type: 'interest',
          });
          const activeOfferPlan = plansList.find((p) => p.isActive !== false && p.id !== 'free') || plansList[0];
          setSelectedPlanForPayment(activeOfferPlan);
          setIsPaymentOpen(true);
          alert(`🎉 म्युचुअल मॅच (Mutual Match)! ${targetUser.fullName || 'सदस्याने'} सुद्धा तुम्हाला आधीच लाईक केले होते!\n\n🔒 परंतु संपर्क क्रमांक अनलॉक करून पाहण्यासाठी व थेट संपर्क साधण्यासाठी कृपया ऑनलाईन पेमेंट / प्लॅन खरेदी करा.`);
        }
      } else {
        addNotification({
          userId: toUserId,
          title: '❤️ नवीन लाईक प्राप्त झाले!',
          titleMr: '❤️ तुमच्या प्रोफाईलला लाईक आले आहे!',
          message: `${currentUser.fullName} liked your profile.`,
          messageMr: `${currentUser.fullName} यांनी तुमच्या प्रोफाईलला लाईक केले आहे! ❤️`,
          type: 'interest',
        });
        alert(`🎉 ${targetUser.fullName || 'सदस्यास'} तुमचे लाईक यशस्वीरित्या पाठवले आहे! त्यांना थेट नोटिफिकेशन पाठवण्यात आले आहे.`);
      }
    } else {
      alert(`❤️ तुमची लाईक विनंती ॲडमिनकडे पाठवली आहे. ॲडमिन मंजुरीनंतर समोरच्या सदस्याला दिसेल.`);
    }
  };

  const respondInterest = (interestId: string, status: 'accepted' | 'rejected') => {
    setInterests((prev) =>
      prev.map((i) => (i.id === interestId ? { ...i, status } : i))
    );
  };

  // 13. Pre-Plans Management
  const [plansList, setPlansList] = useState<Plan[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_plans');
    if (!saved) return MEMBERSHIP_PLANS;
    try {
      let parsed: Plan[] = JSON.parse(saved);
      const hasWelcomeOffer = parsed.some((p) => p.id === 'welcome_offer');
      if (!hasWelcomeOffer) {
        const defaultWelcome = MEMBERSHIP_PLANS.find((p) => p.id === 'welcome_offer');
        if (defaultWelcome) parsed = [defaultWelcome, ...parsed];
      }
      // Update welcome offer defaults
      parsed = parsed.map((p) => {
        if (p.id === 'welcome_offer') {
          return {
            ...p,
            price: p.price === 99 ? 199 : p.price,
            unlockCount: 999,
            nameMr: 'स्पेशल वेलकम ऑफर - ₹१९९ (म्युचुअल लाईकवर नंबर अनलॉक)',
            durationLabelMr: '६ महिने वैध (दोघांनी लाईक केल्यावर नंबर अनलॉक)',
            badgeText: '🔥 ५०% सूट - वेलकम ऑफर (रु. १९९/-)',
            featuresMr: [
              'दोघांनी एकमेकांना लाईक केल्यावर (Mutual Like) मोबाईल नंबर अनलॉक',
              '६ महिने (१८० दिवस) संपूर्ण प्रोफाईल व बायोडाटा पाहणे',
              'अनलिमिटेड मोफत एक्सप्रेस प्रतिसाद (Likes) पाठवा',
              'थेट व्हॉट्सॲप चॅट व कौटुंबिक संपर्क'
            ]
          };
        }
        return p;
      });
      return parsed;
    } catch {
      return MEMBERSHIP_PLANS;
    }
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_plans', JSON.stringify(plansList));
  }, [plansList]);

  const updatePlan = (updatedPlan: Plan) => {
    setPlansList((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  };

  // Helper to check if a profile's subscription/plan has expired
  const isProfilePlanExpired = (p: UserProfile | null): boolean => {
    if (!p) return false;
    if (p.isPlanExpired === true) return true;
    if (!p.membership || p.membership === 'free' || p.membership === 'admin' || p.membership === 'lifetime') {
      return false;
    }

    // 1. Explicit expiry date check
    if (p.membershipExpiryDate) {
      const expDate = new Date(p.membershipExpiryDate);
      if (!isNaN(expDate.getTime())) {
        return expDate.getTime() < Date.now();
      }
    } else {
      // 2. Computed expiry check from approval date or paid date
      const payDateStr = p.paymentApprovedAt || p.paidAt;
      if (payDateStr) {
        const pDate = new Date(payDateStr);
        if (!isNaN(pDate.getTime())) {
          let durationMonths = 1;
          const matchingPlan = plansList.find((plan) => plan.id === p.membership);
          if (matchingPlan?.durationMonths && matchingPlan.durationMonths > 0) {
            durationMonths = matchingPlan.durationMonths;
          } else if (p.membership === 'yearly') {
            durationMonths = 12;
          } else if (p.membership === 'gold' || p.membership === 'diamond') {
            durationMonths = 6;
          } else if (p.membership === 'silver') {
            durationMonths = 3;
          } else if (p.membership === 'monthly' || p.membership === 'welcome_offer') {
            durationMonths = 1;
          }

          const expTime = pDate.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000;
          return expTime < Date.now();
        }
      }
    }

    return false;
  };

  const isCurrentUserPlanExpired = useMemo(() => {
    return isProfilePlanExpired(currentUser);
  }, [currentUser, plansList]);

  // 7. Unlocked Contacts
  const [unlockedContacts, setUnlockedContacts] = useState<string[]>([]);

  const unlockContact = (profileId: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    if (unlockedContacts.includes(profileId)) {
      return; // Already unlocked
    }

    // Check if current user's plan is expired -> block paid benefits & offer current admin active plan
    if (isPaidPlansEnabled) {
      const isExpired = isProfilePlanExpired(currentUser);
      if (isExpired) {
        const activeOfferPlan =
          plansList.find((p) => p.isActive !== false && p.id !== 'free') ||
          plansList[0];

        setSelectedPlanForPayment(activeOfferPlan);
        setIsPaymentOpen(true);

        alert(
          `⚠️ तुमचा सबस्क्रिप्शन प्लॅन संपलेला (Expired) आहे!\n\nसर्व मोबाईल नंबर अनलॉक करणे व पेड सुविधा तात्पुरत्या बंद झाल्या आहेत. नवीन संपर्क नंबर अनलॉक करण्यासाठी प्रशासनाने उपलब्ध करून दिलेला नवीन प्लॅन निवडून आजच नूतनीकरण करा.`
        );
        return;
      }

      // Free user without active membership
      if (!currentUser.membership || currentUser.membership === 'free') {
        const welcomePlan = plansList.find((p) => p.id === 'welcome_offer' && p.isActive !== false) ||
                            plansList.find((p) => p.isActive !== false) ||
                            MEMBERSHIP_PLANS[0];
        setSelectedPlanForPayment(welcomePlan);
        setIsPaymentOpen(true);
        return;
      }
    }

    // Determine current user's membership plan and limit
    const isLimitDisabled = siteConfig?.disablePlanContactLimit === true;
    const currentPlan = plansList.find((p) => p.id === currentUser.membership);
    const planUnlockLimit = isLimitDisabled
      ? 999999
      : (currentPlan?.unlockCount && currentPlan.unlockCount > 0
          ? currentPlan.unlockCount
          : (currentUser.membership === 'welcome_offer' ? 5 : 99999));

    // If limit reached and limits are NOT disabled
    if (!isLimitDisabled && unlockedContacts.length >= planUnlockLimit) {
      const targetUpgradePlanId = siteConfig?.upgradeRecommendedPlanId || 'monthly';
      const upgradePlan = plansList.find((p) => p.id === targetUpgradePlanId && p.isActive !== false) ||
                          plansList.find((p) => p.id !== 'welcome_offer' && p.id !== 'free' && p.isActive !== false) ||
                          plansList[0];

      setSelectedPlanForPayment(upgradePlan);
      setIsPaymentOpen(true);

      alert(`⚠️ तुमचे ${planUnlockLimit} मोफत/ऑफर संपर्क नंबर अनलॉक पूर्ण झाले आहेत!\n\nपुढील सर्व वधू-वर मोबाईल नंबर व संपूर्ण बायोडाटा पाहण्यासाठी कृपया तुमचा प्लॅन अपग्रेड करा.`);
      return;
    }

    // Unlock contact
    setUnlockedContacts((prev) => [...prev, profileId]);

    const newUnlockedCount = unlockedContacts.length + 1;
    if (isLimitDisabled) {
      alert(`✅ संपर्क नंबर यशस्वीरित्या अनलॉक झाला! (अमर्याद नंबर अनलॉक सिस्टीम चालू आहे)`);
    } else if (currentUser.membership === 'welcome_offer' || (currentPlan?.unlockCount && currentPlan.unlockCount > 0)) {
      if (newUnlockedCount >= planUnlockLimit) {
        alert(`🎉 तुम्ही ${planUnlockLimit} पैकी ${planUnlockLimit} वा संपर्क नंबर यशस्वीरित्या अनलॉक केला आहे!\n\nतुमची ऑफर मधील ${planUnlockLimit} नंबर अनलॉक मर्यादा पूर्ण झाली आहे. पुढील संपर्क नंबर पाहण्यासाठी तुमचा प्लॅन अपग्रेड करा.`);
      } else {
        alert(`✅ संपर्क नंबर यशस्वीरित्या अनलॉक झाला! (${newUnlockedCount}/${planUnlockLimit} नंबर वापरले)`);
      }
    }
  };

  // 8. Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_chats');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Profile Liking State & Pending Approvals
  const [likedProfileIds, setLikedProfileIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_liked_profiles');
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingLikes, setPendingLikes] = useState<any[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_pending_likes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_liked_profiles', JSON.stringify(likedProfileIds));
  }, [likedProfileIds]);

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_pending_likes', JSON.stringify(pendingLikes));
  }, [pendingLikes]);

  const toggleLikeProfile = (profileId: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    const targetUser = profiles.find((p) => p.id === profileId);

    if (siteConfig.autoApproveLikes !== false) {
      const isCurrentlyLiked = likedProfileIds.includes(profileId);
      setLikedProfileIds((prev) =>
        isCurrentlyLiked ? prev.filter((id) => id !== profileId) : [...prev, profileId]
      );
      if (!isCurrentlyLiked && targetUser) {
        const targetLikesMe =
          interests.some((i) => i.fromUserId === profileId && i.toUserId === currentUser.id && i.status !== 'rejected') ||
          pendingLikes.some((l) => l.fromUserId === profileId && l.toUserId === currentUser.id && l.status !== 'rejected') ||
          (targetUser?.shortlistedByUsers || []).includes(currentUser.id);

        const isMutualUnlockEnabled = siteConfig?.enableMutualLikeContactUnlock !== false;
        const isUserPaid = currentUser.membership && currentUser.membership !== 'free' && !isProfilePlanExpired(currentUser);

        if (targetLikesMe && isMutualUnlockEnabled) {
          if (isUserPaid) {
            setUnlockedContacts((prev) => (prev.includes(profileId) ? prev : [...prev, profileId]));
            addNotification({
              userId: profileId,
              title: '🎉 Mutual Like Match! Contact Unlocked',
              titleMr: '🎉 म्युचुअल मॅच! मोबाईल नंबर अनलॉक झाला!',
              message: `You and ${currentUser.fullName} liked each other! Contact number is now unlocked.`,
              messageMr: `तुम्ही व ${currentUser.fullName} यांनी एकमेकांना लाईक केले आहे! दोघांचे मोबाईल नंबर आता अनलॉक झाले आहेत.`,
              type: 'interest',
            });
            alert(`🎉 म्युचुअल मॅच (Mutual Match)! ${targetUser.fullName || 'सदस्याने'} सुद्धा तुम्हाला आधीच लाईक केले होते. एकमेकांनी लाईक केल्यामुळे तुम्हा दोघांचे मोबाईल नंबर आता अनलॉक झाले आहेत!`);
          } else {
            addNotification({
              userId: profileId,
              title: '🎉 Mutual Like Match!',
              titleMr: '🎉 म्युचुअल मॅच! एकमेकांना लाईक प्राप्त!',
              message: `You and ${currentUser.fullName} liked each other! Upgrade plan to view contact number.`,
              messageMr: `तुम्ही व ${currentUser.fullName} यांनी एकमेकांना लाईक केले आहे! नंबर अनलॉक करण्यासाठी प्लॅन खरेदी करा.`,
              type: 'interest',
            });
            const activeOfferPlan = plansList.find((p) => p.isActive !== false && p.id !== 'free') || plansList[0];
            setSelectedPlanForPayment(activeOfferPlan);
            setIsPaymentOpen(true);
            alert(`🎉 म्युचुअल मॅच (Mutual Match)! ${targetUser.fullName || 'सदस्याने'} सुद्धा तुम्हाला आधीच लाईक केले होते!\n\n🔒 परंतु संपर्क क्रमांक अनलॉक करून पाहण्यासाठी व थेट संपर्क साधण्यासाठी कृपया ऑनलाईन पेमेंट / प्लॅन खरेदी करा.`);
          }
        } else {
          addNotification({
            userId: profileId,
            title: 'New Like Received',
            titleMr: 'तुमच्या बायोडाटावर नवीन पसंती (Like)!',
            message: `${currentUser.fullName} liked your profile.`,
            messageMr: `${currentUser.fullName} यांनी तुमच्या बायोडाटावर पसंती दर्शवली आहे.`,
            type: 'interest',
          });
        }
      }
      logActivity(
        'Profile Like',
        `${currentUser.fullName} (${currentUser.id}) यांनी ${targetUser?.fullName || profileId} यांच्या प्रोफाईलला 'लाईक' केले.`,
        currentUser.fullName
      );
    } else {
      // Pending Admin Approval
      const exists = pendingLikes.some(
        (l) => l.fromUserId === currentUser.id && l.toUserId === profileId && l.status === 'pending'
      );
      if (!exists) {
        const newLikeReq = {
          id: 'like-' + Date.now(),
          fromUserId: currentUser.id,
          fromUserName: currentUser.fullName,
          toUserId: profileId,
          toUserName: targetUser?.fullName || profileId,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        setPendingLikes((prev) => [newLikeReq, ...prev]);
        logActivity(
          'Profile Like Requested',
          `${currentUser.fullName} यांनी ${targetUser?.fullName || profileId} च्या प्रोफाईलला 'लाईक' विनंती पाठवली (ॲडमिन मंजुरी प्रलंबित).`,
          currentUser.fullName
        );
        alert('टीप: तुमची लाईक विनंती ॲडमिनकडे पाठवली गेली आहे. ॲडमिनने मंजूर केल्यावर समोरच्या सदस्याला सूचित केले जाईल.');
      }
    }
  };

  const approveLike = (id: string) => {
    const likeObj = pendingLikes.find((l) => l.id === id);
    if (!likeObj) return;

    setPendingLikes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l))
    );
    setLikedProfileIds((prev) => (prev.includes(likeObj.toUserId) ? prev : [...prev, likeObj.toUserId]));

    logActivity('Approve Like', `ॲडमिनने ${likeObj.fromUserName} यांचा ${likeObj.toUserName} साठीचा लाईक मंजूर केला.`);
  };

  const rejectLike = (id: string) => {
    setPendingLikes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l))
    );
    logActivity('Reject Like', `ॲडमिनने लाईक नाकारला ID: ${id}`);
  };

  const bulkApproveLikes = (ids: string[]) => {
    ids.forEach((id) => approveLike(id));
  };

  const containsContactInfo = (text: string): boolean => {
    if (!text) return false;

    // Normalize Devanagari numerals ०-९ to 0-9
    const normalizedDigits = text.replace(/[०१२३४५६७८९]/g, (d) =>
      ('०१२३४५६७८९'.indexOf(d)).toString()
    );

    // 1. Any digit sequence of 8+ digits, ignoring spaces/dashes/dots between them
    const digitsOnly = normalizedDigits.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 8) {
      return true;
    }

    // 2. Email regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(text)) return true;

    // 3. Number words in English and Marathi
    const numberWordsPattern = /(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|शून्य|एक|दोन|तीन|चार|पाच|सहा|सात|आठ|नऊ|नौ|दो|तिन|चार|पांच|छे|सात|आठ|नाईन|एट|सेव्हन|सिक्स|फायव्ह|फोर|थ्री|टू|वन|झिरो)/gi;
    const wordMatches = text.match(numberWordsPattern);
    if (wordMatches && wordMatches.length >= 3) {
      return true;
    }

    // 4. Contact keywords + numbers
    const contactKeywordRegex = /(?:call|whatsapp|mobile|phone|contact|number|क्रमांक|नंबर|मोबाईल|फोन|कॉल|व्हाट्सॲप)[\s:=.-]*[0-9०-९a-zA-Z]+/i;
    if (contactKeywordRegex.test(text) && digitsOnly.length >= 4) {
      return true;
    }

    return false;
  };

  const sendChatMessage = (
    receiverId: string,
    text: string,
    imageUrl?: string,
    voiceUrl?: string,
    pdfUrl?: string,
    pdfName?: string,
    fileType?: 'image' | 'pdf' | 'voice'
  ): { success: boolean; message?: string } => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return { success: false, message: 'कृपया प्रथम लॉगिन करा.' };
    }

    if (currentUser.isChatBlocked) {
      return { success: false, message: 'तुमचे चॅट खाते प्रशासकाने ब्लॉक केले आहे.' };
    }

    if (!siteConfig.enableChatGlobal && !isAdminLoggedIn) {
      return { success: false, message: 'साइटवर चॅट सुविधा प्रशासनाने तात्पुरती बंद केली आहे.' };
    }

    if (siteConfig.blockContactSharingInChat && containsContactInfo(text)) {
      return {
        success: false,
        message: "सुरक्षेच्या नियमांनुसार चॅटमध्ये मोबाईल नंबर किंवा संपर्क माहिती (आकड्यांमध्ये किंवा अक्षरांमध्ये) थेट शेअर करता येत नाही. कृपया 'संपर्क मागणी' (Request Contact) पर्याय वापरा किंवा ॲडमिनच्या परवानगीने नंबर मिळवा."
      };
    }

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      imageUrl,
      pdfUrl,
      pdfName,
      fileType: fileType || (pdfUrl ? 'pdf' : imageUrl ? 'image' : voiceUrl ? 'voice' : undefined),
      voiceUrl,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    syncDocToFirestore('chatMessages', newMsg.id, newMsg);

    return { success: true };
  };

  const deleteChatMessage = (messageId: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const toggleBlockUserChat = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, isChatBlocked: !p.isChatBlocked };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
  };

  // 9. Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    syncDocToFirestore('notifications', newNotif.id, newNotif);

    // Trigger Web Browser Notification API if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotif.titleMr || newNotif.title, {
          body: newNotif.messageMr || newNotif.message,
          icon: '/favicon.ico',
        });
      } catch (e) {
        // Ignore iframe restriction or permission errors
      }
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, isRead: true };
          syncDocToFirestore('notifications', n.id, updated);
          return updated;
        }
        return n;
      })
    );
  };

  const addBroadcastNotification = (titleMr: string, messageMr: string) => {
    addNotification({
      userId: 'all',
      title: 'VanjariJodi Notice',
      titleMr,
      message: messageMr,
      messageMr,
      type: 'system',
    });
  };

  const sendPushNotification = (targetUserId: string, titleMr: string, messageMr: string) => {
    addNotification({
      userId: targetUserId,
      title: 'VanjariJodi Push Notification',
      titleMr: titleMr || 'वंजारी जोडी पुश सूचना',
      message: messageMr,
      messageMr: messageMr,
      type: 'system',
    });
    logActivity(
      'Push Notification Sent',
      `पुश सूचना पाठवली [लक्षित: ${targetUserId === 'all' ? 'सर्व सदस्य' : targetUserId}]: ${titleMr}`,
      'Admin'
    );
  };

  // 10. Success Stories
  const [successStories, setSuccessStories] = useState<SuccessStory[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_stories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((s: any) => s && s.id && !s.id.startsWith('story-') && !s.coupleName?.includes('विशाल'));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_stories', JSON.stringify(successStories));
  }, [successStories]);

  const addSuccessStory = (story: SuccessStory) => {
    setSuccessStories((prev) => [story, ...prev]);
  };

  const submitSuccessStory = (storyData: Omit<SuccessStory, 'id' | 'createdAt' | 'status'>) => {
    const newStory: SuccessStory = {
      ...storyData,
      id: 'story-' + Date.now(),
      status: 'pending',
      submittedByUserId: currentUser?.id,
      submittedByUserName: currentUser?.fullName,
      createdAt: new Date().toISOString(),
    };
    setSuccessStories((prev) => [newStory, ...prev]);

    addNotification({
      userId: 'admin',
      title: 'New Success Story Submitted',
      titleMr: 'नवीन यशोगाथा (आम्ही जुळलो) प्राप्त!',
      message: `${storyData.coupleName} submitted a success story for review.`,
      messageMr: `${storyData.coupleName} यांनी यशोगाथा मंजुरीसाठी सादर केली आहे.`,
      type: 'system',
    });
  };

  const approveSuccessStory = (storyId: string) => {
    setSuccessStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, status: 'approved' } : s))
    );
  };

  const rejectSuccessStory = (storyId: string) => {
    setSuccessStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, status: 'rejected' } : s))
    );
  };

  const updateSuccessStory = (story: SuccessStory) => {
    setSuccessStories((prev) => prev.map((s) => (s.id === story.id ? story : s)));
  };

  const deleteSuccessStory = (id: string) => {
    setSuccessStories((prev) => prev.filter((s) => s.id !== id));
  };

  const bulkDeleteSuccessStories = (ids: string[]) => {
    setSuccessStories((prev) => prev.filter((s) => !ids.includes(s.id)));
  };

  // 10b. Offline Payment Requests Engine
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_payment_reqs');
    return saved ? JSON.parse(saved).filter((r: any) => !r.userId?.startsWith('vj-1')) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_payment_reqs', JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  const addPaymentRequest = (reqData: Omit<PaymentRequest, 'id' | 'createdAt' | 'status'>) => {
    // Razorpay or verified gateway payments are 100% verified by bank/gateway with transaction signatures
    const isGatewayVerified =
      reqData.paymentMethod === 'razorpay' ||
      (reqData as any).isVerifiedGateway === true ||
      Boolean((reqData as any).razorpayPaymentId);

    // Cross-check for duplicate UTR across existing plan requests, contact unlocks, and profile history
    const cleanUtr = (reqData.utrNumber || '').trim().replace(/[^0-9a-zA-Z]/g, '');
    const isDuplicateUtr = cleanUtr
      ? paymentRequests.some((r) => r.utrNumber === cleanUtr) ||
        payPerContactRequests.some((r) => r.utrNumber === cleanUtr) ||
        profiles.some((p) => p.paymentUtr === cleanUtr)
      : false;

    // Cross-check for duplicate screenshot
    const isDuplicateScreenshot =
      reqData.screenshotUrl && reqData.screenshotUrl.trim() !== ''
        ? paymentRequests.some((r) => r.screenshotUrl === reqData.screenshotUrl && r.userId !== reqData.userId) ||
          payPerContactRequests.some((r) => r.screenshotUrl === reqData.screenshotUrl && r.userId !== reqData.userId)
        : false;

    // Manual UTR submissions require Admin verification by default to prevent fake UTR fraud.
    // If it is a duplicate UTR, it must NEVER be auto-unlocked under any circumstance.
    const isAutoUnlock =
      isGatewayVerified && !isDuplicateUtr;

    const userProfileObj = profiles.find((p) => p.id === reqData.userId || p.mobile === reqData.userMobile);
    const matchedPlan = plansList.find((p) => p.id === reqData.planId);
    const nowIso = new Date().toISOString();

    let durationLabel = matchedPlan?.durationText || matchedPlan?.validityText || '६ महिने (180 दिवस)';
    if (reqData.planId === 'yearly') durationLabel = '१ वर्ष (365 दिवस)';
    if (reqData.planId === 'lifetime') durationLabel = 'आजीवन (Unlimited)';
    if (reqData.planId === 'monthly') durationLabel = '६ महिने (180 दिवस)';
    if (reqData.planId === 'welcome_offer') durationLabel = '३० दिवस (वेलकम ऑफर)';

    const newReq: PaymentRequest = {
      ...reqData,
      utrNumber: cleanUtr,
      id: 'pay-req-' + Date.now(),
      status: isAutoUnlock ? 'approved' : 'pending',
      createdAt: nowIso,
      approvedAt: isAutoUnlock ? nowIso : undefined,
      isAutoApproved: isAutoUnlock,
      isDuplicateUtr,
      isDuplicateScreenshot,
      planDurationText: durationLabel,
      userPhotoUrl: reqData.userPhotoUrl || userProfileObj?.photoUrl,
    };
    setPaymentRequests((prev) => [newReq, ...prev]);

    if (isAutoUnlock) {
      updateMemberTier(reqData.userId, reqData.planId, undefined, {
        paidAt: nowIso,
        paymentApprovedAt: nowIso,
        paymentAmount: reqData.amount,
        paymentUtr: reqData.utrNumber,
        paymentPlanName: reqData.planName,
      });
      addNotification({
        userId: reqData.userId,
        title: 'Payment Auto-Approved',
        titleMr: 'पेमेंट ऑटो-मंजूर आणि प्लॅन सुरु झाला!',
        message: `Your payment for ${reqData.planName} was auto-verified.`,
        messageMr: `गेटवे प्रणालीद्वारे तुमचे ${reqData.planName} (${durationLabel}) पेमेंट तात्काळ मंजूर होऊन सेवा सक्रिय झाली आहे.`,
        type: 'approval',
      });
    } else {
      addNotification({
        userId: 'admin',
        title: 'New Payment Verification Request',
        titleMr: isDuplicateUtr ? '⚠️ संशयास्पद / डुप्लिकेट UTR पेमेंट पावती प्राप्त!' : 'नवीन पेमेंट पावती प्राप्त झाली!',
        message: `${reqData.userName} submitted payment proof for ${reqData.planName}`,
        messageMr: `${reqData.userName} यांनी ${reqData.planName} सबस्क्रिप्शनसाठी UTR: ${cleanUtr} पाठवले आहे.${isDuplicateUtr ? ' (सूचना: हा UTR आधीच वापरलेला आढळला आहे)' : ' ॲडमिन कडून खात्री करून मंजूर केले जाईल.'}`,
        type: 'system',
      });
    }
  };

  const approvePaymentRequest = (id: string) => {
    const target = paymentRequests.find((r) => r.id === id);
    if (!target) return;

    const nowIso = new Date().toISOString();

    setPaymentRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved', approvedAt: nowIso } : r))
    );

    // Update user membership tier & mark verified
    updateMemberTier(target.userId, target.planId, undefined, {
      paidAt: target.createdAt || nowIso,
      paymentApprovedAt: nowIso,
      paymentAmount: target.amount,
      paymentUtr: target.utrNumber,
      paymentPlanName: target.planName,
    });

    // Add notification
    addNotification({
      userId: target.userId,
      title: 'Payment Approved',
      titleMr: 'पेमेंट मंजूर आणि अकाऊंट ॲक्टिव्ह झाले!',
      message: `Your payment for ${target.planName} has been verified and activated.`,
      messageMr: `तुमचे ${target.planName} पेमेंट मंजूर झाले असून प्रीमियम सेवा सक्रिय झाली आहे.`,
      type: 'approval',
    });
  };

  const rejectPaymentRequest = (id: string) => {
    setPaymentRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
  };

  const deletePaymentRequest = (id: string) => {
    setPaymentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const bulkApprovePaymentRequests = (ids: string[]) => {
    ids.forEach((id) => approvePaymentRequest(id));
  };

  const bulkDeletePaymentRequests = (ids: string[]) => {
    setPaymentRequests((prev) => prev.filter((r) => !ids.includes(r.id)));
  };

  // 11. Modal & View States
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'profiles'>('home');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'member_otp' | 'member_pass' | 'guest'>('member_otp');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedProfileForModal, setSelectedProfileForModal] = useState<UserProfile | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPaymentOpenRaw, setIsPaymentOpenRaw] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);

  const setIsPaymentOpen = (open: boolean) => {
    if (open) {
      setSelectedPlanForPayment(prevPlan => {
        if (!prevPlan) {
          return plansList.find((p) => p.id === 'welcome_offer' && p.isActive !== false) ||
                 plansList.find((p) => p.isActive !== false) ||
                 MEMBERSHIP_PLANS[0];
        }
        return prevPlan;
      });
    }
    setIsPaymentOpenRaw(open);
  };

  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(null);
  const [activeVideoUser, setActiveVideoUser] = useState<UserProfile | null>(null);

  // Paid Plans Toggle State (Default true for active membership mode)
  const [isPaidPlansEnabled, setIsPaidPlansEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vanjari_jodi_paid_plans');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_paid_plans', String(isPaidPlansEnabled));
  }, [isPaidPlansEnabled]);



  // Feature Toggles
  const [isSuccessStoriesEnabled, setIsSuccessStoriesEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vanjari_jodi_stories_toggle');
    return saved !== null ? saved === 'true' : true;
  });
  useEffect(() => {
    localStorage.setItem('vanjari_jodi_stories_toggle', String(isSuccessStoriesEnabled));
  }, [isSuccessStoriesEnabled]);

  const [isAdsEnabled, setIsAdsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vanjari_jodi_ads_toggle');
    return saved !== null ? saved === 'true' : true;
  });
  useEffect(() => {
    localStorage.setItem('vanjari_jodi_ads_toggle', String(isAdsEnabled));
  }, [isAdsEnabled]);

  const [isCountersEnabled, setIsCountersEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vanjari_jodi_counters_toggle');
    return saved !== null ? saved === 'true' : false;
  });
  useEffect(() => {
    localStorage.setItem('vanjari_jodi_counters_toggle', String(isCountersEnabled));
  }, [isCountersEnabled]);

  // Hero Slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_hero_slides');
    return saved ? JSON.parse(saved) : INITIAL_HERO_SLIDES;
  });
  useEffect(() => {
    localStorage.setItem('vanjari_jodi_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  const addHeroSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = { ...slide, id: 'slide-' + Date.now() };
    setHeroSlides((prev) => [...prev, newSlide]);
  };

  const deleteHeroSlide = (slideId: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== slideId));
  };

  // Counters
  const [counters, setCounters] = useState<CounterItem[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_counters');
    return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
  });
  useEffect(() => {
    localStorage.setItem('vanjari_jodi_counters', JSON.stringify(counters));
  }, [counters]);

  const updateCounter = (id: string, value: string, labelMr?: string) => {
    setCounters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value, labelMr: labelMr || c.labelMr } : c))
    );
  };

  // 12. Contact Requests & Number Privacy Authorization Engine
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_contact_requests');
    return saved ? JSON.parse(saved).filter((r: any) => !r.requesterId?.startsWith('vj-1') && !r.targetProfileId?.startsWith('vj-1')) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_contact_requests', JSON.stringify(contactRequests));
  }, [contactRequests]);

  const requestContactAuthorization = (targetProfileId: string, note?: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    const targetProfile = profiles.find((p) => p.id === targetProfileId);
    if (!targetProfile) return;

    // Check if request already exists
    const existing = contactRequests.find(
      (r) => r.requesterId === currentUser.id && r.targetProfileId === targetProfileId
    );
    if (existing) return;

    const newReq: ContactRequest = {
      id: 'req-' + Date.now(),
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterMobile: currentUser.mobile,
      targetProfileId: targetProfile.id,
      targetProfileName: targetProfile.fullName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note,
    };

    setContactRequests((prev) => [newReq, ...prev]);

    addNotification({
      userId: 'admin',
      title: 'New Contact Request',
      titleMr: 'संपर्क क्रमांक मागणी प्राप्त!',
      message: `${currentUser.fullName} requested contact of ${targetProfile.fullName}`,
      messageMr: `${currentUser.fullName} यांनी ${targetProfile.fullName} यांच्या संपर्क क्रमांकाची मागणी केली आहे.`,
      type: 'system',
    });
  };

  const rejectContactRequest = (requestId: string) => {
    setContactRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  const authorizeContactRequest = (requestId: string) => {
    setContactRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          if (!unlockedContacts.includes(r.targetProfileId)) {
            setUnlockedContacts((u) => [...u, r.targetProfileId]);
          }
          return { ...r, status: 'authorized' };
        }
        return r;
      })
    );
  };

  const authorizeAllContactRequests = () => {
    setContactRequests((prev) =>
      prev.map((r) => {
        if (!unlockedContacts.includes(r.targetProfileId)) {
          setUnlockedContacts((u) => [...u, r.targetProfileId]);
        }
        return { ...r, status: 'authorized' };
      })
    );
  };

  const isContactAuthorizedForUser = (targetProfileId: string): boolean => {
    if (isAdminLoggedIn) return true;
    if (currentUser?.id === targetProfileId) return true;

    const targetProfile = profiles.find((p) => p.id === targetProfileId);
    const isOverride = siteConfig?.adminOverrideMemberPrivacy === true;
    const allowMemberPrivacy = siteConfig?.allowMembersToControlPrivacy !== false;

    // Check individual per-profile admin overrides
    if (targetProfile?.forceHideContact === true) {
      if (unlockedContacts.includes(targetProfileId)) return true;
      return false;
    }
    if (targetProfile?.forceShowContact === true) {
      return true;
    }

    const isUserPaid = Boolean(
      currentUser &&
      !currentUser.id.startsWith('guest') &&
      ((currentUser.membership && currentUser.membership !== 'free') || currentUser.isCustomAccessGranted) &&
      !isProfilePlanExpired(currentUser)
    );

    // Check Mutual Like Contact Unlock (जर म्युचुअल लाईक संपर्क अनलॉक पर्याय सुरू असेल)
    if (currentUser && siteConfig?.enableMutualLikeContactUnlock !== false) {
      const iLikeTarget =
        likedProfileIds.includes(targetProfileId) ||
        interests.some(
          (i) => i.fromUserId === currentUser.id && i.toUserId === targetProfileId && i.status !== 'rejected'
        ) ||
        pendingLikes.some(
          (l) => l.fromUserId === currentUser.id && l.toUserId === targetProfileId && l.status !== 'rejected'
        );

      const targetLikesMe =
        interests.some(
          (i) => i.fromUserId === targetProfileId && i.toUserId === currentUser.id && i.status !== 'rejected'
        ) ||
        pendingLikes.some(
          (l) => l.fromUserId === targetProfileId && l.toUserId === currentUser.id && l.status !== 'rejected'
        ) ||
        (targetProfile?.shortlistedByUsers || []).includes(currentUser.id);

      if (iLikeTarget && targetLikesMe) {
        // Mutual match exists! Require payment if user is free
        if (isUserPaid || unlockedContacts.includes(targetProfileId)) {
          return true;
        }
        return false;
      }

      // If mode is strictly mutual like only, require mutual match
      if (siteConfig?.contactUnlockMode === 'mutual_like_only') {
        return false;
      }
    }

    const isPublicVisitor = !currentUser;
    const isGuest = currentUser && currentUser.id.startsWith('guest');
    const isMember = currentUser && !currentUser.id.startsWith('guest');

    if ((isPublicVisitor || isGuest) && targetProfile?.allowGuestContactView === true) {
      return true;
    }

    // If member wants to hide contact and member privacy control is enabled AND admin override is off
    if (allowMemberPrivacy && targetProfile && targetProfile.privacy?.hideContact && !isOverride) {
      if (unlockedContacts.includes(targetProfileId)) return true;
      if (currentUser) {
        const authorizedReq = contactRequests.find(
          (r) =>
            r.requesterId === currentUser.id &&
            r.targetProfileId === targetProfileId &&
            r.status === 'authorized'
        );
        if (authorizedReq) return true;
      }
      return false;
    }

    // Check full access for active paid members (Monthly, Yearly, Lifetime, Gold, Diamond, VIP, etc.)
    const isUserPlanExpired = isProfilePlanExpired(currentUser);
    if (isMember && siteConfig?.enableFullAccessForPaidMembers !== false && !isUserPlanExpired) {
      if (currentUser.membership && currentUser.membership !== 'free') {
        const userPlan = plansList.find((p) => p.id === currentUser.membership);
        const isLimitedPlan = (currentUser.membership === 'welcome_offer') || (userPlan?.unlockCount && userPlan.unlockCount < 99);
        if (isLimitedPlan) {
          if (unlockedContacts.includes(targetProfileId)) {
            return true;
          }
          if (siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts) {
            return true;
          }
          return false;
        }
        return true;
      }
      if (currentUser.isCustomAccessGranted) {
        return true;
      }
    }

    // Now check category-specific site settings
    if (isPublicVisitor && siteConfig?.allowPublicVisitorsToViewContacts) {
      return true;
    }
    if (isGuest && siteConfig?.allowGuestsToViewContacts) {
      return true;
    }
    if (isMember && siteConfig?.allowMembersToViewContacts) {
      return true;
    }

    if (unlockedContacts.includes(targetProfileId)) return true;
    if (currentUser) {
      const authorizedReq = contactRequests.find(
        (r) =>
          r.requesterId === currentUser.id &&
          r.targetProfileId === targetProfileId &&
          r.status === 'authorized'
      );
      if (authorizedReq) return true;
    }
    return false;
  };

  const toggleHideContact = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, privacy: { ...p.privacy, hideContact: !p.privacy.hideContact } };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
  };

  // 14. Community Ads & Sponsorships Engine
  const [communityAds, setCommunityAds] = useState<CommunityAd[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_ads');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_ads', JSON.stringify(communityAds));
  }, [communityAds]);

  const addCommunityAd = (adData: Omit<CommunityAd, 'id' | 'createdAt'>) => {
    const newAd: CommunityAd = {
      ...adData,
      id: 'ad-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCommunityAds((prev) => [newAd, ...prev]);
  };

  const toggleAdStatus = (adId: string) => {
    setCommunityAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const deleteCommunityAd = (adId: string) => {
    setCommunityAds((prev) => prev.filter((a) => a.id !== adId));
  };

  // 15. Admin State
  const [isAdminLoggedIn, setIsAdminLoggedInState] = useState<boolean>(() => {
    return localStorage.getItem('vanjari_jodi_is_admin_logged_in') === 'true';
  });

  const setIsAdminLoggedIn = (val: boolean) => {
    setIsAdminLoggedInState(val);
    if (val) {
      localStorage.setItem('vanjari_jodi_is_admin_logged_in', 'true');
    } else {
      localStorage.removeItem('vanjari_jodi_is_admin_logged_in');
    }
  };

  const approveProfile = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, isApproved: true, isVerified: true };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
  };

  const rejectProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    deleteDocFromFirestore('profiles', profileId);
  };

  const toggleBlockProfile = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, isApproved: !p.isApproved };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
  };

  const updateMemberTier = (
    profileId: string,
    tier: MembershipTier,
    bonusUnlocksOverride?: number,
    extraPaymentInfo?: {
      paidAt?: string;
      paymentApprovedAt?: string;
      paymentAmount?: number;
      paymentUtr?: string;
      paymentPlanName?: string;
    }
  ) => {
    let bonusUnlocks = bonusUnlocksOverride ?? 0;
    const matchingPlan = plansList.find((pl) => pl.id === tier);
    if (matchingPlan) {
      if (!bonusUnlocksOverride) {
        if (matchingPlan.unlockCount) {
          bonusUnlocks = matchingPlan.unlockCount;
        } else if (tier === 'welcome_offer') {
          bonusUnlocks = 5;
        }
      }

      // Auto increment plan member count and check seat limit
      setPlansList((prevPlans) =>
        prevPlans.map((pl) => {
          if (pl.id === tier) {
            const newCount = (pl.currentMemberCount || 0) + 1;
            const isFilled =
              pl.isLimitedSlotsPlan &&
              pl.maxMemberLimit &&
              pl.maxMemberLimit > 0 &&
              newCount >= pl.maxMemberLimit;

            return {
              ...pl,
              currentMemberCount: newCount,
              isActive: isFilled ? false : pl.isActive,
            };
          }
          return pl;
        })
      );
    }

    const nowIso = new Date().toISOString();
    const paidDate = extraPaymentInfo?.paidAt || nowIso;
    const approvedDate = extraPaymentInfo?.paymentApprovedAt || nowIso;

    let calcExpiryIso: string | undefined = undefined;
    if (matchingPlan?.durationMonths && matchingPlan.durationMonths > 0) {
      const d = new Date(approvedDate);
      d.setMonth(d.getMonth() + matchingPlan.durationMonths);
      calcExpiryIso = d.toISOString();
    } else if (tier === 'welcome_offer') {
      const d = new Date(approvedDate);
      d.setDate(d.getDate() + 30);
      calcExpiryIso = d.toISOString();
    } else if (tier === 'monthly' || tier === 'silver') {
      const d = new Date(approvedDate);
      d.setDate(d.getDate() + 90);
      calcExpiryIso = d.toISOString();
    } else if (tier === 'gold' || tier === 'diamond') {
      const d = new Date(approvedDate);
      d.setDate(d.getDate() + 180);
      calcExpiryIso = d.toISOString();
    } else if (tier === 'yearly') {
      const d = new Date(approvedDate);
      d.setFullYear(d.getFullYear() + 1);
      calcExpiryIso = d.toISOString();
    }

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated: UserProfile = {
            ...p,
            membership: tier,
            isApproved: true,
            isVerified: true,
            paidAt: p.paidAt || paidDate,
            paymentApprovedAt: approvedDate,
            paymentAmount: extraPaymentInfo?.paymentAmount ?? p.paymentAmount ?? matchingPlan?.price,
            paymentUtr: extraPaymentInfo?.paymentUtr || p.paymentUtr,
            paymentPlanName: extraPaymentInfo?.paymentPlanName || matchingPlan?.name || tier,
            membershipExpiryDate: calcExpiryIso || p.membershipExpiryDate,
            isPlanExpired: false,
            unlockedContactsCount: (p.unlockedContactsCount || 0) + (bonusUnlocks || (tier === 'welcome_offer' ? 5 : 0)),
          };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );

    if (currentUser?.id === profileId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              membership: tier,
              isApproved: true,
              isVerified: true,
              paidAt: prev.paidAt || paidDate,
              paymentApprovedAt: approvedDate,
              paymentAmount: extraPaymentInfo?.paymentAmount ?? prev.paymentAmount ?? matchingPlan?.price,
              paymentUtr: extraPaymentInfo?.paymentUtr || prev.paymentUtr,
              paymentPlanName: extraPaymentInfo?.paymentPlanName || matchingPlan?.name || tier,
              membershipExpiryDate: calcExpiryIso || prev.membershipExpiryDate,
              isPlanExpired: false,
              unlockedContactsCount: (prev.unlockedContactsCount || 0) + (bonusUnlocks || (tier === 'welcome_offer' ? 5 : 0)),
            }
          : null
      );
    }
  };

  const addProfile = (newProfile: UserProfile) => {
    const isPaidMember = Boolean(newProfile.membership && newProfile.membership !== 'free');
    const isAutoApproved = isPaidMember || (siteConfig.isAutoModeEnabled && (siteConfig.autoApproveNewRegistrations || siteConfig.autoModeType === 'free_for_all'));
    const isApprovedStatus = typeof newProfile.isApproved === 'boolean'
      ? newProfile.isApproved
      : (isAutoApproved ? true : false);
    const profileToSave = { ...newProfile, isApproved: isApprovedStatus };
    setProfiles((prev) => [profileToSave, ...prev]);
    setCurrentUser(profileToSave);
    syncDocToFirestore('profiles', profileToSave.id, profileToSave);
    logActivity('New Registration', `नवीन प्रोफाईल जोडले: ${profileToSave.fullName} (${profileToSave.gender === 'bride' ? 'वधू' : 'वर'}) ${isApprovedStatus ? '[ऑटो मंजूर]' : '[ॲडमिन मंजुरी प्रलंबित]'}`, profileToSave.fullName);
  };

  // 16. Admin Direct Support Chat Messages & Real-time Notifications
  const [adminSupportMessages, setAdminSupportMessages] = useState<AdminSupportMessage[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_admin_support_chat');
    return saved
      ? JSON.parse(saved).filter((m: any) => !m.senderId?.startsWith('vj-1'))
      : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_admin_support_chat', JSON.stringify(adminSupportMessages));
  }, [adminSupportMessages]);

  const sendAdminSupportMessage = (
    message: string,
    fileUrl?: string,
    fileName?: string,
    userMobile?: string,
    customName?: string,
    customSenderId?: string,
    fileType?: 'image' | 'pdf' | 'doc'
  ) => {
    const senderId = currentUser ? currentUser.id : (customSenderId || 'visitor-guest');
    const senderName = currentUser ? currentUser.fullName : (customName || 'अभ्यागत (Visitor)');
    const mobile = currentUser ? currentUser.mobile : (userMobile || '');

    const detectedType = fileType || (fileUrl?.toLowerCase().includes('.pdf') || fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : fileUrl ? 'image' : undefined);

    const newMsg: AdminSupportMessage = {
      id: 'sup-' + Date.now(),
      senderId,
      senderName,
      senderRole: 'user',
      message,
      fileUrl,
      fileName,
      fileType: detectedType,
      imageUrl: detectedType === 'image' ? fileUrl : undefined,
      pdfUrl: detectedType === 'pdf' ? fileUrl : undefined,
      pdfName: detectedType === 'pdf' ? fileName : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReadByAdmin: false,
      isReadByUser: true,
      userMobile: mobile,
    };

    setAdminSupportMessages((prev) => [...prev, newMsg]);
    syncDocToFirestore('adminSupportMessages', newMsg.id, newMsg);
    logActivity('Support Chat', `${senderName} ने ॲडमिनला मेसेज पाठवला`, senderName);

    // Instant Notification to Admin
    addNotification({
      userId: 'admin',
      title: 'New Member Message Received',
      titleMr: '📩 सदस्याकडून नवीन संदेश प्राप्त!',
      message: `${senderName}: ${message}`,
      messageMr: `${senderName} (${mobile || 'मोबाईल नाही'}): ${message}`,
      type: 'chat',
    });
  };

  const replyAdminSupportMessage = (
    targetSenderId: string,
    message: string,
    fileUrl?: string,
    fileName?: string,
    fileType?: 'image' | 'pdf' | 'doc'
  ) => {
    const targetUser = profiles.find((p) => p.id === targetSenderId);
    const detectedType = fileType || (fileUrl?.toLowerCase().includes('.pdf') || fileName?.toLowerCase().endsWith('.pdf') ? 'pdf' : fileUrl ? 'image' : undefined);

    const newMsg: AdminSupportMessage = {
      id: 'sup-' + Date.now(),
      senderId: targetSenderId,
      senderName: targetUser ? targetUser.fullName : 'अभ्यागत',
      senderRole: 'admin',
      message,
      fileUrl,
      fileName,
      fileType: detectedType,
      imageUrl: detectedType === 'image' ? fileUrl : undefined,
      pdfUrl: detectedType === 'pdf' ? fileUrl : undefined,
      pdfName: detectedType === 'pdf' ? fileName : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReadByAdmin: true,
      isReadByUser: false,
      userMobile: targetUser?.mobile,
    };

    setAdminSupportMessages((prev) => [...prev, newMsg]);
    syncDocToFirestore('adminSupportMessages', newMsg.id, newMsg);
    logActivity('Admin Reply', `ॲडमिनने ${targetUser?.fullName || targetSenderId} ला उत्तर दिले`, 'Admin');
  };

  const markAdminSupportMessagesRead = (targetSenderId?: string) => {
    setAdminSupportMessages((prev) => {
      let changed = false;
      const updated = prev.map((m) => {
        if (targetSenderId) {
          if (m.senderId === targetSenderId) {
            if (m.senderRole === 'user' && !m.isReadByAdmin) {
              changed = true;
              return { ...m, isReadByAdmin: true };
            }
            if (m.senderRole === 'admin' && !m.isReadByUser) {
              changed = true;
              return { ...m, isReadByUser: true };
            }
          }
        } else {
          if (m.senderRole === 'user' && !m.isReadByAdmin) {
            changed = true;
            return { ...m, isReadByAdmin: true };
          }
        }
        return m;
      });
      if (changed && targetSenderId) {
        updated.forEach((m) => {
          if (m.senderId === targetSenderId && (m.isReadByAdmin || m.isReadByUser)) {
            syncDocToFirestore('adminSupportMessages', m.id, m);
          }
        });
      }
      return updated;
    });
  };

  const unreadAdminChatCount = adminSupportMessages.filter(
    (m) => m.senderRole === 'user' && !m.isReadByAdmin
  ).length;

  // 17. Recycle Bin & Storage Purge System
  const [recycleBin, setRecycleBin] = useState<RecycleBinItem[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_recycle_bin');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_recycle_bin', JSON.stringify(recycleBin));
  }, [recycleBin]);

  const softDeleteProfile = (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    // Send profile photos to Photo Trash / Recycle Bin
    if (target.photoUrl && target.photoUrl.trim() !== '') {
      trashPhoto(target.id, target.photoUrl, 'avatar', target.fullName);
    }
    if (target.photos && target.photos.length > 0) {
      target.photos.forEach((ph) => {
        if (ph && ph !== target.photoUrl) {
          trashPhoto(target.id, ph, 'gallery', target.fullName);
        }
      });
    }

    const newItem: RecycleBinItem = {
      id: 'recy-' + Date.now(),
      originalType: 'biodata',
      title: `${target.fullName} (${target.gender === 'bride' ? 'वधू' : 'वर'} - ${target.district})`,
      deletedAt: new Date().toLocaleString(),
      data: target,
    };

    setRecycleBin((prev) => [newItem, ...prev]);
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    deleteDocFromFirestore('profiles', profileId);
    logActivity('Soft Delete', `${target.fullName} यांची प्रोफाईल व फोटो रिसायकल बिन मध्ये टाकले`, 'Admin');
  };

  const bulkSoftDeleteProfiles = (profileIds: string[]) => {
    profileIds.forEach((pid) => {
      const target = profiles.find((p) => p.id === pid);
      if (target) {
        if (target.photoUrl && target.photoUrl.trim() !== '') {
          trashPhoto(target.id, target.photoUrl, 'avatar', target.fullName);
        }
        if (target.photos && target.photos.length > 0) {
          target.photos.forEach((ph) => {
            if (ph && ph !== target.photoUrl) {
              trashPhoto(target.id, ph, 'gallery', target.fullName);
            }
          });
        }
        const newItem: RecycleBinItem = {
          id: 'recy-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          originalType: 'biodata',
          title: `${target.fullName} (${target.gender === 'bride' ? 'वधू' : 'वर'} - ${target.district})`,
          deletedAt: new Date().toLocaleString(),
          data: target,
        };
        setRecycleBin((prev) => [newItem, ...prev]);
        deleteDocFromFirestore('profiles', pid);
      }
    });
    setProfiles((prev) => prev.filter((p) => !profileIds.includes(p.id)));
    logActivity('Bulk Soft Delete', `${profileIds.length} प्रोफाईल व फोटो एकत्र रिसायकल बिनमध्ये हलवले`, 'Admin');
  };

  // Profile Removal & Marriage Fixed Requests Engine
  const [isProfileRemovalModalOpen, setIsProfileRemovalModalOpen] = useState(false);
  const [profileRemovalRequests, setProfileRemovalRequests] = useState<ProfileRemovalRequest[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_removal_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_removal_requests', JSON.stringify(profileRemovalRequests));
  }, [profileRemovalRequests]);

  const submitProfileRemovalRequest = (reqData: Omit<ProfileRemovalRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: ProfileRemovalRequest = {
      ...reqData,
      id: 'rem-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setProfileRemovalRequests((prev) => [newReq, ...prev]);

    addNotification({
      userId: 'admin',
      title: 'New Profile Removal Request',
      titleMr: 'लग्न जुळल्यामुळे / प्रोफाईल काढण्याची विनंती प्राप्त!',
      message: `${reqData.profileName} requested profile removal.`,
      messageMr: `${reqData.profileName} यांनी प्रोफाईल काढण्याची विनंती पाठवली आहे.`,
      type: 'system',
    });

    logActivity('Profile Removal Request', `${reqData.profileName} यांनी प्रोफाईल काढण्याची विनंती पाठवली.`, reqData.profileName);
  };

  const approveProfileRemovalRequest = (id: string, createSuccessStory = true) => {
    const req = profileRemovalRequests.find((r) => r.id === id);
    if (!req) return;

    setProfileRemovalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );

    // Soft delete profile
    softDeleteProfile(req.profileId);

    // Create success story if feedback provided
    if (createSuccessStory && req.feedbackText && req.reason === 'marriage_fixed') {
      const newStory: SuccessStory = {
        id: 'story-' + Date.now(),
        coupleName: `${req.profileName} ${req.partnerDetails ? '& ' + req.partnerDetails : ''}`,
        marriageDate: new Date().toLocaleDateString('mr-IN'),
        district: 'महाराष्ट्र',
        image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
        story: req.feedbackText,
        storyMr: req.feedbackText,
        status: 'approved',
        submittedByUserId: req.profileId,
        submittedByUserName: req.profileName,
        createdAt: new Date().toISOString(),
      };
      setSuccessStories((prev) => [newStory, ...prev]);
    }

    addNotification({
      userId: req.profileId,
      title: 'Profile Removal Approved',
      titleMr: 'प्रोफाईल काढण्याची विनंती मंजूर!',
      message: 'Your profile removal request has been approved.',
      messageMr: 'तुमची प्रोफाईल यशस्वीरीत्या काढण्यात आली आहे. वंजारी जोडी परिवाराकडून हार्दिक शुभेच्छा!',
      type: 'approval',
    });
  };

  const rejectProfileRemovalRequest = (id: string) => {
    setProfileRemovalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
  };

  const deleteProfileRemovalRequest = (id: string) => {
    setProfileRemovalRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const restoreRecycleItem = (id: string) => {
    const item = recycleBin.find((r) => r.id === id);
    if (!item) return;

    if (item.originalType === 'biodata') {
      setProfiles((prev) => [item.data, ...prev]);
      syncDocToFirestore('profiles', item.data.id, item.data);
    } else if (item.originalType === 'story') {
      setSuccessStories((prev) => [item.data, ...prev]);
    }

    setRecycleBin((prev) => prev.filter((r) => r.id !== id));
    logActivity('Restore Item', `${item.title} रिसायकल बिनमधून पुनर्संचयित (Restored) केले.`, 'Admin');
  };

  const permanentDeleteRecycleItem = (id: string) => {
    const item = recycleBin.find((r) => r.id === id);
    setRecycleBin((prev) => prev.filter((r) => r.id !== id));
    if (item) {
      logActivity('Permanent Delete', `${item.title} कायमस्वरूपी हटवून स्टोरेज मोकळे केले.`, 'Admin');
    }
  };

  const bulkRestoreRecycleItems = (ids: string[]) => {
    const itemsToRestore = recycleBin.filter((r) => ids.includes(r.id));
    itemsToRestore.forEach((item) => {
      if (item.originalType === 'biodata') {
        setProfiles((prev) => [item.data, ...prev]);
        syncDocToFirestore('profiles', item.data.id, item.data);
      } else if (item.originalType === 'story') {
        setSuccessStories((prev) => [item.data, ...prev]);
      }
    });
    setRecycleBin((prev) => prev.filter((r) => !ids.includes(r.id)));
    logActivity('Bulk Restore', `${itemsToRestore.length} बायोडाटा रीसायकल बिनमधून पुनर्संचयित (Restored) केले.`, 'Admin');
  };

  const bulkPermanentDeleteRecycleItems = (ids: string[]) => {
    setRecycleBin((prev) => prev.filter((r) => !ids.includes(r.id)));
    logActivity('Bulk Permanent Delete', `${ids.length} बायोडाटा सिस्टीममधून पूर्णपणे हटवले (Permanently Deleted).`, 'Admin');
  };

  const bulkPurgeRecycleBin = () => {
    setRecycleBin([]);
    logActivity('Purge Storage', `रिसायकल बिन पूर्णपणे रिकामे केले (All Storage Purged)`, 'Admin');
  };

  // Photos Trash Engine
  const [deletedPhotosTrash, setDeletedPhotosTrash] = useState<TrashedPhoto[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_trashed_photos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_trashed_photos', JSON.stringify(deletedPhotosTrash));
  }, [deletedPhotosTrash]);

  const trashPhoto = (profileId: string, photoUrl: string, photoType: 'avatar' | 'gallery' = 'gallery', profileName?: string) => {
    const candidate = profiles.find((p) => p.id === profileId);
    const name = profileName || candidate?.fullName || 'उमेदवार';
    const newTrashPhoto: TrashedPhoto = {
      id: 'trash-pic-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      profileId: profileId,
      originalProfileId: profileId,
      profileName: name,
      profileRegId: candidate?.registrationId || 'VJ-001',
      photoUrl,
      photoType,
      deletedAt: new Date().toLocaleString('mr-IN'),
      deletedBy: 'Admin',
      sizeEstimateKb: Math.floor(150 + Math.random() * 200),
    };
    setDeletedPhotosTrash((prev) => [newTrashPhoto, ...prev]);
    logActivity('Trash Photo', `${name} यांचा फोटो ट्रॅशमध्ये हलवला`, 'Admin');
  };

  const restorePhotoFromTrash = (trashId: string) => {
    const target = deletedPhotosTrash.find((tp) => tp.id === trashId);
    if (!target) return;
    const candidate = profiles.find((p) => p.id === target.originalProfileId);
    if (candidate) {
      if (target.photoType === 'avatar') {
        const updated = { ...candidate, photoUrl: target.photoUrl };
        setProfiles((prev) => prev.map((p) => (p.id === candidate.id ? updated : p)));
        syncDocToFirestore('profiles', candidate.id, updated);
      } else {
        const existingPhotos = candidate.photos || [];
        if (!existingPhotos.includes(target.photoUrl)) {
          const updated = { ...candidate, photos: [...existingPhotos, target.photoUrl] };
          setProfiles((prev) => prev.map((p) => (p.id === candidate.id ? updated : p)));
          syncDocToFirestore('profiles', candidate.id, updated);
        }
      }
    }
    setDeletedPhotosTrash((prev) => prev.filter((tp) => tp.id !== trashId));
    logActivity('Restore Photo', `${target.profileName} यांचा फोटो ट्रॅशमधून रीस्टोअर केला`, 'Admin');
  };

  const permanentlyDeletePhotoFromTrash = (trashId: string) => {
    const target = deletedPhotosTrash.find((tp) => tp.id === trashId);
    setDeletedPhotosTrash((prev) => prev.filter((tp) => tp.id !== trashId));
    if (target) {
      logActivity('Permanently Delete Photo', `${target.profileName} यांचा फोटो कायमचा डिलीट करून सर्व्हर जागा मोकळी केली.`, 'Admin');
    }
  };

  const purgeAllPhotosTrash = () => {
    const count = deletedPhotosTrash.length;
    setDeletedPhotosTrash([]);
    logActivity('Purge Photos Trash', `${count} फोटो कायमचे नष्ट करून फोटो स्टोरेज मोकळे केले.`, 'Admin');
  };

  // 18. Real-time Activity Audit Log System
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_audit_logs');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'log-1',
            action: 'System Boot',
            details: 'वंजारी जोडी प्रणाली सुरू झाली.',
            user: 'System',
            timestamp: new Date().toLocaleString(),
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logActivity = (action: string, details: string, user?: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      action,
      details,
      user: user || currentUser?.fullName || 'अभ्यागत',
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Registration step state ('selector' | 'manual' | 'ocr_photo')
  const [registrationStep, setRegistrationStep] = useState<'selector' | 'manual' | 'ocr_photo'>('selector');

  // Sub-Admin Management state
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_sub_admins');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [currentSubAdmin, setCurrentSubAdmin] = useState<SubAdmin | null>(null);

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_sub_admins', JSON.stringify(subAdmins));
  }, [subAdmins]);

  const addSubAdmin = (subAdminData: Omit<SubAdmin, 'id' | 'createdAt'>) => {
    const newSub: SubAdmin = {
      ...subAdminData,
      id: 'subadmin-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setSubAdmins((prev) => [newSub, ...prev]);
    logActivity('Add Sub-Admin', `नवीन सब-ॲडमिन जोडला: ${newSub.name} (${newSub.username})`, 'Primary Admin');
  };

  const updateSubAdmin = (updated: SubAdmin) => {
    setSubAdmins((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    logActivity('Update Sub-Admin', `सब-ॲडमिन अपडेट केला: ${updated.name}`, 'Primary Admin');
  };

  const deleteSubAdmin = (id: string) => {
    const sub = subAdmins.find((s) => s.id === id);
    setSubAdmins((prev) => prev.filter((s) => s.id !== id));
    logActivity('Delete Sub-Admin', `सब-ॲडमिन हटवला: ${sub?.name || id}`, 'Primary Admin');
  };

  // Promo Codes & Discounts Engine State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_promos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_promos', JSON.stringify(promoCodes));
  }, [promoCodes]);

  const addPromoCode = (promoData: Omit<PromoCode, 'id' | 'createdAt' | 'usedCount'>) => {
    const newPromo: PromoCode = {
      ...promoData,
      id: 'promo-' + Date.now(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
      code: promoData.code.toUpperCase().trim(),
    };
    setPromoCodes((prev) => [newPromo, ...prev]);
    logActivity('Create Promo Code', `नवीन कूपन कोड तयार केला: ${newPromo.code}`, 'Admin');
  };

  const deletePromoCode = (id: string) => {
    const p = promoCodes.find((x) => x.id === id);
    setPromoCodes((prev) => prev.filter((x) => x.id !== id));
    logActivity('Delete Promo Code', `कूपन कोड हटवला: ${p?.code || id}`, 'Admin');
  };

  const togglePromoCodeStatus = (id: string) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const validatePromoCode = (codeStr: string, originalAmount: number) => {
    const clean = codeStr.toUpperCase().trim();
    const found = promoCodes.find((p) => p.code === clean);

    if (!found) {
      return { valid: false, discountAmount: 0, finalAmount: originalAmount, isVipFree: false, message: 'अवैध कूपन कोड! (Invalid promo code)' };
    }
    if (!found.isActive) {
      return { valid: false, discountAmount: 0, finalAmount: originalAmount, isVipFree: false, message: 'हा कूपन कोड निष्क्रिय (Expired/Inactive) आहे.' };
    }
    if (found.maxUses && found.usedCount >= found.maxUses) {
      return { valid: false, discountAmount: 0, finalAmount: originalAmount, isVipFree: false, message: 'या कूपन कोडची वापर मर्यादा संपली आहे.' };
    }

    if (found.discountType === 'vip_free') {
      return {
        valid: true,
        discountAmount: originalAmount,
        finalAmount: 0,
        isVipFree: true,
        promo: found,
        message: '🎉 VIP मोफत कूपन लागू झाले! ₹० भरून प्रीमियम प्रवेश मिळवा.',
      };
    } else if (found.discountType === 'percentage') {
      const discount = Math.round((originalAmount * found.discountValue) / 100);
      const finalAmt = Math.max(0, originalAmount - discount);
      return {
        valid: true,
        discountAmount: discount,
        finalAmount: finalAmt,
        isVipFree: false,
        promo: found,
        message: `🎉 ${found.discountValue}% सवलत लागू झाली! ₹${discount} बचत.`,
      };
    } else {
      // flat discount
      const discount = Math.min(originalAmount, found.discountValue);
      const finalAmt = Math.max(0, originalAmount - discount);
      return {
        valid: true,
        discountAmount: discount,
        finalAmount: finalAmt,
        isVipFree: false,
        promo: found,
        message: `🎉 ₹${discount} ची सवलत यशस्वी लागू झाली!`,
      };
    }
  };

  // Pending Member Profile Edits State
  const [pendingProfileEdits, setPendingProfileEdits] = useState<PendingProfileEdit[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_pending_edits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_pending_edits', JSON.stringify(pendingProfileEdits));
  }, [pendingProfileEdits]);

  const submitProfileEditRequest = (profileId: string, updatedFields: Partial<UserProfile>) => {
    const prof = profiles.find((p) => p.id === profileId);
    if (!prof) return;

    const newReq: PendingProfileEdit = {
      id: 'edit-' + Date.now(),
      profileId,
      profileName: prof.fullName,
      mobile: prof.mobileNumber,
      originalData: prof,
      updatedData: updatedFields,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    setPendingProfileEdits((prev) => [newReq, ...prev]);
    logActivity('Profile Edit Request', `सदस्याने प्रोफाइल अपडेट विनंती पाठवली: ${prof.fullName}`, prof.fullName);
    addBroadcastNotification('नवीन प्रोफाइल दुरुस्ती पुनरावलोकन विनंती प्राप्त झाली आहे.', 'Pending Profile Edit');
  };

  const approveProfileEditRequest = (editId: string) => {
    const req = pendingProfileEdits.find((e) => e.id === editId);
    if (!req) return;

    // Apply updated fields to profile
    setProfiles((prev) =>
      prev.map((p) => (p.id === req.profileId ? { ...p, ...req.updatedData } : p))
    );

    setPendingProfileEdits((prev) =>
      prev.map((e) => (e.id === editId ? { ...e, status: 'approved' } : e))
    );

    logActivity('Approve Profile Edit', `ॲडमिनने प्रोफाइल दुरुस्ती मंजूर केली: ${req.profileName}`, 'Admin');
    addNotification({
      userId: req.profileId,
      title: 'प्रोफाईल माहिती बदल मंजूर!',
      titleMr: 'प्रोफाईल माहिती बदल मंजूर!',
      message: 'तुमच्या प्रोफाइल मधील दुरुस्त्या ॲडमिन कडून मंजूर करण्यात आल्या आहेत.',
      messageMr: 'तुमच्या प्रोफाइल मधील दुरुस्त्या ॲडमिन कडून मंजूर करण्यात आल्या आहेत.',
      type: 'system',
    });
  };

  const rejectProfileEditRequest = (editId: string) => {
    const req = pendingProfileEdits.find((e) => e.id === editId);
    if (!req) return;

    setPendingProfileEdits((prev) =>
      prev.map((e) => (e.id === editId ? { ...e, status: 'rejected' } : e))
    );

    logActivity('Reject Profile Edit', `ॲडमिनने प्रोफाइल दुरुस्ती अमान्य केली: ${req.profileName}`, 'Admin');
  };

  // Face Verification State & Modal
  const [isFaceAuthModalOpen, setIsFaceAuthModalOpen] = useState(false);
  const [isUserSecurityOpen, setIsUserSecurityOpen] = useState(false);
  const [isAdminSecurityOpen, setIsAdminSecurityOpen] = useState(false);
  const [faceVerificationLogs, setFaceVerificationLogs] = useState<FaceVerificationLog[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_face_verifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_face_verifications', JSON.stringify(faceVerificationLogs));
  }, [faceVerificationLogs]);

  const submitFaceVerification = (logData: Omit<FaceVerificationLog, 'id' | 'submittedAt'>) => {
    const isApprovedStatus = logData.status === 'approved';
    const newLog: FaceVerificationLog = {
      ...logData,
      id: `fv-${Date.now()}`,
      status: logData.status || 'pending',
      submittedAt: new Date().toISOString(),
    };
    setFaceVerificationLogs(prev => [newLog, ...prev]);

    // Update profile ONLY if status is explicitly approved (e.g. by Admin)
    if (isApprovedStatus) {
      setProfiles(prev =>
        prev.map(p => {
          if (p.id === logData.userId) {
            const updated = {
              ...p,
              isFaceVerified: true,
              isVerified: true,
              faceVerifiedAt: new Date().toISOString()
            };
            syncDocToFirestore('profiles', updated.id, updated);
            return updated;
          }
          return p;
        })
      );

      if (currentUser && currentUser.id === logData.userId) {
        setCurrentUser(prev =>
          prev
            ? {
                ...prev,
                isFaceVerified: true,
                isVerified: true,
                faceVerifiedAt: new Date().toISOString()
              }
            : null
        );
      }
    }

    logActivity('face_verification_submitted', `चेहरा पडताळणी प्रस्ताव सादर करण्यात आला (${logData.userName})`);
  };

  const approveFaceVerification = (logId: string) => {
    const log = faceVerificationLogs.find(l => l.id === logId);
    if (!log) return;

    setFaceVerificationLogs(prev =>
      prev.map(l => (l.id === logId ? { ...l, status: 'approved', reviewedAt: new Date().toISOString() } : l))
    );

    setProfiles(prev =>
      prev.map(p => {
        if (p.id === log.userId) {
          const updated = { ...p, isFaceVerified: true, isVerified: true };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );

    if (currentUser && currentUser.id === log.userId) {
      setCurrentUser(prev => (prev ? { ...prev, isFaceVerified: true, isVerified: true } : null));
    }

    logActivity('face_verification_approved', `चेहरा पडताळणी मंजूर केली: ${log.userName}`);
  };

  const rejectFaceVerification = (logId: string) => {
    setFaceVerificationLogs(prev =>
      prev.map(l => (l.id === logId ? { ...l, status: 'rejected', reviewedAt: new Date().toISOString() } : l))
    );
    logActivity('face_verification_rejected', `चेहरा पडताळणी नाकारली ID: ${logId}`);
  };

  // APK Uploader Settings
  const updateApkSettings = (partial: Partial<ApkSettings>) => {
    setSiteConfig(prev => ({
      ...prev,
      apkSettings: {
        ...(prev.apkSettings || INITIAL_SITE_CONFIG.apkSettings),
        ...partial
      }
    }));
    logActivity('apk_settings_updated', 'APK ॲप अपलोड/डाउनलोड सेटिंग्ज अद्ययावत केले');
  };

  const incrementApkDownloadCount = () => {
    setSiteConfig(prev => {
      const current = prev.apkSettings || INITIAL_SITE_CONFIG.apkSettings;
      return {
        ...prev,
        apkSettings: {
          ...current,
          downloadCount: (current.downloadCount || 0) + 1
        }
      };
    });
  };

  // Social Links
  const updateSocialLinks = (links: SocialLinkItem[]) => {
    setSiteConfig(prev => ({
      ...prev,
      socialLinks: links
    }));
    logActivity('social_links_updated', 'सोशल मीडिया नियंत्रणे अद्ययावत केले');
  };

  const addSocialLink = (linkData: Omit<SocialLinkItem, 'id'>) => {
    const newLink: SocialLinkItem = {
      ...linkData,
      id: `soc-${Date.now()}`
    };
    setSiteConfig(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), newLink]
    }));
    logActivity('social_link_added', `नवीन सोशल मीडिया लिंक जोडली: ${linkData.name}`);
  };

  const deleteSocialLink = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter(s => s.id !== id)
    }));
    logActivity('social_link_deleted', `सोशल मीडिया लिंक हटवली: ${id}`);
  };

  // Master Admin Credentials
  const updateAdminCredentials = (credentials: { name: string; username: string; password: string }) => {
    setSiteConfig(prev => ({
      ...prev,
      adminCredentials: credentials
    }));
    logActivity('admin_credentials_updated', 'मुख्य मास्टर ॲडमिन क्रेडेंशियल्स अद्ययावत केले');
  };

  const loginAsGuest = (mobile?: string, name?: string, location?: string) => {
    const formattedMobile = mobile ? (mobile.startsWith('+91') ? mobile : `+91 ${mobile}`) : '+91 99000 00000';
    const guestUser: UserProfile = {
      id: 'guest-' + Date.now(),
      fullName: name ? `${name} (Guest)` : `पाहुणे सदस्य (${formattedMobile})`,
      gender: 'groom',
      dob: '2000-01-01',
      age: 25,
      mobile: formattedMobile,
      email: 'guest@vanjarijodi.org',
      district: location || 'बीड (Beed)',
      taluka: 'परळी',
      city: 'परळी',
      education: 'गेस्ट व्ह्यू (Guest Access)',
      occupation: 'पाहुणे',
      income: 'माहिती उपलब्ध नाही',
      height: "5'7\"",
      weight: '65',
      bloodGroup: 'B+',
      maritalStatus: 'never_married',
      religion: 'हिंदू (Hindu)',
      subCaste: 'वंजारी',
      fatherOccupation: 'शेतकरी',
      motherOccupation: 'गृहिणी',
      brothers: 0,
      sisters: 0,
      familyType: 'कुटुंब',
      expectations: 'गेस्ट लॉगिन',
      photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'],
      aadhaarVerified: false,
      isVerified: false,
      isFeatured: false,
      isApproved: true,
      membership: 'free',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'सध्या ऑनलाईन (गेस्ट)',
      privacy: { hideContact: true, hidePhoto: false },
      registrationType: 'manual'
    };
    setCurrentUser(guestUser);

    // Track initial Guest Session in Guest Analytics
    const newGuestSession: GuestSessionLog = {
      sessionId: guestUser.id,
      guestName: guestUser.fullName,
      guestMobile: formattedMobile,
      location: location || 'महाराष्ट्र',
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile App / Mobile Web' : 'Desktop Browser',
      ipAddress: '157.33.120.44 (MH)',
      firstVisitTime: new Date().toISOString(),
      lastActiveTime: new Date().toISOString(),
      status: 'active',
      pagesViewed: ['मुख्यपृष्ठ'],
      actionsTaken: ['गेस्ट लॉगिन (मोबाइल: ' + formattedMobile + ')']
    };
    setGuestSessions(prev => [newGuestSession, ...prev]);

    logActivity('Guest Login', `गेस्ट वापरकर्त्याने प्रवेश केला (मोबाईल: ${formattedMobile})`, guestUser.fullName);
  };

  // Google Single Sign-On / One-Click Login
  const loginWithGoogle = async (): Promise<{
    success: boolean;
    isNewUser: boolean;
    user?: UserProfile;
    message?: string;
  }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      let googleUser: {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
      };

      try {
        const result = await signInWithPopup(auth, provider);
        googleUser = result.user;
      } catch (popupError: any) {
        console.warn('Firebase popup sign-in fallback triggered:', popupError);
        // Fallback for iframe/sandbox popup restrictions:
        const emailPrompt = prompt(
          language === 'mr'
            ? 'गुगल लॉगिनसाठी तुमचा Gmail / ई-मेल पत्ता प्रविष्ट करा:'
            : 'Enter your Google (Gmail) address to continue:'
        );
        if (!emailPrompt || !emailPrompt.includes('@')) {
          return { success: false, isNewUser: false, message: 'Google login cancelled' };
        }
        const nameGuess = emailPrompt.split('@')[0].replace(/[._0-9]/g, ' ').trim();
        googleUser = {
          uid: 'g-' + Date.now(),
          email: emailPrompt.trim().toLowerCase(),
          displayName: nameGuess ? nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1) : 'गुगल सदस्य',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'
        };
      }

      if (!googleUser.email) {
        return { success: false, isNewUser: false, message: 'No email found with this Google account' };
      }

      const cleanEmail = googleUser.email.trim().toLowerCase();

      // Check if existing profile with this email exists
      const existing = profiles.find(
        (p) => p.email && p.email.trim().toLowerCase() === cleanEmail
      );

      if (existing) {
        if (existing.isBlocked) {
          alert(language === 'mr' ? '🚫 तुमचे अकाऊंट ॲडमिनद्वारे ब्लॉक करण्यात आले आहे.' : 'Your account is blocked by admin.');
          return { success: false, isNewUser: false, user: existing, message: 'Account blocked' };
        }
        setCurrentUser(existing);
        logActivity('Google Login', `गुगल द्वारे लॉगिन केले: ${existing.fullName} (${cleanEmail})`, existing.fullName);
        return { success: true, isNewUser: false, user: existing };
      }

      // New User creation with Google Account
      const newUserId = `vj-g-${Date.now().toString().slice(-6)}`;
      const newProfile: UserProfile = {
        id: newUserId,
        fullName: googleUser.displayName || 'वंजारी सदस्य',
        gender: 'groom',
        dob: '1999-01-01',
        age: 26,
        mobile: '',
        email: cleanEmail,
        district: 'बीड (Beed)',
        taluka: 'परळी',
        city: 'परळी',
        education: 'माहिती भरा',
        occupation: 'माहिती भरा',
        income: 'माहिती भरा',
        height: "5'7\"",
        weight: '65',
        bloodGroup: 'B+',
        maritalStatus: 'never_married',
        religion: 'हिंदू (Hindu)',
        subCaste: 'वंजारी',
        fatherOccupation: 'शेतकरी',
        motherOccupation: 'गृहिणी',
        brothers: 0,
        sisters: 0,
        familyType: 'कुटुंब',
        expectations: 'सुशिक्षित व संस्कारी जोडीदार',
        photos: googleUser.photoURL ? [googleUser.photoURL] : ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'],
        aadhaarVerified: false,
        isVerified: true, // Google verified
        isFeatured: false,
        isApproved: true,
        membership: 'free',
        authProvider: 'google',
        isGoogleUser: true,
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: 'सध्या ऑनलाईन',
        privacy: { hideContact: false, hidePhoto: false },
        completionPercentage: 45,
        registrationType: 'manual',
        bio: 'गुगल खात्याशी लिंक केलेले वंजारी जोडी प्रोफाइल'
      };

      setProfiles((prev) => [newProfile, ...prev]);
      syncDocToFirestore('profiles', newProfile.id, newProfile);
      setCurrentUser(newProfile);

      logActivity('Google Registration', `गुगल द्वारे नवीन नोंदणी झाली: ${newProfile.fullName} (${cleanEmail})`, newProfile.fullName);
      addNotification({
        userId: 'admin',
        title: 'New Google User Signed In',
        titleMr: 'गुगल द्वारे नवीन सदस्य नोंदणी!',
        message: `${newProfile.fullName} (${cleanEmail}) registered via Google.`,
        messageMr: `${newProfile.fullName} (${cleanEmail}) यांनी गुगल द्वारे थेट खात्यात प्रवेश केला आहे.`,
        type: 'system'
      });

      return { success: true, isNewUser: true, user: newProfile };
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      return { success: false, isNewUser: false, message: err.message || 'Google sign-in error' };
    }
  };

  // Email Login with OTP or Password
  const loginWithEmail = async (emailInput: string, passwordOrOtp?: string): Promise<{
    success: boolean;
    isNewUser: boolean;
    user?: UserProfile;
    message?: string;
  }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, isNewUser: false, message: 'Invalid email address' };
    }

    const existing = profiles.find((p) => p.email && p.email.trim().toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.isBlocked) {
        return { success: false, isNewUser: false, user: existing, message: 'Account blocked' };
      }
      setCurrentUser(existing);
      logActivity('Email Login', `ई-मेल द्वारे लॉगिन: ${existing.fullName} (${cleanEmail})`, existing.fullName);
      return { success: true, isNewUser: false, user: existing };
    }

    // New User creation via Email
    const newUserId = `vj-e-${Date.now().toString().slice(-6)}`;
    const namePart = cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
    const formattedName = namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : 'वंजारी सदस्य';

    const newProfile: UserProfile = {
      id: newUserId,
      fullName: formattedName,
      gender: 'groom',
      dob: '1999-01-01',
      age: 26,
      mobile: '',
      email: cleanEmail,
      district: 'बीड (Beed)',
      taluka: 'परळी',
      city: 'परळी',
      education: 'माहिती भरा',
      occupation: 'माहिती भरा',
      income: 'माहिती भरा',
      height: "5'7\"",
      weight: '65',
      bloodGroup: 'B+',
      maritalStatus: 'never_married',
      religion: 'हिंदू (Hindu)',
      subCaste: 'वंजारी',
      fatherOccupation: 'शेतकरी',
      motherOccupation: 'गृहिणी',
      brothers: 0,
      sisters: 0,
      familyType: 'कुटुंब',
      expectations: 'सुसंस्कृत वंजारी जोडीदार',
      photos: ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'],
      aadhaarVerified: false,
      isVerified: true,
      isFeatured: false,
      isApproved: true,
      membership: 'free',
      authProvider: 'email',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'सध्या ऑनलाईन',
      privacy: { hideContact: false, hidePhoto: false },
      completionPercentage: 40,
      registrationType: 'manual',
      bio: 'ई-मेल खात्याशी लिंक केलेले वंजारी जोडी प्रोफाइल'
    };

    setProfiles((prev) => [newProfile, ...prev]);
    syncDocToFirestore('profiles', newProfile.id, newProfile);
    setCurrentUser(newProfile);

    logActivity('Email Registration', `ई-मेल द्वारे नवीन नोंदणी: ${newProfile.fullName} (${cleanEmail})`, newProfile.fullName);
    return { success: true, isNewUser: true, user: newProfile };
  };

  const updateFeatureBoxes = (boxes: any[]) => {
    setSiteConfig(prev => ({ ...prev, featureBoxes: boxes }));
    logActivity('Index Features Updated', 'इंडेक्स ४ मुख्य कप्पे माहिती व आयकॉन सुधारले');
  };

  // 1. Pay-Per-Contact Requests State
  const [payPerContactRequests, setPayPerContactRequests] = useState<PayPerContactRequest[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_pay_per_contact_reqs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'ppc-101',
        userId: 'vj-102',
        userName: 'अविनाश गोपीनाथ फड',
        userMobile: '+91 97632 11098',
        targetProfileId: 'vj-101',
        targetProfileName: 'प्रियंका ज्ञानदेव फड (नाशिक)',
        targetProfileMobile: '+91 98221 55443',
        amount: 50,
        utrNumber: '928374610293',
        screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_pay_per_contact_reqs', JSON.stringify(payPerContactRequests));
  }, [payPerContactRequests]);

  const [selectedProfileForUnlock, setSelectedProfileForUnlock] = useState<UserProfile | null>(null);
  const [isContactUnlockModalOpen, setIsContactUnlockModalOpen] = useState(false);

  const addPayPerContactRequest = (reqData: Omit<PayPerContactRequest, 'id' | 'createdAt' | 'status'>) => {
    const cleanUtr = (reqData.utrNumber || '').trim().replace(/[^0-9a-zA-Z]/g, '');

    // Check duplicate UTR across plan requests, contact unlocks, and profiles
    const isDuplicateUtr = cleanUtr
      ? payPerContactRequests.some(r => r.utrNumber === cleanUtr) ||
        paymentRequests.some(r => r.utrNumber === cleanUtr) ||
        profiles.some(p => p.paymentUtr === cleanUtr)
      : false;

    const isDuplicateScreenshot =
      reqData.screenshotUrl && reqData.screenshotUrl.trim() !== ''
        ? payPerContactRequests.some(r => r.screenshotUrl === reqData.screenshotUrl && r.userId !== reqData.userId) ||
          paymentRequests.some(r => r.screenshotUrl === reqData.screenshotUrl && r.userId !== reqData.userId)
        : false;

    const newReq: PayPerContactRequest = {
      ...reqData,
      utrNumber: cleanUtr,
      id: `ppc-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      isDuplicateUtr,
      isDuplicateScreenshot,
    };
    setPayPerContactRequests(prev => [newReq, ...prev]);
    logActivity('Pay-Per-Contact Request', `युझरने संपर्क अनलॉक UTR सादर केला: ${reqData.targetProfileName} (UTR: ${cleanUtr})`, reqData.userName);
    addBroadcastNotification(
      isDuplicateUtr
        ? `⚠️ नवीन संपर्क अनलॉक विनंती प्राप्त (UTR: ${cleanUtr} - डुप्लिकेट इशारा)`
        : `नवीन संपर्क अनलॉक विनंती प्राप्त झाली (UTR: ${cleanUtr})`,
      'Pay-Per-Contact Request'
    );
  };

  const deletePayPerContactRequest = (id: string) => {
    setPayPerContactRequests(prev => prev.filter(r => r.id !== id));
  };

  const approvePayPerContactRequest = (id: string) => {
    const req = payPerContactRequests.find(r => r.id === id);
    if (!req) return;

    setPayPerContactRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'approved' } : r))
    );

    // Unlock target profile ID for user
    unlockContact(req.targetProfileId);

    logActivity('Approve Pay-Per-Contact', `संपर्क अनलॉक मंजूर केले: ${req.targetProfileName} (युझर: ${req.userName})`, 'Admin');
    addNotification({
      userId: req.userId,
      title: 'संपर्क अनलॉक मंजूर!',
      titleMr: 'संपर्क अनलॉक मंजूर!',
      message: `${req.targetProfileName} यांचा संपर्क क्रमांक यशस्वीरित्या अनलॉक झाला आहे.`,
      messageMr: `${req.targetProfileName} यांचा संपर्क क्रमांक यशस्वीरित्या अनलॉक झाला आहे.`,
      type: 'approval'
    });
  };

  const rejectPayPerContactRequest = (id: string) => {
    const req = payPerContactRequests.find(r => r.id === id);
    if (!req) return;

    setPayPerContactRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'rejected' } : r))
    );

    logActivity('Reject Pay-Per-Contact', `संपर्क अनलॉक अमान्य केले: ${req.targetProfileName} (युझर: ${req.userName})`, 'Admin');
  };

  // 2. Granular Guest Access Control & Modal
  const [isGuestRestrictionModalOpen, setIsGuestRestrictionModalOpen] = useState(false);
  const [restrictedFeatureName, setRestrictedFeatureName] = useState('ही सुविधा');

  const checkGuestPermission = (featureKey: keyof GuestPermissions, featureLabelMr: string): boolean => {
    const isGuest = !currentUser || currentUser.id.startsWith('guest');
    const perms = siteConfig.guestPermissions || {
      viewProfiles: true,
      searchFilters: true,
      kundaliView: false,
      expressInterest: false,
      viewPhotos: true,
      directChat: false
    };

    if (isGuest && perms[featureKey] === false) {
      setRestrictedFeatureName(featureLabelMr);
      setIsGuestRestrictionModalOpen(true);
      return false;
    }
    return true;
  };

  // 3. Smart Guest Nudge State
  const [isGuestNudgeOpen, setIsGuestNudgeOpen] = useState(false);

  // 4. Live User Activity & Guest Analytics
  const [userActivityLogs, setUserActivityLogs] = useState<UserActivityLog[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_user_activities');
    return saved ? JSON.parse(saved).filter((a: any) => !a.userId?.startsWith('vj-1')) : [];
  });

  const [guestSessions, setGuestSessions] = useState<GuestSessionLog[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_guest_sessions');
    return saved ? JSON.parse(saved).filter((g: any) => !g.sessionId?.includes('101')) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_user_activities', JSON.stringify(userActivityLogs));
  }, [userActivityLogs]);

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_guest_sessions', JSON.stringify(guestSessions));
  }, [guestSessions]);

  const trackUserAction = (action: string, details: string) => {
    const isGuest = !currentUser || currentUser.id.startsWith('guest');
    const uName = currentUser ? currentUser.fullName : 'अतिथी युझर (Guest)';
    const uId = currentUser ? currentUser.id : 'guest-' + Math.floor(1000 + Math.random() * 9000);
    const uMobile = currentUser ? currentUser.mobile : '+91 99000 00000';

    const newLog: UserActivityLog = {
      id: 'act-' + Date.now(),
      userId: uId,
      userName: uName,
      userMobile: uMobile,
      userType: isGuest ? 'guest' : 'registered',
      action,
      details,
      timestamp: new Date().toISOString()
    };

    setUserActivityLogs(prev => [newLog, ...prev.slice(0, 99)]);

    if (isGuest) {
      setGuestSessions(prev => {
        const existingIdx = prev.findIndex(s => s.sessionId === uId);
        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          const updated: GuestSessionLog = {
            ...existing,
            lastActiveTime: new Date().toISOString(),
            status: 'active',
            actionsTaken: [...existing.actionsTaken, action].slice(-10)
          };
          const copy = [...prev];
          copy[existingIdx] = updated;
          return copy;
        } else {
          return [
            {
              sessionId: uId,
              guestName: uName,
              guestMobile: uMobile,
              location: 'महाराष्ट्र',
              deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
              ipAddress: '203.0.113.45 (MH)',
              firstVisitTime: new Date().toISOString(),
              lastActiveTime: new Date().toISOString(),
              status: 'active',
              pagesViewed: ['मुख्यपृष्ठ'],
              actionsTaken: [action]
            },
            ...prev
          ];
        }
      });
    }
  };

  // 5. Admin Support Chat Archive Action
  const archiveAdminSupportChat = (targetSenderId: string) => {
    setAdminSupportMessages(prev =>
      prev.map(m => (m.senderId === targetSenderId ? { ...m, isArchived: true } : m))
    );
    logActivity('Archive Support Chat', `ॲडमिनने सपोर्ट चॅट अर्काइव्ह केली: ${targetSenderId}`, 'Admin');
  };

  const deleteAdminSupportMessage = (messageId: string, deleteOnlyImage: boolean = false) => {
    setAdminSupportMessages((prev) => {
      if (deleteOnlyImage) {
        return prev.map((m) => {
          if (m.id === messageId) {
            const updated = { ...m, fileUrl: undefined, fileName: undefined };
            syncDocToFirestore('adminSupportMessages', m.id, updated);
            return updated;
          }
          return m;
        });
      } else {
        deleteDocFromFirestore('adminSupportMessages', messageId);
        return prev.filter((m) => m.id !== messageId);
      }
    });
    logActivity('Delete Support Message', `ॲडमिनने संदेश ${deleteOnlyImage ? 'फोटो' : 'पूर्ण'} हटवला (ID: ${messageId})`, 'Admin');
  };

  const bulkDeleteAdminSupportMessages = (messageIds: string[]) => {
    messageIds.forEach((id) => {
      deleteDocFromFirestore('adminSupportMessages', id);
    });
    setAdminSupportMessages((prev) => prev.filter((m) => !messageIds.includes(m.id)));
    logActivity('Bulk Delete Support Messages', `ॲडमिनने ${messageIds.length} सपोर्ट मेसेज हटवले`, 'Admin');
  };

  const toggleProfileVisibility = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, isHiddenByAdmin: !p.isHiddenByAdmin };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    const target = profiles.find((p) => p.id === profileId);
    const newHiddenState = !target?.isHiddenByAdmin;
    logActivity(
      'Toggle Profile Visibility',
      `ॲडमिनने ${target?.fullName || profileId} बायोडाटाची दृश्यमानता ${newHiddenState ? 'बंद (लपवा)' : 'चालू (दाखवा)'} केली.`,
      'Admin'
    );
  };

  const toggleBlockMemberAccess = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, isBlocked: !p.isBlocked };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    const target = profiles.find((p) => p.id === profileId);
    const newBlockedState = !target?.isBlocked;
    if (newBlockedState && currentUser?.id === profileId) {
      setCurrentUser(null);
    }
    logActivity(
      'Block Member Access',
      `ॲडमिनने ${target?.fullName || profileId} सदस्याचा अक्सेस ${newBlockedState ? 'पूर्णपणे ब्लॉक (Blocked)' : 'अन-ब्लॉक (Unblocked)'} केला.`,
      'Admin'
    );
  };

  const toggleCustomAccess = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, isCustomAccessGranted: !p.isCustomAccessGranted };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    const target = profiles.find((p) => p.id === profileId);
    const newAccessState = !target?.isCustomAccessGranted;
    logActivity(
      'Custom Access Grant',
      `ॲडमिनने ${target?.fullName || profileId} सदस्याला विशेष व्ही.आय.पी अक्सेस ${newAccessState ? 'मंजूर केला' : 'काढून घेतला'}.`,
      'Admin'
    );
    if (newAccessState) {
      addNotification({
        userId: profileId,
        title: 'Special VIP Access Granted',
        titleMr: 'ॲडमिन कडून विशेष मोफत अक्सेस मंजूर (Special VIP Access)!',
        message: 'Admin has granted you custom VIP access to view all profiles and contacts.',
        messageMr: 'ॲडमिन टीमने तुम्हाला सर्व बायोडाटा आणि संपर्क मोफत पाहण्याचा विशेष व्हीआयपी अक्सेस दिला आहे.',
        type: 'approval',
      });
    }
  };

  const adminSuggestMatch = (targetUserId: string, suggestedProfileId: string, note?: string) => {
    const targetUser = profiles.find((p) => p.id === targetUserId);
    const suggestedUser = profiles.find((p) => p.id === suggestedProfileId);
    if (!targetUser || !suggestedUser) return;

    addNotification({
      userId: targetUserId,
      title: 'Recommended Match by Admin',
      titleMr: 'ॲडमिन कडून स्थळ सुचवले आहे (Suggested Match)!',
      message: `Admin recommended profile ${suggestedUser.fullName} (${suggestedUser.id}) for you. ${note || ''}`,
      messageMr: `ॲडमिन टीमने तुमच्यासाठी खास ${suggestedUser.fullName} (${suggestedUser.district}) यांचा बायोडाटा सुचवला आहे. ${note || ''}`,
      type: 'system',
    });

    logActivity(
      'Suggest Match',
      `ॲडमिनने ${targetUser.fullName} (${targetUser.id}) यांना ${suggestedUser.fullName} (${suggestedUser.id}) चा बायोडाटा सुचवला.`,
      'Admin'
    );
  };

  // Photo & Profile Direct Operations
  const setPrimaryPhoto = (profileId: string, photoIndex: number) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId && p.photos && p.photos.length > photoIndex) {
          const newPhotos = [...p.photos];
          const [selected] = newPhotos.splice(photoIndex, 1);
          newPhotos.unshift(selected);
          const updated = { ...p, photos: newPhotos, pendingPhotoApproval: !isAdminLoggedIn };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    if (currentUser?.id === profileId) {
      setCurrentUser((prev) => {
        if (!prev || !prev.photos || prev.photos.length <= photoIndex) return prev;
        const newPhotos = [...prev.photos];
        const [selected] = newPhotos.splice(photoIndex, 1);
        newPhotos.unshift(selected);
        return { ...prev, photos: newPhotos, pendingPhotoApproval: !isAdminLoggedIn };
      });
    }
  };

  const deleteMemberPhoto = (profileId: string, photoIndex: number) => {
    const target = profiles.find((p) => p.id === profileId) || (currentUser?.id === profileId ? currentUser : null);
    if (target && target.photos && target.photos[photoIndex]) {
      const removedUrl = target.photos[photoIndex];
      trashPhoto(profileId, removedUrl, photoIndex === 0 ? 'avatar' : 'gallery', target.fullName);
    }

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId && p.photos && p.photos.length > photoIndex) {
          const newPhotos = p.photos.filter((_, idx) => idx !== photoIndex);
          const updated = {
            ...p,
            photos: newPhotos,
            photoUrl: newPhotos.length > 0 ? newPhotos[0] : (p.photos[photoIndex] === p.photoUrl ? '' : p.photoUrl)
          };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    if (currentUser?.id === profileId) {
      setCurrentUser((prev) => {
        if (!prev || !prev.photos) return prev;
        const newPhotos = prev.photos.filter((_, idx) => idx !== photoIndex);
        return {
          ...prev,
          photos: newPhotos,
          photoUrl: newPhotos.length > 0 ? newPhotos[0] : (prev.photos[photoIndex] === prev.photoUrl ? '' : prev.photoUrl)
        };
      });
    }
  };

  const addMemberPhoto = (profileId: string, newPhotoUrl: string): { success: boolean; message: string } => {
    const target = profiles.find((p) => p.id === profileId) || (currentUser?.id === profileId ? currentUser : null);
    if (!target) return { success: false, message: 'प्रोफाईल सापडली नाही.' };

    if (target.photos && target.photos.length >= 5) {
      return {
        success: false,
        message: 'तुमचे ५ फोटो आधीच जोडलेले आहेत. नवीन फोटो अपलोड किंवा बदलण्यासाठी आधी असलेला फोटो डिलीट करा, ज्यामुळे क्लाउड जागा वाया जाणार नाही.'
      };
    }

    const updatedPhotos = [...(target.photos || []), newPhotoUrl];
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, photos: updatedPhotos, pendingPhotoApproval: !isAdminLoggedIn };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    if (currentUser?.id === profileId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, photos: updatedPhotos, pendingPhotoApproval: !isAdminLoggedIn } : prev
      );
    }

    if (!isAdminLoggedIn) {
      addNotification({
        userId: 'admin',
        title: 'New Photo Approval Request',
        titleMr: 'फोटो अपडेट मंजुरी विनंती!',
        message: `${target.fullName} updated photos. Review required.`,
        messageMr: `${target.fullName} यांनी नवीन फोटो अपडेट केले आहेत. कृपया मंजुरी द्या.`,
        type: 'system',
      });
    }

    return { success: true, message: 'फोटो यशस्वी जोडला गेला!' };
  };

  const approvePhotoChanges = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, pendingPhotoApproval: false };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    addNotification({
      userId: profileId,
      title: 'Photos Approved',
      titleMr: 'तुमचे नवीन फोटो मंजूर झाले आहेत!',
      message: 'Admin approved your uploaded photos.',
      messageMr: 'ॲडमिनने तुमचे नवीन अपडेट केलेले फोटो मंजूर केले आहेत.',
      type: 'approval',
    });
  };

  const uploadAadhaarCard = (profileId: string, aadhaarUrl: string) => {
    updateProfileDirect(profileId, {
      aadhaarCardUrl: aadhaarUrl,
      idProofUrl: aadhaarUrl,
      aadhaarVerified: true,
      isIdVerified: true
    });
  };

  const updateProfileDirect = (profileId: string, updatedFields: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, ...updatedFields };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );
    if (currentUser?.id === profileId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
    }
  };

  const incrementProfileViews = (profileId: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p))
    );
  };

  // Profile Reports State
  const [profileReports, setProfileReports] = useState<ProfileReport[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_profile_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_profile_reports', JSON.stringify(profileReports));
  }, [profileReports]);

  const submitProfileReport = (report: ProfileReport) => {
    setProfileReports((prev) => [report, ...prev]);
    logActivity('profile_reported', `प्रोफाईल तक्रार दाखल: ${report.reportedProfileName} (${report.categoryLabel})`);
    addNotification({
      userId: 'admin',
      title: 'New Profile Report',
      titleMr: 'नवीन प्रोफाईल तक्रार प्राप्त झाली!',
      message: `${report.reporterUserName} reported profile ${report.reportedProfileName}`,
      messageMr: `${report.reporterUserName} यांनी ${report.reportedProfileName} बद्दल तक्रार दाखल केली आहे.`,
      type: 'system',
    });
  };

  const resolveProfileReport = (reportId: string, action: 'warning' | 'hide' | 'suspend' | 'dismiss') => {
    setProfileReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved', resolvedAction: action } : r))
    );

    const targetReport = profileReports.find((r) => r.id === reportId);
    if (targetReport) {
      if (action === 'hide' || action === 'suspend') {
        toggleBlockProfile(targetReport.reportedProfileId);
      }
    }

    logActivity('profile_report_resolved', `तक्रार निरसन केले ID: ${reportId} (कृती: ${action})`);
  };

  const updateMemberPrivacy = (
    profileId: string,
    newPrivacy: UserProfile['privacy'],
    notifyMember = false
  ) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, privacy: { ...p.privacy, ...newPrivacy } };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );

    if (currentUser?.id === profileId) {
      setCurrentUser((prev) => (prev ? { ...prev, privacy: { ...prev.privacy, ...newPrivacy } } : null));
    }

    logActivity('member_privacy_updated', `प्रायव्हसी सेटिंग्ज अद्ययावत केले (प्रोफाईल: ${profileId})`);

    if (notifyMember) {
      addNotification({
        userId: profileId,
        title: 'Privacy Settings Updated',
        titleMr: 'तुमची प्रायव्हसी / गोपनीयता सेटिंग बदलली आहे',
        message: 'Admin or you updated profile privacy controls.',
        messageMr: 'ॲडमिन / तुमच्याद्वारे प्रोफाईल गोपनीयता सेटिंग्ज यशस्वीरीत्या बदलण्यात आल्या आहेत.',
        type: 'system',
      });
    }
  };

  const updateMemberBadges = (
    profileId: string,
    badges: { isIdVerified?: boolean; isPhotoVerified?: boolean; isPremiumVerified?: boolean; isVerified?: boolean }
  ) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, ...badges };
          syncDocToFirestore('profiles', updated.id, updated);
          return updated;
        }
        return p;
      })
    );

    if (currentUser?.id === profileId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...badges } : null));
    }

    logActivity('member_badges_updated', `सदस्य व्हेरिफिकेशन बॅज अद्ययावत केले (${profileId})`);
  };

  // Business Vendor State & Handlers
  const [isBioDataMakerOpen, setIsBioDataMakerOpen] = useState(false);
  const [isSeoHubOpen, setIsSeoHubOpen] = useState(false);
  const [seoTargetCommunity, setSeoTargetCommunity] = useState<string | undefined>(undefined);
  const [seoTargetCity, setSeoTargetCity] = useState<string | undefined>(undefined);

  const openSeoLanding = (params?: { community?: string; city?: string }) => {
    setSeoTargetCommunity(params?.community);
    setSeoTargetCity(params?.city);
    setIsSeoHubOpen(true);
  };

  const [businessVendors, setBusinessVendors] = useState<BusinessVendor[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_business_vendors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BUSINESS_VENDORS;
      }
    }
    return INITIAL_BUSINESS_VENDORS;
  });

  const [isBusinessVendorDirectoryOpen, setIsBusinessVendorDirectoryOpen] = useState(false);
  const [isBusinessVendorRegisterModalOpen, setIsBusinessVendorRegisterModalOpen] = useState(false);
  const [isVendorPortalOpen, setIsVendorPortalOpen] = useState(false);
  const [currentVendorUser, setCurrentVendorUser] = useState<BusinessVendor | null>(() => {
    const saved = localStorage.getItem('vanjari_jodi_current_vendor');
    return saved ? JSON.parse(saved) : null;
  });

  const [vendorBookingInquiries, setVendorBookingInquiries] = useState<VendorBookingInquiry[]>(() => {
    const saved = localStorage.getItem('vanjari_jodi_vendor_inquiries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_business_vendors', JSON.stringify(businessVendors));
  }, [businessVendors]);

  useEffect(() => {
    if (currentVendorUser) {
      localStorage.setItem('vanjari_jodi_current_vendor', JSON.stringify(currentVendorUser));
    } else {
      localStorage.removeItem('vanjari_jodi_current_vendor');
    }
  }, [currentVendorUser]);

  useEffect(() => {
    localStorage.setItem('vanjari_jodi_vendor_inquiries', JSON.stringify(vendorBookingInquiries));
  }, [vendorBookingInquiries]);

  const addBusinessVendor = (vendorData: Omit<BusinessVendor, 'id' | 'createdAt' | 'status'> & { status?: 'pending' | 'approved' | 'rejected' }) => {
    const newVendor: BusinessVendor = {
      ...vendorData,
      id: 'ven-' + Date.now(),
      status: vendorData.status || 'pending',
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      bookedDates: [],
      pinPassword: vendorData.pinPassword || vendorData.mobile.slice(-4) || '1234'
    };
    setBusinessVendors((prev) => [newVendor, ...prev]);
    logActivity('Business Vendor Registration', `नवीन व्यवसाय नोंदणी अर्ज: ${newVendor.businessName} (${newVendor.category}) (Status: ${newVendor.status})`);
  };

  const updateBusinessVendorStatus = (id: string, status: 'approved' | 'rejected') => {
    setBusinessVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
    logActivity('Update Vendor Status', `व्यवसाय स्टेटस बदलले: ID ${id} -> ${status}`);
  };

  const deleteBusinessVendor = (id: string) => {
    setBusinessVendors((prev) => prev.filter((v) => v.id !== id));
    logActivity('Delete Vendor', `व्यवसाय नोंदणी हटवली: ID ${id}`);
  };

  const addCustomVendorCategory = (categoryName: string) => {
    if (!categoryName.trim()) return;
    const currentCats = siteConfig.customVendorCategories || [];
    if (currentCats.includes(categoryName.trim())) return;
    updateSiteConfig({
      customVendorCategories: [...currentCats, categoryName.trim()]
    });
  };

  const toggleVendorBookedDate = (vendorId: string, dateStr: string) => {
    setBusinessVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const currentBooked = v.bookedDates || [];
          const updated = currentBooked.includes(dateStr)
            ? currentBooked.filter((d) => d !== dateStr)
            : [...currentBooked, dateStr];
          return { ...v, bookedDates: updated };
        }
        return v;
      })
    );
  };

  const submitVendorBookingInquiry = (inquiryData: Omit<VendorBookingInquiry, 'id' | 'createdAt' | 'status'>) => {
    const newInquiry: VendorBookingInquiry = {
      ...inquiryData,
      id: 'inq-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setVendorBookingInquiries((prev) => [newInquiry, ...prev]);
    logActivity('Vendor Booking Inquiry', `बुकींग चौकशी अर्ज: ${newInquiry.vendorName} साठी - तारीख: ${newInquiry.eventDate}`);
  };

  const updateVendorBookingInquiryStatus = (id: string, status: VendorBookingInquiry['status']) => {
    setVendorBookingInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  const updateVendorDetails = (vendorId: string, updatedFields: Partial<BusinessVendor>) => {
    setBusinessVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, ...updatedFields } : v))
    );
    if (currentVendorUser && currentVendorUser.id === vendorId) {
      setCurrentVendorUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        themeMode,
        setThemeMode,
        t,
        profiles,
        currentUser,
        setCurrentUser,
        searchFilters,
        setSearchFilters,
        resetFilters,
        filteredProfiles,
        shortlistedIds,
        toggleShortlist,
        likedProfileIds,
        toggleLikeProfile,
        interests,
        sendInterest,
        respondInterest,
        chatMessages,
        sendChatMessage,
        deleteChatMessage,
        toggleBlockUserChat,
        activeChatUser,
        setActiveChatUser,
        activeVideoUser,
        setActiveVideoUser,
        currentView,
        setCurrentView,
        isLeftDrawerOpen,
        setIsLeftDrawerOpen,
        isRightDrawerOpen,
        setIsRightDrawerOpen,
        isFilterOpen,
        setIsFilterOpen,
        isLoginOpen,
        setIsLoginOpen,
        loginModalMode,
        setLoginModalMode,
        isRegisterOpen,
        setIsRegisterOpen,
        registrationStep,
        setRegistrationStep,
        selectedProfileForModal,
        setSelectedProfileForModal,
        isAdminOpen,
        setIsAdminOpen,
        isPaymentOpen: isPaymentOpenRaw,
        setIsPaymentOpen,
        selectedPlanForPayment,
        setSelectedPlanForPayment,
        isPaidPlansEnabled,
        setIsPaidPlansEnabled,
        siteConfig,
        setSiteConfig,
        updateSiteConfig,
        heroSlides,
        addHeroSlide,
        deleteHeroSlide,
        counters,
        updateCounter,
        isSuccessStoriesEnabled,
        setIsSuccessStoriesEnabled,
        isAdsEnabled,
        setIsAdsEnabled,
        isCountersEnabled,
        setIsCountersEnabled,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        approveProfile,
        rejectProfile,
        toggleBlockProfile,
        toggleBlockMemberAccess,
        toggleCustomAccess,
        toggleProfileVisibility,
        adminSuggestMatch,
        updateMemberTier,
        addProfile,
        successStories,
        addSuccessStory,
        submitSuccessStory,
        approveSuccessStory,
        rejectSuccessStory,
        updateSuccessStory,
        deleteSuccessStory,
        bulkDeleteSuccessStories,
        paymentRequests,
        addPaymentRequest,
        approvePaymentRequest,
        rejectPaymentRequest,
        deletePaymentRequest,
        bulkApprovePaymentRequests,
        bulkDeletePaymentRequests,
        notifications,
        markNotificationRead,
        addBroadcastNotification,
        sendPushNotification,
        unlockContact,
        unlockedContacts,
        contactRequests,
        requestContactAuthorization,
        authorizeContactRequest,
        rejectContactRequest,
        authorizeAllContactRequests,
        isContactAuthorizedForUser,
        toggleHideContact,
        plansList,
        updatePlan,
        communityAds,
        addCommunityAd,
        toggleAdStatus,
        deleteCommunityAd,
        adminSupportMessages,
        sendAdminSupportMessage,
        replyAdminSupportMessage,
        markAdminSupportMessagesRead,
        unreadAdminChatCount,
        recycleBin,
        softDeleteProfile,
        bulkSoftDeleteProfiles,
        restoreRecycleItem,
        bulkRestoreRecycleItems,
        permanentDeleteRecycleItem,
        bulkPermanentDeleteRecycleItems,
        bulkPurgeRecycleBin,
        deletedPhotosTrash,
        trashPhoto,
        restorePhotoFromTrash,
        permanentlyDeletePhotoFromTrash,
        purgeAllPhotosTrash,
        auditLogs,
        logActivity,
        subAdmins,
        currentSubAdmin,
        setCurrentSubAdmin,
        addSubAdmin,
        updateSubAdmin,
        deleteSubAdmin,
        promoCodes,
        addPromoCode,
        deletePromoCode,
        togglePromoCodeStatus,
        validatePromoCode,
        pendingProfileEdits,
        submitProfileEditRequest,
        approveProfileEditRequest,
        rejectProfileEditRequest,
        isFaceAuthModalOpen,
        setIsFaceAuthModalOpen,
        faceVerificationLogs,
        submitFaceVerification,
        approveFaceVerification,
        rejectFaceVerification,
        isProfilePlanExpired,
        isCurrentUserPlanExpired,
        updateApkSettings,
        incrementApkDownloadCount,
        updateSocialLinks,
        addSocialLink,
        deleteSocialLink,
        updateAdminCredentials,
        pendingLikes,
        approveLike,
        rejectLike,
        bulkApproveLikes,
        loginAsGuest,
        loginWithGoogle,
        loginWithEmail,
        updateFeatureBoxes,
        payPerContactRequests,
        addPayPerContactRequest,
        approvePayPerContactRequest,
        rejectPayPerContactRequest,
        deletePayPerContactRequest,
        selectedProfileForUnlock,
        setSelectedProfileForUnlock,
        isContactUnlockModalOpen,
        setIsContactUnlockModalOpen,
        isGuestRestrictionModalOpen,
        setIsGuestRestrictionModalOpen,
        restrictedFeatureName,
        checkGuestPermission,
        isGuestNudgeOpen,
        setIsGuestNudgeOpen,
        userActivityLogs,
        guestSessions,
        trackUserAction,
        archiveAdminSupportChat,
        deleteAdminSupportMessage,
        bulkDeleteAdminSupportMessages,
        profileRemovalRequests,
        submitProfileRemovalRequest,
        approveProfileRemovalRequest,
        rejectProfileRemovalRequest,
        deleteProfileRemovalRequest,
        isProfileRemovalModalOpen,
        setIsProfileRemovalModalOpen,
        setPrimaryPhoto,
        deleteMemberPhoto,
        addMemberPhoto,
        approvePhotoChanges,
        uploadAadhaarCard,
        updateProfileDirect,
        incrementProfileViews,
        profileReports,
        submitProfileReport,
        resolveProfileReport,
        updateMemberPrivacy,
        updateMemberBadges,
        resetSampleProfiles: () => {
          setProfiles(INITIAL_PROFILES);
          localStorage.setItem('vanjari_jodi_profiles', JSON.stringify(INITIAL_PROFILES));
        },
        isBioDataMakerOpen,
        setIsBioDataMakerOpen,
        businessVendors,
        isBusinessVendorDirectoryOpen,
        setIsBusinessVendorDirectoryOpen,
        isBusinessVendorRegisterModalOpen,
        setIsBusinessVendorRegisterModalOpen,
        isVendorPortalOpen,
        setIsVendorPortalOpen,
        currentVendorUser,
        setCurrentVendorUser,
        vendorBookingInquiries,
        addBusinessVendor,
        updateBusinessVendorStatus,
        deleteBusinessVendor,
        addCustomVendorCategory,
        toggleVendorBookedDate,
        submitVendorBookingInquiry,
        updateVendorBookingInquiryStatus,
        updateVendorDetails,
        isSeoHubOpen,
        setIsSeoHubOpen,
        seoTargetCommunity,
        setSeoTargetCommunity,
        seoTargetCity,
        setSeoTargetCity,
        openSeoLanding,
        isUserSecurityOpen,
        setIsUserSecurityOpen,
        isAdminSecurityOpen,
        setIsAdminSecurityOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
