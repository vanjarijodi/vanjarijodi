import React, { useState } from 'react';
import { uploadToCloudinary } from '../utils/cloudinary';
import { compressAndResizeImage, CompressedImageResult } from '../utils/imageCompressor';
import { runInBrowserTesseractOcr } from '../services/clientOcrService';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Bot,
  UserCheck,
  Zap,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  HelpCircle,
  FileCheck2,
  ShieldCheck,
  Cpu,
  Layers,
  Edit3
} from 'lucide-react';

export interface ExtractedBioData {
  fullName?: string;
  gender?: 'bride' | 'groom';
  candidatePhotoUrl?: string;
  hasCandidatePhoto?: boolean;
  candidatePhotoDescription?: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  rashi?: string;
  nakshatra?: string;
  gan?: string;
  nadi?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  complexion?: string;
  education?: string;
  occupation?: string;
  companyName?: string;
  income?: string;
  maritalStatus?: 'never_married' | 'divorced' | 'widowed';
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  brothers?: number;
  brotherDetails?: string;
  sisters?: number;
  sisterDetails?: string;
  relativeSurnames?: string[];
  mamaName?: string;
  mamaNative?: string;
  mobile?: string;
  email?: string;
  currentAddress?: string;
  nativeAddress?: string;
  district?: string;
  taluka?: string;
  city?: string;
  expectations?: string;
  rawSummary?: string;
}

interface AIBioDataExtractorProps {
  onExtracted?: (data: ExtractedBioData) => void;
  onExtractedData?: (data: ExtractedBioData) => void;
  className?: string;
  compactMode?: boolean;
}

