import React, { useState } from 'react';
import { X, Gift, Sparkles, CheckCircle2, ShieldCheck, Clock, Calendar } from 'lucide-react';
import { UserProfile } from '../types';

interface AdminSpecialPremiumModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberId: string, specialAccessData: UserProfile['specialPremiumAccess']) => void;
}

export const AdminSpecialPremiumModal: React.FC<AdminSpecialPremiumModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !member) return null;

  const currentAccess = member.specialPremiumAccess;
  const [enabled, setEnabled] = useState(currentAccess?.enabled ?? true);
  const [durationOption, setDurationOption] = useState<'no_expiry' | '7_days' | '30_days' | 'custom'>(
    currentAccess?.expiryDate ? 'custom' : 'no_expiry'
  );
  const [customExpiryDate, setCustomExpiryDate] = useState<string>(
    currentAccess?.expiryDate ? currentAccess.expiryDate.split('T')[0] : ''
  );
  const [note, setNote] = useState<string>(currentAccess?.note || 'प्रशासकाद्वारे विशेष प्रीमियम हक्क प्रदान');

  const handleSave = () => {
    let finalExpiryDate: string | null = null;

    if (enabled) {
      if (durationOption === '7_days') {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        finalExpiryDate = d.toISOString();
      } else if (durationOption === '30_days') {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        finalExpiryDate = d.toISOString();
      } else if (durationOption === 'custom' && customExpiryDate) {
        finalExpiryDate = new Date(customExpiryDate).toISOString();
      }
    }

    onSave(member.id, {
      enabled,
      grantedAt: new Date().toISOString(),
      expiryDate: finalExpiryDate,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-amber-400 shadow-2xl overflow-hidden text-slate-900">
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-4 flex items-center justify-between border-b border-amber-300">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-300" />
            <h3 className="font-black text-sm">Special Premium Access (विशेष प्रीमियम हक्क)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-lg text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs font-bold">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
            <img
              src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={member.fullName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-amber-300"
            />
            <div>
              <div className="font-bold text-slate-900">{member.fullName}</div>
              <div className="text-[10px] text-slate-500 font-mono">ID: {member.id} • {member.mobile}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-700 block">प्रीमियम स्टेटस हक्क (Special Premium Status):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEnabled(true)}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                  enabled
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>चालू करा (ON)</span>
              </button>

              <button
                type="button"
                onClick={() => setEnabled(false)}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                  !enabled
                    ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <X className="w-4 h-4" />
                <span>बंद करा (OFF)</span>
              </button>
            </div>
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <label className="text-slate-700 block">मुदत/कालावधी (Validity Duration):</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'no_expiry', label: '♾️ अमर्यादित (No Expiry)' },
                    { id: '7_days', label: '⏱️ ७ दिवस (7 Days)' },
                    { id: '30_days', label: '📅 ३० दिवस (30 Days)' },
                    { id: 'custom', label: '📆 कस्टमाइज तारीख' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDurationOption(opt.id as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${
                        durationOption === opt.id
                          ? 'bg-amber-100 text-[#800C1E] border-amber-400 font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {durationOption === 'custom' && (
                <div className="space-y-1">
                  <label className="text-slate-700 block text-[11px]">अंतिम तारीख ठरवा:</label>
                  <input
                    type="date"
                    value={customExpiryDate}
                    onChange={(e) => setCustomExpiryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-700 block text-[11px]">ॲडमिन नोंद (Reason / Note):</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                  placeholder="उदा. विशेष चाचणीसाठी विनामूल्य प्रवेश दिला"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              रद्द करा
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#800C1E] hover:bg-[#680918] text-white rounded-xl font-bold flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>जतन करा (Save)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
