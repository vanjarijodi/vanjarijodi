import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Phone,
  Star,
  Search,
  Edit3,
  Image,
  Settings,
  Gift,
  PhoneCall,
  Info,
  Heart,
  FileText,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';
import { AdminEditProfileModal } from './AdminEditProfileModal';
import { SuccessStories } from './SuccessStories';
import { VerificationCenterModal } from './VerificationCenterModal';

export const MobileAccountScreen: React.FC = () => {
  const {
    currentUser,
    setCurrentView,
    logout,
    shortlistedIds,
    profiles,
    setSelectedProfileForModal,
    setIsFilterOpen,
    setIsAppShareOpen,
    setIsUserSecurityOpen,
    setIsAdminOpen,
    setIsProfileRemovalModalOpen,
    updateProfile,
    siteConfig,
    language,
    interests,
    isContactAuthorizedForUser,
    isAdminLoggedIn,
    setIsLoginOpen,
    setLoginModalMode,
    setIsRegisterOpen,
  } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<
    'none' | 'contacts_seen' | 'shortlisted' | 'contact_us' | 'about_us' | 'terms' | 'success_stories'
  >('none');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const isEn = language === 'en';

  // Count of contacts seen / unlocked by current user
  const contactsSeenCount = (profiles || []).filter(
    (p) => p.id !== currentUser?.id && isContactAuthorizedForUser(p.id)
  ).length;

  const shortlistedCount = shortlistedIds?.length || 0;

  // Handler for MY PROFILE button
  const handleOpenMyProfile = () => {
    if (currentUser) {
      // Find full profile or create viewable candidate
      const fullProfile = profiles?.find((p) => p.id === currentUser.id) || currentUser;
      setSelectedProfileForModal(fullProfile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 select-none transition-colors">
      {/* 1. TOP APP BAR - EXACT MATCH TO REFERENCE SCREENSHOT */}
      <div className="sticky top-0 z-30 bg-[#800C1E] dark:bg-[#600816] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold tracking-tight">
          {isEn ? 'Account' : 'माझे खाते (Account)'}
        </h1>
        <button
          type="button"
          onClick={handleOpenMyProfile}
          className="text-xs font-black uppercase tracking-wider text-white hover:text-amber-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer border border-white/20"
        >
          {isEn ? 'MY PROFILE' : 'माझा बायोडाटा (MY PROFILE)'}
        </button>
      </div>

      {/* 2. USER MINI BADGE CARD */}
      {currentUser && (
        <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#800C1E] bg-slate-100 dark:bg-slate-800 shrink-0">
            {currentUser.photos && currentUser.photos.length > 0 ? (
              <img
                src={currentUser.photos[0]}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-[#800C1E] font-bold text-lg">
                {currentUser.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{currentUser.fullName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.mobile} • {currentUser.city || 'महाराष्ट्र'}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="text-xs text-[#800C1E] dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900/50 active:scale-95 cursor-pointer"
          >
            {isEn ? 'Edit' : 'बदला'}
          </button>
        </div>
      )}

      {/* 3. MAIN OPTIONS LIST - EXACT ROWS IN MARATHI */}
      <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
        
        {/* Row 1: Contacts Seen by Me */}
        <button
          type="button"
          onClick={() => setActiveSubModal('contacts_seen')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Phone className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Contacts Seen by Me' : 'मी पाहिलेले संपर्क (Contacts Seen)'}
            </span>
          </div>
          <span className="text-sm font-bold text-[#800C1E] dark:text-rose-400">{contactsSeenCount}</span>
        </button>

        {/* Row 2: Shortlisted Profiles */}
        <button
          type="button"
          onClick={() => setActiveSubModal('shortlisted')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Star className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Shortlisted Profiles' : 'शॉर्टलिस्ट केलेले प्रोफाईल (Shortlisted)'}
            </span>
          </div>
          <span className="text-sm font-bold text-[#800C1E] dark:text-rose-400">{shortlistedCount}</span>
        </button>

        {/* Row 3: Search History */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Search className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Search History' : 'शोध इतिहास / शोध फिल्टर (Search)'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Row 4: Edit Profile */}
        <button
          type="button"
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Edit3 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Edit Profile' : 'माहिती संपादित करा (Edit Profile)'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Row 5: Photos (with red dot indicator) */}
        <button
          type="button"
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Image className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Photos' : 'माझे फोटो (Photos)'}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#800C1E]" />
        </button>

        {/* Row 6: Account Security & Password */}
        <button
          type="button"
          onClick={() => setIsUserSecurityOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Account Security & Password' : 'खाते सुरक्षा व पासवर्ड'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Row 6.5: Aadhaar & Selfie KYC Verification (Blue Tick) */}
        <button
          type="button"
          onClick={() => setIsKycModalOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#800C1E] dark:text-rose-400" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isEn ? 'Aadhaar & Selfie Verification' : 'आधार व सेल्फी पडताळणी'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentUser?.verification_status === 'Approved'
                  ? '✓ प्रोफाइल प्रमाणित (Blue Tick सक्रिय)'
                  : currentUser?.verification_status === 'Pending Review'
                  ? '⏳ पडताळणी प्रलंबित (तपासणी सुरू)'
                  : 'ब्लू टिक मिळवण्यासाठी पडताळणी करा'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                currentUser?.verification_status === 'Approved'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : currentUser?.verification_status === 'Pending Review'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {currentUser?.verification_status === 'Approved'
                ? '✓ Verified'
                : currentUser?.verification_status === 'Pending Review'
                ? 'Pending'
                : 'पडताळणी करा'}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* Row 7: Get Free Contacts */}
        <button
          type="button"
          onClick={() => setIsAppShareOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Gift className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Get Free Contacts' : 'मोफत संपर्क मिळवा (Get Free Contacts)'}
            </span>
          </div>
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            मोफत
          </span>
        </button>

        {/* Row 8: Dark / Light Mode Toggle */}
        <div
          onClick={toggleTheme}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-amber-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Dark Mode' : 'डार्क मोड (Dark Theme)'}
            </span>
          </div>
          <div
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
              isDarkMode ? 'bg-[#800C1E]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 4. HELP SECTION - MARATHI HEADERS */}
      <div className="mt-2 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <div className="px-4 pt-3.5 pb-1">
          <h3 className="text-sm font-bold text-[#800C1E] dark:text-rose-400 tracking-wide">
            {isEn ? 'Help & Support' : 'मदत व माहिती (Help & Support)'}
          </h3>
        </div>

        {/* Help Row 1: Contact Us */}
        <button
          type="button"
          onClick={() => setActiveSubModal('contact_us')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <PhoneCall className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Contact Us' : 'आमच्याशी संपर्क साधा (Contact Us)'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Help Row 2: About Us */}
        <button
          type="button"
          onClick={() => setActiveSubModal('about_us')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Info className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'About Us' : 'आमच्याबद्दल माहिती (About Us)'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Help Row 3: Success Stories */}
        <button
          type="button"
          onClick={() => setActiveSubModal('success_stories')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Heart className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Success Stories' : 'यशस्वी विवाह गाथा (Success Stories)'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Help Row 4: Terms and Privacy Policy */}
        <button
          type="button"
          onClick={() => setActiveSubModal('terms')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? 'Terms and Privacy Policy' : 'नियम व गोपनीयता धोरण (Terms & Privacy)'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Row 5: Delete Profile (New Explicit Option) */}
        {currentUser && (
          <button
            type="button"
            onClick={() => setIsProfileRemovalModalOpen(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 transition cursor-pointer border-t border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-rose-700 dark:text-rose-400">
                  {isEn ? 'Delete Profile' : 'प्रोफाईल डिलीट करा (Delete Profile)'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isEn ? 'Marriage fixed or account removal with disclaimer' : 'लग्न जुळल्यास किंवा खाते कायमचे हटवण्यासाठी'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        )}

        {/* Logout / Login Row */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 transition cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <LogOut className="w-5 h-5 text-rose-700 dark:text-rose-400" />
              <span className="text-sm font-bold">
                {currentUser.isGuest ? (isEn ? 'End Guest Session' : 'गेस्ट सेशन बंद करा (Logout)') : (isEn ? 'Log Out' : 'बाहेर पडा (Logout)')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setLoginModalMode('member_otp');
              setIsLoginOpen(true);
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-amber-50 dark:hover:bg-amber-950/30 text-[#800C1E] dark:text-amber-400 transition cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <User className="w-5 h-5 text-[#800C1E] dark:text-amber-400" />
              <span className="text-sm font-bold">
                {isEn ? 'Login / Register Account' : 'लॉगिन किंवा नवीन नोंदणी करा'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#800C1E] dark:text-amber-400" />
          </button>
        )}
      </div>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-center mx-auto shadow-inner">
              <LogOut className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {isEn ? 'Log Out Account?' : 'खात्यातून लॉग आऊट करायचे आहे का?'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {isEn
                  ? 'Your session will be closed safely. You can log back in anytime with your mobile number.'
                  : 'तुमचे सत्र सुरक्षितपणे बंद केले जाईल. आपण आपल्या मोबाईल नंबरने पुन्हा कधीही सहज लॉगिन करू शकता.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              >
                {isEn ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  setCurrentView('home');
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isEn ? 'Yes, Log Out' : 'होय, लॉग आऊट करा'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Quick Access - Always available */}
      <div className="px-4 py-4 text-center">
        <button
          type="button"
          onClick={() => setIsAdminOpen(true)}
          className="text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 border-2 border-amber-500 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md active:scale-95 transition-all w-full max-w-sm"
        >
          <ShieldCheck className="w-5 h-5 text-slate-950" />
          <span>👑 ॲडमिन लॉगिन (Admin Panel)</span>
        </button>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && currentUser && (
        <AdminEditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          profile={currentUser}
          onSave={(profileId, updatedFields) => updateProfile(profileId, updatedFields)}
          isSelfEdit={true}
        />
      )}

      {/* CONTACTS SEEN MODAL */}
      {activeSubModal === 'contacts_seen' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3.5 bg-[#800C1E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Contacts Seen by Me ({contactsSeenCount})</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-white/80 hover:text-white font-black text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {contactsSeenCount === 0 ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  तुम्ही अद्याप कोणत्याही स्थळाचा संपर्क अनलॉक केलेला नाही.
                </div>
              ) : (
                profiles
                  ?.filter((p) => p.id !== currentUser?.id && isContactAuthorizedForUser(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveSubModal('none');
                        setSelectedProfileForModal(p);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <img
                        src={p.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={p.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{p.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.age} वर्षे • {p.city || p.district}</p>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">📞 {p.mobile}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHORTLISTED PROFILES MODAL */}
      {activeSubModal === 'shortlisted' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3.5 bg-[#800C1E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Shortlisted Profiles ({shortlistedCount})</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-white/80 hover:text-white font-black text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {shortlistedCount === 0 ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  तुम्ही कोणतीही स्थळे शॉर्टलिस्ट केलेली नाहीत. स्थळांवर स्टार दाबून शॉर्टलिस्ट करा.
                </div>
              ) : (
                profiles
                  ?.filter((p) => shortlistedIds.includes(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveSubModal('none');
                        setSelectedProfileForModal(p);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                    >
                      <img
                        src={p.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={p.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{p.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.age} वर्षे • {p.education}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{p.city || p.district}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTACT US MODAL */}
      {activeSubModal === 'contact_us' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">आमच्याशी संपर्क साधा</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/50 space-y-1">
                <p className="font-bold text-[#800C1E] dark:text-rose-300">{siteConfig?.logoTitle || 'वंजारी जोडी वधू-वर सूचक केंद्र'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">विश्वसनीय वंजारी समाज विवाह सेवा</p>
              </div>
              <a
                href={`tel:${siteConfig?.contactPhone || '9890000000'}`}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 transition"
              >
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <span>फोन: {siteConfig?.contactPhone || '9890000000'}</span>
              </a>
              <a
                href={`https://wa.me/91${(siteConfig?.contactPhone || '9890000000').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 rounded-xl font-bold text-emerald-800 dark:text-emerald-300 transition"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>व्हॉट्सॲप मेसेज</span>
              </a>
              <a
                href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950/70 rounded-xl font-bold text-sky-800 dark:text-sky-300 transition"
              >
                <ExternalLink className="w-5 h-5 text-sky-600" />
                <span>टेलिग्राम सहाय्यता</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT US MODAL */}
      {activeSubModal === 'about_us' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">आमच्याबद्दल (About Us)</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <p className="font-bold text-sm text-[#800C1E] dark:text-rose-300">
                {siteConfig?.logoTitle || 'वंजारी जोडी वधू-वर सूचक केंद्र'}
              </p>
              <p>
                महाराष्ट्रातील समस्त वंजारी समाजासाठी समर्पित, आधुनिक व सुरक्षित वधू-वर सूचक व्यासपीठ.
                येथे उच्चशिक्षित, शासकीय सेवेतील, व्यावसायिक आणि सुसंस्कृत स्थळांची खात्रीशीर माहिती उपलब्ध करून दिली जाते.
              </p>
              <p>
                आमचे उद्दिष्ट समाजातील अनुरूप जोडीदारांची ओळख सोपी, पारदर्शक आणि सन्मानपूर्वक पद्धतीने करून देणे हे आहे.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS STORIES MODAL */}
      {activeSubModal === 'success_stories' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="px-4 py-3 bg-[#800C1E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Success Stories (विवाह गाथा)</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-white/80 hover:text-white font-black text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SuccessStories />
            </div>
          </div>
        </div>
      )}

      {/* TERMS AND PRIVACY POLICY MODAL */}
      {activeSubModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">नियम व गोपनीयता धोरण</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">१. सदस्यत्व व माहिती सत्यता:</p>
              <p>सर्व सभासदांनी आपली खरी आणि अचूक माहिती भरणे अनिवार्य आहे. खोटी माहिती आढळल्यास प्रोफाईल तात्काळ बंद करण्यात येईल.</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">२. संपर्क व गोपनीयता:</p>
              <p>महिला सभासदांच्या गोपनीयतेचे पूर्ण रक्षण केले जाते. केवळ सत्यापित व अधिकृत सभासदांना संपर्क तपशील दिले जातात.</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">३. डिजिटल सुरक्षा:</p>
              <p>आपला डेटा आधुनिक एन्क्रिप्शनद्वारे पूर्णपणे सुरक्षित आहे.</p>
            </div>
          </div>
        </div>
      )}
      {/* KYC & AADHAAR / SELFIE VERIFICATION CENTER MODAL */}
      {isKycModalOpen && (
        <VerificationCenterModal
          isOpen={isKycModalOpen}
          onClose={() => setIsKycModalOpen(false)}
        />
      )}
    </div>
  );
};
