import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { safeHtml2Canvas } from '../utils/safeHtml2Canvas';
import jsPDF from 'jspdf';
import { uploadToCloudinary, compressAndResizeImage } from '../utils/cloudinary';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import {
  X,
  FileText,
  Download,
  Printer,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Palette,
  Heart,
  User,
  Phone,
  Home,
  Scroll,
  Loader2,
  Trash2,
  Share2,
} from 'lucide-react';

interface BioDataFormState {
  headerBlessing: string;
  fullName: string;
  gender: 'bride' | 'groom';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  height: string;
  complexion: string;
  bloodGroup: string;
  education: string;
  occupation: string;
  income: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  brothers: string;
  sisters: string;
  nativePlace: string;
  mamaName: string;
  relatives: string;
  rashi: string;
  nakshatra: string;
  gotra: string;
  devak: string;
  nadi: string;
  mangal: string;
  mobile: string;
  whatsapp: string;
  address: string;
  expectations: string;
  jobTitle: string;
  businessTitle: string;
  chultaName: string;
  customFields: { id: string; label: string; value: string; section: 'personal' | 'astrology' | 'family' | 'contact' }[];
  candidatePhotoUrl?: string;
  linkToPortal: boolean; // CRITICAL: Save to portal database or keep private
}

export const BioDataMakerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { registerCandidateDirectly, siteConfig } = useApp();

  const [theme, setTheme] = useState<'royal_red' | 'emerald_gold' | 'navy_gold'>('royal_red');
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRegisteredNotice, setIsRegisteredNotice] = useState<string | null>(null);

  const previewCardRef = useRef<HTMLDivElement>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<BioDataFormState>({
    headerBlessing: '॥ श्री गणेशाय नमः ॥  ॥ श्री संत भगवान बाबा प्रसन्न ॥',
    fullName: '',
    gender: 'groom',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    height: '',
    complexion: '',
    bloodGroup: '',
    education: '',
    occupation: '',
    jobTitle: '',
    businessTitle: '',
    income: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    brothers: '',
    sisters: '',
    chultaName: '',
    nativePlace: '',
    mamaName: '',
    relatives: '',
    rashi: '',
    nakshatra: '',
    gotra: '',
    devak: '',
    nadi: '',
    mangal: '',
    mobile: '',
    whatsapp: '',
    address: '',
    expectations: '',
    candidatePhotoUrl: undefined,
    linkToPortal: false, // Default: FALSE (Does NOT save to database unless requested)
    customFields: [],
  });

  if (!isOpen) return null;

  const handleChange = (key: keyof BioDataFormState, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const addCustomField = (section: 'personal' | 'astrology' | 'family' | 'contact') => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      value: '',
      section,
    };
    setFormData(prev => ({ ...prev, customFields: [...prev.customFields, newField] }));
  };

  const updateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map(f => f.id === id ? { ...f, [key]: val } : f)
    }));
  };

  const removeCustomField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== id)
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const comp = await compressAndResizeImage(file, 800, 0.85);
      const res = await uploadToCloudinary(comp.file, 'vanjarijodi_biodata_photos');
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, candidatePhotoUrl: res.url }));
      } else {
        setFormData((prev) => ({ ...prev, candidatePhotoUrl: comp.dataUrl }));
      }
    } catch (err) {
      console.warn('Photo upload fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, candidatePhotoUrl: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Download JPG Image Function
  const handleDownloadJPG = async () => {
    if (!exportCardRef.current) return;
    setIsExportingJpg(true);
    try {
      // Save/Link to portal database if checkbox is enabled
      if (formData.linkToPortal && formData.fullName && formData.mobile) {
        handleSaveToPortalIfEnabled();
      }

      const canvas = await safeHtml2Canvas(exportCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const image = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      const filename = `Biodata_${(formData.fullName || 'VanjariJodi').replace(/\s+/g, '_')}.jpg`;
      link.href = image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating JPG:', err);
      alert('JPG डाऊनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsExportingJpg(false);
    }
  };

  // Download PDF Document Function
  const handleDownloadPDF = async () => {
    if (!exportCardRef.current) return;
    setIsExportingPdf(true);
    try {
      // Save/Link to portal database if checkbox is enabled
      if (formData.linkToPortal && formData.fullName && formData.mobile) {
        handleSaveToPortalIfEnabled();
      }

      const canvas = await safeHtml2Canvas(exportCardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const filename = `Biodata_${(formData.fullName || 'VanjariJodi').replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('PDF डाऊनलोड करताना त्रुटी आली. पुन्हा प्रयत्न करा.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveToPortalIfEnabled = () => {
    if (!formData.fullName || !formData.mobile) {
      alert('पोर्टलवर सेव्ह करण्यासाठी कृपया तुमचे पूर्ण नाव व मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    try {
      registerCandidateDirectly({
        fullName: formData.fullName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        height: formData.height,
        education: formData.education,
        occupation: formData.occupation,
        district: formData.nativePlace,
        taluka: formData.nativePlace,
        mobileNumber: formData.mobile,
        whatsappNumber: formData.whatsapp || formData.mobile,
        photos: formData.candidatePhotoUrl ? [formData.candidatePhotoUrl] : [],
        aboutMe: `ऑनलाइन बायोडाटा मेकर द्वारे तयार केलेले प्रोफाइल. जन्मवेळ: ${formData.birthTime}, गोत्र: ${formData.gotra}`,
      });
      setIsRegisteredNotice('✅ बायोडाटा वंजारी जोडी मॅट्रिमोनी पोर्टलवर यशस्वीरित्या सेव्ह व रजिस्टर्ड झाला आहे!');
    } catch (e) {
      console.error('Save to portal failed:', e);
    }
  };

  // Theme Styles
  const themeStyles = {
    royal_red: {
      border: 'border-8 border-double border-[#A71930]',
      bg: 'bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40',
      headerBg: 'bg-[#A71930] text-amber-200',
      headingText: 'text-[#A71930]',
      badgeBg: 'bg-[#A71930]/10 text-[#A71930] border-[#A71930]/30',
      labelColor: 'text-[#800C1E]',
      lineDivider: 'border-[#A71930]/30',
    },
    emerald_gold: {
      border: 'border-8 border-double border-emerald-800',
      bg: 'bg-gradient-to-b from-emerald-50/50 via-white to-amber-50/30',
      headerBg: 'bg-emerald-800 text-amber-200',
      headingText: 'text-emerald-900',
      badgeBg: 'bg-emerald-800/10 text-emerald-800 border-emerald-800/30',
      labelColor: 'text-emerald-900',
      lineDivider: 'border-emerald-800/30',
    },
    navy_gold: {
      border: 'border-8 border-double border-slate-900',
      bg: 'bg-gradient-to-b from-slate-50 via-white to-amber-50/30',
      headerBg: 'bg-slate-900 text-amber-300',
      headingText: 'text-slate-900',
      badgeBg: 'bg-slate-900/10 text-slate-900 border-slate-900/30',
      labelColor: 'text-slate-900',
      lineDivider: 'border-slate-800/30',
    },
  }[theme];

  const exportThemeStyles = {
    royal_red: {
      primaryColor: '#A71930',
      secondaryColor: '#800C1E',
      textColor: '#1e293b',
      bgColor: '#FFFDF5',
      accentColor: '#d97706',
      borderColor: '#A71930',
      badgeBg: '#fef2f2',
      tableHeaderBg: '#A71930',
      tableHeaderTextColor: '#fef3c7',
      lightBorderColor: 'rgba(167, 25, 48, 0.2)',
    },
    emerald_gold: {
      primaryColor: '#064e3b',
      secondaryColor: '#022c22',
      textColor: '#1e293b',
      bgColor: '#F4FBF7',
      accentColor: '#d97706',
      borderColor: '#064e3b',
      badgeBg: '#ecfdf5',
      tableHeaderBg: '#064e3b',
      tableHeaderTextColor: '#fef3c7',
      lightBorderColor: 'rgba(6, 78, 59, 0.2)',
    },
    navy_gold: {
      primaryColor: '#0f172a',
      secondaryColor: '#020617',
      textColor: '#1e293b',
      bgColor: '#F8FAFC',
      accentColor: '#d97706',
      borderColor: '#0f172a',
      badgeBg: '#f1f5f9',
      tableHeaderBg: '#0f172a',
      tableHeaderTextColor: '#fde047',
      lightBorderColor: 'rgba(15, 23, 42, 0.2)',
    },
  }[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-950 rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Modal Bar */}
        <div className="px-5 py-4 bg-slate-900 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 font-black shadow-md">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>मराठी ऑनलाईन बायोडाटा मेकर (BioData Generator)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  १००% मोफत
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                मराठी फॉन्टमध्ये आकर्षक बायोडाटा तयार करा आणि मोफत HD JPG व PDF डाऊनलोड करा.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action / Theme Selection Bar */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0 text-xs">
          {/* Theme Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold flex items-center gap-1">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>थीम निवडा:</span>
            </span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 font-bold">
              <button
                type="button"
                onClick={() => setTheme('royal_red')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  theme === 'royal_red' ? 'bg-[#A71930] text-amber-200 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                👑 शाही लाल
              </button>
              <button
                type="button"
                onClick={() => setTheme('emerald_gold')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  theme === 'emerald_gold' ? 'bg-emerald-800 text-amber-200 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌿 मखमली हिरवा
              </button>
              <button
                type="button"
                onClick={() => setTheme('navy_gold')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  theme === 'navy_gold' ? 'bg-slate-800 text-amber-300 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                💙 क्लासिक निळा
              </button>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2 font-bold">
            <button
              type="button"
              onClick={handleDownloadJPG}
              disabled={isExportingJpg || isExportingPdf}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isExportingJpg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>JPG इमेज डाऊनलोड</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExportingJpg || isExportingPdf}
              className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50 border border-amber-500/40"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>PDF फाईल डाऊनलोड</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content: Left Form Fields & Right Live Preview Card */}
        <div className="grid lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* LEFT COLUMN: BioData Form Inputs */}
          <div className="lg:col-span-6 p-4 sm:p-6 space-y-5 bg-slate-950 border-r border-slate-800 text-xs">
            
            {/* PORTAL SAVING TOGGLE OPTION */}
            <div className="p-4 bg-slate-900 rounded-2xl border-2 border-amber-500/40 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.linkToPortal}
                  onChange={(e) => handleChange('linkToPortal', e.target.checked)}
                  className="w-5 h-5 rounded border-amber-500 text-amber-500 focus:ring-amber-400 mt-0.5 cursor-pointer shrink-0"
                />
                <div>
                  <span className="font-black text-amber-300 text-xs sm:text-sm block">
                    🔗 हा बायोडाटा वंजारी जोडी मॅट्रिमोनी पोर्टलवर जोडायचा आहे का?
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {formData.linkToPortal ? (
                      <span className="text-emerald-400 font-bold">
                        ✅ होय! डाऊनलोड करण्यासोबत हा बायोडाटा वंजारी जोडी पोर्टलवर नवीन वधू/वर प्रोफाइल म्हणून सेव्ह होईल.
                      </span>
                    ) : (
                      <span className="text-amber-200">
                        🔒 नाही! (डिफॉल्ट) हा बायोडाटा खाजगी राहील. तो फक्त तुमच्या मोबाईलवर JPG/PDF डाउनलोड होईल व आमच्या सिस्टीममध्ये सेव्ह होणार नाही.
                      </span>
                    )}
                  </p>
                </div>
              </label>

              {isRegisteredNotice && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isRegisteredNotice}</span>
                </div>
              )}
            </div>

            {/* Photo Upload Section */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>उमेदवाराचा फोटो जोडा (ऐच्छिक / Optional Photo)</span>
              </label>
              
              {formData.candidatePhotoUrl ? (
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-emerald-500/40">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.candidatePhotoUrl}
                      alt="Candidate"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-400"
                    />
                    <span className="text-emerald-400 font-bold text-xs">फोटो जोडला गेला!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('candidatePhotoUrl', undefined)}
                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 font-bold text-[11px]"
                  >
                    हटवा
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    id="biodata-maker-photo-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="biodata-maker-photo-input"
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold rounded-xl border border-dashed border-amber-500/40 cursor-pointer flex items-center justify-center gap-2 text-xs"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>फोटो अपलोड होत आहे...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>📸 बायोडाटावर दिसेल असा फोटो निवडा</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* FORM FIELD INPUTS */}
            
            {/* Header Blessing */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">१. बायोडाटा शीर्षक व संत आशीर्वाद (Header Blessing):</label>
              <input
                type="text"
                value={formData.headerBlessing}
                onChange={(e) => handleChange('headerBlessing', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-amber-200 font-bold outline-none focus:border-amber-500"
                placeholder="उदा. ॥ श्री गणेशाय नमः ॥ ॥ श्री संत भगवान बाबा प्रसन्न ॥"
              />
            </div>

            {/* Personal Details Group */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-black text-amber-400 text-xs border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>२. वैयक्तिक माहिती (Personal Details)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-400 font-medium">वधू / वर निवडा:</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value as 'bride' | 'groom')}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="groom">वर (मुलग्यासाठी)</option>
                    <option value="bride">वधू (मुलीसाठी)</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-400 font-medium">संपूर्ण नाव:</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="उदा. नाव मधले नाव आडनाव"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">जन्मतारीख:</label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    placeholder="उदा. १५/०८/२००१"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">जन्मवेळ:</label>
                  <input
                    type="text"
                    value={formData.birthTime}
                    onChange={(e) => handleChange('birthTime', e.target.value)}
                    placeholder="उदा. सकाळी ०८:३० वाजता"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">जन्मठिकाण:</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => handleChange('birthPlace', e.target.value)}
                    placeholder="उदा. शहर / जिल्हा"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">उंची:</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="उदा. ५ फूट ६ इंच"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">रंग / कॉम्प्लेक्शन:</label>
                  <input
                    type="text"
                    value={formData.complexion}
                    onChange={(e) => handleChange('complexion', e.target.value)}
                    placeholder="उदा. गोरा"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">रक्तगट (Blood Group):</label>
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    placeholder="उदा. O +ve"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400 font-medium">शिक्षण:</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    placeholder="उदा. B.E. Computer Science, MBA"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">नोकरी (Job):</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    placeholder="उदा. सीनिअर इंजिनीअर (पुणे)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">व्यवसाय (Business):</label>
                  <input
                    type="text"
                    value={formData.businessTitle}
                    onChange={(e) => handleChange('businessTitle', e.target.value)}
                    placeholder="उदा. किराणा दुकान (पुणे)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">वार्षिक उत्पन्न:</label>
                  <input
                    type="text"
                    value={formData.income}
                    onChange={(e) => handleChange('income', e.target.value)}
                    placeholder="उदा. ९ लाख प्रतिवर्ष"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Personal Section Custom Fields */}
              {formData.customFields.filter(f => f.section === 'personal').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-3 mb-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800 relative group">
                  <button onClick={() => removeCustomField(field.id)} className="absolute -top-2 -right-2 p-1 bg-red-900/80 text-white rounded-full shadow hidden group-hover:block"><Trash2 className="w-3 h-3" /></button>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">रकाण्याचे नाव (Label):</label>
                    <input type="text" value={field.label} onChange={(e) => updateCustomField(field.id, 'label', e.target.value)} placeholder="उदा. छंद" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">माहिती (Value):</label>
                    <input type="text" value={field.value} onChange={(e) => updateCustomField(field.id, 'value', e.target.value)} placeholder="उदा. वाचन, संगीत" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button type="button" onClick={() => addCustomField('personal')} className="text-[11px] text-amber-400 font-bold border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-400/10 flex items-center gap-1">+ नवीन रकाना जोडा</button>
              </div>
            </div>

            {/* Horoscope / Kundali Details */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-black text-amber-400 text-xs border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>३. कुंडली / पत्रिका माहिती (Kundali Details)</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-400">रास:</label>
                  <input
                    type="text"
                    value={formData.rashi}
                    onChange={(e) => handleChange('rashi', e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">नक्षत्र:</label>
                  <input
                    type="text"
                    value={formData.nakshatra}
                    onChange={(e) => handleChange('nakshatra', e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">गोत्र:</label>
                  <input
                    type="text"
                    value={formData.gotra}
                    onChange={(e) => handleChange('gotra', e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">देवक:</label>
                  <input
                    type="text"
                    value={formData.devak}
                    onChange={(e) => handleChange('devak', e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">नाडी:</label>
                  <input
                    type="text"
                    value={formData.nadi}
                    onChange={(e) => handleChange('nadi', e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">मंगळ:</label>
                  <input
                    type="text"
                    value={formData.mangal}
                    onChange={(e) => handleChange('mangal', e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Astrology Section Custom Fields */}
              {formData.customFields.filter(f => f.section === 'astrology').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-3 mb-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800 relative group">
                  <button onClick={() => removeCustomField(field.id)} className="absolute -top-2 -right-2 p-1 bg-red-900/80 text-white rounded-full shadow hidden group-hover:block"><Trash2 className="w-3 h-3" /></button>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">रकाण्याचे नाव (Label):</label>
                    <input type="text" value={field.label} onChange={(e) => updateCustomField(field.id, 'label', e.target.value)} placeholder="उदा. चरण" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">माहिती (Value):</label>
                    <input type="text" value={field.value} onChange={(e) => updateCustomField(field.id, 'value', e.target.value)} placeholder="उदा. प्रथम" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button type="button" onClick={() => addCustomField('astrology')} className="text-[11px] text-amber-400 font-bold border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-400/10 flex items-center gap-1">+ नवीन रकाना जोडा</button>
              </div>
            </div>

            {/* Family Details Group */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-black text-amber-400 text-xs border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-amber-400" />
                <span>४. कौटुंबिक माहिती (Family Details)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-400">वडिलांचे नाव & व्यवसाय:</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => handleChange('fatherName', e.target.value)}
                    placeholder="उदा. वडिलांचे पूर्ण नाव (व्यवसाय)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-400">आईचे नाव:</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => handleChange('motherName', e.target.value)}
                    placeholder="उदा. आईचे पूर्ण नाव (व्यवसाय/गृहणी)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">भाऊ:</label>
                  <input
                    type="text"
                    value={formData.brothers}
                    onChange={(e) => handleChange('brothers', e.target.value)}
                    placeholder="उदा. १ भाऊ (विवाहित / अविवाहित)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">बहीण:</label>
                  <input
                    type="text"
                    value={formData.sisters}
                    onChange={(e) => handleChange('sisters', e.target.value)}
                    placeholder="उदा. १ बहीण (विवाहित / अविवाहित)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">चुलता (काका):</label>
                  <input
                    type="text"
                    value={formData.chultaName}
                    onChange={(e) => handleChange('chultaName', e.target.value)}
                    placeholder="उदा. काकांचे पूर्ण नाव"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">मामाचे नाव व मूळ गाव:</label>
                  <input
                    type="text"
                    value={formData.mamaName}
                    onChange={(e) => handleChange('mamaName', e.target.value)}
                    placeholder="उदा. मामांचे नाव व मूळ गाव"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">नातेसंबंध / पाहुणे (Surnames):</label>
                  <input
                    type="text"
                    value={formData.relatives}
                    onChange={(e) => handleChange('relatives', e.target.value)}
                    placeholder="उदा. नातेसंबंधातील विविध आडनावे"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Family Section Custom Fields */}
              {formData.customFields.filter(f => f.section === 'family').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-3 mb-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800 relative group">
                  <button onClick={() => removeCustomField(field.id)} className="absolute -top-2 -right-2 p-1 bg-red-900/80 text-white rounded-full shadow hidden group-hover:block"><Trash2 className="w-3 h-3" /></button>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">रकाण्याचे नाव (Label):</label>
                    <input type="text" value={field.label} onChange={(e) => updateCustomField(field.id, 'label', e.target.value)} placeholder="उदा. नातेसंबंध" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">माहिती (Value):</label>
                    <input type="text" value={field.value} onChange={(e) => updateCustomField(field.id, 'value', e.target.value)} placeholder="उदा. नाव व आडनाव" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button type="button" onClick={() => addCustomField('family')} className="text-[11px] text-amber-400 font-bold border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-400/10 flex items-center gap-1">+ नवीन रकाना जोडा</button>
              </div>
            </div>

            {/* Contact Details Group */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-black text-amber-400 text-xs border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>५. संपर्क व इतर माहिती (Contact Details)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">मोबाईल नंबर:</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="उदा. 9822XXXXXX"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">मूळ गाव / तालुका / जिल्हा:</label>
                  <input
                    type="text"
                    value={formData.nativePlace}
                    onChange={(e) => handleChange('nativePlace', e.target.value)}
                    placeholder="उदा. मूळ गाव, तालुका, जिल्हा"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">संपूर्ण पत्ता:</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="उदा. घराचा किंवा राहण्याचा संपूर्ण पत्ता"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">अपेक्षित वधू/वर (Expectations):</label>
                  <input
                    type="text"
                    value={formData.expectations}
                    onChange={(e) => handleChange('expectations', e.target.value)}
                    placeholder="उदा. सुशिक्षित, सुसंस्कृत व अनुरूप"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Contact Section Custom Fields */}
              {formData.customFields.filter(f => f.section === 'contact').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-3 mb-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800 relative group">
                  <button onClick={() => removeCustomField(field.id)} className="absolute -top-2 -right-2 p-1 bg-red-900/80 text-white rounded-full shadow hidden group-hover:block"><Trash2 className="w-3 h-3" /></button>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">रकाण्याचे नाव (Label):</label>
                    <input type="text" value={field.label} onChange={(e) => updateCustomField(field.id, 'label', e.target.value)} placeholder="उदा. इंस्टाग्राम" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">माहिती (Value):</label>
                    <input type="text" value={field.value} onChange={(e) => updateCustomField(field.id, 'value', e.target.value)} placeholder="उदा. @username" className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs" />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button type="button" onClick={() => addCustomField('contact')} className="text-[11px] text-amber-400 font-bold border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-400/10 flex items-center gap-1">+ नवीन रकाना जोडा</button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live BioData Preview Card (Aesthetic Design for Export) */}
          <div className="lg:col-span-6 p-4 sm:p-6 bg-slate-900/80 flex flex-col items-center justify-start overflow-y-auto">
            
            <div className="w-full max-w-lg mb-3 flex items-center justify-between text-xs text-amber-300 font-bold">
              <span>👁️ बायोडाटा लाईव्ह प्रीव्ह्यू (Live Preview)</span>
              <span>वंजारी जोडी मॅट्रिमोनी फॉर्मॅट</span>
            </div>

            {/* PREVIEW CONTAINER (Captured by html2canvas for JPG & PDF) */}
            <div
              ref={previewCardRef}
              className={`w-full max-w-lg p-6 sm:p-8 ${themeStyles.bg} ${themeStyles.border} rounded-2xl shadow-2xl space-y-5 text-slate-900 font-sans relative overflow-hidden`}
              style={{
                fontFamily: "'Mukta', 'Noto Sans Devanagari', 'Tiro Devanagari Marathi', sans-serif",
              }}
            >
              {/* Optional Admin Watermark Logo */}
              {siteConfig?.biodataWatermarkEnabled !== false && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
                  style={{ opacity: siteConfig?.biodataWatermarkOpacity ?? 0.12 }}
                >
                  <img
                    src={
                      siteConfig?.biodataWatermarkUrl ||
                      siteConfig?.logoUrl ||
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"
                    }
                    alt="Watermark Logo"
                    referrerPolicy="no-referrer"
                    className="object-contain"
                    style={{
                      width: `${siteConfig?.biodataWatermarkSize ?? 35}%`,
                      maxWidth: '240px',
                      transform: 'rotate(-15deg)',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 space-y-5">
                {/* Header Title & Blessing */}
                <div className="text-center space-y-1 border-b pb-3 border-amber-500/40">
                  <p className={`text-xs sm:text-sm font-black tracking-wide ${themeStyles.headingText}`}>
                    {formData.headerBlessing || '॥ श्री गणेशाय नमः ॥'}
                  </p>
                  <h1 className={`text-xl sm:text-2xl font-black ${themeStyles.headingText} flex items-center justify-center gap-2 mt-1`}>
                    <span>विवाह बायोडाटा (BioData)</span>
                  </h1>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                    वंजारी समाज विवाह परिचय मंचासाठी विशेष
                  </p>
                </div>

                {/* Main Content Grid with Photo */}
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  
                  {/* Candidate Photo Badge if available */}
                  {formData.candidatePhotoUrl && (
                    <div className="shrink-0 flex flex-col items-center">
                      <img
                        src={formData.candidatePhotoUrl}
                        alt="Candidate"
                        className="w-28 h-32 sm:w-32 sm:h-36 rounded-xl object-cover border-4 border-amber-400 shadow-md bg-white"
                      />
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full mt-1.5">
                        {formData.gender === 'bride' ? 'वधू फोटो' : 'वर फोटो'}
                      </span>
                    </div>
                  )}

                  {/* Top Highlights Box */}
                  <div className="flex-1 space-y-1.5 w-full">
                    <div className={`p-3 rounded-xl border ${themeStyles.badgeBg} space-y-1`}>
                      <p className={`text-base font-black ${themeStyles.labelColor}`}>
                        {formData.fullName || 'उमेदवाराचे नाव'}
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        🎓 शिक्षण: {formData.education || '---'}
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        💼 नोकरी/व्यवसाय: {formData.occupation || '---'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 1: वैयक्तिक माहिती (Personal Details Table) */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase tracking-wider border-b-2 pb-1 ${themeStyles.headingText} ${themeStyles.lineDivider}`}>
                    १. वैयक्तिक माहिती (Personal Details)
                  </h4>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-800 font-medium">
                    <div><strong className={themeStyles.labelColor}>जन्मतारीख:</strong> {formData.birthDate || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>जन्मवेळ:</strong> {formData.birthTime || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>जन्मठिकाण:</strong> {formData.birthPlace || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>उंची:</strong> {formData.height || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>रंग:</strong> {formData.complexion || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>रक्तगट:</strong> {formData.bloodGroup || '---'}</div>
                    <div className="col-span-2"><strong className={themeStyles.labelColor}>वार्षिक उत्पन्न:</strong> {formData.income || '---'}</div>
                  </div>
                </div>

                {/* Section 2: कुंडली / पत्रिका माहिती */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase tracking-wider border-b-2 pb-1 ${themeStyles.headingText} ${themeStyles.lineDivider}`}>
                    २. कुंडली व नक्षत्र माहिती (Kundali Details)
                  </h4>

                  <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 text-xs text-slate-800 font-medium bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
                    <div><strong className={themeStyles.labelColor}>रास:</strong> {formData.rashi || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>नक्षत्र:</strong> {formData.nakshatra || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>गोत्र:</strong> {formData.gotra || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>देवक:</strong> {formData.devak || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>नाडी:</strong> {formData.nadi || '---'}</div>
                    <div><strong className={themeStyles.labelColor}>मंगळ:</strong> {formData.mangal || '---'}</div>
                  </div>
                </div>

                {/* Section 3: कौटुंबिक माहिती (Family Details) */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase tracking-wider border-b-2 pb-1 ${themeStyles.headingText} ${themeStyles.lineDivider}`}>
                    ३. कौटुंबिक माहिती (Family Details)
                  </h4>

                  <div className="space-y-1 text-xs text-slate-800 font-medium">
                    <p><strong className={themeStyles.labelColor}>वडिलांचे नाव:</strong> {formData.fatherName || '---'} ({formData.fatherOccupation})</p>
                    <p><strong className={themeStyles.labelColor}>आईचे नाव:</strong> {formData.motherName || '---'}</p>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <p><strong className={themeStyles.labelColor}>भाऊ:</strong> {formData.brothers || '---'}</p>
                      <p><strong className={themeStyles.labelColor}>बहीण:</strong> {formData.sisters || '---'}</p>
                    </div>
                    <p><strong className={themeStyles.labelColor}>मामाचे नाव & गाव:</strong> {formData.mamaName || '---'}</p>
                    <p><strong className={themeStyles.labelColor}>नातेसंबंध / पाहुणे:</strong> {formData.relatives || '---'}</p>
                  </div>
                </div>

                {/* Section 4: संपर्क माहिती & पत्ता */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-black uppercase tracking-wider border-b-2 pb-1 ${themeStyles.headingText} ${themeStyles.lineDivider}`}>
                    ४. संपर्क व अपेक्षा (Contact Details)
                  </h4>

                  <div className="space-y-1 text-xs text-slate-800 font-medium">
                    <div className="grid grid-cols-2 gap-2">
                      <p><strong className={themeStyles.labelColor}>मोबाईल नंबर:</strong> {formData.mobile || '---'}</p>
                      <p><strong className={themeStyles.labelColor}>मूळ गाव / तालुका:</strong> {formData.nativePlace || '---'}</p>
                    </div>
                    <p><strong className={themeStyles.labelColor}>संपूर्ण पत्ता:</strong> {formData.address || '---'}</p>
                    <p><strong className={themeStyles.labelColor}>अपेक्षित वधू/वर:</strong> {formData.expectations || '---'}</p>
                  </div>
                </div>

                {/* Google Play Store Ad Banner */}
                {siteConfig?.biodataPlaystoreAdEnabled !== false && (
                  <div className="p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center justify-between gap-3 text-left">
                    <div className="flex-1 space-y-0.5">
                      <p className="text-[10px] font-black text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>वंजारी जोडी (VanjariJodi) अधिकृत अँप</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-700 leading-snug">
                        {siteConfig?.biodataPlaystoreAdText || '📲 वंजारी जोडी (VanjariJodi) अँप गुगल प्ले स्टोअर वरून आत्ताच डाउनलोड करा!'}
                      </p>
                    </div>
                    
                    {siteConfig?.biodataPlaystoreQrEnabled !== false && (
                      <div className="shrink-0 flex flex-col items-center gap-0.5">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                            siteConfig?.biodataPlaystoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'
                          )}`}
                          alt="Download QR"
                          className="w-10 h-10 border border-amber-400 p-0.5 bg-white rounded shadow-xs"
                        />
                        <span className="text-[7px] font-black bg-slate-900 text-amber-300 px-1 py-0.2 rounded-sm tracking-tight uppercase">
                          Scan & Install
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Watermark Footer */}
              <div className="pt-3 border-t border-amber-500/30 text-center flex items-center justify-between text-[10px] text-slate-600 font-bold relative z-10">
                <span>वंजारी जोडी मॅट्रिमोनी पोर्टल</span>
                <span>vanjarijodi.web.app</span>
              </div>

            </div>

            {/* HIDDEN HIGH-RES CONTAINER FOR HD QUALITY JPG & PDF DOWNLOAD (NO CLIPPING, NO CUTTING, BRAND NEW FORMATTING) */}
            <div style={{ position: 'fixed', left: '-1200px', top: '0', width: '800px', zIndex: -50, pointerEvents: 'none' }}>
              <div
                ref={exportCardRef}
                style={{
                  width: '800px',
                  minHeight: '1130px',
                  padding: '40px 45px',
                  backgroundColor: exportThemeStyles.bgColor,
                  fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif",
                  boxSizing: 'border-box',
                  border: `12px double ${exportThemeStyles.borderColor}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="space-y-4 text-slate-900"
              >
                {/* Optional Admin Watermark Logo inside Export Container */}
                {siteConfig?.biodataWatermarkEnabled !== false && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      zIndex: 0,
                      opacity: siteConfig?.biodataWatermarkOpacity ?? 0.12,
                    }}
                  >
                    <img
                      src={
                        siteConfig?.biodataWatermarkUrl ||
                        siteConfig?.logoUrl ||
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"
                      }
                      alt="Watermark Logo"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      style={{
                        width: `${(siteConfig?.biodataWatermarkSize ?? 35) * 1.2}%`,
                        maxWidth: '320px',
                        transform: 'rotate(-15deg)',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
                      }}
                    />
                  </div>
                )}

                <div style={{ position: 'relative', zIndex: 10 }} className="space-y-4">
                  {/* Blessing Line */}
                  <div style={{ textAlign: 'center', borderBottom: `2px solid ${exportThemeStyles.lightBorderColor}`, paddingBottom: '12px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'normal', color: exportThemeStyles.accentColor, margin: 0, letterSpacing: '1px', fontFamily: "'Yatra One', serif" }}>
                      {formData.headerBlessing || '॥ श्री गणेशाय नमः ॥  ॥ श्री संत भगवान बाबा प्रसन्न ॥'}
                    </p>
                    
                    {/* Brand Header with Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
                      <VanjariJodiLogo variant="emblem" size={58} />
                      <div style={{ textAlign: 'left' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 'normal', color: exportThemeStyles.primaryColor, margin: 0, lineHeight: '1.2', fontFamily: "'Yatra One', serif" }}>
                          {siteConfig?.logoTitle || 'वंजारी जोडी'}
                        </h1>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: exportThemeStyles.accentColor, margin: 0, fontFamily: "'Mukta', sans-serif" }}>
                          {siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात'} — विवाह बायोडाटा (BioData)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Identity Profile (Name, Photo, Key Info) */}
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px' }}>
                    
                    {/* Left: Name and Top Highlights */}
                    <div style={{ flex: 1 }}>
                      <div 
                        style={{ 
                          padding: '16px 20px', 
                          borderRadius: '12px', 
                          border: `1px solid ${exportThemeStyles.lightBorderColor}`, 
                          backgroundColor: exportThemeStyles.badgeBg,
                        }}
                      >
                        <h2 style={{ fontSize: '26px', fontWeight: 'normal', color: exportThemeStyles.secondaryColor, margin: '0 0 8px 0', fontFamily: "'Yatra One', serif" }}>
                          {formData.fullName || 'उमेदवाराचे नाव प्रविष्ट करा'}
                        </h2>
                        <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                          🎓 शिक्षण (Education): <span style={{ color: exportThemeStyles.primaryColor }}>{formData.education || '---'}</span>
                        </p>
                        {formData.jobTitle && (
                          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                            💼 नोकरी (Job): <span style={{ color: exportThemeStyles.primaryColor }}>{formData.jobTitle}</span>
                          </p>
                        )}
                        {formData.businessTitle && (
                          <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                            🏢 व्यवसाय (Business): <span style={{ color: exportThemeStyles.primaryColor }}>{formData.businessTitle}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Photo Badge */}
                    {formData.candidatePhotoUrl && (
                      <div style={{ flexShrink: 0, textAlign: 'center' }}>
                        <div 
                          style={{ 
                            width: '120px', 
                            height: '150px', 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            border: `3px solid ${exportThemeStyles.accentColor}`,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            backgroundColor: '#fff',
                            padding: '3px',
                          }}
                        >
                          <img
                            src={formData.candidatePhotoUrl}
                            alt="Candidate"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </div>
                        <span 
                          style={{ 
                            fontSize: '9px', 
                            fontWeight: 'bold', 
                            backgroundColor: '#fef3c7', 
                            color: '#92400e', 
                            border: '1px solid #fde047', 
                            padding: '2px 8px', 
                            borderRadius: '99px',
                            display: 'inline-block',
                            marginTop: '6px'
                          }}
                        >
                          {formData.gender === 'bride' ? 'वधू फोटो' : 'वर फोटो'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Section 1: वैयक्तिक माहिती */}
                  <div style={{ marginTop: '16px' }}>
                    <h3 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: exportThemeStyles.tableHeaderTextColor, 
                        backgroundColor: exportThemeStyles.primaryColor,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      १. वैयक्तिक माहिती (Personal Details)
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>जन्मतारीख (DOB):</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthDate || '---'}</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>जन्मवेळ (Time):</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthTime || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>जन्मठिकाण (Place):</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthPlace || '---'}</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>उंची (Height):</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.height || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>रंग (Complexion):</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.complexion || '---'}</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>रक्तगट (Blood Grp):</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.bloodGroup || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>वार्षिक उत्पन्न (Income):</td>
                          <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.income || '---'}</td>
                        </tr>
                        {formData.customFields.filter(f => f.section === 'personal').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>{field.label}:</td>
                            <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 2: कुंडली व नक्षत्र माहिती */}
                  <div style={{ marginTop: '14px' }}>
                    <h3 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: exportThemeStyles.tableHeaderTextColor, 
                        backgroundColor: exportThemeStyles.primaryColor,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      २. कुंडली व नक्षत्र माहिती (Kundali Details)
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>रास (Rashi):</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.rashi || '---'}</td>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>नक्षत्र (Nakshatra):</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.nakshatra || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>गोत्र (Gotra):</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.gotra || '---'}</td>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>देवक (Devak):</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.devak || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>नाडी (Nadi):</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.nadi || '---'}</td>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>मंगळ (Mangal):</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.mangal || '---'}</td>
                        </tr>
                        {formData.customFields.filter(f => f.section === 'astrology').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>{field.label}:</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: कौटुंबिक माहिती */}
                  <div style={{ marginTop: '14px' }}>
                    <h3 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: exportThemeStyles.tableHeaderTextColor, 
                        backgroundColor: exportThemeStyles.primaryColor,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      ३. कौटुंबिक माहिती (Family Details)
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>वडिलांचे नाव:</td>
                          <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.fatherName || '---'} ({formData.fatherOccupation || '---'})</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>आईचे नाव:</td>
                          <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.motherName || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>भाऊ:</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.brothers || '---'}</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>बहीण:</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.sisters || '---'}</td>
                        </tr>
                        {formData.chultaName && (
                          <tr>
                            <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>चुलता (काका):</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.chultaName}</td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>मामाचे नाव व गाव:</td>
                          <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.mamaName || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>नातेसंबंध / पाहुणे:</td>
                          <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.relatives || '---'}</td>
                        </tr>
                        {formData.customFields.filter(f => f.section === 'family').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>{field.label}:</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 4: संपर्क माहिती व पत्ता */}
                  <div style={{ marginTop: '14px' }}>
                    <h3 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: exportThemeStyles.tableHeaderTextColor, 
                        backgroundColor: exportThemeStyles.primaryColor,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      ४. संपर्क व अपेक्षा (Contact & Expectations)
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>मोबाईल नंबर:</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.mobile || '---'}</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>मूळ गाव / तालुका:</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.nativePlace || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>संपूर्ण पत्ता (Address):</td>
                          <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.address || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>अपेक्षित वधू/वर (Expectations):</td>
                          <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.expectations || '---'}</td>
                        </tr>
                        {formData.customFields.filter(f => f.section === 'contact').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: exportThemeStyles.primaryColor }}>{field.label}:</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Google Play Store Ad Banner inside HD Container */}
                  {siteConfig?.biodataPlaystoreAdEnabled !== false && (
                    <div 
                      style={{ 
                        marginTop: '18px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: `1.5px dashed ${exportThemeStyles.accentColor}`,
                        backgroundColor: `${exportThemeStyles.accentColor}08`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#7c2d12', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ✨ वंजारी जोडी (VanjariJodi) अधिकृत अँप
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: '#475569', lineHeight: '1.4' }}>
                          {siteConfig?.biodataPlaystoreAdText || '📲 वंजारी जोडी (VanjariJodi) अँप गुगल प्ले स्टोअर वरून आत्ताच डाउनलोड करा!'}
                        </p>
                      </div>
                      
                      {siteConfig?.biodataPlaystoreQrEnabled !== false && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                              siteConfig?.biodataPlaystoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'
                            )}`}
                            alt="Download QR"
                            crossOrigin="anonymous"
                            style={{
                              width: '42px',
                              height: '42px',
                              border: `1px solid ${exportThemeStyles.accentColor}`,
                              padding: '2px',
                              backgroundColor: '#fff',
                              borderRadius: '4px'
                            }}
                          />
                          <span style={{ fontSize: '7px', fontWeight: 900, backgroundColor: '#0f172a', color: '#fde047', padding: '1px 4px', borderRadius: '2px', textTransform: 'uppercase' }}>
                            Scan & Install
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div 
                  style={{ 
                    marginTop: '20px',
                    paddingTop: '10px',
                    borderTop: `1px solid ${exportThemeStyles.lightBorderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#64748b',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  <span>वंजारी जोडी मॅट्रिमोनी पोर्टल</span>
                  <span>vanjarijodi.web.app</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
