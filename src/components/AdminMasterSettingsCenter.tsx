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
  AlertTriangle,
  Sliders,
  Globe,
  Radio,
  FileText,
  UserCheck,
  Heart,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminMasterSettingsCenter: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [saveToast, setSaveToast] = useState<string | null>(null);

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
                <span>🎛️ सेन्ट्रल मास्टर सेटिंग्ज डॅशबोर्ड (Master Control Center)</span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                वेबसाईटच्या सर्व सेटिंग्ज, प्रायव्हसी, पेमेंट गेटवे, ऑटो मोड व फीचर्स एकाच नियंत्रणाखाली.
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
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
              <div>
                <span className="font-black text-slate-900 block flex items-center gap-1.5 text-xs">
                  <span>👤 बिन-प्लॅन सदस्यांना नावाची दृश्यमानता (Free User Name Visibility):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                  फ्री / बिन-प्लॅन युझर्सना बायोडाटा दाखवताना नाव कसे दिसेल ते ठरवा:
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'full_name' })}
                  className={`py-2 px-1.5 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    (siteConfig.nameDisplayModeForFreeUsers || 'full_name') === 'full_name'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🟢 पूर्ण नाव
                </button>
                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'first_name_only' })}
                  className={`py-2 px-1.5 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    siteConfig.nameDisplayModeForFreeUsers === 'first_name_only' || siteConfig.nameDisplayModeForFreeUsers === 'middle_surname_only'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🟡 मधले व आडनाव
                </button>
                <button
                  type="button"
                  onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'hidden_star' })}
                  className={`py-2 px-1.5 rounded-xl text-[10px] sm:text-xs font-black cursor-pointer border transition-all text-center ${
                    siteConfig.nameDisplayModeForFreeUsers === 'hidden_star'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🔴 गुप्त (स्टार्स)
                </button>
              </div>
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
                <option value="both">⚡ दोन्ही पर्याय चालू ठेवा (Razorpay ऑनलाईन + UPI QR कोड)</option>
                <option value="razorpay_only">💳 फक्त Razorpay ऑनलाईन पेमेंट दाखवा (Razorpay Gateway Only)</option>
                <option value="upi_qr_only">📲 फक्त UPI QR कोड व UTR नंबर दाखवा (UPI QR Code Only)</option>
              </select>
            </div>

            {/* Enable Razorpay Toggle */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-black text-blue-900 block flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-700" />
                  <span>Razorpay ऑनलाईन पेमेंट गेटवे (Enable Razorpay):</span>
                </span>
                <span className="text-[11px] text-blue-800 font-medium block mt-0.5">
                  कार्ड, नेटबँकिंग व ऑनलाईन ऑटो-पेमेंट सक्रिय करा.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'enableRazorpay',
                    siteConfig.enableRazorpay !== false,
                    'Razorpay पेमेंट ऑनलाईन'
                  )
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  siteConfig.enableRazorpay !== false
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {siteConfig.enableRazorpay !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
              </button>
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
    </div>
  );
};
