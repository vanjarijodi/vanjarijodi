import React, { useState } from 'react';
import { WebsiteCmsConfig, DEFAULT_WEBSITE_CMS } from '../utils/websiteCmsDefaults';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  RotateCcw,
  Sparkles,
  Edit3,
  Layers,
} from 'lucide-react';

interface WebsiteFullCmsEditorProps {
  cms: WebsiteCmsConfig;
  onChangeField: <K extends keyof WebsiteCmsConfig>(key: K, value: WebsiteCmsConfig[K]) => void;
  onResetDefaults: () => void;
  onSaveAll: () => void;
  isLiveEditMode: boolean;
  onToggleLiveEditMode: () => void;
  savedMessage?: string;
}

export const WebsiteFullCmsEditor: React.FC<WebsiteFullCmsEditorProps> = ({
  cms,
  onChangeField,
  onResetDefaults,
  onSaveAll,
  isLiveEditMode,
  onToggleLiveEditMode,
  savedMessage,
}) => {
  const [activeCmsGroup, setActiveCmsGroup] = useState<
    | 'visibility_toggles'
    | 'header_and_tabs'
    | 'ad_banner_words'
    | 'login_and_biodata'
    | 'payment_form_words'
    | 'forgot_and_footer'
    | 'playstore_and_trust'
  >('visibility_toggles');

  const visibilityItems: {
    key: keyof WebsiteCmsConfig;
    label: string;
    desc: string;
  }[] = [
    {
      key: 'showTopRibbon',
      label: '१. वरची Play Store घोषणा पट्टी (Top Green Ribbon)',
      desc: 'हेडरच्या खाली दिसणारी हिरवी घोषणा पट्टी दाखवा किंवा लपवा',
    },
    {
      key: 'showHeaderPlayButton',
      label: '२. हेडरमधील Play Store बटण',
      desc: 'वरच्या लाल हेडरमधील हिरवे Play Store ॲप बटण',
    },
    {
      key: 'showHeaderSslBadge',
      label: '३. हेडरमधील 256-Bit SSL बॅज',
      desc: 'हेडरमधील सुरक्षा बॅज दाखवा किंवा लपवा',
    },
    {
      key: 'showAdBanner',
      label: '४. मुख्य जाहिरात / फोटो बॅनर (Main Ad Banner)',
      desc: 'वेबसाईटवरील मुख्य जाहिरात पोस्टर किंवा प्रोमो बॅनर',
    },
    {
      key: 'showBannerPills',
      label: '५. जाहिरात बॅनरवरील ३ छोटे टॅग्स (१००+ विवाह, Mutual Like, ३६ गुण)',
      desc: 'बॅनरवरील छोटे टॅग्स हवे असल्यास चालू करा, नको असल्यास बंद ठेवा',
    },
    {
      key: 'showAppLoginCard',
      label: '६. 🔑 ॲप लॉगिनने साइन-इन कार्ड (App Login on Website)',
      desc: 'ॲपमधील मोबाईल + MPIN/पासवर्ड टाकून वेबसाईटवर प्लॅन घेण्याचा बॉक्स',
    },
    {
      key: 'showWebBiodataCard',
      label: '७. 📄 वेबसाईटवर नवीन बायोडाटा टाका कार्ड (सर्व ४ पद्धती)',
      desc: 'वेबसाईटवर नवीन बायोडाटा अपलोड करण्याचा मुख्य बॉक्स',
    },
    {
      key: 'showBiodataMethod1Ai',
      label: '   ↳ ७(अ). 📸 पद्धत १: AI फोटो/PDF ऑटो-स्कॅन बटण',
      desc: 'बायोडाटा कार्डमधील पहिले बटण',
    },
    {
      key: 'showBiodataMethod2Quick',
      label: '   ↳ ७(ब). ⚡ पद्धत २: झटपट बायोडाटा कार्ड फोटो अपलोड बटण',
      desc: 'बायोडाटा कार्डमधील दुसरे बटण',
    },
    {
      key: 'showBiodataMethod3Manual',
      label: '   ↳ ७(क). 📝 पद्धत ३: संपूर्ण ५-स्टेप मॅन्युअल फॉर्म बटण',
      desc: 'बायोडाटा कार्डमधील तिसरे बटण',
    },
    {
      key: 'showBiodataMethod4PdfMaker',
      label: '   ↳ ७(ड). 🎨 पद्धत ४: मोफत मराठी PDF बायोडाटा मेकर बटण',
      desc: 'बायोडाटा कार्डमधील चौथे बटण',
    },
    {
      key: 'showPlayStoreSection',
      label: '८. काळा Google Play Store शोकेस बॉक्स (मोठा कार्ड)',
      desc: 'स्क्रीनशॉट २ मधील काळा Play Store बॉक्स (नको असल्यास बंद ठेवा)',
    },
    {
      key: 'showPlayStoreStats',
      label: '   ↳ ८(अ). Play Store मधील ४ आकडेवारी चौकोन (४.९ ⭐, १०,०००+, १८ MB)',
      desc: 'Play Store बॉक्समधील ४ छोटे चौकोन दाखवा किंवा लपवा',
    },
    {
      key: 'showPlayStoreApkButton',
      label: '   ↳ ८(ब). थेट APK डाउनलोड करा बटण',
      desc: 'Play Store सोबत थेट APK डाउनलोड बटण दाखवा किंवा लपवा',
    },
    {
      key: 'showPlayStoreQr',
      label: '   ↳ ८(क). मोठा QR कोड स्कॅनर बॉक्स',
      desc: 'Play Store कार्डमधील QR कोड बॉक्स दाखवा किंवा लपवा',
    },
    {
      key: 'showTrustSection',
      label: '९. "वंजारी जोडीवर हजारो कुटुंबियांचा दृढ विश्वास का आहे?" बॉक्स',
      desc: 'स्क्रीनशॉट १ मधील १,०००+ स्थळे / १००+ विवाह माहितीचा बॉक्स (नको असल्यास बंद ठेवा)',
    },
    {
      key: 'showThreeSteps',
      label: '   ↳ ९(अ). "कसे सुरू करावे? फक्त ३ सोप्या पायऱ्या" बॉक्स',
      desc: '३ पायऱ्यांचा माहिती बॉक्स दाखवा किंवा लपवा',
    },
    {
      key: 'showFooterPlayBanner',
      label: '१०. फूटरमधील छोटा Play Store डाउनलोड बॅनर',
      desc: 'पेजच्या सर्वात खाली असलेला छोटा Play Store पट्टी बॅनर',
    },
    {
      key: 'showFooterPolicyLinks',
      label: '११. फूटरमधील Razorpay नियम व अटी लिंक्स',
      desc: 'Terms, Privacy, Refund, Shipping लिंक्स दाखवा किंवा लपवा',
    },
  ];

  const renderTextInput = (label: string, key: keyof WebsiteCmsConfig, multiline = false) => (
    <div key={String(key)} className="space-y-1">
      <label className="block text-[11px] font-black text-slate-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={2}
          value={String(cms[key] ?? '')}
          onChange={(e) => onChangeField(key, e.target.value as any)}
          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#800C1E]"
        />
      ) : (
        <input
          type="text"
          value={String(cms[key] ?? '')}
          onChange={(e) => onChangeField(key, e.target.value as any)}
          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-[#800C1E]"
        />
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-[#800C1E] shadow-xl space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#800C1E] text-amber-300 font-black text-[11px] flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>१००% फुल्ली कस्टमायझेबल वेबसाईट (शब्द-न्-शब्द संपादक)</span>
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
              ✓ प्रत्येक शब्द व प्रत्येक बॉक्स तुमच्या नियंत्रणात
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            वेबसाईटवरील कोणताही बॉक्स लपवा/दाखवा आणि प्रत्येक शब्द (Word-by-Word) बदला
          </h3>
          <p className="text-[11px] text-slate-600 font-medium">
            खालील टॅबमधून वेबसाईटवरील नको असलेले विभाग बंद (Hide) करा किंवा कोणताही शब्द तुमच्या पसंतीनुसार बदला.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleLiveEditMode}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer border-2 transition ${
              isLiveEditMode
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                : 'bg-white text-[#800C1E] border-[#800C1E] hover:bg-amber-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>
              {isLiveEditMode
                ? '✏️ थेट पेजवर एडिट मोड: चालू (ON)'
                : '✏️ थेट वेबसाईट पेजवर शब्द एडिट करा'}
            </span>
          </button>

          <button
            type="button"
            onClick={onSaveAll}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>💾 सर्व बदल सेव्ह करा</span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-950 font-black text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Sub-navigation for Word-by-Word CMS */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {[
          { id: 'visibility_toggles', label: '👁️ १. कोणता बॉक्स दाखवायचा / लपवायचा' },
          { id: 'header_and_tabs', label: '🏠 २. हेडर, पट्टी व ३ टॅब्सचे शब्द' },
          { id: 'ad_banner_words', label: '📢 ३. जाहिरात बॅनरवरील शब्द' },
          { id: 'login_and_biodata', label: '🔑 ४. ॲप लॉगिन व बायोडाटा कार्ड शब्द' },
          { id: 'payment_form_words', label: '💳 ५. पेमेंट, OTP व पासवर्ड फॉर्म शब्द' },
          { id: 'forgot_and_footer', label: '🔐 ६. फॉरगॉट पासवर्ड व फूटर शब्द' },
          { id: 'playstore_and_trust', label: '📲 ७. Play Store व इतर माहिती बॉक्स शब्द' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCmsGroup(tab.id as any)}
            className={`px-3 py-2 rounded-xl font-black text-[11px] cursor-pointer transition ${
              activeCmsGroup === tab.id
                ? 'bg-[#800C1E] text-amber-300 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GROUP 1: SECTION VISIBILITY TOGGLES */}
      {activeCmsGroup === 'visibility_toggles' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-xs font-bold text-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span>
              💡 <strong>सूचना:</strong> तुम्हाला वेबसाईटवर जो बॉक्स नको आहे तो खालील बटनाने <strong>बंद (OFF/Hide)</strong> करा आणि हवा असलेला बॉक्स <strong>चालू (ON/Show)</strong> करा.
            </span>
            <button
              type="button"
              onClick={onResetDefaults}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:bg-slate-50"
            >
              <RotateCcw className="w-3 h-3" />
              <span>डिफॉल्ट रिसेट करा</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {visibilityItems.map((item) => {
              const isOn = Boolean(cms[item.key]);
              return (
                <div
                  key={String(item.key)}
                  onClick={() => onChangeField(item.key, (!isOn) as any)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                    isOn
                      ? 'bg-emerald-50/70 border-emerald-400'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-600 font-medium">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl font-black text-[11px] shrink-0 flex items-center gap-1 ${
                      isOn
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isOn ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>चालू (Show)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>बंद (Hidden)</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GROUP 2: HEADER, TOP RIBBON & 3 NAVIGATION TABS */}
      {activeCmsGroup === 'header_and_tabs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderTextInput('हेडर वरची प्रसन्न ओळ (Blessing Text):', 'headerBlessing')}
          {renderTextInput('हेडर मुख्य शीर्षक (Main Website Title):', 'headerMainTitle')}
          {renderTextInput('हेडर Play Store बटण नाव:', 'headerPlayBtnText')}
          {renderTextInput('हेडर SSL सुरक्षा बॅज नाव:', 'headerSslText')}
          {renderTextInput('हेडर ॲडमिन बटण नाव:', 'headerAdminBtnText')}
          {renderTextInput('वरची हिरवी घोषणा पट्टी मजकूर (Top Ribbon):', 'topRibbonText')}
          {renderTextInput('घोषणा पट्टीतील लिंक मजकूर:', 'topRibbonLinkText')}
          {renderTextInput('मुख्य टॅब १ नाव (पेमेंट टॅब):', 'navTab1Text')}
          {renderTextInput('मुख्य टॅब २ नाव (फॉरगॉट पासवर्ड टॅब):', 'navTab2Text')}
          {renderTextInput('मुख्य टॅब ३ नाव (ॲडमिन टॅब):', 'navTab3Text')}
        </div>
      )}

      {/* GROUP 3: AD BANNER EXTRA WORDS & PILLS */}
      {activeCmsGroup === 'ad_banner_words' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderTextInput('बॅनरवरील मंत्र / उप-ओळ:', 'bannerMantraText')}
          {renderTextInput('बॅनर खालील सुरक्षा वाक्य (🔒 १००% सुरक्षित...):', 'bannerSecurityNote')}
          {renderTextInput('आडव्या फोटो बॅनरच्या खालील पट्टी वाक्य:', 'bannerBottomTrustText')}
          {renderTextInput('बॅनर टॅग १ (उदा. ✓ १००+ विवाह संपन्न):', 'bannerPill1')}
          {renderTextInput('बॅनर टॅग २ (उदा. ✓ Mutual Like गोपनीयता):', 'bannerPill2')}
          {renderTextInput('बॅनर टॅग ३ (उदा. ✓ ३६ गुण मिलन):', 'bannerPill3')}
        </div>
      )}

      {/* GROUP 4: APP LOGIN CARD & 4-METHOD BIODATA UPLOAD CARD */}
      {activeCmsGroup === 'login_and_biodata' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-white border border-amber-300 space-y-3">
            <h4 className="font-black text-xs text-[#800C1E]">
              🔑 भाग अ: "ॲप लॉगिनने प्लॅन घ्या" कार्डमधील प्रत्येक शब्द
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderTextInput('वरचा बॅज (Badge):', 'appLoginBadge')}
              {renderTextInput('मुख्य शीर्षक (Heading):', 'appLoginHeading')}
              {renderTextInput('माहिती ओळ (Subtitle):', 'appLoginSubtitle', true)}
              {renderTextInput('मोबाईल नंबर लेबल:', 'appLoginMobileLabel')}
              {renderTextInput('मोबाईल प्लेसहोल्डर:', 'appLoginMobilePlaceholder')}
              {renderTextInput('MPIN / पासवर्ड लेबल:', 'appLoginPassLabel')}
              {renderTextInput('MPIN / पासवर्ड प्लेसहोल्डर:', 'appLoginPassPlaceholder')}
              {renderTextInput('साइन-इन बटण मजकूर:', 'appLoginBtnText')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-300 space-y-3">
            <h4 className="font-black text-xs text-emerald-900">
              📄 भाग ब: "वेबसाईटवर नवीन बायोडाटा नोंदणी (४ पद्धती)" कार्डमधील प्रत्येक शब्द
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderTextInput('वरचा हिरवा बॅज:', 'biodataCardBadge')}
              {renderTextInput('उजवीकडील टीप ओळ:', 'biodataCardRightNote')}
              {renderTextInput('मुख्य शीर्षक (Heading):', 'biodataCardHeading')}
              {renderTextInput('माहिती ओळ (Subtitle):', 'biodataCardSubtitle', true)}
              {renderTextInput('पद्धत १ शीर्षक (AI स्कॅन):', 'biodataMethod1Title')}
              {renderTextInput('पद्धत १ वर्णन:', 'biodataMethod1Desc')}
              {renderTextInput('पद्धत २ शीर्षक (झटपट कार्ड अपलोड):', 'biodataMethod2Title')}
              {renderTextInput('पद्धत २ वर्णन:', 'biodataMethod2Desc')}
              {renderTextInput('पद्धत ३ शीर्षक (मॅन्युअल फॉर्म):', 'biodataMethod3Title')}
              {renderTextInput('पद्धत ३ वर्णन:', 'biodataMethod3Desc')}
              {renderTextInput('पद्धत ४ शीर्षक (PDF बायोडाटा मेकर):', 'biodataMethod4Title')}
              {renderTextInput('पद्धत ४ वर्णन:', 'biodataMethod4Desc')}
            </div>
          </div>
        </div>
      )}

      {/* GROUP 5: PAYMENT, EMAIL OTP & SET PASSWORD FORM WORDS */}
      {activeCmsGroup === 'payment_form_words' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderTextInput('फॉर्म वरची स्टेप ओळ (Step Badge):', 'paySectionBadge')}
          {renderTextInput('फॉर्म मुख्य शीर्षक (Heading):', 'paySectionHeading')}
          {renderTextInput('फॉर्म उप-माहिती (Subtitle):', 'paySectionSubtitle', true)}
          {renderTextInput('प्लॅन निवडा लेबल:', 'planSelectLabel')}
          {renderTextInput('उमेदवाराचे पूर्ण नाव लेबल:', 'candidateNameLabel')}
          {renderTextInput('उमेदवाराचे नाव प्लेसहोल्डर:', 'candidateNamePlaceholder')}
          {renderTextInput('वधू / वर निवडा लेबल:', 'genderSelectLabel')}
          {renderTextInput('वर बटण मजकूर:', 'groomBtnText')}
          {renderTextInput('वधू बटण मजकूर:', 'brideBtnText')}
          {renderTextInput('मोबाईल नंबर (Login ID) लेबल:', 'mobileLoginIdLabel')}
          {renderTextInput('मोबाईल नंबर प्लेसहोल्डर:', 'mobileLoginIdPlaceholder')}
          {renderTextInput('ईमेल OTP पडताळणी बॉक्स शीर्षक:', 'otpBoxTitle')}
          {renderTextInput('ईमेल OTP पडताळणी बॉक्स वर्णन:', 'otpBoxSubtitle', true)}
          {renderTextInput('ईमेल OTP पाठवा बटण मजकूर:', 'otpSendBtnText')}
          {renderTextInput('OTP पडताळणी करा बटण मजकूर:', 'otpVerifyBtnText')}
          {renderTextInput('नवीन पासवर्ड बॉक्स शीर्षक:', 'passwordBoxTitle')}
          {renderTextInput('नवीन पासवर्ड लेबल:', 'passwordNewLabel')}
          {renderTextInput('नवीन पासवर्ड प्लेसहोल्डर:', 'passwordNewPlaceholder')}
          {renderTextInput('पासवर्ड कन्फर्म लेबल:', 'passwordConfirmLabel')}
          {renderTextInput('पासवर्ड कन्फर्म प्लेसहोल्डर:', 'passwordConfirmPlaceholder')}
          {renderTextInput('१-लाईन संमती वाक्याची सुरुवात:', 'legalConsentPrefix')}
          {renderTextInput('१-लाईन संमती लिंक मजकूर:', 'legalConsentLinkText')}
          {renderTextInput('१-लाईन संमती वाक्याचा शेवट:', 'legalConsentSuffix')}
          {renderTextInput('मुख्य पेमेंट बटण मजकूर (₹ रक्कमेपुढील शब्द):', 'paySubmitBtnSuffix')}
          {renderTextInput('खालील फॉरगॉट पासवर्ड प्रश्न:', 'forgotPromptText')}
          {renderTextInput('खालील फॉरगॉट पासवर्ड लिंक शब्द:', 'forgotPromptLinkText')}
        </div>
      )}

      {/* GROUP 6: FORGOT PASSWORD TAB & FOOTER WORDS */}
      {activeCmsGroup === 'forgot_and_footer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderTextInput('फॉरगॉट पासवर्ड टॅब बॅज:', 'forgotTabBadge')}
          {renderTextInput('फॉरगॉट पासवर्ड मुख्य शीर्षक:', 'forgotTabHeading')}
          {renderTextInput('फॉरगॉट पासवर्ड वर्णन:', 'forgotTabSubtitle', true)}
          {renderTextInput('फॉरगॉट मोबाईल नंबर लेबल:', 'forgotMobileLabel')}
          {renderTextInput('ईमेलवर OTP पाठवा बटण:', 'forgotSendOtpBtn')}
          {renderTextInput('नवीन पासवर्ड सेव्ह करा बटण:', 'forgotSavePassBtn')}
          {renderTextInput('फूटर Play Store पट्टी शीर्षक:', 'footerPlayTitle')}
          {renderTextInput('फूटर Play Store पट्टी उपशीर्षक:', 'footerPlaySubtitle')}
          {renderTextInput('फूटर Play Store बटण मजकूर:', 'footerPlayBtnText')}
          {renderTextInput('फूटर कॉपीराईट ओळ:', 'footerCopyrightText')}
          {renderTextInput('फूटर ॲप प्रिव्ह्यू बटण:', 'footerAppPreviewBtnText')}
          {renderTextInput('फूटर ॲडमिन लॉगिन बटण:', 'footerAdminBtnText')}
        </div>
      )}

      {/* GROUP 7: PLAY STORE SHOWCASE & TRUST PILLARS WORDS (If enabled) */}
      {activeCmsGroup === 'playstore_and_trust' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-[11px] font-bold text-slate-700">
            ℹ️ हे दोन विभाग डिफॉल्ट रूपाने <strong>बंद (Hidden)</strong> ठेवले आहेत जेणेकरून वेबसाईट सुटसुटीत दिसेल. तुम्हाला यापैकी कोणताही बॉक्स वेबसाईटवर दाखवायचा असल्यास टॅब १ मधून तो चालू (Show) करा आणि खालील शब्द बदला:
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-300 space-y-3">
            <h4 className="font-black text-xs text-slate-900">
              📲 Play Store शोकेस कार्डमधील सर्व शब्द:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderTextInput('Play Store वरचा बॅज:', 'playBadgeText')}
              {renderTextInput('व्हर्जन टॅग (उदा. v2.4.0 Live):', 'playVersionText')}
              {renderTextInput('Play Protect मजकूर:', 'playProtectText')}
              {renderTextInput('मुख्य शीर्षक (Heading):', 'playHeading')}
              {renderTextInput('उपशीर्षक (Subheading):', 'playSubheading')}
              {renderTextInput('वर्णन परिच्छेद (Description):', 'playDescription', true)}
              {renderTextInput('चौकोन १ आकडा (उदा. ४.९):', 'playStat1Num')}
              {renderTextInput('चौकोन १ नाव (उदा. २,४५०+ परीक्षणे):', 'playStat1Label')}
              {renderTextInput('चौकोन २ आकडा (उदा. १०,०००+):', 'playStat2Num')}
              {renderTextInput('चौकोन २ नाव (उदा. डाऊनलोड्स):', 'playStat2Label')}
              {renderTextInput('चौकोन ३ आकडा (उदा. १८ MB):', 'playStat3Num')}
              {renderTextInput('चौकोन ३ नाव (उदा. हलके व जलद):', 'playStat3Label')}
              {renderTextInput('चौकोन ४ आकडा (उदा. ३+ Everyone):', 'playStat4Num')}
              {renderTextInput('चौकोन ४ नाव (उदा. कौटुंबिक व सुरक्षित):', 'playStat4Label')}
              {renderTextInput('Google Play बटण वरची ओळ:', 'playBtnTopLabel')}
              {renderTextInput('Google Play बटण मुख्य नाव:', 'playBtnMainLabel')}
              {renderTextInput('थेट APK डाउनलोड बटण मजकूर:', 'playApkBtnText')}
              {renderTextInput('QR कोड शीर्षक:', 'playQrTitle')}
              {renderTextInput('QR कोड उपशीर्षक:', 'playQrSubtitle')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-amber-300 space-y-3">
            <h4 className="font-black text-xs text-[#800C1E]">
              🏛️ विश्वासार्हता व ३ पायऱ्या विभागातील सर्व शब्द:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderTextInput('वरचा बॅज:', 'trustBadge')}
              {renderTextInput('मुख्य शीर्षक:', 'trustHeading')}
              {renderTextInput('उपशीर्षक:', 'trustSubtitle', true)}
              {renderTextInput('आकडा १ (१,०००+):', 'trustStat1Num')}
              {renderTextInput('लेबल १ (वधू-वर स्थळे):', 'trustStat1Label')}
              {renderTextInput('आकडा २ (१००+):', 'trustStat2Num')}
              {renderTextInput('लेबल २ (विवाह जुळले):', 'trustStat2Label')}
              {renderTextInput('आकडा ३ (१००%):', 'trustStat3Num')}
              {renderTextInput('लेबल ३ (सुरक्षित व खाजगी):', 'trustStat3Label')}
              {renderTextInput('आकडा ४ (३६ गुण):', 'trustStat4Num')}
              {renderTextInput('लेबल ४ (पत्रिका मिलन):', 'trustStat4Label')}
              {renderTextInput('३ पायऱ्या शीर्षक:', 'stepsHeading')}
              {renderTextInput('पायरी १ शीर्षक:', 'step1Title')}
              {renderTextInput('पायरी १ वर्णन:', 'step1Desc')}
              {renderTextInput('पायरी २ शीर्षक:', 'step2Title')}
              {renderTextInput('पायरी २ वर्णन:', 'step2Desc')}
              {renderTextInput('पायरी ३ शीर्षक:', 'step3Title')}
              {renderTextInput('पायरी ३ वर्णन:', 'step3Desc')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
