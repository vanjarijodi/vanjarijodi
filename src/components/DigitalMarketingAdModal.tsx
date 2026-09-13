import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  Download,
  Flame,
  ShieldCheck,
  Phone,
  Mail,
  Heart,
  Users,
  QrCode,
  ArrowRight,
  MessageCircle,
  Megaphone,
  Smartphone,
  Layers,
  Crown,
  Send
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';

interface DigitalMarketingAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalMarketingAdModal: React.FC<DigitalMarketingAdModalProps> = ({
  isOpen,
  onClose
}) => {
  const { siteConfig, language, plansList } = useApp();
  const [activeTab, setActiveTab] = useState<'poster' | 'square' | 'textAds' | 'flyer'>('poster');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const tgUsername = (siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '');
  const supportEmail = siteConfig?.contactEmail || 'gitevijay123@gmail.com';
  const websiteUrl = window.location.origin;
  const welcomePlan =
    plansList?.find((p) => p.id === 'welcome_offer') ||
    plansList?.find((p) => p.id !== 'single_kundli' && p.planType !== 'single_use') ||
    plansList?.[0];
  const promoPrice = welcomePlan?.price || 398;

  // Viral Ready-Made Marathi Ad Copies
  const adCopies = [
    {
      title: `🌟 व्हॉट्सॲप ग्रुप्स व स्टेट्ससाठी मुख्य जाहिरात (Flagship ₹${promoPrice} Promo)`,
      tag: 'सर्वात लोकप्रिय 🔥',
      text: `🚩 *॥ श्री संत भगवान बाबा प्रसन्न ॥* 🚩

💍 *वंजारी समाजातील सुशिक्षित व अनुरूप वधू-वर शोधताय का?*
आता काळजी नको! महाराष्ट्रातील सर्वात विश्वासू व आधुनिक विवाह मंच -
✨ *वंजारी जोडी मॅट्रिमोनी (Vanjari Jodi Matrimony)* ✨

🔥 *खास मर्यादित वेळेची स्पेशल ऑफर:*
फक्त *रु. ${promoPrice}/-* मध्ये ६ महिने वैधता!
✅ दोघांनी लाईक केल्यावर (Mutual Like) थेट संपर्क माहिती अनलॉक
✅ हजारो उच्चशिक्षित डॉक्टर, इंजिनिअर, शासकीय अधिकारी व व्यावसायिक स्थळे
✅ ३६ गुण वैदिक कुंडली मिलन व गुण जुळवणी रिपोर्ट
✅ १००% गोपनीय व आधार पडताळणी केलेले प्रोफाईल्स
✅ रंगीत PDF बायोडाटा मेकर मोफत

📲 *आत्ताच मोफत नोंदणी करा:*
👉 ${websiteUrl}

📧 *ई-मेल मदत कक्ष:* ${supportEmail}

_वंजारी समाजातील सर्व नातेवाईक व मित्रपरिवाराच्या ग्रुपमध्ये नक्की शेअर करा!_ 🌸`
    },
    {
      title: '💼 पालकांसाठी खास संक्षिप्त संदेश (For Parents & Families)',
      tag: 'कौटुंबिक जाहिरात 👨‍👩‍👧',
      text: `🚩 *पालकांसाठी आनंदाची बातमी - वंजारी जोडी मॅट्रिमोनी!* 🚩

आपल्या मुला-मुलींसाठी योग्य वंजारी स्थळ शोधणे आता झाले अगदी सोपे!
बीड, नाशिक, नगर, पुणे, संभाजीनगर, लातूर, नांदेड, मुंबई व संपूर्ण महाराष्ट्रातील हजारो सत्य व प्रमाणित वधू-वर प्रोफाईल्स एकाच ॲपवर उपलब्ध.

⭐ *वैशिष्ट्ये:*
• पारंपारिक जातकुळी, गोत्र व वाढे भाऊ मार्गदर्शन
• म्युचुअल पसंती झाल्यावरच नंबर अनलॉक (सुरक्षित व गोपनीय)
• फक्त रु. ${promoPrice}/- मध्ये ६ महिने अमर्यादित सेवा

🌐 *वेबसाईटवर आजच नोंदणी करा:* ${websiteUrl}
📧 *ई-मेल मदत कक्ष:* ${supportEmail}`
    },
    {
      title: '⚡ तरुणांसाठी डिजिटल शॉर्ट ॲड (Youth & Professional Matchmaking)',
      tag: 'शॉर्ट व फास्ट 🚀',
      text: `❤️ *Find Your Perfect Vanjari Life Partner!* ❤️

Search thousands of verified Vanjari Brides & Grooms across IT, Engineering, Medical, Govt & Business sectors.

🔥 *Special ₹${promoPrice} Membership Offer:*
• Unlock Contact on Mutual Likes
• 36 Gun Vedic Kundali Match
• Instant Colored PDF Biodata Maker

👉 Join Now: ${websiteUrl}
📧 Support Email: ${supportEmail}`
    }
  ];

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleShareTelegram = (text: string) => {
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://vanjarijodi.web.app')}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white text-slate-800 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border-2 border-amber-400 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] px-5 py-4 text-amber-100 flex items-center justify-between shrink-0 border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-[#800C1E] shadow-md shrink-0">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider border border-amber-400/40">
                  Digital Marketing Hub
                </span>
                <span className="text-xs text-amber-200/80 font-bold">₹४९९ स्पेशल प्रोमो</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-amber-200 tracking-tight">
                वंजारी जोडी डिजिटल जाहिरात व सोशल मीडिया पोस्टर मेकर
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-amber-100 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-amber-50/90 border-b border-amber-200 p-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('poster')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'poster'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 व्हॉट्सॲप स्टेट्स पोस्टर (9:16)</span>
          </button>

          <button
            onClick={() => setActiveTab('square')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'square'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🖼️ फेसबुक / इंस्टाग्राम स्क्वेअर (1:1)</span>
          </button>

          <button
            onClick={() => setActiveTab('textAds')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'textAds'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>💬 रेडीमेड व्हायरल जाहिरात मेसेज (Text Broadcasts)</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30">
          
          {/* 1. WHATSAPP STATUS POSTER (9:16) */}
          {activeTab === 'poster' && (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
              {/* The Visual Poster Canvas */}
              <div
                id="digital-ad-poster-canvas"
                className="w-full max-w-[340px] aspect-[9/16] bg-gradient-to-b from-[#640513] via-[#800C1E] to-[#45030B] rounded-3xl p-5 text-white shadow-2xl border-4 border-amber-400 flex flex-col justify-between relative overflow-hidden shrink-0"
              >
                {/* Gold Glow & Texture */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

                {/* Top Blessings & Logo */}
                <div className="text-center space-y-1 relative z-10">
                  <div className="inline-block px-3 py-0.5 rounded-full bg-amber-400 text-[#800C1E] text-[10px] font-black uppercase tracking-wider shadow-sm">
                    ॥ श्री संत भगवान बाबा प्रसन्न ॥
                  </div>
                  <h3 className="text-xl font-black text-amber-300 tracking-tight flex items-center justify-center gap-1.5 pt-1">
                    <span>वंजारी जोडी मॅट्रिमोनी</span>
                  </h3>
                  <p className="text-[10px] text-amber-100/90 font-bold">
                    महाराष्ट्रातील अग्रगण्य वंजारी वधू-वर सूचक केंद्र
                  </p>
                </div>

                {/* Center Creative Graphic / Offer Box */}
                <div className="my-auto space-y-3 relative z-10">
                  {/* Huge Offer Badge */}
                  <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-[#800C1E] rounded-2xl p-3.5 text-center shadow-lg border-2 border-white/60 space-y-1">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#800C1E] text-amber-200 text-[10px] font-black uppercase">
                      <Flame className="w-3 h-3 fill-amber-300" />
                      <span>स्पेशल मेंबरशिप ऑफर</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-3xl sm:text-4xl font-black">₹४९९/-</span>
                      <span className="text-[11px] font-black block leading-tight text-left">
                        ६ महिने वैधता<br /><span className="text-[9px] font-bold text-slate-700">(१८० दिवस)</span>
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-[#800C1E] pt-0.5 border-t border-[#800C1E]/20">
                      म्युचुअल लाईकवर थेट नंबर व व्हॉट्सॲप अनलॉक!
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="bg-black/30 backdrop-blur-xs rounded-xl p-3 border border-amber-400/40 space-y-1.5 text-[11px] font-medium text-amber-100">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>१००% आधार पडताळणी केलेले प्रोफाईल्स</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>३६ गुण वैदिक पत्रिका व गुण जुळवणी</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>पारंपारिक जातकुळी व वाढे भाऊ मार्गदर्शन</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>आकर्षक PDF बायोडाटा डाऊनलोड मोफत</span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Banner */}
                <div className="bg-[#4D0612] p-2.5 rounded-2xl border border-amber-400/50 text-center space-y-1 relative z-10">
                  <p className="text-[10px] text-amber-200 font-bold">📲 आजच मोफत नावनोंदणी करा:</p>
                  <p className="text-xs font-black text-white underline decoration-amber-400">{websiteUrl.replace('https://', '')}</p>
                  <div className="pt-1 flex items-center justify-center gap-2 text-[10px] font-black text-amber-300">
                    <Mail className="w-3 h-3 text-amber-300" />
                    <span>ई-मेल: {supportEmail}</span>
                  </div>
                </div>
              </div>

              {/* Action Controls Column */}
              <div className="space-y-4 max-w-md">
                <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>व्हॉट्सॲप स्टेट्सवर जाहिरात कशी करावी?</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    हे पोस्टर थेट तुमच्या टेलिग्राम चॅनेलवर, टेलिग्राम ग्रुप्समध्ये किंवा सोशल मीडियावर शेअर करून अधिक स्थळांची माहिती मिळवा.
                  </p>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <button
                      onClick={() => handleShareTelegram(adCopies[0].text)}
                      className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>टेलिग्रामवर त्वरित शेअर करा (Direct Telegram Share)</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(adCopies[0].text, 99)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] border border-amber-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {copiedIndex === 99 ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedIndex === 99 ? 'जाहिरात कॉपी झाली!' : 'जाहिरातीचा मजकूर कॉपी करा (Copy Ad Text)'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1.5">
                  <p className="font-bold text-[#800C1E]">💡 ॲडमिन टीप:</p>
                  <p>मोबाईलमध्ये स्क्रीनशॉट काढून हे पोस्टर क्रॉप करून लगेचच स्टेटस किंवा डीपीला वापरू शकता.</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. SQUARE POSTER (1:1) */}
          {activeTab === 'square' && (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
              {/* Square Canvas */}
              <div
                className="w-full max-w-[360px] aspect-square bg-gradient-to-br from-[#640513] via-[#800C1E] to-[#45030B] rounded-3xl p-5 text-white shadow-2xl border-4 border-amber-400 flex flex-col justify-between relative overflow-hidden shrink-0"
              >
                <div className="text-center space-y-0.5">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                    ॥ श्री संत भगवान बाबा प्रसन्न ॥
                  </span>
                  <h3 className="text-lg font-black text-white">वंजारी जोडी मॅट्रिमोनी</h3>
                  <p className="text-[10px] text-amber-200 font-medium">वंजारी समाजातील हक्काचे डिजिटल वधू-वर सूचक केंद्र</p>
                </div>

                {/* Banner Box */}
                <div className="bg-amber-400 text-[#800C1E] p-3 rounded-2xl text-center shadow-md space-y-0.5">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#800C1E] text-amber-200 uppercase">
                    स्पेशल ऑफर रु. ४९९/-
                  </span>
                  <p className="text-sm font-black pt-0.5">म्युचुअल पसंतीवर थेट नंबर व व्हॉट्सॲप अनलॉक!</p>
                  <p className="text-[10px] font-bold">६ महिने अमर्यादित बायोडाटा व ३६ गुण पत्रिका</p>
                </div>

                {/* Footer on Creative */}
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-amber-100 font-bold">वेबसाईट: {websiteUrl.replace('https://', '')}</p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] font-black">
                    <Mail className="w-3 h-3" />
                    <span>ई-मेल: {supportEmail}</span>
                  </div>
                </div>
              </div>

              {/* Action Controls Column */}
              <div className="space-y-4 max-w-md">
                <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>फेसबुक व इंस्टाग्राम पोस्टसाठी उपयुक्त</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    हा स्क्वेअर फॉरमॅट फेसबुक ग्रुप्स, इंस्टाग्राम फीड व कम्युनिटी पेजवर सर्वोत्तम दिसतो.
                  </p>

                  <button
                    onClick={() => handleShareTelegram(adCopies[1].text)}
                    className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>टेलिग्रामवर जाहिरात पाठवा</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. READY-MADE MARATHI TEXT BROADCASTS */}
          {activeTab === 'textAds' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="text-center space-y-1 mb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  व्हायरल मराठी जाहिरात मजकूर (One-Click Telegram Broadcasts)
                </h3>
                <p className="text-xs text-slate-600">
                  खालीलपैकी कोणताही मजकूर एका क्लिकवर कॉपी करा किंवा थेट टेलिग्राम चॅटमध्ये पाठवा.
                </p>
              </div>

              <div className="space-y-4">
                {adCopies.map((ad, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border-2 border-amber-300/80 shadow-md space-y-3 relative hover:border-amber-400 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-100 text-[#800C1E] font-black text-xs">
                          #{idx + 1}
                        </span>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm">{ad.title}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-[#800C1E] text-[10px] font-black">
                        {ad.tag}
                      </span>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {ad.text}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                      <button
                        onClick={() => handleCopyText(ad.text, idx)}
                        className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] border border-amber-300 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIndex === idx ? 'कॉपी झाली!' : 'मजकूर कॉपी करा'}</span>
                      </button>

                      <button
                        onClick={() => handleShareTelegram(ad.text)}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>टेलिग्रामवर पाठवा</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium shrink-0">
          <span>👑 वंजारी जोडी डिजिटल मार्केटिंग पोर्टल</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#800C1E] hover:bg-[#A71930] text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            बंद करा (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
