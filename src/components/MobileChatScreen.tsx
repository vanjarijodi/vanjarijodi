import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Search,
  CheckCheck,
  ShieldCheck,
  Headphones,
  User,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../types';

export const MobileChatScreen: React.FC = () => {
  const {
    currentUser,
    profiles,
    chatMessages,
    setActiveChatUser,
    interests,
    siteConfig,
    language,
    likedProfileIds,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const isEn = language === 'en';

  // Find all profiles that have either chatted or sent interest or are mutual matches
  const conversationUsers = React.useMemo(() => {
    if (!currentUser || !profiles) return [];

    const userMap = new Map<string, UserProfile>();

    // 1. Profiles with chat messages
    (chatMessages || []).forEach((msg) => {
      const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      if (partnerId && partnerId !== currentUser.id && partnerId !== 'admin') {
        const found = profiles.find((p) => p.id === partnerId);
        if (found) userMap.set(partnerId, found);
      }
    });

    // 2. Profiles with mutual or sent/received interests
    (interests || []).forEach((int) => {
      const partnerId = int.fromUserId === currentUser.id ? int.toUserId : int.fromUserId;
      if (partnerId && partnerId !== currentUser.id) {
        const found = profiles.find((p) => p.id === partnerId);
        if (found) userMap.set(partnerId, found);
      }
    });

    // 3. Fallback: if list is short, include some opposite gender verified matches to chat with
    if (userMap.size < 5) {
      const oppositeGender = currentUser.gender === 'groom' ? 'bride' : 'groom';
      profiles
        .filter((p) => p.gender === oppositeGender && p.id !== currentUser.id)
        .slice(0, 10)
        .forEach((p) => {
          if (!userMap.has(p.id)) {
            userMap.set(p.id, p);
          }
        });
    }

    const list = Array.from(userMap.values());
    if (!searchQuery.trim()) return list;

    return list.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.education?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentUser, profiles, chatMessages, interests, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 select-none">
      {/* 1. TOP APP BAR */}
      <div className="sticky top-0 z-30 bg-[#A71930] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold tracking-tight">
          {isEn ? 'Chat' : 'चॅट / Messages'}
        </h1>
        <div className="flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="p-3 bg-white border-b border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search chats...' : 'नाव किंवा शहराने चॅट शोधा...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-800 outline-hidden border border-slate-200 focus:border-[#A71930] focus:bg-white"
          />
        </div>
      </div>

      {/* 3. OFFICIAL HELP CHAT PIN */}
      <div className="bg-white border-b border-slate-200 divide-y divide-slate-100">
        <a
          href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3.5 px-4 py-3 hover:bg-rose-50/40 transition cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-sky-500 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs relative">
            <Headphones className="w-6 h-6" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-slate-900 flex items-center gap-1">
                <span>वंजारी जोडी हेल्पलाइन (Support)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Online</span>
            </div>
            <p className="text-xs text-slate-500 truncate">थेट मदत, कुंडली किंवा पेमेंट सहाय्यतेसाठी संपर्क करा</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </a>
      </div>

      {/* 4. CONVERSATIONS LIST */}
      <div className="mt-1 bg-white divide-y divide-slate-100 border-y border-slate-200">
        <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {isEn ? 'Conversations & Matches' : 'संभाषणे व अनुरूप स्थळे'}
        </div>

        {conversationUsers.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">कोणतेही नवीन संभाषण नाही</p>
            <p className="text-xs text-slate-500">स्थळे पाहून त्यांच्याशी संवाद सुरू करा.</p>
          </div>
        ) : (
          conversationUsers.map((partner) => {
            const hasSentInterest = interests?.some(
              (i) =>
                (i.fromUserId === currentUser?.id && i.toUserId === partner.id) ||
                (i.fromUserId === partner.id && i.toUserId === currentUser?.id)
            );

            return (
              <div
                key={partner.id}
                onClick={() => setActiveChatUser(partner)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-50 transition cursor-pointer active:bg-slate-100"
              >
                {/* Circle Avatar */}
                <div className="w-13 h-13 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                  {partner.photos && partner.photos.length > 0 ? (
                    <img
                      src={partner.photos[0]}
                      alt={partner.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-50 text-[#A71930] font-bold text-base">
                      {partner.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  {hasSentInterest && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-rose-500 border-2 border-white" />
                  )}
                </div>

                {/* Info Text Stack */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-slate-900 truncate">{partner.fullName}</p>
                    <span className="text-[10px] text-slate-400">
                      {partner.district || partner.city}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">
                    {partner.age} वर्षे • {partner.education || 'शिक्षण उपलब्ध'}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                    <span>चॅट सुरू करण्यासाठी टॅप करा</span>
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
