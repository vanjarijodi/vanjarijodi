import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { VerifiedBadge } from './VerifiedBadge';
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
  Camera
} from 'lucide-react';

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
    setIsProfileRemovalModalOpen,
    uploadAadhaarCard,
    updateProfileDirect,
    isCurrentUserPlanExpired
  } = useApp();

  const [tab, setTab] = useState<'overview' | 'interests' | 'shortlist' | 'notifications' | 'membership' | 'privacy'>('overview');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [docSuccessMsg, setDocSuccessMsg] = useState<string | null>(null);

  const handleDashboardAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocUploadError(null);
    setDocSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 600 * 1024) {
      setDocUploadError(`कागदपत्राचा आकार ${(file.size / 1024).toFixed(0)} KB आहे. कृपया ६०० KB पेक्षा लहान फाईल (PDF/फोटो) निवडा.`);
      return;
    }

    setIsUploadingDoc(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_documents');
    if (res.success && res.url) {
      uploadAadhaarCard(currentUser.id, res.url);
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
  const receivedRequests = interests.filter((i) => i.toUserId === currentUser.id);
  const sentRequests = interests.filter((i) => i.fromUserId === currentUser.id);
  const shortlistedProfiles = profiles.filter((p) => shortlistedIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#A71930] shadow-md bg-amber-50 group shrink-0">
              <img
                src={currentUser.photoUrl || currentUser.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                alt="avatar"
                className="w-full h-full object-cover"
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

            {!currentUser.isFaceVerified && (
              <button
                onClick={() => setIsFaceAuthModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 border border-blue-400 animate-pulse"
              >
                <ScanFace className="w-4 h-4 text-amber-300" />
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

            <button
              onClick={() => setCurrentUser(null)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-slate-700 text-xs font-bold border border-amber-300 flex items-center gap-1 transition-all"
            >
              <LogOut className="w-4 h-4 text-[#A71930]" />
              <span>बाहेर पडा ({t('logout')})</span>
            </button>
          </div>
        </div>

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
            <Heart className="w-4 h-4" />
            <span>{t('my_interests')} ({receivedRequests.length + sentRequests.length})</span>
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
            <span>{t('notifications')} ({notifications.filter((n) => !n.isRead).length})</span>
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

            {/* 4. Aadhaar / ID Card Document Management Card */}
            <div className="bg-[#FFFDF5] p-6 rounded-3xl border-2 border-amber-300 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 shadow">
                    <ShieldCheck className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[#A71930] flex items-center gap-2">
                      <span>आधार कार्ड व ओळखपत्र व्यवस्थापन (Aadhaar & ID Proof)</span>
                    </h4>
                    <p className="text-xs text-slate-600 font-bold">
                      (नोंदणीनंतर इथे कधीही आधार जोडता किंवा अपडेट करता येते. क्लाउडवर साठवले जाते.)
                    </p>
                  </div>
                </div>

                {currentUser.idProofUrl || currentUser.aadhaarCardUrl ? (
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>कागदपत्र ऑनलाइन जतन आहे</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                    कागदपत्र अद्याप जोडलेले नाही (ऐच्छिक)
                  </span>
                )}
              </div>

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

              {/* Existing Document Display or Upload Field */}
              {currentUser.idProofUrl || currentUser.aadhaarCardUrl ? (
                <div className="bg-white p-4 rounded-2xl border border-amber-300 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900">
                        📄 तुमचा ऑनलाइन जोडलेला आधार कार्ड / आयडी दस्तऐवज:
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        हे कागदपत्र क्लाउड फायरीबेस व क्लाउडनरीवर सुरक्षित साठवलेले आहे.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={currentUser.idProofUrl || currentUser.aadhaarCardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#A71930] text-xs font-black border border-amber-300 flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-[#A71930]" />
                        <span>कागदपत्र उघडा / पहा</span>
                      </a>

                      <label className="px-4 py-2 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 text-xs font-black cursor-pointer flex items-center gap-1.5 transition-all shadow-xs">
                        {isUploadingDoc ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                            <span>अपलोड होत आहे...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-amber-200" />
                            <span>कागदपत्र बदला (Change / Update)</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleDashboardAadhaarUpload}
                          disabled={isUploadingDoc}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-amber-300 text-center space-y-3">
                  <div className="max-w-md mx-auto space-y-1">
                    <p className="text-xs text-slate-900 font-black">
                      इथे क्लिक करून तुमचे आधार कार्ड किंवा ओळखपत्राची फाईल (PDF किंवा फोटो) अपलोड करा.
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      (टीप: आधार अपलोड अनिवार्य नाही, परंतु अपलोड केल्यास तुमची प्रोफाइल अधिक विश्वासार्ह दिसते.)
                    </p>
                  </div>

                  {isUploadingDoc ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-[#A71930] font-bold text-xs">
                      <Loader2 className="w-5 h-5 animate-spin text-[#A71930]" />
                      <span>क्लाऊडवर कागदपत्र सुरक्षित अपलोड होत आहे...</span>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black text-xs cursor-pointer shadow-md border border-amber-300/40 transition-transform active:scale-95">
                      <Upload className="w-4 h-4 text-amber-200" />
                      <span>📂 आधार / दस्तऐवज फाईल निवडा (Choose PDF or Photo)</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleDashboardAadhaarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INTERESTS */}
        {tab === 'interests' && (
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-[#A71930] mb-3">मला आलेले प्रतिसाद (Received Requests)</h3>
              {receivedRequests.length === 0 ? (
                <p className="text-xs text-slate-500 bg-[#FFFDF5] p-4 rounded-xl border border-amber-200">
                  अद्याप नवीन प्रतिसाद आला नाही.
                </p>
              ) : (
                <div className="space-y-3">
                  {receivedRequests.map((req) => {
                    const sender = profiles.find((p) => p.id === req.fromUserId);
                    if (!sender) return null;

                    return (
                      <div key={req.id} className="bg-[#FFFDF5] p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={sender.photos[0]} alt="sender" className="w-12 h-12 rounded-xl object-cover border border-amber-300" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{sender.fullName}</h4>
                            <p className="text-xs text-slate-600">{sender.education} | {sender.district}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => respondInterest(req.id, 'accepted')}
                                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow"
                              >
                                स्वीकार करा (Accept)
                              </button>
                              <button
                                onClick={() => respondInterest(req.id, 'rejected')}
                                className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold border border-rose-300"
                              >
                                नाकारा
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {req.status === 'accepted' ? 'स्वीकृत केले' : 'नाकारले'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-amber-200">
              <h3 className="text-lg font-black text-[#A71930] mb-3">मी पाठवलेले प्रतिसाद (Sent Interests)</h3>
              <div className="space-y-3">
                {sentRequests.map((req) => {
                  const receiver = profiles.find((p) => p.id === req.toUserId);
                  if (!receiver) return null;

                  return (
                    <div key={req.id} className="bg-[#FFFDF5] p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={receiver.photos[0]} alt="receiver" className="w-12 h-12 rounded-xl object-cover border border-amber-300" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{receiver.fullName}</h4>
                          <p className="text-xs text-slate-600">{receiver.education} | {receiver.district}</p>
                        </div>
                      </div>

                      <span className="text-xs px-3 py-1 rounded-xl bg-amber-100 text-[#A71930] font-bold border border-amber-300">
                        स्थिती: {req.status === 'pending' ? 'प्रलंबित (Pending)' : 'स्वीकृत (Accepted)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
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
          <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 space-y-3 shadow-sm">
            <h3 className="text-lg font-black text-[#A71930] mb-4">सूचना केंद्र (Notifications)</h3>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.isRead ? 'bg-[#FFFDF5] border-amber-200 text-slate-600' : 'bg-amber-100/70 border-amber-300 text-slate-900 font-semibold'
                }`}
              >
                <p className="font-bold text-[#A71930] text-sm">{language === 'mr' ? n.titleMr : n.title}</p>
                <p className="text-xs text-slate-700 mt-1">{language === 'mr' ? n.messageMr : n.message}</p>
                <span className="text-[10px] text-slate-500 mt-2 block">{n.createdAt.split('T')[0]}</span>
              </div>
            ))}
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
