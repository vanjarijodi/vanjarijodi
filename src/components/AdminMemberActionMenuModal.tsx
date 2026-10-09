import React, { useState } from 'react';
import {
  X,
  Eye,
  Edit3,
  Crown,
  Gift,
  PhoneCall,
  AlertTriangle,
  Bell,
  PauseCircle,
  Ban,
  History,
  Printer,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Key,
  Camera,
  Heart,
  Send
} from 'lucide-react';
import { UserProfile } from '../types';
import { nuclearBanMember } from '../utils/securityService';

interface AdminMemberActionMenuModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (member: UserProfile) => void;
  onEditProfile: (member: UserProfile) => void;
  onModeratePhotos?: (member: UserProfile) => void;
  onGrantPlan: (member: UserProfile) => void;
  onGrantFreeAccess?: (member: UserProfile) => void;
  onSpecialPremium: (member: UserProfile) => void;
  onContactAccess: (member: UserProfile) => void;
  onChangePassword?: (member: UserProfile) => void;
  onViewReports: (member: UserProfile) => void;
  onSendWarning: (member: UserProfile) => void;
  onToggleSuspend: (member: UserProfile) => void;
  onToggleBlock: (member: UserProfile) => void;
  onViewHistory: (member: UserProfile) => void;
  onPrint: (member: UserProfile) => void;
  onShareTelegram?: (member: UserProfile) => void;
  onSendDirectNotification?: (member: UserProfile) => void;
  onViewLikes?: (member: UserProfile) => void;
  onDelete: (member: UserProfile) => void;
}

