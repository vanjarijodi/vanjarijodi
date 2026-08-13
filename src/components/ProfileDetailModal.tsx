import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { PrintBiodataModal } from './PrintBiodataModal';
import { ReportProfileModal } from './ReportProfileModal';
import { VerifiedBadge } from './VerifiedBadge';
import { getProfessionBadges } from '../utils/professionUtils';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
import { uploadToCloudinary, compressAndResizeImage } from '../utils/cloudinary';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Heart,
  PhoneCall,
  MessageCircle,
  Download,
  Share2,
  FileText,
  User,
  GraduationCap,
  Users,
  Scroll,
  Sparkles,
  Lock,
  CheckCircle2,
  MapPin,
  Calendar,
  Printer,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Crown,
  Plus,
  Upload,
  Camera,
  Loader2,
} from 'lucide-react';

export const ProfileDetailModal: React.FC<{
  profile: UserProfile | null;
  onClose: () => void;
}> = ({ profile, onClose }) => {
  const {
    t,
    language,
    currentUser,
    sendInterest,
    interests,
    likedProfileIds,
    toggleShortlist,
    shortlistedIds,
    setActiveChatUser,
    contactRequests,
    requestContactAuthorization,
    isContactAuthorizedForUser,
    isAdminLoggedIn,
    siteConfig,
    unlockContact,
    setSelectedProfileForUnlock,
    setIsContactUnlockModalOpen,
    checkGuestPermission,
    incrementProfileViews,
    softDeleteProfile,
    updateProfileDirect,
    deleteMemberPhoto,
    addMemberPhoto,
    toggleBlockProfile,
    toggleBlockMemberAccess,
    toggleProfileVisibility,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'family' | 'expectations' | 'horoscope'>('personal');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const cleanLocationDetail = (district?: string, taluka?: string, city?: string) => {
    const parts: string[] = [];
    if (district && district.trim()) parts.push(district.trim());
    if (taluka && taluka.trim() && !parts.some(p => p.toLowerCase().includes(taluka.trim().toLowerCase()))) {
      parts.push(taluka.trim());
    }
    if (city && city.trim() && !parts.some(p => p.toLowerCase().includes(city.trim().toLowerCase()))) {
      parts.push(city.trim());
    }
    return parts.join(', ');
  };
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploadingNewPhoto, setIsUploadingNewPhoto] = useState(false);

  const handleAdminUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploadingNewPhoto(true);
    try {
      const comp = await compressAndResizeImage(file, 800, 0.85);
      const res = await uploadToCloudinary(comp.file, 'vanjarijodi_profile_photos');
      const photoUrl = res.success && res.url ? res.url : comp.dataUrl;
      
      const result = addMemberPhoto(profile.id, photoUrl);
      if (result.success) {
        alert('नवीन फोटो यशस्वीरित्या जोडला गेला!');
      } else {
        alert(result.message || 'फोटो जोडता आला नाही.');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      alert('फोटो अपलोड करताना त्रुटी आली.');
    } finally {
      setIsUploadingNewPhoto(false);
    }
  };

  React.useEffect(() => {
    if (profile?.id) {
      incrementProfileViews(profile.id);
    }
  }, [profile?.id]);

  if (!profile) return null;

  const isShortlisted = shortlistedIds.includes(profile.id);
  const isAuthorized = isContactAuthorizedForUser(profile.id);
  const pendingReq = currentUser && contactRequests.find(
    (r) => r.requesterId === currentUser.id && r.targetProfileId === profile.id && r.status === 'pending'
  );
  const interestObj = interests.find(
    (i) => currentUser && i.fromUserId === currentUser.id && i.toUserId === profile.id
  );
  const isMutualMatch = currentUser && (
    (likedProfileIds.includes(profile.id) || !!interestObj) &&
    (interests.some((i) => i.fromUserId === profile.id && i.toUserId === currentUser.id) || (profile.shortlistedByUsers || []).includes(currentUser.id))
  );

  const handleShareWhatsApp = () => {
    const text = `*वंजारीजोडी बायोडाटा:* ${profile.fullName} (${profile.age} वर्षे, ${profile.education}, ${profile.district})\nअधिक माहितीसाठी VanjariJodi App पहा.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-[#FFFDF5] border-2 border-amber-300 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#A71930] to-[#800C1E] border-b border-amber-300 text-white">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-amber-900 bg-amber-200 px-3 py-1 rounded-full font-bold border border-amber-300">
                आयडी: {profile.id}
              </span>
              <h2 className="text-base sm:text-lg font-black text-amber-100 break-words">
                {formatProfileDisplayName(profile.fullName, currentUser, isAdminLoggedIn, isAuthorized, siteConfig, language)}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-red-800/80 hover:bg-red-900 text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-red-400/50 transition-all"
                title="तक्रार करा"
              >
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">तक्रार नोंदवा</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-[#A71930] text-xs font-black flex items-center gap-1.5 shadow border border-amber-400 transition-all"
              >
                <Printer className="w-4 h-4 text-[#A71930]" />
                <span className="hidden sm:inline">बायोडाटा प्रिंट करा</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body Scrollable */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 pr-4">

            {/* MUTUAL MATCH UNLOCK BANNER */}
            {isMutualMatch && (
              <div className="p-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white rounded-3xl shadow-xl border-2 border-emerald-300 flex items-center gap-3.5 animate-fadeIn">
                <div className="p-3 bg-amber-400 text-amber-950 rounded-2xl font-black text-2xl shrink-0 shadow-md">
                  🎉
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-black text-amber-200 text-sm sm:text-base flex items-center gap-2">
                    <span>म्युचुअल मॅच! (Mutual Like Match) - नंबर अनलॉक झाला</span>
                  </h4>
                  <p className="text-xs text-emerald-100 font-bold">
                    तुम्ही व {profile.fullName} यांनी एकमेकांना 'लाईक' केल्यामुळे दोघांचे डायरेक्ट मोबाईल नंबर अनलॉक झाले आहेत!
                  </p>
                  <p className="text-xs text-amber-300 font-extrabold pt-1">
                    📞 मोबाईल नंबर: {profile.mobile}
                  </p>
                </div>
              </div>
            )}

            {/* ⚙️ ADMIN ACTION PANEL */}
            {isAdminLoggedIn && (
              <div className="bg-red-50/90 border-2 border-red-300 p-5 rounded-3xl shadow-lg space-y-4 animate-fadeIn text-xs sm:text-sm font-bold">
                <div className="border-b border-red-200 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-[#A71930] flex items-center gap-1.5">
                      <Crown className="w-5 h-5 text-[#A71930]" />
                      <span>प्रशासकीय नियंत्रण कक्ष (Admin Control Panel)</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                      सदस्य: {profile.fullName} (ID: {profile.id}) • संपर्क: {profile.mobile}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`तुम्हाला खरोखर "${profile.fullName}" यांचा संपूर्ण बायोडाटा कायमचा डिलीट करायचा आहे का?`)) {
                        softDeleteProfile(profile.id);
                        alert('बायोडाटा यशस्वीरित्या डिलीट करून रिसायकल बिन मध्ये पाठवला गेला आहे!');
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow border border-rose-700 flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                    <span>🚨 पूर्ण बायोडाटा डिलीट करा</span>
                  </button>
                </div>

                {/* Grid of quick switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Guest Contact Access Toggle */}
                  <div className="p-3 bg-white rounded-2xl border border-red-200 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">गेस्ट युझर्सना नंबर (Guest Contact View)</span>
                      <span className={`text-xs font-black inline-block mt-1 ${profile.allowGuestContactView ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {profile.allowGuestContactView ? '🔓 थेट उघडा (Open for All)' : '🔒 बंद (Requires Login)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateProfileDirect(profile.id, { allowGuestContactView: !profile.allowGuestContactView });
                        alert(`गेस्ट नंबर व्ह्यू स्टेटस बदलले: ${!profile.allowGuestContactView ? 'गेस्टसाठी उघडा केला' : 'लॉक केला'}`);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-xs font-black shadow transition-all cursor-pointer ${
                        profile.allowGuestContactView
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                      }`}
                    >
                      {profile.allowGuestContactView ? '🔒 विना-लॉगिन नंबर लपवा' : '🔓 विना-लॉगिन नंबर दाखवा'}
                    </button>
                  </div>

                  {/* Approval Status Toggle */}
                  <div className="p-3 bg-white rounded-2xl border border-red-200 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">नोंदणी मान्यता (Profile Approval)</span>
                      <span className={`text-xs font-black inline-block mt-1 ${profile.isApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {profile.isApproved ? '✅ मंजूर (Approved)' : '⏳ प्रलंबित (Pending Approval)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateProfileDirect(profile.id, { isApproved: !profile.isApproved });
                        alert(`प्रोफाईल स्टेटस बदलले: ${!profile.isApproved ? 'मंजूर केले' : 'प्रलंबित केले'}`);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-xs font-black shadow transition-all cursor-pointer ${
                        profile.isApproved
                          ? 'bg-amber-100 text-[#800C1E] border-amber-300 hover:bg-amber-200'
                          : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                      }`}
                    >
                      {profile.isApproved ? '🚫 अमान्य/प्रलंबित करा' : '✅ मंजूर करा (Approve)'}
                    </button>
                  </div>

                  {/* Block Login Access Toggle */}
                  <div className="p-3 bg-white rounded-2xl border border-red-200 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">लॉगिन चालू/बंद (Login Account Status)</span>
                      <span className={`text-xs font-black inline-block mt-1 ${profile.isBlocked ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {profile.isBlocked ? '🚫 ब्लॉकड (Blocked Account)' : '✅ सक्रिय (Active Login)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toggleBlockMemberAccess(profile.id);
                        alert(`सदस्याचे खाते ${!profile.isBlocked ? 'ब्लॉक' : 'अनब्लॉक'} केले गेले आहे!`);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-xs font-black shadow transition-all cursor-pointer ${
                        profile.isBlocked
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                      }`}
                    >
                      {profile.isBlocked ? '🔑 अन-ब्लॉक लॉगिन' : '🔒 लॉगिन ब्लॉक करा'}
                    </button>
                  </div>

                  {/* ID / Aadhaar Verified status */}
                  <div className="p-3 bg-white rounded-2xl border border-red-200 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">आधार पडताळणी (Aadhaar Verified Badge)</span>
                      <span className={`text-xs font-black inline-block mt-1 ${profile.aadhaarVerified ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {profile.aadhaarVerified ? '🌟 आधार पडताळणी पूर्ण' : '❌ पडताळणी प्रलंबित'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateProfileDirect(profile.id, {
                          aadhaarVerified: !profile.aadhaarVerified,
                          isIdVerified: !profile.aadhaarVerified
                        });
                        alert(`आधार पडताळणी स्टेटस बदलले!`);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-xs font-black shadow transition-all cursor-pointer ${
                        profile.aadhaarVerified
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                      }`}
                    >
                      {profile.aadhaarVerified ? '❌ पडताळणी रद्द करा' : '🌟 आधार मंजूर करा'}
                    </button>
                  </div>

                  {/* Face Verification Toggle */}
                  <div className="p-3 bg-white rounded-2xl border border-red-200 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">चेहरा पडताळणी (Face Verified Badge)</span>
                      <span className={`text-xs font-black inline-block mt-1 ${profile.isFaceVerified ? 'text-purple-700' : 'text-slate-500'}`}>
                        {profile.isFaceVerified ? '📷 चेहरा पडताळणी पूर्ण' : '❌ पडताळणी प्रलंबित'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateProfileDirect(profile.id, {
                          isFaceVerified: !profile.isFaceVerified,
                          isPhotoVerified: !profile.isFaceVerified
                        });
                        alert(`चेहरा पडताळणी स्टेटस बदलले!`);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-xs font-black shadow transition-all cursor-pointer ${
                        profile.isFaceVerified
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-purple-600 text-white border-purple-500 hover:bg-purple-700'
                      }`}
                    >
                      {profile.isFaceVerified ? '❌ चेहरा पडताळणी रद्द' : '📷 चेहरा मंजूर करा'}
                    </button>
                  </div>

                  {/* Golden Verified Badge */}
                  <div className="p-3 bg-white rounded-2xl border border-red-200 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">खात्रीशीर प्रोफाईल (Verified Profile Badge)</span>
                      <span className={`text-xs font-black inline-block mt-1 ${profile.isVerified ? 'text-amber-700' : 'text-slate-500'}`}>
                        {profile.isVerified ? '🏆 प्रमाणित (Verified)' : '❌ सामान्य प्रोफाईल'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        updateProfileDirect(profile.id, { isVerified: !profile.isVerified });
                        alert(`प्रमाणित बॅज स्टेटस बदलले!`);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-xs font-black shadow transition-all cursor-pointer ${
                        profile.isVerified
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                      }`}
                    >
                      {profile.isVerified ? '❌ प्रमाणित बॅज काढा' : '🏆 प्रमाणित बॅज द्या'}
                    </button>
                  </div>

                  {/* Hide Profile from Search */}
                  <div className="p-3 bg-white rounded-2xl border border-red-200 flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">वेबसाईटवर दृश्यमानता (Search Visibility)</span>
                      <span className={`text-xs font-black inline-block mt-1 ${profile.isHiddenByAdmin ? 'text-amber-800' : 'text-emerald-700'}`}>
                        {profile.isHiddenByAdmin ? '🙈 इंडेक्सवरून लपवले आहे' : '👁️ सर्वांना दृश्यमान'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toggleProfileVisibility(profile.id);
                        alert(`दृश्यमानता बदलली गेली आहे!`);
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-xs font-black shadow transition-all cursor-pointer ${
                        profile.isHiddenByAdmin
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-amber-800 text-amber-100 border-amber-900 hover:bg-amber-900'
                      }`}
                    >
                      {profile.isHiddenByAdmin ? '👁️ सर्वांना दाखवा' : '🙈 सध्या लपवून ठेवा'}
                    </button>
                  </div>
                </div>

                {/* Aadhaar Document Verification Details & Image View */}
                <div className="bg-white p-4 rounded-2xl border border-red-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#A71930]" />
                      <span>🪪 आधार कार्ड दस्तऐवज पडताळणी (Aadhaar Document Status):</span>
                    </p>
                    {profile.idVerificationNumber && (
                      <span className="px-2.5 py-1 bg-amber-100 text-[#800C1E] font-mono rounded-lg border border-amber-300">
                        नंबर: {profile.idVerificationNumber}
                      </span>
                    )}
                  </div>

                  {profile.aadhaarCardUrl ? (
                    <div className="space-y-3">
                      <div className="relative group overflow-hidden rounded-xl border-2 border-slate-200 max-w-md bg-slate-100 shadow">
                        <img
                          src={profile.aadhaarCardUrl}
                          alt="Aadhaar Card Photo"
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-64 object-contain mx-auto"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all gap-3">
                          <a
                            href={profile.aadhaarCardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span>पूर्ण साईज पहा</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('तुम्हाला खरोखर हे आधार कार्ड इमेज डिलीट करायचे आहे का?')) {
                                updateProfileDirect(profile.id, {
                                  aadhaarCardUrl: '',
                                  idProofUrl: '',
                                  aadhaarVerified: false,
                                  isIdVerified: false
                                });
                                alert('आधार कार्ड यशस्वीरित्या काढून टाकले!');
                              }
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-md hover:scale-105 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>काढून टाका</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">💡 आधार कार्ड झूम करून किंवा पूर्ण साईज मध्ये पाहण्यासाठी फोटोवर माउस न्या अथवा टॅप करा.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-xl border border-dashed border-amber-300 text-center space-y-2">
                      <p className="text-slate-600 text-xs font-bold">⚠️ या वधू/वराने अद्याप पडताळणीसाठी आधार कार्ड दस्तऐवज अपलोड केलेले नाही.</p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-lg mx-auto">
                        <input
                          type="text"
                          placeholder="आधार फोटो लिंक (इमेज URL) इथे पेस्ट करा..."
                          id="direct-aadhaar-link-url"
                          className="px-3 py-2 border border-slate-300 rounded-xl text-xs w-full text-slate-800 font-bold bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const inputEl = document.getElementById('direct-aadhaar-link-url') as HTMLInputElement;
                            const url = inputEl?.value?.trim();
                            if (url) {
                              updateProfileDirect(profile.id, {
                                aadhaarCardUrl: url,
                                idProofUrl: url,
                                aadhaarVerified: true,
                                isIdVerified: true
                              });
                              alert('आधार दस्तऐवज अपलोड यशस्वी व आधार पडताळणी पूर्ण झाली!');
                            } else {
                              alert('कृपया वैध प्रतिमा लिंक (Image URL) प्रविष्ट करा!');
                            }
                          }}
                          className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-white font-black rounded-xl text-xs cursor-pointer shadow-md shrink-0 w-full sm:w-auto text-center"
                        >
                          आधार फोटो जोडा
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Uploaded Photos Management & Quick Deletion */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#A71930]" />
                      <span>📷 प्रोफाईल फोटो व्यवस्थापन (Delete or Add Profile Photos):</span>
                    </p>
                    {profile.photos.length < 5 && (
                      <label className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs">
                        {isUploadingNewPhoto ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>अपलोड होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>नवीन फोटो जोडा</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingNewPhoto}
                          onChange={handleAdminUploadPhoto}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {profile.photos.map((img, idx) => (
                      <div key={idx} className="relative group border-2 border-slate-200 rounded-xl overflow-hidden aspect-square bg-slate-50 shadow-xs">
                        <img
                          src={img}
                          alt={`profile thumb ${idx}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`तुम्हाला खरोखर फोटो नंबर ${idx + 1} डिलीट करायचा आहे का?`)) {
                                deleteMemberPhoto(profile.id, idx);
                                setSelectedPhotoIndex(0);
                                alert('फोटो यशस्वीरित्या डिलीated!');
                              }
                            }}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md cursor-pointer hover:scale-110 transition-transform"
                            title="हा फोटो डिलीट करा"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-slate-900/70 text-amber-300 text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                          {idx === 0 ? 'मुख्य फोटो' : `फोटो ${idx + 1}`}
                        </div>
                      </div>
                    ))}

                    {profile.photos.length === 0 && (
                      <div className="col-span-full p-4 bg-amber-50 rounded-xl border border-dashed border-amber-300 text-center text-xs text-amber-900">
                        कोणताही फोटो जोडलेला नाही. वर दिलेला 'नवीन फोटो जोडा' बटण वापरून फोटो अपलोड करा.
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVE PERMISSIONS & PRIVACY OVERVIEW (ADMIN ONLY) */}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3 shadow-xs">
                  <h4 className="text-xs font-black text-[#A71930] flex items-center gap-1.5 border-b border-amber-200 pb-1.5 uppercase">
                    <ShieldCheck className="w-4 h-4 text-[#A71930]" />
                    <span>🛡️ सक्रिय परवानग्या आणि गोपनीयता तपशील (Active Permissions & Privacy):</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5 p-2 bg-white/50 border border-amber-200/50 rounded-xl">
                      <p className="text-slate-800 font-black flex items-center gap-1">👤 १. लॉगिन नसलेले विझिटर्स (Public):</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium text-[11px]">
                        <li>
                          मुख्य बायोडाटा: <span className={siteConfig?.guestPermissions?.viewProfiles ? "text-emerald-700 font-black" : "text-rose-600 font-black"}>
                            {siteConfig?.guestPermissions?.viewProfiles ? "परवानगी" : "बंद"}
                          </span>
                        </li>
                        <li>
                          फोटो: <span className={(siteConfig?.allowPublicVisitorsToViewPhotos !== false && !siteConfig?.blurProfilePhotos) ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                            {(siteConfig?.allowPublicVisitorsToViewPhotos !== false && !siteConfig?.blurProfilePhotos) ? "स्पष्ट (Clear)" : "अस्पष्ट (Blur)"}
                          </span>
                        </li>
                        <li>
                          मोबाईल नंबर: <span className={siteConfig?.allowPublicVisitorsToViewContacts ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                            {siteConfig?.allowPublicVisitorsToViewContacts ? "खुला (Direct)" : "प्रीमियम / बंद"}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-1.5 p-2 bg-white/50 border border-amber-200/50 rounded-xl">
                      <p className="text-slate-800 font-black flex items-center gap-1">🔑 २. गेस्ट लॉगिन युझर्स (Guest Logins):</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium text-[11px]">
                        <li>
                          फोटो: <span className={(siteConfig?.allowGuestsToViewPhotos !== false && !siteConfig?.blurProfilePhotos) ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                            {(siteConfig?.allowGuestsToViewPhotos !== false && !siteConfig?.blurProfilePhotos) ? "स्पष्ट (Clear)" : "अस्पष्ट (Blur)"}
                          </span>
                        </li>
                        <li>
                          मोबाईल नंबर: <span className={siteConfig?.allowGuestsToViewContacts ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                            {siteConfig?.allowGuestsToViewContacts ? "खुला (Direct)" : "प्रीमियम / बंद"}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-1.5 p-2 bg-white/50 border border-amber-200/50 rounded-xl">
                      <p className="text-slate-800 font-black flex items-center gap-1">👥 ३. नोंदणीकृत सदस्य (Members):</p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium text-[11px]">
                        <li>
                          फोटो: <span className={siteConfig?.allowMembersToViewPhotos !== false ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                            {siteConfig?.allowMembersToViewPhotos !== false ? "स्पष्ट (Clear)" : "अस्पष्ट (Blur)"}
                          </span>
                        </li>
                        <li>
                          मोबाईल नंबर: <span className={siteConfig?.allowMembersToViewContacts ? "text-emerald-700 font-black" : "text-amber-700 font-black"}>
                            {siteConfig?.allowMembersToViewContacts ? "खुला (Direct)" : "प्रीमियम / बंद"}
                          </span>
                        </li>
                        <li>
                          गोपनीयता: <span className="text-slate-700 font-bold">
                            {profile.privacy?.hideContact ? "📞 नंबर लपवला" : "📞 नंबर जाहीर"} • {profile.privacy?.hidePhoto ? "🖼️ फोटो लपवला" : "🖼️ फोटो जाहीर"}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white border border-amber-200 rounded-xl text-[10px] text-slate-500 font-semibold leading-relaxed">
                    ℹ️ <strong>टीप (Note for Admin):</strong> सदस्याने त्यांच्या प्रोफाइल सेटिंगमध्ये बदल केले तरी, ॲडमिन म्हणून तुमचे जागतिक नियम (Global Site Settings) व परवानग्यांचे नियंत्रण अंतिम व सर्वोच्च राहील.
                  </div>
                </div>
              </div>
            )}

            {/* Top Banner with Main Image & Quick Badges */}
            <div className="grid md:grid-cols-12 gap-6 bg-white p-5 rounded-3xl border border-amber-200 shadow-sm">
              
              {/* Photos Column */}
              <div className="md:col-span-5 space-y-3">
                <div 
                  onClick={() => setIsLightboxOpen(true)}
                  onContextMenu={(e) => siteConfig?.disablePhotoDownloadAndScreenshot && e.preventDefault()}
                  className={`relative h-72 rounded-2xl overflow-hidden border-2 border-[#A71930]/30 shadow-md bg-amber-50 cursor-pointer group ${
                    siteConfig?.disablePhotoDownloadAndScreenshot ? 'select-none' : ''
                  }`}
                  title="फोटो मोठं करून पाहण्यासाठी क्लिक करा"
                >
                  <img
                    src={profile.photos?.[selectedPhotoIndex] || profile.photos?.[0] || profile.photoUrl || (profile.gender === 'bride' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    style={{
                      filter: (() => {
                        const isOverride = siteConfig?.adminOverrideMemberPrivacy === true;
                        const isPhotoBlurred = isAuthorized ? false : (
                          (profile.privacy?.hidePhoto && !isOverride) ||
                          siteConfig?.blurPhotosForFreeUsers === true ||
                          siteConfig?.blurProfilePhotos === true ||
                          (!currentUser && siteConfig?.allowPublicVisitorsToViewPhotos === false) ||
                          (currentUser?.id?.startsWith('guest') && siteConfig?.allowGuestsToViewPhotos === false)
                        );

                        const blurPct = siteConfig?.photoBlurPercentage || siteConfig?.photoBlurPercent || 50;
                        const blurPx = blurPct >= 100 ? 30 : blurPct >= 75 ? 20 : blurPct >= 50 ? 12 : 6;

                        return isPhotoBlurred ? `blur(${blurPx}px)` : 'none';
                      })()
                    }}
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Click to Expand Hint Overlay */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/70 text-amber-300 text-[10px] font-bold border border-amber-300/40 flex items-center gap-1 shadow opacity-90 group-hover:opacity-100">
                    <span>🔍 मोठं करून पहा</span>
                  </div>

                  {/* Anti-theft Watermark Overlay */}
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-xs text-[10px] font-black text-amber-300 pointer-events-none select-none border border-amber-300/30 tracking-wider shadow">
                    वंजारी जोडी (VanjariJodi.com)
                  </div>

                  {profile.showVerifiedBadge && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold border border-emerald-400 flex items-center gap-1 shadow">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>प्रमाणित प्रोफाईल</span>
                    </span>
                  )}
                </div>

                {/* Photo Thumbnails */}
                {profile.photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {profile.photos.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedPhotoIndex === idx ? 'border-[#A71930] scale-105 shadow' : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Info Column */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-[#A71930] font-bold border border-amber-300">
                      वंजारी समाज ({profile.subCaste})
                    </span>
                    <button
                      onClick={() => toggleShortlist(profile.id)}
                      className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-slate-600 border border-amber-200"
                    >
                      <Heart
                        className={`w-5 h-5 ${isShortlisted ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                    </button>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-[#A71930] mt-2 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{formatProfileDisplayName(profile.fullName, currentUser, isAdminLoggedIn, isAuthorized, siteConfig, language)}</span>
                      <VerifiedBadge profile={profile} size="md" />
                    </div>
                  </h1>

                  {/* High Contrast District & Qualification Highlight Box */}
                  <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 p-3 rounded-2xl border-2 border-amber-300 shadow-sm mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-black text-[#800C1E]">
                      <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-slate-900 shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-[#A71930]" />
                        <span>जिल्हा: <strong className="text-[#A71930] font-black">{profile.district || 'महाराष्ट्र'}</strong> ({profile.city || profile.taluka || ''})</span>
                      </span>
                      <span className="bg-white px-2 py-1 rounded-lg border border-amber-300 text-slate-800 font-extrabold">
                        {profile.age} वर्षे
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black text-[#800C1E] bg-white p-2 rounded-xl border border-amber-300 shadow-2xs">
                      <GraduationCap className="w-4 h-4 text-[#A71930] shrink-0" />
                      <span>शिक्षण/पात्रता: <strong className="text-[#800C1E] font-black">{profile.education || 'उच्चशिक्षित'}</strong></span>
                    </div>

                    {/* Profession & Govt Job Tags */}
                    {(() => {
                      const badges = getProfessionBadges(profile);
                      if (badges.length === 0) return null;
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-black text-slate-600">नोकरी/व्यवसाय श्रेणी:</span>
                          {badges.map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black border shadow-2xs ${
                                tag.includes('डॉक्टर')
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                  : tag.includes('सरकारी')
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : tag.includes('इंजिनिअर')
                                  ? 'bg-blue-100 text-blue-950 border-blue-300'
                                  : tag.includes('शिक्षक')
                                  ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                                  : tag.includes('व्यावसायिक') || tag.includes('व्यवसाय')
                                  ? 'bg-purple-100 text-purple-950 border-purple-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {profile.bio && (
                    <p className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200 mt-3 italic">
                      "{profile.bio}"
                    </p>
                  )}
                </div>

                {/* Grid Summary */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
                  <div>
                    <span className="text-slate-500 block font-medium">{t('age')} / {t('height')}</span>
                    <span className="font-bold text-slate-900">{profile.age} वर्षे | {profile.height}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">{t('marital_status')}</span>
                    <span className="font-bold text-[#A71930]">
                      {profile.maritalStatus === 'never_married' ? 'अविवाहित' : profile.maritalStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">{t('education')}</span>
                    <span className="font-bold text-slate-900 truncate block">{profile.education}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">{t('occupation')}</span>
                    <span className="font-bold text-slate-900 truncate block">{profile.occupation}</span>
                  </div>
                </div>

                {/* Aadhaar & Verification badge */}
                <div className="flex items-center gap-2 text-xs">
                  {profile.aadhaarVerified ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>आधार कार्ड पडताळणी पूर्ण (Aadhaar Verified)</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>ओळखपत्र पडताळणी सुरू आहे</span>
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-amber-200 overflow-x-auto text-xs font-bold gap-2 pb-1">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'personal'
                    ? 'bg-[#A71930] text-white shadow'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-amber-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>वैयक्तिक माहिती</span>
              </button>
              <button
                onClick={() => setActiveTab('professional')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'professional'
                    ? 'bg-[#A71930] text-white shadow'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-amber-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>शिक्षण व नोकरी</span>
              </button>
              <button
                onClick={() => setActiveTab('family')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'family'
                    ? 'bg-[#A71930] text-white shadow'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-amber-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>कौटुंबिक माहिती</span>
              </button>
              <button
                onClick={() => setActiveTab('expectations')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'expectations'
                    ? 'bg-[#A71930] text-white shadow'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-amber-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>अपेक्षा</span>
              </button>
              <button
                onClick={() => setActiveTab('horoscope')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'horoscope'
                    ? 'bg-[#A71930] text-white shadow'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-amber-200'
                }`}
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>पत्रिका व राशी</span>
              </button>
            </div>

            {/* Tab Content Box */}
            <div className="bg-white p-6 rounded-3xl border border-amber-200 text-xs sm:text-sm">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">जन्म तारीख</span>
                    <span className="font-bold text-slate-900">{profile.dob} ({profile.age} वर्षे)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">जन्म वेळ व स्थान</span>
                    <span className="font-bold text-slate-900">{profile.birthTime || 'सकाळी १०:३० AM'} ({profile.birthPlace || profile.district})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">उंची / वजन</span>
                    <span className="font-bold text-slate-900">{profile.height} | {profile.weight || '५५ किलो'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">वर्ण व रक्तगट</span>
                    <span className="font-bold text-[#A71930]">{profile.complexion || 'गोरा'} | {profile.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">उपजात</span>
                    <span className="font-bold text-[#A71930]">{profile.subCaste}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">गोत्र / राशी</span>
                    <span className="font-bold text-slate-900">{profile.gotra || 'काश्यप'} | {profile.rashi || 'मकर'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">कायमचा पत्ता (Native)</span>
                    <span className="font-bold text-slate-900">{profile.nativeAddress || `${profile.taluka}, ${profile.district}`}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">सध्याचा पत्ता (Current)</span>
                    <span className="font-bold text-slate-900">{profile.currentAddress || profile.city}</span>
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">शिक्षण</span>
                    <span className="font-extrabold text-slate-900 text-base">{profile.education}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">व्यवसाय / नोकरी</span>
                    <span className="font-extrabold text-[#A71930] text-base">{profile.occupation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">वार्षिक उत्पन्न</span>
                    <span className="font-bold text-emerald-700">{profile.income}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block font-medium">नोकरीचे ठिकाण</span>
                    <span className="font-bold text-slate-900">{profile.city}, {profile.district}</span>
                  </div>
                </div>
              )}

              {activeTab === 'family' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 text-xs block font-medium">वडिलांचे नाव व व्यवसाय</span>
                      <span className="font-bold text-slate-900">{profile.fatherName || 'श्री. मुंडे'} ({profile.fatherOccupation})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block font-medium">आईचे नाव व व्यवसाय</span>
                      <span className="font-bold text-slate-900">{profile.motherName || 'सौ. मुंडे'} ({profile.motherOccupation})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block font-medium">भाऊ व बहीण तपशील</span>
                      <span className="font-bold text-slate-900">
                        {profile.brothers} भाऊ, {profile.sisters} बहीण
                        {profile.brotherDetails && ` (${profile.brotherDetails})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block font-medium">कुटुंब पद्धत</span>
                      <span className="font-bold text-[#A71930]">{profile.familyType}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                    <div>
                      <span className="text-[#A71930] text-xs block font-bold">नातेवाईक आडनावे (Relative Surnames):</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {profile.relativeSurnames && profile.relativeSurnames.length > 0 ? (
                          profile.relativeSurnames.map((sur, idx) => (
                            <span key={idx} className="bg-white px-2.5 py-1 rounded-md text-slate-800 border border-amber-200 font-bold text-xs">
                              {sur}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-700 font-semibold">मुंडे, सानप, नागरे, काकड, घूगे, आघाव</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200">
                      <div>
                        <span className="text-slate-500 text-[11px] block">मामांचे नाव</span>
                        <span className="font-bold text-slate-800 text-xs">{profile.mamaName || 'श्री. सानप'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">मामांचे गाव</span>
                        <span className="font-bold text-slate-800 text-xs">{profile.mamaNative || profile.district}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'expectations' && (
                <div>
                  <span className="text-slate-500 text-xs block mb-1 font-semibold">अपेक्षित जोडीदाराचे वर्णन:</span>
                  <p className="text-slate-800 leading-relaxed bg-amber-50/60 p-4 rounded-2xl border border-amber-200 font-medium">
                    {profile.expectations}
                  </p>
                </div>
              )}

              {activeTab === 'horoscope' && (
                <div className="text-center py-6 space-y-4">
                  <Scroll className="w-12 h-12 text-[#A71930] mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">पत्रिका व गुणमेलन माहिती</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    या प्रोफाईलची पत्रिका / कुंडली उपलब्ध आहे. तुम्ही डाऊनलोड करून गुरुजींकडून गुण जुळवून पाहू शकता.
                  </p>
                  <button
                    onClick={() => alert('कुंडली / पत्रिका PDF डाउनलोड सुरू झाली आहे.')}
                    className="px-6 py-2.5 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-white text-xs font-bold inline-flex items-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>पत्रिका (Horoscope PDF) डाऊनलोड करा</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-amber-50 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-white text-xs font-black flex items-center gap-1.5 shadow-md border border-amber-300"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>बायोडाटा प्रिंट करा</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Share2 className="w-4 h-4" />
                <span>शेअर करा</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {isAuthorized ? (
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${profile.mobile}`}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>कॉल करा ({profile.mobile})</span>
                  </a>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveChatUser(profile);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>चॅट करा</span>
                  </button>
                  {isMutualMatch && (
                    <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black flex items-center gap-1">
                      💞 म्युचुअल लाईक (मॅच) मुळे मोबाईल नंबर अनलॉक!
                    </span>
                  )}
                </div>
              ) : pendingReq ? (
                <div className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-default">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>मान्यतेसाठी प्रलंबित (प्रशासकीय पडताळणी सुरु आहे)</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Pay Per Contact Button - Hidden if isPayPerContactEnabled is false */}
                  {siteConfig?.isPayPerContactEnabled !== false && (
                    <button
                      onClick={() => {
                        if (checkGuestPermission('viewProfiles', 'संपर्क अन-लॉक')) {
                          if (siteConfig?.isOfferModeEnabled || siteConfig?.disableAllPaymentsInOfferMode) {
                            unlockContact(profile.id);
                            alert('🎁 विशेष सण ऑफर: संपर्क क्रमांक विनामूल्य अन-लॉक झाला आहे!');
                          } else {
                            setSelectedProfileForUnlock(profile);
                            setIsContactUnlockModalOpen(true);
                          }
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-amber-100 text-xs font-black flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer border border-emerald-400"
                    >
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>
                        {siteConfig?.isOfferModeEnabled
                          ? '🎁 मोफत संपर्क अन-लॉक करा (Offer)'
                          : 'संपर्क अन-लॉक करा (Pay-Per-Contact)'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      requestContactAuthorization(profile.id);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>मोफत विनंती करा</span>
                  </button>
                </div>
              )}

              {currentUser?.id !== profile.id && (
                <button
                  onClick={() => sendInterest(profile.id)}
                  disabled={!!interestObj || likedProfileIds.includes(profile.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                    interestObj || likedProfileIds.includes(profile.id)
                      ? 'bg-amber-100 text-[#800C1E] border border-amber-300 cursor-default'
                      : 'bg-gradient-to-r from-[#A71930] to-[#800C1E] text-amber-100 hover:brightness-110'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${interestObj || likedProfileIds.includes(profile.id) ? 'fill-[#A71930] text-[#A71930]' : 'fill-amber-200 text-amber-200'}`} />
                  <span>{interestObj || likedProfileIds.includes(profile.id) ? '❤️ लाईक केले (Liked)' : '❤️ लाईक करा (Like Profile)'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Print Biodata View Modal */}
      {isPrintModalOpen && (
        <PrintBiodataModal
          profile={profile}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Report Profile Modal */}
      {isReportModalOpen && (
        <ReportProfileModal
          isOpen={isReportModalOpen}
          profile={profile}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-fadeIn">
          {/* Lightbox Header */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-amber-400 text-sm sm:text-base">{profile.fullName}</h3>
              <p className="text-[11px] text-slate-400">फोटो {selectedPhotoIndex + 1} पैकी {profile.photos.length}</p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-slate-800 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4 overflow-hidden">
            <img
              src={profile.photos?.[selectedPhotoIndex] || profile.photos?.[0] || profile.photoUrl || (profile.gender === 'bride' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')}
              alt="fullscreen profile photo"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border-2 border-amber-400/40"
            />
          </div>

          {/* Lightbox Navigation Controls */}
          {profile.photos.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {profile.photos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedPhotoIndex === idx ? 'border-amber-400 scale-110 shadow-lg' : 'border-slate-700 opacity-50'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
