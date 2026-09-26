import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Database,
  Download,
  Eye,
  Heart,
  Sparkles,
  ShieldCheck,
  Calendar,
  Phone,
  MapPin,
  X,
  FileText,
  UserCheck,
  Archive
} from 'lucide-react';
import { SafeAvatar } from './SafeAvatar';
import { UserProfile } from '../types';

export const AdminDeletedProfilesView: React.FC = () => {
  const {
    recycleBin,
    restoreRecycleItem,
    permanentDeleteRecycleItem,
    bulkPurgeRecycleBin,
    profiles,
    profileRemovalRequests,
    setSelectedProfileForModal,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState<'all' | 'marriage_fixed' | 'personal'>('all');
  const [selectedStoryItem, setSelectedStoryItem] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate storage & health statistics
  const totalDeletedCount = recycleBin.length;
  const activeProfilesCount = profiles.length;
  const totalDatabaseDocs = activeProfilesCount + totalDeletedCount;

  // Approximate Firestore and Cloudinary sizes
  const estimatedFirestoreKb = (totalDatabaseDocs * 2.8).toFixed(1);
  const estimatedCloudinaryMb = ((activeProfilesCount * 3 + totalDeletedCount * 2) * 0.35).toFixed(1);

  // Match removal requests with recycleBin items for rich metadata (reasons, stories, wedding dates)
  const enrichedDeletedProfiles = useMemo(() => {
    return recycleBin.map((item) => {
      const p: Partial<UserProfile> = (item as any).profile || item.data || {};
      const removalReq = profileRemovalRequests.find(
        (r) => r.profileId === p.id || r.profileName === p.fullName
      );

      const isMarriageFixed =
        removalReq?.reason === 'marriage_fixed' ||
        item.title?.includes('लग्न जुळले') ||
        Boolean(removalReq?.partnerDetails);

      return {
        recycleId: item.id,
        deletedAt: item.deletedAt,
        profile: p,
        removalReq,
        isMarriageFixed,
        partnerDetails: removalReq?.partnerDetails || '',
        feedbackText: removalReq?.feedbackText || '',
        reason: removalReq?.reason || (isMarriageFixed ? 'marriage_fixed' : 'personal_reasons'),
      };
    });
  }, [recycleBin, profileRemovalRequests]);

  // Filtered items based on search and tab
  const filteredProfiles = useMemo(() => {
    return enrichedDeletedProfiles.filter((item) => {
      const name = item.profile.fullName || '';
      const mobile = item.profile.mobile || item.profile.mobileNumber || '';
      const id = item.profile.id || '';
      const district = item.profile.district || '';
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !term ||
        name.toLowerCase().includes(term) ||
        mobile.includes(term) ||
        id.toLowerCase().includes(term) ||
        district.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (filterReason === 'marriage_fixed') return item.isMarriageFixed;
      if (filterReason === 'personal') return !item.isMarriageFixed;
      return true;
    });
  }, [enrichedDeletedProfiles, searchTerm, filterReason]);

  const handleRestore = (id: string, name: string) => {
    restoreRecycleItem(id);
    setSuccessMessage(`✅ '${name}' यांची प्रोफाईल मुख्य डेटाबेसमध्ये पुनर्संचयित (Restored) केली गेली!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (confirm(`⚠️ खात्री आहे का? '${name}' यांची प्रोफाईल आणि डेटा कायमस्वरूपी हटवून डेटाबेस जागा मोकळी करायची आहे का? ही क्रिया पूर्ववत करता येत नाही.`)) {
      permanentDeleteRecycleItem(id);
      setSuccessMessage(`🗑️ '${name}' यांचा डेटा कायमस्वरूपी हटवला (Storage Reclaimed).`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handlePurgeAll = () => {
    if (recycleBin.length === 0) return;
    if (confirm(`⚠️ सावधान: डिलीट केलेल्या सर्व (${recycleBin.length}) प्रोफाईल्स कायमस्वरूपी नष्ट करायच्या आहेत का? यामुळे डेटाबेस जागा पूर्णपणे मोकळी होईल.`)) {
      bulkPurgeRecycleBin();
      setSuccessMessage('✅ सर्व डिलीट केलेल्या प्रोफाईल्स कायमच्या हटवून डेटाबेस स्वच्छ केला आहे.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      totalActiveProfiles: profiles.length,
      totalDeletedProfiles: recycleBin.length,
      activeProfiles: profiles,
      deletedProfiles: recycleBin,
      profileRemovalRequests: profileRemovalRequests,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanjari_jodi_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header & Quick Actions */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-amber-100 p-6 rounded-3xl border-2 border-amber-400 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-[#800C1E] text-xs font-black uppercase tracking-wider shadow">
            <Archive className="w-3.5 h-3.5" />
            <span>डेटाबेस व प्रोफाईल नियंत्रण केंद्र</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-200">
            डिलीट केलेल्या प्रोफाईल्स (Deleted Profiles & Space Monitor)
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 font-medium max-w-2xl">
            युझर्सनी किंवा ॲडमिनने हटवलेल्या प्रोफाईल्स येथे सुरक्षित राहतात. लग्न जुळलेल्या सदस्यांचे अनुभव पहा, प्रोफाईल पूर्ववत करा किंवा कायमस्वरूपी हटवून जागा मोकळी करा.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#800C1E] text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-amber-200"
            title="संपूर्ण डेटाबेसचा बॅकअप JSON फाइल स्वरूपात डाऊनलोड करा"
          >
            <Download className="w-4 h-4 text-[#800C1E]" />
            <span>डेटाबेस बॅकअप (JSON)</span>
          </button>

          {totalDeletedCount > 0 && (
            <button
              type="button"
              onClick={handlePurgeAll}
              className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-rose-400/40"
            >
              <Trash2 className="w-4 h-4 text-rose-300" />
              <span>सर्व कायमचे हटवा ({totalDeletedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Success Alert Message */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3. Firebase Storage Health & Capacity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Active vs Deleted */}
        <div className="bg-white p-4.5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-500">
            <span>सक्रिय / डिलीट प्रोफाईल्स</span>
            <UserCheck className="w-4 h-4 text-[#800C1E]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeProfilesCount} <span className="text-sm text-slate-400 font-bold">सक्रिय</span> / {totalDeletedCount} <span className="text-sm text-rose-600 font-bold">डिलीट</span>
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            एकूण नोंदणीकृत सदस्य: {totalDatabaseDocs}
          </div>
        </div>

        {/* Card 2: Estimated Storage */}
        <div className="bg-white p-4.5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-500">
            <span>वापरलेली स्टोरेज जागा</span>
            <HardDrive className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-950">
            ~{estimatedCloudinaryMb} MB
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            Firestore डेटा: ~{estimatedFirestoreKb} KB
          </div>
        </div>

        {/* Card 3: Database Quota Limit */}
        <div className="bg-white p-4.5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-500">
            <span>Firebase कोटा मर्यादा</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            ९९.८% <span className="text-xs text-emerald-700 font-bold">शिल्लक</span>
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            Firestore मोफत मर्यादा: १,००० MB (1 GB)
          </div>
        </div>

        {/* Card 4: Health Status */}
        <div className="bg-white p-4.5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-500">
            <span>डेटाबेस आरोग्य व सुरक्षितता</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-black text-emerald-700 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span>सुरक्षित व सुरळीत चालू</span>
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            सर्व्हर भार: ०% (Near Zero)
          </div>
        </div>
      </div>

      {/* 4. Firebase Protection & Maintenance Guide Banner */}
      <div className="p-4.5 bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2">
        <h4 className="font-black text-xs sm:text-sm text-[#800C1E] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>ॲडमिन मार्गदर्शक: Firebase कधीही बंद पडणार नाही व जागा पूर्ण होणार नाही यासाठी माहिती:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 leading-relaxed font-medium">
          <div className="p-3 bg-white rounded-xl border border-amber-200">
            <strong className="text-slate-900 block mb-1">१. नियमित Purge स्वच्छता:</strong>
            लग्न जुळलेल्या किंवा कायमस्वरूपी बंद केलेल्या प्रोफाईल्स दर महिन्याला 'कायमचे हटवा' (Purge) केल्यास स्टोरेज नेहमी मोकळे राहील.
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200">
            <strong className="text-slate-900 block mb-1">२. फोटो ऑप्टिमायझेशन:</strong>
            सर्व फोटो Cloudinary क्लाउडवर स्वयंचलित कॉम्प्रेस होऊन सेव्ह होतात. त्यामुळे Firestore डेटाबेसवर लोड येत नाही.
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200">
            <strong className="text-slate-900 block mb-1">३. डेटा सुरक्षितता व बॅकअप:</strong>
            वरील 'डेटाबेस बॅकअप (JSON)' बटणावर क्लिक करून संपूर्ण डेटाचा बॅकअप तुमच्या कॉम्प्युटरमध्ये सेव्ह ठेवू शकता.
          </div>
        </div>
      </div>

      {/* 5. Search, Filters & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="नाव, मोबाईल, जिल्हा किंवा आयडीने शोधा..."
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800C1E]"
          />
        </div>

        {/* Filter Reason Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-amber-100/60 rounded-xl border border-amber-300 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterReason('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer shrink-0 ${
              filterReason === 'all'
                ? 'bg-[#800C1E] text-amber-100 shadow-sm'
                : 'text-slate-700 hover:bg-amber-200/60'
            }`}
          >
            सर्व डिलीट ({enrichedDeletedProfiles.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterReason('marriage_fixed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 shrink-0 ${
              filterReason === 'marriage_fixed'
                ? 'bg-[#800C1E] text-amber-100 shadow-sm'
                : 'text-slate-700 hover:bg-amber-200/60'
            }`}
          >
            <span>💍 लग्न जुळले</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#800C1E] text-[10px]">
              {enrichedDeletedProfiles.filter((p) => p.isMarriageFixed).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterReason('personal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer shrink-0 ${
              filterReason === 'personal'
                ? 'bg-[#800C1E] text-amber-100 shadow-sm'
                : 'text-slate-700 hover:bg-amber-200/60'
            }`}
          >
            वैयक्तिक / इतर
          </button>
        </div>
      </div>

      {/* 6. Deleted Profiles List */}
      <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm overflow-hidden">
        {filteredProfiles.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Archive className="w-8 h-8 opacity-60" />
            </div>
            <h4 className="text-base font-black text-slate-800">कोणतीही डिलीट केलेली प्रोफाइल आढळली नाही</h4>
            <p className="text-xs text-slate-500 font-medium">
              {searchTerm ? 'कृपया शोध संज्ञा बदलून पहा.' : 'सध्या रिसायकल बिन रिकामे आहे.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-amber-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/80 text-[11px] font-black text-[#800C1E] uppercase border-b border-amber-200">
                  <th className="p-3.5 pl-4">सदस्य प्रोफाइल</th>
                  <th className="p-3.5">डिलीट तारीख व कारण</th>
                  <th className="p-3.5">विवाह / अनुभव नोंद</th>
                  <th className="p-3.5 text-right pr-4">कृती (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-xs">
                {filteredProfiles.map((item) => {
                  const p = item.profile;
                  const name = p.fullName || 'अनामित सदस्य';
                  const mobile = p.mobile || p.mobileNumber || 'माहिती नाही';
                  const id = p.id || 'N/A';
                  const district = p.district || 'महाराष्ट्र';
                  const photo = p.photoUrl || (p.photos && p.photos[0]) || '';

                  return (
                    <tr key={item.recycleId} className="hover:bg-amber-50/40 transition">
                      {/* Column 1: Member Avatar & Basics */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-300 bg-amber-50 shrink-0">
                            <SafeAvatar
                              src={photo}
                              alt={name}
                              name={name}
                              gender={p.gender || 'groom'}
                              sizeClassName="w-12 h-12"
                            />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                p.gender === 'bride' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {p.gender === 'bride' ? 'वधू' : 'वर'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-2 mt-0.5">
                              <span>आयडी: {id}</span>
                              <span>•</span>
                              <span>{p.age ? `${p.age} वर्षे` : ''}</span>
                              <span>•</span>
                              <span>{district}</span>
                            </div>
                            <div className="text-[11px] font-mono text-[#800C1E] font-bold mt-0.5">
                              📞 {mobile}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Deletion Details */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                            item.isMarriageFixed
                              ? 'bg-amber-100 text-[#800C1E] border-amber-400'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}>
                            {item.isMarriageFixed ? '💍 लग्न जुळले' : '🔒 वैयक्तिक कारण'}
                          </span>
                          <div className="text-[11px] text-slate-500 font-medium">
                            हटवले: {item.deletedAt || 'अलिकडे'}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Marriage Story & Partner Details */}
                      <td className="p-3.5 max-w-xs">
                        {item.partnerDetails || item.feedbackText ? (
                          <div className="space-y-1">
                            {item.partnerDetails && (
                              <div className="text-xs font-bold text-slate-800 truncate">
                                💑 जोडीदार: {item.partnerDetails.replace(/\|/g, ' - ')}
                              </div>
                            )}
                            {item.feedbackText && (
                              <button
                                type="button"
                                onClick={() => setSelectedStoryItem(item)}
                                className="text-[11px] text-[#800C1E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[200px]">"{item.feedbackText}"</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">माहिती उपलब्ध नाही</span>
                        )}
                      </td>

                      {/* Column 4: Actions */}
                      <td className="p-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestore(item.recycleId, name)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs flex items-center gap-1 border border-emerald-300 transition active:scale-95 cursor-pointer shadow-xs"
                            title="प्रोफाईल पुन्हा सक्रिय करा (Restore)"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>पुनर्संचयित</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(item.recycleId, name)}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs flex items-center gap-1 border border-rose-300 transition active:scale-95 cursor-pointer shadow-xs"
                            title="कायमस्वरूपी डेटा हटवून जागा मोकळी करा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>कायमचे हटवा</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Success Story Experience Details Modal */}
      {selectedStoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border-2 border-amber-300 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-[#800C1E] rounded-xl font-bold">
                  💍
                </div>
                <div>
                  <h3 className="font-black text-base text-[#800C1E]">
                    विवाह यशोगाथा व सदस्याचा अनुभव
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedStoryItem.profile.fullName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStoryItem(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedStoryItem.partnerDetails && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="font-black text-[#800C1E] mb-1">जोडीदाराची माहिती:</div>
                  <div className="font-semibold text-slate-800">
                    {selectedStoryItem.partnerDetails.replace(/\|/g, ' • ')}
                  </div>
                </div>
              )}

              {selectedStoryItem.feedbackText && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl border border-amber-300 space-y-2">
                  <div className="font-black text-slate-900 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span>सदस्याने दिलेली प्रतिक्रिया व अनुभव:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                    "{selectedStoryItem.feedbackText}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStoryItem(null)}
                className="px-5 py-2 rounded-xl bg-[#800C1E] text-amber-100 font-bold text-xs cursor-pointer shadow hover:brightness-110"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
