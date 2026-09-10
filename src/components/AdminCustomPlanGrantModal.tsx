import React, { useState, useMemo } from 'react';
import {
  X,
  Gift,
  Crown,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Plus,
  RefreshCw,
  Phone,
  User
} from 'lucide-react';
import { UserProfile, MembershipTier } from '../types';
import { useApp } from '../context/AppContext';
import { getPlanGrantWhatsAppMessage, openTelegramChat } from '../utils/referralUtils';

interface AdminCustomPlanGrantModalProps {
  profile: UserProfile | null;
  onClose: () => void;
}

export const AdminCustomPlanGrantModal: React.FC<AdminCustomPlanGrantModalProps> = ({
  profile,
  onClose
}) => {
  const { updateProfileDirect, sendPushNotification, logActivity, plansList } = useApp();

  if (!profile) return null;

  // Plan Type State
  const [selectedTier, setSelectedTier] = useState<string>('free_gift');
  const [customPlanTitle, setCustomPlanTitle] = useState<string>('');

  // Duration State
  const [durationPreset, setDurationPreset] = useState<string>('6_months');
  const [customNumber, setCustomNumber] = useState<number>(6);
  const [customUnit, setCustomUnit] = useState<'days' | 'months' | 'years'>('months');
  const [isLifetime, setIsLifetime] = useState<boolean>(false);

  // Extend strategy: 'from_today' vs 'from_existing_expiry'
  const hasActiveExpiry = Boolean(
    profile.membershipExpiryDate && new Date(profile.membershipExpiryDate) > new Date()
  );
  const [extendFromCurrent, setExtendFromCurrent] = useState<boolean>(hasActiveExpiry);

  // Extra features
  const [bonusContacts, setBonusContacts] = useState<number>(50);
  const [customBadge, setCustomBadge] = useState<string>('🎁 स्पेशल गिफ्ट मेम्बर');
  const [adminNote, setAdminNote] = useState<string>('ॲडमिनकडून विशेष मोफत भेट व ॲक्सेस');
  const [sendInAppNotice, setSendInAppNotice] = useState<boolean>(true);

  // Result state after granting
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [grantedDetails, setGrantedDetails] = useState<{
    planName: string;
    durationText: string;
    expiryDateStr: string;
  } | null>(null);

  // Calculate Expiry Date in Real Time
  const calculatedExpiry = useMemo(() => {
    if (isLifetime) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 50);
      return {
        iso: d.toISOString(),
        formatted: 'आजीवन / लाइफटाईम (Lifetime Access)',
        durationText: 'लाइफटाईम अमर्यादित'
      };
    }

    const baseDate =
      extendFromCurrent && hasActiveExpiry && profile.membershipExpiryDate
        ? new Date(profile.membershipExpiryDate)
        : new Date();

    const targetDate = new Date(baseDate);

    let daysAdded = 0;
    let durationText = '';

    if (durationPreset === '15_days') {
      targetDate.setDate(targetDate.getDate() + 15);
      durationText = '१५ दिवस';
    } else if (durationPreset === '1_month') {
      targetDate.setMonth(targetDate.getMonth() + 1);
      durationText = '१ महिना';
    } else if (durationPreset === '3_months') {
      targetDate.setMonth(targetDate.getMonth() + 3);
      durationText = '३ महिने';
    } else if (durationPreset === '6_months') {
      targetDate.setMonth(targetDate.getMonth() + 6);
      durationText = '६ महिने';
    } else if (durationPreset === '1_year') {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
      durationText = '१ वर्ष';
    } else if (durationPreset === '2_years') {
      targetDate.setFullYear(targetDate.getFullYear() + 2);
      durationText = '२ वर्षे';
    } else if (durationPreset === 'custom') {
      const num = Number(customNumber) || 1;
      if (customUnit === 'days') {
        targetDate.setDate(targetDate.getDate() + num);
        durationText = `${num} दिवस`;
      } else if (customUnit === 'months') {
        targetDate.setMonth(targetDate.getMonth() + num);
        durationText = `${num} महिने`;
      } else if (customUnit === 'years') {
        targetDate.setFullYear(targetDate.getFullYear() + num);
        durationText = `${num} वर्ष`;
      }
    }

    const formatted = targetDate.toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return {
      iso: targetDate.toISOString(),
      formatted,
      durationText
    };
  }, [durationPreset, customNumber, customUnit, isLifetime, extendFromCurrent, hasActiveExpiry, profile.membershipExpiryDate]);

  // Determine Effective Plan Title
  const effectivePlanName = useMemo(() => {
    if (selectedTier === 'free_gift') return customPlanTitle.trim() || '🎁 मोफत विशेष भेट प्लॅन (Free Gift Access)';
    if (selectedTier === 'welcome_offer') return 'स्वागत ऑफर (Welcome Offer)';
    if (selectedTier === 'silver') return 'सिल्व्हर प्लॅन (Silver Access)';
    if (selectedTier === 'gold') return 'गोल्ड प्लॅन (Gold Access)';
    if (selectedTier === 'yearly' || selectedTier === 'platinum') return 'प्लॅटिनम वार्षिक प्लॅन (Platinum 1 Year)';
    if (selectedTier === 'vip' || selectedTier === 'lifetime') return 'व्हीआयपी लाइफटाईम प्लॅन (VIP Unlimited)';
    return customPlanTitle.trim() || selectedTier;
  }, [selectedTier, customPlanTitle]);

  const handleApplyPreset = (preset: string) => {
    setDurationPreset(preset);
    setIsLifetime(preset === 'lifetime');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetTier: MembershipTier = 'gold';
    if (selectedTier === 'free_gift') targetTier = 'vip';
    else if (selectedTier === 'welcome_offer') targetTier = 'welcome_offer';
    else if (selectedTier === 'silver') targetTier = 'silver';
    else if (selectedTier === 'gold') targetTier = 'gold';
    else if (selectedTier === 'yearly' || selectedTier === 'platinum') targetTier = 'yearly';
    else if (selectedTier === 'vip' || selectedTier === 'lifetime') targetTier = 'vip';
    else targetTier = selectedTier as MembershipTier;

    const nowIso = new Date().toISOString();

    updateProfileDirect(profile.id, {
      membership: targetTier,
      isApproved: true,
      isVerified: true,
      isCustomAccessGranted: true,
      isPlanExpired: false,
      paidAt: profile.paidAt || nowIso,
      paymentApprovedAt: nowIso,
      paymentPlanName: effectivePlanName,
      membershipExpiryDate: calculatedExpiry.iso,
      unlockedContactsCount: (profile.unlockedContactsCount || 0) + Number(bonusContacts || 50),
      badge: customBadge.trim() || profile.badge || '🎁 स्पेशल गिफ्ट मेम्बर',
      customBadge: customBadge.trim() || profile.customBadge || '🎁 स्पेशल गिफ्ट मेम्बर',
      freePlanGrantedAt: nowIso,
      freePlanAdminNote: adminNote.trim(),
      freePlanGrantedBy: 'Primary Admin'
    });

    if (sendInAppNotice) {
      sendPushNotification(
        profile.id,
        '🎉 विशेष प्रीमियम प्लॅन ॲक्टिव्हेट झाला!',
        `अभिनंदन ${profile.fullName}! वंजारी जोडी मॅट्रिमोनीकडून तुमच्या खात्यावर '${effectivePlanName}' (${calculatedExpiry.durationText}) भेट म्हणून ॲक्टिव्हेट करण्यात आला आहे. आता तुम्ही सर्व बायोडाटा व संपर्क थेट पाहू शकता!`
      );
    }

    logActivity(
      'Grant Custom Plan',
      `ॲडमिनने ${profile.fullName} (${profile.mobile}) यांना '${effectivePlanName}' (${calculatedExpiry.durationText}) चा ॲक्सेस मंजूर केला.`,
      'Primary Admin'
    );

    setGrantedDetails({
      planName: effectivePlanName,
      durationText: calculatedExpiry.durationText,
      expiryDateStr: calculatedExpiry.formatted
    });

    setIsSuccess(true);
  };

  const handleSendTelegram = () => {
    const msg = getPlanGrantWhatsAppMessage(
      profile.fullName,
      effectivePlanName,
      calculatedExpiry.durationText,
      calculatedExpiry.formatted,
      adminNote.trim()
    );
    openTelegramChat(msg, profile.telegramUsername);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-amber-300 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-amber-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 rounded-2xl border border-amber-300/40 text-amber-200 shadow-inner">
              <Gift className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>प्लॅन वाढवून द्या / फ्री ॲक्सेस द्या</span>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  Admin Master
                </span>
              </h3>
              <p className="text-xs text-amber-100/90 font-medium">
                {profile.fullName} ({profile.id}) • 📞 {profile.mobile || 'मोबाईल नाही'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-amber-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess && grantedDetails ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-800">
                🎉 प्लॅन यशस्वीरीत्या ॲक्टिव्हेट करण्यात आला!
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                <strong className="text-[#A71930]">{profile.fullName}</strong> यांच्या खात्यावर{' '}
                <strong className="text-emerald-700">{grantedDetails.planName}</strong> ॲक्टिव्हेट झाला आहे.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">प्लॅन नाव:</span>
                <span className="font-black text-slate-800">{grantedDetails.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">कालावधी:</span>
                <span className="font-black text-amber-700">{grantedDetails.durationText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">वैधता तारीख (Expiry):</span>
                <span className="font-black text-emerald-700">{grantedDetails.expiryDateStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">बोनस संपर्क:</span>
                <span className="font-black text-blue-700">+{bonusContacts} अनलॉक</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSendTelegram}
                className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>📲 टेलिग्रामवर अभिनंदन पाठवा</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                बंद करा
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
            
            {/* Current Member Status Card */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">सध्याची स्थिती:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                    {profile.paymentPlanName || profile.membership || 'मोफत (Free)'}
                  </span>
                  {hasActiveExpiry ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      चालू (Active)
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      फ्री / संपलेला
                    </span>
                  )}
                </div>
              </div>

              {profile.membershipExpiryDate && (
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-bold block">सध्याची मुदत:</span>
                  <span className="text-[11px] font-extrabold text-[#A71930]">
                    {new Date(profile.membershipExpiryDate).toLocaleDateString('mr-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* 1. Plan Tier Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>कोणता प्लॅन / ॲक्सेस द्यायचा आहे?</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'free_gift', title: '🎁 मोफत विशेष भेट', desc: 'फ्री VIP ॲक्सेस' },
                  { id: 'welcome_offer', title: '🌟 स्वागत ऑफर', desc: 'बेसिक प्लॅन' },
                  { id: 'silver', title: '🥈 सिल्व्हर प्लॅन', desc: '३ महिने ॲक्सेस' },
                  { id: 'gold', title: '🥇 गोल्ड प्लॅन', desc: '६ महिने ॲक्सेस' },
                  { id: 'platinum', title: '💎 प्लॅटिनम / वार्षिक', desc: '१ वर्ष ॲक्सेस' },
                  { id: 'vip', title: '👑 व्हीआयपी लाइफटाईम', desc: 'अमर्यादित ॲक्सेस' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTier === tier.id
                        ? 'border-[#A71930] bg-rose-50/80 text-[#A71930] ring-1 ring-[#A71930] font-black'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">{tier.title}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{tier.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Custom Plan Name */}
            {selectedTier === 'free_gift' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">सानुकूल प्लॅन नाव (ऐच्छिक):</label>
                <input
                  type="text"
                  value={customPlanTitle}
                  onChange={(e) => setCustomPlanTitle(e.target.value)}
                  placeholder="उदा. विशेष मोफत भेट प्लॅन (Free Gift)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#A71930] outline-none"
                />
              </div>
            )}

            {/* 2. Duration Selector (Quick buttons & Custom Number) */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>कालावधी निवडा किंवा आकडा टाका (Duration):</span>
              </label>

              {/* Preset Quick Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: '15_days', label: '१५ दिवस' },
                  { id: '1_month', label: '१ महिना' },
                  { id: '3_months', label: '३ महिने' },
                  { id: '6_months', label: '६ महिने' },
                  { id: '1_year', label: '१ वर्ष' },
                  { id: '2_years', label: '२ वर्षे' },
                  { id: 'lifetime', label: '♾️ लाइफटाईम' },
                  { id: 'custom', label: '✍️ स्वतः आकडा टाका' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyPreset(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationPreset === item.id
                        ? 'bg-[#A71930] text-white shadow-sm ring-2 ring-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Custom Number Input Row if 'custom' is selected */}
              {durationPreset === 'custom' && (
                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 flex items-center gap-2 animate-in fade-in duration-150">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-amber-900 block mb-0.5">संख्या टाका (Value):</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customNumber}
                      onChange={(e) => setCustomNumber(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#A71930]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-amber-900 block mb-0.5">एकक (Unit):</label>
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#A71930]"
                    >
                      <option value="days">दिवस (Days)</option>
                      <option value="months">महिने (Months)</option>
                      <option value="years">वर्षे (Years)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Base Calculation Option (From Today vs Extend Existing) */}
            {hasActiveExpiry && (
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-blue-900">
                    सध्याच्या सक्रिय मुदतीपुढे वाढवायचे आहे का?
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extendFromCurrent}
                    onChange={(e) => setExtendFromCurrent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}

            {/* Calculated Expiry Preview Box */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-2xl border border-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-700 text-xs">नवीन समाप्ती तारीख (New Expiry):</span>
              </div>
              <span className="font-black text-emerald-800 text-xs sm:text-sm">
                {calculatedExpiry.formatted}
              </span>
            </div>

            {/* Extra Benefits: Bonus Unlocks & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  बोनस संपर्क अनलॉक संख्या (Bonus Contacts):
                </label>
                <input
                  type="number"
                  min={0}
                  value={bonusContacts}
                  onChange={(e) => setBonusContacts(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-[#A71930]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  प्रोफाईल बॅज (Badge):
                </label>
                <input
                  type="text"
                  value={customBadge}
                  onChange={(e) => setCustomBadge(e.target.value)}
                  placeholder="उदा. 🎁 स्पेशल गिफ्ट मेम्बर"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-[#A71930]"
                />
              </div>
            </div>

            {/* Admin Note / Reason */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                ॲडमिन टीप / कारण (Admin Note):
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="उदा. रेफरल बक्षीस / विशेष विनंतीवरून फ्री ॲक्सेस"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-[#A71930]"
              />
            </div>

            {/* Notification Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendInAppNotice}
                onChange={(e) => setSendInAppNotice(e.target.checked)}
                className="w-4 h-4 text-[#A71930] rounded focus:ring-[#A71930]"
              />
              <span className="text-xs font-bold text-slate-700">
                सदस्याला इन-ॲप पुश नोटिफिकेशन पाठवा (Send In-App Notification)
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="flex-[2] py-2.5 px-4 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>प्लॅन ॲक्टिव्हेट करा (Grant Plan)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
