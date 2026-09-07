import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { PrintBiodataModal } from './PrintBiodataModal';
import { ReportProfileModal } from './ReportProfileModal';
import { VerifiedBadge } from './VerifiedBadge';
import { TruecallerVerificationModal } from './TruecallerVerificationModal';
import { InstagramPhotoCarousel } from './InstagramPhotoCarousel';
import { KundaliMilanModal } from './KundaliMilanModal';
import { ErrorBoundary } from './ErrorBoundary';
import { SecurityWatermarkOverlay } from './SecurityWatermarkOverlay';
import { calculateAshtakootMilan } from '../utils/kundaliCalculator';
import { getProfessionBadges, getTagStyleClass, getStructuredProfessionInfo } from '../utils/professionUtils';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import { transliterateMarathiToEnglish } from '../utils/transliterate';
import { uploadToCloudinary, compressAndResizeImage } from '../utils/cloudinary';
import { getPhotoAccessStatus } from '../utils/photoAccess';
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
  Ruler,
  Briefcase,
  Clock,
  IndianRupee,
  Home,
  ChevronDown,
  ChevronUp,
  Send,
  Layers,
  LayoutList,
  Building2,
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
    isProfilePlanExpired,
    setIsLoginOpen,
    setLoginModalMode,
    setIsPaymentOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'horoscope' | 'expectations'>('personal');
  const [viewMode, setViewMode] = useState<'tabs' | 'accordion'>('tabs');
  const [expandedAccordions, setExpandedAccordions] = useState<{ [key: string]: boolean }>({
    personal: true,
    family: true,
    horoscope: true,
    expectations: true,
  });

  const toggleAccordion = (key: string) => {
    setExpandedAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };
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
      const comp = await compressAndResizeImage(file, 2000, 0.94);
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
  const [isTruecallerModalOpen, setIsTruecallerModalOpen] = useState(false);

  const handleAdminUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploadingNewPhoto(true);
    try {
      const comp = await compressAndResizeImage(file, 2400, 0.95);
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
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  // Check if current viewer is paid or if festive free mode is ON or authorized/admin
  const isViewerPaidOrFestive = Boolean(
    isAdminLoggedIn ||
    isAuthorized ||
    siteConfig?.isFestiveFreeModeEnabled ||
    (currentUser && ((currentUser.membership && currentUser.membership !== 'free') || currentUser.isCustomAccessGranted))
  );

  const formatFatherName = (name?: string) => {
    if (!name || name === 'माहिती दिलेली नाही') return 'माहिती दिलेली नाही';
    if (isViewerPaidOrFestive) return name;
    if (siteConfig?.hideFatherNameForFreeUsers || siteConfig?.hideMiddleNameForFreeUsers) {
      return '**** (🔒 नाव पाहण्यासाठी सबस्क्रिप्शन घ्या)';
    }
    return name;
  };

  const formatAddressDetail = (addressText?: string, fallbackDistrict?: string) => {
    if (!addressText && !fallbackDistrict) return 'माहिती उपलब्ध नाही';
    if (isViewerPaidOrFestive) return addressText || fallbackDistrict || '';
    if (siteConfig?.hideAddressForFreeUsers) {
      return `${fallbackDistrict || 'महाराष्ट्र'} (🔒 सविस्तर पत्ता लॉक आहे)`;
    }
    return addressText || fallbackDistrict || '';
  };
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

  // Strict Photo Access Verification (Paid members only)
  const photoAccess = getPhotoAccessStatus({
    currentUser,
    targetProfile: profile,
    isProfilePlanExpired,
    isMutualMatch: Boolean(isMutualMatch),
    siteConfig,
  });
  const isPhotoBlurred = photoAccess.isBlurred;

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
                {formatProfileDisplayName(profile.fullName, currentUser, isAdminLoggedIn, isAuthorized || isMutualMatch, siteConfig, language, isMutualMatch, profile.id)}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 border border-emerald-400/40 shadow-xs cursor-pointer"
                title="WhatsApp वर शेअर करा"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">शेअर</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-200/20 hover:bg-amber-200/30 text-amber-100 text-[11px] font-extrabold flex items-center gap-1 border border-amber-300/40 shadow-xs cursor-pointer"
                title="बायोडाटा प्रिंट करा"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">प्रिंट</span>
              </button>
              {currentUser?.id !== profile.id && !isUserAdmin && (
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-[11px] font-extrabold flex items-center gap-1 border border-rose-400/40 transition-all cursor-pointer"
                  title="तक्रार नोंदवा"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span className="hidden sm:inline">तक्रार</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
                title="बंद करा"
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
                    <span>🎉 म्युचुअल मॅच! (Mutual Like Match) - पूर्ण नाव व नंबर अनलॉक</span>
                  </h4>
                  <p className="text-xs text-emerald-100 font-bold">
                    तुम्ही व {profile.fullName} यांनी एकमेकांना 'लाईक' केल्यामुळे दोघांचे पूर्ण नाव आणि डायरेक्ट मोबाईल नंबर अनलॉक झाले आहेत!
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

                    {/* 2. Phone / Truecaller Verified Badge */}
                    <div className="p-3.5 bg-blue-50/60 hover:bg-blue-50 rounded-2xl border border-blue-200 transition-colors flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">📱 Truecaller / मोबाईल बॅज</span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${profile.isPhoneVerified || profile.truecallerVerified ? 'bg-blue-600' : 'bg-slate-400'}`} />
                          <span className={`text-xs font-black ${profile.isPhoneVerified || profile.truecallerVerified ? 'text-blue-900' : 'text-slate-600'}`}>
                            {profile.isPhoneVerified || profile.truecallerVerified ? (profile.phoneVerificationMethod === 'truecaller' ? 'Truecaller प्रमाणित' : 'मोबाईल प्रमाणित') : 'प्रलंबित'}
                          </span>
                        </div>
                        {profile.truecallerName && (
                          <p className="text-[10px] text-blue-800 font-bold truncate mt-0.5" title={profile.truecallerName}>
                            नाव: {profile.truecallerName}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = !(profile.isPhoneVerified || profile.truecallerVerified);
                          updateProfileDirect(profile.id, {
                            isPhoneVerified: newStatus,
                            truecallerVerified: newStatus,
                            phoneVerifiedAt: newStatus ? new Date().toISOString() : undefined,
                            phoneVerificationMethod: newStatus ? (profile.phoneVerificationMethod || 'admin') : undefined
                          });
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          profile.isPhoneVerified || profile.truecallerVerified
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {profile.isPhoneVerified || profile.truecallerVerified ? '❌ नंबर बॅज काढा' : '📱 नंबर प्रमाणित करा'}
                      </button>
                    </div>

                    {/* 3. Aadhaar Verified Badge */}
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

            {/* Statutory Legal Caution Banner for Candidate Due Diligence */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-xs flex items-start gap-3">
              <div className="p-2 bg-amber-400 text-amber-950 rounded-xl font-black text-lg shrink-0 mt-0.5">
                🛡️
              </div>
              <div className="text-xs text-slate-800 space-y-0.5 leading-relaxed font-medium">
                <span className="font-black text-[#800C1E] block">
                  पालकांसाठी महत्त्वाची कायदेशीर सूचना व ताकीद (Mandatory Due Diligence Notice):
                </span>
                <span>
                  'वंजारी जोडी' हे केवळ वधू-वर व त्यांच्या कुटुंबांना जोडणारे डिजिटल मध्यस्थ (Intermediary - Section 79 IT Act) व्यासपीठ आहे. कोणताही विवाह निश्चित करण्यापूर्वी किंवा कोणताही आर्थिक व्यवहार करण्यापूर्वी दोन्ही बाजूंनी वधू-वराच्या चारित्र्याची, नोकरी/व्यवसायाची, कौटुंबिक पार्श्वभूमीची व कागदपत्रांची <strong>प्रत्यक्ष सखोल खात्री (Personal & Family Due Diligence)</strong> करणे अनिवार्य आहे. मंचाची कोणतीही कायदेशीर वा आर्थिक जबाबदारी असणार नाही.
                </span>
              </div>
            </div>
            {currentUser && currentUser.isApproved === false && !currentUser.isAdmin && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-amber-500/15 border-2 border-amber-400 shadow-sm flex items-start gap-3.5 mb-2">
                <div className="p-2.5 bg-amber-400 text-amber-950 rounded-2xl text-xl font-black shrink-0 shadow-xs">
                  ⏳
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#A71930] flex items-center gap-2">
                    <span>आपले प्रोफाईल ॲडमिन मंजुरीसाठी प्रलंबित आहे (Pending Admin Verification)</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded text-[10px] font-black">
                      लॉगिन सक्रिय
                    </span>
                  </h4>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">
                    आपले लॉगिन सक्रिय आहे! ॲडमिनने आपले प्रोफाईल मंजूर करेपर्यंत आपल्याला इतर सदस्यांचा <strong>जिल्हा, शिक्षण व सरकारी नोकरी/व्यवसाय</strong> दिसेल. ॲडमिन मंजुरी मिळताच <strong>सर्व फोटो, नावे, बायोडाटा व मोबाईल नंबर</strong> आपोआप सक्रिय होतील.
                  </p>
                </div>
              </div>
            )}

            {/* Top Banner with Main Image & Quick Badges */}
            <div className="grid md:grid-cols-12 gap-5 sm:gap-6 bg-white p-4 sm:p-5 rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              
              {/* Photos Column with Instagram Carousel */}
              <div className="md:col-span-5 space-y-2.5">
                <div className="rounded-[16px] overflow-hidden border border-amber-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] bg-amber-50">
                  <InstagramPhotoCarousel
                    photos={profile.photos && profile.photos.length > 0 ? profile.photos : (profile.photoUrl ? [profile.photoUrl] : [])}
                    defaultGender={profile.gender}
                    fullName={profile.fullName}
                    isBlurred={isPhotoBlurred}
                    blurClass="blur-xl scale-110"
                    lockMessage={photoAccess.message}
                    onLockClick={() => {
                      if (!currentUser || currentUser.isGuest) {
                        setLoginModalMode('member_otp');
                        setIsLoginOpen(true);
                      } else {
                        setIsPaymentOpen(true);
                      }
                    }}
                    aspectRatioClass="h-64 sm:h-76"
                    onPhotoClick={() => {
                      if (isPhotoBlurred) {
                        if (!currentUser || currentUser.isGuest) {
                          setLoginModalMode('member_otp');
                          setIsLoginOpen(true);
                        } else {
                          setIsPaymentOpen(true);
                        }
                      } else {
                        setIsLightboxOpen(true);
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
                  <span className="flex items-center gap-1 text-[#A71930] font-bold">
                    <Camera className="w-3.5 h-3.5 text-[#A71930]" />
                    <span>एकूण फोटो: {profile.photos?.length || 1}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isPhotoBlurred) {
                        if (!currentUser || currentUser.isGuest) {
                          setLoginModalMode('member_otp');
                          setIsLoginOpen(true);
                        } else {
                          setIsPaymentOpen(true);
                        }
                      } else {
                        setIsLightboxOpen(true);
                      }
                    }}
                    className="text-[#A71930] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>मोठं करून पहा</span>
                  </button>
                </div>
              </div>

              {/* Main Info Column */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-100/80 text-[#800C1E] font-bold border border-amber-300/80">
                      वंजारी समाज {profile.subCaste ? `(${profile.subCaste})` : ''}
                    </span>
                    <button
                      onClick={() => toggleShortlist(profile.id)}
                      className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-slate-600 border border-amber-200 transition cursor-pointer"
                      title="शॉर्टलिस्ट करा"
                    >
                      <Heart
                        className={`w-5 h-5 ${isShortlisted ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                    </button>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-[#A71930] mt-2 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{formatProfileDisplayName(profile.fullName, currentUser, isAdminLoggedIn, isAuthorized || isMutualMatch, siteConfig, language, isMutualMatch, profile.id)}</span>
                      <VerifiedBadge profile={profile} size="md" />
                      {siteConfig.requireMutualLikeForFullName !== false && !isMutualMatch && !isAuthorized && !isAdminLoggedIn && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <span>🔒</span>
                          <span>दोघांनी लाईक केल्यावर पूर्ण नाव दिसेल</span>
                        </span>
                      )}
                    </div>
                  </h1>

                  {/* High Contrast District & Qualification Highlight Box */}
                  <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 p-3 sm:p-3.5 rounded-[16px] border border-amber-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#800C1E]">
                      <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-amber-300/80 text-[#333333] shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
                        <span>जिल्हा: <strong className="text-[#A71930] font-black">{profile.district || 'महाराष्ट्र'}</strong> {profile.city || profile.taluka ? `(${profile.city || profile.taluka})` : ''}</span>
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300/80 text-[#333333] font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{profile.age} वर्षे</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#333333] bg-white p-2 rounded-lg border border-amber-300/80 shadow-2xs">
                      <GraduationCap className="w-4 h-4 text-[#A71930] shrink-0" />
                      <span>शिक्षण/पात्रता: <strong className="text-[#800C1E] font-black">{profile.education || 'उच्चशिक्षित'}</strong></span>
                    </div>

                    {/* Profession & Govt Job Tags - Stacked & Visually Attractive */}
                    {(() => {
                      const structured = getStructuredProfessionInfo(profile);
                      if (structured.allBadges.length === 0) return null;
                      return (
                        <div className="p-2.5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 rounded-xl border border-amber-200/90 shadow-2xs space-y-1.5 mt-1">
                          <div className="flex items-center justify-between text-[11px] font-black text-slate-700">
                            <span className="flex items-center gap-1 text-[#800C1E]">
                              <Briefcase className="w-3.5 h-3.5 text-[#A71930]" />
                              <span>नोकरी व प्रोफेशन हायलाईट्स:</span>
                            </span>
                          </div>
                          
                          {/* Stacked Tags: Sector first, Role second, Highlights third */}
                          <div className="flex flex-col gap-1.5">
                            {/* Line 1: Primary Employment Sector (e.g., Govt Job, Private Job, Business) */}
                            {structured.sectorBadges.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {structured.sectorBadges.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-lg text-xs font-black border shadow-xs flex items-center gap-1 ${getTagStyleClass(tag)}`}
                                  >
                                    <span>{tag}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Line 2: Specific Designation/Profession (e.g., Doctor, Engineer, Officer) */}
                            {structured.roleBadges.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {structured.roleBadges.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-lg text-xs font-black border shadow-xs flex items-center gap-1 ${getTagStyleClass(tag)}`}
                                  >
                                    <span>{tag}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Line 3: Other Highlight Badges */}
                            {structured.otherBadges.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                {structured.otherBadges.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border shadow-2xs ${getTagStyleClass(tag)}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {profile.bio && (
                    <p className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-[12px] border border-amber-200/80 mt-2.5 italic leading-relaxed">
                      "{profile.bio}"
                    </p>
                  )}
                </div>

                {/* Compact Grid Summary with Vector Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50/80 p-3 sm:p-3.5 rounded-[16px] border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A71930] shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium">वय</span>
                      <span className="font-semibold text-[#333333]">{profile.age} वर्षे</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#A71930] shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium">उंची</span>
                      <span className="font-semibold text-[#333333]">{profile.height}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#A71930] shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium">स्थान</span>
                      <span className="font-semibold text-[#333333] truncate block">{profile.city || profile.district}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#A71930] shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium">शिक्षण</span>
                      <span className="font-semibold text-[#333333] truncate block">{profile.education}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#A71930] shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium">व्यवसाय</span>
                      <span className="font-semibold text-[#333333] truncate block">{profile.occupation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#A71930] shrink-0" />
                    <div>
                      <span className="text-slate-500 text-[11px] block font-medium">वैवाहिक स्थिती</span>
                      <span className="font-semibold text-[#A71930] truncate block">
                        {profile.maritalStatus === 'never_married' ? 'अविवाहित' : profile.maritalStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aadhaar & Phone Verification badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  {profile.aadhaarVerified ? (
                    <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>आधार कार्ड व्हेरिफाइड</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>ओळखपत्र पडताळणी सुरू आहे</span>
                    </span>
                  )}

                  {(profile.isPhoneVerified || profile.truecallerVerified) && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{profile.phoneVerificationMethod === 'truecaller' ? 'Truecaller व्हेरिफाइड' : 'मोबाईल नंबर व्हेरिफाइड'}</span>
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* View Mode Toggle (Tabs vs Accordion) & Section Controls */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <LayoutList className="w-4 h-4 text-[#A71930]" />
                <span>बायोडाटा सविस्तर माहिती:</span>
              </div>
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('tabs')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'tabs'
                      ? 'bg-white text-[#A71930] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>टॅब व्ह्यू (Tabs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('accordion')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'accordion'
                      ? 'bg-white text-[#A71930] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>एकत्रित व्ह्यू (Accordions)</span>
                </button>
              </div>
            </div>

            {/* TAB-BASED VIEW MODE */}
            {viewMode === 'tabs' && (
              <div className="space-y-4">
                {/* 4 Clean Tabs: Personal Info | Family Details | Horoscope | Partner Preferences */}
                <div className="flex border-b border-slate-200 overflow-x-auto text-xs sm:text-sm font-bold gap-2 pb-1 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className={`px-4 py-2.5 rounded-[12px] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'personal'
                        ? 'bg-[#A71930] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>वैयक्तिक माहिती (Personal Info)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('family')}
                    className={`px-4 py-2.5 rounded-[12px] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'family'
                        ? 'bg-[#A71930] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>कौटुंबिक माहिती (Family Details)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('horoscope')}
                    className={`px-4 py-2.5 rounded-[12px] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'horoscope'
                        ? 'bg-[#A71930] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <Scroll className="w-4 h-4" />
                    <span>पत्रिका व राशी (Horoscope)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('expectations')}
                    className={`px-4 py-2.5 rounded-[12px] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'expectations'
                        ? 'bg-[#A71930] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>जोडीदार अपेक्षा (Partner Preferences)</span>
                  </button>
                </div>

                {/* Tab Content Box - 16px radius, subtle shadow, 14px label, 15px dark charcoal value */}
                <div className="bg-white p-5 sm:p-6 rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                  {/* 1. PERSONAL INFO TAB */}
                  {activeTab === 'personal' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#A71930]" />
                            <span>जन्म तारीख व वय</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.dob} ({profile.age} वर्षे)
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#A71930]" />
                            <span>जन्म वेळ व जन्म स्थान</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.birthTime || 'सकाळी १०:३० AM'} {profile.birthPlace ? `(${profile.birthPlace})` : `(${profile.district})`}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Ruler className="w-4 h-4 text-[#A71930]" />
                            <span>उंची व वजन</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.height} {profile.weight ? `| ${profile.weight}` : '| ५५ किलो'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#A71930]" />
                            <span>वर्ण व रक्तगट</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.complexion || 'गोरा'} | {profile.bloodGroup || 'O+'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#A71930]" />
                            <span>उपजात (Sub-caste)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#A71930] mt-1 block">
                            {profile.subCaste || 'वंजारी'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Scroll className="w-4 h-4 text-[#A71930]" />
                            <span>गोत्र व राशी</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.gotra || 'काश्यप'} | {profile.rashi || 'मकर'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-[#A71930]" />
                            <span>शिक्षण (Education)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.education}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-[#A71930]" />
                            <span>नोकरी / व्यवसाय (Profession)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#A71930] mt-1 block">
                            {profile.occupation}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-[#A71930]" />
                            <span>वार्षिक उत्पन्न (Annual Income)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-emerald-800 mt-1 block">
                            {profile.income || 'उपलब्ध नाही'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-[#A71930]" />
                            <span>नोकरीचे शहर / ठिकाण</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.city || profile.district}, {profile.district}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Home className="w-4 h-4 text-[#A71930]" />
                            <span>मूळ गाव (Native Place)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {formatAddressDetail(profile.nativeAddress, profile.taluka ? `${profile.taluka}, ${profile.district}` : profile.district)}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#A71930]" />
                            <span>सध्याचा पत्ता (Current Address)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {formatAddressDetail(profile.currentAddress, profile.city ? `${profile.city}, ${profile.district}` : profile.district)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. FAMILY DETAILS TAB */}
                  {activeTab === 'family' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#A71930]" />
                            <span>वडिलांचे नाव व व्यवसाय</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {formatFatherName(profile.fatherName)} {profile.fatherOccupation && isViewerPaidOrFestive ? `(${profile.fatherOccupation})` : ''}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#A71930]" />
                            <span>आईचे नाव व व्यवसाय</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.motherName || 'माहिती दिलेली नाही'} {profile.motherOccupation ? `(${profile.motherOccupation})` : ''}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-[#A71930]" />
                            <span>भाऊ व बहीण तपशील</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.brothers || 0} भाऊ, {profile.sisters || 0} बहीण {profile.brotherDetails ? `(${profile.brotherDetails})` : ''}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Home className="w-4 h-4 text-[#A71930]" />
                            <span>कुटुंब पद्धत</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#A71930] mt-1 block">
                            {profile.familyType || 'एकत्र / विभक्त कुटुंब'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#A71930]" />
                            <span>मामांचे नाव</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.mamaName || 'माहिती दिलेली नाही'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#A71930]" />
                            <span>मामांचे गाव</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.mamaNative || profile.district}
                          </span>
                        </div>
                      </div>

                      {/* Relative Surnames */}
                      <div className="p-4 bg-amber-50/60 rounded-[12px] border border-amber-200/80 space-y-2">
                        <span className="text-[14px] text-[#800C1E] font-bold block">
                          नातेवाईक आडनावे (Relative Surnames):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {profile.relativeSurnames && profile.relativeSurnames.length > 0 ? (
                            profile.relativeSurnames.map((sur, idx) => (
                              <span key={idx} className="bg-white px-3 py-1 rounded-lg text-[#333333] border border-amber-200 font-semibold text-[14px] shadow-2xs">
                                {sur}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[14px]">माहिती दिलेली नाही</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. HOROSCOPE TAB */}
                  {activeTab === 'horoscope' && (() => {
                    const isCandidateBride = profile.gender === 'bride';
                    const groomData: Partial<UserProfile> = isCandidateBride ? (currentUser || {}) : profile;
                    const brideData: Partial<UserProfile> = isCandidateBride ? profile : (currentUser || {});

                    const ashtakootMatch = calculateAshtakootMilan(
                      {
                        rashi: groomData.rashi || 'मकर (Capricorn)',
                        nakshatra: groomData.nakshatra || 'श्रवण (Shravana)',
                        gan: groomData.gan || 'देव गण',
                        nadi: groomData.nadi || 'अंत्य नाडी',
                        isManglik: groomData.horoscopeManglik === 'manglik' ? 'manglik' : groomData.horoscopeManglik === 'partial' ? 'partial' : 'non_manglik',
                      },
                      {
                        rashi: brideData.rashi || 'वृषभ (Taurus)',
                        nakshatra: brideData.nakshatra || 'रोहिणी (Rohini)',
                        gan: brideData.gan || 'मनुष्य गण',
                        nadi: brideData.nadi || 'मध्य नाडी',
                        isManglik: brideData.horoscopeManglik === 'manglik' ? 'manglik' : brideData.horoscopeManglik === 'partial' ? 'partial' : 'non_manglik',
                      }
                    );

                    return (
                      <div className="space-y-4">
                        {/* Top Horoscope Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">राशी (Rashi)</span>
                            <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.rashi || 'मकर'}</span>
                          </div>
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">नक्षत्र (Nakshatra)</span>
                            <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.nakshatra || 'श्रवण'}</span>
                          </div>
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">गण (Gan)</span>
                            <span className="text-[15px] font-semibold text-[#800C1E] mt-1 block">{profile.gan || 'देव गण'}</span>
                          </div>
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">नाडी (Nadi)</span>
                            <span className="text-[15px] font-semibold text-[#800C1E] mt-1 block">{profile.nadi || 'अंत्य नाडी'}</span>
                          </div>
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">मंगळ पत्रिका</span>
                            <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                              {profile.horoscopeManglik === 'manglik' ? '⚠️ मांगलिक' : 'निर्दोष (Non-Manglik)'}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">गोत्र (Gotra)</span>
                            <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.gotra || 'काश्यप'}</span>
                          </div>
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">चरण (Charan)</span>
                            <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.charan || '२'}</span>
                          </div>
                          <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                            <span className="text-[14px] text-slate-500 font-medium">देवस्थान / कुलदैवत</span>
                            <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.kuldaivat || 'खंडोबा (जेजुरी)'}</span>
                          </div>
                        </div>

                        {/* 36 Guna Ashtakoot Match Card */}
                        <div className="bg-gradient-to-r from-slate-900 via-[#800C1E] to-slate-950 rounded-[16px] p-4 sm:p-5 text-white shadow-md border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-1">
                              <Sparkles className="w-3 h-3" />
                              <span>वैदिक अष्टकूट गुणमेलन</span>
                            </div>
                            <h4 className="text-lg font-black text-amber-100">{ashtakootMatch.compatibilityVerdict}</h4>
                            <p className="text-xs text-slate-200 mt-1 max-w-md font-medium">
                              {ashtakootMatch.recommendationMr}
                            </p>
                          </div>

                          <div className="bg-white/10 backdrop-blur-md rounded-[12px] p-3 border border-amber-300/40 text-center min-w-[130px]">
                            <span className="text-[11px] font-bold text-amber-200 uppercase">एकूण गुण</span>
                            <div className="text-3xl font-black text-amber-300 font-mono">
                              {ashtakootMatch.totalScore}
                              <span className="text-sm text-white/70">/३६</span>
                            </div>
                            <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                              {ashtakootMatch.percentage}% जुळवणी
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsKundaliModalOpen(true)}
                            className="px-4 py-2.5 rounded-[12px] bg-[#800C1E] hover:bg-[#A71930] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer transition"
                          >
                            <Scroll className="w-4 h-4 text-amber-300" />
                            <span>📜 सविस्तर ३६ गुण पत्रिका विश्लेषण (Open Calculator)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. PARTNER PREFERENCES TAB */}
                  {activeTab === 'expectations' && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[14px] text-slate-500 font-medium block mb-1">अपेक्षित जोडीदाराचे वर्णन व निकष:</span>
                        <div className="text-[15px] font-medium text-[#333333] leading-relaxed bg-amber-50/60 p-4 rounded-[12px] border border-amber-200/80">
                          {profile.expectations || 'सुशिक्षित, सुसंस्कृत आणि समविचारी जोडीदार अपेक्षित आहे.'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">अपेक्षित शिक्षण</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">पदवीधर किंवा समतुल्य</span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">अपेक्षित व्यवसाय</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">नोकरी / स्वतःचा व्यवसाय</span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">अपेक्षित जिल्हा</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.district || 'महाराष्ट्र'} व आसपास</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ACCORDION-BASED VIEW MODE */}
            {viewMode === 'accordion' && (
              <div className="space-y-3.5">
                {/* Accordion 1: Personal Info */}
                <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('personal')}
                    className="w-full p-4 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-sm sm:text-base border-b border-slate-200/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 text-[#A71930]">
                      <User className="w-4.5 h-4.5 text-[#A71930]" />
                      <span>१. वैयक्तिक माहिती (Personal Info)</span>
                    </div>
                    {expandedAccordions.personal ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  {expandedAccordions.personal && (
                    <div className="p-4 sm:p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#A71930]" />
                            <span>जन्म तारीख व वय</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.dob} ({profile.age} वर्षे)
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#A71930]" />
                            <span>जन्म वेळ व स्थान</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.birthTime || 'सकाळी १०:३० AM'} {profile.birthPlace ? `(${profile.birthPlace})` : `(${profile.district})`}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Ruler className="w-4 h-4 text-[#A71930]" />
                            <span>उंची व वजन</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.height} {profile.weight ? `| ${profile.weight}` : '| ५५ किलो'}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#A71930]" />
                            <span>वर्ण व रक्तगट</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.complexion || 'गोरा'} | {profile.bloodGroup || 'O+'}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-[#A71930]" />
                            <span>शिक्षण (Education)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.education}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-[#A71930]" />
                            <span>नोकरी / व्यवसाय</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#A71930] mt-1 block">
                            {profile.occupation}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-[#A71930]" />
                            <span>वार्षिक उत्पन्न</span>
                          </span>
                          <span className="text-[15px] font-semibold text-emerald-800 mt-1 block">
                            {profile.income || 'उपलब्ध नाही'}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <Home className="w-4 h-4 text-[#A71930]" />
                            <span>मूळ गाव (Native)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {formatAddressDetail(profile.nativeAddress, profile.taluka ? `${profile.taluka}, ${profile.district}` : profile.district)}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#A71930]" />
                            <span>सध्याचा पत्ता (Current)</span>
                          </span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {formatAddressDetail(profile.currentAddress, profile.city ? `${profile.city}, ${profile.district}` : profile.district)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Family Details */}
                <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('family')}
                    className="w-full p-4 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-sm sm:text-base border-b border-slate-200/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 text-[#A71930]">
                      <Users className="w-4.5 h-4.5 text-[#A71930]" />
                      <span>२. कौटुंबिक माहिती (Family Details)</span>
                    </div>
                    {expandedAccordions.family ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  {expandedAccordions.family && (
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">वडिलांचे नाव व व्यवसाय</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {formatFatherName(profile.fatherName)} {profile.fatherOccupation && isViewerPaidOrFestive ? `(${profile.fatherOccupation})` : ''}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">आईचे नाव व व्यवसाय</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.motherName || 'माहिती दिलेली नाही'} {profile.motherOccupation ? `(${profile.motherOccupation})` : ''}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">भाऊ व बहीण</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.brothers || 0} भाऊ, {profile.sisters || 0} बहीण
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">कुटुंब पद्धत</span>
                          <span className="text-[15px] font-semibold text-[#A71930] mt-1 block">
                            {profile.familyType || 'एकत्र / विभक्त कुटुंब'}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">मामांचे नाव</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.mamaName || 'माहिती दिलेली नाही'}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">मामांचे गाव</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">
                            {profile.mamaNative || profile.district}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-amber-50/60 rounded-[12px] border border-amber-200/80 space-y-1.5">
                        <span className="text-[14px] text-[#800C1E] font-bold block">
                          नातेवाईक आडनावे (Relative Surnames):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {profile.relativeSurnames && profile.relativeSurnames.length > 0 ? (
                            profile.relativeSurnames.map((sur, idx) => (
                              <span key={idx} className="bg-white px-3 py-1 rounded-lg text-[#333333] border border-amber-200 font-semibold text-[14px] shadow-2xs">
                                {sur}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[14px]">माहिती दिलेली नाही</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Horoscope */}
                <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('horoscope')}
                    className="w-full p-4 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-sm sm:text-base border-b border-slate-200/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 text-[#A71930]">
                      <Scroll className="w-4.5 h-4.5 text-[#A71930]" />
                      <span>३. पत्रिका व राशी (Horoscope)</span>
                    </div>
                    {expandedAccordions.horoscope ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  {expandedAccordions.horoscope && (
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">राशी (Rashi)</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.rashi || 'मकर'}</span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">नक्षत्र (Nakshatra)</span>
                          <span className="text-[15px] font-semibold text-[#333333] mt-1 block">{profile.nakshatra || 'श्रवण'}</span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">गण (Gan)</span>
                          <span className="text-[15px] font-semibold text-[#800C1E] mt-1 block">{profile.gan || 'देव गण'}</span>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-[12px] border border-slate-200/60">
                          <span className="text-[14px] text-slate-500 font-medium">नाडी (Nadi)</span>
                          <span className="text-[15px] font-semibold text-[#800C1E] mt-1 block">{profile.nadi || 'अंत्य नाडी'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsKundaliModalOpen(true)}
                          className="px-4 py-2 rounded-[12px] bg-[#800C1E] hover:bg-[#A71930] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Scroll className="w-4 h-4 text-amber-300" />
                          <span>📜 सविस्तर ३६ गुण पत्रिका विश्लेषण पहा</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 4: Partner Preferences */}
                <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('expectations')}
                    className="w-full p-4 bg-slate-50/90 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 text-sm sm:text-base border-b border-slate-200/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 text-[#A71930]">
                      <Heart className="w-4.5 h-4.5 text-[#A71930]" />
                      <span>४. जोडीदार अपेक्षा (Partner Preferences)</span>
                    </div>
                    {expandedAccordions.expectations ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  {expandedAccordions.expectations && (
                    <div className="p-4 sm:p-5 space-y-3">
                      <span className="text-[14px] text-slate-500 font-medium block">अपेक्षित जोडीदाराचे वर्णन व निकष:</span>
                      <div className="text-[15px] font-medium text-[#333333] leading-relaxed bg-amber-50/60 p-4 rounded-[12px] border border-amber-200/80">
                        {profile.expectations || 'सुशिक्षित, सुसंस्कृत आणि समविचारी जोडीदार अपेक्षित आहे.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

          {/* Modal Footer Actions */}
          <div className="p-3 sm:p-4 bg-amber-50/90 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-[#800C1E] text-xs font-bold flex items-center gap-1 border border-amber-300 shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#800C1E]" />
                <span>प्रिंट</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-300 shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>शेअर</span>
              </button>
              {currentUser?.id !== profile.id && !isUserAdmin && (
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1 border border-rose-200 transition cursor-pointer"
                  title="ॲडमिनकडे या प्रोफाईलबाबत तक्रार नोंदवा"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>तक्रार</span>
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {currentUser && currentUser.isApproved === false && !currentUser.isAdmin ? (
                <div className="p-3.5 bg-amber-100/90 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⏳</span>
                    <div>
                      <p className="text-xs font-black text-[#A71930]">
                        आपले प्रोफाईल ॲडमिन पडताळणीसाठी प्रलंबित आहे
                      </p>
                      <p className="text-[11px] text-slate-700 font-bold">
                        ॲडमिन मंजुरीनंतर थेट कॉल, व्हॉट्सॲप, चॅट व सर्व संपर्क पर्याय कार्यन्वित होतील.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-amber-200 text-amber-950 text-xs font-black rounded-xl border border-amber-300 whitespace-nowrap">
                    🔒 मंजुरीची प्रतीक्षा करा
                  </span>
                </div>
              ) : isAuthorized ? (
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
                  <a
                    href={`https://t.me/${profile.telegramUsername || siteConfig?.telegramUsername || 'Primemultiservice'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>टेलिग्राम संपर्क (@{profile.telegramUsername || siteConfig?.telegramUsername || 'Primemultiservice'})</span>
                  </a>
                  {isMutualMatch && (
                    <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black flex items-center gap-1">
                      💞 म्युचुअल लाईक (मॅच) + Truecaller मुळे मोबाईल नंबर अनलॉक!
                    </span>
                  )}
                </div>
              ) : isMutualMatch && !(currentUser?.isPhoneVerified || currentUser?.truecallerVerified) ? (
                /* जर म्युचुअल लाईक झाली असेल पण Truecaller पडताळणी बाकी असेल */
                <div className="p-3 bg-amber-100/90 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔒</span>
                    <div>
                      <p className="text-xs font-black text-[#A71930]">
                        💞 तुमचे एकमेकांना म्युचुअल लाईक (Match) झाले आहे!
                      </p>
                      <p className="text-[11px] text-slate-700 font-bold">
                        मोबाईल नंबर पाहण्यासाठी कृपया Truecaller पडताळणी पूर्ण करा किंवा टेलिग्राम सपोर्टशी संपर्क करा.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsTruecallerModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-black rounded-xl shadow border border-blue-400 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>⚡ Truecaller व्हेरिफाय करा</span>
                    </button>
                    <a
                      href={`https://t.me/${siteConfig?.telegramUsername || 'Primemultiservice'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>टेलिग्राम</span>
                    </a>
                  </div>
                </div>
              ) : pendingReq ? (
                <div className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-default">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>मान्यतेसाठी प्रलंबित (प्रशासकीय पडताळणी सुरु आहे)</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {/* Privacy notice banner replacing direct public phone display */}
                  <div className="bg-amber-50/95 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>गोपनीयता सुरक्षा: थेट नंबर सार्वजनिक उपलब्ध नाही. परस्पर पसंती किंवा टेलिग्राम सपोर्ट आयडी वापरा.</span>
                    </div>
                    <a
                      href={`https://t.me/${siteConfig?.telegramUsername || 'Primemultiservice'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-lg text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>टेलिग्राम सपोर्ट</span>
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Message when user hasn't mutual-liked or requires strict verification */}
                    {siteConfig?.requireMutualLikeAndVerificationToView && (
                      <div className="w-full text-xs font-extrabold text-[#A71930] bg-amber-50 p-2.5 rounded-xl border border-amber-300 flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>एकमेकांना लाईक केल्याच्या नंतर आणि ट्रू कॉलर व्हेरिफिकेशन झाले तरच नंबर अनलॉक होईल.</span>
                      </div>
                    )}

                    {/* Pay Per Contact Button - Hidden if isPayPerContactEnabled is false */}
                    {siteConfig?.isPayPerContactEnabled !== false && !siteConfig?.requireMutualLikeAndVerificationToView && (
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

                    {!siteConfig?.requireMutualLikeAndVerificationToView && (
                      <button
                        onClick={() => {
                          requestContactAuthorization(profile.id);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>मोफत विनंती करा</span>
                      </button>
                    )}
                  </div>
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

      {/* Fullscreen Photo Lightbox Modal with Security Watermark */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-fadeIn">
          {/* Lightbox Header */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white border-b border-slate-800 pb-3 z-50">
            <div>
              <h3 className="font-black text-amber-400 text-sm sm:text-base flex items-center gap-2">
                <span>{profile.fullName}</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-300/30">
                  ID: {profile.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                🔒 सुरक्षा प्रणाली सक्रिय • फोटो {selectedPhotoIndex + 1} पैकी {profile.photos.length || 1}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-lg border border-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Main Image with Watermark */}
          <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-2 overflow-hidden">
            <SecurityWatermarkOverlay className="w-full h-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl bg-black relative">
              <img
                src={profile.photos?.[selectedPhotoIndex] || profile.photos?.[0] || profile.photoUrl || (profile.gender === 'bride' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600')}
                alt="fullscreen profile photo"
                referrerPolicy="no-referrer"
                className={`max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl pointer-events-none ${
                  isPhotoBlurred ? 'filter blur-2xl scale-110 opacity-60' : ''
                }`}
              />
              {isPhotoBlurred && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-6 text-center z-30">
                  <div className="p-3 rounded-full bg-black/80 border border-amber-300 text-amber-300 shadow-xl">
                    <Lock className="w-8 h-8 text-amber-300" />
                  </div>
                  <p className="text-amber-200 font-bold text-sm max-w-sm drop-shadow">
                    {photoAccess.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLightboxOpen(false);
                      if (!currentUser || currentUser.isGuest) {
                        setLoginModalMode('member_otp');
                        setIsLoginOpen(true);
                      } else {
                        setIsPaymentOpen(true);
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-full shadow-lg border border-amber-300/60 cursor-pointer"
                  >
                    शुल्क भरा / सबस्क्रिप्शन प्लॅन निवडा
                  </button>
                </div>
              )}
            </SecurityWatermarkOverlay>
          </div>

          {/* Lightbox Navigation Controls */}
          {profile.photos.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 z-50 max-w-full">
              {profile.photos.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedPhotoIndex === idx ? 'border-amber-400 scale-110 shadow-lg' : 'border-slate-800 opacity-50'
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
        <ErrorBoundary fallbackTitle="कुंडली जुळवणी लोड करताना समस्या आली">
          <KundaliMilanModal
            isOpen={isKundaliModalOpen}
            onClose={() => setIsKundaliModalOpen(false)}
            candidateProfile={profile}
          />
        </ErrorBoundary>
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

      {/* Truecaller Verification Modal */}
      {isTruecallerModalOpen && (
        <TruecallerVerificationModal
          isOpen={isTruecallerModalOpen}
          onClose={() => setIsTruecallerModalOpen(false)}
        />
      )}
    </>
  );
};
