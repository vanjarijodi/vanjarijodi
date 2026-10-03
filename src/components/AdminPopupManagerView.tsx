import React, { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  ExternalLink,
  Clock,
  Palette,
  RotateCcw,
  Zap,
  Layers,
  Link,
  Image as ImageIcon,
  Flame,
  Radio,
  Sliders,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminPopupManagerView: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useApp();

  // Local state initialized from siteConfig
  const [isEnabled, setIsEnabled] = useState<boolean>(siteConfig?.isFlashAdEnabled ?? false);
  const [title, setTitle] = useState<string>(siteConfig?.flashAdTitle || '🎯 राज्यस्तरीय भव्य वंजारी वधू-वर परिचय मेळावा २०२६');
  const [titleEn, setTitleEn] = useState<string>(siteConfig?.flashAdTitleEn || '🎯 State Level Grand Vanjari Matrimonial Meet 2026');
  const [subtitle, setSubtitle] = useState<string>(siteConfig?.flashAdSubtitle || 'परळी वैजनाथ, बीड, पुणे व नाशिक येथे मोफत बायोडाटा पुस्तक वाटप व प्रत्यक्ष गाठीभेटी!');
  const [subtitleEn, setSubtitleEn] = useState<string>(siteConfig?.flashAdSubtitleEn || 'Free bio-data book distribution and direct family meetings at Parli, Beed, Pune & Nashik!');
  const [imageUrl, setImageUrl] = useState<string>(siteConfig?.flashAdImageUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200');
  const [linkUrl, setLinkUrl] = useState<string>(siteConfig?.flashAdLinkUrl || 'https://t.me/Primemultiservice?text=मेळावा_जाहिरात_चौकशी');
  const [buttonText, setButtonText] = useState<string>(siteConfig?.flashAdButtonText || 'अधिक माहिती व नोंदणी ➔');
  const [buttonTextEn, setButtonTextEn] = useState<string>(siteConfig?.flashAdButtonTextEn || 'More Info / Register ➔');
  const [badgeText, setBadgeText] = useState<string>(siteConfig?.flashAdBadgeText || 'विशेष प्रायोजित जाहिरात');
  const [theme, setTheme] = useState<'gold' | 'crimson' | 'emerald' | 'sapphire' | 'custom'>(siteConfig?.flashAdTheme || 'gold');
  const [displayMode, setDisplayMode] = useState<'popup_modal' | 'top_slide' | 'bottom_float'>(siteConfig?.flashAdDisplayMode || 'popup_modal');
  const [autoCloseSeconds, setAutoCloseSeconds] = useState<number>(siteConfig?.flashAdAutoCloseSeconds ?? 8);
  const [delaySeconds, setDelaySeconds] = useState<number>(siteConfig?.flashAdDelaySeconds ?? 1);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiTone, setAiTone] = useState<string>('attractive');
  const [selectedPreset, setSelectedPreset] = useState<string>('festive');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Preset topics for quick 1-click generation
  const presets = [
    { id: 'festive', label: '🪔 सण-उत्सव विशेष', desc: 'गुढीपाडवा, दिवाळी, दसरा सवलत' },
    { id: 'meet', label: '💍 वधू-वर मेळावा', desc: 'परळी, बीड, पुणे थेट गाठीभेटी' },
    { id: 'profiles', label: '🌟 नवीन स्थळे अपडेट', desc: 'उच्चशिक्षित व अधिकारी प्रोफाईल्स' },
    { id: 'offer', label: '🎁 VIP सवलत ऑफर', desc: 'प्रीमियम प्लॅन विशेष डिस्काउंट' },
    { id: 'blessing', label: '🚩 संत भगवान बाबा', desc: 'आशिर्वाद व सद्भावना संदेश' }
  ];

  // Theme gradient styles mapping
  const themeStyles = {
    gold: {
      name: 'शाही सोनेरी (Royal Gold)',
      border: 'border-amber-400',
      header: 'from-amber-500 via-amber-400 to-amber-600',
      title: 'text-amber-300',
      button: 'from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400',
      badge: 'bg-red-600 text-amber-200 border-amber-400/50',
      container: 'from-slate-900 via-slate-900 to-amber-950/90'
    },
    crimson: {
      name: 'मंगलमय लाल (Festive Crimson)',
      border: 'border-rose-400',
      header: 'from-[#800C1E] via-rose-600 to-[#800C1E]',
      title: 'text-rose-300',
      button: 'from-rose-600 via-red-500 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600',
      badge: 'bg-amber-400 text-slate-950 border-amber-300',
      container: 'from-slate-950 via-slate-900 to-[#800C1E]/80'
    },
    emerald: {
      name: 'समृद्ध हिरवा (Prosperity Emerald)',
      border: 'border-emerald-400',
      header: 'from-emerald-700 via-emerald-600 to-teal-700',
      title: 'text-emerald-300',
      button: 'from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500',
      badge: 'bg-emerald-600 text-white border-emerald-300/40',
      container: 'from-slate-950 via-slate-900 to-emerald-950/80'
    },
    sapphire: {
      name: 'दिव्य निळा (Devotional Sapphire)',
      border: 'border-blue-400',
      header: 'from-indigo-700 via-blue-600 to-indigo-800',
      title: 'text-sky-300',
      button: 'from-blue-500 via-indigo-400 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500',
      badge: 'bg-amber-400 text-slate-950 border-amber-300',
      container: 'from-slate-950 via-slate-900 to-indigo-950/80'
    },
    custom: {
      name: 'कस्टम डार्क (Dark Modern)',
      border: 'border-slate-500',
      header: 'from-slate-700 via-slate-600 to-slate-800',
      title: 'text-white',
      button: 'from-slate-200 via-white to-slate-300 text-slate-950 hover:bg-white',
      badge: 'bg-slate-700 text-slate-200 border-slate-500',
      container: 'from-slate-950 via-slate-900 to-slate-900'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.gold;

  // AI Generation Trigger
  const handleGenerateWithAi = async (presetCategory?: string) => {
    setIsGeneratingAi(true);
    const cat = presetCategory || selectedPreset;

    try {
      const response = await fetch('/api/admin/generate-popup-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim() || undefined,
          tone: aiTone,
          category: cat,
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        if (d.title) setTitle(d.title);
        if (d.titleEn) setTitleEn(d.titleEn);
        if (d.subtitle) setSubtitle(d.subtitle);
        if (d.subtitleEn) setSubtitleEn(d.subtitleEn);
        if (d.buttonText) setButtonText(d.buttonText);
        if (d.buttonTextEn) setButtonTextEn(d.buttonTextEn);
        if (d.badgeText) setBadgeText(d.badgeText);
        if (d.theme) setTheme(d.theme);
        if (d.imageUrl) setImageUrl(d.imageUrl);
        setIsEnabled(true);
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Instant Quick Disable Action
  const handleToggleInstant = (newVal: boolean) => {
    setIsEnabled(newVal);
    updateSiteConfig({
      isFlashAdEnabled: newVal
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Save All Settings
  const handleSaveAll = () => {
    updateSiteConfig({
      isFlashAdEnabled: isEnabled,
      flashAdTitle: title.trim(),
      flashAdTitleEn: titleEn.trim(),
      flashAdSubtitle: subtitle.trim(),
      flashAdSubtitleEn: subtitleEn.trim(),
      flashAdImageUrl: imageUrl.trim(),
      flashAdLinkUrl: linkUrl.trim(),
      flashAdButtonText: buttonText.trim(),
      flashAdButtonTextEn: buttonTextEn.trim(),
      flashAdBadgeText: badgeText.trim(),
      flashAdTheme: theme,
      flashAdDisplayMode: displayMode,
      flashAdAutoCloseSeconds: Number(autoCloseSeconds),
      flashAdDelaySeconds: Number(delaySeconds)
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      
      {/* 🚀 Top Banner & Master Status */}
      <div className={`p-5 rounded-3xl border-2 shadow-xl transition-all ${
        isEnabled
          ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-900/80 border-emerald-400/80 text-white'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-slate-700 text-slate-300'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border shrink-0 ${
              isEnabled
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  📢 ॲप ओपन स्टार्टअप पॉपअप व्यवस्थापक (Popup Manager)
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isEnabled ? '● सक्रिय (ACTIVE)' : '○ बंद (DISABLED)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isEnabled
                  ? 'वापरकर्त्याने ॲप उघडल्यास खालील आकर्षक पॉपअप सूचना स्क्रीनवर दिसेल.'
                  : 'पॉपअप पूर्णपणे बंद आहे. ॲप उघडल्यावर वापरकर्त्यांना कोणतीही जाहिरात किंवा पॉपअप दिसणार नाही.'}
              </p>
            </div>
          </div>

          {/* Quick Toggle Controls */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {isEnabled ? (
              <button
                type="button"
                onClick={() => handleToggleInstant(false)}
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 border border-rose-400 cursor-pointer transition-all"
              >
                <EyeOff className="w-4 h-4" />
                <span>पॉपअप त्वरित बंद करा (Turn OFF)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleInstant(true)}
                className="w-full md:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 border border-emerald-400 cursor-pointer transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>पॉपअप सुरू करा (Turn ON)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 border border-amber-300 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>पब्लिश व सेव्ह करा</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-400 rounded-2xl text-emerald-200 text-xs font-black flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>✅ पॉपअप सेटिंग्स सर्व्हरवर यशस्वीरीत्या सेव्ह झाल्या आहेत आणि सर्व युझर्ससाठी लागू झाल्या आहेत!</span>
        </div>
      )}

      {/* 🤖 Section 1: AI-Powered Smart Popup Generator */}
      <div className="p-6 bg-gradient-to-b from-slate-900 to-indigo-950/80 rounded-3xl border-2 border-indigo-400/50 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-indigo-200">
                ✨ AI द्वारे आकर्षक व प्रभावशाली पॉपअप बनवा (AI Popup Creator)
              </h3>
              <p className="text-[11px] text-slate-300">
                Gemini 3.8 Flash AI च्या साहाय्याने १ सेकंदात प्रभावी मराठी हेडलाईन्स, मेळावा सूचना व सवलत जाहिराती तयार करा.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Preset Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            १. लोकप्रिय विषय निवडा (१-क्लिक जनरेटर):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPreset(p.id);
                  handleGenerateWithAi(p.id);
                }}
                disabled={isGeneratingAi}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPreset === p.id
                    ? 'bg-indigo-600/40 border-amber-400 shadow-md text-white'
                    : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400 text-slate-300'
                }`}
              >
                <div className="font-black text-xs text-amber-300">{p.label}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              २. किंवा स्वतःचा विषय / घोषणा लिहा (Custom Topic):
            </label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="उदा. अक्षय्य तृतीया विशेष मोफत नोंदणी, किंवा नाशिक जिल्हा मेळावा..."
              className="w-full p-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
            />
          </div>

          <div className="sm:col-span-4 flex items-end">
            <button
              type="button"
              onClick={() => handleGenerateWithAi()}
              disabled={isGeneratingAi}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 border border-amber-200 cursor-pointer disabled:opacity-60 transition-all"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>AI तयार करत आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>AI ने नवीन पॉपअप बनवा</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Section 2: Live Screen Preview & Customization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Live Interactive Mobile Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#A71930]" />
              <span>लाईव्ह स्क्रीन प्रिव्ह्यू (Live Mobile Preview)</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold">
              {isEnabled ? '🟢 वापरकर्त्यांना दिसेल' : '🔴 बंद स्थितीत'}
            </span>
          </div>

          {/* Phone Frame Simulator */}
          <div className="relative bg-slate-950 p-4 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden min-h-[460px] flex items-center justify-center">
            
            {/* Pop-up Box Model inside Mobile Screen */}
            <div className={`relative w-full max-w-sm rounded-2xl border-2 ${currentTheme.border} bg-gradient-to-b ${currentTheme.container} text-white shadow-2xl overflow-hidden`}>
              
              {/* Top Countdown Bar */}
              <div className={`bg-gradient-to-r ${currentTheme.header} px-3 py-1.5 flex items-center justify-between text-slate-950 font-black text-[11px]`}>
                <div className="flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5 animate-bounce" />
                  <span className="truncate">{badgeText || 'विशेष सूचना'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {autoCloseSeconds > 0 && (
                    <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded font-mono">
                      {autoCloseSeconds}s
                    </span>
                  )}
                  <span className="text-slate-900 font-bold">✕</span>
                </div>
              </div>

              {/* Banner Image */}
              {imageUrl && (
                <div className="relative w-full h-36 bg-slate-900 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black border shadow ${currentTheme.badge}`}>
                    ★ खास अपडेट
                  </div>
                </div>
              )}

              {/* Text Body */}
              <div className="p-4 space-y-2 text-center">
                <h4 className={`text-sm font-black ${currentTheme.title} leading-snug`}>
                  {title || 'शीर्षक प्रविष्ट करा'}
                </h4>
                <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                  {subtitle || 'उपशीर्षक किंवा सविस्तर माहिती येथे दिसेल...'}
                </p>

                {/* Buttons */}
                <div className="pt-2 flex flex-col gap-1.5">
                  <button
                    type="button"
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 border border-amber-200/50 bg-gradient-to-r ${currentTheme.button}`}
                  >
                    <span>{buttonText || 'अधिक माहिती'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <div className="text-[10px] text-slate-400 py-0.5">
                    बंद करा ({autoCloseSeconds}s)
                  </div>
                </div>
              </div>

              {/* Bottom Progress Line */}
              {autoCloseSeconds > 0 && (
                <div className="w-full h-1 bg-slate-800">
                  <div className="w-3/4 h-full bg-amber-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Configuration Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-2 border-b">
              <Sliders className="w-4 h-4 text-[#A71930]" />
              <span>मॅन्युअल कस्टमायझेशन (Manual Settings)</span>
            </h3>

            {/* Title Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  १. मुख्य शीर्षक (Marathi Title):
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="उदा. 🎯 राज्यस्तरीय भव्य वंजारी वधू-वर मेळावा २०२६"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  २. उपशीर्षक व तपशील (Description):
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="सविस्तर संदेश, वेळ, ठिकाण किंवा सवलतीचे वर्णन..."
                />
              </div>
            </div>

            {/* Action Buttons & Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ३. ॲक्शन बटण मजकूर (Button Text):
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                  placeholder="उदा. आत्ताच नाव नोंदवा ➔"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ४. ॲक्शन लिंक (Button Link URL):
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                  placeholder="Telegram / WhatsApp / Registration URL"
                />
              </div>
            </div>

            {/* Image URL & Preset Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                ५. बॅनर इमेज URL (Banner Image):
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                placeholder="https://... इमेज लिंक टाका"
              />
              
              {/* Quick Stock Images */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-[10px] text-slate-500 font-bold shrink-0">सुचवलेले फोटो:</span>
                {[
                  { name: 'विवाह', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200' },
                  { name: 'मेळावा', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200' },
                  { name: 'जोडी', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200' },
                  { name: 'भगवान बाबा', url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1200' }
                ].map((st, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImageUrl(st.url)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-[10px] font-bold text-slate-700 hover:text-amber-900 border border-slate-200 cursor-pointer shrink-0"
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes & Display Mode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ६. रंगसंगती (Color Theme):
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="gold">🏆 शाही सोनेरी (Royal Gold)</option>
                  <option value="crimson">🌹 मंगलमय लाल (Festive Crimson)</option>
                  <option value="emerald">🌿 समृद्ध हिरवा (Emerald Green)</option>
                  <option value="sapphire">🔷 दिव्य निळा (Devotional Sapphire)</option>
                  <option value="custom">⚙️ कस्टम डार्क (Dark Modern)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ७. डिस्प्ले स्टाईल (Display Mode):
                </label>
                <select
                  value={displayMode}
                  onChange={(e) => setDisplayMode(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="popup_modal">🎯 मध्यभागी पॉपअप (Center Modal)</option>
                  <option value="top_slide">⬇️ वरून स्लाईड बॅनर (Top Slide)</option>
                  <option value="bottom_float">↗️ खाली उजव्या बाजूला फ्लोट (Bottom Float)</option>
                </select>
              </div>
            </div>

            {/* Timers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ८. ऑटो-क्लोज वेळ (Auto Close):
                </label>
                <select
                  value={autoCloseSeconds}
                  onChange={(e) => setAutoCloseSeconds(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                >
                  <option value={5}>५ सेकंद (Fast)</option>
                  <option value={8}>८ सेकंद (Recommended)</option>
                  <option value={12}>१२ सेकंद</option>
                  <option value={15}>१५ सेकंद</option>
                  <option value={0}>फक्त युजरने बंद करेपर्यंत (No Auto-close)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ९. पॉपअप दिसण्याचा उशीर (Delay):
                </label>
                <select
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                >
                  <option value={0.5}>०.५ सेकंद (तात्काळ)</option>
                  <option value={1}>१ सेकंद (उत्तम)</option>
                  <option value={2}>२ सेकंद</option>
                  <option value={3}>३ सेकंद</option>
                </select>
              </div>
            </div>

            {/* Save Buttons at Bottom */}
            <div className="pt-4 border-t flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('flash_ad_dismissed');
                  alert('कॅश रिसेट केला! आता ॲपमध्ये पॉपअप पुन्हा दिसेल.');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>प्रिव्ह्यू कॅश रिसेट करा</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-6 py-3 rounded-2xl bg-[#800C1E] hover:bg-[#A71930] text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>सर्व बदल सेव्ह व पब्लिश करा (Publish)</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
