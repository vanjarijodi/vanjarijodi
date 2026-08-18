import React, { useState } from 'react';
import {
  Settings,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Phone,
  Eye,
  EyeOff,
  CreditCard,
  QrCode,
  Zap,
  MessageSquare,
  Filter,
  Users,
  Building,
  Bell,
  Sparkles,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  Copy,
  Smartphone,
  Link as LinkIcon,
  AlertTriangle,
  Sliders,
  Globe,
  Radio,
  FileText,
  UserCheck,
  Heart,
  Tag,
  Crown,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary } from '../utils/cloudinary';

export const AdminMasterSettingsCenter: React.FC = () => {
  const { siteConfig, updateSiteConfig, currentSubAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isPingingIndexNow, setIsPingingIndexNow] = useState(false);
  const [indexNowResponse, setIndexNowResponse] = useState<string | null>(null);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/paytm-webhook`
    : 'https://your-domain.com/api/paytm-webhook';

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleTriggerIndexNow = async () => {
    setIsPingingIndexNow(true);
    setIndexNowResponse(null);
    try {
      const res = await fetch('/api/seo/indexnow-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: siteConfig.canonicalDomain || window.location.host,
          key: siteConfig.indexNowApiKey || 'vjmatrimony-indexnow-key-2026',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIndexNowResponse(`✅ गुगल व Bing सर्च इंजिनला ${data.pingedUrlsCount} URLs ची माहिती त्वरित पाठवली!`);
        notifyChange('सर्च इंजिन फास्ट इंडेक्सिंग पिंग यशस्वी झाले!');
      } else {
        setIndexNowResponse(`⚠️ पिंग त्रुटी: ${data.error || 'अज्ञात त्रुटी'}`);
      }
    } catch (err: any) {
      setIndexNowResponse(`⚠️ पिंग कनेक्शन त्रुटी: ${err.message}`);
    } finally {
      setIsPingingIndexNow(false);
    }
  };

  const notifyChange = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleToggle = (key: keyof typeof siteConfig, currentVal: any, label: string) => {
    const newVal = !currentVal;
    updateSiteConfig({ [key]: newVal });
    notifyChange(`'${label}' सेटिंग बदलून ${newVal ? 'सक्रिय (ON)' : 'बंद (OFF)'} केली!`);
  };

  const handleModeChange = (key: keyof typeof siteConfig, value: any, label: string) => {
    updateSiteConfig({ [key]: value });
    notifyChange(`'${label}' अपडेट केली!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#A71930] text-amber-100 px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 font-extrabold text-xs flex items-center gap-2 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-900 via-[#800C1E] to-[#A71930] text-white rounded-3xl shadow-xl border-2 border-amber-400 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400/20 rounded-2xl border border-amber-300/40 text-amber-200">
              <Sliders className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2">
                <span>🎛️ सेन्ट्रल मास्टर सेटिंग्ज कंट्रोल सेंटर (Master Settings)</span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                वेबसाईटच्या सर्व सेटिंग्ज, प्रायव्हसी, पेमेंट गेटवे, ऑटो मोड व फीचर्सचे संपूर्ण नियंत्रण.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                updateSiteConfig({
                  isAutoModeEnabled: true,
                  autoApproveNewRegistrations: true,
                  enableFullAccessForPaidMembers: true,
                  enableRazorpay: true,
                  enableUpiQr: true,
                  enableChatGlobal: true,
                  enableSearchFilters: true
                });
                notifyChange('🚀 ऑटो-पायलट मोड (Full Auto Mode) सक्रिय केला!');
              }}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-xs shadow cursor-pointer transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-950" />
              <span>ऑटो मोड चालू (Auto Mode)</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Filter Toolbar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2 relative z-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-300 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="सेटिंग शोधा (उदा. प्रायव्हसी, पेमेंट, ऑटो मोड, चॅट, फोटो...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-amber-300/50 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-amber-200/60 outline-none focus:bg-white/20"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
                selectedCategory === 'all'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              सर्व सेटिंग्ज (All)
            </button>
            <button
              onClick={() => setSelectedCategory('privacy')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
                selectedCategory === 'privacy'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              🔒 प्रायव्हसी
            </button>
            <button
              onClick={() => setSelectedCategory('registration')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
                selectedCategory === 'registration'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              📝 नोंदणी/ऑटो
            </button>
            <button
              onClick={() => setSelectedCategory('payments')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
                selectedCategory === 'payments'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              💳 पेमेंट
            </button>
            <button
              onClick={() => setSelectedCategory('features')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
                selectedCategory === 'features'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              ✨ फीचर्स
            </button>
            <button
              onClick={() => setSelectedCategory('layout')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
                selectedCategory === 'layout'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              🎨 UI लेआउट व थीम इंजिन
            </button>
            <button
              onClick={() => setSelectedCategory('seo')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition ${
                selectedCategory === 'seo'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              🔍 SEO व इंडेक्सिंग
            </button>
          </div>
        </div>
      </div>

      {/* 📊 LIVE SYSTEM CONFIGURATION SUMMARY & PRESETS DASHBOARD */}
      <div className="bg-gradient-to-b from-amber-50 to-orange-50/50 rounded-3xl p-5 border-2 border-amber-300/80 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-amber-200 pb-3">
          <div>
            <h3 className="font-black text-[#800C1E] text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
              <span>१. प्रणालीची सध्याची लाईव्ह सेटिंग स्थिती (Active System Status Overview)</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              वेबसाईटवर कोणती सेटिंग चालू आहे व कोणती बंद आहे हे खालील कार्ड्सवरून एकाच नजरेत स्पष्ट कळेल.
            </p>
          </div>
          <span className="text-xs font-black bg-amber-200 text-[#800C1E] px-3 py-1 rounded-full border border-amber-400 self-start md:self-auto">
            🟢 थेट थेट (Real-time Live)
          </span>
        </div>

        {/* 8 Core Status Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Card 1: Automation */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>ऑटो-पायलट:</span>
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-black border text-center ${
                siteConfig.isAutoModeEnabled
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {siteConfig.isAutoModeEnabled ? '🟢 चालू (Auto)' : '🔴 मॅन्युअल (Manual)'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('registration')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>

          {/* Card 2: Registrations */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>नवीन नोंदणी:</span>
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-black border text-center ${
                siteConfig.autoApproveNewRegistrations
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-amber-100 text-amber-950 border-amber-300'
              }`}
            >
              {siteConfig.autoApproveNewRegistrations ? '⚡ स्वयंचलित अप्रूव्ह' : '🛡️ ॲडमिन मंजुरी'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('registration')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>

          {/* Card 3: Likes */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>प्रोफाईल लाईक्स:</span>
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-black border text-center ${
                siteConfig.requirePaidForLikes !== false
                  ? 'bg-rose-100 text-rose-950 border-rose-300'
                  : 'bg-sky-100 text-sky-950 border-sky-300'
              }`}
            >
              {siteConfig.requirePaidForLikes !== false ? '💎 फक्त पेड मेंबर्स' : '🌐 सर्वांना खुला'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('privacy')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>

          {/* Card 4: Contact Unlock */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>मोबाईल नंबर:</span>
              </span>
            </div>
            <span className="px-2 py-1 rounded-lg text-xs font-black border text-center bg-amber-100 text-amber-950 border-amber-300">
              {siteConfig.contactUnlockMode === 'mutual_like_only'
                ? '🤝 फक्त म्युचुअल'
                : siteConfig.contactUnlockMode === 'all_paid_members'
                ? '💳 सर्व पेड मेंबर्स'
                : '🔄 दोन्ही मार्ग चालू'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('privacy')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>

          {/* Card 5: Payment Gateways */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                <span>पेमेंट गेटवे:</span>
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-black border text-center ${
                siteConfig.enableRazorpay || siteConfig.enableUpiQr
                  ? 'bg-purple-100 text-purple-950 border-purple-300'
                  : 'bg-rose-100 text-rose-950 border-rose-300'
              }`}
            >
              {siteConfig.enableRazorpay ? 'Razorpay ' : ''}
              {siteConfig.enableUpiQr ? 'UPI-QR' : ''}
              {!siteConfig.enableRazorpay && !siteConfig.enableUpiQr ? '🔴 बंद' : ''}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('payments')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>

          {/* Card 6: Chat */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>चॅट व मेसेज:</span>
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-black border text-center ${
                siteConfig.enableChatGlobal !== false
                  ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {siteConfig.enableChatGlobal !== false ? '💬 चॅट चालू (ON)' : '🔴 बंद (OFF)'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('features')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>

          {/* Card 7: Screenshot Protection */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>सुरक्षा लॉक:</span>
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-black border text-center ${
                siteConfig.disablePhotoDownloadAndScreenshot
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {siteConfig.disablePhotoDownloadAndScreenshot ? '🛡️ स्क्रीनशॉट लॉक' : '🔓 सामान्य पर्याय'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('privacy')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>

          {/* Card 8: Guest Access */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>गेस्ट विझिटर्स:</span>
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-black border text-center ${
                siteConfig.allowGuestsToViewContacts
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {siteConfig.allowGuestsToViewContacts ? '🌐 नंबर खुला' : '🔒 नंबर बंद'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('privacy')}
              className="text-[10px] font-extrabold text-[#A71930] hover:underline text-center cursor-pointer"
            >
              बदला ➔
            </button>
          </div>
        </div>

        {/* 🚀 ONE-CLICK READYMADE SYSTEM PRESETS */}
        <div className="bg-white p-4 rounded-2xl border border-amber-300 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h4 className="font-black text-[#800C1E] text-xs sm:text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>२. एका क्लीकवर प्रीसेट सिस्टीम मोड निवडा (1-Click System Presets):</span>
            </h4>
            <span className="text-[10px] font-bold text-slate-500">
              वेळ वाचवण्यासाठी खालीलपैकी कोणताही एक मोड निवडा
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Preset 1: Full Auto */}
            <button
              type="button"
              onClick={() => {
                updateSiteConfig({
                  isAutoModeEnabled: true,
                  autoApproveNewRegistrations: true,
                  enableFullAccessForPaidMembers: true,
                  autoUnlockOnPayment: true,
                  enableMutualLikeContactUnlock: true,
                  requirePaidForLikes: true,
                  enableRazorpay: true,
                  enableUpiQr: true,
                  enableChatGlobal: true,
                  enableSearchFilters: true
                });
                notifyChange('🚀 पूर्ण ऑटो-पायलट मोड (Full Automation Mode) सक्रिय केला!');
              }}
              className="p-3 rounded-xl border-2 border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-left transition cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950 text-xs flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>१. पूर्ण ऑटो-पायलट (Full Auto)</span>
                </span>
                <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                  शिफारस 👍
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium">
                सर्व प्रक्रिया स्वयंचलित. नवीन प्रोफाइल ऑटो अप्रूव्ह, ऑटो पेमेंट अनलॉक व मेसेजिंग चालू.
              </p>
            </button>

            {/* Preset 2: High Security */}
            <button
              type="button"
              onClick={() => {
                updateSiteConfig({
                  isAutoModeEnabled: false,
                  autoApproveNewRegistrations: false,
                  autoUnlockOnPayment: false,
                  enableMutualLikeContactUnlock: false,
                  hidePhoneNumbersGlobal: true,
                  disablePhotoDownloadAndScreenshot: true,
                  allowGuestsToViewContacts: false
                });
                notifyChange('🛡️ उच्च सुरक्षा व ॲडमिन मंजुरी मोड सक्रिय केला!');
              }}
              className="p-3 rounded-xl border-2 border-rose-300 bg-rose-50/70 hover:bg-rose-100/80 text-left transition cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-rose-950 text-xs flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>२. उच्च सुरक्षा व ॲडमिन मंजुरी</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium">
                प्रत्येक नवीन प्रोफाइल व मोबाईल अनलॉक ॲडमिनने तपासल्याशिवाय वेबसाईटवर दिसणार नाही.
              </p>
            </button>

            {/* Preset 3: Paid Members Only */}
            <button
              type="button"
              onClick={() => {
                updateSiteConfig({
                  requirePaidForLikes: true,
                  enableFullAccessForPaidMembers: true,
                  contactUnlockMode: 'all_paid_members',
                  allowGuestsToViewContacts: false,
                  enableRazorpay: true,
                  enableUpiQr: true
                });
                notifyChange('💎 व्हीआयपी व पेड मेम्बर्स ऑनली मोड सक्रिय केला!');
              }}
              className="p-3 rounded-xl border-2 border-purple-300 bg-purple-50/70 hover:bg-purple-100/80 text-left transition cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-950 text-xs flex items-center gap-1">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span>३. व्हीआयपी व पेड मेम्बर्स मोड</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium">
                केवळ सबस्क्रिप्शन घेतलेल्या सदस्यांनाच संपर्क व सर्व फीचर्स मिळतील. फ्री युझर्सना मर्यादित.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY 1: PRIVACY & ACCESS CONTROL */}
      {(selectedCategory === 'all' || selectedCategory === 'privacy') && (
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="font-black text-[#A71930] text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#A71930]" />
              <span>१. सुरक्षा व वैयक्तिक माहिती गोपनीयता सेटिंग्ज (Privacy & Access Controls)</span>
            </h3>
            <span className="text-[10px] font-black bg-amber-100 text-[#A71930] px-3 py-1 rounded-full border border-amber-300">
              ॲडमिन मास्टर नियम 🛡️
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* REQUIRE PAID FOR LIKES TOGGLE */}
            <div className="p-4 rounded-2xl bg-rose-50/90 border-2 border-rose-300 space-y-2 col-span-1 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-black text-rose-950 text-sm flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#A71930] fill-[#A71930]" />
                    <span>फक्त पेमेंट केलेल्या सदस्यांनाच लाईक पर्याय (Require Paid Subscription for Likes):</span>
                  </span>
                  <span className="text-xs text-slate-700 font-bold block mt-1">
                    ℹ️ काय काम करते: ही सेटिंग चालू ठेवल्यास फक्त एक्टिव्ह सबस्क्रिप्शन (पेमेंट) असलेल्या सदस्यांनाच वधू/वरांच्या प्रोफाईलला 'लाईक' (Express Interest) करता येते.
                  </span>
                  <span className="text-[11px] text-[#800C1E] font-semibold block mt-0.5">
                    👉 परिणाम: फ्री/विना-पेमेंट सदस्याने लाईकवर क्लीक केल्यास त्यांना थेट पेमेंटचा प्लॅन उघडून दिला जातो.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggle(
                      'requirePaidForLikes',
                      siteConfig.requirePaidForLikes !== false,
                      'फक्त पेमेंट सदस्यांना लाईक'
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                    siteConfig.requirePaidForLikes !== false
                      ? 'bg-[#A71930] text-amber-100 shadow-md border border-amber-300'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {siteConfig.requirePaidForLikes !== false ? 'सक्रिय (Paid Only ON)' : 'सर्वांना खुला (OFF)'}
                </button>
              </div>
            </div>

            {/* MUTUAL LIKE CONTACT UNLOCK TOGGLE */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-2 col-span-1 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-black text-amber-950 text-sm flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-700" />
                    <span>एकमेकांना लाईक केल्यावर मोबाईल नंबर ऑटो-अनलॉक (Mutual Like Contact Unlock):</span>
                  </span>
                  <span className="text-xs text-slate-700 font-bold block mt-1">
                    ℹ️ काय काम करते: जेव्हा दोन सदस्यांनी एकमेकांना 'लाईक' (Mutual Match) केले असेल, तेव्हा दोघांचे संपर्क क्रमांक स्वयंचलितपणे (Auto Unlock) होऊन एकमेकांना दिसतात.
                  </span>
                  <span className="text-[11px] text-amber-900 font-semibold block mt-0.5">
                    👉 परिणाम: "🎉 म्युचुअल मॅच! दोघांनी एकमेकांना लाईक केल्यामुळे नंबर अनलॉक झाला" असा मेसेज व मोबाईल नंबर दिसू लागतो.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggle(
                      'enableMutualLikeContactUnlock',
                      siteConfig.enableMutualLikeContactUnlock !== false,
                      'म्युचुअल लाईक संपर्क अनलॉक'
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                    siteConfig.enableMutualLikeContactUnlock !== false
                      ? 'bg-emerald-600 text-white shadow-md border border-emerald-300'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {siteConfig.enableMutualLikeContactUnlock !== false ? 'ऑटो अनलॉक चालू (ON)' : 'बंद (OFF)'}
                </button>
              </div>

              {/* CONTACT UNLOCK ACCESS MODE SELECTOR */}
              <div className="pt-3 border-t border-amber-200/80 space-y-2">
                <label className="block text-slate-900 text-xs font-black">
                  🎛️ वेबसाईटवरील संपर्क क्रमांक व्हिजिबिलिटी मोड (Contact Unlock Rules):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleModeChange('contactUnlockMode', 'both_allowed', 'संपर्क अनलॉक मोड: दोन्ही पद्धती')}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer flex flex-col justify-between ${
                      (siteConfig.contactUnlockMode || 'both_allowed') === 'both_allowed'
                        ? 'bg-amber-500 text-amber-950 border-amber-600 font-black shadow'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>१. दोन्ही पद्धती चालू</span>
                    <span className="text-[10px] font-medium opacity-90 mt-1">
                      (सर्व पेमेंट सदस्यांना डायरेक्ट नंबर व म्युचुअल लाईकने सुद्धा ऑटो नंबर अनलॉक)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('contactUnlockMode', 'mutual_like_only', 'संपर्क अनलॉक मोड: फक्त म्युचुअल लाईक')}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer flex flex-col justify-between ${
                      siteConfig.contactUnlockMode === 'mutual_like_only'
                        ? 'bg-amber-500 text-amber-950 border-amber-600 font-black shadow'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>२. फक्त म्युचुअल लाईक</span>
                    <span className="text-[10px] font-medium opacity-90 mt-1">
                      (दोघांनी एकमेकांना लाईक केल्यावरच मोबाईल नंबर अनलॉक होऊन दिसेल)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('contactUnlockMode', 'all_paid_members', 'संपर्क अनलॉक मोड: सर्व पेमेंट सदस्यांना')}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer flex flex-col justify-between ${
                      siteConfig.contactUnlockMode === 'all_paid_members'
                        ? 'bg-amber-500 text-amber-950 border-amber-600 font-black shadow'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>३. सर्व पेमेंट सदस्यांना</span>
                    <span className="text-[10px] font-medium opacity-90 mt-1">
                      (चालू पेमेंट प्लॅन असणाऱ्या सर्व सदस्यांना सर्व नंबर थेट दिसतील)
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Allow Members to Control Privacy Toggle */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>सदस्यांना स्वतःची प्रायव्हसी ठरवण्याची मुभा (Member Self Privacy):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  सक्रिय केल्यास युझर्स फॉर्ममध्ये किंवा प्रोफाइलमध्ये फोटो व मोबाईल नंबर स्वतः लपवू शकतात.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'allowMembersToControlPrivacy',
                    siteConfig.allowMembersToControlPrivacy !== false,
                    'सदस्य प्रायव्हसी निवड मुभा'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.allowMembersToControlPrivacy !== false
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-rose-600 text-white shadow'
                }`}
              >
                {siteConfig.allowMembersToControlPrivacy !== false ? 'मुभा दिली (ON)' : 'बंद (Locked)'}
              </button>
            </div>

            {/* Admin Override Privacy */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-700" />
                  <span>ॲडमिन मास्टर नियम सदस्यांच्या गोपनीयतेवर लागू (Admin Privacy Override):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  सक्रिय केल्यास युझरने नंबर/फोटो लपवला असला तरी ॲडमिनचे संपर्क नियम लागू होतील.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'adminOverrideMemberPrivacy',
                    siteConfig.adminOverrideMemberPrivacy === true,
                    'ॲडमिन प्रायव्हसी ओवरराईड'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.adminOverrideMemberPrivacy === true
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.adminOverrideMemberPrivacy === true ? 'सक्रिय (ON)' : 'बंद (OFF)'}
              </button>
            </div>

            {/* Auto Unlock Mobile Numbers on Payment */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5 text-xs sm:text-sm">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>पेमेंट केलेल्या सदस्यांना मोबाईल नंबर ऑटो दाखवा (Auto-Unlock on Payment):</span>
                </span>
                <span className="text-[11px] text-slate-700 font-medium block mt-0.5">
                  चालू ठेवल्यास सबस्क्रिप्शन पेमेंट केलेल्या सदस्यांना मोबाईल नंबर ऑटोमॅटिक (थेट) दिसतील. बंद केल्यास मोबाईल लॉक राहतील व ॲडमिन मंजुरी आवश्यक असेल.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentVal = siteConfig.autoUnlockOnPayment !== false || siteConfig.allowMembersToViewContacts;
                  handleToggle('autoUnlockOnPayment', currentVal, 'पेमेंट ऑटो अनलॉक');
                  updateSiteConfig({
                    autoUnlockOnPayment: !currentVal,
                    allowMembersToViewContacts: !currentVal,
                  });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.autoUnlockOnPayment !== false || siteConfig.allowMembersToViewContacts
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-rose-600 text-white shadow'
                }`}
              >
                {siteConfig.autoUnlockOnPayment !== false || siteConfig.allowMembersToViewContacts
                  ? 'ऑटो अनलॉक (ON)'
                  : 'मोबाईल लॉक (OFF)'}
              </button>
            </div>

            {/* Global Hide Phone Numbers */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>संपूर्ण वेबसाईटवर मोबाईल नंबर लपवा (Global Hide Phone Numbers):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  सर्व युझर्ससाठी मोबाईल नंबर लपवले जातील (फक्त अनलॉकमध्ये दिसतील).
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'hidePhoneNumbersGlobal',
                    siteConfig.hidePhoneNumbersGlobal === true,
                    'ग्लोबल मोबाईल नंबर लपवणे'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.hidePhoneNumbersGlobal === true
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-emerald-600 text-white shadow'
                }`}
              >
                {siteConfig.hidePhoneNumbersGlobal === true ? 'लपवले आहेत (ON)' : 'दिसत आहेत (OFF)'}
              </button>
            </div>

            {/* Allow Guests to View Contacts */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>गेस्ट / विना-लॉगिन विझिटर्सना मोबाईल नंबर दाखवा:</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  विना-लॉगिन युझर्सना बायोडाटाचे संपर्क थेट उघडे दिसतील.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'allowGuestsToViewContacts',
                    siteConfig.allowGuestsToViewContacts === true,
                    'गेस्ट संपर्क व्ह्यू'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.allowGuestsToViewContacts === true
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.allowGuestsToViewContacts === true ? 'चालू (Allowed)' : 'बंद (Locked)'}
              </button>
            </div>

            {/* Disable Photo Download & Screenshot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>फोटो डाऊनलोड व स्क्रीनशॉट संरक्षण (Disable Photo Download):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  चित्र उघडल्यावर राईट क्लीक व सेव्ह पर्याय ब्लॉक केला जाईल.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'disablePhotoDownloadAndScreenshot',
                    siteConfig.disablePhotoDownloadAndScreenshot === true,
                    'स्क्रीनशॉट/फोटो डाऊनलोड सुरक्षा'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.disablePhotoDownloadAndScreenshot === true
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.disablePhotoDownloadAndScreenshot === true ? 'सुरक्षा चालू (ON)' : 'बंद (OFF)'}
              </button>
            </div>

            {/* Aadhaar Verification Mandatory/Optional */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>आधार पडताळणी पर्याय (Aadhaar Verification System):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  प्रोफाईलवर आधार पडताळणी बॅज पर्याय चालू किंवा बंद ठेवा.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'enableAadhaarVerification',
                    siteConfig.enableAadhaarVerification !== false,
                    'आधार पडताळणी पर्याय'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.enableAadhaarVerification !== false
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.enableAadhaarVerification !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: REGISTRATION & AUTO APPROVAL */}
      {(selectedCategory === 'all' || selectedCategory === 'registration') && (
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="font-black text-[#A71930] text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#A71930]" />
              <span>२. नोंदणी व ऑटो-मंजुरी नियंत्रण (Registration & Auto Approval Settings)</span>
            </h3>
            <span className="text-[10px] font-black bg-amber-100 text-[#A71930] px-3 py-1 rounded-full border border-amber-300">
              ऑटो सिस्टीम ⚡
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Auto Mode Switch */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>ऑटो मोड सिस्टीम (Is Auto Mode Enabled):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  ॲडमिनच्या हस्तक्षेपाशिवाय संपूर्ण वेबसाईट ऑटोमॅटिक काम करेल.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'isAutoModeEnabled',
                    siteConfig.isAutoModeEnabled === true,
                    'ऑटो मोड सिस्टीम'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.isAutoModeEnabled === true
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.isAutoModeEnabled === true ? 'चालू (Auto ON)' : 'बंद (Manual)'}
              </button>
            </div>

            {/* Auto Approve New Registrations */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>नवीन नोंदणी थेट मंजूर करा (Auto Approve New Profiles):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  नवीन भरलेले प्रोफाईल्स ॲडमिन मंजुरीशिवाय लगेच थेट सार्वजनिक होतील. ऑफ ठेवल्यास सर्व प्रलंबित (Pending) मध्ये जातील.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'autoApproveNewRegistrations',
                    siteConfig.autoApproveNewRegistrations === true,
                    'नवीन नोंदणी ऑटो मंजुरी'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.autoApproveNewRegistrations === true
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-rose-600 text-white shadow'
                }`}
              >
                {siteConfig.autoApproveNewRegistrations === true ? 'थेट मंजूर (ON)' : 'ॲडमिन मंजुरी प्रलंबित (OFF)'}
              </button>
            </div>

            {/* Name Display Control for Free Users */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>👤 बिन-पेमेंट (Free) सदस्यांना नावाची दृश्यमानता (Name Display Controls):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  ज्या सदस्यांनी पेमेंट केलेले नाही त्यांना वधू-वरांचे नाव कशा प्रकारे दिसावे ते निवडा:
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'full_name' })}
                  className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    (siteConfig.nameDisplayModeForFreeUsers || 'full_name') === 'full_name'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🟢 पूर्ण नाव (Full Name)
                </button>

                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'first_name_only' })}
                  className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    siteConfig.nameDisplayModeForFreeUsers === 'first_name_only'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🟡 फक्त पहिले नाव (First Name)
                </button>

                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'first_and_last' })}
                  className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    siteConfig.nameDisplayModeForFreeUsers === 'first_and_last'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🔵 नाव + आडनाव (First & Last)
                </button>

                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'surname_only' })}
                  className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    siteConfig.nameDisplayModeForFreeUsers === 'surname_only'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🟣 फक्त आडनाव (Surname Only)
                </button>

                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'hidden_star' })}
                  className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    siteConfig.nameDisplayModeForFreeUsers === 'hidden_star'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🔴 स्टार्स मास्क (र**** ब****)
                </button>

                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'blurred_name' })}
                  className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    siteConfig.nameDisplayModeForFreeUsers === 'blurred_name'
                      ? 'bg-slate-800 text-amber-200 border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🌫️ पूर्ण नाव ब्लर (Blurred Name)
                </button>
              </div>

              {/* Name Blur Intensity Selector if Blurred Name selected */}
              {siteConfig.nameDisplayModeForFreeUsers === 'blurred_name' && (
                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-700">नाव ब्लर तीव्रता (% Intensity):</span>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => updateSiteConfig({ nameBlurPercentage: pct })}
                        className={`px-2.5 py-1 rounded-lg font-black text-[10px] border cursor-pointer transition-all ${
                          (siteConfig.nameBlurPercentage || 50) === pct
                            ? 'bg-[#A71930] text-white border-[#800C1E] shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Photo Blur Controls for Free Users */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-black text-slate-900 block flex items-center gap-1.5 text-xs sm:text-sm">
                    <span>🖼️ बिन-पेमेंट सदस्यांसाठी फोटो ब्लर सेटिंग (Photo Blur & % Controls):</span>
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                    नॉन-पेईड सदस्यांना फोटो धुसर (Blur) दाखवायचा का आणि किती % ब्लर ठेवायचा ते ठरवा:
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => updateSiteConfig({ blurPhotosForFreeUsers: !siteConfig.blurPhotosForFreeUsers })}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs shrink-0 cursor-pointer transition-all border ${
                    siteConfig.blurPhotosForFreeUsers
                      ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                      : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {siteConfig.blurPhotosForFreeUsers ? '🔒 फोटो ब्लर सुरु (ON)' : '👁️ फोटो स्पष्ट (OFF)'}
                </button>
              </div>

              {siteConfig.blurPhotosForFreeUsers && (
                <div className="p-3 bg-white/90 rounded-xl border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-black text-slate-800">फोटो ब्लर प्रमाण (% Blur Percentage Intensity):</span>
                    <div className="flex items-center gap-1">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => updateSiteConfig({ photoBlurPercentage: pct })}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs border cursor-pointer transition-all ${
                            (siteConfig.photoBlurPercentage || 50) === pct
                              ? 'bg-[#A71930] text-white border-[#800C1E] shadow-sm'
                              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {pct}% {pct === 25 ? '(हलका)' : pct === 50 ? '(मध्यम)' : pct === 75 ? '(गडद)' : '(पूर्ण लॉक)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-900 font-bold">
                    💡 टीप: सदस्याने प्रीमियम सबस्क्रिप्शन घेतल्यानंतर किंवा म्युचुअल लाईक झाल्यावर फोटो आपोआप १-सेकंदात पूर्ण स्पष्ट दिसेल.
                  </p>
                </div>
              )}
            </div>

            {/* Auto Approve Likes & Direct Push Notification Toggle */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between gap-3 shadow-sm">
              <div>
                <span className="font-black text-[#A71930] block flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>ऑटो-लाईक व डायरेक्ट पुश नोटिफिकेशन (Direct Like Notification):</span>
                </span>
                <span className="text-[11px] text-slate-700 font-medium block mt-0.5">
                  ऑन ठेवली तर युझरने 'लाईक' करताच समोरच्या सदस्याला थेट पुश नोटिफिकेशन व अलर्ट जाईल. ऑफ ठेवल्यास ॲडमिन मंजुरीनंतर नोटिफिकेशन जाईल.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'autoApproveLikes',
                    siteConfig.autoApproveLikes !== false,
                    'ऑटो-लाईक व डायरेक्ट पुश नोटिफिकेशन'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.autoApproveLikes !== false
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-rose-600 text-white shadow'
                }`}
              >
                {siteConfig.autoApproveLikes !== false ? 'थेट नोटिफिकेशन (ON)' : 'ॲडमिन मंजुरी प्रलंबित (OFF)'}
              </button>
            </div>

            {/* Enable Guest Login */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>गेस्ट प्रवेश (Guest Access Mode):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  लॉगिन नसणाऱ्यांना बायोडाटा शोधण्याची व पाहण्याची मुभा देणे.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'enableGuestLogin',
                    siteConfig.enableGuestLogin !== false,
                    'गेस्ट लॉगीन प्रवेश'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.enableGuestLogin !== false
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.enableGuestLogin !== false ? 'चालू (Allowed)' : 'बंद (Blocked)'}
              </button>
            </div>

            {/* Auto Mode Type Selection */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 col-span-1 md:col-span-2">
              <label className="font-black text-slate-900 block">
                🎯 ऑटो मोड प्रकार (Auto System Mode Strategy):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleModeChange('autoModeType', 'payment_required', 'ऑटो मोड: पेमेंट आवश्यक')
                  }
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                    siteConfig.autoModeType !== 'free_for_all'
                      ? 'bg-amber-100 border-[#A71930] text-[#A71930] font-black'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0 mt-0.5 text-[#A71930]" />
                  <div>
                    <span className="block font-bold text-xs">पेमेंट ऑटो अनलॉक (Payment Required Auto Mode)</span>
                    <span className="text-[10px] font-medium text-slate-600">
                      युझर्स नोंदणी करू शकतात, पेमेंट पूर्ण झाल्यावर संपर्क आपोआप अनलॉक होईल.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleModeChange('autoModeType', 'free_for_all', 'ऑटो मोड: सर्वांना मोफत')
                  }
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                    siteConfig.autoModeType === 'free_for_all'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-black'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <span className="block font-bold text-xs">सर्वांसाठी पूर्ण मोफत मोड (Free For All)</span>
                    <span className="text-[10px] font-medium text-slate-600">
                      सर्व सदस्यांना कोणत्याही शुल्काविना सर्व बायोडाटाचे नंबर मोफत दिसतील.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 TECHNICAL SEO, WEBMASTER & FAST-INDEXING SETTINGS PANEL */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'seo') && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Google & Bing Certified
                </span>
                <span className="text-xs text-slate-500 font-bold">Schema.org JSON-LD + Dynamic Sitemap</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-emerald-950 flex items-center gap-2 mt-1">
                <Globe className="w-6 h-6 text-emerald-600" />
                <span>तांत्रिक SEO, वेबमास्टर व सर्च इंजिन फास्ट इंडेक्सिंग (Technical SEO & Indexing)</span>
              </h3>
            </div>

            <button
              type="button"
              onClick={handleTriggerIndexNow}
              disabled={isPingingIndexNow}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-amber-300 ${isPingingIndexNow ? 'animate-spin' : ''}`} />
              <span>{isPingingIndexNow ? 'सर्च इंजिनला पिंग करत आहे...' : '⚡ गुगल / Bing ला त्वरित पिंग करा (IndexNow)'}</span>
            </button>
          </div>

          {/* IndexNow Feedback Alert */}
          {indexNowResponse && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2 animate-slideIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{indexNowResponse}</span>
            </div>
          )}

          {/* Quick Links & Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 group-hover:text-emerald-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Dynamic XML Sitemap</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                सर्व कम्युनिटी, शहरे व सक्रिय प्रोफाईल्सचा स्वयंचलित XML नकाशा
              </p>
              <span className="text-[10px] font-bold text-emerald-700 mt-2 block">
                थेट तपासा: /sitemap.xml ↗
              </span>
            </a>

            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 group-hover:text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Robots.txt Directives</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                गुगल बॉटसाठी सुरक्षित मार्गदर्शक व ॲडमिन पाथ सुरक्षा नियम
              </p>
              <span className="text-[10px] font-bold text-teal-700 mt-2 block">
                थेट तपासा: /robots.txt ↗
              </span>
            </a>

            <a
              href="https://validator.schema.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 group-hover:text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Schema.org Rich Snippets</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                MarriageAgency, WebSite, Breadcrumbs व FAQ स्कीमा व्हेरिफाय करा
              </p>
              <span className="text-[10px] font-bold text-amber-700 mt-2 block">
                Schema Validator उघडा ↗
              </span>
            </a>
          </div>

          {/* Form Fields: Domain & Verification Codes */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>१. वेबमास्टर व्हेरिफिकेशन व डोमेन सेटिंग्ज (Webmaster & Analytics):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  मुख्य कॅनॉनिकल डोमेन (Primary Canonical Domain):
                </label>
                <input
                  type="text"
                  value={siteConfig.canonicalDomain || ''}
                  onChange={(e) => updateSiteConfig({ canonicalDomain: e.target.value })}
                  placeholder="https://vanjarijodi.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">Google ला मुख्य मूळ पत्ता निर्देशित करण्यासाठी वापरला जातो.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Google Search Console Verification Code:
                </label>
                <input
                  type="text"
                  value={siteConfig.googleSiteVerification || ''}
                  onChange={(e) => updateSiteConfig({ googleSiteVerification: e.target.value })}
                  placeholder="google-site-verification कोड येथे टाका"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">Search Console मधील meta tag कोड (उदा. C1uriQTbgYIoBO...)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Bing Webmaster Verification Code (msvalidate.01):
                </label>
                <input
                  type="text"
                  value={siteConfig.bingSiteVerification || ''}
                  onChange={(e) => updateSiteConfig({ bingSiteVerification: e.target.value })}
                  placeholder="B48F6CB54FDF4D4619B07231A8"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">Bing Webmaster meta tag चा व्हॅल्यु कोड</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Google Analytics 4 (GA4) Measurement ID:
                </label>
                <input
                  type="text"
                  value={siteConfig.ga4MeasurementId || ''}
                  onChange={(e) => updateSiteConfig({ ga4MeasurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">थेट ट्रॅफिक व व्हिजिटर्स मोजण्यासाठी GA4 आयडी</p>
              </div>
            </div>

            {/* Bilingual Meta Titles & Descriptions */}
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 pt-4">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>२. द्विभाषिक मेटा टायटल व सर्च इंजिन वर्णन (Bilingual Meta Tags):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  मराठी मेटा टायटल (Marathi Meta Title):
                </label>
                <input
                  type="text"
                  value={siteConfig.metaTitleMr || siteConfig.metaTitle || ''}
                  onChange={(e) => updateSiteConfig({ metaTitleMr: e.target.value, metaTitle: e.target.value })}
                  placeholder="वंजारी जोडी वधू-वर सूचक केंद्र"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  इंग्रजी मेटा टायटल (English Meta Title):
                </label>
                <input
                  type="text"
                  value={siteConfig.metaTitleEn || ''}
                  onChange={(e) => updateSiteConfig({ metaTitleEn: e.target.value })}
                  placeholder="Vanjari Jodi Matrimony - Maharashtra Vadhu Var"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  मराठी मेटा वर्णन (Marathi Meta Description):
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.metaDescriptionMr || siteConfig.metaDescription || ''}
                  onChange={(e) => updateSiteConfig({ metaDescriptionMr: e.target.value, metaDescription: e.target.value })}
                  placeholder="महाराष्ट्र व जगभरातील १# मानांकित अधिकृत वंजारी समाज वधू-वर सूचक केंद्र."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  इंग्रजी मेटा वर्णन (English Meta Description):
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.metaDescriptionEn || ''}
                  onChange={(e) => updateSiteConfig({ metaDescriptionEn: e.target.value })}
                  placeholder="Verified brides and grooms matrimonial portal for Vanjari and Marathi communities."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Save Confirmation Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => notifyChange('तांत्रिक SEO आणि वेबमास्टर सेटिंग्ज सुरक्षित जतन केल्या!')}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>SEO सेटिंग्ज सेव्ह करा (Save SEO Config)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: PAYMENTS & MEMBERSHIP */}
      {(selectedCategory === 'all' || selectedCategory === 'payments') && (
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="font-black text-[#A71930] text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#A71930]" />
              <span>३. पेमेंट गेटवे व सबस्क्रिप्शन सेटिंग्ज (Payments & Membership Options)</span>
            </h3>
            <span className="text-[10px] font-black bg-amber-100 text-[#A71930] px-3 py-1 rounded-full border border-amber-300">
              गेटवे व UPI 💳
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Payment Mode Selector */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2 col-span-1 md:col-span-2">
              <label className="font-black text-slate-900 block flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#A71930]" />
                <span>पेमेंट पद्धत पर्याय (Payment Gateway Option Mode):</span>
              </label>
              <select
                value={siteConfig.paymentMode || 'both'}
                onChange={(e) =>
                  handleModeChange('paymentMode', e.target.value, 'पेमेंट गेटवे मोड पर्याय')
                }
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930] cursor-pointer shadow-sm"
              >
                <option value="both">⚡ सर्व ऑनलाईन पर्याय (CCAvenue गेटवे + UPI QR कोड)</option>
                <option value="ccavenue_only">🏛️ फक्त CCAvenue ऑनलाईन पेमेंट (CCAvenue Gateway Only)</option>
                <option value="upi_qr_only">📲 फक्त UPI QR कोड व UTR नंबर दाखवा (UPI QR Code Only)</option>
              </select>
            </div>

            {/* CCAvenue Online Gateway Config (Super Admin Restricted) */}
            <div className="p-4 rounded-2xl bg-indigo-50/90 border-2 border-indigo-200 space-y-3 col-span-1 md:col-span-2 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-black text-indigo-950 block flex items-center gap-2 text-xs sm:text-sm">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    <span>CCAvenue ऑनलाईन पेमेंट गेटवे (CCAvenue Payment Credentials):</span>
                  </span>
                  <span className="text-[11px] text-indigo-900 font-medium block mt-0.5">
                    मर्चंट अकाऊंट: <strong className="text-indigo-950">वंजारीजोडी (VanjariJodi)</strong> - CCAvenue द्वारे पेमेंट घेण्यासाठी API क्रेडेंशियल्स प्रविष्ट करा.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggle(
                      'enableCcavenue',
                      siteConfig.enableCcavenue !== false,
                      'CCAvenue ऑनलाईन पेमेंट गेटवे'
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                    siteConfig.enableCcavenue !== false
                      ? 'bg-indigo-700 text-white shadow'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {siteConfig.enableCcavenue !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                </button>
              </div>

              {/* Security check: If subadmin is logged in, hide API keys */}
              {currentSubAdmin ? (
                <div className="p-3 bg-amber-100 border border-amber-400 rounded-xl flex items-center gap-2 text-amber-900 text-xs font-bold">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>🔒 केवळ सुपर-ॲडमिनसाठी राखीव (Restricted to Super Admin Only): पेमेंट गेटवे क्रेडेंशियल्स (Merchant ID, Access Code, Working Key) फक्त मुख्य सुपर ॲडमिन पाहू आणि बदलू शकतात.</span>
                </div>
              ) : (
                siteConfig.enableCcavenue !== false && (
                  <div className="pt-2 border-t border-indigo-200 space-y-3 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-800 text-[11px] font-black mb-1">
                          १. CCAvenue Merchant ID (मर्चंट आयडी):
                        </label>
                        <input
                          type="text"
                          value={siteConfig.ccavenueMerchantId || ''}
                          onChange={(e) => updateSiteConfig({ ccavenueMerchantId: e.target.value })}
                          placeholder="उदा. 3456789 किंवा Merchant ID"
                          className="w-full px-3 py-2 font-mono text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-[#A71930] bg-indigo-50/30 text-indigo-950 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-800 text-[11px] font-black mb-1">
                          २. CCAvenue Access Code (ॲक्सेस कोड):
                        </label>
                        <input
                          type="text"
                          value={siteConfig.ccavenueAccessCode || ''}
                          onChange={(e) => updateSiteConfig({ ccavenueAccessCode: e.target.value })}
                          placeholder="उदा. AVXX00XX00XX..."
                          className="w-full px-3 py-2 font-mono text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-[#A71930] bg-indigo-50/30 text-indigo-950 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-800 text-[11px] font-black mb-1">
                          ३. CCAvenue Working Key (वर्किंग की / API Key):
                        </label>
                        <input
                          type="password"
                          value={siteConfig.ccavenueWorkingKey || ''}
                          onChange={(e) => updateSiteConfig({ ccavenueWorkingKey: e.target.value })}
                          placeholder="उदा. 4B1832XXXXXXXXXXXXXXXX"
                          className="w-full px-3 py-2 font-mono text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-[#A71930] bg-indigo-50/30 text-indigo-950 font-bold"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold flex items-center gap-1 pt-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>CCAvenue मर्चंट पोर्टल (वंजारीजोडी - VanjariJodi) मधील API & Integration Settings मधील हे तीन कोड प्रविष्ट करून सेव्ह करा.</span>
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Paytm UPI ID & Webhook Integration Center */}
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border-2 border-amber-400 space-y-4 col-span-1 md:col-span-2 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="font-black text-[#A71930] block flex items-center gap-2 text-xs sm:text-sm">
                  <Smartphone className="w-5 h-5 text-[#A71930]" />
                  <span>Paytm UPI ID आणि ऑटो-व्हॅरीफिकेशन वेबहूक लिंक (Paytm Integration)</span>
                </span>
                <span className="text-[10px] font-extrabold bg-amber-100 text-[#A71930] px-2.5 py-0.5 rounded-full border border-amber-300">
                  ऑटो-व्हॅरीफाय इंजिन ⚡
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Paytm UPI ID Input */}
                <div className="space-y-1.5">
                  <label className="block text-slate-800 text-xs font-black">
                    १. Paytm / UPI ID (पेमेंट स्वीकारण्यासाठी UPI ID):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.paymentUpiId || 'vanjarijodi@paytm'}
                    onChange={(e) => updateSiteConfig({ paymentUpiId: e.target.value })}
                    placeholder="उदा. vanjarijodi@paytm किंवा 9822100000@ybl"
                    className="w-full px-3.5 py-2.5 font-mono text-xs font-bold rounded-xl border border-amber-400 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                  />
                  <p className="text-[11px] text-slate-600 font-medium">
                    हा UPI ID PhonePe/GPay/Paytm direct intent आणि dynamic QR कोड तयार करण्यासाठी वापरला जाईल.
                  </p>
                </div>

                {/* Custom QR Code Image Upload / URL Input */}
                <div className="space-y-1.5">
                  <label className="block text-slate-800 text-xs font-black flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#A71930]" />
                    <span>कस्टम बँक क्यूआर कोड प्रतिमा (Custom Bank QR Code Image):</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={siteConfig.paymentQrCodeUrl || ''}
                      onChange={(e) => updateSiteConfig({ paymentQrCodeUrl: e.target.value })}
                      placeholder="क्यूआर इमेज URL (उदा. Cloudinary / Image URL)"
                      className="flex-1 px-3.5 py-2.5 font-mono text-xs font-bold rounded-xl border border-amber-400 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                    />
                    <label className="shrink-0 px-3 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-extrabold text-xs rounded-xl cursor-pointer transition shadow flex items-center gap-1">
                      <span>फोटो अपलोड</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const uploadedUrl = await uploadToCloudinary(file);
                            if (uploadedUrl) {
                              updateSiteConfig({ paymentQrCodeUrl: uploadedUrl });
                              notifyChange('कस्टम क्यूआर कोड फोटो यशस्वीरीत्या बदलला!');
                            }
                          } catch (err) {
                            alert('फोटो अपलोड करताना त्रुटी आली.');
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    इथे स्वतःचा कस्टम PhonePe / Google Pay क्यूआर कोड फोटो अपलोड करा किंवा ऑटो-जनरेटेड डायनॅमिक क्यूआर कोड वापरा.
                  </p>
                </div>

                {/* 2. Webhook URL Display & Copy */}
                <div className="space-y-1.5">
                  <label className="block text-slate-800 text-xs font-black flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-emerald-700" />
                    <span>२. Render / सर्वर Webhook Auto-Verification URL:</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="w-full px-3 py-2 font-mono text-xs font-bold rounded-xl border border-amber-400 bg-amber-50/70 text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyWebhookUrl}
                      className="shrink-0 px-3.5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-white font-black text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer border border-amber-300"
                    >
                      {copiedWebhook ? (
                        <>
                          <Check className="w-4 h-4 text-amber-200" />
                          <span>कॉपी झाले!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-amber-200" />
                          <span>लिंक कॉपी करा</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-normal pt-0.5">
                    💡 ही लिंक तुमच्या Paytm Merchant Dashboard (API & Webhook Notifications) किंवा Render सर्वरमध्ये Webhook URL म्हणून जोडा. Paytm कडून स्टेटस 'TXN_SUCCESS' येताच युझरचे प्रीमियम मेंबरशिप ऑटो-व्हॅरीफाय होऊन सुरू होईल.
                  </p>
                </div>
              </div>
            </div>

            {/* Enable Full Access for Paid Members */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>पेड मेंबर्सना सर्व नंबर थेट दाखवणे (Paid Member Full Access):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  सक्रिय केल्यास, कोणत्याही पेड मेम्बरला सर्व बायोडाटांचे संपर्क डायरेक्ट दिसतील.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'enableFullAccessForPaidMembers',
                    siteConfig.enableFullAccessForPaidMembers !== false,
                    'पेड मेम्बर फुल एक्सेस'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.enableFullAccessForPaidMembers !== false
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-rose-600 text-white shadow'
                }`}
              >
                {siteConfig.enableFullAccessForPaidMembers !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
              </button>
            </div>

            {/* Promo Codes & Discount Engine Control */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-black text-slate-900 block flex items-center gap-1.5 text-xs sm:text-sm">
                    <Tag className="w-4 h-4 text-[#A71930]" />
                    <span>सवलत कूपन व प्रोमो कोड सुविधा (Promo Codes & Coupons Engine):</span>
                  </span>
                  <span className="text-[11px] text-slate-700 font-medium block mt-0.5">
                    पेमेंट करताना ग्राहकांना डिस्काउंट कूपन कोड वापरण्याची सवलत बॉक्स. (चालू ठेवल्यास ग्राहक कूपन टाकू शकतात).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggle(
                      'enablePromoCodes',
                      siteConfig.enablePromoCodes !== false,
                      'प्रोमो कोड सुविधा'
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                    siteConfig.enablePromoCodes !== false
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-rose-600 text-white shadow'
                  }`}
                >
                  {siteConfig.enablePromoCodes !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: CHAT, FILTERS & FEATURES */}
      {(selectedCategory === 'all' || selectedCategory === 'features') && (
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="font-black text-[#A71930] text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A71930]" />
              <span>४. चॅट, फिल्टर्स व वेबसाईट फीचर्स (Chat, Filters & Features)</span>
            </h3>
            <span className="text-[10px] font-black bg-amber-100 text-[#A71930] px-3 py-1 rounded-full border border-amber-300">
              फीचर्स 💬
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Enable Chat Global */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>लाईव्ह चॅट सिस्टम (Enable Global Chat):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  युझर्सना परस्परांशी सुरक्षित मेसेजिंग चालू ठेवणे.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'enableChatGlobal',
                    siteConfig.enableChatGlobal !== false,
                    'ग्लोबल चॅट सिस्टम'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.enableChatGlobal !== false
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.enableChatGlobal !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
              </button>
            </div>

            {/* Block Contact Sharing In Chat */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>चॅटमध्ये फोन नंबर शेअरिंग ब्लॉक करा (Block Contact in Chat):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  चॅटमध्ये १०-अंकी मोबाईल नंबर पाठवल्यास आपोआप ब्लॉक केला जाईल.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'blockContactSharingInChat',
                    siteConfig.blockContactSharingInChat !== false,
                    'चॅटमध्ये संपर्क ब्लॉक'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.blockContactSharingInChat !== false
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.blockContactSharingInChat !== false ? 'ब्लॉक चालू (ON)' : 'बंद (OFF)'}
              </button>
            </div>

            {/* Enable Search Filters */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-amber-600" />
                  <span>प्रगत शोध फिल्टर्स (Advanced Search Filters):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  जिल्हा, शिक्षण, वय व वैवाहिक स्थितीनुसार शोध घेण्याचे पर्याय.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'enableSearchFilters',
                    siteConfig.enableSearchFilters !== false,
                    'शोध फिल्टर्स पर्याय'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.enableSearchFilters !== false
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.enableSearchFilters !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
              </button>
            </div>

            {/* Blur Profile Photos Global */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-slate-700" />
                  <span>सर्व प्रोफाईल फोटो ब्लर करा (Blur Profile Photos Global):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  वेबसाईटवरील सर्व फोटो अंधुक/ब्लर दिसतील (फक्त अनलॉकमध्ये स्पष्ट).
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'blurProfilePhotos',
                    siteConfig.blurProfilePhotos === true,
                    'ग्लोबल फोटो ब्लर'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.blurProfilePhotos === true
                    ? 'bg-[#A71930] text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.blurProfilePhotos === true ? 'ब्लर केले (ON)' : 'स्पष्ट (OFF)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 5: UI LAYOUT ENGINE, THEMES & GESTURES */}
      {(selectedCategory === 'all' || selectedCategory === 'layout') && (
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="font-black text-[#A71930] text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A71930]" />
              <span>५. सर्व्हर-चालित UI लेआउट, थीम्स व जेस्चर इंजिन (Server-Driven UI & Gesture Engine)</span>
            </h3>
            <span className="text-[10px] font-black bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-300">
              डायनॅमिक UI इंजिन 🎨
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Theme Preset Selector */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border-2 border-amber-300 space-y-2">
              <label className="font-black text-amber-950 block text-xs sm:text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>१. सक्रिय व्हिज्युअल थीम प्रीसेट (Active Design Theme Preset):</span>
              </label>
              <p className="text-[11px] text-slate-600 font-medium">
                सर्व सदस्यांच्या मोबाईल व डेस्कटॉपवर क्षणात थीम बदलते.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { id: 'modern_ruby', name: '1. Modern Ruby (मॉडर्न रुबी)', desc: 'Clean White + Rich Ruby Crimson + Deep Amber + Slate' },
                  { id: 'auspicious_crimson', name: '2. Auspicious Crimson (शुभ विवाह कुंकुम)', desc: 'Deep Sindoor Crimson + Pure Golden Yellow + Ivory' },
                  { id: 'royal_trust_blue', name: '3. Royal Trust Blue (रॉयल ब्लू)', desc: 'Deep Royal Navy + Sapphire + Gold Trim Accent' },
                  { id: 'parents_easy_mode', name: '4. Parents Easy-Mode (पालक सुलभ मोड)', desc: 'Ultra-High Contrast + 18px Bold Fonts + Large Touch Targets' },
                  { id: 'velvet_dark', name: '5. Velvet Dark Luxury (वेलव्हेट डार्क लक्झरी)', desc: 'Midnight Obsidian + Warm Amber + Rose Quartz Glow' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleModeChange('themePreset', t.id, `थीम: ${t.name}`)}
                    className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition cursor-pointer ${
                      (siteConfig.themePreset || 'modern_ruby') === t.id
                        ? 'bg-[#A71930] text-amber-100 border-[#A71930] shadow font-black'
                        : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    <div>
                      <span className="font-black block">{t.name}</span>
                      <span className="text-[10px] opacity-80">{t.desc}</span>
                    </div>
                    {(siteConfig.themePreset || 'modern_ruby') === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Gesture Mode Selector */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/40 border-2 border-purple-300 space-y-2">
              <label className="font-black text-purple-950 block text-xs sm:text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span>२. स्वाइप व जेस्चर मोड (Interaction & Gesture Architecture):</span>
              </label>
              <p className="text-[11px] text-slate-600 font-medium">
                मोबाईल युझर्ससाठी स्वाइप, रिल्स आणि ३डी फ्लिप संवाद पद्धत.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { id: 'swipe_4way', name: '1. 4-Way Multi-Action Swipe', desc: 'Right: Express Interest | Left: Pass | Up: Shortlist | Down: Contact' },
                  { id: 'vertical_reels', name: '2. Vertical Reels / Hinge Style', desc: 'Full-bleed vertical snap-scroll with prominent action rail' },
                  { id: 'flip_3d', name: '3. 3D Flip Card System', desc: 'Tap card to smoothly flip and view full Kundali, family & biodata' },
                  { id: 'story_tap', name: '4. Story-Tap + Pull-Up Sheet', desc: 'Instagram/Snapchat style tap to cycle photos + pull up details' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleModeChange('gestureMode', g.id, `जेस्चर मोड: ${g.name}`)}
                    className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition cursor-pointer ${
                      (siteConfig.gestureMode || 'swipe_4way') === g.id
                        ? 'bg-purple-900 text-purple-100 border-purple-900 shadow font-black'
                        : 'bg-white text-slate-800 border-purple-200 hover:bg-purple-100/50'
                    }`}
                  >
                    <div>
                      <span className="font-black block">{g.name}</span>
                      <span className="text-[10px] opacity-80">{g.desc}</span>
                    </div>
                    {(siteConfig.gestureMode || 'swipe_4way') === g.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Action Dock Type Selector */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border-2 border-emerald-300 space-y-2">
              <label className="font-black text-emerald-950 block text-xs sm:text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <span>३. सर्व्हर-चालित नेव्हिगेशन डॉक (Server-Driven Action Dock):</span>
              </label>
              <p className="text-[11px] text-slate-600 font-medium">
                वेबसाईट व ॲपच्या खाली किंवा कडेला दिसणारा ॲक्शन डॉक.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { id: 'chip_bar', name: '1. Horizontal Category Chip-Bar', desc: 'Sticky bar at top for quick filter switching (Govt Job, Verified, etc.)' },
                  { id: 'speed_dial', name: '2. Floating Speed-Dial Dock', desc: 'Bottom-right circular button expanding into quick action nodes' },
                  { id: 'side_rail', name: '3. Collapsible Side-Rail', desc: 'Sleek vertical rail for desktop and tablet screens' },
                  { id: 'bottom_sheet', name: '4. Interactive Bottom Sheet', desc: 'Draggable mobile sheet revealing quick actions & status' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleModeChange('actionDockType', d.id, `ॲक्शन डॉक: ${d.name}`)}
                    className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition cursor-pointer ${
                      (siteConfig.actionDockType || 'chip_bar') === d.id
                        ? 'bg-emerald-900 text-emerald-100 border-emerald-900 shadow font-black'
                        : 'bg-white text-slate-800 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    <div>
                      <span className="font-black block">{d.name}</span>
                      <span className="text-[10px] opacity-80">{d.desc}</span>
                    </div>
                    {(siteConfig.actionDockType || 'chip_bar') === d.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Smart Badges & Matrix Controls */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
              <label className="font-black text-amber-950 block text-xs sm:text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#A71930]" />
                <span>४. स्मार्ट बॅजेस व प्रोफाईल मॅट्रिक्स (Smart Badges & Matrix):</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200">
                  <div>
                    <span className="font-black text-slate-800 block">सरकारी नोकरी / क्लास-१ बॅज (Govt Job Badge):</span>
                    <span className="text-[10px] text-slate-600 font-medium">Dark Emerald Green Pill Tag</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showProfessionBadgesOnCards', siteConfig.showProfessionBadgesOnCards !== false, 'सरकारी नोकरी बॅज')}
                    className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer ${
                      siteConfig.showProfessionBadgesOnCards !== false ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {siteConfig.showProfessionBadgesOnCards !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200">
                  <div>
                    <span className="font-black text-slate-800 block">क्विक-इन्फो चिप रो (Education, Income, City, Manglik):</span>
                    <span className="text-[10px] text-slate-600 font-medium">नावाखालील त्वरित माहिती चिप्स</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('showQuickInfoChipsOnCards', siteConfig.showQuickInfoChipsOnCards !== false, 'क्विक-इन्फो चिप्स')}
                    className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer ${
                      siteConfig.showQuickInfoChipsOnCards !== false ? 'bg-emerald-700 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {siteConfig.showQuickInfoChipsOnCards !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 TECHNICAL SEO, WEBMASTER & FAST-INDEXING SETTINGS PANEL */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'seo') && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Google & Bing Certified
                </span>
                <span className="text-xs text-slate-500 font-bold">Schema.org JSON-LD + Dynamic Sitemap</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-emerald-950 flex items-center gap-2 mt-1">
                <Globe className="w-6 h-6 text-emerald-600" />
                <span>तांत्रिक SEO, वेबमास्टर व सर्च इंजिन फास्ट इंडेक्सिंग (Technical SEO & Indexing)</span>
              </h3>
            </div>

            <button
              type="button"
              onClick={handleTriggerIndexNow}
              disabled={isPingingIndexNow}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-amber-300 ${isPingingIndexNow ? 'animate-spin' : ''}`} />
              <span>{isPingingIndexNow ? 'सर्च इंजिनला पिंग करत आहे...' : '⚡ गुगल / Bing ला त्वरित पिंग करा (IndexNow)'}</span>
            </button>
          </div>

          {/* IndexNow Feedback Alert */}
          {indexNowResponse && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2 animate-slideIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{indexNowResponse}</span>
            </div>
          )}

          {/* Quick Links & Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 group-hover:text-emerald-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Dynamic XML Sitemap</span>
                </span>
                <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                सर्व कम्युनिटी, शहरे व सक्रिय प्रोफाईल्सचा स्वयंचलित XML नकाशा
              </p>
              <span className="text-[10px] font-bold text-emerald-700 mt-2 block">
                थेट तपासा: /sitemap.xml ↗
              </span>
            </a>

            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 group-hover:text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Robots.txt Directives</span>
                </span>
                <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                गुगल बॉटसाठी सुरक्षित मार्गदर्शक व ॲडमिन पाथ सुरक्षा नियम
              </p>
              <span className="text-[10px] font-bold text-teal-700 mt-2 block">
                थेट तपासा: /robots.txt ↗
              </span>
            </a>

            <a
              href="https://validator.schema.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 group-hover:text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Schema.org Rich Snippets</span>
                </span>
                <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                MarriageAgency, WebSite, Breadcrumbs व FAQ स्कीमा व्हेरिफाय करा
              </p>
              <span className="text-[10px] font-bold text-amber-700 mt-2 block">
                Schema Validator उघडा ↗
              </span>
            </a>
          </div>

          {/* Form Fields: Domain & Verification Codes */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>१. वेबमास्टर व्हेरिफिकेशन व डोमेन सेटिंग्ज (Webmaster & Analytics):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  मुख्य कॅनॉनिकल डोमेन (Primary Canonical Domain):
                </label>
                <input
                  type="text"
                  value={siteConfig.canonicalDomain || ''}
                  onChange={(e) => updateSiteConfig({ canonicalDomain: e.target.value })}
                  placeholder="https://vanjarijodi.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">Google ला मुख्य मूळ पत्ता निर्देशित करण्यासाठी वापरला जातो.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Google Search Console Verification Code:
                </label>
                <input
                  type="text"
                  value={siteConfig.googleSiteVerification || ''}
                  onChange={(e) => updateSiteConfig({ googleSiteVerification: e.target.value })}
                  placeholder="google-site-verification कोड येथे टाका"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">Search Console मधील meta tag कोड (उदा. C1uriQTbgYIoBO...)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Bing Webmaster Verification Code (msvalidate.01):
                </label>
                <input
                  type="text"
                  value={siteConfig.bingSiteVerification || ''}
                  onChange={(e) => updateSiteConfig({ bingSiteVerification: e.target.value })}
                  placeholder="B48F6CB54FDF4D4619B07231A8"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">Bing Webmaster meta tag चा व्हॅल्यु कोड</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Google Analytics 4 (GA4) Measurement ID:
                </label>
                <input
                  type="text"
                  value={siteConfig.ga4MeasurementId || ''}
                  onChange={(e) => updateSiteConfig({ ga4MeasurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">थेट ट्रॅफिक व व्हिजिटर्स मोजण्यासाठी GA4 आयडी</p>
              </div>
            </div>

            {/* Bilingual Meta Titles & Descriptions */}
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 pt-4">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>२. द्विभाषिक मेटा टायटल व सर्च इंजिन वर्णन (Bilingual Meta Tags):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  मराठी मेटा टायटल (Marathi Meta Title):
                </label>
                <input
                  type="text"
                  value={siteConfig.metaTitleMr || siteConfig.metaTitle || ''}
                  onChange={(e) => updateSiteConfig({ metaTitleMr: e.target.value, metaTitle: e.target.value })}
                  placeholder="वंजारी जोडी वधू-वर सूचक केंद्र"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  इंग्रजी मेटा टायटल (English Meta Title):
                </label>
                <input
                  type="text"
                  value={siteConfig.metaTitleEn || ''}
                  onChange={(e) => updateSiteConfig({ metaTitleEn: e.target.value })}
                  placeholder="Vanjari Jodi Matrimony - Maharashtra Vadhu Var"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  मराठी मेटा वर्णन (Marathi Meta Description):
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.metaDescriptionMr || siteConfig.metaDescription || ''}
                  onChange={(e) => updateSiteConfig({ metaDescriptionMr: e.target.value, metaDescription: e.target.value })}
                  placeholder="महाराष्ट्र व जगभरातील १# मानांकित अधिकृत वंजारी समाज वधू-वर सूचक केंद्र."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  इंग्रजी मेटा वर्णन (English Meta Description):
                </label>
                <textarea
                  rows={3}
                  value={siteConfig.metaDescriptionEn || ''}
                  onChange={(e) => updateSiteConfig({ metaDescriptionEn: e.target.value })}
                  placeholder="Verified brides and grooms matrimonial portal for Vanjari and Marathi communities."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Save Confirmation Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => notifyChange('तांत्रिक SEO आणि वेबमास्टर सेटिंग्ज सुरक्षित जतन केल्या!')}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>SEO सेटिंग्ज सेव्ह करा (Save SEO Config)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
