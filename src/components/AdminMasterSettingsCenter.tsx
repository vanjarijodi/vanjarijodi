import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Eye,
  CreditCard,
  Zap,
  Users,
  Bell,
  Sparkles,
  CheckCircle2,
  Lock,
  Globe,
  Send,
  Sliders,
  Gift,
  ScanFace,
  Camera,
  Palette,
  LayoutGrid,
  Megaphone,
  Smartphone,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminPromoManagerModal } from './AdminPromoManagerModal';
import { AdminLogoUploaderModal } from './AdminLogoUploaderModal';
import { WebsiteFullCmsEditor } from './WebsiteFullCmsEditor';
import { HelplineEmailBadge } from './HelplineEmailBadge';
import {
  WebsiteCmsConfig,
  DEFAULT_WEBSITE_CMS,
  getMergedWebsiteCms,
} from '../utils/websiteCmsDefaults';
import { ThemePreset, GestureMode } from '../types';

type MasterSubTab =
  | 'branding_sections'
  | 'registration_privacy'
  | 'popup_ticker_alerts'
  | 'promo_and_plans'
  | 'web_pay_cms'
  | 'play_console_safe';

export const AdminMasterSettingsCenter: React.FC = () => {
  const {
    siteConfig,
    updateSiteConfig,
    plansList,
    updatePlan,
    promoCodes,
    togglePromoCodeStatus,
    sendPushNotification,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<MasterSubTab>('branding_sections');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Embedded Website /pay Full CMS state synced with siteConfig.websiteCms
  const [webCms, setWebCms] = useState<WebsiteCmsConfig>(() =>
    getMergedWebsiteCms(siteConfig?.websiteCms)
  );
  const [cmsSavedMsg, setCmsSavedMsg] = useState<string>('');

  // Quick Broadcast Notification form
  const [quickBroadcastTitle, setQuickBroadcastTitle] = useState<string>(
    siteConfig.broadcastDefaultTitle || '🎉 वंजारी जोडी विशेष सूचना!'
  );
  const [quickBroadcastBody, setQuickBroadcastBody] = useState<string>(
    siteConfig.broadcastDefaultBody ||
      'नवीन व्हेरिफाईड वधू-वर बायोडाटा जोडले गेले आहेत. आजच आपले प्रोफाईल तपासा!'
  );

  // Email OTP Gateway Vault state (Gmail App Password / Custom SMTP / Resend)
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'smtp' | 'resend'>('gmail');
  const [smtpHost, setSmtpHost] = useState<string>('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState<string>('465');
  const [smtpUser, setSmtpUser] = useState<string>('');
  const [smtpPass, setSmtpPass] = useState<string>('');
  const [resendApiKey, setResendApiKey] = useState<string>('');
  const [fromName, setFromName] = useState<string>('वंजारी जोडी मॅट्रिमोनी (Vanjari Jodi)');
  const [fromEmail, setFromEmail] = useState<string>('');
  const [isEmailConfigured, setIsEmailConfigured] = useState<boolean>(false);
  const [hasEmailSecret, setHasEmailSecret] = useState<boolean>(false);
  const [isSavingEmailConfig, setIsSavingEmailConfig] = useState<boolean>(false);
  const [emailConfigStatusMsg, setEmailConfigStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Test Email OTP state
  const [testOtpEmail, setTestOtpEmail] = useState<string>('');
  const [isSendingTestOtp, setIsSendingTestOtp] = useState<boolean>(false);
  const [testOtpResponse, setTestOtpResponse] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getAdminAuthToken = (): string => {
    if (typeof window !== 'undefined') {
      const existing =
        sessionStorage.getItem('vanjari_admin_session_token') ||
        localStorage.getItem('vanjari_admin_session_token');
      if (existing && existing.startsWith('adm_sess_')) {
        return existing;
      }
      const generated = `adm_sess_master_${Date.now()}`;
      sessionStorage.setItem('vanjari_admin_session_token', generated);
      return generated;
    }
    return 'adm_sess_master_panel';
  };

  useEffect(() => {
    let active = true;
    fetch('/api/email/config')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.config) return;
        const cfg = data.config;
        setEmailProvider(cfg.provider || 'gmail');
        setSmtpHost(cfg.smtpHost || 'smtp.gmail.com');
        setSmtpPort(String(cfg.smtpPort || 465));
        setSmtpUser(cfg.smtpUser || '');
        setFromName(cfg.fromName || 'वंजारी जोडी मॅट्रिमोनी (Vanjari Jodi)');
        setFromEmail(cfg.fromEmail || cfg.smtpUser || '');
        setHasEmailSecret(Boolean(cfg.hasPassword || cfg.hasResendKey));
        setIsEmailConfigured(Boolean(cfg.isConfigured));
        setSmtpPass('');
        setResendApiKey('');
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSaveEmailOtpConfig = async () => {
    setIsSavingEmailConfig(true);
    setEmailConfigStatusMsg(null);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/email/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          provider: emailProvider,
          isEnabled: true,
          smtpHost: emailProvider === 'gmail' ? 'smtp.gmail.com' : smtpHost.trim(),
          smtpPort: emailProvider === 'gmail' ? 465 : Number(smtpPort) || 465,
          smtpSecure: emailProvider === 'gmail' ? true : Number(smtpPort) === 465,
          smtpUser: smtpUser.trim(),
          smtpPass: smtpPass.trim() || undefined,
          resendApiKey: resendApiKey.trim() || undefined,
          fromName: fromName.trim() || 'वंजारी जोडी मॅट्रिमोनी',
          fromEmail: fromEmail.trim() || smtpUser.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        if (data.config) {
          setIsEmailConfigured(Boolean(data.config.isConfigured));
          setHasEmailSecret(Boolean(data.config.hasPassword || data.config.hasResendKey));
        }
        setSmtpPass('');
        setResendApiKey('');
        setEmailConfigStatusMsg({
          type: 'success',
          text: data.message || '✅ ईमेल OTP गेटवे सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या!',
        });
        notifyChange('📧 ईमेल OTP गेटवे सेटिंग्ज सेव्ह झाल्या!');
      } else {
        setEmailConfigStatusMsg({
          type: 'error',
          text: data?.error || '❌ सेटिंग्ज सेव्ह करताना त्रुटी आली.',
        });
      }
    } catch (err: any) {
      setEmailConfigStatusMsg({
        type: 'error',
        text: '❌ सर्व्हर संपर्क त्रुटी: ' + (err?.message || ''),
      });
    } finally {
      setIsSavingEmailConfig(false);
    }
  };

  const handleSendLiveTestOtp = async () => {
    const cleanEmail = testOtpEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setTestOtpResponse({
        type: 'error',
        text: '⚠️ कृपया चाचणीसाठी वैध ईमेल पत्ता टाका (उदा. yourname@gmail.com).',
      });
      return;
    }
    setIsSendingTestOtp(true);
    setTestOtpResponse(null);
    try {
      const token = getAdminAuthToken();
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.emailSent) {
        setTestOtpResponse({
          type: 'success',
          text:
            data.message ||
            `✅ यशस्वी! ${cleanEmail} वर टेस्ट ईमेल OTP पाठवला गेला.`,
        });
      } else {
        setTestOtpResponse({
          type: 'error',
          text:
            data?.error ||
            data?.message ||
            '❌ टेस्ट ईमेल OTP पाठवता आला नाही. कृपया Gmail ID व App Password तपासा.',
        });
      }
    } catch (err: any) {
      setTestOtpResponse({
        type: 'error',
        text: '❌ टेस्ट ईमेल सर्व्हर त्रुटी: ' + (err?.message || ''),
      });
    } finally {
      setIsSendingTestOtp(false);
    }
  };

  useEffect(() => {
    if (siteConfig?.websiteCms) {
      setWebCms(getMergedWebsiteCms(siteConfig.websiteCms));
    }
  }, [siteConfig?.websiteCms]);

  const notifyChange = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2800);
  };

  const handleToggle = (key: keyof typeof siteConfig, currentVal: any, label: string) => {
    const newVal = !currentVal;
    updateSiteConfig({ [key]: newVal });
    notifyChange(`'${label}' बदलून ${newVal ? 'सक्रिय (ON)' : 'बंद (OFF)'} केले!`);
  };

  const handleUpdateCmsField = <K extends keyof WebsiteCmsConfig>(
    key: K,
    value: WebsiteCmsConfig[K]
  ) => {
    setWebCms((prev) => {
      const updated = { ...prev, [key]: value };
      updateSiteConfig({ websiteCms: updated });
      return updated;
    });
  };

  const handleSaveAllWebCms = () => {
    updateSiteConfig({ websiteCms: webCms });
    setCmsSavedMsg('✅ वेब पेमेंट पोर्टल (/pay) मधील सर्व बदल यशस्वीरित्या सेव्ह झाले!');
    notifyChange('वेबसाईट (/pay) CMS सेटिंग्ज सेव्ह झाल्या!');
    setTimeout(() => setCmsSavedMsg(''), 4000);
  };

  const handleResetWebCmsDefaults = () => {
    const fresh = { ...DEFAULT_WEBSITE_CMS };
    setWebCms(fresh);
    updateSiteConfig({ websiteCms: fresh });
    setCmsSavedMsg('✅ वेबसाईटचे सर्व शब्द व विभाग मूळ डिफॉल्ट स्थितीत रिसेट केले गेले आहेत!');
    notifyChange('वेबसाईट CMS डिफॉल्टवर रिसेट केले!');
    setTimeout(() => setCmsSavedMsg(''), 4000);
  };

  const handleSendQuickBroadcast = () => {
    if (!quickBroadcastTitle.trim() || !quickBroadcastBody.trim()) {
      notifyChange('कृपया नोटिफिकेशनचे शीर्षक आणि मजकूर भरा.');
      return;
    }
    updateSiteConfig({
      broadcastDefaultTitle: quickBroadcastTitle.trim(),
      broadcastDefaultBody: quickBroadcastBody.trim(),
    });
    if (sendPushNotification) {
      sendPushNotification(quickBroadcastTitle.trim(), quickBroadcastBody.trim(), 'all');
    }
    notifyChange('🔔 सर्व सदस्यांना लाईव्ह पुश नोटिफिकेशन पाठवले व टेम्पलेट सेव्ह केले!');
  };

  const subTabs: { id: MasterSubTab; label: string; badge: string }[] = [
    { id: 'branding_sections', label: '१. ब्रँडिंग, थीम व सेक्शन ऑन-ऑफ', badge: 'App + Web' },
    { id: 'registration_privacy', label: '२. नोंदणी फॉर्म व फोटो-संपर्क प्रायव्हसी', badge: 'Privacy' },
    { id: 'popup_ticker_alerts', label: '३. पॉपअप जाहिरात, टिकर व नोटिफिकेशन', badge: 'Alerts' },
    { id: 'promo_and_plans', label: '४. प्रोमो कोड व प्लॅन किंमती', badge: 'Pricing' },
    { id: 'web_pay_cms', label: '५. वेब पेमेंट पेज (/pay) संपूर्ण CMS', badge: '60+ Fields' },
    { id: 'play_console_safe', label: '६. Google Play सेफ मोड व APK', badge: 'Zero Pay' },
  ];

  const sectionToggleList: {
    key: keyof typeof siteConfig;
    title: string;
    desc: string;
    defaultOn: boolean;
  }[] = [
    {
      key: 'showHeroSection',
      title: 'मुख्य हिरो बॅनर व शोध बॉक्स (Hero Banner)',
      desc: 'वेबसाईटच्या मुख्य पानावरील स्वागत बॅनर आणि झटपट शोध पट्टी',
      defaultOn: true,
    },
    {
      key: 'showProfilesOnIndexPage',
      title: 'मुख्य पानावर वधू-वर बायोडाटा यादी (Biodata Grid)',
      desc: 'लॉगिन केल्यावर आणि होमपेजवर उमेदवारांचे बायोडाटा कार्ड्स दाखवणे',
      defaultOn: true,
    },
    {
      key: 'showBlessingsSection',
      title: 'संत भगवानबाबा आशीर्वाद व भगवानगड विभाग (Blessings)',
      desc: 'संत भगवानबाबा फोटो व समाज प्रेरणा संदेश विभाग',
      defaultOn: true,
    },
    {
      key: 'showFeaturesSection',
      title: 'प्लॅटफॉर्मची मुख्य वैशिष्ट्ये (Features Section)',
      desc: '१००% पडताळणी, गोपनीयता व समाज सेवेची माहिती कार्ड्स',
      defaultOn: true,
    },
    {
      key: 'showSuccessStoriesSection',
      title: 'जुळलेले विवाह / यशोगाथा विभाग (Success Stories)',
      desc: 'वंजारी जोडीच्या माध्यमातून जुळलेल्या विवाहांची माहिती',
      defaultOn: true,
    },
    {
      key: 'showFaqSection',
      title: 'वारंवार विचारले जाणारे प्रश्न (FAQ Section)',
      desc: 'नोंदणी, पडताळणी व वापराबाबत सदस्यांच्या प्रश्नांची उत्तरे',
      defaultOn: true,
    },
    {
      key: 'showStatsSection',
      title: 'समाज नोंदणी आकडेवारी विभाग (Live Statistics)',
      desc: 'एकूण नोंदणीकृत वधू-वर व यशस्वी जुळण्यांचा आकडेवारी विभाग',
      defaultOn: false,
    },
    {
      key: 'showCommunityAdsSection',
      title: 'समाज व्यवसाय व मंगल कार्यालय जाहिरात विभाग',
      desc: 'होमपेजवर समाज व्यवसाय व डिजिटल पोस्टर विभाग दाखवणे',
      defaultOn: false,
    },
    {
      key: 'enableKundaliFeature',
      title: '📜 कुंडली मिलन व जन्मपत्रिका सुविधा (Kundali Feature)',
      desc: 'बंद केल्यास अ‍ॅप आणि वेबसाईटवरून ३६ गुण कुंडली व जन्मपत्रिका सर्व बटणे लपवली जातील',
      defaultOn: true,
    },
    {
      key: 'enableBusinessVendors',
      title: 'विवाह सेवा व्यवसाय डिरेक्टरी (Wedding Vendors)',
      desc: 'मंगल कार्यालय, फोटोग्राफर, केटरर्स डिरेक्टरी पर्याय चालू ठेवणे',
      defaultOn: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Floating Inline Confirmation Toast */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#800C1E] text-amber-100 px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 font-extrabold text-xs flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Master Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#5B0813] via-[#800C1E] to-[#A71930] text-white rounded-3xl shadow-xl border-2 border-amber-400 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 font-black rounded-2xl shadow shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-100 flex flex-wrap items-center gap-2">
                <span>🎛️ मास्टर कस्टमायझेशन सेंटर (App + Website Full Control)</span>
                <span className="text-[11px] bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                  100% Live Sync
                </span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                अ‍ॅडमिन लॉगिनमधून अ‍ॅप आणि वेबसाईटचे सर्व मजकूर, लोगो, सेक्शन्स, प्रायव्हसी नियम, प्रोमो कोड, पॉपअप आणि Google Play सेफ मोड एकाच ठिकाणाहून बदला.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                updateSiteConfig({
                  autoApproveNewRegistrations: true,
                  showFullNameInProfiles: true,
                  blurPhotosForFreeUsers: false,
                  isPlayStoreReviewMode: false,
                  isStrictActivationAppMode: true,
                  enableRazorpay: true,
                  enableUpiQr: true,
                  enablePromoCodes: true,
                  enableFullAccessForPaidMembers: true,
                });
                notifyChange('🚀 सर्व आवश्यक App + Web सेटिंग्ज फायनल लाँचसाठी १-क्लिकमध्ये सक्रिय केल्या!');
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow cursor-pointer transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>१-क्लिक सर्व सुरळीत चालू करा (Auto Ready)</span>
            </button>

            <a
              href="/pay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-amber-100 border border-amber-300/40 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>वेब पेमेंट पोर्टल (/pay) पहा</span>
            </a>
          </div>
        </div>

        {/* 6 Master Sub-Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-white/15">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-2xl text-left font-black text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-lg border-2 border-white'
                    : 'bg-black/25 hover:bg-black/40 text-amber-100 border border-white/15'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                    isActive ? 'bg-[#800C1E] text-amber-200' : 'bg-white/15 text-amber-200'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* OTP & SMS गेटवे सेटिंग्ज (API Key Vault) — Direct Master Control Card  */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-5 border-2 border-amber-400 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>📧 ईमेल OTP गेटवे सेटिंग्ज (Gmail / SMTP / Resend)</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                    isEmailConfigured
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {isEmailConfigured ? '🟢 Email OTP सक्रिय आहे' : '🔴 ईमेल सेटअप आवश्यक'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                SMS व Truecaller पूर्ण बंद — आता लॉगिन, नोंदणी व खाते पडताळणीसाठी थेट मोफत व सुरक्षित ईमेल OTP (Gmail App Password / SMTP) वापरले जाते.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          {/* Column 1 & 2: Email Gateway Inputs */}
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ईमेल प्रोव्हायडर (Email Provider):
                </label>
                <select
                  value={emailProvider}
                  onChange={(e) =>
                    setEmailProvider(e.target.value as 'gmail' | 'smtp' | 'resend')
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                >
                  <option value="gmail">Gmail (Google App Password — सर्वात सोपे)</option>
                  <option value="smtp">Custom SMTP (Zoho / Outlook / Hostinger)</option>
                  <option value="resend">Resend Email API</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  पाठवणाऱ्याचे नाव (Sender Name):
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="वंजारी जोडी मॅट्रिमोनी (Vanjari Jodi)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>
            </div>

            {emailProvider === 'resend' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Resend API Key:
                  </label>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder={
                      hasEmailSecret
                        ? '•••••••••••••••• (API Key सेव्ह आहे)'
                        : 're_xxxxxxxxxxxx...'
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    From Email (व्हेरिफाइड डोमेन ईमेल):
                  </label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="noreply@vanjarijodi.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {emailProvider === 'gmail'
                        ? 'तुमचा Gmail पत्ता (Sender Gmail ID):'
                        : 'SMTP Username / Email:'}
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="उदा. gitevijay123@gmail.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {emailProvider === 'gmail'
                        ? 'Gmail १६-अक्षरी App Password:'
                        : 'SMTP Password:'}
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder={
                        hasEmailSecret
                          ? '•••••••••••••••• (पासवर्ड सेव्ह आहे)'
                          : 'Google Account → Security → App Passwords'
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {emailProvider === 'smtp' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">SMTP Host:</label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.zoho.in"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">SMTP Port:</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="465"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">From Email (ऐच्छिक):</label>
                      <input
                        type="email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        placeholder="support@yourdomain.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                )}

                {emailProvider === 'gmail' && (
                  <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl font-medium">
                    💡 <strong>सोपी टीप:</strong> Google Account मध्ये 2-Step Verification सुरू करा →{' '}
                    <strong>App Passwords</strong> मधून नवीन १६-अक्षरी कोड तयार करून येथे पेस्ट करा (सामान्य Gmail पासवर्ड नाही).
                  </p>
                )}
              </>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSaveEmailOtpConfig}
                disabled={isSavingEmailConfig}
                className="px-5 py-2.5 bg-[#800C1E] hover:bg-[#A71930] disabled:opacity-60 text-amber-100 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{isSavingEmailConfig ? 'सेव्ह होत आहे...' : 'ईमेल OTP सेटिंग्ज सेव्ह करा'}</span>
              </button>

              {emailConfigStatusMsg && (
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                    emailConfigStatusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {emailConfigStatusMsg.text}
                </span>
              )}
            </div>
          </div>

          {/* Column 3: Live Test Email OTP Dispatch */}
          <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="font-black text-[#800C1E] text-xs flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>📧 Live Test ईमेल OTP पाठवा</span>
              </p>
              <p className="text-[11px] text-slate-600">
                सेटिंग्ज सेव्ह केल्यानंतर तुमचा ईमेल पत्ता टाकून प्रत्यक्ष ईमेल OTP तपासा:
              </p>
              <input
                type="email"
                value={testOtpEmail}
                onChange={(e) => setTestOtpEmail(e.target.value)}
                placeholder="उदा. yourname@gmail.com"
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSendLiveTestOtp}
                disabled={isSendingTestOtp}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingTestOtp ? 'ईमेल OTP पाठवत आहे...' : 'Live Test ईमेल OTP पाठवा'}</span>
              </button>

              {testOtpResponse && (
                <div
                  className={`p-2.5 rounded-xl text-[11px] font-bold break-words ${
                    testOtpResponse.type === 'success'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {testOtpResponse.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ब्रँडिंग, थीम व सेक्शन ऑन-ऑफ (Branding, Theme & Section Toggles) */}
      {/* ===================================================================== */}
      {activeSubTab === 'branding_sections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 0: SIMPLE, UNCLUTTERED QUICK CONTROL CENTER (Kundali, Telegram & Helpline Email Styler) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-400 shadow-lg space-y-5 md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#800C1E] to-[#A71930] text-amber-200 shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    ⚡ मुख्य झटपट नियंत्रणे — कुंडली, टेलिग्राम व आकर्षक हेल्पलाईन ईमेल (App + Web)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    कोणतीही गुंतागुंत नाही: येथून एका क्लिकवर कुंडली चालू/बंद करा, टेलिग्राम आयडी बदला आणि वरच्या पट्टीवरील ईमेल आकर्षक सजवा.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 1: Kundali Master Switch + Telegram ID Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. Kundali Feature Master Switch */}
              <div
                className={`p-4 rounded-2xl border-2 transition flex items-start justify-between gap-3 ${
                  siteConfig.enableKundaliFeature !== false
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-rose-50/70 border-rose-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">
                      📜 कुंडली मिलन व जन्मपत्रिका सुविधा
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        siteConfig.enableKundaliFeature !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {siteConfig.enableKundaliFeature !== false ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    बंद (OFF) केल्यास अ‍ॅप आणि वेबसाईटवरील सर्व <strong>३६ गुण कुंडली</strong> व <strong>जन्मपत्रिका</strong> बटणे लगेच लपवली जातील. हवे तेव्हा पुन्हा चालू (ON) करता येते.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = siteConfig.enableKundaliFeature === false;
                    updateSiteConfig({ enableKundaliFeature: nextVal });
                    notifyChange(
                      nextVal
                        ? '📜 कुंडली व जन्मपत्रिका सुविधा अ‍ॅप आणि वेबवर चालू (ON) केली!'
                        : '📜 कुंडली व जन्मपत्रिका सुविधा अ‍ॅप आणि वेबवर बंद (OFF) केली!'
                    );
                  }}
                  className={`w-14 h-7 rounded-full p-0.5 transition cursor-pointer shrink-0 mt-1 ${
                    siteConfig.enableKundaliFeature !== false ? 'bg-emerald-600' : 'bg-rose-500'
                  }`}
                  aria-label="Toggle Kundali Feature"
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      siteConfig.enableKundaliFeature !== false ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. Telegram ID & Toggle Control */}
              <div className="p-4 rounded-2xl border-2 border-sky-200 bg-sky-50/60 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-700" />
                    <span className="font-black text-slate-900 text-sm">
                      💬 टेलिग्राम सपोर्ट आयडी (Telegram ID)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = siteConfig.showTelegramSupport === false;
                      updateSiteConfig({ showTelegramSupport: nextVal });
                      notifyChange(nextVal ? '💬 टेलिग्राम सपोर्ट चालू केला!' : '💬 टेलिग्राम सपोर्ट लपवला!');
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition ${
                      siteConfig.showTelegramSupport !== false
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-400 text-white'
                    }`}
                  >
                    {siteConfig.showTelegramSupport !== false ? '🟢 दिसत आहे (ON)' : '⚪ लपवले (OFF)'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-sky-700 font-black">@</span>
                    <input
                      type="text"
                      value={(siteConfig.telegramUsername || 'Primemultiservice').replace(/^@/, '')}
                      onChange={(e) => {
                        const clean = e.target.value
                          .replace(/^https?:\/\/t\.me\//i, '')
                          .replace(/^@+/, '')
                          .trim();
                        updateSiteConfig({ telegramUsername: clean });
                      }}
                      onBlur={() => notifyChange('💬 नवीन टेलिग्राम आयडी सर्वत्र अपडेट झाला!')}
                      placeholder="Primemultiservice"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-sky-300 rounded-xl text-slate-900 font-black text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <a
                    href={`https://t.me/${(siteConfig.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[11px] shrink-0"
                  >
                    तपासा ↗
                  </a>
                </div>
                <p className="text-[10.5px] text-slate-600">
                  येथे बदललेला आयडी फूटर, मेनू, मदत बटण आणि संपूर्ण अ‍ॅप-वेबवर लगेच लागू होतो.
                </p>

                {/* Telegram Group Join Notice Controls */}
                <div className="pt-2.5 mt-2 border-t border-sky-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-slate-900 text-xs">
                      📢 टेलिग्राम ग्रुप जॉईन सूचना पट्टी (Group Join Notice)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = siteConfig.showTelegramBanner === false;
                        updateSiteConfig({ showTelegramBanner: nextVal });
                        notifyChange(
                          nextVal
                            ? '📢 टेलिग्राम ग्रुप जॉईन सूचना चालू केली!'
                            : '📢 टेलिग्राम ग्रुप जॉईन सूचना बंद केली!'
                        );
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition ${
                        siteConfig.showTelegramBanner !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {siteConfig.showTelegramBanner !== false ? '🟢 दिसत आहे (ON)' : '⚪ बंद (OFF)'}
                    </button>
                  </div>

                  <input
                    type="url"
                    value={siteConfig.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
                    onChange={(e) => updateSiteConfig({ telegramGroupUrl: e.target.value.trim() })}
                    onBlur={() => notifyChange('🔗 टेलिग्राम ग्रुप लिंक अपडेट झाली!')}
                    placeholder="https://t.me/..."
                    className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-xl text-slate-900 font-bold text-[11px] focus:ring-2 focus:ring-sky-500 outline-none"
                  />

                  <input
                    type="text"
                    value={siteConfig.telegramSupportNote || ''}
                    onChange={(e) => updateSiteConfig({ telegramSupportNote: e.target.value })}
                    onBlur={() => notifyChange('📢 टेलिग्राम ग्रुप सूचना मजकूर अपडेट झाला!')}
                    placeholder="रोजचे नवीन वधू-वर बायोडाटा व अपडेट्ससाठी आजच टेलिग्राम ग्रुप जॉईन करा!"
                    className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-xl text-slate-900 font-semibold text-[11px] focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Helpline Email Editor & Attractive Top-Bar Style Customizer + LIVE PREVIEW */}
            <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#800C1E]" />
                  <h4 className="font-black text-slate-900 text-sm">
                    📧 हेल्पलाईन ईमेल आयडी व आकर्षक टॉप-बार डिझाइन (Header Email Customizer)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = siteConfig.showHelplineEmailInHeader === false;
                    updateSiteConfig({ showHelplineEmailInHeader: nextVal });
                    notifyChange(
                      nextVal
                        ? '📧 वरच्या पट्टीवर हेल्पलाईन ईमेल चालू केला!'
                        : '📧 वरच्या पट्टीवरून हेल्पलाईन ईमेल लपवला!'
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer transition ${
                    siteConfig.showHelplineEmailInHeader !== false
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-400 text-white'
                  }`}
                >
                  {siteConfig.showHelplineEmailInHeader !== false
                    ? '🟢 वरच्या पट्टीवर दिसत आहे (ON)'
                    : '⚪ लपवले (OFF)'}
                </button>
              </div>

              {/* Email + Label Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    अधिकृत हेल्पलाईन ईमेल आयडी (Email ID):
                  </label>
                  <input
                    type="email"
                    value={siteConfig.contactEmail || 'gitevijay123@gmail.com'}
                    onChange={(e) =>
                      updateSiteConfig({
                        contactEmail: e.target.value,
                        grievanceOfficerEmail: e.target.value,
                      })
                    }
                    onBlur={() => notifyChange('📧 अधिकृत हेल्पलाईन ईमेल सर्वत्र अपडेट झाला!')}
                    placeholder="support@vanjarijodi.com"
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 font-black text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ईमेलच्या आधीचे लेबल (उदा. अधिकृत हेल्पलाईन: / मदत ईमेल:):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.helplineEmailLabel ?? 'अधिकृत हेल्पलाईन:'}
                    onChange={(e) => updateSiteConfig({ helplineEmailLabel: e.target.value })}
                    onBlur={() => notifyChange('हेल्पलाईन लेबल सेव्ह झाले!')}
                    placeholder="अधिकृत हेल्पलाईन:"
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Size + Style Preset + Glow Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Size Picker */}
                <div className="space-y-1.5">
                  <label className="block text-slate-700 font-bold">अक्षरांचा आकार (Font Size):</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'normal', label: 'सामान्य' },
                      { id: 'large', label: 'मोठा ⭐' },
                      { id: 'xlarge', label: 'अधिक मोठा' },
                    ].map((sz) => {
                      const active = (siteConfig.helplineEmailSize || 'large') === sz.id;
                      return (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => {
                            updateSiteConfig({ helplineEmailSize: sz.id as any });
                            notifyChange(`ईमेल आकार '${sz.label}' सेट केला!`);
                          }}
                          className={`py-2 px-2 rounded-xl font-black text-[11px] border cursor-pointer transition ${
                            active
                              ? 'bg-[#800C1E] text-amber-200 border-amber-400 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100'
                          }`}
                        >
                          {sz.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Style Preset Picker */}
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="block text-slate-700 font-bold">
                    आकर्षक रंग व बॅज स्टाईल (Visual Style):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'gold_glow', label: '✨ गोल्ड ग्लो' },
                      { id: 'bright_pill', label: '🤍 पांढरा चमकदार' },
                      { id: 'royal_badge', label: '👑 रॉयल मरून' },
                      { id: 'attention_banner', label: '💚 हिरवा हायलाईट' },
                    ].map((st) => {
                      const active = (siteConfig.helplineEmailStyle || 'gold_glow') === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            updateSiteConfig({ helplineEmailStyle: st.id as any });
                            notifyChange(`ईमेल स्टाईल '${st.label}' लागू केली!`);
                          }}
                          className={`py-2 px-2 rounded-xl font-black text-[11px] border cursor-pointer transition ${
                            active
                              ? 'bg-[#800C1E] text-amber-200 border-amber-400 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Glow Pulse Toggle + LIVE PREVIEW */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-amber-200">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={Boolean(siteConfig.helplineEmailPulse)}
                    onChange={(e) => {
                      updateSiteConfig({ helplineEmailPulse: e.target.checked });
                      notifyChange(
                        e.target.checked ? '✨ ईमेलवर चमकता इफेक्ट चालू केला!' : 'चमकता इफेक्ट बंद केला.'
                      );
                    }}
                    className="w-4 h-4 accent-[#800C1E] rounded"
                  />
                  <span>✨ लक्ष वेधून घेणारा चमकता इफेक्ट (Subtle Glow Effect)</span>
                </label>

                {/* Live Preview Box */}
                <div className="w-full sm:w-auto bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] px-3.5 py-2 rounded-2xl border border-amber-400/60 flex items-center justify-between sm:justify-center gap-2 shadow-inner">
                  <span className="text-[10px] font-black text-amber-200 uppercase shrink-0">
                    लाईव्ह प्रिव्ह्यू:
                  </span>
                  <HelplineEmailBadge />
                </div>
              </div>
            </div>
          </div>

          {/* Card 1A: Brand Identity, Titles, Logo & Support Contacts */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    १. ब्रँड नाव, लोगो, मुख्य शीर्षके व हेल्पलाईन संपर्क
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    अ‍ॅप आणि वेबसाईटवर सर्वत्र दिसणारे नाव, लोगो व अधिकृत संपर्क
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="px-3 py-1.5 bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-black rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>लोगो बदला</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    अ‍ॅप व वेबसाईटचे मुख्य नाव (Brand Title):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.logoTitle || 'वंजारी जोडी'}
                    onChange={(e) => updateSiteConfig({ logoTitle: e.target.value })}
                    onBlur={() => notifyChange('मुख्य पोर्टल नाव सेव्ह झाले!')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    उप-शीर्षक (Logo Subtitle):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.logoSubtitle || 'वंजारी समाज वधू-वर सूचक'}
                    onChange={(e) => updateSiteConfig({ logoSubtitle: e.target.value })}
                    onBlur={() => notifyChange('उप-शीर्षक सेव्ह झाले!')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  होमपेज मुख्य स्वागत शीर्षक (Hero Heading):
                </label>
                <input
                  type="text"
                  value={siteConfig.heroHeading || siteConfig.heroTitle || 'वंजारी समाजाचे हक्काचे व विश्वासाचे वधू-वर सूचक केंद्र'}
                  onChange={(e) =>
                    updateSiteConfig({ heroHeading: e.target.value, heroTitle: e.target.value })
                  }
                  onBlur={() => notifyChange('होमपेज मुख्य शीर्षक सेव्ह झाले!')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  होमपेज वर्णन (Hero Subheading):
                </label>
                <textarea
                  rows={2}
                  value={
                    siteConfig.heroSubheading ||
                    siteConfig.heroDescription ||
                    'संत भगवानबाबांच्या आशीर्वादाने १००% पडताळणी केलेले सुरक्षित वधू-वर बायोडाटा'
                  }
                  onChange={(e) =>
                    updateSiteConfig({
                      heroSubheading: e.target.value,
                      heroDescription: e.target.value,
                    })
                  }
                  onBlur={() => notifyChange('होमपेज वर्णन सेव्ह झाले!')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    📧 अधिकृत हेल्पलाईन ईमेल:
                  </label>
                  <input
                    type="email"
                    value={siteConfig.contactEmail || 'gitevijay123@gmail.com'}
                    onChange={(e) =>
                      updateSiteConfig({
                        contactEmail: e.target.value,
                        grievanceOfficerEmail: e.target.value,
                      })
                    }
                    onBlur={() => notifyChange('हेल्पलाईन ईमेल सेव्ह झाला!')}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    📞 सपोर्ट मोबाईल नंबर:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactPhone || '+91 90679 69553'}
                    onChange={(e) =>
                      updateSiteConfig({
                        contactPhone: e.target.value,
                        helplineNumber: e.target.value,
                      })
                    }
                    onBlur={() => notifyChange('सपोर्ट फोन नंबर सेव्ह झाला!')}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    💬 टेलिग्राम सपोर्ट युझरनेम:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.telegramUsername || 'Primemultiservice'}
                    onChange={(e) => updateSiteConfig({ telegramUsername: e.target.value })}
                    onBlur={() => notifyChange('टेलिग्राम युझरनेम सेव्ह झाले!')}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 1B: Theme Presets & Card Interaction Style */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  २. अ‍ॅप व वेबसाईट रंगसंगती (Theme Preset) आणि कार्ड रचना
                </h3>
                <p className="text-[11px] text-slate-500">
                  १-क्लिकमध्ये संपूर्ण प्लॅटफॉर्मची थीम व प्रोफाईल ब्राउझिंग शैली बदला
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-700 font-bold">
                रंगसंगती थीम निवडा (Active Theme Preset):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'auspicious_crimson', label: '🌺 मंगल मरून-गोल्ड (Default Crimson)' },
                  { id: 'modern_ruby', label: '💎 मॉडर्न रुबी रेड (Modern Ruby)' },
                  { id: 'royal_trust_blue', label: '🛡️ रॉयल ट्रस्ट ब्लू (Royal Blue)' },
                  { id: 'parents_easy_mode', label: '👓 पालक सोपा मोड (Large Bold UI)' },
                  { id: 'velvet_dark', label: '🌙 व्हेलवेट डार्क मोड (Dark Theme)' },
                ].map((theme) => {
                  const isSelected =
                    (siteConfig.activeThemePreset || 'auspicious_crimson') === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        updateSiteConfig({
                          activeThemePreset: theme.id as ThemePreset,
                          themePreset: theme.id,
                        });
                        notifyChange(`थीम '${theme.label}' लागू केली!`);
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#800C1E] text-amber-200 border-amber-400 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <span className="truncate">{theme.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <label className="block text-slate-700 font-bold pt-2">
                मोबाईल स्वाइप व बायोडाटा कार्ड मोड (Gesture Mode):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'vertical_reels', label: '📱 उभी स्क्रोल यादी (Standard)' },
                  { id: 'four_way_swipe', label: '⚡ ४-दिशा स्वाइप कार्ड्स' },
                  { id: 'three_d_flip', label: '🔄 3D फ्लिप बायोडाटा' },
                  { id: 'story_tap_pullup', label: '📸 स्टोरी टॅप व्ह्यू' },
                ].map((g) => {
                  const isSelected =
                    (siteConfig.activeGestureMode || 'vertical_reels') === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        updateSiteConfig({
                          activeGestureMode: g.id as GestureMode,
                          gestureMode: g.id,
                        });
                        notifyChange(`कार्ड मोड '${g.label}' सेव्ह झाला!`);
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 1C: Master Section Visibility Toggles (App & Website) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 border-b border-amber-200 pb-3">
              <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  ३. होमपेज व अ‍ॅप सेक्शन्स ऑन-ऑफ नियंत्रणे (Section Visibility Toggles)
                </h3>
                <p className="text-[11px] text-slate-500">
                  तुम्हाला हवा तो विभाग चालू (ON) ठेवा किंवा नको असलेला विभाग एका क्लिकवर लपवा (OFF)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {sectionToggleList.map((sec) => {
                const rawVal = siteConfig[sec.key];
                const isOn =
                  rawVal === undefined ? sec.defaultOn : Boolean(rawVal);
                return (
                  <div
                    key={String(sec.key)}
                    className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      isOn
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 leading-snug">{sec.title}</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{sec.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(sec.key, isOn, sec.title)}
                      className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 mt-0.5 ${
                        isOn ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                          isOn ? 'translate-x-5.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: नोंदणी फॉर्म, बायोडाटा नियम व फोटो-संपर्क प्रायव्हसी             */}
      {/* ===================================================================== */}
      {activeSubTab === 'registration_privacy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 2A: Registration & Biodata Field Rules */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  १. सदस्य नोंदणी फॉर्म फील्ड्स व ऑटो-Live नियम
                </h3>
                <p className="text-[11px] text-slate-500">
                  नवीन बायोडाटा भरताना कोणते फील्ड सक्तीचे ठेवायचे व प्रोफाईल लगेच Live करायचे का
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  key: 'autoApproveNewRegistrations' as const,
                  title: 'नवीन नोंदणी होताच प्रोफाईल तात्काळ Live करा',
                  desc: 'सदस्याने बायोडाटा सबमिट करताच अ‍ॅडमिन मंजुरीशिवाय लगेच यादीत दिसेल.',
                  isOn: siteConfig.autoApproveNewRegistrations !== false,
                },
                {
                  key: 'requirePhotoOnRegistration' as const,
                  title: 'नोंदणी करताना उमेदवाराचा फोटो सक्तीचा (Mandatory Photo)',
                  desc: 'फोटो अपलोड केल्याशिवाय नवीन नोंदणी फॉर्म सबमिट होणार नाही.',
                  isOn: Boolean(siteConfig.requirePhotoOnRegistration),
                },
                {
                  key: 'requireGotraOnRegistration' as const,
                  title: 'नोंदणी फॉर्ममध्ये गोत्र / कुलदैवत फील्ड सक्तीचे करा',
                  desc: 'गोत्र व पारंपारिक माहिती भरल्याशिवाय पुढील स्टेपवर जाता येणार नाही.',
                  isOn: Boolean(siteConfig.requireGotraOnRegistration),
                },
                {
                  key: 'biodataWatermarkEnabled' as const,
                  title: 'बायोडाटा PDF व फोटोंवर अधिकृत सुरक्षा वॉटरमार्क दाखवा',
                  desc: 'फोटो व बायोडाटा चोरी रोखण्यासाठी वंजारी जोडीचा वॉटरमार्क लागू राहील.',
                  isOn: siteConfig.biodataWatermarkEnabled !== false,
                },
                {
                  key: 'disablePhotoDownloadAndScreenshot' as const,
                  title: 'फोटो राईट-क्लिक डाउनलोड व स्क्रीनशॉट संरक्षण चालू ठेवा',
                  desc: 'उमेदवारांचे फोटो सेव्ह करण्यापासून सुरक्षा कवच सक्रिय ठेवते.',
                  isOn: siteConfig.disablePhotoDownloadAndScreenshot !== false,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-black text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.key, item.isOn, item.title)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                      item.isOn ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                        item.isOn ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2B: Contact Unlock Rules & Verification */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  २. संपर्क क्रमांक दृश्यता व KYC पडताळणी नियम
                </h3>
                <p className="text-[11px] text-slate-500">
                  मोबाईल नंबर कोणाला दिसावा आणि चेहरा/आधार पडताळणी कशी मंजूर करावी
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  संपर्क क्रमांक अनलॉक नियम (Contact Visibility Policy):
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'mutual_like_only',
                      label: '❤️ फक्त म्युच्युअल लाईक झाल्यावरच नंबर दिसेल (Recommended)',
                    },
                    {
                      id: 'all_paid_members',
                      label: '👑 सर्व व्हेरिफाईड / सक्रिय सदस्यांना थेट नंबर दिसेल',
                    },
                    {
                      id: 'both_allowed',
                      label: '🔓 म्युच्युअल लाईक किंवा व्हेरिफाईड सदस्य दोघांनाही खुला',
                    },
                  ].map((rule) => {
                    const isSelected =
                      (siteConfig.contactUnlockMode || 'both_allowed') === rule.id;
                    return (
                      <button
                        key={rule.id}
                        type="button"
                        onClick={() => {
                          updateSiteConfig({
                            contactUnlockMode: rule.id as any,
                            requireMutualLikeForPhone: rule.id === 'mutual_like_only',
                          });
                          notifyChange(`संपर्क नियम '${rule.label}' लागू केला!`);
                        }}
                        className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#800C1E] text-amber-200 border-amber-400'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        <span>{rule.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <ScanFace className="w-4 h-4 text-teal-600" />
                    <span>सेल्फी पडताळणी:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateSiteConfig({ faceVerificationApprovalMode: 'manual' });
                        notifyChange('सेल्फी मॅन्युअल मंजुरीवर सेट केली!');
                      }}
                      className={`p-2 rounded-lg border font-bold text-[11px] cursor-pointer ${
                        siteConfig.faceVerificationApprovalMode !== 'auto'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      मॅन्युअल
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSiteConfig({ faceVerificationApprovalMode: 'auto' });
                        notifyChange('सेल्फी ऑटो-मंजुरीवर सेट केली!');
                      }}
                      className={`p-2 rounded-lg border font-bold text-[11px] cursor-pointer ${
                        siteConfig.faceVerificationApprovalMode === 'auto'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      ⚡ ऑटो
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>आधार KYC पडताळणी:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateSiteConfig({ aadhaarVerificationApprovalMode: 'manual' });
                        notifyChange('आधार मॅन्युअल मंजुरीवर सेट केले!');
                      }}
                      className={`p-2 rounded-lg border font-bold text-[11px] cursor-pointer ${
                        siteConfig.aadhaarVerificationApprovalMode !== 'auto'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      मॅन्युअल
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSiteConfig({ aadhaarVerificationApprovalMode: 'auto' });
                        notifyChange('आधार ऑटो-मंजुरीवर सेट केले!');
                      }}
                      className={`p-2 rounded-lg border font-bold text-[11px] cursor-pointer ${
                        siteConfig.aadhaarVerificationApprovalMode === 'auto'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      ⚡ ऑटो
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2C: Top Priority Name & Photo Blur Controls */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 border-b border-amber-200 pb-3">
              <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  ३. नाव, फोटो ब्लर व नोटिफिकेशन गोपनीयता नियंत्रणे (Name & Photo Blur Rules)
                </h3>
                <p className="text-[11px] text-slate-500">
                  पहिले नाव ब्लर ठेवणे, विना-ॲक्टिव्हेशन सदस्यांना फोटो ब्लर दाखवणे आणि नोटिफिकेशन्समध्ये नाव मास्क करणे
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl border-2 bg-slate-50 border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-700" />
                    <span>पहिले नाव ब्लर (Mutual Like पर्यंत)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        'blurFirstNameUntilMutualLike',
                        siteConfig.blurFirstNameUntilMutualLike,
                        'पहिले नाव ब्लर नियम'
                      )
                    }
                    className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                      siteConfig.blurFirstNameUntilMutualLike ? 'bg-[#800C1E]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                        siteConfig.blurFirstNameUntilMutualLike
                          ? 'translate-x-5.5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">
                  चालू असल्यास म्युच्युअल लाईक होईपर्यंत पहिले नाव मास्क दिसेल (उदा. 'र•••• कराड').
                </p>
              </div>

              <div className="p-4 rounded-2xl border-2 bg-slate-50 border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#800C1E]" />
                    <span>विना-ॲक्टिव्हेशन फोटो ब्लर करा</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        'blurPhotosForNonActivatedMembers',
                        siteConfig.blurPhotosForNonActivatedMembers !== false,
                        'विना-ॲक्टिव्हेशन फोटो ब्लर'
                      )
                    }
                    className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                      siteConfig.blurPhotosForNonActivatedMembers !== false
                        ? 'bg-[#800C1E]'
                        : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                        siteConfig.blurPhotosForNonActivatedMembers !== false
                          ? 'translate-x-5.5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">
                  बंद केल्यास सर्व सदस्यांना सर्वांचे फोटो १००% स्पष्ट (Unblurred) दिसतील.
                </p>
              </div>

              <div className="p-4 rounded-2xl border-2 bg-slate-50 border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-purple-700" />
                    <span>नोटिफिकेशनमध्ये नाव ब्लर ठेवा</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleToggle(
                        'blurNameInNotifications',
                        siteConfig.blurNameInNotifications !== false,
                        'नोटिफिकेशन नाव ब्लर'
                      )
                    }
                    className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                      siteConfig.blurNameInNotifications !== false
                        ? 'bg-[#800C1E]'
                        : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                        siteConfig.blurNameInNotifications !== false
                          ? 'translate-x-5.5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">
                  पुश व इन-ॲप नोटिफिकेशनमध्ये समोरील व्यक्तीचे पहिले नाव गोपनीय ठेवते.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: पॉपअप जाहिरात, टिकर पट्टी व नोटिफिकेशन टेम्पलेट्स               */}
      {/* ===================================================================== */}
      {activeSubTab === 'popup_ticker_alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 3A: Running Marquee Ticker Banner & Notice Strip */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    १. वरची धावती टिकर पट्टी (Marquee Ticker) व सूचना बॅनर
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    अ‍ॅप व वेबसाईटच्या वरच्या भागात धावणारी महत्त्वाची सूचना पट्टी
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'enableTickerBanner',
                    siteConfig.enableTickerBanner !== false,
                    'धावती टिकर पट्टी'
                  )
                }
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.enableTickerBanner !== false ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.enableTickerBanner !== false ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  धावत्या टिकर पट्टीचा मजकूर (Marquee Ticker Text):
                </label>
                <textarea
                  rows={2}
                  value={
                    siteConfig.tickerText ||
                    siteConfig.marqueeText ||
                    '🚩 वंजारी जोडी मॅट्रिमोनीमध्ये आपले स्वागत आहे! १००% पडताळणी केलेले सुरक्षित वधू-वर बायोडाटा.'
                  }
                  onChange={(e) =>
                    updateSiteConfig({
                      tickerText: e.target.value,
                      marqueeText: e.target.value,
                    })
                  }
                  onBlur={() => notifyChange('धावत्या टिकर पट्टीचा मजकूर सेव्ह झाला!')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  स्थिर सूचना बॅनर मजकूर (Notice Banner Text):
                </label>
                <input
                  type="text"
                  value={
                    siteConfig.noticeBannerText ||
                    siteConfig.topBarText ||
                    'आधार पडताळणी केलेल्या प्रोफाईलला Blue Tick दिली जाते.'
                  }
                  onChange={(e) =>
                    updateSiteConfig({
                      noticeBannerText: e.target.value,
                      topBarText: e.target.value,
                    })
                  }
                  onBlur={() => notifyChange('सूचना बॅनर मजकूर सेव्ह झाला!')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Card 3B: Timed Flash Popup Advertisement */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-[#800C1E]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    २. आकर्षक फ्लॅश पॉपअप जाहिरात (Flash Popup Ad)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    अ‍ॅप/वेबसाईट उघडल्यावर दिसणारे विशेष पॉपअप कार्ड
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'isFlashAdEnabled',
                    Boolean(siteConfig.isFlashAdEnabled),
                    'फ्लॅश पॉपअप जाहिरात'
                  )
                }
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.isFlashAdEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.isFlashAdEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">पॉपअप शीर्षक:</label>
                <input
                  type="text"
                  value={siteConfig.flashAdTitle || 'वंजारी समाज विशेष वधू-वर परिचय मेळावा'}
                  onChange={(e) => updateSiteConfig({ flashAdTitle: e.target.value })}
                  onBlur={() => notifyChange('पॉपअप शीर्षक सेव्ह झाले!')}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">पॉपअप उप-मजकूर:</label>
                <input
                  type="text"
                  value={
                    siteConfig.flashAdSubtitle ||
                    'आजच आपला बायोडाटा नोंदवा आणि हजारो व्हेरिफाईड स्थळे पहा!'
                  }
                  onChange={(e) => updateSiteConfig({ flashAdSubtitle: e.target.value })}
                  onBlur={() => notifyChange('पॉपअप उप-मजकूर सेव्ह झाला!')}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">पॉपअप फोटो URL:</label>
                  <input
                    type="text"
                    value={siteConfig.flashAdImageUrl || ''}
                    onChange={(e) => updateSiteConfig({ flashAdImageUrl: e.target.value })}
                    onBlur={() => notifyChange('पॉपअप फोटो लिंक सेव्ह झाली!')}
                    placeholder="https://..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">बटण मजकूर:</label>
                  <input
                    type="text"
                    value={siteConfig.flashAdButtonText || 'आताच पहा'}
                    onChange={(e) => updateSiteConfig({ flashAdButtonText: e.target.value })}
                    onBlur={() => notifyChange('पॉपअप बटण मजकूर सेव्ह झाला!')}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3C: Notification Templates & 1-Click Live Broadcast */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 border-b border-amber-200 pb-3">
              <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  ३. ऑटोमॅटिक नोटिफिकेशन टेम्पलेट्स व थेट ब्रॉडकास्ट मेसेज
                </h3>
                <p className="text-[11px] text-slate-500">
                  नवीन सदस्याचे स्वागत मेसेज टेम्पलेट आणि सर्व सदस्यांना एकाच क्लिकवर लाईव्ह पुश नोटिफिकेशन पाठवा
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    नवीन नोंदणी स्वागत नोटिफिकेशन टेम्पलेट:
                  </label>
                  <input
                    type="text"
                    value={
                      siteConfig.welcomeNotificationText ||
                      'वंजारी जोडी कुटुंबात आपले मनःपूर्वक स्वागत आहे! आपला बायोडाटा यशस्वीरित्या जतन झाला आहे.'
                    }
                    onChange={(e) =>
                      updateSiteConfig({ welcomeNotificationText: e.target.value })
                    }
                    onBlur={() => notifyChange('स्वागत नोटिफिकेशन टेम्पलेट सेव्ह झाले!')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    प्रोफाईल व्हेरिफिकेशन मंजुरी नोटिफिकेशन टेम्पलेट:
                  </label>
                  <input
                    type="text"
                    value={
                      siteConfig.approvalNotificationText ||
                      'अभिनंदन! तुमचे प्रोफाईल अ‍ॅडमिनकडून पडताळणी होऊन अधिकृत Blue Tick सक्रिय झाली आहे.'
                    }
                    onChange={(e) =>
                      updateSiteConfig({ approvalNotificationText: e.target.value })
                    }
                    onBlur={() => notifyChange('मंजुरी नोटिफिकेशन टेम्पलेट सेव्ह झाले!')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-2.5">
                <p className="font-black text-[#800C1E] text-xs">
                  📢 सर्व सदस्यांना आत्ताच लाईव्ह पुश नोटिफिकेशन पाठवा:
                </p>
                <input
                  type="text"
                  value={quickBroadcastTitle}
                  onChange={(e) => setQuickBroadcastTitle(e.target.value)}
                  placeholder="नोटिफिकेशन शीर्षक..."
                  className="w-full p-2 bg-white border border-amber-300 rounded-xl text-slate-900 font-bold"
                />
                <textarea
                  rows={2}
                  value={quickBroadcastBody}
                  onChange={(e) => setQuickBroadcastBody(e.target.value)}
                  placeholder="नोटिफिकेशन संदेश..."
                  className="w-full p-2 bg-white border border-amber-300 rounded-xl text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={handleSendQuickBroadcast}
                  className="w-full py-2.5 px-4 bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>सर्व सदस्यांना पुश नोटिफिकेशन पाठवा</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: प्रोमो कोड व वेब प्लॅन किंमती (Promo Codes & Plan Pricing)      */}
      {/* ===================================================================== */}
      {activeSubTab === 'promo_and_plans' && (
        <div className="space-y-5">
          {/* Promo Codes Control Card */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-[#800C1E]">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    १. प्रोमो कोड मॅनेजर (Web Checkout Promo Codes)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    वेब पेमेंट पेजवर (`/pay`) सवलत देण्यासाठी नवीन प्रोमो कोड तयार करा किंवा चालू/बंद करा
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPromoModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white font-black rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer shrink-0"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span>+ नवीन प्रोमो कोड तयार करा / मॅनेजर उघडा</span>
              </button>
            </div>

            {promoCodes && promoCodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {promoCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      promo.isActive
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-black text-sm text-[#800C1E] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        {promo.code}
                      </span>
                      <p className="text-[11px] text-slate-700 font-bold mt-1">
                        सूट: {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        togglePromoCodeStatus(promo.id);
                        notifyChange(`प्रोमो कोड ${promo.code} स्टेटस अपडेट केले!`);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-black text-[11px] cursor-pointer ${
                        promo.isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {promo.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                कोणताही प्रोमो कोड तयार नाही. वरच्या बटणावर क्लिक करून नवीन कोड तयार करा.
              </p>
            )}
          </div>

          {/* Web Membership Plans Inline Price & Duration Editor */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    २. वेब पेमेंट पोर्टल (`/pay`) प्लॅन किंमती व कालावधी संपादक
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    येथे बदललेल्या किंमती वेब पेमेंट पेजवर (`/pay`) आणि Razorpay चेकआउटवर तात्काळ लागू होतात (APK मध्ये लपवलेल्या राहतात)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {(plansList || []).map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-[#800C1E] text-sm">
                      {plan.nameMr || plan.name}
                    </span>
                    <span className="font-mono font-black text-xs bg-amber-100 text-[#800C1E] px-2 py-0.5 rounded-full border border-amber-300 tabular-nums">
                      ₹{plan.price}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      प्लॅनचे मराठी नाव:
                    </label>
                    <input
                      type="text"
                      value={plan.nameMr || plan.name}
                      onChange={(e) =>
                        updatePlan(plan.id, { nameMr: e.target.value, name: e.target.value })
                      }
                      onBlur={() => notifyChange(`'${plan.nameMr || plan.name}' नाव सेव्ह झाले!`)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        किंमत (INR ₹):
                      </label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) =>
                          updatePlan(plan.id, { price: Math.max(0, Number(e.target.value) || 0) })
                        }
                        onBlur={() => notifyChange(`प्लॅन किंमत ₹${plan.price} सेव्ह झाली!`)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-slate-900 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        कालावधी मजकूर:
                      </label>
                      <input
                        type="text"
                        value={plan.duration || plan.durationLabelMr || ''}
                        onChange={(e) =>
                          updatePlan(plan.id, {
                            duration: e.target.value,
                            durationLabelMr: e.target.value,
                          })
                        }
                        onBlur={() => notifyChange('प्लॅन कालावधी सेव्ह झाला!')}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: वेब पेमेंट पेज (/pay) संपूर्ण CMS एडिटर                         */}
      {/* ===================================================================== */}
      {activeSubTab === 'web_pay_cms' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-300 shadow-md">
          <WebsiteFullCmsEditor
            cms={webCms}
            onChangeField={handleUpdateCmsField}
            onResetDefaults={handleResetWebCmsDefaults}
            onSaveAll={handleSaveAllWebCms}
            isLiveEditMode={false}
            onToggleLiveEditMode={() => {
              window.open('/pay', '_blank', 'noopener,noreferrer');
            }}
            savedMessage={cmsSavedMsg}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: Google Play फायनल लाँच व APK नियंत्रण (Zero Payment App)        */}
      {/* ===================================================================== */}
      {activeSubTab === 'play_console_safe' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-400 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-emerald-200 pb-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  १. Google Play Store फायनल लाँच (१००% झिरो-पेमेंट ॲप)
                </h3>
                <p className="text-[11px] text-slate-500">
                  कोणत्याही वेगळ्या रिव्ह्यू मोडशिवाय ॲपमध्ये पेमेंट पूर्णपणे बंद व फक्त वेबवर (/pay) स्वतंत्र पोर्टल
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-emerald-950 text-sm">
                    🚀 कायमस्वरूपी झिरो-पेमेंट फायनल लाँच मोड सक्रिय (Permanent ON)
                  </p>
                  <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                    अ‍ॅपमध्ये कुठेही ₹ किंमत, पेमेंट बटण, Razorpay, UPI, प्लॅन किंवा रिफंडचा उल्लेख दिसत नाही. वेगळा Review Mode चालू/बंद करण्याची गरज नाही — ॲप थेट Play Store फायनल लाँचसाठी १००% सुरक्षित आहे.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] shrink-0">
                  ACTIVE
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[11px] text-slate-700">
                <p className="font-black text-slate-900">✅ Google Play Policy फायनल तपासणी यादी:</p>
                <p>• Android App व मुख्य App Shell मध्ये पेमेंट UI कायमस्वरूपी १००% बंद आहे.</p>
                <p>• अ‍ॅपमधील कायदेशीर धोरणांमध्ये (Legal Policies) फक्त समाज सेवा नियम व प्रायव्हसी पॉलिसी दिसते (Refund/Pricing टॅब नाहीत).</p>
                <p>• स्वतंत्र वेब पोर्टल (<code className="px-1 bg-slate-200 rounded">/pay</code>) फक्त थेट ब्राउझरमध्ये उघडल्यावरच चालते.</p>
                <p>• अधिकृत हेल्पलाईन ईमेल: <strong>{siteConfig.contactEmail || 'gitevijay123@gmail.com'}</strong></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  २. Android APK डाउनलोड व Play Store लिंक सेटिंग्ज
                </h3>
                <p className="text-[11px] text-slate-500">
                  वेबसाईटवरून APK डाउनलोड बटण व आवृत्ती क्रमांक नियंत्रित करा
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">
                    वेबसाईटवर APK डाउनलोड बटण दाखवा:
                  </p>
                  <p className="text-[11px] text-slate-600">
                    सदस्यांना थेट `VanjariJodi.apk` डाउनलोड करण्याची सोय
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggle(
                      'showApkDownloadButton',
                      siteConfig.showApkDownloadButton !== false,
                      'APK डाउनलोड बटण'
                    )
                  }
                  className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                    siteConfig.showApkDownloadButton !== false ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                      siteConfig.showApkDownloadButton !== false
                        ? 'translate-x-5.5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    APK डाउनलोड फाईल URL:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.apkDownloadUrl || '/downloads/VanjariJodi.apk'}
                    onChange={(e) => updateSiteConfig({ apkDownloadUrl: e.target.value })}
                    onBlur={() => notifyChange('APK डाउनलोड URL सेव्ह झाली!')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    अ‍ॅप आवृत्ती (App Version):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.apkVersion || '2.4.0'}
                    onChange={(e) => updateSiteConfig({ apkVersion: e.target.value })}
                    onBlur={() => notifyChange('अ‍ॅप आवृत्ती क्रमांक सेव्ह झाला!')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Promo Manager Modal */}
      <AdminPromoManagerModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />

      {/* Dedicated Logo Uploader Modal */}
      <AdminLogoUploaderModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </div>
  );
};
