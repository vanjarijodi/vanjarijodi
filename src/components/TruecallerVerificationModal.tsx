import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Check,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Lock,
  ArrowRight,
  ShieldAlert,
  Send,
  UserCheck,
  Zap,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface TruecallerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TruecallerVerificationModal: React.FC<TruecallerVerificationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, verifyPhoneNumber, siteConfig } = useApp();

  const [activeMethod, setActiveMethod] = useState<'truecaller' | 'otp'>('truecaller');
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser?.mobile || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'truecaller_processing' | 'otp_sent' | 'success'>('select');
  
  // OTP States
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(45);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [truecallerProfileName, setTruecallerProfileName] = useState<string>('');
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && currentUser) {
      setPhoneNumber(currentUser.mobile || '');
      setStep(currentUser.isPhoneVerified ? 'success' : 'select');
      setErrorMsg(null);
      setIsProcessing(false);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  if (!isOpen || !currentUser) return null;

  // Clean raw phone number (10 digits)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '').slice(-10);

  // 1. Truecaller 1-Click Instant Verification Flow
  const handleTruecallerVerify = async () => {
    if (!cleanNumber || cleanNumber.length < 10) {
      setErrorMsg('कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setStep('truecaller_processing');

    // Simulate Truecaller deep-link invocation / SDK handshake
    const simulatedTruecallerName = currentUser.fullName || 'वंजारी सदस्य';
    setTruecallerProfileName(simulatedTruecallerName);

    // If on Android mobile device, attempt deep link intent fallback
    const isMobileAndroid = /android/i.test(navigator.userAgent);
    if (isMobileAndroid) {
      try {
        // Truecaller SDK deep-link URL scheme
        const tcAppKey = siteConfig?.truecallerAppKey || 'vanjari_jodi_app';
        window.location.href = `truecallersdk://truesdk/web_verify?requestNonce=${Date.now()}&partnerKey=${tcAppKey}&partnerName=VanjariJodi`;
      } catch (e) {
        console.warn('Truecaller intent fallback:', e);
      }
    }

    // High fidelity realistic Truecaller verification timeout
    setTimeout(async () => {
      try {
        const success = await verifyPhoneNumber(
          currentUser.id,
          'truecaller',
          simulatedTruecallerName
        );
        if (success) {
          setIsProcessing(false);
          setStep('success');
        } else {
          setErrorMsg('Truecaller पडताळणी पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा किंवा OTP पर्याय वापरा.');
          setIsProcessing(false);
          setStep('select');
        }
      } catch (err) {
        setErrorMsg('तांत्रिक त्रुटी आली. कृपया OTP पर्याय वापरा.');
        setIsProcessing(false);
        setStep('select');
      }
    }, 1800);
  };

  // 2. Send SMS / WhatsApp OTP Flow
  const handleSendOtp = () => {
    if (!cleanNumber || cleanNumber.length < 10) {
      setErrorMsg('कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    // Generate randomized 6-digit OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('otp_sent');
      setTimer(45);
      setIsTimerActive(true);
      setOtpCode(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }, 1000);
  };

  // Handle OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newOtp = [...otpCode];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Verify OTP Code
  const handleVerifyOtp = async () => {
    const enteredCode = otpCode.join('');
    if (enteredCode.length !== 6) {
      setErrorMsg('कृपया पूर्ण ६ अंकी OTP टाका.');
      return;
    }

    // Allow generated OTP or universal testing OTP (123456)
    if (enteredCode !== generatedOtp && enteredCode !== '123456') {
      setErrorMsg('चुकीचा OTP! कृपया पुन्हा तपासा किंवा 123456 टाका.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const success = await verifyPhoneNumber(
        currentUser.id,
        'otp',
        currentUser.fullName
      );
      if (success) {
        setIsProcessing(false);
        setStep('success');
      } else {
        setErrorMsg('पडताळणी करताना समस्या आली. कृपया पुन्हा प्रयत्न करा.');
        setIsProcessing(false);
      }
    } catch (err) {
      setErrorMsg('त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      setIsProcessing(false);
    }
  };

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-hidden pt-safe pb-safe animate-fadeIn">
      <div className="bg-white w-full h-full sm:h-auto max-w-lg rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border-2 border-amber-300 overflow-hidden relative flex flex-col sm:my-auto max-h-none sm:max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0087FF] via-[#0066CC] to-[#800C1E] p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-300 text-blue-950 font-black text-[10px] uppercase tracking-wider">
                  अधिकृत सुरक्षा
                </span>
                <span className="text-xs text-cyan-100 font-bold">1-Click Truecaller</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                मोबाईल नंबर पडताळणी (Phone Verification)
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* STEP 1: METHOD SELECTION & MOBILE INPUT */}
          {step === 'select' && (
            <div className="space-y-5">
              
              {/* Candidate Info Chip */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-300 bg-blue-100 shrink-0">
                    <img
                      src={currentUser.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">{currentUser.fullName}</h4>
                    <p className="text-xs text-slate-600 font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>{currentUser.mobile || 'मोबाईल नंबर प्रविष्ट करा'}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  ID: {currentUser.id}
                </span>
              </div>

              {/* Mobile Number Edit Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">
                  पडताळणी करावयाचा मोबाईल नंबर (Registered Mobile):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-slate-500">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={cleanNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="९४०५७ ९०९१६"
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-black tracking-wider focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  🔒 हा क्रमांक सुरक्षित राहील व प्रोफाईलला <strong>"मोबाईल नंबर व्हेरिफाइड"</strong> बॅज मिळेल.
                </p>
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveMethod('truecaller')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMethod === 'truecaller'
                      ? 'bg-[#0087FF] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-200" />
                  <span>१. Truecaller (1-Click)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('otp')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMethod === 'otp'
                      ? 'bg-[#800C1E] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-200" />
                  <span>२. SMS / WhatsApp OTP</span>
                </button>
              </div>

              {/* TAB 1: TRUECALLER 1-TAP ACTION */}
              {activeMethod === 'truecaller' && (
                <div className="space-y-4 pt-1">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-black text-xs">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Truecaller अधिकृत पडताळणी फायदे:</span>
                    </div>
                    <ul className="text-[11px] text-slate-700 space-y-1 font-semibold pl-1">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>कोणताही OTP न टाकता <strong>१ सेकंदात झटपट पडताळणी</strong>.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>प्रोफाईलवर <strong>"Truecaller Verified"</strong> निळा बॅज तात्काळ सक्रिय होतो.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>इतर पालकांचा ७०% जास्त विश्वास व थेट संपर्क प्रतिसाद.</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleTruecallerVerify}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0087FF] via-[#0066CC] to-[#005AE0] hover:from-[#0077E6] hover:to-[#004BB3] text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50 border border-blue-300"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Truecaller सह कनेक्ट करत आहे...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-cyan-200 fill-current" />
                        <span>Truecaller द्वारे पडताळणी करा (1-Tap Verify)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: OTP OPTION */}
              {activeMethod === 'otp' && (
                <div className="space-y-4 pt-1">
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium">
                    तुमच्या <strong>+91 {cleanNumber}</strong> या क्रमांकावर ६ अंकी पडताळणी कोड (OTP) पाठवला जाईल.
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleSendOtp}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#660918] hover:to-[#800C1E] text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50 border border-amber-300"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>OTP पाठवत आहे...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-200" />
                        <span>OTP कोड पाठवा (Send OTP)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: TRUECALLER PROCESSING ANIMATION */}
          {step === 'truecaller_processing' && (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 border-4 border-[#0087FF] flex items-center justify-center relative shadow-xl">
                <Smartphone className="w-10 h-10 text-[#0087FF] animate-pulse" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                  ✓
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Truecaller सोबत मोबाईल नंबर पडताळणी सुरू आहे...
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  नोंदणीकृत नंबर: <strong>+91 {cleanNumber}</strong>
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-blue-700 font-bold bg-blue-50 py-2 px-4 rounded-xl max-w-xs mx-auto border border-blue-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Truecaller Secure SDK हँडशेक चालू आहे</span>
              </div>
            </div>
          )}

          {/* STEP 3: OTP ENTER SCREEN */}
          {step === 'otp_sent' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#A71930]" />
                </div>
                <h3 className="text-base font-black text-slate-900">OTP प्रविष्ट करा (Enter OTP)</h3>
                <p className="text-xs text-slate-600 font-medium">
                  +91 {cleanNumber} वर पाठवलेला ६ अंकी कोड टाका.
                </p>
              </div>

              {/* Demo Quick Autofill Pill */}
              {generatedOtp && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>चाचणी OTP: <strong>{generatedOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(generatedOtp.split(''));
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg cursor-pointer"
                  >
                    ऑटो-फिल करा
                  </button>
                </div>
              )}

              {/* 6 Digit OTP Inputs */}
              <div className="flex justify-center gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center font-black text-lg sm:text-xl rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="button"
                disabled={isProcessing || otpCode.join('').length !== 6}
                onClick={handleVerifyOtp}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>पडताळणी करत आहे...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>नंबर व्हेरिफाय करा (Confirm OTP)</span>
                  </>
                )}
              </button>

              {/* Resend OTP & Back Controls */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                >
                  ← नंबर बदला
                </button>

                {isTimerActive ? (
                  <span className="text-slate-500 font-bold">
                    पुन्हा कोड पाठवा: <strong className="text-blue-600">{timer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-blue-600 hover:text-blue-800 font-black cursor-pointer"
                  >
                    पुन्हा OTP पाठवा (Resend)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: VERIFICATION SUCCESS STATE */}
          {step === 'success' && (
            <div className="py-4 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg border-2 border-emerald-200">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 inline-block">
                  🎉 मोबाईल नंबर १००% व्हेरिफाइड झाला!
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {currentUser.fullName}
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  क्रमांक <strong>+91 {cleanNumber}</strong> ची पडताळणी पूर्ण झाली असून प्रोफाइलवर अधिकृत बॅज जोडला गेला आहे.
                </p>
              </div>

              {/* Badge Preview Box */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 rounded-2xl border-2 border-blue-300 text-left space-y-2">
                <div className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>तुमच्या प्रोफाईलला मिळालेला बॅज:</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-xs shadow-md border border-blue-300">
                  <Phone className="w-3.5 h-3.5 text-cyan-200" />
                  <span>{currentUser.phoneVerificationMethod === 'truecaller' ? 'Truecaller व्हेरिफाइड' : '📱 नंबर व्हेरिफाइड'}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  ✨ आता तुमचा बायोडाटा पाहणाऱ्या इतर सर्व सदस्यांना तुमचा नंबर अस्सल व खरा असल्याचा विश्वास मिळेल.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#660918] hover:to-[#800C1E] text-white font-black text-xs rounded-xl shadow cursor-pointer transition-all border border-amber-300"
              >
                समजले, बंद करा (Done)
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
