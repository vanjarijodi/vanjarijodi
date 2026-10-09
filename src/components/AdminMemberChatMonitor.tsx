import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage, UserProfile } from '../types';
import { uploadToCloudinary } from '../utils/cloudinary';
import { formatMemberId } from '../utils/idUtils';
import {
  MessageCircle,
  Search,
  Trash2,
  Users,
  ShieldAlert,
  Clock,
  Send,
  Sparkles,
  Phone,
  CheckCheck,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  ArrowLeft,
  Filter,
  UserCheck,
  X,
  Paperclip,
  CheckCircle,
  BellRing,
  HelpCircle,
  Heart,
  Database,
  HardDrive,
  Save,
  RefreshCw
} from 'lucide-react';

interface AdminMemberChatMonitorProps {
  onSelectMember?: (profileId: string) => void;
}

interface ConversationPair {
  pairKey: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  user1Mobile?: string;
  user2Mobile?: string;
  user1Avatar?: string;
  user2Avatar?: string;
  user1Gender?: string;
  user2Gender?: string;
  lastMessage: string;
  lastTimestamp: string;
  totalMessages: number;
  hasMedia: boolean;
  messages: ChatMessage[];
}

export const AdminMemberChatMonitor: React.FC<AdminMemberChatMonitorProps> = ({
  onSelectMember,
}) => {
  const {
    chatMessages,
    profiles,
    deleteChatMessage,
    sendPushNotification,
    adminSupportMessages,
    replyAdminSupportMessage,
    addNotification,
    pendingLikes = [],
    approveLike,
    rejectLike,
    pruneOldChatMessages,
    bulkClearChatAttachments,
    siteConfig,
    updateSiteConfig,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPairKey, setSelectedPairKey] = useState<string | null>(null);
  const [adminWarningText, setAdminWarningText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'media_only'>('all');

  // Firebase Chat Storage Optimizer State
  const [showStorageOptimizer, setShowStorageOptimizer] = useState(false);
  const [selectedRetentionDays, setSelectedRetentionDays] = useState<number>(siteConfig?.chatRetentionDays ?? 30);
  const [selectedMaxPerPair, setSelectedMaxPerPair] = useState<number>(siteConfig?.maxChatMessagesPerPair ?? 100);
  const [cleanNote, setCleanNote] = useState<string | null>(null);

  const estChatBytes = useMemo(() => chatMessages.reduce((acc, m) => acc + JSON.stringify(m).length, 0), [chatMessages]);
  const estChatMB = (estChatBytes / (1024 * 1024)).toFixed(2);

  const handleRunStorageCleanup = () => {
    if (confirm(`खात्री आहे का? निवडलेल्या नियमांनुसार (${selectedRetentionDays} दिवस + ${selectedMaxPerPair} मेसेज/जोडी) जुने मेसेज फायरबेस मधून कायमचे हटवले जातील व जागा मोकळी होईल.`)) {
      if (typeof pruneOldChatMessages === 'function') {
        const res = pruneOldChatMessages(selectedRetentionDays, selectedMaxPerPair);
        setCleanNote(`✅ स्वच्छता पूर्ण! ${res.countDeleted} जुने मेसेज हटवले गेले. सुमारे ${res.bytesSavedKB} KB (~${(res.bytesSavedKB / 1024).toFixed(2)} MB) फायरबेस जागा मोकळी झाली!`);
        setTimeout(() => setCleanNote(null), 6000);
      }
    }
  };

  const handlePurgeAttachments = () => {
    if (confirm('खात्री आहे का? सर्व जुन्या मेसेज मधील फोटो/मीडिया फाइल्स काढल्या जातील व केवळ मजकूर (Text) राहील.')) {
      if (typeof bulkClearChatAttachments === 'function') {
        const res = bulkClearChatAttachments();
        setCleanNote(`✅ मीडिया क्लिनअप पूर्ण! ${res.countCleared} फाइल्स काढल्या. सुमारे ${res.bytesSavedKB} KB (~${(res.bytesSavedKB / 1024).toFixed(2)} MB) जागा मोकळी झाली!`);
        setTimeout(() => setCleanNote(null), 6000);
      }
    }
  };

  const handleSaveRetentionRules = async () => {
    if (typeof updateSiteConfig === 'function') {
      await updateSiteConfig({
        chatRetentionDays: selectedRetentionDays,
        maxChatMessagesPerPair: selectedMaxPerPair,
        autoCompressChatImages: true
      });
      setCleanNote(`⚙️ ऑटो-रिटेंशन नियम जतन केले: ${selectedRetentionDays} दिवसांनंतर व ${selectedMaxPerPair} मेसेज पेक्षा जास्त मेसेज आपोआप डिलीट होतील.`);
      setTimeout(() => setCleanNote(null), 5000);
    }
  };

  // Direct Admin-to-Member Messaging Modal State
  const [isDirectMsgModalOpen, setIsDirectMsgModalOpen] = useState(false);
  const [directMsgTargetMember, setDirectMsgTargetMember] = useState<UserProfile | null>(null);
  const [directMsgSearch, setDirectMsgSearch] = useState('');
  const [directMsgText, setDirectMsgText] = useState('');
  const [directMsgFile, setDirectMsgFile] = useState<File | null>(null);
  const [directMsgFileUrl, setDirectMsgFileUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSendingDirectMsg, setIsSendingDirectMsg] = useState(false);
  const [directMsgSuccessNote, setDirectMsgSuccessNote] = useState<string | null>(null);

  // Helper to find profile by ID
  const getProfile = (id: string): UserProfile | undefined => {
    return profiles.find((p) => p.id === id);
  };

  // Open Direct Message modal for specific member
  const handleOpenDirectMessage = (member: UserProfile) => {
    setDirectMsgTargetMember(member);
    setDirectMsgText('');
    setDirectMsgFile(null);
    setDirectMsgFileUrl('');
    setDirectMsgSuccessNote(null);
    setIsDirectMsgModalOpen(true);
  };

  // Send Direct Message & Trigger Notification
  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsgTargetMember) {
      alert('कृपया प्राप्तकर्ता सदस्य निवडा.');
      return;
    }
    if (!directMsgText.trim() && !directMsgFileUrl && !directMsgFile) {
      alert('कृपया संदेश मजकूर किंवा फाइल जोडा.');
      return;
    }

    try {
      setIsSendingDirectMsg(true);
      let finalFileUrl = directMsgFileUrl;
      let finalFileName = directMsgFile?.name;

      if (directMsgFile && !finalFileUrl) {
        setIsUploadingFile(true);
        const res = await uploadToCloudinary(directMsgFile, 'admin_messages');
        if (res?.url) {
          finalFileUrl = res.url;
        }
        setIsUploadingFile(false);
      }

      // Store in adminSupportMessages
      replyAdminSupportMessage(
        directMsgTargetMember.id,
        directMsgText.trim(),
        finalFileUrl || undefined,
        finalFileName || undefined
      );

      // Trigger Push Notification
      if (typeof sendPushNotification === 'function') {
        sendPushNotification(
          directMsgTargetMember.id,
          'वंजारी जोडी - ॲडमिन संदेश 📩',
          directMsgText.trim() || 'ॲडमिन यांनी तुम्हाला थेट संदेश पाठवला आहे.'
        );
      }

      // Trigger In-app Notification
      if (typeof addNotification === 'function') {
        addNotification({
          userId: directMsgTargetMember.id,
          title: 'New Message from Admin',
          titleMr: '📩 ॲडमिन कडून थेट संदेश प्राप्त!',
          message: directMsgText.trim() || 'ॲडमिन यांनी तुम्हाला थेट संदेश पाठवला आहे.',
          messageMr: `${directMsgTargetMember.fullName}जी, ॲडमिन कडून संदेश: "${directMsgText.trim() || (finalFileUrl ? 'फाइल संलग्नक' : 'नवीन संदेश')}"`,
          type: 'chat',
        });
      }

      setDirectMsgSuccessNote(`✅ संदेश ${directMsgTargetMember.fullName} यांना यशस्वीरीत्या पाठवला व नोटिफिकेशन पाठवले गेले!`);
      setDirectMsgText('');
      setDirectMsgFile(null);
      setDirectMsgFileUrl('');
      setTimeout(() => {
        setDirectMsgSuccessNote(null);
      }, 4000);
    } catch (err) {
      console.error('Error sending direct message:', err);
      alert('संदेश पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSendingDirectMsg(false);
      setIsUploadingFile(false);
    }
  };

  // Group all member-to-member chat messages by unique pair
  const conversationPairs = useMemo(() => {
    const pairsMap: { [key: string]: ConversationPair } = {};

    chatMessages.forEach((msg) => {
      if (!msg.senderId || !msg.receiverId) return;

      // Deterministic pair key so UserA->UserB and UserB->UserA group together
      const sortedIds = [msg.senderId, msg.receiverId].sort();
      const pairKey = `${sortedIds[0]}_${sortedIds[1]}`;

      const senderProfile = getProfile(msg.senderId);
      const receiverProfile = getProfile(msg.receiverId);

      const hasMedia = Boolean(msg.imageUrl || msg.pdfUrl || msg.voiceUrl);

      if (!pairsMap[pairKey]) {
        pairsMap[pairKey] = {
          pairKey,
          user1Id: sortedIds[0],
          user2Id: sortedIds[1],
          user1Name: getProfile(sortedIds[0])?.fullName || `सदस्य (${sortedIds[0].slice(0, 5)})`,
          user2Name: getProfile(sortedIds[1])?.fullName || `सदस्य (${sortedIds[1].slice(0, 5)})`,
          user1Mobile: getProfile(sortedIds[0])?.mobile,
          user2Mobile: getProfile(sortedIds[1])?.mobile,
          user1Avatar: getProfile(sortedIds[0])?.photos?.[0],
          user2Avatar: getProfile(sortedIds[1])?.photos?.[0],
          user1Gender: getProfile(sortedIds[0])?.gender,
          user2Gender: getProfile(sortedIds[1])?.gender,
          lastMessage: msg.text || (msg.imageUrl ? '📷 फोटो' : msg.voiceUrl ? '🎙️ व्हॉईस नोट' : '📄 दस्तऐवज'),
          lastTimestamp: msg.timestamp,
          totalMessages: 1,
          hasMedia,
          messages: [msg],
        };
      } else {
        pairsMap[pairKey].totalMessages += 1;
        if (hasMedia) pairsMap[pairKey].hasMedia = true;
        pairsMap[pairKey].messages.push(msg);

        // Keep last message updated
        if (new Date(msg.timestamp).getTime() >= new Date(pairsMap[pairKey].lastTimestamp).getTime()) {
          pairsMap[pairKey].lastMessage = msg.text || (msg.imageUrl ? '📷 फोटो' : msg.voiceUrl ? '🎙️ व्हॉईस नोट' : '📄 दस्तऐवज');
          pairsMap[pairKey].lastTimestamp = msg.timestamp;
        }
      }
    });

    // Sort messages inside each pair by timestamp
    Object.values(pairsMap).forEach((pair) => {
      pair.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    // Return array sorted by latest activity
    return Object.values(pairsMap).sort(
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
  }, [chatMessages, profiles]);

  // Filter conversation pairs by search
  const filteredPairs = useMemo(() => {
    return conversationPairs.filter((pair) => {
      if (filterMode === 'media_only' && !pair.hasMedia) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const match1 = pair.user1Name.toLowerCase().includes(q) || (pair.user1Mobile || '').includes(q);
      const match2 = pair.user2Name.toLowerCase().includes(q) || (pair.user2Mobile || '').includes(q);
      const matchMsg = pair.messages.some((m) => (m.text || '').toLowerCase().includes(q));
      return match1 || match2 || matchMsg;
    });
  }, [conversationPairs, searchTerm, filterMode]);

  // Selected Active Conversation
  const selectedConversation = useMemo(() => {
    if (!selectedPairKey) {
      return filteredPairs[0] || null;
    }
    return conversationPairs.find((p) => p.pairKey === selectedPairKey) || filteredPairs[0] || null;
  }, [conversationPairs, selectedPairKey, filteredPairs]);

  // Send Moderator Warning to both or one of the members
  const handleSendModeratorWarning = (targetUserId: string, targetName: string) => {
    if (!adminWarningText.trim()) {
      alert('कृपया चेतावणी संदेश टाईप करा.');
      return;
    }
    sendPushNotification(
      targetUserId,
      'प्रशासक सुरक्षा इशारा ⚠️',
      adminWarningText.trim()
    );
    alert(`✅ ${targetName} यांना सुरक्षा इशारा यशस्वीरीत्या पाठवला गेला!`);
    setAdminWarningText('');
  };

  // Delete all messages in thread
  const handleDeleteEntireThread = (pair: ConversationPair) => {
    if (
      window.confirm(
        `तुम्हाला खरोखरच ${pair.user1Name} आणि ${pair.user2Name} यांच्यामधील सर्व ${pair.totalMessages} संदेश हटवायचे आहेत का?`
      )
    ) {
      pair.messages.forEach((msg) => {
        deleteChatMessage(msg.id);
      });
      alert('संभाषण यशस्वीरित्या हटवले गेले.');
      setSelectedPairKey(null);
    }
  };

  // Filtered members for direct messaging picker
  const filteredDirectMembers = useMemo(() => {
    if (!directMsgSearch.trim()) return profiles.slice(0, 15);
    const q = directMsgSearch.toLowerCase().trim();
    return profiles
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.mobile.includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [profiles, directMsgSearch]);

  // Previous Admin-to-Member Messages with this target member
  const memberAdminChatHistory = useMemo(() => {
    if (!directMsgTargetMember) return [];
    return adminSupportMessages.filter(
      (m) => m.senderId === directMsgTargetMember.id
    );
  }, [adminSupportMessages, directMsgTargetMember]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] rounded-3xl p-5 sm:p-6 text-white border-2 border-amber-300 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-amber-400 text-[#800C1E] rounded-2xl shadow-lg shrink-0">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-amber-200">
                  सदस्य थेट चॅट मॉनिटर (All Member-to-Member Chats)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-black border border-emerald-400/30">
                  Super Admin View
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium mt-1">
                कोणत्या सदस्याने कोणाशी काय चॅट केले, काय फोटो/दस्तऐवज पाठवले हे ॲडमिनला स्पष्टपणे पाहण्यासाठी व सुरक्षिततेचे नियमन करण्यासाठी.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-black">
            <button
              type="button"
              onClick={() => setShowStorageOptimizer((prev) => !prev)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl shadow-lg font-black text-xs cursor-pointer flex items-center gap-1.5 border border-emerald-300 transition transform active:scale-95"
              title="फायरबेस मधील चॅट डेटाबेस व फोटो क्लिनअप पर्याय"
            >
              <Database className="w-4 h-4 text-emerald-200" />
              <span>🧹 फायरबेस स्पेस ऑप्टिमायझर</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDirectMsgTargetMember(profiles[0] || null);
                setIsDirectMsgModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-300 hover:bg-amber-400 text-[#800C1E] rounded-2xl shadow-lg font-black text-xs cursor-pointer flex items-center gap-2 border border-amber-400 transition transform active:scale-95"
            >
              <Send className="w-4 h-4 text-[#800C1E]" />
              <span>✍️ सदस्याला थेट मेसेज पाठवा (Direct Admin Message)</span>
            </button>

            <div className="bg-black/25 px-3 py-1.5 rounded-xl border border-amber-300/30 text-amber-200">
              एकूण संभाषणे: <span className="text-white font-mono text-sm">{conversationPairs.length}</span>
            </div>
            <div className="bg-black/25 px-3 py-1.5 rounded-xl border border-amber-300/30 text-amber-200">
              एकूण संदेश: <span className="text-white font-mono text-sm">{chatMessages.length}</span>
            </div>
            <div className="bg-black/25 px-3 py-1.5 rounded-xl border border-rose-300/40 text-rose-200 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>लाईक्स: <span className="text-white font-mono text-sm">{pendingLikes.length}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* FIREBASE CHAT STORAGE OPTIMIZER CONTROL PANEL */}
      {showStorageOptimizer && (
        <div className="bg-slate-900 text-white border-2 border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-amber-300 text-sm sm:text-base flex items-center gap-2">
                  <span>🧹 फायरबेस डेटाबेस व चॅट स्पेस ऑप्टिमायझर</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-400/40">
                    STORAGE CONTROL
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">
                  चॅट मेसेजमुळे फायरबेसची मोफत जागा भरू नये म्हणून स्वयंचलित व मॅन्युअल स्वच्छता नियंत्रक.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowStorageOptimizer(false)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs cursor-pointer border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">एकूण मेसेज संख्या</span>
              <div className="text-lg font-black text-amber-300 font-mono">{chatMessages.length} संदेश</div>
              <span className="text-[10px] text-slate-400">एकूण संभाषणे: {conversationPairs.length}</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">वापरलेली जागा (अंदाजे)</span>
              <div className="text-lg font-black text-emerald-400 font-mono">~{estChatMB} MB</div>
              <span className="text-[10px] text-emerald-300 font-semibold">✓ स्वयंचलित कॉम्प्रेशन चालू</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">सध्याचे ऑटो-रिटेंशन नियम</span>
              <div className="text-sm font-black text-sky-300">
                {selectedRetentionDays > 0 ? `${selectedRetentionDays} दिवसांनंतर स्वयंचलित क्लिनअप` : 'सर्व मेसेज सुरक्षित ठेवले जातील'}
              </div>
              <span className="text-[10px] text-slate-400">जास्तीत जास्त {selectedMaxPerPair} मेसेज/जोडी</span>
            </div>
          </div>

          {/* Clean Toast Notification */}
          {cleanNote && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{cleanNote}</span>
            </div>
          )}

          {/* Interactive Retention Settings Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                ⏳ चॅट मेसेज कालावधी नियम (Retention Days)
              </label>
              <select
                value={selectedRetentionDays}
                onChange={(e) => setSelectedRetentionDays(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-900 text-amber-200 border border-slate-600 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value={30}>३० दिवसांनंतर जुने मेसेज आपोआप हटवा (शिफारस केलेले - ३० दिवस)</option>
                <option value={60}>६० दिवसांनंतर जुने मेसेज आपोआप हटवा (६० दिवस)</option>
                <option value={90}>९० दिवसांनंतर जुने मेसेज आपोआप हटवा (९० दिवस)</option>
                <option value={180}>१८० दिवसांनंतर जुने मेसेज आपोआप हटवा (६ महिने)</option>
                <option value={0}>काढू नका (अमर्याद दिवस ठेवू नका - स्पेस भरेल)</option>
              </select>
              <span className="text-[10.5px] text-slate-400 block">
                न ठरवलेले किंवा ३० दिवसांपेक्षा जुने मेसेज रोज रात्री बॅकग्राउंडमध्ये आपोआप डिलीट होतील.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                📊 एका जोडीमध्ये जास्तीत जास्त मेसेज मर्यादा (Message Cap)
              </label>
              <select
                value={selectedMaxPerPair}
                onChange={(e) => setSelectedMaxPerPair(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-900 text-amber-200 border border-slate-600 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value={50}>एका जोडीत कमाल ५० मेसेज ठेवा (५० वरचे जुने मेसेज डिलीट होतील)</option>
                <option value={100}>एका जोडीत कमाल १०० मेसेज ठेवा (शिफारस केलेले - १०० मेसेज)</option>
                <option value={200}>एका जोडीत कमाल २०० मेसेज ठेवा (२०० मेसेज)</option>
                <option value={0}>अमर्याद मेसेज ठेवा</option>
              </select>
              <span className="text-[10.5px] text-slate-400 block">
                नवीन मेसेज येताच त्या संभाषण जोडीतील सर्वात जुने मेसेज स्वयंचलित काढून जागा मोकळी ठेवली जाईल.
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunStorageCleanup}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer border border-emerald-300 transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
                <span>🧹 तत्काळ ऑटो-क्लीनअप रन करा (Run Cleanup Now)</span>
              </button>

              <button
                type="button"
                onClick={handlePurgeAttachments}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-700 to-pink-800 hover:from-rose-800 hover:to-pink-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer border border-rose-400/40 transition active:scale-95"
                title="मेसेजमधील सर्व भारी फोटो काढूल केवळ टेक्स्ट मेसेज ठेवा"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-200" />
                <span>📷 भारी फोटो व मीडिया फाइल्स क्लियर करा</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveRetentionRules}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer border border-amber-200 transition active:scale-95 ml-auto"
            >
              <Save className="w-3.5 h-3.5 text-slate-950" />
              <span>⚙️ नियम सेव्ह करा (Save Auto Rules)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Chat Monitor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[650px]">
        {/* Left Column: Conversation Pairs List */}
        <div
          className={`${
            selectedPairKey ? 'hidden lg:flex' : 'flex'
          } lg:col-span-5 bg-white rounded-3xl border-2 border-amber-300 shadow-md flex-col h-full overflow-hidden`}
        >
          {/* Header & Search */}
          <div className="p-3.5 border-b border-amber-200 bg-amber-50/50 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="सदस्याचे नाव, मोबाईल किंवा मजकूर शोधा..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A71930] font-bold text-slate-900"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-slate-600">संभाषण यादी ({filteredPairs.length})</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    filterMode === 'all'
                      ? 'bg-[#A71930] text-amber-100 border-[#A71930]'
                      : 'bg-white text-slate-700 border-amber-200'
                  }`}
                >
                  सर्व
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('media_only')}
                  className={`px-2 py-1 rounded-lg border transition ${
                    filterMode === 'media_only'
                      ? 'bg-[#A71930] text-amber-100 border-[#A71930]'
                      : 'bg-white text-slate-700 border-amber-200'
                  }`}
                >
                  📷 फोटो/मीडिया
                </button>
              </div>
            </div>
          </div>

          {/* Conversation List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-amber-100 p-1">
            {filteredPairs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <MessageCircle className="w-10 h-10 mx-auto text-amber-300 opacity-60" />
                <p className="text-xs font-bold">कोणतेही सदस्य चॅट संभाषण उपलब्ध नाही.</p>
              </div>
            ) : (
              filteredPairs.map((pair) => {
                const isSelected = selectedConversation?.pairKey === pair.pairKey;
                return (
                  <button
                    key={pair.pairKey}
                    onClick={() => setSelectedPairKey(pair.pairKey)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 my-0.5 ${
                      isSelected
                        ? 'bg-[#A71930] text-white shadow-md border-2 border-amber-300'
                        : 'hover:bg-amber-50 text-slate-800 border border-transparent'
                    }`}
                  >
                    {/* Avatars Overlap Stack */}
                    <div className="relative w-11 h-11 shrink-0">
                      <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow bg-slate-200 absolute top-0 left-0">
                        {pair.user1Avatar ? (
                          <img src={pair.user1Avatar} alt={pair.user1Name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-amber-200 text-[#800C1E] flex items-center justify-center text-[10px] font-black">
                            {pair.user1Name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow bg-slate-200 absolute bottom-0 right-0">
                        {pair.user2Avatar ? (
                          <img src={pair.user2Avatar} alt={pair.user2Name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#A71930] text-amber-100 flex items-center justify-center text-[10px] font-black">
                            {pair.user2Name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chat Overview Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h5 className={`text-xs font-black truncate ${isSelected ? 'text-amber-200' : 'text-slate-900'}`}>
                          {pair.user1Name} ↔ {pair.user2Name}
                        </h5>
                        <span className={`text-[9px] font-mono shrink-0 ${isSelected ? 'text-amber-100/80' : 'text-slate-400'}`}>
                          {pair.lastTimestamp ? pair.lastTimestamp.split(' ')[0] : ''}
                        </span>
                      </div>

                      <p className={`text-[11px] truncate font-medium ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                        {pair.lastMessage}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isSelected ? 'bg-black/30 text-amber-200' : 'bg-amber-100 text-[#800C1E]'}`}>
                          {pair.totalMessages} संदेश
                        </span>
                        {pair.hasMedia && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isSelected ? 'bg-amber-300 text-[#800C1E]' : 'bg-sky-100 text-sky-800'}`}>
                            📷 मीडिया
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Conversation Transcript & Admin Controls */}
        <div
          className={`${
            !selectedPairKey ? 'hidden lg:flex' : 'flex'
          } lg:col-span-7 bg-white rounded-3xl border-2 border-amber-300 shadow-md flex-col h-full overflow-hidden`}
        >
          {selectedConversation ? (
            <>
              {/* Transcript Header */}
              <div className="p-3.5 border-b border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPairKey(null)}
                    className="lg:hidden p-1.5 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-lg text-xs font-bold flex items-center cursor-pointer"
                    title="संभाषण यादीकडे परत"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-[#A71930] text-xs sm:text-sm">
                        {selectedConversation.user1Name}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-200 text-[#800C1E] px-1.5 py-0.5 rounded">
                        {formatMemberId(selectedConversation.user1Id)}
                      </span>
                      <span className="text-slate-400 font-bold">↔</span>
                      <span className="font-black text-[#A71930] text-xs sm:text-sm">
                        {selectedConversation.user2Name}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-200 text-[#800C1E] px-1.5 py-0.5 rounded">
                        {formatMemberId(selectedConversation.user2Id)}
                      </span>
                      {(() => {
                        const matchLike = pendingLikes.find(
                          (l) =>
                            (l.fromUserId === selectedConversation.user1Id && l.toUserId === selectedConversation.user2Id) ||
                            (l.fromUserId === selectedConversation.user2Id && l.toUserId === selectedConversation.user1Id)
                        );
                        if (!matchLike) return null;
                        if (matchLike.isMutual) {
                          return (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                              <span>🎉 Mutual Match</span>
                            </span>
                          );
                        }
                        return (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-600 text-rose-600" />
                            <span>❤️ Like Sent</span>
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span>📞 {selectedConversation.user1Mobile || 'N/A'}</span>
                      <span>•</span>
                      <span>📞 {selectedConversation.user2Mobile || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Direct Message Member 1 Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const m1 = getProfile(selectedConversation.user1Id);
                      if (m1) handleOpenDirectMessage(m1);
                    }}
                    className="px-2.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer shadow"
                    title={`${selectedConversation.user1Name} यांना थेट संदेश पाठवा`}
                  >
                    <Send className="w-3 h-3 text-amber-300" />
                    <span>{selectedConversation.user1Name.split(' ')[0]} ला मेसेज</span>
                  </button>

                  {/* Direct Message Member 2 Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const m2 = getProfile(selectedConversation.user2Id);
                      if (m2) handleOpenDirectMessage(m2);
                    }}
                    className="px-2.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer shadow"
                    title={`${selectedConversation.user2Name} यांना थेट संदेश पाठवा`}
                  >
                    <Send className="w-3 h-3 text-amber-300" />
                    <span>{selectedConversation.user2Name.split(' ')[0]} ला मेसेज</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEntireThread(selectedConversation)}
                    className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-bold border border-rose-300 flex items-center gap-1 cursor-pointer"
                    title="सर्व संभाषण नष्ट करा"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटवा</span>
                  </button>
                </div>
              </div>

              {/* Message Transcript Bubbles */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {selectedConversation.messages.map((msg) => {
                  const isUser1 = msg.senderId === selectedConversation.user1Id;
                  const senderName = isUser1 ? selectedConversation.user1Name : selectedConversation.user2Name;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isUser1 ? 'mr-auto items-start' : 'ml-auto items-end'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5 px-1">
                        <span className="font-black text-[#800C1E]">{senderName}</span>
                        <span>•</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs relative group border shadow-sm ${
                          isUser1
                            ? 'bg-white text-slate-800 border-amber-200 rounded-tl-none'
                            : 'bg-[#A71930] text-amber-100 border-[#800C1E] rounded-tr-none'
                        }`}
                      >
                        {msg.text && (
                          <p className="whitespace-pre-wrap font-medium leading-relaxed break-words">
                            {msg.text}
                          </p>
                        )}

                        {/* Image Attachment */}
                        {msg.imageUrl && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-black/10 max-w-xs">
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              referrerPolicy="no-referrer"
                              className="w-full max-h-48 object-cover cursor-pointer"
                              onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                          </div>
                        )}

                        {/* PDF Attachment */}
                        {msg.pdfUrl && (
                          <a
                            href={msg.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-black/10 text-[11px] font-bold"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="truncate">{msg.pdfName || 'दस्तऐवज PDF'}</span>
                          </a>
                        )}

                        {/* Voice Note */}
                        {msg.voiceUrl && (
                          <div className="mt-2 p-2 rounded-xl bg-black/10 flex items-center gap-2">
                            <Mic className="w-4 h-4 text-amber-400" />
                            <audio controls src={msg.voiceUrl} className="h-8 w-44" />
                          </div>
                        )}

                        {/* Hover Delete Single Message */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('हा विशिष्ट संदेश हटवायचा आहे का?')) {
                              deleteChatMessage(msg.id);
                            }
                          }}
                          className={`absolute top-2 ${
                            isUser1 ? '-right-7' : '-left-7'
                          } opacity-0 group-hover:opacity-100 transition p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow cursor-pointer`}
                          title="हा संदेश हटवा"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Moderator Warning Box */}
              <div className="p-3 border-t border-amber-200 bg-amber-50/80 space-y-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-[#800C1E]">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>प्रशासक चेतावणी / सूचना पाठवा (Send Moderator Notice):</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="संदर्भात चेतावणी लिहा (उदा. कृपया नियमांचे पालन करा)..."
                    value={adminWarningText}
                    onChange={(e) => setAdminWarningText(e.target.value)}
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#A71930]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleSendModeratorWarning(
                        selectedConversation.user1Id,
                        selectedConversation.user1Name
                      )
                    }
                    className="px-2.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-[10px] font-black cursor-pointer shrink-0"
                  >
                    {selectedConversation.user1Name.split(' ')[0]} ला चेतावणी
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSendModeratorWarning(
                        selectedConversation.user2Id,
                        selectedConversation.user2Name
                      )
                    }
                    className="px-2.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-[10px] font-black cursor-pointer shrink-0"
                  >
                    {selectedConversation.user2Name.split(' ')[0]} ला चेतावणी
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageCircle className="w-12 h-12 text-amber-300 mb-2 opacity-50" />
              <h4 className="font-bold text-xs text-slate-700">कोणतेही संभाषण निवडलेले नाही</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                डाव्या बाजूच्या यादीमधून सदस्यांची जोडी निवडा.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DIRECT ADMIN-TO-MEMBER MESSAGING MODAL */}
      {isDirectMsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-[#800C1E] rounded-xl font-black">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-200">
                    सदस्याला थेट ॲडमिन संदेश व नोटिफिकेशन पाठवा
                  </h3>
                  <p className="text-xs text-amber-100/80">
                    हा संदेश सदस्याच्या इनबॉक्स/सपोर्ट चॅटमध्ये दिसेल आणि त्यांच्या मोबाईलवर नोटिफिकेशन जाईल.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectMsgModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Member Selector Search */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#800C1E] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#800C1E]" />
                    <span>संदेश प्राप्तकर्ता सदस्य निवडा (Select Target Member):</span>
                  </label>
                  {directMsgTargetMember && (
                    <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ निवडले: {directMsgTargetMember.fullName}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="नाव, मोबाईल क्रमांक किंवा जिल्हा टाईप करून शोधा..."
                    value={directMsgSearch}
                    onChange={(e) => setDirectMsgSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                  />
                </div>

                {/* Member Quick Chips List */}
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1 pr-1">
                  {filteredDirectMembers.map((m) => {
                    const isTarget = directMsgTargetMember?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setDirectMsgTargetMember(m)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 border transition cursor-pointer ${
                          isTarget
                            ? 'bg-[#A71930] text-amber-100 border-[#800C1E] shadow'
                            : 'bg-white hover:bg-amber-100/70 text-slate-800 border-amber-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>{m.fullName}</span>
                        <span className="text-[9px] opacity-75">({m.district || m.mobile.slice(-4)})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Member Mini Profile Card */}
              {directMsgTargetMember && (
                <div className="p-3 bg-gradient-to-r from-amber-100/70 to-rose-50 rounded-2xl border border-amber-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        directMsgTargetMember.photoUrl ||
                        directMsgTargetMember.photos?.[0] ||
                        (directMsgTargetMember.gender === 'bride'
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100')
                      }
                      alt={directMsgTargetMember.fullName}
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-sm"
                    />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>{directMsgTargetMember.fullName}</span>
                        <span className="text-[10px] px-2 py-0.2 bg-amber-200 text-[#800C1E] rounded-md font-bold">
                          {directMsgTargetMember.gender === 'bride' ? 'वधू' : 'वर'}
                        </span>
                      </h4>
                      <div className="text-[11px] text-slate-600 font-medium">
                        📞 {directMsgTargetMember.mobile} • 📍 {directMsgTargetMember.district} • 👑 प्लॅन: {directMsgTargetMember.membershipTier || 'Free'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectMember) onSelectMember(directMsgTargetMember.id);
                    }}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-xl text-[10px] font-black border border-amber-300 cursor-pointer shrink-0"
                  >
                    बायोडाटा पहा
                  </button>
                </div>
              )}

              {/* Marathi Preset Message Quick-Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#800C1E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>तयार मराठी संदेश पर्याय (Quick Marathi Templates):</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDirectMsgText('नमस्कार, वंजारी जोडी मॅट्रिमोनी ॲडमिन कडून संपर्क. आपल्या बायोडाटा किंवा सबस्क्रिप्शन संदर्भात काही मदत हवी असल्यास येथे प्रतिसाद द्यावा.')
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                  >
                    💬 मदत व संपर्क
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDirectMsgText('⚠️ सूचना: आपला बायोडाटा अधिक प्रभावी होण्यासाठी कृपया आपला स्पष्ट फोटो आणि संपूर्ण कौटुंबिक माहिती अपडेट करावी.')
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                  >
                    📷 फोटो व माहिती अपडेट
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDirectMsgText('👑 विशेष ऑफर! वंजारी जोडीवर स्पेशल वेलकम प्रीमियम प्लॅन उपलब्ध आहे. त्वरित संपर्क क्रमांक अनलॉक करा व इच्छित स्थळांशी थेट बोला.')
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                  >
                    👑 प्रीमियम सवलत ऑफर
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDirectMsgText('🛡️ सुरक्षितता सूचना: कृपया अज्ञात सदस्यासोबत आर्थिक व्यवहार करू नका. कोणत्याही संशयास्पद कृतीची ॲडमिनला त्वरित तक्रार करा.')
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                  >
                    🛡️ सुरक्षा सूचना
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDirectMsgText('🎉 अभिनंदन! आपली वंजारी जोडी प्रोफाईल ॲडमिन कडून पडताळणी करून यशस्वीरीत्या मंजूर (Approved) करण्यात आली आहे.')
                    }
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                  >
                    🎉 प्रोफाईल मंजूर
                  </button>
                </div>
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendDirectMessage} className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    संदेश मजकूर (Message Body):
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="सदस्याला पाठवायचा संदेश येथे लिहा..."
                    value={directMsgText}
                    onChange={(e) => setDirectMsgText(e.target.value)}
                    className="w-full bg-white border-2 border-amber-300 rounded-2xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#A71930]"
                  />
                </div>

                {/* File Attachment Upload */}
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-amber-300">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{isUploadingFile ? 'अपलोड होत आहे...' : 'फोटो / PDF जोडा'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isUploadingFile}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setDirectMsgFile(file);
                        }}
                        className="hidden"
                      />
                    </label>
                    {directMsgFile && (
                      <span className="text-[11px] font-bold text-slate-700 truncate max-w-xs">
                        📎 {directMsgFile.name}
                      </span>
                    )}
                  </div>

                  {directMsgFile && (
                    <button
                      type="button"
                      onClick={() => setDirectMsgFile(null)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                    >
                      काढून टाका
                    </button>
                  )}
                </div>

                {/* Success Feedback Note */}
                {directMsgSuccessNote && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-300 text-xs font-black flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{directMsgSuccessNote}</span>
                  </div>
                )}

                {/* Submit Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDirectMsgModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black text-xs cursor-pointer"
                  >
                    रद्द करा
                  </button>

                  <button
                    type="submit"
                    disabled={isSendingDirectMsg}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#A71930] to-[#800C1E] hover:from-[#800C1E] text-amber-100 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 border border-amber-400 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>{isSendingDirectMsg ? 'पाठवत आहे...' : 'संदेश व नोटिफिकेशन पाठवा (Send Message)'}</span>
                  </button>
                </div>
              </form>

              {/* Chat History with this member */}
              {memberAdminChatHistory.length > 0 && (
                <div className="pt-3 border-t border-amber-200 space-y-2">
                  <h5 className="text-xs font-black text-[#A71930]">
                    या सदस्यासोबत पूर्वी झालेले ॲडमिन संभाषण ({memberAdminChatHistory.length} संदेश):
                  </h5>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {memberAdminChatHistory.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2 rounded-lg text-[11px] ${
                          m.senderRole === 'admin'
                            ? 'bg-amber-100 text-[#800C1E] border border-amber-300 font-bold ml-6'
                            : 'bg-white text-slate-800 border border-slate-200 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] opacity-75 mb-0.5">
                          <span>{m.senderRole === 'admin' ? '🛡️ ॲडमिन' : `👤 ${m.senderName}`}</span>
                          <span>{m.timestamp}</span>
                        </div>
                        <p>{m.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
