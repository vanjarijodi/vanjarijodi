import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { safeParseJson } from '../utils/safeFetchJson';
import { signInWithGoogleVerified } from '../utils/googleAuthClient';

interface TruecallerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

/**
 * 1-Click Google Account Verification Modal (with optional Email OTP fallback).
 * Preserves exported symbol name for backwards compatibility across callers.
 */
export const TruecallerVerificationModal: React.FC<TruecallerVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, verifyPhoneNumber, updateProfileDirect } = useApp();

  const [emailInput, setEmailInput] = useState<string>(currentUser?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmailOtpFallback, setShowEmailOtpFallback] = useState(false);
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedName, setVerifiedName] = useState<string>('');
  const [verifiedEmailDisplay, setVerifiedEmailDisplay] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpSentMsg, setOtpSentMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  useModalScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && currentUser) {
      setEmailInput(currentUser.email || '');
      setVerifiedEmailDisplay(currentUser.email || '');
      setStep(currentUser.isPhoneVerified ? 'success' : 'input');
      setShowEmailOtpFallback(false);
      setErrorMsg(null);
      setOtpSentMsg(null);
      setIsProcessing(false);
      setEnteredOtp('');
      setCooldown(0);
      setVerifiedName(currentUser.fullName || 'वंजारी सदस्य');
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen || !currentUser) return null;

  const cleanEmail = emailInput.trim().toLowerCase();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail);
  const cleanNumber = (currentUser.mobile || '').replace(/\D/g, '').slice(-10);

  // PRIMARY: 1-Click Google Account Verification (Zero OTP!)
  const handleVerifyWithGoogle = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const gRes = await signInWithGoogleVerified({
        mobileNumber: cleanNumber || undefined,
      });

      if (!gRes.success || !gRes.email) {
        setErrorMsg(gRes.error || 'गुगल पडताळणी पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.');
        setIsProcessing(false);
        return;
      }

      const displayMemberName = currentUser.fullName || gRes.displayName || 'वंजारी सदस्य';
      setVerifiedName(displayMemberName);
      setVerifiedEmailDisplay(gRes.email);
      setEmailInput(gRes.email);

      await verifyPhoneNumber(currentUser.id, 'otp', displayMemberName);

      updateProfileDirect(currentUser.id, {
        isPhoneVerified: true,
        isVerified: true,
        isGoogleUser: true,
        authProvider: 'google',
        truecallerVerified: false,
        phoneVerificationMethod: 'otp',
        email: gRes.email,
      });

      setIsProcessing(false);
      setStep('success');
    } catch (e: any) {
      setIsProcessing(false);
      setErrorMsg('गुगल पडताळणी दरम्यान त्रुटी आली: ' + (e.message || ''));
    }
  };

  // Optional Fallback: Send 4-digit Email OTP
  const handleSendEmailOtp = async () => {
    if (!isEmailValid) {
      setErrorMsg('कृपया वैध ईमेल पत्ता प्रविष्ट करा (उदा. name@gmail.com).');
      return;
    }
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          mobile_number: cleanNumber || undefined,
          purpose: 'account_verification',
          deviceFingerprint: getDeviceFingerprint(),
        }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP पाठवताना अडचण आली.');
      setIsProcessing(false);
      if (!resp.ok || !data?.success) {
        if (data?.cooldownSeconds) setCooldown(Number(data.cooldownSeconds));
        setErrorMsg(data?.error || 'ईमेल OTP पाठवताना अडचण आली. कृपया गुगलने १-क्लिक पडताळणी वापरा.');
        return;
      }
      setStep('otp');
      setCooldown(data.cooldownSeconds || 60);
      setOtpSentMsg(
        data.message || `तुमच्या ईमेल (${cleanEmail}) वर ४-अंकी पडताळणी कोड पाठवला आहे.`
      );
    } catch (e: any) {
      setIsProcessing(false);
      setErrorMsg('सर्व्हरशी संपर्क होऊ शकला नाही: ' + (e.message || ''));
    }
  };

  // Optional Fallback: Verify 4-digit Email OTP
  const handleVerifyOtp = async () => {
    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setErrorMsg('कृपया ईमेलवर आलेला ४-अंकी OTP कोड टाका.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    const displayMemberName = currentUser.fullName || 'वंजारी सदस्य';
    setVerifiedName(displayMemberName);

    try {
      const resp = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          mobile_number: cleanNumber || undefined,
          otp: enteredOtp.trim(),
        }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP पडताळणी करताना अडचण आली.');
      if (!resp.ok || !data?.success) {
        setErrorMsg(data?.error || 'चुकीचा OTP! कृपया ईमेल तपासून पुन्हा प्रयत्न करा.');
        setIsProcessing(false);
        return;
      }

      await verifyPhoneNumber(currentUser.id, 'otp', displayMemberName);

      updateProfileDirect(currentUser.id, {
        isPhoneVerified: true,
        isVerified: true,
        truecallerVerified: false,
        phoneVerificationMethod: 'otp',
        email: cleanEmail,
      });

      setVerifiedEmailDisplay(cleanEmail);
      setIsProcessing(false);
      setStep('success');
    } catch {
      setErrorMsg('पडताळणी दरम्यान त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border-2 border-amber-300 transform transition-all">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#6B0A18] text-white p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-amber-300/15 blur-xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#800C1E] flex items-center justify-center font-black text-xl shadow-lg border-2 border-amber-300">
              <GoogleGIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-amber-100 text-[10px] font-black tracking-wide uppercase">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>१-क्लिक गुगल पडताळणी</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                गुगल खात्याने खाते पडताळणी
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* STEP 1: 1-CLICK GOOGLE VERIFY */}
          {step === 'input' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>कोणत्याही OTP शिवाय १-क्लिकमध्ये मोफत पडताळणी!</span>
                </p>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  फक्त तुमच्या Google (Gmail) खात्यावर क्लिक करा — पडताळणी त्वरित पूर्ण होऊन तुमच्या प्रोफाईलवर अधिकृत{' '}
                  <strong>'व्हेरिफाइड'</strong> बॅज सक्रिय होईल.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5 py-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>कोणताही OTP कोड टाकण्याची गरज नाही — १-क्लिकमध्ये पडताळणी.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>प्रोफाईलवर अधिकृत 'व्हेरिफाइड' बॅज व थेट चॅट सुविधा अनलॉक होईल.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyWithGoogle}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-[#4285F4] font-black text-sm flex items-center justify-center gap-2.5 shadow-md cursor-pointer active:scale-95 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#4285F4]" />
                ) : (
                  <GoogleGIcon className="w-5 h-5" />
                )}
                <span>{isProcessing ? 'गुगल पडताळणी होत आहे...' : 'गुगलने १-क्लिक पडताळणी करा (Verify with Google)'}</span>
              </button>

              {/* Optional Email OTP fallback toggle */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmailOtpFallback(!showEmailOtpFallback)}
                  className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                >
                  {showEmailOtpFallback ? 'ईमेल OTP पर्याय लपवा' : 'किंवा ईमेल OTP ने पडताळणी करायची आहे?'}
                </button>

                {showEmailOtpFallback && (
                  <div className="mt-3 space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="उदा. yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={!isEmailValid || isProcessing}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#800C1E] text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>📧 ईमेलवर ४-अंकी OTP पाठवा</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: OPTIONAL EMAIL OTP FALLBACK */}
          {step === 'otp' && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>ईमेल पडताळणी कोड (Email OTP)</span>
                </p>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  {otpSentMsg || `${cleanEmail} वर पाठवलेला ४-अंकी ईमेल OTP टाका.`}
                </p>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-Digit OTP"
                  className="w-full text-center tracking-[0.4em] text-xl font-mono font-black py-3 rounded-xl border-2 border-emerald-500 outline-none"
                />
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500 font-semibold">ईमेल: {cleanEmail}</span>
                  {cooldown > 0 ? (
                    <span className="text-amber-800 font-black">पुन्हा पाठवा: {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={isProcessing}
                      className="text-[#800C1E] font-black underline cursor-pointer"
                    >
                      पुन्हा OTP पाठवा
                    </button>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={enteredOtp.length < 4 || isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>{isProcessing ? 'तपासत आहे...' : '✅ ईमेल OTP पडताळणी पूर्ण करा'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setErrorMsg(null);
                }}
                className="w-full text-center text-xs text-slate-500 font-bold hover:underline cursor-pointer"
              >
                ← गुगल १-क्लिक पडताळणीकडे परत जा
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300 shadow-md">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Google Verified Badge Active</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 pt-1">
                  खाते पडताळणी यशस्वीरित्या पूर्ण झाली!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  तुमचे खाते <strong>गुगलद्वारे १००% प्रमाणित</strong> झाले आहे. परस्पर पसंती (Mutual Match) झालेल्या स्थळांशी आता तुम्ही सुरक्षितपणे थेट चॅट करू शकता.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
                {verifiedEmailDisplay && (
                  <div className="flex justify-between text-slate-500 gap-2">
                    <span>प्रमाणित ईमेल:</span>
                    <span className="font-black text-slate-800 truncate">{verifiedEmailDisplay}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>प्रमाणित नाव:</span>
                  <span className="font-black text-slate-800">{verifiedName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>पडताळणी पद्धत:</span>
                  <span className="font-black text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Google Verified
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition"
              >
                <span>पूर्ण झाले (Done)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruecallerVerificationModal;
