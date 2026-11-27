export interface WebsiteCmsConfig {
  // Section Visibility Toggles (कोणताही विभाग चालू किंवा बंद करा)
  showHeaderSslBadge: boolean;
  showHeaderPlayButton: boolean;
  showTopRibbon: boolean;
  showAdBanner: boolean;
  showBannerPills: boolean;
  showTrustSection: boolean;
  showThreeSteps: boolean;
  showPlayStoreSection: boolean;
  showPlayStoreStats: boolean;
  showPlayStoreApkButton: boolean;
  showPlayStoreQr: boolean;
  showAppLoginCard: boolean;
  showWebBiodataCard: boolean;
  showBiodataMethod1Ai: boolean;
  showBiodataMethod2Quick: boolean;
  showBiodataMethod3Manual: boolean;
  showBiodataMethod4PdfMaker: boolean;
  showFooterPlayBanner: boolean;
  showFooterPolicyLinks: boolean;

  // 1. Header & Top Announcement Ribbon
  headerBlessing: string;
  headerMainTitle: string;
  headerPlayBtnText: string;
  headerSslText: string;
  headerAdminBtnText: string;
  topRibbonText: string;
  topRibbonLinkText: string;

  // 2. Top 3 Navigation Tabs
  navTab1Text: string;
  navTab2Text: string;
  navTab3Text: string;

  // 3. Ad Banner Extra Texts & Pills
  bannerMantraText: string;
  bannerPill1: string;
  bannerPill2: string;
  bannerPill3: string;
  bannerSecurityNote: string;
  bannerBottomTrustText: string;

  // 4. Trust Pillars & 3 Steps Section (Off by default per user request, fully editable if enabled)
  trustBadge: string;
  trustHeading: string;
  trustSubtitle: string;
  trustStat1Num: string;
  trustStat1Label: string;
  trustStat2Num: string;
  trustStat2Label: string;
  trustStat3Num: string;
  trustStat3Label: string;
  trustStat4Num: string;
  trustStat4Label: string;
  stepsHeading: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // 5. Google Play Store Showcase Section
  playBadgeText: string;
  playVersionText: string;
  playProtectText: string;
  playHeading: string;
  playSubheading: string;
  playDescription: string;
  playStat1Num: string;
  playStat1Label: string;
  playStat2Num: string;
  playStat2Label: string;
  playStat3Num: string;
  playStat3Label: string;
  playStat4Num: string;
  playStat4Label: string;
  playBtnTopLabel: string;
  playBtnMainLabel: string;
  playApkBtnText: string;
  playQrTitle: string;
  playQrSubtitle: string;

  // 6. App Login on Website Card
  appLoginBadge: string;
  appLoginHeading: string;
  appLoginSubtitle: string;
  appLoginMobileLabel: string;
  appLoginMobilePlaceholder: string;
  appLoginPassLabel: string;
  appLoginPassPlaceholder: string;
  appLoginBtnText: string;

  // 7. Website New BioData Upload Card (4 Methods)
  biodataCardBadge: string;
  biodataCardRightNote: string;
  biodataCardHeading: string;
  biodataCardSubtitle: string;
  biodataMethod1Title: string;
  biodataMethod1Desc: string;
  biodataMethod2Title: string;
  biodataMethod2Desc: string;
  biodataMethod3Title: string;
  biodataMethod3Desc: string;
  biodataMethod4Title: string;
  biodataMethod4Desc: string;

  // 8. Step 1: Plan Selection, SMS OTP & Payment Form
  paySectionBadge: string;
  paySectionHeading: string;
  paySectionSubtitle: string;
  planSelectLabel: string;
  candidateNameLabel: string;
  candidateNamePlaceholder: string;
  genderSelectLabel: string;
  groomBtnText: string;
  brideBtnText: string;
  mobileLoginIdLabel: string;
  mobileLoginIdPlaceholder: string;
  otpBoxTitle: string;
  otpBoxSubtitle: string;
  otpSendBtnText: string;
  otpVerifyBtnText: string;
  passwordBoxTitle: string;
  passwordNewLabel: string;
  passwordNewPlaceholder: string;
  passwordConfirmLabel: string;
  passwordConfirmPlaceholder: string;
  legalConsentPrefix: string;
  legalConsentLinkText: string;
  legalConsentSuffix: string;
  paySubmitBtnSuffix: string;
  forgotPromptText: string;
  forgotPromptLinkText: string;

  // 9. Tab 2: Forgot Password / OTP Reset
  forgotTabBadge: string;
  forgotTabHeading: string;
  forgotTabSubtitle: string;
  forgotMobileLabel: string;
  forgotSendOtpBtn: string;
  forgotSavePassBtn: string;

  // 10. Footer
  footerPlayTitle: string;
  footerPlaySubtitle: string;
  footerPlayBtnText: string;
  footerCopyrightText: string;
  footerAppPreviewBtnText: string;
  footerAdminBtnText: string;
}

