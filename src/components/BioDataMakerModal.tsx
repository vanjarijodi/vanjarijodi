import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { safeHtml2Canvas } from '../utils/safeHtml2Canvas';
import jsPDF from 'jspdf';
import { uploadToCloudinary, compressAndResizeImage } from '../utils/cloudinary';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { BIODATA_THEMES, BioDataThemeConfig } from './biodata/biodataThemes';
import { BioDataFloralCorners } from './biodata/BioDataFloralCorners';
import { BioDataWatermark } from './biodata/BioDataWatermark';
import { BLESSING_PRESETS, FIELD_PRESETS, PresetFieldOption } from './biodata/BioDataPresets';
import {
  X,
  Download,
  Printer,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  Palette,
  User,
  Phone,
  Home,
  Scroll,
  Loader2,
  Trash2,
  Share2,
  Plus,
  QrCode,
  Globe,
  Sliders,
  UserPlus,
  Send,
} from 'lucide-react';

export interface BioDataCustomField {
  id: string;
  label: string;
  value: string;
  section: 'personal' | 'astrology' | 'family' | 'contact';
}

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
  jobTitle: string;
  businessTitle: string;
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
  customFields: BioDataCustomField[];
  candidatePhotoUrl?: string;
  linkToPortal: boolean;
}

