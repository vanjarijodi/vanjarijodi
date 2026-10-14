import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  PauseCircle,
  Ban,
  Trash2,
  Filter,
  Search,
  MessageCircle,
  ExternalLink,
  Bell,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Smartphone,
  Globe,
  Radio,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileReport, UserProfile } from '../types';
import { fetchBlacklist, toggleMobileBan, toggleDeviceBan, toggleIpBan, nuclearBanMember } from '../utils/securityService';
import { formatMemberId } from '../utils/idUtils';

export const AdminReportsView: React.FC = () => {
  const {
    profileReports,
    resolveProfileReport,
    profiles,
    toggleBlockProfile,
    toggleBlockMemberAccess,
    updateProfileDirect,
    deleteProfileDirect,
    siteConfig,
    updateSiteConfig,
    setSelectedProfileForModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending_reports' | 'all_reports' | 'banned_profiles' | 'blacklist_hub'>('pending_reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [blacklistData, setBlacklistData] = useState<{
    blockedIps: string[];
    bannedDevices: string[];
    bannedMobiles: string[];
  }>({
    blockedIps: [],
    bannedDevices: [],
    bannedMobiles: []
  });
  const [isLoadingBlacklist, setIsLoadingBlacklist] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Load Blacklist from server
  const loadBlacklist = async () => {
    setIsLoadingBlacklist(true);
    try {
      const data = await fetchBlacklist();
      if (data && data.success) {
        setBlacklistData({
          blockedIps: data.blockedIps || [],
          bannedDevices: data.bannedDevices || [],
          bannedMobiles: data.bannedMobiles || []
        });
      }
    } catch (e) {
      console.warn('Error loading blacklist:', e);
    } finally {
      setIsLoadingBlacklist(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blacklist_hub' || activeTab === 'banned_profiles') {
      loadBlacklist();
    }
  }, [activeTab]);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Compute reports per profile to show report count badges
  const profileReportsMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    profileReports.forEach((r) => {
      map[r.reportedProfileId] = (map[r.reportedProfileId] || 0) + 1;
    });
    return map;
  }, [profileReports]);

  // Banned / Blocked profiles list
  const bannedProfiles = React.useMemo(() => {
    return profiles.filter((p) => p.isBlocked || p.isSuspended || (profileReportsMap[p.id] || 0) >= 4);
  }, [profiles, profileReportsMap]);

  // Filtered reports
  const filteredReports = profileReports.filter((r) => {
    const matchesTab =
      activeTab === 'pending_reports'
        ? r.status === 'pending'
        : activeTab === 'all_reports'
        ? true
        : false;

    if (activeTab !== 'pending_reports' && activeTab !== 'all_reports') return false;

    const matchesSearch =
      r.reportedProfileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporterUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reportedProfileId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Filtered banned profiles
  const filteredBannedProfiles = bannedProfiles.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      (p.mobile || '').includes(term) ||
      p.id.toLowerCase().includes(term) ||
      (p.district || '').toLowerCase().includes(term)
    );
  });

  // Unban / Unblock Handler
  const handleUnblockProfile = (profile: UserProfile) => {
    if (window.confirm(`'${profile.fullName}' या प्रोफाईलचा बॅन हटवून खाते पुन्हा सक्रिय करायचे का?`)) {
      updateProfileDirect(profile.id, {
        isBlocked: false,
        isSuspended: false,
        isApproved: true,
        autoBanReason: undefined,
        autoBannedAt: undefined
      });
      // Also unban mobile if present
      if (profile.mobile) {
        toggleMobileBan(profile.mobile, false).catch(() => {});
      }
      showToast(`✅ '${profile.fullName}' यांचे खाते अन-ब्लॉक करण्यात आले आहे!`);
      loadBlacklist();
    }
  };

  // Nuclear Ban Handler
  const handleNuclearBan = async (profile: UserProfile) => {
    if (window.confirm(`🚨 खात्री आहे का? '${profile.fullName}' आणि त्यांच्या मोबाईल/डिव्हाइसला कायमचे ब्लॅकलिस्ट करायचे का?`)) {
      await nuclearBanMember({
        userId: profile.id,
        userName: profile.fullName,
        mobile: profile.mobile,
        reason: 'ॲडमिन मॅन्युअल न्यूक्लियर बॅन',
        deviceFingerprint: (profile as any).deviceFingerprint,
        ip: (profile as any).lastIp
      });
      updateProfileDirect(profile.id, {
        isBlocked: true,
        isApproved: false,
        isSuspended: true
      });
      showToast(`🚨 '${profile.fullName}' आणि त्यांचे डिव्हाइस कायमचे ब्लॅकलिस्ट केले!`);
      loadBlacklist();
    }
  };

  const autoBanLimit = siteConfig?.autoBanThreshold || 4;
  const isAutoBanEnabled = siteConfig?.enableAutoBanOnReports !== false;

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-2">
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="text-white hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white p-5 rounded-3xl shadow-xl border-2 border-amber-400/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-amber-300 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  सदस्य तक्रारी व बॅन व्यवस्थापन केंद्र
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                  Security Hub
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                खोट्या व बनावट प्रोफाईल्सवर नियंत्रण, ऑटो-बॅन नियम आणि बॅन झालेल्या सदस्यांची यादी
              </p>
            </div>
          </div>

          {/* Quick Auto-Ban Rule Status Badge */}
          <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-xs space-y-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-300 font-bold text-[11px]">⚡ ऑटो-बॅन नियम (Auto-Ban):</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isAutoBanEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                {isAutoBanEnabled ? `चालू (${autoBanLimit}+ तक्रारी)` : 'बंद'}
              </span>
            </div>
            <p className="text-[10px] text-amber-300">
              एका प्रोफाईलला {autoBanLimit} किंवा अधिक तक्रारी आल्यास आपोआप तात्काळ बॅन होते.
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('pending_reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pending_reports'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>प्रलंबित तक्रारी</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono">
              {profileReports.filter((r) => r.status === 'pending').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banned_profiles')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'banned_profiles'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Ban className="w-4 h-4 text-red-500" />
            <span>🚫 बॅन प्रोफाईल्स यादी</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-700 text-white font-mono">
              {bannedProfiles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'all_reports'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>सर्व तक्रारी इतिहास ({profileReports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blacklist_hub')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'blacklist_hub'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>डिव्हाइस / IP ब्लॅकलिस्ट ({blacklistData.bannedMobiles.length + blacklistData.blockedIps.length + blacklistData.bannedDevices.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            activeTab === 'banned_profiles'
              ? 'बॅन प्रोफाईलचे नाव, मोबाईल किंवा आयडी शोधा...'
              : 'तक्रारदार किंवा प्रोफाईलचे नाव, कारण शोधा...'
          }
          className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1 & 2: REPORTS LIST (PENDING & ALL) */}
      {/* ========================================================================= */}
      {(activeTab === 'pending_reports' || activeTab === 'all_reports') && (
        <>
          {filteredReports.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border-2 border-amber-200 text-center space-y-3 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-black text-slate-800 text-base">
                {activeTab === 'pending_reports'
                  ? 'कोणतीही प्रलंबित तक्रार आढळली नाही!'
                  : 'कोणताही तक्रार अहवाल आढळला नाही.'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'pending_reports'
                  ? 'सर्व सदस्यांनी केलेल्या तक्रारींचे निवारण व्यवस्थित झाले आहे.'
                  : 'सध्या कोणत्याही सदस्याने तक्रार दाखल केलेली नाही.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const reportedCandidate = profiles.find((p) => p.id === report.reportedProfileId);
                const isResolved = report.status !== 'pending';
                const totalReportsOnThisProfile = profileReportsMap[report.reportedProfileId] || 1;
                const isAutoBanned = reportedCandidate?.isBlocked || totalReportsOnThisProfile >= autoBanLimit;

                return (
                  <div
                    key={report.id}
                    className={`bg-white p-4 sm:p-5 rounded-3xl border-2 shadow-xs space-y-3.5 transition ${
                      isAutoBanned ? 'border-rose-400 ring-1 ring-rose-200' : 'border-amber-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-black border border-rose-300">
                          🚨 {report.categoryLabel}
                        </span>
                        {totalReportsOnThisProfile > 1 && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            totalReportsOnThisProfile >= 4
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            ⚠️ या प्रोफाईलवर {totalReportsOnThisProfile} तक्रारी आल्या आहेत
                          </span>
                        )}
                        <span className="text-slate-400 font-mono text-[10px]">
                          तक्रार तारीख: {new Date(report.createdAt).toLocaleDateString('mr-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAutoBanned && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                            🚫 ऑटो-बॅन लागू
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isResolved ? `✅ निर्धारीत (${report.resolvedAction || 'निरसन'})` : '⏳ प्रलंबित (Pending Review)'}
                        </span>
                      </div>
                    </div>

                    {/* Reported Candidate vs Reporter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      {/* Reported Member Box */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase font-black text-rose-800 flex items-center justify-between">
                          <span>तक्रार असलेली प्रोफाईल (Reported Member):</span>
                          {reportedCandidate && (
                            <button
                              type="button"
                              onClick={() => setSelectedProfileForModal(reportedCandidate)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer text-[10px]"
                            >
                              बायोडाटा पहा →
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              reportedCandidate?.photoUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt={report.reportedProfileName}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-300 shrink-0"
                          />
                          <div>
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{report.reportedProfileName}</span>
                              {reportedCandidate?.isBlocked && (
                                <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] rounded-md font-bold">
                                  Blocked
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              आयडी: <span className="font-mono font-bold text-slate-800">{formatMemberId(report.reportedProfileId)}</span>
                              {report.reportedProfileMobile && (
                                <span> • मो: <span className="font-mono font-bold">{report.reportedProfileMobile}</span></span>
                              )}
                            </div>
                            {reportedCandidate?.district && (
                              <div className="text-[10px] text-slate-500">
                                {reportedCandidate.gender === 'bride' ? 'वधू' : 'वर'} • {reportedCandidate.district}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reporter Member Box */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase font-black text-slate-500">
                          तक्रार दाखल करणारा सदस्य (Reporter):
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-slate-200">
                          <div className="font-black text-slate-900 text-xs">
                            {report.reporterUserName}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                            सदस्य आयडी: <span className="font-mono font-bold">{formatMemberId(report.reporterUserId)}</span>
                            {report.reporterUserMobile && (
                              <span> • मो: <span className="font-mono font-bold">{report.reporterUserMobile}</span></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complaint Description */}
                    <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1">
                      <div className="text-[10px] font-black text-amber-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>तक्रारीचा तपशील व कारण:</span>
                      </div>
                      <p className="text-slate-800 font-medium text-xs leading-relaxed whitespace-pre-line">
                        {report.description}
                      </p>
                      {report.proofImageUrl && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-600 block mb-1">अपलोड केलेला स्क्रीनशॉट पुरावा:</span>
                          <a href={report.proofImageUrl} target="_blank" rel="noreferrer" className="inline-block">
                            <img
                              src={report.proofImageUrl}
                              alt="Proof screenshot"
                              className="max-h-32 rounded-xl border border-slate-300 shadow-xs hover:opacity-90"
                            />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    {!isResolved && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            resolveProfileReport(report.id, 'dismiss');
                            showToast('✅ तक्रार फेटाळण्यात (Dismiss) आली.');
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
                        >
                          तक्रार फेटाळा (Dismiss)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            resolveProfileReport(report.id, 'warning');
                            showToast(`⚠️ सदस्य '${report.reportedProfileName}' यांना वॉर्निंग मेसेज पाठवला.`);
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>वॉर्निंग द्या (Send Warning)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            resolveProfileReport(report.id, 'suspend');
                            if (reportedCandidate) {
                              updateProfileDirect(reportedCandidate.id, { isBlocked: true, isApproved: false });
                            }
                            showToast(`🚫 सदस्य '${report.reportedProfileName}' चे खाते तात्काळ ब्लॉक केले.`);
                          }}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>खाते ब्लॉक करा (Block Profile)</span>
                        </button>

                        {reportedCandidate && (
                          <button
                            type="button"
                            onClick={() => handleNuclearBan(reportedCandidate)}
                            className="px-3.5 py-2 bg-red-950 hover:bg-black text-rose-300 border border-red-800 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            <span>🚨 डिव्हाइस व IP कायमचे बॅन करा</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BANNED / BLOCKED PROFILES LIST */}
      {/* ========================================================================= */}
      {activeTab === 'banned_profiles' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-rose-950 text-sm flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>प्रतिबंधित / बॅन केलेल्या सदस्यांची यादी (Banned Profiles List)</span>
              </h3>
              <p className="text-xs text-rose-800/80 mt-0.5">
                या सदस्यांना वेबसाईटवर दिसण्यापासून व लॉगिन करण्यापासून कायमचे रोखले आहे.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-mono font-bold text-xs">
              एकूण बॅन: {filteredBannedProfiles.length}
            </span>
          </div>

          {filteredBannedProfiles.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border-2 border-emerald-200 text-center space-y-3 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-black text-slate-800 text-base">
                कोणतीही बॅन प्रोफाईल आढळली नाही!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                सर्व सदस्यांची खाती सुरळीत व सक्रिय आहेत.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBannedProfiles.map((p) => {
                const reportCount = profileReportsMap[p.id] || 0;
                const isAutoBanned = reportCount >= 4 || p.autoBanReason;

                return (
                  <div
                    key={p.id}
                    className="bg-white p-4.5 rounded-3xl border-2 border-rose-300 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                            🚫 BANNED
                          </span>
                          {isAutoBanned ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 text-[10px] font-black">
                              ⚡ ऑटो-बॅन (४+ तक्रारी)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold">
                              🔒 ॲडमिन ब्लॉक
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {formatMemberId(p.id)}
                        </span>
                      </div>

                      {/* Profile Details */}
                      <div className="flex items-center gap-3">
                        <img
                          src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={p.fullName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-300 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-slate-900 text-sm truncate">{p.fullName}</h4>
                          <p className="text-xs text-slate-600 font-medium">
                            {p.gender === 'bride' ? '👰 वधू' : '🤵 वर'} • {p.age ? `${p.age} वर्षे` : ''} • {p.district || 'महाराष्ट्र'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            मोबाईल: <span className="font-bold text-slate-800">{p.mobile || 'उपलब्ध नाही'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Reason Box */}
                      <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs space-y-1">
                        <div className="text-[10px] font-black text-rose-900">बॅन करण्याचे कारण:</div>
                        <p className="text-rose-950 font-medium text-[11px]">
                          {p.autoBanReason || `सदस्यावर ${reportCount} तक्रारी आल्याने किंवा सुरक्षेच्या कारणास्तव खाते ब्लॉक केले आहे.`}
                        </p>
                        {reportCount > 0 && (
                          <div className="text-[10px] font-bold text-rose-700">
                            🚩 एकूण दाखल तक्रारी संख्या: {reportCount}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProfileForModal(p)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>तपासा</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUnblockProfile(p)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                          title="बॅन हटवा व खाते पुन्हा पूर्ववत सुरू करा"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>अन-बॅन करा (Unblock)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`कायमचा डिलीट करायचा का? '${p.fullName}' यांची सर्व माहिती नष्ट होईल.`)) {
                              deleteProfileDirect(p.id);
                              showToast(`🗑️ '${p.fullName}' बायोडाटा कायमचा डिलीट केला.`);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer"
                          title="कायमचे डिलीट करा"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BLACKLIST HUB (IP, DEVICES, MOBILES) */}
      {/* ========================================================================= */}
      {activeTab === 'blacklist_hub' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-3xl border-2 border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 rounded-2xl text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    सुरक्षा ब्लॅकलिस्ट डेटाबेस (Hardware & IP Firewall)
                  </h3>
                  <p className="text-xs text-slate-400">
                    या मोबाईल, डिव्हाइस फिंगरप्रिंट व IP पत्त्यांवरून ॲपमध्ये कोणतीही नवीन नोंदणी किंवा लॉगिन करता येणार नाही.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadBlacklist}
                disabled={isLoadingBlacklist}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBlacklist ? 'animate-spin' : ''}`} />
                <span>रिफ्रेश</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Banned Mobiles */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-rose-600" />
                  <span>ब्लॉक केलेले मोबाईल नंबर्स ({blacklistData.bannedMobiles.length})</span>
                </h4>
              </div>
              {blacklistData.bannedMobiles.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">कोणताही नंबर ब्लॅकलिस्ट नाही.</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {blacklistData.bannedMobiles.map((mob) => (
                    <div key={mob} className="p-2 bg-rose-50 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-rose-950">
                      <span>📱 {mob}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleMobileBan(mob, false);
                          showToast(`✅ मोबाईल ${mob} अन-बॅन केला!`);
                          loadBlacklist();
                        }}
                        className="text-[10px] text-rose-700 hover:text-rose-900 font-sans font-bold underline cursor-pointer"
                      >
                        हटवा
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 2: Banned Devices */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-600" />
                  <span>डिव्हाइस फिंगरप्रिंट्स ({blacklistData.bannedDevices.length})</span>
                </h4>
              </div>
              {blacklistData.bannedDevices.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">कोणतेही डिव्हाइस ब्लॅकलिस्ट नाही.</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {blacklistData.bannedDevices.map((dev) => (
                    <div key={dev} className="p-2 bg-amber-50 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-amber-950">
                      <span className="truncate max-w-[150px]" title={dev}>🔑 {dev}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleDeviceBan(dev, false);
                          showToast(`✅ डिव्हाइस अन-बॅन केले!`);
                          loadBlacklist();
                        }}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-sans font-bold underline cursor-pointer"
                      >
                        हटवा
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 3: Blocked IPs */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-xs text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>ब्लॉक केलेले IP ऍड्रेस ({blacklistData.blockedIps.length})</span>
                </h4>
              </div>
              {blacklistData.blockedIps.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">कोणताही IP ब्लॅकलिस्ट नाही.</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {blacklistData.blockedIps.map((ip) => (
                    <div key={ip} className="p-2 bg-indigo-50 rounded-xl flex items-center justify-between text-xs font-mono font-bold text-indigo-950">
                      <span>🌐 {ip}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleIpBan(ip, false);
                          showToast(`✅ IP ${ip} अन-ब्लॉक केला!`);
                          loadBlacklist();
                        }}
                        className="text-[10px] text-indigo-700 hover:text-indigo-900 font-sans font-bold underline cursor-pointer"
                      >
                        हटवा
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
