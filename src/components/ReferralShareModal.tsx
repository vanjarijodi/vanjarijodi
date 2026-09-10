import React, { useState } from 'react';
import {
  X,
  Gift,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Send
} from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';
import {
  getCleanReferralCode,
  getReferralShareLink,
  getReferralWhatsAppMessage,
} from '../utils/referralUtils';

interface ReferralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
}

export const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const { currentUser, profiles } = useApp();
  const activeUser = user || currentUser;

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !activeUser) return null;

  const referralCode = getCleanReferralCode(activeUser);
  const shareLink = getReferralShareLink(referralCode);

  // Count how many users registered with this referral code
  const referredProfiles = profiles.filter(
    (p) =>
      p.id !== activeUser.id &&
      (p.referredByCode?.toUpperCase() === referralCode.toUpperCase() ||
        p.referredByName?.toLowerCase() === activeUser.fullName.toLowerCase() ||
        (activeUser.mobile && p.referredByMobile === activeUser.mobile))
  );

  const totalReferred = Math.max(activeUser.referralCount || 0, referredProfiles.length);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTelegram = () => {
    const msg = getReferralWhatsAppMessage(activeUser.fullName, referralCode);
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-amber-300 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-amber-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-amber-400/20 rounded-2xl border border-amber-300/40 text-amber-200 shadow-inner">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>रेफर करा आणि मोफत प्लॅन मिळवा!</span>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  Refer & Earn
                </span>
              </h3>
              <p className="text-xs text-amber-100/90 font-medium">
                मित्रांना व नातेवाईकांना वंजारी जोडीवर जोडा
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-amber-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Benefit Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 p-4 rounded-2xl border border-amber-200/80 flex items-start gap-3">
            <div className="p-2 bg-amber-400 text-amber-950 rounded-xl font-bold shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <strong className="text-slate-900 text-sm font-extrabold block">
                🎁 विशेष बक्षीस व मोफत प्लॅन ऑफर!
              </strong>
              <p>
                तुमच्या रेफरल कोडवरून समाजातील मित्रांनी नोंदणी केल्यास ॲडमिनकडून तुमच्या खात्यावर{' '}
                <strong className="text-[#A71930]">मोफत प्रीमियम प्लॅन व अतिरिक्त संपर्क अनलॉक</strong>{' '}
                बक्षीस म्हणून दिले जातील!
              </p>
            </div>
          </div>

          {/* Referral Code Card */}
          <div className="bg-slate-50 border-2 border-dashed border-amber-400 rounded-2xl p-4 text-center space-y-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
              तुमचा युनिक रेफरल कोड (Your Referral Code)
            </span>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 font-mono font-black text-xl sm:text-2xl text-[#A71930] tracking-widest shadow-inner">
                {referralCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs"
                title="कोड कॉपी करा"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedCode ? 'कॉपी झाले!' : 'कॉपी'}</span>
              </button>
            </div>
          </div>

          {/* Direct Telegram Share Button - High Contrast & Catchy */}
          <button
            type="button"
            onClick={handleShareTelegram}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/25 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span>📲 टेलिग्रामवर मित्रांना व ग्रुपवर शेअर करा</span>
          </button>

          {/* Direct Link Share Row */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">तुमची थेट रेफरल लिंक:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'कॉपी झाले!' : 'लिंक कॉपी'}</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400/20 text-[#800C1E] rounded-xl font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">एकूण जोडलेले सदस्य:</span>
                <span className="text-sm font-black text-slate-900">
                  {totalReferred} सदस्य नोंदणीकृत
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              {totalReferred > 0 ? '🎁 बक्षीस पात्र' : 'नवीन रेफरल्स जोडा'}
            </span>
          </div>

          {/* List of referred profiles if any */}
          {referredProfiles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">
                तुमच्या रेफरलवरून जोडलेले सदस्य ({referredProfiles.length}):
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {referredProfiles.map((refUser) => (
                  <div
                    key={refUser.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-800">{refUser.fullName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {refUser.city || refUser.district || 'नोंदणीकृत'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <p className="text-[11px] text-slate-500 text-center font-medium">
            🚩 वंजारी जोडी मॅट्रिमोनी — आपल्या वंजारी समाजाचे हक्काचे विश्वासू स्थळ
          </p>
        </div>
      </div>
    </div>
  );
};
