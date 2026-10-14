import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Phone,
  Eye,
  CreditCard,
  QrCode,
  Zap,
  Users,
  Bell,
  Sparkles,
  CheckCircle2,
  Lock,
  Globe,
  Send,
  Sliders,
  Tag,
  Gift,
  ExternalLink,
  Crown,
  ScanFace,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminPromoManagerModal } from './AdminPromoManagerModal';
import { ImageUploadField } from './common/ImageUploadField';

export const AdminMasterSettingsCenter: React.FC = () => {
  const { siteConfig, updateSiteConfig, addNotification } = useApp();
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const notifyChange = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleToggle = (key: keyof typeof siteConfig, currentVal: any, label: string) => {
    const newVal = !currentVal;
    updateSiteConfig({ [key]: newVal });
    notifyChange(`'${label}' बदलून ${newVal ? 'सक्रिय (ON)' : 'बंद (OFF)'} केले!`);
  };

  const handleDirectFieldSave = (key: keyof typeof siteConfig, value: any, label: string) => {
    updateSiteConfig({ [key]: value });
    notifyChange(label);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#800C1E] text-amber-100 px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 font-extrabold text-xs flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Simplified Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#5B0813] via-[#800C1E] to-[#A71930] text-white rounded-3xl shadow-xl border-2 border-amber-400 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 font-black rounded-2xl shadow">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-2">
                <span>🎛️ मास्टर मुख्य सेटिंग्ज (Essential Settings)</span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                वेबसाईटची माहिती, नोंदणी, फोटो व आडनाव दृश्यता आणि पेमेंट गेटवेचे सोपे नियंत्रण.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              updateSiteConfig({
                autoApproveNewRegistrations: true,
                showFullNameInProfiles: true,
                blurPhotosForFreeUsers: false,
                enableRazorpay: true,
                enableUpiQr: true,
                enablePromoCodes: true,
                enableFullAccessForPaidMembers: true,
              });
              notifyChange('🚀 सर्व आवश्यक सेटिंग्ज सुरळीत व सक्रिय केल्या!');
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow cursor-pointer transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Zap className="w-4 h-4 text-slate-950" />
            <span>सर्व सुरळीत चालू करा (1-Click Auto Ready)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD 1: नोंदणी, पासवर्ड व प्रोफाईल दृश्यता */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                १. सदस्य नोंदणी, पासवर्ड व प्रोफाईल Live
              </h3>
              <p className="text-[11px] text-slate-500">
                नवीन सदस्य व बायोडाटा नोंदणी होताच थेट Live करणे व फोटो/आडनाव दाखवणे
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Toggle 1: Auto Approve Registrations */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-emerald-950">
                  नवीन नोंदणी होताच प्रोफाईल तात्काळ Live करा:
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  बायोडाटा बनवताना पासवर्ड सेट केल्यावर लगेच प्रोफाईल सक्रिय होईल.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoApproveNewRegistrations', siteConfig.autoApproveNewRegistrations, 'थेट प्रोफाईल Live')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.autoApproveNewRegistrations !== false ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.autoApproveNewRegistrations !== false ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Show Full Photos & Surnames */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">
                  सर्व सदस्यांना सर्वांचे फोटो व आडनाव थेट स्पष्ट दाखवा:
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  कोणतीही ब्लर (Blur) किंवा अडचण न ठेवता स्पष्ट नाव व फोटो दिसतील.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateSiteConfig({
                    showFullNameInProfiles: true,
                    blurPhotosForFreeUsers: false,
                    allowGuestsToViewPhotos: true,
                    allowMembersToViewPhotos: true,
                  });
                  notifyChange('सर्व सदस्यांसाठी फोटो व आडनाव थेट स्पष्ट दृश्यमान केले!');
                }}
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.showFullNameInProfiles && !siteConfig.blurPhotosForFreeUsers ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.showFullNameInProfiles && !siteConfig.blurPhotosForFreeUsers ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Auto-Ban on Multiple Reports */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-rose-950 flex items-center gap-1.5">
                  <span>🚨 तक्रारी आल्यावर प्रोफाईल आपोआप बॅन (Auto-Ban):</span>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                    {siteConfig.autoBanThreshold || 4}+ तक्रारी
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  एकाच प्रोफाईलवर {siteConfig.autoBanThreshold || 4} किंवा जास्त युझर्सनी रिपोर्ट केल्यास खाते व डिव्हाइस तात्काळ ऑटो-बॅन होईल.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('enableAutoBanOnReports', siteConfig.enableAutoBanOnReports, 'तक्रारींवर ऑटो-बॅन नियम')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.enableAutoBanOnReports !== false ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.enableAutoBanOnReports !== false ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: नाव, फोटो ब्लर व नोटिफिकेशन गोपनीयता नियंत्रणे (Privacy, Blur & Notification Controls) */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-amber-200 pb-3">
            <div className="p-2 rounded-xl bg-amber-100 text-[#800C1E]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>२. नाव, फोटो ब्लर व नोटिफिकेशन गोपनीयता नियंत्रणे (Privacy & Blur Controls)</span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-mono text-[10px] font-black rounded-full">
                  TOP PRIORITY
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                पहिले नाव ब्लर ठेवणे, विना-ॲक्टिव्हेशन सदस्यांना फोटो ब्लर दाखवणे आणि नोटिफिकेशन्समध्ये समोरच्याचे नाव ब्लर करण्याचे नियम
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Setting 1: First Name Blur Until Mutual Like */}
            <div className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
              siteConfig.blurFirstNameUntilMutualLike
                ? 'bg-amber-50/80 border-amber-400'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                    <Eye className="w-4 h-4 text-amber-700" />
                    <span>पहिले नाव ब्लर ठेवा (म्युच्युअल लाईक होईपर्यंत):</span>
                  </span>
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                    siteConfig.blurFirstNameUntilMutualLike
                      ? 'bg-amber-400 text-[#800C1E] border border-amber-500'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {siteConfig.blurFirstNameUntilMutualLike ? '🔒 चालू (ON) - नाव ब्लर' : '🔓 बंद (OFF) - पूर्ण नाव दिसते'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('blurFirstNameUntilMutualLike', siteConfig.blurFirstNameUntilMutualLike, 'पहिले नाव ब्लर नियम')}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                    siteConfig.blurFirstNameUntilMutualLike ? 'bg-[#800C1E]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                      siteConfig.blurFirstNameUntilMutualLike ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <strong>नियम:</strong> ही सेटिंग चालू (ON) केल्यास, <em>ज्यांनी पेमेंट केले आहे त्यांनासुद्धा</em> समोरील सदस्याचे पहिले नाव ब्लर/मास्क दिसेल (उदा. 'र•••• कराड'). म्युच्युअल लाईक झाल्यावरच दोघांचे पूर्ण नाव व नंबर दिसेल!
              </p>
            </div>

            {/* Setting 2: Photo Blur for Non-Activated / Free Members */}
            <div className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
              siteConfig.blurPhotosForNonActivatedMembers !== false
                ? 'bg-amber-50/80 border-amber-400'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-[#800C1E]" />
                    <span>विना-ॲक्टिव्हेशन सदस्यांना फोटो ब्लर करा:</span>
                  </span>
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                    siteConfig.blurPhotosForNonActivatedMembers !== false
                      ? 'bg-amber-400 text-[#800C1E] border border-amber-500'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {siteConfig.blurPhotosForNonActivatedMembers !== false ? '🔒 चालू (ON) - फोटो ब्लर' : '🔓 बंद (OFF) - फोटो स्पष्ट'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('blurPhotosForNonActivatedMembers', siteConfig.blurPhotosForNonActivatedMembers !== false, 'विना-ॲक्टिव्हेशन फोटो ब्लर')}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                    siteConfig.blurPhotosForNonActivatedMembers !== false ? 'bg-[#800C1E]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                      siteConfig.blurPhotosForNonActivatedMembers !== false ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <strong>नियम:</strong> ज्या सदस्यांकडे ॲक्टिव्हेशन कोड किंवा ऍक्टिव्ह पेड सबस्क्रिप्शन नाही, त्यांना इतरांचे फोटो ब्लर (अस्पष्ट) दिसतील. फोटो पाहण्यासाठी ॲक्टिव्हेशन कोड किंवा प्लॅन लागेल.
              </p>
            </div>

            {/* Setting 3: Blur Name in Notifications */}
            <div className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
              siteConfig.blurNameInNotifications !== false
                ? 'bg-amber-50/80 border-amber-400'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                    <Bell className="w-4 h-4 text-purple-700" />
                    <span>नोटिफिकेशनमध्ये समोरच्याचे नाव ब्लर ठेवा:</span>
                  </span>
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                    siteConfig.blurNameInNotifications !== false
                      ? 'bg-amber-400 text-[#800C1E] border border-amber-500'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {siteConfig.blurNameInNotifications !== false ? '🔒 चालू (ON) - नाव ब्लर' : '🔓 बंद (OFF) - पूर्ण नाव दिसते'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('blurNameInNotifications', siteConfig.blurNameInNotifications !== false, 'नोटिफिकेशन नाव ब्लर नियम')}
                  className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                    siteConfig.blurNameInNotifications !== false ? 'bg-[#800C1E]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                      siteConfig.blurNameInNotifications !== false ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <strong>नियम:</strong> ही सेटिंग चालू (ON) असल्यास, पुश व इन-ॲप नोटिफिकेशनमध्ये समोरच्या सदस्याचे नाव ब्लर/मास्क दिसेल (उदा. 'र•••• कराड यांनी आपल्याला पसंती पाठवली'). म्युच्युअल लाईक झाल्यावर किंवा ॲडमिनने बंद केल्यास पूर्ण नाव दिसेल.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: पेमेंट गेटवे (Razorpay & UPI) */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                ३. अधिकृत पेमेंट गेटवे व बँक UPI
              </h3>
              <p className="text-[11px] text-slate-500">
                Razorpay Standard Checkout व थेट बँक QR कोड पर्याय
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Toggle Razorpay */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-amber-950 flex items-center gap-1.5">
                  <span>⚡ Razorpay सुरक्षित पेमेंट गेटवे:</span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  कार्ड, UPI, नेटबँकिंगने १-क्लिकमध्ये ऑटो-अ‍ॅक्टिव्हेशन होते.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('enableRazorpay', siteConfig.enableRazorpay, 'Razorpay पेमेंट')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.enableRazorpay !== false ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.enableRazorpay !== false ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle UPI QR */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">
                  📱 थेट बँक UPI व QR कोड पेमेंट:
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  PhonePe, GPay, Paytm द्वारे थेट QR स्कॅन करून पैसे स्वीकारणे.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('enableUpiQr', siteConfig.enableUpiQr, 'UPI QR पेमेंट')}
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.enableUpiQr !== false ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.enableUpiQr !== false ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 4: मुख्य पोर्टल माहिती व सपोर्ट */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                ४. पोर्टल नाव व अधिकृत सपोर्ट संपर्क
              </h3>
              <p className="text-[11px] text-slate-500">
                वेबसाईटचे शीर्षक व मदत क्रमांक
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                वेबसाईटचे मुख्य नाव (Brand Title):
              </label>
              <input
                type="text"
                value={siteConfig.logoTitle || 'वंजारी जोडी'}
                onChange={(e) => updateSiteConfig({ logoTitle: e.target.value })}
                onBlur={() => notifyChange('पोर्टल नाव सेव्ह झाले!')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  📞 सपोर्ट मोबाईल:
                </label>
                <input
                  type="text"
                  value={siteConfig.contactPhone || ''}
                  onChange={(e) => updateSiteConfig({ contactPhone: e.target.value })}
                  onBlur={() => notifyChange('सपोर्ट फोन सेव्ह झाला!')}
                  placeholder="उदा. 9876543210"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  💬 टेलिग्राम चॅनेल/सपोर्ट:
                </label>
                <input
                  type="text"
                  value={siteConfig.telegramUsername || ''}
                  onChange={(e) => updateSiteConfig({ telegramUsername: e.target.value })}
                  onBlur={() => notifyChange('टेलिग्राम युझरनेम सेव्ह झाले!')}
                  placeholder="@VanjariJodiOfficial"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: प्रोमो कोड व सदस्यांना नोटिफिकेशन */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-rose-100 text-[#800C1E]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                ५. प्रोमो कोड व पॉप-अप नोटिफिकेशन
              </h3>
              <p className="text-[11px] text-slate-500">
                नवीन ऑफर तयार करून सदस्यांना थेट नोटिफिकेशन पाठवणे
              </p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200 rounded-2xl space-y-3 text-xs">
            <p className="font-medium text-slate-700 leading-relaxed">
              नवीन सवलत कोड किंवा १००% मोफत VIP कूपन तयार करून सदस्यांच्या मोबाईलवर लगेच पॉप-अप नोटिफिकेशन पाठवण्यासाठी खालील बटणावर क्लिक करा:
            </p>

            <button
              type="button"
              onClick={() => setIsPromoModalOpen(true)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#650817] hover:to-[#8a1325] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>🎁 प्रोमो कोड्स मॅनेजर उघडा व नोटिफिकेशन पाठवा</span>
            </button>
          </div>
        </div>

        {/* CARD 6: चेहरा व आधार पडताळणी मंजुरी पद्धत (Face & Aadhaar Verification Approval Modes) */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                ६. चेहरा (Selfie) व आधार पडताळणी मंजुरी पद्धत (Verification Approval Modes)
              </h3>
              <p className="text-[11px] text-slate-500">
                सदस्यांनी चेहरा किंवा आधार कार्ड सबमिट केल्यावर मॅन्युअल ॲडमिन मंजुरी हवी की ऑटोमॅटिक
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Setting 1: Face Verification Mode */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  <ScanFace className="w-4 h-4 text-teal-600" />
                  <span>चेहरा पडताळणी (Face / Selfie):</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  siteConfig.faceVerificationApprovalMode === 'auto'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {siteConfig.faceVerificationApprovalMode === 'auto' ? '⚡ ऑटो' : '✓ मॅन्युअल (सक्रिय)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                सदस्याने फ्रंट सेल्फी कॅमेऱ्याने फोटो काढल्यावर:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateSiteConfig({ faceVerificationApprovalMode: 'manual' });
                    notifyChange('चेहरा पडताळणी मॅन्युअल ॲडमिन तपासणीवर सेट केली!');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    siteConfig.faceVerificationApprovalMode !== 'auto'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  📝 मॅन्युअल ॲडमिन तपासणी
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSiteConfig({ faceVerificationApprovalMode: 'auto' });
                    notifyChange('चेहरा पडताळणी स्वयंचलित ऑटो-मंजुरीवर सेट केली!');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    siteConfig.faceVerificationApprovalMode === 'auto'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ⚡ स्वयंचलित त्वरित मंजुरी
                </button>
              </div>
            </div>

            {/* Setting 2: Aadhaar / KYC Mode */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>आधार कार्ड पडताळणी (Aadhaar / KYC):</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  siteConfig.aadhaarVerificationApprovalMode === 'auto'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {siteConfig.aadhaarVerificationApprovalMode === 'auto' ? '⚡ ऑटो' : '✓ मॅन्युअल (सक्रिय)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                सदस्याने आधार कार्ड व सेल्फी फोटो जोडल्यावर:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateSiteConfig({ aadhaarVerificationApprovalMode: 'manual' });
                    notifyChange('आधार पडताळणी मॅन्युअल ॲडमिन तपासणीवर सेट केली!');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    siteConfig.aadhaarVerificationApprovalMode !== 'auto'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  📝 मॅन्युअल ॲडमिन तपासणी
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSiteConfig({ aadhaarVerificationApprovalMode: 'auto' });
                    notifyChange('आधार पडताळणी स्वयंचलित ऑटो-मंजुरीवर सेट केली!');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    siteConfig.aadhaarVerificationApprovalMode === 'auto'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ⚡ स्वयंचलित त्वरित मंजुरी
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD: 🛡️ सक्रिय सदस्यांसाठी Truecaller व्हेरिफिकेशन सक्तीचे करा (Mandatory Truecaller for Activated Members) */}
        <div className="bg-white rounded-3xl p-5 border-2 border-blue-400 shadow-md space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-blue-200 pb-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>🛡️ सक्रिय/सशुल्क सदस्यांसाठी Truecaller व्हेरिफिकेशन सक्तीचे (Mandatory Truecaller)</span>
                <span className="px-2 py-0.5 bg-blue-600 text-white font-mono text-[10px] font-black rounded-full">
                  SECURITY POLICY
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                ज्या सदस्यांचा मेंबरशिप प्लॅन सक्रिय (Activated) झाला आहे, त्यांना मोबाईल ॲप आणि वेबसाईटवर Truecaller / मोबाईल नंबर पडताळणी अनिवार्य करा.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Toggle Switch */}
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-blue-950">
                  प्लॅन ऍक्टिव्हेट झाल्यावर Truecaller व्हेरिफिकेशन कंपल्सरी (सक्तीचे) करा:
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  हा टॉगल ऑन केल्यास, सदस्याचा प्लॅन सुरू झाल्यावर मोबाईल ॲप व वेबसाईटवर Truecaller पडताळणी केल्याशिवाय संपर्क किंवा इतर सेवा प्रलंबित राहतील आणि पडताळणीची सूचना दिसेल.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggle(
                    'requireTruecallerForActivePlanMembers',
                    siteConfig.requireTruecallerForActivePlanMembers === true,
                    'सक्रिय सदस्यांसाठी Truecaller व्हेरिफिकेशन सक्ती'
                  )
                }
                className={`w-12 h-6.5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                  siteConfig.requireTruecallerForActivePlanMembers === true ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${
                    siteConfig.requireTruecallerForActivePlanMembers === true ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <span className="text-blue-600 font-bold">ℹ️ टीप:</span>
              <span>
                टॉगल ऑन असल्यास वेबसाईट व ॲपवर Truecaller न केलेल्या सक्रिय सदस्यांना "Truecaller व्हेरिफिकेशन प्रलंबित (अनिवार्य)" बॅनर दिसेल. टॉगल ऑफ असल्यास व्हेरिफिकेशन ऐच्छिक (Optional) राहील.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Dedicated Promo Manager Modal */}
      <AdminPromoManagerModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />
    </div>
  );
};
