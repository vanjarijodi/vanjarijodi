import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Lock,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';

interface AdminChangeMemberPasswordModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminChangeMemberPasswordModal: React.FC<AdminChangeMemberPasswordModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { adminResetUserPassword, addNotification } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notifyMember, setNotifyMember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !member) return null;

  const handleGeneratePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generated = `Vanjari@${randomDigits}`;
    setNewPassword(generated);
    setShowPassword(true);
    setSuccessMessage(null);
  };

  const handleCopy = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 4) {
      alert('कृपया किमान ४ अक्षरी/अंकी पासवर्ड टाका.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminResetUserPassword(member.id, trimmed);
      if (res.success) {
        if (notifyMember) {
          addNotification({
            userId: member.id,
            title: '🔑 Your Password Has Been Updated',
            titleMr: '🔑 तुमचा नवीन सुरक्षा पासवर्ड सेट झाला आहे',
            message: `Admin has updated your password to: ${trimmed}. Please keep it secure.`,
            messageMr: `ॲडमिनद्वारे आपल्या खात्याचा पासवर्ड बदलण्यात आला आहे: ${trimmed}. पुढील वेळी लॉगिन करताना हा पासवर्ड वापरा.`,
            type: 'system',
          });
        }
        setSuccessMessage(`✅ '${member.fullName}' यांचा पासवर्ड यशस्वीरित्या बदलण्यात आला!`);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        alert(res.message || 'पासवर्ड बदलताना त्रुटी आली.');
      }
    } catch (err: any) {
      alert('त्रुटी: ' + (err?.message || 'पासवर्ड बदलता आला नाही.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-4 flex items-center justify-between border-b border-amber-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-amber-100">
                सदस्याचा पासवर्ड बदला
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                नवीन Bcrypt हॅश पासवर्ड सेट करा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-amber-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Preview Card */}
        <div className="bg-amber-50/70 p-3.5 border-b border-amber-200 flex items-center gap-3">
          <img
            src={member.photoUrl || member.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={member.fullName}
            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                {member.fullName}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-200 text-amber-950 font-black rounded-full shrink-0">
                ID: {member.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-mono font-bold mt-0.5">
              📱 मोबाईल: {member.mobile || 'नाही'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-800">
          
          {successMessage && (
            <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-slate-700 font-black">
              नवीन पासवर्ड प्रविष्ट करा (Enter New Password):
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="उदा. Vanjari@2026 किंवा 123456"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setSuccessMessage(null);
                }}
                className="w-full px-3.5 py-2.5 pr-20 text-xs sm:text-sm rounded-xl border border-amber-300 bg-slate-50 focus:bg-white font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#A71930]"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                {newPassword && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    title="पासवर्ड कॉपी करा"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title={showPassword ? 'लपवा' : 'दाखवा'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Auto Generate Button */}
          <button
            type="button"
            onClick={handleGeneratePassword}
            className="w-full py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-[#800C1E] border border-amber-300 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#800C1E]" />
            <span>🎲 सुरक्षित पासवर्ड ऑटो-जनरेट करा (Auto-Generate)</span>
          </button>

          {/* Send Push Notification Toggle */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
            <input
              type="checkbox"
              checked={notifyMember}
              onChange={(e) => setNotifyMember(e.target.checked)}
              className="mt-0.5 rounded text-[#A71930] focus:ring-[#A71930]"
            />
            <div className="text-[11px] leading-tight font-medium text-slate-700">
              <strong className="text-slate-900 block font-bold">
                सदस्याला इन-ॲप व पुश सूचना पाठवा
              </strong>
              हा नवीन पासवर्ड सदस्याच्या मोबाईलवर थेट सुरक्षित नोटिफिकेशनद्वारे कळवला जाईल.
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              रद्द करा (Cancel)
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !newPassword.trim()}
              className="py-2.5 px-4 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#650817] hover:to-[#8a1325] text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <Check className="w-4 h-4 text-amber-300" />
              )}
              <span>पासवर्ड सेव्ह करा</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
