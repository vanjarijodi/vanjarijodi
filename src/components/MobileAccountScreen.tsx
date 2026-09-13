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
} from 'lucide-react';
import { AdminEditProfileModal } from './AdminEditProfileModal';
import { SuccessStories } from './SuccessStories';

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
    updateProfile,
    siteConfig,
    language,
    interests,
    isContactAuthorizedForUser,
    isAdminLoggedIn,
  } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<
    'none' | 'contacts_seen' | 'shortlisted' | 'contact_us' | 'about_us' | 'terms' | 'success_stories'
  >('none');

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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 select-none">
      {/* 1. TOP APP BAR - EXACT MATCH TO REFERENCE SCREENSHOT */}
      <div className="sticky top-0 z-30 bg-[#A71930] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold tracking-tight">
          {isEn ? 'Account' : 'Account'}
        </h1>
        <button
          type="button"
          onClick={handleOpenMyProfile}
          className="text-xs font-black uppercase tracking-wider text-white hover:text-amber-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer border border-white/20"
        >
          {isEn ? 'MY PROFILE' : 'MY PROFILE'}
        </button>
      </div>

      {/* 2. USER MINI BADGE CARD */}
      {currentUser && (
        <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#A71930] bg-slate-100 shrink-0">
            {currentUser.photos && currentUser.photos.length > 0 ? (
              <img
                src={currentUser.photos[0]}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-rose-50 text-[#A71930] font-bold text-lg">
                {currentUser.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 text-sm truncate">{currentUser.fullName}</h2>
            <p className="text-xs text-slate-500 truncate">{currentUser.mobile} • {currentUser.city || 'महाराष्ट्र'}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="text-xs text-[#A71930] font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 active:scale-95"
          >
            {isEn ? 'Edit' : 'बदला'}
          </button>
        </div>
      )}

      {/* 3. MAIN OPTIONS LIST - EXACT ROWS AS IN REFERENCE SCREENSHOT */}
      <div className="bg-white divide-y divide-slate-100 border-b border-slate-200">
        
        {/* Row 1: Contacts Seen by Me */}
        <button
          type="button"
          onClick={() => setActiveSubModal('contacts_seen')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Phone className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Contacts Seen by Me' : 'Contacts Seen by Me'}
            </span>
          </div>
          <span className="text-sm font-bold text-[#A71930]">{contactsSeenCount}</span>
        </button>

        {/* Row 2: Shortlisted Profiles */}
        <button
          type="button"
          onClick={() => setActiveSubModal('shortlisted')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Star className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Shortlisted Profiles' : 'Shortlisted Profiles'}
            </span>
          </div>
          <span className="text-sm font-bold text-[#A71930]">{shortlistedCount}</span>
        </button>

        {/* Row 3: Search History */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Search className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Search History' : 'Search History'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Row 4: Edit Profile */}
        <button
          type="button"
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Edit3 className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Edit Profile' : 'Edit Profile'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Row 5: Photos (with red dot indicator) */}
        <button
          type="button"
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Image className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Photos' : 'Photos'}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#A71930]" />
        </button>

        {/* Row 6: Account Security & Password */}
        <button
          type="button"
          onClick={() => setIsUserSecurityOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Settings className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Account Security & Password' : 'खाते सुरक्षा व पासवर्ड'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Row 7: Get Free Contacts */}
        <button
          type="button"
          onClick={() => setIsAppShareOpen(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Gift className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Get Free Contacts' : 'Get Free Contacts'}
            </span>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            मोफत
          </span>
        </button>
      </div>

      {/* 4. HELP SECTION - EXACT MATCH TO REFERENCE SCREENSHOT */}
      <div className="mt-2 bg-white border-y border-slate-200 divide-y divide-slate-100">
        <div className="px-4 pt-3.5 pb-1">
          <h3 className="text-sm font-bold text-[#A71930] tracking-wide">
            {isEn ? 'Help' : 'Help'}
          </h3>
        </div>

        {/* Help Row 1: Contact Us */}
        <button
          type="button"
          onClick={() => setActiveSubModal('contact_us')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <PhoneCall className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Contact Us' : 'Contact Us'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Help Row 2: About Us */}
        <button
          type="button"
          onClick={() => setActiveSubModal('about_us')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Info className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'About Us' : 'About Us'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Help Row 3: Success Stories */}
        <button
          type="button"
          onClick={() => setActiveSubModal('success_stories')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Heart className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Success Stories' : 'Success Stories'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Help Row 4: Terms and Privacy Policy */}
        <button
          type="button"
          onClick={() => setActiveSubModal('terms')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <FileText className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-semibold text-slate-800">
              {isEn ? 'Terms and Privacy Policy' : 'Terms and Privacy Policy'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Logout Row */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('तुम्हाला खरोखर लॉगआउट करायचे आहे का?')) {
              logout();
              setCurrentView('home');
            }
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-rose-50 text-rose-700 transition cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <LogOut className="w-5 h-5 text-rose-700" />
            <span className="text-sm font-bold">
              {isEn ? 'Logout' : 'बाहेर पडा (Logout)'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>

      {/* Admin Panel Quick Access (ONLY if user is actually an admin or logged in as admin) */}
      {(isAdminLoggedIn || currentUser?.isAdmin) && (
        <div className="px-4 py-4 text-center">
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 mx-auto py-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>ॲडमिन पोर्टल लॉगिन</span>
          </button>
        </div>
      )}

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
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3.5 bg-[#A71930] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Contacts Seen by Me ({contactsSeenCount})</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-white/80 hover:text-white font-black text-base"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {contactsSeenCount === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
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
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <img
                        src={p.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={p.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{p.fullName}</p>
                        <p className="text-xs text-slate-500">{p.age} वर्षे • {p.city || p.district}</p>
                        <p className="text-xs font-semibold text-emerald-700">📞 {p.mobile}</p>
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
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3.5 bg-[#A71930] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Shortlisted Profiles ({shortlistedCount})</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-white/80 hover:text-white font-black text-base"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {shortlistedCount === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
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
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <img
                        src={p.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={p.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{p.fullName}</p>
                        <p className="text-xs text-slate-500">{p.age} वर्षे • {p.education}</p>
                        <p className="text-xs text-slate-600">{p.city || p.district}</p>
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">आमच्याशी संपर्क साधा</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 space-y-1">
                <p className="font-bold text-[#A71930]">{siteConfig?.logoTitle || 'वंजारी जोडी वधू-वर सूचक केंद्र'}</p>
                <p className="text-xs text-slate-600">विश्वसनीय वंजारी समाज विवाह सेवा</p>
              </div>
              <a
                href={`tel:${siteConfig?.contactPhone || '9890000000'}`}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-slate-800"
              >
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <span>फोन: {siteConfig?.contactPhone || '9890000000'}</span>
              </a>
              <a
                href={`https://wa.me/91${(siteConfig?.contactPhone || '9890000000').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold text-emerald-800"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>व्हॉट्सॲप मेसेज</span>
              </a>
              <a
                href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-sky-50 hover:bg-sky-100 rounded-xl font-bold text-sky-800"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">आमच्याबद्दल (About Us)</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <p className="font-bold text-sm text-[#A71930]">
                {siteConfig?.logoTitle || 'वंजारी जोडी वधू-वर सूचक केंद्र'}
              </p>
              <p>
                महाराष्ट्रातील समस्त वंजारी समाजासाठी समर्पित, आधुनिक व १००% सुरक्षित वधू-वर सूचक व्यासपीठ.
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
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-[#A71930] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Success Stories (विवाह गाथा)</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-white/80 hover:text-white font-black text-base"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">नियम व गोपनीयता धोरण</h3>
              <button
                type="button"
                onClick={() => setActiveSubModal('none')}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <p className="font-bold text-slate-800">१. सदस्यत्व व माहिती सत्यता:</p>
              <p>सर्व सभासदांनी आपली खरी आणि अचूक माहिती भरणे अनिवार्य आहे. खोटी माहिती आढळल्यास प्रोफाईल तात्काळ बंद करण्यात येईल.</p>
              <p className="font-bold text-slate-800">२. संपर्क व गोपनीयता:</p>
              <p>महिला सभासदांच्या गोपनीयतेचे पूर्ण रक्षण केले जाते. केवळ सत्यापित व अधिकृत सभासदांना संपर्क तपशील दिले जातात.</p>
              <p className="font-bold text-slate-800">३. डिजिटल सुरक्षा:</p>
              <p>आपला डेटा आधुनिक एन्क्रिप्शनद्वारे पूर्णपणे सुरक्षित आहे.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
