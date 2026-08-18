import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  X,
  Home,
  User,
  Heart,
  Bookmark,
  Sparkles,
  Crown,
  Bot,
  Settings,
  MessageSquare,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Headphones,
  Handshake,
  Building2,
  Scroll,
  Send,
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

export const LeftDrawer: React.FC = () => {
  const {
    isLeftDrawerOpen,
    setIsLeftDrawerOpen,
    language,
    currentUser,
    setCurrentUser,
    currentView,
    setCurrentView,
    setIsPaymentOpen,
    setIsLoginOpen,
    setLoginModalMode,
    setIsBusinessVendorDirectoryOpen,
    setIsBioDataMakerOpen,
    siteConfig
  } = useApp();

  if (!isLeftDrawerOpen) return null;

  const isEn = language === 'en';

  const handleLogout = () => {
    if (confirm(isEn ? 'Are you sure you want to log out?' : 'तुम्हाला खरोखर लॉगआउट करायचे आहे का?')) {
      setCurrentUser(null);
      setIsLeftDrawerOpen(false);
      setCurrentView('home');
    }
  };

  const handleNavigate = (view: 'home' | 'dashboard' | 'profiles') => {
    setCurrentView(view);
    setIsLeftDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsLeftDrawerOpen(false)}
          className="absolute inset-0 bg-[#0E0103] backdrop-blur-sm"
          id="left-drawer-backdrop"
        />

        {/* Drawer container sliding from left */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-[#FFFDF8] shadow-2xl flex flex-col h-full border-r border-[#FFF1C2]"
        >
          {/* Header Area with Brand/User Info */}
          <div className="relative bg-gradient-to-br from-[#800C1E] to-[#A71930] p-6 text-white overflow-hidden rounded-br-[2rem]">
            {/* Absolute Decorative Golden Ornaments */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-red-400/10 rounded-full blur-xl" />

            {/* Close Trigger */}
            <button
              onClick={() => setIsLeftDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors text-amber-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {currentUser ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  {/* Avatar wrapper */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400 overflow-hidden bg-amber-50 shadow-md">
                      {currentUser.photos && currentUser.photos.length > 0 ? (
                        <img
                          src={currentUser.photos[0]}
                          alt={currentUser.fullName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-200 to-amber-100 text-[#800C1E] font-black text-xl">
                          {currentUser.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Golden Verification Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-[#1A0307] p-1 rounded-full shadow-lg border border-amber-200">
                      <VerifiedBadge profile={currentUser} size="sm" />
                    </div>
                  </div>

                  <div>
                    <h2 className="font-extrabold text-base text-amber-100 leading-snug tracking-wide line-clamp-1">
                      {currentUser.fullName}
                    </h2>
                    <p className="text-xs text-amber-300/90 font-medium mt-0.5 font-mono">
                      ID: {currentUser.id}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-black rounded-full shadow-sm uppercase tracking-wider">
                      {currentUser.membership === 'free' ? (isEn ? 'FREE MEMBER' : 'नॉर्मल') : `VIP - ${currentUser.membership}`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                <h2 className="font-black text-lg text-amber-200">{isEn ? 'Vanjari Jodi (VanjariJodi)' : 'वंजारी जोडी (VanjariJodi)'}</h2>
                <p className="text-xs text-amber-100/80 leading-relaxed font-bold">
                  {isEn
                    ? 'Maharashtra’s #1 Trusted Vanjari Community Matrimonial Platform!'
                    : 'महाराष्ट्रातील वंजारी समाजाचे विश्वासाचे आणि हक्काचे वधू-वर सूचक व्यासपीठ!'}
                </p>
                <button
                  onClick={() => {
                    setLoginModalMode('member_otp');
                    setIsLoginOpen(true);
                    setIsLeftDrawerOpen(false);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-[#1A0307] text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#1A0307]" />
                  <span>{isEn ? 'Login / Sign In' : 'प्रवेश / लॉगिन करा'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {/* 1. Home / Explore */}
            <button
              onClick={() => handleNavigate('home')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-[#800C1E] border border-amber-400/30 font-black'
                  : 'text-slate-700 hover:bg-slate-100 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className={`w-5 h-5 ${currentView === 'home' ? 'text-[#A71930]' : 'text-slate-500'}`} />
                <span>{isEn ? 'Home' : 'मुख्यपृष्ठ (Home)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* WEDDING VENDORS & HALLS DIRECTORY */}
            {siteConfig?.enableBusinessVendors !== false && (
              <button
                onClick={() => {
                  setIsBusinessVendorDirectoryOpen(true);
                  setIsLeftDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-100/80 hover:bg-amber-200/80 text-[#800C1E] font-black border border-amber-300 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Handshake className="w-5 h-5 text-[#A71930]" />
                  <span>{isEn ? 'Vendors & Wedding Halls' : 'लग्न व्यवसाय व नेटवर्किंग'}</span>
                </div>
                <span className="text-[10px] bg-[#A71930] text-amber-100 px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                  5%-10% OFF
                </span>
              </button>
            )}

            {/* 2. My Profile & BioData (Requires login, leads to dashboard) */}
            <button
              onClick={() => {
                if (currentUser) {
                  handleNavigate('dashboard');
                } else {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                  setIsLeftDrawerOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-[#800C1E] border border-amber-400/30 font-black'
                  : 'text-slate-700 hover:bg-slate-100 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-[#A71930]' : 'text-slate-500'}`} />
                <span>{isEn ? 'My Profile & BioData' : 'माझी प्रोफाईल व बायोडाटा'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 3. Search Profiles Grid */}
            {currentUser && (
              <button
                onClick={() => handleNavigate('profiles')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                  currentView === 'profiles'
                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-[#800C1E] border border-amber-400/30 font-black'
                    : 'text-slate-700 hover:bg-slate-100 font-bold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className={`w-5 h-5 ${currentView === 'profiles' ? 'text-[#A71930]' : 'text-slate-500'}`} />
                  <span>{isEn ? 'All Bride/Groom Profiles' : 'सर्व वधू-वर बायोडाटा'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}

            {/* 4. Expressed Interests (Requires Login) */}
            {currentUser && (
              <button
                onClick={() => {
                  handleNavigate('dashboard');
                  setIsLeftDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-5 h-5 text-slate-500" />
                  <span>{isEn ? 'Interests & Responses' : 'पसंती विनंत्या (Interests)'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}

            {/* 5. Kundali Match */}
            <button
              onClick={() => {
                if (currentUser) {
                  handleNavigate('dashboard');
                  setIsLeftDrawerOpen(false);
                } else {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                  setIsLeftDrawerOpen(false);
                }
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{isEn ? 'Kundali Matching (Gun Milan)' : 'कुंडली जुळवणी (Kundali Matching)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 6. VIP Premium Upgrade */}
            <button
              onClick={() => {
                setIsPaymentOpen(true);
                setIsLeftDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-300 text-[#800C1E] font-black transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>{isEn ? 'VIP Membership Plans' : 'प्रीमियम VIP योजना (Upgrade)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>

            {/* 6.5. Online BioData Maker (PDF/JPG Generator) */}
            <button
              onClick={() => {
                setIsBioDataMakerOpen(true);
                setIsLeftDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-400 text-amber-900 font-black transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <Scroll className="w-5 h-5 text-[#A71930]" />
                <div className="text-left">
                  <span className="block text-xs font-black text-[#800C1E]">
                    {isEn ? '🎨 Online BioData Maker' : '🎨 ऑनलाईन बायोडाटा मेकर'}
                  </span>
                  <span className="block text-[9px] text-amber-800 font-bold">
                    {isEn ? 'Download Free JPG & PDF' : 'मोफत JPG & PDF डाऊनलोड करा'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700" />
            </button>

            {/* 7. OCR / AI BioData Reader */}
            <button
              onClick={() => {
                if (currentUser) {
                  handleNavigate('dashboard');
                  setIsLeftDrawerOpen(false);
                } else {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                  setIsLeftDrawerOpen(false);
                }
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-purple-600" />
                <span>{isEn ? 'AI BioData Reader' : 'AI बायोडाटा रीडर'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Divider */}
            <hr className="border-slate-100 my-4" />

            {/* Telegram Group option */}
            {siteConfig?.showTelegramBanner !== false && siteConfig?.telegramGroupUrl && siteConfig.telegramGroupUrl.trim() !== '' && (
              <a
                href={siteConfig.telegramGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl text-white bg-gradient-to-r from-sky-600 to-sky-500 font-extrabold shadow-sm hover:from-sky-500 hover:to-sky-600 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xl bg-white/20 text-white">
                    <Send className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <span className="block text-xs font-black">
                      {isEn ? '📢 Join Telegram Group' : '📢 टेलिग्राम ग्रुप जॉईन करा'}
                    </span>
                    <span className="block text-[9px] text-sky-100 font-medium">
                      {isEn ? 'Free Vadhu-Var updates' : 'मोफत वधू-वर अपडेट्ससाठी'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white" />
              </a>
            )}

            {/* 8. Help & Customer Support */}
            <button
              onClick={() => {
                const supportWidget = document.getElementById('support-chat-trigger-btn');
                if (supportWidget) {
                  supportWidget.click();
                } else {
                  alert(isEn ? 'Please click the Admin Chat button on the screen.' : 'मदत आणि सहाय्यासाठी कृपया स्क्रीनवरील ॲडमिन चॅट बटणावर क्लिक करा.');
                }
                setIsLeftDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl text-[#800C1E] bg-amber-500/5 hover:bg-amber-500/10 border border-amber-300/30 font-extrabold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-[#A71930] to-[#800C1E] text-white">
                  <Headphones className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <span>{isEn ? 'Help & Support Desk' : 'मदत व सहाय्य (Support)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Footer of Left Drawer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5 text-rose-700" />
                <span>{isEn ? 'Log Out' : 'बाहेर पडा (Log Out)'}</span>
              </button>
            ) : (
              <p className="text-center text-[10px] text-slate-400 font-medium">VanjariJodi Android PWA App v2.4.0</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
