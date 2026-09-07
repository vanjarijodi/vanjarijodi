import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  Heart,
  MessageCircle,
  CreditCard,
  Sparkles,
  Info,
  CheckCheck,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    profiles,
    setSelectedProfileForModal,
    markNotificationRead,
    currentUser,
    setCurrentView,
    setIsPaymentOpen,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Filter for current user + broadcasts
  const userNotifications = notifications.filter(
    (n) => n.userId === 'broadcast' || n.userId === 'all' || n.userId === currentUser?.id
  );

  const filtered = userNotifications.filter((n) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'likes') return n.type === 'interest';
    if (activeCategory === 'matches') return n.type === 'match' || (n.titleMr && n.titleMr.includes('म्युचुअल'));
    if (activeCategory === 'messages') return n.type === 'chat';
    if (activeCategory === 'payments') return n.type === 'payment';
    if (activeCategory === 'system') return n.type === 'system';
    return true;
  });

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    userNotifications.forEach((n) => {
      if (!n.isRead) markNotificationRead(n.id);
    });
  };

  const handleNotificationClick = (n: any) => {
    markNotificationRead(n.id);
    onClose();

    const targetProfileId = n.senderId || n.relatedProfileId;
    if (targetProfileId) {
      const found = profiles.find((p) => p.id === targetProfileId);
      if (found) {
        setSelectedProfileForModal(found);
        return;
      }
    }

    if (n.type === 'interest' || n.type === 'match' || (n.titleMr && n.titleMr.includes('म्युचुअल'))) {
      setCurrentView('matches');
    } else if (n.type === 'payment') {
      setIsPaymentOpen(true);
    } else if (n.actionUrl === 'dashboard' || n.actionUrl === '/dashboard') {
      setCurrentView('dashboard');
    }
  };

  const getIcon = (type: string, title?: string) => {
    if (type === 'interest') return <Heart className="w-4 h-4 text-rose-600 fill-rose-100" />;
    if (type === 'match' || (title && title.includes('म्युचुअल')))
      return <Sparkles className="w-4 h-4 text-amber-500 fill-amber-100" />;
    if (type === 'chat') return <MessageCircle className="w-4 h-4 text-blue-600 fill-blue-100" />;
    if (type === 'payment') return <CreditCard className="w-4 h-4 text-emerald-600" />;
    return <Info className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#800C1E] via-[#980e24] to-[#800C1E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">सूचना केंद्र (Notifications)</h2>
              <p className="text-xs text-amber-200">
                {unreadCount > 0 ? `${unreadCount} नवीन सूचना उपलब्ध` : 'सर्व सूचना वाचल्या आहेत'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                title="सर्व वाचले म्हणून चिन्हांकित करा"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">सर्व वाचा</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'सर्व (All)' },
            { id: 'likes', label: '❤️ पसंती (Likes)' },
            { id: 'matches', label: '💕 मॅचेस (Matches)' },
            { id: 'messages', label: '💬 संदेश (Messages)' },
            { id: 'payments', label: '💳 पेमेंट (Payment)' },
            { id: 'system', label: '📢 सिस्टीम (Updates)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#800C1E] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm">कोणत्याही नवीन सूचना नाहीत</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                नवीन पसंती, परस्पर जुळणी व संदेशांचे अपडेट्स येथे लगेच दिसतील.
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  n.isRead
                    ? 'bg-white border-slate-200/80 hover:border-amber-300'
                    : 'bg-amber-50/60 border-amber-300 shadow-2xs hover:bg-amber-50'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-100 shrink-0 mt-0.5">
                  {getIcon(n.type, n.titleMr || n.title)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {n.titleMr || n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#800C1E] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                    {n.messageMr || n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString('mr-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Close */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            वंजारी जोडी सुरक्षित रिअल-टाईम सूचना
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  );
};
