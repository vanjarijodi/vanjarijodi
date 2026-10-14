import React, { useState } from 'react';
import {
  X,
  Plus,
  Tag,
  Gift,
  Copy,
  Check,
  Trash2,
  Share2,
  Sparkles,
  Crown,
  Percent,
  DollarSign,
  Eye,
  EyeOff,
  AlertCircle,
  Calendar,
  Layers,
  MessageCircle,
  Megaphone,
  BellRing,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PromoCode } from '../types';

interface AdminPromoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPromoManagerModal: React.FC<AdminPromoManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    promoCodes,
    addPromoCode,
    deletePromoCode,
    togglePromoCodeStatus,
    plansList,
    addNotification,
    addBroadcastNotification,
  } = useApp();

  // Form State
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [codeName, setCodeName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat' | 'vip_free'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('50');
  const [isSecret, setIsSecret] = useState<boolean>(false);
  const [showInBanner, setShowInBanner] = useState<boolean>(true);
  const [bannerText, setBannerText] = useState<string>('');
  const [applicablePlanId, setApplicablePlanId] = useState<string>('all');
  const [maxUses, setMaxUses] = useState<string>('100');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null);

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'public' | 'secret' | 'vip_free'>('all');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = codeName.trim().toUpperCase();
    if (!cleanCode) {
      addNotification?.({
        type: 'error',
        title: 'त्रुटी',
        message: 'कृपया वैध प्रोमो कोड नाव प्रविष्ट करा.',
      });
      return;
    }

    // Check if code already exists
    if (promoCodes.some((p) => p.code === cleanCode)) {
      addNotification?.({
        type: 'error',
        title: 'त्रुटी',
        message: `'${cleanCode}' हा कोड आधीच अस्तित्वात आहे. कृपया वेगळा कोड नाव वापरा.`,
      });
      return;
    }

    const valNum = Number(discountValue) || 0;
    if (discountType !== 'vip_free' && valNum <= 0) {
      addNotification?.({
        type: 'error',
        title: 'त्रुटी',
        message: 'कृपया ० पेक्षा जास्त सवलत रक्कम किंवा टक्केवारी टाका.',
      });
      return;
    }

    const defaultBanner =
      discountType === 'vip_free'
        ? `🎉 खास ऑफर! वापरा कोड ${cleanCode} आणि मिळवा १००% मोफत VIP प्रवेश!`
        : discountType === 'percentage'
        ? `🎉 विशेष ऑफर! वापरा कोड ${cleanCode} आणि मिळवा ${valNum}% भरघोस सवलत!`
        : `🎉 विशेष ऑफर! वापरा कोड ${cleanCode} आणि मिळवा ₹${valNum} थेट सूट!`;

    addPromoCode({
      code: cleanCode,
      description: description.trim() || undefined,
      discountType,
      discountValue: discountType === 'vip_free' ? 100 : valNum,
      isSecret,
      showInBanner: isSecret ? false : showInBanner,
      bannerText: isSecret ? undefined : (bannerText.trim() || defaultBanner),
      applicablePlanId: applicablePlanId === 'all' ? undefined : applicablePlanId,
      maxUses: maxUses.trim() ? Number(maxUses) : undefined,
      expiryDate: expiryDate.trim() || undefined,
      isActive: true,
    });

    addNotification?.({
      type: 'success',
      title: 'ऑफर कोड तयार झाला',
      message: `🎉 '${cleanCode}' हा प्रोमो कोड यशस्वीरीत्या सेव्ह झाला!`,
    });

    // Reset Form
    setIsCreatingNew(false);
    setCodeName('');
    setDescription('');
    setDiscountValue('50');
    setBannerText('');
    setMaxUses('100');
    setExpiryDate('');
  };

  const handleCopyCode = (p: PromoCode) => {
    navigator.clipboard.writeText(p.code);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
    addNotification?.({
      type: 'success',
      title: 'कोड कॉपी झाला',
      message: `कूपन कोड '${p.code}' क्लिपबोर्डवर कॉपी केला!`,
    });
  };

  const handleShareWhatsApp = (p: PromoCode) => {
    let discountStr = '';
    if (p.discountType === 'vip_free') {
      discountStr = '१००% मोफत VIP प्रवेश (₹० देय)';
    } else if (p.discountType === 'percentage') {
      discountStr = `${p.discountValue}% भरघोस सूट`;
    } else {
      discountStr = `₹${p.discountValue} थेट रोख सूट`;
    }

    const text = `*वंजारी जोडी मॅट्रिमोनी - विशेष सवलत ऑफर!* 🌸\n\nनमस्कार,\nतुमच्यासाठी विशेष कूपन कोड देण्यात आला आहे:\n\n🏷️ *प्रोमो कोड:* *${p.code}*\n🎁 *सवलत:* ${discountStr}\n${p.expiryDate ? `⏳ *मुदत:* ${p.expiryDate} पर्यंत\n` : ''}\nहा कोड पेमेंट करताना कूपन बॉक्समध्ये टाका आणि लगेच सवलत मिळवा.\n\n👉 वेबसाईट: ${window.location.origin}`;
    
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    try {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.location.href = waUrl;
    }
  };

  const handleBroadcastPromo = (p: PromoCode) => {
    addNotification?.({
      type: 'approval',
      title: `🎉 विशेष ऑफर जाहीर: '${p.code}'`,
      message: `${p.bannerText || `कूपन कोड '${p.code}' वापरून तात्काळ सवलत मिळवा!`}`,
    });
    if (addBroadcastNotification) {
      addBroadcastNotification(
        `🎉 नवीन विशेष ऑफर: ${p.code}`,
        `सर्व सदस्यांसाठी विशेष ऑफर सुरू झाली आहे. कूपन कोड: ${p.code} वापरून सवलत मिळवा!`
      );
    }
    setBroadcastToast(`📢 '${p.code}' कूपन कोडचे नोटिफिकेशन सर्व सदस्यांच्या मोबाईलवर यशस्वीरीत्या पाठवले!`);
    setTimeout(() => setBroadcastToast(null), 3500);
  };

  const filteredCodes = promoCodes.filter((p) => {
    if (filterType === 'public') return p.showInBanner && !p.isSecret;
    if (filterType === 'secret') return p.isSecret || !p.showInBanner;
    if (filterType === 'vip_free') return p.discountType === 'vip_free';
    return true;
  });

  const publicCount = promoCodes.filter((p) => p.showInBanner && !p.isSecret).length;
  const secretCount = promoCodes.filter((p) => p.isSecret || !p.showInBanner).length;
  const freeVipCount = promoCodes.filter((p) => p.discountType === 'vip_free').length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#9B132B] to-[#800C1E] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b-2 border-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-400 text-slate-950 font-black shadow-md">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>🏷️ प्रोमो कोड व सवलत ऑफर व्यवस्थापन (Promo Code Center)</span>
              </h2>
              <p className="text-xs text-amber-200 font-medium">
                सार्वजनिक बॅनर ऑफर्स किंवा सदस्यांसाठी सिक्रेट/गुप्त कूपन कोड तयार करा
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Broadcast Toast Notification */}
        {broadcastToast && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-black flex items-center gap-2 px-4 shadow-md animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            <span>{broadcastToast}</span>
          </div>
        )}

        {/* Action & Metric Bar */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              सर्व कोड ({promoCodes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('public')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 ${
                filterType === 'public'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>सार्वजनिक बॅनर ({publicCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('secret')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 ${
                filterType === 'secret'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-purple-800 border border-purple-300 hover:bg-purple-50'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>गुप्त / सिक्रेट कोड ({secretCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('vip_free')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 ${
                filterType === 'vip_free'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-50'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>१००% मोफत VIP ({freeVipCount})</span>
            </button>
          </div>

          {/* New Code Button */}
          <button
            type="button"
            onClick={() => setIsCreatingNew((prev) => !prev)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition active:scale-95 ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreatingNew ? 'फॉर्म बंद करा' : '+ नवीन कूपन कोड बनवा'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* Creation Form Modal/Card */}
          {isCreatingNew && (
            <form
              onSubmit={handleCreateSubmit}
              className="p-4 sm:p-5 bg-gradient-to-b from-amber-50/80 to-white rounded-2xl border-2 border-amber-400 shadow-md space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-amber-300 pb-2.5">
                <div className="flex items-center gap-2 text-[#800C1E] font-black text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>नवीन ऑफर किंवा सिक्रेट प्रोमो कोड तयार करा</span>
                </div>
                <span className="text-[11px] text-slate-500 font-bold">* सर्व रकाने व्यवस्थित भरा</span>
              </div>

              {/* Grid 1: Code Name & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    🏷️ कूपन कोडचे नाव (Code Name): <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. DIWALI50, VANJARI99, FREEVIP"
                    value={codeName}
                    onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-black uppercase text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">इंग्रजी मोठी अक्षरे (उदा. SPECIAL100)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    📝 ऑफरची नोंद / नाव (Description):
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. दिवाळी विशेष ५०% सवलत किंवा गुप्त कोड"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid 2: Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    💰 सवलतीचा प्रकार (Discount Type):
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="percentage">टक्केवारी सूट (% Percentage Off - उदा. ५०%)</option>
                    <option value="flat">निश्चित रक्कम सूट (₹ Flat Cash Off - उदा. ₹१००)</option>
                    <option value="vip_free">🎉 १००% मोफत VIP (Free VIP - ₹० देय, Razorpay शिवाय)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    🎯 सवलत मूल्य (Discount Value):
                  </label>
                  {discountType === 'vip_free' ? (
                    <div className="w-full px-3 py-2 bg-purple-50 border border-purple-300 rounded-xl text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span>१००% मोफत VIP प्रवेश (सदस्याला ₹० द्यावे लागतील)</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        max={discountType === 'percentage' ? 99 : 5000}
                        placeholder={discountType === 'percentage' ? 'उदा. 50 (५०%)' : 'उदा. 100 (₹१००)'}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                        {discountType === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 3: Visibility & Secret Options */}
              <div className="p-3 bg-white rounded-xl border border-slate-300 space-y-3">
                <label className="block text-xs font-black text-slate-800">
                  👁️ ऑफर प्रदर्शन व गुप्तता पर्याय (Visibility Mode):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option A: Public Banner */}
                  <label
                    onClick={() => {
                      setIsSecret(false);
                      setShowInBanner(true);
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-start gap-2.5 transition ${
                      !isSecret && showInBanner
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={!isSecret && showInBanner}
                      onChange={() => {}}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <div className="font-black text-xs flex items-center gap-1.5 text-emerald-800">
                        <Eye className="w-3.5 h-3.5" />
                        <span>सार्वजनिक ऑफर (Public Announcement)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        हा कोड ॲपमध्ये वरच्या बॅनरवर व प्लॅन स्क्रीनवर सर्वांना दिसेल आणि लोक थेट वापरू शकतील.
                      </p>
                    </div>
                  </label>

                  {/* Option B: Secret Private Promo */}
                  <label
                    onClick={() => {
                      setIsSecret(true);
                      setShowInBanner(false);
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-start gap-2.5 transition ${
                      isSecret
                        ? 'bg-purple-50/80 border-purple-500 text-purple-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={isSecret}
                      onChange={() => {}}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <div className="font-black text-xs flex items-center gap-1.5 text-purple-800">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>🔒 गुप्त / सिक्रेट कोड (Secret Private)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        हा कोड ॲपमध्ये कुठेही दिसणार नाही. तुम्ही ज्या सदस्याला WhatsApp/कॉलवर द्याल तोच वापरू शकेल.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Banner Text Input (Only if Public) */}
                {!isSecret && showInBanner && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                      📢 वर बॅनरमध्ये दाखवायचा आकर्षक संदेश (Banner Announcement Text):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. 🎉 नवरात्र विशेष: वापरा कोड DIWALI50 आणि मिळवा ५०% भरघोस सवलत!"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Grid 4: Plan, Max Uses & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    📦 लागू होणारा प्लॅन:
                  </label>
                  <select
                    value={applicablePlanId}
                    onChange={(e) => setApplicablePlanId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="all">सर्व प्लॅन्सवर लागू (All Plans)</option>
                    {plansList.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.nameMr || pl.name} (₹{pl.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    👥 कमाल वापर मर्यादा (Max Uses):
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="उदा. 100 (किंवा रिकामे = अमर्याद)"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ⏳ शेवटची मुदत (Expiry Date):
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-300">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>💾 कूपन सेव्ह व सक्रिय करा</span>
                </button>
              </div>
            </form>
          )}

          {/* Promo Codes Cards Grid */}
          {filteredCodes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 space-y-2">
              <Tag className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <p className="font-bold text-sm">या प्रकारामध्ये कोणताही प्रोमो कोड सापडला नाही.</p>
              <p className="text-xs text-slate-400">
                नवीन ऑफर तयार करण्यासाठी वरील "+ नवीन कूपन कोड बनवा" बटणावर क्लिक करा.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCodes.map((p) => {
                const isCopied = copiedId === p.id;
                const isVip = p.discountType === 'vip_free';
                const isPct = p.discountType === 'percentage';

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                      p.isActive
                        ? isVip
                          ? 'bg-gradient-to-b from-purple-50/90 to-white border-purple-400 shadow-md'
                          : p.showInBanner && !p.isSecret
                          ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-400 shadow-md'
                          : 'bg-gradient-to-b from-amber-50/50 to-white border-amber-300 shadow-sm'
                        : 'bg-slate-100 border-slate-300 opacity-60'
                    }`}
                  >
                    {/* Top Row: Code Badge & Type Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-sm sm:text-base text-slate-900 bg-white px-2.5 py-1 rounded-xl border-2 border-amber-400 shadow-2xs tracking-wider">
                            {p.code}
                          </span>

                          {/* Discount Badge */}
                          {isVip ? (
                            <span className="text-[11px] font-black bg-purple-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <Crown className="w-3 h-3 text-amber-300" />
                              <span>१००% मोफत VIP (₹०)</span>
                            </span>
                          ) : isPct ? (
                            <span className="text-[11px] font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                              {p.discountValue}% सूट
                            </span>
                          ) : (
                            <span className="text-[11px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                              ₹{p.discountValue} थेट सूट
                            </span>
                          )}

                          {/* Visibility Badge */}
                          {p.isSecret || !p.showInBanner ? (
                            <span className="text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <EyeOff className="w-3 h-3" />
                              <span>गुप्त कोड (Secret)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>सार्वजनिक बॅनर</span>
                            </span>
                          )}
                        </div>

                        {p.description && (
                          <p className="text-xs text-slate-700 font-bold">{p.description}</p>
                        )}
                        {p.bannerText && p.showInBanner && !p.isSecret && (
                          <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            📢 "{p.bannerText}"
                          </p>
                        )}
                      </div>

                      {/* Active Status Badge */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 ${
                          p.isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {p.isActive ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                      </span>
                    </div>

                    {/* Middle Info: Usage & Limits */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <span>
                          वापर: <strong className="text-slate-900 font-black">{p.usedCount || 0}</strong>
                          {p.maxUses ? ` / ${p.maxUses} वेळा` : ' (अमर्याद)'}
                        </span>
                        {p.expiryDate && (
                          <span>
                            मुदत: <strong className="text-slate-900 font-bold">{p.expiryDate}</strong>
                          </span>
                        )}
                      </div>

                      {p.applicablePlanId && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          प्लॅन: {p.applicablePlanId}
                        </span>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-1.5">
                        {/* Copy Code */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                          title="कोड कॉपी करा"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{isCopied ? 'झाला!' : 'कॉपी'}</span>
                        </button>

                        {/* WhatsApp Share Message */}
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 cursor-pointer transition active:scale-95"
                          title="सदस्याला WhatsApp वर पाठवण्यासाठी मेसेज उघडा"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp शेअर</span>
                        </button>

                        {/* Broadcast to All Members */}
                        <button
                          type="button"
                          onClick={() => handleBroadcastPromo(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 cursor-pointer transition active:scale-95"
                          title="सर्व सदस्यांना तात्काळ पॉप-अप नोटिफिकेशन पाठवा"
                        >
                          <Megaphone className="w-3.5 h-3.5 text-amber-700" />
                          <span>📢 सदस्यांना पाठवा</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Toggle Active/Inactive */}
                        <button
                          type="button"
                          onClick={() => togglePromoCodeStatus(p.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            p.isActive
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {p.isActive ? 'बंद करा' : 'चालू करा'}
                        </button>

                        {/* Delete Code */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`खरोखर '${p.code}' हा कूपन कोड हटवायचा आहे का?`)) {
                              deletePromoCode(p.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition"
                          title="हटवा"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold">💡 टीप:</span>
            <span>
              १००% मोफत (₹०) कोड वापरल्यास सदस्य थेट Razorpay शिवाय १-क्लिकमध्ये VIP बनतो!
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            बंद करा (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
