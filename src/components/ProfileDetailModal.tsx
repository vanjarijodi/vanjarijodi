import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { PrintBiodataModal } from './PrintBiodataModal';
import { ReportProfileModal } from './ReportProfileModal';
import { VerifiedBadge } from './VerifiedBadge';
import { InstagramPhotoCarousel } from './InstagramPhotoCarousel';
import { KundaliMilanModal } from './KundaliMilanModal';
import { calculateAshtakootMilan } from '../utils/kundaliCalculator';
import { getProfessionBadges, getTagStyleClass } from '../utils/professionUtils';
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
  Settings2,
  Maximize2,
  ExternalLink,
  Check,
  Sliders,
  FileCheck,
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
    uploadAadhaarCard,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'family' | 'expectations' | 'horoscope'>('personal');
  const [adminViewMode, setAdminViewMode] = useState<'biodata' | 'admin_controls'>('biodata');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isUploadingFrontAadhaar, setIsUploadingFrontAadhaar] = useState(false);
  const [isUploadingBackAadhaar, setIsUploadingBackAadhaar] = useState(false);
  const [directAadhaarFrontUrl, setDirectAadhaarFrontUrl] = useState('');
  const [directAadhaarBackUrl, setDirectAadhaarBackUrl] = useState('');
  const [aadhaarIdNumberInput, setAadhaarIdNumberInput] = useState(profile?.idVerificationNumber || '');
  const [isAadhaarMaskedCheck, setIsAadhaarMaskedCheck] = useState<boolean>(profile?.isAadhaarMasked !== false);
  const [previewAadhaarModalUrl, setPreviewAadhaarModalUrl] = useState<string | null>(null);
  const handleAadhaarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    
    if (side === 'front') setIsUploadingFrontAadhaar(true);
    else setIsUploadingBackAadhaar(true);

    try {
      const comp = await compressAndResizeImage(file, 1200, 0.9);
      const res = await uploadToCloudinary(comp.file, 'vanjarijodi_aadhaar_docs');
      const uploadedUrl = res.success && res.url ? res.url : comp.dataUrl;

      if (side === 'front') {
        uploadAadhaarCard(profile.id, uploadedUrl, profile.aadhaarBackUrl || '', isAadhaarMaskedCheck, aadhaarIdNumberInput);
        alert('आधार पुढचा फोटो (Front Side) यशस्वीरित्या सेव्ह झाला!');
      } else {
        uploadAadhaarCard(profile.id, profile.aadhaarFrontUrl || profile.aadhaarCardUrl || '', uploadedUrl, isAadhaarMaskedCheck, aadhaarIdNumberInput);
        alert('आधार पाठीमागचा फोटो (Back Side) यशस्वीरित्या सेव्ह झाला!');
      }
    } catch (err) {
      console.error('Aadhaar upload error:', err);
      alert('आधार दस्तऐवज अपलोड करताना त्रुटी आली.');
    } finally {
      setIsUploadingFrontAadhaar(false);
      setIsUploadingBackAadhaar(false);
    }
  };

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
  const [isKundaliModalOpen, setIsKundaliModalOpen] = useState(false);

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

  // Strict check: Only genuine admins can view and use administrative actions
  const isUserAdmin = Boolean(
    isAdminLoggedIn &&
    (!currentUser || currentUser.isAdmin === true || currentUser.id === 'admin') &&
    !(currentUser && !currentUser.isAdmin && currentUser.id !== 'admin')
  );

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

          {/* Top Admin Navigation Tabs (Only for genuine Admins) */}
          {isUserAdmin && (
            <div className="bg-amber-100/90 border-b border-amber-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminViewMode('biodata')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    adminViewMode === 'biodata'
                      ? 'bg-[#A71930] text-amber-100 border border-[#800C1E]'
                      : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>👤 १. संपूर्ण बायोडाटा (Profile View)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminViewMode('admin_controls')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    adminViewMode === 'admin_controls'
                      ? 'bg-[#A71930] text-amber-100 border border-[#800C1E]'
                      : 'bg-white text-[#A71930] hover:bg-amber-50 border border-amber-300'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>🛡️ २. प्रशासक नियंत्रण कक्ष (Admin Controls)</span>
                  <span className="ml-1 px-2 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] font-bold">
                    {profile.isApproved ? 'मंजूर' : 'प्रलंबित'}
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                <span className="text-slate-500">स्थिती:</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${profile.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'}`}>
                  {profile.isApproved ? '✅ मंजूर' : '⏳ प्रलंबित'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${profile.aadhaarVerified ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                  {profile.aadhaarVerified ? '🌟 आधार Verified' : 'आधार नाही'}
                </span>
              </div>
            </div>
          )}

          {/* Modal Body Scrollable */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 pr-3 sm:pr-4">

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

            {/* IF ADMIN VIEW MODE IS 'ADMIN_CONTROLS', SHOW THE STREAMLINED MOBILE-FRIENDLY ADMIN COMMAND CENTER */}
            {isUserAdmin && adminViewMode === 'admin_controls' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Admin Header Summary Card */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-3xl border-2 border-amber-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 bg-amber-100 shrink-0 shadow-sm">
                      <img
                        src={profile.photos?.[0] || profile.photoUrl || (profile.gender === 'bride' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
                        alt="Candidate"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-[#A71930]">{profile.fullName}</h3>
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                          ID: {profile.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">
                        {profile.age} वर्षे • {profile.subCaste || 'वंजारी'} • {profile.district || 'महाराष्ट्र'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
                    {profile.mobile && (
                      <a
                        href={`https://wa.me/91${profile.mobile.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                          `नमस्कार ${profile.fullName}, वंजारी जोडी मॅट्रिमोनीवरून ॲडमिन टीम.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp ({profile.mobile})</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setAdminViewMode('biodata')}
                      className="px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#A71930]" />
                      <span>बायोडाटा पहा</span>
                    </button>
                  </div>
                </div>

                {/* SECTION 1: APPROVALS & VERIFICATION BADGES */}
                <div className="p-4 sm:p-5 bg-white rounded-3xl border border-amber-300 shadow-sm space-y-3">
                  <div className="border-b border-amber-200 pb-2">
                    <h4 className="text-sm font-black text-[#A71930] flex items-center gap-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-[#A71930]" />
                      <span>१. नोंदणी मान्यता व प्रमाणीकरण बॅजेस (Status & Verification Badges)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      सदस्याच्या बायोडाटाला साईटवर मान्यता द्या अथवा विशेष प्रमाणीकरण बॅजेस सक्रिय करा.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. Profile Approval */}
                    <div className="p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-2xl border border-slate-200 transition-colors flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">नोंदणी मान्यता</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${profile.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className={`text-xs font-black ${profile.isApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {profile.isApproved ? 'मंजूर (Approved)' : 'प्रलंबित (Pending)'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileDirect(profile.id, { isApproved: !profile.isApproved });
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.isApproved
                            ? 'bg-amber-100 hover:bg-amber-200 text-[#800C1E] border border-amber-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {profile.isApproved ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>प्रलंबित करा</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>मंजूर करा (Approve)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 2. Aadhaar Verified Badge */}
                    <div className="p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-2xl border border-slate-200 transition-colors flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">आधार पडताळणी बॅज</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${profile.aadhaarVerified ? 'bg-blue-500' : 'bg-slate-400'}`} />
                          <span className={`text-xs font-black ${profile.aadhaarVerified ? 'text-blue-700' : 'text-slate-600'}`}>
                            {profile.aadhaarVerified ? 'आधार प्रमाणित' : 'प्रलंबित'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileDirect(profile.id, {
                            aadhaarVerified: !profile.aadhaarVerified,
                            isIdVerified: !profile.aadhaarVerified
                          });
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.aadhaarVerified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {profile.aadhaarVerified ? '❌ बॅज काढा' : '🌟 आधार मंजूर करा'}
                      </button>
                    </div>

                    {/* 3. Face Verified Badge */}
                    <div className="p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-2xl border border-slate-200 transition-colors flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">चेहरा पडताळणी बॅज</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${profile.isFaceVerified ? 'bg-purple-500' : 'bg-slate-400'}`} />
                          <span className={`text-xs font-black ${profile.isFaceVerified ? 'text-purple-700' : 'text-slate-600'}`}>
                            {profile.isFaceVerified ? 'चेहरा प्रमाणित' : 'प्रलंबित'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileDirect(profile.id, {
                            isFaceVerified: !profile.isFaceVerified,
                            isPhotoVerified: !profile.isFaceVerified
                          });
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.isFaceVerified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {profile.isFaceVerified ? '❌ चेहरा बॅज काढा' : '📷 चेहरा मंजूर करा'}
                      </button>
                    </div>

                    {/* 4. Golden Certified Badge */}
                    <div className="p-3.5 bg-slate-50 hover:bg-amber-50/50 rounded-2xl border border-slate-200 transition-colors flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">खात्रीशीर प्रोफाईल</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${profile.isVerified ? 'bg-amber-500' : 'bg-slate-400'}`} />
                          <span className={`text-xs font-black ${profile.isVerified ? 'text-amber-700' : 'text-slate-600'}`}>
                            {profile.isVerified ? 'गोल्डन प्रमाणित' : 'सामान्य प्रोफाईल'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileDirect(profile.id, { isVerified: !profile.isVerified });
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.isVerified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {profile.isVerified ? '❌ बॅज काढा' : '🏆 गोल्डन बॅज द्या'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: SECURITY, ACCESS & VISIBILITY */}
                <div className="p-4 sm:p-5 bg-white rounded-3xl border border-amber-300 shadow-sm space-y-3">
                  <div className="border-b border-amber-200 pb-2">
                    <h4 className="text-sm font-black text-[#A71930] flex items-center gap-2">
                      <Lock className="w-4.5 h-4.5 text-[#A71930]" />
                      <span>२. खाते सुरक्षा, गोपनीयता व दृश्यमानता (Account Security & Visibility)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      खाते ब्लॉक करणे, शोध परिणामांतून लपवणे किंवा गेस्ट युझर्सना संपर्क खुला ठेवणे नियंत्रित करा.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Block Login Access */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">लॉगिन खाते स्थिती</span>
                        <p className={`text-xs font-black mt-1 ${profile.isBlocked ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {profile.isBlocked ? '🚫 ब्लॉकड (लॉगिन बंद)' : '✅ सक्रिय (लॉगिन चालू)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleBlockMemberAccess(profile.id);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.isBlocked
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {profile.isBlocked ? '🔑 अन-ब्लॉक करा' : '🔒 खाते ब्लॉक करा'}
                      </button>
                    </div>

                    {/* Search Visibility */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">वेबसाईटवर दृश्यमानता</span>
                        <p className={`text-xs font-black mt-1 ${profile.isHiddenByAdmin ? 'text-amber-800' : 'text-emerald-700'}`}>
                          {profile.isHiddenByAdmin ? '🙈 शोध परिणामांतून लपवले' : '👁️ सर्वांना दृश्यमान'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleProfileVisibility(profile.id);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.isHiddenByAdmin
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-amber-800 hover:bg-amber-900 text-white'
                        }`}
                      >
                        {profile.isHiddenByAdmin ? '👁️ सर्वांना दाखवा' : '🙈 सध्या लपवून ठेवा'}
                      </button>
                    </div>

                    {/* Guest Contact View */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">गेस्ट युझर्सना नंबर</span>
                        <p className={`text-xs font-black mt-1 ${profile.allowGuestContactView ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {profile.allowGuestContactView ? '🔓 थेट खुला (Open for All)' : '🔒 बंद (लॉगिन आवश्यक)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileDirect(profile.id, { allowGuestContactView: !profile.allowGuestContactView });
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.allowGuestContactView
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {profile.allowGuestContactView ? '🔒 विना-लॉगिन नंबर लपवा' : '🔓 विना-लॉगिन नंबर दाखवा'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: AADHAAR CARD & GOVT ID MANAGEMENT (FRONT & BACK) */}
                <div className="p-4 sm:p-5 bg-white rounded-3xl border border-amber-300 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <div>
                      <h4 className="text-sm font-black text-[#A71930] flex items-center gap-2">
                        <FileCheck className="w-4.5 h-4.5 text-[#A71930]" />
                        <span>३. शासकीय ओळखपत्र / आधार कार्ड व्यवस्थापन (Aadhaar & Govt ID Proofs)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        पुढचा व पाठीमागचा फोटो तपासा, मास्क केलेला प्रकार पहा, व आवश्यक असल्यास नवीन अपलोड करा.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                        profile.isAadhaarMasked !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {profile.isAadhaarMasked !== false ? '🔒 मास्क केलेला आधार (शेवटचे ४ आकडे)' : '📋 मूळ आधार दस्तऐवज'}
                      </span>
                      {profile.idVerificationNumber && (
                        <span className="px-2.5 py-1 bg-amber-100 text-[#800C1E] font-mono text-[10px] font-black rounded-xl border border-amber-300">
                          क्रमांक: {profile.idVerificationNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Front & Back Images Display Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Front Side Document Card */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-dashed border-amber-300/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>🪪 १. आधार पुढचा फोटो (Front Side)</span>
                        </span>
                        {(profile.aadhaarFrontUrl || profile.aadhaarCardUrl || profile.idProofUrl) && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-black px-2 py-0.5 rounded-md">
                            अपलोड केलेले आहे
                          </span>
                        )}
                      </div>

                      {(profile.aadhaarFrontUrl || profile.aadhaarCardUrl || profile.idProofUrl) ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-video flex items-center justify-center">
                          <img
                            src={profile.aadhaarFrontUrl || profile.aadhaarCardUrl || profile.idProofUrl}
                            alt="Aadhaar Front"
                            className="max-h-full max-w-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                            <button
                              type="button"
                              onClick={() => setPreviewAadhaarModalUrl(profile.aadhaarFrontUrl || profile.aadhaarCardUrl || profile.idProofUrl || null)}
                              className="p-2 bg-white hover:bg-amber-100 text-slate-900 rounded-xl font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                            >
                              <Maximize2 className="w-4 h-4" />
                              <span>मोठा फोटो</span>
                            </button>
                            <a
                              href={profile.aadhaarFrontUrl || profile.aadhaarCardUrl || profile.idProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-[#A71930] hover:bg-[#800C1E] text-white rounded-xl font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>उघडा</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('नक्की आधार पुढचा फोटो काढून टाकायचा आहे का?')) {
                                  updateProfileDirect(profile.id, {
                                    aadhaarFrontUrl: '',
                                    aadhaarCardUrl: '',
                                    idProofUrl: ''
                                  });
                                }
                              }}
                              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                              title="काढून टाका"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-amber-50/70 rounded-xl text-center text-xs text-slate-500 font-bold">
                          अद्याप पुढचा फोटो जोडलेला नाही.
                        </div>
                      )}

                      {/* Upload / Replace Front */}
                      <div className="pt-1 flex items-center gap-2">
                        <label className="flex-1 py-2 px-3 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-xl text-xs font-black text-center cursor-pointer border border-amber-300 flex items-center justify-center gap-1.5 transition">
                          {isUploadingFrontAadhaar ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>अपलोड होत आहे...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{profile.aadhaarFrontUrl || profile.aadhaarCardUrl ? 'पुढचा फोटो बदला' : 'पुढचा फोटो अपलोड करा'}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={isUploadingFrontAadhaar}
                            onChange={(e) => handleAadhaarFileUpload(e, 'front')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Back Side Document Card */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-dashed border-amber-300/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>🪪 २. आधार पाठीमागचा फोटो (Back Side)</span>
                        </span>
                        {profile.aadhaarBackUrl && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-black px-2 py-0.5 rounded-md">
                            अपलोड केलेले आहे
                          </span>
                        )}
                      </div>

                      {profile.aadhaarBackUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-video flex items-center justify-center">
                          <img
                            src={profile.aadhaarBackUrl}
                            alt="Aadhaar Back"
                            className="max-h-full max-w-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                            <button
                              type="button"
                              onClick={() => setPreviewAadhaarModalUrl(profile.aadhaarBackUrl || null)}
                              className="p-2 bg-white hover:bg-amber-100 text-slate-900 rounded-xl font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                            >
                              <Maximize2 className="w-4 h-4" />
                              <span>मोठा फोटो</span>
                            </button>
                            <a
                              href={profile.aadhaarBackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-[#A71930] hover:bg-[#800C1E] text-white rounded-xl font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>उघडा</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('नक्की आधार पाठीमागचा फोटो काढून टाकायचा आहे का?')) {
                                  updateProfileDirect(profile.id, { aadhaarBackUrl: '' });
                                }
                              }}
                              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow cursor-pointer"
                              title="काढून टाका"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-amber-50/70 rounded-xl text-center text-xs text-slate-500 font-bold">
                          अद्याप पाठीमागचा फोटो जोडलेला नाही.
                        </div>
                      )}

                      {/* Upload / Replace Back */}
                      <div className="pt-1 flex items-center gap-2">
                        <label className="flex-1 py-2 px-3 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-xl text-xs font-black text-center cursor-pointer border border-amber-300 flex items-center justify-center gap-1.5 transition">
                          {isUploadingBackAadhaar ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>अपलोड होत आहे...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{profile.aadhaarBackUrl ? 'पाठीमागचा फोटो बदला' : 'पाठीमागचा फोटो अपलोड करा'}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={isUploadingBackAadhaar}
                            onChange={(e) => handleAadhaarFileUpload(e, 'back')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Manual URL & ID Details Form */}
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                    <p className="text-xs font-black text-slate-800">
                      ✍️ थेट आधार क्रमांक व इमेज लिंक सेव्ह करा (Manual ID Details & URLs):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">आधार / ओळख क्रमांक:</label>
                        <input
                          type="text"
                          value={aadhaarIdNumberInput}
                          onChange={(e) => setAadhaarIdNumberInput(e.target.value)}
                          placeholder="उदा. XXXX XXXX 1234"
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">पुढचा फोटो URL:</label>
                        <input
                          type="text"
                          value={directAadhaarFrontUrl}
                          onChange={(e) => setDirectAadhaarFrontUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">पाठीमागचा फोटो URL:</label>
                        <input
                          type="text"
                          value={directAadhaarBackUrl}
                          onChange={(e) => setDirectAadhaarBackUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAadhaarMaskedCheck}
                          onChange={(e) => setIsAadhaarMaskedCheck(e.target.checked)}
                          className="w-4 h-4 rounded text-[#A71930] focus:ring-[#A71930]"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          हा मास्क केलेला आधार (Masked Aadhaar) आहे
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const front = directAadhaarFrontUrl.trim() || profile.aadhaarFrontUrl || profile.aadhaarCardUrl || '';
                          const back = directAadhaarBackUrl.trim() || profile.aadhaarBackUrl || '';
                          uploadAadhaarCard(profile.id, front, back, isAadhaarMaskedCheck, aadhaarIdNumberInput.trim());
                          alert('आधार माहिती यशस्वीरित्या सेव्ह झाली!');
                          setDirectAadhaarFrontUrl('');
                          setDirectAadhaarBackUrl('');
                        }}
                        className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5 transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>आधार माहिती अपडेट करा</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: CANDIDATE PHOTO GALLERY MANAGEMENT */}
                <div className="p-4 sm:p-5 bg-white rounded-3xl border border-amber-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200 pb-2">
                    <div>
                      <h4 className="text-sm font-black text-[#A71930] flex items-center gap-2">
                        <Camera className="w-4.5 h-4.5 text-[#A71930]" />
                        <span>४. प्रोफाईल फोटो व्यवस्थापन (Candidate Photos Management)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        सदस्याचे अपलोड केलेले फोटो तपासा, नको असलेले डिलीट करा किंवा नवीन फोटो जोडा.
                      </p>
                    </div>

                    {profile.photos.length < 5 && (
                      <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition shadow-xs">
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
                      <div key={idx} className="relative group border-2 border-slate-200 rounded-2xl overflow-hidden aspect-square bg-slate-50 shadow-xs">
                        <img
                          src={img}
                          alt={`thumb ${idx}`}
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
                                alert('फोटो यशस्वीरित्या डिलीट झाला!');
                              }
                            }}
                            className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer hover:scale-110 transition-transform"
                            title="हा फोटो डिलीट करा"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-slate-900/80 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                          {idx === 0 ? 'मुख्य फोटो' : `फोटो ${idx + 1}`}
                        </div>
                      </div>
                    ))}

                    {profile.photos.length === 0 && (
                      <div className="col-span-full p-4 bg-amber-50 rounded-xl border border-dashed border-amber-300 text-center text-xs text-amber-900 font-bold">
                        कोणताही फोटो जोडलेला नाही.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 5: QUICK ACTIONS & DANGER ZONE */}
                <div className="p-4 sm:p-5 bg-rose-50/70 rounded-3xl border border-rose-300 shadow-sm space-y-3">
                  <div className="border-b border-rose-200 pb-2">
                    <h4 className="text-sm font-black text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
                      <span>५. सिस्टीम कृती व धोकादायक नियंत्रण (System Actions & Danger Zone)</span>
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsPrintModalOpen(true)}
                        className="px-4 py-2 bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-[#A71930]" />
                        <span>बायोडाटा प्रिंट करा</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareWhatsApp}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>WhatsApp शेअर</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`तुम्हाला खरोखर "${profile.fullName}" यांचा संपूर्ण बायोडाटा रिसायकल बिन मध्ये पाठवून डिलीट करायचा आहे का?`)) {
                          softDeleteProfile(profile.id);
                          alert('बायोडाटा यशस्वीरित्या डिलीट करून रिसायकल बिन मध्ये पाठवला गेला आहे!');
                          onClose();
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>🚨 संपूर्ण बायोडाटा डिलीट करा</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* IF NOT IN 'ADMIN_CONTROLS' (OR FOR GENERAL USERS), SHOW THE CLEAN BIODATA VIEW */}
            {(!isUserAdmin || adminViewMode === 'biodata') && (
              <div className="space-y-6 animate-fadeIn">
                {/* Admin Quick Sticky Pill for fast context */}
                {isUserAdmin && (
                  <div className="p-3 bg-gradient-to-r from-amber-100 via-white to-amber-100 rounded-2xl border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-black text-[#A71930] flex items-center gap-1">
                        <Crown className="w-4 h-4 text-[#A71930]" />
                        <span>प्रशासकीय दृश्य:</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[10px] border ${profile.isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                        {profile.isApproved ? '✅ मंजूर' : '⏳ प्रलंबित'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[10px] border ${profile.aadhaarVerified ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                        {profile.aadhaarVerified ? '🌟 आधार Verified' : 'आधार नाही'}
                      </span>
                      {profile.isBlocked && (
                        <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-rose-100 text-rose-800 border border-rose-300">
                          🚫 ब्लॉकड
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminViewMode('admin_controls')}
                      className="px-3.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition shrink-0"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-300" />
                      <span>ॲडमिन नियंत्रणे बदला →</span>
                    </button>
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
                        const isGuest = !currentUser || currentUser?.id?.startsWith('guest') || currentUser?.isGuest;
                        const isPhotoBlurred = isAuthorized ? false : (
                          isGuest ||
                          (profile.privacy?.hidePhoto && !isOverride) ||
                          siteConfig?.blurPhotosForFreeUsers === true ||
                          siteConfig?.blurProfilePhotos === true ||
                          (!currentUser && siteConfig?.allowPublicVisitorsToViewPhotos === false)
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
                          <span className="text-[10px] font-black text-slate-600">प्रोफाईल विशेष टॅग्ज:</span>
                          {badges.map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black border shadow-2xs ${getTagStyleClass(tag)}`}
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
                      <span className="font-bold text-slate-900">{profile.fatherName || 'माहिती दिलेली नाही'} ({profile.fatherOccupation || 'माहिती उपलब्ध नाही'})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block font-medium">आईचे नाव व व्यवसाय</span>
                      <span className="font-bold text-slate-900">{profile.motherName || 'माहिती दिलेली नाही'} ({profile.motherOccupation || 'माहिती उपलब्ध नाही'})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block font-medium">भाऊ व बहीण तपशील</span>
                      <span className="font-bold text-slate-900">
                        {profile.brothers || 0} भाऊ, {profile.sisters || 0} बहीण
                        {profile.brotherDetails && ` (${profile.brotherDetails})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs block font-medium">कुटुंब पद्धत</span>
                      <span className="font-bold text-[#A71930]">{profile.familyType || 'एकत्र / विभक्त'}</span>
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
                          <span className="text-slate-500 font-medium text-xs">माहिती दिलेली नाही</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200">
                      <div>
                        <span className="text-slate-500 text-[11px] block">मामांचे नाव</span>
                        <span className="font-bold text-slate-800 text-xs">{profile.mamaName || 'माहिती दिलेली नाही'}</span>
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

              {activeTab === 'horoscope' && (() => {
                const isCandidateBride = profile.gender === 'bride';
                const groomData = isCandidateBride ? (currentUser || {}) : profile;
                const brideData = isCandidateBride ? profile : (currentUser || {});

                const ashtakootMatch = calculateAshtakootMilan(
                  {
                    rashi: groomData.rashi || 'मकर (Capricorn)',
                    nakshatra: groomData.nakshatra || 'श्रवण (Shravana)',
                    gan: groomData.gan || 'देव गण',
                    nadi: groomData.nadi || 'अंत्य नाडी',
                    isManglik: groomData.horoscopeManglik,
                  },
                  {
                    rashi: brideData.rashi || 'वृषभ (Taurus)',
                    nakshatra: brideData.nakshatra || 'रोहिणी (Rohini)',
                    gan: brideData.gan || 'मनुष्य गण',
                    nadi: brideData.nadi || 'मध्य नाडी',
                    isManglik: brideData.horoscopeManglik,
                  }
                );

                return (
                  <div className="space-y-5">
                    {/* Top Horoscope Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs">
                      <div>
                        <span className="text-slate-500 block font-medium">राशी (Rashi)</span>
                        <span className="font-extrabold text-slate-900 text-sm">{profile.rashi || 'मकर'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">नक्षत्र (Nakshatra)</span>
                        <span className="font-extrabold text-slate-900 text-sm">{profile.nakshatra || 'श्रवण'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">गण (Gan)</span>
                        <span className="font-extrabold text-[#800C1E] text-sm">{profile.gan || 'देव गण'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">नाडी (Nadi)</span>
                        <span className="font-extrabold text-[#800C1E] text-sm">{profile.nadi || 'अंत्य नाडी'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">मंगळ पत्रिका</span>
                        <span className="font-bold text-slate-800">
                          {profile.horoscopeManglik === 'manglik' ? '⚠️ मांगलिक' : 'निर्दोष (Non-Manglik)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">गोत्र (Gotra)</span>
                        <span className="font-bold text-slate-800">{profile.gotra || 'काश्यप'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">चरण (Charan)</span>
                        <span className="font-bold text-slate-800">{profile.charan || '२'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">देवस्थान / कुलदैवत</span>
                        <span className="font-bold text-slate-800">{profile.kuldaivat || 'खंडोबा (जेजुरी)'}</span>
                      </div>
                    </div>

                    {/* Important Astrological Disclaimer / महत्त्वाची सूचना */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-[#800C1E]">
                            ⚠️ महत्त्वाची सूचना (Astrological Disclaimer):
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
                            हे गुणमेलन संगणकीय व सामान्य वैदिक ज्योतिषीय नियमांवर (अष्टकूट पद्धती) आधारित आहे. हे अंतिम किंवा १००% अचूक असेलच असे नाही. विवाह निश्चित करण्यापूर्वी कुंडलीतील प्रत्यक्ष ग्रहांची स्थिती, महादशा-अंतर्दशा, गुरु-शुक्र बल, पापकर्तरी योग आणि प्रत्यक्ष मंगळ/नाडी दोष निवारणासाठी <strong>आपल्या कुलज्योतिषी किंवा अनुभवी ज्योतिषांचा प्रत्यक्ष सल्ला अवश्य घ्यावा.</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Live 36 Guna Ashtakoot Milan Summary Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-[#800C1E] to-slate-950 rounded-2xl p-5 text-white shadow-lg border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>वैदिक अष्टकूट गुणमेलन</span>
                        </div>
                        <h4 className="text-lg font-black text-amber-100">{ashtakootMatch.compatibilityVerdict}</h4>
                        <p className="text-xs text-slate-200 mt-1 max-w-md font-medium">
                          {ashtakootMatch.recommendationMr}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-amber-300/40 text-center min-w-[130px]">
                        <span className="text-[10px] font-bold text-amber-200 uppercase">एकूण गुण</span>
                        <div className="text-3xl font-black text-amber-300 font-mono">
                          {ashtakootMatch.totalScore}
                          <span className="text-sm text-white/70">/३६</span>
                        </div>
                        <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                          {ashtakootMatch.percentage}% जुळवणी
                        </span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsKundaliModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#800C1E] hover:bg-[#A71930] text-white text-xs font-black inline-flex items-center gap-2 shadow-md cursor-pointer transition"
                      >
                        <Scroll className="w-4 h-4 text-amber-300" />
                        <span>📜 सविस्तर ३६ गुण पत्रिका विश्लेषण पहा (Open Calculator)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => alert('कुंडली / पत्रिका PDF डाउनलोड सुरू झाली आहे.')}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 border border-slate-300 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                        <span>पत्रिका PDF डाऊनलोड</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

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
              {currentUser?.id !== profile.id && !isUserAdmin && (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-black flex items-center gap-1.5 border border-rose-300 transition"
                  title="ॲडमिनकडे या प्रोफाईलबाबत तक्रार नोंदवा"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>तक्रार नोंदवा</span>
                </button>
              )}
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

      {/* 36 Guna Kundali Milan Modal */}
      {isKundaliModalOpen && (
        <KundaliMilanModal
          isOpen={isKundaliModalOpen}
          onClose={() => setIsKundaliModalOpen(false)}
          candidateProfile={profile}
        />
      )}

      {/* Aadhaar Document Lightbox Preview Modal */}
      {previewAadhaarModalUrl && (
        <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn select-none">
          <div className="w-full max-w-4xl flex items-center justify-between text-white border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-amber-400 text-sm sm:text-base">
                🪪 आधार कार्ड दस्तऐवज: {profile.fullName}
              </h3>
              <p className="text-[11px] text-slate-400">
                {profile.idVerificationNumber ? `ओळख क्रमांक: ${profile.idVerificationNumber}` : 'शासकीय ओळख दस्तऐवज'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={previewAadhaarModalUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow"
              >
                <Download className="w-4 h-4" />
                <span>डाउनलोड</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewAadhaarModalUrl(null)}
                className="p-2 rounded-full bg-slate-800 hover:bg-rose-600 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4 overflow-hidden">
            <img
              src={previewAadhaarModalUrl}
              alt="Aadhaar Preview"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border-2 border-amber-400/40 bg-white"
            />
          </div>

          <div className="text-center text-xs text-amber-200/80">
            टीप: हा दस्तऐवज केवळ प्रशासकीय पडताळणी हेतूने सुरक्षित ठेवण्यात आला आहे.
          </div>
        </div>
      )}
    </>
  );
};
