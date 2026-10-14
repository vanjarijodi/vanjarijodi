import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { X, Send, Bell, Sparkles, CheckCircle2, Volume2, ShieldCheck, Phone, MapPin, Crown, User } from 'lucide-react';
import { triggerBrowserPushNotification } from '../utils/pushNotificationHelper';

interface AdminDirectMemberNotificationModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDirectMemberNotificationModal: React.FC<AdminDirectMemberNotificationModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { sendPushNotification, addNotification, logActivity, siteConfig } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('/dashboard');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !member) return null;

  const isPaid = member.membership && member.membership !== 'free';

  // Quick 1-click Marathi templates specifically tailored for an individual member
  const individualTemplates = [
    {
      label: '🎉 प्रोफाईल मंजूर झाली',
      title: 'अभिनंदन! तुमचे वंजारी जोडी प्रोफाईल मंजूर झाले आहे',
      message: `${member.fullName || 'सदस्य'}, तुमचे प्रोफाईल ॲडमिन टीमने पडताळून मंजूर केले आहे. आता तुमचे स्थळ सर्व वंजारी बांधवांना दिसेल.`,
      url: '/dashboard',
    },
    {
      label: '🎁 खास सवलत ऑफर कोड',
      title: 'विशेष भेट: खास तुमच्यासाठी ५०% सवलत प्रोमो कोड!',
      message: `${member.fullName || 'सदस्य'}, तुमच्यासाठी 'VANJARI50' हा विशेष सवलत कोड सक्रिय केला आहे. आजच मेंबरशिप घेऊन थेट संपर्क साधा.`,
      url: '/membership',
    },
    {
      label: '🛡️ आधार व फोटो पडताळणी',
      title: 'कृपया तुमची आधार व सेल्फी पडताळणी पूर्ण करा',
      message: `${member.fullName || 'सदस्य'}, बायोडाटावर ब्लू व्हेरीफाईड बॅज (Verified Badge) मिळवण्यासाठी आजच आधार व थेट सेल्फी सबमिट करा.`,
      url: '/profile-edit',
    },
    {
      label: '💖 नवीन अनुरूप स्थळ',
      title: 'तुमच्या अपेक्षेनुसार नवीन जुळणारे स्थळ उपलब्ध आहे!',
      message: `${member.fullName || 'सदस्य'}, तुमच्या शिक्षण व जिल्ह्याला अनुकूल असे नवीन स्थळ जोडले गेले आहे. त्वरित लॉगीन करून बायोडाटा पाहा.`,
      url: '/profiles',
    },
    {
      label: '⏳ प्लॅन संपत आल्याची सूचना',
      title: 'महत्त्वाची सूचना: तुमचा मेंबरशिप प्लॅन संपत आला आहे',
      message: `${member.fullName || 'सदस्य'}, अखंडित सेवा आणि सर्व संपर्क अनलॉक ठेवण्यासाठी कृपया आपला प्लॅन त्वरित रिन्यू करा.`,
      url: '/membership',
    },
  ];

  const handleApplyTemplate = (tpl: typeof individualTemplates[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setActionUrl(tpl.url);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('कृपया शीर्षक आणि संदेश प्रविष्ट करा.');
      return;
    }

    setIsSending(true);

    try {
      // 1. Send push notification directly to this member
      sendPushNotification(member.id, title.trim(), message.trim());

      // 2. Add in-app notification for the member
      addNotification({
        userId: member.id,
        title: title.trim(),
        titleMr: title.trim(),
        message: message.trim(),
        messageMr: message.trim(),
        type: 'system',
        actionUrl: actionUrl.trim() || undefined,
      });

      // 3. Trigger immediate browser notification test if current session is active
      triggerBrowserPushNotification(title.trim(), {
        body: message.trim(),
        url: actionUrl.trim() || '/dashboard',
        playSound: siteConfig?.enableSoundNotifications !== false,
      });

      // 4. Log admin activity
      logActivity(
        'INDIVIDUAL_NOTIFICATION_SENT',
        `ॲडमिनने वैयक्तिक सूचना पाठवली: "${title.trim()}" -> ${member.fullName} (${member.id})`,
        `Member: ${member.id}, Mobile: ${member.mobile}`
      );

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
        setTitle('');
        setMessage('');
      }, 1800);
    } catch (err) {
      console.error(err);
      alert('सूचना पाठवताना त्रुटी आली.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-4 flex items-center justify-between border-b border-amber-300 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-[#800C1E] shrink-0 shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-amber-200">
                वैयक्तिक सदस्याला थेट सूचना पाठवा
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-100/90 font-medium">
                Send Direct Personal Notification & Push Alert
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-black/20 hover:bg-black/40 text-amber-200 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Target Member Card */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-300/80 flex items-center gap-3">
            <img
              src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={member.fullName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm text-slate-900 truncate">{member.fullName}</span>
                <span className="px-1.5 py-0.2 bg-black/10 rounded font-mono text-[10px] text-slate-700">
                  ID: {member.id}
                </span>
                {isPaid ? (
                  <span className="px-2 py-0.2 bg-amber-300 text-[#800C1E] rounded-full text-[10px] font-black">
                    👑 Paid
                  </span>
                ) : (
                  <span className="px-2 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                    Free
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {member.mobile || member.mobileNumber || 'मोबाईल नाही'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  {member.district || 'महाराष्ट्र'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Marathi Templates */}
          <div>
            <label className="text-[11px] font-black text-slate-700 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>१-क्लिक संदेश टेम्प्लेट्स निवडा:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {individualTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-[#800C1E] border border-slate-200 hover:border-amber-300 rounded-xl text-[11px] font-bold transition active:scale-95 cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="space-y-3.5">
            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                सूचनेचे शीर्षक (Notification Title): <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा. तुमचे प्रोफाईल मंजूर झाले आहे..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                तपशीलवार संदेश (Notification Body): <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="सदस्याला दाखवायचा सविस्तर संदेश येथे लिहा..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-amber-500 focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                क्लिक केल्यावर उघडायचे पेज (Action Link):
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/dashboard किंवा /membership किंवा /profiles"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>या सदस्याला वैयक्तिक पुश व इन-ॲप सूचना यशस्वीरीत्या पाठवण्यात आली आहे!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                disabled={isSending || sentSuccess}
                className="px-5 py-2.5 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#9E1428] hover:to-[#800C1E] text-white rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>{isSending ? 'पाठवत आहे...' : '🚀 या सदस्याला त्वरित पाठवा'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
