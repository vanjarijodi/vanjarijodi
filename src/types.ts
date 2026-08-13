export type Language = 'mr' | 'en';

export type ThemeMode = 'crimson-gold' | 'dark-obsidian' | 'classic-emerald';

export type Gender = 'bride' | 'groom';

export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'awaiting_divorce';

export type MembershipTier = 'free' | 'monthly' | 'yearly' | 'lifetime' | 'silver' | 'gold' | 'diamond' | 'vip' | string;

export interface ContactRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterMobile?: string;
  targetProfileId: string;
  targetProfileName: string;
  status: 'pending' | 'authorized' | 'rejected';
  createdAt: string;
  note?: string;
}

export interface CommunityAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'banner' | 'meetup' | 'sponsor';
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  gender: Gender;
  dob: string;
  age: number;
  birthTime?: string;
  birthPlace?: string;
  mobile: string;
  secondaryMobile?: string;
  email: string;
  district: string;
  taluka: string;
  city: string;
  currentAddress?: string;
  nativeAddress?: string;
  education: string;
  occupation: string;
  companyName?: string;
  income: string;
  height: string;
  weight: string;
  bloodGroup: string;
  complexion?: string; // गोरा, निमगोरा, गव्हाळ, सावळा
  maritalStatus: MaritalStatus;
  religion: string;
  subCaste: string;
  gotra?: string;
  rashi?: string;
  nakshatra?: string;
  gan?: string;
  nadi?: string;
  fatherName?: string;
  fatherOccupation: string;
  motherName?: string;
  motherOccupation: string;
  brothers: number;
  brotherDetails?: string;
  sisters: number;
  sisterDetails?: string;
  relativeSurnames?: string[]; // e.g. ["मुंडे", "सानप", "नागरे", "काकड", "घूगे"]
  mamaName?: string;
  mamaNative?: string;
  familyType: string;
  expectations: string;
  photos: string[];
  horoscopeUrl?: string;
  aadhaarVerified: boolean;
  isIdVerified?: boolean;
  isPhotoVerified?: boolean;
  isPremiumVerified?: boolean;
  isFaceVerified?: boolean;
  faceVerifiedAt?: string;
  idProofUrl?: string;
  idVerificationNumber?: string; // Optional Govt ID / Aadhaar Number
  isVerified: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  membership: MembershipTier;
  createdAt: string;
  lastActive: string;
  bio?: string;
  privacy: {
    hideContact: boolean;
    hidePhoto: boolean;
    restrictDetails?: boolean;
    contactVisibility?: 'visible_to_all' | 'visible_to_verified_only' | 'hidden';
    photoVisibility?: 'visible_to_all' | 'visible_to_verified_only' | 'hidden';
    biodataVisibility?: 'visible_to_all' | 'visible_to_verified_only' | 'hidden';
  };
  completionPercentage?: number;
  pendingUpdates?: Partial<UserProfile>;
  registrationType?: 'manual' | 'ocr_ai' | 'admin_direct';
  isRegisteredByAdmin?: boolean;
  isChatBlocked?: boolean;
  isBlocked?: boolean;
  isCustomAccessGranted?: boolean;
  badge?: string;
  customBadge?: string;
  hideBadge?: boolean;
  isHiddenByAdmin?: boolean;
  viewsCount?: number;
  pendingPhotoApproval?: boolean;
  aadhaarCardUrl?: string;
  allowGuestContactView?: boolean;
  forceShowContact?: boolean;
  forceHideContact?: boolean;
  forceShowPhoto?: boolean;
  forceHidePhoto?: boolean;
  professionTags?: string[]; // e.g. ['🩺 डॉक्टर', '🏛️ सरकारी नोकरी', '💻 इंजिनिअर', '👨‍🏫 शिक्षक']
  paidAt?: string;
  paymentApprovedAt?: string;
  paymentAmount?: number;
  paymentUtr?: string;
  paymentPlanName?: string;
  membershipExpiryDate?: string;
  isPlanExpired?: boolean;
}

export interface ProfileReport {
  id: string;
  reporterUserId: string;
  reporterUserName: string;
  reporterUserMobile?: string;
  reportedProfileId: string;
  reportedProfileName: string;
  reportedProfileMobile?: string;
  category: 'fake_abusive' | 'misleading_info' | 'financial_fraud' | 'unauthorized_photos' | 'unprofessional_behavior' | 'other';
  categoryLabel: string;
  description: string;
  proofImageUrl?: string;
  createdAt: string;
  status: 'pending' | 'warning_sent' | 'hidden' | 'suspended' | 'dismissed';
}

