import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  downloadApkFile,
  downloadAabFile,
  downloadKeystoreFile,
  downloadKeystoreInfo
} from '../utils/apkDownloader';
import {
  Smartphone,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  Key,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Package,
  Layers,
  ShieldCheck,
  ExternalLink,
  Share2,
  Info,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface AndroidReleaseInfo {
  success: boolean;
  packageId: string;
  appName: string;
  versionName: string;
  versionCode: number;
  keyAlias: string;
  storePassword: string;
  keyPassword: string;
  sha1: string;
  sha256: string;
  apk: {
    exists: boolean;
    fileName: string;
    url: string;
    sizeMb?: string;
    updatedAt?: string;
  };
  aab: {
    exists: boolean;
    fileName: string;
    url: string;
    sizeMb?: string;
    updatedAt?: string;
  };
  keystore: {
    exists: boolean;
    fileName: string;
    url: string;
    sizeKb?: string;
    updatedAt?: string;
  };
  keyInfoTxt: {
    exists: boolean;
    fileName: string;
    url: string;
  };
}

export const AdminApkFileManager: React.FC = () => {
  const { siteConfig, updateSiteConfig, incrementApkDownloadCount } = useApp();

  const apk = siteConfig?.apkSettings || {
    apkUrl: '/downloads/VanjariJodi.apk',
    appVersion: 'v2.5.0',
    isEnabled: true,
    releaseNotes: 'नवीन अपडेट: Android 14/15 सुसंगतता, वेगवान सिस्टीम व सुधारित Material 3 UI.',
    downloadCount: 15420,
    fileSizeMb: '0.92 MB'
  };

  const [activeTab, setActiveTab] = useState<'all' | 'aab' | 'apk' | 'keystore' | 'assets' | 'settings'>('all');
  const [releaseInfo, setReleaseInfo] = useState<AndroidReleaseInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    apkUrl: apk.apkUrl || '/downloads/VanjariJodi.apk',
    appVersion: apk.appVersion || 'v2.5.0',
    isEnabled: apk.isEnabled !== false,
    releaseNotes: apk.releaseNotes || 'नवीन अपडेट: Android 14/15 सुसंगतता, वेगवान सिस्टीम व सुधारित Material 3 UI.',
    downloadCount: apk.downloadCount || 15420,
    fileSizeMb: apk.fileSizeMb || '0.92 MB'
  });

  // Fetch Release Info from Backend
  const fetchReleaseStatus = async () => {
    setIsLoadingInfo(true);
    try {
      const res = await fetch('/api/android/release-info');
      if (res.ok) {
        const data = await res.json();
        setReleaseInfo(data);
      }
    } catch (err) {
      console.warn('Failed to load android release info:', err);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchReleaseStatus();
  }, []);

  // Regenerate All Assets (AAB, APK, Keystore)
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setErrorMsg(null);
    setSaveSuccess(null);
    try {
      const res = await fetch('/api/android/regenerate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess('✅ AAB फाईल, APK फाईल आणि Key (Keystore) यशस्वीरित्या तयार झाले आहेत!');
        await fetchReleaseStatus();
        setTimeout(() => setSaveSuccess(null), 5000);
      } else {
        throw new Error(data.error || 'जनरेट करताना त्रुटी आली.');
      }
    } catch (err: any) {
      setErrorMsg(`⚠️ त्रुटी: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Universal File Upload Handler (AAB, APK, Keystore)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSaveSuccess(null);

    try {
      const fileSizeInMb = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        try {
          const res = await fetch('/api/apk/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              base64Data,
              version: form.appVersion
            })
          });
          const data = await res.json();
          if (data.success) {
            setSaveSuccess(`✅ फाईल "${file.name}" (${fileSizeInMb}) यशस्वीरित्या सर्व्हरवर सेव्ह झाली!`);
            if (file.name.endsWith('.apk')) {
              setForm(prev => ({ ...prev, apkUrl: data.url, fileSizeMb: fileSizeInMb }));
              updateSiteConfig({ apkSettings: { ...form, apkUrl: data.url, fileSizeMb: fileSizeInMb } });
            }
            await fetchReleaseStatus();
          } else {
            throw new Error(data.error || 'सर्व्हर अपलोड अयशस्वी');
          }
        } catch (uploadErr: any) {
          setErrorMsg(`⚠️ अपलोड त्रुटी: ${uploadErr.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(`⚠️ त्रुटी: ${err.message}`);
      setIsUploading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig({
      apkSettings: {
        ...form
      }
    });
    setSaveSuccess('अँड्रॉइड ॲप कॉन्फिगरेशन यशस्वीरित्या सेव्ह झाले!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const sha1 = releaseInfo?.sha1 || 'EB:10:60:5D:86:A9:FB:00:CD:E9:28:94:09:14:5C:EE:A6:85:A1:72';
  const sha256 = releaseInfo?.sha256 || '3B:B5:73:3A:98:8B:F1:3B:D6:9D:77:92:28:BD:D7:61:C2:D3:3E:7C:1C:79:F3:1A:14:10:4A:1B:E7:CB:8A:48';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-md">
              <Package className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>अँड्रॉइड रिलीज, AAB, APK व Key व्यवस्थापन</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Play Store Ready
                </span>
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Google Play Store साठी <strong>AAB Bundle</strong>, थेट मोबाईल इन्स्टॉलेशनसाठी <strong>APK</strong>, आणि ॲप सायनिंगसाठी <strong>Key (Keystore)</strong> सर्व एकाच ठिकाणी उपलब्ध.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action: Regenerate All */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <RefreshCw className="w-4 h-4 text-white" />
          )}
          <span>{isRegenerating ? 'सर्व फाईल्स तयार होत आहेत...' : '🔄 AAB, APK आणि Key पुन्हा जनरेट करा'}</span>
        </button>
      </div>

      {/* Success / Error Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Summary Cards: The 3 Core Pillars (AAB, APK, KEY) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: AAB (Google Play Store) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-50/40 border border-indigo-200/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">1. Play Store AAB Bundle</h3>
                <span className="text-[11px] text-indigo-700 font-bold">.aab फाईल</span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
              {releaseInfo?.aab.sizeMb || '0.92 MB'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Google Play Console वर ॲप पब्लिश किंवा नवीन व्हर्जन अपडेट करण्यासाठी ही फाईल अपलोड करा.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => downloadAabFile(releaseInfo?.aab.url, form.appVersion)}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>AAB फाईल डाऊनलोड करा (.aab)</span>
            </button>
          </div>
        </div>

        {/* Card 2: APK (Direct Mobile Install) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-200/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                <Smartphone className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">2. Installable Mobile APK</h3>
                <span className="text-[11px] text-emerald-700 font-bold">.apk फाईल</span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              {releaseInfo?.apk.sizeMb || '0.92 MB'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            कोणत्याही अँड्रॉइड मोबाईलवर थेट इन्स्टॉल करा, चाचणी करा किंवा व्हॉट्सॲपवर पाठवा.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => downloadApkFile(releaseInfo?.apk.url, form.appVersion, incrementApkDownloadCount)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>APK फाईल डाऊनलोड करा (.apk)</span>
            </button>
          </div>
        </div>

        {/* Card 3: KEY & KEYSTORE (Signing Credentials) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/80 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-600 text-white shadow-sm">
                <Key className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">3. Android Signing Key</h3>
                <span className="text-[11px] text-amber-800 font-bold">release.keystore</span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
              {releaseInfo?.keystore.sizeKb || '2.8 KB'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            प्ले स्टोअर ॲप सायनिंग, फिंगरप्रिंट्स (SHA-1/256) आणि भविष्यातील सर्व ॲप अपडेट्सची मूळ चावी.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadKeystoreFile()}
              className="flex-1 py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Key डाऊनलोड</span>
            </button>
            <button
              type="button"
              onClick={() => downloadKeystoreInfo()}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow transition active:scale-95 cursor-pointer"
              title="Credentials & Fingerprints File"
            >
              <FileText className="w-4 h-4" />
              <span>Info</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          सर्व तपशील (Overview)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('keystore')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'keystore'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>🔑 Key आणि Fingerprints (SHA-1 / SHA-256)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aab')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'aab'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>📦 AAB फाईल व Play Store गाईड</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apk')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'apk'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>📱 APK फाईल व थेट इन्स्टॉल</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assets')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'assets'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>🎨 लोगो, आयकॉन्स व ग्राफिक्स (Play Store Assets)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          वेबसाईट डाऊनलोड सेटिंग्ज
        </button>
      </div>

      {/* TAB CONTENT: KEYSTORE & SIGNING CREDENTIALS */}
      {(activeTab === 'all' || activeTab === 'keystore') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/60 border border-amber-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-600 text-white">
                <Key className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Android Signing Key (Keystore) व सिक्युरिटी क्रेडेंशियल्स
                </h3>
                <p className="text-xs text-amber-950 font-medium">
                  गुगल प्ले स्टोअर आणि फायरबेससाठी अधिकृत चावी व फिंगरप्रिंट्स
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadKeystoreFile()}
                className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>release.keystore</span>
              </button>
              <button
                type="button"
                onClick={() => downloadKeystoreInfo()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>KEYSTORE_INFO.txt</span>
              </button>
            </div>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Keystore फाईल</span>
              <span className="text-xs font-extrabold text-slate-900 font-mono">release.keystore</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Key Alias</span>
                <span className="text-xs font-extrabold text-slate-900 font-mono">vanjarijodi</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('vanjarijodi', 'alias')}
                className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                title="Copy Alias"
              >
                {copiedKey === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Store Password</span>
                <span className="text-xs font-extrabold text-slate-900 font-mono">vanjari123</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('vanjari123', 'storepass')}
                className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                title="Copy Password"
              >
                {copiedKey === 'storepass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Key Password</span>
                <span className="text-xs font-extrabold text-slate-900 font-mono">vanjari123</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('vanjari123', 'keypass')}
                className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                title="Copy Password"
              >
                {copiedKey === 'keypass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Certificate Fingerprints */}
          <div className="space-y-2.5">
            {/* SHA-1 */}
            <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>SHA-1 Certificate Fingerprint (Firebase OTP व Google Login साठी):</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sha1, 'sha1')}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedKey === 'sha1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sha1' ? 'कॉपी झाले!' : 'SHA-1 कॉपी करा'}</span>
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] break-all select-all font-semibold">
                {sha1}
              </div>
            </div>

            {/* SHA-256 */}
            <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>SHA-256 Certificate Fingerprint (Play Integrity व App Signing साठी):</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sha256, 'sha256')}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sha256' ? 'कॉपी झाले!' : 'SHA-256 कॉपी करा'}</span>
                </button>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 text-amber-300 font-mono text-[11px] break-all select-all font-semibold">
                {sha256}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AAB & PLAY STORE GUIDE */}
      {(activeTab === 'all' || activeTab === 'aab') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-indigo-50/60 border border-indigo-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Google Play Store AAB Bundle (Android App Bundle)
                </h3>
                <p className="text-xs text-indigo-950 font-medium">
                  गुगल प्ले स्टोअरवर ॲप सबमिट करण्यासाठी आणि अपडेट्स देण्यासाठी अधिकृत फॉरमॅट
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => downloadAabFile(releaseInfo?.aab.url, form.appVersion)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 shadow transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>VanjariJodi-release.aab डाऊनलोड करा</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* AAB Metadata */}
            <div className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-2.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">AAB बंडल तपशील:</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Package Name:</span>
                  <span className="font-mono font-black text-slate-900">com.vanjarijodi.app</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Version Name:</span>
                  <span className="font-mono font-black text-slate-900">{form.appVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold">Version Code:</span>
                  <span className="font-mono font-black text-slate-900">2</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-bold">फाईल साईझ:</span>
                  <span className="font-bold text-indigo-700">{releaseInfo?.aab.sizeMb || '0.92 MB'}</span>
                </div>
              </div>
            </div>

            {/* Play Console Steps */}
            <div className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Google Play Console वर सबमिट कसे करावे:
              </h4>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside font-medium leading-relaxed">
                <li><strong>play.google.com/console</strong> वर लॉगिन करा.</li>
                <li><strong>'Create App'</strong> निवडून नाव 'वंजारी जोडी' ठेवा.</li>
                <li>डाव्या मेनूमधून <strong>'Production' ➜ 'Create new release'</strong> वर जा.</li>
                <li><strong>'Upload'</strong> वर क्लिक करून वर डाऊनलोड केलेली <strong>.aab</strong> फाईल निवडा.</li>
                <li>रिव्ह्यू करून <strong>'Start rollout to Production'</strong> वर क्लिक करा!</li>
              </ol>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: APK & DIRECT INSTALL */}
      {(activeTab === 'all' || activeTab === 'apk') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600 text-white">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Installable Mobile APK (थेट अँड्रॉइड ॲप)
                </h3>
                <p className="text-xs text-emerald-950 font-medium">
                  प्ले स्टोअरशिवाय कोणत्याही अँड्रॉइड मोबाईलमध्ये थेट इन्स्टॉल करण्यासाठी APK
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadApkFile(releaseInfo?.apk.url, form.appVersion, incrementApkDownloadCount)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>APK डाऊनलोड करा</span>
              </button>
            </div>
          </div>

          {/* Upload Custom File Box (Supports APK, AAB, Keystore) */}
          <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-emerald-300 hover:border-emerald-500 transition text-center space-y-3">
            <FileCode className="w-8 h-8 text-emerald-600 mx-auto" />
            <div>
              <h4 className="text-sm font-black text-slate-800">
                नवीन APK किंवा AAB किंवा Key फाईल अपलोड करा
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                संगणकावरून किंवा मोबाईलवरून थेट फाईल निवडून सर्व्हरवर सेव्ह करा (.apk, .aab, .keystore)
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition active:scale-95">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />}
              <span>{isUploading ? 'अपलोड होत आहे...' : 'फाईल निवडा (Choose File)'}</span>
              <input
                type="file"
                accept=".apk,.aab,.keystore,.jks"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS & WEBSITE BANNER */}
      {(activeTab === 'all' || activeTab === 'settings') && (
        <form onSubmit={handleSaveSettings} className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-black text-slate-900">वेबसाईट डाऊनलोड बॅनर व व्हर्जन सेटिंग्ज</h3>
            <p className="text-xs text-slate-500 font-medium">
              वेबसाईटवरील हेडर, होमपेज आणि पॉपअप बॅनरमधील मजकूर व व्हर्जन कॉन्फिगर करा.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                APK डाऊनलोड लिंक (Direct Download URL)
              </label>
              <input
                type="text"
                value={form.apkUrl}
                onChange={(e) => setForm(prev => ({ ...prev, apkUrl: e.target.value }))}
                placeholder="/downloads/VanjariJodi.apk"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                ॲप व्हर्जन (App Version Name)
              </label>
              <input
                type="text"
                value={form.appVersion}
                onChange={(e) => setForm(prev => ({ ...prev, appVersion: e.target.value }))}
                placeholder="v2.5.0"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                डाऊनलोड्स संख्या दर्शवा (Download Counter)
              </label>
              <input
                type="number"
                value={form.downloadCount}
                onChange={(e) => setForm(prev => ({ ...prev, downloadCount: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                फाईल साईझ (File Size Display)
              </label>
              <input
                type="text"
                value={form.fileSizeMb}
                onChange={(e) => setForm(prev => ({ ...prev, fileSizeMb: e.target.value }))}
                placeholder="0.92 MB"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-black text-amber-950">वेबसाईटवर ॲप डाऊनलोड बॅनर दाखवा (Public Download Banner)</h4>
              <p className="text-[11px] text-amber-900/80 font-medium">
                हे चालू असल्यास मुख्य हेडर, नेव्हिगेशन बार आणि होमपेजवर ॲप डाऊनलोड करा चे बटन दिसेल.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) => setForm(prev => ({ ...prev, isEnabled: e.target.checked }))}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              नवीन अपडेट नोंद (Release Highlights)
            </label>
            <textarea
              rows={2}
              value={form.releaseNotes}
              onChange={(e) => setForm(prev => ({ ...prev, releaseNotes: e.target.value }))}
              placeholder="उदा. नवीन अपडेट: Android 14/15 सुसंगतता, वेगवान सिस्टीम व सुधारित Material 3 UI."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>सेटिंग्ज सेव्ह करा (Save Configuration)</span>
          </button>
        </form>
      )}

      {/* TAB CONTENT: OFFICIAL LOGOS, ICONS & GRAPHICS ASSETS */}
      {(activeTab === 'all' || activeTab === 'assets') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/90 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-600 to-rose-600 text-white shadow-md">
                <ImageIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>अधिकृत ओरिजिनल लोगो, आयकॉन्स व प्ले स्टोअर ग्राफिक्स</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    All 13 Assets Ready
                  </span>
                </h3>
                <p className="text-xs text-amber-950 font-medium">
                  गुगल प्ले स्टोअर कन्सोल आणि सर्व प्रकारच्या उपकरणांसाठी मूळ कलाकृती व सर्व रिझोल्युशनच्या फाईल्स.
                </p>
              </div>
            </div>

            <a
              href="/vanjari-jodi-official-logo.png"
              download="VanjariJodi-Official-Master-Logo.png"
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>मास्टर लोगो डाऊनलोड (.png)</span>
            </a>
          </div>

          {/* Grid of all 13 Generated Assets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Official Original Logo */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">1. Official Original Logo</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">800×800 Master</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-900 rounded-xl p-2 border border-slate-800">
                <img src="/vanjari-jodi-official-logo.png" alt="Official Logo" className="max-h-full object-contain drop-shadow-md" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">पवित्र संत भगवान बाबा, वधू-वर प्रेम प्रतीक व सुवर्ण वंजारी जोडी मूळ लोगो.</p>
              <a
                href="/vanjari-jodi-official-logo.png"
                download="vanjari-jodi-official-logo.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 2. Transparent Square Logo */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">2. Transparent Square Logo</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">1024×1024 PNG</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-[repeating-conic-gradient(#e2e8f0_0_25%,#f8fafc_0_50%)] bg-[size:16px_16px] rounded-xl p-2 border border-slate-200">
                <img src="/logo-transparent.png" alt="Transparent Logo" className="max-h-full object-contain" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">पारदर्शक (Transparent Alpha) बॅकग्राउंडसह उच्च दर्जाचा स्क्वेअर लोगो.</p>
              <a
                href="/logo-transparent.png"
                download="logo-transparent.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 3. Horizontal Logo */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">3. Horizontal Banner Logo</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">840×240</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-950 rounded-xl p-2 border border-slate-800">
                <img src="/logo-horizontal.png" alt="Horizontal Logo" className="max-h-full object-contain" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">हेडर, लेटरहेड, सोशल मीडिया बॅनर व प्रेससाठी आडवा (Horizontal) लोगो.</p>
              <div className="flex items-center gap-2">
                <a
                  href="/logo-horizontal.png"
                  download="logo-horizontal.png"
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 transition"
                >
                  <Download className="w-3.5 h-3.5" /> सॉलिड
                </a>
                <a
                  href="/logo-horizontal-transparent.png"
                  download="logo-horizontal-transparent.png"
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 transition"
                >
                  <Download className="w-3.5 h-3.5" /> ट्रान्सपरंट
                </a>
              </div>
            </div>

            {/* 4. Play Store 512x512 Icon */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">4. Play Store 512×512 Icon</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900">Google Play Console</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-100 rounded-xl p-2 border border-slate-200">
                <img src="/playstore-icon-512.png" alt="Play Store Icon" className="max-h-full rounded-2xl shadow-md object-contain" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">गुगल प्ले कन्सोलवर ॲप आयकॉनसाठी अनिवार्य ३२-बिट ५१२×५१२ पीएनजी.</p>
              <a
                href="/playstore-icon-512.png"
                download="playstore-icon-512.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 5. Android Launcher 512x512 & Web Master Icon */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">5. Android Launcher 512×512</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">App Icon</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-900 rounded-xl p-2 border border-slate-800">
                <img src="/icon-512.png" alt="Launcher 512" className="max-h-full object-contain" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">मोबाईल लाँचर व वेबसाईट ॲपसाठी मुख्य ५१२×५१२ आयकॉन फाईल.</p>
              <a
                href="/icon-512.png"
                download="icon-512.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 6. Android Launcher 192x192 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">6. Android Launcher 192×192</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-900">xxxhdpi Mipmap</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-900 rounded-xl p-2 border border-slate-800">
                <img src="/icon-192.png" alt="Launcher 192" className="max-h-full object-contain" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">अँड्रॉइड xxxhdpi स्क्रीन व स्टँडर्ड मोबाईल लाँचरसाठी १९२×१९२ आयकॉन.</p>
              <a
                href="/icon-192.png"
                download="icon-192.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 7. Adaptive Icon Foreground & Background */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">7. Adaptive Icon Pair</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">Android 8-15</span>
              </div>
              <div className="h-32 flex items-center justify-center gap-2 bg-slate-100 rounded-xl p-2 border border-slate-200">
                <div className="w-20 h-20 rounded-2xl bg-rose-900 p-2 flex items-center justify-center shadow-inner">
                  <img src="/adaptive-icon-foreground.png" alt="Foreground" className="w-full h-full object-contain" />
                </div>
                <div className="w-20 h-20 rounded-2xl bg-[#800C1E] border border-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-200 shadow-inner">
                  Background
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">Android 8+ व्हिक्टर ॲडॉप्टिव्ह आयकॉन फोरग्राउंड (432×432) व बॅकग्राउंड.</p>
              <div className="flex items-center gap-2">
                <a
                  href="/adaptive-icon-foreground.png"
                  download="adaptive-icon-foreground.png"
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Foreground
                </a>
                <a
                  href="/adaptive-icon-background.png"
                  download="adaptive-icon-background.png"
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Background
                </a>
              </div>
            </div>

            {/* 8. Notification Icon */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">8. Notification Icon</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">Status Bar</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-900 rounded-xl p-2 border border-slate-800">
                <div className="p-3 rounded-full bg-slate-800 border border-slate-700">
                  <img src="/notification-icon.png" alt="Notification Icon" className="w-10 h-10 object-contain invert" />
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">अँड्रॉइड स्टेटस बार नोटिफिकेशन नियमानुसार व्हाइट सिल्हूट आयकॉन.</p>
              <a
                href="/notification-icon.png"
                download="notification-icon.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 9. Favicon */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">9. Favicon (Multi-Size)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">16, 32, 64px</span>
              </div>
              <div className="h-32 flex items-center justify-center gap-3 bg-slate-50 rounded-xl p-2 border border-slate-200">
                <img src="/favicon-16x16.png" alt="16px" className="w-4 h-4" />
                <img src="/favicon-32x32.png" alt="32px" className="w-8 h-8" />
                <img src="/favicon.png" alt="64px" className="w-12 h-12" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">ब्राउझर टॅब, बुकमार्क्स व सर्च रिझल्ट्ससाठी सुसंगत फॅव्हिकॉन.</p>
              <a
                href="/favicon.png"
                download="favicon.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 10. Apple Touch Icon */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">10. Apple Touch Icon</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-900">180×180 iOS</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-100 rounded-xl p-2 border border-slate-200">
                <img src="/apple-touch-icon.png" alt="Apple Touch Icon" className="w-20 h-20 rounded-2xl shadow-md object-contain" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">Apple iPhone व iPad होम स्क्रीनवर ॲप ॲड करण्यासाठी १८०×१८० आयकॉन.</p>
              <a
                href="/apple-touch-icon.png"
                download="apple-touch-icon.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-gray-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 11. PWA Icons */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">11. PWA Maskable Icon</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-900">512×512 Maskable</span>
              </div>
              <div className="h-32 flex items-center justify-center bg-slate-900 rounded-xl p-2 border border-slate-800">
                <img src="/icon-maskable-512.png" alt="PWA Maskable Icon" className="w-24 h-24 rounded-full object-contain border-2 border-amber-400" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">Chrome PWA व वेब एपीकेसाठी सेफ-झोन पॅडिंगसह मास्केबल आयकॉन.</p>
              <a
                href="/icon-maskable-512.png"
                download="icon-maskable-512.png"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-violet-50 hover:text-violet-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> डाऊनलोड करा
              </a>
            </div>

            {/* 12. Play Store Feature Graphic 1024x500 */}
            <div className="sm:col-span-2 lg:col-span-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">12. Google Play Store Feature Graphic</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-950">1024×500 Mandatory Banner</span>
              </div>
              <div className="h-36 flex items-center justify-center bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-hidden">
                <img src="/playstore-feature-graphic-1024x500.png" alt="Play Store Feature Graphic" className="max-h-full w-full object-contain rounded-lg" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Google Play Console वरील मुख्य हेडर बॅनर (Feature Graphic). यात संत भगवान बाबा प्रसन्न, वंजारी जोडी सुवर्ण टायपोग्राफी व विश्वासार्हता बॅजेस समाविष्ट आहेत.
              </p>
              <a
                href="/playstore-feature-graphic-1024x500.png"
                download="playstore-feature-graphic-1024x500.png"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:brightness-110 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" /> Play Store Feature Graphic (1024×500) डाऊनलोड
              </a>
            </div>

            {/* 13. Splash Screen 2732x2732 */}
            <div className="sm:col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">13. Splash Screen Master</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-950">2732×2732 Ultra HD</span>
              </div>
              <div className="h-36 flex items-center justify-center bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-hidden">
                <img src="/splash-2732x2732.png" alt="Splash Screen" className="max-h-full object-contain rounded-lg" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                अँड्रॉइड व iOS मोबाईल ॲप सुरू होताना दिसणारा भव्य २७३२×२७३२ स्प्लॅश स्क्रीन.
              </p>
              <a
                href="/splash-2732x2732.png"
                download="splash-2732x2732.png"
                className="w-full py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" /> Splash Screen (2732×2732) डाऊनलोड
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
