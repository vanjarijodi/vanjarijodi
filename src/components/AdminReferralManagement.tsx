import React, { useState, useMemo } from 'react';
import {
  Gift,
  Users,
  Award,
  Crown,
  Search,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Send
} from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';
import { getCleanReferralCode, openTelegramChat } from '../utils/referralUtils';

interface AdminReferralManagementProps {
  onOpenCustomPlanModal?: (profile: UserProfile) => void;
  onGrantPlan?: (profile: UserProfile) => void;
  onOpenProfileModal?: (profile: UserProfile) => void;
}

export const AdminReferralManagement: React.FC<AdminReferralManagementProps> = ({
  onOpenCustomPlanModal,
  onGrantPlan,
  onOpenProfileModal
}) => {
  const handleGrant = onGrantPlan || onOpenCustomPlanModal || (() => {});
  const { profiles, updateProfileDirect, logActivity } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubView, setActiveSubView] = useState<'leaderboard' | 'all_referrals'>('leaderboard');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Group referrals by Referrer
  const { leaderboard, allReferralPairs, totalReferralsCount } = useMemo(() => {
    const pairs: Array<{
      referredUser: UserProfile;
      referrerProfile?: UserProfile;
      refCode: string;
      referrerName: string;
      referrerMobile: string;
    }> = [];

    const referrerMap = new Map<string, {
      profile: UserProfile;
      referredUsers: UserProfile[];
      referralCode: string;
    }>();

    profiles.forEach((p) => {
      const code = getCleanReferralCode(p);
      if (!referrerMap.has(code)) {
        referrerMap.set(code, {
          profile: p,
          referredUsers: [],
          referralCode: code
        });
      }
    });

    profiles.forEach((candidate) => {
      if (candidate.referredByCode || candidate.referredByName || candidate.referredByMobile) {
        const matchingCode = candidate.referredByCode?.toUpperCase();
        let matchedReferrer: UserProfile | undefined = undefined;

        if (matchingCode) {
          matchedReferrer = profiles.find(
            (p) => getCleanReferralCode(p).toUpperCase() === matchingCode
          );
        }

        if (!matchedReferrer && candidate.referredByMobile) {
          matchedReferrer = profiles.find((p) => p.mobile === candidate.referredByMobile);
        }

        if (!matchedReferrer && candidate.referredByName) {
          matchedReferrer = profiles.find(
            (p) => p.fullName.toLowerCase() === candidate.referredByName?.toLowerCase()
          );
        }

        const refCode = matchingCode || (matchedReferrer ? getCleanReferralCode(matchedReferrer) : 'UNKNOWN');
        const referrerName = matchedReferrer?.fullName || candidate.referredByName || 'रेफरर सदस्य';
        const referrerMobile = matchedReferrer?.mobile || candidate.referredByMobile || '';

        pairs.push({
          referredUser: candidate,
          referrerProfile: matchedReferrer,
          refCode,
          referrerName,
          referrerMobile
        });

        if (matchedReferrer) {
          const c = getCleanReferralCode(matchedReferrer);
          const entry = referrerMap.get(c);
          if (entry) {
            entry.referredUsers.push(candidate);
          }
        }
      }
    });

    const board = Array.from(referrerMap.values())
      .filter((entry) => entry.referredUsers.length > 0 || (entry.profile.referralCount || 0) > 0)
      .map((entry) => ({
        profile: entry.profile,
        referralCode: entry.referralCode,
        referredCount: Math.max(entry.referredUsers.length, entry.profile.referralCount || 0),
        referredUsers: entry.referredUsers
      }))
      .sort((a, b) => b.referredCount - a.referredCount);

    return {
      leaderboard: board,
      allReferralPairs: pairs,
      totalReferralsCount: pairs.length
    };
  }, [profiles]);

  const filteredLeaderboard = leaderboard.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.profile.fullName.toLowerCase().includes(q) ||
      item.profile.mobile.includes(q) ||
      item.referralCode.toLowerCase().includes(q) ||
      (item.profile.district || '').toLowerCase().includes(q)
    );
  });

  const filteredPairs = allReferralPairs.filter((pair) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      pair.referredUser.fullName.toLowerCase().includes(q) ||
      pair.referredUser.mobile.includes(q) ||
      pair.referrerName.toLowerCase().includes(q) ||
      pair.referrerMobile.includes(q) ||
      pair.refCode.toLowerCase().includes(q)
    );
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendReferralRewardTelegram = (referrer: UserProfile, count: number) => {
    const text = `*वंजारी जोडी मॅट्रिमोनी - रेफरल बक्षीस व अभिनंदन!* 🎁

नमस्कार *${referrer.fullName}* जी! 🙏

तुम्ही वंजारी जोडीवर *${count} नवीन सदस्यांना* यशस्वीरीत्या जोडले आहे. समाजातील उपवधू-वरांना सहकार्य केल्याबद्दल तुमचे मनापासून आभार!

वंजारी जोडी परिवाराकडून तुम्हाला *विशेष मोफत प्लॅन व अतिरिक्त संपर्क अनलॉक* देण्यात येत आहे.

🔗 आत्ताच लॉगिन करा:
https://vanjarijodi.web.app

- *वंजारी जोडी मॅट्रिमोनी परिवार*
_PRIME MULTI SERVICES AND SUPPLIERS_`;

    openTelegramChat(text, referrer.telegramUsername);
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 bg-slate-50 min-h-full">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-amber-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400/20 rounded-2xl border border-amber-300/40 text-amber-200 shadow-inner">
            <Gift className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
              <span>🎁 रेफरल ट्रॅकिंग व बक्षीस व्यवस्थापन (Referral Hub)</span>
            </h2>
            <p className="text-xs text-amber-100/90 font-medium mt-0.5">
              कोणत्या सदस्याने कोणाला रेफर केले, एकूण आकडेवारी व १-क्लिक मोफत प्लॅन बक्षीस द्या
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/20 text-xs font-bold">
          <button
            onClick={() => setActiveSubView('leaderboard')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubView === 'leaderboard'
                ? 'bg-amber-400 text-amber-950 font-black shadow-sm'
                : 'text-amber-100 hover:bg-white/10'
            }`}
          >
            🏆 टॉप रेफरर्स ({leaderboard.length})
          </button>
          <button
            onClick={() => setActiveSubView('all_referrals')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubView === 'all_referrals'
                ? 'bg-amber-400 text-amber-950 font-black shadow-sm'
                : 'text-amber-100 hover:bg-white/10'
            }`}
          >
            📋 सर्व रेफरल नोंदी ({allReferralPairs.length})
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 text-[#A71930] rounded-xl font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">एकूण रेफरल जोडण्या:</span>
            <span className="text-lg font-black text-slate-900">{totalReferralsCount} सदस्य</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">सक्रिय रेफरर्स:</span>
            <span className="text-lg font-black text-slate-900">{leaderboard.length} जण</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">टॉप रेफरर:</span>
            <span className="text-xs font-black text-slate-900 truncate max-w-[120px] block">
              {leaderboard[0] ? `${leaderboard[0].profile.fullName} (${leaderboard[0].referredCount})` : 'उपलब्ध नाही'}
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">बक्षीस स्टेटस:</span>
            <span className="text-xs font-black text-blue-900">१-क्लिक मोफत प्लॅन</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="रेफररचे नाव, मोबाईल, कोड किंवा जोडलेल्या सदस्याचे नाव शोधा..."
          className="w-full text-xs font-medium outline-none bg-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
          >
            साफ करा
          </button>
        )}
      </div>

      {/* VIEW 1: TOP REFERRERS LEADERBOARD */}
      {activeSubView === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>रेफरर लीडरबोर्ड (Top Referrers List)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              एकूण {filteredLeaderboard.length} सक्रिय रेफरर्स
            </span>
          </div>

          {filteredLeaderboard.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Gift className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
              <p className="text-xs font-bold">कोणतेही रेफरल सापडले नाहीत.</p>
              <p className="text-[11px] text-slate-400">
                सदस्य जेव्हा त्यांच्या रेफरल कोडवरून इतरांना जोडतील तेव्हा येथे यादी दिसेल.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">रँक</th>
                    <th className="p-3">रेफरर सदस्य</th>
                    <th className="p-3">रेफरल कोड</th>
                    <th className="p-3">जोडलेले सदस्य</th>
                    <th className="p-3">सध्याचा प्लॅन</th>
                    <th className="p-3 text-right">ॲक्शन्स / बक्षीस द्या</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaderboard.map((item, idx) => {
                    const p = item.profile;
                    return (
                      <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3 font-black text-slate-700">
                          {idx === 0 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shadow-sm">
                              🥇
                            </span>
                          ) : idx === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-bold text-xs">
                              🥈
                            </span>
                          ) : idx === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                              🥉
                            </span>
                          ) : (
                            `#${idx + 1}`
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">{p.fullName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>📞 {p.mobile || 'मोबाईल नाही'}</span>
                            {p.district && <span>• 📍 {p.district}</span>}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-[#A71930] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {item.referralCode}
                            </span>
                            <button
                              onClick={() => handleCopy(item.referralCode)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                              title="कोड कॉपी करा"
                            >
                              {copiedCode === item.referralCode ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-200">
                            <Users className="w-3 h-3 text-emerald-600" />
                            {item.referredCount} सदस्य
                          </span>
                        </td>
                        <td className="p-3">
                          <div>
                            <span className="font-bold text-slate-800 text-xs">
                              {p.paymentPlanName || p.membership || 'मोफत'}
                            </span>
                            {p.membershipExpiryDate && (
                              <div className="text-[10px] text-slate-500 font-medium">
                                वैध: {new Date(p.membershipExpiryDate).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Grant / Extend Custom Plan Button */}
                            <button
                              type="button"
                              onClick={() => handleGrant(p)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              title="मोफत प्लॅन किंवा मुदतवाढ द्या"
                            >
                              <Gift className="w-3.5 h-3.5 text-amber-300" />
                              <span>🎁 फ्री प्लॅन द्या</span>
                            </button>

                            {/* Send Telegram Message */}
                            <button
                              type="button"
                              onClick={() => handleSendReferralRewardTelegram(p, item.referredCount)}
                              className="p-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 transition-colors cursor-pointer"
                              title="टेलिग्रामवर बक्षीस ऑफर पाठवा"
                            >
                              <Send className="w-4 h-4" />
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
      )}

      {/* VIEW 2: ALL REFERRAL PAIRS LOG */}
      {activeSubView === 'all_referrals' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>सर्व रेफरल नोंदी (Who Referred Whom Log)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              एकूण {filteredPairs.length} नोंदी
            </span>
          </div>

          {filteredPairs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <p className="text-xs font-bold">कोणतेही रेफरल सापडले नाहीत.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">नोंदणी केलेला उमेदवार</th>
                    <th className="p-3">जिल्हा व संपर्क</th>
                    <th className="p-3">रेफररचे नाव</th>
                    <th className="p-3">वापरलेला कोड</th>
                    <th className="p-3">उमेदवाराचा प्लॅन</th>
                    <th className="p-3 text-right">ॲक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPairs.map((pair, idx) => {
                    const u = pair.referredUser;
                    return (
                      <tr key={`${u.id}-${idx}`} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">{u.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-700 font-medium">📍 {u.district || 'महाराष्ट्र'}</div>
                          <div className="text-[11px] text-slate-500 font-medium">📞 {u.mobile}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{pair.referrerName}</div>
                          {pair.referrerMobile && (
                            <div className="text-[10px] text-slate-500">📞 {pair.referrerMobile}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-xs text-[#A71930] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {pair.refCode}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.membership && u.membership !== 'free'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.paymentPlanName || u.membership || 'मोफत'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleGrant(u)}
                            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            🎁 प्लॅन द्या
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
