import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Heart,
  MessageSquare,
  Sparkles,
  CreditCard,
  CheckCheck,
  Trash2,
  ChevronRight,
  Info,
} from 'lucide-react';

export const MobileNotificationScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    currentUser,
    setSelectedProfileForModal,
    profiles,
    setCurrentView,
    language,
  } = useApp();

  const isEn = language === 'en';

  // Filter for current user + broadcasts
  const userNotifications = (notifications || []).filter(
    (n) => n.userId === 'broadcast' || n.userId === 'all' || n.userId === currentUser?.id
  );

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

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
    }
  };

  const handleMarkAllRead = () => {
    userNotifications.forEach((n) => {
      if (!n.isRead) markNotificationRead(n.id);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 select-none">
      {/* 1. TOP APP BAR */}
      <div className="sticky top-0 z-30 bg-[#A71930] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">
            {isEn ? 'Notifications' : 'सूचना (Notifications)'}
          </h1>
          {unreadCount > 0 && (
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-amber-200 hover:text-white transition active:scale-95 cursor-pointer"
          >
            {isEn ? 'Mark all read' : 'सर्व वाचले'}
          </button>
        )}
      </div>

      {/* 2. NOTIFICATIONS LIST */}
      <div className="bg-white divide-y divide-slate-100 border-b border-slate-200">
        {userNotifications.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">कोणतीही नवीन सूचना नाही</p>
            <p className="text-xs text-slate-500">नवीन पसंती, मॅचेस किंवा संदेश आल्यास येथे दिसतील.</p>
          </div>
        ) : (
          userNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`flex items-start gap-3.5 px-4 py-3.5 hover:bg-slate-50 transition cursor-pointer ${
                !item.isRead ? 'bg-amber-50/40' : ''
              }`}
            >
              {/* Notification Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === 'interest'
                    ? 'bg-rose-100 text-rose-600'
                    : item.type === 'chat'
                    ? 'bg-sky-100 text-sky-600'
                    : item.type === 'payment'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-[#A71930]'
                }`}
              >
                {item.type === 'interest' ? (
                  <Heart className="w-5 h-5 fill-rose-500" />
                ) : item.type === 'chat' ? (
                  <MessageSquare className="w-5 h-5" />
                ) : item.type === 'payment' ? (
                  <CreditCard className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              {/* Notification Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      !item.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'
                    }`}
                  >
                    {isEn ? item.title || item.titleMr : item.titleMr || item.title}
                  </p>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#A71930] shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                  {isEn ? item.message || item.messageMr : item.messageMr || item.message}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(item.createdAt || Date.now()).toLocaleDateString('mr-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 mt-1" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