export interface ProfileRemovalRequest {
  id: string;
  profileId: string;
  profileName: string;
  profileMobile: string;
  reason: 'marriage_fixed' | 'personal_reasons' | 'other';
  partnerDetails?: string;
  feedbackText?: string; // Feedback/review for home page success story
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SuccessStory {
  id: string;
  coupleName: string;
  marriageDate: string;
  district: string;
  image: string;
  story: string;
  storyMr: string;
  status?: 'pending' | 'approved' | 'rejected';
  submittedByUserId?: string;
  submittedByUserName?: string;
  partnerProfileId?: string;
  createdAt?: string;
}

export interface Plan {
  id: MembershipTier;
  name: string;
  nameMr: string;
  price: number;
  durationMonths: number;
  durationLabelMr?: string;
  planType?: 'monthly' | 'yearly' | 'lifetime' | 'pay_per_contact' | 'welcome_offer' | string;
  unlockCount?: number;
  isLimitedSlotsPlan?: boolean;
  maxMemberLimit?: number;
  currentMemberCount?: number;
  showRemainingSeatsToPublic?: boolean;
  relaunchBannerText?: string;
  customBadgeText?: string;
  badgeText?: string;
  features: string[];
  featuresMr: string[];
  recommended?: boolean;
  isActive?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  imageUrl?: string;
  pdfUrl?: string;
  pdfName?: string;
  fileType?: 'image' | 'pdf' | 'voice';
  voiceUrl?: string;
}

export interface Interest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  titleMr: string;
  message: string;
  messageMr: string;
  type: 'interest' | 'chat' | 'system' | 'approval';
  createdAt: string;
  isRead: boolean;
}

export interface AdminStats {
  totalMembers: number;
  totalBrides: number;
  totalGrooms: number;
  totalMarriages: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  activeChats: number;
}

