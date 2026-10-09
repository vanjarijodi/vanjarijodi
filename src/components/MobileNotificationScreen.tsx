import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import {
  Bell,
  Heart,
  MessageSquare,
  Sparkles,
  CreditCard,
  CheckCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  playNotificationSound,
  testPushNotificationAndSound,
  getPushPermissionState,
  requestPushPermission,
} from '../utils/pushNotificationHelper';
import { maskNotificationTextForUser } from '../utils/nameFormatter';

export const MobileNotificationScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    currentUser,
    setSelectedProfileForModal,
    profiles,
    setCurrentView,
    language,
    isCurrentUserPaid,
  } = useApp();

  const isEn = language === 'en';

  // Filter for current user + broadcasts
  const userNotifications = (notifications || []).filter(
    (n) => n.userId === 'broadcast' || n.userId === 'all' || n.userId === currentUser?.id
  );

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<string>(() => getPushPermissionState());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleTestSound = async () => {
    setIsTestingSound(true);
    try {
      await testPushNotificationAndSound();
      setPermissionState(getPushPermissionState());
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsTestingSound(false), 1200);
    }
  };

  const handleEnablePush = async () => {
    const res = await requestPushPermission();
    setPermissionState(res);
  };

  const handleNotificationClick = (item: any) => {
    markNotificationRead(item.id);
    if (item.data?.profileId) {
      const found = profiles?.find((p) => p.id === item.data.profileId);
      if (found) {
        setSelectedProfileForModal(found);
        return;
      }
    }
    if (item.type === 'chat') {
      setCurrentView('chat');
    } else if (item.type === 'payment') {
      setCurrentView('account');
    } else if (item.actionUrl) {
      if (item.actionUrl.startsWith('/')) {
        const view = item.actionUrl.replace('/', '');
        if (['dashboard', 'matches', 'profiles', 'chat', 'account', 'notifications'].includes(view)) {
          setCurrentView(view as any);
        }
      }
    }
  };

  const handleMarkAllRead = () => {
    userNotifications.forEach((n) => {
      if (!n.isRead) markNotificationRead(n.id);
    });
  };

  // Format relative timestamp like Android notifications
  const formatAndroidTime = (dateStr?: string) => {
    if (!dateStr) return 'आत्ताच';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return isEn ? 'Just now' : 'आत्ताच';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
      }
      if (diffDays === 1) return isEn ? 'Yesterday' : 'काल';
      return `${diffDays}d`;
    } catch {
      return 'आत्ताच';
    }
  };

  const todayDateFormatted = new Date().toLocaleDateString(isEn ? 'en-US' : 'mr-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-28 select-none">
      
      {/* 1. ANDROID LOCK SCREEN / NOTIFICATION TRAY HEADER */}
      <div className="sticky top-0 z-30 bg-[#800C1E] text-white px-4 py-3.5 shadow-md flex items-center justify-between border-b border-amber-400/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-[#800C1E] flex items-center justify-center font-black shadow-xs">
            <VanjariJodiLogo variant="emblem" size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-1.5">
              <span>{isEn ? 'Vanjari Jodi Notifications' : 'वंजारी जोडी नोटिफिकेशन्स'}</span>
              {unreadCount > 0 && (
                <span className="bg-amber-400 text-[#800C1E] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[10px] text-amber-200 font-medium">
              {todayDateFormatted} • {isEn ? 'Android System Push Tray' : 'पुश नोटिफिकेशन सेंटर'}
            </p>
          </div>
        </div>

        {userNotifications.length > 0 && (
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-[11px] transition active:scale-95 cursor-pointer shadow-xs"
              >
                {isEn ? 'Read All' : 'सर्व वाचले'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. ANDROID SOUND & PUSH STATUS BAR */}
      <div className="bg-gradient-to-r from-amber-50 to-rose-50/70 dark:from-slate-900 dark:to-slate-800 px-4 py-2 border-b border-amber-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-lg bg-amber-200/90 text-[#800C1E] shrink-0">
            <Volume2 className="w-3.5 h-3.5" />
          </span>
          <div className="truncate">
            <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>{isEn ? 'Push Alerts & Sound' : 'पुश सूचना व ध्वनी'}</span>
              <span className="text-[9px] text-emerald-600 font-extrabold">• Live Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {permissionState !== 'granted' && (
            <button
              type="button"
              onClick={handleEnablePush}
              className="px-2.5 py-1 bg-[#800C1E] hover:bg-[#9E1428] text-white font-black rounded-lg text-[10px] transition active:scale-95 cursor-pointer shadow-2xs"
            >
              {isEn ? 'Enable Push' : 'परवानगी द्या'}
            </button>
          )}
          <button
            type="button"
            onClick={handleTestSound}
            disabled={isTestingSound}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] transition active:scale-95 flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <Volume2 className="w-3 h-3" />
            <span>{isTestingSound ? (isEn ? 'Playing...' : 'वाजत आहे...') : (isEn ? 'Test Sound' : 'ध्वनी चाचणी')}</span>
          </button>
        </div>
      </div>

      {/* 3. STACKED ANDROID NOTIFICATION CARDS CONTAINER (Matching Screenshot 2) */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 space-y-2.5">
        {userNotifications.length === 0 ? (
          <div className="py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-[#800C1E] dark:text-amber-400 flex items-center justify-center mx-auto shadow-2xs">
              <Bell className="w-7 h-7" />
            </div>
            <p className="font-black text-slate-800 dark:text-slate-100 text-sm">
              {isEn ? 'No notifications right now' : 'सध्या कोणतीही नवीन सूचना नाही'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {isEn
                ? 'Matches, likes, admin announcements and offer codes will arrive here instantly.'
                : 'नवीन पसंती, स्थळे, ॲडमिनचे संदेश व सवलत कोड्स थेट येथे दिसतील.'}
            </p>
          </div>
        ) : (
          userNotifications.map((item) => {
            const isExpanded = expandedIds.includes(item.id);
            const timeFormatted = formatAndroidTime(item.createdAt);

            // Check if profile thumbnail available
            let candidatePhoto: string | undefined = undefined;
            const anyItem = item as any;
            const resolvedProfileId =
              anyItem.data?.profileId ||
              (anyItem.data?.senderId && anyItem.data.senderId !== currentUser?.id ? anyItem.data.senderId : undefined) ||
              (anyItem.senderId && anyItem.senderId !== currentUser?.id ? anyItem.senderId : undefined) ||
              (anyItem.recipientId && anyItem.recipientId !== currentUser?.id ? anyItem.recipientId : undefined);
            if (resolvedProfileId) {
              const matched = profiles?.find((p) => p.id === resolvedProfileId);
              if (matched?.photoUrl) candidatePhoto = matched.photoUrl;
            }

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                  !item.isRead
                    ? 'border-amber-400/90 dark:border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-400/30'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                {/* Android Card Header Line: App Emblem + App Name + Dot + Relative Timestamp + Dropdown Chevron */}
                <div className="flex items-center justify-between gap-2 pb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Android App Rounded Square Badge */}
                    <div className="w-5 h-5 rounded-md bg-[#800C1E] text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <VanjariJodiLogo variant="emblem" size={13} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      <span className="font-black text-[#800C1E] dark:text-amber-300">
                        {isEn ? 'Vanjari Jodi' : 'वंजारी जोडी'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {timeFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#800C1E] dark:bg-amber-400 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(item.id, e)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 rounded-full transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Content Row: Main Title, Message, & Optional Right Thumbnail */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xs sm:text-sm leading-snug truncate ${
                        !item.isRead ? 'font-black text-slate-950 dark:text-white' : 'font-extrabold text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {maskNotificationTextForUser(
                        isEn ? item.title || item.titleMr : item.titleMr || item.title,
                        isCurrentUserPaid,
                        isEn ? 'en' : 'mr',
                        item.senderName || item.data?.senderName,
                        profiles
                      )}
                    </h3>
                    <p
                      className={`text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {maskNotificationTextForUser(
                        isEn ? item.message || item.messageMr : item.messageMr || item.message,
                        isCurrentUserPaid,
                        isEn ? 'en' : 'mr',
                        item.senderName || item.data?.senderName,
                        profiles
                      )}
                    </p>
                  </div>

                  {/* Right Thumbnail (Avatar photo or circular type badge) */}
                  {candidatePhoto ? (
                    <img
                      src={candidatePhoto}
                      alt="Candidate"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-2xs mt-0.5"
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        item.type === 'interest'
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          : item.type === 'chat'
                          ? 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                          : item.type === 'payment'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-100 text-[#800C1E] dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {item.type === 'interest' ? (
                        <Heart className="w-4 h-4 fill-rose-500" />
                      ) : item.type === 'chat' ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : item.type === 'payment' ? (
                        <CreditCard className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons Row (Like Screenshot 2 Android notification quick actions) */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(item);
                      }}
                      className="px-3 py-1 bg-[#800C1E] hover:bg-[#A71930] text-amber-200 font-black rounded-full text-[11px] transition active:scale-95 shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isEn ? 'Open' : 'उघडा (Open)'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(item.id);
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-full text-[11px] transition cursor-pointer"
                      >
                        {isEn ? 'Mark Read' : 'वाचले'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