export const AdminMemberActionMenuModal: React.FC<AdminMemberActionMenuModalProps> = ({
  member,
  isOpen,
  onClose,
  onViewProfile,
  onEditProfile,
  onModeratePhotos,
  onGrantPlan,
  onGrantFreeAccess,
  onSpecialPremium,
  onContactAccess,
  onChangePassword,
  onViewReports,
  onSendWarning,
  onToggleSuspend,
  onToggleBlock,
  onViewHistory,
  onPrint,
  onShareTelegram,
  onSendDirectNotification,
  onViewLikes,
  onDelete,
}) => {
  if (!isOpen || !member) return null;

  const [showNuclearBanModal, setShowNuclearBanModal] = useState(false);
  const [banReason, setBanReason] = useState('बनावट प्रोफाईल / खोटा बायोडाटा आढळला (Fake / Scam Biodata)');
  const [isBanning, setIsBanning] = useState(false);

  const handleConfirmNuclearBan = async () => {
    if (!member) return;
    setIsBanning(true);
    try {
      await nuclearBanMember({
        userId: member.id,
        userName: member.fullName,
        mobile: member.mobile,
        reason: banReason,
        deviceFingerprint: (member as any).deviceFingerprint,
        ip: (member as any).lastIp,
      });
      onToggleBlock(member);
      alert(`🚨 सदस्य '${member.fullName}' (मोबाईल: ${member.mobile}) आणि त्यांचे डिव्हाइस कायमचे ब्लॅकलिस्ट करण्यात आले आहे.\n\nया मोबाईलवरून पुन्हा नवीन बायोडाटा किंवा लॉगिन करता येणार नाही!`);
      setShowNuclearBanModal(false);
      onClose();
    } catch (e) {
      console.error(e);
      alert('बॅन करताना त्रुटी आली.');
    } finally {
      setIsBanning(false);
    }
  };

  const isPaid = member.membership && member.membership !== 'free';
  const hasSpecialAccess = member.specialPremiumAccess?.enabled;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-3.5 flex items-center justify-between border-b border-amber-300 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={member.fullName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border-2 border-amber-300 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-amber-100 truncate flex items-center gap-1.5">
                <span>{member.fullName}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-black/30 rounded text-amber-300">
                  ID: {member.id}
                </span>
              </h3>
              <p className="text-[11px] text-amber-200/90 truncate font-mono">
                {member.mobile || 'मोबाईल नाही'} • {member.district || 'महाराष्ट्र'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-black/20 hover:bg-black/40 text-amber-200 hover:text-white rounded-lg transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Status Badges Bar */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          <span className="text-slate-600">स्थिती:</span>
          
          {member.isSuspended ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
              ⚠️ मूल्तवी (Suspended)
            </span>
          ) : member.isBlocked ? (
            <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-400">
              🚫 ब्लॉक (Blocked)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 सक्रीय (Active)
            </span>
          )}

          {isPaid ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-300 text-[#800C1E] border border-amber-400 font-black">
              💎 Paid ({member.paymentPlanName || member.membership})
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              मोफत (Free)
            </span>
          )}

          {hasSpecialAccess && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Special Premium</span>
            </span>
          )}

          {member.adminNotice && !member.adminNoticeRead && (
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              ⚠️ सूचना पाठवली
            </span>
          )}
        </div>

        {/* Action Menu Items List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100 text-xs font-bold text-slate-800">
          
          {/* Section 1: Member Profile Actions */}
          <div className="space-y-1 pb-2">
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2">
              प्रोफाईल व तपशील
            </div>
            
            <button
              onClick={() => { onClose(); onViewProfile(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-amber-100 text-[#800C1E]">
                <Eye className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">1. View Profile (संपूर्ण प्रोफाईल पहा)</div>
                <div className="text-[10px] text-slate-500 font-normal">सदस्याचे फोटो, बायोडाटा व कौटुंबिक तपशील पाहा</div>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onEditProfile(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">2. Edit Full Profile (प्रोफाईल संपादन)</div>
                <div className="text-[10px] text-slate-500 font-normal">नाव, संपर्क, शिक्षण, कुंडलीजवळ बदल करा</div>
              </div>
            </button>

            {onModeratePhotos && (
              <button
                onClick={() => { onClose(); onModeratePhotos(member); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50 text-slate-800 transition cursor-pointer text-left"
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                    <span>📸 Manage & Moderate Photos (फोटो व्यवस्थापन)</span>
                    <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded-md font-black">
                      {(member.photos?.length || 0) + (member.photoUrl && !member.photos?.includes(member.photoUrl) ? 1 : 0)} फोटो
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">सर्व फोटो तपासा, मुख्य फोटो बदला, नाकारा किंवा नवीन फोटो जोडा</div>
                </div>
              </button>
            )}

            <button
              onClick={() => { onClose(); onPrint(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-sky-100 text-sky-800">
                <Printer className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">3. Print Member Details (प्रिंट बायोडाटा)</div>
                <div className="text-[10px] text-slate-500 font-normal">व्यावसायिक लेआउटमध्ये बायोडाटा प्रिंट करा</div>
              </div>
            </button>

            {onShareTelegram && (
              <button
                onClick={() => { onClose(); onShareTelegram(member); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-sky-50 text-slate-800 transition cursor-pointer text-left border border-sky-200 bg-sky-50/40"
              >
                <div className="p-2 rounded-lg bg-[#229ED9] text-white">
                  <Send className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                    <span>📢 Telegram BioData Post (टेलिग्राम वर पोस्ट करा)</span>
                    <span className="text-[9px] bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded-md font-black">
                      🔒 नंबर मास्क
                    </span>
                  </div>
                  <div className="text-[10px] text-sky-800/80 font-normal">
                    मोबाईल नंबर लपवून / मास्क करून टेलिग्राम ग्रुपसाठी फोटोसह पोस्ट बनवा
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Section 2: Membership & Access Controls */}
          <div className="space-y-1 py-2">
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2">
              सदस्यता व विशेष प्रवेश
            </div>

            {onGrantFreeAccess && (
              <button
                onClick={() => { onClose(); onGrantFreeAccess(member); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 transition cursor-pointer text-left border border-emerald-300 bg-emerald-50/60"
              >
                <div className="p-2 rounded-lg bg-emerald-600 text-white">
                  <Gift className="w-4 h-4 text-amber-300" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <span>🎁 Grant Free Membership (१-क्लिक मोफत सदस्यता)</span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md font-black">
                      तत्काळ
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-800/80 font-normal">
                    ७/१५/३० दिवस, ३/६ महिने, १ वर्ष किंवा आजीवन मोफत प्रीमियम द्या
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={() => { onClose(); onGrantPlan(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Crown className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">4. Membership Plan (सदस्यता प्लॅन)</div>
                <div className="text-[10px] text-slate-500 font-normal">कस्टम प्लॅन किंवा मुदत प्रदान करा</div>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onSpecialPremium(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                <Gift className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">5. Special Premium Access (विशेष प्रीमियम हक्क)</div>
                <div className="text-[10px] text-slate-500 font-normal">विना-पेमेंट रेकॉर्ड विशेष प्रीमियम प्रवेश चालू/बंद करा</div>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onContactAccess(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">6. Contact Access (संपर्क थेट अनलॉक)</div>
                <div className="text-[10px] text-slate-500 font-normal">या सदस्याला किंवा या सदस्याचा नंबर अनलॉक करण्याची परवानगी द्या</div>
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onChangePassword) {
                  onChangePassword(member);
                } else {
                  onContactAccess(member);
                }
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-slate-900 text-amber-300">
                <Key className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>Change / Reset Password (पासवर्ड रिसेट)</span>
                  <span className="text-[9px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.2 rounded">Bcrypt</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal">सदस्याचा पासवर्ड बदला किंवा Bcrypt ने सुरक्षित नवीन पासवर्ड जनरेट करा</div>
              </div>
            </button>
          </div>

          {/* Section 3: Communication & Reports */}
          <div className="space-y-1 py-2">
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2">
              तक्रारी व सूचना
            </div>

            <button
              onClick={() => { onClose(); onViewReports(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">7. View Reports (तक्रारी पहा)</div>
                <div className="text-[10px] text-slate-500 font-normal">या प्रोफाईलविरोधात दाखल झालेल्या तक्रारी पाहा</div>
              </div>
            </button>

            {onSendDirectNotification && (
              <button
                onClick={() => { onClose(); onSendDirectNotification(member); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-100/70 text-slate-800 transition cursor-pointer text-left border border-amber-300 bg-amber-50/80 shadow-xs"
              >
                <div className="p-2 rounded-lg bg-[#800C1E] text-amber-300 shadow-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xs text-[#800C1E] flex items-center gap-1.5">
                    <span>🔔 वैयक्तिक पुश सूचना पाठवा (Send Notification)</span>
                    <span className="text-[9px] bg-amber-200 text-[#800C1E] px-1.5 py-0.2 rounded font-black">थेट संदेश</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-normal">या एकाच सदस्याला थेट फोनवर वैयक्तिक पुश व इन-ॲप सूचना पाठवा</div>
                </div>
              </button>
            )}

            {onViewLikes && (
              <button
                onClick={() => { onClose(); onViewLikes(member); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-100/60 text-slate-800 transition cursor-pointer text-left border border-rose-200 bg-rose-50/50"
              >
                <div className="p-2 rounded-lg bg-rose-600 text-white shadow-xs">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                    <span>❤️ या सदस्याचे सर्व लाईक्स पहा (Likes Tracker)</span>
                    <span className="text-[9px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-black">
                      ट्रॅकर
                    </span>
                  </div>
                  <div className="text-[10px] text-rose-700/90 font-normal">
                    यांनी कोणाला लाईक केले व यांना कोणी लाईक केले, परस्पर मॅच स्थिती पहा
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={() => { onClose(); onSendWarning(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">8. Send Warning / Notice (सूचना पाठवा)</div>
                <div className="text-[10px] text-slate-500 font-normal">सदस्याला थेट लॉगइन वॉर्निंग पॉपअप संदेश पाठवा</div>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onViewHistory(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-[#800C1E]/10 text-[#800C1E]">
                <History className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">9. Activity & History (इतिहास व लॉग)</div>
                <div className="text-[10px] text-slate-500 font-normal">लॉगइन, पसंती व पेमेंट इतिहास पाहा</div>
              </div>
            </button>
          </div>

          {/* Section 4: Account Actions & Safety */}
          <div className="space-y-1 pt-2">
            <div className="text-[10px] uppercase font-black tracking-wider text-rose-600 px-2">
              खाते नियंत्रण व धोकादायक पर्याय
            </div>

            <button
              onClick={() => { onClose(); onToggleSuspend(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                <PauseCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">
                  10. {member.isSuspended ? 'आपोआप मुदतपूर्व पूर्ववत करा (Unsuspend)' : 'Suspend Member (खाते मूल्तवी करा)'}
                </div>
                <div className="text-[10px] text-slate-500 font-normal">सदस्याला तात्पुरते निष्क्रिय करा</div>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onToggleBlock(member); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-800 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
                <Ban className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-slate-900">
                  11. {member.isBlocked ? 'ब्लॉक हटवा (Unblock Member)' : 'Block Member (खाते ब्लॉक करा)'}
                </div>
                <div className="text-[10px] text-slate-500 font-normal">ॲप वापरण्यापासून पूर्णपणे रोखा</div>
              </div>
            </button>

            {/* 11B. Nuclear Fraud Ban: Member + Mobile + Device Fingerprint + IP */}
            <button
              onClick={() => setShowNuclearBanModal(true)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-red-950/10 hover:bg-red-900/20 text-red-950 border border-red-400/50 transition cursor-pointer text-left shadow-xs"
            >
              <div className="p-2 rounded-lg bg-red-900 text-amber-300">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-red-950 flex items-center gap-1.5">
                  <span>🚨 बनावट प्रोफाईल व डिव्हाइस बॅन (Nuclear Ban)</span>
                  <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black">
                    कायमची बंदी
                  </span>
                </div>
                <div className="text-[10px] text-red-800/90 font-normal">
                  सदस्य, मोबाईल, डिव्हाइस फिंगरप्रिंट व IP सर्व एकाच वेळी ब्लॉक करा जेणेकरून त्या फोनवरून पुन्हा नोंदणी किंवा लॉगिन होणार नाही
                </div>
              </div>
            </button>

            <button
              onClick={() => onDelete(member)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-rose-600 text-white">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs text-rose-900">12. Delete Member (कायमचे हटवा)</div>
                <div className="text-[10px] text-rose-700 font-normal">२-टप्पे सुरक्षेसह प्रोफाईल व फोटो डिलीट करा</div>
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* NUCLEAR BAN CONFIRMATION MODAL */}
      {showNuclearBanModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-md w-full p-5 sm:p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  कायमची बंदी (Nuclear Fraud Ban)
                </h3>
                <p className="text-xs text-red-300">
                  डिव्हाइस, फोन नंबर आणि आयपी ऍड्रेस ब्लॅकलिस्ट
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-2xl text-xs space-y-2 text-slate-300">
              <p>
                तुम्ही <strong className="text-white">{member.fullName}</strong> (ID: {member.id}) यांच्याविरोधात कायमची बंदी कारवाई करत आहात:
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-200 font-medium text-[11px]">
                <li>मोबाईल नंबर <strong className="text-amber-300 font-mono">{member.mobile}</strong> कायमचा ब्लॅकलिस्ट होईल.</li>
                <li>या युझरच्या मोबाईल डिव्हाइसचा <strong>Hardware Fingerprint</strong> बॅन होईल.</li>
                <li>या डिव्हाइसवरून पुन्हा कधीही नवीन नोंदणी किंवा लॉगिन करता येणार नाही.</li>
                <li>इंटरनेट IP ऍड्रेस फायरवॉल क्वारंटाईनमध्ये जाईल.</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">बॅन करण्याचे कारण निवडा:</label>
              <select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400"
              >
                <option value="बनावट प्रोफाईल / खोटे फोटो वापरले (Fake / Stolen Photos)">बनावट प्रोफाईल / खोटे फोटो वापरले</option>
                <option value="पैशांची मागणी / आर्थिक फसवणूक (Financial Scam / Extortion)">पैशांची मागणी / आर्थिक फसवणूक</option>
                <option value="खोटे शिक्षण, वय किंवा वैवाहिक स्थिती (Misleading BioData)">खोटे शिक्षण, वय किंवा वैवाहिक स्थिती</option>
                <option value="अयोग्य संभाषण / चॅट गैरवर्तन (Abusive Behavior)">अयोग्य संभाषण / चॅट गैरवर्तन</option>
                <option value="इतर संशयास्पद कृती (Suspicious Activity)">इतर संशयास्पद कृती</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNuclearBanModal(false)}
                disabled={isBanning}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleConfirmNuclearBan}
                disabled={isBanning}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-900/50 cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{isBanning ? 'बॅन करत आहे...' : '🚨 पूर्णपणे बॅन करा'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
