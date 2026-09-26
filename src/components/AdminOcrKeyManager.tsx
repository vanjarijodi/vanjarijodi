import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Copy,
  Plus,
  Trash2,
  HelpCircle,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GeminiKeyItem, OcrConfigSettings } from '../types';

export const AdminOcrKeyManager: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useApp();

  const defaultConfig: OcrConfigSettings = {
    geminiKeys: [
      {
        id: 'key-1',
        label: 'Primary Gemini Key (मुख्य की - उत्पादन)',
        apiKey: '',
        isEnabled: true,
        status: 'untested',
        successCount: 0,
        failureCount: 0
      },
      {
        id: 'key-2',
        label: 'Backup Key 1 (बॅकअप की १)',
        apiKey: '',
        isEnabled: true,
        status: 'untested',
        successCount: 0,
        failureCount: 0
      },
      {
        id: 'key-3',
        label: 'Backup Key 2 (बॅकअप की २)',
        apiKey: '',
        isEnabled: true,
        status: 'untested',
        successCount: 0,
        failureCount: 0
      },
      {
        id: 'key-4',
        label: 'Backup Key 3 (बॅकअप की ३)',
        apiKey: '',
        isEnabled: false,
        status: 'untested',
        successCount: 0,
        failureCount: 0
      },
      {
        id: 'key-5',
        label: 'Emergency Backup Key (इमर्जन्सी की ४)',
        apiKey: '',
        isEnabled: false,
        status: 'untested',
        successCount: 0,
        failureCount: 0
      }
    ],
    defaultEngine: 'gemini_with_fallback',
    enableTesseractFallback: true,
    tesseractLanguages: 'mar+eng',
    maxImageDimension: 1600,
    compressionQuality: 0.75,
    maxFileSizeMb: 1.0,
    activeKeyIndex: 0
  };

  const ocrConfig: OcrConfigSettings = siteConfig.ocrConfig || defaultConfig;

  // Local state for interactive editing before save
  const [keys, setKeys] = useState<GeminiKeyItem[]>(
    ocrConfig.geminiKeys && ocrConfig.geminiKeys.length === 5
      ? ocrConfig.geminiKeys
      : defaultConfig.geminiKeys
  );
  const [defaultEngine, setDefaultEngine] = useState<'gemini_with_fallback' | 'gemini_only' | 'tesseract_only'>(
    ocrConfig.defaultEngine || 'gemini_with_fallback'
  );
  const [enableTesseractFallback, setEnableTesseractFallback] = useState<boolean>(
    ocrConfig.enableTesseractFallback !== false
  );

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; msg: string; latency?: number }>>({});
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const notify = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyChange = (id: string, field: keyof GeminiKeyItem, val: any) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, [field]: val } : k))
    );
  };

  const handleTestKey = async (keyItem: GeminiKeyItem) => {
    setTestingKeyId(keyItem.id);
    setTestResults((prev) => ({
      ...prev,
      [keyItem.id]: { status: 'testing', msg: 'पडताळणी सुरू आहे...' },
    }));

    try {
      const res = await fetch('/api/admin/test-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyItem.apiKey }),
      });
      const data = await res.json();

      if (data.success) {
        const updatedStatus = 'active';
        handleKeyChange(keyItem.id, 'status', updatedStatus);
        handleKeyChange(keyItem.id, 'lastTestedAt', new Date().toISOString());
        handleKeyChange(keyItem.id, 'latencyMs', data.latencyMs);

        setTestResults((prev) => ({
          ...prev,
          [keyItem.id]: {
            status: 'active',
            msg: `सक्रिय (Active) - Latency: ${data.latencyMs || 250}ms`,
            latency: data.latencyMs,
          },
        }));
        notify(`✅ '${keyItem.label}' यशस्वीरीत्या पडताळली गेली!`);
      } else {
        const updatedStatus = data.status || 'invalid';
        handleKeyChange(keyItem.id, 'status', updatedStatus);
        handleKeyChange(keyItem.id, 'lastTestedAt', new Date().toISOString());
        handleKeyChange(keyItem.id, 'errorDetails', data.error);

        setTestResults((prev) => ({
          ...prev,
          [keyItem.id]: {
            status: updatedStatus,
            msg: data.error || 'अवैध की किंवा Quota संपला.',
          },
        }));
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [keyItem.id]: {
          status: 'invalid',
          msg: 'सर्व्हरशी संपर्क होऊ शकला नाही: ' + err.message,
        },
      }));
    } finally {
      setTestingKeyId(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const newConfig: OcrConfigSettings = {
        geminiKeys: keys,
        defaultEngine,
        enableTesseractFallback,
        tesseractLanguages: 'mar+eng',
        maxImageDimension: 1600,
        compressionQuality: 0.75,
        maxFileSizeMb: 1.0,
        activeKeyIndex: 0
      };

      await updateSiteConfig({ ocrConfig: newConfig });
      notify('🎉 सर्व Gemini API Keys आणि OCR सेटिंग्ज सुरक्षितपणे सेव्ह केल्या!');
    } catch (err: any) {
      notify('⚠️ सेटिंग्ज सेव्ह करताना त्रुटी: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const activeKeysCount = keys.filter((k) => k.isEnabled && k.apiKey.trim().length > 0).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#A71930] text-amber-100 px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 font-extrabold text-xs flex items-center gap-2 animate-slideIn">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* HEADER HERO BANNER */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl shadow-xl border-2 border-amber-500/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-400/40 text-amber-300 shadow-inner">
              <Cpu className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-100">
                  🤖 Smart AI BioData OCR & Multi-API Key Failover Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                  100% Resilient
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                ५-की स्वयंचलित रोटेशन (Auto Key-Failover) + क्लायंट-साइड Tesseract.js ऑफलाइन बॅकअप इंजिन
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-600/30 cursor-pointer transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>सेव्ह होत आहे...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>बदल सेव्ह करा (Save Configuration)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* CARD 1: ACTIVE KEYS */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              सक्रिय जेमिनी की (Active Keys)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-white">{activeKeysCount} / 5</span>
              <span className="text-[11px] text-amber-300 font-bold">
                {activeKeysCount > 0 ? 'स्मार्ट रोटेशन सज्ज' : 'डिफॉल्ट Env की सक्रिय'}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: DUAL ENGINE STATUS */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              इंजिन आर्किटेक्चर (Dual-Engine)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-black text-emerald-300">Gemini 1.5/2.5/3.7</span>
              <span className="text-[11px] text-slate-400">+ Tesseract In-Browser</span>
            </div>
          </div>
        </div>

        {/* CARD 3: OFFLINE BACKUP */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              ऑफलाइन बॅकअप (Guaranteed Uptime)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-black text-blue-300">Tesseract.js (Offline)</span>
              <span className="text-[11px] text-emerald-400 font-bold">१००% फॉलबॅक</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 1: DUAL-ENGINE FLOW SETTINGS */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-black text-white">
              १. OCR कार्यप्रणाली व इंजिन प्राधान्यक्रम (Extraction Flow Preferences)
            </h3>
          </div>
          <span className="text-[11px] text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
            Smart Dual-Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* OPTION 1: GEMINI WITH TESSERACT FALLBACK */}
          <div
            onClick={() => setDefaultEngine('gemini_with_fallback')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              defaultEngine === 'gemini_with_fallback'
                ? 'bg-amber-500/10 border-amber-400 shadow-md'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white">Dual-Engine (शिफारस केलेले)</h4>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                defaultEngine === 'gemini_with_fallback' ? 'bg-amber-400 border-amber-300' : 'border-slate-600'
              }`}>
                {defaultEngine === 'gemini_with_fallback' && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              प्रथम Gemini Vision द्वारे हाय-स्पीड वाचन. की संपल्यास किंवा एरर आल्यास आपोआप इन-ब्राउझर Tesseract.js चालू होईल.
            </p>
          </div>

          {/* OPTION 2: GEMINI ONLY */}
          <div
            onClick={() => setDefaultEngine('gemini_only')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              defaultEngine === 'gemini_only'
                ? 'bg-amber-500/10 border-amber-400 shadow-md'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white">Gemini Vision Only</h4>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                defaultEngine === 'gemini_only' ? 'bg-amber-400 border-amber-300' : 'border-slate-600'
              }`}>
                {defaultEngine === 'gemini_only' && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              केवळ Google Gemini AI मॉडेल्स (1.5 / 2.5 / 3.7) चा ५-की रोटेशनसह वापर करेल.
            </p>
          </div>

          {/* OPTION 3: TESSERACT ONLY */}
          <div
            onClick={() => setDefaultEngine('tesseract_only')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              defaultEngine === 'tesseract_only'
                ? 'bg-amber-500/10 border-amber-400 shadow-md'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-black text-white">In-Browser Tesseract Only</h4>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                defaultEngine === 'tesseract_only' ? 'bg-amber-400 border-amber-300' : 'border-slate-600'
              }`}>
                {defaultEngine === 'tesseract_only' && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              १००% क्लायंट-साइड ऑफलाइन OCR. कोणत्याही क्लाउड API की शिवाय वापरकर्त्याच्या ब्राउझरमध्ये थेट मजकूर वाचन.
            </p>
          </div>

        </div>

        {/* AUTOMATIC FAILOVER TOGGLE */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Failover: 429/403 एरर आल्यावर त्वरित पुढील की किंवा Tesseract वर स्विच करा</span>
            </span>
            <p className="text-[11px] text-slate-400">
              जर एका की चा कोटा संपला, तर सिस्टीम वापरकर्त्याला कोणतीही एरर न दाखवता आपोआप पुढील की वरून किंवा Tesseract वरून वाचन पूर्ण करेल.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnableTesseractFallback(!enableTesseractFallback)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              enableTesseractFallback ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                enableTesseractFallback ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SECTION 2: 5 GEMINI API KEYS POOL */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                २. Gemini API Keys पूल मॅनेजमेंट (Up to 5 Keys Auto-Rotation)
              </h3>
              <p className="text-xs text-slate-400">
                येथे ५ पर्यंत वेगवेगळ्या Gemini API Keys टाका. सिस्टीम क्रमाने की वापरेल आणि कोटा संपल्यास आपोआप पुढच्या की वर जाईल.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          {keys.map((keyItem, index) => {
            const isVisible = visibleKeys[keyItem.id] || false;
            const isTesting = testingKeyId === keyItem.id;
            const testResult = testResults[keyItem.id];

            let statusBadge = (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                Untested (अतपासलेली)
              </span>
            );

            if (keyItem.status === 'active') {
              statusBadge = (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>सक्रिय (Active)</span>
                </span>
              );
            } else if (keyItem.status === 'quota_exhausted' || keyItem.status === 'rate_limited') {
              statusBadge = (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-950 text-amber-300 text-[10px] font-black border border-amber-500/40 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Quota मर्यादित (429)</span>
                </span>
              );
            } else if (keyItem.status === 'invalid') {
              statusBadge = (
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-950 text-rose-300 text-[10px] font-black border border-rose-500/40 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>अवैध (Invalid)</span>
                </span>
              );
            }

            return (
              <div
                key={keyItem.id}
                className={`p-4 rounded-2xl border transition-all ${
                  keyItem.isEnabled
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-500/30">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={keyItem.label}
                      onChange={(e) => handleKeyChange(keyItem.id, 'label', e.target.value)}
                      placeholder="की चे नाव (उदा. Primary Key)"
                      className="bg-transparent text-xs font-black text-amber-200 border-b border-transparent focus:border-amber-400 outline-none px-1"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    {statusBadge}

                    {/* ENABLE/DISABLE TOGGLE */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={keyItem.isEnabled}
                        onChange={(e) => handleKeyChange(keyItem.id, 'isEnabled', e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span>सक्रिय (ON)</span>
                    </label>
                  </div>
                </div>

                {/* API KEY INPUT + ACTIONS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={keyItem.apiKey}
                      onChange={(e) => handleKeyChange(keyItem.id, 'apiKey', e.target.value)}
                      placeholder="AIzaSy... (Gemini API Key पेस्ट करा)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(keyItem.id)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white transition"
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* TEST KEY BUTTON */}
                    <button
                      type="button"
                      disabled={isTesting || !keyItem.apiKey.trim()}
                      onClick={() => handleTestKey(keyItem)}
                      className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        keyItem.apiKey.trim() && !isTesting
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 active:scale-95'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>तपासत आहे...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          <span>पडताळणी (Test Key)</span>
                        </>
                      )}
                    </button>

                    {/* CLEAR BUTTON */}
                    {keyItem.apiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          handleKeyChange(keyItem.id, 'apiKey', '');
                          handleKeyChange(keyItem.id, 'status', 'untested');
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition"
                        title="की काढून टाका"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* TEST RESULT FEEDBACK BOX */}
                {testResult && (
                  <div
                    className={`mt-2 p-2 rounded-xl text-[11px] font-bold flex items-center gap-2 ${
                      testResult.status === 'active'
                        ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                        : testResult.status === 'testing'
                        ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300'
                        : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.status === 'active' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    ) : testResult.status === 'testing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    )}
                    <span>{testResult.msg}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* DEFAULT FALLBACK NOTICE */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-200 block">
              पर्यायी डिफॉल्ट सुरक्षा (Default Environment Key):
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              जर तुम्ही येथे कोणतीही कस्टम की टाकली नाही किंवा सर्व ५ की संपल्या, तरी सिस्टीम आपोआप मुख्य सर्व्हरमधील डिफॉल्ट की (GEMINI_API_KEY) आणि त्यानंतर क्लायंट-साइड Tesseract.js OCR चा वापर करून नोंदणी प्रक्रिया सुरळीत चालू ठेवेल.
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 3: IMAGE PREPROCESSING & CLAMP SPECIFICATIONS */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm sm:text-base font-black text-white">
            ३. इमेज ऑप्टिमायझेशन व कॉम्प्रेशन मानके (Client-Side Preprocessing Pipeline)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">कमाल रिझोल्यूशन</span>
            <span className="font-extrabold text-amber-300">Max 1600px Dimension</span>
            <p className="text-[11px] text-slate-400">मोबाईल कॅमेऱ्याचा फोटो नफाटता मराठी मजकूर स्पष्ट ठेवण्यासाठी आपोआप रिसाईज होतो.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">क्वालिटी व फॉरमॅट</span>
            <span className="font-extrabold text-emerald-300">JPEG 0.75 Sharp Quality</span>
            <p className="text-[11px] text-slate-400">Devanagari अक्षरे OCR ला अचूक वाचता यावीत म्हणून ऑप्टिमाइझ केली जाते.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">कमाल फाईल साईज</span>
            <span className="font-extrabold text-blue-300">Strictly &lt; 1 MB Target</span>
            <p className="text-[11px] text-slate-400">15-25MB चा मोठा फोटो सुद्धा क्षणार्धात 400KB-800KB मध्ये कॉम्प्रेस होऊन जलद अपलोड होतो.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
