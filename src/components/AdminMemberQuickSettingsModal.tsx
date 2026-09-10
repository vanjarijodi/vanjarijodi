import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Phone,
  Image,
  Award,
  Crown,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UserCheck,
  Ban,
  MessageSquare,
  Tag,
  Plus,
  Trash2,
  Check,
  Key,
  Copy,
  Edit2,
  Send
} from 'lucide-react';
import { UserProfile, MembershipTier } from '../types';
import { useApp } from '../context/AppContext';
import { PROFILE_TAG_PRESETS, TAG_CATEGORIES, getTagStyleClass } from '../utils/professionUtils';
import { getCleanReferralCode } from '../utils/referralUtils';

interface AdminMemberQuickSettingsModalProps {
  isOpen?: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onOpenCustomPlanGrantModal?: (profile: UserProfile) => void;
}

export const AdminMemberQuickSettingsModal: React.FC<AdminMemberQuickSettingsModalProps> = ({
  profile,
  onClose,
  onOpenCustomPlanGrantModal
}) => {
  const { updateProfile, plansList, adminResetUserPassword, siteConfig } = useApp();

  if (!profile) return null;

  // Password Reset states
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  // Tag rename states
  const [editingTagFrom, setEditingTagFrom] = useState<string | null>(null);
  const [editingTagTo, setEditingTagTo] = useState<string>('');

  const [allowGuestContactView, setAllowGuestContactView] = useState<boolean>(
    profile.allowGuestContactView ?? false
  );
  const [contactMode, setContactMode] = useState<'default' | 'force_show' | 'force_hide'>(
    profile.forceShowContact ? 'force_show' : profile.forceHideContact ? 'force_hide' : 'default'
  );
  const [photoMode, setPhotoMode] = useState<'default' | 'force_show' | 'force_hide'>(
    profile.forceShowPhoto ? 'force_show' : profile.forceHidePhoto ? 'force_hide' : 'default'
  );
  const [membership, setMembership] = useState<MembershipTier>(profile.membership || 'free');
  const [isCustomAccessGranted, setIsCustomAccessGranted] = useState<boolean>(
    profile.isCustomAccessGranted ?? false
  );
  const [isApproved, setIsApproved] = useState<boolean>(profile.isApproved ?? false);
  const [isVerified, setIsVerified] = useState<boolean>(profile.isVerified ?? false);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(
    profile.isPhoneVerified || profile.truecallerVerified || false
  );
  const [truecallerName, setTruecallerName] = useState<string>(profile.truecallerName || '');
  const [isFeatured, setIsFeatured] = useState<boolean>(profile.isFeatured ?? false);
  const [isChatBlocked, setIsChatBlocked] = useState<boolean>(profile.isChatBlocked ?? false);
  const [isBlocked, setIsBlocked] = useState<boolean>(profile.isBlocked ?? false);
  const [isHiddenByAdmin, setIsHiddenByAdmin] = useState<boolean>(profile.isHiddenByAdmin ?? false);
  const [badge, setBadge] = useState<string>(profile.badge || profile.customBadge || '');
  const [professionTags, setProfessionTags] = useState<string[]>(profile.professionTags || []);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleTag = (tagLabel: string) => {
    setProfessionTags(prev =>
      prev.includes(tagLabel) ? prev.filter(t => t !== tagLabel) : [...prev, tagLabel]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!professionTags.includes(trimmed)) {
      setProfessionTags(prev => [...prev, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagLabel: string) => {
    setProfessionTags(prev => prev.filter(t => t !== tagLabel));
  };

  const handleRenameTag = (oldTag: string, newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setProfessionTags(prev => prev.map(t => (t === oldTag ? trimmed : t)));
    setEditingTagFrom(null);
    setEditingTagTo('');
  };

  const handleAutoGeneratePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setNewPasswordInput(`Vanjari@${randomDigits}`);
    setResetSuccessMessage('');
  };

  const handleAdminResetPassword = async () => {
    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      alert('कृपया किमान ४ अक्षरी/अंकी पासवर्ड टाका.');
      return;
    }
    setIsResettingPassword(true);
    try {
      const res = await adminResetUserPassword(profile.id, newPasswordInput.trim());
      if (res.success) {
        setResetSuccessMessage(`पासवर्ड यशस्वीरीत्या बदलला आहे: ${newPasswordInput.trim()}`);
      } else {
        alert(res.message || 'पासवर्ड बदलता आला नाही.');
      }
    } catch (err: any) {
      alert('त्रुटी: ' + (err.message || 'पासवर्ड रीसेट करता आला नाही'));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCopyPassword = () => {
    if (!newPasswordInput) return;
    navigator.clipboard.writeText(newPasswordInput);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleToggleTruecaller = () => {
    const nextState = !isPhoneVerified;
    setIsPhoneVerified(nextState);
    const tcTag = '🛡️ Truecaller Verified';
    if (nextState) {
      if (!professionTags.includes(tcTag)) {
        setProfessionTags(prev => [tcTag, ...prev]);
      }
    } else {
      setProfessionTags(prev => prev.filter(t => t !== tcTag));
    }
  };

  const handleSave = () => {
    const forceShowContact = contactMode === 'force_show';
    const forceHideContact = contactMode === 'force_hide';
    const forceShowPhoto = photoMode === 'force_show';
    const forceHidePhoto = photoMode === 'force_hide';

    updateProfile(profile.id, {
      allowGuestContactView,
      forceShowContact,
      forceHideContact,
      forceShowPhoto,
      forceHidePhoto,
      membership,
      isCustomAccessGranted,
      isApproved,
      isVerified,
      isPhoneVerified,
      truecallerVerified: isPhoneVerified,
      phoneVerifiedAt: isPhoneVerified ? (profile.phoneVerifiedAt || new Date().toISOString()) : undefined,
      truecallerName: isPhoneVerified ? (truecallerName.trim() || profile.fullName) : undefined,
      phoneVerificationMethod: isPhoneVerified ? (profile.phoneVerificationMethod || 'admin') : undefined,
      isFeatured,
      isChatBlocked,
      isBlocked,
      isHiddenByAdmin,
      badge: badge.trim() || undefined,
      customBadge: badge.trim() || undefined,
      professionTags,
      // update inner privacy if requested
      privacy: {
        ...profile.privacy,
        hideContact: forceHideContact ? true : forceShowContact ? false : profile.privacy?.hideContact ?? false,
        hidePhoto: forceHidePhoto ? true : forceShowPhoto ? false : profile.privacy?.hidePhoto ?? false,
      }
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-amber-300 overflow-hidden my-auto animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-amber-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 rounded-2xl border border-amber-300/40 text-amber-200">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>मेम्बर सेटिंग्ज व प्रायव्हसी कंट्रोल</span>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  Admin Only
                </span>
              </h3>
              <p className="text-xs text-amber-100/90 font-medium truncate max-w-xs sm:max-w-md">
                {profile.fullName} ({profile.id}) • {profile.mobile}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition text-amber-100 hover:text-white cursor-pointer"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {savedSuccess && (
            <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या आहेत!</span>
            </div>
          )}

          {/* Member Profile Summary Card */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={profile.photoUrl || profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={profile.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xs shrink-0"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{profile.fullName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-[#800C1E] border border-amber-400">
                    ID: {profile.id}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-bold">
                  📱 {profile.mobile} • {profile.district} • {profile.education || 'शिक्षण माहिती नाही'}
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px]">
                  <span className={`px-2 py-0.5 rounded-md font-black border ${
                    (profile.membership && profile.membership !== 'free')
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-[#A71930] border-amber-300'
                  }`}>
                    प्लॅन: {(profile.membership || 'FREE').toUpperCase()}
                  </span>
                  {profile.isApproved ? (
                    <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ अकाउंट मंजूर
                    </span>
                  ) : (
                    <span className="text-amber-800 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                      ⏳ मंजुरी प्रलंबित
                    </span>
                  )}
                  {isPhoneVerified && (
                    <span className="text-blue-800 font-extrabold bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300 flex items-center gap-1">
                      🛡️ Truecaller Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🔑 ADMIN PASSWORD RESET (BCRYPT SECURE) */}
          <div className="bg-gradient-to-r from-slate-900 via-[#1e1b2e] to-slate-900 text-white p-4 rounded-2xl border-2 border-amber-400 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h4 className="font-black text-amber-300 flex items-center gap-2 text-xs sm:text-sm">
                <Key className="w-4 h-4 text-amber-400" />
                <span>🔐 सदस्याचा पासवर्ड बदला / रिसेट करा (Bcrypt Password Reset):</span>
              </h4>
              <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                Bcrypt Encrypted
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              सदस्याचा पासवर्ड विसरल्यास किंवा नवीन पासवर्ड सेट करण्यासाठी येथे नवीन पासवर्ड टाका. डेटाबेसमध्ये तो Bcrypt हॅशिंगने १००% सुरक्षित साठवला जाईल.
            </p>

            {resetSuccessMessage && (
              <div className="p-2.5 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resetSuccessMessage}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="py-1 px-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedPassword ? 'कॉपी झाले!' : 'कॉपी करा'}</span>
                  </button>
                  <a
                    href={`https://t.me/${(profile.telegramUsername || siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')}?text=${encodeURIComponent(
                      `नमस्कार ${profile.fullName},\n\nवंजारी जोडी वरील आपला पासवर्ड रिसेट करण्यात आला आहे.\n👤 युझर: ${profile.fullName}\n🔒 नवीन पासवर्ड: ${newPasswordInput}\n\nकृपया या पासवर्डने लॉगिन करावे.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 px-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>टेलिग्रामवर पाठवा</span>
                  </a>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="नवीन पासवर्ड टाका (किमान ४ अक्षरे/अंक)..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-600 rounded-xl px-3 py-2 pr-9 text-xs font-bold text-amber-200 placeholder:text-slate-500 outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleAutoGeneratePassword}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-amber-200 text-xs font-bold rounded-xl border border-slate-600 transition cursor-pointer"
                  title="मजबूत पासवर्ड ऑटो-जनरेट करा"
                >
                  🎲 ऑटो-जनरेट
                </button>
                <button
                  type="button"
                  disabled={isResettingPassword || !newPasswordInput}
                  onClick={handleAdminResetPassword}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isResettingPassword ? 'बदलत आहे...' : 'पासवर्ड सेव्ह करा'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1. Member Privacy Controls */}
          <div className="bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-200 space-y-3">
            <h4 className="font-black text-[#A71930] flex items-center gap-2 text-xs sm:text-sm border-b border-amber-200 pb-2">
              <Shield className="w-4 h-4" />
              <span>१. मोबाईल व फोटो दाखवण्याचे ॲडमिन नियम (Privacy Overrides):</span>
            </h4>

            {/* Guest Contact View Switch */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-300 shadow-sm">
              <div>
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>गेस्ट व सार्वजनिक दर्शकांना संपर्क दाखवा (Guest Contact Access):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block">
                  या विशिष्ट मेम्बरचा नंबर विना-लॉगिन युझर्सना थेट दाखवायचा का?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAllowGuestContactView(!allowGuestContactView)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  allowGuestContactView ? 'bg-emerald-600 text-white shadow' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {allowGuestContactView ? 'चालू (Allowed)' : 'बंद (Locked)'}
              </button>
            </div>

            {/* Override Contact Hide */}
            <div className="bg-white p-3 rounded-xl border border-amber-300 shadow-sm space-y-2">
              <label className="font-bold text-slate-900 block text-xs">
                📱 संपर्क क्रमांक दाखवणे (Contact Number Rule):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setContactMode('default')}
                  className={`p-2 rounded-xl text-center text-[11px] font-bold border transition cursor-pointer ${
                    contactMode === 'default'
                      ? 'bg-amber-100 border-[#A71930] text-[#A71930] font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  युझरची निवड (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode('force_show')}
                  className={`p-2 rounded-xl text-center text-[11px] font-bold border transition cursor-pointer ${
                    contactMode === 'force_show'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  नेहमी दाखवा (Force Show)
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode('force_hide')}
                  className={`p-2 rounded-xl text-center text-[11px] font-bold border transition cursor-pointer ${
                    contactMode === 'force_hide'
                      ? 'bg-rose-100 border-rose-600 text-rose-900 font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  नेहमी लपवा (Force Hide)
                </button>
              </div>
            </div>

            {/* Override Photo Hide */}
            <div className="bg-white p-3 rounded-xl border border-amber-300 shadow-sm space-y-2">
              <label className="font-bold text-slate-900 block text-xs">
                🖼️ प्रोफाईल फोटो दाखवणे (Profile Photo Rule):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoMode('default')}
                  className={`p-2 rounded-xl text-center text-[11px] font-bold border transition cursor-pointer ${
                    photoMode === 'default'
                      ? 'bg-amber-100 border-[#A71930] text-[#A71930] font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  युझरची निवड (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('force_show')}
                  className={`p-2 rounded-xl text-center text-[11px] font-bold border transition cursor-pointer ${
                    photoMode === 'force_show'
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  नेहमी दाखवा (Force Show)
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('force_hide')}
                  className={`p-2 rounded-xl text-center text-[11px] font-bold border transition cursor-pointer ${
                    photoMode === 'force_hide'
                      ? 'bg-rose-100 border-rose-600 text-rose-900 font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  नेहमी ब्लर/लपवा (Force Blur)
                </button>
              </div>
            </div>
          </div>

          {/* 2. Membership Tier & Special Access */}
          <div className="bg-blue-50/80 p-4 rounded-2xl border-2 border-blue-200 space-y-3">
            <h4 className="font-black text-blue-900 flex items-center gap-2 text-xs sm:text-sm border-b border-blue-200 pb-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>२. सदस्यत्व प्रकार व विशेष एक्सेस (Membership & VIP Level):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 text-xs font-black mb-1">
                  प्लॅन/सदस्यत्व प्रकार (Membership Tier):
                </label>
                <select
                  value={membership}
                  onChange={(e) => setMembership(e.target.value as MembershipTier)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                >
                  <option value="free">फ्री सदस्य (Free Tier)</option>
                  <option value="monthly">मंथली प्लॅन (Monthly Plan)</option>
                  <option value="yearly">वार्षिक अमर्यादित प्लॅन (Yearly Plan)</option>
                  <option value="lifetime">लाईफ टाईम व्हीआयपी (Lifetime VIP)</option>
                  <option value="silver">सिल्व्हर प्लॅन (Silver)</option>
                  <option value="gold">गोल्ड प्लॅन (Gold)</option>
                  <option value="diamond">डायमंड प्लॅन (Diamond)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 text-xs font-black mb-1">
                  विशेष बॅज / पदवी (Custom Badge/Title):
                </label>
                <input
                  type="text"
                  placeholder="उदा. VIP Member, Govt Officer"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                />
              </div>
            </div>

            {/* Custom Full Access Toggle */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-300 shadow-sm">
              <div>
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>मोफत अमर्यादित संपर्क व्ह्यू परवानगी (VIP Custom Full Access):</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium block">
                  या युझरला सर्व बायोडाटांचे मोबाईल नंबर मोफत दाखवण्यासाठी विशेष VIP परवानगी द्या.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomAccessGranted(!isCustomAccessGranted)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isCustomAccessGranted ? 'bg-amber-600 text-white shadow' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {isCustomAccessGranted ? 'सक्रिय (VIP Allowed)' : 'बंद (Normal)'}
              </button>
            </div>

            {/* Custom Plan Grant Master Button */}
            {onOpenCustomPlanGrantModal && (
              <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 p-3.5 rounded-2xl border-2 border-amber-300 flex items-center justify-between gap-3">
                <div>
                  <span className="font-black text-slate-900 text-xs block flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>प्लॅन वाढवून द्या / फ्री ॲक्सेस द्या (Grant or Extend Plan):</span>
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                    कालावधी (दिवस/महिने/वर्षे) निवडून किंवा आकडा टाकून थेट प्लॅन वाढवा.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCustomPlanGrantModal(profile);
                  }}
                  className="px-3.5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow transition-all cursor-pointer shrink-0"
                >
                  🎁 प्लॅन ॲडमिन मास्टर
                </button>
              </div>
            )}

            {/* Referral Info Card */}
            <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">रेफरल कोड:</span>
                <span className="font-mono font-black text-xs text-[#A71930]">
                  {getCleanReferralCode(profile)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">जोडलेले सदस्य:</span>
                <span className="font-bold text-slate-800">
                  {profile.referralCount || 0} सदस्य
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">रेफरर (Referred By):</span>
                <span className="font-bold text-slate-700">
                  {profile.referredByName || profile.referredByCode || 'थेट नोंदणी (Direct)'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Special Profile Tags & Badges */}
          <div className="bg-amber-50/90 p-4 rounded-2xl border-2 border-amber-300 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h4 className="font-black text-[#A71930] flex items-center gap-2 text-xs sm:text-sm">
                <Tag className="w-4 h-4 text-[#A71930]" />
                <span>३. प्रोफाइल विशेष टॅग्ज व बॅजेस (Profile Badges & Tags):</span>
              </h4>
              <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                {professionTags.length} टॅग्ज निवडले
              </span>
            </div>

            {/* Truecaller Quick Tag & Phone Verification Switch */}
            <div className="flex items-center justify-between p-2.5 bg-blue-50 border-2 border-blue-300 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-blue-950 text-xs block">🛡️ Truecaller Verified टॅग व पडताळणी</span>
                  <span className="text-[10px] text-blue-700 font-medium">सदस्याला Truecaller Verified अधिकृत टॅग द्या व फोन पडताळणी करा</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleTruecaller}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                  isPhoneVerified ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {isPhoneVerified ? '✓ टॅग सक्रीय (Active)' : '✕ टॅग द्या'}
              </button>
            </div>

            {/* Currently Selected Tags with Renaming Feature */}
            {professionTags.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-700">निवडलेले विशेष टॅग्ज (नाव बदलण्यासाठी पेन्सिलवर क्लिक करा):</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{professionTags.length} टॅग्ज</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {professionTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 shadow-2xs ${getTagStyleClass(tag)}`}
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTagFrom(tag);
                          setEditingTagTo(tag);
                        }}
                        className="p-0.5 hover:bg-black/10 rounded transition cursor-pointer text-slate-700 hover:text-slate-950"
                        title="टॅगचे नाव बदला (उदा. शेतकरी -> बागायतदार शेतकरी)"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 hover:bg-rose-200/80 rounded transition cursor-pointer text-rose-700 hover:text-rose-900"
                        title="टॅग काढा"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Inline Tag Rename Box */}
                {editingTagFrom && (
                  <div className="p-2.5 bg-amber-100/90 border border-amber-400 rounded-xl space-y-1.5 animate-fadeIn">
                    <span className="text-[11px] font-black text-[#800C1E] block">
                      टॅगचे नाव बदला: <strong className="text-slate-900 font-bold">{editingTagFrom}</strong>
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingTagTo}
                        onChange={(e) => setEditingTagTo(e.target.value)}
                        placeholder="उदा. 🌾 समृद्ध शेतकरी / बागायतदार..."
                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-amber-400 bg-white text-slate-900 outline-none focus:ring-1 focus:ring-[#800C1E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRenameTag(editingTagFrom, editingTagTo)}
                        className="px-3 py-1.5 bg-[#800C1E] text-white font-black text-xs rounded-lg shadow-xs cursor-pointer hover:bg-[#A71930] shrink-0"
                      >
                        नाव बदला
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTagFrom(null);
                          setEditingTagTo('');
                        }}
                        className="px-2.5 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer hover:bg-slate-300 shrink-0"
                      >
                        रद्द
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Custom Tag Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="उदा. 🌟 विशेष शिफारस, 🏛️ MPSC अधिकारी, 🌾 ५० एकर शेती..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="shrink-0 px-3.5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>जोडा</span>
              </button>
            </div>

            {/* Preset Tag Selector Categories */}
            <div className="space-y-2.5 pt-1">
              {TAG_CATEGORIES.map(cat => {
                const categoryPresets = PROFILE_TAG_PRESETS.filter(p => p.category === cat.id);
                return (
                  <div key={cat.id} className="space-y-1">
                    <span className="text-[11px] font-black text-[#800C1E] block">{cat.name}:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {categoryPresets.map(preset => {
                        const isSelected = professionTags.includes(preset.label);
                        return (
                          <button
                            type="button"
                            key={preset.id}
                            onClick={() => handleToggleTag(preset.label)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#800C1E] text-amber-100 border-[#800C1E] shadow-xs'
                                : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100/70'
                            }`}
                          >
                            <span>{preset.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Status Toggles */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3">
            <h4 className="font-black text-slate-900 flex items-center gap-2 text-xs sm:text-sm border-b border-slate-200 pb-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>३. खाते मंजुरी व स्टेटस स्विचेस (Account Statuses):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Approved */}
              <button
                type="button"
                onClick={() => setIsApproved(!isApproved)}
                className={`p-2.5 rounded-xl border text-left text-xs font-extrabold flex flex-col justify-between transition cursor-pointer ${
                  isApproved ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>खाते मंजूर (Approved)</span>
                <span className={`text-[10px] mt-1 ${isApproved ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
                  {isApproved ? '✓ मंजूर' : '✕ प्रलंबित'}
                </span>
              </button>

              {/* Verified */}
              <button
                type="button"
                onClick={() => setIsVerified(!isVerified)}
                className={`p-2.5 rounded-xl border text-left text-xs font-extrabold flex flex-col justify-between transition cursor-pointer ${
                  isVerified ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>व्हेरीफाईड (Verified)</span>
                <span className={`text-[10px] mt-1 ${isVerified ? 'text-blue-700 font-black' : 'text-slate-400'}`}>
                  {isVerified ? '✓ Verified Badge' : '✕ अनव्हेरीफाईड'}
                </span>
              </button>

              {/* Phone / Truecaller Verified */}
              <button
                type="button"
                onClick={() => setIsPhoneVerified(!isPhoneVerified)}
                className={`p-2.5 rounded-xl border text-left text-xs font-extrabold flex flex-col justify-between transition cursor-pointer ${
                  isPhoneVerified ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500 text-blue-950' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>📱 Truecaller/नंबर</span>
                <span className={`text-[10px] mt-1 ${isPhoneVerified ? 'text-blue-700 font-black' : 'text-slate-400'}`}>
                  {isPhoneVerified ? '✓ मोबाईल व्हेरिफाइड' : '✕ अनव्हेरीफाईड'}
                </span>
              </button>

              {/* Featured */}
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`p-2.5 rounded-xl border text-left text-xs font-extrabold flex flex-col justify-between transition cursor-pointer ${
                  isFeatured ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>हायलाईटेड (Featured)</span>
                <span className={`text-[10px] mt-1 ${isFeatured ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
                  {isFeatured ? '★ मुख्यपृष्ठावर' : '✕ सामान्य'}
                </span>
              </button>

              {/* Chat Blocked */}
              <button
                type="button"
                onClick={() => setIsChatBlocked(!isChatBlocked)}
                className={`p-2.5 rounded-xl border text-left text-xs font-extrabold flex flex-col justify-between transition cursor-pointer ${
                  isChatBlocked ? 'bg-rose-50 border-rose-400 text-rose-900' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>चॅट ब्लॉक (Chat Block)</span>
                <span className={`text-[10px] mt-1 ${isChatBlocked ? 'text-rose-700 font-black' : 'text-slate-400'}`}>
                  {isChatBlocked ? '🚫 ब्लॉक केले' : '✓ चॅट चालू'}
                </span>
              </button>

              {/* Account Blocked */}
              <button
                type="button"
                onClick={() => setIsBlocked(!isBlocked)}
                className={`p-2.5 rounded-xl border text-left text-xs font-extrabold flex flex-col justify-between transition cursor-pointer ${
                  isBlocked ? 'bg-rose-100 border-rose-600 text-rose-950' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>संपूर्ण ब्लॉक (Ban User)</span>
                <span className={`text-[10px] mt-1 ${isBlocked ? 'text-rose-800 font-black' : 'text-slate-400'}`}>
                  {isBlocked ? '🚫 संपूर्ण ब्लॉक' : '✓ सक्रिय खाते'}
                </span>
              </button>

              {/* Hidden from Public */}
              <button
                type="button"
                onClick={() => setIsHiddenByAdmin(!isHiddenByAdmin)}
                className={`p-2.5 rounded-xl border text-left text-xs font-extrabold flex flex-col justify-between transition cursor-pointer ${
                  isHiddenByAdmin ? 'bg-slate-200 border-slate-400 text-slate-900' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>शोधातून लपवा (Hidden)</span>
                <span className={`text-[10px] mt-1 ${isHiddenByAdmin ? 'text-slate-800 font-black' : 'text-slate-400'}`}>
                  {isHiddenByAdmin ? '👁️ लपवले आहे' : '✓ दिसणारे'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-amber-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            रद्द करा
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>सेव्ह करा (Save Settings)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
