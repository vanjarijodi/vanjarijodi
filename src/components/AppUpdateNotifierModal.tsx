import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertTriangle, Sparkles, X, Smartphone, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

export const CURRENT_CLIENT_BUILD = {
  versionName: '2.7.0',
  versionCode: 62,
};

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
  const { siteConfig, language, isAdminLoggedIn } = useApp();
  
  const apk = siteConfig?.apkSettings;
  const config = siteConfig?.appUpdateConfig || {
    minAppVersion: apk?.minSupportedVersion || '2.7.0',
    latestAppVersion: apk?.appVersion || '2.7.0',
    minVersionCode: apk?.minSupportedVersionCode || 62,
    latestVersionCode: apk?.versionCode || 62,
    isMandatoryUpdate: false,
    force_update: false,
    updateTitle: 'नवीन ॲप अपडेट उपलब्ध (App Update Available)',
    updateTitleEn: 'App Update Available',
    updateMessage: 'वंजारी जोडी ॲपचे नवीन व सुरक्षित व्हर्जन Google Play Store वर उपलब्ध झाले आहे. ॲप सुरळीत चालण्यासाठी व अखंड सेवेसाठी कृपया ॲप आत्ताच अपडेट करा.',
    updateMessageEn: 'A new security and performance update is available on Google Play Store. Update to get the latest features and fastest experience.',
    playStoreUrl: apk?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app',
    apkDownloadUrl: apk?.apkUrl || 'https://vanjarijodi.web.app/downloads/VanjariJodi.apk',
    releaseNotes: [
      'Google Play Store नवीन व्हर्जन सुसंगतता (versionCode 62 / v2.7.0)',
      'अत्याधुनिक सुरक्षा मानके आणि गोपनीयता संरक्षण',
      'जलद बायोडाटा शोध, चॅट आणि सुलभ नोटिफिकेशन सेवा'
    ]
  };

  const targetVersion = config.latestAppVersion || apk?.appVersion || '2.7.0';
  const minRequiredVersion = config.minAppVersion || apk?.minSupportedVersion || '2.0.0';
  const targetCode = config.latestVersionCode || apk?.versionCode || 62;
  const minRequiredCode = config.minVersionCode || apk?.minSupportedVersionCode || 1;

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (
        localStorage.getItem('vj_update_dismissed_permanent') === 'true' ||
        localStorage.getItem('vj_user_already_updated') === 'true' ||
        localStorage.getItem('vj_update_acknowledged_all') === 'true' ||
        localStorage.getItem('vj_update_acknowledged_v2_7_0') === 'true' ||
        localStorage.getItem(`vj_update_acknowledged_${targetVersion}_${targetCode}`) === 'true' ||
        localStorage.getItem('vj_last_dismissed_target_version') === targetVersion
      ) {
        return true;
      }
      return sessionStorage.getItem('vj_update_modal_dismissed') === 'true';
    }
    return false;
  });

  const [installedVersion, setInstalledVersion] = useState<string>(CURRENT_CLIENT_BUILD.versionName);
  const [installedCode, setInstalledCode] = useState<number>(CURRENT_CLIENT_BUILD.versionCode);
  const [isChecking, setIsChecking] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isEn = language === 'en';

  // Listen for admin live preview event
  useEffect(() => {
    const handlePreview = () => {
      setIsDismissed(false);
      setIsPreviewOpen(true);
    };
    window.addEventListener('preview_compulsory_update', handlePreview);
    return () => window.removeEventListener('preview_compulsory_update', handlePreview);
  }, []);

  // Read installed version from Capacitor if running inside Android APK
  useEffect(() => {
    let isMounted = true;
    const detectAppVersion = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const info = await CapApp.getInfo();
          if (isMounted && info) {
            // Only update if Capacitor returns valid version
            if (info.version && info.version !== '1.0' && info.version !== '1.0.0') {
              setInstalledVersion(info.version);
            }
            if (info.build && !isNaN(Number(info.build)) && Number(info.build) > 1) {
              setInstalledCode(Number(info.build));
            }
          }
        }
      } catch (err) {
        console.warn('[UpdateDetector] Native App info fallback to bundled version:', err);
      }
    };
    detectAppVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine if update is genuinely needed
  // If client bundle or installed app is already at or above target version & code, NEVER show update popup!
  const isClientAlreadyUpdated =
    (compareVersions(CURRENT_CLIENT_BUILD.versionName, targetVersion) >= 0 &&
      CURRENT_CLIENT_BUILD.versionCode >= targetCode) ||
    (compareVersions(installedVersion, targetVersion) >= 0 &&
      installedCode >= targetCode);

  const isBelowMin = compareVersions(installedVersion, minRequiredVersion) < 0;
  const isBelowLatest = compareVersions(installedVersion, targetVersion) < 0;
  const isCodeBelowMin = installedCode < minRequiredCode;

  // Master Compulsory Switch - only active if explicitly enabled by admin
  const isForceEnabled = Boolean(
    config.isMandatoryUpdate === true ||
    config.force_update === true ||
    apk?.isForceUpdateEnabled === true
  );

  // If user is already updated to current release, NO update needed!
  // If force update is not enabled, do not show intrusive blocking popup!
  const isMandatory = (isBelowMin || isCodeBelowMin) && isForceEnabled && !isClientAlreadyUpdated;
  const hasUpdate = !isClientAlreadyUpdated && isForceEnabled && (isMandatory || isBelowLatest);

  // If Admin is managing the app, do not block unless in preview mode
  if (isAdminLoggedIn && !isPreviewOpen) {
    return null;
  }

  // Web Browser / AI Studio preview is a website, NOT an APK.
  // The compulsory APK update blocker strictly targets native Android APK app users (Capacitor).
  const isNative = Capacitor.isNativePlatform();
  if (!isNative && !isPreviewOpen) {
    return null;
  }

  // If user is ALREADY updated, or modal is dismissed, or no update, do NOT render!
  if (!isPreviewOpen && (isClientAlreadyUpdated || !hasUpdate || isDismissed)) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsPreviewOpen(false);
    if (typeof window !== 'undefined') {
      const ackKey = `vj_update_acknowledged_${targetVersion}_${targetCode}`;
      localStorage.setItem('vj_update_dismissed_permanent', 'true');
      localStorage.setItem('vj_user_already_updated', 'true');
      localStorage.setItem('vj_update_acknowledged_all', 'true');
      localStorage.setItem('vj_update_acknowledged_v2_7_0', 'true');
      localStorage.setItem(ackKey, 'true');
      localStorage.setItem('vj_last_dismissed_target_version', targetVersion);
      sessionStorage.setItem('vj_update_modal_dismissed', 'true');
    }
  };

  const handlePlayStoreClick = () => {
    const playStoreUrl = config.playStoreUrl || apk?.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app';
    const isAndroid = /android/i.test(navigator.userAgent) || Capacitor.getPlatform() === 'android';

    if (isAndroid) {
      // Direct intent for Google Play Store app
      window.location.href = 'market://details?id=com.vanjarijodi.app';
      setTimeout(() => {
        window.open(playStoreUrl, '_blank', 'noopener,noreferrer');
      }, 800);
    } else {
      window.open(playStoreUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDirectApkClick = () => {
    const apkUrl = config.apkDownloadUrl || apk?.apkUrl || '/downloads/VanjariJodi.apk';
    window.open(apkUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCheckAgain = async () => {
    setIsChecking(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const info = await CapApp.getInfo();
          if (info && info.version) {
            setInstalledVersion(info.version);
            if (info.build) setInstalledCode(Number(info.build));
          }
        } catch (e) {
          console.warn('Check again error:', e);
        }
      }
      // Set to latest and permanently dismiss for this version
      setInstalledVersion(targetVersion);
      setInstalledCode(targetCode);
      handleDismiss();
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-5 backdrop-blur-xl bg-slate-950/90 overflow-y-auto select-none animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-3 border-amber-400 shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Admin Preview Mode Top Bar */}
        {isPreviewOpen && (
          <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between border-b border-amber-500 shadow-sm">
            <span>🎯 ॲडमिन चाचणी प्रिव्ह्यू मोड (युजर्सना हे असे दिसेल)</span>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-0.5 bg-slate-950 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              प्रिव्ह्यू बंद करा ✕
            </button>
          </div>
        )}

        {/* Top Header Banner with Official Branding */}
        <div className="bg-gradient-to-br from-[#600714] via-[#800C1E] to-[#A71930] p-6 text-center text-white relative border-b-2 border-amber-400">
          
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 hover:bg-black/80 text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-white/20 transition cursor-pointer"
            title="बंद करा व पुढे जा"
          >
            <span>{isEn ? 'Continue' : 'पुढे सुरू ठेवा'}</span>
            <X className="w-3.5 h-3.5" />
          </button>
          
          {/* Notice badge */}
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{isEn ? 'Update Available' : 'नवीन ॲप अपडेट उपलब्ध'}</span>
            </span>
          </div>

          <div className="w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-300/80 flex items-center justify-center mx-auto mb-3 shadow-inner p-2 ring-4 ring-amber-400/30 animate-pulse">
            <img
              src="/vanjari-jodi-official-logo.png"
              alt="Vanjari Jodi Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-black text-amber-100 leading-tight">
            {isEn ? (config.updateTitleEn || 'App Update Available') : (config.updateTitle || 'वंजारी जोडी ॲप अपडेट')}
          </h2>

          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-black/40 border border-red-400/50 text-red-200">
              {isEn ? 'Current Version:' : 'सध्याचे व्हर्जन:'} <strong className="text-white font-mono">v{installedVersion}</strong>
            </span>
            <span className="text-amber-300 font-black">➔</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/30 border border-emerald-400/60 text-emerald-200">
              {isEn ? 'New Version:' : 'नवीन व्हर्जन:'} <strong className="text-white font-mono">v{targetVersion}</strong>
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 bg-[#FFFDF7]">
          
          {/* Compulsory / Recommendation Alert Box */}
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              <strong className="text-amber-950 font-black block mb-0.5">
                {isEn ? 'Latest Features & Fast Speed:' : 'नवीन सुविधा आणि जलद गती:'}
              </strong>
              <p>
                {isEn
                  ? (config.updateMessageEn || 'A new update is available on Google Play Store with latest features and enhanced performance.')
                  : (config.updateMessage || 'वंजारी जोडी ॲपचे नवीन व सुरक्षित व्हर्जन Google Play Store वर उपलब्ध झाले आहे. अखंड सेवेसाठी कृपया ॲप आत्ताच अपडेट करा.')}
              </p>
            </div>
          </div>

          {/* What's New / Highlights */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs text-slate-800">
            <div className="font-black text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-[#800C1E]" />
              <span>{isEn ? "What's New in this Update:" : 'नवीन व्हर्जनमधील महत्त्वाच्या सुधारणा:'}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium pl-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isEn ? 'Google Play Console compliance (versionCode 62)' : 'गुगल प्ले स्टोअर नवीन नियमावली व अधिक सुरक्षितता'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isEn ? 'High speed bio-data photo loading & search' : 'अतिजलद बायोडाटा व फोटो लोडिंग'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isEn ? 'Bug fixes and enhanced performance' : 'जुन्या त्रुटींचे निवारण आणि अखंड चॅट सेवा'}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            
            {/* 1. Main Google Play Store Button */}
            <button
              type="button"
              onClick={handlePlayStoreClick}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-black rounded-2xl shadow-xl text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer border-2 border-emerald-300"
            >
              <Download className="w-5 h-5 text-white" />
              <span>{isEn ? 'Update via Google Play Store' : '🚀 Google Play Store वरून अपडेट करा'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* 2. Direct APK Download (Alternative for Direct Sideload users) */}
            <button
              type="button"
              onClick={handleDirectApkClick}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black rounded-2xl shadow-md text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>{isEn ? 'Direct APK Download (Alternative)' : '📥 थेट नवीन APK फाईल डाउनलोड करा'}</span>
            </button>

            {/* 3. Re-verify / Refresh / Continue Button */}
            <button
              type="button"
              disabled={isChecking}
              onClick={handleCheckAgain}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-[#800C1E]' : ''}`} />
              <span>
                {isChecking
                  ? (isEn ? 'Checking...' : 'तपासत आहे...')
                  : (isEn ? 'I have updated / Continue to App' : '🔄 मी अपडेट केले आहे — ॲप उघडा')}
              </span>
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            {isEn
              ? 'Vanjari Jodi Matrimony • Official Google Play Console Release'
              : 'वंजारी जोडी मॅट्रिमोनी • अधिकृत Google Play Store ॲप्लिकेशन'}
          </p>
        </div>
      </div>
    </div>
  );
};

