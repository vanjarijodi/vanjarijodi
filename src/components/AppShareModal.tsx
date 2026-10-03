import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { downloadApkFile } from '../utils/apkDownloader';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Smartphone,
  QrCode,
  Sparkles,
  ExternalLink,
  Heart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';

interface AppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppShareModal: React.FC<AppShareModalProps> = ({ isOpen, onClose }) => {
  const { siteConfig, incrementApkDownloadCount } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedApkUrl, setCopiedApkUrl] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const apk = siteConfig?.apkSettings || {
    apkUrl: '/downloads/VanjariJodi_v2.5.0.apk',
    appVersion: 'v2.5.0',
    fileSizeMb: '12.8 MB',
    downloadCount: 14650,
  };

  const appVersion = apk.appVersion || 'v2.5.0';
  const fileSize = apk.fileSizeMb || '12.8 MB';

  // Construct absolute APK download link and website URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vanjarijodi.web.app';
  const fullApkDownloadUrl = apk.apkUrl?.startsWith('http')
    ? apk.apkUrl
    : `${origin}${apk.apkUrl?.startsWith('/') ? apk.apkUrl : `/${apk.apkUrl || 'downloads/VanjariJodi_v2.5.0.apk'}`}`;

  const shareTextMarathi = `🚩 *वंजारी जोडी (Vanjari Jodi) - अधिकृत वंजारी वधू-वर सूचक ॲप* 🚩

वंजारी समाजातील हजारो उच्चशिक्षित, शासकीय/प्रायव्हेट नोकरदार व अनुरूप वर-वधू स्थळे आता आपल्या मोबाईलवर!

📲 *मोबाईल ॲप डाऊनलोड करा:*
${fullApkDownloadUrl}

🌐 *अधिकृत वेबसाईट:*
${origin}

🙏 आपल्या वंजारी समाजातील सर्व नातेवाईक व मित्रपरिवाराला नक्की शेअर करा!`;

  const handleCopyShareText = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareTextMarathi);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleCopyApkUrl = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullApkDownloadUrl);
        setCopiedApkUrl(true);
        setTimeout(() => setCopiedApkUrl(false), 2500);
      }
    } catch (e) {
      console.warn('Copy APK failed:', e);
    }
  };

  const handleTelegramShare = () => {
    const encoded = encodeURIComponent(shareTextMarathi);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullApkDownloadUrl)}&text=${encoded}`;
    window.open(telegramUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'वंजारी जोडी - अधिकृत वंजारी मॅट्रिमोनी ॲप',
          text: `वंजारी समाजातील हजारो अनुरूप वर-वधू स्थळे आता मोबाईलवर. आजच ॲप डाऊनलोड करा:`,
          url: fullApkDownloadUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopyShareText();
    }
  };

  const handleDownloadApp = () => {
    setDownloading(true);
    downloadApkFile(apk.apkUrl, appVersion, incrementApkDownloadCount);
    setTimeout(() => setDownloading(false), 2000);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(fullApkDownloadUrl)}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden text-slate-800 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <VanjariJodiLogo variant="emblem" size={36} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 text-[10px] font-black uppercase tracking-wider mb-1 border border-amber-400/40">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>अधिकृत अँड्रॉइड ॲप (APK)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                वंजारी जोडी ॲप शेअर करा
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                व्हॉट्सॲपवर किंवा नातेवाईकांना ॲप डाऊनलोड लिंक पाठवा
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* App Info Badge Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">VanjariJodi Matrimony App</h4>
                <p className="text-xs text-slate-600 font-medium">
                  व्हर्जन {appVersion} • फाईल साईझ: <span className="font-bold text-[#800C1E]">{fileSize}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadApp}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'डाऊनलोड...' : 'डाऊनलोड'}</span>
            </button>
          </div>

          {/* Primary Action 1: One-Click Telegram Share Button */}
          <button
            type="button"
            onClick={handleTelegramShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-sky-500/25 active:scale-98 transition cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span>टेलिग्रामवर थेट शेअर करा (Telegram Share)</span>
          </button>

          {/* Secondary Actions: Native Mobile Share & Copy Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Native Share button */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-3 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-sky-600" />
              <span>इतर ॲप्सवर शेअर करा</span>
            </button>

            {/* Copy APK URL */}
            <button
              type="button"
              onClick={handleCopyApkUrl}
              className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
            >
              {copiedApkUrl ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">लिंक कॉपी झाली!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>डाऊनलोड लिंक कॉपी करा</span>
                </>
              )}
            </button>
          </div>

          {/* QR Code Section to Scan on Other Mobile */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0">
              <img
                src={qrImageUrl}
                alt="App Download QR Code"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                <QrCode className="w-3.5 h-3.5 text-purple-700" />
                <span>कॅमेरा स्कॅन करून डाऊनलोड</span>
              </div>
              <p className="text-xs text-slate-700 font-bold leading-relaxed">
                मोबाईलच्या कॅमेऱ्याने हा QR कोड स्कॅन करा आणि थेट ॲप डाऊनलोड करा.
              </p>
              <p className="text-[11px] font-mono text-slate-500 break-all truncate max-w-xs">
                {fullApkDownloadUrl}
              </p>
            </div>
          </div>

          {/* Pre-written Message Preview */}
          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                <span>📝 शेअर होणारा मेसेज:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyShareText}
                className="text-[10px] font-bold text-[#800C1E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'कॉपी झाले!' : 'संपूर्ण मेसेज कॉपी करा'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-sans italic leading-relaxed line-clamp-3">
              "{shareTextMarathi}"
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>सुरक्षित व अधिकृत वंजारी मॅट्रिमोनी</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black transition cursor-pointer"
          >
            बंद करा
          </button>
        </div>

      </div>
    </div>
  );
};
