import React, { useState, useEffect } from 'react';
import { Heart, Bell, MessageCircle, Sparkles, CreditCard, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ToastData {
  title: string;
  body: string;
  icon?: string;
  avatarUrl?: string;
  url?: string;
  type?: 'interest' | 'match' | 'chat' | 'payment' | 'system';
  timestamp: number;
}

export const LivePushNotificationToast: React.FC = () => {
  const { setCurrentView, setIsNotificationCenterOpen, setIsPaymentOpen, language } = useApp();
  const [currentToast, setCurrentToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      if (customEvent.detail) {
        setCurrentToast(customEvent.detail);
        setIsVisible(true);
      }
    };

    window.addEventListener('vanjari_new_notification_toast', handleToastEvent);
    return () => {
      window.removeEventListener('vanjari_new_notification_toast', handleToastEvent);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, currentToast?.timestamp]);

  if (!isVisible || !currentToast) return null;

  const handleToastClick = () => {
    setIsVisible(false);
    if (currentToast.url) {
      if (currentToast.url.includes('matches')) {
        setCurrentView('matches');
      } else if (currentToast.url.includes('membership') || currentToast.url.includes('payment')) {
        setIsPaymentOpen(true);
      } else if (currentToast.url.includes('dashboard')) {
        setCurrentView('dashboard');
      } else if (currentToast.url.includes('profiles')) {
        setCurrentView('profiles');
      } else {
        setIsNotificationCenterOpen(true);
      }
    } else if (currentToast.type === 'interest' || currentToast.type === 'match') {
      setCurrentView('matches');
    } else {
      setIsNotificationCenterOpen(true);
    }
  };

  const getIcon = () => {
    if (currentToast.type === 'interest') return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
    if (currentToast.type === 'match') return <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />;
    if (currentToast.type === 'chat') return <MessageCircle className="w-5 h-5 text-blue-400" />;
    if (currentToast.type === 'payment') return <CreditCard className="w-5 h-5 text-emerald-400" />;
    return <Bell className="w-5 h-5 text-amber-300" />;
  };

  return (
    <div className="fixed top-2 sm:top-4 inset-x-0 z-[9999] flex justify-center px-3 pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div className="w-full max-w-md bg-gradient-to-r from-slate-950 via-[#4A0711] to-slate-950 text-white rounded-2xl p-3.5 shadow-2xl border-2 border-amber-400/80 pointer-events-auto backdrop-blur-md flex items-center justify-between gap-3 select-none">
        
        {/* Clickable Content Body */}
        <div
          onClick={handleToastClick}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
        >
          {/* Avatar or Icon */}
          <div className="relative shrink-0">
            {currentToast.avatarUrl ? (
              <img
                src={currentToast.avatarUrl}
                alt="Avatar"
                className="w-11 h-11 rounded-xl object-cover border-2 border-amber-300 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
                {getIcon()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#800C1E] border border-amber-300 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            </span>
          </div>

          {/* Texts */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {language === 'mr' ? '🔔 थेट सूचना' : '🔔 New Alert'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">• आत्ताच</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-200 transition-colors truncate">
              {currentToast.title}
            </h4>
            <p className="text-[11px] text-amber-100/90 line-clamp-1 mt-0.5 leading-tight">
              {currentToast.body}
            </p>
          </div>
        </div>

        {/* Action & Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleToastClick}
            className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <span>{language === 'mr' ? 'पहा' : 'View'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
