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
  Key
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminMemberActionMenuModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (member: UserProfile) => void;
  onEditProfile: (member: UserProfile) => void;
  onGrantPlan: (member: UserProfile) => void;
  onSpecialPremium: (member: UserProfile) => void;
  onContactAccess: (member: UserProfile) => void;
  onChangePassword?: (member: UserProfile) => void;
  onViewReports: (member: UserProfile) => void;
  onSendWarning: (member: UserProfile) => void;
  onToggleSuspend: (member: UserProfile) => void;
  onToggleBlock: (member: UserProfile) => void;
  onViewHistory: (member: UserProfile) => void;
  onPrint: (member: UserProfile) => void;
  onDelete: (member: UserProfile) => void;
}

export const AdminMemberActionMenuModal: React.FC<AdminMemberActionMenuModalProps> = ({
  member,
  isOpen,
  onClose,
  onViewProfile,
  onEditProfile,
  onGrantPlan,
  onSpecialPremium,
  onContactAccess,
  onChangePassword,
  onViewReports,
  onSendWarning,
  onToggleSuspend,
  onToggleBlock,
  onViewHistory,
  onPrint,
  onDelete,
}) => {
  if (!isOpen || !member) return null;

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
          </div>

          {/* Section 2: Membership & Access Controls */}
          <div className="space-y-1 py-2">
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-2">
              सदस्यता व विशेष प्रवेश
            </div>

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

            <button
              onClick={() => { onClose(); onDelete(member); }}
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
    </div>
  );
};
