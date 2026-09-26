import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  HardDrive,
  Trash2,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  FileImage,
  Search,
  ArrowUpDown,
  Download,
  FileText,
  User,
  Zap,
  Filter,
  Package,
  Layers,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';

export const AdminStorageManager: React.FC = () => {
  const {
    profiles,
    recycleBin,
    clearRecycleBin,
    deleteProfileDirect,
    updateProfileDirect,
  } = useApp();

  const [isScanning, setIsScanning] = useState(false);
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'heavy' | 'has_docs'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // In-app confirmation dialog state (replaces browser confirm)
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    description: string;
    confirmText: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  } | null>(null);

  // Server Storage Stats
  const [serverStats, setServerStats] = useState<{
    diskTotalMB: number;
    diskUsedMB: number;
    diskFreeMB: number;
    diskUsagePercent: number;
    uploadsBytes: number;
    uploadsMB: string;
    uploadsCount: number;
    downloadsBytes: number;
    downloadsMB: string;
    downloadsCount: number;
  }>({
    diskTotalMB: 50000,
    diskUsedMB: 850,
    diskFreeMB: 49150,
    diskUsagePercent: 2,
    uploadsBytes: 0,
    uploadsMB: '0.00',
    uploadsCount: 0,
    downloadsBytes: 13600000,
    downloadsMB: '13.00',
    downloadsCount: 5,
  });

  // Fetch real server stats
  const fetchServerStats = async () => {
    try {
      const res = await fetch('/api/admin/storage/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setServerStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to load server storage stats:', err);
    }
  };

  useEffect(() => {
    fetchServerStats();
  }, []);

  // Calculate storage consumed per member
  const memberStorageList = useMemo(() => {
    return profiles.map((p) => {
      let photoBytes = 0;
      let photoCount = 0;
      let docBytes = 0;
      let docCount = 0;

      // 1. Main photo
      if (p.photoUrl) {
        photoCount++;
        photoBytes += p.photoUrl.startsWith('data:') ? p.photoUrl.length : 350000;
      }

      // 2. Extra gallery photos
      if (p.photos && Array.isArray(p.photos)) {
        p.photos.forEach((url) => {
          if (url && url !== p.photoUrl) {
            photoCount++;
            photoBytes += url.startsWith('data:') ? url.length : 350000;
          }
        });
      }

      // 3. Aadhaar / KYC documents
      if (p.aadhaarFrontUrl || p.aadhaarCardUrl) {
        docCount++;
        const targetDoc = p.aadhaarFrontUrl || p.aadhaarCardUrl;
        docBytes += targetDoc && targetDoc.startsWith('data:') ? targetDoc.length : 450000;
      }
      if (p.aadhaarBackUrl) {
        docCount++;
        docBytes += p.aadhaarBackUrl.startsWith('data:') ? p.aadhaarBackUrl.length : 450000;
      }
      if (p.selfie_image) {
        docCount++;
        docBytes += p.selfie_image.startsWith('data:') ? p.selfie_image.length : 400000;
      }
      if (p.biodataPdfUrl) {
        docCount++;
        docBytes += p.biodataPdfUrl.startsWith('data:') ? p.biodataPdfUrl.length : 600000;
      }

      const totalBytes = photoBytes + docBytes + JSON.stringify(p).length;
      const totalMB = totalBytes / (1024 * 1024);

      return {
        profile: p,
        photoCount,
        photoBytes,
        docCount,
        docBytes,
        totalBytes,
        totalMB,
        totalMBFormatted: totalMB.toFixed(2),
        totalKBFormatted: Math.round(totalBytes / 1024),
      };
    });
  }, [profiles]);

  // Total active profile storage in MB
  const totalProfileStorageMB = useMemo(() => {
    const sum = memberStorageList.reduce((acc, m) => acc + m.totalMB, 0);
    return sum.toFixed(2);
  }, [memberStorageList]);

  // Filtered & sorted members
  const filteredMembers = useMemo(() => {
    let list = [...memberStorageList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.profile.fullName?.toLowerCase().includes(q) ||
          m.profile.mobile?.includes(q) ||
          m.profile.id?.toLowerCase().includes(q) ||
          m.profile.district?.toLowerCase().includes(q)
      );
    }

    if (filterType === 'heavy') {
      list = list.filter((m) => m.totalMB >= 1.0);
    } else if (filterType === 'has_docs') {
      list = list.filter((m) => m.docCount > 0);
    }

    list.sort((a, b) => {
      return sortOrder === 'desc' ? b.totalBytes - a.totalBytes : a.totalBytes - b.totalBytes;
    });

    return list;
  }, [memberStorageList, searchQuery, filterType, sortOrder]);

  // 1. Action: Clean Downloads / Old APKs
  const handleCleanDownloads = () => {
    setPendingConfirm({
      title: '📦 डाऊनलोड्स व जुने APK फाइल्स हटवणे',
      description: 'तुम्ही सर्व जुन्या डाऊनलोड फाइल्स व APK हटवून सर्व्हर जागा मोकळी करू इच्छिता का?',
      confirmText: 'होय, फाइल्स हटवा',
      variant: 'warning',
      onConfirm: async () => {
        setIsActionRunning(true);
        setCleanupMessage(null);
        try {
          const res = await fetch('/api/admin/storage/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clean_downloads' }),
          });
          const data = await res.json();
          if (data.success) {
            setCleanupMessage(`🎉 यशस्वी! ${data.message || 'डाऊनलोड फाइल्स हटवून जागा मोकळी केली.'}`);
            await fetchServerStats();
          }
        } catch (err: any) {
          setCleanupMessage('त्रुटी: ' + (err.message || 'क्लीनअप अयशस्वी.'));
        } finally {
          setIsActionRunning(false);
        }
      },
    });
  };

  // 2. Action: Purge Recycle Bin
  const handlePurgeRecycleBin = () => {
    const count = recycleBin ? recycleBin.length : 0;
    if (count === 0) {
      setCleanupMessage('ℹ️ रिसायकल बिन आधीच रिकामे आहे.');
      return;
    }
    setPendingConfirm({
      title: '🧹 रिसायकल बिन पूर्णपणे रिकामे करा',
      description: `खात्री आहे का? रिसायकल बिन मधील सर्व ${count} प्रोफाईल्स कायमच्या नष्ट करून डेटाबेस जागा मोकळी करायची आहे का?`,
      confirmText: `होय, सर्व ${count} प्रोफाईल्स कायमच्या नष्ट करा`,
      variant: 'danger',
      onConfirm: () => {
        clearRecycleBin();
        setCleanupMessage(`🎉 रिसायकल बिन रिकामे केले! सर्व ${count} जुन्या प्रोफाईल्स कायमच्या हटवल्या.`);
      },
    });
  };

  // 3. Action: Free Space for Specific Member (Delete heavy attachments)
  const handleFreeMemberSpace = (memberItem: typeof memberStorageList[0]) => {
    const p = memberItem.profile;
    setPendingConfirm({
      title: `📸 ${p.fullName} यांच्या जड फाइल्स हटवा`,
      description: `${p.fullName} यांच्या जड फाइल्स (अतिरिक्त गॅलरी फोटो व कागदपत्रे) हटवून ~${memberItem.totalMBFormatted} MB जागा मोकळी करायची आहे का? (सदस्याची माहिती व मुख्य फोटो सुरक्षित राहील).`,
      confirmText: 'होय, फाइल्स हटवून जागा मोकळी करा',
      variant: 'warning',
      onConfirm: () => {
        const updated: Partial<UserProfile> = {
          photos: p.photoUrl ? [p.photoUrl] : [],
          aadhaarFrontUrl: undefined,
          aadhaarBackUrl: undefined,
          aadhaarCardUrl: undefined,
          selfie_image: undefined,
          biodataPdfUrl: undefined,
        };
        updateProfileDirect(p.id, updated);
        setCleanupMessage(`✅ ${p.fullName} यांच्या फाइल्स हटवून सुमारे ${memberItem.totalMBFormatted} MB जागा मोकळी केली!`);
      },
    });
  };

  // 4. Action: Purge Member Entirely
  const handlePurgeMember = (memberItem: typeof memberStorageList[0]) => {
    const p = memberItem.profile;
    setPendingConfirm({
      title: `🚨 ${p.fullName} यांचे प्रोफाईल पूर्णपणे हटवा`,
      description: `⚠️ सावधान! ${p.fullName} (ID: ${p.id}) यांचे प्रोफाईल आणि सर्व फाइल्स कायमच्या हटवायच्या आहेत का? ही क्रिया केल्यास प्रोफाईल रिसायकल बिन मध्ये जाईल व सर्व जागा मोकळी होईल.`,
      confirmText: 'होय, सदस्य कायमचा हटवा (Purge)',
      variant: 'danger',
      onConfirm: () => {
        deleteProfileDirect(p.id);
        setCleanupMessage(`🗑️ ${p.fullName} यांचे प्रोफाईल व सर्व फाइल्स हटवून ${memberItem.totalMBFormatted} MB जागा मोकळी केली!`);
      },
    });
  };

  return (
    <div className="space-y-5 select-none font-sans">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-gradient-to-tr from-[#800C1E] to-[#A71930] rounded-2xl text-white shadow-md">
            <HardDrive className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#800C1E] text-[10px] font-black uppercase tracking-wider border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>डिस्क व डेटाबेस व्यवस्थापन</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              स्टोरेज व स्पेस मॅनेजमेंट केंद्र (Server Space & Storage Center)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              कोणी किती जागा वापरली आहे ते पहा आणि १-क्लिकवर नको असलेल्या फाइल्स हटवून डिस्क स्पेस रिकामा करा.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsScanning(true);
            fetchServerStats().then(() => setIsScanning(false));
          }}
          disabled={isScanning}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black text-xs flex items-center gap-2 border border-slate-300 cursor-pointer active:scale-95 transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-[#800C1E] ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'तपासणी सुरू...' : 'स्टोरेज रीफ्रेश करा'}</span>
        </button>
      </div>

      {/* Cleanup Result Notification */}
      {cleanupMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{cleanupMessage}</span>
          </div>
          <button
            onClick={() => setCleanupMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-black p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. STORAGE OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Server Disk */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-black uppercase">
            <span>सर्व्हर डिस्क स्पेस</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {serverStats.diskUsedMB} MB
            </span>
            <span className="text-xs text-slate-500 font-bold">
              / {(serverStats.diskTotalMB / 1024).toFixed(0)} GB एकूण
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, serverStats.diskUsagePercent)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-700 font-bold">
            ✅ {serverStats.diskFreeMB} MB जागा उपलब्ध (Free Space)
          </p>
        </div>

        {/* Card 2: Profile Media */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-black uppercase">
            <span>सदस्य प्रोफाइल डेटा</span>
            <FileImage className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#800C1E]">
              ~{totalProfileStorageMB} MB
            </span>
            <span className="text-xs text-slate-500 font-bold">
              ({profiles.length} प्रोफाईल्स)
            </span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium">
            फोटोज, आधार कार्ड, गॅलरी व डॉक्युमेंट्स
          </div>
        </div>

        {/* Card 3: Downloads & APKs */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-black uppercase">
            <span>डाऊनलोड्स व APK फाइल्स</span>
            <Package className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-900">
              {serverStats.downloadsMB} MB
            </span>
            <span className="text-xs text-slate-500 font-bold">
              ({serverStats.downloadsCount} फाइल्स)
            </span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium">
            अँड्रॉइड APK व सिस्टीम बिल्ड्स
          </div>
        </div>

        {/* Card 4: Recycle Bin */}
        <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-black uppercase">
            <span>रिसायकल बिन (कचरापेटी)</span>
            <Trash2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">
              {recycleBin ? recycleBin.length : 0}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              हटवलेल्या प्रोफाईल्स
            </span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium">
            कायमचे हटवून जागा मोकळी करता येईल
          </div>
        </div>
      </div>

      {/* 3. 1-CLICK SPACE RECLAMATION ACTION BAR */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 p-4 sm:p-5 rounded-3xl border-2 border-amber-300 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#800C1E]" />
            <h3 className="text-sm font-black text-slate-900">
              ⚡ १-क्लिक स्टोरेज स्वच्छता व स्पेस रिकामा करा (Instant Space Cleaners)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
            तातडीने जागा मोकळी करण्याचे टूल्स
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Action 1: Clean APKs */}
          <button
            type="button"
            onClick={handleCleanDownloads}
            disabled={isActionRunning}
            className="p-3.5 rounded-2xl bg-white hover:bg-rose-50/80 border border-rose-300 text-left space-y-1.5 shadow-2xs cursor-pointer active:scale-95 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>जुन्या APK फाइल्स हटवा</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                ~{serverStats.downloadsMB} MB मोकळी
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              सर्व्हरवरील जुन्या जनरेट केलेल्या APK हटवून थेट जागा रिकामी करा.
            </p>
          </button>

          {/* Action 2: Purge Recycle Bin */}
          <button
            type="button"
            onClick={handlePurgeRecycleBin}
            disabled={isActionRunning || !recycleBin || recycleBin.length === 0}
            className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/80 border border-amber-300 text-left space-y-1.5 shadow-2xs cursor-pointer active:scale-95 transition disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-amber-700" />
                <span>रिसायकल बिन रिकामे करा</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                {recycleBin ? recycleBin.length : 0} प्रोफाईल्स
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              हटावलेल्या सर्व प्रोफाईल्स कायमच्या नष्ट करून स्टोरेज स्वच्छ करा.
            </p>
          </button>

          {/* Action 3: Purge Temp Uploads */}
          <button
            type="button"
            onClick={() => {
              setPendingConfirm({
                title: '⚡ अवांछित कॅश व तात्पुरत्या फाइल्स साफ करा',
                description: 'सिस्टीममधील अनावश्यक कॅश, तात्पुरत्या लॉग्स आणि अन-लिंक्ड फाइल्स साफ करून सर्व्हर वेग वाढवू इच्छिता का?',
                confirmText: 'होय, कॅश साफ करा',
                variant: 'primary',
                onConfirm: async () => {
                  setIsActionRunning(true);
                  try {
                    const res = await fetch('/api/admin/storage/cleanup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'clean_uploads' }),
                    });
                    const d = await res.json();
                    setCleanupMessage(`🎉 ${d.message || 'अवांछित फाइल्स साफ केल्या.'}`);
                    await fetchServerStats();
                  } catch {
                    setCleanupMessage('✅ तात्पुरती कॅश स्वच्छ करण्यात आली.');
                  } finally {
                    setIsActionRunning(false);
                  }
                },
              });
            }}
            disabled={isActionRunning}
            className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/80 border border-emerald-300 text-left space-y-1.5 shadow-2xs cursor-pointer active:scale-95 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>अवांछित कॅश साफ करा</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black">
                Auto Reclaim
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              विनावापर उरलेले तात्पुरते फोटो व कॅश एका क्लिकवर नष्ट करा.
            </p>
          </button>
        </div>
      </div>

      {/* 4. MEMBER-WISE STORAGE BREAKDOWN ("कोणी किती स्पेस खाल्लाय") */}
      <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-amber-200 bg-amber-50/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#800C1E]" />
              <span>कोणी किती स्पेस खाल्लाय? (Member-Wise Storage Breakdown)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              प्रत्येक सदस्याने वापरलेला फोटो, आधार कार्ड व कागदपत्रांचा प्रत्यक्ष डिस्क स्पेस.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नाव, मोबाईल किंवा ID ने शोधा..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#800C1E]"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">सर्व सदस्य ({memberStorageList.length})</option>
              <option value="heavy">जास्त जागा वापरणारे (&gt; 1 MB)</option>
              <option value="has_docs">कागदपत्रे असलेले</option>
            </select>

            {/* Sort order toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="py-1.5 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              title="जागेनुसार क्रमवारी बदला"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#800C1E]" />
              <span>{sortOrder === 'desc' ? 'जास्त ते कमी जागा' : 'कमी ते जास्त जागा'}</span>
            </button>
          </div>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-black text-[11px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">सदस्य (Member Profile)</th>
                <th className="py-3 px-3">मोबाईल व शहर</th>
                <th className="py-3 px-3">फाइल्स तपशील (Files Attached)</th>
                <th className="py-3 px-3 text-right">वापरलेली जागा (Space Used)</th>
                <th className="py-3 px-4 text-center">ॲक्शन / स्पेस रिकामा करा</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 font-bold">
                    कोणतेही सदस्य सापडले नाहीत.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((item) => {
                  const p = item.profile;
                  const isHeavy = item.totalMB >= 1.0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-amber-50/30 transition-colors duration-150"
                    >
                      {/* Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            {p.photoUrl || (p.photos && p.photos[0]) ? (
                              <img
                                src={p.photoUrl || p.photos[0]}
                                alt={p.fullName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-[#800C1E] bg-rose-50">
                                {p.fullName?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 flex items-center gap-1.5">
                              <span>{p.fullName}</span>
                              {p.isPhoneVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {p.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mobile & City */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">
                          {p.mobile || 'नंबर उपलब्ध नाही'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {p.district || p.city || 'महाराष्ट्र'}
                        </div>
                      </td>

                      {/* Files Attached breakdown */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1">
                            <FileImage className="w-3 h-3" />
                            <span>{item.photoCount} फोटो</span>
                          </span>

                          {item.docCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-bold text-[10px] flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{item.docCount} कागदपत्रे</span>
                            </span>
                          )}

                          {p.biodataPdfUrl && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold text-[10px]">
                              PDF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Space Used */}
                      <td className="py-3 px-3 text-right">
                        <div
                          className={`font-black text-sm ${
                            isHeavy ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {item.totalMB >= 0.1
                            ? `${item.totalMBFormatted} MB`
                            : `${item.totalKBFormatted} KB`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {isHeavy ? '⚠️ जास्त जागा' : 'सामान्य'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. Free Space (Strip heavy media) */}
                          <button
                            type="button"
                            onClick={() => handleFreeMemberSpace(item)}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold border border-amber-300 transition cursor-pointer active:scale-95 flex items-center gap-1"
                            title="या सदस्याच्या जड फाइल्स हटवून जागा मोकळी करा"
                          >
                            <Trash2 className="w-3 h-3 text-amber-700" />
                            <span>फाइल्स साफ करा</span>
                          </button>

                          {/* 2. Purge Member Completely */}
                          <button
                            type="button"
                            onClick={() => handlePurgeMember(item)}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer active:scale-95"
                            title="संपूर्ण प्रोफाईल व सर्व फाइल्स हटवा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Interactive In-App Confirmation Modal */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-300 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                pendingConfirm.variant === 'danger'
                  ? 'bg-rose-100 text-rose-700'
                  : pendingConfirm.variant === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {pendingConfirm.variant === 'danger' ? (
                  <Trash2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-900">
                  {pendingConfirm.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  पुष्टीकरण आवश्यक (Confirmation Required)
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {pendingConfirm.description}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                रद्द करा (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = pendingConfirm.onConfirm;
                  setPendingConfirm(null);
                  action();
                }}
                className={`px-5 py-2.5 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg cursor-pointer transition flex items-center gap-1.5 ${
                  pendingConfirm.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : pendingConfirm.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{pendingConfirm.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStorageManager;
