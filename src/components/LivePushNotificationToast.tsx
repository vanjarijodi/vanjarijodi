import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playNotificationSound, triggerDeviceVibration } from '../utils/pushNotificationHelper';

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
  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  // Swipe up to dismiss state
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);
  const [translateY, setTranslateY] = useState<number>(0);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      if (customEvent.detail) {
        setCurrentToast(customEvent.detail);
        setIsDismissing(false);
        setTranslateY(0);
        setIsVisible(true);
        // Ensure audio & vibration fire on heads-up drop
        playNotificationSound();
        triggerDeviceVibration([180, 80, 180]);
      }
    };

    window.addEventListener('vanjari_new_notification_toast', handleToastEvent);
    return () => {
      window.removeEventListener('vanjari_new_notification_toast', handleToastEvent);
    };
  }, []);

  useEffect(() => {
    if (isVisible && !isDismissing) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isDismissing, currentToast?.timestamp]);

  const dismissToast = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsDismissing(false);
      setTranslateY(0);
    }, 280);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = e.touches[0].clientY - touchStartY.current;
    touchCurrentY.current = e.touches[0].clientY;
    if (diffY < 0) {
      setTranslateY(diffY);
    }
  };

  const handleTouchEnd = () => {
    if (translateY < -40) {
      dismissToast();
    } else {
      setTranslateY(0);
    }
    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  if (!isVisible || !currentToast) return null;

  const handleToastClick = () => {
    dismissToast();
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

  return (
    <div
      className="fixed top-2 sm:top-3 inset-x-0 z-[99999] flex justify-center px-3.5 sm:px-4 pointer-events-none select-none transition-all duration-300"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity: isDismissing ? 0 : 1,
      }}
    >
      {/* Android System Style Heads-Up Notification Card (Matches User Reference Screenshot) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full max-w-md bg-white/98 text-slate-900 rounded-[26px] p-3 sm:p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.22)] border border-slate-200/90 pointer-events-auto backdrop-blur-md flex items-center justify-between gap-3 transition-transform ${
          isDismissing ? '-translate-y-8 opacity-0' : 'animate-in slide-in-from-top-6 duration-300 ease-out'
        }`}
      >
        {/* Clickable Content Body */}
        <div
          onClick={handleToastClick}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
        >
          {/* Left App Icon: Squircle shape matching Z5 icon in screenshot */}
          <div className="relative shrink-0">
            {currentToast.avatarUrl ? (
              <img
                src={currentToast.avatarUrl}
                alt="Profile"
                className="w-11 h-11 rounded-2xl object-cover border border-amber-300/80 shadow-xs"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6B0818] via-[#8A0E22] to-[#550612] p-1.5 flex items-center justify-center shadow-xs border border-amber-400/40">
                <img
                  src="/vanjari-jodi-official-logo.png"
                  alt="Vanjari Jodi"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            {/* Tiny live activity ping dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          {/* Texts (Exact typography hierarchy matching Android Heads-up Screenshot) */}
          <div className="min-w-0 flex-1 pr-1">
            {/* Top row: App Name & Timestamp */}
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-500 leading-tight">
              <span className="font-bold text-[#800C1E]">
                {language === 'mr' ? 'वंजारी जोडी' : 'Vanjari Jodi'}
              </span>
              <span>•</span>
              <span>{language === 'mr' ? 'आत्ताच' : 'Just now'}</span>
            </div>

            {/* Title (Bold, prominent line matching "Paul Dano is Baranov") */}
            <h4 className="text-[13px] sm:text-[14px] font-black text-slate-900 leading-tight mt-0.5 truncate group-hover:text-[#800C1E] transition-colors">
              {currentToast.title}
            </h4>

            {/* Subtitle / Body (Clean line matching "One Advisor Made History") */}
            <p className="text-[11.5px] sm:text-xs text-slate-600 leading-snug line-clamp-2 mt-0.5 font-medium">
              {currentToast.body}
            </p>
          </div>
        </div>

        {/* Right Side: Square App Badge / Thumbnail Thumbnail matching the right-hand Z5 badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            onClick={handleToastClick}
            className="w-9 h-9 rounded-xl bg-slate-900 p-1 flex items-center justify-center shadow-2xs border border-slate-700 shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition"
            title="वंजारी जोडी"
          >
            <img
              src="/vanjari-jodi-official-logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Subtle Dismiss Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissToast();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="बंद करा (Dismiss)"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
