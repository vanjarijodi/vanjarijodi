import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Sparkles,
  Search,
  MessageCircle,
  User,
  Heart,
  LogIn,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    language,
    currentUser,
    setIsLoginOpen,
    setLoginModalMode,
    setIsRegisterOpen,
    notifications,
    isAdminOpen,
    profiles,
  } = useApp();

  // Hide on Admin Panel to maximize workspace
  if (isAdminOpen) return null;

  const isEn = language === 'en';

  // Unread notifications & chat messages
  const unreadCount = (notifications || []).filter(
    (n) =>
      !n.isRead &&
      (n.userId === 'broadcast' || n.userId === 'all' || n.userId === currentUser?.id)
  ).length;

  // Active profiles count for badge
  const totalProfilesCount = (profiles || []).length;

  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {}
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabClick = (tabId: 'home' | 'profiles' | 'matches' | 'chat' | 'account') => {
    triggerHaptic();
    
    if (tabId === 'home') {
      setCurrentView('home');
      scrollToTop();
    } else if (tabId === 'profiles') {
      setCurrentView('profiles');
      scrollToTop();
    } else if (tabId === 'matches') {
      if (currentUser) {
        setCurrentView('matches');
        scrollToTop();
      } else {
        setLoginModalMode('member_otp');
        setIsLoginOpen(true);
      }
    } else if (tabId === 'chat') {
      if (currentUser) {
        setCurrentView('chat');
        scrollToTop();
      } else {
        setLoginModalMode('member_otp');
        setIsLoginOpen(true);
      }
    } else if (tabId === 'account') {
      if (currentUser) {
        setCurrentView('account');
        scrollToTop();
      } else {
        setLoginModalMode('member_otp');
        setIsLoginOpen(true);
      }
    }
  };

  const isHomeActive = currentView === 'home';
  const isProfilesActive = currentView === 'profiles';
  const isMatchesActive = currentView === 'matches';
  const isChatActive = currentView === 'chat';
  const isAccountActive = currentView === 'account' || currentView === 'dashboard';

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden w-full pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-amber-300/80 dark:border-amber-500/30 shadow-[0_-8px_30px_rgba(128,12,30,0.14)] select-none rounded-t-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center px-1.5 pt-2 pb-1 gap-0.5">
        
        {/* 1. 🏠 मुख्य होम (Home) */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          aria-label={isEn ? 'Home' : 'मुख्य होम'}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 transition-all duration-200 active:scale-90 cursor-pointer ${
            isHomeActive
              ? 'text-[#800C1E] dark:text-amber-300 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div 
            className={`px-3.5 py-1 rounded-2xl transition-all duration-200 relative ${
              isHomeActive
                ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 dark:bg-amber-950/70 border border-amber-400 shadow-sm -translate-y-1 scale-105'
                : 'bg-transparent'
            }`}
          >
            <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5px] text-[#800C1E]' : 'stroke-2'}`} />
          </div>
          <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight font-black transition-all ${
            isHomeActive ? 'text-[#800C1E] scale-105' : 'text-slate-600'
          }`}>
            {isEn ? 'Home' : 'होम'}
          </span>
          {isHomeActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#800C1E] dark:bg-amber-400 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* 2. 🔍 सर्व स्थळे शोधा (Profiles) */}
        <button
          type="button"
          onClick={() => handleTabClick('profiles')}
          aria-label={isEn ? 'Profiles' : 'स्थळे शोधा'}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 transition-all duration-200 active:scale-90 cursor-pointer relative ${
            isProfilesActive
              ? 'text-[#800C1E] dark:text-amber-300 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div 
            className={`px-3.5 py-1 rounded-2xl transition-all duration-200 relative ${
              isProfilesActive
                ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 dark:bg-amber-950/70 border border-amber-400 shadow-sm -translate-y-1 scale-105'
                : 'bg-transparent'
            }`}
          >
            <Search className={`w-5 h-5 ${isProfilesActive ? 'stroke-[2.5px] text-[#800C1E]' : 'stroke-2'}`} />
            {totalProfilesCount > 0 && !isProfilesActive && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                {totalProfilesCount > 99 ? '99+' : totalProfilesCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight font-black transition-all ${
            isProfilesActive ? 'text-[#800C1E] scale-105' : 'text-slate-600'
          }`}>
            {isEn ? 'Profiles' : 'स्थळे'}
          </span>
          {isProfilesActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#800C1E] dark:bg-amber-400 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* 3. ✨ अनुरूप मॅचेस (Matches) */}
        <button
          type="button"
          onClick={() => handleTabClick('matches')}
          aria-label={isEn ? 'Matches' : 'अनुरूप मॅचेस'}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 transition-all duration-200 active:scale-90 cursor-pointer relative ${
            isMatchesActive
              ? 'text-[#800C1E] dark:text-amber-300 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div 
            className={`px-3.5 py-1 rounded-2xl transition-all duration-200 relative ${
              isMatchesActive
                ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 dark:bg-amber-950/70 border border-amber-400 shadow-sm -translate-y-1 scale-105'
                : 'bg-transparent'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isMatchesActive ? 'stroke-[2.5px] text-[#800C1E]' : 'stroke-2'}`} />
            <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-[7.5px] font-black uppercase tracking-tighter shadow-xs">
              {isEn ? 'Match' : 'जोडी'}
            </span>
          </div>
          <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight font-black transition-all ${
            isMatchesActive ? 'text-[#800C1E] scale-105' : 'text-slate-600'
          }`}>
            {isEn ? 'Matches' : 'मॅचेस'}
          </span>
          {isMatchesActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#800C1E] dark:bg-amber-400 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* 4. 💬 चॅट व मेसेज (Chat & Support) */}
        <button
          type="button"
          onClick={() => handleTabClick('chat')}
          aria-label={isEn ? 'Chat' : 'चॅट व मेसेज'}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 transition-all duration-200 active:scale-90 cursor-pointer relative ${
            isChatActive
              ? 'text-[#800C1E] dark:text-amber-300 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div 
            className={`px-3.5 py-1 rounded-2xl transition-all duration-200 relative ${
              isChatActive
                ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 dark:bg-amber-950/70 border border-amber-400 shadow-sm -translate-y-1 scale-105'
                : 'bg-transparent'
            }`}
          >
            <MessageCircle className={`w-5 h-5 ${isChatActive ? 'stroke-[2.5px] text-[#800C1E]' : 'stroke-2'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#800C1E] text-amber-200 text-[9px] font-black flex items-center justify-center border border-amber-300 shadow-xs animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight font-black transition-all ${
            isChatActive ? 'text-[#800C1E] scale-105' : 'text-slate-600'
          }`}>
            {isEn ? 'Chat' : 'चॅट'}
          </span>
          {isChatActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#800C1E] dark:bg-amber-400 mt-0.5 shadow-xs" />
          )}
        </button>

        {/* 5. 👤 प्रोफाइल किंवा लॉगिन (Account / Login) */}
        <button
          type="button"
          onClick={() => handleTabClick('account')}
          aria-label={currentUser ? (isEn ? 'Account' : 'माझे खाते') : (isEn ? 'Login' : 'लॉगिन करा')}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 transition-all duration-200 active:scale-90 cursor-pointer ${
            isAccountActive
              ? 'text-[#800C1E] dark:text-amber-300 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div 
            className={`px-3.5 py-1 rounded-2xl transition-all duration-200 relative ${
              isAccountActive
                ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 dark:bg-amber-950/70 border border-amber-400 shadow-sm -translate-y-1 scale-105'
                : 'bg-transparent'
            }`}
          >
            {currentUser && currentUser.photos?.[0] ? (
              <img
                src={currentUser.photos[0]}
                alt="Account"
                className={`w-5 h-5 rounded-full object-cover border ${
                  isAccountActive ? 'border-[#800C1E] ring-1 ring-amber-400' : 'border-slate-300'
                }`}
              />
            ) : currentUser ? (
              <User className={`w-5 h-5 ${isAccountActive ? 'stroke-[2.5px] text-[#800C1E]' : 'stroke-2'}`} />
            ) : (
              <LogIn className={`w-5 h-5 ${isAccountActive ? 'stroke-[2.5px] text-[#800C1E]' : 'stroke-2 text-amber-700'}`} />
            )}
          </div>
          <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight font-black transition-all ${
            isAccountActive ? 'text-[#800C1E] scale-105' : 'text-slate-600'
          }`}>
            {currentUser ? (isEn ? 'Account' : 'खाते') : (isEn ? 'Login' : 'लॉगिन')}
          </span>
          {isAccountActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#800C1E] dark:bg-amber-400 mt-0.5 shadow-xs" />
          )}
        </button>

      </div>
    </nav>
  );
};

export default MobileBottomNav;
