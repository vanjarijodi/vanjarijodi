import React, { useState, useMemo } from 'react';
import {
  Search,
  User,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Sparkles,
  Save,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Check,
  X,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { syncDocToFirestore } from '../utils/firestoreSync';

export const AdminAssistedMemberActivation: React.FC = () => {
  const { profiles, updateProfileDirect, logActivity, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Form State
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('Gold');
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [customExpiry, setCustomExpiry] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('असिस्टेड व्हॉट्सॲप / फोन कन्सल्टेशनद्वारे सदस्यता सक्रिय केली.');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Filter profiles based on search query (User ID, Mobile, Name)
  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return profiles.filter((p) => {
      const matchId = p.id?.toLowerCase().includes(q);
      const matchPhone = (p.mobile || p.mobileNumber || '').includes(q);
      const matchName = (p.fullName || '').toLowerCase().includes(q);
      return matchId || matchPhone || matchName;
    }).slice(0, 8);
  }, [searchQuery, profiles]);

  const selectedProfile: UserProfile | undefined = useMemo(() => {
    if (!selectedProfileId) return undefined;
    return profiles.find((p) => p.id === selectedProfileId);
  }, [selectedProfileId, profiles]);

  // When a profile is selected, populate current status
  const handleSelectProfile = (p: UserProfile) => {
    setSelectedProfileId(p.id);
    setIsPremium(p.isPremium ?? (p.membership && p.membership !== 'free' ? true : false));
    setIsVerified(p.isVerified ?? true);
    setSelectedPlan(p.membershipPlan || (p.membership ? String(p.membership).toUpperCase() : 'Gold'));

    // Calculate default expiry
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 6);
    setCustomExpiry(expiry.toISOString().slice(0, 16));
    setSaveSuccessMsg(null);
  };

  // Preset duration buttons
  const handleSetPreset = (months: number) => {
    setDurationMonths(months);
    const now = new Date();
    const expiry = new Date(now);
    if (months >= 120) {
      expiry.setFullYear(now.getFullYear() + 50); // Lifetime
    } else {
      expiry.setMonth(now.getMonth() + months);
    }
    setCustomExpiry(expiry.toISOString().slice(0, 16));
  };

  // Save changes to Firestore
  const handleSaveActivation = async () => {
    if (!selectedProfile) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const now = new Date().toISOString();
      const expiryIso = customExpiry ? new Date(customExpiry).toISOString() : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

      const updateData: Partial<UserProfile> = {
        isPremium: isPremium,
        isVerified: isVerified,
        membership: isPremium ? (selectedPlan.toLowerCase() as any) : 'free',
        membershipPlan: isPremium ? selectedPlan : 'None',
        premiumActivatedAt: isPremium ? now : undefined,
        premiumExpiresAt: isPremium ? expiryIso : undefined,
        membershipPlanName: isPremium ? selectedPlan : 'None',
        membershipExpiryDate: isPremium ? expiryIso : undefined,
        isPlanExpired: false,
        updatedAt: now
      };

      // 1. Direct AppContext State Update
      updateProfileDirect(selectedProfile.id, updateData);

      // 2. Firebase Firestore Real-Time Sync
      await syncDocToFirestore('profiles', selectedProfile.id, updateData);
      try {
        await syncDocToFirestore('users', selectedProfile.id, updateData);
      } catch {}

      // 3. Security Audit Logging with Timestamps
      const auditPayload = {
        id: `AUDIT-${Date.now()}`,
        adminId: currentUser?.id || 'admin',
        adminName: currentUser?.fullName || 'Super Admin',
        action: isPremium ? 'ADMIN_MEMBERSHIP_ACTIVATED' : 'ADMIN_MEMBERSHIP_DEACTIVATED',
        category: 'MEMBERSHIP_COMPLIANCE',
        targetEntityId: selectedProfile.id,
        targetEntityType: 'user_profile',
        targetEntityName: selectedProfile.fullName,
        details: isPremium
          ? `प्लॅन: ${selectedPlan}, कालावधी: ${durationMonths} महिने, मुदत: ${expiryIso}. टिप: ${adminNote}`
          : `सदस्यता बंद केली. टिप: ${adminNote}`,
        timestamp: now,
      };
      await syncDocToFirestore('adminAuditLogs', auditPayload.id, auditPayload);
      logActivity('Membership Activation', `${selectedProfile.fullName} (${selectedProfile.id}) साठी ${selectedPlan} प्लॅन सक्रिय केला.`, 'Admin');

      setIsSaving(false);
      setSaveSuccessMsg(`🎉 ${selectedProfile.fullName} यांचे सदस्यत्व यशस्वीरित्या सक्रिय झाले! मोबाईल ॲपवर रिअल-टाइम अन-लॉक लागू झाले आहे.`);
    } catch (err: any) {
      console.error('Error saving assisted activation:', err);
      setIsSaving(false);
      alert('बदल सेव्ह करताना त्रुटी आली: ' + (err?.message || 'अज्ञात एरर'));
    }
  };

  // WhatsApp Notification pre-filled message generator
  const handleSendWhatsAppNotice = () => {
    if (!selectedProfile) return;
    const phone = (selectedProfile.mobile || selectedProfile.secondaryMobile || '').replace(/\D/g, '').slice(-10);
    if (!phone) {
      alert('या युजरचा मोबाईल नंबर उपलब्ध नाही.');
      return;
    }

    const expiryFormatted = customExpiry
      ? new Date(customExpiry).toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '६ महिने';

    const text = `॥ श्री संत भगवान बाबा प्रसन्न ॥\n\nनमस्ते ${selectedProfile.fullName},\n\n🎉 अभिनंदन! वंजारी जोडी (Vanjari Jodi) वधु-वर मंचवर तुमचे खाते यशस्वीरित्या पडताळणी पूर्ण होऊन ${selectedPlan} सदस्यत्व सक्रिय झाले आहे!\n\n✨ तुमची सदस्यता मुदत: ${expiryFormatted}\n🛡️ प्रोफाइल आयडी: ${selectedProfile.id}\n\nआता तुम्ही वंजारी जोडी ॲपवर सर्व संपर्क क्रमांक, सविस्तर बायोडाटा व जन्मकुंडली थेट पाहू शकता.\n\nधन्यवाद!\n- वंजारी जोडी सहाय्यता केंद्र`;

    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-300 shadow-sm">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Play Policy Compliant</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              असिस्टेड प्रोफाईल पडताळणी व सदस्यत्व ॲक्टिव्हेशन
            </h2>
            <p className="text-xs text-slate-500">
              व्हॉट्सॲप / फोन सल्लामसलत किंवा वेब पेमेंटनंतर सदस्याचे प्लॅन थेट फायरबेसमध्ये सक्रिय करा.
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Search User by Mobile, User ID, or Name */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-700 flex items-center justify-between">
          <span>सदस्य शोधा (मोबाईल नंबर, युझर आयडी किंवा नाव):</span>
          <span className="text-[11px] text-slate-400 font-normal">एकूण सदस्य: {profiles.length}</span>
        </label>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="उदा. 9822012345 किंवा VJ-102 किंवा सचिन मुंडे"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm font-bold text-slate-800 outline-none transition"
          />
        </div>

        {/* Live Search Results Dropdown */}
        {filteredProfiles.length > 0 && !selectedProfile && (
          <div className="border border-slate-200 rounded-2xl shadow-lg bg-white overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {filteredProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProfile(p)}
                className="w-full p-3 text-left hover:bg-amber-50/50 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 overflow-hidden border border-slate-200">
                    {p.photos?.[0] || p.photoUrl ? (
                      <img src={p.photos?.[0] || p.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900 block">{p.fullName}</span>
                    <span className="text-xs text-slate-500">
                      ID: {p.id} | फोन: +91 {p.mobile || 'नाही'} | {p.city || p.district}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.isPremium ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                      👑 {p.membershipPlan || 'Premium'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      मोफत (Free)
                    </span>
                  )}
                  <span className="text-xs text-amber-600 font-bold">निवडा →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Selected User Bio-Data Card */}
      {selectedProfile && (
        <div className="p-5 rounded-3xl bg-slate-50 border-2 border-amber-200/80 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden shrink-0 shadow-xs">
                {selectedProfile.photos?.[0] || selectedProfile.photoUrl ? (
                  <img src={selectedProfile.photos?.[0] || selectedProfile.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-slate-300" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">{selectedProfile.fullName}</h3>
                  {selectedProfile.isVerified && (
                    <BadgeCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono font-bold text-slate-700">{selectedProfile.id}</span> | मोबाईल: <span className="font-bold text-slate-800">+91 {selectedProfile.mobile}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {selectedProfile.age} वर्षे | {selectedProfile.city || selectedProfile.district} | {selectedProfile.education || selectedProfile.occupation}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedProfileId(null)}
              className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition cursor-pointer"
              title="दुसरा सदस्य निवडा"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">प्रीमियम स्टेटस:</span>
              <span className={`font-black ${selectedProfile.isPremium ? 'text-amber-600' : 'text-slate-500'}`}>
                {selectedProfile.isPremium ? '👑 सक्रिय (Active)' : '❌ निष्क्रिय (Free)'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">प्लॅन नाव:</span>
              <span className="font-black text-slate-800 truncate block">
                {selectedProfile.membershipPlan || selectedProfile.membership || 'None'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">पडताळणी (KYC):</span>
              <span className={`font-black ${selectedProfile.isVerified ? 'text-blue-600' : 'text-amber-600'}`}>
                {selectedProfile.isVerified ? '🛡️ सत्यापित (Verified)' : 'प्रलंबित (Pending)'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">सध्याची मुदत:</span>
              <span className="font-bold text-slate-700 truncate block text-[11px]">
                {selectedProfile.premiumExpiresAt
                  ? new Date(selectedProfile.premiumExpiresAt).toLocaleDateString('mr-IN')
                  : 'उपलब्ध नाही'}
              </span>
            </div>
          </div>

          {/* Activation Form Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>प्लॅन ॲक्टिव्हेशन पर्याय</span>
            </h4>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* isPremium Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-amber-50/30 transition">
                <div>
                  <span className="text-xs font-black text-slate-800 block">प्रीमियम स्टेटस (isPremium)</span>
                  <span className="text-[11px] text-slate-500">संपर्क व कुंडली तात्काळ अन-लॉक</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </label>

              {/* isVerified Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-blue-50/30 transition">
                <div>
                  <span className="text-xs font-black text-slate-800 block">खाते पडताळणी (isVerified)</span>
                  <span className="text-[11px] text-slate-500">ब्लू व्हेरिफाईड बॅज दिसेल</span>
                </div>
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Plan Tier Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">प्लॅन निवडा:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Silver', label: 'सिल्व्हर (Silver)', icon: '🥈' },
                  { id: 'Gold', label: 'गोल्ड (Gold)', icon: '👑' },
                  { id: 'Diamond', label: 'डायमंड (Diamond)', icon: '💎' },
                  { id: 'VIP', label: 'व्हीआयपी (VIP)', icon: '⭐' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedPlan(tier.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedPlan === tier.id
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tier.icon}</span>
                    <span>{tier.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">कालावधी (Duration Presets):</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { months: 1, label: '१ महिना' },
                  { months: 3, label: '३ महिने' },
                  { months: 6, label: '६ महिने' },
                  { months: 12, label: '१ वर्ष' },
                  { months: 120, label: 'लाइफटाईम' },
                ].map((item) => (
                  <button
                    key={item.months}
                    type="button"
                    onClick={() => handleSetPreset(item.months)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      durationMonths === item.months
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Expiry Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>मुदत संपण्याची तारीख (premiumExpiresAt):</span>
                <span className="text-[11px] text-amber-700 font-bold">कस्टम तारीख बदलू शकता</span>
              </label>
              <input
                type="datetime-local"
                value={customExpiry}
                onChange={(e) => setCustomExpiry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Admin Internal Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">ॲडमिन अंतर्गत टिप (Audit Note):</label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="उदा. व्हॉट्सॲप कन्सल्टेशननंतर सक्रिय केले."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:border-amber-500"
              />
            </div>

            {/* Success Message Banner */}
            {saveSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveActivation}
                disabled={isSaving}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'सेव्ह होत आहे...' : 'बदल सेव्ह करा व प्लॅन ॲक्टिव्ह करा'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsAppNotice}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                title="व्हॉट्सॲप मेसेज पाठवा"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp वर कळवा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssistedMemberActivation;
