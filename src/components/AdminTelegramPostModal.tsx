import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { formatMemberId } from '../utils/idUtils';
import { safeHtml2Canvas } from '../utils/safeHtml2Canvas';
import {
  Send,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
  Share2,
  Smartphone,
  QrCode,
  Image as ImageIcon,
  Lock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface AdminTelegramPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const AdminTelegramPostModal: React.FC<AdminTelegramPostModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  const { siteConfig } = useApp();
  const [maskMode, setMaskMode] = useState<'partial' | 'full_hide' | 'admin_contact' | 'show'>(
    'partial'
  );
  const [includeAppLinks, setIncludeAppLinks] = useState(true);
  const [includeFamilyDetails, setIncludeFamilyDetails] = useState(true);
  const [customNote, setCustomNote] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImageLink, setCopiedImageLink] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !profile) return null;

  const cleanId = formatMemberId(profile.id);
  const primaryPhoto = (profile.photos && profile.photos[0]) || profile.photoUrl || '';
  const siteDomain = siteConfig?.canonicalDomain || 'https://vanjarijodi.com';

  // Format mobile number based on mask mode
  const getDisplayMobileText = () => {
    const rawMobile = profile.mobile || '';
    if (maskMode === 'show') {
      return rawMobile ? `📞 मोबाईल: ${rawMobile}` : '📞 मोबाईल: उपलब्ध नाही';
    }
    if (maskMode === 'full_hide') {
      return '🔒 मोबाईल: ॲपमध्ये उपलब्ध (सुरक्षिततेसाठी लपवला आहे)';
    }
    if (maskMode === 'admin_contact') {
      const tgAdmin = siteConfig?.telegramUsername || 'Primemultiservice';
      return `🔒 संपर्क: ॲडमिन टेलिग्राम @${tgAdmin.replace(/^@/, '')} किंवा ॲप डाऊनलोड करा`;
    }
    // Default 'partial': Show first 4 digits, mask remaining
    if (rawMobile && rawMobile.length >= 10) {
      const first4 = rawMobile.substring(0, 4);
      return `📞 मोबाईल: ${first4}****** (सुरक्षिततेसाठी लपवला आहे)`;
    }
    return '📞 मोबाईल: 🔒 ॲपमध्ये उपलब्ध';
  };

  // Generate structured Telegram Post Text
  const generateTelegramPostText = () => {
    const genderLabel = profile.gender === 'bride' ? 'वधू (Bride)' : 'वर (Groom)';
    const maritalStatusLabel =
      profile.maritalStatus === 'never_married'
        ? 'अविवाहित (Never Married)'
        : profile.maritalStatus === 'divorced'
        ? 'घटस्फोटित (Divorced)'
        : profile.maritalStatus === 'widowed'
        ? 'विधवा/विधुर (Widowed)'
        : 'इतर';

    let text = `🚩 *वंजारी जोडी मॅट्रिमोनी - टेलिग्राम विशेष बायोडाटा* 🚩\n\n`;
    text += `🆔 *बायोडाटा ID:* ${cleanId}\n`;
    text += `👤 *नाव:* ${profile.fullName}\n`;
    text += `🚻 *प्रकार:* ${genderLabel}\n`;
    text += `🎂 *वय:* ${profile.age || '--'} वर्षे | 📏 *उंची:* ${profile.height || '--'}\n`;
    text += `💍 *वैवाहिक स्थिती:* ${maritalStatusLabel}\n`;
    text += `🎓 *शिक्षण:* ${profile.education || '--'}\n`;
    text += `💼 *नोकरी/व्यवसाय:* ${profile.occupation || '--'}\n`;
    if (profile.income) {
      text += `💰 *वार्षिक उत्पन्न:* ${profile.income}\n`;
    }

    text += `\n📍 *जिल्हा:* ${profile.district || '--'} | 🏠 *तालुका:* ${profile.taluka || '--'}\n`;
    if (profile.village || (profile as any).nativePlace) {
      text += `🏡 *मूळ गाव:* ${profile.village || (profile as any).nativePlace}\n`;
    }
    text += `🌟 *पोटजात:* ${profile.subCaste || 'वंजारी'} | 🌟 *गोत्र:* ${profile.gotra || 'माहित नाही'}\n`;
    if (profile.rashi) {
      text += `🔯 *राशी:* ${profile.rashi}`;
      if ((profile as any).mangal) {
        text += ` | *मंगळ:* ${(profile as any).mangal}`;
      }
      text += `\n`;
    }

    if (includeFamilyDetails) {
      text += `\n👨‍👩‍👧‍👦 *कौटुंबिक माहिती:*\n`;
      if (profile.fatherName || profile.fatherOccupation) {
        text += `• वडिलांचे नाव: ${profile.fatherName || '--'} (${profile.fatherOccupation || 'शेती/व्यवसाय'})\n`;
      }
      if ((profile as any).brothers || (profile as any).sisters) {
        text += `• भाऊ: ${(profile as any).brothers || '०'} | बहीण: ${(profile as any).sisters || '०'}\n`;
      }
      if (profile.mamaName || (profile as any).mamaSurname) {
        text += `• मामांचे नाव/आडनाव: ${profile.mamaName || (profile as any).mamaSurname}\n`;
      }
    }

    text += `\n${getDisplayMobileText()}\n`;

    if (customNote) {
      text += `\n📝 *टीप:* ${customNote}\n`;
    }

    if (includeAppLinks) {
      text += `\n📲 *संपूर्ण बायोडाटा, पत्रिका जुळवणी व संपर्क क्रमांक पाहण्यासाठी आजच 'वंजारी जोडी' ॲप डाऊनलोड करा:*\n`;
      text += `👉 ${siteDomain}\n`;
    }

    text += `\n॥ श्री संत भगवान बाबा प्रसन्न ॥`;
    return text;
  };

  const fullPostText = generateTelegramPostText();

  // Copy text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullPostText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Copy primary photo link to clipboard
  const handleCopyPhotoLink = async () => {
    if (!primaryPhoto) return;
    try {
      await navigator.clipboard.writeText(primaryPhoto);
      setCopiedImageLink(true);
      setTimeout(() => setCopiedImageLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy photo link:', err);
    }
  };

  // Open Telegram share dialog
  const handleShareToTelegram = () => {
    const encodedText = encodeURIComponent(fullPostText);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(siteDomain)}&text=${encodedText}`;
    window.open(tgUrl, '_blank');
  };

  // Download high-resolution photo card as PNG
  const handleDownloadCardImage = async () => {
    if (!cardRef.current) return;
    setIsGeneratingImage(true);
    try {
      const canvas = await safeHtml2Canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#FFFDF5',
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      const link = document.createElement('a');
      link.download = `Telegram_BioData_${cleanId}_${profile.fullName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
      alert('फोटो बनवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center">
      <div className="relative w-full max-w-4xl bg-[#FFFDF5] border-2 border-amber-400 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-800 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#660714] via-[#850D1E] to-[#660714] text-white p-3.5 sm:p-4 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
              <Send className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-amber-100 flex items-center gap-2">
                <span>📢 टेलिग्राम बायोडाटा पोस्ट मेकर</span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase font-mono">
                  Admin
                </span>
              </h2>
              <p className="text-[11px] text-amber-200/90 font-medium">
                मोबाईल नंबर लपवून टेलिग्राम ग्रुप व चॅनेलसाठी आकर्षक पोस्ट तयार करा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Controls Grid */}
          <div className="bg-amber-500/10 border border-amber-300/60 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-extrabold text-[#800C1E] flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>मोबाईल नंबर गोपनीयता (Mobile Privacy Settings):</span>
              </label>
              <span className="text-[11px] font-bold text-slate-600">
                वर्तमान निवड: <strong className="text-emerald-700">{getDisplayMobileText()}</strong>
              </span>
            </div>

            {/* Mask Mode Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMaskMode('partial')}
                className={`p-2 rounded-xl border text-left font-bold transition flex flex-col gap-0.5 cursor-pointer ${
                  maskMode === 'partial'
                    ? 'bg-[#800C1E] text-white border-[#800C1E] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                }`}
              >
                <span className="flex items-center gap-1 text-[11px]">
                  <Lock className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>४ अंक लपवा</span>
                </span>
                <span className="text-[9.5px] opacity-80 font-mono">उदा. 9822******</span>
              </button>

              <button
                type="button"
                onClick={() => setMaskMode('full_hide')}
                className={`p-2 rounded-xl border text-left font-bold transition flex flex-col gap-0.5 cursor-pointer ${
                  maskMode === 'full_hide'
                    ? 'bg-[#800C1E] text-white border-[#800C1E] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                }`}
              >
                <span className="flex items-center gap-1 text-[11px]">
                  <EyeOff className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>संपूर्ण लपवा</span>
                </span>
                <span className="text-[9.5px] opacity-80">🔒 ॲपमध्ये उपलब्ध</span>
              </button>

              <button
                type="button"
                onClick={() => setMaskMode('admin_contact')}
                className={`p-2 rounded-xl border text-left font-bold transition flex flex-col gap-0.5 cursor-pointer ${
                  maskMode === 'admin_contact'
                    ? 'bg-[#800C1E] text-white border-[#800C1E] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                }`}
              >
                <span className="flex items-center gap-1 text-[11px]">
                  <MessageSquare className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>ॲडमिन संपर्क</span>
                </span>
                <span className="text-[9.5px] opacity-80">@Primemultiservice</span>
              </button>

              <button
                type="button"
                onClick={() => setMaskMode('show')}
                className={`p-2 rounded-xl border text-left font-bold transition flex flex-col gap-0.5 cursor-pointer ${
                  maskMode === 'show'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                }`}
              >
                <span className="flex items-center gap-1 text-[11px]">
                  <Eye className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span>पूर्ण दाखवा</span>
                </span>
                <span className="text-[9.5px] opacity-80 font-mono">उदा. 9822100102</span>
              </button>
            </div>

            {/* Additional Options */}
            <div className="flex items-center gap-4 flex-wrap pt-1 border-t border-amber-300/40 text-slate-700 font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFamilyDetails}
                  onChange={(e) => setIncludeFamilyDetails(e.target.checked)}
                  className="rounded text-[#800C1E] focus:ring-[#800C1E] w-3.5 h-3.5"
                />
                <span>कौटुंबिक माहिती दाखवा (Family Info)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAppLinks}
                  onChange={(e) => setIncludeAppLinks(e.target.checked)}
                  className="rounded text-[#800C1E] focus:ring-[#800C1E] w-3.5 h-3.5"
                />
                <span>ॲप डाऊनलोड व नोंदणी लिंक जोडा</span>
              </label>
            </div>

            {/* Custom Admin Note Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                विशेष टिप / संदेश जोडा (Optional Custom Note):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="उदा. 'कृपया गंभीर पालकांनीच संपर्क साधावा' किंवा 'अतिशय सुशिक्षित स्थळ'"
                className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-medium text-xs focus:outline-none focus:border-[#800C1E]"
              />
            </div>
          </div>

          {/* Two-Column Section: Left Text Preview, Right Photo Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Formatted Telegram Text */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#800C1E] text-xs flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-amber-600" />
                  <span>टेलिग्राम पोस्ट टेक्स्ट (Telegram Formatted Text):</span>
                </span>
                <button
                  onClick={handleCopyText}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-lg font-bold text-[11px] border border-amber-300 flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>कॉपी झाले!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>टेक्स्ट कॉपी करा</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                value={fullPostText}
                rows={14}
                className="w-full p-3 rounded-2xl border border-amber-300 bg-amber-50/40 text-slate-900 font-mono text-[11.5px] leading-relaxed resize-none focus:outline-none shadow-inner select-all"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleShareToTelegram}
                  className="flex-1 py-2.5 bg-[#229ED9] hover:bg-[#1C82B4] text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-xs"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>🚀 टेलिग्रामवर थेट पाठवा</span>
                </button>

                {primaryPhoto && (
                  <button
                    onClick={handleCopyPhotoLink}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs shrink-0"
                    title="फोटोची लिंक कॉपी करा"
                  >
                    {copiedImageLink ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-slate-600" />
                    )}
                    <span>{copiedImageLink ? 'लिंक कॉपी झाली!' : 'फोटो लिंक'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Visual Photo Card for Telegram */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#800C1E] text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>टेलिग्राम फोटो कार्ड (Telegram Visual Banner):</span>
                </span>
                <button
                  onClick={handleDownloadCardImage}
                  disabled={isGeneratingImage}
                  className="px-2.5 py-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 hover:from-amber-500 hover:to-amber-600 font-black text-[11px] rounded-lg border border-amber-300 flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingImage ? 'डाउनलोड होत आहे...' : '📸 फोटो कार्ड डाउनलोड करा'}</span>
                </button>
              </div>

              {/* Renderable High-Res Telegram Photo Card */}
              <div
                ref={cardRef}
                className="bg-[#FFFDF5] border-2 border-amber-400 rounded-2xl p-4 shadow-md space-y-3 font-sans text-slate-900 relative overflow-hidden"
                style={{
                  fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif"
                }}
              >
                {/* Decorative Top Banner */}
                <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white p-2.5 rounded-xl flex items-center justify-between border-b-2 border-amber-400 shadow-xs">
                  <div>
                    <h3 className="font-black text-sm text-amber-200">
                      वंजारी जोडी (VanjariJodi) अधिकृत विवाह मंच
                    </h3>
                    <p className="text-[10px] text-amber-100 font-bold">
                      🚩 वंजारी समाज वधू-वर सूचक केंद्र
                    </p>
                  </div>
                  <span className="bg-amber-400 text-slate-950 font-black font-mono text-[11px] px-2.5 py-1 rounded-lg border border-amber-200 shadow-xs">
                    ID: {cleanId}
                  </span>
                </div>

                {/* Candidate Photo + Details Header */}
                <div className="flex gap-3.5 items-center bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                  {/* Candidate Photo */}
                  <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center text-slate-400 relative">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto}
                        alt={profile.fullName}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <ImageIcon className="w-8 h-8 mx-auto text-amber-600 mb-1" />
                        <span className="text-[9px] font-bold text-slate-500">फोटो उपलब्ध नाही</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-xs text-amber-300 font-black text-[8px] py-0.5 text-center rounded">
                      {profile.gender === 'bride' ? 'वधू' : 'वर'}
                    </span>
                  </div>

                  {/* Quick Profile Summary */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <h4 className="font-black text-sm sm:text-base text-[#800C1E] truncate">
                      {profile.fullName}
                    </h4>
                    <p className="text-xs font-bold text-slate-700">
                      {profile.age || '--'} वर्षे | {profile.height || '--'}
                    </p>
                    <p className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block border border-emerald-300">
                      🎓 {profile.education || '--'}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      💼 {profile.occupation || '--'}
                    </p>
                  </div>
                </div>

                {/* Structured Details Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <strong className="text-slate-500">📍 जिल्हा:</strong> {profile.district || '--'}
                  </div>
                  <div>
                    <strong className="text-slate-500">🏠 तालुका:</strong> {profile.taluka || '--'}
                  </div>
                  <div>
                    <strong className="text-slate-500">🌟 गोत्र:</strong> {profile.gotra || 'माहित नाही'}
                  </div>
                  <div>
                    <strong className="text-slate-500">🔯 राशी:</strong> {profile.rashi || 'माहित नाही'}
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-1 mt-0.5">
                    <strong className="text-slate-500">👨‍👩‍👧‍👦 कुटुंब:</strong>{' '}
                    {profile.fatherName ? `${profile.fatherName} (${profile.fatherOccupation || 'शेती/व्यवसाय'})` : 'माहिती ॲपमध्ये'}
                  </div>
                </div>

                {/* Masked Mobile Badge */}
                <div className="bg-amber-100 border border-amber-300/80 rounded-xl p-2 flex items-center justify-between text-xs font-black text-[#800C1E]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{getDisplayMobileText()}</span>
                  </span>
                  <span className="text-[10px] bg-[#800C1E] text-white px-2 py-0.5 rounded-md font-bold">
                    ॲपद्वारे संपर्क
                  </span>
                </div>

                {/* Play Store App Promotion Footer */}
                <div className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-between gap-2 border border-slate-700">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>गूगल प्ले स्टोअरवरून 'वंजारी जोडी' ॲप डाऊनलोड करा</span>
                    </p>
                    <p className="text-[9.5px] text-slate-300 font-medium">
                      संपूर्ण बायोडाटा, पत्रिका जुळवणी व थेट संपर्क नंबर मिळवण्यासाठी आजच नोंदणी करा
                    </p>
                  </div>
                  {siteConfig?.biodataPlaystoreQrEnabled !== false && (
                    <div className="shrink-0 flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                          siteDomain
                        )}`}
                        alt="Download QR"
                        className="w-9 h-9 border border-amber-400 p-0.5 bg-white rounded"
                      />
                      <span className="text-[6.5px] font-black bg-amber-400 text-slate-950 px-1 py-0.2 rounded-xs uppercase">
                        Scan App
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-amber-100/60 border-t border-amber-300 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-600 font-semibold hidden sm:block">
            💡 टेलिग्राम ग्रुप वर फोटोसोबत टेक्स्ट पेस्ट करून पोस्ट शेअर करा.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-white hover:bg-amber-50 text-slate-800 font-bold rounded-xl border border-slate-300 transition active:scale-95 cursor-pointer text-xs flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>टेक्स्ट कॉपी</span>
            </button>
            <button
              onClick={handleShareToTelegram}
              className="px-4 py-2 bg-[#229ED9] hover:bg-[#1C82B4] text-white font-extrabold rounded-xl shadow-md transition active:scale-95 cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>टेलिग्राम वर शेअर</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
