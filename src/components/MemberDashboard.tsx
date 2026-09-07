import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
import { SafeAvatar } from './SafeAvatar';
import { KundaliMilanModal } from './KundaliMilanModal';
import { ReferralShareModal } from './ReferralShareModal';
import { FaceVerificationModal } from './FaceVerificationModal';
import { AdminEditProfileModal } from './AdminEditProfileModal';
import { uploadToCloudinary } from '../utils/cloudinary';
import {
  User,
  Heart,
  Bell,
  Crown,
  ShieldCheck,
  Edit,
  Lock,
  LogOut,
  Sparkles,
  LogIn,
  UserPlus,
  Eye,
  FileText,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ScanFace,
  HeartHandshake,
  Award,
  Upload,
  Loader2,
  AlertCircle,
  UserCheck,
  Camera,
  Smartphone,
  Zap,
  Phone,
  PhoneCall,
  MessageCircle,
  Share2,
  Scroll,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { requestPushPermission, getPushPermissionState, triggerBrowserPushNotification } from '../utils/pushNotificationHelper';

export const MemberDashboard: React.FC = () => {
  const {
    t,
    language,
    currentUser,
    setCurrentUser,
    profiles,
    interests,
    respondInterest,
    shortlistedIds,
    setSelectedProfileForModal,
    setIsLoginOpen,
    setLoginModalMode,
    setIsRegisterOpen,
    setIsPaymentOpen,
    notifications,
    markNotificationRead,
    siteConfig,
    isFaceAuthModalOpen,
    setIsFaceAuthModalOpen,
    setIsPhoneAuthModalOpen,
    setIsProfileRemovalModalOpen,
    uploadAadhaarCard,
    updateProfileDirect,
    isCurrentUserPlanExpired,
    memberIdRequests,
    likedProfileIds,
    toggleLikeProfile,
    isContactAuthorizedForUser,
    unlockContact,
    checkGuestPermission,
    setSelectedPlanForPayment
  } = useApp();

  const [tab, setTab] = useState<'overview' | 'interests' | 'shortlist' | 'notifications' | 'membership' | 'privacy'>('overview');
  const [likesSubTab, setLikesSubTab] = useState<'mutual' | 'received' | 'sent'>('mutual');
  const [kundaliCandidate, setKundaliCandidate] = useState<UserProfile | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [docSuccessMsg, setDocSuccessMsg] = useState<string | null>(null);

  // Filter notifications specifically for this member (exclude admin and other users' notifications)
  const memberNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(
      (n) => n.userId !== 'admin' && (n.userId === 'all' || n.userId === currentUser.id)
    );
  }, [notifications, currentUser]);

  // Robust Like & Mutual Match Calculations (Always evaluated at top level before conditional returns)
  const myLikedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!currentUser) return ids;
    (likedProfileIds || []).forEach((id) => ids.add(id));
    (currentUser.shortlistedProfiles || []).forEach((id) => ids.add(id));
    interests.filter((i) => i.fromUserId === currentUser.id && i.status !== 'rejected').forEach((i) => ids.add(i.toUserId));
    return ids;
  }, [likedProfileIds, currentUser, interests]);

  const likedMeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!currentUser) return ids;
    (currentUser.likedByUsers || []).forEach((id) => ids.add(id));
    profiles.forEach((p) => {
      if (
        (p.likedProfileIds || []).includes(currentUser.id) ||
        (p.shortlistedByUsers || []).includes(currentUser.id)
      ) {
        ids.add(p.id);
      }
    });
    interests.filter((i) => i.toUserId === currentUser.id && i.status !== 'rejected').forEach((i) => ids.add(i.fromUserId));
    return ids;
  }, [currentUser, profiles, interests]);

  // 1. Mutual Matches: both users liked each other
  const mutualMatches = useMemo(() => {
    if (!currentUser) return [];
    return profiles.filter((p) => p.id !== currentUser.id && myLikedIds.has(p.id) && likedMeIds.has(p.id));
  }, [profiles, currentUser, myLikedIds, likedMeIds]);

  // 2. Received Likes: user liked me, but I haven't liked them back yet
  const receivedLikes = useMemo(() => {
    if (!currentUser) return [];
    return profiles.filter((p) => p.id !== currentUser.id && likedMeIds.has(p.id) && !myLikedIds.has(p.id));
  }, [profiles, currentUser, myLikedIds, likedMeIds]);

  // 3. Sent Likes: I liked user, but they haven't liked back yet
  const sentLikes = useMemo(() => {
    if (!currentUser) return [];
    return profiles.filter((p) => p.id !== currentUser.id && myLikedIds.has(p.id) && !likedMeIds.has(p.id));
  }, [profiles, currentUser, myLikedIds, likedMeIds]);

  const handleDashboardAadhaarFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocUploadError(null);
    setDocSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setDocUploadError(`कागदपत्राचा आकार ${(file.size / 1024).toFixed(0)} KB आहे. कृपया १.५ MB पेक्षा लहान फाईल निवडा.`);
      return;
    }

    setIsUploadingFront(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_documents');
    if (res.success && res.url) {
      uploadAadhaarCard(currentUser.id, res.url, currentUser.aadhaarBackUrl, currentUser.isAadhaarMasked !== false);
      setDocSuccessMsg('आधार पुढील बाजू (Front Photo) यशस्वीरीत्या जतन झाली!');
    } else {
      setDocUploadError(res.error || 'पुढील बाजू अपलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    }
    setIsUploadingFront(false);
  };

  const handleDashboardAadhaarBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocUploadError(null);
    setDocSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setDocUploadError(`कागदपत्राचा आकार ${(file.size / 1024).toFixed(0)} KB आहे. कृपया १.५ MB पेक्षा लहान फाईल निवडा.`);
      return;
    }

    setIsUploadingBack(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_documents');
    if (res.success && res.url) {
      uploadAadhaarCard(currentUser.id, currentUser.aadhaarFrontUrl || currentUser.aadhaarCardUrl || '', res.url, currentUser.isAadhaarMasked !== false);
      setDocSuccessMsg('आधार मागील बाजू (Back Photo) यशस्वीरीत्या जतन झाली!');
    } else {
      setDocUploadError(res.error || 'मागील बाजू अपलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    }
    setIsUploadingBack(false);
  };

  const handleDashboardAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocUploadError(null);
    setDocSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setDocUploadError(`कागदपत्राचा आकार ${(file.size / 1024).toFixed(0)} KB आहे. कृपया १.५ MB पेक्षा लहान फाईल निवडा.`);
      return;
    }

    setIsUploadingDoc(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_documents');
    if (res.success && res.url) {
      uploadAadhaarCard(currentUser.id, res.url, currentUser.aadhaarBackUrl, currentUser.isAadhaarMasked !== false);
      setDocSuccessMsg('तुमचे आधार / ओळखपत्र ऑनलाईन क्लाऊडवर यशस्वीपणे जतन झाले आहे!');
    } else {
      setDocUploadError(res.error || 'कागदपत्र अपलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    }
    setIsUploadingDoc(false);
  };

  // 1. GUEST VIEW (Unauthenticated User) - Bright Auspicious Gold-Bordered Preview Section
  if (!currentUser) {
    const sampleProfiles = profiles.slice(0, 4);

    return (
      <div className="min-h-screen bg-[#FFFDF5] text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Welcome & Preview Hero Card */}
          <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-amber-100 p-8 sm:p-10 rounded-3xl border-2 border-amber-400 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-300 text-[#800C1E] text-xs sm:text-sm font-black uppercase tracking-wider shadow">
              <Sparkles className="w-4 h-4 fill-[#800C1E]" />
              <span>{siteConfig?.guestBannerTitle || 'वंजारीजोडी वधू-वर सूचक केंद्र (Guest Preview)'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-amber-200 tracking-tight leading-tight max-w-3xl mx-auto drop-shadow-md">
              {siteConfig?.guestBannerTitle || 'वंजारी समाजातील हजारो स्थळांचे पूर्ण बायोडाटा पहा'}
            </h1>

            <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl mx-auto font-medium leading-relaxed">
              {siteConfig?.guestBannerText || 'वंजारी समाजातील सुशिक्षित वधू आणि वरांचे अस्सल प्रोफाईल पाहण्यासाठी व पालकांशी थेट संपर्क साधण्यासाठी कृपया नोंदणी करा किंवा लॉगिन करा.'}
            </p>

            {/* CTA Registration / Login / Guest Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#800C1E] font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-amber-200 transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#800C1E]" />
                <span>१. नवीन नोंदणी करा</span>
              </button>

              <button
                onClick={() => {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                }}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-amber-100 text-[#A71930] font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-amber-300 transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#A71930]" />
                <span>२. सदस्य लॉगिन</span>
              </button>

              {siteConfig?.enableGuestLogin !== false && (
                <button
                  onClick={() => {
                    setLoginModalMode('guest');
                    setIsLoginOpen(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 hover:from-amber-300 hover:to-amber-400 text-[#800C1E] font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-amber-400 transition-all active:scale-95 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#800C1E]" />
                  <span>३. गेस्ट प्रवेश (Guest Login)</span>
                </button>
              )}
            </div>
          </div>

          {/* Sample Candidates Grid (Blurred Preview) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#A71930] flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                  <span>वंजारी समाजातील प्रातिनिधिक स्थळे (Sample Candidates)</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  पूर्ण माहिती, संपर्क क्रमांक आणि फोटो पाहण्यासाठी लॉगिन करणे आवश्यक आहे.
                </p>
              </div>

              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#A71930] font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-4 h-4 text-[#A71930]" />
                <span>{siteConfig?.guestBannerButtonText || 'लॉगिन करा आणि पूर्ण बायोडाटा पहा'}</span>
              </button>
            </div>

            {/* Blurred Profiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleProfiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setIsLoginOpen(true)}
                  className="group relative bg-[#FFFDF5] border-2 border-amber-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden space-y-3"
                >
                  {/* Photo Container with Blur Overlay */}
                  <div className="relative h-48 rounded-xl overflow-hidden bg-amber-100 border border-amber-300">
                    <img
                      src={p.photos[0]}
                      alt="Sample profile"
                      className="w-full h-full object-cover filter blur-md scale-110 group-hover:scale-125 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#A71930]/30 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
                      <span className="px-3 py-1.5 rounded-full bg-white/95 text-[#A71930] font-black text-xs shadow-lg border border-amber-300 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-[#A71930]" />
                        <span>लॉगिन आवश्यक</span>
                      </span>
                    </div>
                  </div>

                  {/* Candidate Brief Info */}
                  <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#A71930] border border-amber-300 inline-block">
                      आयडी: {p.id.slice(0, 5)}***
                    </span>
                    <h3 className="text-base font-black text-slate-800 blur-[2px] select-none">
                      {p.fullName}
                    </h3>
                    <p className="text-xs text-slate-600 font-semibold">
                      {p.age} वर्षे | {p.district}
                    </p>
                    <p className="text-xs text-[#A71930] font-bold truncate">
                      {p.education}
                    </p>
                  </div>

                  {/* CTA Overlay Button */}
                  <button className="w-full py-2 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 text-xs font-bold flex items-center justify-center gap-1 shadow">
                    <span>बायोडाटा उघडा</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Invitation Banner */}
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <h4 className="font-extrabold text-[#A71930] text-base">
                  तुम्ही अजून नोंदणी केली नाही का?
                </h4>
                <p className="text-xs text-slate-700 font-medium">
                  फक्त २ मिनिटांत फॉर्म भरून वंजारी समाजात योग्य स्थळ शोधा.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A71930] to-[#C82333] text-amber-100 font-black text-xs shadow-md border border-amber-300/40 hover:brightness-110 shrink-0"
              >
                नोंदणी फॉर्म भरा →
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // 2. LOGGED-IN MEMBER DASHBOARD - Bright Theme (#FFFDF5 / Crimson Red / Gold)
  const receivedRequests = currentUser ? interests.filter((i) => i.toUserId === currentUser.id) : [];
  const sentRequests = currentUser ? interests.filter((i) => i.fromUserId === currentUser.id) : [];
  const shortlistedProfiles = profiles.filter((p) => shortlistedIds.includes(p.id));

  const totalLikesAndMatches = mutualMatches.length + receivedLikes.length + sentLikes.length;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#A71930] shadow-md bg-amber-50 group shrink-0">
              <SafeAvatar
                src={currentUser.photoUrl || currentUser.photos?.[0]}
                alt={currentUser.fullName}
                name={currentUser.fullName}
                gender={currentUser.gender}
                sizeClassName="w-20 h-20"
              />
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="absolute inset-0 bg-slate-950/70 text-amber-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-[9px] font-black cursor-pointer"
                title="प्रोफाईल फोटो बदला"
              >
                <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                <span>फोटो बदला</span>
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#A71930]">{currentUser.fullName}</h1>
                <VerifiedBadge profile={currentUser} size="md" showLabel={true} />
              </div>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                आयडी: {currentUser.id} | {currentUser.district} | {currentUser.subCaste}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className={`px-3 py-0.5 rounded-full font-bold border ${isCurrentUserPlanExpired ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse' : 'bg-amber-100 text-[#A71930] border-amber-300'}`}>
                  {currentUser.membership === 'free'
                    ? 'मोफत सदस्य'
                    : isCurrentUserPlanExpired
                    ? '⏳ मुदत संपली (Expired Plan)'
                    : `${currentUser.membership.toUpperCase()} प्लॅन`}
                </span>
                <span className="text-slate-500 font-medium">शेवटचे सक्रीय: {currentUser.lastActive}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 border border-emerald-300 transition-all cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-200" />
              <span>🎁 शेअर करा आणि कमवा (Share & Earn)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 border border-amber-300 transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4 text-slate-950" />
              <span>✍️ माहिती बदला</span>
            </button>
          </div>

          {/* Photo Request / Low Photo Count Banner */}
          {currentUser && (currentUser.photos || []).length < 5 && (
            <div className="p-4 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#A71930] text-amber-100 rounded-xl text-xl font-black shrink-0 shadow">
                  📷
                </div>
                <div>
                  <h4 className="font-black text-[#A71930] text-sm flex items-center gap-2">
                    <span>ॲडमिन सूचना: तुमच्या बायोडाटावर फोटो कमी आहेत ({currentUser.photos?.length || 1}/५ फोटो)</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-[#800C1E] rounded text-[10px] font-black border border-amber-400">
                      किमान ५ फोटो शिफारस
                    </span>
                  </h4>
                  <p className="text-xs text-slate-700 font-bold mt-0.5">
                    योग्य व सुशिक्षित स्थळांकडून १००% चांगला प्रतिसाद मिळण्यासाठी व बायोडाटा परिपूर्ण दिसण्यासाठी कृपया किमान ५ सुंदर फोटो नक्की अपलोड करा.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] hover:to-[#A71930] text-amber-100 font-black text-xs shadow-md border border-amber-300 shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>📸 आताच फोटो अपलोड करा</span>
              </button>
            </div>
          )}

          {/* Pending Admin Approval Banner */}
          {currentUser && currentUser.isApproved === false && !currentUser.isAdmin && (
            <div className="p-4 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-amber-950 rounded-xl text-xl font-black shrink-0">
                  ⏳
                </div>
                <div>
                  <h4 className="font-black text-[#A71930] text-sm flex items-center gap-2">
                    <span>तुमचे प्रोफाईल ॲडमिन पडताळणीसाठी प्रलंबित आहे (Pending Verification)</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded text-[10px] font-black">
                      लॉगिन सक्रिय
                    </span>
                  </h4>
                  <p className="text-xs text-slate-700 font-bold mt-0.5">
                    तुमचे खाते यशस्वीरीत्या सुरू झाले आहे. ॲडमिनने तुमचे प्रोफाईल मंजूर करेपर्यंत सुरक्षिततेच्या कारणास्तव तुम्हाला इतर सदस्यांची केवळ मर्यादित माहिती (जिल्हा, शिक्षण, सरकारी नोकरी/व्यवसाय) दिसेल. ॲडमिन मंजुरी मिळताच तुमचे सर्व फंक्शन्स आपोआप अनलॉक होतील.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expired Plan Warning Banner */}
          {isCurrentUserPlanExpired && (
            <div className="p-4 bg-gradient-to-r from-amber-100 via-rose-50 to-amber-100 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-6 h-6 text-rose-700 animate-pulse shrink-0" />
                <div>
                  <h4 className="font-black text-rose-900 text-sm">⏳ तुमचा सबस्क्रिप्शन प्लॅन संपला आहे (Plan Expired)!</h4>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    डायरेक्ट मोबाईल नंबर संपर्क दाखवणे व सर्व पेड सुविधा तात्पुरत्या बंद झाल्या आहेत. सर्व वधू-वरांचे संपर्क अनलॉक करण्यासाठी प्रशासनाचा नवीन ऑफर प्लॅन नूतनीकरण करा.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow border border-amber-300 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>⚡ प्लॅन नूतनीकरण करा</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 border border-amber-300 transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4 text-slate-950" />
              <span>✍️ माहिती व फोटो बदला (Edit Profile)</span>
            </button>

            {/* Phone / Truecaller Verification Action Button */}
            {!currentUser.isPhoneVerified ? (
              <button
                onClick={() => setIsPhoneAuthModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 border border-blue-300 animate-pulse cursor-pointer"
                title="Truecaller द्वारे १ सेकंदात मोबाईल नंबर पडताळणी करा"
              >
                <Zap className="w-4 h-4 text-cyan-200 fill-current" />
                <span>📱 Truecaller पडताळणी (Verify Mobile)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPhoneAuthModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-black shadow-xs flex items-center gap-1.5 border border-blue-300 cursor-pointer"
                title="तुमचा मोबाईल नंबर पडताळणी झालेला आहे"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>नंबर व्हेरिफाइड ✓</span>
              </button>
            )}

            {!currentUser.isFaceVerified && (
              <button
                onClick={() => setIsFaceAuthModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 border border-teal-300"
              >
                <ScanFace className="w-4 h-4 text-teal-200" />
                <span>चेहरा पडताळणी करा (Blue Tick)</span>
              </button>
            )}

            {!siteConfig?.hidePaymentDetailsGlobal && (
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] hover:to-[#A71930] text-amber-100 text-xs font-black shadow-md flex items-center gap-1.5 border border-amber-300/40"
              >
                <Crown className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>प्लॅन अपग्रेड करा</span>
              </button>
            )}

            <button
              onClick={() => setSelectedProfileForModal(currentUser)}
              className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] text-xs font-black shadow-sm flex items-center gap-1.5 border border-amber-300 transition-all cursor-pointer"
              title="तुमचा स्वतःचा बायोडाटा प्रिंट किंवा डाऊनलोड करा"
            >
              <FileText className="w-4 h-4 text-[#A71930]" />
              <span>🖨️ बायोडाटा प्रिंट / PDF</span>
            </button>

            <button
              onClick={() => setIsProfileRemovalModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] text-xs font-black shadow-sm flex items-center gap-1.5 border border-amber-300 transition-all cursor-pointer"
              title="लग्न जुळल्यामुळे किंवा वैयक्तिक कारणास्तव प्रोफाईल हटवण्याची विनंती करा"
            >
              <HeartHandshake className="w-4 h-4 text-rose-600" />
              <span>💍 विवाह जुळला / प्रोफाईल काढा</span>
            </button>
          </div>
        </div>

        {/* OPTIONAL TRUECALLER & MOBILE NUMBER VERIFICATION BANNER */}
        {!currentUser.isPhoneVerified && (
          <div className="bg-gradient-to-r from-[#0087FF] via-[#005AE0] to-[#800C1E] text-white p-5 rounded-2xl border-2 border-blue-300 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white/15 rounded-2xl border border-white/30 shrink-0 shadow-md">
                <Smartphone className="w-8 h-8 text-cyan-200 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">
                    १-क्लिक Truecaller मोबाईल पडताळणी (Phone Verification)
                  </h3>
                  <span className="bg-cyan-300 text-blue-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    नंबर व्हेरिफाइड बॅज
                  </span>
                </div>
                <p className="text-xs text-cyan-100 leading-relaxed max-w-2xl font-medium">
                  तुमचा मोबाईल नंबर <strong>{currentUser.mobile || ''}</strong> Truecaller किंवा OTP द्वारे सुरक्षितपणे पडताळणी करा. यामुळे तुमच्या प्रोफाइलवर अधिकृत <strong>"Truecaller व्हेरिफाइड"</strong> बॅज लागेल व इतर वधू-वरांचा विश्वास १००% वाढेल.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPhoneAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 shrink-0 transition-transform active:scale-95 border border-amber-200 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              <span>📱 Truecaller ने व्हेरिफाय करा</span>
            </button>
          </div>
        )}

        {/* OPTIONAL FACE AUTHENTICATION BANNER */}
        {!currentUser.isFaceVerified && (
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl border-2 border-blue-400/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/40 shrink-0">
                <ScanFace className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-blue-200">
                    ऐच्छिक चेहरा ऑथेंटिकेशन (Optional Face Authentication)
                  </h3>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                    ब्लू टिक बॅज
                  </span>
                </div>
                <p className="text-xs text-blue-100/80 leading-relaxed max-w-2xl">
                  तुमचा चेहरा स्कॅन करून <strong className="text-amber-300">Verified Blue Tick</strong> मिळवा. यामुळे तुमच्या प्रोफाईलला इतर सदस्यांकडून ७०% जास्त पसंती व प्रतिसाद मिळतो.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFaceAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs shadow-lg flex items-center gap-2 shrink-0 transition-transform active:scale-95 border border-blue-300"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>आत्ताच चेहरा स्कॅन करा</span>
            </button>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-amber-200 overflow-x-auto text-xs font-bold gap-2 pb-1">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
              tab === 'overview'
                ? 'bg-[#A71930] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('my_profile')}</span>
          </button>

          <button
            onClick={() => setTab('interests')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
              tab === 'interests'
                ? 'bg-[#A71930] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-rose-500" />
            <span>❤️ लाईक्स व मॅचेस ({totalLikesAndMatches})</span>
            {mutualMatches.length > 0 && (
              <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black animate-pulse">
                {mutualMatches.length} मॅच
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('shortlist')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
              tab === 'shortlist'
                ? 'bg-[#A71930] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
            <span>{t('my_shortlist')} ({shortlistedProfiles.length})</span>
          </button>

          <button
            onClick={() => setTab('notifications')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
              tab === 'notifications'
                ? 'bg-[#A71930] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{t('notifications')} ({memberNotifications.filter((n) => !n.isRead).length})</span>
          </button>

          <button
            onClick={() => setTab('membership')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
              tab === 'membership'
                ? 'bg-[#A71930] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>{t('my_membership')}</span>
          </button>

          <button
            onClick={() => setTab('privacy')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all ${
              tab === 'privacy'
                ? 'bg-[#A71930] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{t('privacy_settings')}</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & PROFILE VIEW */}
        {tab === 'overview' && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-amber-200">
              <h3 className="text-lg font-black text-[#A71930]">माझी बायोडाटा माहिती</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 text-xs font-black border border-amber-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-amber-200" />
                <span>माहिती व फोटो बदल करा (Edit Profile & Photos)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
              <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-amber-200 space-y-2.5">
                <span className="text-[#A71930] font-extrabold text-sm block border-b border-amber-200 pb-1">
                  १. वैयक्तिक माहिती
                </span>
                <p><strong className="text-slate-600">नाव:</strong> {currentUser.fullName}</p>
                <p><strong className="text-slate-600">लिंग / वय:</strong> {currentUser.gender === 'bride' ? 'वधू' : 'वर'} | {currentUser.age} वर्ष</p>
                <p><strong className="text-slate-600">फोन:</strong> {currentUser.mobile}</p>
                <p><strong className="text-slate-600">ईमेल:</strong> {currentUser.email}</p>
                <p><strong className="text-slate-600">उपजात:</strong> {currentUser.subCaste}</p>
              </div>

              <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-amber-200 space-y-2.5">
                <span className="text-[#A71930] font-extrabold text-sm block border-b border-amber-200 pb-1">
                  २. शिक्षण व नोकरी
                </span>
                <p><strong className="text-slate-600">शिक्षण:</strong> {currentUser.education}</p>
                <p><strong className="text-slate-600">नोकरी/व्यवसाय:</strong> {currentUser.occupation}</p>
                <p><strong className="text-slate-600">उत्पन्न:</strong> {currentUser.income}</p>
                <p><strong className="text-slate-600">ठिकाण:</strong> {currentUser.city}, {currentUser.district}</p>
              </div>

              <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-amber-200 space-y-2.5">
                <span className="text-[#A71930] font-extrabold text-sm block border-b border-amber-200 pb-1">
                  ३. कागदपत्रे व पत्रिका माहिती
                </span>
                <p>
                  <strong className="text-slate-600">आधार / ओळखपत्र:</strong>{' '}
                  {currentUser.idProofUrl || currentUser.aadhaarCardUrl ? (
                    <span className="text-emerald-700 font-extrabold">अपलोड व ऑनलाइन जतन आहे ✓</span>
                  ) : (
                    <span className="text-amber-700 font-bold">नाही (खालील सेक्शनमधून अपलोड करा)</span>
                  )}
                </p>
                <p><strong className="text-slate-600">पत्रिका PDF:</strong> डिजिटल पत्रिका जोडली आहे</p>
                <button
                  onClick={() => alert('पत्रिका PDF डाऊनलोड सुरू झाली आहे.')}
                  className="mt-2 text-xs bg-amber-100 hover:bg-amber-200 text-[#A71930] border border-amber-300 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-[#A71930]" />
                  <span>माझी पत्रिका पहा</span>
                </button>
              </div>
            </div>

            {/* 4. Aadhaar / ID Card Document Management Card (Front & Back with Masking & Requests) */}
            <div className="bg-[#FFFDF5] p-6 rounded-3xl border-2 border-amber-300 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow">
                    <ShieldCheck className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[#A71930] flex items-center gap-2">
                      <span>आधार कार्ड व सरकारी ओळखपत्र (Aadhaar & Govt ID Proof)</span>
                    </h4>
                    <p className="text-xs text-slate-600 font-bold">
                      पुढील व मागील दोन्ही बाजूंचे फोटो सुरक्षितपणे अपलोड करा. ॲडमिन मंजुरीनंतरच इतरांना सुरक्षित मास्क ॲक्सेस दिला जातो.
                    </p>
                  </div>
                </div>

                {currentUser.aadhaarFrontUrl || currentUser.idProofUrl || currentUser.aadhaarCardUrl ? (
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>कागदपत्र ऑनलाइन जतन आहे</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                    कागदपत्र जोडलेले नाही (ऐच्छिक)
                  </span>
                )}
              </div>

              {/* Admin Configured Security Notice */}
              {siteConfig.showMaskedAadhaarNotice !== false && (
                <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl text-xs text-amber-950 font-semibold leading-relaxed shadow-sm flex items-start gap-2.5">
                  <span className="text-xl shrink-0">🛡️</span>
                  <div>
                    <strong className="text-[#800C1E] block mb-0.5">गोपनीयता व सुरक्षितता सूचना:</strong>
                    <span>{siteConfig.maskedAadhaarNoticeText || 'आपल्या गोपनीयतेसाठी व सुरक्षिततेसाठी कृपया पहिल्या ८ अंकांवर मास्क केलेले (Masked Aadhaar) किंवा केवळ शेवटचे ४ अंक दिसणारे आधार कार्ड अपलोड करा.'}</span>
                  </div>
                </div>
              )}

              {docSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{docSuccessMsg}</span>
                </div>
              )}

              {docUploadError && (
                <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{docUploadError}</span>
                </div>
              )}

              {/* MASKING TOGGLE */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentUser.isAadhaarMasked !== false}
                    onChange={(e) => {
                      updateProfileDirect(currentUser.id, { isAadhaarMasked: e.target.checked });
                    }}
                    className="w-4 h-4 text-[#A71930] rounded accent-[#A71930]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    🔒 माझे आधार कार्ड मास्क केलेले (Masked Aadhaar) आहे — पहिल्या ८ अंकांवर सुरक्षित मास्क आहे.
                  </span>
                </label>
              </div>

              {/* FRONT & BACK 2-COLUMN UPLOAD CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. FRONT PHOTO */}
                <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-[#800C1E] flex items-center justify-center text-[10px] font-black">१</span>
                      <span>आधार पुढील बाजू (Front Side)</span>
                    </span>
                    {currentUser.aadhaarFrontUrl || currentUser.aadhaarCardUrl ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ जोडले आहे
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                        रिकामे
                      </span>
                    )}
                  </div>

                  {currentUser.aadhaarFrontUrl || currentUser.aadhaarCardUrl ? (
                    <div className="space-y-2">
                      <div className="h-32 bg-slate-50 rounded-xl overflow-hidden border border-amber-200 flex items-center justify-center">
                        <img
                          src={currentUser.aadhaarFrontUrl || currentUser.aadhaarCardUrl}
                          alt="Aadhaar Front"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={currentUser.aadhaarFrontUrl || currentUser.aadhaarCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 text-center bg-amber-100 hover:bg-amber-200 text-[#A71930] rounded-xl text-xs font-black border border-amber-300"
                        >
                          👁️ पहा
                        </a>
                        <label className="flex-1 py-1.5 text-center bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-xs font-black cursor-pointer shadow-xs">
                          {isUploadingFront ? 'अपलोड...' : 'बदला'}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleDashboardAadhaarFrontUpload}
                            disabled={isUploadingFront}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-2">
                      <p className="text-[11px] text-slate-600">आधार कार्डच्या पुढील बाजूचा स्पष्ट फोटो निवडा</p>
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#A71930] font-black text-xs border-2 border-dashed border-amber-400 cursor-pointer transition-all">
                        {isUploadingFront ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#A71930]" />
                            <span>अपलोड होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#A71930]" />
                            <span>📸 पुढील बाजू निवडा</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleDashboardAadhaarFrontUpload}
                          disabled={isUploadingFront}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* 2. BACK PHOTO */}
                <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-[#800C1E] flex items-center justify-center text-[10px] font-black">२</span>
                      <span>आधार मागील बाजू (Back Side)</span>
                    </span>
                    {currentUser.aadhaarBackUrl ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ जोडले आहे
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                        रिकामे
                      </span>
                    )}
                  </div>

                  {currentUser.aadhaarBackUrl ? (
                    <div className="space-y-2">
                      <div className="h-32 bg-slate-50 rounded-xl overflow-hidden border border-amber-200 flex items-center justify-center">
                        <img
                          src={currentUser.aadhaarBackUrl}
                          alt="Aadhaar Back"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={currentUser.aadhaarBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 text-center bg-amber-100 hover:bg-amber-200 text-[#A71930] rounded-xl text-xs font-black border border-amber-300"
                        >
                          👁️ पहा
                        </a>
                        <label className="flex-1 py-1.5 text-center bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-xs font-black cursor-pointer shadow-xs">
                          {isUploadingBack ? 'अपलोड...' : 'बदला'}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleDashboardAadhaarBackUpload}
                            disabled={isUploadingBack}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-2">
                      <p className="text-[11px] text-slate-600">आधार कार्डच्या पत्ता असलेल्या मागील बाजूचा फोटो निवडा</p>
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#A71930] font-black text-xs border-2 border-dashed border-amber-400 cursor-pointer transition-all">
                        {isUploadingBack ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#A71930]" />
                            <span>अपलोड होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#A71930]" />
                            <span>📸 मागील बाजू निवडा</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleDashboardAadhaarBackUpload}
                          disabled={isUploadingBack}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. MEMBER'S SENT ID REQUESTS STATUS */}
              {memberIdRequests && memberIdRequests.filter(r => r.requesterId === currentUser.id).length > 0 && (
                <div className="pt-2 border-t border-amber-200 space-y-2.5">
                  <h5 className="text-xs font-black text-[#800C1E] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#A71930]" />
                    <span>माझ्या ओळखपत्र पाहण्याच्या विनंत्या (My Govt ID Requests):</span>
                  </h5>
                  <div className="space-y-2">
                    {memberIdRequests.filter(r => r.requesterId === currentUser.id).map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-white rounded-xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-black text-slate-900">
                            उमेदवार: {req.targetProfileName}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            कारण: {req.reason || 'ओळखपत्र पडताळणी'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === 'approved' ? (
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px] border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>मंजूर (Approved)</span>
                              </span>
                              {req.allowedFrontUrl && (
                                <a
                                  href={req.allowedFrontUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-[#A71930] text-amber-100 rounded-lg text-xs font-black"
                                >
                                  📄 आयडी पहा
                                </a>
                              )}
                            </div>
                          ) : req.status === 'rejected' ? (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-black text-[10px] border border-rose-300">
                              नाकारले (Rejected)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-[10px] border border-amber-300">
                              ⏳ ॲडमिन मंजुरी प्रलंबित
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIKES & MATCHES (Unified Hub) */}
        {tab === 'interests' && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 sm:p-6 space-y-6 shadow-sm">
            
            {/* Subtab Switcher */}
            <div className="flex flex-wrap items-center gap-2 border-b border-amber-200 pb-4">
              <button
                type="button"
                onClick={() => setLikesSubTab('mutual')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  likesSubTab === 'mutual'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                    : 'bg-[#FFFDF5] text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-amber-300" />
                <span>💞 परस्पर पसंती (Mutual Matches)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${likesSubTab === 'mutual' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {mutualMatches.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLikesSubTab('received')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  likesSubTab === 'received'
                    ? 'bg-gradient-to-r from-[#A71930] to-[#C82333] text-white shadow-md'
                    : 'bg-[#FFFDF5] text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Heart className="w-4 h-4 fill-current text-rose-300" />
                <span>❤️ मला आलेले लाईक्स (Received)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${likesSubTab === 'received' ? 'bg-white text-[#A71930]' : 'bg-rose-100 text-rose-800'}`}>
                  {receivedLikes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLikesSubTab('sent')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  likesSubTab === 'sent'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                    : 'bg-[#FFFDF5] text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>📤 मी केलेले लाईक्स (Sent)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${likesSubTab === 'sent' ? 'bg-slate-900 text-amber-200' : 'bg-amber-100 text-amber-900'}`}>
                  {sentLikes.length}
                </span>
              </button>
            </div>

            {/* SUB-VIEW 1: MUTUAL MATCHES */}
            {likesSubTab === 'mutual' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950 text-sm">
                      🎉 परस्पर पसंती (Mutual Match) - दोघांचे लाईक्स जुळले आहेत!
                    </h4>
                    <p className="text-xs text-emerald-900/90 font-medium">
                      या सदस्यांनी तुम्हाला व तुम्ही त्यांना दोघांनी एकमेकांना पसंत केले आहे. तुम्ही थेट कॉल, व्हॉट्सॲप आणि ३६ गुण कुंडली तपासू शकता.
                    </p>
                  </div>
                </div>

                {mutualMatches.length === 0 ? (
                  <div className="text-center py-10 bg-[#FFFDF5] rounded-2xl border border-amber-200 p-6 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-black shadow-inner">
                      💞
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">अद्याप कोणतीही परस्पर पसंती (Mutual Match) झालेली नाही</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      वधू-वर यादीतील उमेदवारांना '❤️ लाईक' करा. त्यांनीही तुमच्या प्रोफाईलला परत लाईक करताच ते येथे दिसतील!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mutualMatches.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#FFFDF5] p-4 rounded-2xl border-2 border-emerald-300 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <SafeAvatar
                            src={p.photoUrl || p.photos?.[0]}
                            alt={p.fullName}
                            name={p.fullName}
                            gender={p.gender}
                            sizeClassName="w-16 h-16"
                            className="border border-emerald-400"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-slate-900 text-sm truncate">{p.fullName}</h4>
                              <VerifiedBadge profile={p} size="sm" showLabel={false} />
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {p.age} वर्षे • {p.height || '५ फूट'} • {p.district}
                            </p>
                            <p className="text-xs text-[#A71930] font-bold truncate mt-0.5">
                              {p.education || 'शिक्षण माहिती'}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black border border-emerald-300">
                              🎉 परस्पर पसंती जुळली
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons for Mutual Match */}
                        <div className="pt-2 border-t border-emerald-200 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileForModal(p)}
                            className="px-3 py-2 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] hover:to-[#A71930] text-amber-100 rounded-xl text-xs font-black shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>बायोडाटा</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setKundaliCandidate(p)}
                            className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black shadow border border-amber-300 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <Scroll className="w-3.5 h-3.5" />
                            <span>३६ गुण कुंडली</span>
                          </button>

                          {p.mobile && (
                            <a
                              href={`https://wa.me/91${p.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${p.fullName}, मी वंजारीजोडी ॲपवरून संपर्क करत आहे. आपली परस्पर पसंती (Mutual Match) झाली आहे.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="col-span-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                              <span>💬 व्हॉट्सॲपवर संपर्क करा ({p.mobile})</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 2: RECEIVED LIKES */}
            {likesSubTab === 'received' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-200 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 bg-[#A71930] text-white rounded-xl shadow shrink-0">
                    <Heart className="w-5 h-5 fill-current text-rose-200" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#A71930] text-sm">
                      ❤️ ज्यांनी तुमच्या प्रोफाईलला लाईक केले आहे
                    </h4>
                    <p className="text-xs text-slate-700 font-medium">
                      या सदस्यांना तुमचा बायोडाटा आवडला आहे. तुम्ही 'परत लाईक' केल्यास त्वरित परस्पर मॅच तयार होईल व संपर्क नंबर अनलॉक होईल.
                    </p>
                  </div>
                </div>

                {receivedLikes.length === 0 ? (
                  <div className="text-center py-10 bg-[#FFFDF5] rounded-2xl border border-amber-200 p-6 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-[#A71930] flex items-center justify-center text-2xl font-black shadow-inner">
                      ❤️
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">अद्याप नवीन लाईक्स आलेले नाहीत</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      तुमचे प्रोफाईल परिपूर्ण ठेवा व सुंदर फोटो अपलोड करा, जेणेकरून जास्तीत जास्त स्थळांकडून पसंती (Likes) मिळतील!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {receivedLikes.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#FFFDF5] p-4 rounded-2xl border-2 border-rose-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <SafeAvatar
                            src={p.photoUrl || p.photos?.[0]}
                            alt={p.fullName}
                            name={p.fullName}
                            gender={p.gender}
                            sizeClassName="w-16 h-16"
                            className="border border-rose-300"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-slate-900 text-sm truncate">{p.fullName}</h4>
                              <VerifiedBadge profile={p} size="sm" showLabel={false} />
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {p.age} वर्षे • {p.height || '५ फूट'} • {p.district}
                            </p>
                            <p className="text-xs text-[#A71930] font-bold truncate mt-0.5">
                              {p.education || 'शिक्षण माहिती'}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black border border-rose-300">
                              ❤️ यांनी तुम्हाला लाईक केले
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-rose-100 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => toggleLikeProfile(p.id)}
                            className="col-span-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                          >
                            <Heart className="w-4 h-4 fill-current text-rose-300" />
                            <span>❤️ परत लाईक करा (Like Back & Match!)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProfileForModal(p)}
                            className="px-3 py-2 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] hover:to-[#A71930] text-amber-100 rounded-xl text-xs font-black shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>बायोडाटा</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setKundaliCandidate(p)}
                            className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black shadow border border-amber-300 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <Scroll className="w-3.5 h-3.5" />
                            <span>कुंडली जुळवा</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 3: SENT LIKES */}
            {likesSubTab === 'sent' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-amber-950 text-sm">
                      📤 मी पसंती (Like) पाठवलेले सदस्य
                    </h4>
                    <p className="text-xs text-slate-700 font-medium">
                      तुम्ही या सदस्यांना पसंती दर्शवली आहे. त्यांनीही परत पसंती दिल्यास परस्पर मॅच तयार होईल.
                    </p>
                  </div>
                </div>

                {sentLikes.length === 0 ? (
                  <div className="text-center py-10 bg-[#FFFDF5] rounded-2xl border border-amber-200 p-6 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-2xl font-black shadow-inner">
                      📤
                    </div>
                    <h4 className="font-black text-slate-800 text-sm">तुम्ही अद्याप कोणत्याही प्रोफाईलला लाईक केलेले नाही</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      वधू-वर यादीतील प्रोफाईल्सवर '❤️ लाईक' बटण दाबून पसंती दर्शवा!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sentLikes.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#FFFDF5] p-4 rounded-2xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <SafeAvatar
                            src={p.photoUrl || p.photos?.[0]}
                            alt={p.fullName}
                            name={p.fullName}
                            gender={p.gender}
                            sizeClassName="w-16 h-16"
                            className="border border-amber-300"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-slate-900 text-sm truncate">{p.fullName}</h4>
                              <VerifiedBadge profile={p} size="sm" showLabel={false} />
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {p.age} वर्षे • {p.height || '५ फूट'} • {p.district}
                            </p>
                            <p className="text-xs text-[#A71930] font-bold truncate mt-0.5">
                              {p.education || 'शिक्षण माहिती'}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black border border-amber-300">
                              ⏳ पसंती पाठवली (प्रलंबित)
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-amber-200 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileForModal(p)}
                            className="px-3 py-2 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] hover:to-[#A71930] text-amber-100 rounded-xl text-xs font-black shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>बायोडाटा पहा</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setKundaliCandidate(p)}
                            className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black shadow border border-amber-300 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                          >
                            <Scroll className="w-3.5 h-3.5" />
                            <span>कुंडली जुळवा</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: SHORTLISTED */}
        {tab === 'shortlist' && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-[#A71930] mb-4">माझी आवडती प्रोफाईल यादी</h3>
            {shortlistedProfiles.length === 0 ? (
              <p className="text-xs text-slate-500 bg-[#FFFDF5] p-4 rounded-xl border border-amber-200">
                कोणतेही प्रोफाईल शॉर्टलिस्ट केलेले नाही.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortlistedProfiles.map((p) => (
                  <div key={p.id} className="bg-[#FFFDF5] p-4 rounded-2xl border border-amber-200 flex gap-3">
                    <img src={p.photos[0]} alt="p" className="w-16 h-16 rounded-xl object-cover border border-amber-300" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.fullName}</h4>
                      <p className="text-xs text-slate-600">{p.age} वर्षे | {p.district}</p>
                      <button
                        onClick={() => setSelectedProfileForModal(p)}
                        className="mt-2 text-xs text-[#A71930] font-bold underline"
                      >
                        बायोडाटा पहा →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {tab === 'notifications' && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
              <h3 className="text-lg font-black text-[#A71930]">सूचना केंद्र (Notifications)</h3>
              
              <button
                type="button"
                onClick={async () => {
                  const p = await requestPushPermission();
                  if (p === 'granted') {
                    triggerBrowserPushNotification('🔔 पुश नोटिफिकेशन्स चालू झाले!', {
                      body: 'नवीन बायोडाटा जोडताच तुम्हाला मोबाईलवर अलर्ट मिळतील.'
                    });
                    alert('पुश नोटिफिकेशन्स तुमच्या डिव्हाइसवर यशस्वीरित्या चालू करण्यात आले!');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] text-xs font-black border border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>🔔 डिव्हाइसवर पुश अलर्ट चालू करा (Enable Push)</span>
              </button>
            </div>

            {memberNotifications.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-500 font-bold bg-[#FFFDF5] rounded-2xl border border-amber-200 space-y-2">
                <Bell className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
                <p className="text-sm">तुमच्यासाठी सध्या कोणतीही नवीन सूचना उपलब्ध नाही.</p>
              </div>
            ) : (
              memberNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.isRead ? 'bg-[#FFFDF5] border-amber-200 text-slate-600' : 'bg-amber-100/70 border-amber-300 text-slate-900 font-semibold'
                  }`}
                >
                  <p className="font-bold text-[#A71930] text-sm">{language === 'mr' ? n.titleMr : n.title}</p>
                  <p className="text-xs text-slate-700 mt-1">{language === 'mr' ? n.messageMr : n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">{n.createdAt ? n.createdAt.split('T')[0] : ''}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: MEMBERSHIP */}
        {tab === 'membership' && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-black text-[#A71930]">माझी मेम्बरशिप व पेमेंट स्थिती</h3>
            <div className="bg-[#FFFDF5] p-6 rounded-2xl border border-amber-300 space-y-2">
              <p className="text-sm font-bold text-slate-900">
                सध्याचा प्लॅन: <span className="text-[#A71930] uppercase font-black">{currentUser.membership} Plan</span>
              </p>
              <p className="text-xs text-slate-600">अमर्यादित चॅट आणि ५० संपर्क क्रमांक अनलॉक करण्याची सुविधा उपलब्ध.</p>
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="mt-3 px-6 py-2.5 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] hover:to-[#A71930] text-amber-100 font-bold rounded-xl text-xs shadow"
              >
                नवीन प्लॅन अपग्रेड करा
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: PRIVACY SETTINGS */}
        {tab === 'privacy' && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 space-y-4 text-xs sm:text-sm shadow-sm">
            <h3 className="text-lg font-black text-[#A71930]">गोपनीयता व सुरक्षा सेटिंग्ज</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 bg-[#FFFDF5] p-4 rounded-2xl border border-amber-200 font-semibold">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#A71930]" />
                <span>माझा मोबाईल नंबर केवळ प्रमाणित वधू/वरांना दाखवा</span>
              </label>
              <label className="flex items-center gap-3 bg-[#FFFDF5] p-4 rounded-2xl border border-amber-200 font-semibold">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#A71930]" />
                <span>नवीन प्रतिसादांचे त्वरित व्हॉट्सॲप नोटिफिकेशन्स मिळवा</span>
              </label>
            </div>
          </div>
        )}

      </div>

      {/* Face Verification Modal */}
      <FaceVerificationModal
        isOpen={isFaceAuthModalOpen}
        onClose={() => setIsFaceAuthModalOpen(false)}
      />

      {/* 36 Guna Kundali Milan Modal */}
      {kundaliCandidate && (
        <KundaliMilanModal
          isOpen={!!kundaliCandidate}
          onClose={() => setKundaliCandidate(null)}
          candidateProfile={kundaliCandidate}
        />
      )}

      {/* Referral & Share Modal */}
      {isShareModalOpen && currentUser && (
        <ReferralShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          user={currentUser}
        />
      )}

      {/* FULL PROFILE & PHOTO EDIT MODAL FOR LOGGED-IN MEMBER */}
      {currentUser && (
        <AdminEditProfileModal
          profile={currentUser}
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          onSave={(profileId, updatedFields) => {
            updateProfileDirect(profileId, updatedFields);
          }}
          canEdit={true}
        />
      )}
    </div>
  );
};
