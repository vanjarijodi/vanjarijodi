import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { safeHtml2Canvas } from '../utils/safeHtml2Canvas';
import jsPDF from 'jspdf';
import { uploadToCloudinary, compressAndResizeImage } from '../utils/cloudinary';
import { BIODATA_THEMES, BioDataThemeConfig } from './biodata/biodataThemes';
import { BIODATA_I18N, BiodataLanguage } from './biodata/BioDataTranslations';
import { BioDataCardView } from './biodata/BioDataCardView';
import { BioDataFormSections, BioDataFormSectionData } from './biodata/BioDataFormSections';
import { BLESSING_PRESETS, BLESSING_PRESETS_EN } from './biodata/BioDataPresets';
import {
  X,
  Download,
  Printer,
  Sparkles,
  Loader2,
  CheckCircle2,
  Palette,
  Send,
  UserPlus,
  Scroll,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

export const BioDataMakerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { registerCandidateDirectly, saveBioDataSubmission, siteConfig, language: appLanguage } = useApp();

  const [biodataLanguage, setBiodataLanguage] = useState<BiodataLanguage>(
    appLanguage === 'en' ? 'en' : 'mr'
  );
  const t = BIODATA_I18N[biodataLanguage];

  const [themeId, setThemeId] = useState<keyof typeof BIODATA_THEMES>('rose_gold_floral');
  const activeTheme: BioDataThemeConfig = BIODATA_THEMES[themeId] || BIODATA_THEMES.rose_gold_floral;

  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [activeSection, setActiveSection] = useState<'personal' | 'family' | 'astrology' | 'contact' | 'header_photo' | 'all'>('personal');

  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRegisteredNotice, setIsRegisteredNotice] = useState<string | null>(null);
  const [isAddingToSystem, setIsAddingToSystem] = useState(false);
  const [addedSystemProfileId, setAddedSystemProfileId] = useState<string | null>(null);

  const previewCardRef = useRef<HTMLDivElement>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<BioDataFormSectionData>({
    headerBlessing:
      biodataLanguage === 'en'
        ? BLESSING_PRESETS_EN[0]
        : BLESSING_PRESETS[0],
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
    uncleName: '',
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
    customFields: [],
  });

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const handleLanguageSwitch = (newLang: BiodataLanguage) => {
    setBiodataLanguage(newLang);
    // If the blessing is untouched default, switch to matching default
    const isDefaultMr = BLESSING_PRESETS.includes(formData.headerBlessing);
    const isDefaultEn = BLESSING_PRESETS_EN.includes(formData.headerBlessing);
    if (!formData.headerBlessing || isDefaultMr || isDefaultEn) {
      setFormData((prev) => ({
        ...prev,
        headerBlessing: newLang === 'en' ? BLESSING_PRESETS_EN[0] : BLESSING_PRESETS[0],
      }));
    }
  };

  const handleChange = (key: keyof BioDataFormSectionData, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const addCustomField = (
    section: 'personal' | 'astrology' | 'family' | 'contact',
    defaultLabel = '',
    defaultValue = ''
  ) => {
    const newField = {
      id: Math.random().toString(36).substring(2, 9),
      label: defaultLabel,
      value: defaultValue,
      section,
    };
    setFormData((prev) => ({ ...prev, customFields: [...prev.customFields, newField] }));
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
        isSavedToPortal: false,
      });
    } catch (e) {
      console.error('BioData Database save error:', e);
    }
  };

  // Ultra HD Download JPG Function (300 DPI Scale)
  const handleDownloadJPG = async () => {
    if (!exportCardRef.current) return;
    setIsExportingJpg(true);
    try {
      handleSaveBioDataToDatabase();

      const canvas = await safeHtml2Canvas(exportCardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: activeTheme.bgColor,
      });

      const image = canvas.toDataURL('image/jpeg', 0.96);
      const link = document.createElement('a');
      const filename = `BioData_${(formData.fullName || 'VanjariJodi').replace(/\s+/g, '_')}_${biodataLanguage}.jpg`;
      link.href = image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating JPG:', err);
      alert(biodataLanguage === 'mr' ? 'JPG डाऊनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Error downloading JPG. Please retry.');
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
      const filename = `BioData_${(formData.fullName || 'VanjariJodi').replace(/\s+/g, '_')}_${biodataLanguage}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert(biodataLanguage === 'mr' ? 'PDF डाऊनलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Error downloading PDF. Please retry.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Add Complete BioData directly to Matrimony System
  const handleAddToSystem = async () => {
    if (!formData.fullName.trim()) {
      alert(biodataLanguage === 'mr' ? 'कृपया प्रथम उमेदवाराचे पूर्ण नाव प्रविष्ट करा.' : "Please enter candidate's full name first.");
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
          education: formData.education || (biodataLanguage === 'mr' ? 'माहिती उपलब्ध' : 'Available on request'),
          occupation: formData.jobTitle || formData.businessTitle || (biodataLanguage === 'mr' ? 'माहिती उपलब्ध' : 'Available on request'),
          taluka: formData.nativePlace || '',
          district: formData.nativePlace || 'महाराष्ट्र',
          mobileNumber: formData.mobile || '',
          password: formData.password || '123456',
          photos: formData.candidatePhotoUrl ? [formData.candidatePhotoUrl] : [],
          aboutMe: `${formData.fullName} - अधिकृत वंजारी जोडी पोर्टलवर थेट नोंदणीकृत स्थळ.`,
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
      setIsRegisteredNotice(
        biodataLanguage === 'mr'
          ? `🎉 अभिनंदन! ${formData.fullName} यांची प्रोफाईल थेट लाईव्ह (Live) झाली आहे! पासवर्ड: ${formData.password || '123456'} सेव्ह झाला आहे. आता तुम्ही सर्व सदस्यांचे फोटो व आडनाव पाहू शकता!`
          : `🎉 Congratulations! Profile for ${formData.fullName} is now LIVE! Password saved. You can now view all members' photos and surnames!`
      );
    } catch (err: any) {
      alert((biodataLanguage === 'mr' ? 'सिस्टीममध्ये जोडताना त्रुटी: ' : 'Error adding to system: ') + (err.message || 'Error'));
    } finally {
      setIsAddingToSystem(false);
    }
  };

  // Telegram Quick Share
  const handleShareTelegram = () => {
    const websiteDomain = siteConfig?.canonicalDomain || 'https://vanjarijodi.com';
    const text =
      biodataLanguage === 'mr'
        ? `🌸 *विवाह बायोडाटा (BioData)* 🌸\n` +
          `👤 *नाव:* ${formData.fullName || '---'}\n` +
          `🎓 *शिक्षण:* ${formData.education || '---'}\n` +
          `💼 *नोकरी/व्यवसाय:* ${formData.jobTitle || formData.businessTitle || '---'}\n` +
          `📍 *मूळ गाव:* ${formData.nativePlace || '---'}\n\n` +
          `🌐 *वंजारी जोडी मॅट्रिमोनी पोर्टल:*\n${websiteDomain}`
        : `🌸 *Marriage BioData* 🌸\n` +
          `👤 *Name:* ${formData.fullName || '---'}\n` +
          `🎓 *Education:* ${formData.education || '---'}\n` +
          `💼 *Job / Business:* ${formData.jobTitle || formData.businessTitle || '---'}\n` +
          `📍 *Native Place:* ${formData.nativePlace || '---'}\n\n` +
          `🌐 *Vanjari Jodi Matrimony Portal:*\n${websiteDomain}`;

    const url = `https://t.me/share/url?url=${encodeURIComponent(websiteDomain)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-black/85 backdrop-blur-md overflow-hidden pt-safe pb-safe">
      <div className="relative w-full h-full sm:h-auto max-w-6xl bg-slate-950 rounded-none sm:rounded-3xl border-0 sm:border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col sm:my-auto max-h-none sm:max-h-[96vh]">
        
        {/* COMPACT & CLEAN HEADER BAR */}
        <div className="px-3.5 sm:px-5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between shrink-0 gap-2">
          
          {/* Left: Title & Badge */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg text-slate-950 font-black shadow-sm">
              <Scroll className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5">
                <span>{t.modalTitle}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  HD
                </span>
              </h2>
            </div>
          </div>

          {/* Center: Language Switcher Pill (Bilingual mr / en) */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-amber-500/40 shadow-inner">
            <button
              type="button"
              onClick={() => handleLanguageSwitch('mr')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                biodataLanguage === 'mr'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('en')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                biodataLanguage === 'en'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Right: Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPACT SUB-HEADER TOOLBAR (Single Slim Row: Theme + Mobile Tabs + Action shortcuts) */}
        <div className="px-3 sm:px-5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs">
          
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-slate-400 font-bold text-[11px] shrink-0 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.themeLabel}</span>
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {Object.values(BIODATA_THEMES).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setThemeId(th.id as any)}
                  title={biodataLanguage === 'en' ? th.nameEn : th.name}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    themeId === th.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{th.badgeEmoji}</span>
                  <span className="hidden md:inline">{biodataLanguage === 'en' ? th.nameEn : th.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Mode Switcher on mobile, and Direct Export Actions on Desktop */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile View Toggle */}
            <div className="lg:hidden flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setMobileTab('form')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mobileTab === 'form'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tabForm}
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mobileTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tabPreview}
              </button>
            </div>

            {/* Desktop Direct Action Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddToSystem}
                disabled={isAddingToSystem || Boolean(addedSystemProfileId)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 border transition-all ${
                  addedSystemProfileId
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
                }`}
              >
                {isAddingToSystem ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : addedSystemProfileId ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{addedSystemProfileId ? t.addedToSystem : t.addToSystem}</span>
              </button>

              <button
                type="button"
                onClick={handleShareTelegram}
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{t.shareTelegram}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJPG}
                disabled={isExportingJpg || isExportingPdf}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
              >
                {isExportingJpg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                <span>{t.downloadJpg}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExportingJpg || isExportingPdf}
                className="px-3 py-1 bg-[#A71930] hover:bg-[#800C1E] text-white rounded-xl text-xs font-black flex items-center gap-1 border border-amber-500/40 shadow cursor-pointer disabled:opacity-50"
              >
                {isExportingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />}
                <span>{t.downloadPdf}</span>
              </button>
            </div>
          </div>
        </div>

        {/* REGISTERED SYSTEM NOTICE BANNER IF ADDED */}
        {isRegisteredNotice && (
          <div className="px-4 py-2 bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isRegisteredNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsRegisteredNotice(null)}
              className="text-emerald-400 hover:text-white text-xs underline cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* MODAL MAIN CONTENT: Left Form Inputs & Right Live Preview */}
        <div className="grid lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* LEFT COLUMN: Clean Ergonomic Form (Starts right at the top!) */}
          <div
            className={`lg:col-span-6 p-3 sm:p-4 bg-slate-950 border-r border-slate-800 text-xs overflow-y-auto ${
              mobileTab === 'form' ? 'block' : 'hidden lg:block'
            }`}
          >
            <BioDataFormSections
              formData={formData}
              onChange={handleChange}
              onAddCustomField={addCustomField}
              onUpdateCustomField={updateCustomField}
              onRemoveCustomField={removeCustomField}
              language={biodataLanguage}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              onPhotoUpload={handlePhotoUpload}
              isUploadingPhoto={isUploadingPhoto}
              onGoToPreview={() => setMobileTab('preview')}
            />
          </div>

          {/* RIGHT COLUMN: Live Interactive BioData Preview & Download Center */}
          <div
            className={`lg:col-span-6 p-3 sm:p-5 bg-slate-900/80 flex flex-col items-center justify-start overflow-y-auto ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Preview Header Bar */}
            <div className="w-full max-w-lg mb-2.5 flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{biodataLanguage === 'mr' ? 'लाईव्ह प्रीव्ह्यू (Live Preview)' : 'Live BioData Preview'}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {biodataLanguage === 'en' ? activeTheme.nameEn : activeTheme.name}
              </span>
            </div>

            {/* PREVIEW CARD CONTAINER */}
            <div className="w-full max-w-lg">
              <BioDataCardView
                ref={previewCardRef}
                formData={formData}
                activeTheme={activeTheme}
                siteConfig={siteConfig}
                language={biodataLanguage}
                isExport={false}
              />
            </div>

            {/* ACTION DOWNLOAD CONSOLE (Prominent right below the Preview!) */}
            <div className="w-full max-w-lg mt-3 p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300 font-black flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{biodataLanguage === 'mr' ? 'डाऊनलोड व शेअर पर्याय' : 'Download & Share Options'}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">300 DPI Ultra HD</span>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJPG}
                  disabled={isExportingJpg || isExportingPdf}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {isExportingJpg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{biodataLanguage === 'mr' ? 'HD JPG डाऊनलोड' : 'Download HD JPG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExportingJpg || isExportingPdf}
                  className="py-2.5 px-3 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-amber-500/40 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  <span>{biodataLanguage === 'mr' ? 'PDF A4 डाऊनलोड' : 'Download PDF A4'}</span>
                </button>
              </div>

              {/* Add to System & Telegram Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddToSystem}
                  disabled={isAddingToSystem || Boolean(addedSystemProfileId)}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition cursor-pointer ${
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
                  <span>{addedSystemProfileId ? t.addedToSystem : t.addToSystem}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{biodataLanguage === 'mr' ? 'टेलिग्रामवर पाठवा' : 'Share on Telegram'}</span>
                </button>
              </div>

              {/* Mobile Back to Edit button */}
              <div className="lg:hidden pt-1">
                <button
                  type="button"
                  onClick={() => setMobileTab('form')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-amber-300 rounded-xl text-xs font-black border border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{t.editDetailsBtn}</span>
                </button>
              </div>
            </div>

            {/* HIDDEN HIGH-RES CONTAINER FOR HD EXPORTS (300 DPI Rendering Engine) */}
            <div style={{ position: 'fixed', left: '-2000px', top: '0', width: '800px', zIndex: -50, pointerEvents: 'none' }}>
              <BioDataCardView
                ref={exportCardRef}
                formData={formData}
                activeTheme={activeTheme}
                siteConfig={siteConfig}
                language={biodataLanguage}
                isExport={true}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