export const BioDataMakerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { registerCandidateDirectly, saveBioDataSubmission, siteConfig } = useApp();

  const [themeId, setThemeId] = useState<keyof typeof BIODATA_THEMES>('rose_gold_floral');
  const activeTheme: BioDataThemeConfig = BIODATA_THEMES[themeId] || BIODATA_THEMES.rose_gold_floral;

  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRegisteredNotice, setIsRegisteredNotice] = useState<string | null>(null);
  const [isAddingToSystem, setIsAddingToSystem] = useState(false);
  const [addedSystemProfileId, setAddedSystemProfileId] = useState<string | null>(null);

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
    jobTitle: '',
    businessTitle: '',
    income: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    brothers: '',
    sisters: '',
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
    linkToPortal: false,
    customFields: [],
  });

  if (!isOpen) return null;

  const handleChange = (key: keyof BioDataFormState, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const addCustomField = (section: 'personal' | 'astrology' | 'family' | 'contact', defaultLabel = '', defaultValue = '') => {
    const newField: BioDataCustomField = {
      id: Math.random().toString(36).substring(2, 9),
      label: defaultLabel,
      value: defaultValue,
      section,
    };
    setFormData((prev) => ({ ...prev, customFields: [...prev.customFields, newField] }));
  };

  const handleAddPreset = (preset: PresetFieldOption) => {
    addCustomField(preset.section, preset.label, '');
  };

  const updateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) => (f.id === id ? { ...f, [key]: val } : f)),
    }));
  };

  const removeCustomField = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== id),
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const comp = await compressAndResizeImage(file, 2000, 0.95);
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
          setFormData((prev) => ({ ...prev, candidatePhotoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveBioDataToDatabase = () => {
    if (!formData.fullName && !formData.mobile) return;

    try {
      saveBioDataSubmission({
        fullName: formData.fullName || 'अनामित उमेदवार',
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        height: formData.height,
        complexion: formData.complexion,
        bloodGroup: formData.bloodGroup,
        education: formData.education,
        jobTitle: formData.jobTitle,
        businessTitle: formData.businessTitle,
        income: formData.income,
        fatherName: formData.fatherName,
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        brothers: formData.brothers,
        sisters: formData.sisters,
        nativePlace: formData.nativePlace,
        mamaName: formData.mamaName,
        relatives: formData.relatives,
        rashi: formData.rashi,
        nakshatra: formData.nakshatra,
        gotra: formData.gotra,
        devak: formData.devak,
        nadi: formData.nadi,
        mangal: formData.mangal,
        mobile: formData.mobile || '---',
        whatsapp: formData.whatsapp,
        address: formData.address,
        expectations: formData.expectations,
        candidatePhotoUrl: formData.candidatePhotoUrl,
        customFields: formData.customFields,
        themeId,
        isSavedToPortal: formData.linkToPortal,
      });

      if (formData.linkToPortal) {
        setIsRegisteredNotice('✅ बायोडाटा वंजारी जोडी मॅट्रिमोनी पोर्टलवर थेट सदस्य म्हणून सेव्ह झाला!');
      } else {
        setIsRegisteredNotice('✅ बायोडाटा अर्ज वेबसाईटवर सुरक्षीत सेव्ह झाला आहे (ॲडमिन पुनरावलोकनासाठी).');
      }
    } catch (e) {
      console.error('BioData Database save error:', e);
    }
  };

  // Ultra HD Download JPG Function
  const handleDownloadJPG = async () => {
    if (!exportCardRef.current) return;
    setIsExportingJpg(true);
    try {
      handleSaveBioDataToDatabase();

      const canvas = await safeHtml2Canvas(exportCardRef.current, {
        scale: 3, // Ultra-High Resolution (300 DPI equivalent)
        useCORS: true,
        allowTaint: true,
        backgroundColor: activeTheme.bgColor,
      });

      const image = canvas.toDataURL('image/jpeg', 0.96);
      const link = document.createElement('a');
      const filename = `BioData_${(formData.fullName || 'VanjariJodi').replace(/\s+/g, '_')}.jpg`;
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

  // Vector-Fit A4 PDF Download Function
  const handleDownloadPDF = async () => {
    if (!exportCardRef.current) return;
    setIsExportingPdf(true);
    try {
      handleSaveBioDataToDatabase();

      const canvas = await safeHtml2Canvas(exportCardRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: activeTheme.bgColor,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const filename = `BioData_${(formData.fullName || 'VanjariJodi').replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('PDF डाऊनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Add Complete BioData directly to Matrimony System (Profiles Directory)
  const handleAddToSystem = async () => {
    if (!formData.fullName.trim()) {
      alert('कृपया प्रथम उमेदवाराचे पूर्ण नाव प्रविष्ट करा.');
      return;
    }

    setIsAddingToSystem(true);
    try {
      let createdProfile: any = null;
      if (registerCandidateDirectly) {
        createdProfile = registerCandidateDirectly({
          fullName: formData.fullName,
          gender: formData.gender,
          birthDate: formData.birthDate,
          height: formData.height || "5'5\"",
          education: formData.education || 'माहिती उपलब्ध',
          occupation: formData.jobTitle || formData.businessTitle || 'माहिती उपलब्ध',
          taluka: formData.nativePlace || '',
          district: formData.nativePlace || 'महाराष्ट्र',
          mobileNumber: formData.mobile || '',
          photos: formData.candidatePhotoUrl ? [formData.candidatePhotoUrl] : [],
          aboutMe: `${formData.fullName} - अधिकृत वंजारी जोडी पोर्टलवर थेट जोडलेले स्थळ.`,
        });
      }

      if (saveBioDataSubmission) {
        saveBioDataSubmission({
          fullName: formData.fullName,
          gender: formData.gender,
          birthDate: formData.birthDate,
          height: formData.height,
          education: formData.education,
          jobTitle: formData.jobTitle || formData.businessTitle,
          nativePlace: formData.nativePlace,
          mobile: formData.mobile,
          candidatePhotoUrl: formData.candidatePhotoUrl,
          themeId: activeTheme.id,
          isSavedToPortal: true,
        });
      }

      const assignedId = createdProfile?.id || `VJ-${Math.floor(1000 + Math.random() * 9000)}`;
      setAddedSystemProfileId(assignedId);
      setIsRegisteredNotice(`🎉 अभिनंदन! ${formData.fullName} यांचा बायोडाटा वंजारी जोडी मॅट्रिमोनी सिस्टीममध्ये 'सक्रिय स्थळ' म्हणून जोडला गेला आहे! (नोंदणी ID: ${assignedId})`);
    } catch (err: any) {
      alert('सिस्टीममध्ये जोडताना त्रुटी आली: ' + (err.message || 'कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setIsAddingToSystem(false);
    }
  };

  // Telegram Quick Share Intent
  const handleShareTelegram = () => {
    const websiteDomain = siteConfig?.canonicalDomain || 'https://vanjarijodi.web.app';
    const text = `🌸 *विवाह बायोडाटा (BioData)* 🌸\n` +
      `👤 *नाव:* ${formData.fullName || '---'}\n` +
      `🎓 *शिक्षण:* ${formData.education || '---'}\n` +
      `💼 *नोकरी/व्यवसाय:* ${formData.jobTitle || formData.businessTitle || '---'}\n` +
      `📍 *मूळ गाव/पत्ता:* ${formData.nativePlace || '---'}\n\n` +
      `🌐 *वंजारी जोडी मॅट्रिमोनी पोर्टलवर अधिक स्थळे पाहण्यासाठी भेट द्या:*\n${websiteDomain}`;

    const url = `https://t.me/share/url?url=${encodeURIComponent(websiteDomain)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const portalWebsiteUrl = siteConfig?.canonicalDomain || 'https://vanjarijodi.web.app';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-950 rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Modal Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-slate-950 font-black shadow-md">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <span>मराठी ऑनलाईन बायोडाटा मेकर</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  १००% मोफत व आकर्षक
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                वेबसाईट वॉटरमार्क, फ्लोरल डिझाईन आणि सुंदर मराठी फॉन्टमध्ये HD बायोडाटा तयार करा.
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

        {/* Action / Theme & Watermark Control Bar */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0 text-xs">
          
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 max-w-full overflow-hidden">
            <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px] shrink-0">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>थीम:</span>
            </span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 font-bold overflow-x-auto max-w-full no-scrollbar whitespace-nowrap">
              {Object.values(BIODATA_THEMES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] flex items-center gap-1 shrink-0 ${
                    themeId === t.id
                      ? 'bg-amber-500 text-slate-950 shadow font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{t.badgeEmoji}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Watermark & Export Actions */}
          <div className="flex items-center gap-2 flex-wrap font-bold">
            
            {/* Watermark 25% Locked Badge */}
            <div className="px-2.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1">
              <span>🔒 अधिकृत वॉटरमार्क २५%</span>
            </div>

            {/* Add to System Quick Button */}
            <button
              type="button"
              onClick={handleAddToSystem}
              disabled={isAddingToSystem || Boolean(addedSystemProfileId)}
              className={`px-3 py-1.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all text-xs font-black border ${
                addedSystemProfileId
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
              }`}
            >
              {isAddingToSystem ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : addedSystemProfileId ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <UserPlus className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{addedSystemProfileId ? 'सिस्टीममध्ये जोडले' : 'सिस्टीमला जोडा'}</span>
            </button>

            {/* Telegram Share */}
            <button
              type="button"
              onClick={handleShareTelegram}
              className="px-2.5 sm:px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-all text-xs"
              title="टेलिग्रामवर बायोडाटा शेअर करा"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram</span>
            </button>

            {/* JPG Download Button */}
            <button
              type="button"
              onClick={handleDownloadJPG}
              disabled={isExportingJpg || isExportingPdf}
              className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50 text-xs font-black"
            >
              {isExportingJpg ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>HD JPG</span>
            </button>

            {/* PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExportingJpg || isExportingPdf}
              className="px-3 sm:px-3.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50 border border-amber-500/40 text-xs font-black"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              <span>PDF A4</span>
            </button>
          </div>
        </div>

        {/* MOBILE RESPONSIVE NAVIGATION TABS (< lg screens) */}
        <div className="lg:hidden flex border-b border-slate-800 bg-slate-950 px-3 py-1.5 gap-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'form'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <span>✏️ १. माहिती भरा (Form)</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <span>👁️ २. बायोडाटा पहा (Preview)</span>
          </button>
        </div>

        {/* Modal Main Content: Left Form Inputs & Right Live Preview */}
        <div className="grid lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* LEFT COLUMN: BioData Form Inputs */}
          <div className={`lg:col-span-6 p-4 sm:p-5 space-y-4 bg-slate-950 border-r border-slate-800 text-xs overflow-y-auto ${mobileTab === 'form' ? 'block' : 'hidden lg:block'}`}>
            
            {/* Quick Guidance Note */}
            <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent rounded-2xl border border-amber-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200 font-bold text-[11px]">
                  सर्व माहिती भरा. उजव्या बाजूला सुंदर लाईव्ह प्रीव्ह्यू दिसेल आणि खाली HD PDF डाऊनलोड व सिस्टीमला जोडण्याचा पर्याय उपलब्ध आहे.
                </span>
              </div>
            </div>

            {/* Photo Upload Box */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-amber-300 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>उमेदवाराचा फोटो (ऐच्छिक Photo)</span>
                </span>
                {formData.candidatePhotoUrl && (
                  <span className="text-emerald-400 text-[10px]">✓ फोटो अपलोड झाला</span>
                )}
              </label>
              
              {formData.candidatePhotoUrl ? (
                <div className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-emerald-500/40">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.candidatePhotoUrl}
                      alt="Candidate"
                      className="w-11 h-11 rounded-lg object-cover border border-amber-400"
                    />
                    <span className="text-emerald-400 font-bold text-xs">फोटो जोडला आहे</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('candidatePhotoUrl', undefined)}
                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 font-bold text-[10px] cursor-pointer"
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
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 text-amber-300 font-bold rounded-xl border border-dashed border-amber-500/40 cursor-pointer flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>फोटो अपलोड होत आहे...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>📸 बायोडाटावर फोटो लावण्यासाठी क्लिक करा</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Header Blessing Picker */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                १. संत आशीर्वाद व शीर्षक (Header Blessing):
              </label>
              <input
                type="text"
                value={formData.headerBlessing}
                onChange={(e) => handleChange('headerBlessing', e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-amber-200 font-bold outline-none focus:border-amber-500"
                placeholder="उदा. ॥ श्री गणेशाय नमः ॥ ॥ श्री संत भगवान बाबा प्रसन्न ॥"
              />
              {/* Quick Blessing Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BLESSING_PRESETS.map((blessing, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChange('headerBlessing', blessing)}
                    className="px-2 py-0.5 bg-slate-900 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-800 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    {blessing.length > 25 ? blessing.substring(0, 25) + '...' : blessing}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: Personal Details */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>२. वैयक्तिक माहिती (Personal Details)</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">वधू किंवा वर</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-400 font-medium">वधू / वर निवडा:</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value as 'bride' | 'groom')}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  >
                    <option value="groom">वर (मुलग्यासाठी बायोडाटा)</option>
                    <option value="bride">वधू (मुलीसाठी बायोडाटा)</option>
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
                    placeholder="उदा. १५/०८/१९९८"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">जन्मवेळ:</label>
                  <input
                    type="text"
                    value={formData.birthTime}
                    onChange={(e) => handleChange('birthTime', e.target.value)}
                    placeholder="उदा. सकाळी ०८:३०"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">जन्मठिकाण:</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => handleChange('birthPlace', e.target.value)}
                    placeholder="उदा. बीड / पुणे"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">उंची:</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="उदा. ५ फूट ७ इंच"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">रंग (Complexion):</label>
                  <input
                    type="text"
                    value={formData.complexion}
                    onChange={(e) => handleChange('complexion', e.target.value)}
                    placeholder="उदा. गोरा / गव्हाळ"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">रक्तगट (Blood Grp):</label>
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    placeholder="उदा. O +ve"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400 font-medium">शिक्षण (Education):</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    placeholder="उदा. B.E. Computer Science / MBA / M.Sc"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">नोकरी (Job / Occupation):</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    placeholder="उदा. सरकारी नोकरी - डॉक्टर / वर्ग १ अधिकारी"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  {/* Quick Sector Tags for Job */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['🏛️ सरकारी नोकरी (वर्ग १/२)', '🏛️ शासकीय सेवा', '💼 खाजगी कंपनी (MNC)', '🩺 शासकीय / खाजगी डॉक्टर', '💻 सॉफ्टवेअर इंजिनिअर', '👨‍🏫 प्राध्यापक / शिक्षक'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = formData.jobTitle ? `${formData.jobTitle}, ${tag}` : tag;
                          handleChange('jobTitle', current);
                        }}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-amber-950/50 text-amber-300 border border-slate-700 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">व्यवसाय (Business / Practice):</label>
                  <input
                    type="text"
                    value={formData.businessTitle}
                    onChange={(e) => handleChange('businessTitle', e.target.value)}
                    placeholder="उदा. स्वतःचे हॉस्पिटल / उद्योग / कृषी"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                  {/* Quick Sector Tags for Business */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['🩺 स्वतःचे क्लिनिक / हॉस्पिटल', '🏢 स्वतःचा उद्योग / कंपनी', '🌾 कृषी व बागायतदार', '🏪 रिटेल / होलसेल ट्रेड'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = formData.businessTitle ? `${formData.businessTitle}, ${tag}` : tag;
                          handleChange('businessTitle', current);
                        }}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-teal-950/50 text-teal-300 border border-slate-700 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400 font-medium">वार्षिक उत्पन्न (Income):</label>
                  <input
                    type="text"
                    value={formData.income}
                    onChange={(e) => handleChange('income', e.target.value)}
                    placeholder="उदा. १० लाख प्रतिवर्ष"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Personal Section Custom Fields */}
              {formData.customFields.filter((f) => f.section === 'personal').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative group">
                  <button
                    type="button"
                    onClick={() => removeCustomField(field.id)}
                    className="absolute -top-2 -right-2 p-1 bg-rose-700 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer"
                    title="रकाना हटवा"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">रकाण्याचे नाव (Label):</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                      placeholder="उदा. वजन"
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">माहिती (Value):</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                      placeholder="उदा. ६५ किलो"
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              ))}

              {/* Quick Add Presets for Personal Section */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                {FIELD_PRESETS.filter((p) => p.section === 'personal').map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddPreset(p)}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300/90 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{p.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addCustomField('personal')}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 flex items-center gap-0.5 cursor-pointer border border-amber-500/30"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ नवीन रकाना</span>
                </button>
              </div>
            </div>

            {/* SECTION 2: Family Details */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>३. कौटुंबिक पार्श्वभूमी (Family Details)</span>
                </h3>
                <span className="text-[10px] text-slate-400">आई-वडील, चुलते, मामा</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-400">वडिलांचे नाव:</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => handleChange('fatherName', e.target.value)}
                    placeholder="उदा. वडिलांचे पूर्ण नाव"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-slate-400">वडिलांचा व्यवसाय:</label>
                  <input
                    type="text"
                    value={formData.fatherOccupation}
                    onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                    placeholder="उदा. शेती / सेवानिवृत्त शिक्षक"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">आईचे नाव:</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => handleChange('motherName', e.target.value)}
                    placeholder="उदा. आईचे पूर्ण नाव (गृहणी / शिक्षिका)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">भाऊ:</label>
                  <input
                    type="text"
                    value={formData.brothers}
                    onChange={(e) => handleChange('brothers', e.target.value)}
                    placeholder="उदा. १ भाऊ (विवाहित)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">बहीण:</label>
                  <input
                    type="text"
                    value={formData.sisters}
                    onChange={(e) => handleChange('sisters', e.target.value)}
                    placeholder="उदा. १ बहीण (विवाहित)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">मामाचे नाव व मूळ गाव:</label>
                  <input
                    type="text"
                    value={formData.mamaName}
                    onChange={(e) => handleChange('mamaName', e.target.value)}
                    placeholder="उदा. श्री. अशोकराव ... (मूळ गाव- पाथर्डी)"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">नातेसंबंधातील आडनावे (Relatives):</label>
                  <input
                    type="text"
                    value={formData.relatives}
                    onChange={(e) => handleChange('relatives', e.target.value)}
                    placeholder="उदा. सानप, आंधळे, बडे, नागरगोजे, गिते, जायभाये..."
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Family Section Custom Fields */}
              {formData.customFields.filter((f) => f.section === 'family').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 relative group">
                  <button
                    type="button"
                    onClick={() => removeCustomField(field.id)}
                    className="absolute -top-2 -right-2 p-1 bg-rose-700 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">रकाण्याचे नाव (Label):</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                      placeholder="उदा. चुलते (काका)"
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px]">माहिती (Value):</label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                      placeholder="उदा. श्री. नामदेवराव ..."
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              ))}

              {/* Quick Add Presets for Family Section */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                {FIELD_PRESETS.filter((p) => p.section === 'family').map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddPreset(p)}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300/90 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{p.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addCustomField('family')}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-500/30 flex items-center gap-0.5 cursor-pointer border border-amber-500/30"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ नवीन रकाना</span>
                </button>
              </div>
            </div>

            {/* SECTION 3: Kundali Details */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>४. कुंडली व पत्रिका माहिती (Kundali Details)</span>
                </h3>
                <span className="text-[10px] text-slate-400">रास, नक्षत्र, गोत्र</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400">रास:</label>
                  <input
                    type="text"
                    value={formData.rashi}
                    onChange={(e) => handleChange('rashi', e.target.value)}
                    placeholder="उदा. कुंभ"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">नक्षत्र:</label>
                  <input
                    type="text"
                    value={formData.nakshatra}
                    onChange={(e) => handleChange('nakshatra', e.target.value)}
                    placeholder="उदा. पूर्वाभाद्रपदा"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">गोत्र:</label>
                  <input
                    type="text"
                    value={formData.gotra}
                    onChange={(e) => handleChange('gotra', e.target.value)}
                    placeholder="उदा. कश्यप"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">देवक:</label>
                  <input
                    type="text"
                    value={formData.devak}
                    onChange={(e) => handleChange('devak', e.target.value)}
                    placeholder="उदा. पंचपल्लव"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">नाडी:</label>
                  <input
                    type="text"
                    value={formData.nadi}
                    onChange={(e) => handleChange('nadi', e.target.value)}
                    placeholder="उदा. आद्य / मध्य"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">मंगळ:</label>
                  <input
                    type="text"
                    value={formData.mangal}
                    onChange={(e) => handleChange('mangal', e.target.value)}
                    placeholder="उदा. नाही / होय"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Astrology Custom Fields */}
              {formData.customFields.filter((f) => f.section === 'astrology').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 relative group">
                  <button
                    type="button"
                    onClick={() => removeCustomField(field.id)}
                    className="absolute -top-2 -right-2 p-1 bg-rose-700 text-white rounded-full shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                      placeholder="रकाण्याचे नाव"
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                      placeholder="माहिती"
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                {FIELD_PRESETS.filter((p) => p.section === 'astrology').map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddPreset(p)}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300/90 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 4: Contact & Expectations */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-black text-amber-400 text-xs flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>५. संपर्क व अपेक्षा (Contact Details)</span>
                </h3>
                <span className="text-[10px] text-slate-400">मोबाईल, पत्ता</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
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
                    placeholder="उदा. पाथर्डी, जि. अहिल्यानगर"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">संपूर्ण पत्ता (Address):</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="उदा. सध्या राहण्याचा संपूर्ण पत्ता"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-slate-400">अपेक्षित वधू/वर (Expectations):</label>
                  <input
                    type="text"
                    value={formData.expectations}
                    onChange={(e) => handleChange('expectations', e.target.value)}
                    placeholder="उदा. सुशिक्षित, सुसंस्कृत, मनमिळाऊ व अनुरूप स्थळ"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Contact Custom Fields */}
              {formData.customFields.filter((f) => f.section === 'contact').map((field) => (
                <div key={field.id} className="grid grid-cols-2 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 relative group">
                  <button
                    type="button"
                    onClick={() => removeCustomField(field.id)}
                    className="absolute -top-2 -right-2 p-1 bg-rose-700 text-white rounded-full shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                      placeholder="उदा. पर्यायी मोबाईल"
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                      placeholder="उदा. 98XXXXXXXX"
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                {FIELD_PRESETS.filter((p) => p.section === 'contact').map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAddPreset(p)}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-amber-950/40 text-amber-300/90 border border-amber-500/20 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Interactive BioData Preview */}
          <div className={`lg:col-span-6 p-3 sm:p-6 bg-slate-900/80 flex flex-col items-center justify-start overflow-y-auto ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            
            <div className="w-full max-w-lg mb-3 flex items-center justify-between text-xs text-amber-300 font-bold">
              <span>👁️ बायोडाटा लाईव्ह प्रीव्ह्यू (Live Preview)</span>
              <span className="text-[11px] text-slate-400">
                {activeTheme.name}
              </span>
            </div>

            {/* PREVIEW CARD CONTAINER */}
            <div
              ref={previewCardRef}
              className="w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: activeTheme.bgColor,
                border: activeTheme.outerBorderDouble,
                padding: '20px 18px',
                fontFamily: "'Noto Sans Devanagari', 'Baloo 2', 'Mukta', sans-serif",
                color: activeTheme.textColor,
                minHeight: '620px',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {/* Floral Ornaments if active */}
              {activeTheme.floralAccent && (
                <BioDataFloralCorners
                  variant="floral"
                  primaryColor={activeTheme.primaryColor}
                  accentColor={activeTheme.accentColor}
                />
              )}

              {/* Watermark in Background - Always On at 25% Opacity */}
              <BioDataWatermark
                siteConfig={siteConfig}
                opacity={0.25}
                showText={true}
              />

              <div className="relative z-10 space-y-4">
                
                {/* Header Blessing & Title */}
                <div className="text-center pb-2.5 border-b" style={{ borderColor: activeTheme.lightBorderColor }}>
                  <p
                    style={{
                      color: activeTheme.accentColor,
                      fontSize: '13px',
                      fontWeight: 'bold',
                      letterSpacing: 'normal',
                      fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif",
                      margin: 0,
                    }}
                  >
                    {formData.headerBlessing || '॥ श्री गणेशाय नमः ॥  ॥ श्री संत भगवान बाबा प्रसन्न ॥'}
                  </p>
                  
                  {/* Brand & Document Title */}
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <VanjariJodiLogo variant="emblem" size={44} />
                    <div className="text-left">
                      <h1
                        style={{
                          fontSize: '22px',
                          color: activeTheme.primaryColor,
                          fontWeight: 'bold',
                          lineHeight: '1.2',
                          margin: 0,
                          letterSpacing: 'normal',
                          fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif",
                        }}
                      >
                        {siteConfig?.logoTitle || 'वंजारी जोडी'} विवाह बायोडाटा
                      </h1>
                      <p style={{ fontSize: '10px', color: activeTheme.accentColor, fontWeight: 'bold', margin: 0 }}>
                        {siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात'} — {portalWebsiteUrl.replace('https://', '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Candidate Highlight Header (Name, Photo & Top Details) */}
                <div className="flex items-center gap-3.5 pt-1">
                  
                  {/* Left: Name Box */}
                  <div
                    className="flex-1 p-3 rounded-xl border"
                    style={{
                      backgroundColor: activeTheme.badgeBg,
                      borderColor: activeTheme.lightBorderColor,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '18px',
                        color: activeTheme.secondaryColor,
                        fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif",
                        margin: '0 0 4px 0',
                        letterSpacing: 'normal',
                      }}
                    >
                      {formData.fullName || 'उमेदवाराचे संपूर्ण नाव'}
                    </h2>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', margin: '2px 0' }}>
                      🎓 शिक्षण: <span style={{ color: activeTheme.primaryColor }}>{formData.education || '---'}</span>
                    </p>
                    {(formData.jobTitle || formData.businessTitle) && (
                      <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', margin: '2px 0' }}>
                        💼 काम: <span style={{ color: activeTheme.primaryColor }}>{formData.jobTitle || formData.businessTitle}</span>
                      </p>
                    )}
                  </div>

                  {/* Right: Photo */}
                  {formData.candidatePhotoUrl && (
                    <div className="shrink-0 text-center">
                      <div
                        style={{
                          width: '84px',
                          height: '104px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: `2px solid ${activeTheme.accentColor}`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          backgroundColor: '#fff',
                          padding: '2px',
                        }}
                      >
                        <img
                          src={formData.candidatePhotoUrl}
                          alt="Candidate"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '8px',
                          fontWeight: 'bold',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde047',
                          padding: '1px 6px',
                          borderRadius: '99px',
                          display: 'inline-block',
                          marginTop: '3px',
                        }}
                      >
                        {formData.gender === 'bride' ? 'वधू फोटो' : 'वर फोटो'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Section 1: वैयक्तिक माहिती */}
                <div className="space-y-1.5">
                  <div
                    style={{
                      background: activeTheme.pillHeaderGradient,
                      color: activeTheme.tableHeaderTextColor,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      display: 'inline-block',
                    }}
                  >
                    १. वैयक्तिक माहिती (Personal Details)
                  </div>

                  <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>जन्मतारीख :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthDate || '---'}</td>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>जन्मवेळ :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthTime || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>जन्मठिकाण :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthPlace || '---'}</td>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>उंची :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.height || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>रंग :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.complexion || '---'}</td>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>रक्तगट :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.bloodGroup || '---'}</td>
                      </tr>
                      {formData.income && (
                        <tr>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>वार्षिक उत्पन्न :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.income}</td>
                        </tr>
                      )}
                      {formData.customFields.filter((f) => f.section === 'personal').map((field) => (
                        <tr key={field.id}>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 2: कौटुंबिक माहिती */}
                <div className="space-y-1.5">
                  <div
                    style={{
                      background: activeTheme.pillHeaderGradient,
                      color: activeTheme.tableHeaderTextColor,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      display: 'inline-block',
                    }}
                  >
                    २. कौटुंबिक पार्श्वभूमी (Family Details)
                  </div>

                  <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>वडिलांचे नाव :-</td>
                        <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>
                          {formData.fatherName || '---'} {formData.fatherOccupation ? `(${formData.fatherOccupation})` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>आईचे नाव :-</td>
                        <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.motherName || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>भाऊ :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.brothers || '---'}</td>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>बहीण :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.sisters || '---'}</td>
                      </tr>
                      {formData.mamaName && (
                        <tr>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>मामाचे नाव :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.mamaName}</td>
                        </tr>
                      )}
                      {formData.relatives && (
                        <tr>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>नातेसंबंध :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.relatives}</td>
                        </tr>
                      )}
                      {formData.customFields.filter((f) => f.section === 'family').map((field) => (
                        <tr key={field.id}>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 3: कुंडली माहिती */}
                <div className="space-y-1.5">
                  <div
                    style={{
                      background: activeTheme.pillHeaderGradient,
                      color: activeTheme.tableHeaderTextColor,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      display: 'inline-block',
                    }}
                  >
                    ३. कुंडली व पत्रिका माहिती (Kundali Details)
                  </div>

                  <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>रास :-</td>
                        <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.rashi || '---'}</td>
                        <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>नक्षत्र :-</td>
                        <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.nakshatra || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>गोत्र :-</td>
                        <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.gotra || '---'}</td>
                        <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>देवक :-</td>
                        <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.devak || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>नाडी :-</td>
                        <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.nadi || '---'}</td>
                        <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>मंगळ :-</td>
                        <td style={{ width: '30%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.mangal || '---'}</td>
                      </tr>
                      {formData.customFields.filter((f) => f.section === 'astrology').map((field) => (
                        <tr key={field.id}>
                          <td style={{ width: '20%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 4: संपर्क व पत्ता */}
                <div className="space-y-1.5">
                  <div
                    style={{
                      background: activeTheme.pillHeaderGradient,
                      color: activeTheme.tableHeaderTextColor,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      display: 'inline-block',
                    }}
                  >
                    ४. संपर्क व अपेक्षा (Contact Details)
                  </div>

                  <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>मोबाईल :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.mobile || '---'}</td>
                        <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>मूळ गाव :-</td>
                        <td style={{ width: '25%', padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.nativePlace || '---'}</td>
                      </tr>
                      {formData.address && (
                        <tr>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>पत्ता :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.address}</td>
                        </tr>
                      )}
                      {formData.expectations && (
                        <tr>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>अपेक्षा :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{formData.expectations}</td>
                        </tr>
                      )}
                      {formData.customFields.filter((f) => f.section === 'contact').map((field) => (
                        <tr key={field.id}>
                          <td style={{ width: '25%', padding: '3px 0', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                          <td colSpan={3} style={{ padding: '3px 0', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Website Branding & Promotion Footer with QR Code */}
                <div
                  style={{
                    marginTop: '16px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: `1.5px dashed ${activeTheme.accentColor}`,
                    backgroundColor: `${activeTheme.accentColor}0A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, color: activeTheme.primaryColor }}>
                      🌐 वंजारी जोडी (Vanjari Jodi) — अधिकृत वधू-वर सूचक पोर्टल
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '9px', fontWeight: 'bold', color: '#475569' }}>
                      हजारो अनुरूप वधू-वर प्रोफाईल्ससाठी भेट द्या: <strong>{portalWebsiteUrl.replace('https://', '')}</strong>
                    </p>
                  </div>
                  
                  {/* Website QR Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(portalWebsiteUrl)}`}
                      alt="Website QR"
                      style={{
                        width: '38px',
                        height: '38px',
                        border: `1px solid ${activeTheme.accentColor}`,
                        padding: '1.5px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                      }}
                    />
                    <span style={{ fontSize: '6.5px', fontWeight: 900, color: activeTheme.secondaryColor, marginTop: '1px' }}>
                      स्कॅन करा
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* LUXURY ACTION CONSOLE (RIGHT WHERE BIODATA IS PREVIEWED AND DOWNLOADED) */}
            <div className="w-full max-w-lg mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="font-black text-amber-200 text-sm sm:text-base">
                    बायोडाटा डाऊनलोड व स्थळ पर्याय
                  </h4>
                </div>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  100% मोफत HD
                </span>
              </div>

              {/* Celebratory Banner if Added to System */}
              {isRegisteredNotice && (
                <div className="p-3.5 bg-gradient-to-r from-emerald-950 to-teal-950 border-2 border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-2 font-black text-emerald-300 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isRegisteredNotice}</span>
                  </div>
                  {addedSystemProfileId && (
                    <p className="text-[11px] text-emerald-400 pl-6">
                      अधिकृत नोंदणी क्रमांक: <span className="font-mono font-black text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/50">{addedSystemProfileId}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Main Download Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Download PDF Button */}
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExportingPdf || isExportingJpg}
                  className="py-3 px-4 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:from-[#A71930] hover:to-[#800C1E] text-white rounded-xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 border border-amber-400/40 disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Printer className="w-4 h-4 text-amber-300" />
                  )}
                  <span>📥 PDF डाऊनलोड (A4 Print)</span>
                </button>

                {/* 2. Download HD JPG Button */}
                <button
                  type="button"
                  onClick={handleDownloadJPG}
                  disabled={isExportingPdf || isExportingJpg}
                  className="py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 border border-amber-300 disabled:opacity-50"
                >
                  {isExportingJpg ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-slate-950" />
                  )}
                  <span>🖼️ HD JPG डाऊनलोड (फोटो)</span>
                </button>
              </div>

              {/* 3. Add to System Option */}
              <div className="pt-2.5 border-t border-slate-800 space-y-1.5">
                <button
                  type="button"
                  onClick={handleAddToSystem}
                  disabled={isAddingToSystem || Boolean(addedSystemProfileId)}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 border ${
                    addedSystemProfileId
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 cursor-default'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white border-emerald-300 shadow-emerald-900/30'
                  }`}
                >
                  {isAddingToSystem ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : addedSystemProfileId ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-amber-300" />
                  )}
                  <span>
                    {addedSystemProfileId
                      ? '✅ सिस्टीममध्ये स्थळ जोडले गेले आहे!'
                      : '✨ सिस्टीमला जोडा (वंजारी जोडीवर मोफत स्थळ प्रसिद्ध करा)'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400 text-center leading-tight">
                  {addedSystemProfileId
                    ? 'तुमचा बायोडाटा वंजारी जोडीवर सक्रिय झाला आहे. इतर वंजारी कुटुंबे हा बायोडाटा पाहू शकतील.'
                    : 'फक्त स्वतःसाठी डाऊनलोड करायचे असल्यास वरील बटणे वापरा, अथवा वंजारी जोडीवर इतर कुटुंबांना दिसण्यासाठी "सिस्टीमला जोडा" दाबा.'}
                </p>
              </div>
            </div>

            {/* HIDDEN HIGH-RES CONTAINER FOR HD EXPORTS (300 DPI PERFECT PRINT/JPG ENGINE) */}
            <div style={{ position: 'fixed', left: '-1500px', top: '0', width: '800px', zIndex: -50, pointerEvents: 'none' }}>
              <div
                ref={exportCardRef}
                style={{
                  width: '800px',
                  minHeight: '1130px',
                  padding: '42px 48px',
                  backgroundColor: activeTheme.bgColor,
                  fontFamily: "'Noto Sans Devanagari', 'Baloo 2', 'Mukta', sans-serif",
                  boxSizing: 'border-box',
                  border: activeTheme.outerBorderDouble,
                  position: 'relative',
                  overflow: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                }}
                className="space-y-4 text-slate-900"
              >
                {/* Floral Corner Ornaments for HD export */}
                {activeTheme.floralAccent && (
                  <BioDataFloralCorners
                    variant="floral"
                    primaryColor={activeTheme.primaryColor}
                    accentColor={activeTheme.accentColor}
                  />
                )}

                {/* Watermark in HD Export - Always On at 25% Opacity */}
                <BioDataWatermark
                  siteConfig={siteConfig}
                  opacity={0.25}
                  showText={true}
                />

                <div style={{ position: 'relative', zIndex: 10 }} className="space-y-4">
                  
                  {/* Blessing Line */}
                  <div style={{ textAlign: 'center', borderBottom: `2px solid ${activeTheme.lightBorderColor}`, paddingBottom: '14px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: activeTheme.accentColor, margin: 0, letterSpacing: 'normal', fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif" }}>
                      {formData.headerBlessing || '॥ श्री गणेशाय नमः ॥  ॥ श्री संत भगवान बाबा प्रसन्न ॥'}
                    </p>
                    
                    {/* Brand Header with Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
                      <VanjariJodiLogo variant="emblem" size={56} />
                      <div style={{ textAlign: 'left' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: activeTheme.primaryColor, margin: 0, lineHeight: '1.2', letterSpacing: 'normal', fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif" }}>
                          {siteConfig?.logoTitle || 'वंजारी जोडी'} विवाह बायोडाटा
                        </h1>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: activeTheme.accentColor, margin: 0, fontFamily: "'Noto Sans Devanagari', 'Mukta', sans-serif" }}>
                          {siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात'} — {portalWebsiteUrl.replace('https://', '')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Identity Profile Box */}
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px' }}>
                    
                    {/* Left: Candidate Name & Key Qualifications */}
                    <div style={{ flex: 1 }}>
                      <div 
                        style={{ 
                          padding: '16px 20px', 
                          borderRadius: '14px', 
                          border: `1.5px solid ${activeTheme.lightBorderColor}`, 
                          backgroundColor: activeTheme.badgeBg,
                        }}
                      >
                        <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: activeTheme.secondaryColor, margin: '0 0 8px 0', letterSpacing: 'normal', fontFamily: "'Rozha One', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', sans-serif" }}>
                          {formData.fullName || 'उमेदवाराचे नाव'}
                        </h2>
                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                          🎓 शिक्षण (Education): <span style={{ color: activeTheme.primaryColor }}>{formData.education || '---'}</span>
                        </p>
                        {formData.jobTitle && (
                          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                            💼 नोकरी (Job): <span style={{ color: activeTheme.primaryColor }}>{formData.jobTitle}</span>
                          </p>
                        )}
                        {formData.businessTitle && (
                          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                            🏢 व्यवसाय (Business): <span style={{ color: activeTheme.primaryColor }}>{formData.businessTitle}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Photo Frame */}
                    {formData.candidatePhotoUrl && (
                      <div style={{ flexShrink: 0, textAlign: 'center' }}>
                        <div 
                          style={{ 
                            width: '125px', 
                            height: '155px', 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            border: `3px solid ${activeTheme.accentColor}`,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
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
                            fontSize: '10px', 
                            fontWeight: 'bold', 
                            backgroundColor: '#fef3c7', 
                            color: '#92400e', 
                            border: '1px solid #fde047', 
                            padding: '2px 10px', 
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
                    <div 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: activeTheme.tableHeaderTextColor, 
                        background: activeTheme.pillHeaderGradient,
                        padding: '6px 18px',
                        borderRadius: '999px',
                        display: 'inline-block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      १. वैयक्तिक माहिती (Personal Details)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>जन्मतारीख :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthDate || '---'}</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>जन्मवेळ :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthTime || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>जन्मठिकाण :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.birthPlace || '---'}</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>उंची :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.height || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>रंग :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.complexion || '---'}</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>रक्तगट :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.bloodGroup || '---'}</td>
                        </tr>
                        {formData.income && (
                          <tr>
                            <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>वार्षिक उत्पन्न :-</td>
                            <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.income}</td>
                          </tr>
                        )}
                        {formData.customFields.filter((f) => f.section === 'personal').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                            <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 2: कौटुंबिक माहिती */}
                  <div style={{ marginTop: '14px' }}>
                    <div 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: activeTheme.tableHeaderTextColor, 
                        background: activeTheme.pillHeaderGradient,
                        padding: '6px 18px',
                        borderRadius: '999px',
                        display: 'inline-block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      २. कौटुंबिक पार्श्वभूमी (Family Details)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>वडिलांचे नाव :-</td>
                          <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>
                            {formData.fatherName || '---'} {formData.fatherOccupation ? `(${formData.fatherOccupation})` : ''}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>आईचे नाव :-</td>
                          <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.motherName || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>भाऊ :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.brothers || '---'}</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>बहीण :-</td>
                          <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.sisters || '---'}</td>
                        </tr>
                        {formData.mamaName && (
                          <tr>
                            <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>मामाचे नाव :-</td>
                            <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.mamaName}</td>
                          </tr>
                        )}
                        {formData.relatives && (
                          <tr>
                            <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>नातेसंबंध :-</td>
                            <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.relatives}</td>
                          </tr>
                        )}
                        {formData.customFields.filter((f) => f.section === 'family').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                            <td colSpan={3} style={{ padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: कुंडली माहिती */}
                  <div style={{ marginTop: '14px' }}>
                    <div 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: activeTheme.tableHeaderTextColor, 
                        background: activeTheme.pillHeaderGradient,
                        padding: '6px 18px',
                        borderRadius: '999px',
                        display: 'inline-block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      ३. कुंडली व पत्रिका माहिती (Kundali Details)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>रास :-</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.rashi || '---'}</td>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>नक्षत्र :-</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.nakshatra || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>गोत्र :-</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.gotra || '---'}</td>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>देवक :-</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.devak || '---'}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>नाडी :-</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.nadi || '---'}</td>
                          <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>मंगळ :-</td>
                          <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.mangal || '---'}</td>
                        </tr>
                        {formData.customFields.filter((f) => f.section === 'astrology').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 4: संपर्क व पत्ता */}
                  <div style={{ marginTop: '14px' }}>
                    <div 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 900, 
                        color: activeTheme.tableHeaderTextColor, 
                        background: activeTheme.pillHeaderGradient,
                        padding: '6px 18px',
                        borderRadius: '999px',
                        display: 'inline-block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      ४. संपर्क व अपेक्षा (Contact Details)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>मोबाईल :-</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.mobile || '---'}</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>मूळ गाव :-</td>
                          <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.nativePlace || '---'}</td>
                        </tr>
                        {formData.address && (
                          <tr>
                            <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>पत्ता :-</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.address}</td>
                          </tr>
                        )}
                        {formData.expectations && (
                          <tr>
                            <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>अपेक्षा :-</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{formData.expectations}</td>
                          </tr>
                        )}
                        {formData.customFields.filter((f) => f.section === 'contact').map((field) => (
                          <tr key={field.id}>
                            <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: activeTheme.labelColor }}>{field.label} :-</td>
                            <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{field.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* High Quality Export Branding Footer with QR code */}
                  <div 
                    style={{ 
                      marginTop: '22px',
                      padding: '12px 18px',
                      borderRadius: '14px',
                      border: `1.5px dashed ${activeTheme.accentColor}`,
                      backgroundColor: `${activeTheme.accentColor}0A`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, color: activeTheme.primaryColor }}>
                        ✨ वंजारी जोडी (Vanjari Jodi) — अधिकृत वधू-वर सूचक व विवाह जुळवणी मंच
                      </p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: '#475569', lineHeight: '1.4' }}>
                        🌐 हजारो वंजारी वधू-वर स्थळे पाहण्यासाठी आजच भेट द्या: <strong>{portalWebsiteUrl.replace('https://', '')}</strong>
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(portalWebsiteUrl)}`}
                        alt="Website QR"
                        crossOrigin="anonymous"
                        style={{
                          width: '46px',
                          height: '46px',
                          border: `1px solid ${activeTheme.accentColor}`,
                          padding: '2px',
                          backgroundColor: '#fff',
                          borderRadius: '4px'
                        }}
                      />
                      <span style={{ fontSize: '7.5px', fontWeight: 900, color: activeTheme.secondaryColor, marginTop: '2px' }}>
                        स्कॅन करा
                      </span>
                    </div>
                  </div>

                </div>

                {/* Bottom-most Footer Line */}
                <div 
                  style={{ 
                    marginTop: '16px',
                    paddingTop: '8px',
                    borderTop: `1px solid ${activeTheme.lightBorderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#64748b',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  <span>{siteConfig?.logoTitle || 'वंजारी जोडी'} मॅट्रिमोनी पोर्टल</span>
                  <span>{portalWebsiteUrl.replace('https://', '')}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
