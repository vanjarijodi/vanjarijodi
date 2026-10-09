import React, { useState, useMemo } from 'react';
import {
  Heart,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  ExternalLink,
  Bell,
  Trash2,
  Lock,
  Unlock,
  Users,
  Filter,
  RefreshCw,
  Eye,
  Download,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PendingLike, UserProfile } from '../types';
import { formatMemberId } from '../utils/idUtils';

interface AdminMemberLikesTrackerProps {
  initialMemberFilter?: UserProfile | null;
  onSelectMember?: (member: UserProfile) => void;
  onOpenDirectNotification?: (member: UserProfile) => void;
}

export const AdminMemberLikesTracker: React.FC<AdminMemberLikesTrackerProps> = ({
  initialMemberFilter,
  onSelectMember,
  onOpenDirectNotification,
}) => {
  const {
    pendingLikes = [],
    setPendingLikes,
    profiles = [],
    approveLike,
    rejectLike,
    addNotification,
    logActivity,
    siteConfig,
  } = useApp() as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mutual' | 'one_way' | 'pending' | 'approved'>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<UserProfile | null>(initialMemberFilter || null);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Helper to find profile by ID
  const getProfile = (id: string): UserProfile | undefined => {
    return profiles.find((p) => p.id === id);
  };

  // Toast alert
  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  // Filtered likes list
  const filteredLikes = useMemo(() => {
    return (pendingLikes || []).filter((like: PendingLike) => {
      // Specific member filter
      if (selectedMemberFilter) {
        const matchesSender = like.fromUserId === selectedMemberFilter.id;
        const matchesRecipient = like.toUserId === selectedMemberFilter.id;
        if (!matchesSender && !matchesRecipient) return false;
      }

      // Filter by type
      if (filterType === 'mutual' && !like.isMutual) return false;
      if (filterType === 'one_way' && like.isMutual) return false;
      if (filterType === 'pending' && like.status !== 'pending') return false;
      if (filterType === 'approved' && like.status !== 'approved') return false;

      // Filter by search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const fromName = (like.fromUserName || '').toLowerCase();
        const toName = (like.toUserName || '').toLowerCase();
        const fromId = (like.fromUserId || '').toLowerCase();
        const toId = (like.toUserId || '').toLowerCase();
        const fromMobile = (like.fromUserMobile || '').toLowerCase();
        const toMobile = (like.toUserMobile || '').toLowerCase();

        return (
          fromName.includes(q) ||
          toName.includes(q) ||
          fromId.includes(q) ||
          toId.includes(q) ||
          fromMobile.includes(q) ||
          toMobile.includes(q)
        );
      }

      return true;
    });
  }, [pendingLikes, filterType, searchTerm, selectedMemberFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = pendingLikes.length;
    const mutual = pendingLikes.filter((l: PendingLike) => l.isMutual).length;
    const pending = pendingLikes.filter((l: PendingLike) => l.status === 'pending').length;
    const approved = pendingLikes.filter((l: PendingLike) => l.status === 'approved').length;

    // Likes sent in last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const today = pendingLikes.filter((l: PendingLike) => {
      try {
        return new Date(l.createdAt).getTime() > oneDayAgo;
      } catch {
        return false;
      }
    }).length;

    return { total, mutual, pending, approved, today };
  }, [pendingLikes]);

  // Delete a like record
  const handleDeleteLike = (id: string) => {
    if (confirm('या लाईक नोंदीची हिस्ट्री हटवायची आहे का?')) {
      if (typeof setPendingLikes === 'function') {
        setPendingLikes((prev: PendingLike[]) => prev.filter((l) => l.id !== id));
      }
      showToast('✅ लाईक नोंद यशस्वीरीत्या हटवली.');
    }
  };

  // Approve a pending like
  const handleApprove = (like: PendingLike) => {
    if (typeof approveLike === 'function') {
      approveLike(like.id);
    }
    showToast(`✅ ${like.fromUserName} यांचा लाईक मंजूर केला.`);
  };

  // Reject a pending like
  const handleReject = (like: PendingLike) => {
    if (typeof rejectLike === 'function') {
      rejectLike(like.id);
    }
    showToast(`❌ ${like.fromUserName} यांचा लाईक नाकारला.`);
  };

  // Send admin notification to both members reminding them to connect
  const handleConnectMembers = (like: PendingLike) => {
    const sender = getProfile(like.fromUserId);
    const recipient = getProfile(like.toUserId);

    if (sender && recipient) {
      addNotification({
        userId: like.fromUserId,
        title: '❤️ ॲडमिन कडून मॅच सूचना',
        titleMr: '❤️ वंजारी जोडी ॲडमिन संदेश: परस्पर पसंती संपर्क!',
        message: `Admin has assisted your connection with ${like.toUserName}.`,
        messageMr: `अभिनंदन! ${like.toUserName} व तुम्ही एकमेकांना पसंती दर्शवली आहे. ॲडमिन टीमने तुमच्या संभाषणास शुभेच्छा दिल्या आहेत!`,
        type: 'match',
        data: { profileId: like.toUserId },
      });

      addNotification({
        userId: like.toUserId,
        title: '❤️ ॲडमिन कडून मॅच सूचना',
        titleMr: '❤️ वंजारी जोडी ॲडमिन संदेश: परस्पर पसंती संपर्क!',
        message: `Admin has assisted your connection with ${like.fromUserName}.`,
        messageMr: `अभिनंदन! ${like.fromUserName} व तुम्ही एकमेकांना पसंती दर्शवली आहे. ॲडमिन टीमने तुमच्या संभाषणास शुभेच्छा दिल्या आहेत!`,
        type: 'match',
        data: { profileId: like.fromUserId },
      });

      logActivity(
        'Admin Like Assistance',
        `ॲडमिनने ${like.fromUserName} आणि ${like.toUserName} यांच्या परस्पर पसंतीसाठी ॲप नोटिफिकेशन पाठवले.`,
        'Admin'
      );

      showToast(`🎉 दोघांनाही ॲडमिन कडून संपर्क व संभाषणाची सूचना पाठवली!`);
    } else {
      showToast('⚠️ सदस्यांची माहिती उपलब्ध नाही.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLikes.length === 0) {
      alert('डाउनलोड करण्यासाठी कोणताही डेटा उपलब्ध नाही.');
      return;
    }

    const headers = [
      'Like ID',
      'Sender Name',
      'Sender ID',
      'Sender Mobile',
      'Sender District',
      'Recipient Name',
      'Recipient ID',
      'Recipient Mobile',
      'Recipient District',
      'Date & Time',
      'Status',
      'Is Mutual Match',
      'Contact Unlocked',
    ];

    const rows = filteredLikes.map((l: PendingLike) => {
      const sender = getProfile(l.fromUserId);
      const recipient = getProfile(l.toUserId);
      return [
        l.id,
        `"${(l.fromUserName || '').replace(/"/g, '""')}"`,
        l.fromUserId,
        `"${sender?.mobile || l.fromUserMobile || ''}"`,
        `"${sender?.district || l.fromUserDistrict || ''}"`,
        `"${(l.toUserName || '').replace(/"/g, '""')}"`,
        l.toUserId,
        `"${recipient?.mobile || l.toUserMobile || ''}"`,
        `"${recipient?.district || l.toUserDistrict || ''}"`,
        `"${new Date(l.createdAt).toLocaleString('mr-IN')}"`,
        l.status,
        l.isMutual ? 'Yes' : 'No',
        l.contactUnlocked ? 'Yes' : 'No',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vanjari_Jodi_Likes_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] rounded-3xl p-5 sm:p-6 text-white border-2 border-amber-300 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-amber-400 text-[#800C1E] rounded-2xl shadow-lg shrink-0">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-[#800C1E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-amber-200">
                  सदस्य पसंती व लाईक्स ट्रॅकर (Member Likes & Matches Tracker)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-black border border-emerald-400/30">
                  Live Audit
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium mt-1">
                कोणत्या सदस्याने कोणाला लाईक केले, कोणाचे नंबर अनलॉक झाले व कोणाचे म्युचुअल मॅच झाले हे ॲडमिनला स्पष्टपणे पाहण्यासाठी.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-amber-300 hover:bg-amber-400 text-[#800C1E] rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <Download className="w-4 h-4 text-[#800C1E]" />
              <span>CSV रिपोर्ट डाउनलोड</span>
            </button>
          </div>
        </div>

        {/* Active Member Filter Banner if filtered by a specific profile */}
        {selectedMemberFilter && (
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between bg-black/20 px-3.5 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
              <span>फिल्टर केलेला सदस्य:</span>
              <span className="text-white font-black underline">{selectedMemberFilter.fullName}</span>
              <span className="text-amber-300 font-mono text-[11px]">({selectedMemberFilter.id})</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMemberFilter(null)}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded-lg cursor-pointer transition"
            >
              फिल्टर हटवा (Show All)
            </button>
          </div>
        )}
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold">एकूण लाईक्स</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">नोंदणीकृत पसंती</div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-bold">म्युचुअल मॅच 🔓</span>
            <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-100" />
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono">{stats.mutual}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">दोघांची परस्पर पसंती</div>
        </div>

        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-bold">एकतर्फी लाईक्स</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 font-mono">{stats.total - stats.mutual}</div>
          <div className="text-[10px] text-rose-600 mt-0.5 font-medium">समोरील उत्तराची प्रतीक्षा</div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold">प्रलंबित मंजुरी ⏳</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">{stats.pending}</div>
          <div className="text-[10px] text-amber-700 mt-0.5 font-medium">ॲडमिन अप्रूव्हल बाकी</div>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-xs font-bold">आजचे नवीन ⚡</span>
            <CheckCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-800 font-mono">{stats.today}</div>
          <div className="text-[10px] text-indigo-700 mt-0.5 font-medium">गेल्या २४ तासांत</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="लाईक पाठवणारा किंवा मिळालेला सदस्य शोधा (नाव, आयडी, मोबाईल)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-amber-200 bg-amber-50/30 focus:outline-none focus:ring-2 focus:ring-[#800C1E] font-bold text-slate-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-black">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl border cursor-pointer transition ${
                filterType === 'all'
                  ? 'bg-[#800C1E] text-amber-200 border-[#800C1E] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              सर्व ({pendingLikes.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('mutual')}
              className={`px-3 py-1.5 rounded-xl border cursor-pointer transition flex items-center gap-1 ${
                filterType === 'mutual'
                  ? 'bg-emerald-700 text-emerald-100 border-emerald-700 shadow-xs'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span>🎉 म्युचुअल मॅच ({stats.mutual})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('one_way')}
              className={`px-3 py-1.5 rounded-xl border cursor-pointer transition ${
                filterType === 'one_way'
                  ? 'bg-rose-700 text-rose-100 border-rose-700 shadow-xs'
                  : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
              }`}
            >
              ❤️ एकतर्फी लाईक्स ({stats.total - stats.mutual})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1.5 rounded-xl border cursor-pointer transition ${
                filterType === 'pending'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              ⏳ प्रलंबित ({stats.pending})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('approved')}
              className={`px-3 py-1.5 rounded-xl border cursor-pointer transition ${
                filterType === 'approved'
                  ? 'bg-indigo-700 text-indigo-100 border-indigo-700 shadow-xs'
                  : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              ✅ मंजूर ({stats.approved})
            </button>
          </div>
        </div>
      </div>

      {/* 4. Likes Activity List */}
      <div className="space-y-3.5">
        {filteredLikes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-amber-200 space-y-3">
            <Heart className="w-12 h-12 text-amber-300 mx-auto opacity-70" />
            <h4 className="text-base font-black text-slate-800">कोणत्याही लाईक नोंदी सापडल्या नाहीत</h4>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              {searchTerm
                ? 'शोधलेल्या निकषांशी जुळणारी एकही नोंद नाही. कृपया नाव किंवा आयडी तपासा.'
                : 'अद्याप कोणत्याही सदस्याने एकमेकांना लाईक केलेले नाही.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer transition"
              >
                शोध क्लिअर करा
              </button>
            )}
          </div>
        ) : (
          filteredLikes.map((like: PendingLike) => {
            const sender = getProfile(like.fromUserId);
            const recipient = getProfile(like.toUserId);

            const senderPhoto = sender?.photoUrl || sender?.photos?.[0] || like.fromUserPhoto;
            const recipientPhoto = recipient?.photoUrl || recipient?.photos?.[0] || like.toUserPhoto;

            const isMutual = Boolean(like.isMutual);
            const isUnlocked = Boolean(like.contactUnlocked || isMutual);

            return (
              <div
                key={like.id}
                className={`bg-white rounded-3xl border-2 transition-all shadow-sm hover:shadow-md overflow-hidden ${
                  isMutual
                    ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40'
                    : like.status === 'pending'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-rose-200'
                }`}
              >
                {/* Top Status Header */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400">ID: {like.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(like.createdAt).toLocaleString('mr-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isMutual ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-200" />
                        <span>🎉 म्युचुअल मॅच (दोघांची पसंती)</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black border border-rose-300 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-200" />
                        <span>❤️ एकतर्फी लाईक (One-Way)</span>
                      </span>
                    )}

                    {isUnlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        <span>नंबर अनलॉक</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>लॉक्ड</span>
                      </span>
                    )}

                    {like.status === 'pending' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>मंजुरी प्रलंबित</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main 3-Column Content: Sender -> Heart Interaction -> Recipient */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Sender Details (Col 1 to 5) */}
                  <div className="md:col-span-5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3.5">
                    {/* Sender Avatar */}
                    <div className="relative shrink-0">
                      {senderPhoto ? (
                        <img
                          src={senderPhoto}
                          alt={like.fromUserName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-400 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-lg border-2 border-rose-300 shadow-sm">
                          {(like.fromUserName || 'S').charAt(0)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                        Sender
                      </span>
                    </div>

                    {/* Sender Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {like.fromUserName}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                          {formatMemberId(like.fromUserId)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-semibold space-y-0.5">
                        <div className="truncate">
                          📍 {sender?.district || like.fromUserDistrict || 'जिल्हा नोंद नाही'} {sender?.city ? `(${sender.city})` : ''}
                        </div>
                        <div className="truncate text-slate-500 text-[11px]">
                          🎓 {sender?.education || 'शिक्षण नोंद नाही'} • 🎂 {sender?.age ? `${sender.age} वर्षे` : ''}
                        </div>
                      </div>

                      {/* Contact / Phone */}
                      <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-slate-200/80">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{sender?.mobile || like.fromUserMobile || 'उपलब्ध नाही'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {(sender?.mobile || like.fromUserMobile) && (
                            <a
                              href={`https://wa.me/91${(sender?.mobile || like.fromUserMobile || '').replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                              title="WhatsApp वर संपर्क करा"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {sender && onSelectMember && (
                            <button
                              type="button"
                              onClick={() => onSelectMember(sender)}
                              className="p-1 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-500 transition cursor-pointer"
                              title="प्रोफाईल पहा"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {sender && onOpenDirectNotification && (
                            <button
                              type="button"
                              onClick={() => onOpenDirectNotification(sender)}
                              className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                              title="थेट सूचना पाठवा"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Connection Flow (Col 6 to 7) */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-2 space-y-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 transition-transform ${
                        isMutual
                          ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-100 scale-105'
                          : 'bg-rose-500 text-white border-rose-300'
                      }`}
                    >
                      <Heart className={`w-6 h-6 fill-white ${isMutual ? 'animate-pulse' : ''}`} />
                    </div>

                    <div className="text-[11px] font-black leading-tight">
                      {isMutual ? (
                        <div className="text-emerald-700 font-extrabold">
                          दोघांची परस्पर पसंती ⇄
                        </div>
                      ) : (
                        <div className="text-rose-600 font-extrabold">
                          लाईक पाठवले ➔
                        </div>
                      )}
                    </div>

                    {/* Connect Assistance button */}
                    {isMutual && (
                      <button
                        type="button"
                        onClick={() => handleConnectMembers(like)}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-[10px] font-black shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1"
                        title="दोघांनाही ॲडमिन कडून संपर्क सहाय्य मेसेज पाठवा"
                      >
                        <Send className="w-3 h-3 text-[#800C1E]" />
                        <span>दोघांना नोटीस</span>
                      </button>
                    )}
                  </div>

                  {/* Recipient Details (Col 8 to 12) */}
                  <div className="md:col-span-5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3.5">
                    {/* Recipient Avatar */}
                    <div className="relative shrink-0">
                      {recipientPhoto ? (
                        <img
                          src={recipientPhoto}
                          alt={like.toUserName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg border-2 border-emerald-300 shadow-sm">
                          {(like.toUserName || 'R').charAt(0)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                        Target
                      </span>
                    </div>

                    {/* Recipient Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {like.toUserName}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                          {formatMemberId(like.toUserId)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-semibold space-y-0.5">
                        <div className="truncate">
                          📍 {recipient?.district || like.toUserDistrict || 'जिल्हा नोंद नाही'} {recipient?.city ? `(${recipient.city})` : ''}
                        </div>
                        <div className="truncate text-slate-500 text-[11px]">
                          🎓 {recipient?.education || 'शिक्षण नोंद नाही'} • 🎂 {recipient?.age ? `${recipient.age} वर्षे` : ''}
                        </div>
                      </div>

                      {/* Contact / Phone */}
                      <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-slate-200/80">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{recipient?.mobile || like.toUserMobile || 'उपलब्ध नाही'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {(recipient?.mobile || like.toUserMobile) && (
                            <a
                              href={`https://wa.me/91${(recipient?.mobile || like.toUserMobile || '').replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                              title="WhatsApp वर संपर्क करा"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {recipient && onSelectMember && (
                            <button
                              type="button"
                              onClick={() => onSelectMember(recipient)}
                              className="p-1 rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-500 transition cursor-pointer"
                              title="प्रोफाईल पहा"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {recipient && onOpenDirectNotification && (
                            <button
                              type="button"
                              onClick={() => onOpenDirectNotification(recipient)}
                              className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                              title="थेट सूचना पाठवा"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Action Bar */}
                <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-600 font-bold flex items-center gap-2">
                    <span>
                      {isMutual
                        ? '✨ दोघांची पसंती जुळल्यामुळे संपर्क क्रमांक व चॅट दोन्ही सदस्यांना थेट उपलब्ध झाले आहे.'
                        : 'ℹ️ या सदस्याने समोरच्या सदस्याला पसंती दिली आहे. समोरच्या सदस्याने लाईक केल्यास आपोआप म्युचुअल मॅच होईल.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {like.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(like)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>मंजूर करा</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(like)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>नाकारा</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteLike(like.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="नोंद हटवा"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Success Toast */}
      {actionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-black">{actionSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
