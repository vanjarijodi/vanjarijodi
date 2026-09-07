import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { downloadApkFile } from '../utils/apkDownloader';
import {
  Smartphone,
  Download,
  ShieldCheck,
  Bell,
  Sparkles,
  CheckCircle2,
  QrCode,
  Zap,
  Lock,
  Star,
  X
} from 'lucide-react';

export const AndroidAppBanner: React.FC = () => {
  const { siteConfig, incrementApkDownloadCount } = useApp();
  const [showQrModal, setShowQrModal] = useState(false);

  const apk = siteConfig?.apkSettings;
  if (!apk || !apk.isEnabled) return null;

  const handleDownload = () => {
    downloadApkFile(
      apk.apkUrl,
      apk.appVersion || 'v2.4.0',
      incrementApkDownloadCount
    );
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 via-white to-amber-100/60 relative overflow-hidden border-y border-amber-300/60">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-[#800C1E] via-[#A71930] to-[#5C0815] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-amber-400/50 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
          
          {/* LEFT COLUMN: INFORMATION & FEATURES */}
          <div className="space-y-6 text-center lg:text-left max-w-2xl">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="px-3.5 py-1 bg-amber-300 text-[#800C1E] rounded-full text-xs font-black flex items-center gap-1.5 shadow-md border border-white/40">
                <Smartphone className="w-4 h-4 fill-[#800C1E]" />
                <span>अधिकृत अँड्रॉइड ॲप (Android Mobile App)</span>
              </span>
              <span className="px-3 py-1 bg-emerald-500/90 text-white rounded-full text-xs font-extrabold flex items-center gap-1 border border-emerald-300/40">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>४.९/५ रेटिंग्स ({apk.downloadCount || 14200}+ डाउनलोड्स)</span>
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-100 leading-tight tracking-tight">
                {siteConfig?.logoTitle || 'वंजारी जोडी'} ॲप डाऊनलोड करा!
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-relaxed">
                संत भगवान बाबा यांच्या आशीर्वादाने आता वंजारी समाजातील हजारो स्थळे थेट तुमच्या मोबाईलवर. जलद, सुरक्षित आणि वापरण्यास अत्यंत सोपे!
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-300/20 flex items-start gap-3">
                <div className="p-2 bg-amber-400/20 rounded-xl text-amber-300 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-200 text-xs sm:text-sm">रिअल-टाईम नोटिफिकेशन्स</h4>
                  <p className="text-[11px] text-amber-100/80">कोणाचाही मेसेज किंवा इंटरेस्ट आल्यास लगेच सूचना मिळवा.</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-300/20 flex items-start gap-3">
                <div className="p-2 bg-amber-400/20 rounded-xl text-amber-300 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-200 text-xs sm:text-sm">१००% आधार व फेस व्हॅलिडेटेड</h4>
                  <p className="text-[11px] text-amber-100/80">फक्त खरी आणि पडताळलेली वंजारी स्थळेच उपलब्ध.</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-300/20 flex items-start gap-3">
                <div className="p-2 bg-amber-400/20 rounded-xl text-amber-300 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-200 text-xs sm:text-sm">फास्ट ऑटो मॅचिंग</h4>
                  <p className="text-[11px] text-amber-100/80">जिल्हा, शिक्षण व वयानुसार आवडीची स्थळे सेकंदात शोधा.</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-300/20 flex items-start gap-3">
                <div className="p-2 bg-amber-400/20 rounded-xl text-amber-300 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-200 text-xs sm:text-sm">संपूर्ण डेटा सुरक्षा</h4>
                  <p className="text-[11px] text-amber-100/80">मोबाईल नंबर व फोटो तुमच्या संमतीनेच उघड होतात.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons & Release Info */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-2xl flex items-center justify-center gap-3 border-2 border-emerald-300 transition-all transform hover:scale-105 cursor-pointer active:scale-95"
              >
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Download className="w-5 h-5 text-amber-200 animate-bounce" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] text-emerald-100 uppercase tracking-wider font-extrabold">थेट डाऊनलोड करा</span>
                  <span className="text-base font-black">Android APK डाऊनलोड ({apk.fileSizeMb || '12.4 MB'})</span>
                </div>
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="w-full sm:w-auto px-5 py-4 bg-amber-100/10 hover:bg-amber-100/20 text-amber-200 font-extrabold text-xs sm:text-sm rounded-2xl border border-amber-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-amber-300" />
                <span>स्कॅन करून डाऊनलोड करा</span>
              </button>
            </div>

            {/* Version & Release Note */}
            {apk.releaseNotes && (
              <div className="text-left p-3 bg-black/20 rounded-xl border border-amber-300/20 text-xs font-semibold text-amber-200/90 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span><strong>व्हर्जन {apk.appVersion || 'v2.4.0'}:</strong> {apk.releaseNotes}</span>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: SMARTPHONE MOCKUP FRAME */}
          <div className="relative shrink-0 w-full max-w-xs sm:max-w-sm flex justify-center">
            
            {/* Phone Frame Mockup */}
            <div className="relative w-64 sm:w-72 bg-slate-900 p-3 rounded-[40px] shadow-2xl border-4 border-amber-400/80 ring-4 ring-black/40 transform hover:rotate-1 transition-transform duration-500">
              
              {/* Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-blue-900" />
              </div>

              {/* Screen Content */}
              <div className="bg-[#FFFDF5] text-slate-800 rounded-[30px] overflow-hidden pt-8 pb-5 px-4 space-y-4 shadow-inner min-h-[420px] flex flex-col justify-between border border-amber-200">
                
                {/* App Screen Header */}
                <div className="text-center space-y-1 border-b border-amber-200 pb-3">
                  <div className="w-12 h-12 bg-[#A71930] rounded-2xl flex items-center justify-center mx-auto text-amber-300 shadow-md border border-amber-400">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-[#A71930] text-sm">वंजारी जोडी मॅट्रिमोनी ॲप</h3>
                  <p className="text-[10px] text-amber-800 font-extrabold">अधिकृत वंजारी वधू-वर सूचक मोबाइल ॲप</p>
                </div>

                {/* Mock Card Preview */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#A71930] rounded-full text-white font-black text-xs flex items-center justify-center">
                      VJ
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">प्रियंका फड (नाशिक)</span>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> आधार व फेस व्हॅलिडेटेड
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 space-y-0.5">
                    <p>• B.E. Computer (TCS Pune)</p>
                    <p>• वय: २४ वर्षे | उंची: ५'५"</p>
                  </div>
                  <button className="w-full py-1.5 bg-[#A71930] text-amber-100 rounded-xl text-[10px] font-black text-center shadow">
                    व्हॉट्सॲपवर संपर्क करा
                  </button>
                </div>

                {/* Bottom App Screen Action */}
                <div className="text-center space-y-1">
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 border border-emerald-400 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-200" />
                    <span>इंस्टॉल करा (Direct APK)</span>
                  </button>
                  <span className="text-[9px] text-slate-500 font-bold block">
                    १००% व्हायरस-फ्री आणि सुरक्षित ॲप
                  </span>
                </div>

              </div>

            </div>

            {/* Live Stats Floating Tag */}
            <div className="absolute -bottom-3 -right-2 bg-amber-300 text-[#800C1E] px-4 py-2 rounded-2xl font-black text-xs shadow-xl border-2 border-white flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-4 h-4 fill-[#800C1E]" />
              <span>{apk.downloadCount || 14200}+ सक्रिय युझर्स</span>
            </div>

          </div>

        </div>
      </div>

      {/* QR CODE POPUP MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl p-6 text-slate-900 shadow-2xl space-y-4 text-center">
            
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-black text-[#A71930] text-sm flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#A71930]" />
                <span>QR कोड स्कॅन करून ॲप डाऊनलोड करा</span>
              </h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  apk.apkUrl || 'https://vanjarijodi.web.app'
                )}`}
                alt="APK Download QR Code"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-700">
              <p>तुमच्या मोबाईलचा कॅमेरा किंवा QR स्कॅनर उघडून वरील कोड स्कॅन करा.</p>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 bg-[#A71930] text-amber-100 rounded-xl font-black shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>किंवा थेट डाऊनलोड करा</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
