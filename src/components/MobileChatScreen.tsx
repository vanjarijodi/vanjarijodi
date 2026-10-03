import React, { useState, useMemo } from 'react';
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
  Lock,
  Heart,
  LogIn,
  UserPlus,
  ShieldAlert,
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
    setIsLoginOpen,
    setLoginModalMode,
    setIsRegisterOpen,
    setCurrentView,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const isEn = language === 'en';

  // 1. If Guest / Not Logged In -> Show Strict Privacy Lock Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 select-none">
        {/* Top App Bar */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-[#5E0715] via-[#850F22] to-[#5E0715] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
          <h1 className="text-lg font-black tracking-tight">
            {isEn ? 'Chat & Messages' : 'चॅट व थेट संभाषण'}
          </h1>
          <div className="flex items-center gap-1 text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>सुरक्षित</span>
          </div>
        </div>

        {/* Lock Notice Card */}
        <div className="p-4 max-w-md mx-auto space-y-4 pt-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-amber-200 text-[#800C1E] mx-auto flex items-center justify-center border-2 border-amber-400 shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-black text-slate-900">
                🔒 चॅट केवळ नोंदणीकृत सदस्यांसाठी
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                वधू-वरांच्या गोपनीयतेच्या सुरक्षेसाठी आणि सुरक्षित नातेसंबंधांसाठी, केवळ पडताळणीकृत सदस्यांनाच थेट चॅट करण्याची सुविधा उपलब्ध आहे.
              </p>
            </div>

            {/* Mutual Like explanation */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-xs">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600 shrink-0" />
                <span>परस्पर पसंती (Mutual Match) सुरक्षा:</span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                दोन्ही कुटुंब किंवा वधू-वरांनी एकमेकांना पसंती (❤️ Like) दिल्यावरच दोघांचे पूर्ण नाव चॅटमध्ये दिसते आणि थेट संभाषण सुरू करता येते.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>🔐 Truecaller / पासवर्डने लॉगिन करा</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition"
              >
                <UserPlus className="w-4 h-4 text-[#800C1E]" />
                <span>✨ नवीन मोफत नोंदणी करा</span>
              </button>
            </div>
          </div>

          {/* Official Helpline Assistance */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">काही अडचण किंवा मदत हवी आहे?</p>
                <p className="text-[11px] text-slate-500">वंजारी जोडी २४x७ हेल्पलाइन संपर्क</p>
              </div>
            </div>
            <a
              href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-black shrink-0 transition"
            >
              मदत मिळवा
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Strict Mutual Match & Active Conversations Engine
  // A profile ONLY appears if:
  // a) User already has active chat messages with them, OR
  // b) MUTUAL LIKE exists: Current user liked target AND target liked current user!
  const mutualMatchedUsers = useMemo(() => {
    if (!currentUser || !profiles) return [];

    const userMap = new Map<string, UserProfile>();

    // 1. Existing conversations with actual messages
    (chatMessages || []).forEach((msg) => {
      const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
      if (partnerId && partnerId !== currentUser.id && partnerId !== 'admin') {
        const found = profiles.find((p) => p.id === partnerId);
        if (found) userMap.set(partnerId, found);
      }
    });

    // 2. STRICT Mutual Like Matches
    // (Both user liked each other)
    profiles.forEach((p) => {
      if (p.id === currentUser.id) return;

      const iLikedTarget =
        likedProfileIds.includes(p.id) ||
        (currentUser.shortlistedProfiles || []).includes(p.id) ||
        interests.some((i) => i.fromUserId === currentUser.id && i.toUserId === p.id && i.status !== 'rejected');

      const targetLikedMe =
        (currentUser.likedByUsers || []).includes(p.id) ||
        (p.shortlistedProfiles || []).includes(currentUser.id) ||
        (p.likedProfileIds || []).includes(currentUser.id) ||
        interests.some((i) => i.fromUserId === p.id && i.toUserId === currentUser.id && i.status !== 'rejected') ||
        interests.some((i) => (i.fromUserId === currentUser.id && i.toUserId === p.id && i.status === 'accepted'));

      if (iLikedTarget && targetLikedMe) {
        userMap.set(p.id, p);
      }
    });

    const list = Array.from(userMap.values());
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.education?.toLowerCase().includes(q)
    );
  }, [currentUser, profiles, chatMessages, interests, likedProfileIds, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 select-none">
      {/* 1. TOP APP BAR */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-[#5E0715] via-[#850F22] to-[#5E0715] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
          <span>{isEn ? 'Chat & Messages' : 'चॅट व संभाषणे'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
            परस्पर पसंती
          </span>
        </h1>
        <div className="flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold">Active</span>
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
            placeholder={isEn ? 'Search mutual matches...' : 'परस्पर पसंती झालेल्या स्थळांमध्ये शोधा...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-800 outline-hidden border border-slate-200 focus:border-[#800C1E] focus:bg-white"
          />
        </div>
      </div>

      {/* 3. OFFICIAL HELP CHAT PIN (Always available for member support) */}
      <div className="bg-white border-b border-slate-200 divide-y divide-slate-100">
        <a
          href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3.5 px-4 py-3 hover:bg-rose-50/40 transition cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs relative">
            <Headphones className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                <span>वंजारी जोडी हेल्पलाइन (Support)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              </p>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">थेट मदत, कुंडली, व्हेरिफिकेशन किंवा पेमेंट सहाय्यता</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </a>
      </div>

      {/* 4. CONVERSATIONS LIST (STRICT MUTUAL MATCHES ONLY) */}
      <div className="mt-1 bg-white divide-y divide-slate-100 border-y border-slate-200">
        <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
          <span>{isEn ? 'Mutual Matches' : 'परस्पर पसंती स्थळे (Mutual Matches)'}</span>
          <span className="text-[10px] font-black text-[#800C1E] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            {mutualMatchedUsers.length} मॅचेस
          </span>
        </div>

        {mutualMatchedUsers.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center border border-rose-200">
              <Heart className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="font-black text-slate-800 text-sm">
                अद्याप परस्पर पसंती (Mutual Match) झालेली नाही
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                जेव्हा तुम्ही एखाद्या स्थळाला पसंती (❤️ Like) द्याल आणि त्या स्थळानेसुद्धा तुम्हाला पसंती दर्शवली, तेव्हा ते स्थळ येथे जोडले जाईल आणि तुम्हा दोघांना पूर्ण नाव पाहून थेट चॅट सुरू करता येईल!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 max-w-xs mx-auto pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('profiles')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <Search className="w-3.5 h-3.5 text-amber-300" />
                <span>स्थळे शोधा व पसंती द्या</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('matches')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-bold text-xs border border-amber-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>अनुरूप मॅचेस पहा</span>
              </button>
            </div>
          </div>
        ) : (
          mutualMatchedUsers.map((partner) => (
            <div
              key={partner.id}
              onClick={() => setActiveChatUser(partner)}
              className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-50 transition cursor-pointer active:bg-slate-100"
            >
              {/* Circle Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-100 shrink-0 relative shadow-xs">
                {partner.photos && partner.photos.length > 0 ? (
                  <img
                    src={partner.photos[0]}
                    alt={partner.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-rose-50 text-[#800C1E] font-bold text-base">
                    {partner.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-rose-500 border-2 border-white" />
              </div>

              {/* Info Text Stack - Full Name Visible Because Both Liked Each Other */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-black text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1">
                    <span>{partner.fullName}</span>
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {partner.district || partner.city}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate">
                  {partner.age} वर्षे • {partner.education || 'शिक्षण उपलब्ध'}
                </p>
                <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                  <span>🎉 परस्पर पसंती (Mutual Match) — चॅट सुरू करा</span>
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileChatScreen;
