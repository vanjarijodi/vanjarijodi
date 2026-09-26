import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  UserCheck,
  Lock,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VerificationStatusType } from '../types';

interface VerificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationCenterModal: React.FC<VerificationCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, updateProfileDirect } = useApp();

  const currentStatus: VerificationStatusType = currentUser?.verification_status || (
    currentUser?.aadhaarVerified ? 'Approved' : 'Not Submitted'
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [aadhaarNumber, setAadhaarNumber] = useState(currentUser?.aadhaar_number || '');
  const [aadhaarFront, setAadhaarFront] = useState<string>(currentUser?.aadhaar_front_image || '');
  const [aadhaarBack, setAadhaarBack] = useState<string>(currentUser?.aadhaar_back_image || '');
  const [selfieImage, setSelfieImage] = useState<string>(currentUser?.selfie_image || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Camera state for selfie
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  if (!isOpen || !currentUser) return null;

  // File to base64 helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('फाईल साईझ 5MB पेक्षा कमी असावी.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setter(event.target.result as string);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Selfie Camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMessage('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      setIsCameraActive(false);
      setErrorMessage('कॅमेरा सुरू करता आला नाही. कृपया गॅलरीतून फोटो अपलोड करा.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelfieImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Submit Verification Data
  const handleSubmitVerification = async () => {
    if (!aadhaarNumber.trim() || aadhaarNumber.replace(/\s/g, '').length !== 12) {
      setErrorMessage('कृपया वैध 12-अंकी आधार क्रमांक नोंदवा.');
      return;
    }
    if (!aadhaarFront) {
      setErrorMessage('कृपया आधार कार्डचा पुढील फोटो (Front) अपलोड करा.');
      return;
    }
    if (!aadhaarBack) {
      setErrorMessage('कृपया आधार कार्डचा मागील फोटो (Back) अपलोड करा.');
      return;
    }
    if (!selfieImage) {
      setErrorMessage('कृपया पडताळणीसाठी सेल्फी फोटो जोडा.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const updatedData = {
        aadhaar_number: aadhaarNumber.trim(),
        aadhaar_front_image: aadhaarFront,
        aadhaar_back_image: aadhaarBack,
        selfie_image: selfieImage,
        verification_status: 'Pending Review' as VerificationStatusType,
        verification_submitted_at: new Date().toISOString(),
        rejection_reason: '' // Clear past rejection
      };

      await updateProfileDirect(currentUser.id, updatedData);
      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'पडताळणी डेटा पाठवताना समस्या आली.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-amber-300 overflow-hidden my-auto animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#9B111E] to-[#800C1E] text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-1.5">
                अधिकृत प्रोफाइल पडताळणी केंद्र
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                  Blue Tick KYC
                </span>
              </h2>
              <p className="text-xs text-amber-200">आधार कार्ड व सेल्फीद्वारे अधिकृत व्हेरिफाइड प्रोफाइल बनवा</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Card */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-start justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              {currentStatus === 'Approved' && (
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {currentStatus === 'Pending Review' && (
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-spin-slow" />
                </div>
              )}
              {currentStatus === 'Rejected' && (
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              {currentStatus === 'Not Submitted' && (
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">सद्यस्थिती (Current Status):</span>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      currentStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : currentStatus === 'Pending Review'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : currentStatus === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {currentStatus === 'Approved'
                      ? '✓ पडताळणी मंजूर (Approved • Blue Tick Active)'
                      : currentStatus === 'Pending Review'
                      ? '⏳ ॲडमिन पडताळणी प्रलंबित (Pending Review)'
                      : currentStatus === 'Rejected'
                      ? '✕ पडताळणी नाकारली (Rejected)'
                      : 'सबमिट केलेले नाही (Not Submitted)'}
                  </span>
                </div>

                {currentStatus === 'Approved' && (
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    अभिनंदन! आपल्या प्रोफाइलवर अधिकृत <span className="text-blue-600 font-black">Blue Tick</span> सक्रिय करण्यात आली आहे.
                  </p>
                )}

                {currentStatus === 'Pending Review' && (
                  <p className="text-xs text-amber-700 font-semibold mt-1">
                    आपले कागदपत्रे ॲडमिनकडे पुनरावलोकनासाठी पाठवले आहेत. लवकरच पडताळणी पूर्ण होईल.
                  </p>
                )}

                {currentStatus === 'Rejected' && currentUser.rejection_reason && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-[11px] font-black text-rose-800 block">नाकारण्याचे कारण (Rejection Reason):</span>
                    <p className="text-xs text-rose-700 font-semibold mt-0.5">{currentUser.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* If already submitted and successfully waiting */}
        {submitSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">कागदपत्रे यशस्वीरित्या सबमिट झाली!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              आपला आधार क्रमांक, आधार कार्ड फोटो आणि सेल्फी ॲडमिन कडे सुरक्षितपणे पाठवले गेले आहेत. तपासणीनंतर लगेचच आपल्या प्रोफाइलवर <span className="text-blue-600 font-black">Blue Tick</span> दिसेल.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#800C1E] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#9B111E] cursor-pointer"
            >
              समजले (Close)
            </button>
          </div>
        ) : currentStatus === 'Approved' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">आपले प्रोफाइल यशस्वीरीत्या व्हेरिफाइड झाले आहे!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              आपली आधार व सेल्फी पडताळणी यशस्वीरित्या पूर्ण झाली आहे. इतर वधू-वर पालकांना आपल्या प्रोफाइलवर अधिकृत विश्वास आहे.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#800C1E] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#9B111E] cursor-pointer"
            >
              पूर्ण झाले (Done)
            </button>
          </div>
        ) : (
          /* Verification Flow Steps */
          <div className="p-5 space-y-5">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                <span>टप्पा {step} पैकी 4</span>
                <span className="text-[#800C1E] font-black">{progressPercentage}% पूर्ण</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#800C1E] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Aadhaar Number & Front Image */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>गोपनीयता हमी:</strong> आपले आधार कार्ड केवळ ॲडमिन पडताळणीसाठी वापरले जाते. इतर कोणत्याही युझरला आपला आधार क्रमांक किंवा फोटो दिसणार नाही.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                    आधार कार्ड क्रमांक (12-Digit Aadhaar Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={aadhaarNumber}
                    onChange={(e) => {
                      // Allow numbers and auto-format XXXX XXXX XXXX
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setAadhaarNumber(formatted);
                    }}
                    placeholder="उदा. 1234 5678 9012"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#800C1E] font-mono text-base font-bold tracking-widest text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                    आधार कार्ड समोरील बाजू (Aadhaar Front Side) <span className="text-rose-500">*</span>
                  </label>
                  {aadhaarFront ? (
                    <div className="relative rounded-2xl border-2 border-emerald-300 p-2 bg-emerald-50/50 flex items-center justify-between">
                      <img
                        src={aadhaarFront}
                        alt="Aadhaar Front"
                        className="h-24 w-36 object-cover rounded-xl border border-slate-200 shadow-xs"
                      />
                      <div className="flex-1 px-3 text-left">
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> समोरील फोटो जोडला
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">फोटो स्पष्ट व वाचता येण्याजोगा आहे</p>
                      </div>
                      <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">
                        बदला
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setAadhaarFront)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#800C1E] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-all">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-[#800C1E] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black text-slate-800">आधार समोरील फोटो अपलोड करा</span>
                      <span className="text-[10px] text-slate-500">JPG, PNG (कमाल 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setAadhaarFront)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (!aadhaarNumber.replace(/\s/g, '').length || aadhaarNumber.replace(/\s/g, '').length !== 12) {
                        setErrorMessage('कृपया पूर्ण 12-अंकी आधार क्रमांक नोंदवा.');
                        return;
                      }
                      if (!aadhaarFront) {
                        setErrorMessage('कृपया आधार समोरील फोटो अपलोड करा.');
                        return;
                      }
                      setErrorMessage('');
                      setStep(2);
                    }}
                    className="px-5 py-2.5 bg-[#800C1E] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#9B111E] flex items-center gap-1.5 cursor-pointer"
                  >
                    पुढील टप्पा <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Aadhaar Back Image */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                    आधार कार्ड मागील बाजू - पत्ता असलेला भाग (Aadhaar Back Side) <span className="text-rose-500">*</span>
                  </label>
                  {aadhaarBack ? (
                    <div className="relative rounded-2xl border-2 border-emerald-300 p-2 bg-emerald-50/50 flex items-center justify-between">
                      <img
                        src={aadhaarBack}
                        alt="Aadhaar Back"
                        className="h-24 w-36 object-cover rounded-xl border border-slate-200 shadow-xs"
                      />
                      <div className="flex-1 px-3 text-left">
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> मागील बाजू जोडली
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">पत्ता व बारकोड स्पष्ट दिसत आहे</p>
                      </div>
                      <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">
                        बदला
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setAadhaarBack)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#800C1E] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-all">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-[#800C1E] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black text-slate-800">आधार मागील फोटो अपलोड करा</span>
                      <span className="text-[10px] text-slate-500">पत्ता स्पष्ट दिसेल असा फोटो निवडा</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setAadhaarBack)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> मागे
                  </button>
                  <button
                    onClick={() => {
                      if (!aadhaarBack) {
                        setErrorMessage('कृपया आधार मागील फोटो अपलोड करा.');
                        return;
                      }
                      setErrorMessage('');
                      setStep(3);
                    }}
                    className="px-5 py-2.5 bg-[#800C1E] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#9B111E] flex items-center gap-1.5 cursor-pointer"
                  >
                    पुढील टप्पा (सेल्फी) <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Selfie Verification Module */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black text-slate-900">लाईव्ह सेल्फी पडताळणी (Selfie Verification)</h3>
                  <p className="text-xs text-slate-500">
                    आधारवरील चेहऱ्याशी आपला खरा चेहरा जुळवून पाहण्यासाठी एक स्पष्ट सेल्फी फोटो आवश्यक आहे.
                  </p>
                </div>

                {/* Camera preview */}
                {isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-xs mx-auto border-2 border-amber-400 shadow-md">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-2 border-white/40 pointer-events-none rounded-full scale-75 border-dashed" />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                      <button
                        onClick={captureSelfie}
                        className="px-5 py-2 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg hover:bg-emerald-600 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" /> फोटो काढा
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 rounded-full bg-slate-800 text-white font-bold text-xs shadow-md hover:bg-slate-700 cursor-pointer"
                      >
                        रद्द
                      </button>
                    </div>
                  </div>
                ) : selfieImage ? (
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 max-w-xs mx-auto text-center space-y-2">
                    <img
                      src={selfieImage}
                      alt="Selfie"
                      className="w-36 h-36 object-cover rounded-2xl border-2 border-white shadow-md"
                    />
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> सेल्फी फोटो जोडला
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={startCamera}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        पुन्हा काढा
                      </button>
                      <label className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                        गॅलरीतून निवडा
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setSelfieImage)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-xs mx-auto">
                    <button
                      onClick={startCamera}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-cyan-200" /> थेट कॅमेऱ्याने सेल्फी काढा
                    </button>

                    <div className="text-center text-xs font-bold text-slate-400">किंवा</div>

                    <label className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#800C1E] bg-slate-50 hover:bg-amber-50/40 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-[#800C1E]" /> मोबाईल गॅलरीतून सेल्फी निवडा
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setSelfieImage)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      stopCamera();
                      setStep(2);
                    }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> मागे
                  </button>
                  <button
                    onClick={() => {
                      if (!selfieImage) {
                        setErrorMessage('कृपया सेल्फी फोटो जोडा.');
                        return;
                      }
                      setErrorMessage('');
                      setStep(4);
                    }}
                    className="px-5 py-2.5 bg-[#800C1E] text-white font-black text-xs rounded-xl shadow-md hover:bg-[#9B111E] flex items-center gap-1.5 cursor-pointer"
                  >
                    तपासणी व सबमिशन <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Final Review & Submit */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">कागदपत्रे तपासणी (Summary)</h4>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 text-xs">
                    <span className="text-slate-500 font-semibold">आधार क्रमांक:</span>
                    <span className="font-mono font-bold text-slate-900">{aadhaarNumber}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 block">आधार समोरील</span>
                      <img src={aadhaarFront} alt="Front" className="h-16 w-full object-cover rounded-lg border" />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 block">आधार मागील</span>
                      <img src={aadhaarBack} alt="Back" className="h-16 w-full object-cover rounded-lg border" />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 block">सेल्फी फोटो</span>
                      <img src={selfieImage} alt="Selfie" className="h-16 w-full object-cover rounded-lg border" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> मागे
                  </button>
                  <button
                    onClick={handleSubmitVerification}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-xl shadow-lg hover:opacity-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> सबमिट करत आहे...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-200" /> पडताळणीसाठी सबमिट करा
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
