import React, { useState, useEffect } from 'react';
import {
  Phone,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Radio,
  Loader2,
  Sparkles,
  Info,
  Clock,
  Calendar,
  Volume2,
  Bell,
  Copy,
  Check,
  Coffee,
  Crown,
  History,
  Trash2,
  MessageSquare,
  RefreshCw,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import { playCallAudioTone } from '../services/agoraClient';
import { triggerDeviceVibration, requestPushPermission } from '../utils/pushNotificationHelper';

export const DEFAULT_AGORA_APP_ID = '0264722151804051ad63ea12fd164935';

const DAYS_OF_WEEK = [
  { id: 0, label: 'रवि', fullLabel: 'रविवार' },
  { id: 1, label: 'सोम', fullLabel: 'सोमवार' },
  { id: 2, label: 'मंगळ', fullLabel: 'मंगळवार' },
  { id: 3, label: 'बुध', fullLabel: 'बुधवार' },
  { id: 4, label: 'गुरु', fullLabel: 'गुरुवार' },
  { id: 5, label: 'शुक्र', fullLabel: 'शुक्रवार' },
  { id: 6, label: 'शनि', fullLabel: 'शनिवार' },
];

export const AdminAgoraSettings: React.FC = () => {
  // Master Switch & Credentials
  const [enabled, setEnabled] = useState<boolean>(true);
  const [appId, setAppId] = useState<string>(DEFAULT_AGORA_APP_ID);
  const [appCertificate, setAppCertificate] = useState<string>('');
  const [hasCertificate, setHasCertificate] = useState<boolean>(false);
  const [adminDisplayName, setAdminDisplayName] = useState<string>('वंजारी जोडी ॲडमिन सपोर्ट');
  const [allowRegisteredOnly, setAllowRegisteredOnly] = useState<boolean>(true);

  // ⏰ Operating Hours & Schedule (वेळ मर्यादा)
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(true);
  const [scheduleStartTime, setScheduleStartTime] = useState<string>('10:00');
  const [scheduleEndTime, setScheduleEndTime] = useState<string>('20:00');
  const [scheduleDays, setScheduleDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [offHoursMessage, setOffHoursMessage] = useState<string>(
    'सध्या कॉलिंग वेळ संपली आहे. ऑडिओ कॉलिंग वेळ दररोज सकाळी १०:०० ते संध्याकाळी ०८:०० दरम्यान सुरू असते. कृपया वेळेत संपर्क साधा किंवा थेट व्हॉट्सॲप मेसेज पाठवा.'
  );

  // ⚡ Admin Presence & Advanced Settings
  const [adminStatus, setAdminStatus] = useState<'online' | 'busy' | 'offline'>('online');
  const [dndMinutes, setDndMinutes] = useState<number>(0);
  const [allowOnlyVerified, setAllowOnlyVerified] = useState<boolean>(false);
  const [allowOnlyPaid, setAllowOnlyPaid] = useState<boolean>(false);
  const [maxCallsPerDayPerUser, setMaxCallsPerDayPerUser] = useState<number>(5);

  // Call Logs & History
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [unreadMissedCount, setUnreadMissedCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'schedule' | 'advanced' | 'history'>('schedule');

  // UI States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSimulatingCall, setIsSimulatingCall] = useState<boolean>(false);
  const [copiedAppId, setCopiedAppId] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch current config & call logs on mount
  useEffect(() => {
    fetchConfig();
    fetchCallLogs();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/agora/config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          const cfg = data.config;
          setEnabled(cfg.enabled !== false);
          setAppId(cfg.appId || DEFAULT_AGORA_APP_ID);
          setHasCertificate(Boolean(cfg.hasAppCertificate));
          setAdminDisplayName(cfg.adminDisplayName || 'वंजारी जोडी ॲडमिन सपोर्ट');
          setAllowRegisteredOnly(cfg.allowRegisteredOnly !== false);

          // Schedule values
          setScheduleEnabled(cfg.scheduleEnabled !== false);
          setScheduleStartTime(cfg.scheduleStartTime || '10:00');
          setScheduleEndTime(cfg.scheduleEndTime || '20:00');
          if (Array.isArray(cfg.scheduleDays) && cfg.scheduleDays.length > 0) {
            setScheduleDays(cfg.scheduleDays);
          }
          if (cfg.offHoursMessage) {
            setOffHoursMessage(cfg.offHoursMessage);
          }

          // Admin status & controls
          setAdminStatus(cfg.adminStatus || 'online');
          setAllowOnlyVerified(Boolean(cfg.allowOnlyVerified));
          setAllowOnlyPaid(Boolean(cfg.allowOnlyPaid));
          setMaxCallsPerDayPerUser(cfg.maxCallsPerDayPerUser || 5);
        }
      }
    } catch (e) {
      console.warn('Error fetching Agora config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCallLogs = async () => {
    try {
      const res = await fetch('/api/admin/agora/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCallLogs(data.logs || []);
          setUnreadMissedCount(data.unreadCount || 0);
        }
      }
    } catch (e) {}
  };

  // Quick Status or Toggle API
  const handleQuickToggleStatus = async (newStatus: 'online' | 'busy' | 'offline') => {
    try {
      setAdminStatus(newStatus);
      const res = await fetch('/api/admin/agora/quick-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminStatus: newStatus }),
      });
      if (res.ok) {
        setToast({
          type: 'success',
          message: `स्थिती अपडेट झाली: ${
            newStatus === 'online' ? '🟢 ऑनलाइन' : newStatus === 'busy' ? '🟡 व्यग्र' : '🔴 ऑफलाइन'
          }`,
        });
      }
    } catch (e) {}
  };

  const handleQuickToggleEnabled = async (newState: boolean) => {
    try {
      setEnabled(newState);
      if (newState) {
        setAdminStatus('online');
      }
      const res = await fetch('/api/admin/agora/quick-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState, adminStatus: newState ? 'online' : undefined }),
      });
      if (res.ok) {
        setToast({
          type: 'success',
          message: newState
            ? '✅ ऑडिओ कॉलिंग सिस्टीम चालू झाली (🟢 ऑनलाइन, कॉल वेटिंग सक्रिय)!'
            : '⏸️ ऑडिओ कॉलिंग सिस्टीम तात्पुरती बंद केली.',
        });
      }
    } catch (e) {}
  };

  // Quick DND Break
  const handleSetDndBreak = async (minutes: number) => {
    try {
      setDndMinutes(minutes);
      const res = await fetch('/api/admin/agora/quick-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dndMinutes: minutes }),
      });
      if (res.ok) {
        setToast({
          type: 'success',
          message: minutes > 0 ? `⏸️ DND मोड सक्रिय: ${minutes} मिनिटे ब्रेक` : '🟢 DND मोड समाप्त - ऑनलाइन!',
        });
        if (minutes === 0) setAdminStatus('online');
      }
    } catch (e) {}
  };

  // Full Save Form
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setToast(null);

    try {
      const res = await fetch('/api/admin/agora/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          appId: appId.trim() || DEFAULT_AGORA_APP_ID,
          appCertificate: appCertificate.trim() || undefined,
          adminDisplayName: adminDisplayName.trim(),
          allowRegisteredOnly,
          scheduleEnabled,
          scheduleStartTime,
          scheduleEndTime,
          scheduleDays,
          offHoursMessage: offHoursMessage.trim(),
          adminStatus,
          allowOnlyVerified,
          allowOnlyPaid,
          maxCallsPerDayPerUser,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ type: 'success', message: '✅ सर्व Agora कॉलिंग व वेळ सेटिंग्ज सेव्ह झाल्या!' });
        setAppCertificate('');
        setHasCertificate(Boolean(data.config?.hasAppCertificate || appCertificate.trim()));
      } else {
        setToast({ type: 'error', message: data.error || 'सेव्ह करताना त्रुटी आली.' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'सर्व्हरशी संपर्क होऊ शकला नाही.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Simulate Incoming Test Call
  const handleSimulateTestCall = async () => {
    setIsSimulatingCall(true);
    try {
      const res = await fetch('/api/agora/call/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: 'सचिन वंजारी (चाचणी कॉल)',
          callerMobile: '9822001122',
          callerDistrict: 'पुणे',
        }),
      });
      if (res.ok) {
        playCallAudioTone('incoming');
        triggerDeviceVibration([400, 200, 400]);
        setToast({
          type: 'success',
          message: '📞 इनकमिंग चाचणी कॉल ट्रिगर झाला! वरील नोटिफिकेशन आणि रिंगटोन तपासा.',
        });
        fetchCallLogs();
      }
    } catch (e) {
      setToast({ type: 'error', message: 'चाचणी कॉल जोडता आला नाही.' });
    } finally {
      setIsSimulatingCall(false);
    }
  };

  // Simulate Waiting Test Call (दुसरा कॉल वेटिंगवर येण्याची चाचणी)
  const handleSimulateWaitingCall = async () => {
    setIsSimulatingCall(true);
    try {
      const res = await fetch('/api/agora/call/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: 'गणेश वंजारी (वेटिंग चाचणी)',
          callerMobile: '9850112233',
          callerDistrict: 'नाशिक',
          simulateWaiting: true,
        }),
      });
      if (res.ok) {
        playCallAudioTone('waiting');
        triggerDeviceVibration([300, 100, 300]);
        setToast({
          type: 'success',
          message: '⏳ चाचणी: दुसरा कॉल वेटिंगवर ट्रिगर झाला! (कॉल वेटिंग सूचना तपासा).',
        });
        fetchCallLogs();
      }
    } catch (e) {
      setToast({ type: 'error', message: 'वेटिंग कॉल जोडता आला नाही.' });
    } finally {
      setIsSimulatingCall(false);
    }
  };

  // Toggle Day selection
  const toggleDay = (dayId: number) => {
    if (scheduleDays.includes(dayId)) {
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter((d) => d !== dayId));
      }
    } else {
      setScheduleDays([...scheduleDays, dayId].sort());
    }
  };

  // Preset Schedules
  const applyPresetSchedule = (start: string, end: string, label: string) => {
    setScheduleStartTime(start);
    setScheduleEndTime(end);
    setScheduleEnabled(true);
    setToast({ type: 'success', message: `वेळापत्रक निवडले: ${label} (${start} ते ${end})` });
  };

  // Copy App ID
  const handleCopyAppId = () => {
    navigator.clipboard.writeText(appId || DEFAULT_AGORA_APP_ID);
    setCopiedAppId(true);
    setTimeout(() => setCopiedAppId(false), 2000);
  };

  // Delete Call Log
  const handleDeleteLog = async (callId: string) => {
    try {
      const res = await fetch(`/api/admin/agora/logs/${callId}`, { method: 'DELETE' });
      if (res.ok) {
        setCallLogs((prev) => prev.filter((c) => c.callId !== callId));
      }
    } catch (e) {}
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/admin/agora/logs/mark-read', { method: 'POST' });
      setUnreadMissedCount(0);
      setCallLogs((prev) => prev.map((c) => ({ ...c, isRead: true })));
    } catch (e) {}
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-[#800C1E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Agora Voice RTC कॉलिंग नियंत्रण केंद्र</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-white mt-1 flex items-center gap-2">
            <span>ऑडिओ कॉलिंग व वेळापत्रक व्यवस्थापन</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30 font-sans font-bold">
              HD Voice
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            सदस्यांसाठी कॉलिंग चालू/बंद करा, दैनंदिन वेळ मर्यादा सेट करा आणि कॉल लॉग्स पहा
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSimulateTestCall}
            disabled={isSimulatingCall}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md active:scale-95 transition cursor-pointer"
            title="स्वतःच्या मोबाईल/स्क्रीनवर इनकमिंग कॉलची चाचणी घ्या"
          >
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span>{isSimulatingCall ? 'रिंग होत आहे...' : '📞 टेस्ट कॉल'}</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateWaitingCall}
            disabled={isSimulatingCall}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md active:scale-95 transition cursor-pointer"
            title="कॉल वेटिंगची चाचणी घ्या (दुसरा कॉल येणे)"
          >
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>⏳ टेस्ट वेटिंग कॉल</span>
          </button>

          <a
            href="https://console.agora.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold border border-amber-300/30 transition self-start sm:self-auto cursor-pointer"
          >
            <span>Agora Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`mx-5 mt-4 p-4 rounded-2xl text-xs font-bold flex items-center justify-between space-x-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Quick Action Bar: Master Toggle + Admin Presence */}
      <div className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A. Master Calling On/Off Toggle */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  enabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <h4 className="text-sm font-black text-slate-800">
                कॉलिंग सिस्टीम: {enabled ? 'चालू (ON)' : 'बंद (OFF)'}
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              {enabled
                ? 'सदस्यांना ॲपमध्ये "कॉल करा" बटण दिसत आहे व कॉल सुरू आहेत'
                : 'कॉलिंग तात्पुरते बंद आहे. युझर्सना सेवा बंद असल्याचा संदेश दिसेल'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleQuickToggleEnabled(!enabled)}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              enabled
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {enabled ? (
              <>
                <span>कॉलिंग बंद करा</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>कॉलिंग चालू करा</span>
              </>
            )}
          </button>
        </div>

        {/* B. Admin Live Presence / Status */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">⚡ थेट ॲडमिन स्थिती (Live Status):</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {adminStatus === 'online' ? '🟢 Online' : adminStatus === 'busy' ? '🟡 Busy' : '🔴 Offline'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickToggleStatus('online')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                adminStatus === 'online'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🟢 ऑनलाइन</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickToggleStatus('busy')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                adminStatus === 'busy'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🟡 व्यग्र</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickToggleStatus('offline')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                adminStatus === 'offline'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🔴 ऑफलाइन</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="px-5 border-b border-slate-200 bg-white flex space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`py-3 px-3 text-xs sm:text-sm font-black border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'border-[#800C1E] text-[#800C1E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>⏰ वेळ मर्यादा व वेळापत्रक (Schedule)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`py-3 px-3 text-xs sm:text-sm font-black border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'advanced'
              ? 'border-[#800C1E] text-[#800C1E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>🔑 App ID व प्रगत सुरक्षा (Security)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            fetchCallLogs();
          }}
          className={`py-3 px-3 text-xs sm:text-sm font-black border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-[#800C1E] text-[#800C1E]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>📞 कॉल इतिहास ({callLogs.length})</span>
          {unreadMissedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black">
              {unreadMissedCount} नवीन
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab Contents */}
      <div className="p-5 sm:p-6">
        {/* ============================================================== */}
        {/* TAB 1: OPERATING HOURS & SCHEDULE */}
        {/* ============================================================== */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Schedule Master Toggle */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>दैनिक वेळ मर्यादा सक्रिय ठेवा (Enable Calling Hours)</span>
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  ठराविक वेळेतच (उदा. सकाळी १० ते रात्री ८) सदस्यांना कॉल करण्याची अनुमती द्या. वेळ संपल्यावर युझरला माहिती दिली जाईल.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800C1E]"></div>
              </label>
            </div>

            {/* Quick 1-Click Time Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                ⚡ जलद वेळ निवड (Quick Time Presets - एका क्लिकवर सेट करा):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPresetSchedule('10:00', '20:00', 'सकाळी १० ते रात्री ८')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#800C1E] bg-slate-50 hover:bg-amber-50/50 text-left transition cursor-pointer"
                >
                  <p className="text-xs font-black text-slate-800">१०:०० AM - ०८:०० PM</p>
                  <p className="text-[10px] text-slate-500">सकाळी १० ते रात्री ८ (Recommended)</p>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetSchedule('09:00', '21:00', 'सकाळी ९ ते रात्री ९')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#800C1E] bg-slate-50 hover:bg-amber-50/50 text-left transition cursor-pointer"
                >
                  <p className="text-xs font-black text-slate-800">०९:०० AM - ०९:०० PM</p>
                  <p className="text-[10px] text-slate-500">सकाळी ९ ते रात्री ९ (Full Day)</p>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetSchedule('10:00', '18:00', 'कार्यालयीन वेळ १० ते ६')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#800C1E] bg-slate-50 hover:bg-amber-50/50 text-left transition cursor-pointer"
                >
                  <p className="text-xs font-black text-slate-800">१०:०० AM - ०६:०० PM</p>
                  <p className="text-[10px] text-slate-500">कार्यालयीन वेळ (Office Hours)</p>
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetSchedule('00:00', '23:59', '२४x७ सदैव सुरू')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 text-left transition cursor-pointer"
                >
                  <p className="text-xs font-black text-emerald-700">२४x७ सदैव सुरू</p>
                  <p className="text-[10px] text-slate-500">कोणतीही वेळ मर्यादा नाही</p>
                </button>
              </div>
            </div>

            {/* Start & End Time Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center space-x-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>कॉलिंग सुरू वेळ (Start Time)</span>
                </label>
                <input
                  type="time"
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold bg-white focus:border-[#800C1E] focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  उदा. 10:00 AM (सकाळी १० वाजता)
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center space-x-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>कॉलिंग समाप्ती वेळ (End Time)</span>
                </label>
                <input
                  type="time"
                  value={scheduleEndTime}
                  onChange={(e) => setScheduleEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm font-bold bg-white focus:border-[#800C1E] focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  उदा. 20:00 PM (संध्याकाळी ८ वाजता)
                </span>
              </div>
            </div>

            {/* Active Days of Week */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span>आठवड्यातील कॉलिंग दिवस (Active Days):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setScheduleDays([0, 1, 2, 3, 4, 5, 6])}
                  className="text-[11px] text-[#800C1E] hover:underline font-bold cursor-pointer"
                >
                  सर्व दिवस निवडा
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = scheduleDays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDay(d.id)}
                      className={`py-3 px-1 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#800C1E] text-white shadow-sm ring-2 ring-[#800C1E]/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="truncate">{d.label}</div>
                      <div className="text-[9px] opacity-80">{isSelected ? '✓' : '✕'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Off Hours Message */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                वेळ संपल्यावर युझर्सना दाखवायचा संदेश (Off-Hours Notice in Marathi):
              </label>
              <textarea
                rows={3}
                value={offHoursMessage}
                onChange={(e) => setOffHoursMessage(e.target.value)}
                placeholder="वेळ संपल्यावर सदस्यांना हा संदेश दिसेल..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:border-[#800C1E] focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                टीप: वेळ संपल्यानंतर सदस्याने कॉल करण्याचा प्रयत्न केल्यास हा संदेश दाखवला जाईल आणि त्याला थेट व्हॉट्सॲपवर मेसेज करण्याचा पर्याय मिळेल.
              </p>
            </div>

            {/* DND Break Quick Option */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-indigo-700" />
                  <span>तात्पुरता ब्रेक / व्यग्र मोड (DND Pause Timer)</span>
                </h5>
                <p className="text-[11px] text-indigo-800">
                  काही वेळ जेवणासाठी किंवा मिटींगसाठी कॉल्स थांबवायचे असल्यास तात्पुरता ब्रेक निवडा.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetDndBreak(15)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 shadow-sm cursor-pointer"
                >
                  १५ मि. ब्रेक
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDndBreak(30)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 shadow-sm cursor-pointer"
                >
                  ३० मि. ब्रेक
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDndBreak(60)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 shadow-sm cursor-pointer"
                >
                  १ तास ब्रेक
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDndBreak(0)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  ब्रेक संपवा
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: APP ID & ADVANCED SECURITY */}
        {/* ============================================================== */}
        {activeTab === 'advanced' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Agora App ID Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Agora Voice RTC App ID:</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                    ✓ प्रमाणित App ID
                  </span>

                  <button
                    type="button"
                    onClick={() => setAppId(DEFAULT_AGORA_APP_ID)}
                    className="text-[11px] text-[#800C1E] hover:underline font-bold cursor-pointer"
                  >
                    डीफॉल्ट रीसेट करा
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="32-अंकी Agora App ID"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm font-bold bg-white focus:border-[#800C1E] focus:outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={handleCopyAppId}
                  className="p-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
                  title="App ID कॉपी करा"
                >
                  {copiedAppId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                वर्तमान कॉन्फिगर केलेला आयडी: <strong className="font-mono text-slate-700">{DEFAULT_AGORA_APP_ID}</strong>
              </p>
            </div>

            {/* App Certificate Input */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Agora App Certificate (पर्यायी - Security Token साठी)</span>
                </label>
                {hasCertificate && (
                  <span className="text-emerald-700 bg-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    ✓ सेव्ह केलेले आहे
                  </span>
                )}
              </div>
              <input
                type="password"
                value={appCertificate}
                onChange={(e) => setAppCertificate(e.target.value)}
                placeholder={hasCertificate ? 'सुरक्षितरीत्या सेव्ह आहे (बदलायचे असल्यास नवीन टाका)' : 'फक्त Token Security Mode निवडला असल्यास टाका'}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm bg-white focus:border-[#800C1E] focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                टीप: जर Agora वर Testing Mode (App ID only) असेल, तर हे रिकामे ठेवावे.
              </p>
            </div>

            {/* Display Name & Caller Permissions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  ॲडमिन कॉलिंग नाव (Admin Display Name)
                </label>
                <input
                  type="text"
                  value={adminDisplayName}
                  onChange={(e) => setAdminDisplayName(e.target.value)}
                  placeholder="उदा. वंजारी जोडी ॲडमिन सपोर्ट"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-[#800C1E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  दैनिक कॉल मर्यादा प्रति सदस्य (Max Calls / Day)
                </label>
                <select
                  value={maxCallsPerDayPerUser}
                  onChange={(e) => setMaxCallsPerDayPerUser(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-[#800C1E] focus:outline-none bg-white"
                >
                  <option value={3}>कमाल ३ कॉल प्रति दिवस (Spam Control)</option>
                  <option value={5}>कमाल ५ कॉल प्रति दिवस (Recommended)</option>
                  <option value={10}>कमाल १० कॉल प्रति दिवस</option>
                  <option value={999}>अमर्याद (No Limit)</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters: Verified / Paid only */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
              <h5 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>सुरक्षा व पात्रता नियम (Security & Access Filters):</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={allowOnlyVerified}
                    onChange={(e) => setAllowOnlyVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-[#800C1E] border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <span>फक्त आधार प्रमाणित (KYC Verified) सदस्यांना कॉलची अनुमती द्या</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={allowOnlyPaid}
                    onChange={(e) => setAllowOnlyPaid(e.target.checked)}
                    className="w-4 h-4 rounded text-[#800C1E] border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <span>फक्त सशुल्क (Paid / Premium) सदस्यांना कॉलची अनुमती द्या</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CALL LOGS & HISTORY */}
        {/* ============================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>कॉल इतिहास व मिस्ड कॉल लॉग्स (Call Records)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  सदस्यांनी केलेल्या कॉल्सची संपूर्ण यादी, कालावधी आणि वेळ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchCallLogs}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>रिफ्रेश</span>
                </button>

                {unreadMissedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer"
                  >
                    सर्व वाचले म्हणून मार्क करा
                  </button>
                )}
              </div>
            </div>

            {callLogs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Phone className="w-10 h-10 text-slate-400 mx-auto" />
                <h5 className="text-sm font-bold text-slate-700">अद्याप कोणताही कॉल रेकॉर्ड नाही</h5>
                <p className="text-xs text-slate-500">
                  सदस्यांनी कॉल केल्यावर किंवा टेस्ट कॉल केल्यावर इथे संपूर्ण इतिहास दिसेल.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {callLogs.map((log) => {
                  const callDate = new Date(log.initiatedAt);
                  const timeFormatted = callDate.toLocaleTimeString('mr-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateFormatted = callDate.toLocaleDateString('mr-IN', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <div
                      key={log.callId}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        log.status === 'missed'
                          ? 'bg-rose-50/70 border-rose-200'
                          : log.status === 'waiting'
                          ? 'bg-amber-50/90 border-amber-300'
                          : log.status === 'off_hours_blocked'
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                            log.status === 'connected'
                              ? 'bg-emerald-100 text-emerald-700'
                              : log.status === 'waiting'
                              ? 'bg-amber-200 text-amber-800'
                              : log.status === 'missed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Phone className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-black text-slate-900 truncate">
                              {log.callerName}
                            </h5>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                log.status === 'connected'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'waiting'
                                  ? 'bg-amber-200 text-amber-900 border border-amber-400'
                                  : log.status === 'missed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {log.status === 'connected'
                                ? `संभाषण (${Math.floor(log.duration / 60)}:${(log.duration % 60)
                                    .toString()
                                    .padStart(2, '0')})`
                                : log.status === 'waiting'
                                ? '⏳ कॉल वेटिंग'
                                : log.status === 'missed'
                                ? 'मिस्ड कॉल'
                                : 'वेळ संपल्यावर प्रयत्न'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>📞 {log.callerMobile || 'नंबर उपलब्ध नाही'}</span>
                            {log.callerDistrict && <span>• {log.callerDistrict}</span>}
                            <span>• {dateFormatted}, {timeFormatted}</span>
                          </div>

                          {log.adminNotes && (
                            <p className="text-[10px] text-slate-600 italic mt-0.5">
                              {log.adminNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {log.callerMobile && (
                          <a
                            href={`https://wa.me/91${log.callerMobile.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition"
                            title="व्हॉट्सॲपवर संपर्क करा"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.callId)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="हटवा"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. Save Button Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              वेळ व कॉलिंग सेटिंग्ज त्वरित संपूर्ण ॲपमध्ये आणि सर्व सदस्यांच्या मोबाईलवर लागू होतात.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-[#800C1E] hover:bg-[#680918] disabled:opacity-50 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition cursor-pointer active:scale-98"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>सेव्ह होत आहे...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-300" />
                <span>सेटिंग्ज सेव्ह करा (Save Agora Settings)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
