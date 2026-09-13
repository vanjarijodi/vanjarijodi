import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  MessageSquare,
  Bell,
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
    notifications,
    isAdminOpen,
  } = useApp();

  if (isAdminOpen) return null;

  const isEn = language === 'en';

  const unreadCount = (notifications || []).filter(
    (n) =>
      !n.isRead &&
      (n.userId === 'broadcast' || n.userId === 'all' || n.userId === currentUser?.id)
  ).length;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabClick = (tabId: 'home' | 'chat' | 'notifications' | 'account') => {
    if (tabId === 'home') {
      setCurrentView('home');
      scrollToTop();
    } else if (tabId === 'chat') {
      if (currentUser) {
        setCurrentView('chat');
        scrollToTop();
      } else {
        setLoginModalMode('member_otp');
        setIsLoginOpen(true);
      }
    } else if (tabId === 'notifications') {
      if (currentUser) {
        setCurrentView('notifications');
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
  const isChatActive = currentView === 'chat';
  const isNotificationsActive = currentView === 'notifications';
  const isAccountActive = currentView === 'account' || currentView === 'dashboard';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden w-full pointer-events-auto bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] select-none pb-[max(0.4rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center px-2 pt-1.5 pb-1">
        
        {/* 1. 🏠 Home */}
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          aria-label={isEn ? 'Home' : 'Home'}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors cursor-pointer ${
            isHomeActive ? 'text-[#A71930]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'fill-[#A71930]' : ''}`} />
          <span className="text-[11px] leading-tight font-medium mt-1">
            {isEn ? 'Home' : 'Home'}
          </span>
        </button>

        {/* 2. 💬 Chat */}
        <button
          type="button"
          onClick={() => handleTabClick('chat')}
          aria-label={isEn ? 'Chat' : 'Chat'}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors cursor-pointer ${
            isChatActive ? 'text-[#A71930]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${isChatActive ? 'fill-[#A71930]' : ''}`} />
          <span className="text-[11px] leading-tight font-medium mt-1">
            {isEn ? 'Chat' : 'Chat'}
          </span>
        </button>

        {/* 3. 🔔 Notifications (with red notification count badge) */}
        <button
          type="button"
          onClick={() => handleTabClick('notifications')}
          aria-label={isEn ? 'Notifications' : 'Notifications'}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors cursor-pointer relative ${
            isNotificationsActive ? 'text-[#A71930]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 ${isNotificationsActive ? 'fill-[#A71930]' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#A71930] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight font-medium mt-1">
            {isEn ? 'Notifications' : 'Notifications'}
          </span>
        </button>

        {/* 4. 👤 Account */}
        <button
          type="button"
          onClick={() => handleTabClick('account')}
          aria-label={isEn ? 'Account' : 'Account'}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors cursor-pointer ${
            isAccountActive ? 'text-[#A71930]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className={`w-5 h-5 ${isAccountActive ? 'fill-[#A71930]' : ''}`} />
          <span className="text-[11px] leading-tight font-medium mt-1">
            {isEn ? 'Account' : 'Account'}
          </span>
        </button>

      </div>
    </nav>
  );
};
