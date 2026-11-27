import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { initiateRazorpayPayment } from '../services/razorpayClient';
import { downloadPaymentInvoice } from '../utils/invoiceGenerator';
import { syncDocToFirestore } from '../utils/firestoreSync';
import { hashPassword, verifyPassword } from '../utils/passwordSecurity';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { safeParseJson } from '../utils/safeFetchJson';
import { signInWithGoogleVerified } from '../utils/googleAuthClient';
import { downloadApkFile } from '../utils/apkDownloader';
import { compressAndResizeImage } from '../utils/imageCompressor';
import {
  downloadFullFirebaseJsonBackup,
  downloadSupabaseSqlMigration,
  downloadMembersCsvExport,
  downloadCompactMembersPrintableDirectory,
} from '../utils/adminDataBackupAndPrint';
import { getMemberPaymentStatusInfo } from '../utils/adminExportUtils';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import {
  WebsiteCmsConfig,
  DEFAULT_WEBSITE_CMS,
  getMergedWebsiteCms,
} from '../utils/websiteCmsDefaults';
import { WebsiteFullCmsEditor } from './WebsiteFullCmsEditor';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smartphone,
  Download,
  AlertTriangle,
  Loader2,
  Copy,
  KeyRound,
  Send,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  UserCheck,
  MessageSquare,
  ExternalLink,
  LogOut,
  Users,
  Link2,
  Server,
  Globe,
  Gift,
  Database,
  Printer,
  PlusCircle,
  Bell,
  Megaphone,
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  Sparkles,
  Check,
  Info,
    PhoneCall,
    Phone,
    FileText,
    Camera,
    Bot,
    Zap,
    Mail,
} from 'lucide-react';
import { WebsiteAdBannerConfig } from '../types';

interface WebPaymentPageProps {
  onSwitchToAppMode?: () => void;
  onOpenAdmin?: () => void;
}

