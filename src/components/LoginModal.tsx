import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Send,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { checkClientAccess, logSecurityEvent } from '../utils/securityService';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { safeParseJson } from '../utils/safeFetchJson';
import { signInWithGoogleVerified } from '../utils/googleAuthClient';

type AuthStep =
  | 'enter_mobile'
  | 'enter_mpin'
  | 'google_reset_mpin'
  | 'enter_email_for_otp'
  | 'verify_otp_and_set_mpin';

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

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    language,
    setIsRegisterOpen,
    setCurrentView,
    setIsAdminOpen,
    loginWithMobile,
    loginWithGoogle,
    siteConfig,
    profiles,
    currentUser,
  } = useApp();

  const isEn = language === 'en';

  const [step, setStep] = useState<AuthStep>('enter_mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Mobile, Email, 4-Digit Email OTP & 4-Digit MPIN States
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);

  // 60-Second Resend Cooldown Timer State
  const [resendCooldown, setResendCooldown] = useState(0);

  // Telegram Support Accordion
  const [showForgotAssistance, setShowForgotAssistance] = useState(false);

  // ---------------------------------------------------------------------------
  // 1. PERSISTENT AUTO-LOGIN CHECK ON COMPONENT MOUNT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const savedJwt = localStorage.getItem('vanjari_auth_jwt_token');
    if (!savedJwt || (currentUser && !currentUser.isGuest)) return;

    let cancelled = false;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${savedJwt}` },
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (!cancelled && data?.authenticated && data?.user?.mobile_number) {
          await loginWithMobile(data.user.mobile_number, {
            isOtpVerified: true,
            otpToken: savedJwt,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  // ---------------------------------------------------------------------------
  // 2. 60-SECOND COUNTDOWN RESEND TIMER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Helper to check if user is blocked
  const checkUserBlocked = async (mobileDigits: string): Promise<boolean> => {
    const matched = profiles?.find((p) => {
      const pMob = (p.mobile || '').replace(/\D/g, '').slice(-10);
      return pMob === mobileDigits;
    });

    if (matched?.isBlocked) {
      setErrorMessage(
        '🚫 आपले खाते प्रशासकाकडून सुरक्षेच्या कारणास्तव तात्पुरते ब्लॉक केलेले आहे. कृपया मदत केंद्राशी संपर्क साधा.'
      );
      return true;
    }

    const accessCheck = await checkClientAccess({
      deviceFingerprint: getDeviceFingerprint(),
      mobile: mobileDigits,
    });
    if (!accessCheck.allowed) {
      setErrorMessage(
        accessCheck.message ||
          '🚫 तुमचे हे डिव्हाइस किंवा मोबाईल क्रमांक सुरक्षेच्या कारणास्तव कायमचा ब्लॉक केला आहे.'
      );
      return true;
    }

    return false;
  };

  // ---------------------------------------------------------------------------
  // PRIMARY OPTION: 1-CLICK GOOGLE LOGIN (NO OTP / NO PASSWORD SETUP NEEDED!)
  // ---------------------------------------------------------------------------
  const handleGoogleLoginClick = async () => {
    setErrorMessage('');
    setSuccessNotice('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success && res.user) {
        setSuccessNotice(
          res.isNewUser
            ? '🎉 गुगल खात्याद्वारे तुमची झटपट नोंदणी व लॉगिन यशस्वी झाले!'
            : `✅ स्वागत आहे, ${res.user.fullName}! गुगल लॉगिन यशस्वी झाले.`
        );
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userMobile: res.user.mobile || res.user.email || '',
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'google_firebase', details: '1-Click Google Sign-In verified' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 500);
      } else {
        setErrorMessage(
          res.message || 'गुगल लॉगिन पूर्ण होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.'
        );
      }
    } catch (err: any) {
      setErrorMessage('गुगल लॉगिन त्रुटी: ' + (err.message || 'कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 1: CHECK MOBILE NUMBER (RETURNING MPIN USER vs GOOGLE/EMAIL SETUP)
  // ---------------------------------------------------------------------------
  const handleCheckMobileAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanNum.length !== 10) {
      setErrorMessage('कृपया अचूक १० अंकी मोबाईल नंबर टाका.');
      return;
    }

    if (await checkUserBlocked(cleanNum)) return;

    setIsLoading(true);
    try {
      const checkResp = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: cleanNum }),
      });
      const { data: checkData } = await safeParseJson(checkResp);

      const localExisting = profiles?.find(
        (p) => (p.mobile || '').replace(/\D/g, '').slice(-10) === cleanNum
      );

      const detectedEmail = String(checkData?.email || localExisting?.email || '').trim();
      if (detectedEmail) {
        setEmailAddress(detectedEmail);
      }

      if ((checkData?.is_phone_verified && checkData?.has_mpin) || localExisting?.password) {
        setStep('enter_mpin');
        setIsLoading(false);
        return;
      }

      // New or Unverified user -> Offer easiest 1-Click Google Verification + Set MPIN
      setStep('google_reset_mpin');
    } catch (err: any) {
      setErrorMessage('सर्व्हर त्रुटी: ' + (err.message || 'कृपया पुन्हा प्रयत्न करा.'));
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 1-CLICK GOOGLE VERIFICATION + SET 4-DIGIT MPIN (ZERO OTP NEEDED!)
  // ---------------------------------------------------------------------------
  const handleGoogleVerifyAndSetMpin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
    const cleanMpin = mpin.replace(/\D/g, '').trim();

    if (cleanMpin.length !== 4) {
      setErrorMessage('कृपया पुढील वेळी झटपट लॉगिनसाठी नवीन ४-अंकी MPIN टाका (उदा. 1234).');
      return;
    }
    if (confirmMpin && cleanMpin !== confirmMpin.replace(/\D/g, '').trim()) {
      setErrorMessage('दोन्ही ४-अंकी MPIN जुळत नाहीत.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const gRes = await signInWithGoogleVerified({
        mobileNumber: cleanNum,
        mpin: cleanMpin,
      });

      if (!gRes.success) {
        setErrorMessage(gRes.error || 'गुगल पडताळणी पूर्ण होऊ शकली नाही.');
        setIsGoogleLoading(false);
        return;
      }

      const loginRes = await loginWithMobile(cleanNum, {
        password: cleanMpin,
        isOtpVerified: true,
        otpToken: gRes.token,
      });

      if (loginRes.success) {
        setSuccessNotice('✅ गुगल पडताळणी व नवीन ४-अंकी MPIN सेट झाला! लॉगिन यशस्वी.');
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 550);
      } else {
        setErrorMessage(loginRes.message || 'लॉगिन पूर्ण होऊ शकले नाही.');
      }
    } catch (err: any) {
      setErrorMessage('गुगल पडताळणी त्रुटी: ' + (err.message || ''));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Send 4-Digit Email OTP (Optional fallback)
  const triggerSendEmailOtp = async (targetEmail: string, cleanNum?: string) => {
    setErrorMessage('');
    setSuccessNotice('');

    const cleanEmail = String(targetEmail || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setErrorMessage('कृपया वैध ईमेल पत्ता प्रविष्ट करा (उदा. yourname@gmail.com).');
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          mobile_number: cleanNum || mobileNumber.replace(/\D/g, '').slice(-10),
          purpose: 'reset_mpin',
          deviceFingerprint: getDeviceFingerprint(),
        }),
      });
      const { data } = await safeParseJson(
        resp,
        'ईमेल OTP पाठवताना सर्व्हर त्रुटी आली. कृपया गुगलने १-क्लिक लॉगिन वापरा.'
      );

      if (!resp.ok || !data?.success) {
        if (data?.cooldownSeconds) {
          setResendCooldown(Number(data.cooldownSeconds));
        }
        setErrorMessage(
          data?.error || 'ईमेल OTP पाठवता आला नाही. कृपया त्याऐवजी गुगलने १-क्लिक लॉगिन वापरा.'
        );
        return;
      }

      setEmailAddress(cleanEmail);
      setStep('verify_otp_and_set_mpin');
      setResendCooldown(data.cooldownSeconds || 60);
      setSuccessNotice(data.message || `📧 ४-अंकी OTP ${cleanEmail} वर पाठवला आहे.`);
    } catch (err: any) {
      setErrorMessage('ईमेल OTP पाठवताना अडचण आली: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 2A: RETURNING USER INSTANT LOGIN WITH 4-DIGIT MPIN
  // ---------------------------------------------------------------------------
  const handleMpinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!mpin || mpin.trim().length < 4) {
      setErrorMessage('कृपया आपला ४-अंकी MPIN किंवा पासवर्ड टाका.');
      return;
    }

    setIsLoading(true);
    try {
      const mpinResp = await fetch('/api/auth/login-mpin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: cleanNum,
          mpin: mpin.trim(),
        }),
      });
      const { data: mpinData } = await safeParseJson(mpinResp, 'MPIN तपासताना सर्व्हर त्रुटी आली.');

      if (mpinResp.ok && mpinData?.success && mpinData?.token) {
        localStorage.setItem('vanjari_auth_jwt_token', mpinData.token);
      }

      const res = await loginWithMobile(
        cleanNum,
        mpinData?.success
          ? { password: mpin.trim(), isOtpVerified: true, otpToken: mpinData.token }
          : { password: mpin.trim() }
      );

      if (res.success && res.user) {
        setSuccessNotice('✅ ४-अंकी MPIN लॉगिन यशस्वी! आपले स्वागत आहे.');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userMobile: res.user.mobile || cleanNum,
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'mpin_bcrypt', details: 'Returning user 4-digit MPIN verified' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 500);
      } else {
        setErrorMessage(
          mpinData?.error || res.message || 'चुकीचा ४-अंकी MPIN! कृपया अचूक MPIN टाका.'
        );
      }
    } catch (err: any) {
      setErrorMessage('लॉगिन त्रुटी: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 2B: VERIFY 4-DIGIT EMAIL OTP + SET 4-DIGIT MPIN (FALLBACK)
  // ---------------------------------------------------------------------------
  const handleVerifyOtpAndSetMpin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
    const cleanEmail = emailAddress.trim().toLowerCase();
    const cleanOtp = otpCode.replace(/\D/g, '').trim();
    const cleanMpin = mpin.replace(/\D/g, '').trim();

    if (cleanOtp.length !== 4) {
      setErrorMessage('कृपया ईमेलवर आलेला ४-अंकी OTP कोड टाका.');
      return;
    }
    if (cleanMpin.length !== 4) {
      setErrorMessage('कृपया पुढील वेळी झटपट लॉगिनसाठी ४-अंकी MPIN तयार करा (उदा. 1234).');
      return;
    }
    if (confirmMpin && cleanMpin !== confirmMpin.replace(/\D/g, '').trim()) {
      setErrorMessage('दोन्ही ४-अंकी MPIN जुळत नाहीत.');
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          mobile_number: cleanNum,
          otp: cleanOtp,
          mpin: cleanMpin,
        }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP पडताळणी करताना सर्व्हर त्रुटी आली.');

      if (!resp.ok || !data?.success) {
        setErrorMessage(data?.error || 'चुकीचा ईमेल OTP कोड!');
        setIsLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('vanjari_auth_jwt_token', data.token);
      }

      const loginRes = await loginWithMobile(cleanNum, {
        password: cleanMpin,
        isOtpVerified: true,
        otpToken: data.token,
      });

      if (loginRes.success) {
        setSuccessNotice('🎉 ईमेल OTP पडताळणी व ४-अंकी MPIN सेट झाला! ऑटो-लॉगिन सक्रिय.');
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 600);
      } else {
        setErrorMessage(loginRes.message || 'लॉगिन पूर्ण होऊ शकले नाही.');
      }
    } catch (err: any) {
      setErrorMessage('OTP पडताळणी त्रुटी: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const telegramUsername = (siteConfig?.telegramUsername || 'Primemultiservice')
    .replace(/^@/, '')
    .replace(/^https?:\/\/t\.me\//, '');
  const telegramChatUrl = `https://t.me/${telegramUsername}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn pt-safe pb-safe">
      <div className="relative w-full h-full sm:h-auto max-w-md bg-white border-0 sm:border-2 border-amber-300 rounded-none sm:rounded-3xl shadow-2xl text-slate-800 overflow-hidden sm:my-auto max-h-none sm:max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] border-b border-amber-300 text-amber-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200">
              <VanjariJodiLogo size={28} variant="emblem" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm sm:text-base leading-tight">
                {isEn ? 'Vanjari Jodi — Easy Login' : 'वंजारी जोडी — सोपे गुगल व MPIN लॉगिन'}
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                {step === 'enter_mpin'
                  ? 'नोंदणीकृत नंबर: थेट ४-अंकी MPIN ने झटपट प्रवेश'
                  : step === 'google_reset_mpin'
                  ? 'OTP शिवाय गुगलने १-क्लिक पडताळणी व नवीन MPIN सेटअप'
                  : step === 'enter_email_for_otp' || step === 'verify_otp_and_set_mpin'
                  ? 'ईमेल OTP द्वारे पडताळणी'
                  : 'OTP किंवा पासवर्डशिवाय थेट गुगलने १-क्लिक लॉगिन'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTAINER */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 font-bold text-xs animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2 text-rose-800 font-bold text-xs animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: 1-CLICK GOOGLE LOGIN (PRIMARY) + MOBILE MPIN LOGIN */}
          {step === 'enter_mobile' && (
            <div className="space-y-4">
              {/* PRIMARY 1-CLICK GOOGLE SIGN-IN CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-2 border-emerald-300 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900">
                    ⚡ सर्वात सोपा व जलद मार्ग (OTP ची गरज नाही)
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    १-क्लिक
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-900 border-2 border-slate-300 hover:border-[#4285F4] rounded-xl font-black text-sm shadow-sm flex items-center justify-center gap-3 cursor-pointer transition disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />
                  ) : (
                    <GoogleGIcon className="w-5 h-5 shrink-0" />
                  )}
                  <span>
                    {isGoogleLoading
                      ? 'गुगल खात्याने लॉगिन होत आहे...'
                      : isEn
                      ? 'Continue with Google'
                      : 'गुगलने झटपट लॉगिन करा (Continue with Google)'}
                  </span>
                </button>

                <p className="text-[11px] text-slate-600 font-medium text-center">
                  कोणताही OTP किंवा पासवर्ड लक्षात ठेवण्याची गरज नाही — थेट तुमच्या Gmail खात्याने सुरक्षित प्रवेश करा.
                </p>
              </div>

              {/* DIVIDER */}
              <div className="relative flex items-center py-0.5">
                <div className="flex-grow border-t border-slate-200" />
                <span className="mx-3 text-[11px] font-extrabold text-slate-500 uppercase">
                  किंवा मोबाईल नंबर व MPIN ने
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* SECONDARY: MOBILE NUMBER + MPIN LOGIN */}
              <form onSubmit={handleCheckMobileAndProceed} className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    📱 तुमचा १०-अंकी मोबाईल नंबर (Login ID):
                  </label>
                  <div className="flex rounded-xl overflow-hidden border-2 border-slate-300 focus-within:border-[#800C1E] bg-slate-50 transition">
                    <span className="inline-flex items-center px-3 text-slate-700 font-black text-xs sm:text-sm bg-slate-200/80 border-r border-slate-300 select-none">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="उदा. 9822XXXXXX"
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm font-mono font-black text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:opacity-95 text-white rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  )}
                  <span>मोबाईल नंबरने पुढे जा (Continue)</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2A: RETURNING USER 4-DIGIT MPIN LOGIN */}
          {step === 'enter_mpin' && (
            <form onSubmit={handleMpinLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-600 block font-bold">नोंदणीकृत मोबाईल नंबर:</span>
                  <span className="font-mono font-black text-sm text-[#800C1E]">+91 {mobileNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('enter_mobile');
                    setMpin('');
                    setErrorMessage('');
                  }}
                  className="text-xs font-black text-slate-700 underline cursor-pointer"
                >
                  नंबर बदला
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black text-slate-800">
                    🔢 तुमचा ४-अंकी MPIN (किंवा पासवर्ड) टाका:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMpin(!showMpin)}
                    className="text-[11px] font-bold text-slate-600 flex items-center gap-1 cursor-pointer"
                  >
                    {showMpin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showMpin ? 'लपवा' : 'दाखवा'}</span>
                  </button>
                </div>
                <input
                  type={showMpin ? 'text' : 'password'}
                  inputMode="numeric"
                  required
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value)}
                  placeholder="•••• (4-Digit MPIN)"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-amber-400 rounded-xl font-mono font-black text-lg tracking-widest text-center text-slate-900 outline-none focus:border-[#800C1E]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-amber-300" />}
                <span>झटपट लॉगिन करा (Login with MPIN)</span>
              </button>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessNotice('');
                    setMpin('');
                    setConfirmMpin('');
                    setStep('google_reset_mpin');
                  }}
                  className="font-black text-[#075E54] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>MPIN विसरलात? गुगलने १-क्लिकमध्ये नवीन MPIN सेट करा</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: 1-CLICK GOOGLE VERIFICATION + SET 4-DIGIT MPIN */}
          {step === 'google_reset_mpin' && (
            <form onSubmit={handleGoogleVerifyAndSetMpin} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-600 block font-bold">मोबाईल नंबर (Login ID):</span>
                  <span className="font-mono font-black text-sm text-[#800C1E]">+91 {mobileNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('enter_mobile');
                    setErrorMessage('');
                  }}
                  className="text-xs font-black text-slate-700 underline cursor-pointer"
                >
                  मागे जा
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-black text-xs text-[#800C1E]">
                  🔐 तुमचा नवीन ४-अंकी MPIN टाका आणि गुगलने १-क्लिक पडताळणी करा:
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      नवीन ४-अंकी MPIN:
                    </label>
                    <input
                      type={showMpin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="उदा. 1234"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-center text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      MPIN पुन्हा टाका:
                    </label>
                    <input
                      type={showMpin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={confirmMpin}
                      onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="उदा. 1234"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-center text-base"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGoogleLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-900 border-2 border-[#4285F4] rounded-xl font-black text-sm shadow-sm flex items-center justify-center gap-2.5 cursor-pointer transition disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" />
                ) : (
                  <GoogleGIcon className="w-5 h-5" />
                )}
                <span>
                  {isGoogleLoading
                    ? 'गुगल पडताळणी होत आहे...'
                    : 'गुगलने पडताळा व ४-अंकी MPIN सेव्ह करा'}
                </span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setStep('enter_email_for_otp');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                >
                  गुगल खाते नाही? ईमेल OTP ने पडताळणी करा
                </button>
              </div>
            </form>
          )}

          {/* OPTIONAL FALLBACK: ENTER EMAIL ADDRESS TO RECEIVE 4-DIGIT EMAIL OTP */}
          {step === 'enter_email_for_otp' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerSendEmailOtp(emailAddress, mobileNumber.replace(/\D/g, '').slice(-10));
              }}
              className="space-y-4"
            >
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-600 block font-bold">मोबाईल नंबर (Login ID):</span>
                  <span className="font-mono font-black text-sm text-[#800C1E]">+91 {mobileNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('google_reset_mpin');
                    setErrorMessage('');
                  }}
                  className="text-xs font-black text-slate-700 underline cursor-pointer"
                >
                  ← गुगल लॉगिनकडे परत जा
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  📧 ईमेल OTP मिळवण्यासाठी तुमचा ईमेल पत्ता (Email ID) टाका:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="उदा. yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-emerald-400 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-[#800C1E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || resendCooldown > 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 text-amber-200" />
                )}
                <span>
                  {resendCooldown > 0
                    ? `प्रतीक्षा करा (${resendCooldown}s)`
                    : '📧 ईमेलवर ४-अंकी OTP पाठवा'}
                </span>
              </button>
            </form>
          )}

          {/* OPTIONAL FALLBACK: VERIFY EMAIL OTP + SET 4-DIGIT MPIN */}
          {step === 'verify_otp_and_set_mpin' && (
            <form onSubmit={handleVerifyOtpAndSetMpin} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] text-emerald-900 block font-bold">OTP पाठवलेला ईमेल:</span>
                  <span className="font-bold text-xs sm:text-sm text-[#075E54] block truncate">{emailAddress}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('enter_email_for_otp');
                    setOtpCode('');
                    setErrorMessage('');
                  }}
                  className="text-xs font-black text-slate-700 underline cursor-pointer shrink-0"
                >
                  ईमेल बदला
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  📧 ईमेलवर आलेला ४-अंकी OTP कोड टाका:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-Digit OTP"
                  className="w-full px-4 py-3 bg-white border-2 border-emerald-500 rounded-xl font-mono font-black text-xl tracking-[0.4em] text-center text-slate-900 outline-none"
                />
                <div className="flex items-center justify-between mt-1.5 text-[11px]">
                  <span className="text-slate-500 font-semibold">५ मिनिटे वैध • जास्तीत जास्त ३ प्रयत्न</span>
                  {resendCooldown > 0 ? (
                    <span className="text-amber-800 font-black">
                      पुन्हा पाठवा: {resendCooldown} सेकंदात
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerSendEmailOtp(emailAddress, mobileNumber.replace(/\D/g, '').slice(-10))}
                      className="text-[#800C1E] font-black underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>पुन्हा ईमेल OTP पाठवा</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-black text-xs text-[#800C1E]">
                  🔐 पुढील वेळी बिना-OTP झटपट लॉगिनसाठी ४-अंकी MPIN सेट करा:
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      नवीन ४-अंकी MPIN:
                    </label>
                    <input
                      type={showMpin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="उदा. 1234"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-center text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      MPIN पुन्हा टाका:
                    </label>
                    <input
                      type={showMpin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={confirmMpin}
                      onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="उदा. 1234"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-center text-base"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>✅ ईमेल OTP पडताळा व ४-अंकी MPIN सेव्ह करा</span>
              </button>
            </form>
          )}

          {/* Telegram Support Assistance */}
          {siteConfig?.showTelegramSupport !== false && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowForgotAssistance(!showForgotAssistance)}
                className="text-[11px] text-sky-700 hover:text-sky-900 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3 h-3 text-sky-600" />
                <span>मदत हवी आहे? अधिकृत टेलिग्राम सपोर्ट चॅट</span>
                {showForgotAssistance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showForgotAssistance && (
                <div className="mt-2 p-3 bg-sky-50 border border-sky-300 rounded-2xl space-y-2 text-xs">
                  <a
                    href={telegramChatUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-sky-600 text-white font-black rounded-xl text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>💬 टेलिग्राम वर चॅट करा (@{telegramUsername})</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsRegisterOpen(true);
            }}
            className="text-slate-700 hover:text-[#800C1E] font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>नवीन बायोडाटा नोंदणी करा</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              setIsAdminOpen(true);
            }}
            className="text-amber-900 font-bold flex items-center gap-1.5 cursor-pointer text-xs bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300"
          >
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>👑 ॲडमिन पोर्टल</span>
          </button>
        </div>
      </div>
    </div>
  );
};
