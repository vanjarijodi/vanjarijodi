import React, { useState } from 'react';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import { compressAndResizeImage } from '../utils/imageCompressor';
import {
  Sparkles,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  Bot,
  UserCheck,
  Zap,
  Info
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rawTextPrompt, setRawTextPrompt] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedBioData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeInputTab, setActiveInputTab] = useState<'image' | 'text'>('image');

  const [uploadedCloudinaryUrl, setUploadedCloudinaryUrl] = useState<string | null>(null);
  const [candidateProfilePhotoUrl, setCandidateProfilePhotoUrl] = useState<string | null>(null);
  const [isUploadingCandidatePhoto, setIsUploadingCandidatePhoto] = useState<boolean>(false);

  const handleCandidatePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        console.warn('Profile photo upload fallback:', err);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg(null);
      
      try {
        // Auto-compress high resolution camera/document photos
        const comp = await compressAndResizeImage(file, 1200, 0.82);
        
        setSelectedFile(comp.file);
        setImagePreview(comp.dataUrl);

        // Upload compressed file to Cloudinary in background
        const uploadRes = await uploadToCloudinary(comp.file, 'vanjarijodi_ocr_files');
        if (uploadRes.success && uploadRes.url) {
          setUploadedCloudinaryUrl(uploadRes.url);
        }
      } catch (err) {
        console.warn('File processing error:', err);
        // Fallback: use raw file if compression fails
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const runExtraction = async (base64Data?: string, textContent?: string) => {
    setIsExtracting(true);
    setErrorMsg(null);

    try {
      const payload: any = {};
      if (base64Data || imagePreview) {
        payload.imageBase64 = base64Data || imagePreview;
      }
      if (textContent || rawTextPrompt) {
        payload.textPrompt = textContent || rawTextPrompt;
      }

      if (!payload.imageBase64 && !payload.textPrompt) {
        throw new Error('कृपया बायोडाटाचा फोटो किंवा टेक्स्ट कंटेंट निवडा.');
      }

      let apiUrl = '/api/extract-biodata';
      if (typeof window !== 'undefined') {
        const isCapacitorOrLocal =
          (window as any).Capacitor ||
          window.location.protocol === 'file:' ||
          (window.location.hostname === 'localhost' && (window.location.port === '' || window.location.port === '80'));
        if (isCapacitorOrLocal) {
          const cloudRunHost = 'https://ais-dev-gd3elul22zl4zk3i4alrw5-542294010175.asia-east1.run.app';
          apiUrl = `${cloudRunHost}/api/extract-biodata`;
        }
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        if (rawText.trim().startsWith('<')) {
          throw new Error('ॲप सर्व्हरशी संपर्क साधू शकला नाही (HTML रेस्पॉन्स मिळाला). कृपया इंटरनेट सुरू असल्याची खात्री करा किंवा माहिती मॅन्युअली भरा.');
        } else {
          throw new Error('सर्व्हर डेटा प्राप्त करताना अडचण आली. कृपया मॅन्युअली माहिती भरून नोंदणी पूर्ण करा.');
        }
      }

      if (data.success && data.extractedData) {
        // Crucial fix: Do NOT set the document/paper photo as the candidate profile photo!
        // The uploaded BioData image is strictly used for text OCR reading.
        // candidatePhotoUrl will ONLY be set if a candidate profile photo was explicitly uploaded by the user.
        const finalCandidatePhoto = candidateProfilePhotoUrl || undefined;

        const result: ExtractedBioData = {
          ...data.extractedData,
          candidatePhotoUrl: finalCandidatePhoto,
          hasCandidatePhoto: !!finalCandidatePhoto,
          candidatePhotoDescription: finalCandidatePhoto
            ? (data.extractedData.gender === 'bride'
              ? 'वधूचा (मुलीचा) स्वतंत्र प्रोफाईल फोटो जोडला गेला आहे.'
              : 'वराचा (मुलाचा) स्वतंत्र प्रोफाईल फोटो जोडला गेला आहे.')
            : undefined,
        };
        setExtractedResult(result);
      } else {
        throw new Error(data.error || 'बायोडाटा मधील माहिती वाचता आली नाही.');
      }
    } catch (err: any) {
      console.warn('OCR Extraction Error:', err);
      setErrorMsg(
        err.message ||
          'फोटोवरून माहिती ऑटो-डिटेक्ट करता आली नाही. कृपया फोटो स्पष्ट आहे याची खात्री करा किंवा माहिती मॅन्युअली भरून सोयीस्कर नोंदणी करा.'
      );
      setExtractedResult(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyData = () => {
    if (extractedResult) {
      if (onExtracted) onExtracted(extractedResult);
      if (onExtractedData) onExtractedData(extractedResult);
    }
  };

  return (
    <div className={`bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl text-white ${className}`}>
      
      {/* HEADER BADGE */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg">
            <Bot className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                Gemini AI BioData OCR Extraction
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-300" />
                <span>Smart Vision</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              फोटो, बायोडाटा इमेज किंवा हस्तलिखित पत्रिकेतून माहिती स्वयंचलित १-क्लिक एक्स्ट्रॅक्ट करा.
            </p>
          </div>
        </div>
      </div>

      {/* INFORMATIONAL BANNER REGARDING DOCUMENT PHOTO VS PROFILE PHOTO */}
      <div className="mb-6 p-3.5 bg-slate-900/90 rounded-2xl border border-amber-500/30 flex items-start gap-3 text-xs text-slate-200">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">
            💡 महत्वाचे: बायोडाटा कागदपत्राचा फोटो केवळ माहिती वाचण्यासाठी वापरला जाईल.
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            अपलोड केलेल्या कागदपत्र किंवा पत्रिकेचा फोटो प्रोफाइल फोटो म्हणून लावला जात नाही. तुम्हाला हवा असल्यास खालील ऐच्छिक (Optional) पर्यायावरून उमेदवाराचा वेगळा प्रोफाईल फोटो जोडू शकता.
          </p>
        </div>
      </div>

      {/* OPTIONAL CANDIDATE PROFILE PHOTO UPLOAD CARD */}
      <div className="mb-6 p-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>वधू/वराचा प्रोफाईल फोटो जोडा (ऐच्छिक / Optional)</span>
          </label>
          <span className="text-[10px] font-bold bg-slate-800 text-amber-200 px-2.5 py-0.5 rounded-full border border-slate-700">
            नॉट कंपल्सरी
          </span>
        </div>

        {candidateProfilePhotoUrl ? (
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-emerald-500/50">
            <div className="flex items-center gap-3">
              <img
                src={candidateProfilePhotoUrl}
                alt="Candidate Profile"
                className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400 shadow shrink-0"
              />
              <div>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>प्रोफाईल फोटो जोडला गेला!</span>
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  हा फोटो नवीन प्रोफाईलचा मुख्य फोटो म्हणून सेव्ह होईल.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCandidateProfilePhotoUrl(null)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 cursor-pointer transition-colors"
            >
              हटवा
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleCandidatePhotoChange}
              disabled={isUploadingCandidatePhoto}
              className="hidden"
              id="ai-candidate-profile-photo-input"
            />
            <label
              htmlFor="ai-candidate-profile-photo-input"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-dashed border-amber-500/40 cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {isUploadingCandidatePhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>प्रोफाईल फोटो अपलोड होत आहे...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>📸 वधू/वराचा स्वतंत्र प्रोफाईल फोटो निवडा (ऐच्छिक)</span>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      {/* INPUT TABS SWITCH (Image Upload vs Text Paste) */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveInputTab('image')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeInputTab === 'image'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>१. बायोडाटा फोटो / इमेज (Image Upload)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInputTab('text')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeInputTab === 'text'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>२. बायोडाटा मेसेज / टेक्स्ट (Paste Text)</span>
        </button>
      </div>

      {/* TAB 1: IMAGE UPLOAD */}
      {activeInputTab === 'image' && (
        <div className="space-y-4">
          <div className="relative border-2 border-dashed border-amber-500/40 rounded-3xl p-6 bg-slate-950 hover:border-amber-400 transition-all text-center">
            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="BioData Document"
                  className="max-h-56 mx-auto rounded-2xl border border-amber-500/30 object-contain shadow-lg"
                />
                <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedFile?.name || 'बायोडाटा इमेज तयार आहे'}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    बायोडाटा किंवा पत्रिकेचा फोटो इथे अपलोड करा
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    गॅलरी मधून फोटो निवडा (JPG, PNG, WebP)
                  </p>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={!imagePreview || isExtracting}
              onClick={() => runExtraction()}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all ${
                imagePreview && !isExtracting
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-white shadow-amber-600/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span>Gemini AI वाचन सुरू आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-white" />
                  <span>फोटोवरून माहिती शोधा (Extract via AI)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TEXT PASTE */}
      {activeInputTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              व्हॉट्सॲप / मॅसेज मधील बायोडाटा टेक्स्ट इथे पेस्ट करा:
            </label>
            <textarea
              rows={6}
              placeholder="उदा. नाव, जन्मतारीख, शिक्षण, पत्ता, मोबाईल व इतर माहितीचा बायोडाटा मेसेज इथे पेस्ट करा..."
              value={rawTextPrompt}
              onChange={(e) => setRawTextPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={!rawTextPrompt || isExtracting}
              onClick={() => runExtraction(undefined, rawTextPrompt)}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all ${
                rawTextPrompt && !isExtracting
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-white shadow-amber-600/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span>AI प्रोसेस करत आहे...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-white" />
                  <span>टेक्स्ट मधून फील्ड्स भरा (Parse Text)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* EXTRACTED FIELDS PREVIEW DISPLAY */}
      {extractedResult && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-black text-emerald-300">
                AI द्वारे एक्सट्रॅक्ट झालेली माहिती (Extracted Result)
              </h4>
            </div>

            <button
              type="button"
              onClick={handleApplyData}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-transform active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>फॉर्म मध्ये ही माहिती भरा (Apply to Form)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            {/* CANDIDATE PHOTO DETECTED BADGE */}
            {extractedResult.candidatePhotoUrl && (
              <div className="col-span-2 sm:col-span-4 p-3 bg-emerald-950/80 rounded-2xl border-2 border-emerald-500/50 flex items-center gap-3.5 shadow-lg">
                <img
                  src={extractedResult.candidatePhotoUrl}
                  alt="Detected Candidate"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      ✨ फोटो डीटेक्ट झाला
                    </span>
                    <span className="text-amber-300 font-extrabold text-xs">
                      {extractedResult.gender === 'bride' ? '👰 वधूचा फोटो' : '🤵 वराचा फोटो'}
                    </span>
                  </div>
                  <h5 className="font-black text-emerald-200 text-xs sm:text-sm">
                    ऑटो-डिटेक्टेड फोटो प्रोफाईलला यशस्वीपणे लिंक झाला आहे!
                  </h5>
                  <p className="text-[11px] text-emerald-100/90 font-medium">
                    {extractedResult.candidatePhotoDescription || 'हा फोटो आपोआप नवीन प्रोफाईलच्या फोटो गॅलरीत जोडला जाईल.'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <span className="text-slate-500 text-[10px] block">नाव (Full Name)</span>
              <span className="font-bold text-white">{extractedResult.fullName || '—'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">लिंग / प्रकार</span>
              <span className="font-bold text-amber-300">{extractedResult.gender === 'bride' ? '👰 वधू' : '🤵 वर'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">जन्मतारीख</span>
              <span className="font-bold text-white">{extractedResult.dob || '—'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">शिक्षण (Education)</span>
              <span className="font-bold text-white">{extractedResult.education || '—'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">नोकरी / व्यवसाय</span>
              <span className="font-bold text-white">{extractedResult.occupation || '—'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">गोत्र / राशी</span>
              <span className="font-bold text-white">{extractedResult.gotra || 'काश्यप'} / {extractedResult.rashi || 'मकर'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">वडिलांचे नाव</span>
              <span className="font-bold text-white">{extractedResult.fatherName || '—'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">मोबाईल नंबर</span>
              <span className="font-bold text-emerald-400">{extractedResult.mobile || '—'}</span>
            </div>

            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-900">
              <span className="text-slate-500 text-[10px] block">नातेवाईक आडनावे (Relative Surnames)</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {extractedResult.relativeSurnames?.map((sur, idx) => (
                  <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-200 border border-slate-800">
                    {sur}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
