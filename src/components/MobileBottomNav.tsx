import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Heart,
  Search,
  Sparkles,
  User,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    language,
    currentUser,
    setIsLoginOpen,
    setLoginModalMode,
    siteConfig,
    setIsKundaliModalOpen,
    setIsRightDrawerOpen,
    isAdminOpen,
  } = useApp();

  if (isAdminOpen) return null;

  const isEn = language === 'en';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'home') {
      setCurrentView('home');
      scrollToTop();
    } else if (tabId === 'matches') {
      if (currentUser) {
        setCurrentView('matches');
        scrollToTop();
      } else {
        setLoginModalMode('member_otp');
        setIsLoginOpen(true);
      }
    } else if (tabId === 'search') {
      setIsRightDrawerOpen(true);
    } else if (tabId === 'kundali') {
      setIsKundaliModalOpen(true);
    } else if (tabId === 'profile') {
      if (currentUser) {
        setCurrentView('dashboard');
        scrollToTop();
      } else {
        setLoginModalMode('member_otp');
        setIsLoginOpen(true);
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden w-full pointer-events-auto bg-white/95 backdrop-blur-md border-t border-amber-200/70 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none pb-[max(0.4rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center px-1 pt-1.5">
        
        {/* 1. 🏠 Home */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          aria-label={isEn ? 'Home' : 'होम'}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-colors cursor-pointer ${
            currentView === 'home'
              ? 'text-[#800C1E] font-black'
              : 'text-slate-600 hover:text-slate-900 font-bold'
          }`}
        >
          <div className={`p-1 rounded-full transition-all ${currentView === 'home' ? 'bg-amber-100/90 text-[#800C1E]' : 'text-slate-600'}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight mt-0.5 whitespace-nowrap">
            {isEn ? 'Home' : 'होम'}
          </span>
        </button>

        {/* 2. ❤️ Matches / वर-वधू */}
        <button
          type="button"
          onClick={() => handleTabClick('matches')}
          aria-label={isEn ? 'Matches' : 'मॅचेस'}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-colors cursor-pointer ${
            currentView === 'matches'
              ? 'text-[#800C1E] font-black'
              : 'text-slate-600 hover:text-slate-900 font-bold'
          }`}
        >
          <div className={`p-1 rounded-full transition-all ${currentView === 'matches' ? 'bg-amber-100/90 text-[#800C1E]' : 'text-slate-600'}`}>
            <Heart className={`w-5 h-5 ${currentView === 'matches' ? 'fill-[#800C1E]' : ''}`} />
          </div>
          <span className="text-[10px] leading-tight tracking-tight mt-0.5 whitespace-nowrap">
            {isEn ? 'Matches' : 'मॅचेस'}
          </span>
        </button>

        {/* 3. 🔍 Search */}
        <button
          type="button"
          onClick={() => handleTabClick('search')}
          aria-label={isEn ? 'Search' : 'शोध'}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl text-slate-600 hover:text-[#800C1E] font-bold transition-colors cursor-pointer"
        >
          <div className="p-1 rounded-full hover:bg-slate-100">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight mt-0.5 whitespace-nowrap">
            {isEn ? 'Search' : 'शोध'}
          </span>
        </button>

        {/* 4. ✨ Kundali */}
        <button
          type="button"
          onClick={() => handleTabClick('kundali')}
          aria-label={isEn ? 'Kundali' : 'कुंडली'}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl text-amber-800 hover:text-amber-900 font-bold transition-colors cursor-pointer"
        >
          <div className="p-1 rounded-full bg-amber-50 text-amber-700">
            <Sparkles className="w-5 h-5 fill-amber-300" />
          </div>
          <span className="text-[10px] leading-tight tracking-tight mt-0.5 whitespace-nowrap">
            {isEn ? 'Kundali' : 'कुंडली'}
          </span>
        </button>

        {/* 5. 👤 Profile */}
        <button
          type="button"
          onClick={() => handleTabClick('profile')}
          aria-label={isEn ? 'Profile' : 'प्रोफाईल'}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-colors cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-[#800C1E] font-black'
              : 'text-slate-600 hover:text-slate-900 font-bold'
          }`}
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all ${
            currentView === 'dashboard' ? 'border-[#800C1E] ring-2 ring-amber-200' : 'border-slate-300 bg-slate-100'
          }`}>
            {currentUser?.photos && currentUser.photos.length > 0 ? (
              <img
                src={currentUser.photos[0]}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
          <span className="text-[10px] leading-tight tracking-tight mt-0.5 whitespace-nowrap">
            {isEn ? 'Profile' : 'प्रोफाईल'}
          </span>
        </button>

      </div>
    </nav>
  );
};