export const DEFAULT_WEBSITE_CMS: WebsiteCmsConfig = {
  // Visibility Toggles: Note that the bloated Trust/Steps & Play Store QR/Stats boxes from user's screenshots are OFF by default!
  showHeaderSslBadge: true,
  showHeaderPlayButton: true,
  showTopRibbon: true,
  showAdBanner: true,
  showBannerPills: false,
  showTrustSection: false,
  showThreeSteps: false,
  showPlayStoreSection: false,
  showPlayStoreStats: false,
  showPlayStoreApkButton: false,
  showPlayStoreQr: false,
  showAppLoginCard: true,
  showWebBiodataCard: true,
  showBiodataMethod1Ai: true,
  showBiodataMethod2Quick: true,
  showBiodataMethod3Manual: true,
  showBiodataMethod4PdfMaker: true,
  showFooterPlayBanner: true,
  showFooterPolicyLinks: true,

  // 1. Header & Top Announcement Ribbon
  headerBlessing: '॥ श्री संत भगवान बाबा प्रसन्न ॥',
  headerMainTitle: 'वंजारी जोडी (vanjarijodi.web.app) — अधिकृत पेमेंट व लॉगिन आयडी पोर्टल',
  headerPlayBtnText: '📲 Play Store ॲप',
  headerSslText: '256-Bit SSL सुरक्षित',
  headerAdminBtnText: 'ॲडमिन',
  topRibbonText: "🎉 खुशखबर! आपले अधिकृत 'वंजारी जोडी' (Vanjari Jodi) ॲप Google Play Store वर उपलब्ध आहे!",
  topRibbonLinkText: 'Play Store वरून डाउनलोड करा →',

  // 2. Top 3 Navigation Tabs
  navTab1Text: '१. पेमेंट व आयडी-पासवर्ड',
  navTab2Text: '२. फॉरगॉट पासवर्ड (OTP)',
  navTab3Text: '३. 🔐 ॲडमिन लॉगिन व सेटिंग्ज',

  // 3. Ad Banner Extra Texts & Pills
  bannerMantraText: '।। श्री गणेशाय नमः ।। वंजारी वधू-वर सूचक मंडळ',
  bannerPill1: '✓ १००+ विवाह संपन्न',
  bannerPill2: '✓ Mutual Like गोपनीयता',
  bannerPill3: '✓ ३६ गुण मिलन',
  bannerSecurityNote: '🔒 १००% सुरक्षित ऑनलाईन पेमेंट',
  bannerBottomTrustText: '१००% सुरक्षित व अधिकृत वंजारी समाज मॅट्रिमोनी पोर्टल',

  // 4. Trust Pillars & 3 Steps Section
  trustBadge: 'विश्वासार्ह वंजारी समाज विवाह व्यासपीठ',
  trustHeading: 'वंजारी जोडीवर हजारो कुटुंबियांचा दृढ विश्वास का आहे?',
  trustSubtitle: 'फक्त नावापुरती स्थळे नाहीत, तर खरी, सत्यापित आणि सुसंस्कृत कुटुंबांची माहिती येथे उपलब्ध आहे.',
  trustStat1Num: '१,०००+',
  trustStat1Label: 'वधू-वर स्थळे',
  trustStat2Num: '१००+',
  trustStat2Label: 'विवाह जुळले',
  trustStat3Num: '१००%',
  trustStat3Label: 'सुरक्षित व खाजगी',
  trustStat4Num: '३६ गुण',
  trustStat4Label: 'पत्रिका मिलन',
  stepsHeading: 'कसे सुरू करावे? फक्त ३ सोप्या पायऱ्या:',
  step1Title: 'प्लॅन निवडा',
  step1Desc: 'खालीलपैकी तुमच्या बजेटनुसार योग्य मेंबरशिप प्लॅन निवडून सुरक्षित पेमेंट करा.',
  step2Title: 'आयडी व पासवर्ड सेट करा',
  step2Desc: 'तुमचा मोबाईल नंबर हाच लॉगिन आयडी बनेल आणि स्वतःचा पासवर्ड तयार करा.',
  step3Title: 'ॲपमध्ये बायोडाटा पहा',
  step3Desc: "'वंजारी जोडी' ॲप उघडून त्वरित अमर्याद बायोडाटा, फोटो व पालकांचे संपर्क मिळवा!",

  // 5. Google Play Store Showcase Section
  playBadgeText: 'अधिकृत ॲप · Google Play Store वर उपलब्ध',
  playVersionText: 'v2.4.0 Live',
  playProtectText: 'Google Play Protect द्वारे प्रमाणित',
  playHeading: "आपले 'वंजारी जोडी' ॲप Play Store वर उपलब्ध आहे!",
  playSubheading: 'महाराष्ट्रातील १# मानांकित वंजारी समाज वधू-वर सूचक ॲप (Download Now)',
  playDescription:
    'हजारो पडताळणी झालेले वंजारी वधू-वर प्रोफाईल्स, डॉक्टर, इंजिनिअर, शासकीय नोकरदार, व्यावसायिक व उच्चशिक्षित स्थळे, ३६ गुण पत्रिका मिलन आणि थेट पालकांशी सुरक्षित संपर्क आता तुमच्या मोबाईलमध्ये एका टचवर उपलब्ध!',
  playStat1Num: '४.९',
  playStat1Label: '२,४५०+ परीक्षणे',
  playStat2Num: '१०,०००+',
  playStat2Label: 'डाऊनलोड्स',
  playStat3Num: '१८ MB',
  playStat3Label: 'हलके व जलद',
  playStat4Num: '३+ Everyone',
  playStat4Label: 'कौटुंबिक व सुरक्षित',
  playBtnTopLabel: 'GET IT ON',
  playBtnMainLabel: 'Google Play',
  playApkBtnText: 'थेट APK डाउनलोड करा (Direct Download)',
  playQrTitle: '📱 मोबाईलने QR कोड स्कॅन करा',
  playQrSubtitle: 'कॅमेरा उघडून स्कॅन करा आणि थेट ॲप इन्स्टॉल करा',

  // 6. App Login on Website Card
  appLoginBadge: '🔑 ॲप लॉगिनने प्लॅन घ्या',
  appLoginHeading: 'ॲपवर आधीच लॉगिन / नोंदणी आहे का?',
  appLoginSubtitle:
    'तुमचा ॲपमधील मोबाईल नंबर आणि ४-अंकी MPIN / पासवर्ड टाकून साइन-इन करा व थेट प्लॅन घ्या:',
  appLoginMobileLabel: 'नोंदणीकृत १०-अंकी मोबाईल नंबर (App Login ID):',
  appLoginMobilePlaceholder: 'उदा. 9876543210',
  appLoginPassLabel: 'ॲपमधील ४-अंकी MPIN किंवा पासवर्ड:',
  appLoginPassPlaceholder: 'MPIN / पासवर्ड टाका',
  appLoginBtnText: '🔑 ॲप लॉगिनने साइन-इन करा व प्लॅन निवडा',

  // 7. Website New BioData Upload Card (4 Methods)
  biodataCardBadge: '📄 वेबसाईटवर नवीन बायोडाटा नोंदणी (४ पद्धती)',
  biodataCardRightNote: 'ॲप आणि वेबसाईट दोन्हीवर आपोआप दिसेल',
  biodataCardHeading: 'वेबसाईटवर नवीन बायोडाटा टाका (अँपमधील सर्व ४ पद्धती उपलब्ध)',
  biodataCardSubtitle:
    'तुमचा बायोडाटा अजून टाकला नसेल, तर खालीलपैकी कोणत्याही सोप्या पद्धतीने वेबसाईटवरच नवीन बायोडाटा अपलोड करा आणि लगेच प्लॅन घ्या:',
  biodataMethod1Title: '१. 📸 AI बायोडाटा फोटो/PDF स्कॅन',
  biodataMethod1Desc: 'बायोडाटा फोटो अपलोड करा, AI आपोआप नाव, शिक्षण, गोत्र वाचून फॉर्म भरेल!',
  biodataMethod2Title: '२. ⚡ झटपट बायोडाटा कार्ड अपलोड',
  biodataMethod2Desc: 'न लिहिता फक्त ३० सेकंदांत तुमच्या बायोडाटा कागदाचा फोटो थेट अपलोड करा!',
  biodataMethod3Title: '३. 📝 संपूर्ण मॅन्युअल बायोडाटा फॉर्म',
  biodataMethod3Desc: '५ सोप्या टप्प्यांत स्वतः सर्व वैयक्तिक, शैक्षणिक व कौटुंबिक माहिती भरा.',
  biodataMethod4Title: '४. 🎨 मोफत मराठी PDF बायोडाटा मेकर',
  biodataMethod4Desc: 'आकर्षक सोनेरी बॉर्डरसह लग्नासाठी मराठी बायोडाटा PDF तयार करून डाउनलोड करा.',

  // 8. Step 1: Plan Selection, SMS OTP & Payment Form
  paySectionBadge: 'स्टेप १ · ऑनलाईन पेमेंट व लॉगिन आयडी-पासवर्ड नोंदणी',
  paySectionHeading: 'पेमेंट करून तुमचा लॉगिन आयडी आणि पासवर्ड सेट करा',
  paySectionSubtitle:
    'पेमेंट पूर्ण होताच तुमचा मोबाईल नंबर हाच लॉगिन आयडी बनेल आणि तुम्ही सेट केलेल्या पासवर्डने वंजारी जोडी ॲपमध्ये सर्व बायोडाटा व फोटोसाठी १००% फुल ॲक्सेस मिळेल.',
  planSelectLabel: 'मेंबरशिप प्लॅन निवडा:',
  candidateNameLabel: 'उमेदवाराचे पूर्ण नाव (Full Name) *',
  candidateNamePlaceholder: 'उदा. राहुल भगवानराव मुंडे',
  genderSelectLabel: 'वधू / वर निवडा *',
  groomBtnText: '🤵 वर (मुलगा)',
  brideBtnText: '👰 वधू (मुलगी)',
  mobileLoginIdLabel: '📱 मोबाईल नंबर — हाच तुमचा लॉगिन आयडी (Login ID) असेल *',
  mobileLoginIdPlaceholder: '१०-अंकी मोबाईल नंबर टाका',
  otpBoxTitle: 'प्लॅन धारकांसाठी ईमेल OTP पडताळणी (अनिवार्य)',
  otpBoxSubtitle:
    'सुरक्षा व खात्रीसाठी, प्लॅन घेणाऱ्या प्रत्येक सदस्याचा ईमेल पत्ता OTP द्वारे प्रमाणित असणे आवश्यक आहे.',
  otpSendBtnText: '📧 ईमेल OTP पाठवा व पडताळणी करा',
  otpVerifyBtnText: 'पडताळणी करा',
  passwordBoxTitle: '🔐 तुमचा नवीन पासवर्ड सेट करा (पेमेंट होताच लगेच लागू होईल):',
  passwordNewLabel: 'नवीन पासवर्ड तयार करा (किमान ४ अक्षरे/अंक):',
  passwordNewPlaceholder: 'उदा. 1234 किंवा पासवर्ड',
  passwordConfirmLabel: 'पासवर्ड पुन्हा टाका (Confirm Password):',
  passwordConfirmPlaceholder: 'तोच पासवर्ड पुन्हा टाका',
  legalConsentPrefix: 'मी १८+ वयाचा/ची असून स्वखुशीने खरी माहिती देत आहे व',
  legalConsentLinkText: 'अटी, नियम व गोपनीयता धोरणाशी',
  legalConsentSuffix: 'सहमत आहे. *',
  paySubmitBtnSuffix: 'पेमेंट करा व लॉगिन आयडी-पासवर्ड सुरू करा',
  forgotPromptText: 'आधीच पेमेंट केले आहे का? किंवा पासवर्ड विसरलात?',
  forgotPromptLinkText: '📧 ईमेल OTP ने पासवर्ड सेट / फॉरगॉट करा →',

  // 9. Tab 2: Forgot Password / Email OTP Reset
  forgotTabBadge: '📧 ईमेल OTP पडताळणी व फॉरगॉट पासवर्ड सिस्टीम',
  forgotTabHeading: 'पासवर्ड विसरलात किंवा नवीन पासवर्ड सेट करायचा आहे?',
  forgotTabSubtitle:
    'तुमचा नोंदणीकृत ईमेल पत्ता व मोबाईल नंबर टाका, ईमेलवर येणारा ४-अंकी OTP भरा आणि लगेच नवीन पासवर्ड सेट करा.',
  forgotMobileLabel: 'तुमचा नोंदणीकृत १०-अंकी मोबाईल नंबर (Login ID):',
  forgotSendOtpBtn: '📧 ईमेलवर OTP पाठवा',
  forgotSavePassBtn: '✅ OTP पडताळा व नवीन पासवर्ड सेव्ह करा',

  // 10. Footer
  footerPlayTitle: 'वंजारी जोडी (Vanjari Jodi) ॲप डाउनलोड करा',
  footerPlaySubtitle: 'Google Play Store वर उपलब्ध · ⭐ ४.९ रेटिंग (१०k+ डाऊनलोड्स)',
  footerPlayBtnText: 'Google Play 📲',
  footerCopyrightText:
    '© 2026 VANJARIJODI MATRIMONY (Operated by PRIME MULTI SERVICES AND SUPPLIERS • https://vanjarijodi.web.app)',
  footerAppPreviewBtnText: '📱 अँड्रॉइड ॲप प्रिव्ह्यू (App Mode)',
  footerAdminBtnText: '🔐 वेबसाईट ॲडमिन लॉगिन व सेटिंग्ज',
};

export function getMergedWebsiteCms(raw?: Partial<WebsiteCmsConfig> | null): WebsiteCmsConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_WEBSITE_CMS };
  }
  return {
    ...DEFAULT_WEBSITE_CMS,
    ...raw,
  };
}
