import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertTriangle, Sparkles, X, Smartphone, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CURRENT_APP_VERSION = '2.5.0';

/**
 * Semver helper: returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const clean1 = (v1 || '').replace(/^v/i, '').trim();
  const clean2 = (v2 || '').replace(/^v/i, '').trim();
  const p1 = clean1.split('.').map(Number);
  const p2 = clean2.split('.').map(Number);

  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  return 0;
}

export const AppUpdateNotifierModal: React.FC = () => {
  const { siteConfig } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  const config = siteConfig?.appUpdateConfig || {
    minAppVersion: '2.4.0',
    latestAppVersion: '2.5.0',
    isMandatoryUpdate: false,
    updateTitle: 'नवीन ॲप अपडेट उपलब्ध!',
    updateMessage: 'नवीन सुरक्षा, जलद फोटो लोडिंग आणि आधार पडताळणी सिस्टीमसाठी ॲप आताच अपडेट करा.',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app',
    apkDownloadUrl: 'https://vanjarijodi.web.app/downloads/VanjariJodi_v2.5.0.apk'
  };

  const isBelowMin = compareVersions(CURRENT_APP_VERSION, config.minAppVersion) < 0;
  const isBelowLatest = compareVersions(CURRENT_APP_VERSION, config.latestAppVersion) < 0;

  const isMandatory = isBelowMin || Boolean(config.isMandatoryUpdate && isBelowLatest);
  const hasUpdate = isMandatory || isBelowLatest;

  if (!hasUpdate || (isDismissed && !isMandatory)) {
    return null;
  }

  const handleUpdateClick = () => {
    const targetUrl = config.playStoreUrl || config.apkDownloadUrl || 'https://vanjarijodi.web.app';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md ${
        isMandatory ? 'bg-slate-950/95' : 'bg-slate-900/80'
      }`}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Banner Graphic */}
        <div className="bg-gradient-to-br from-[#800C1E] via-[#A71930] to-[#800C1E] p-6 text-center text-white relative">
          {!isMandatory && (
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-amber-200 transition cursor-pointer"
              title="नंतर करा"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
            {isMandatory ? (
              <AlertTriangle className="w-8 h-8 text-amber-300" />
            ) : (
              <Sparkles className="w-8 h-8 text-amber-300" />
            )}
          </div>

          <span
            className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase mb-2 ${
              isMandatory ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
            }`}
          >
            {isMandatory ? '⚠️ महत्त्वाचे अपडेट अनिवार्य' : '🚀 नवीन आवृत्ती उपलब्ध'}
          </span>

          <h3 className="text-lg font-black text-amber-100">
            {config.updateTitle || 'वंजारी जोडी ॲप अपडेट करा'}
          </h3>
          <p className="text-xs text-amber-200/90 mt-1">
            सध्याची आवृत्ती: v{CURRENT_APP_VERSION} ➔ नवीन: v{config.latestAppVersion}
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {config.updateMessage ||
              'नवीन सुधारित सुरक्षा, वेगवान बायोडाटा सर्च आणि आधार पडताळणी सुविधेचा लाभ घेण्यासाठी कृपया आपले ॲप अपडेट करा.'}
          </p>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-slate-700">
            <div className="font-black text-amber-950 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#800C1E]" />
              नवीन काय आहे? (What's New)
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 font-medium">
              <li>आधार कार्ड व सेल्फी पडताळणी (Blue Tick)</li>
              <li>अत्याधुनिक स्क्रीनशॉट व गोपनीयता संरक्षण</li>
              <li>जलद बायोडाटा व पत्रिका शोध इंजिन</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleUpdateClick}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black rounded-2xl shadow-md text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>आत्ताच अपडेट करा (Update Now)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {!isMandatory && (
              <button
                onClick={() => setIsDismissed(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs transition cursor-pointer"
              >
                नंतर आठवण करा (Remind Later)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