export const AIBioDataExtractor: React.FC<AIBioDataExtractorProps> = ({
  onExtracted,
  onExtractedData,
  className = '',
  compactMode = false,
}) => {
  const { siteConfig } = useApp();
  const ocrConfig = siteConfig.ocrConfig;

  // BioData Document (Paper / Screenshot / PDF / Horoscope)
  const [docImagePreview, setDocImagePreview] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string>('');
  const [fileStats, setFileStats] = useState<{ origKB: number; compKB: number } | null>(null);

  // WhatsApp / Text input
  const [rawTextPrompt, setRawTextPrompt] = useState<string>('');
  const [activeInputTab, setActiveInputTab] = useState<'image' | 'text'>('image');

  // Candidate Face / Profile Photo (OPTIONAL)
  const [candidateProfilePhotoUrl, setCandidateProfilePhotoUrl] = useState<string | null>(null);
  const [isUploadingCandidatePhoto, setIsUploadingCandidatePhoto] = useState<boolean>(false);

  // Dual-Engine Extraction State
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'compressing' | 'gemini_ocr' | 'tesseract_ocr' | 'populating' | 'done'>('done');
  const [extractionProgressMsg, setExtractionProgressMsg] = useState<string>('');
  const [engineUsed, setEngineUsed] = useState<'gemini' | 'tesseract' | 'manual' | null>(null);
  const [modelDetails, setModelDetails] = useState<string>('');
  const [extractedResult, setExtractedResult] = useState<ExtractedBioData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallbackTriggered, setFallbackTriggered] = useState<boolean>(false);

  // Optional candidate portrait upload handler
  const handleCandidatePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingCandidatePhoto(true);
      try {
        const comp = await compressAndResizeImage(file, 800, 0.85);
        const uploadRes = await uploadToCloudinary(comp.file, 'vanjarijodi_profile_photos');
        if (uploadRes.success && uploadRes.url) {
          setCandidateProfilePhotoUrl(uploadRes.url);
        } else {
          setCandidateProfilePhotoUrl(comp.dataUrl);
        }
      } catch (err) {
        console.warn('Candidate photo upload fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setCandidateProfilePhotoUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingCandidatePhoto(false);
      }
    }
  };

  const removeCandidatePhoto = () => {
    setCandidateProfilePhotoUrl(null);
  };

  // BioData Document selection handler
  const handleBioDataDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg(null);
      setFallbackTriggered(false);
      setDocFileName(file.name);
      setIsExtracting(true);
      setCurrentStep('compressing');
      setExtractionProgressMsg('फोटो ऑप्टिमाइझ करत आहे (Resizing & Compressing < 1MB)...');

      try {
        // Step 1: Pre-process with guaranteed clamp to 1600px, 0.75 quality, <1MB
        const comp: CompressedImageResult = await compressAndResizeImage(
          file,
          ocrConfig?.maxImageDimension || 1600,
          ocrConfig?.compressionQuality || 0.75,
          (ocrConfig?.maxFileSizeMb || 1.0) * 1024 * 1024
        );

        setDocImagePreview(comp.dataUrl);
        setFileStats({
          origKB: comp.originalSizeKB,
          compKB: comp.compressedSizeKB,
        });

        // Step 2 & 3: Run Dual-Engine Extraction
        await executeDualEngineExtraction(comp.dataUrl);
      } catch (err: any) {
        console.warn('File processing error:', err);
        setErrorMsg('फोटो प्रोसेस करताना अडचण आली: ' + err.message);
        setIsExtracting(false);
        setCurrentStep('done');
      }
    }
  };

  /**
   * Primary (Gemini Multi-Key Failover) + Secondary (Tesseract.js In-Browser Offline Fallback)
   */
  const executeDualEngineExtraction = async (imageDataUrl: string, forceEngine?: 'gemini' | 'tesseract') => {
    setIsExtracting(true);
    setErrorMsg(null);

    const preferTesseractOnly = forceEngine === 'tesseract' || ocrConfig?.defaultEngine === 'tesseract_only';

    // IF TESSERACT ONLY REQUESTED:
    if (preferTesseractOnly) {
      await runTesseractFallback(imageDataUrl);
      return;
    }

    // PRIMARY ENGINE: GEMINI VISION WITH MULTI-KEY ROTATION
    setCurrentStep('gemini_ocr');
    setExtractionProgressMsg('AI द्वारे माहिती वाचत आहे (Gemini Vision + Smart Key Failover)...');

    try {
      const payload = {
        imageBase64: imageDataUrl,
        mimeType: 'image/jpeg',
        customApiKeys: ocrConfig?.geminiKeys || [],
      };

      const response = await fetch('/api/extract-biodata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawResponseText = await response.text();
      let resData: any = {};

      try {
        resData = JSON.parse(rawResponseText);
      } catch (jsonErr) {
        throw new Error('सर्व्हरकडून अयोग्य प्रतिसाद प्राप्त झाला.');
      }

      if (!response.ok || !resData.success) {
        const isQuota = response.status === 429 || resData.isRateLimit || (resData.error && resData.error.includes('429'));
        throw new Error(isQuota ? 'QUOTA_EXHAUSTED_429' : (resData.error || 'Gemini Extraction Failed'));
      }

      // Succeeded via Primary Gemini Engine
      setCurrentStep('populating');
      setExtractionProgressMsg('माहिती फॉर्ममध्ये भरत आहे...');

      const parsed = resData.extractedData;
      setEngineUsed('gemini');
      setModelDetails(resData.modelUsed ? `Model: ${resData.modelUsed}` : 'Gemini 1.5/2.5 Flash');

      setExtractedResult({
        ...parsed,
        candidatePhotoUrl: candidateProfilePhotoUrl || undefined,
        hasCandidatePhoto: !!candidateProfilePhotoUrl,
      });

      setIsExtracting(false);
      setCurrentStep('done');
    } catch (geminiErr: any) {
      console.warn('Primary Gemini Engine encountered an error:', geminiErr);

      // CHECK IF FALLBACK IS ENABLED
      if (ocrConfig?.enableTesseractFallback !== false) {
        setFallbackTriggered(true);
        console.log('Switching to Secondary Engine: In-Browser Tesseract.js OCR Fallback...');
        await runTesseractFallback(imageDataUrl);
      } else {
        setErrorMsg('Gemini AI मर्यादा ओलांडली किंवा त्रुटी आली. कृपया मॅन्युअली माहिती भरा.');
        setIsExtracting(false);
        setCurrentStep('done');
      }
    }
  };

  /**
   * SECONDARY ENGINE: IN-BROWSER TESSERACT.JS (OFFLINE BACKUP)
   */
  const runTesseractFallback = async (imageDataUrl: string) => {
    setCurrentStep('tesseract_ocr');
    setExtractionProgressMsg('बॅकअप इंजिनद्वारे माहिती वाचत आहे (In-Browser Tesseract OCR: 10%)...');

    try {
      const ocrResult = await runInBrowserTesseractOcr(imageDataUrl, (progressInfo) => {
        setExtractionProgressMsg(`बॅकअप इंजिनद्वारे माहिती वाचत आहे (${progressInfo.status})...`);
      });

      setCurrentStep('populating');
      setExtractionProgressMsg('माहिती फॉर्ममध्ये भरत आहे...');

      setEngineUsed('tesseract');
      setModelDetails('Tesseract.js (Offline / In-Browser)');

      setExtractedResult({
        ...ocrResult.data,
        candidatePhotoUrl: candidateProfilePhotoUrl || undefined,
        hasCandidatePhoto: !!candidateProfilePhotoUrl,
      });
    } catch (tessErr: any) {
      console.error('Tesseract OCR failed:', tessErr);
      setErrorMsg('बॅकअप OCR इंजिनमध्ये त्रुटी आली. कृपया मॅन्युअली माहिती भरा.');
    } finally {
      setIsExtracting(false);
      setCurrentStep('done');
    }
  };

  // Text Prompt (WhatsApp / SMS) Extraction
  const handleExtractFromText = async () => {
    if (!rawTextPrompt.trim()) {
      setErrorMsg('कृपया व्हॉट्सॲप मेसेज किंवा बायोडाटाचा मजकूर पेस्ट करा.');
      return;
    }

    setIsExtracting(true);
    setCurrentStep('gemini_ocr');
    setExtractionProgressMsg('मजकुरातून माहिती विश्लेषण करत आहे...');

    try {
      const payload = {
        textPrompt: rawTextPrompt,
        customApiKeys: ocrConfig?.geminiKeys || [],
      };

      const response = await fetch('/api/extract-biodata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success && resData.extractedData) {
        setEngineUsed('gemini');
        setModelDetails('Gemini Flash');
        setExtractedResult({
          ...resData.extractedData,
          candidatePhotoUrl: candidateProfilePhotoUrl || undefined,
          hasCandidatePhoto: !!candidateProfilePhotoUrl,
        });
      } else {
        // Fallback to local parsing
        const { parseBioDataFromRawOCR } = await import('../services/clientOcrService');
        const parsed = parseBioDataFromRawOCR(rawTextPrompt);
        setEngineUsed('manual');
        setExtractedResult(parsed);
      }
    } catch (err: any) {
      const { parseBioDataFromRawOCR } = await import('../services/clientOcrService');
      const parsed = parseBioDataFromRawOCR(rawTextPrompt);
      setEngineUsed('manual');
      setExtractedResult(parsed);
    } finally {
      setIsExtracting(false);
      setCurrentStep('done');
    }
  };

  const handleApplyData = () => {
    if (extractedResult) {
      const dataToApply: ExtractedBioData = {
        ...extractedResult,
        candidatePhotoUrl: candidateProfilePhotoUrl || undefined,
        hasCandidatePhoto: !!candidateProfilePhotoUrl,
      };

      if (onExtracted) onExtracted(dataToApply);
      if (onExtractedData) onExtractedData(dataToApply);
    }
  };

  const handleFieldChange = (field: keyof ExtractedBioData, val: any) => {
    if (extractedResult) {
      setExtractedResult({
        ...extractedResult,
        [field]: val,
      });
    }
  };

  return (
    <div className={`bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-white ${className}`}>
      
      {/* HEADER BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg">
            <Cpu className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                स्मार्ट AI बायोडाटा स्कॅनर (Photo to BioData OCR)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Resilient Dual-Engine</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Gemini Vision (५-की रोटेशन) + In-Browser Tesseract.js ऑफलाइन बॅकअप
            </p>
          </div>
        </div>

        {/* RE-SCAN OPTIONS IF ALREADY SCANNED */}
        {docImagePreview && !isExtracting && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => executeDualEngineExtraction(docImagePreview, 'gemini')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Gemini द्वारे पुन्हा स्कॅन करा"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemini AI</span>
            </button>
            <button
              type="button"
              onClick={() => executeDualEngineExtraction(docImagePreview, 'tesseract')}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Tesseract द्वारे ऑफलाइन स्कॅन करा"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Tesseract OCR</span>
            </button>
          </div>
        )}
      </div>

      {/* INPUT TABS SWITCH */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold gap-2 mb-5">
        <button
          type="button"
          onClick={() => setActiveInputTab('image')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeInputTab === 'image'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>१. बायोडाटा कागदपत्र / फोटो (Scan Image / PDF)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInputTab('text')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeInputTab === 'text'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>२. व्हॉट्सॲप मेसेज पेस्ट करा (Paste Text)</span>
        </button>
      </div>

      {/* TAB 1: IMAGE UPLOAD & OCR */}
      {activeInputTab === 'image' && (
        <div className="space-y-5">
          
          {/* 1. DOCUMENT UPLOAD BOX */}
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>बायोडाटा / कुंडली कागदपत्र निवडा (फक्त माहिती वाचण्यासाठी):</span>
              </span>
              {fileStats && (
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  ऑप्टिमाईज्ड: {fileStats.compKB} KB (मूळ {fileStats.origKB} KB)
                </span>
              )}
            </label>

            <div className="relative border-2 border-dashed border-amber-500/40 rounded-3xl p-5 bg-slate-950 hover:border-amber-400 transition-all text-center">
              {docImagePreview ? (
                <div className="space-y-3">
                  <div className="relative inline-block max-w-full">
                    <img
                      src={docImagePreview}
                      alt="BioData Document"
                      className="max-h-60 rounded-2xl mx-auto border-2 border-slate-700 shadow-md object-contain bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDocImagePreview(null);
                        setDocFileName('');
                        setExtractedResult(null);
                        setFileStats(null);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-lg cursor-pointer"
                      title="कागदपत्र काढा"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{docFileName}</p>
                </div>
              ) : (
                <div className="py-6 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-amber-100">
                      येथे बायोडाटा किंवा पत्रिकेचा फोटो / PDF अपलोड करा
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      JPG, PNG, WebP किंवा PDF सपोर्टेड (कमाल 25MB - आपोआप &lt; 1MB मध्ये ऑप्टिमाइज होईल)
                    </p>
                  </div>
                </div>
              )}

              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleBioDataDocumentChange}
                disabled={isExtracting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* 2. OPTIONAL CANDIDATE PROFILE PHOTO */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {candidateProfilePhotoUrl ? (
                  <img
                    src={candidateProfilePhotoUrl}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCheck className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <div>
                <span className="text-xs font-black text-amber-200 block">
                  उमेदवाराचा स्वतःचा प्रोफाइल फोटो (ऐच्छिक / Optional)
                </span>
                <p className="text-[11px] text-slate-400">
                  {candidateProfilePhotoUrl
                    ? '✅ प्रोफाइल फोटो निवडला गेला आहे'
                    : 'कागदपत्रातील फोटोऐवजी स्वतःचा नवीन फोटो जोडायचा असल्यास येथे निवडा.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {candidateProfilePhotoUrl ? (
                <button
                  type="button"
                  onClick={removeCandidatePhoto}
                  className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold border border-rose-800/60 transition cursor-pointer"
                >
                  काढून टाका
                </button>
              ) : (
                <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{isUploadingCandidatePhoto ? 'अपलोड होत आहे...' : 'फोटो निवडा'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCandidatePhotoUpload}
                    disabled={isUploadingCandidatePhoto}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TEXT PASTE */}
      {activeInputTab === 'text' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>व्हॉट्सॲप / SMS वर आलेला संपूर्ण बायोडाटा मजकूर येथे पेस्ट करा:</span>
            </label>
            <textarea
              rows={8}
              value={rawTextPrompt}
              onChange={(e) => setRawTextPrompt(e.target.value)}
              placeholder="नाव: अमित सानप&#10;जन्मतारीख: १५/०५/१९९८&#10;शिक्षण: B.E. Computer&#10;नोकरी: Software Engineer, Pune&#10;मोबाईल: 9876543210..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-white placeholder-slate-600 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 leading-relaxed font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExtractFromText}
              disabled={isExtracting || !rawTextPrompt.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-600/30 cursor-pointer transition flex items-center gap-2 disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>विश्लेषण सुरू आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>मजकुरातून माहिती भरा (Extract from Text)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* EXTRACTION PROGRESS / STEP INDICATORS */}
      {isExtracting && (
        <div className="mt-5 p-4 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin shrink-0" />
            <div>
              <span className="text-xs font-black text-amber-200 block">
                {extractionProgressMsg || 'माहिती वाचन सुरू आहे...'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentStep === 'compressing' && 'कॅमेरा फोटो स्पष्ट Devanagari रिझोल्यूशनमध्ये तयार होत आहे...'}
                {currentStep === 'gemini_ocr' && 'Google Gemini 1.5/2.5 Flash Vision मॉडेल मराठी अक्षरे वाचत आहे...'}
                {currentStep === 'tesseract_ocr' && 'क्लायंट-साइड Tesseract.js OCR द्वारे कागदपत्र स्कॅन होत आहे...'}
                {currentStep === 'populating' && 'बायोडाटा फॉर्मच्या सर्व फील्ड्समध्ये माहिती मॅप केली जात आहे...'}
              </p>
            </div>
          </div>

          {/* Progress Flow Steps */}
          <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold text-center pt-2 border-t border-slate-900">
            <div className={`p-1.5 rounded-lg ${currentStep === 'compressing' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}>
              १. ऑप्टिमायझेशन
            </div>
            <div className={`p-1.5 rounded-lg ${currentStep === 'gemini_ocr' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}>
              २. Gemini AI
            </div>
            <div className={`p-1.5 rounded-lg ${currentStep === 'tesseract_ocr' ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
              ३. Tesseract OCR
            </div>
            <div className={`p-1.5 rounded-lg ${currentStep === 'populating' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500'}`}>
              ४. फॉर्म पूर्ण
            </div>
          </div>
        </div>
      )}

      {/* ERROR OR FALLBACK NOTICE */}
      {errorMsg && (
        <div className="mt-5 p-4 bg-rose-950/60 rounded-2xl border border-rose-500/40 text-xs text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">माहिती वाचनात अडचण:</span>
            <p className="mt-0.5 text-[11px] text-rose-300">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* SUCCESS NOTIFICATION & ENGINE BADGE */}
      {fallbackTriggered && (
        <div className="mt-4 p-3 bg-blue-950/60 rounded-2xl border border-blue-500/40 text-xs text-blue-200 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            ✨ Gemini मर्यादा ओलांडल्यामुळे सिस्टीमने आपोआप इन-ब्राउझर बॅकअप OCR (Tesseract.js) द्वारे सर्व माहिती वाचली आहे.
          </span>
        </div>
      )}

      {/* STEP 3: EXTRACTED DATA PREVIEW & FORM APPLY BOX */}
      {extractedResult && !isExtracting && (
        <div className="mt-6 space-y-4 border-t border-slate-800 pt-5 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">
                    बायोडाटा माहिती यशस्वीरीत्या वाचली गेली!
                  </h4>
                  {engineUsed === 'gemini' ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                      ✨ Gemini Vision ({modelDetails})
                    </span>
                  ) : engineUsed === 'tesseract' ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black">
                      ⚡ In-Browser Tesseract OCR (Offline Backup)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black">
                      📝 Text Parser
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  खालील माहिती तपासून घ्या व थेट नोंदणी फॉर्ममध्ये भरण्यासाठी खालील बटनावर क्लिक करा.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyData}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              <span>फॉर्ममध्ये ही माहिती भरा (Apply to Form)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* EDITABLE FIELDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
            
            {/* Field: Full Name */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">पूर्ण नाव (Full Name):</span>
              <input
                type="text"
                value={extractedResult.fullName || ''}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="उमेदवाराचे नाव"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Gender */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">लिंग (Gender):</span>
              <select
                value={extractedResult.gender || 'groom'}
                onChange={(e) => handleFieldChange('gender', e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              >
                <option value="groom">वर / मुलगा (Groom)</option>
                <option value="bride">वधू / मुलगी (Bride)</option>
              </select>
            </div>

            {/* Field: DOB */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">जन्मतारीख (DOB):</span>
              <input
                type="text"
                value={extractedResult.dob || ''}
                onChange={(e) => handleFieldChange('dob', e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Mobile */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">मोबाईल नंबर (Mobile):</span>
              <input
                type="text"
                value={extractedResult.mobile || ''}
                onChange={(e) => handleFieldChange('mobile', e.target.value)}
                placeholder="१० अंकी मोबाईल नंबर"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Education */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">शिक्षण (Education):</span>
              <input
                type="text"
                value={extractedResult.education || ''}
                onChange={(e) => handleFieldChange('education', e.target.value)}
                placeholder="उदा. B.E. Computer"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Occupation */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">नोकरी / व्यवसाय (Occupation):</span>
              <input
                type="text"
                value={extractedResult.occupation || ''}
                onChange={(e) => handleFieldChange('occupation', e.target.value)}
                placeholder="उदा. Software Engineer"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Income */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">उत्पन्न (Income):</span>
              <input
                type="text"
                value={extractedResult.income || ''}
                onChange={(e) => handleFieldChange('income', e.target.value)}
                placeholder="उदा. ₹ १० लाख वार्षिक"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Height */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">उंची (Height):</span>
              <input
                type="text"
                value={extractedResult.height || ''}
                onChange={(e) => handleFieldChange('height', e.target.value)}
                placeholder="उदा. ५ फूट ६ इंच"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Gotra */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">गोत्र / राशी (Gotra / Rashi):</span>
              <input
                type="text"
                value={`${extractedResult.gotra || ''} ${extractedResult.rashi ? `(${extractedResult.rashi})` : ''}`.trim()}
                onChange={(e) => handleFieldChange('gotra', e.target.value)}
                placeholder="उदा. कश्यप"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Father Name */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">वडिलांचे नाव (Father):</span>
              <input
                type="text"
                value={extractedResult.fatherName || ''}
                onChange={(e) => handleFieldChange('fatherName', e.target.value)}
                placeholder="वडिलांचे नाव"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: Mother Name */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">आईचे नाव (Mother):</span>
              <input
                type="text"
                value={extractedResult.motherName || ''}
                onChange={(e) => handleFieldChange('motherName', e.target.value)}
                placeholder="आईचे नाव"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Field: District / Native */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-300">जिल्हा / मूळ गाव (District / Native):</span>
              <input
                type="text"
                value={`${extractedResult.district || ''} ${extractedResult.nativeAddress ? `(${extractedResult.nativeAddress})` : ''}`.trim()}
                onChange={(e) => handleFieldChange('district', e.target.value)}
                placeholder="उदा. बीड / पुणे"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

          </div>

          {/* FINAL BOTTOM APPLY CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleApplyData}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-emerald-600/30 cursor-pointer transition flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>ही माहिती नोंदणी फॉर्ममध्ये भरा (Apply & Continue Registration)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
