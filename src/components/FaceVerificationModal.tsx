import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, ShieldCheck, CheckCircle2, Sparkles, RefreshCw, AlertCircle, ScanFace, Lock, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaceVerificationModal: React.FC<FaceVerificationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitFaceVerification } = useApp();
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{
    score: number;
    success: boolean;
  } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const hasProfilePhoto = Boolean(currentUser?.photos && currentUser.photos.length > 0 && currentUser.photos[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setIsScanning(false);
      setScanProgress(0);
      setVerificationResult(null);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraLoading(true);
    setCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported on this browser');
      }

      // Stop any existing stream
      stopCamera();

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch (fallbackErr) {
        console.warn('FacingMode user failed, trying basic video:', fallbackErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (pErr) {
          console.warn('Video play error:', pErr);
        }
      }

      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraActive(false);
      const errStr = String(err || '').toLowerCase();
      if (errStr.includes('dismissed') || errStr.includes('notallowed') || errStr.includes('denied') || errStr.includes('permission')) {
        setCameraError('कॅमेरा परवानगी नाकारली गेली आहे किंवा रद्द झाली आहे (Permission Dismissed/Denied). कृपया ब्राऊझर URL बारमधील लॉक आयकॉनवर क्लिक करून कॅमेरा Allow करा किंवा खालील थेट फाईल/सेलफी अपलोड बटणाचा वापर करा.');
      } else {
        setCameraError('थेट वेबकॅमेरा सुरू करता आला नाही. कृपया खालील थेट सेल्फी/फोटो अपलोड पर्यायाचा वापर करून फोटो निवडा.');
      }
    } finally {
      setIsCameraLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          setCameraError(null);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSubmitForAdminReview = () => {
    if (!capturedImage) return;

    setVerificationResult({ score: 100, success: true });
    
    if (currentUser) {
      submitFaceVerification({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userMobile: currentUser.mobile,
        capturedPhotoUrl: capturedImage,
        profilePhotoUrl: currentUser.photos?.[0] || '',
        matchScore: 100,
        status: 'pending'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A71930] to-[#800C1E] text-white p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/20 rounded-2xl border border-amber-300/40">
              <ScanFace className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-amber-100">फोटो व चेहरा पडताळणी (Face Verification)</h3>
              <p className="text-xs text-amber-200/80">ब्लू टिक (Verified Badge) साठी फोटो ॲडमिनकडे पडताळणीसाठी सादर करा</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {!hasProfilePhoto ? (
            /* No Profile Photo Warning State */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl mx-auto flex items-center justify-center border-2 border-amber-300">
                <AlertCircle className="w-10 h-10 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-800">प्रोफाईल फोटो सापडला नाही!</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  फोटो पडताळणी करण्यासाठी तुमच्या खात्यावर मूळ प्रोफाइल फोटो असणे आवश्यक आहे. 
                  ॲडमिन तुमच्या सादर केलेल्या फोटोची मूळ फोटोसोबत पडताळणी करतील.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-semibold text-left space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>पुढील सोप्या पायऱ्या:</span>
                </p>
                <p className="pl-5">• पायरी १: प्रथम 'माझी प्रोफाईल' (Edit Profile) मध्ये जा.</p>
                <p className="pl-5">• पायरी २: तुमचा चांगला व स्पष्ट फोटो अपलोड करा.</p>
                <p className="pl-5">• पायरी ३: त्यानंतर पुन्हा या 'फोटो पडताळणी' बटणावर क्लिक करा.</p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm"
              >
                माझ्या प्रोफाईलवर जा व फोटो जोडा
              </button>
            </div>
          ) : verificationResult?.success ? (
            /* Submitted / Pending State for Admin Review */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full mx-auto flex items-center justify-center border-4 border-amber-300 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-amber-700" />
              </div>

              {/* Side by side comparison display */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="space-y-1 text-center">
                  <img src={currentUser?.photos?.[0]} alt="Original Profile" className="w-full h-28 object-cover rounded-xl border border-slate-300 shadow-xs" />
                  <span className="text-[10px] font-bold text-slate-700 block">१. मूळ प्रोफाईल फोटो</span>
                </div>
                <div className="space-y-1 text-center">
                  <img src={capturedImage || ''} alt="Live Captured" className="w-full h-28 object-cover rounded-xl border border-slate-300 shadow-xs" />
                  <span className="text-[10px] font-bold text-slate-700 block">२. थेट कॅमेरा / सादर फोटो</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-900 rounded-full text-xs font-black border border-amber-300 shadow-xs">
                  ⏳ ॲडमिन पडताळणीसाठी प्रलंबित (Pending Admin Approval)
                </span>
                <h4 className="text-xl font-black text-slate-800">फोटो ॲडमिनकडे सादर झाला आहे!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  ॲडमिन दोन्ही फोटोंची तपासणी करून तुमच्या खात्यावर <strong className="text-blue-600">प्रमाणित (Verified Badge)</strong> निळी टिक मंजूर करतील.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center gap-2 text-amber-900 text-xs font-bold">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>हा फोटो पडताळणीसाठी सुरक्षितपणे जमा झाला आहे.</span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-[#A71930] to-[#800C1E] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer"
              >
                ठीक आहे (Close)
              </button>
            </div>
          ) : (
            /* Capture / Upload Flow */
            <div className="space-y-5">

              {/* Side-by-Side Viewport: Original Photo vs Live Camera */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left: Original Profile Photo */}
                <div className="relative h-56 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner flex flex-col items-center justify-center group">
                  <img src={currentUser?.photos?.[0]} alt="Original Profile" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20 text-center truncate">
                    १. मूळ फोटो
                  </span>
                </div>

                {/* Right: Live Camera or Captured Image */}
                <div className="relative h-56 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner flex flex-col items-center justify-center group">
                  {capturedImage ? (
                    <div className="relative w-full h-full">
                      <img src={capturedImage} alt="Captured Face" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          cameraActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      {cameraActive && (
                        <div className="absolute w-24 h-32 border-2 border-dashed border-amber-400 rounded-[50%] pointer-events-none flex flex-col items-center justify-center bg-transparent">
                          <span className="text-[9px] text-amber-300 font-bold bg-black/60 px-1.5 py-0.5 rounded-full mt-1">
                            चेहरा येथे
                          </span>
                        </div>
                      )}
                      {!cameraActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 space-y-2 p-2 bg-slate-950/90 text-center">
                          {isCameraLoading ? (
                            <>
                              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                              <p className="text-[11px] font-bold text-amber-200">कॅमेरा सुरू होत आहे...</p>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-slate-500 stroke-1" />
                              <p className="text-[11px] text-slate-400">कॅमेरा बंद आहे</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-300/30 text-center truncate">
                    २. थेट फोटो
                  </span>
                </div>
              </div>

              {/* Camera Error Message if any */}
              {cameraError && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Strict Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center gap-2 font-bold">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>फोटो काढल्यानंतर तो थेट ॲडमिन पडताळणीसाठी सादर केला जाईल.</span>
              </div>

              {/* Hidden File Input Fallback for Mobile Camera / Gallery Upload when browser camera permission is dismissed */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="user"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Actions */}
              {!capturedImage ? (
                <div className="w-full space-y-2.5">
                  <button
                    type="button"
                    onClick={cameraActive ? capturePhoto : startCamera}
                    className="w-full py-3.5 px-4 bg-[#A71930] hover:bg-[#800C1E] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-amber-300" />
                    <span>{cameraActive ? 'फोटो घ्या (Capture Photo)' : 'कॅमेरा सुरू करा'}</span>
                  </button>

                  {/* Fallback upload button if camera has error or user prefers uploading camera file */}
                  {cameraError && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 bg-amber-100 hover:bg-amber-200 text-[#A71930] font-bold rounded-2xl flex items-center justify-center gap-2 border border-amber-300 transition-all text-xs cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#A71930]" />
                      <span>कॅमेरा/फॉरमॅटवरून फोटो निवडा (Upload Photo Fallback)</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setVerificationResult(null);
                      startCamera();
                    }}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl flex items-center justify-center gap-2 border border-slate-300 transition-all text-sm cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>पुन्हा फोटो घ्या</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitForAdminReview}
                    className="py-3 px-4 bg-gradient-to-r from-[#A71930] to-[#800C1E] hover:from-[#800C1E] hover:to-[#600816] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>ॲडमिन पडताळणीसाठी फोटो पाठवा</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
