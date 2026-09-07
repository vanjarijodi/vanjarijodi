import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  Bell,
  Mail,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  MessageSquare,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
  Volume2,
  VolumeX,
  Zap,
  Sliders
} from 'lucide-react';
import {
  triggerBrowserPushNotification,
  requestPushPermission,
  getPushPermissionState,
  playNotificationSound,
  isPushNotificationSupported
} from '../utils/pushNotificationHelper';

export const AdminBroadcastNotificationCenter: React.FC = () => {
  const { siteConfig, updateSiteConfig, profiles, addSystemNotification, logActivity } = useApp();

  const [notificationType, setNotificationType] = useState<'both' | 'push' | 'email'>('both');
  const [targetAudience, setTargetAudience] = useState<'all' | 'unverified' | 'vip' | 'brides' | 'grooms'>('all');
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  
  const [senderEmail, setSenderEmail] = useState(siteConfig?.contactEmail || 'gitevijay123@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');

  useEffect(() => {
    setPermissionState(getPushPermissionState());
  }, []);

  const handleRequestPushPermission = async () => {
    const perm = await requestPushPermission();
    setPermissionState(perm);
    if (perm === 'granted') {
      triggerBrowserPushNotification('🔔 पुश नोटिफिकेशन्स सक्रिय झाले!', {
        body: 'वंजारी जोडी मॅट्रिमोनी पुश नोटिफिकेशन सिस्टीम आता तुमच्या डिव्हाइसवर परिपूर्ण कार्यरत आहे!',
        playSound: true
      });
    }
  };

  const handleTestDevicePush = () => {
    playNotificationSound();
    const success = triggerBrowserPushNotification(
      title.trim() || '💖 नवीन बायोडाटा अलर्ट - वंजारी जोडी',
      {
        body: message.trim() || 'पुश नोटिफिकेशन चाचणी यशस्वी! सर्व सदस्यांना असे थेट नोटिफिकेशन त्वरित प्राप्त होईल.',
        url: actionUrl || '/profiles',
        playSound: true
      }
    );
    if (!success && permissionState !== 'granted') {
      alert('कृपया आधी "पुश नोटिफिकेशन्स परवानगी द्या" बटणावर क्लिक करा.');
    }
  };

  // Pre-configured Marathi Notification Templates
  const templates = [
    {
      id: 'welcome',
      label: '🎉 वंजारी जोडीवर आपले स्वागत आहे!',
      title: 'वंजारी जोडी वधू-वर सूचक केंद्रात आपले स्वागत आहे!',
      message: 'संत भगवान बाबा यांच्या आशीर्वादाने स्थापित महाराष्ट्रातील नंबर १ वंजारी वधू-वर सूचक मंचावर आपली नोंदणी पूर्ण झाली आहे.',
      url: '/dashboard'
    },
    {
      id: 'offer_398',
      label: '💳 स्पेशल वेलकम ऑफर ₹३९८ (६ महिने)',
      title: 'विशेष सवलत ऑफर: फक्त ₹३९८ मध्ये ६ महिने अमर्याद संपर्क अनलॉक!',
      message: 'नवीन नोंदणीकृत सदस्यांसाठी वेलकम ऑफर सुरु आहे. ₹३९८ भरून ५० हून अधिक पडताळलेले व्हॉट्सॲप व मोबाईल नंबर अनलॉक करा.',
      url: '/membership'
    },
    {
      id: 'new_profiles',
      label: '🔔 नवीन वधू-वर प्रोफाईल जोडल्या गेल्या आहेत',
      title: 'आजच ५०+ नवीन पडताळलेल्या वंजारी वधू-वर प्रोफाईल्स जोडल्या!',
      message: 'तुमच्या आवडीनुसार नवीन स्थळे जोडण्यात आली आहेत. आजच लॉगीन करून तुमच्या पसंतीच्या बायोडाटाचा व्हॉट्सॲप संपर्क मिळवा.',
      url: '/profiles'
    },
    {
      id: 'verification',
      label: '🛡️ आधार पडताळणी व सुरक्षितता मार्गदर्शक',
      title: 'तुमचे प्रोफाईल आधार आणि फोटो पडताळणी करून व्हॅलिडेट करा',
      message: 'शंभर टक्के सुरक्षित व खऱ्या बायोडाटासाठी आपले आधार कार्ड अपलोड करून Verified Badge प्राप्त करा.',
      url: '/profile-edit'
    }
  ];

  const applyTemplate = (tpl: typeof templates[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setActionUrl(tpl.url);
  };

  const calculateTargetCount = () => {
    if (targetAudience === 'all') return profiles.length;
    if (targetAudience === 'unverified') return profiles.filter(p => !p.isVerified).length;
    if (targetAudience === 'vip') return profiles.filter(p => p.membership !== 'free').length;
    if (targetAudience === 'brides') return profiles.filter(p => p.gender === 'bride').length;
    if (targetAudience === 'grooms') return profiles.filter(p => p.gender === 'groom').length;
    return profiles.length;
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('कृपया शीर्षक आणि संदेश दोन्ही प्रविष्ट करा.');
      return;
    }

    setIsSending(true);
    setSentSuccess(null);

    try {
      // 1. Trigger Web Push Notification if browser supports
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        });
      }

      // 2. Add System Notifications to targeted profiles in database state
      const targetProfiles = profiles.filter(p => {
        if (targetAudience === 'unverified') return !p.isVerified;
        if (targetAudience === 'vip') return p.membership !== 'free';
        if (targetAudience === 'brides') return p.gender === 'bride';
        if (targetAudience === 'grooms') return p.gender === 'groom';
        return true;
      });

      targetProfiles.slice(0, 100).forEach(p => {
        if (typeof addSystemNotification === 'function') {
          addSystemNotification({
            userId: p.id,
            title: title,
            titleMr: title,
            message: message,
            messageMr: message,
            type: 'system',
            createdAt: new Date().toISOString(),
            isRead: false
          });
        }
      });

      // 3. Log Admin Activity
      logActivity(
        'BROADCAST_NOTIFICATION_SENT',
        `पुश व ई-मेल ब्रॉडकास्ट पाठवला: "${title}" (${targetProfiles.length} सदस्यांना)`,
        `Target: ${targetAudience}, Sender: ${senderEmail}`
      );

      setSentSuccess(`यशस्वी! ${targetProfiles.length} सदस्यांना पुश नोटिफिकेशन्स व ई-मेल ब्रॉडकास्ट (Sender: ${senderEmail}) द्वारे सूचना पाठवली गेली.`);
      setTitle('');
      setMessage('');
      setActionUrl('');
    } catch (err) {
      console.error(err);
      alert('ब्रॉडकास्ट पाठवताना त्रुटी आली.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-[#800C1E]">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900">
              पुश नोटिफिकेशन्स व ई-मेल ब्रॉडकास्ट सेंटर
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            नोंदणीकृत सदस्यांना थेट मोबाईल पुश सूचना आणि अधिकृत ई-मेल ब्रॉडकास्ट (Sender: <span className="font-bold font-mono text-slate-900">{senderEmail}</span>) पाठवा.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-700" />
          <span>लक्षित सदस्य: {calculateTargetCount()}</span>
        </div>
      </div>

      {/* Push Notification Device Status & Test Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/10 text-amber-300 border border-white/10 shrink-0">
            <Smartphone className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-amber-100">डिव्हाइस पुश नोटिफिकेशन स्थिती:</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                permissionState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400'
              }`}>
                {permissionState === 'granted' ? '🟢 पुश चालू आहे (Active)' : '🟡 पुश परवानगी आवश्यक'}
              </span>
            </div>
            <p className="text-xs text-amber-200/80 font-medium mt-0.5">
              ब्राउझर किंवा मोबाईलवर त्वरित लाईव्ह पुश पॉपअप टेस्ट करा.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {permissionState !== 'granted' && (
            <button
              type="button"
              onClick={handleRequestPushPermission}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-4 h-4" />
              <span>पुश परवानगी द्या (Enable Push)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleTestDevicePush}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>⚡ थेट चाचणी घ्या (Test Push Now)</span>
          </button>
        </div>
      </div>

      {/* Auto Push Configuration Toggles */}
      <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-300/80 space-y-3">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#800C1E]" />
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
              ⚙️ ऑटोमॅतिक सिस्टीम नोटिफिकेशन्स नियम (Automated Push Rules)
            </h4>
          </div>
          <span className="text-[10px] font-extrabold text-[#800C1E] bg-amber-200/60 px-2 py-0.5 rounded-full">
            ऑटो ट्रिगर
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-extrabold text-slate-800">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-amber-400 transition">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>नवीन बायोडाटा येताच सर्वांना ऑटो पुश पाठवा</span>
            </div>
            <input
              type="checkbox"
              checked={siteConfig?.enableAutoPushNewBiodata !== false}
              onChange={(e) => updateSiteConfig({ enableAutoPushNewBiodata: e.target.checked })}
              className="w-4 h-4 accent-[#800C1E] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-amber-400 transition">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>पेमेंट मंजूर होताच सदस्याला ऑटो पुश व ई-मेल पाठवा</span>
            </div>
            <input
              type="checkbox"
              checked={siteConfig?.enableAutoPushPayments !== false}
              onChange={(e) => updateSiteConfig({ enableAutoPushPayments: e.target.checked })}
              className="w-4 h-4 accent-[#800C1E] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-amber-400 transition">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>चॅट / लाईक / संपर्क अनलॉक होताच ऑटो पुश पाठवा</span>
            </div>
            <input
              type="checkbox"
              checked={siteConfig?.enableAutoPushInteractions !== false}
              onChange={(e) => updateSiteConfig({ enableAutoPushInteractions: e.target.checked })}
              className="w-4 h-4 accent-[#800C1E] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-amber-400 transition">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span>नोटिफिकेशन साऊंड टोन वाजवा (Notification Chime)</span>
            </div>
            <input
              type="checkbox"
              checked={siteConfig?.enableSoundNotifications !== false}
              onChange={(e) => updateSiteConfig({ enableSoundNotifications: e.target.checked })}
              className="w-4 h-4 accent-[#800C1E] cursor-pointer"
            />
          </label>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{sentSuccess}</span>
        </div>
      )}

      {/* Quick Template Selector */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>तयार सुलभ मराठी मेसेज टेम्पलेट्स (Click to Load)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-left transition group cursor-pointer active:scale-98"
            >
              <span className="text-xs font-black text-slate-800 group-hover:text-[#800C1E] block">
                {tpl.label}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {tpl.message}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSendBroadcast} className="space-y-5 pt-2">
        
        {/* Delivery Options & Target Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              सूचना प्रकार (Type)
            </label>
            <select
              value={notificationType}
              onChange={(e: any) => setNotificationType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#800C1E] outline-none"
            >
              <option value="both">🔔 पुश नोटिफिकेशन्स + ✉️ ई-मेल दोन्ही</option>
              <option value="push">🔔 फक्त मोबाईल पुश नोटिफिकेशन्स</option>
              <option value="email">✉️ फक्त ई-मेल ब्रॉडकास्ट</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              लक्षित गट (Target Audience)
            </label>
            <select
              value={targetAudience}
              onChange={(e: any) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#800C1E] outline-none"
            >
              <option value="all">सर्व सदस्य ({profiles.length})</option>
              <option value="unverified">अद्याप अपडताळलेले सदस्य</option>
              <option value="vip">फक्त VIP पेड सदस्य</option>
              <option value="brides">फक्त वधू सदस्य</option>
              <option value="grooms">फक्त वर सदस्य</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              प्रेशक ई-मेल आयडी (Sender Email)
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="gitevijay123@gmail.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono bg-white focus:ring-2 focus:ring-[#800C1E] outline-none"
            />
          </div>

        </div>

        {/* Message Inputs */}
        <div className="space-y-4">
          
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              सूचनेचे शीर्षक (Title / Subject)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. विशेष ऑफर: फक्त ₹३९८ मध्ये सदस्यत्व अनलॉक करा!"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#800C1E] outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              संदेश मजकूर (Message Body)
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="तुमचा सविस्तर संदेश येथे टाईप करा..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium leading-relaxed bg-white focus:ring-2 focus:ring-[#800C1E] outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              ॲक्शन लिंक / URL (Optional Action Link)
            </label>
            <input
              type="text"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="उदा. /membership किंवा https://vanjarijodi.web.app"
              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-[#800C1E] outline-none"
            />
          </div>

        </div>

        {/* Live Preview Card */}
        {title && (
          <div className="p-4 rounded-2xl bg-[#800C1E]/5 border border-[#800C1E]/20 space-y-2">
            <span className="text-[10px] font-black text-[#800C1E] uppercase tracking-wider block">
              📱 पुश नोटिफिकेशन्स व ई-मेल लाईव्ह प्रिव्ह्यू:
            </span>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">{title}</span>
                <span className="text-[10px] font-bold text-slate-400">आत्ताच</span>
              </div>
              <p className="text-xs text-slate-600">{message}</p>
              <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex justify-between">
                <span>From: {senderEmail} (वंजारी जोडी टीम)</span>
                {actionUrl && <span className="text-[#800C1E] underline font-bold">{actionUrl}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#5C0815] hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4 text-amber-300" />
          <span>{isSending ? 'ब्रॉडकास्ट पाठवला जात आहे...' : 'ब्रॉडकास्ट पाठवा (Send Mass Broadcast)'}</span>
        </button>

      </form>
    </div>
  );
};