export interface SearchFilterState {
  gender: Gender | 'all';
  minAge: number;
  maxAge: number;
  district: string;
  taluka: string;
  education: string;
  occupation: string;
  income: string;
  maritalStatus: string;
  subCaste: string;
  verifiedOnly: boolean;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export interface CounterItem {
  id: string;
  label: string;
  labelMr: string;
  value: string;
  iconName: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  planId: MembershipTier;
  planName: string;
  amount: number;
  utrNumber: string;
  paymentMethod?: string;
  screenshotUrl?: string;
  userPhotoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  isAutoApproved?: boolean;
  planDurationText?: string;
  validUntil?: string;
}

export interface GuestPermissions {
  viewProfiles: boolean;
  searchFilters: boolean;
  kundaliView: boolean;
  expressInterest: boolean;
  viewPhotos: boolean;
  directChat: boolean;
}

export interface PayPerContactRequest {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  targetProfileId: string;
  targetProfileName: string;
  targetProfileMobile?: string;
  amount: number;
  utrNumber: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface GuestSessionLog {
  sessionId: string;
  guestName?: string;
  guestMobile?: string;
  location?: string;
  deviceInfo: string;
  ipAddress: string;
  firstVisitTime: string;
  lastActiveTime: string;
  status?: 'active' | 'logged_out';
  pagesViewed: string[];
  actionsTaken: string[];
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  userMobile?: string;
  userType: 'registered' | 'guest';
  action: string;
  details: string;
  timestamp: string;
}

export interface AdminSupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  message: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf' | 'doc';
  imageUrl?: string;
  pdfUrl?: string;
  pdfName?: string;
  timestamp: string;
  isReadByAdmin: boolean;
  isReadByUser: boolean;
  userMobile?: string;
  isArchived?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat' | 'vip_free';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PendingProfileEdit {
  id: string;
  profileId: string;
  profileName: string;
  mobile: string;
  originalData: Partial<UserProfile>;
  updatedData: Partial<UserProfile>;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RecycleBinItem {
  id: string;
  originalType: 'biodata' | 'photo' | 'story';
  title: string;
  deletedAt: string;
  data: any;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  affectedProfileId?: string;
  affectedProfileName?: string;
}

export interface FaceVerificationLog {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  capturedPhotoUrl: string;
  profilePhotoUrl?: string;
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

export interface SocialLinkItem {
  id: string;
  platform: 'telegram' | 'whatsapp' | 'facebook' | 'instagram' | 'youtube' | 'custom';
  name: string;
  iconName?: string;
  iconUrl?: string;
  width: number;
  height: number;
  link: string;
  isEnabled: boolean;
}

export interface ApkSettings {
  apkUrl: string;
  appVersion: string;
  isEnabled: boolean;
  releaseNotes?: string;
  downloadCount?: number;
  fileSizeMb?: string;
}

export type SubAdminPermission = 
  | 'manage_profiles'
  | 'add_profiles'
  | 'edit_profiles'
  | 'delete_profiles'
  | 'bulk_delete'
  | 'member_access_control'
  | 'payment_requests'
  | 'pricing_plans'
  | 'auto_mode_master'
  | 'face_verification'
  | 'apk_manager'
  | 'index_controls'
  | 'support_chat'
  | 'branding'
  | 'guest_permissions'
  | 'user_analytics'
  | 'promo_codes'
  | 'recycle_bin'
  | 'audit_logs'
  | 'site_settings'
  | 'sub_admins';

export interface SubAdmin {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'primary_admin' | 'sub_admin';
  permissions: SubAdminPermission[];
  createdAt: string;
}

export interface FeatureBoxItem {
  id: string;
  title: string;
  desc: string;
  iconName: string;
  isEnabled: boolean;
}

export interface PendingLike {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BusinessVendor {
  id: string;
  businessName: string;
  ownerName: string;
  category: string;
  district: string;
  taluka?: string;
  address?: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  ratesAndPackages: string; // उदा. रु. १५,००० प्रति दिवस / रु. २५० प्रति ताट
  memberDiscount?: string; // उदा. वंजारी जोडी सदस्यांना ५% किंवा १०% डिस्काउंट
  commissionRate?: string; // उदा. ५% कमिशन, १०% कमिशन
  photoUrl?: string;
  pdfUrl?: string; // रेट कार्ड किंवा ब्रोशर PDF
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  viewsCount?: number;
  bookedDates?: string[]; // YYYY-MM-DD format (उदा. ['2025-11-25', '2025-12-02'])
  pinPassword?: string; // व्हेंडर पोर्टल लॉगिनसाठी पिन/पासवर्ड
}

export interface VendorBookingInquiry {
  id: string;
  vendorId: string;
  vendorName: string;
  userName: string;
  userMobile: string;
  eventDate: string; // YYYY-MM-DD
  eventType?: string; // उदा. लग्नकार्य, हळदी, साखरपुडा
  notes?: string;
  status: 'pending' | 'accepted' | 'date_unavailable' | 'completed';
  createdAt: string;
}

export interface SiteConfig {
  topBarText: string;
  logoTitle: string;
  logoSubtitle: string;
  logoUrl?: string;
  logoHeight?: number;
  logoWidth?: number;
  hideLogoText?: boolean;
  paymentQrUrl?: string;
  paymentUpiId?: string;
  paymentNote?: string;
  paymentMode?: 'both' | 'razorpay_only' | 'upi_qr_only';
  enableRazorpay?: boolean;
  enableInstamojo?: boolean;
  instamojoUrl?: string;
  enableUpiQr?: boolean;
  enableFullAccessForPaidMembers?: boolean;
  upgradeRecommendedPlanId?: string;
  razorpayKeyId?: string;
  heroHeading: string;
  heroSubheading: string;
  heroDescription?: string;
  ctaButtonText: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  telegramGroupUrl?: string;
  showTelegramBanner?: boolean;
  contactAddress: string;
  contactHeaderTitle?: string;
  contactHeaderSubtitle?: string;
  aboutUsText: string;
  disclaimerText: string;
  isSuccessStoriesEnabled: boolean;
  isAdsEnabled: boolean;
  isPaidPlansEnabled: boolean;
  isCountersEnabled: boolean;
  hidePhoneNumbersGlobal?: boolean;
  hideFullAddressGlobal?: boolean;
  enableProfileLiking?: boolean;
  autoApproveLikes?: boolean;
  showLikesToUsers?: boolean;
  enableChatGlobal?: boolean;
  blockContactSharingInChat?: boolean;
  showDistrictFilter?: boolean;
  showProfilesOnIndexPage?: boolean;
  hideEmptyProfilesSection?: boolean;
  enableSearchFilters?: boolean;
  filterShowGender?: boolean;
  filterShowAge?: boolean;
  filterShowDistrict?: boolean;
  filterShowEducation?: boolean;
  filterShowMaritalStatus?: boolean;
  filterShowVerified?: boolean;
  blurProfilePhotos?: boolean;
  photoBlurPercent?: number;
  blurProfileNames?: boolean;
  blurNamePercent?: number;
  blurMobilePercent?: number;
  blurEducation?: boolean;
  blurOccupation?: boolean;
  blurIncome?: boolean;
  blurRepresentativeNames?: boolean;
  disablePhotoDownloadAndScreenshot?: boolean;
  enableGuestLogin?: boolean;
  tickerText?: string;
  isTickerEnabled?: boolean;
  specialNoticeTitle?: string;
  specialNoticeText?: string;
  isSpecialNoticeEnabled?: boolean;
  hideContactAndAddressGlobal?: boolean;
  hidePaymentDetailsGlobal?: boolean;
  hideDistrictHeadquarters?: boolean;
  hideOfficeAddress?: boolean;
  enableAadhaarVerification?: boolean;
  guestBannerTitle?: string;
  guestBannerText?: string;
  guestBannerButtonText?: string;
  enableGuestBannerTrigger?: boolean;
  unlockContactFee?: number;
  isPayPerContactEnabled?: boolean;
  isOfferModeEnabled?: boolean;
  offerModeText?: string;
  disableAllPaymentsInOfferMode?: boolean;
  isAutoModeEnabled?: boolean;
  autoModeType?: 'payment_required' | 'free_for_all';
  autoApproveNewRegistrations?: boolean;
  autoApprovePaidRegistrations?: boolean;
  autoUnlockOnPayment?: boolean;
  freeForAllMode?: boolean;
  autoModeForGuests?: boolean;
  autoShowTotalMetrics?: boolean;
  guestPermissions?: GuestPermissions;
  isNoticeBannerEnabled?: boolean;
  noticeBannerText?: string;
  allowGuestsToViewContacts?: boolean;
  allowPublicVisitorsToViewContacts?: boolean;
  allowMembersToViewContacts?: boolean;
  allowGuestsToViewPhotos?: boolean;
  allowPublicVisitorsToViewPhotos?: boolean;
  allowMembersToViewPhotos?: boolean;
  nameDisplayModeForFreeUsers?: 'full_name' | 'first_name_only' | 'first_and_last' | 'surname_only' | 'hidden_star' | 'blurred_name';
  hideMiddleNameForFreeUsers?: boolean;
  hideLastNameForFreeUsers?: boolean;
  nameBlurPercentage?: number;
  blurPhotosForFreeUsers?: boolean;
  photoBlurPercentage?: number;
  showOnlyWelcomePlan?: boolean;
  enablePromoCodes?: boolean;
  enableMutualLikeContactUnlock?: boolean;
  requireMutualLikeForPhone?: boolean;
  disablePlanContactLimit?: boolean;
  adminOverrideMemberPrivacy?: boolean;
  allowMembersToControlPrivacy?: boolean;
  noticeBannerBg?: 'saffron' | 'emerald' | 'crimson' | 'maroon';
  regOption1Title?: string;
  regOption1Icon?: string;
  regOption2Title?: string;
  regOption2Icon?: string;
  bhagwangadImg?: string;
  bhagwangadBadgeText?: string;
  bhagwangadHeading?: string;
  bhagwangadSubtitle?: string;
  bhagwangadDescription?: string;
  bhagwangadHighlight1?: string;
  bhagwangadHighlight2?: string;
  bhagwangadHighlight3?: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  adminCredentials?: {
    name: string;
    username: string;
    password: string;
  };
  apkSettings?: ApkSettings;
  socialLinks?: SocialLinkItem[];
  featureBoxes?: FeatureBoxItem[];
  enableBusinessVendors?: boolean;
  showVendorContactsToPublic?: boolean;
  customVendorCategories?: string[];
  // Flash / Popup Ad Settings (आकर्षक जाहिरात / पॉपअप फोटो)
  isFlashAdEnabled?: boolean;
  flashAdImageUrl?: string;
  flashAdTitle?: string;
  flashAdSubtitle?: string;
  flashAdLinkUrl?: string;
  flashAdDisplayMode?: 'popup_modal' | 'top_slide' | 'bottom_float';
  flashAdAutoCloseSeconds?: number;
  flashAdDelaySeconds?: number;
  // Chat Message Permissions
  allowUsersToDeleteChatMessages?: boolean;
  // BioData Maker / Watermark & Promotion settings
  biodataWatermarkEnabled?: boolean;
  biodataWatermarkUrl?: string;
  biodataWatermarkOpacity?: number;
  biodataWatermarkSize?: number;
  biodataPlaystoreAdEnabled?: boolean;
  biodataPlaystoreAdText?: string;
  biodataPlaystoreUrl?: string;
  biodataPlaystoreQrEnabled?: boolean;
  // Search Filter & Badge Controls
  enableProfessionFilter?: boolean;
  enableEducationFilter?: boolean;
  enableDistrictFilter?: boolean;
  enableMaritalStatusFilter?: boolean;
  enableAgeFilter?: boolean;
  showProfessionBadgesOnCards?: boolean;
  showGovtJobHighlight?: boolean;
}

export interface TrashedProfile {
  id: string;
  profile: UserProfile;
  deletedAt: string;
  deletedBy: string;
  reason?: string;
}

export interface TrashedPhoto {
  id: string;
  profileId: string;
  originalProfileId?: string;
  profileName: string;
  profileRegId: string;
  photoUrl: string;
  photoType: 'avatar' | 'gallery';
  deletedAt: string;
  deletedBy: string;
  estimatedSizeKb?: number;
  sizeEstimateKb?: number;
}

