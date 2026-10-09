import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { X, ChevronDown, ChevronUp, Bell, Heart, MessageSquare, CreditCard, Sparkles, ExternalLink } from 'lucide-react';
import { playNotificationSound, triggerDeviceVibration } from '../utils/pushNotificationHelper';
import { maskNotificationTextForUser } from '../utils/nameFormatter';

interface ActiveAndroidToast {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type?: string;
  actionUrl?: string;
  photoUrl?: string;
  profileId?: string;
}

export const AndroidPushNotificationBanner: React.FC = () => {
  const { notifications, currentUser, profiles, setSelectedProfileForModal, setCurrentView, isCurrentUserPaid, language, isAdminLoggedIn } = useApp();
  const [activeToast, setActiveToast] = useState<ActiveAndroidToast | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);

  // Monitor incoming notifications in real-time
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const latest = notifications[0];
    if (!latest || latest.id === lastProcessedId) return;

    // Check if targeted to current user, broadcast, or admin
    const isForAdmin = Boolean(
      (isAdminLoggedIn || currentUser?.isAdmin) && (latest.userId === 'admin' || latest.userId === 'system')
    );
    const isForCurrentUser =
      latest.userId === 'all' ||
      latest.userId === 'broadcast' ||
      isForAdmin ||
      (currentUser && latest.userId === currentUser.id);

    if (isForCurrentUser) {
      setLastProcessedId(latest.id);

      // Find if notification is associated with a profile
      let photoUrl: string | undefined = undefined;
      let profileId: string | undefined = undefined;

      const anyData = latest as any;
      if (anyData.data?.profileId) {
        profileId = anyData.data.profileId;
      } else if (anyData.data?.senderId && anyData.data.senderId !== currentUser?.id) {
        profileId = anyData.data.senderId;
      } else if (anyData.senderId && anyData.senderId !== currentUser?.id) {
        profileId = anyData.senderId;
      }
      if (profileId) {
        const matched = profiles?.find((p) => p.id === profileId);
        if (matched?.photoUrl) photoUrl = matched.photoUrl;
      }

      const rawTitle = latest.titleMr || latest.title || 'वंजारी जोडी सूचना';
      const rawMessage = latest.messageMr || latest.message || '';

      const toastData: ActiveAndroidToast = {
        id: latest.id,
        title: maskNotificationTextForUser(
          rawTitle,
          isCurrentUserPaid,
          language === 'en' ? 'en' : 'mr',
          latest.senderName || (latest as any).data?.senderName,
          profiles
        ),
        message: maskNotificationTextForUser(
          rawMessage,
          isCurrentUserPaid,
          language === 'en' ? 'en' : 'mr',
          latest.senderName || (latest as any).data?.senderName,
          profiles
        ),
        timestamp: 'आत्ताच • Just now',
        type: latest.type,
        actionUrl: latest.actionUrl,
        photoUrl,
        profileId,
      };

      setActiveToast(toastData);
      setIsExpanded(false);
      try {
        playNotificationSound();
        triggerDeviceVibration([200, 100, 200]);
      } catch (e) {
        // audio policy fallback
      }

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        setActiveToast((current) => (current?.id === latest.id ? null : current));
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [notifications, currentUser, lastProcessedId, profiles]);

  if (!activeToast) return null;

  const handleToastClick = () => {
    if (activeToast.profileId) {
      const p = profiles?.find((x) => x.id === activeToast.profileId);
      if (p) {
        setSelectedProfileForModal(p);
        setActiveToast(null);
        return;
      }
    }
    if (activeToast.type === 'chat') {
      setCurrentView('chat');
    } else if (activeToast.type === 'payment') {
      setCurrentView('account');
    } else {
      setCurrentView('notifications');
    }
    setActiveToast(null);
  };

  return (
    <div className="fixed top-2 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none select-none animate-in slide-in-from-top-6 duration-300">
      <div
        className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-3 sm:p-3.5 shadow-2xl border border-slate-200/90 dark:border-slate-700/80 pointer-events-auto transition-all cursor-pointer ring-1 ring-black/5"
        onClick={handleToastClick}
      >
        {/* Top Bar: App Emblem + App Name + Dot + Timestamp + Actions */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            {/* Android-style Rounded App Icon */}
            <div className="w-5 h-5 rounded-md bg-[#800C1E] text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
              <VanjariJodiLogo variant="emblem" size={14} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
              <span className="font-extrabold text-[#800C1E] dark:text-amber-300">वंजारी जोडी</span>
              <span className="text-slate-400">•</span>
              <span className="text-[10px] text-slate-500 font-medium">{activeToast.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 rounded-full transition"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveToast(null);
              }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-full transition"
              title="बंद करा"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body: Title + Body Message + Thumbnail */}
        <div className="flex items-start gap-3 pt-2">
          {/* Main Text Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
              {activeToast.title}
            </h4>
            <p className={`text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug ${isExpanded ? '' : 'line-clamp-2'}`}>
              {activeToast.message}
            </p>
          </div>

          {/* Right Thumbnail (Avatar or Icon badge like Android notification) */}
          {activeToast.photoUrl ? (
            <img
              src={activeToast.photoUrl}
              alt="Photo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-[#800C1E] dark:text-amber-400 flex items-center justify-center shrink-0">
              {activeToast.type === 'interest' ? (
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              ) : activeToast.type === 'chat' ? (
                <MessageSquare className="w-4 h-4 text-sky-600" />
              ) : activeToast.type === 'payment' ? (
                <CreditCard className="w-4 h-4 text-emerald-600" />
              ) : (
                <Bell className="w-4 h-4 text-amber-500" />
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400 font-medium">टॅप करून सविस्तर पहा</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToastClick();
              }}
              className="px-3 py-1 bg-[#800C1E] hover:bg-[#9E1428] text-white rounded-full font-bold text-[11px] shadow-xs transition active:scale-95"
            >
              उघडा (Open)
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveToast(null);
              }}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-full font-bold text-[11px] transition"
            >
              हटवा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
