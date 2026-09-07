import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import {
  Heart,
  UserCheck,
  ShieldCheck,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  UserX,
  Sparkles,
  ArrowRight,
  Eye,
  PhoneCall,
  Search,
  Filter,
} from 'lucide-react';
import { SafeAvatar } from './SafeAvatar';

export type MatchesSubTab = 'mutual' | 'you_liked' | 'liked_you' | 'contact_requests' | 'blocked';

export const MatchesScreen: React.FC = () => {
  const {
    currentUser,
    profiles,
    likedProfileIds,
    toggleLikeProfile,
    interests,
    sendInterest,
    contactRequests,
    authorizeContactRequest,
    rejectContactRequest,
    setSelectedProfileForModal,
    setActiveChatUser,
    checkCanUserChatWithMember,
    unlockedContacts,
    setIsPaymentOpen,
    setSelectedPlanForPayment,
    plansList,
    siteConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<MatchesSubTab>('mutual');
  const [blockedIds, setBlockedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vanjari_jodi_blocked_members');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleUnblock = (id: string) => {
    const next = blockedIds.filter((b) => b !== id);
    setBlockedIds(next);
    localStorage.setItem('vanjari_jodi_blocked_members', JSON.stringify(next));
  };

  // 1. You Liked
  const youLikedProfiles = useMemo(() => {
    if (!currentUser) return [];
    return profiles.filter((p) => {
      if (blockedIds.includes(p.id)) return false;
      return (
        likedProfileIds.includes(p.id) ||
        interests.some((i) => i.fromUserId === currentUser.id && i.toUserId === p.id && i.status !== 'rejected')
      );
    });
  }, [profiles, likedProfileIds, interests, currentUser, blockedIds]);

  // 2. Liked You
  const likedYouProfiles = useMemo(() => {
    if (!currentUser) return [];
    return profiles.filter((p) => {
      if (blockedIds.includes(p.id)) return false;
      const targetLikesMe =
        (currentUser.likedByUsers || []).includes(p.id) ||
        (p.likedProfileIds || []).includes(currentUser.id) ||
        interests.some((i) => i.fromUserId === p.id && i.toUserId === currentUser.id && i.status !== 'rejected');
      return targetLikesMe;
    });
  }, [profiles, interests, currentUser, blockedIds]);

  // 3. Mutual Matches (Both liked each other!)
  const mutualMatches = useMemo(() => {
    if (!currentUser) return [];
    return profiles.filter((p) => {
      if (blockedIds.includes(p.id)) return false;
      const iLikedP =
        likedProfileIds.includes(p.id) ||
        interests.some((i) => i.fromUserId === currentUser.id && i.toUserId === p.id && i.status !== 'rejected');
      const pLikedMe =
        (currentUser.likedByUsers || []).includes(p.id) ||
        (p.likedProfileIds || []).includes(currentUser.id) ||
        interests.some((i) => i.fromUserId === p.id && i.toUserId === currentUser.id && i.status !== 'rejected');
      return iLikedP && pLikedMe;
    });
  }, [profiles, likedProfileIds, interests, currentUser, blockedIds]);

  // 4. Contact Requests for current user
  const relevantContactRequests = useMemo(() => {
    if (!currentUser) return [];
    return contactRequests.filter(
      (r) => r.targetProfileId === currentUser.id || r.requesterId === currentUser.id
    );
  }, [contactRequests, currentUser]);

  // 5. Blocked Profiles
  const blockedProfiles = useMemo(() => {
    return profiles.filter((p) => blockedIds.includes(p.id));
  }, [profiles, blockedIds]);

  const handleOpenChat = (profile: UserProfile) => {
    const chatStatus = checkCanUserChatWithMember(profile);
    if (!chatStatus.allowed) {
      if (!chatStatus.isPaidPlan) {
        const activePlan = plansList.find((p) => p.isActive !== false && p.id !== 'free') || plansList[0];
        setSelectedPlanForPayment(activePlan);
        setIsPaymentOpen(true);
        alert('💬 चॅट सुरू करण्यासाठी सबस्क्रिप्शन प्लॅन आवश्यक आहे.');
        return;
      }
      alert(chatStatus.reason || 'चॅट उपलब्ध नाही.');
      return;
    }
    setActiveChatUser(profile);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-3 py-4 space-y-4">
      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-[#800C1E]">💕</span>
            <span>मॅचेस आणि प्रतिसाद</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            तुमच्या पसंती, परस्पर जुळणी व संपर्क विनंत्यांचे व्यवस्थापन
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#800C1E] text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{mutualMatches.length} परस्पर जुळण्या</span>
        </div>
      </div>

      {/* Sub-Tabs (Thumb-Friendly Pill Navigation) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('mutual')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'mutual'
              ? 'bg-[#800C1E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>💕 परस्पर जुळणी</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'mutual' ? 'bg-white/20 text-white' : 'bg-rose-100 text-[#800C1E]'
            }`}
          >
            {mutualMatches.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('liked_you')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'liked_you'
              ? 'bg-[#800C1E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>💗 पसंती आलेले</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'liked_you' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {likedYouProfiles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('you_liked')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'you_liked'
              ? 'bg-[#800C1E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>❤️ तुम्ही पाठवलेले</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'you_liked' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {youLikedProfiles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact_requests')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'contact_requests'
              ? 'bg-[#800C1E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>📞 संपर्क विनंत्या</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'contact_requests' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {relevantContactRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('blocked')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'blocked'
              ? 'bg-[#800C1E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>🚫 ब्लॉक</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'blocked' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {blockedProfiles.length}
          </span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="space-y-3">
        {/* 1. Mutual Matches Tab */}
        {activeTab === 'mutual' && (
          <div>
            {mutualMatches.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-2xl">
                  💕
                </div>
                <h3 className="font-bold text-slate-800 text-base">अजून परस्पर जुळणी (Mutual Match) झाली नाही</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  जेव्हा तुम्ही कोणाला लाईक करता आणि समोरच्या सदस्याने सुद्धा तुम्हाला लाईक केले, तेव्हा येथे तुमची
                  परस्पर जुळणी दिसेल आणि दोघांची नावे व चॅट अनलॉक होईल.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('liked_you')}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-[#800C1E] border border-amber-300 font-bold text-xs hover:bg-amber-100 transition-colors"
                >
                  <span>तुम्हाला आलेल्या पसंती तपासा</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mutualMatches.map((profile) => {
                  const isContactUnlocked = unlockedContacts.includes(profile.id);
                  return (
                    <div
                      key={profile.id}
                      className="bg-white rounded-2xl border-2 border-rose-200 p-3.5 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <SafeAvatar
                          src={profile.photoUrl || profile.photos?.[0]}
                          name={profile.fullName}
                          gender={profile.gender}
                          sizeClassName="w-14 h-14"
                          className="rounded-xl ring-2 ring-rose-400"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black">
                              💕 Mutual Match
                            </span>
                            {profile.isVerified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
                            {profile.fullName || `सदस्य (${profile.registrationId || profile.id})`}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {profile.age} वर्षे • {profile.education || 'शिक्षण माहिती'}
                          </p>
                          <p className="text-xs text-slate-600 font-medium truncate">
                            {profile.occupation || 'व्यवसाय माहिती'} • {profile.district || 'महाराष्ट्र'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedProfileForModal(profile)}
                          className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>माहिती</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenChat(profile)}
                          className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#800C1E] text-xs font-bold flex items-center justify-center gap-1 border border-rose-200"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>चॅट</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (isContactUnlocked) {
                              alert(`📞 मोबाईल क्रमांक: ${profile.mobile || 'माहिती उपलब्ध नाही'}`);
                            } else {
                              setSelectedProfileForModal(profile);
                            }
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                            isContactUnlocked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{isContactUnlocked ? 'कॉल' : 'नंबर'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Liked You Tab */}
        {activeTab === 'liked_you' && (
          <div>
            {likedYouProfiles.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-2xl">
                  💗
                </div>
                <h3 className="font-bold text-slate-800 text-base">नवीन पसंती प्रलंबित नाहीत</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  जेव्हा वंजारी समाजातील इतर सदस्य तुमच्या प्रोफाईलला लाईक करतील, तेव्हा त्यांचे प्रस्ताव येथे दिसतील.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {likedYouProfiles.map((profile) => {
                  const isAlreadyLikedByMe = likedProfileIds.includes(profile.id);
                  return (
                    <div
                      key={profile.id}
                      className="bg-white rounded-2xl border border-amber-200 p-3.5 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <SafeAvatar
                          src={profile.photoUrl || profile.photos?.[0]}
                          name={profile.fullName}
                          gender={profile.gender}
                          sizeClassName="w-14 h-14"
                          className="rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            💗 यांनी तुम्हाला लाईक केले
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
                            {isAlreadyLikedByMe
                              ? profile.fullName
                              : `VJ-${profile.registrationId || profile.id} (पडताळणीकृत)`}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {profile.age} वर्षे • {profile.education || 'पदवीधर'}
                          </p>
                          <p className="text-xs text-slate-600 font-medium truncate">
                            {profile.occupation || 'नोकरी'} • {profile.district || 'महाराष्ट्र'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedProfileForModal(profile)}
                          className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                        >
                          माहिती पहा
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            toggleLikeProfile(profile.id);
                          }}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#9C1B30] text-white text-xs font-bold shadow-xs hover:shadow-md flex items-center justify-center gap-1"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          <span>{isAlreadyLikedByMe ? '💕 Match झाली' : '❤️ लाईक स्वीकारा'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. You Liked Tab */}
        {activeTab === 'you_liked' && (
          <div>
            {youLikedProfiles.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-2xl">
                  ❤️
                </div>
                <h3 className="font-bold text-slate-800 text-base">तुम्ही अजून कोणाला लाईक केले नाही</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  वर-वधू प्रोफाईल ब्राउझ करताना तुम्हाला योग्य वाटणाऱ्या स्थळांना ❤️ लाईक करा.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {youLikedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <SafeAvatar
                        src={profile.photoUrl || profile.photos?.[0]}
                        name={profile.fullName}
                        gender={profile.gender}
                        sizeClassName="w-10 h-10"
                        className="rounded-xl"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          VJ-{profile.registrationId || profile.id}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {profile.age} वर्षे • {profile.district || 'महाराष्ट्र'}
                        </p>
                        <span className="text-[10px] text-amber-700 font-medium">
                          पसंती पाठवली • प्रतिसादाची वाट पाहत आहे
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedProfileForModal(profile)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                    >
                      पहा
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Contact Requests Tab */}
        {activeTab === 'contact_requests' && (
          <div>
            {relevantContactRequests.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-2xl">
                  📞
                </div>
                <h3 className="font-bold text-slate-800 text-base">कोणतीही संपर्क विनंती प्रलंबित नाही</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  जेव्हा कोणी तुम्हाला थेट मोबाईल नंबर पाहण्याची अधिकृत विनंती पाठवेल, ती येथे दिसेल.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {relevantContactRequests.map((req) => {
                  const isIncoming = req.targetProfileId === currentUser?.id;
                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              req.status === 'authorized'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status === 'authorized'
                              ? 'मंजूर (Authorized)'
                              : req.status === 'rejected'
                              ? 'नाकारले (Rejected)'
                              : 'प्रलंबित (Pending)'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString('mr-IN')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">
                          {isIncoming
                            ? `${req.requesterName} यांनी संपर्क क्रमांक पाहण्याची विनंती केली.`
                            : `तुम्ही ${req.targetProfileName} यांना संपर्क विनंती पाठवली आहे.`}
                        </h4>
                        {req.note && <p className="text-xs text-slate-500 mt-0.5">"{req.note}"</p>}
                      </div>

                      {isIncoming && req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => authorizeContactRequest(req.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                          >
                            मंजूर करा
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectContactRequest(req.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#800C1E] text-xs font-bold border border-rose-200"
                          >
                            नाकारा
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. Blocked Tab */}
        {activeTab === 'blocked' && (
          <div>
            {blockedProfiles.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <h3 className="font-bold text-slate-800 text-base">कोणतीही प्रोफाईल ब्लॉक केलेली नाही</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  ज्या सदस्यांना तुम्ही ब्लॉक करता, ते येथे दिसतात. ब्लॉक केलेले सदस्य तुमचे प्रोफाईल पाहू शकत नाहीत.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">VJ-{p.registrationId || p.id}</h4>
                      <p className="text-xs text-slate-400">ब्लॉक केलेले सदस्य</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnblock(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      अनब्लॉक करा
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