export const WebPaymentPage: React.FC<WebPaymentPageProps> = ({
  onSwitchToAppMode,
  onOpenAdmin,
}) => {
  const {
    plansList,
    updatePlan,
    saveAllPlans,
    siteConfig,
    updateSiteConfig,
    addProfile,
    sendPushNotification,
    addPaymentRequest,
    currentUser,
    setCurrentUser,
    addNotification,
    updateMemberTier,
    profiles,
    updateProfileDirect,
    incrementApkDownloadCount,
    setIsAdminOpen,
    setIsAdminLoggedIn,
    setIsRegisterOpen,
    setRegistrationStep,
    setIsBioDataMakerOpen,
    setIsLoginOpen,
    promoCodes,
    addPromoCode,
    deletePromoCode,
    togglePromoCodeStatus,
    validatePromoCode,
    usePromoCode,
  } = useApp();

  // Active Portal Tab: 'pay_and_set_id' | 'forgot_password_otp' | 'admin_portal'
  const [activeTab, setActiveTab] = useState<'pay_and_set_id' | 'forgot_password_otp' | 'admin_portal'>('pay_and_set_id');

  // Admin Portal Sub-Tab (only visible after Admin Login)
  const [adminSubTab, setAdminSubTab] = useState<
    | 'plans_manager'
    | 'promo_manager'
    | 'ad_manager'
    | 'web_app_settings'
    | 'members_ledger'
    | 'sms_vault'
    | 'backup_supabase'
    | 'razorpay_vault'
    | 'compliance_links'
  >('plans_manager');

  // Admin Authentication States
  const [adminToken, setAdminToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('vanjari_admin_session_token') || '';
    }
    return '';
  });
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPass, setShowAdminPass] = useState<boolean>(false);
  const [isLoggingInAdmin, setIsLoggingInAdmin] = useState<boolean>(false);
  const [adminLoginError, setAdminLoginError] = useState<string>('');
  const [adminDisplayName, setAdminDisplayName] = useState<string>('मुख्य प्रशासक (Super Admin)');

  const isAdminAuthenticated = Boolean(adminToken && adminToken.startsWith('adm_sess_'));

  const [selectedPlanId, setSelectedPlanId] = useState<string>('welcome_offer');
  const [userName, setUserName] = useState<string>('');
  const [userMobile, setUserMobile] = useState<string>('');
  const [userGender, setUserGender] = useState<'groom' | 'bride'>('groom');
  const [userId, setUserId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    isVipFree: boolean;
    message: string;
    customValidityDays?: number;
  } | null>(null);
  const [promoFeedbackError, setPromoFeedbackError] = useState<string>('');
  const [isFromApp, setIsFromApp] = useState<boolean>(false);

  // Website Admin Promo Code Creator States
  const [newPromoCodeStr, setNewPromoCodeStr] = useState<string>('');
  const [newPromoType, setNewPromoType] = useState<'vip_free' | 'percentage' | 'flat' | 'special_price'>('percentage');
  const [newPromoVal, setNewPromoVal] = useState<string>('50');
  const [newPromoTargetPrice, setNewPromoTargetPrice] = useState<string>('199');
  const [newPromoValidityDays, setNewPromoValidityDays] = useState<number>(180);
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<string>('100');
  const [newPromoDesc, setNewPromoDesc] = useState<string>('वंजारी जोडी विशेष सवलत कूपन');
  const [newPromoShowBanner, setNewPromoShowBanner] = useState<boolean>(false);
  const [adminPromoFeedback, setAdminPromoFeedback] = useState<string>('');
  const [copiedPromoCodeStr, setCopiedPromoCodeStr] = useState<string>('');
  const [sharePromoMobile, setSharePromoMobile] = useState<string>('');
  const [sharePromoMemberName, setSharePromoMemberName] = useState<string>('');

  // Password setup states (for Payment + Set Login ID & Password)
  const [desiredPassword, setDesiredPassword] = useState<string>('');
  const [confirmDesiredPassword, setConfirmDesiredPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isCredentialsSaved, setIsCredentialsSaved] = useState<boolean>(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState<boolean>(false);
  const [credentialsMessage, setCredentialsMessage] = useState<string>('');

  // Payment states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [approvedDetails, setApprovedDetails] = useState<any>(null);

  // Mandatory Plan Activation Email OTP Verification states
  const [checkoutEmail, setCheckoutEmail] = useState<string>('');
  const [isCheckoutPhoneVerified, setIsCheckoutPhoneVerified] = useState<boolean>(false);
  const [checkoutOtpCode, setCheckoutOtpCode] = useState<string>('');
  const [isSendingCheckoutOtp, setIsSendingCheckoutOtp] = useState<boolean>(false);
  const [isVerifyingCheckoutOtp, setIsVerifyingCheckoutOtp] = useState<boolean>(false);
  const [checkoutOtpSent, setCheckoutOtpSent] = useState<boolean>(false);
  const [checkoutOtpCooldown, setCheckoutOtpCooldown] = useState<number>(0);
  const [checkoutOtpError, setCheckoutOtpError] = useState<string>('');
  const [checkoutOtpSuccess, setCheckoutOtpSuccess] = useState<string>('');

  // App Login on Website states (Use existing App Login ID + MPIN/Password to buy plan)
  const [appLoginMobile, setAppLoginMobile] = useState<string>('');
  const [appLoginPassword, setAppLoginPassword] = useState<string>('');
  const [showAppLoginPass, setShowAppLoginPass] = useState<boolean>(false);
  const [isSigningInWithAppLogin, setIsSigningInWithAppLogin] = useState<boolean>(false);
  const [appLoginFeedback, setAppLoginFeedback] = useState<string>('');
  const [appLoginError, setAppLoginError] = useState<string>('');
  const [isAppLoginSignedIn, setIsAppLoginSignedIn] = useState<boolean>(false);

  // Forgot Password / Email OTP Reset states
  const [otpMobile, setOtpMobile] = useState<string>('');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [newResetPassword, setNewResetPassword] = useState<string>('');
  const [confirmResetPassword, setConfirmResetPassword] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [formattedSmsPreview, setFormattedSmsPreview] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string>('');
  const [resetCompleted, setResetCompleted] = useState<boolean>(false);
  const [isGoogleVerifyingCheckout, setIsGoogleVerifyingCheckout] = useState<boolean>(false);
  const [showCheckoutEmailOtpFallback, setShowCheckoutEmailOtpFallback] = useState<boolean>(false);
  const [isGoogleVerifyingForgot, setIsGoogleVerifyingForgot] = useState<boolean>(false);
  const [isForgotGoogleVerified, setIsForgotGoogleVerified] = useState<boolean>(false);
  const [showForgotEmailOtpFallback, setShowForgotEmailOtpFallback] = useState<boolean>(false);

  // Email OTP Gateway Configuration states (Protected inside Admin Vault)
  const [emailOtpConfig, setEmailOtpConfig] = useState({
    provider: 'gmail' as 'gmail' | 'custom_smtp' | 'resend',
    isEnabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    hasSmtpPass: false,
    fromEmail: '',
    fromName: 'वंजारी जोडी (Vanjari Jodi)',
    resendApiKey: '',
    hasResendApiKey: false,
  });
  const [showSmsApiKey, setShowSmsApiKey] = useState<boolean>(false);
  const [isSavingSmsConfig, setIsSavingSmsConfig] = useState<boolean>(false);
  const [smsConfigFeedback, setSmsConfigFeedback] = useState<string>('');
  const [testEmailTo, setTestEmailTo] = useState<string>('');
  const [isTestingSms, setIsTestingSms] = useState<boolean>(false);
  const [testSmsFeedback, setTestSmsFeedback] = useState<string>('');

  // Razorpay Server Vault Configuration states (Protected inside Admin Vault)
  const [rzpConfig, setRzpConfig] = useState({
    enabled: true,
    env: 'LIVE' as 'TEST' | 'LIVE',
    keyId: '',
    secretKey: '',
    webhookSecret: '',
    hasSecretKey: false,
  });
  const [showRzpSecret, setShowRzpSecret] = useState<boolean>(false);
  const [isSavingRzp, setIsSavingRzp] = useState<boolean>(false);
  const [rzpFeedback, setRzpFeedback] = useState<string>('');

  // Admin Manual Member Login ID & Password Creator states
  const [manualMobile, setManualMobile] = useState<string>('');
  const [manualPassword, setManualPassword] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [manualGender, setManualGender] = useState<'groom' | 'bride'>('groom');
  const [isSavingManualCreds, setIsSavingManualCreds] = useState<boolean>(false);
  const [manualCredsFeedback, setManualCredsFeedback] = useState<string>('');
  const [ledgerRecords, setLedgerRecords] = useState<any[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  // Website Admin Plans Manager states
  const [editablePlans, setEditablePlans] = useState<any[]>([]);
  const [isSavingPlans, setIsSavingPlans] = useState<boolean>(false);
  const [plansFeedback, setPlansFeedback] = useState<string>('');
  const [showAddPlanForm, setShowAddPlanForm] = useState<boolean>(false);
  const [newPlanNameMr, setNewPlanNameMr] = useState<string>('');
  const [newPlanNameEn, setNewPlanNameEn] = useState<string>('');
  const [newPlanPrice, setNewPlanPrice] = useState<string>('499');
  const [newPlanDuration, setNewPlanDuration] = useState<string>('६ महिने');
  const [newPlanMonths, setNewPlanMonths] = useState<string>('6');
  const [newPlanContacts, setNewPlanContacts] = useState<string>('100');
  const [newPlanBadge, setNewPlanBadge] = useState<string>('✨ स्पेशल ऑफर');

  useEffect(() => {
    if (Array.isArray(plansList) && plansList.length > 0) {
      setEditablePlans(plansList.map((p) => ({ ...p })));
    }
  }, [plansList]);

  // 1-Line Legal Consent Checkbox state on Payment & Registration Forms
  const [acceptedWebLegalConsent, setAcceptedWebLegalConsent] = useState<boolean>(true);
  const [acceptedAdminProfileConsent, setAcceptedAdminProfileConsent] = useState<boolean>(true);

  // Separate Website vs Android App Settings states
  const [webHeroTitle, setWebHeroTitle] = useState<string>(
    siteConfig?.heroTitle || 'वंजारी जोडी मॅट्रिमोनी — अधिकृत वेब पोर्टल'
  );
  const [webSubtitle, setWebSubtitle] = useState<string>(
    siteConfig?.logoSubtitle || 'वंजारी समाजाचे हक्काचे व विश्वासाचे सुवर्ण व्यासपीठ'
  );
  const [webSupportPhone, setWebSupportPhone] = useState<string>(
    siteConfig?.helplineNumber || '+91 9822000000'
  );
  const [webWhatsappNum, setWebWhatsappNum] = useState<string>(
    siteConfig?.whatsappNumber || '9822000000'
  );
  const [webApkUrl, setWebApkUrl] = useState<string>(
    siteConfig?.apkDownloadUrl || '/vanjari-jodi.apk'
  );
  const [webOfferBannerText, setWebOfferBannerText] = useState<string>(
    siteConfig?.promoBannerText || '🔥 विशेष सवलत: ६ महिने वेलकम मेंबरशिप आता फक्त ₹३९८ मध्ये!'
  );

  // Website Advertisement Banner & Showcase State (Synced with siteConfig.websiteAdBanner)
  const [adBannerEnabled, setAdBannerEnabled] = useState<boolean>(() => {
    return siteConfig?.websiteAdBanner?.enabled ?? true;
  });
  const [adBannerMode, setAdBannerMode] = useState<'custom_image' | 'dynamic_promo'>(() => {
    return siteConfig?.websiteAdBanner?.mode || 'dynamic_promo';
  });
  const [adBannerImageUrl, setAdBannerImageUrl] = useState<string>(() => {
    return siteConfig?.websiteAdBanner?.imageUrl || '';
  });
  const [adBannerOrientation, setAdBannerOrientation] = useState<'horizontal' | 'vertical' | 'auto'>(() => {
    return siteConfig?.websiteAdBanner?.imageOrientation || 'horizontal';
  });
  const [adBannerTitle, setAdBannerTitle] = useState<string>(() => {
    return siteConfig?.websiteAdBanner?.title || 'वंजारी समाज विशेष विवाह नोंदणी महोत्सव';
  });
  const [adBannerSubtitle, setAdBannerSubtitle] = useState<string>(() => {
    return (
      siteConfig?.websiteAdBanner?.subtitle ||
      '१,०००+ उच्चशिक्षित वधू-वर स्थळांची खात्रीशीर माहिती व पत्रिका मिलन. आजच नोंदणी करा आणि योग्य जोडीदार मिळवा!'
    );
  });
  const [adBannerBadge, setAdBannerBadge] = useState<string>(() => {
    return siteConfig?.websiteAdBanner?.badgeText || '🎉 विशेष ऑफर ५०% सूट';
  });
  const [adBannerCtaText, setAdBannerCtaText] = useState<string>(() => {
    return siteConfig?.websiteAdBanner?.ctaText || 'मेंबरशिप प्लॅन निवडा';
  });
  const [adBannerCtaAction, setAdBannerCtaAction] = useState<
    'scroll_to_plans' | 'open_whatsapp' | 'call_support' | 'download_apk' | 'custom_url'
  >(() => {
    return siteConfig?.websiteAdBanner?.ctaAction || 'scroll_to_plans';
  });
  const [adBannerTargetUrl, setAdBannerTargetUrl] = useState<string>(() => {
    return siteConfig?.websiteAdBanner?.targetUrl || '';
  });
  const [isUploadingBannerPhoto, setIsUploadingBannerPhoto] = useState<boolean>(false);
  const [isSavingAdBanner, setIsSavingAdBanner] = useState<boolean>(false);
  const [adBannerFeedback, setAdBannerFeedback] = useState<string>('');

  // Sync state if siteConfig changes from Firestore
  useEffect(() => {
    if (siteConfig?.websiteAdBanner) {
      const banner = siteConfig.websiteAdBanner;
      if (banner.enabled !== undefined) setAdBannerEnabled(Boolean(banner.enabled));
      if (banner.mode) setAdBannerMode(banner.mode);
      if (banner.imageUrl !== undefined) setAdBannerImageUrl(String(banner.imageUrl ?? ''));
      if (banner.imageOrientation) setAdBannerOrientation(banner.imageOrientation);
      if (banner.title !== undefined) setAdBannerTitle(String(banner.title ?? ''));
      if (banner.subtitle !== undefined) setAdBannerSubtitle(String(banner.subtitle ?? ''));
      if (banner.badgeText !== undefined) setAdBannerBadge(String(banner.badgeText ?? ''));
      if (banner.ctaText !== undefined) setAdBannerCtaText(String(banner.ctaText ?? ''));
      if (banner.ctaAction) setAdBannerCtaAction(banner.ctaAction);
      if (banner.targetUrl !== undefined) setAdBannerTargetUrl(String(banner.targetUrl ?? ''));
    }
  }, [siteConfig?.websiteAdBanner]);

  // Android App specific settings (Zero Payment Mention - Google Play Safe)
  const [appTopMarqueeText, setAppTopMarqueeText] = useState<string>(
    siteConfig?.marqueeText ||
      '🚩 वंजारी जोडी ॲपमध्ये आपले स्वागत आहे! फोटो व मोबाईल नंबर एकमेकांना ❤️ लाईक (Mutual Like) केल्यावरच दिसतात.'
  );
  const [appWelcomeNewUserText, setAppWelcomeNewUserText] = useState<string>(
    siteConfig?.noticeText ||
      '✨ नवीन ॲप युजर्ससाठी: फक्त ३० सेकंदांत बायोडाटा फोटो अपलोड करा आणि हजारो व्हेरिफाईड स्थळे पहा!'
  );
  const [appGuestPreviewLimit, setAppGuestPreviewLimit] = useState<number>(
    Number(siteConfig?.guestBrowseLimit) || 50
  );
  const [appMutualLikePrivacy, setAppMutualLikePrivacy] = useState<boolean>(true);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string>('');

  // Full Word-by-Word Website CMS State (Synced with siteConfig.websiteCms)
  const [webCms, setWebCms] = useState<WebsiteCmsConfig>(() =>
    getMergedWebsiteCms(siteConfig?.websiteCms)
  );
  const [isLiveWebsiteEditMode, setIsLiveWebsiteEditMode] = useState<boolean>(false);
  const [activeInlineEditKey, setActiveInlineEditKey] = useState<keyof WebsiteCmsConfig | null>(
    null
  );
  const [inlineEditDraft, setInlineEditDraft] = useState<string>('');

  useEffect(() => {
    if (siteConfig?.websiteCms) {
      setWebCms(getMergedWebsiteCms(siteConfig.websiteCms));
    }
  }, [siteConfig?.websiteCms]);

  const handleUpdateCmsField = <K extends keyof WebsiteCmsConfig>(
    key: K,
    value: WebsiteCmsConfig[K]
  ) => {
    setWebCms((prev) => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
  };

  const handleResetCmsDefaults = () => {
    const fresh = { ...DEFAULT_WEBSITE_CMS };
    setWebCms(fresh);
    updateSiteConfig({ websiteCms: fresh });
    setSettingsSavedMsg('✅ वेबसाईटचे सर्व शब्द व विभाग मूळ डिफॉल्ट स्थितीत रिसेट केले गेले आहेत!');
    setTimeout(() => setSettingsSavedMsg(''), 5000);
  };

  // Helper to make any word/sentence clickable for instant editing when Admin enables Live Edit Mode
  const editableText = (key: keyof WebsiteCmsConfig, extraClass = '') => {
    const textVal = String(webCms[key] ?? '');
    if (!isAdminAuthenticated || !isLiveWebsiteEditMode) {
      return textVal;
    }
    return (
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setActiveInlineEditKey(key);
          setInlineEditDraft(textVal);
        }}
        title="हा मजकूर बदलण्यासाठी येथे क्लिक करा"
        className={`inline-block border-2 border-dashed border-amber-400 bg-amber-300/25 hover:bg-amber-300/40 px-1.5 py-0.5 rounded-lg cursor-pointer transition ${extraClass}`}
      >
        ✏️ {textVal}
      </span>
    );
  };

  // Push Broadcast from Website Admin to All App Users (Works on Lock Screen)
  const [pushTitleInput, setPushTitleInput] = useState<string>('🚩 वंजारी जोडी मॅट्रिमोनी नवीन सूचना');
  const [pushBodyInput, setPushBodyInput] = useState<string>(
    'आज नवीन उच्चशिक्षित वधू-वर बायोडाटा जोडले गेले आहेत. ॲप उघडून लगेच पहा!'
  );
  const [isSendingPushBroadcast, setIsSendingPushBroadcast] = useState<boolean>(false);
  const [pushBroadcastFeedback, setPushBroadcastFeedback] = useState<string>('');

  // Member Directory Filter & Free Plan Grant states
  const [memberFilterTab, setMemberFilterTab] = useState<
    'all' | 'paid' | 'free_granted' | 'unpaid' | 'admin_added'
  >('all');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const [freeGrantMobile, setFreeGrantMobile] = useState<string>('');
  const [freeGrantName, setFreeGrantName] = useState<string>('');
  const [freeGrantGender, setFreeGrantGender] = useState<'groom' | 'bride'>('groom');
  const [freeGrantDurationDays, setFreeGrantDurationDays] = useState<number>(180);
  const [freeGrantMpin, setFreeGrantMpin] = useState<string>('1234');
  const [freeGrantSendSms, setFreeGrantSendSms] = useState<boolean>(true);
  const [isGrantingFreePlan, setIsGrantingFreePlan] = useState<boolean>(false);
  const [freeGrantFeedback, setFreeGrantFeedback] = useState<string>('');

  // Admin Direct Profile Creator states (Marked with isRegisteredByAdmin: true)
  const [showAdminAddProfileBox, setShowAdminAddProfileBox] = useState<boolean>(false);
  const [admProfName, setAdmProfName] = useState<string>('');
  const [admProfGender, setAdmProfGender] = useState<'groom' | 'bride'>('bride');
  const [admProfDob, setAdmProfDob] = useState<string>('1999-05-15');
  const [admProfHeight, setAdmProfHeight] = useState<string>('5 फूट 4 इंच');
  const [admProfMobile, setAdmProfMobile] = useState<string>('');
  const [admProfDistrict, setAdmProfDistrict] = useState<string>('बीड (Beed)');
  const [admProfCity, setAdmProfCity] = useState<string>('');
  const [admProfEducation, setAdmProfEducation] = useState<string>('B.E. / B.Tech / पदवीधर');
  const [admProfOccupation, setAdmProfOccupation] = useState<string>('नोकरी / व्यवसाय');
  const [admProfIncome, setAdmProfIncome] = useState<string>('₹8-12 लाख वार्षिक');
  const [admProfGotra, setAdmProfGotra] = useState<string>('');
  const [admProfMama, setAdmProfMama] = useState<string>('');
  const [admProfPhotoUrl, setAdmProfPhotoUrl] = useState<string>('');
  const [admProfIsFreePlan, setAdmProfIsFreePlan] = useState<boolean>(true);
  const [admProfFeedback, setAdmProfFeedback] = useState<string>('');

  // SMS Quota Saver & Admin Direct Custom SMS Sender states
  const [smsStats, setSmsStats] = useState<{
    todaySent: number;
    totalSent: number;
    mpinSavedCount: number;
    quotaSettings: {
      mpinZeroSmsAutoLogin: boolean;
      maxOtpPer24h: number;
      cooldownSeconds: number;
      dailyGlobalSmsCap: number;
      skipSmsForAlreadyVerified: boolean;
    };
    recentLogs: any[];
  }>({
    todaySent: 0,
    totalSent: 0,
    mpinSavedCount: 142,
    quotaSettings: {
      mpinZeroSmsAutoLogin: true,
      maxOtpPer24h: 3,
      cooldownSeconds: 60,
      dailyGlobalSmsCap: 200,
      skipSmsForAlreadyVerified: true,
    },
    recentLogs: [],
  });
  const [customSmsPhone, setCustomSmsPhone] = useState<string>('');
  const [customSmsMemberName, setCustomSmsMemberName] = useState<string>('');
  const [customSmsCategory, setCustomSmsCategory] = useState<string>('plan_info');
  const [customSmsText, setCustomSmsText] = useState<string>(
    'नमस्कार! वंजारी जोडी (vanjarijodi.web.app) वर तुमचे स्वागत आहे. सर्व बायोडाटा व संपर्क पाहण्यासाठी आपला लॉगिन आयडी सक्रिय करा. - VNJODI'
  );
  const [isSendingCustomSms, setIsSendingCustomSms] = useState<boolean>(false);
  const [customSmsFeedback, setCustomSmsFeedback] = useState<string>('');
  const [isSavingQuotaSettings, setIsSavingQuotaSettings] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      const planFromUrl = params.get('plan') || 'welcome_offer';
      setSelectedPlanId(planFromUrl);

      const nameFromUrl = params.get('userName') || currentUser?.fullName || '';
      const mobileFromUrl = params.get('userMobile') || currentUser?.mobile || '';
      const userIdFromUrl = params.get('userId') || currentUser?.id || '';
      const amtFromUrl = params.get('amount') ? Number(params.get('amount')) : null;
      const promoFromUrl = params.get('promo') || '';
      const sourceFromUrl = params.get('source') === 'android_app';
      const tabFromUrl = params.get('tab');

      setUserName(nameFromUrl);
      setUserMobile(mobileFromUrl.replace(/\D/g, '').slice(-10));
      setOtpMobile(mobileFromUrl.replace(/\D/g, '').slice(-10));
      setUserId(userIdFromUrl);
      if (currentUser?.gender === 'bride' || currentUser?.gender === 'groom') {
        setUserGender(currentUser.gender);
      }
      if (currentUser?.isPhoneVerified) {
        setIsCheckoutPhoneVerified(true);
      }
      setCustomAmount(amtFromUrl);
      setPromoCode(promoFromUrl);
      setIsFromApp(sourceFromUrl);

      if (tabFromUrl === 'forgot' || tabFromUrl === 'otp') {
        setActiveTab('forgot_password_otp');
      } else if (tabFromUrl === 'admin' || tabFromUrl === 'sms') {
        setActiveTab('admin_portal');
      }
    }
  }, [currentUser]);

  // Sign in on Website using existing App Login (Mobile Number + MPIN / Password) to buy plan
  const handleWebsiteAppLoginSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppLoginError('');
    setAppLoginFeedback('');
    const cleanPhone = appLoginMobile.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setAppLoginError('कृपया तुमचा १०-अंकी नोंदणीकृत मोबाईल नंबर टाका.');
      return;
    }
    if (!appLoginPassword || appLoginPassword.trim().length < 4) {
      setAppLoginError('कृपया तुमचा ४-अंकी MPIN किंवा पासवर्ड टाका.');
      return;
    }

    setIsSigningInWithAppLogin(true);
    try {
      // 1. Check Server Auth Ledger (/api/auth/login-mpin)
      const resp = await fetch('/api/auth/login-mpin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: cleanPhone,
          phone: cleanPhone,
          mpin: appLoginPassword.trim(),
          password: appLoginPassword.trim(),
        }),
      });
      const data = await resp.json();

      // 2. Also check local/Firestore profiles in AppContext
      const matchedProfile = profiles.find((p) => {
        const pMob = (p.mobile || '').replace(/\D/g, '').slice(-10);
        return pMob === cleanPhone;
      });
      const profilePassValid =
        matchedProfile &&
        verifyPassword(appLoginPassword.trim(), matchedProfile.password || '1234');

      if ((resp.ok && data.success) || profilePassValid) {
        const resolvedName =
          matchedProfile?.fullName || data.user?.fullName || userName || 'सन्माननीय सदस्य';
        const resolvedGender =
          (matchedProfile?.gender as 'groom' | 'bride') ||
          (data.user?.gender as 'groom' | 'bride') ||
          'groom';
        const resolvedId = matchedProfile?.id || `VJ-${cleanPhone.slice(-6)}`;

        setUserMobile(cleanPhone);
        setUserName(resolvedName);
        setUserGender(resolvedGender);
        setUserId(resolvedId);
        setDesiredPassword(appLoginPassword.trim());
        setConfirmDesiredPassword(appLoginPassword.trim());
        setIsAppLoginSignedIn(true);

        if (matchedProfile) {
          setCurrentUser(matchedProfile);
        }

        if (data.token) {
          localStorage.setItem('vanjari_auth_jwt_token', data.token);
          localStorage.setItem('vj_auth_mobile_number', cleanPhone);
        }

        // If already verified in App or Server, mark checkout verified automatically
        const alreadyVerified = Boolean(
          data.user?.is_verified || matchedProfile?.isPhoneVerified
        );
        if (matchedProfile?.email) {
          setCheckoutEmail(matchedProfile.email);
        }
        if (alreadyVerified) {
          setIsCheckoutPhoneVerified(true);
          setAppLoginFeedback(
            `✅ स्वागत आहे, ${resolvedName} (+91 ${cleanPhone})! तुमचे ॲप लॉगिन यशस्वी झाले आहे. खाली तुमचा प्लॅन निवडून थेट पेमेंट करा.`
          );
        } else {
          setIsCheckoutPhoneVerified(false);
          setAppLoginFeedback(
            `✅ स्वागत आहे, ${resolvedName} (+91 ${cleanPhone})! तुमचा प्रोफाईल लोड झाला आहे. खाली १-वेळ ईमेल OTP पडताळणी पूर्ण करून प्लॅन सक्रिय करा.`
          );
        }

        const planSection = document.getElementById('website_plans_selection_section');
        if (planSection) {
          planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        setAppLoginError(
          data.error ||
            'मोबाईल नंबर किंवा MPIN/पासवर्ड जुळला नाही. कृपया तपासा किंवा खाली नवीन बायोडाटा नोंदणी करा.'
        );
      }
    } catch (err: any) {
      setAppLoginError('लॉगिन तपासताना अडचण आली: ' + (err.message || ''));
    } finally {
      setIsSigningInWithAppLogin(false);
    }
  };

  // Load Admin Vault data when Admin is authenticated
  const fetchAdminVaultData = async (token: string) => {
    if (!token) return;
    try {
      const emailRes = await fetch('/api/email/config', {
        headers: { 'x-admin-token': token },
      });
      const { data: emailData } = await safeParseJson(emailRes, '');
      if (emailData?.success && emailData?.config) {
        setEmailOtpConfig((prev) => ({
          ...prev,
          provider: emailData.config.provider || prev.provider || 'gmail',
          isEnabled: emailData.config.isEnabled !== false,
          smtpHost: String(emailData.config.smtpHost || prev.smtpHost || 'smtp.gmail.com'),
          smtpPort: Number(emailData.config.smtpPort || prev.smtpPort || 465),
          smtpSecure: emailData.config.smtpSecure !== false,
          smtpUser: String(emailData.config.smtpUser || ''),
          smtpPass: '',
          hasSmtpPass: Boolean(emailData.config.hasPassword || emailData.config.hasSmtpPass),
          fromEmail: String(emailData.config.fromEmail || ''),
          fromName: String(emailData.config.fromName || 'वंजारी जोडी (Vanjari Jodi)'),
          resendApiKey: '',
          hasResendApiKey: Boolean(emailData.config.hasResendKey || emailData.config.hasResendApiKey),
        }));
      }
    } catch (e) {}

    try {
      const rzpRes = await fetch('/api/razorpay/admin/config', {
        headers: { 'x-admin-token': token },
      });
      const rzpData = await rzpRes.json();
      if (rzpData?.config) {
        setRzpConfig((prev) => ({
          ...prev,
          enabled: rzpData.config.enabled !== false,
          env: rzpData.config.env || 'LIVE',
          keyId: String(rzpData.config.keyId ?? ''),
          secretKey: String(rzpData.config.secretKeyMasked ?? ''),
          hasSecretKey: Boolean(rzpData.config.hasSecretKey),
        }));
      }
    } catch (e) {}

    try {
      const ledRes = await fetch('/api/admin/credentials-ledger', {
        headers: { 'x-admin-token': token },
      });
      const ledData = await ledRes.json();
      if (ledData?.success && Array.isArray(ledData.records)) {
        setLedgerRecords(ledData.records);
      }
    } catch (e) {}

    try {
      const statRes = await fetch('/api/admin/sms-stats', {
        headers: { 'x-admin-token': token },
      });
      const statData = await statRes.json();
      if (statData?.success) {
        setSmsStats((prev) => ({
          todaySent: Number(statData.todaySent ?? 0),
          totalSent: Number(statData.totalSent ?? 0),
          mpinSavedCount: Number(statData.mpinSavedCount ?? 142),
          quotaSettings: {
            mpinZeroSmsAutoLogin: Boolean(
              statData.quotaSettings?.mpinZeroSmsAutoLogin ??
                prev.quotaSettings?.mpinZeroSmsAutoLogin ??
                true
            ),
            maxOtpPer24h: Number(
              statData.quotaSettings?.maxOtpPer24h ?? prev.quotaSettings?.maxOtpPer24h ?? 3
            ),
            cooldownSeconds: Number(
              statData.quotaSettings?.cooldownSeconds ?? prev.quotaSettings?.cooldownSeconds ?? 60
            ),
            dailyGlobalSmsCap: Number(
              statData.quotaSettings?.dailyGlobalSmsCap ??
                prev.quotaSettings?.dailyGlobalSmsCap ??
                200
            ),
            skipSmsForAlreadyVerified: Boolean(
              statData.quotaSettings?.skipSmsForAlreadyVerified ??
                prev.quotaSettings?.skipSmsForAlreadyVerified ??
                true
            ),
          },
          recentLogs: Array.isArray(statData.recentLogs) ? statData.recentLogs : [],
        }));
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminVaultData(adminToken);
    }
  }, [isAdminAuthenticated, adminToken]);

  // Handle Admin Login on Website
  const handleWebsiteAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAdminLoginError('कृपया ॲडमिन युजरनेम आणि पासवर्ड टाका.');
      return;
    }

    setIsLoggingInAdmin(true);
    try {
      const resp = await fetch('/api/admin/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success || !data.token) {
        setAdminLoginError(data.error || 'चुकीचा ॲडमिन युजरनेम किंवा पासवर्ड.');
      } else {
        sessionStorage.setItem('vanjari_admin_session_token', data.token);
        setAdminToken(data.token);
        setAdminDisplayName(data.displayName || 'मुख्य प्रशासक (Super Admin)');
        setAdminPassword('');
        setIsAdminLoggedIn(true);
        fetchAdminVaultData(data.token);
      }
    } catch (err: any) {
      setAdminLoginError('सर्व्हरशी संपर्क होऊ शकला नाही: ' + (err.message || ''));
    } finally {
      setIsLoggingInAdmin(false);
    }
  };

  const handleWebsiteAdminLogout = () => {
    sessionStorage.removeItem('vanjari_admin_session_token');
    setAdminToken('');
    setIsAdminLoggedIn(false);
  };

  // Update a field on a single editable plan in Admin Plans Manager
  const handleEditablePlanChange = (planId: string, field: string, value: any) => {
    setEditablePlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const updated = { ...p, [field]: value };
        if (field === 'contactViews') {
          updated.unlockCount = Number(value) || 0;
        }
        return updated;
      })
    );
  };

  // Add a brand new membership plan from Website Admin Portal
  const handleAddNewAdminPlan = () => {
    if (!newPlanNameMr.trim() || !Number(newPlanPrice)) {
      setPlansFeedback('❌ कृपया नवीन प्लॅनचे मराठी नाव आणि किंमत (₹) टाका.');
      return;
    }
    const cleanId = `plan_${Date.now()}`;
    const priceNum = Math.max(1, Number(newPlanPrice) || 398);
    const contactsNum = Math.max(1, Number(newPlanContacts) || 100);
    const monthsNum = Math.max(1, Number(newPlanMonths) || 6);
    const createdPlan = {
      id: cleanId as any,
      name: newPlanNameEn.trim() || newPlanNameMr.trim(),
      nameMr: newPlanNameMr.trim(),
      price: priceNum,
      originalPrice: Math.round(priceNum * 2),
      duration: newPlanDuration.trim() || `${monthsNum} महिने`,
      durationMonths: monthsNum,
      features: [
        `दरमहा ${contactsNum} बायोडाटा मोबाईल नंबर पाहता येतील`,
        'थेट व्हॉट्सॲप व कॉल सुविधा उपलब्ध',
        'व्हेरिफाईड मेंबर बॅज आणि प्राधान्य सपोर्ट',
      ],
      contactViews: contactsNum,
      unlockCount: contactsNum,
      popular: false,
      color: 'from-[#800C1E] to-[#A71930]',
      badgeText: newPlanBadge.trim() || '✨ नवीन प्लॅन',
      isActive: true,
    };

    const nextPlans = [...editablePlans, createdPlan];
    setEditablePlans(nextPlans);
    setNewPlanNameMr('');
    setNewPlanNameEn('');
    setShowAddPlanForm(false);
    setPlansFeedback('✅ नवीन प्लॅन यादीत जोडला गेला! आता खालील "सर्व प्लॅन्स व किमती सेव्ह करा" बटनावर क्लिक करा.');
  };

  // Delete a custom plan
  const handleDeleteAdminPlan = (planId: string) => {
    if (planId === 'welcome_offer') {
      setPlansFeedback('⚠️ मुख्य वेलकम ऑफर प्लॅन डिलीट करता येत नाही; तुम्ही त्याची किंमत बदलू शकता किंवा तो निष्क्रिय (Hide) करू शकता.');
      return;
    }
    setEditablePlans((prev) => prev.filter((p) => p.id !== planId));
    setPlansFeedback('ℹ️ प्लॅन काढून टाकला. बदल कायम करण्यासाठी "सर्व प्लॅन्स व किमती सेव्ह करा" दाबा.');
  };

  // Save all edited plans to Context + Firebase Firestore + Server Razorpay Vault
  const handleSaveAdminPlans = async () => {
    setIsSavingPlans(true);
    setPlansFeedback('');
    try {
      const sanitizedPlans = editablePlans.map((p) => ({
        ...p,
        price: Math.max(1, Number(p.price) || 1),
        contactViews: Math.max(0, Number(p.contactViews ?? p.unlockCount ?? 50)),
        unlockCount: Math.max(0, Number(p.contactViews ?? p.unlockCount ?? 50)),
        durationMonths: Math.max(1, Number(p.durationMonths) || 6),
        isActive: p.isActive !== false,
      }));

      // 1. Save in AppContext + localStorage + Firebase Firestore ('settings/plans_config')
      if (typeof saveAllPlans === 'function') {
        saveAllPlans(sanitizedPlans);
      } else {
        sanitizedPlans.forEach((p) => updatePlan(p));
      }

      // 2. Save in Backend Server Vault so Razorpay orders use the updated prices
      await fetch('/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ plans: sanitizedPlans }),
      });

      setPlansFeedback('✅ सर्व मेंबरशिप प्लॅन्स आणि नवीन किमती वेबसाईट, सर्व्हर आणि फायरबेसवर यशस्वीरित्या सेव्ह झाल्या आहेत!');
      addNotification({
        title: 'प्लॅन्स अपडेट झाले',
        message: 'वेबसाईट ॲडमिन पोर्टलवरून मेंबरशिप प्लॅन्स व किमती अपडेट करण्यात आल्या.',
        type: 'system',
      });
    } catch (err: any) {
      setPlansFeedback('❌ प्लॅन्स सेव्ह करताना त्रुटी: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingPlans(false);
    }
  };

  // Save Separate Website & Android App Settings + Full Word-by-Word Website CMS
  const handleSaveWebAndAppSettings = () => {
    updateSiteConfig({
      heroHeading: webHeroTitle.trim(),
      heroTitle: webHeroTitle.trim(),
      logoSubtitle: webSubtitle.trim(),
      contactPhone: webSupportPhone.trim(),
      helplineNumber: webSupportPhone.trim(),
      contactWhatsapp: webWhatsappNum.trim(),
      whatsappNumber: webWhatsappNum.trim(),
      apkDownloadUrl: webApkUrl.trim(),
      promoBannerText: webOfferBannerText.trim(),
      topBarText: appTopMarqueeText.trim(),
      marqueeText: appTopMarqueeText.trim(),
      tickerText: appWelcomeNewUserText.trim(),
      noticeText: appWelcomeNewUserText.trim(),
      guestBrowseLimit: Number(appGuestPreviewLimit) || 50,
      websiteCms: webCms,
    });
    setSettingsSavedMsg(
      '✅ वेबसाईटवरील प्रत्येक शब्द (Word-by-Word), विभाग आणि ॲप सेटिंग्ज फायरबेसवर रिअल-टाईम सेव्ह झाले आहेत!'
    );
    setTimeout(() => setSettingsSavedMsg(''), 6000);
  };

  // Banner Photo Upload with Auto Compression
  const handleBannerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBannerPhoto(true);
      setAdBannerFeedback('');
      // Compress to optimal web dimensions (max 1280px, quality 0.82)
      const compressedResult = await compressAndResizeImage(file, 1280, 1280, 0.82);
      setAdBannerImageUrl(compressedResult.dataUrl);
      setAdBannerMode('custom_image');
      setAdBannerFeedback('✅ जाहिरातीचा फोटो यशस्वीरीत्या लोड झाला! खालील "सेव्ह करा" बटणावर क्लिक करा.');
    } catch (err: any) {
      setAdBannerFeedback(`❌ फोटो अपलोड अयशस्वी: ${err?.message || 'अज्ञात त्रुटी'}`);
    } finally {
      setIsUploadingBannerPhoto(false);
    }
  };

  // Save Website Advertisement Banner Configuration
  const handleSaveAdBanner = async () => {
    setIsSavingAdBanner(true);
    setAdBannerFeedback('');
    try {
      const bannerPayload: WebsiteAdBannerConfig = {
        enabled: adBannerEnabled,
        mode: adBannerMode,
        imageUrl: adBannerImageUrl,
        imageOrientation: adBannerOrientation,
        title: adBannerTitle.trim(),
        subtitle: adBannerSubtitle.trim(),
        badgeText: adBannerBadge.trim(),
        ctaText: adBannerCtaText.trim(),
        ctaAction: adBannerCtaAction,
        targetUrl: adBannerTargetUrl.trim(),
      };

      updateSiteConfig({
        websiteAdBanner: bannerPayload,
      });

      setAdBannerFeedback('✅ जाहिरात व बॅनर सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या! वेबसाईटवर त्वरित बदल दिसून येतील.');
      setTimeout(() => setAdBannerFeedback(''), 5000);
    } catch (err: any) {
      setAdBannerFeedback(`❌ सेव्ह करताना त्रुटी आली: ${err?.message || 'अज्ञात एरर'}`);
    } finally {
      setIsSavingAdBanner(false);
    }
  };

  // Banner CTA Action Handler
  const handleAdBannerCtaClick = () => {
    const action = siteConfig?.websiteAdBanner?.ctaAction || adBannerCtaAction || 'scroll_to_plans';
    if (action === 'scroll_to_plans') {
      const el = document.getElementById('website_plans_selection_section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (action === 'open_whatsapp') {
      const phone = siteConfig?.whatsappNumber || siteConfig?.contactWhatsapp || '919822000000';
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const finalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent('नमस्ते, मला वंजारी जोडी वधू-वर सूचक संदर्भात माहिती हवी आहे.')}`, '_blank');
    } else if (action === 'call_support') {
      const phone = siteConfig?.helplineNumber || siteConfig?.contactPhone || '9822000000';
      window.location.href = `tel:${phone}`;
    } else if (action === 'download_apk') {
      handleDownloadApk();
    } else if (action === 'custom_url') {
      const url = siteConfig?.websiteAdBanner?.targetUrl || adBannerTargetUrl;
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  // Send Lock-Screen Push Notification Broadcast to All App Users
  const handleSendAdminPushBroadcast = async () => {
    if (!pushTitleInput.trim() || !pushBodyInput.trim()) return;
    setIsSendingPushBroadcast(true);
    setPushBroadcastFeedback('');
    try {
      if (typeof sendPushNotification === 'function') {
        sendPushNotification('all', pushTitleInput.trim(), pushBodyInput.trim());
      }
      await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: 'all',
          titleMr: pushTitleInput.trim(),
          messageMr: pushBodyInput.trim(),
          type: 'system',
        }),
      });
      setPushBroadcastFeedback(
        '🔔 सर्व मोबाईल युजर्सना (फोन लॉक असताना सुद्धा) पुश नोटीफिकेशन यशस्वीरित्या पाठवले गेले!'
      );
    } catch (err: any) {
      setPushBroadcastFeedback('त्रुटी: ' + (err.message || 'Failed'));
    } finally {
      setIsSendingPushBroadcast(false);
    }
  };

  // Grant Free Membership Plan to Any Member (Unpaid / Existing / New)
  const handleAdminGrantFreePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = freeGrantMobile.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setFreeGrantFeedback('❌ कृपया अचूक १० अंकी मोबाईल नंबर टाका.');
      return;
    }
    setIsGrantingFreePlan(true);
    setFreeGrantFeedback('');
    try {
      const mpinRaw = freeGrantMpin.trim() || '1234';
      const hashedPass = hashPassword(mpinRaw);
      const nowIso = new Date().toISOString();
      const expIso = new Date(
        Date.now() + (Number(freeGrantDurationDays) || 180) * 24 * 60 * 60 * 1000
      ).toISOString();

      // 1. Update in Server Credentials Ledger
      const resp = await fetch('/api/admin/grant-free-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          mobile: cleanPhone,
          passwordHash: hashedPass,
          fullName: freeGrantName.trim() || 'सन्माननीय सदस्य',
          gender: freeGrantGender,
          planId: 'welcome_offer',
          planName: `🎁 ॲडमिन मोफत मेंबरशिप (${freeGrantDurationDays} दिवस)`,
          durationDays: freeGrantDurationDays,
          sendSms: freeGrantSendSms,
        }),
      });
      const data = await resp.json();

      // 2. Update Profile in AppContext & Firebase Firestore
      const matchedProfile = profiles.find(
        (p) => (p.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone
      );
      const targetId = matchedProfile?.id || `VJ-${cleanPhone.slice(-6)}`;
      const profileUpdates: Record<string, any> = {
        mobile: `+91 ${cleanPhone}`,
        password: hashedPass,
        hasPaidMembership: true,
        isFreeAdminPlan: true,
        freePlanGrantedAt: nowIso,
        freePlanGrantedBy: adminDisplayName,
        isPremium: true,
        isVerified: true,
        isApproved: true,
        membership: 'gold',
        membershipPlanName: `🎁 ॲडमिन मोफत प्लॅन (${freeGrantDurationDays} दिवस)`,
        premiumActivatedAt: nowIso,
        premiumExpiresAt: expIso,
        membershipExpiryDate: expIso,
        isPlanExpired: false,
      };
      if (freeGrantName.trim()) {
        profileUpdates.fullName = freeGrantName.trim();
      }
      if (matchedProfile && typeof updateProfileDirect === 'function') {
        updateProfileDirect(matchedProfile.id, profileUpdates);
      }
      syncDocToFirestore('profiles', targetId, {
        id: targetId,
        fullName: freeGrantName.trim() || matchedProfile?.fullName || 'सन्माननीय सदस्य',
        gender: freeGrantGender || matchedProfile?.gender || 'groom',
        ...profileUpdates,
      });

      fetchAdminVaultData(adminToken);
      setFreeGrantFeedback(
        data?.message ||
          `🎁 यशस्वी! +91 ${cleanPhone} यांना मोफत मेंबरशिप प्लॅन व ॲप फुल-ॲक्सेस दिला गेला आहे (MPIN/Pass: ${mpinRaw}).`
      );
    } catch (err: any) {
      setFreeGrantFeedback('❌ त्रुटी: ' + (err.message || 'Failed'));
    } finally {
      setIsGrantingFreePlan(false);
    }
  };

  // Quick Add New Profile Directly by Admin (Tagged with isRegisteredByAdmin: true)
  const handleAdminCreateDirectProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedAdminProfileConsent) {
      setAdmProfFeedback('❌ कृपया १-लाईन संमती चेकबॉक्स टिक करा.');
      return;
    }
    const cleanPhone = admProfMobile.replace(/\D/g, '').slice(-10);
    if (!admProfName.trim() || cleanPhone.length !== 10) {
      setAdmProfFeedback('❌ कृपया उमेदवाराचे पूर्ण नाव आणि १० अंकी मोबाईल नंबर टाका.');
      return;
    }
    const birthYear = Number((admProfDob || '1999-01-01').split('-')[0]) || 1999;
    const calcAge = Math.max(18, new Date().getFullYear() - birthYear);
    const newId = `VJ-ADM-${Date.now().toString().slice(-5)}`;
    const nowIso = new Date().toISOString();
    const defaultImg =
      admProfGender === 'bride'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600';
    const finalPhoto = admProfPhotoUrl.trim() || defaultImg;

    const newProfileObj: any = {
      id: newId,
      fullName: admProfName.trim(),
      gender: admProfGender,
      dob: admProfDob,
      age: calcAge,
      height: admProfHeight,
      maritalStatus: 'never_married',
      subCaste: 'वंजारी (NT-D)',
      gotra: admProfGotra.trim(),
      mamaName: admProfMama.trim(),
      education: admProfEducation.trim(),
      occupation: admProfOccupation.trim(),
      income: admProfIncome.trim(),
      district: admProfDistrict,
      taluka: admProfCity.trim(),
      city: admProfCity.trim(),
      mobile: `+91 ${cleanPhone}`,
      photoUrl: finalPhoto,
      photos: [finalPhoto],
      isVerified: true,
      aadhaarVerified: true,
      isApproved: true,
      isFeatured: false,
      isRegisteredByAdmin: true,
      registrationType: 'admin_direct',
      hasPaidMembership: admProfIsFreePlan,
      isFreeAdminPlan: admProfIsFreePlan,
      membership: admProfIsFreePlan ? 'gold' : 'free',
      membershipPlanName: admProfIsFreePlan ? '🎁 ॲडमिन मोफत मेंबरशिप' : 'फ्री',
      createdAt: nowIso,
      lastActive: nowIso,
      privacy: {
        hideContact: false,
        hidePhoto: false,
        restrictDetails: false,
      },
    };

    if (typeof addProfile === 'function') {
      addProfile(newProfileObj);
    }
    syncDocToFirestore('profiles', newId, newProfileObj);

    setAdmProfName('');
    setAdmProfMobile('');
    setAdmProfPhotoUrl('');
    setAdmProfFeedback(
      `✅ "${newProfileObj.fullName}" (${newId}) हा बायोडाटा '🛡️ ॲडमिनने भरलेला प्रोफाईल' म्हणून यशस्वीरित्या जोडला गेला! (हा बॅज फक्त ॲडमिनलाच दिसेल).`
    );
  };

  // Send Custom or Template SMS from Admin Panel
  const handleAdminSendCustomSms = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = customSmsPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10 || !customSmsText.trim()) {
      setCustomSmsFeedback('❌ कृपया १०-अंकी मोबाईल नंबर आणि मेसेज टाका.');
      return;
    }
    setIsSendingCustomSms(true);
    setCustomSmsFeedback('');
    try {
      const resp = await fetch('/api/admin/send-custom-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          mobile: cleanPhone,
          memberName: customSmsMemberName.trim() || 'सदस्य',
          category: customSmsCategory,
          message: customSmsText.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setCustomSmsFeedback('❌ ' + (data.error || 'SMS पाठवता आला नाही.'));
      } else {
        setCustomSmsFeedback(data.message);
        fetchAdminVaultData(adminToken);
      }
    } catch (err: any) {
      setCustomSmsFeedback('❌ त्रुटी: ' + (err.message || 'Network error'));
    } finally {
      setIsSendingCustomSms(false);
    }
  };

  // Save SMS Quota Saver Settings
  const handleSaveSmsQuotaSettings = async () => {
    setIsSavingQuotaSettings(true);
    try {
      const resp = await fetch('/api/admin/sms-quota-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify(smsStats.quotaSettings),
      });
      const data = await resp.json();
      if (data?.success) {
        setCustomSmsFeedback(data.message);
      }
    } catch (e) {
    } finally {
      setIsSavingQuotaSettings(false);
    }
  };

  // Merge profiles with server ledgerRecords so any member who paid on website or received a free plan is 100% visible
  const allUnifiedProfiles = React.useMemo(() => {
    const ledgerByPhone = new Map<string, any>();
    (ledgerRecords || []).forEach((rec) => {
      const ph = String(rec?.loginId || rec?.mobile || '').replace(/\D/g, '').slice(-10);
      if (ph.length === 10) {
        ledgerByPhone.set(ph, rec);
      }
    });

    const seenPhones = new Set<string>();
    const enriched = (profiles || []).map((p) => {
      const ph = String(p?.mobile || '').replace(/\D/g, '').slice(-10);
      if (ph.length === 10) seenPhones.add(ph);
      const ledgerRec = ph.length === 10 ? ledgerByPhone.get(ph) : null;
      if (ledgerRec) {
        return {
          ...p,
          hasPaidMembership: ledgerRec.isFreeAdminPlan ? false : true,
          isFreeAdminPlan: Boolean(p.isFreeAdminPlan || ledgerRec.isFreeAdminPlan),
          membership: p.membership && p.membership !== 'free' ? p.membership : (ledgerRec.planId || 'welcome_offer'),
          paymentPlanName: p.paymentPlanName || ledgerRec.planName,
        };
      }
      return p;
    });

    // Also include any ledger records that don't yet have a full profile in profiles
    ledgerByPhone.forEach((rec, ph) => {
      if (!seenPhones.has(ph)) {
        enriched.unshift({
          id: `VJ-WEB-${ph.slice(-4)}`,
          fullName: rec.fullName || 'वेबसाईट नोंदणीकृत सदस्य',
          gender: rec.gender === 'bride' ? 'bride' : 'groom',
          dob: '',
          age: 26,
          mobile: `+91 ${ph}`,
          email: '',
          district: 'महाराष्ट्र',
          taluka: '',
          city: '',
          education: '-',
          occupation: '-',
          income: '',
          height: '-',
          weight: '',
          bloodGroup: '',
          maritalStatus: 'never_married',
          religion: 'हिंदू (Hindu)',
          subCaste: 'वंजारी',
          fatherOccupation: '',
          motherOccupation: '',
          brothers: 0,
          sisters: 0,
          familyType: '',
          expectations: '',
          photos: [],
          aadhaarVerified: false,
          isVerified: true,
          isFeatured: false,
          isApproved: true,
          membership: (rec.planId || 'welcome_offer') as any,
          hasPaidMembership: !rec.isFreeAdminPlan,
          isFreeAdminPlan: Boolean(rec.isFreeAdminPlan),
          paymentPlanName: rec.planName || 'वेबसाईट पेड प्लॅन',
          createdAt: rec.updatedAt || new Date().toISOString(),
          lastActive: 'वेबसाईटवर ॲक्टिव्हेट',
          bio: '',
          privacy: { hideContact: false, hidePhoto: false },
        });
      }
    });

    return enriched;
  }, [profiles, ledgerRecords]);

  // Computed Member Counts & Filtered Profiles for Admin Directory
  const paidProfilesList = allUnifiedProfiles.filter((p) => getMemberPaymentStatusInfo(p).isPaid);
  const freeGrantedProfilesList = allUnifiedProfiles.filter((p) => getMemberPaymentStatusInfo(p).isFreeGranted);
  const unpaidProfilesList = allUnifiedProfiles.filter((p) => getMemberPaymentStatusInfo(p).isUnpaid);
  const adminAddedProfilesList = allUnifiedProfiles.filter(
    (p) => Boolean(p.isRegisteredByAdmin || p.registrationType === 'admin_direct')
  );

  const filteredAdminProfiles = allUnifiedProfiles
    .filter((p) => {
      const st = getMemberPaymentStatusInfo(p);
      if (memberFilterTab === 'paid') return st.isPaid;
      if (memberFilterTab === 'free_granted') return st.isFreeGranted;
      if (memberFilterTab === 'unpaid') return st.isUnpaid;
      if (memberFilterTab === 'admin_added')
        return Boolean(p.isRegisteredByAdmin || p.registrationType === 'admin_direct');
      return true;
    })
    .filter((p) => {
      if (!memberSearchQuery.trim()) return true;
      const q = memberSearchQuery.toLowerCase();
      return (
        (p.fullName || '').toLowerCase().includes(q) ||
        (p.mobile || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.district || '').toLowerCase().includes(q)
      );
    });

  // Find target plan
  const targetPlan =
    plansList.find((p) => p.id === selectedPlanId) ||
    plansList.find((p) => p.id === 'welcome_offer') ||
    plansList[0] || {
      id: 'welcome_offer',
      name: 'Welcome Offer Plan',
      nameMr: '🔥 वेलकम ऑफर प्लॅन',
      price: 398,
      duration: '६ महिने (180 दिवस)',
      contactViews: 100,
    };

  const basePlanAmount = customAmount || targetPlan.price || 398;
  const finalAmount = appliedPromo ? appliedPromo.finalAmount : basePlanAmount;

  // Apply or re-validate Promo Code on Website Checkout
  const handleApplyCheckoutPromoCode = (codeOverride?: string) => {
    setPromoFeedbackError('');
    const clean = (codeOverride !== undefined ? codeOverride : promoCode).toUpperCase().trim();
    if (!clean) {
      setPromoFeedbackError('कृपया आधी प्रोमो कोड टाका.');
      return;
    }
    setPromoCode(clean);
    const res = validatePromoCode(clean, basePlanAmount);
    if (!res.valid) {
      setAppliedPromo(null);
      setPromoFeedbackError(res.message || 'अवैध किंवा कालबाह्य प्रोमो कोड.');
    } else {
      setAppliedPromo({
        code: clean,
        discountAmount: res.discountAmount,
        finalAmount: res.finalAmount,
        isVipFree: Boolean(res.isVipFree || res.finalAmount <= 0),
        message: res.message,
        customValidityDays: res.promo?.customValidityDays,
      });
      setPromoFeedbackError('');
    }
  };

  const handleRemoveCheckoutPromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoFeedbackError('');
  };

  // Auto-recalculate applied promo if user switches plan
  useEffect(() => {
    if (appliedPromo?.code) {
      const res = validatePromoCode(appliedPromo.code, basePlanAmount);
      if (res.valid) {
        setAppliedPromo({
          code: appliedPromo.code,
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
          isVipFree: Boolean(res.isVipFree || res.finalAmount <= 0),
          message: res.message,
          customValidityDays: res.promo?.customValidityDays,
        });
      }
    }
  }, [selectedPlanId, basePlanAmount]);

  // Auto-apply promo from URL query (?promo=CODE)
  useEffect(() => {
    if (promoCode && !appliedPromo && promoCodes.length > 0) {
      const clean = promoCode.toUpperCase().trim();
      const res = validatePromoCode(clean, basePlanAmount);
      if (res.valid) {
        setAppliedPromo({
          code: clean,
          discountAmount: res.discountAmount,
          finalAmount: res.finalAmount,
          isVipFree: Boolean(res.isVipFree || res.finalAmount <= 0),
          message: res.message,
          customValidityDays: res.promo?.customValidityDays,
        });
      }
    }
  }, [promoCodes.length]);

  // Generate Random Promo Code in Website Admin
  const handleGenerateRandomPromoCode = (prefix = 'VJ') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `${prefix}${suffix}`;
    setNewPromoCodeStr(generated);
  };

  // Create New Promo Code from Website Admin Portal
  const handleAdminCreatePromoCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminPromoFeedback('');
    const cleanCode = newPromoCodeStr.toUpperCase().replace(/[^A-Z0-9_-]/g, '').trim();
    if (!cleanCode || cleanCode.length < 3) {
      setAdminPromoFeedback('❌ कृपया किमान ३ अक्षरांचा प्रोमो कोड टाका (उदा. VIPFREE100 किंवा VANJARI50).');
      return;
    }

    const numericVal =
      newPromoType === 'vip_free'
        ? 100
        : newPromoType === 'special_price'
        ? Math.max(1, Number(newPromoTargetPrice) || 199)
        : Math.max(1, Number(newPromoVal) || 50);

    addPromoCode({
      code: cleanCode,
      discountType: newPromoType,
      discountValue: numericVal,
      targetPrice: newPromoType === 'special_price' ? Math.max(1, Number(newPromoTargetPrice) || 199) : undefined,
      customValidityDays: Number(newPromoValidityDays) || 180,
      maxUses: Math.max(1, Number(newPromoMaxUses) || 100),
      isActive: true,
      showInBanner: newPromoShowBanner,
      isSecret: !newPromoShowBanner,
      description: newPromoDesc.trim() || 'वंजारी जोडी विशेष सवलत कूपन',
    });

    setAdminPromoFeedback(
      `✅ '${cleanCode}' हा नवीन प्रोमो कोड यशस्वीरित्या तयार झाला व क्लाउडवर सेव्ह झाला! आता तुम्ही हा कोड सदस्याला WhatsApp किंवा SMS ने पाठवू शकता.`
    );
    setNewPromoCodeStr('');
  };

  // Save Login ID (Mobile) & Password to Profile + Firebase Firestore + Server Ledger
  const saveMemberLoginIdAndPassword = async (
    targetMobile: string,
    rawPassword: string,
    memberName: string,
    memberGender: 'groom' | 'bride',
    isPaidActivation: boolean
  ): Promise<boolean> => {
    const cleanPhone = targetMobile.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10 || !rawPassword || rawPassword.trim().length < 4) {
      return false;
    }

    const hashedPassword = hashPassword(rawPassword.trim());
    const nowIso = new Date().toISOString();
    const expDays = appliedPromo?.customValidityDays || (targetPlan as any).validityDays || 180;
    const expiresIso = new Date(Date.now() + expDays * 24 * 60 * 60 * 1000).toISOString();

    // 1. Save on Server Credentials Ledger & trigger confirmation SMS if configured
    try {
      await fetch('/api/auth/set-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanPhone,
          passwordHash: hashedPassword,
          fullName: memberName || 'सन्माननीय सदस्य',
          gender: memberGender,
          planId: targetPlan.id,
          planName: targetPlan.nameMr || targetPlan.name,
          sendSms: isPaidActivation,
        }),
      });
    } catch (e) {
      console.warn('[WebPaymentPage] Server set-credentials warning:', e);
    }

    // 2. Update existing profile in AppContext & Firebase Firestore if present
    const existingProfile = profiles.find((p) => {
      const pMob = (p.mobile || '').replace(/\D/g, '').slice(-10);
      return pMob === cleanPhone || (userId && p.id === userId);
    });

    const targetProfileId = existingProfile?.id || userId || `VJ-${cleanPhone.slice(-6)}`;

    const updatePayload: Record<string, any> = {
      password: hashedPassword,
      mobile: `+91 ${cleanPhone}`,
      isPhoneVerified: true,
      isApproved: true,
    };

    if (memberName && memberName.trim()) {
      updatePayload.fullName = memberName.trim();
    }

    if (isPaidActivation) {
      updatePayload.hasPaidMembership = true;
      updatePayload.isPremium = true;
      updatePayload.isVerified = true;
      updatePayload.membership = (targetPlan.id || 'gold').toLowerCase();
      updatePayload.membershipPlan = targetPlan.nameMr || targetPlan.name;
      updatePayload.premiumActivatedAt = nowIso;
      updatePayload.premiumExpiresAt = expiresIso;
      updatePayload.membershipExpiryDate = expiresIso;
      updatePayload.isPlanExpired = false;
      updatePayload.paidAt = nowIso;
    }

    if (existingProfile && typeof updateProfileDirect === 'function') {
      updateProfileDirect(existingProfile.id, updatePayload);
    }

    syncDocToFirestore('profiles', targetProfileId, {
      id: targetProfileId,
      fullName: memberName || existingProfile?.fullName || 'सन्माननीय सदस्य',
      gender: memberGender || existingProfile?.gender || 'groom',
    });
    return true;
  };

  // Cooldown countdown for checkout OTP
  useEffect(() => {
    if (checkoutOtpCooldown <= 0) return;
    const timer = setInterval(() => {
      setCheckoutOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [checkoutOtpCooldown]);

  // Mandatory Plan Activation: Send Email OTP
  const handleSendCheckoutOtp = async () => {
    setCheckoutOtpError('');
    setCheckoutOtpSuccess('');
    const cleanPhone = userMobile.replace(/\D/g, '').slice(-10);
    const cleanEmail = checkoutEmail.trim().toLowerCase();
    if (cleanPhone.length !== 10) {
      setCheckoutOtpError('कृपया आधी अचूक १० अंकी मोबाईल नंबर टाका.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setCheckoutOtpError('कृपया ४-अंकी OTP मिळवण्यासाठी तुमचा अचूक ईमेल आयडी (Email ID) टाका.');
      return;
    }

    setIsSendingCheckoutOtp(true);
    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: cleanPhone,
          phone: cleanPhone,
          email: cleanEmail,
          purpose: 'plan_activation',
          deviceFingerprint: getDeviceFingerprint(),
        }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP पाठवताना अडचण आली.');
      if (!resp.ok || !data?.success) {
        if (data?.cooldownSeconds) {
          setCheckoutOtpCooldown(Number(data.cooldownSeconds));
        }
        setCheckoutOtpError(
          data?.error ||
            'तुम्ही २४ तासांत जास्तीत जास्त ५ वेळाच ईमेल OTP पाठवू शकता.'
        );
      } else {
        setCheckoutOtpSent(true);
        setCheckoutOtpCooldown(data.cooldownSeconds || 60);
        setCheckoutOtpSuccess(data.message || `४-अंकी OTP तुमच्या ${cleanEmail} या ईमेलवर पाठवला आहे.`);
      }
    } catch (err: any) {
      setCheckoutOtpError('सर्व्हरशी संपर्क होऊ शकला नाही: ' + (err.message || ''));
    } finally {
      setIsSendingCheckoutOtp(false);
    }
  };

  // Mandatory Plan Activation: Verify Email OTP
  const handleVerifyCheckoutOtp = async () => {
    setCheckoutOtpError('');
    setCheckoutOtpSuccess('');
    const cleanPhone = userMobile.replace(/\D/g, '').slice(-10);
    const cleanEmail = checkoutEmail.trim().toLowerCase();
    if (cleanPhone.length !== 10) {
      setCheckoutOtpError('कृपया १० अंकी मोबाईल नंबर टाका.');
      return;
    }
    if (!checkoutOtpCode || checkoutOtpCode.trim().length !== 4) {
      setCheckoutOtpError('कृपया ईमेलवर आलेला ४-अंकी OTP कोड टाका.');
      return;
    }

    setIsVerifyingCheckoutOtp(true);
    try {
      const cleanMpin = desiredPassword.replace(/\D/g, '').slice(0, 4);
      const resp = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: cleanPhone,
          phone: cleanPhone,
          email: cleanEmail,
          otp: checkoutOtpCode.trim(),
          mpin: cleanMpin.length === 4 ? cleanMpin : undefined,
        }),
      });
      const { data } = await safeParseJson(resp, 'OTP पडताळणी करताना त्रुटी आली.');
      if (!resp.ok || !data?.success) {
        setCheckoutOtpError(data?.error || 'चुकीचा OTP! कृपया तपासून पुन्हा प्रयत्न करा.');
      } else {
        setIsCheckoutPhoneVerified(true);
        setCheckoutOtpSuccess('✅ अभिनंदन! तुमचे खाते ईमेल OTP द्वारे यशस्वीरित्या व्हेरिफाय झाले आहे.');
        if (data.token) {
          localStorage.setItem('vanjari_auth_jwt_token', data.token);
          localStorage.setItem('vj_auth_mobile_number', cleanPhone);
        }
      }
    } catch (err: any) {
      setCheckoutOtpError('OTP पडताळणी करताना त्रुटी आली: ' + (err.message || ''));
    } finally {
      setIsVerifyingCheckoutOtp(false);
    }
  };

  // 1-Click Google Verification for Checkout (Zero OTP needed)
  const handleCheckoutGoogleVerify = async () => {
    setCheckoutOtpError('');
    setCheckoutOtpSuccess('');
    const cleanPhone = userMobile.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setCheckoutOtpError('कृपया आधी अचूक १० अंकी मोबाईल नंबर (Login ID) टाका.');
      return;
    }

    setIsGoogleVerifyingCheckout(true);
    try {
      const cleanMpin = desiredPassword.replace(/\D/g, '').slice(0, 4);
      const gRes = await signInWithGoogleVerified({
        mobileNumber: cleanPhone,
        mpin: cleanMpin.length === 4 ? cleanMpin : undefined,
      });
      if (!gRes.success || !gRes.email) {
        setCheckoutOtpError(gRes.error || 'Google पडताळणी पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.');
        return;
      }
      setCheckoutEmail(gRes.email);
      if (!userName.trim() && gRes.displayName) {
        setUserName(gRes.displayName);
      }
      setIsCheckoutPhoneVerified(true);
      setCheckoutOtpSuccess(`✅ अभिनंदन! तुमचे खाते Google (${gRes.email}) द्वारे १-क्लिकने व्हेरिफाय झाले आहे.`);
      if (gRes.token) {
        localStorage.setItem('vanjari_auth_jwt_token', gRes.token);
        localStorage.setItem('vj_auth_mobile_number', cleanPhone);
      }
    } catch (err: any) {
      setCheckoutOtpError('Google पडताळणी करताना त्रुटी आली: ' + (err?.message || ''));
    } finally {
      setIsGoogleVerifyingCheckout(false);
    }
  };

  // Step 1: Pay with Razorpay (or 100% Free VIP Promo Code Instant Activation)
  const handlePayWithRazorpay = async () => {
    setPaymentError(null);
    const cleanPhone = userMobile.replace(/\D/g, '').slice(-10);

    if (!isCheckoutPhoneVerified) {
      setPaymentError('सुरक्षा सूचना: प्लॅन सक्रिय करण्यापूर्वी कृपया खालील "गुगलने १-क्लिक पडताळणी करा" बटनावर क्लिक करून तुमचे खाते पडताळा.');
      const otpSection = document.getElementById('checkout_otp_verification_section');
      if (otpSection) otpSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!userName || userName.trim().length < 2) {
      setPaymentError('कृपया आपले पूर्ण नाव टाका.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setPaymentError('कृपया अचूक १० अंकी मोबाईल नंबर टाका (हाच तुमचा Login ID असेल).');
      return;
    }
    if (desiredPassword && desiredPassword.trim().length > 0 && desiredPassword.trim().length < 4) {
      setPaymentError('पासवर्ड किमान ४ अक्षरे किंवा अंकांचा असावा.');
      return;
    }
    if (desiredPassword && confirmDesiredPassword && desiredPassword !== confirmDesiredPassword) {
      setPaymentError('दोन्ही पासवर्ड जुळत नाहीत. कृपया सारखाच पासवर्ड टाका.');
      return;
    }

    // Check if 100% Free VIP Promo Code is applied (₹0 Payable)
    if (appliedPromo && (appliedPromo.isVipFree || finalAmount <= 0)) {
      setIsLoading(true);
      try {
        usePromoCode(appliedPromo.code);
        const promoReceiptId = `VIP-${appliedPromo.code}-${Date.now().toString().slice(-5)}`;
        setApprovedDetails({
          paymentId: promoReceiptId,
          orderId: promoReceiptId,
          promoCode: appliedPromo.code,
        });

        addPaymentRequest({
          userId: userId || `VJ-${cleanPhone.slice(-6)}`,
          userName: userName.trim(),
          userMobile: cleanPhone,
          planId: targetPlan.id as any,
          planName: `${targetPlan.nameMr || targetPlan.name} (Promo: ${appliedPromo.code})`,
          amount: 0,
          utrNumber: promoReceiptId,
          screenshotUrl: '',
          paymentMethod: 'promo_vip_free',
          adminNote: `100% Free VIP Promo Code Applied: ${appliedPromo.code}`,
        });

        if (userId && typeof updateMemberTier === 'function') {
          updateMemberTier(userId, targetPlan.id as any);
        }

        const passToSave = desiredPassword && desiredPassword.trim().length >= 4 ? desiredPassword.trim() : '1234';
        setIsSavingCredentials(true);
        await saveMemberLoginIdAndPassword(cleanPhone, passToSave, userName.trim(), userGender, true);
        setIsSavingCredentials(false);
        setIsCredentialsSaved(true);
        setCredentialsMessage(`✅ '${appliedPromo.code}' प्रोमो कोडद्वारे तुमचे खाते ₹० मध्ये सक्रिय झाले असून लॉगिन आयडी व पासवर्ड सेट झाला आहे!`);
        setPaymentSuccess(true);

        if (addNotification) {
          addNotification({
            userId: userId || `VJ-${cleanPhone.slice(-6)}`,
            title: '🎉 VIP प्रोमो कोडने मेंबरशिप सक्रिय!',
            titleMr: '🎉 VIP प्रोमो कोडने मेंबरशिप सक्रिय!',
            message: `'${appliedPromo.code}' कूपनने तुमचा प्लॅन ₹० मध्ये सुरू झाला आहे!`,
            messageMr: `'${appliedPromo.code}' कूपनने तुमचा प्लॅन ₹० मध्ये सुरू झाला आहे!`,
            type: 'approval',
          });
        }
      } catch (err: any) {
        setPaymentError(err?.message || 'प्रोमो कोड लागू करताना अडचण आली.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      await initiateRazorpayPayment({
        planId: targetPlan.id,
        planName: targetPlan.nameMr || targetPlan.name,
        amount: finalAmount,
        userId: userId || `VJ-${cleanPhone.slice(-6)}`,
        userName: userName.trim(),
        userMobile: cleanPhone,
        notes: {
          source: isFromApp ? 'android_chrome_external' : 'web_portal',
          promo_code: appliedPromo?.code || promoCode,
        },
        onSuccess: async (verifiedData) => {
          setIsLoading(false);
          setPaymentSuccess(true);
          setApprovedDetails(verifiedData);

          if (appliedPromo?.code) {
            usePromoCode(appliedPromo.code);
          }

          addPaymentRequest({
            userId: userId || `VJ-${cleanPhone.slice(-6)}`,
            userName: userName.trim(),
            userMobile: cleanPhone,
            planId: targetPlan.id as any,
            planName: targetPlan.nameMr || targetPlan.name,
            amount: finalAmount,
            utrNumber: verifiedData.paymentId || verifiedData.orderId || `RZP-${Date.now()}`,
            screenshotUrl: '',
            paymentMethod: 'razorpay',
            adminNote: appliedPromo?.code
              ? `Website Payment (Promo: ${appliedPromo.code}, Saved ₹${appliedPromo.discountAmount})`
              : 'Website Portal Payment & Login ID Activation',
          });

          if (userId && typeof updateMemberTier === 'function') {
            updateMemberTier(userId, targetPlan.id as any);
          }

          if (desiredPassword && desiredPassword.trim().length >= 4) {
            setIsSavingCredentials(true);
            await saveMemberLoginIdAndPassword(cleanPhone, desiredPassword.trim(), userName.trim(), userGender, true);
            setIsSavingCredentials(false);
            setIsCredentialsSaved(true);
            setCredentialsMessage('✅ तुमचा लॉगिन आयडी (मोबाईल नंबर) आणि पासवर्ड यशस्वीरित्या सेट झाला आहे!');
          } else {
            const nowIso = new Date().toISOString();
            const expDays = appliedPromo?.customValidityDays || (targetPlan as any).validityDays || 180;
            const expiresIso = new Date(Date.now() + expDays * 24 * 60 * 60 * 1000).toISOString();
            const targetId = userId || `VJ-${cleanPhone.slice(-6)}`;
            syncDocToFirestore('profiles', targetId, {
              isPremium: true,
              hasPaidMembership: true,
              isVerified: true,
              membership: (targetPlan.id || 'gold').toLowerCase(),
              membershipPlan: targetPlan.nameMr || targetPlan.name,
              premiumActivatedAt: nowIso,
              premiumExpiresAt: expiresIso,
              membershipExpiryDate: expiresIso,
              isPlanExpired: false,
              paidAt: nowIso,
            });
          }

          if (addNotification) {
            addNotification({
              userId: userId || `VJ-${cleanPhone.slice(-6)}`,
              title: '🎉 मेंबरशिप व लॉगिन आयडी सक्रिय!',
              titleMr: '🎉 मेंबरशिप व लॉगिन आयडी सक्रिय!',
              message: `${targetPlan.nameMr || targetPlan.name} प्लॅन (₹${finalAmount}) सुरू झाला आहे!`,
              messageMr: `${targetPlan.nameMr || targetPlan.name} प्लॅन (₹${finalAmount}) सुरू झाला आहे!`,
              type: 'approval',
            });
          }
        },
        onError: (err) => {
          setIsLoading(false);
          setPaymentError(err || 'पेमेंट पूर्ण होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.');
        },
        onDismiss: () => {
          setIsLoading(false);
        },
      });
    } catch (e: any) {
      setIsLoading(false);
      setPaymentError(e.message || 'पेमेंट सुरू करताना त्रुटी आली.');
    }
  };

  // Step 2 (Post-Payment): Save / Update Login ID & Password
  const handlePostPaymentSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsMessage('');
    const cleanPhone = userMobile.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setPaymentError('कृपया १० अंकी मोबाईल नंबर टाका.');
      return;
    }
    if (!desiredPassword || desiredPassword.trim().length < 4) {
      setPaymentError('कृपया किमान ४ अक्षरे किंवा अंकांचा पासवर्ड टाका.');
      return;
    }
    if (confirmDesiredPassword && desiredPassword !== confirmDesiredPassword) {
      setPaymentError('दोन्ही पासवर्ड जुळत नाहीत.');
      return;
    }

    setPaymentError(null);
    setIsSavingCredentials(true);
    const ok = await saveMemberLoginIdAndPassword(cleanPhone, desiredPassword.trim(), userName.trim(), userGender, true);
    setIsSavingCredentials(false);

    if (ok) {
      setIsCredentialsSaved(true);
      setCredentialsMessage('✅ तुमचा लॉगिन आयडी आणि पासवर्ड यशस्वीरित्या सेव्ह झाला आहे! आता ॲपमध्ये लॉगिन करा.');
    } else {
      setPaymentError('पासवर्ड सेव्ह करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  // Tab 2: Send Email OTP for Forgot Password / Set Password
  const handleSendForgotOtp = async () => {
    setOtpError('');
    setOtpSuccessMsg('');
    const cleanPhone = otpMobile.replace(/\D/g, '').slice(-10);
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (cleanPhone.length !== 10) {
      setOtpError('कृपया अचूक १० अंकी नोंदणीकृत मोबाईल नंबर (Login ID) टाका.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setOtpError('कृपया OTP मिळवण्यासाठी तुमचा अचूक ईमेल आयडी (Email ID) टाका.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: cleanPhone,
          phone: cleanPhone,
          email: cleanEmail,
          purpose: 'forgot_password',
          deviceFingerprint: getDeviceFingerprint(),
        }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP पाठवताना अडचण आली.');
      if (!resp.ok || !data?.success) {
        setOtpError(
          data?.error ||
            'तुम्ही २४ तासांत जास्तीत जास्त ५ वेळाच ईमेल OTP पाठवू शकता.'
        );
      } else {
        setOtpSent(true);
        setOtpSuccessMsg(data.message || `४-अंकी OTP तुमच्या ${cleanEmail} या ईमेलवर पाठवला आहे.`);
      }
    } catch (err: any) {
      setOtpError('सर्व्हरशी संपर्क होऊ शकला नाही: ' + (err.message || ''));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Tab 2: 1-Click Google Verification for Forgot Password / Set MPIN
  const handleForgotGoogleVerify = async () => {
    setOtpError('');
    setOtpSuccessMsg('');
    const cleanPhone = otpMobile.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setOtpError('कृपया आधी अचूक १० अंकी नोंदणीकृत मोबाईल नंबर (Login ID) टाका.');
      return;
    }
    setIsGoogleVerifyingForgot(true);
    try {
      const gRes = await signInWithGoogleVerified({ mobileNumber: cleanPhone });
      if (!gRes.success || !gRes.email) {
        setOtpError(gRes.error || 'Google पडताळणी पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.');
        return;
      }
      setForgotEmail(gRes.email);
      setIsForgotGoogleVerified(true);
      setOtpSent(true);
      setOtpSuccessMsg(`✅ तुमचे Google खाते (${gRes.email}) यशस्वीरित्या पडताळले गेले आहे! आता खाली नवीन पासवर्ड / MPIN सेट करा.`);
      if (gRes.token) {
        localStorage.setItem('vj_auth_jwt_token', gRes.token);
        localStorage.setItem('vanjari_auth_jwt_token', gRes.token);
        localStorage.setItem('vj_auth_mobile_number', cleanPhone);
      }
    } catch (err: any) {
      setOtpError('Google पडताळणी करताना त्रुटी आली: ' + (err?.message || ''));
    } finally {
      setIsGoogleVerifyingForgot(false);
    }
  };

  // Tab 2: Verify Google / Email OTP & Reset Password
  const handleVerifyOtpAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const cleanPhone = otpMobile.replace(/\D/g, '').slice(-10);
    const cleanEmail = forgotEmail.trim().toLowerCase();

    if (cleanPhone.length !== 10) {
      setOtpError('कृपया १० अंकी मोबाईल नंबर टाका.');
      return;
    }
    if (!isForgotGoogleVerified && (!otpCode || otpCode.trim().length !== 4)) {
      setOtpError('कृपया गुगलने पडताळणी करा किंवा ईमेलवर आलेला ४ अंकी OTP कोड टाका.');
      return;
    }
    if (!newResetPassword || newResetPassword.trim().length < 4) {
      setOtpError('नवीन ४-अंकी MPIN / पासवर्ड किमान ४ अंकांचा असावा.');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      setOtpError('दोन्ही MPIN / पासवर्ड जुळत नाहीत. कृपया सारखाच टाका.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      if (!isForgotGoogleVerified) {
        const cleanMpin = newResetPassword.replace(/\D/g, '').slice(0, 4);
        const verifyResp = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile_number: cleanPhone,
            phone: cleanPhone,
            email: cleanEmail,
            otp: otpCode.trim(),
            mpin: cleanMpin.length === 4 ? cleanMpin : undefined,
          }),
        });
        const { data: verifyData } = await safeParseJson(verifyResp, 'OTP पडताळणी करताना त्रुटी आली.');
        if (!verifyResp.ok || !verifyData?.success) {
          setOtpError(verifyData?.error || 'चुकीचा OTP कोड! कृपया तपासून पुन्हा प्रयत्न करा.');
          setIsVerifyingOtp(false);
          return;
        }
        if (verifyData.token) {
          localStorage.setItem('vj_auth_jwt_token', verifyData.token);
          localStorage.setItem('vj_auth_mobile_number', cleanPhone);
        }
      }

      const matchedProfile = profiles.find((p) => (p.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone);
      await saveMemberLoginIdAndPassword(
        cleanPhone,
        newResetPassword.trim(),
        matchedProfile?.fullName || '',
        (matchedProfile?.gender as 'groom' | 'bride') || 'groom',
        false
      );

      setResetCompleted(true);
      setOtpSuccessMsg('✅ तुमचा नवीन पासवर्ड यशस्वीरित्या सेट झाला आहे! आता वंजारी जोडी ॲपमध्ये लॉगिन करा.');
    } catch (err: any) {
      setOtpError('पासवर्ड रिसेट करताना त्रुटी आली: ' + (err.message || ''));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Admin Sub-Tab: Save Email OTP Gateway Config (Protected by Admin Session Token)
  const handleSaveSmsGatewayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsConfigFeedback('');
    setIsSavingSmsConfig(true);
    try {
      const resp = await fetch('/api/email/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ ...emailOtpConfig, adminToken }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP सेटिंग्ज सेव्ह करता आल्या नाहीत.');
      if (resp.ok && data?.success) {
        setSmsConfigFeedback(data.message || '✅ ईमेल OTP गेटवे सेटिंग्ज सर्व्हरवर सुरक्षित सेव्ह झाल्या!');
        fetchAdminVaultData(adminToken);
      } else {
        setSmsConfigFeedback('❌ त्रुटी: ' + (data?.error || 'सेव्ह करता आले नाही'));
      }
    } catch (err: any) {
      setSmsConfigFeedback('❌ सर्व्हर त्रुटी: ' + (err.message || ''));
    } finally {
      setIsSavingSmsConfig(false);
    }
  };

  // Admin Live Test Email OTP
  const handleSendTestSms = async () => {
    setTestSmsFeedback('');
    const cleanEmail = testEmailTo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setTestSmsFeedback('❌ कृपया अचूक ईमेल आयडी (उदा. name@gmail.com) टाका.');
      return;
    }
    setIsTestingSms(true);
    try {
      const resp = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ email: cleanEmail, adminToken }),
      });
      const { data } = await safeParseJson(resp, 'टेस्ट ईमेल पाठवताना त्रुटी आली.');
      setTestSmsFeedback(
        data?.message || data?.error || (data?.success ? '✅ टेस्ट ईमेल OTP पाठवला गेला!' : '❌ त्रुटी आली.')
      );
    } catch (err: any) {
      setTestSmsFeedback('❌ सर्व्हर त्रुटी: ' + (err.message || ''));
    } finally {
      setIsTestingSms(false);
    }
  };

  // Admin Sub-Tab 2: Save Razorpay Server Vault Config
  const handleSaveRazorpayVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setRzpFeedback('');
    setIsSavingRzp(true);
    try {
      const resp = await fetch('/api/razorpay/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          enabled: rzpConfig.enabled,
          env: rzpConfig.env,
          keyId: rzpConfig.keyId.trim(),
          secretKey: rzpConfig.secretKey.includes('••••') ? undefined : rzpConfig.secretKey.trim(),
          webhookSecret: rzpConfig.webhookSecret.includes('••••') ? undefined : rzpConfig.webhookSecret.trim(),
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setRzpFeedback('✅ Razorpay मर्चंट की व सीक्रेट सर्व्हर व्हॉल्टमध्ये १००% सुरक्षितपणे सेव्ह झाले!');
        fetchAdminVaultData(adminToken);
      } else {
        setRzpFeedback('❌ त्रुटी: ' + (data.error || 'सेव्ह करता आले नाही.'));
      }
    } catch (err: any) {
      setRzpFeedback('❌ सर्व्हर त्रुटी: ' + (err.message || ''));
    } finally {
      setIsSavingRzp(false);
    }
  };

  // Admin Manual Member Login ID & Password Activation
  const handleAdminManualCreateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualCredsFeedback('');
    const cleanPhone = manualMobile.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10 || !manualPassword || manualPassword.trim().length < 4) {
      setManualCredsFeedback('❌ कृपया १० अंकी मोबाईल नंबर आणि किमान ४ अक्षरी पासवर्ड टाका.');
      return;
    }
    setIsSavingManualCreds(true);
    const ok = await saveMemberLoginIdAndPassword(
      cleanPhone,
      manualPassword.trim(),
      manualName.trim() || 'सन्माननीय सदस्य',
      manualGender,
      true
    );
    setIsSavingManualCreds(false);
    if (ok) {
      setManualCredsFeedback(`✅ लॉगिन आयडी (${cleanPhone}) आणि पासवर्ड सक्रिय झाला! युजर आता ॲपमध्ये १००% फुल ॲक्सेसने लॉगिन करू शकतो.`);
      setManualMobile('');
      setManualPassword('');
      setManualName('');
      fetchAdminVaultData(adminToken);
    } else {
      setManualCredsFeedback('❌ सेव्ह करताना त्रुटी आली.');
    }
  };

  const handleDownloadInvoice = () => {
    downloadPaymentInvoice({
      invoiceNumber: approvedDetails?.orderId || `RCP-${Date.now().toString().slice(-6)}`,
      paymentId: approvedDetails?.paymentId || `RZP-${Date.now()}`,
      orderId: approvedDetails?.orderId || `ORD-${Date.now()}`,
      gateway: 'Razorpay Payment Gateway (Official)',
      utrNumber: approvedDetails?.paymentId || `RZP-${Date.now()}`,
      userName: userName || 'सन्माननीय सदस्य',
      userMobile: userMobile || '',
      userDistrict: currentUser?.district || '',
      planName: targetPlan.nameMr || targetPlan.name,
      planDuration: targetPlan.duration || 'सक्रिय वैधता',
      amount: finalAmount,
      currency: 'INR',
      paymentDate: new Date().toLocaleDateString('en-IN'),
      membershipExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      businessName: siteConfig?.logoTitle || 'वंजारी जोडी वधू-वर सूचक केंद्र',
      upiId: siteConfig?.paymentUpiId || 'mahesh.hange1@ybl',
      adminNote: 'Razorpay अधिकृत ऑनलाईन पेमेंट व लॉगिन आयडी-पासवर्ड ॲक्टिव्हेशन.',
    });
  };

  const handleReturnToApp = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'intent://vanjarijodi.web.app/#Intent;scheme=https;package=com.vanjarijodi.app;end';
      setTimeout(() => {
        if (onSwitchToAppMode) {
          onSwitchToAppMode();
        }
      }, 800);
    }
  };

  const handleDownloadApk = () => {
    downloadApkFile(
      siteConfig?.apkSettings?.apkUrl || '/downloads/VanjariJodi.apk',
      siteConfig?.apkSettings?.appVersion || 'v2.7.0',
      incrementApkDownloadCount
    );
  };

  const copyLinkToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2500);
  };

  const playStoreComplianceLinks = [
    {
      title: '१. App Privacy Policy (Google Play Store Listing & Data Safety)',
      desc: 'पेमेंटचा कुठेही उल्लेख नसलेले १००% Google Play पॉलिसीनुसार ॲप गोपनीयता धोरण पेज',
      path: '/app-privacy-policy',
      url: 'https://vanjarijodi.web.app/app-privacy-policy',
    },
    {
      title: '२. Account & Data Deletion URL (Google Play Data Safety Mandatory)',
      desc: 'युजरचे खाते आणि फोटो कायमस्वरूपी डिलीट करण्याची अधिकृत लिंक (Data Safety फॉर्मसाठी)',
      path: '/app-account-deletion',
      url: 'https://vanjarijodi.web.app/app-account-deletion',
    },
    {
      title: '३. Child Safety & CSAE Standards URL (Google Play Mandatory Declaration)',
      desc: '18+ / 21+ वयोमर्यादा आणि CSAE झिरो-टॉलरन्स चाइल्ड सेफ्टी धोरण लिंक',
      path: '/app-child-safety',
      url: 'https://vanjarijodi.web.app/app-child-safety',
    },
    {
      title: '४. App Terms of Use & Community Guidelines',
      desc: 'अँड्रॉइड ॲपच्या वापराच्या अटी व नियम (पेमेंटचा कोणताही उल्लेख नाही)',
      path: '/app-terms',
      url: 'https://vanjarijodi.web.app/app-terms',
    },
  ];

  const razorpayComplianceLinks = [
    {
      title: '१. Terms & Conditions (Razorpay KYC Mandatory)',
      desc: 'दोन्ही लिंक्स १००% चालू आहेत: /terms-and-conditions आणि /razorpay-terms',
      path: '/terms-and-conditions',
      url: 'https://vanjarijodi.web.app/terms-and-conditions',
      altUrl: 'https://vanjarijodi.web.app/razorpay-terms',
    },
    {
      title: '२. Privacy Policy (Razorpay Website KYC)',
      desc: 'दोन्ही लिंक्स १००% चालू आहेत: /privacy-policy आणि /razorpay-privacy',
      path: '/privacy-policy',
      url: 'https://vanjarijodi.web.app/privacy-policy',
      altUrl: 'https://vanjarijodi.web.app/razorpay-privacy',
    },
    {
      title: '३. Refund & Cancellation Policy (Razorpay Mandatory)',
      desc: 'दोन्ही लिंक्स १००% चालू आहेत: /refund-policy आणि /razorpay-refund',
      path: '/refund-policy',
      url: 'https://vanjarijodi.web.app/refund-policy',
      altUrl: 'https://vanjarijodi.web.app/razorpay-refund',
    },
    {
      title: '४. Shipping & Service Delivery Policy (Razorpay Mandatory!)',
      desc: 'दोन्ही लिंक्स १००% चालू आहेत: /shipping-policy आणि /razorpay-shipping',
      path: '/shipping-policy',
      url: 'https://vanjarijodi.web.app/shipping-policy',
      altUrl: 'https://vanjarijodi.web.app/razorpay-shipping',
    },
    {
      title: '५. Pricing & Plans in INR (Razorpay Mandatory)',
      desc: 'दोन्ही लिंक्स १००% चालू आहेत: /pricing आणि /razorpay-pricing',
      path: '/pricing',
      url: 'https://vanjarijodi.web.app/pricing',
      altUrl: 'https://vanjarijodi.web.app/razorpay-pricing',
    },
    {
      title: '६. Contact Us, Registered Address & Grievance Officer',
      desc: 'दोन्ही लिंक्स १००% चालू आहेत: /contact-us आणि /razorpay-contact',
      path: '/contact-us',
      url: 'https://vanjarijodi.web.app/contact-us',
      altUrl: 'https://vanjarijodi.web.app/razorpay-contact',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-slate-50 to-orange-50/40 text-slate-800 font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* 🛠️ Admin Live On-Page Word-by-Word Customizer Bar (Visible when Admin is Logged In) */}
      {isAdminAuthenticated && (
        <div className="sticky top-0 z-50 bg-slate-950 text-white px-3 sm:px-6 py-2.5 border-b-2 border-amber-400 shadow-xl">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300">
              <Settings className="w-4 h-4 animate-spin-slow text-amber-400" />
              <span>🛠️ ॲडमिन लाईव्ह वेबसाईट कस्टमायझर:</span>
              {isLiveWebsiteEditMode && (
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black">
                  पेजवरील कोणत्याही शब्दावर (✏️) क्लिक करून लगेच बदला!
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !isLiveWebsiteEditMode;
                  setIsLiveWebsiteEditMode(next);
                  if (next && activeTab === 'admin_portal') {
                    setActiveTab('pay_and_set_id');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer transition ${
                  isLiveWebsiteEditMode
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                <span>
                  {isLiveWebsiteEditMode
                    ? '✓ लाईव्ह शब्द एडिट मोड: चालू (ON)'
                    : '✏️ थेट वेबसाईटवर शब्द क्लिक करून बदला'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin_portal');
                  setAdminSubTab('web_app_settings');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs cursor-pointer"
              >
                ⚙️ सर्व बॉक्स दाखवा/लपवा व शब्द यादी
              </button>

              <button
                type="button"
                onClick={handleSaveWebAndAppSettings}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
              >
                💾 सेव्ह करा
              </button>
            </div>
          </div>

          {/* Inline Popover Editor when Admin clicks any word on the page */}
          {activeInlineEditKey && (
            <div className="max-w-3xl mx-auto mt-2.5 p-3 rounded-2xl bg-slate-900 border-2 border-amber-400 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xl">
              <div className="text-[11px] font-black text-amber-300 shrink-0">
                ✏️ शब्द बदला ({String(activeInlineEditKey)}):
              </div>
              <input
                type="text"
                autoFocus
                value={inlineEditDraft}
                onChange={(e) => setInlineEditDraft(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white text-slate-950 font-black text-xs focus:outline-none"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const nextCms = {
                      ...webCms,
                      [activeInlineEditKey]: inlineEditDraft,
                    };
                    setWebCms(nextCms);
                    updateSiteConfig({ websiteCms: nextCms });
                    setActiveInlineEditKey(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  ✓ लागू करा व सेव्ह करा
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInlineEditKey(null)}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  रद्द करा
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🚀 Clean Official Header */}
      <header className="bg-gradient-to-r from-[#7A0C1E] via-[#9B111E] to-[#7A0C1E] text-white py-3.5 px-4 sm:px-8 border-b-2 border-amber-400 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white p-0.5 shadow-md shrink-0 flex items-center justify-center border border-amber-300">
              <img
                src="/vanjari-jodi-official-logo.png"
                alt="Vanjari Jodi"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <span className="text-amber-300 font-black text-[11px] sm:text-xs block truncate">
                {editableText('headerBlessing')}
              </span>
              <h1 className="text-sm sm:text-lg font-black text-white leading-tight truncate">
                {editableText('headerMainTitle')}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Direct Open Matrimony for iPhone & Web Users */}
            {onSwitchToAppMode && (
              <button
                type="button"
                onClick={onSwitchToAppMode}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition transform active:scale-95 border border-amber-200"
                title="आयफोन व वेब ब्राऊझरवर थेट सर्व वधू-वर स्थळे उघडा"
              >
                <span>🍎 आयफोन / वेब स्थळे</span>
              </button>
            )}

            {webCms.showHeaderPlayButton && (
              <a
                href={siteConfig?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition transform active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>{editableText('headerPlayBtnText')}</span>
              </a>
            )}

            {webCms.showHeaderSslBadge && (
              <div className="hidden md:flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-amber-300/40 text-xs text-amber-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{editableText('headerSslText')}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('admin_portal')}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{editableText('headerAdminBtnText')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📢 Top Google Play Store Announcement Ribbon (Controllable from Admin) */}
      {webCms.showTopRibbon && (
        <aside aria-label="Play Store ॲप घोषणा" className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 text-emerald-100 text-xs py-2 px-3 sm:px-6 border-b border-emerald-500/40 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 font-bold text-[11px] sm:text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{editableText('topRibbonText')}</span>
            </div>
            <a
              href={siteConfig?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 hover:text-amber-200 underline cursor-pointer shrink-0"
            >
              <span>{editableText('topRibbonLinkText')}</span>
            </a>
          </div>
        </aside>
      )}

      {/* 🌟 Main Dedicated Portal Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-3.5 sm:p-6 space-y-4">
        {/* 📱 DEDICATED IPHONE (iOS) & WEB MATRIMONY BANNER & QUICK LAUNCHER */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-[#1E112A] to-slate-950 border-2 border-amber-400/90 text-white shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <Smartphone className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  🍎 आयफोन (iPhone / iOS) वापरकर्त्यांसाठी
                </span>
                <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                  तुमच्याकडे आयफोन आहे का? हीच वेबसाईट iPhone वर १००% ॲपप्रमाणे चालते!
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Safari &amp; Chrome समर्थित</span>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            आपल्याकडे केवळ <strong>ॲन्ड्रॉइड मोबाईलसाठी ॲप (APK / Play Store)</strong> उपलब्ध असून, आयफोनसाठी स्वतंत्र App Store ॲप नाही. <strong>परंतु घाबरण्याचे कारण नाही!</strong> ही अधिकृत वेबसाईट (<strong className="text-amber-300 font-mono">vanjarijodi.web.app</strong>) आयफोन (iPhone) मध्ये <strong>Safari व Chrome वर १००% ॲपप्रमाणेच</strong> काम करते. येथे तुम्ही थेट सर्व वधू-वर स्थळे पाहू शकता, मोफत ३६ गुण पत्रिका मिलन करू शकता, बायोडाटा बनवू शकता आणि मेंबरशिप प्लॅन सक्रिय करू शकता.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {onSwitchToAppMode && (
              <button
                type="button"
                onClick={onSwitchToAppMode}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer"
              >
                <span>📱 आयफोनवर सर्व स्थळे व मॅट्रिमोनी उघडा (Open Portal)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* iPhone Add to Home Screen (PWA) 3 Steps */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>📲 iPhone मध्ये ॲपप्रमाणे स्क्रीनवर कसे सेव्ह करावे? (Add to Home Screen):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-0.5">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-amber-200 block mb-0.5">१. Share बटण दाबा:</strong>
                iPhone मधील Safari ब्राऊझरच्या खालील <strong>Share आयकॉन ( ⬆️ )</strong> वर टॅप करा.
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-amber-200 block mb-0.5">२. Add to Home Screen:</strong>
                खाली स्क्रोल करून <strong>'Add to Home Screen'</strong> (होम स्क्रीनवर जोडा) निवडा.
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-amber-200 block mb-0.5">३. ॲपप्रमाणे वापरा:</strong>
                वर उजवीकडे <strong>'Add'</strong> दाबा. आता थेट तुमच्या iPhone वर ॲप आयकॉन तयार होईल!
              </div>
            </div>
          </div>

          {/* Official Helpline Email Strip */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>अधिकृत हेल्पलाईन ईमेल:</span>
              <a href="mailto:gitevijay123@gmail.com" className="font-mono font-bold text-amber-300 hover:underline">
                gitevijay123@gmail.com
              </a>
            </div>
            <div className="text-emerald-400 font-bold">
              ✓ १००% अधिकृत व विश्वासू वंजारी समाज सेवा
            </div>
          </div>
        </div>

        {/* Top Navigation Tabs: 1. Pay & Set ID/Password | 2. Forgot Password OTP | 3. Admin Login */}
        <div className="grid grid-cols-3 gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-amber-300 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('pay_and_set_id')}
            className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-black transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'pay_and_set_id'
                ? 'bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white shadow-sm'
                : 'text-slate-700 hover:bg-amber-50'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>{editableText('navTab1Text')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('forgot_password_otp')}
            className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-black transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'forgot_password_otp'
                ? 'bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white shadow-sm'
                : 'text-slate-700 hover:bg-emerald-50'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>{editableText('navTab2Text')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin_portal')}
            className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-black transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'admin_portal'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>{editableText('navTab3Text')}</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: PAYMENT + SET LOGIN ID (MOBILE) & PASSWORD                     */}
        {/* ===================================================================== */}
        {activeTab === 'pay_and_set_id' && (
          <>
            {paymentSuccess ? (
              <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-400 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                <div className="text-center space-y-1.5">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600 stroke-[2.5]" />
                  </div>
                  <span className="inline-block text-xs bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-md font-black">
                    ✓ ₹{finalAmount} पेमेंट यशस्वी!
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    आता तुमचा लॉगिन आयडी आणि पासवर्ड तयार करा
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    खाली सेट केलेला <strong>लॉगिन आयडी (मोबाईल नंबर)</strong> आणि <strong>पासवर्ड</strong> टाकून तुम्ही वंजारी जोडी ॲपमध्ये सर्व बायोडाटा व फोटो पाहू शकता.
                  </p>
                </div>

                {!isCredentialsSaved ? (
                  <form
                    onSubmit={handlePostPaymentSetPassword}
                    className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-400 space-y-3.5 text-xs"
                  >
                    <div className="font-black text-[#800C1E] text-sm flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>🔐 तुमचा लॉगिन आयडी आणि पासवर्ड सेट करा:</span>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        लॉगिन आयडी (तुमचा १०-अंकी मोबाईल नंबर):
                      </label>
                      <input
                        type="tel"
                        value={userMobile}
                        onChange={(e) => setUserMobile(e.target.value.replace(/\D/g, '').slice(-10))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-black text-base text-[#800C1E]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          नवीन पासवर्ड तयार करा (किमान ४ अक्षरे/अंक):
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={desiredPassword}
                            onChange={(e) => setDesiredPassword(e.target.value)}
                            placeholder="नवीन पासवर्ड टाका"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 pr-9"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          पासवर्ड पुन्हा टाका (Confirm Password):
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmDesiredPassword}
                          onChange={(e) => setConfirmDesiredPassword(e.target.value)}
                          placeholder="पुन्हा पासवर्ड टाका"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    {paymentError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-bold">
                        {paymentError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingCredentials}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSavingCredentials ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>सेव्ह होत आहे...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>✅ लॉगिन आयडी आणि पासवर्ड सेव्ह करा</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400 rounded-2xl p-5 text-white space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                      <span className="px-3 py-0.5 rounded-md bg-emerald-400 text-slate-950 font-black text-xs">
                        ✓ लॉगिन आयडी व पासवर्ड तयार!
                      </span>
                      <span className="text-xs text-amber-300 font-bold">फुल ॲक्सेस सक्रिय</span>
                    </div>

                    {credentialsMessage && (
                      <p className="text-xs text-emerald-200 font-bold">{credentialsMessage}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-xl border border-emerald-500/40">
                      <div>
                        <span className="text-[11px] text-slate-300 block">तुमचा लॉगिन आयडी (मोबाईल नंबर):</span>
                        <span className="font-mono text-lg font-black text-amber-300">{userMobile}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-300 block">तुमचा सेट केलेला पासवर्ड:</span>
                        <span className="font-mono text-lg font-black text-emerald-300">{desiredPassword}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-200 font-medium">
                      💡 आता वंजारी जोडी अँड्रॉइड ॲप उघडा आणि वरील <strong>लॉगिन आयडी ({userMobile})</strong> व <strong>पासवर्ड</strong> टाकून लॉगिन करा!
                    </p>
                  </div>
                )}

                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-emerald-800 font-black block">✅ तुमचे खाते व प्लॅन सर्व्हरवर सक्रिय झाला आहे!</span>
                    <span className="text-slate-600 text-[11px] font-semibold">
                      कोणत्याही वेगळ्या ॲक्टिव्हेशन कोडची गरज नाही — थेट वरील मोबाईल नंबर (Login ID) व पासवर्डने अँड्रॉइड ॲपमध्ये लॉगिन करा.
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleReturnToApp}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5 text-amber-300" />
                    <span>📲 वंजारी जोडी ॲप उघडा व लॉगिन करा</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadApk}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black text-xs rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>अँड्रॉइड ॲप (APK) डाउनलोड करा</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadInvoice}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-700" />
                      <span>पेमेंट पावती डाउनलोड करा</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. ATTRACTIVE PROMOTIONAL ADVERTISEMENT BANNER (आकर्षक जाहिरात बॅनर) */}
                {webCms.showAdBanner && (siteConfig?.websiteAdBanner?.enabled ?? adBannerEnabled) !== false && (
                  <div className="w-full">
                    {(() => {
                      const bannerConfig = siteConfig?.websiteAdBanner || {
                        enabled: adBannerEnabled,
                        mode: adBannerMode,
                        imageUrl: adBannerImageUrl,
                        imageOrientation: adBannerOrientation,
                        title: adBannerTitle,
                        subtitle: adBannerSubtitle,
                        badgeText: adBannerBadge,
                        ctaText: adBannerCtaText,
                        ctaAction: adBannerCtaAction,
                        targetUrl: adBannerTargetUrl,
                      };

                      const hasCustomImage = bannerConfig.mode === 'custom_image' && Boolean(bannerConfig.imageUrl);
                      const orientation = bannerConfig.imageOrientation || 'horizontal';

                      // A) Custom Uploaded Horizontal Banner (आडवा फोटो - 16:9 / 21:8 Banner Layout)
                      if (hasCustomImage && orientation === 'horizontal') {
                        return (
                          <div className="group relative overflow-hidden rounded-3xl border-2 border-amber-300/90 shadow-2xl bg-gradient-to-r from-amber-950 via-[#800C1E] to-rose-950 text-white transition hover:shadow-amber-500/20">
                            <div className="relative aspect-[16/7] sm:aspect-[21/8] w-full overflow-hidden bg-slate-900">
                              <img
                                src={bannerConfig.imageUrl}
                                alt={bannerConfig.title || 'वंजारी जोडी जाहिरात बॅनर'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              {(bannerConfig.title || bannerConfig.subtitle || bannerConfig.badgeText) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col justify-end p-4 sm:p-7">
                                  <div className="space-y-1.5 max-w-2xl">
                                    {bannerConfig.badgeText && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 shadow-md">
                                        <Sparkles className="w-3 h-3 text-[#800C1E]" />
                                        {bannerConfig.badgeText}
                                      </span>
                                    )}
                                    {bannerConfig.title && (
                                      <h3 className="text-base sm:text-2xl font-black text-white drop-shadow-md">
                                        {bannerConfig.title}
                                      </h3>
                                    )}
                                    {bannerConfig.subtitle && (
                                      <p className="text-xs sm:text-sm text-amber-100 font-medium line-clamp-2 drop-shadow">
                                        {bannerConfig.subtitle}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="bg-gradient-to-r from-[#800C1E] to-[#A71930] p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-t border-amber-400/40">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                                <ShieldCheck className="w-4 h-4 text-amber-300" />
                                <span>{editableText('bannerBottomTrustText')}</span>
                              </div>
                              <button
                                type="button"
                                onClick={handleAdBannerCtaClick}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transform active:scale-95 transition"
                              >
                                <span>{bannerConfig.ctaText || 'मेंबरशिप प्लॅन्स निवडा'}</span>
                                <ArrowRight className="w-4 h-4 text-slate-950" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      // B) Custom Uploaded Vertical Poster (उभा फोटो - Split Poster with Highlights)
                      if (hasCustomImage && orientation === 'vertical') {
                        return (
                          <div className="overflow-hidden rounded-3xl border-2 border-amber-300 shadow-xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                              <div className="md:col-span-5 flex justify-center items-center">
                                <div className="relative group overflow-hidden rounded-2xl shadow-xl border-4 border-white bg-slate-900 max-h-[380px] sm:max-h-[440px] max-w-[270px] sm:max-w-[320px] w-full">
                                  <img
                                    src={bannerConfig.imageUrl}
                                    alt={bannerConfig.title || 'वंजारी जोडी पोस्टर'}
                                    className="w-full h-full object-contain max-h-[380px] sm:max-h-[440px] transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                              </div>

                              <div className="md:col-span-7 space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-300 shadow-sm flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                                      {bannerConfig.badgeText || '🚩 वंजारी समाज विशेष जाहिरात'}
                                    </span>
                                  </div>

                                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                                    {bannerConfig.title || 'मनपसंत, सुशिक्षित व सुसंस्कृत जीवनसाथी शोधण्याचा हक्काचा मार्ग!'}
                                  </h3>

                                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                                    {bannerConfig.subtitle || 'संपूर्ण महाराष्ट्रातील हजारो वंजारी वधू-वर स्थळांची खात्रीशीर माहिती, ३६ गुण मिलन व थेट कुटुंबाशी संवाद.'}
                                  </p>
                                </div>

                                <div className="pt-1 flex flex-wrap items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={handleAdBannerCtaClick}
                                    className="px-6 py-3 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition transform active:scale-95"
                                  >
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                    <span>{bannerConfig.ctaText || 'मेंबरशिप प्लॅन्स पहा व निवडा'}</span>
                                    <ArrowRight className="w-4 h-4 text-amber-300" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // C) Dynamic Promo Banner (Fully editable word-by-word)
                      return (
                        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 shadow-2xl bg-gradient-to-r from-amber-700 via-[#800C1E] to-rose-950 text-white p-5 sm:p-7">
                          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="space-y-3 max-w-2xl">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 shadow-md">
                                  <Sparkles className="w-3 h-3 text-[#800C1E]" />
                                  {bannerConfig.badgeText || '🎉 विशेष ऑफर ५०% सूट'}
                                </span>
                                <span className="text-[11px] font-bold text-amber-200">
                                  {editableText('bannerMantraText')}
                                </span>
                              </div>

                              <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                                {bannerConfig.title || 'वंजारी समाजातील सुसंस्कृत व उच्चशिक्षित स्थळे एकाच ठिकाणी!'}
                              </h3>

                              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                                {bannerConfig.subtitle || '१,०००+ उच्चशिक्षित वधू-वर स्थळांची खात्रीशीर माहिती व पत्रिका मिलन. आजच नोंदणी करा आणि योग्य जोडीदार मिळवा!'}
                              </p>

                              {webCms.showBannerPills && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/30 border border-amber-300/40 text-amber-200">
                                    {editableText('bannerPill1')}
                                  </span>
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/30 border border-amber-300/40 text-amber-200">
                                    {editableText('bannerPill2')}
                                  </span>
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/30 border border-amber-300/40 text-amber-200">
                                    {editableText('bannerPill3')}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                              <button
                                type="button"
                                onClick={handleAdBannerCtaClick}
                                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 transition"
                              >
                                <span>{bannerConfig.ctaText || 'मेंबरशिप प्लॅन्स निवडा'}</span>
                                <ArrowRight className="w-4 h-4 text-slate-950" />
                              </button>
                              <span className="text-[10px] text-amber-200 font-medium text-center w-full">
                                {editableText('bannerSecurityNote')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. OPTIONAL TRUST PILLARS & 3 STEPS (Hidden by default per user request; Admin can enable & edit every word) */}
                {webCms.showTrustSection && (
                  <div className="bg-gradient-to-b from-amber-50/60 to-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-md space-y-5">
                    <div className="text-center max-w-xl mx-auto space-y-1">
                      <span className="text-[10px] font-black text-[#800C1E] uppercase tracking-wider bg-amber-100 px-3 py-0.5 rounded-full">
                        {editableText('trustBadge')}
                      </span>
                      <h3 className="text-base sm:text-xl font-black text-slate-900">
                        {editableText('trustHeading')}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        {editableText('trustSubtitle')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-[#800C1E]" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-900">{editableText('trustStat1Num')}</div>
                          <div className="text-[11px] font-bold text-slate-600">{editableText('trustStat1Label')}</div>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                          <Gift className="w-5 h-5 text-rose-700" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-900">{editableText('trustStat2Num')}</div>
                          <div className="text-[11px] font-bold text-slate-600">{editableText('trustStat2Label')}</div>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-900">{editableText('trustStat3Num')}</div>
                          <div className="text-[11px] font-bold text-slate-600">{editableText('trustStat3Label')}</div>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-900">{editableText('trustStat4Num')}</div>
                          <div className="text-[11px] font-bold text-slate-600">{editableText('trustStat4Label')}</div>
                        </div>
                      </div>
                    </div>

                    {webCms.showThreeSteps && (
                      <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <div className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>{editableText('stepsHeading')}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                            <div className="w-6 h-6 rounded-full bg-[#800C1E] text-amber-300 font-black text-xs flex items-center justify-center">१</div>
                            <div className="text-xs font-black text-slate-900">{editableText('step1Title')}</div>
                            <div className="text-[11px] text-slate-600 font-medium">{editableText('step1Desc')}</div>
                          </div>
                          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
                            <div className="w-6 h-6 rounded-full bg-[#800C1E] text-amber-300 font-black text-xs flex items-center justify-center">२</div>
                            <div className="text-xs font-black text-slate-900">{editableText('step2Title')}</div>
                            <div className="text-[11px] text-slate-600 font-medium">{editableText('step2Desc')}</div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">३</div>
                            <div className="text-xs font-black text-slate-900">{editableText('step3Title')}</div>
                            <div className="text-[11px] text-slate-600 font-medium">{editableText('step3Desc')}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 🌟 OPTIONAL GOOGLE PLAY STORE SHOWCASE CARD (Hidden by default per user request; Admin can enable & edit every word) */}
                {webCms.showPlayStoreSection && (
                  <div
                    id="download-app"
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 border-2 border-emerald-400 shadow-2xl p-5 sm:p-7 text-white space-y-5"
                  >
                    <div className="relative z-10 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-xs font-black">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{editableText('playBadgeText')}</span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {editableText('playVersionText')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{editableText('playProtectText')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        <div className={`${webCms.showPlayStoreQr ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-3`}>
                          <div className="flex items-center gap-3">
                            <img
                              src="/icon-192.png"
                              alt="वंजारी जोडी ॲप लोगो"
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-xl border-2 border-amber-400 shrink-0 bg-white p-0.5 object-cover"
                            />
                            <div>
                              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                                {editableText('playHeading')}
                              </h2>
                              <p className="text-xs sm:text-sm text-amber-300 font-bold mt-0.5">
                                {editableText('playSubheading')}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                            {editableText('playDescription')}
                          </p>

                          {webCms.showPlayStoreStats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-amber-400 font-black text-sm sm:text-base flex items-center justify-center gap-1">
                                  <span>{editableText('playStat1Num')}</span>
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold">{editableText('playStat1Label')}</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-emerald-400 font-black text-sm sm:text-base">{editableText('playStat2Num')}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{editableText('playStat2Label')}</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-cyan-400 font-black text-sm sm:text-base">{editableText('playStat3Num')}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{editableText('playStat3Label')}</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-rose-400 font-black text-sm sm:text-base">{editableText('playStat4Num')}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{editableText('playStat4Label')}</div>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <a
                              href={siteConfig?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group px-5 py-3 rounded-2xl bg-black hover:bg-slate-900 border-2 border-slate-700 hover:border-emerald-400 shadow-xl flex items-center gap-3 transition transform active:scale-95 text-white"
                            >
                              <svg className="w-7 h-7 shrink-0" viewBox="0 0 512 512" fill="none">
                                <path d="M48.8 19.4c-6.8 7.2-10.8 18.2-10.8 31.9v410.4c0 13.7 4 24.7 10.8 31.9l1.6 1.6L272 273.6V238.4L50.4 17.8l-1.6 1.6z" fill="#00E5FF"/>
                                <path d="M346.7 348.3l-74.7-74.7v-35.2l74.7-74.7 1.7 1 88.5 50.3c25.3 14.4 25.3 37.9 0 52.3l-88.5 50.3-1.7 1z" fill="#FFD600"/>
                                <path d="M272 273.6L50.4 495.2c8.2 8.7 21.8 9.8 37 1.2l259.3-147.3-74.7-75.5z" fill="#FF3D00"/>
                                <path d="M272 238.4l74.7-75.5L87.4 15.6c-15.2-8.6-28.8-7.5-37 1.2L272 238.4z" fill="#00E676"/>
                              </svg>
                              <div className="text-left">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{editableText('playBtnTopLabel')}</div>
                                <div className="text-sm sm:text-base font-black leading-none text-white tracking-wide">{editableText('playBtnMainLabel')}</div>
                              </div>
                            </a>

                            {webCms.showPlayStoreApkButton && (
                              <button
                                type="button"
                                onClick={handleDownloadApk}
                                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer transition transform active:scale-95"
                              >
                                <Download className="w-4 h-4 text-amber-300" />
                                <span>{editableText('playApkBtnText')}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {webCms.showPlayStoreQr && (
                          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                            <div className="text-[11px] font-bold text-amber-300">
                              {editableText('playQrTitle')}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {editableText('playQrSubtitle')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.5. USE EXISTING APP LOGIN OR ADD NEW BIODATA ON WEBSITE (सर्व ४ पद्धती + ॲप लॉगिन) */}
                {(webCms.showAppLoginCard || webCms.showWebBiodataCard) && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Cols: Sign In with Existing App Login to Buy Plan */}
                    {webCms.showAppLoginCard && (
                      <div
                        className={`${
                          webCms.showWebBiodataCard ? 'lg:col-span-5' : 'lg:col-span-12'
                        } bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl p-5 border-2 border-[#800C1E]/80 shadow-lg flex flex-col justify-between space-y-3.5`}
                      >
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#800C1E] text-amber-300">
                            {editableText('appLoginBadge')}
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-slate-900">
                            {editableText('appLoginHeading')}
                          </h3>
                          <p className="text-[11px] text-slate-600 font-medium">
                            {editableText('appLoginSubtitle')}
                          </p>
                        </div>

                        <form onSubmit={handleWebsiteAppLoginSignIn} className="space-y-2.5 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              {editableText('appLoginMobileLabel')}
                            </label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={appLoginMobile}
                              onChange={(e) => setAppLoginMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder={webCms.appLoginMobilePlaceholder}
                              className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-mono font-black text-slate-900 focus:outline-none focus:border-[#800C1E]"
                              required
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              {editableText('appLoginPassLabel')}
                            </label>
                            <div className="relative">
                              <input
                                type={showAppLoginPass ? 'text' : 'password'}
                                value={appLoginPassword}
                                onChange={(e) => setAppLoginPassword(e.target.value)}
                                placeholder={webCms.appLoginPassPlaceholder}
                                className="w-full px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-bold text-slate-900 pr-9 focus:outline-none focus:border-[#800C1E]"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowAppLoginPass(!showAppLoginPass)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer"
                              >
                                {showAppLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {appLoginError && (
                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                              {appLoginError}
                            </div>
                          )}
                          {appLoginFeedback && (
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold">
                              {appLoginFeedback}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isSigningInWithAppLogin}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isSigningInWithAppLogin ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>तपासत आहे...</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 text-amber-300" />
                                <span>{editableText('appLoginBtnText')}</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Right Cols: Upload / Create New BioData on Website (All 4 App BioData Methods) */}
                    {webCms.showWebBiodataCard && (
                      <div
                        className={`${
                          webCms.showAppLoginCard ? 'lg:col-span-7' : 'lg:col-span-12'
                        } bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-lg flex flex-col justify-between space-y-3.5`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              {editableText('biodataCardBadge')}
                            </span>
                            <span className="text-[10px] font-bold text-[#800C1E]">
                              {editableText('biodataCardRightNote')}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-slate-900">
                            {editableText('biodataCardHeading')}
                          </h3>
                          <p className="text-[11px] text-slate-600 font-medium">
                            {editableText('biodataCardSubtitle')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Method 1: AI Photo/PDF Auto-Scan */}
                          {webCms.showBiodataMethod1Ai && (
                            <button
                              type="button"
                              onClick={() => {
                                setRegistrationStep('ocr_photo');
                                setIsRegisterOpen(true);
                              }}
                              className="p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 hover:from-rose-100 hover:to-amber-100 border-2 border-[#800C1E]/40 text-left transition flex items-start gap-2.5 cursor-pointer group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-[#800C1E] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                                <Bot className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-[#800C1E] group-hover:underline">
                                  {editableText('biodataMethod1Title')}
                                </div>
                                <div className="text-[10px] text-slate-600 font-bold leading-snug mt-0.5">
                                  {editableText('biodataMethod1Desc')}
                                </div>
                              </div>
                            </button>
                          )}

                          {/* Method 2: Quick BioData Card Photo Upload */}
                          {webCms.showBiodataMethod2Quick && (
                            <button
                              type="button"
                              onClick={() => {
                                setRegistrationStep('quick_biodata');
                                setIsRegisterOpen(true);
                              }}
                              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-400/60 text-left transition flex items-start gap-2.5 cursor-pointer group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Camera className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-emerald-900 group-hover:underline">
                                  {editableText('biodataMethod2Title')}
                                </div>
                                <div className="text-[10px] text-slate-600 font-bold leading-snug mt-0.5">
                                  {editableText('biodataMethod2Desc')}
                                </div>
                              </div>
                            </button>
                          )}

                          {/* Method 3: Full 5-Step Manual BioData Form */}
                          {webCms.showBiodataMethod3Manual && (
                            <button
                              type="button"
                              onClick={() => {
                                setRegistrationStep('manual');
                                setIsRegisterOpen(true);
                              }}
                              className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-400/70 text-left transition flex items-start gap-2.5 cursor-pointer group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-amber-950 group-hover:underline">
                                  {editableText('biodataMethod3Title')}
                                </div>
                                <div className="text-[10px] text-slate-600 font-bold leading-snug mt-0.5">
                                  {editableText('biodataMethod3Desc')}
                                </div>
                              </div>
                            </button>
                          )}

                          {/* Method 4: Free Marathi PDF BioData Maker */}
                          {webCms.showBiodataMethod4PdfMaker && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsBioDataMakerOpen(true);
                              }}
                              className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-300 text-left transition flex items-start gap-2.5 cursor-pointer group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-indigo-950 group-hover:underline">
                                  {editableText('biodataMethod4Title')}
                                </div>
                                <div className="text-[10px] text-slate-600 font-bold leading-snug mt-0.5">
                                  {editableText('biodataMethod4Desc')}
                                </div>
                              </div>
                            </button>
                          )}
                        </div>

                        {currentUser && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2">
                            <span>
                              ✅ सध्या लॉगिन प्रोफाईल: <strong>{currentUser.fullName}</strong> ({currentUser.mobile})
                            </span>
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                              सक्रिय
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. STEP 1: PAYMENT + LOGIN ID & PASSWORD SETUP FORM */}
                <div id="website_plans_selection_section" className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300/90 shadow-xl space-y-5">
                  <div className="border-b border-amber-200 pb-3">
                    <div className="text-[11px] font-black text-[#800C1E] uppercase tracking-wider mb-1">
                      {editableText('paySectionBadge')}
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {editableText('paySectionHeading')}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {editableText('paySectionSubtitle')}
                    </p>
                  </div>

                  {/* Plan Selection Cards */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 block">
                      {editableText('planSelectLabel')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {plansList
                        .filter((plan) => plan.isActive !== false && plan.id !== 'free')
                        .map((plan) => {
                          const isSelected = plan.id === targetPlan.id;
                          return (
                            <div
                              key={plan.id}
                              onClick={() => {
                                setSelectedPlanId(plan.id);
                                setCustomAmount(null);
                              }}
                              className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-50/90 border-[#800C1E] shadow-xs'
                                  : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                              }`}
                            >
                              <div>
                                {plan.badgeText && (
                                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-amber-200/80 text-[#800C1E] mb-1">
                                    {plan.badgeText}
                                  </span>
                                )}
                                <div className="text-xs font-black text-slate-900">
                                  {plan.nameMr || plan.name}
                                </div>
                                <div className="text-[11px] text-slate-600 font-semibold">
                                  वैधता: {plan.duration} • {plan.unlockCount || plan.contacts || 50} संपर्क
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-base font-black text-[#800C1E]">₹{plan.price}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* 🎁 PROMO CODE / VIP DISCOUNT COUPON BOX ON WEBSITE CHECKOUT */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90 border-2 border-amber-300 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-black text-[#800C1E] flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-[#800C1E]" />
                        <span>🎁 तुमच्याकडे विशेष प्रोमो कोड / कूपन कोड आहे का? (Promo Code)</span>
                      </div>
                      {appliedPromo && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                          ✓ {appliedPromo.code} लागू झाला!
                        </span>
                      )}
                    </div>

                    {/* Optional Public Banner Promo Codes (Only if Admin enabled showInBanner on a code) */}
                    {promoCodes.filter((p) => p.isActive && p.showInBanner).length > 0 && !appliedPromo && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-bold text-slate-600">उपलब्ध ऑफर कोड:</span>
                        {promoCodes
                          .filter((p) => p.isActive && p.showInBanner)
                          .map((bp) => (
                            <button
                              key={bp.id}
                              type="button"
                              onClick={() => handleApplyCheckoutPromoCode(bp.code)}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-400 text-[#800C1E] font-mono font-black text-[11px] cursor-pointer transition"
                            >
                              🏷️ {bp.code} लागू करा
                            </button>
                          ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          if (promoFeedbackError) setPromoFeedbackError('');
                        }}
                        placeholder="येथे प्रोमो कोड टाका (उदा. VIPFREE / VANJARI50)"
                        className="flex-1 px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl font-mono font-black text-slate-900 uppercase tracking-wider focus:outline-none focus:border-[#800C1E]"
                      />
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={handleRemoveCheckoutPromoCode}
                          className="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-black text-xs cursor-pointer shrink-0"
                        >
                          ✕ कोड काढा
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyCheckoutPromoCode()}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-amber-200 font-black text-xs shadow-sm cursor-pointer shrink-0"
                        >
                          ✓ प्रोमो कोड लागू करा
                        </button>
                      )}
                    </div>

                    {promoFeedbackError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{promoFeedbackError}</span>
                      </div>
                    )}

                    {appliedPromo && (
                      <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-1.5">
                        <div className="font-black text-xs text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{appliedPromo.message}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200 text-[11px]">
                          <div>
                            <span className="text-slate-500 block font-bold">मूळ किंमत:</span>
                            <span className="font-mono font-bold line-through text-slate-600">₹{basePlanAmount}</span>
                          </div>
                          <div>
                            <span className="text-emerald-700 block font-bold">सवलत बचत:</span>
                            <span className="font-mono font-black text-emerald-700">- ₹{appliedPromo.discountAmount}</span>
                          </div>
                          <div>
                            <span className="text-[#800C1E] block font-bold">अंतिम देय रक्कम:</span>
                            <span className="font-mono font-black text-sm text-[#800C1E]">
                              {appliedPromo.isVipFree || finalAmount <= 0 ? '₹० (१००% मोफत VIP)' : `₹${finalAmount}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Candidate Name, Mobile (Login ID), Gender & Desired Password */}
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          {editableText('candidateNameLabel')}
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder={webCms.candidateNamePlaceholder}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#800C1E]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          {editableText('genderSelectLabel')}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setUserGender('groom')}
                            className={`py-2.5 rounded-xl font-black text-xs border cursor-pointer ${
                              userGender === 'groom'
                                ? 'bg-[#800C1E] text-white border-[#800C1E]'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            {editableText('groomBtnText')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserGender('bride')}
                            className={`py-2.5 rounded-xl font-black text-xs border cursor-pointer ${
                              userGender === 'bride'
                                ? 'bg-[#800C1E] text-white border-[#800C1E]'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            {editableText('brideBtnText')}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#800C1E] block mb-1">
                        {editableText('mobileLoginIdLabel')}
                      </label>
                      <input
                        type="tel"
                        value={userMobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(-10);
                          setUserMobile(val);
                          if (val !== userMobile) {
                            setIsCheckoutPhoneVerified(false);
                            setCheckoutOtpSent(false);
                            setCheckoutOtpError('');
                            setCheckoutOtpSuccess('');
                          }
                        }}
                        placeholder={webCms.mobileLoginIdPlaceholder}
                        className="w-full px-3.5 py-2.5 bg-amber-50/60 border-2 border-amber-300 rounded-xl font-mono font-black text-sm text-slate-900 focus:outline-none focus:border-[#800C1E]"
                      />

                      {/* 🔐 1-Click Google Verification (Primary) + Optional Email OTP Fallback */}
                      <div id="checkout_otp_verification_section" className="mt-3 p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-black text-[#800C1E]">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>१-क्लिक Google खाते पडताळणी</span>
                          </div>
                          {isCheckoutPhoneVerified ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>पडताळणी पूर्ण ✓</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-[#800C1E] font-bold text-[10px]">
                              पडताळणी आवश्यक
                            </span>
                          )}
                        </div>

                        {isCheckoutPhoneVerified ? (
                          <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>✅ तुमचे खाते ({checkoutEmail || `+91 ${userMobile.replace(/\D/g, '').slice(-10)}`}) यशस्वीरित्या पडताळले गेले आहे! आता तुम्ही सुरक्षितपणे पेमेंट करू शकता.</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                              कोणत्याही OTP ची वाट न पाहता फक्त १ क्लिकमध्ये तुमच्या Google खात्याने सुरक्षित पडताळणी पूर्ण करा.
                            </p>

                            <button
                              type="button"
                              onClick={handleCheckoutGoogleVerify}
                              disabled={isGoogleVerifyingCheckout || userMobile.replace(/\D/g, '').length !== 10}
                              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-300 hover:border-blue-500 text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-sm flex items-center justify-center gap-2.5 cursor-pointer transition disabled:opacity-50"
                            >
                              {isGoogleVerifyingCheckout ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              ) : (
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                              )}
                              <span>
                                {isGoogleVerifyingCheckout
                                  ? 'Google पडताळणी सुरू आहे...'
                                  : 'गुगलने १-क्लिक पडताळणी करा (OTP ची गरज नाही)'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowCheckoutEmailOtpFallback((prev) => !prev)}
                              className="w-full text-center text-[11px] font-bold text-slate-600 hover:text-[#800C1E] underline cursor-pointer"
                            >
                              {showCheckoutEmailOtpFallback ? 'ईमेल OTP पर्याय लपवा' : 'किंवा ईमेल OTP ने पडताळणी करायची आहे?'}
                            </button>

                            {showCheckoutEmailOtpFallback && (
                              <div className="space-y-2 pt-1.5 border-t border-amber-200">
                                <input
                                  type="email"
                                  value={checkoutEmail}
                                  onChange={(e) => setCheckoutEmail(e.target.value)}
                                  placeholder="तुमचा ईमेल आयडी टाका (उदा. name@gmail.com)"
                                  className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#800C1E]"
                                />

                                {checkoutOtpSent ? (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex gap-2">
                                      <input
                                        type="tel"
                                        maxLength={4}
                                        value={checkoutOtpCode}
                                        onChange={(e) => setCheckoutOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="ईमेलवरील ४-अंकी OTP टाका"
                                        className="flex-1 px-3.5 py-2.5 bg-white border-2 border-amber-400 rounded-xl font-mono font-black text-center text-sm tracking-widest text-slate-900 focus:outline-none focus:border-[#800C1E]"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleVerifyCheckoutOtp}
                                        disabled={isVerifyingCheckoutOtp || checkoutOtpCode.length !== 4}
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                                      >
                                        {isVerifyingCheckoutOtp ? 'तपासत आहे...' : editableText('otpVerifyBtnText')}
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px]">
                                      <button
                                        type="button"
                                        onClick={handleSendCheckoutOtp}
                                        disabled={checkoutOtpCooldown > 0 || isSendingCheckoutOtp}
                                        className="text-[#800C1E] font-bold hover:underline cursor-pointer disabled:opacity-50"
                                      >
                                        {checkoutOtpCooldown > 0 ? `पुन्हा पाठवा (${checkoutOtpCooldown}s)` : '🔄 पुन्हा ईमेल OTP पाठवा'}
                                      </button>
                                      <span className="text-[10px] text-slate-500 font-bold">
                                        ईमेल Inbox / Spam तपासा
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleSendCheckoutOtp}
                                    disabled={isSendingCheckoutOtp || userMobile.replace(/\D/g, '').length !== 10 || !checkoutEmail.includes('@')}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{isSendingCheckoutOtp ? 'ईमेल OTP पाठवत आहे...' : editableText('otpSendBtnText')}</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {checkoutOtpError && (
                              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
                                {checkoutOtpError}
                              </div>
                            )}
                            {checkoutOtpSuccess && !isCheckoutPhoneVerified && (
                              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                                {checkoutOtpSuccess}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Set Password Box right on the form */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-emerald-700" />
                          <span>{editableText('passwordBoxTitle')}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showPassword ? 'लपवा' : 'पासवर्ड पहा'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            {editableText('passwordNewLabel')}
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={desiredPassword}
                            onChange={(e) => setDesiredPassword(e.target.value)}
                            placeholder={webCms.passwordNewPlaceholder}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            {editableText('passwordConfirmLabel')}
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmDesiredPassword}
                            onChange={(e) => setConfirmDesiredPassword(e.target.value)}
                            placeholder={webCms.passwordConfirmPlaceholder}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Crisp 1-Line Mandatory Legal Consent Checkbox */}
                  <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-900">
                      <input
                        type="checkbox"
                        checked={acceptedWebLegalConsent}
                        onChange={(e) => setAcceptedWebLegalConsent(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#800C1E] shrink-0 cursor-pointer"
                      />
                      <span>
                        {editableText('legalConsentPrefix')}{' '}
                        <a
                          href="/razorpay-terms"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#800C1E] underline font-black"
                        >
                          {editableText('legalConsentLinkText')}
                        </a>{' '}
                        {editableText('legalConsentSuffix')}
                      </span>
                    </label>
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!acceptedWebLegalConsent) {
                        setPaymentError('कृपया अटी व गोपनीयता धोरणाचा १-लाईन संमती चेकबॉक्स टिक करा.');
                        return;
                      }
                      handlePayWithRazorpay();
                    }}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 ${
                      appliedPromo && (appliedPromo.isVipFree || finalAmount <= 0)
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-600'
                        : 'bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E]'
                    } hover:brightness-110 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                        <span>प्रक्रिया सुरू आहे...</span>
                      </>
                    ) : appliedPromo && (appliedPromo.isVipFree || finalAmount <= 0) ? (
                      <>
                        <Gift className="w-5 h-5 text-amber-300" />
                        <span>🎉 ₹० मोफत VIP प्रोमो कोडने आताच लॉगिन आयडी सक्रिय करा</span>
                        <ArrowRight className="w-5 h-5 text-amber-300" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-amber-300" />
                        <span>₹{finalAmount} {editableText('paySubmitBtnSuffix')}</span>
                        <ArrowRight className="w-5 h-5 text-amber-300" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-semibold">
                      {editableText('forgotPromptText')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot_password_otp')}
                      className="text-[#075E54] font-black hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{editableText('forgotPromptLinkText')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: FORGOT PASSWORD / SET PASSWORD VIA EMAIL OTP                   */}
        {/* ===================================================================== */}
        {activeTab === 'forgot_password_otp' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-400 shadow-xl space-y-5">
            <div className="border-b border-emerald-200 pb-3">
              <div className="text-[11px] font-black text-[#075E54] uppercase tracking-wider mb-1">
                {editableText('forgotTabBadge')}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {editableText('forgotTabHeading')}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {editableText('forgotTabSubtitle')}
              </p>
            </div>

            {resetCompleted ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-emerald-950">
                  {otpSuccessMsg}
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-emerald-300 text-xs max-w-md mx-auto">
                  <div>
                    <span className="text-slate-500 block font-bold">लॉगिन आयडी (Mobile):</span>
                    <span className="font-mono text-base font-black text-[#800C1E]">{otpMobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold">नवीन पासवर्ड:</span>
                    <span className="font-mono text-base font-black text-emerald-700">{newResetPassword}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleReturnToApp}
                    className="px-5 py-3 rounded-xl bg-[#075E54] text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>📲 वंजारी जोडी ॲप उघडा व लॉगिन करा</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetCompleted(false);
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    पुन्हा दुसरा नंबर बदला
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtpAndResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {editableText('forgotMobileLabel')}
                  </label>
                  <input
                    type="tel"
                    value={otpMobile}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(-10);
                      setOtpMobile(clean);
                      setIsForgotGoogleVerified(false);
                      if (clean.length === 10 && !forgotEmail) {
                        const found = profiles.find(
                          (p) => (p.mobile || '').replace(/\D/g, '').slice(-10) === clean
                        );
                        if (found?.email) setForgotEmail(found.email);
                      }
                    }}
                    placeholder="१०-अंकी मोबाईल नंबर टाका"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-black text-sm text-slate-900 focus:outline-none focus:border-[#075E54]"
                    required
                  />
                </div>

                {!isForgotGoogleVerified && (
                  <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
                    <button
                      type="button"
                      onClick={handleForgotGoogleVerify}
                      disabled={isGoogleVerifyingForgot || otpMobile.replace(/\D/g, '').length !== 10}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-300 hover:border-blue-500 text-slate-900 font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2.5 cursor-pointer transition disabled:opacity-50"
                    >
                      {isGoogleVerifyingForgot ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      <span>
                        {isGoogleVerifyingForgot
                          ? 'Google पडताळणी सुरू आहे...'
                          : 'गुगलने १-क्लिक पडताळून नवीन पासवर्ड सेट करा (OTP नाही)'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowForgotEmailOtpFallback((prev) => !prev)}
                      className="w-full text-center text-[11px] font-bold text-slate-600 hover:text-[#075E54] underline cursor-pointer"
                    >
                      {showForgotEmailOtpFallback ? 'ईमेल OTP पर्याय लपवा' : 'किंवा ईमेल OTP ने पासवर्ड बदलायचा आहे?'}
                    </button>

                    {showForgotEmailOtpFallback && (
                      <div className="space-y-2.5 pt-2 border-t border-blue-200">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            📧 OTP मिळवण्यासाठी ईमेल आयडी (Email ID):
                          </label>
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="उदा. name@gmail.com"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:border-[#075E54]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendForgotOtp}
                          disabled={isSendingOtp}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#075E54] to-[#128C7E] hover:brightness-110 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isSendingOtp ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>ईमेल OTP पाठवत आहे...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" />
                              <span>{otpSent ? 'पुन्हा ईमेल OTP पाठवा' : editableText('forgotSendOtpBtn')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {otpSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1.5">
                    <div className="font-black text-xs">{otpSuccessMsg}</div>
                  </div>
                )}

                {(otpSent || isForgotGoogleVerified) && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    {!isForgotGoogleVerified && (
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          ईमेलवर आलेला ४-अंकी OTP कोड टाका:
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="4-Digit Email OTP"
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-emerald-400 rounded-xl font-mono font-black text-base tracking-widest text-center text-slate-900"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          नवीन पासवर्ड टाका (New Password):
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="किमान ४ अक्षरे किंवा अंक"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          पासवर्ड पुन्हा टाका (Confirm Password):
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="पुन्हा पासवर्ड टाका"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>OTP तपासून पासवर्ड सेव्ह होत आहे...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>{editableText('forgotSavePassBtn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {otpError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 font-bold text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: SECURE ADMIN LOGIN & ZERO-LEAK SERVER CONTROL CENTER           */}
        {/* ===================================================================== */}
        {activeTab === 'admin_portal' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-800 shadow-2xl space-y-5 text-xs">
            {!isAdminAuthenticated ? (
              /* LOCKED ADMIN LOGIN SCREEN */
              <div className="max-w-md mx-auto py-4 space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-lg border border-amber-400/40">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="text-[11px] font-black text-[#800C1E] uppercase tracking-wider">
                    🔐 झिरो-लीक सर्व्हर सिक्युरिटी व्हॉल्ट
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    अधिकृत ॲडमिन लॉगिन (Admin Login)
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    SMS गेटवे API Keys, Razorpay सीक्रेट व्हॉल्ट, Google Play / Razorpay अधिकृत पेजेस लिंक्स आणि संपूर्ण मॅट्रिमोनी ॲडमिन पॅनेल उघडण्यासाठी लॉगिन करा.
                  </p>
                </div>

                <form onSubmit={handleWebsiteAdminLogin} className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      ॲडमिन युजरनेम (Admin Username):
                    </label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      ॲडमिन पासवर्ड / सुरक्षा पिन (Admin Password):
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="ॲडमिन पासवर्ड टाका"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 pr-10 focus:outline-none focus:border-slate-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer"
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {adminLoginError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 font-bold text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{adminLoginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingInAdmin}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoggingInAdmin ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>सर्व्हर पडताळणी सुरू आहे...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>🔓 सुरक्षित ॲडमिन लॉगिन करा</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                  <div className="font-black flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-700" />
                    <span>🛡️ 100% Server-Side Key Protection:</span>
                  </div>
                  <p>
                    तुमची कोणतीही SMS API Key, Razorpay Secret किंवा डेटाबेस की फ्रंटएंड कोडमध्ये उघडी (Open) ठेवली जात नाही. सर्व सीक्रेट्स फक्त सर्व्हरवर एन्क्रिप्टेड/प्रोटेक्टेड राहतात.
                  </p>
                </div>
              </div>
            ) : (
              /* UNLOCKED ADMIN CONTROL CENTER */
              <div className="space-y-5">
                {/* Admin Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl border border-amber-400/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] text-amber-300 font-bold">
                        ✓ सुरक्षित सर्व्हर सेशन सक्रिय • {adminDisplayName}
                      </div>
                      <h2 className="text-sm sm:text-base font-black text-white">
                        वेबसाईट ॲडमिन कंट्रोल सेंटर आणि सीक्रेट व्हॉल्ट
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenAdmin) onOpenAdmin();
                        else setIsAdminOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>पूर्ण मॅट्रिमोनी ॲडमिन पॅनेल उघडा</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleWebsiteAdminLogout}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>लॉगआउट</span>
                    </button>
                  </div>
                </div>

                {/* Live Summary Counter Strip inside Website Admin */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <div
                    onClick={() => {
                      setAdminSubTab('members_ledger');
                      setMemberFilterTab('all');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-400"
                  >
                    <div className="text-[10px] font-bold text-slate-500">👥 एकूण बायोडाटा</div>
                    <div className="text-base font-black text-slate-900">{allUnifiedProfiles.length}</div>
                  </div>
                  <div
                    onClick={() => {
                      setAdminSubTab('members_ledger');
                      setMemberFilterTab('paid');
                    }}
                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer hover:border-emerald-500"
                  >
                    <div className="text-[10px] font-bold text-emerald-800">💎 पेड मेंबर्स</div>
                    <div className="text-base font-black text-emerald-700">{paidProfilesList.length}</div>
                  </div>
                  <div
                    onClick={() => {
                      setAdminSubTab('members_ledger');
                      setMemberFilterTab('free_granted');
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 cursor-pointer hover:border-amber-500"
                  >
                    <div className="text-[10px] font-bold text-amber-900">🎁 फ्री दिलेले मेंबर्स</div>
                    <div className="text-base font-black text-[#800C1E]">{freeGrantedProfilesList.length}</div>
                  </div>
                  <div
                    onClick={() => {
                      setAdminSubTab('members_ledger');
                      setMemberFilterTab('unpaid');
                    }}
                    className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 cursor-pointer hover:border-rose-400"
                  >
                    <div className="text-[10px] font-bold text-rose-800">⏳ पैसे न भरलेले</div>
                    <div className="text-base font-black text-rose-700">{unpaidProfilesList.length}</div>
                  </div>
                  <div
                    onClick={() => {
                      setAdminSubTab('members_ledger');
                      setMemberFilterTab('admin_added');
                    }}
                    className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 cursor-pointer hover:border-purple-400"
                  >
                    <div className="text-[10px] font-bold text-purple-900">🛡️ ॲडमिनने भरलेले</div>
                    <div className="text-base font-black text-purple-700">{adminAddedProfilesList.length}</div>
                  </div>
                  <div
                    onClick={() => setAdminSubTab('sms_vault')}
                    className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 cursor-pointer hover:border-teal-400"
                  >
                    <div className="text-[10px] font-bold text-teal-900">📧 ईमेल OTP गेटवे</div>
                    <div className="text-base font-black text-[#075E54]">
                      {emailOtpConfig.hasSmtpPass || emailOtpConfig.hasResendApiKey ? 'सक्रिय ✓' : 'सेटअप करा'}
                    </div>
                  </div>
                </div>

                {/* Admin 9 Sub-Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAdminSubTab('plans_manager')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'plans_manager'
                        ? 'bg-[#800C1E] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    <span>१. प्लॅन्स व किमती</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('promo_manager')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'promo_manager'
                        ? 'bg-gradient-to-r from-[#800C1E] to-purple-900 text-amber-300 shadow-xs ring-2 ring-amber-400'
                        : 'bg-amber-50/80 text-[#800C1E] border border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span>🎁 प्रोमो कोड व ऑफर</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('ad_manager')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'ad_manager'
                        ? 'bg-[#800C1E] text-amber-300 shadow-xs ring-1 ring-amber-400'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>२. जाहिरात व बॅनर</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('web_app_settings')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'web_app_settings'
                        ? 'bg-[#800C1E] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>३. वेबसाईट व ॲप बदल</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('members_ledger')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'members_ledger'
                        ? 'bg-[#800C1E] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>४. सदस्य, फ्री व प्रिंट</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('sms_vault')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'sms_vault'
                        ? 'bg-slate-900 text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>५. ईमेल OTP गेटवे</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('backup_supabase')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'backup_supabase'
                        ? 'bg-[#075E54] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span>६. बॅकअप (Supabase)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('razorpay_vault')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'razorpay_vault'
                        ? 'bg-slate-900 text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 shrink-0" />
                    <span>७. Razorpay व्हॉल्ट</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubTab('compliance_links')}
                    className={`py-2 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition ${
                      adminSubTab === 'compliance_links'
                        ? 'bg-slate-900 text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span>८. Play/RZP लिंक्स</span>
                  </button>
                </div>

                {/* ========================================================= */}
                {/* SUB-TAB: WEBSITE PROMO CODE & VIP COUPON CREATOR STUDIO   */}
                {/* ========================================================= */}
                {adminSubTab === 'promo_manager' && (
                  <div className="space-y-5">
                    {adminPromoFeedback && (
                      <div
                        className={`p-3.5 rounded-2xl font-black text-xs flex items-center justify-between gap-2 border-2 ${
                          adminPromoFeedback.startsWith('✅')
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            : 'bg-rose-50 border-rose-400 text-rose-950'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 shrink-0" />
                          <span>{adminPromoFeedback}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdminPromoFeedback('')}
                          className="text-slate-500 hover:text-slate-900 font-black px-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Promo Studio Header Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#800C1E] via-[#9B111E] to-purple-950 text-white border-2 border-amber-400 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5" />
                            <span>🎁 वेबसाईट प्रोमो कोड व VIP पास स्टुडिओ</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-200 bg-emerald-900/70 px-2.5 py-0.5 rounded-full border border-emerald-400/50">
                            ✓ १००% मोफत (₹०) किंवा डिस्काउंट कोड तयार करा
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-amber-300">
                          ज्या सदस्याला सवलत किंवा मोफत VIP प्रवेश द्यायचा आहे त्याच्यासाठी कूपन कोड बनवा
                        </h3>
                        <p className="text-xs text-amber-100/90 font-medium">
                          येथे तयार केलेला प्रोमो कोड फायरबेसवर थेट सेव्ह होतो. सदस्य वेबसाईटवर किंवा आयफोन/अँड्रॉइडवर हा कोड टाकून लगेच सवलत किंवा १००% मोफत मेंबरशिप (लॉगिन आयडी-पासवर्डसह) मिळवू शकतो!
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-amber-300/40 text-center">
                          <div className="text-[10px] text-amber-200 font-bold">एकूण प्रोमो कोड्स</div>
                          <div className="text-lg font-black text-amber-300">{promoCodes.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* 1-Click Quick Preset Templates */}
                    <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-2.5">
                      <div className="text-xs font-black text-[#800C1E] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>⚡ १-क्लिक रेडीमेड प्रोमो कोड टेम्पलेट्स (क्लिक करा आणि खाली लगेच तयार करा):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewPromoType('vip_free');
                            setNewPromoVal('100');
                            setNewPromoValidityDays(365);
                            setNewPromoMaxUses('1');
                            setNewPromoShowBanner(false);
                            setNewPromoCodeStr(`VIPFREE${Math.floor(100 + Math.random() * 900)}`);
                            setNewPromoDesc('१००% मोफत VIP मेंबरशिप पास (₹०)');
                          }}
                          className="p-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-xs flex items-center justify-between border border-amber-300 shadow-xs cursor-pointer transition"
                        >
                          <span>👑 १००% मोफत VIP पास (₹०)</span>
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px]">Free</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewPromoType('percentage');
                            setNewPromoVal('50');
                            setNewPromoValidityDays(180);
                            setNewPromoMaxUses('50');
                            setNewPromoShowBanner(true);
                            setNewPromoCodeStr('VANJARI50');
                            setNewPromoDesc('विशेष ५०% भरघोस सवलत ऑफर');
                          }}
                          className="p-2.5 rounded-xl bg-[#800C1E] hover:bg-[#9B111E] text-white font-black text-xs flex items-center justify-between border border-amber-300 shadow-xs cursor-pointer transition"
                        >
                          <span>🔥 ५०% सूट (50% OFF)</span>
                          <span className="px-2 py-0.5 rounded bg-amber-300 text-slate-950 text-[10px]">50%</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewPromoType('flat');
                            setNewPromoVal('200');
                            setNewPromoValidityDays(180);
                            setNewPromoMaxUses('100');
                            setNewPromoShowBanner(false);
                            setNewPromoCodeStr('SAVE200');
                            setNewPromoDesc('थेट ₹२०० रोख सवलत कूपन');
                          }}
                          className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-between border border-emerald-400 shadow-xs cursor-pointer transition"
                        >
                          <span>💸 ₹२०० थेट सूट (Flat Off)</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-300 text-slate-950 text-[10px]">-₹200</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewPromoType('special_price');
                            setNewPromoTargetPrice('199');
                            setNewPromoValidityDays(180);
                            setNewPromoMaxUses('50');
                            setNewPromoShowBanner(false);
                            setNewPromoCodeStr('SPECIAL199');
                            setNewPromoDesc('कोणताही प्लॅन फक्त ₹१९९ मध्ये');
                          }}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center justify-between border border-amber-400 shadow-xs cursor-pointer transition"
                        >
                          <span>🎯 स्पेशल ₹१९९ फिक्स किंमत</span>
                          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px]">₹199</span>
                        </button>
                      </div>
                    </div>

                    {/* Create New Promo Code Form */}
                    <form
                      onSubmit={handleAdminCreatePromoCode}
                      className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <PlusCircle className="w-4 h-4 text-[#800C1E]" />
                          <span>➕ नवीन प्रोमो कोड / VIP पास तयार करा:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGenerateRandomPromoCode()}
                          className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#800C1E] border border-amber-300 font-black text-xs cursor-pointer transition"
                        >
                          🎲 ऑटो रँडम कोड बनवा
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* 1. Code String */}
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            १. प्रोमो कोडचे नाव (Code) *
                          </label>
                          <input
                            type="text"
                            value={newPromoCodeStr}
                            onChange={(e) =>
                              setNewPromoCodeStr(
                                e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
                              )
                            }
                            placeholder="उदा. VIPFREE100 किंवा DIWALI50"
                            className="w-full px-3 py-2.5 bg-amber-50/70 border-2 border-amber-400 rounded-xl font-mono font-black uppercase text-slate-900 text-xs"
                          />
                        </div>

                        {/* 2. Discount Type */}
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            २. सवलतीचा प्रकार (Offer Type) *
                          </label>
                          <select
                            value={newPromoType}
                            onChange={(e) => setNewPromoType(e.target.value as any)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                          >
                            <option value="vip_free">👑 १००% मोफत VIP (₹० - पेमेंटशिवाय प्रवेश)</option>
                            <option value="percentage">🔥 टक्केवारी सूट (% Percentage Off)</option>
                            <option value="flat">💸 थेट रक्कम सूट (₹ Flat Cash Off)</option>
                            <option value="special_price">🎯 विशेष फिक्स किंमत (Special Final ₹)</option>
                          </select>
                        </div>

                        {/* 3. Discount Value or Target Price */}
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            {newPromoType === 'vip_free'
                              ? '३. देय रक्कम (१००% मोफत)'
                              : newPromoType === 'special_price'
                              ? '३. सदस्याकडून घ्यायची फिक्स किंमत (₹) *'
                              : newPromoType === 'percentage'
                              ? '३. किती टक्के (%) सूट द्यायची? *'
                              : '३. किती रुपये (₹) सूट द्यायची? *'}
                          </label>
                          {newPromoType === 'vip_free' ? (
                            <div className="px-3 py-2.5 rounded-xl bg-purple-100 border border-purple-300 text-purple-950 font-black text-xs">
                              🎉 ₹० (१००% मोफत VIP)
                            </div>
                          ) : newPromoType === 'special_price' ? (
                            <input
                              type="number"
                              min={1}
                              value={newPromoTargetPrice}
                              onChange={(e) => setNewPromoTargetPrice(e.target.value)}
                              placeholder="उदा. 199"
                              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-black text-slate-900 text-xs"
                            />
                          ) : (
                            <input
                              type="number"
                              min={1}
                              max={newPromoType === 'percentage' ? 100 : 10000}
                              value={newPromoVal}
                              onChange={(e) => setNewPromoVal(e.target.value)}
                              placeholder={newPromoType === 'percentage' ? '50' : '200'}
                              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-black text-slate-900 text-xs"
                            />
                          )}
                        </div>

                        {/* 4. Membership Validity Days */}
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            ४. मेंबरशिप वैधता दिवस (Validity)
                          </label>
                          <select
                            value={newPromoValidityDays}
                            onChange={(e) => setNewPromoValidityDays(Number(e.target.value) || 180)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                          >
                            <option value={30}>३० दिवस (१ महिना)</option>
                            <option value={90}>९० दिवस (३ महिने)</option>
                            <option value={180}>१८० दिवस (६ महिने)</option>
                            <option value={365}>३६५ दिवस (१ पूर्ण वर्ष)</option>
                            <option value={730}>७३० दिवस (२ वर्षे / लग्न जमेपर्यंत)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Max Uses */}
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            किती सदस्य हा कोड वापरू शकतात? (Max Uses)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={newPromoMaxUses}
                            onChange={(e) => setNewPromoMaxUses(e.target.value)}
                            placeholder="उदा. 1 (एकाच व्यक्तीसाठी) किंवा 100"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                            ऑफरचा तपशील / टीप (Optional)
                          </label>
                          <input
                            type="text"
                            value={newPromoDesc}
                            onChange={(e) => setNewPromoDesc(e.target.value)}
                            placeholder="उदा. विशेष सदस्यासाठी सवलत कोड"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                          />
                        </div>

                        {/* Public vs Secret Toggle */}
                        <div className="flex items-end">
                          <label className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                            <input
                              type="checkbox"
                              checked={newPromoShowBanner}
                              onChange={(e) => setNewPromoShowBanner(e.target.checked)}
                              className="w-4 h-4 accent-[#800C1E]"
                            />
                            <span>
                              {newPromoShowBanner
                                ? '📢 वेबसाईटवर सर्वांना बॅनरमध्ये दाखवा'
                                : '🔒 गुप्त (Secret) ठेवा - फक्त लिंक/कोड दिलेल्यांनाच'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <Gift className="w-4 h-4 text-amber-300" />
                          <span>✨ प्रोमो कोड तयार करा व सेव्ह करा</span>
                        </button>
                      </div>
                    </form>

                    {/* Direct WhatsApp / SMS Promo Sender Box */}
                    <div className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-black text-[#075E54] text-xs sm:text-sm flex items-center gap-1.5">
                          <Send className="w-4 h-4" />
                          <span>📲 सदस्याच्या मोबाईलवर थेट WhatsApp किंवा SMS ने प्रोमो कोड पाठवा:</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800">
                          खालील बॉक्समध्ये सदस्याचा नंबर टाका आणि कोणत्याही कोडसमोरील "WhatsApp पाठवा" दाबा
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={sharePromoMemberName}
                          onChange={(e) => setSharePromoMemberName(e.target.value)}
                          placeholder="सदस्याचे नाव (उदा. राहुल मुंडे - ऐच्छिक)"
                          className="px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-xs text-slate-900"
                        />
                        <input
                          type="tel"
                          maxLength={10}
                          value={sharePromoMobile}
                          onChange={(e) => setSharePromoMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="सदस्याचा १० अंकी WhatsApp मोबाईल नंबर (उदा. 9876543210)"
                          className="px-3 py-2 bg-white border-2 border-emerald-500 rounded-xl font-mono font-black text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Active & Saved Promo Codes List */}
                    <div className="space-y-3">
                      <div className="font-black text-slate-900 text-sm flex items-center justify-between">
                        <span>📋 तयार केलेले सर्व प्रोमो कोड्स ({promoCodes.length}):</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {promoCodes.map((promo) => {
                          const isVipFree =
                            promo.discountType === 'vip_free' ||
                            (promo.discountType === 'percentage' && Number(promo.discountValue) >= 100);
                          const isSpecPrice = promo.discountType === 'special_price';
                          const discountBadge = isVipFree
                            ? '👑 १००% मोफत VIP (₹०)'
                            : isSpecPrice
                            ? `🎯 फक्त ₹${promo.targetPrice ?? promo.discountValue} फिक्स`
                            : promo.discountType === 'percentage'
                            ? `🔥 ${promo.discountValue}% सूट`
                            : `💸 ₹${promo.discountValue} थेट सूट`;

                          const directPromoUrl = `https://vanjarijodi.web.app/?promo=${encodeURIComponent(
                            promo.code
                          )}`;

                          return (
                            <div
                              key={promo.id}
                              className={`p-4 rounded-2xl border-2 transition space-y-2.5 ${
                                promo.isActive
                                  ? isVipFree
                                    ? 'bg-purple-50/60 border-purple-300 shadow-xs'
                                    : 'bg-white border-amber-300 shadow-xs'
                                  : 'bg-slate-100 border-slate-300 opacity-70'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-3 py-1 rounded-xl bg-slate-900 text-amber-300 font-mono font-black text-sm tracking-wider">
                                    {promo.code}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#800C1E] text-white font-black text-[11px]">
                                    {discountBadge}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      promo.isSecret || !promo.showInBanner
                                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    }`}
                                  >
                                    {promo.isSecret || !promo.showInBanner ? '🔒 गुप्त कोड' : '📢 सार्वजनिक'}
                                  </span>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                                    promo.isActive
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-400 text-white'
                                  }`}
                                >
                                  {promo.isActive ? 'चालू (Active)' : 'बंद (Off)'}
                                </span>
                              </div>

                              {promo.description && (
                                <p className="text-xs font-bold text-slate-700">{promo.description}</p>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-semibold border-t border-slate-200/80 pt-2">
                                <span>
                                  वापरले: <strong>{promo.usedCount || 0}</strong>
                                  {promo.maxUses ? ` / ${promo.maxUses}` : ' (अमर्याद)'}
                                </span>
                                {promo.customValidityDays && (
                                  <span>
                                    वैधता: <strong>{promo.customValidityDays} दिवस</strong>
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-200/80">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(promo.code);
                                      setCopiedPromoCodeStr(promo.code);
                                      setTimeout(() => setCopiedPromoCodeStr(''), 2000);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>
                                      {copiedPromoCodeStr === promo.code ? '✓ कॉपी झाला!' : 'कोड कॉपी'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(directPromoUrl);
                                      setCopiedPromoCodeStr(`LINK_${promo.code}`);
                                      setTimeout(() => setCopiedPromoCodeStr(''), 2000);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-black text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Link2 className="w-3 h-3" />
                                    <span>
                                      {copiedPromoCodeStr === `LINK_${promo.code}`
                                        ? '✓ लिंक कॉपी!'
                                        : 'थेट लिंक कॉपी'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const memberGreeting = sharePromoMemberName.trim()
                                        ? `नमस्कार *${sharePromoMemberName.trim()}*,\n`
                                        : 'नमस्कार,\n';
                                      const msg = `🌸 *वंजारी जोडी वधू-वर सूचक केंद्र - विशेष ऑफर!* 🌸\n\n${memberGreeting}तुमच्यासाठी खास प्रोमो कोड देण्यात आला आहे:\n\n🎁 *प्रोमो कोड:* *${promo.code}*\n✨ *ऑफर लाभ:* ${discountBadge}\n\n👉 खालील अधिकृत लिंकवर क्लिक करा (कोड आपोआप लागू होईल):\n${directPromoUrl}\n\nकिंवा वेबसाईटवर पेमेंट करताना प्रोमो कोड बॉक्समध्ये *${promo.code}* टाका आणि लगेच आपला लॉगिन आयडी व पासवर्ड तयार करा!`;
                                      const cleanTarget = sharePromoMobile.replace(/\D/g, '').slice(-10);
                                      const waUrl =
                                        cleanTarget.length === 10
                                          ? `https://api.whatsapp.com/send?phone=91${cleanTarget}&text=${encodeURIComponent(msg)}`
                                          : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                                      const a = document.createElement('a');
                                      a.href = waUrl;
                                      a.target = '_blank';
                                      a.rel = 'noopener noreferrer';
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-[11px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>
                                      {sharePromoMobile.length === 10
                                        ? `WhatsApp (${sharePromoMobile})`
                                        : 'WhatsApp वर पाठवा'}
                                    </span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => togglePromoCodeStatus(promo.id)}
                                    className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] cursor-pointer"
                                  >
                                    {promo.isActive ? 'बंद करा' : 'चालू करा'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deletePromoCode(promo.id)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                                    title="डिलीट करा"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB: WEBSITE ADVERTISEMENT & BANNER MANAGER           */}
                {/* ========================================================= */}
                {adminSubTab === 'ad_manager' && (
                  <div className="space-y-5">
                    {adBannerFeedback && (
                      <div
                        className={`p-3.5 rounded-2xl font-black text-xs flex items-center gap-2 border-2 ${
                          adBannerFeedback.startsWith('✅')
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            : 'bg-rose-50 border-rose-400 text-rose-950'
                        }`}
                      >
                        <Info className="w-4 h-4 shrink-0" />
                        <span>{adBannerFeedback}</span>
                      </div>
                    )}

                    {/* Header Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#800C1E] text-amber-300 font-black text-[11px] flex items-center gap-1">
                            <Megaphone className="w-3.5 h-3.5" />
                            <span>२. जाहिरात व बॅनर व्यवस्थापन</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            ✓ रिअल-टाईम फायरबेस सिंक
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          वेबसाईटवर आकर्षक जाहिरात व फोटो बॅनर बदला
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          वेबसाईटवर फक्त किमती दाखवण्यापेक्षा लोकांचे लक्ष वेधून घेणारी जाहिरात दिसते. तुम्ही कोणताही आडवा (Landscape) किंवा उभा (Portrait) फोटो लावू शकता.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveAdBanner}
                        disabled={isSavingAdBanner}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingAdBanner ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                            <span>सेव्ह होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-amber-300" />
                            <span>बदल सेव्ह करा</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Controls Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left: Mode, Status, Orientation & Image Upload */}
                      <div className="space-y-4">
                        {/* 1. Status & Mode Card */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>जाहिरात बॅनर वेबसाईटवर दाखवा?</span>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={adBannerEnabled}
                                onChange={(e) => setAdBannerEnabled(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 block">
                              जाहिरातीचा प्रकार (Ad Style):
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setAdBannerMode('custom_image')}
                                className={`p-2.5 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition ${
                                  adBannerMode === 'custom_image'
                                    ? 'bg-amber-50 border-[#800C1E] text-[#800C1E] shadow-xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <ImageIcon className="w-4 h-4" />
                                <span>स्वतःचा फोटो / पोस्टर</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setAdBannerMode('dynamic_promo')}
                                className={`p-2.5 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition ${
                                  adBannerMode === 'dynamic_promo'
                                    ? 'bg-amber-50 border-[#800C1E] text-[#800C1E] shadow-xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <Star className="w-4 h-4 text-amber-500" />
                                <span>डायनॅमिक प्रोमो बॅनर</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 2. Photo Upload & Orientation Selection (Active when mode is custom_image) */}
                        {adBannerMode === 'custom_image' && (
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
                            <div>
                              <label className="text-xs font-black text-slate-800 block mb-1">
                                फोटोचा आकार व ओरिएंटेशन निवडा:
                              </label>
                              <p className="text-[11px] text-slate-500 mb-2">
                                तुम्ही आडवा फोटो टाकला तरी तो रुंद बॅनरसारखा दिसेल आणि उभा फोटो टाकला तरी तो आकर्षक पोस्टरसारखा दिसेल.
                              </p>

                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setAdBannerOrientation('horizontal')}
                                  className={`p-2.5 rounded-xl border-2 font-bold text-[11px] flex flex-col items-center gap-1 cursor-pointer transition ${
                                    adBannerOrientation === 'horizontal'
                                      ? 'bg-amber-100/80 border-[#800C1E] text-[#800C1E]'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="w-7 h-4 border border-current rounded-xs bg-current/20" />
                                  <span>आडवा फोटो (16:9)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAdBannerOrientation('vertical')}
                                  className={`p-2.5 rounded-xl border-2 font-bold text-[11px] flex flex-col items-center gap-1 cursor-pointer transition ${
                                    adBannerOrientation === 'vertical'
                                      ? 'bg-amber-100/80 border-[#800C1E] text-[#800C1E]'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="w-4 h-7 border border-current rounded-xs bg-current/20" />
                                  <span>उभा पोस्टर (3:4)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAdBannerOrientation('auto')}
                                  className={`p-2.5 rounded-xl border-2 font-bold text-[11px] flex flex-col items-center gap-1 cursor-pointer transition ${
                                    adBannerOrientation === 'auto'
                                      ? 'bg-amber-100/80 border-[#800C1E] text-[#800C1E]'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="w-5 h-5 border border-current rounded-xs bg-current/20" />
                                  <span>मूळ आकार (Auto)</span>
                                </button>
                              </div>
                            </div>

                            {/* Upload Input */}
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-800 block">
                                जाहिरातीचा फोटो अपलोड करा:
                              </label>

                              <div className="flex flex-col sm:flex-row gap-2">
                                <label className="flex-1 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-[#800C1E] rounded-xl border-2 border-dashed border-amber-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition">
                                  {isUploadingBannerPhoto ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin text-[#800C1E]" />
                                      <span>फोटो कॉम्प्रेस होत आहे...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 text-[#800C1E]" />
                                      <span>गॅलरी / कम्प्युटरमधून फोटो निवडा</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerPhotoUpload}
                                    disabled={isUploadingBannerPhoto}
                                    className="hidden"
                                  />
                                </label>

                                {adBannerImageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdBannerImageUrl('');
                                      setAdBannerFeedback('फोटो काढून टाकला आहे. बदल सेव्ह करण्यासाठी सेव्ह बटण दाबा.');
                                    }}
                                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>काढून टाका</span>
                                  </button>
                                )}
                              </div>

                              <div className="pt-1">
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                  किंवा थेट फोटोची लिंक (Image URL) टाका:
                                </label>
                                <input
                                  type="text"
                                  value={adBannerImageUrl}
                                  onChange={(e) => {
                                    setAdBannerImageUrl(e.target.value.trim());
                                    if (e.target.value) setAdBannerMode('custom_image');
                                  }}
                                  placeholder="https://... किंवा base64"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Text Customization & CTA Settings */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div className="border-b border-slate-100 pb-2">
                          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span>बॅनरवरील मजकूर व ॲक्शन बटण (Text & CTA)</span>
                          </label>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            बॅज मजकूर (Badge Ribbon):
                          </label>
                          <input
                            type="text"
                            value={adBannerBadge}
                            onChange={(e) => setAdBannerBadge(e.target.value)}
                            placeholder="उदा. 🎉 विशेष ऑफर ५०% सूट"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            मुख्य जाहिरात शीर्षक (Main Heading):
                          </label>
                          <input
                            type="text"
                            value={adBannerTitle}
                            onChange={(e) => setAdBannerTitle(e.target.value)}
                            placeholder="उदा. वंजारी समाज विशेष विवाह नोंदणी महोत्सव"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            उप-शीर्षक / माहिती (Subtitle / Description):
                          </label>
                          <textarea
                            rows={2}
                            value={adBannerSubtitle}
                            onChange={(e) => setAdBannerSubtitle(e.target.value)}
                            placeholder="जाहिरातीबद्दल अधिक माहिती टाका..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400 resize-none font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              बटणावरील मजकूर (CTA Button Text):
                            </label>
                            <input
                              type="text"
                              value={adBannerCtaText}
                              onChange={(e) => setAdBannerCtaText(e.target.value)}
                              placeholder="उदा. मेंबरशिप प्लॅन निवडा"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              बटणाची क्रिया (Action):
                            </label>
                            <select
                              value={adBannerCtaAction}
                              onChange={(e: any) => setAdBannerCtaAction(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-amber-400 cursor-pointer"
                            >
                              <option value="scroll_to_plans">खाली प्लॅन्सकडे स्क्रोल करा (Scroll)</option>
                              <option value="open_whatsapp">WhatsApp वर मेसेज करा</option>
                              <option value="call_support">सपोर्टला कॉल करा</option>
                              <option value="download_apk">अँड्रॉइड ॲप डाऊनलोड करा</option>
                              <option value="custom_url">कस्टम लिंक उघडा</option>
                            </select>
                          </div>
                        </div>

                        {adBannerCtaAction === 'custom_url' && (
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              कस्टम लिंक URL:
                            </label>
                            <input
                              type="url"
                              value={adBannerTargetUrl}
                              onChange={(e) => setAdBannerTargetUrl(e.target.value)}
                              placeholder="https://example.com"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LIVE PREVIEW SECTION */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-black text-amber-300">
                            थेट लाईव्ह प्रिव्ह्यू (Live Preview — वेबसाईटवर अशी दिसेल):
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {adBannerOrientation === 'horizontal' ? 'Landscape (आडवा)' : adBannerOrientation === 'vertical' ? 'Portrait (उभा)' : 'Auto'}
                        </span>
                      </div>

                      {/* Preview Container */}
                      <div className="bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800">
                        {adBannerMode === 'custom_image' && adBannerImageUrl ? (
                          adBannerOrientation === 'horizontal' ? (
                            <div className="rounded-2xl overflow-hidden border border-amber-400/50 relative bg-black">
                              <div className="relative aspect-[16/7] sm:aspect-[21/8] w-full">
                                <img
                                  src={adBannerImageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                {(adBannerTitle || adBannerSubtitle) && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3 sm:p-5 text-white">
                                    {adBannerBadge && (
                                      <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 w-max mb-1">
                                        {adBannerBadge}
                                      </span>
                                    )}
                                    <div className="font-black text-sm sm:text-lg">{adBannerTitle}</div>
                                    <div className="text-[11px] text-amber-100 line-clamp-1">{adBannerSubtitle}</div>
                                  </div>
                                )}
                              </div>
                              <div className="bg-[#800C1E] p-2 flex items-center justify-between text-xs px-3">
                                <span className="text-[11px] text-amber-200">१००% अधिकृत वंजारी जोडी</span>
                                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded text-[11px]">
                                  {adBannerCtaText || 'प्लॅन निवडा'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl text-slate-900 items-center">
                              <div className="md:col-span-5 flex justify-center">
                                <img
                                  src={adBannerImageUrl}
                                  alt="Preview"
                                  className="max-h-[220px] rounded-xl shadow-md border-2 border-white object-contain"
                                />
                              </div>
                              <div className="md:col-span-7 space-y-1.5">
                                {adBannerBadge && (
                                  <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-[#800C1E] text-amber-300">
                                    {adBannerBadge}
                                  </span>
                                )}
                                <div className="font-black text-sm text-slate-900">{adBannerTitle}</div>
                                <div className="text-[11px] text-slate-600 line-clamp-2">{adBannerSubtitle}</div>
                                <button
                                  type="button"
                                  className="mt-1 px-3 py-1.5 bg-[#800C1E] text-white font-bold text-xs rounded-lg flex items-center gap-1"
                                >
                                  <span>{adBannerCtaText || 'प्लॅन निवडा'}</span>
                                  <ArrowRight className="w-3 h-3 text-amber-300" />
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="p-4 bg-gradient-to-r from-amber-700 via-[#800C1E] to-rose-950 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="space-y-1">
                              {adBannerBadge && (
                                <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                  {adBannerBadge}
                                </span>
                              )}
                              <div className="font-black text-sm sm:text-base">{adBannerTitle}</div>
                              <div className="text-xs text-amber-100">{adBannerSubtitle}</div>
                            </div>
                            <span className="px-4 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs shrink-0">
                              {adBannerCtaText || 'प्लॅन निवडा'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Save Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveAdBanner}
                        disabled={isSavingAdBanner}
                        className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:brightness-110 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingAdBanner ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                            <span>सेव्ह होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-amber-300" />
                            <span>💾 जाहिरात व बॅनर सेटिंग्ज सेव्ह करा</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB 3: EXPLICIT WEBSITE vs ANDROID APP SETTINGS       */}
                {/* ========================================================= */}
                {adminSubTab === 'web_app_settings' && (
                  <div className="space-y-5">
                    {settingsSavedMsg && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-black text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{settingsSavedMsg}</span>
                      </div>
                    )}

                    {/* FULL WORD-BY-WORD & SECTION-BY-SECTION WEBSITE CMS EDITOR */}
                    <WebsiteFullCmsEditor
                      cms={webCms}
                      onChangeField={handleUpdateCmsField}
                      onResetDefaults={handleResetCmsDefaults}
                      onSaveAll={handleSaveWebAndAppSettings}
                      isLiveEditMode={isLiveWebsiteEditMode}
                      onToggleLiveEditMode={() => {
                        const next = !isLiveWebsiteEditMode;
                        setIsLiveWebsiteEditMode(next);
                        if (next) {
                          setActiveTab('pay_and_set_id');
                        }
                      }}
                      savedMessage={settingsSavedMsg}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* PANEL A: EXPLICIT WEBSITE SETTINGS */}
                      <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3">
                        <div className="border-b border-amber-200 pb-2 flex items-center justify-between">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded bg-[#800C1E] text-amber-200 font-black text-[10px] mb-1">
                              🌐 विभाग १: फक्त वेबसाईट मधील बदल (Website Settings)
                            </span>
                            <h3 className="font-black text-slate-900 text-sm">
                              🌐 वेबसाईट पोर्टल सेटिंग्ज (vanjarijodi.web.app)
                            </h3>
                          </div>
                          <Globe className="w-5 h-5 text-[#800C1E]" />
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              वेबसाईटचे मुख्य शीर्षक (Website Title):
                            </label>
                            <input
                              type="text"
                              value={webHeroTitle}
                              onChange={(e) => setWebHeroTitle(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              वेबसाईट उपशीर्षक / टॅगलाईन (Website Subtitle):
                            </label>
                            <input
                              type="text"
                              value={webSubtitle}
                              onChange={(e) => setWebSubtitle(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              वेबसाईट पेमेंट ऑफर बॅनर मजकूर:
                            </label>
                            <input
                              type="text"
                              value={webOfferBannerText}
                              onChange={(e) => setWebOfferBannerText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                                हेल्पलाईन कॉल नंबर:
                              </label>
                              <input
                                type="text"
                                value={webSupportPhone}
                                onChange={(e) => setWebSupportPhone(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                                WhatsApp सपोर्ट नंबर:
                              </label>
                              <input
                                type="text"
                                value={webWhatsappNum}
                                onChange={(e) => setWebWhatsappNum(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              अँड्रॉइड APK डाऊनलोड फाईल लिंक:
                            </label>
                            <input
                              type="text"
                              value={webApkUrl}
                              onChange={(e) => setWebApkUrl(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono text-slate-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PANEL B: EXPLICIT ANDROID APP SETTINGS (GOOGLE PLAY SAFE) */}
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400 space-y-3">
                        <div className="border-b border-emerald-200 pb-2 flex items-center justify-between">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded bg-[#075E54] text-white font-black text-[10px] mb-1">
                              📲 विभाग २: फक्त अँड्रॉइड ॲप मधील बदल (Google Play Safe)
                            </span>
                            <h3 className="font-black text-slate-900 text-sm">
                              📲 मोबाईल ॲप नियंत्रण व नवीन डाऊनलोडर अनुभव (०% पेमेंट उल्लेख)
                            </h3>
                          </div>
                          <Smartphone className="w-5 h-5 text-[#075E54]" />
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              ॲपमधील वरची मुख्य सूचना पट्टी (App Top Notice):
                            </label>
                            <input
                              type="text"
                              value={appTopMarqueeText}
                              onChange={(e) => setAppTopMarqueeText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              नवीन ॲप डाऊनलोड करणाऱ्यांसाठी आकर्षक स्वागत संदेश:
                            </label>
                            <input
                              type="text"
                              value={appWelcomeNewUserText}
                              onChange={(e) => setAppWelcomeNewUserText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                                नवीन युजरला मोफत दिसणारे बायोडाटा संख्या:
                              </label>
                              <input
                                type="number"
                                min={10}
                                value={appGuestPreviewLimit}
                                onChange={(e) => setAppGuestPreviewLimit(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900"
                              />
                            </div>
                            <div className="flex items-end pb-1">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950 text-[11px]">
                                <input
                                  type="checkbox"
                                  checked={appMutualLikePrivacy}
                                  onChange={(e) => setAppMutualLikePrivacy(e.target.checked)}
                                  className="w-4 h-4 accent-[#075E54]"
                                />
                                <span>❤️ Mutual Like नंतरच नंबर अनलॉक</span>
                              </label>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-emerald-950 font-semibold">
                            🛡️ <strong>Google Play Console Policy Guard:</strong> ॲपमध्ये रुपया (₹), प्लॅन किंमत किंवा पेमेंट गेटवेचा कुठेही उल्लेख दिसणार नाही. वेबसाईटवर पेमेंट किंवा ॲडमिनने फ्री दिल्यावर ॲपमध्ये आपोआप फुल-ॲक्सेस मिळतो.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PANEL C: MASTER WEBSITE & MATRIMONY FEATURE TOGGLES */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#2a0810] to-slate-900 text-white border-2 border-amber-400/80 space-y-4 shadow-lg">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] mb-1">
                            🎛️ विभाग ३: मास्टर वेबसाईट व मॅट्रिमोनी फीचर्स कंट्रोल (All-in-One Control)
                          </span>
                          <h3 className="font-black text-amber-300 text-sm sm:text-base">
                            १-क्लिकमध्ये वेबसाईट व ॲपमधील सर्व नियम, प्रायव्हसी आणि फीचर्स चालू/बंद करा
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdminSubTab('promo_manager')}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Gift className="w-4 h-4" />
                          <span>🎁 प्रोमो कोड स्टुडिओ उघडा</span>
                        </button>
                      </div>

                      {/* Email & Telegram Direct Editors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                          <label className="font-bold text-amber-200 block mb-1 text-[11px]">
                            📧 अधिकृत हेल्पलाईन व तक्रार निवारण ईमेल (Official Support Email):
                          </label>
                          <input
                            type="email"
                            value={siteConfig?.contactEmail || 'gitevijay123@gmail.com'}
                            onChange={(e) => updateSiteConfig({ contactEmail: e.target.value })}
                            placeholder="gitevijay123@gmail.com"
                            className="w-full px-3 py-2 bg-slate-950 border border-amber-400/50 rounded-xl font-mono font-bold text-white text-xs"
                          />
                        </div>

                        <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                          <label className="font-bold text-amber-200 block mb-1 text-[11px]">
                            ✈️ अधिकृत टेलिग्राम / व्हॉट्सॲप ग्रुप लिंक (Community Group URL):
                          </label>
                          <input
                            type="text"
                            value={siteConfig?.telegramGroupUrl || ''}
                            onChange={(e) => updateSiteConfig({ telegramGroupUrl: e.target.value })}
                            placeholder="https://t.me/VanjariJodi"
                            className="w-full px-3 py-2 bg-slate-950 border border-amber-400/50 rounded-xl font-mono font-bold text-white text-xs"
                          />
                        </div>
                      </div>

                      {/* 8 Instant Live Feature Switches */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(siteConfig?.blurPhotosForFreeUsers)}
                            onChange={(e) =>
                              updateSiteConfig({ blurPhotosForFreeUsers: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-amber-300">🔒 मोफत युजर्ससाठी फोटो ब्लर</div>
                            <div className="text-[10px] text-slate-300">
                              फक्त VIP सदस्यांनाच स्पष्ट फोटो दिसतील
                            </div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteConfig?.enableMutualLikeContactUnlock !== false}
                            onChange={(e) =>
                              updateSiteConfig({ enableMutualLikeContactUnlock: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-emerald-300">❤️ म्युच्युअल लाईक नंबर अनलॉक</div>
                            <div className="text-[10px] text-slate-300">
                              दोघांनी एकमेकांना Like केल्यास नंबर दिसेल
                            </div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(siteConfig?.isFestiveFreeModeEnabled)}
                            onChange={(e) =>
                              updateSiteConfig({ isFestiveFreeModeEnabled: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-amber-300">🎉 सण विशेष १००% मोफत मोड</div>
                            <div className="text-[10px] text-slate-300">
                              काही काळासाठी सर्वांना मोफत संपर्क खुला करा
                            </div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(siteConfig?.hideFatherNameForFreeUsers)}
                            onChange={(e) =>
                              updateSiteConfig({ hideFatherNameForFreeUsers: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-white">🛡️ आडनाव व वडिलांचे नाव लपवा</div>
                            <div className="text-[10px] text-slate-300">
                              मोफत सदस्यांपासून पूर्ण नाव गोपनीय ठेवा
                            </div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(siteConfig?.hideAddressForFreeUsers)}
                            onChange={(e) =>
                              updateSiteConfig({ hideAddressForFreeUsers: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-white">📍 गाव व पत्ता गोपनीय ठेवा</div>
                            <div className="text-[10px] text-slate-300">
                              फक्त जिल्हा दिसेल, पूर्ण पत्ता VIP साठी
                            </div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteConfig?.isSuccessStoriesEnabled !== false}
                            onChange={(e) =>
                              updateSiteConfig({ isSuccessStoriesEnabled: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-amber-200">💑 यशस्वी लग्न कथा (Stories)</div>
                            <div className="text-[10px] text-slate-300">
                              जमलेल्या जोडप्यांचे फोटो विभाग दाखवा
                            </div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteConfig?.enableBusinessVendors !== false}
                            onChange={(e) =>
                              updateSiteConfig({ enableBusinessVendors: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-amber-200">🏪 लग्न व्यावसायिक डिरेक्टरी</div>
                            <div className="text-[10px] text-slate-300">
                              मंगळ कार्यालय, फोटोग्राफर विभाग दाखवा
                            </div>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteConfig?.enableTickerBanner !== false}
                            onChange={(e) =>
                              updateSiteConfig({ enableTickerBanner: e.target.checked })
                            }
                            className="mt-0.5 w-4 h-4 accent-amber-400"
                          />
                          <div>
                            <div className="font-black text-emerald-300">📢 वरची सरकती सूचना पट्टी</div>
                            <div className="text-[10px] text-slate-300">
                              ॲप व वेबसाईटवर वरची सूचना पट्टी दाखवा
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveWebAndAppSettings}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>💾 वेबसाईट मधील बदल आणि ॲप मधील बदल सेव्ह करा</span>
                    </button>

                    {/* Lock-Screen Push Notification Broadcast Box */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-amber-400/40">
                      <div className="flex items-center gap-2 font-black text-amber-300 text-xs sm:text-sm">
                        <Bell className="w-4 h-4" />
                        <span>🔔 सर्व मोबाईल युजर्सना Lock-Screen Push Notification पाठवा (फोन लॉक असतानाही वाजेल):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          value={pushTitleInput}
                          onChange={(e) => setPushTitleInput(e.target.value)}
                          placeholder="नोटीफिकेशन शीर्षक"
                          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white"
                        />
                        <input
                          type="text"
                          value={pushBodyInput}
                          onChange={(e) => setPushBodyInput(e.target.value)}
                          placeholder="नोटीफिकेशन संदेश"
                          className="sm:col-span-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-white"
                        />
                      </div>
                      {pushBroadcastFeedback && (
                        <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 font-bold text-xs">
                          {pushBroadcastFeedback}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleSendAdminPushBroadcast}
                        disabled={isSendingPushBroadcast}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        {isSendingPushBroadcast ? 'पाठवत आहे...' : '🚀 सर्व मोबाईलवर Push Notification पाठवा'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB 0: WEBSITE PLANS & PRICING MANAGER                */}
                {/* ========================================================= */}
                {adminSubTab === 'plans_manager' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-[#800C1E] text-xs sm:text-sm flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" />
                          <span>💎 मेंबरशिप प्लॅन्स आणि किमती नियंत्रण पॅनेल (Manage Website Plans)</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                          येथून तुम्ही कोणत्याही प्लॅनचे नाव, किंमत (₹), कालावधी (महिने), मोबाईल नंबर मर्यादा बदलू शकता किंवा नवीन प्लॅन जोडू शकता. सेव्ह करताच वेबसाईट व Razorpay वर नवीन किमती लगेच लागू होतात.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdminSubTab('promo_manager')}
                          className="px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-amber-300 font-black text-xs flex items-center gap-1 cursor-pointer border border-amber-300"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>🎁 प्रोमो कोड / कूपन बनवा</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddPlanForm(!showAddPlanForm)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 text-amber-300 font-black text-xs cursor-pointer hover:bg-slate-800"
                        >
                          {showAddPlanForm ? '✕ फॉर्म बंद करा' : '+ नवीन प्लॅन जोडा'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAdminPlans}
                          disabled={isSavingPlans}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:brightness-110 disabled:opacity-50"
                        >
                          {isSavingPlans ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>सेव्ह होत आहे...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>💾 सर्व प्लॅन्स व किमती सेव्ह करा</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {plansFeedback && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-xs flex items-center justify-between">
                        <span>{plansFeedback}</span>
                        <button
                          type="button"
                          onClick={() => setPlansFeedback('')}
                          className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Add New Plan Form */}
                    {showAddPlanForm && (
                      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-3">
                        <div className="font-black text-slate-900 text-xs sm:text-sm">
                          ➕ नवीन मेंबरशिप प्लॅन तयार करा:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              प्लॅनचे मराठी नाव (उदा. सुपर गोल्ड प्लॅन) *
                            </label>
                            <input
                              type="text"
                              value={newPlanNameMr}
                              onChange={(e) => setNewPlanNameMr(e.target.value)}
                              placeholder="उदा. 👑 सुपर गोल्ड प्लॅन"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              इंग्रजी नाव (Optional)
                            </label>
                            <input
                              type="text"
                              value={newPlanNameEn}
                              onChange={(e) => setNewPlanNameEn(e.target.value)}
                              placeholder="e.g. Super Gold Plan"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-[#800C1E] block mb-1 text-[11px]">
                              प्लॅनची किंमत (₹ मध्ये) *
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={newPlanPrice}
                              onChange={(e) => setNewPlanPrice(e.target.value)}
                              placeholder="499"
                              className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl font-mono font-black text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              वैधता कालावधी मजकूर (उदा. ६ महिने)
                            </label>
                            <input
                              type="text"
                              value={newPlanDuration}
                              onChange={(e) => setNewPlanDuration(e.target.value)}
                              placeholder="६ महिने (180 दिवस)"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              संपर्क (Mobile Numbers) मर्यादा
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={newPlanContacts}
                              onChange={(e) => setNewPlanContacts(e.target.value)}
                              placeholder="100"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              ऑफर बॅज (Badge Text)
                            </label>
                            <input
                              type="text"
                              value={newPlanBadge}
                              onChange={(e) => setNewPlanBadge(e.target.value)}
                              placeholder="✨ स्पेशल ऑफर"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleAddNewAdminPlan}
                            className="px-4 py-2 rounded-xl bg-[#800C1E] text-white font-black text-xs cursor-pointer"
                          >
                            + यादीत प्लॅन जोडा
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Editable Plans List */}
                    <div className="grid grid-cols-1 gap-3.5">
                      {editablePlans
                        .filter((p) => p.id !== 'free')
                        .map((plan, idx) => (
                          <div
                            key={plan.id}
                            className={`p-4 rounded-2xl border-2 transition space-y-3 ${
                              plan.isActive !== false
                                ? 'bg-white border-slate-200 shadow-xs'
                                : 'bg-slate-100 border-slate-300 opacity-75'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono font-black text-[11px]">
                                  #{idx + 1} • ID: {plan.id}
                                </span>
                                <span className="font-black text-slate-900 text-sm">
                                  {plan.nameMr || plan.name}
                                </span>
                                <span className="text-sm font-black text-[#800C1E] bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                                  ₹{plan.price}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-xs font-black cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={plan.isActive !== false}
                                    onChange={(e) =>
                                      handleEditablePlanChange(plan.id, 'isActive', e.target.checked)
                                    }
                                    className="w-4 h-4 accent-[#075E54]"
                                  />
                                  <span
                                    className={
                                      plan.isActive !== false ? 'text-emerald-700' : 'text-rose-600'
                                    }
                                  >
                                    {plan.isActive !== false
                                      ? '✅ वेबसाईटवर चालू (Active)'
                                      : '🚫 लपवलेला (Hidden)'}
                                  </span>
                                </label>

                                {plan.id !== 'welcome_offer' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAdminPlan(plan.id)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] cursor-pointer"
                                  >
                                    डिलीट करा
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                              <div className="sm:col-span-2">
                                <label className="font-bold text-slate-600 block mb-1 text-[11px]">
                                  प्लॅनचे मराठी नाव (Name in Marathi):
                                </label>
                                <input
                                  type="text"
                                  value={plan.nameMr || ''}
                                  onChange={(e) =>
                                    handleEditablePlanChange(plan.id, 'nameMr', e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 focus:bg-white focus:border-[#800C1E] focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-[#800C1E] block mb-1 text-[11px]">
                                  किंमत ₹ (Price in INR):
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={plan.price}
                                  onChange={(e) =>
                                    handleEditablePlanChange(plan.id, 'price', Number(e.target.value))
                                  }
                                  className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl font-mono font-black text-base text-[#800C1E] focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-600 block mb-1 text-[11px]">
                                  वैधता कालावधी (Duration):
                                </label>
                                <input
                                  type="text"
                                  value={plan.duration || ''}
                                  onChange={(e) =>
                                    handleEditablePlanChange(plan.id, 'duration', e.target.value)
                                  }
                                  placeholder="उदा. ६ महिने"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-600 block mb-1 text-[11px]">
                                  संपर्क मर्यादा (Contacts):
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={plan.contactViews ?? plan.unlockCount ?? 50}
                                  onChange={(e) =>
                                    handleEditablePlanChange(
                                      plan.id,
                                      'contactViews',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <div>
                                <label className="font-bold text-slate-600 block mb-1 text-[11px]">
                                  इंग्रजी नाव (English Name):
                                </label>
                                <input
                                  type="text"
                                  value={plan.name || ''}
                                  onChange={(e) =>
                                    handleEditablePlanChange(plan.id, 'name', e.target.value)
                                  }
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-600 block mb-1 text-[11px]">
                                  ऑफर बॅज (Badge Text):
                                </label>
                                <input
                                  type="text"
                                  value={plan.badgeText || ''}
                                  onChange={(e) =>
                                    handleEditablePlanChange(plan.id, 'badgeText', e.target.value)
                                  }
                                  placeholder="उदा. 🔥 सर्वाधिक लोकप्रिय"
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-600 block mb-1 text-[11px]">
                                  महिने संख्या (Duration Months):
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  value={plan.durationMonths || 6}
                                  onChange={(e) =>
                                    handleEditablePlanChange(
                                      plan.id,
                                      'durationMonths',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveAdminPlans}
                        disabled={isSavingPlans}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 disabled:opacity-50"
                      >
                        {isSavingPlans ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                            <span>सर्व बदल सेव्ह होत आहेत...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-amber-300" />
                            <span>💾 सर्व प्लॅन्स व नवीन किमती सेव्ह करा (Save All Plans)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB A: EMAIL OTP GATEWAY VAULT (GMAIL / SMTP / RESEND) */}
                {/* ========================================================= */}
                {adminSubTab === 'sms_vault' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                      <div className="font-black text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>📧 १००% मोफत ईमेल OTP प्रणाली (Zero SMS Cost & Zero Truecaller):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        सर्व लॉगिन, नोंदणी, पासवर्ड रिसेट आणि पेमेंट पडताळणीसाठी आता <strong>ईमेल OTP</strong> वापरला जातो. तुमचा <strong>Gmail App Password</strong> किंवा <strong>SMTP / Resend Key</strong> फक्त सर्व्हरवर सुरक्षित राहतो.
                      </p>
                    </div>

                    {/* Email OTP Gateway Configuration Form */}
                    <form onSubmit={handleSaveSmsGatewayConfig} className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="font-black text-slate-900 text-xs sm:text-sm border-b border-slate-200 pb-2 flex items-center justify-between">
                        <span>⚙️ ईमेल OTP गेटवे सेटिंग्ज (Server Vault):</span>
                        <span className="text-[11px] text-emerald-700 font-bold">
                          {emailOtpConfig.hasSmtpPass || emailOtpConfig.hasResendApiKey
                            ? '✓ क्रेडेन्शियल्स सर्व्हरवर सेव्ह आहेत'
                            : 'App Password / API Key आवश्यक'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            १. ईमेल प्रोव्हायडर निवडा:
                          </label>
                          <select
                            value={emailOtpConfig.provider || 'gmail'}
                            onChange={(e) =>
                              setEmailOtpConfig({
                                ...emailOtpConfig,
                                provider: e.target.value as 'gmail' | 'custom_smtp' | 'resend',
                              })
                            }
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                          >
                            <option value="gmail">Gmail SMTP (मोफत — Google App Password)</option>
                            <option value="custom_smtp">Custom SMTP Server (Hostinger / Zoho / Brevo)</option>
                            <option value="resend">Resend Email API</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            २. पाठवणाऱ्याचे नाव (Sender Name):
                          </label>
                          <input
                            type="text"
                            value={emailOtpConfig.fromName}
                            onChange={(e) =>
                              setEmailOtpConfig({ ...emailOtpConfig, fromName: e.target.value })
                            }
                            placeholder="वंजारी जोडी (Vanjari Jodi)"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      {emailOtpConfig.provider !== 'resend' ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                ३. ईमेल आयडी (SMTP / Gmail User):
                              </label>
                              <input
                                type="email"
                                value={emailOtpConfig.smtpUser}
                                onChange={(e) =>
                                  setEmailOtpConfig({ ...emailOtpConfig, smtpUser: e.target.value })
                                }
                                placeholder="तुमचा Gmail आयडी (उदा. yourapp@gmail.com)"
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="font-bold text-[#800C1E]">
                                  ४. १६-अक्षरी Gmail App Password / SMTP Password:
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                                >
                                  {showSmsApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  <span>{showSmsApiKey ? 'लपवा' : 'पहा'}</span>
                                </button>
                              </div>
                              <input
                                type={showSmsApiKey ? 'text' : 'password'}
                                value={emailOtpConfig.smtpPass}
                                onChange={(e) =>
                                  setEmailOtpConfig({ ...emailOtpConfig, smtpPass: e.target.value })
                                }
                                placeholder={
                                  emailOtpConfig.hasSmtpPass
                                    ? '•••••••••••••••• (पासवर्ड सर्व्हरवर सेव्ह आहे)'
                                    : 'Google Account -> App Passwords मधील १६-अक्षरी कोड'
                                }
                                className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl font-mono text-slate-900"
                              />
                            </div>
                          </div>

                          {emailOtpConfig.provider === 'custom_smtp' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">SMTP Host:</label>
                                <input
                                  type="text"
                                  value={emailOtpConfig.smtpHost}
                                  onChange={(e) =>
                                    setEmailOtpConfig({ ...emailOtpConfig, smtpHost: e.target.value })
                                  }
                                  placeholder="smtp.hostinger.com"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">SMTP Port:</label>
                                <input
                                  type="number"
                                  value={emailOtpConfig.smtpPort}
                                  onChange={(e) =>
                                    setEmailOtpConfig({
                                      ...emailOtpConfig,
                                      smtpPort: Number(e.target.value) || 465,
                                    })
                                  }
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">From Email:</label>
                                <input
                                  type="email"
                                  value={emailOtpConfig.fromEmail}
                                  onChange={(e) =>
                                    setEmailOtpConfig({ ...emailOtpConfig, fromEmail: e.target.value })
                                  }
                                  placeholder="noreply@yourdomain.com"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">From Email (Verified Domain):</label>
                            <input
                              type="email"
                              value={emailOtpConfig.fromEmail}
                              onChange={(e) =>
                                setEmailOtpConfig({ ...emailOtpConfig, fromEmail: e.target.value })
                              }
                              placeholder="otp@yourdomain.com"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-[#800C1E] block mb-1">Resend API Key:</label>
                            <input
                              type={showSmsApiKey ? 'text' : 'password'}
                              value={emailOtpConfig.resendApiKey}
                              onChange={(e) =>
                                setEmailOtpConfig({ ...emailOtpConfig, resendApiKey: e.target.value })
                              }
                              placeholder={
                                emailOtpConfig.hasResendApiKey
                                  ? '•••••••••••••••• (API Key सेव्ह आहे)'
                                  : 're_xxxxxxxxxxxx'
                              }
                              className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl font-mono text-slate-900"
                            />
                          </div>
                        </div>
                      )}

                      {smsConfigFeedback && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 font-bold text-emerald-900">
                          {smsConfigFeedback}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSavingSmsConfig}
                        className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSavingSmsConfig ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>सर्व्हर व्हॉल्टमध्ये सेव्ह होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>💾 ईमेल OTP गेटवे सेटिंग्ज सर्व्हरवर सुरक्षित सेव्ह करा</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Live Server Email OTP Test Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="font-black text-slate-900">
                        📧 लाईव्ह ईमेल OTP गेटवे टेस्ट करा (सर्व्हरवरून टेस्ट OTP ईमेल पाठवा):
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          value={testEmailTo}
                          onChange={(e) => setTestEmailTo(e.target.value)}
                          placeholder="टेस्टसाठी ईमेल आयडी टाका (उदा. yourmail@gmail.com)"
                          className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleSendTestSms}
                          disabled={isTestingSms}
                          className="px-4 py-2 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-xs cursor-pointer"
                        >
                          {isTestingSms ? 'पाठवत आहे...' : '📧 टेस्ट OTP ईमेल पाठवा'}
                        </button>
                      </div>
                      {testSmsFeedback && (
                        <div className="p-2.5 rounded-xl bg-white border border-slate-300 text-[11px] font-bold text-slate-800">
                          {testSmsFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB B: RAZORPAY VAULT & MANUAL CREDENTIALS CREATOR    */}
                {/* ========================================================= */}
                {adminSubTab === 'razorpay_vault' && (
                  <div className="space-y-5">
                    <form onSubmit={handleSaveRazorpayVault} className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="font-black text-slate-900 text-xs sm:text-sm border-b border-slate-200 pb-2 flex items-center justify-between">
                        <span>💳 Razorpay पेमेंट गेटवे सर्व्हर सीक्रेट व्हॉल्ट:</span>
                        <span className="text-[11px] text-emerald-700 font-bold">
                          {rzpConfig.hasSecretKey ? '✓ Secret Key सर्व्हरवर सुरक्षित आहे' : 'Secret Key आवश्यक'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            गेटवे मोड (Environment):
                          </label>
                          <select
                            value={rzpConfig.env}
                            onChange={(e) => setRzpConfig({ ...rzpConfig, env: e.target.value as 'LIVE' | 'TEST' })}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                          >
                            <option value="LIVE">LIVE Mode (rzp_live_...)</option>
                            <option value="TEST">TEST Mode (rzp_test_...)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Razorpay Key ID (Merchant Key ID):
                          </label>
                          <input
                            type="text"
                            value={rzpConfig.keyId}
                            onChange={(e) => setRzpConfig({ ...rzpConfig, keyId: e.target.value })}
                            placeholder="rzp_live_XXXXXXXXXXXXXX"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-[#800C1E]">
                            Razorpay Key Secret (फक्त सर्व्हरवर राहते — फ्रंटएंडवर कधीही येत नाही):
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowRzpSecret(!showRzpSecret)}
                            className="text-[11px] font-bold text-slate-600 flex items-center gap-1 cursor-pointer"
                          >
                            {showRzpSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showRzpSecret ? 'लपवा' : 'टाकताना पहा'}</span>
                          </button>
                        </div>
                        <input
                          type={showRzpSecret ? 'text' : 'password'}
                          value={rzpConfig.secretKey}
                          onChange={(e) => setRzpConfig({ ...rzpConfig, secretKey: e.target.value })}
                          placeholder="••••••••••••••••"
                          className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl font-mono text-slate-900"
                        />
                      </div>

                      {rzpFeedback && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 font-bold text-emerald-900">
                          {rzpFeedback}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSavingRzp}
                        className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs sm:text-sm cursor-pointer"
                      >
                        {isSavingRzp ? 'सेव्ह होत आहे...' : '🔒 Razorpay Key व Secret सर्व्हर व्हॉल्टमध्ये सेव्ह करा'}
                      </button>
                    </form>

                    {/* Manual Member Login ID & Password Creator */}
                    <form onSubmit={handleAdminManualCreateLogin} className="space-y-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-300">
                      <div className="font-black text-[#800C1E] text-xs sm:text-sm">
                        🔑 कोणत्याही युजरसाठी थेट फुल-ॲक्सेस लॉगिन आयडी व पासवर्ड तयार करा:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          placeholder="उमेदवाराचे नाव"
                          className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                        <input
                          type="tel"
                          value={manualMobile}
                          onChange={(e) => setManualMobile(e.target.value.replace(/\D/g, '').slice(-10))}
                          placeholder="१०-अंकी मोबाईल (Login ID) *"
                          className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-slate-900"
                          required
                        />
                        <input
                          type="text"
                          value={manualPassword}
                          onChange={(e) => setManualPassword(e.target.value)}
                          placeholder="पासवर्ड (उदा. 123456) *"
                          className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                          required
                        />
                      </div>
                      {manualCredsFeedback && (
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-900">
                          {manualCredsFeedback}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingManualCreds}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#800C1E] text-white font-black text-xs cursor-pointer"
                      >
                        {isSavingManualCreds ? 'सक्रिय होत आहे...' : '✅ लॉगिन आयडी व पासवर्ड सक्रिय करा (१००% ॲप फुल ॲक्सेस)'}
                      </button>
                    </form>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB C: GOOGLE PLAY vs RAZORPAY SEPARATE POLICY LINKS  */}
                {/* ========================================================= */}
                {adminSubTab === 'compliance_links' && (
                  <div className="space-y-5">
                    {/* Group 1: Google Play Console Links */}
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 space-y-3">
                      <div className="border-b border-emerald-200 pb-2">
                        <div className="text-[11px] font-black text-emerald-800 uppercase">
                          विभाग १ · अँड्रॉइड ॲपसाठी (Google Play Console Links)
                        </div>
                        <h3 className="text-sm font-black text-slate-900">
                          🤖 Google Play Console मध्ये देण्यासाठी ४ स्वतंत्र लिंक्स (पेमेंटचा कुठेही उल्लेख नाही)
                        </h3>
                      </div>

                      <div className="space-y-2.5">
                        {playStoreComplianceLinks.map((item) => (
                          <div
                            key={item.path}
                            className="bg-white p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="font-black text-slate-900 text-xs">{item.title}</div>
                              <div className="text-[11px] text-slate-600">{item.desc}</div>
                              <div className="font-mono text-[11px] font-bold text-emerald-800 break-all">
                                {item.url}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => copyLinkToClipboard(item.url)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-black text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedUrl === item.url ? 'कॉपी झाले!' : 'लिंक कॉपी'}</span>
                              </button>
                              <a
                                href={item.path}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>पहा</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 2: Razorpay Payment Gateway Links */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-400 space-y-3">
                      <div className="border-b border-amber-200 pb-2 space-y-1">
                        <div className="text-[11px] font-black text-[#800C1E] uppercase">
                          विभाग २ · वेबसाईट पेमेंट गेटवेसाठी (Razorpay KYC Links — जुन्या व नवीन दोन्ही १००% चालू!)
                        </div>
                        <h3 className="text-sm font-black text-slate-900">
                          💳 Razorpay आधीच Active असल्यास तुम्हाला Razorpay मध्ये काहीही बदल करण्याची गरज नाही!
                        </h3>
                        <p className="text-xs text-emerald-900 bg-emerald-100/80 border border-emerald-300 rounded-xl p-2.5 font-bold leading-relaxed">
                          ✅ तुमचे Razorpay खाते वेबसाईटवर आधीपासूनच Active आहे, म्हणून आम्ही जुन्या लिंक्स (उदा. <code>/privacy-policy</code>, <code>/terms-and-conditions</code>, <code>/refund-policy</code>, <code>/shipping-policy</code>, <code>/pricing</code>, <code>/contact-us</code>) आणि नवीन लिंक्स (<code>/razorpay-privacy</code> इ.) या <strong>दोन्ही एकाच वेळी १००% चालू ठेवल्या आहेत</strong>. तर Play Console साठी स्वतंत्र <code>/app-privacy-policy</code> दिलेली आहे!
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {razorpayComplianceLinks.map((item) => (
                          <div
                            key={item.path}
                            className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="font-black text-slate-900 text-xs">{item.title}</div>
                              <div className="text-[11px] text-slate-600">{item.desc}</div>
                              <div className="font-mono text-[11px] font-bold text-[#800C1E] break-all">
                                १) {item.url}
                              </div>
                              {(item as any).altUrl && (
                                <div className="font-mono text-[11px] font-bold text-slate-600 break-all">
                                  २) {(item as any).altUrl}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => copyLinkToClipboard(item.url)}
                                className="px-3 py-1.5 rounded-lg bg-[#800C1E] text-white font-black text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedUrl === item.url ? 'कॉपी झाले!' : 'लिंक कॉपी'}</span>
                              </button>
                              <a
                                href={item.path}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>पहा</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB 5: FIREBASE -> SUPABASE SQL & FULL DATA BACKUP    */}
                {/* ========================================================= */}
                {adminSubTab === 'backup_supabase' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-2">
                      <div className="font-black text-[#075E54] text-xs sm:text-sm flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        <span>🗄️ संपूर्ण Firebase डेटा बॅकअप आणि Supabase (PostgreSQL) मायग्रेशन सिस्टीम</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        तुमचा सध्याचा संपूर्ण डेटा <strong>Firebase Cloud Firestore</strong> वर सुरक्षित आहे. भविष्यात कधीही Firebase ची मर्यादा संपली आणि तुम्हाला सर्व डेटा <strong>Supabase (PostgreSQL)</strong> वर हलवायचा असेल, तर खालील १-क्लिक बटनाने संपूर्ण डेटाबेसची रेडीमेड <code>.sql</code> किंवा <code>.json</code> फाईल डाऊनलोड करा!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-2xl bg-white border-2 border-emerald-400 shadow-xs space-y-2.5 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[10px] mb-1">
                            १. Supabase (PostgreSQL) Ready SQL Dump
                          </span>
                          <h4 className="font-black text-slate-900 text-sm">
                            🐘 Supabase SQL मायग्रेशन फाईल (.sql) डाऊनलोड करा
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-1">
                            या फाईलमध्ये <code>users</code>, <code>otp_verifications</code>, <code>profiles</code> आणि <code>plans</code> टेबल्ससह सर्व {allUnifiedProfiles.length} बायोडाटा व लॉगिन आयडींचे रेडीमेड <code>INSERT INTO</code> कमांड्स आहेत. ही फाईल Supabase SQL Editor मध्ये पेस्ट करताच संपूर्ण डेटाबेस तयार होतो!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            downloadSupabaseSqlMigration(allUnifiedProfiles, plansList, ledgerRecords)
                          }
                          className="w-full py-3 px-4 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>📥 Supabase PostgreSQL (.sql) फाईल डाऊनलोड करा</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border-2 border-amber-400 shadow-xs space-y-2.5 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded bg-amber-100 text-[#800C1E] font-black text-[10px] mb-1">
                            २. Complete Firebase JSON Snapshot
                          </span>
                          <h4 className="font-black text-slate-900 text-sm">
                            📦 संपूर्ण Firebase डेटाबेस बॅकअप (.json) डाऊनलोड करा
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-1">
                            सर्व {allUnifiedProfiles.length} बायोडाटा प्रोफाईल्स, फोटो लिंक्स, पेड/फ्री मेंबरशिप नोंदी, लॉगिन आयडी लेजर आणि वेबसाईट/ॲप सेटिंग्जचा १००% पूर्ण JSON बॅकअप.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            downloadFullFirebaseJsonBackup(
                              allUnifiedProfiles,
                              plansList,
                              siteConfig,
                              ledgerRecords
                            )
                          }
                          className="w-full py-3 px-4 rounded-xl bg-[#800C1E] hover:bg-[#A71930] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>📥 संपूर्ण Firebase JSON बॅकअप डाऊनलोड करा</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border-2 border-slate-300 shadow-xs space-y-2.5 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-200 text-slate-900 font-black text-[10px] mb-1">
                            ३. कमी पानांची A4 प्रिंट / PDF डिरेक्टरी
                          </span>
                          <h4 className="font-black text-slate-900 text-sm">
                            🖨️ सर्व सदस्यांची कॉम्पॅक्ट PDF / प्रिंट यादी (कमी पानांत बसणारी)
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-1">
                            एका A4 पानावर सुमारे ३० सदस्यांची संपूर्ण महत्त्वाची माहिती व मोबाईल नंबर बसतील अशी खास कॉम्पॅक्ट प्रिंट डिरेक्टरी डाऊनलोड करा.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCompactMembersPrintableDirectory(
                              profiles,
                              'सर्व सदस्य बायोडाटा यादी'
                            )
                          }
                          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>🖨️ कॉम्पॅक्ट प्रिंट / PDF यादी डाऊनलोड करा</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border-2 border-slate-300 shadow-xs space-y-2.5 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded bg-slate-200 text-slate-900 font-black text-[10px] mb-1">
                            ४. Excel / CSV स्प्रेडशीट
                          </span>
                          <h4 className="font-black text-slate-900 text-sm">
                            📊 सर्व सदस्यांची Excel (CSV) यादी डाऊनलोड करा
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-1">
                            मोबाईल किंवा कॉम्प्युटरवर Excel मध्ये उघडता येईल अशी मराठी युनिकोड समर्थित CSV फाईल.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadMembersCsvExport(profiles)}
                          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>📊 Excel / CSV फाईल डाऊनलोड करा</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB 3: MEMBERS, FREE PLAN GRANT, ADMIN PROFILE & PDF  */}
                {/* ========================================================= */}
                {adminSubTab === 'members_ledger' && (
                  <div className="space-y-4">
                    {/* Top Action Row: Grant Free Plan + Add Admin Profile + Compact Print */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/90 p-3.5 rounded-2xl border border-amber-300">
                      <div>
                        <h3 className="font-black text-[#800C1E] text-sm">
                          👥 संपूर्ण सदस्य व्यवस्थापन (पेड, फ्री दिलेले, अनपेड आणि ॲडमिनने भरलेले बायोडाटा)
                        </h3>
                        <p className="text-[11px] text-slate-600">
                          पैसे न भरलेल्या कोणत्याही सदस्याला १-क्लिकमध्ये <strong>🎁 मोफत प्लॅन</strong> द्या, थेट <strong>📩 SMS पाठवा</strong> किंवा <strong>कमी पानांत प्रिंट/PDF</strong> काढा.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAdminAddProfileBox(!showAdminAddProfileBox)}
                          className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>
                            {showAdminAddProfileBox
                              ? '✕ बायोडाटा फॉर्म बंद करा'
                              : '➕ ॲडमिनतर्फे नवीन बायोडाटा भरा'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCompactMembersPrintableDirectory(
                              allUnifiedProfiles,
                              'सर्व सदस्य बायोडाटा यादी'
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>🖨️ सर्व मेंबर्स PDF ({allUnifiedProfiles.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCompactMembersPrintableDirectory(
                              paidProfilesList,
                              'पेड मेंबर्स (Paid Members) यादी'
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>💎 पेड मेंबर्स PDF ({paidProfilesList.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCompactMembersPrintableDirectory(
                              unpaidProfilesList,
                              'अनपेड मेंबर्स (Unpaid Members) यादी'
                            )
                          }
                          className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>⏳ अनपेड मेंबर्स PDF ({unpaidProfilesList.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* Admin Direct Profile Entry Box (Strictly Tagged with 🛡️ ॲडमिनने भरलेला प्रोफाईल) */}
                    {showAdminAddProfileBox && (
                      <form
                        onSubmit={handleAdminCreateDirectProfile}
                        className="p-4 rounded-2xl bg-purple-50/90 border-2 border-purple-400 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded bg-purple-700 text-white font-black text-[10px] mb-0.5">
                              🛡️ फक्त ॲडमिनलाच समजणारी खूण (Admin-Only Tag)
                            </span>
                            <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                              ➕ ॲडमिनतर्फे स्वतः नवीन वधू/वर बायोडाटा जोडा (सामान्य युजरला हा ॲडमिन बॅज दिसणार नाही)
                            </h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div className="sm:col-span-2">
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              उमेदवाराचे पूर्ण नाव *
                            </label>
                            <input
                              type="text"
                              value={admProfName}
                              onChange={(e) => setAdmProfName(e.target.value)}
                              placeholder="उदा. कु. प्रणाली भगवानराव मुंडे"
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                              required
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              वधू / वर *
                            </label>
                            <select
                              value={admProfGender}
                              onChange={(e) => setAdmProfGender(e.target.value as 'groom' | 'bride')}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            >
                              <option value="bride">👰 वधू (मुलगी)</option>
                              <option value="groom">🤵 वर (मुलगा)</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              १०-अंकी मोबाईल नंबर *
                            </label>
                            <input
                              type="tel"
                              value={admProfMobile}
                              onChange={(e) =>
                                setAdmProfMobile(e.target.value.replace(/\D/g, '').slice(-10))
                              }
                              placeholder="9876543210"
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-mono font-black text-slate-900"
                              required
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              जन्मतारीख (DOB)
                            </label>
                            <input
                              type="date"
                              value={admProfDob}
                              onChange={(e) => setAdmProfDob(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              उंची (Height)
                            </label>
                            <input
                              type="text"
                              value={admProfHeight}
                              onChange={(e) => setAdmProfHeight(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              जिल्हा (District)
                            </label>
                            <select
                              value={admProfDistrict}
                              onChange={(e) => setAdmProfDistrict(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            >
                              {MAHARASHTRA_DISTRICTS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              गाव / शहर (City/Taluka)
                            </label>
                            <input
                              type="text"
                              value={admProfCity}
                              onChange={(e) => setAdmProfCity(e.target.value)}
                              placeholder="उदा. परळी वैजनाथ"
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              शिक्षण (Education)
                            </label>
                            <input
                              type="text"
                              value={admProfEducation}
                              onChange={(e) => setAdmProfEducation(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              नोकरी / व्यवसाय
                            </label>
                            <input
                              type="text"
                              value={admProfOccupation}
                              onChange={(e) => setAdmProfOccupation(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              गोत्र / देवक
                            </label>
                            <input
                              type="text"
                              value={admProfGotra}
                              onChange={(e) => setAdmProfGotra(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                              मामाचे नाव / आडनाव
                            </label>
                            <input
                              type="text"
                              value={admProfMama}
                              onChange={(e) => setAdmProfMama(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 text-xs">
                            <input
                              type="checkbox"
                              checked={acceptedAdminProfileConsent}
                              onChange={(e) => setAcceptedAdminProfileConsent(e.target.checked)}
                              className="w-4 h-4 accent-purple-700"
                            />
                            <span>
                              ☑️ उमेदवाराच्या/पालकांच्या संमतीने व अटी-नियमांनुसार हा बायोडाटा जोडत आहे. *
                            </span>
                          </label>

                          <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs cursor-pointer"
                          >
                            ✅ बायोडाटा सेव्ह करा (🛡️ ॲडमिनने भरलेला प्रोफाईल)
                          </button>
                        </div>

                        {admProfFeedback && (
                          <div className="p-2.5 rounded-xl bg-white border border-purple-300 font-bold text-purple-950 text-xs">
                            {admProfFeedback}
                          </div>
                        )}
                      </form>
                    )}

                    {/* 1-Click Grant Free Plan Box (for Unpaid / Any Member) */}
                    <form
                      onSubmit={handleAdminGrantFreePlan}
                      className="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 space-y-3"
                    >
                      <div className="font-black text-[#075E54] text-xs sm:text-sm flex items-center gap-1.5">
                        <Gift className="w-4 h-4" />
                        <span>🎁 पैसे न भरलेल्या किंवा कोणत्याही सदस्याला १-क्लिकमध्ये 'मोफत मेंबरशिप प्लॅन' द्या (Grant Free Plan):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                        <input
                          type="tel"
                          value={freeGrantMobile}
                          onChange={(e) =>
                            setFreeGrantMobile(e.target.value.replace(/\D/g, '').slice(-10))
                          }
                          placeholder="१०-अंकी मोबाईल (Login ID) *"
                          className="px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-black text-slate-900"
                          required
                        />
                        <input
                          type="text"
                          value={freeGrantName}
                          onChange={(e) => setFreeGrantName(e.target.value)}
                          placeholder="सदस्याचे नाव"
                          className="px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                        />
                        <select
                          value={freeGrantDurationDays}
                          onChange={(e) => setFreeGrantDurationDays(Number(e.target.value))}
                          className="px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                        >
                          <option value={90}>३ महिने मोफत (90 दिवस)</option>
                          <option value={180}>६ महिने मोफत (180 दिवस)</option>
                          <option value={365}>१ वर्ष मोफत (365 दिवस)</option>
                        </select>
                        <input
                          type="text"
                          value={freeGrantMpin}
                          onChange={(e) => setFreeGrantMpin(e.target.value)}
                          placeholder="४-अंकी MPIN / पासवर्ड"
                          className="px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900"
                        />
                        <button
                          type="submit"
                          disabled={isGrantingFreePlan}
                          className="px-4 py-2 rounded-xl bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-xs cursor-pointer"
                        >
                          {isGrantingFreePlan ? 'देत आहे...' : '🎁 आता मोफत प्लॅन लागू करा'}
                        </button>
                      </div>

                      {freeGrantFeedback && (
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-950 text-xs">
                          {freeGrantFeedback}
                        </div>
                      )}
                    </form>

                    {/* Filter Tabs & Search Bar for All Members */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setMemberFilterTab('all')}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                            memberFilterTab === 'all'
                              ? 'bg-slate-900 text-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          सर्व ({allUnifiedProfiles.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberFilterTab('paid')}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                            memberFilterTab === 'paid'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          💎 पेड मेंबर्स ({paidProfilesList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberFilterTab('free_granted')}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                            memberFilterTab === 'free_granted'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                          }`}
                        >
                          🎁 फ्री दिलेले ({freeGrantedProfilesList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberFilterTab('unpaid')}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                            memberFilterTab === 'unpaid'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          ⏳ पैसे न भरलेले / अनपेड ({unpaidProfilesList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberFilterTab('admin_added')}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                            memberFilterTab === 'admin_added'
                              ? 'bg-purple-700 text-white'
                              : 'bg-purple-50 text-purple-900 border border-purple-200'
                          }`}
                        >
                          🛡️ फक्त ॲडमिनने भरलेले ({adminAddedProfilesList.length})
                        </button>
                      </div>

                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder="नाव, मोबाईल किंवा जिल्हा शोधा..."
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                    </div>

                    {/* Member Rows with 1-Click Free Plan Grant & 1-Click Direct SMS */}
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {filteredAdminProfiles.length === 0 ? (
                        <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 font-bold text-xs">
                          या विभागात कोणताही सदस्य आढळला नाही.
                        </div>
                      ) : (
                        filteredAdminProfiles.map((prof) => {
                          const cleanMob = (prof.mobile || '').replace(/\D/g, '').slice(-10);
                          const isAdmAdded = Boolean(
                            prof.isRegisteredByAdmin || prof.registrationType === 'admin_direct'
                          );
                          const statusInfo = getMemberPaymentStatusInfo(prof);
                          return (
                            <div
                              key={prof.id}
                              className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                                statusInfo.isPaid
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : statusInfo.isFreeGranted
                                  ? 'bg-amber-50/40 border-amber-200'
                                  : 'bg-rose-50/30 border-rose-200'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                                    {prof.id}
                                  </span>
                                  <span className="font-black text-slate-900 text-xs">
                                    {prof.fullName} ({prof.gender === 'bride' ? '👰 वधू' : '🤵 वर'})
                                  </span>
                                  {isAdmAdded && (
                                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 font-black text-[10px]">
                                      🛡️ ॲडमिनने भरलेला प्रोफाईल
                                    </span>
                                  )}
                                  {statusInfo.isFreeGranted ? (
                                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px]">
                                      {statusInfo.badgeTextMr}
                                    </span>
                                  ) : statusInfo.isPaid ? (
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[10px]">
                                      {statusInfo.badgeTextMr}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[10px]">
                                      {statusInfo.badgeTextMr}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-600 font-semibold">
                                  📱 <strong className="font-mono text-slate-900">{prof.mobile || '-'}</strong> • 📍{' '}
                                  {prof.district || 'महाराष्ट्र'} • 🎓 {prof.education || '-'}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {!statusInfo.isPaidOrActive && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFreeGrantMobile(cleanMob);
                                      setFreeGrantName(prof.fullName);
                                      setFreeGrantGender(prof.gender);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-[11px] cursor-pointer"
                                  >
                                    🎁 फ्री प्लॅन द्या
                                  </button>
                                )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (prof.email) setTestEmailTo(prof.email);
                                  setAdminSubTab('sms_vault');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] cursor-pointer"
                              >
                                📧 ईमेल OTP टेस्ट
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer with Official Razorpay KYC Policy Links + Admin & App Preview Controls */}
      <footer className="py-6 px-4 text-center text-xs text-slate-600 border-t border-slate-200/80 bg-white/95 space-y-4">
        {/* Play Store Download Banner in Footer (Customizable & Toggleable) */}
        {webCms.showFooterPlayBanner && (
          <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white flex items-center justify-between gap-3 shadow-lg border border-emerald-400/50">
            <div className="flex items-center gap-2.5 text-left">
              <img src="/icon-192.png" alt="App" className="w-10 h-10 rounded-xl bg-white p-0.5 object-cover shrink-0 border border-amber-300" />
              <div>
                <div className="font-black text-xs text-white">{editableText('footerPlayTitle')}</div>
                <div className="text-[10px] text-emerald-300 font-bold">{editableText('footerPlaySubtitle')}</div>
              </div>
            </div>
            <a
              href={siteConfig?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md transition transform active:scale-95"
            >
              {editableText('footerPlayBtnText')}
            </a>
          </div>
        )}

        {webCms.showFooterPolicyLinks && (
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] font-bold text-[#800C1E]">
            <a href="/terms-and-conditions" target="_blank" rel="noreferrer" className="hover:underline">
              Terms &amp; Conditions
            </a>
            <span>·</span>
            <a href="/privacy-policy" target="_blank" rel="noreferrer" className="hover:underline">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="/refund-policy" target="_blank" rel="noreferrer" className="hover:underline">
              Refund &amp; Cancellation
            </a>
            <span>·</span>
            <a href="/shipping-policy" target="_blank" rel="noreferrer" className="hover:underline">
              Shipping &amp; Delivery
            </a>
            <span>·</span>
            <a href="/pricing" target="_blank" rel="noreferrer" className="hover:underline">
              Pricing (INR)
            </a>
            <span>·</span>
            <a href="/contact-us" target="_blank" rel="noreferrer" className="hover:underline">
              Contact Us
            </a>
          </div>
        )}

        {/* Official Helpline Email Banner */}
        <div className="max-w-xl mx-auto p-3 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center justify-center gap-1.5 text-[#800C1E]">
            <Mail className="w-4 h-4 text-[#800C1E]" />
            <span>अधिकृत हेल्पलाईन ईमेल:</span>
            <a href="mailto:gitevijay123@gmail.com" className="font-bold underline text-[#800C1E]">
              gitevijay123@gmail.com
            </a>
          </div>
          <p className="text-[11px] text-slate-600">
            📱 ॲन्ड्रॉइड वापरकर्त्यांसाठी Play Store ॲप (APK) • 🍎 आयफोन वापरकर्त्यांसाठी हीच वेबसाईट (vanjarijodi.web.app) सफारीमध्ये वापरा
          </p>
        </div>

        <p className="text-[11px] text-slate-500">
          {editableText('footerCopyrightText')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
          {onSwitchToAppMode && (
            <button
              type="button"
              onClick={onSwitchToAppMode}
              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer border border-amber-500"
            >
              📱 आयफोन व वेब: सर्व स्थळे पहा (Open Matrimony)
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('admin_portal')}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold cursor-pointer"
          >
            {editableText('footerAdminBtnText')}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default WebPaymentPage;
