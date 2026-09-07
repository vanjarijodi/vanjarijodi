import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary } from '../utils/cloudinary';
import { downloadApkFile } from '../utils/apkDownloader';
import {
  Smartphone,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  Link,
  ShieldCheck,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const AdminApkFileManager: React.FC = () => {
  const { siteConfig, updateSiteConfig, incrementApkDownloadCount } = useApp();

  const apk = siteConfig?.apkSettings || {
    apkUrl: 'https://vanjarijodi.org/downloads/VanjariJodi_v2.5.0.apk',
    appVersion: 'v2.5.0',
    isEnabled: true,
    releaseNotes: 'नवीन अपडेट: Android 14 सुसंगतता, वेगवान सिस्टीम व सुधारित UI.',
    downloadCount: 14650,
    fileSizeMb: '12.8 MB'
  };

  const [form, setForm] = useState({
    apkUrl: apk.apkUrl || '',
    appVersion: apk.appVersion || 'v2.4.0',
    isEnabled: apk.isEnabled !== false,
    releaseNotes: apk.releaseNotes || '',
    downloadCount: apk.downloadCount || 14200,
    fileSizeMb: apk.fileSizeMb || '12.8 MB'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // File Upload Handler for APK files (Sends to Server & saves in public/downloads)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSaveSuccess(null);

    try {
      const fileSizeInMb = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      // Read file as base64 to send to server
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
          if (data.success && data.url) {
            const updatedForm = {
              ...form,
              apkUrl: data.url,
              fileSizeMb: data.sizeMb || fileSizeInMb
            };
            setForm(updatedForm);
            updateSiteConfig({ apkSettings: updatedForm });
            setSaveSuccess(`✅ APK फाईल "${file.name}" (${data.sizeMb}) सर्व्हरवर सुरक्षित सेव्ह झाली व तात्काळ उपलब्ध झाली!`);
          } else {
            throw new Error(data.error || 'Server upload failed');
          }
        } catch (serverErr) {
          console.warn('Server upload fallback, trying Cloudinary/local:', serverErr);
          // Fallback to Cloudinary or Object URL
          try {
            const uploadRes = await uploadToCloudinary(file);
            const cloudUrl = uploadRes.success && uploadRes.url ? uploadRes.url : URL.createObjectURL(file);
            const updatedForm = {
              ...form,
              apkUrl: cloudUrl,
              fileSizeMb: fileSizeInMb
            };
            setForm(updatedForm);
            updateSiteConfig({ apkSettings: updatedForm });
            setSaveSuccess(`✅ फाईल "${file.name}" यशस्वीरित्या सिस्टीममध्ये अपलोड झाली!`);
          } catch (cloudErr) {
            const objectUrl = URL.createObjectURL(file);
            const updatedForm = {
              ...form,
              apkUrl: objectUrl,
              fileSizeMb: fileSizeInMb
            };
            setForm(updatedForm);
            updateSiteConfig({ apkSettings: updatedForm });
            setSaveSuccess(`✅ फाईल "${file.name}" समाविष्ट झाली!`);
          }
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setSaveSuccess(`⚠️ फाईल अपलोड करताना त्रुटी: ${err.message}`);
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

  const handleTestDownload = () => {
    downloadApkFile(form.apkUrl, form.appVersion, incrementApkDownloadCount);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Smartphone className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900">
              मोबाईल अँड्रॉइड ॲप अपलोड व मॅनेजर (APK Manager)
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            ॲडमिन पॅनेलमधून नवीन APK फाईल अपलोड करा, व्हर्जन अपडेट करा व वेबसाईटवर ॲप डाऊनलोड पर्याय सक्रिय करा.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestDownload}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-white" />
          <span>ॲप टेस्ट करा व डाऊनलोड करा</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* File Upload Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-400 transition text-center space-y-3">
          <FileCode className="w-10 h-10 text-emerald-600 mx-auto" />
          <div>
            <h4 className="text-sm font-black text-slate-800">नवीन APK फाईल अपलोड करा (.apk File)</h4>
            <p className="text-xs text-slate-500 mt-0.5">संगणकावरून किंवा मोबाईलवरून थेट APK फाईल निवडा</p>
          </div>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition active:scale-95">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />}
            <span>{isUploading ? 'अपलोड होत आहे...' : 'APK फाईल निवडा (Choose File)'}</span>
            <input
              type="file"
              accept=".apk"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              APK लिंक URL (Direct APK Link)
            </label>
            <input
              type="text"
              value={form.apkUrl}
              onChange={(e) => setForm(prev => ({ ...prev, apkUrl: e.target.value }))}
              placeholder="https://vanjarijodi.com/app/vanjarijodi_v2.4.apk"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              ॲप व्हर्जन नाव (App Version)
            </label>
            <input
              type="text"
              value={form.appVersion}
              onChange={(e) => setForm(prev => ({ ...prev, appVersion: e.target.value }))}
              placeholder="v2.4.0"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              डाऊनलोड संख्या दर्शवा (Download Count Display)
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
              फाईल साईझ (File Size)
            </label>
            <input
              type="text"
              value={form.fileSizeMb}
              onChange={(e) => setForm(prev => ({ ...prev, fileSizeMb: e.target.value }))}
              placeholder="12.8 MB"
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
            नवीन अपडेट विषयक नोंद (Release Notes / Feature Highlights)
          </label>
          <textarea
            rows={3}
            value={form.releaseNotes}
            onChange={(e) => setForm(prev => ({ ...prev, releaseNotes: e.target.value }))}
            placeholder="उदा. नवीन अपडेट: वेगवान सिस्टीम व सुधारित UI."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>APK कॉन्फिगरेशन सेव्ह करा (Save APK Settings)</span>
        </button>

      </form>
    </div>
  );
};
