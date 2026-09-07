import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2, Bell } from 'lucide-react';
import { UserProfile } from '../types';

interface AdminWarningModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSendWarning: (memberId: string, title: string, message: string) => void;
}

export const AdminWarningModal: React.FC<AdminWarningModalProps> = ({
  member,
  isOpen,
  onClose,
  onSendWarning,
}) => {
  if (!isOpen || !member) return null;

  const [title, setTitle] = useState('⚠️ प्रशासकीय सूचना (Admin Notice)');
  const [message, setMessage] = useState(
    'तुमच्या प्रोफाईलमधील माहिती व फोटोंची पडताळणी प्रलंबित आहे. कृपया योग्य माहिती अपडेट करा अन्यथा खाते तात्पुरते रोखले जाईल.'
  );

  const PRESET_WARNINGS = [
    {
      title: '⚠️ चुकीचे फोटो / अस्पष्ट फोटो',
      msg: 'कृपया प्रोफाईलवर स्वतःचे स्पष्ट आणि पासपोर्ट आकाराचे फोटो अपलोड करा. इतर चित्रे/देवतांचे फोटो ग्राह्य धरले जाणार नाहीत.',
    },
    {
      title: '⚠️ मोबाईल क्रमांक व संपर्क अचूकता',
      msg: 'तुमचा संपर्क क्रमांक चुकीचा किंवा बंद असल्याचे आढळले आहे. कृपया योग्य चालू मोबाईल क्रमांक अपडेट करा.',
    },
    {
      title: '⚠️ अयोग्य व्यवहार / तक्रार प्राप्त',
      msg: 'इतर सदस्यांकडून आपल्या प्रोफाईलबद्दल तक्रार प्राप्त झाली आहे. कृपया सन्मानपूर्वक संवाद साधा अन्यथा खाते ब्लॉक केले जाईल.',
    },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    onSendWarning(member.id, title, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-amber-400 shadow-2xl overflow-hidden text-slate-900">
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-4 flex items-center justify-between border-b border-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            <h3 className="font-black text-sm">सदस्याला वॉर्निंग / सूचना पाठवा</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/20 rounded-lg text-amber-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs font-bold">
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

          <div className="space-y-1.5">
            <label className="text-slate-700 block">तयार मेसेज नमुने (Quick Presets):</label>
            <div className="space-y-1">
              {PRESET_WARNINGS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(p.title);
                    setMessage(p.msg);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-[11px] text-slate-700 font-semibold cursor-pointer transition"
                >
                  <div className="font-bold text-slate-900">{p.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.msg}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 block">सूचना शीर्षक (Notice Title):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 block">सविस्तर संदेश (Notice Message):</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 leading-relaxed"
            />
          </div>

          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-800 font-semibold">
            ℹ️ हा संदेश या सदस्याने लॉगिन केल्यानंतर त्याला मुख्य स्क्रीनवर <strong>⚠️ Important Notice Pop-up</strong> स्वरूपात दिसेल.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              रद्द करा
            </button>
            <button
              onClick={handleSend}
              className="px-5 py-2 bg-[#800C1E] hover:bg-[#680918] text-white rounded-xl font-bold flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>सूचना पाठवा (Send Notice)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
