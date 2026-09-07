import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Sparkles,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Mail,
  Loader2,
  Smartphone,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Send,
  MessageCircle,
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { logSecurityEvent } from '../utils/securityService';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';

type LoginTab = 'mobile' | 'truecaller' | 'email';

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    language,
    setIsRegisterOpen,
    setCurrentUser,
    setCurrentView,
    setIsAdminOpen,
    loginWithEmail,
    loginWithTruecaller,
    loginWithMobile,
    sendPasswordReset,
    siteConfig,
  } = useApp();

  const isEn = language === 'en';

  // 3-Option Authentication: Mobile (Easiest/Default) | Truecaller | Email
  const [activeTab, setActiveTab] = useState<LoginTab>('mobile');

  // Loading & State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Mobile Number Login States (Designed for complete simplicity)
  const [mobileNumber, setMobileNumber] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [sentDemoOtp, setSentDemoOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Email Login Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Mode
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Email Verification Pending State (Blocks dashboard access until verified)
  const [verificationPendingData, setVerificationPendingData] = useState<{
    email: string;
    message: string;
  } | null>(null);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Truecaller States
  const [truecallerToken, setTruecallerToken] = useState('');
  const [showManualTokenField, setShowManualTokenField] = useState(false);
  const [truecallerMobile, setTruecallerMobile] = useState('');

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessNotice('');
      setVerificationPendingData(null);
      setIsForgotPasswordMode(false);
      setResetSuccessMessage('');
    }
  }, [isOpen]);

  // Cooldown countdown for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Cooldown countdown for OTP
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // 0. Handle Direct Mobile Login (Super Easy 1-Click for every user)
  const handleDirectMobileLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanNum.length !== 10) {
      setErrorMessage(isEn ? 'Please enter a valid 10-digit mobile number.' : 'कृपया अचूक १० अंकी मोबाईल नंबर टाका.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithMobile(cleanNum);
      if (res.success && res.user) {
        setSuccessNotice(res.message || 'मोबाईल लॉगिन यशस्वी!');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userMobile: res.user.mobile || cleanNum,
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'mobile_direct', details: 'Direct 1-Click Mobile Login' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 800);
      } else {
        setErrorMessage(res.message || 'लॉगिन अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err: any) {
      setErrorMessage('त्रुटी: ' + (err.message || 'मोबाईल लॉगिन करता आले नाही.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const handleSendMobileOtp = () => {
    setErrorMessage('');
    const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanNum.length !== 10) {
      setErrorMessage(isEn ? 'Please enter a valid 10-digit mobile number.' : 'कृपया अचूक १० अंकी मोबाईल नंबर टाका.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSentDemoOtp(code);
    setIsOtpMode(true);
    setOtpTimer(60);
    setSuccessNotice(`पडताळणी कोड: ${code} (सोयीसाठी खाली कोड दाखवला आहे)`);
  };

  // Verify OTP
  const handleVerifyMobileOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!mobileOtp.trim()) {
      setErrorMessage('कृपया ४ अंकी OTP कोड टाका.');
      return;
    }

    if (sentDemoOtp && mobileOtp.trim() !== sentDemoOtp) {
      setErrorMessage('चुकीचा OTP कोड प्रविष्ट केला आहे. कृपया तपासा.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
      const res = await loginWithMobile(cleanNum, mobileOtp);
      if (res.success && res.user) {
        setSuccessNotice('OTP पडताळणी यशस्वी! लॉगिन झाले.');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userMobile: res.user.mobile || cleanNum,
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'mobile_otp', details: 'Mobile OTP Authentication' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 800);
      } else {
        setErrorMessage(res.message || 'OTP लॉगिन अयशस्वी.');
      }
    } catch (err: any) {
      setErrorMessage('त्रुटी: ' + (err.message || 'OTP लॉगिन अयशस्वी.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Handle Email Login Submit
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMessage(isEn ? 'Please enter a valid email address.' : 'कृपया वैध ई-मेल पत्ता प्रविष्ट करा.');
      return;
    }

    if (!passwordInput || passwordInput.length < 6) {
      setErrorMessage(isEn ? 'Password must be at least 6 characters.' : 'पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithEmail(emailInput, passwordInput);

      if (res.requiresEmailVerification) {
        setVerificationPendingData({
          email: res.email || emailInput.trim(),
          message: res.message || 'तुमचे ईमेल व्हेरिफिकेशन प्रलंबित आहे. कृपया इनबॉक्स तपासा.',
        });
        setIsLoading(false);
        return;
      }

      if (res.success && res.user) {
        setSuccessNotice(isEn ? 'Login successful!' : 'लॉगिन यशस्वी! आपले स्वागत आहे.');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userEmail: res.user.email || emailInput,
          userMobile: res.user.mobile || '',
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'email', details: 'Verified email authenticated successfully' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 800);
      } else {
        setErrorMessage(res.message || (isEn ? 'Login failed. Please check credentials.' : 'लॉगिन अयशस्वी. कृपया ई-मेल व पासवर्ड तपासा.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isEn ? 'Authentication error.' : 'प्रमाणीकरण त्रुटी आली.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Resend Verification Email
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResetSuccessMessage(isEn ? 'Verification link resent successfully! Please check inbox.' : 'सत्यापन लिंक पुन्हा पाठवली गेली आहे! कृपया ईमेल इनबॉक्स तपासा.');
        setResendCooldown(60);
      } else {
        setErrorMessage(isEn ? 'Session expired. Please log in again to receive verification.' : 'सत्र कालबाह्य झाले. कृपया पुन्हा लॉगिन करून पडताळणी लिंक मागवा.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'पडताळणी लिंक पाठवता आली नाही.');
    }
  };

  // 3. Handle Check Verification Status
  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    setErrorMessage('');
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          setVerificationPendingData(null);
          setSuccessNotice('ईमेल यशस्वीरीत्या सत्यापित झाला! लॉगिन होत आहे...');
          // Proceed to log in user
          const res = await loginWithEmail(emailInput, passwordInput);
          if (res.success && res.user) {
            setTimeout(() => {
              onClose();
              setCurrentView('dashboard');
            }, 800);
          }
        } else {
          setErrorMessage(isEn ? 'Email is not verified yet. Please click the link in your email inbox.' : 'ईमेल अद्याप सत्यापित झालेला नाही. कृपया तुमच्या इनबॉक्समधील पडताळणी लिंकवर क्लिक करा.');
        }
      } else {
        setErrorMessage('कृपया पुन्हा पासवर्ड टाकून लॉगिन करा.');
      }
    } catch (err: any) {
      setErrorMessage('पडताळणी तपासताना अडचण आली.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // 4. Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setResetSuccessMessage('');

    if (!forgotPasswordEmail.trim() || !forgotPasswordEmail.includes('@')) {
      setErrorMessage(isEn ? 'Please enter your registered email address.' : 'कृपया तुमचा नोंदणीकृत ई-मेल पत्ता टाका.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPasswordReset(forgotPasswordEmail);
      if (res.success) {
        setResetSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage('पासवर्ड रीसेट लिंक पाठवता आली नाही.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Truecaller 1-Tap / Instant Verified Login
  const handleTruecallerLogin = async (mobileOrToken?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    const targetInput = (mobileOrToken || truecallerMobile || mobileNumber || '').trim();

    if (!targetInput) {
      setIsLoading(false);
      setErrorMessage('कृपया Truecaller वर नोंदणीकृत १० अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    try {
      const res = await loginWithTruecaller(targetInput);
      if (res.success && res.user) {
        setSuccessNotice('Truecaller द्वारे 100% पडताळणीकृत लॉगिन यशस्वी!');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userMobile: res.user.mobile || '',
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'truecaller', details: 'Truecaller instant profile verified' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 600);
      } else {
        setErrorMessage(res.message || 'Truecaller प्रमाणीकरण अयशस्वी. कृपया वैध मोबाईल नंबर वापरा.');
      }
    } catch (err: any) {
      setErrorMessage('Truecaller पडताळणी त्रुटी: ' + (err.message || 'कृपया मोबाईल किंवा ई-मेल लॉगिन वापरा.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-amber-300 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] border-b border-amber-300 text-amber-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200">
              <VanjariJodiLogo size={28} variant="emblem" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm sm:text-base leading-tight">
                {isEn ? 'Vanjari Jodi Login' : 'वंजारी जोडी — सदस्य लॉगिन'}
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                {isEn ? 'Secure Matrimonial Authentication' : 'सुरक्षित व पडताळणीकृत मॅट्रिमोनी प्रवेश'}
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

          {/* SUCCESS BANNER */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 font-bold text-xs animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ERROR BANNER */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2 text-rose-800 font-bold text-xs animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* CASE A: EMAIL VERIFICATION PENDING SCREEN */}
          {verificationPendingData ? (
            <div className="p-4 bg-amber-50/90 border-2 border-amber-400 rounded-2xl space-y-3.5 text-center animate-fadeIn">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-800 border-2 border-amber-300">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  ईमेल सत्यापन आवश्यक (Email Verification Pending)
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  आपल्या खात्याच्या सुरक्षेसाठी आम्ही <strong className="text-[#800C1E]">{verificationPendingData.email}</strong> वर पडताळणी लिंक पाठवली आहे.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 text-left text-xs space-y-1.5 text-slate-700">
                <p className="font-bold text-[#800C1E]">कसे करावे?</p>
                <p>१. तुमच्या ई-मेल इनबॉक्स किंवा स्पॅम (Spam) फोल्डर उघडा.</p>
                <p>२. 'Verify your email for Vanjari Jodi' वरील लिंकवर क्लिक करा.</p>
                <p>३. खालील बटण दाबून स्थिती तपासा.</p>
              </div>

              {resetSuccessMessage && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold">
                  {resetSuccessMessage}
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={isCheckingVerification}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-black text-xs sm:text-sm shadow flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
                >
                  {isCheckingVerification ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>मी ईमेल व्हेरिफाय केला आहे (Check Status)</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0 ? `पुन्हा पाठवण्यासाठी प्रतीक्षा करा (${resendCooldown}s)` : 'पुन्हा व्हेरिफिकेशन लिंक पाठवा (Resend Link)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerificationPendingData(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 underline font-medium pt-1"
                >
                  दुसऱ्या ईमेलने लॉगिन करा
                </button>
              </div>
            </div>
          ) : isForgotPasswordMode ? (
            /* CASE B: FORGOT PASSWORD FLOW */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2 text-xs text-blue-900 leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  तुमचा नोंदणीकृत ईमेल प्रविष्ट करा. आम्ही त्यावर सुरक्षित पासवर्ड रीसेट लिंक पाठवू.
                </span>
              </div>

              {resetSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold leading-relaxed">
                  {resetSuccessMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  नोंदणीकृत ई-मेल (Registered Email):
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="उदा. yourname@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 pl-9 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#A71930] hover:to-[#800C1E] text-white rounded-xl font-black text-xs sm:text-sm shadow flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>पासवर्ड रीसेट लिंक पाठवा (Send Reset Link)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordMode(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  मागे जा (Back to Login)
                </button>
              </div>
            </form>
          ) : (
            /* CASE C: 3-OPTION AUTHENTICATION TABS (MOBILE / TRUECALLER / EMAIL) */
            <div className="space-y-3.5">

              {/* 🌟 PRE-LOGIN TELEGRAM ASSISTANCE BANNER */}
              <div className="p-3 bg-gradient-to-r from-sky-50 via-blue-50/70 to-amber-50/50 border border-sky-300/80 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-600" />
                    <span>लॉगिन किंवा नंबर पडताळणीत अडचण आहे का?</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2.5 bg-white hover:bg-amber-50 text-slate-900 font-black text-[11px] rounded-xl border border-amber-300 shadow-2xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#800C1E]" />
                    <span>💬 ॲडमिन थेट चॅट</span>
                  </a>
                  <a
                    href={siteConfig?.telegramGroupUrl || 'https://t.me/+LcV24fm6QboxZWM1'}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-[11px] rounded-xl border border-sky-400 shadow-2xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>📢 ग्रुप जॉईन करा</span>
                  </a>
                </div>
              </div>
              
              {/* THREE CLEAN TABS */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('mobile');
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`py-2 px-1.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'mobile'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>📱 मोबाईल</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('truecaller');
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`py-2 px-1.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'truecaller'
                      ? 'bg-[#0087FF] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Truecaller</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('email');
                    setErrorMessage('');
                    setSuccessNotice('');
                  }}
                  className={`py-2 px-1.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-[#800C1E] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>ई-मेल</span>
                </button>
              </div>

              {/* TAB 0: SIMPLE MOBILE NUMBER LOGIN (EASIEST FOR EVERYONE) */}
              {activeTab === 'mobile' && (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Reassuring note for easy accessibility */}
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2 text-emerald-900 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-black text-emerald-950">
                        {isEn ? 'Super Easy Mobile Login' : 'अतिशय सोपे व झटपट मोबाईल लॉगिन'}
                      </strong>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        {isEn
                          ? 'No password needed! Enter your 10-digit mobile number to login or register instantly.'
                          : 'कोणताही पासवर्ड लक्षात ठेवण्याची गरज नाही! तुमचा १० अंकी नंबर टाकून एका क्लिकवर थेट प्रवेश करा.'}
                      </p>
                    </div>
                  </div>

                  {/* Phone Input Box */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">
                      {isEn ? 'Mobile Number (10 digits):' : '📱 मोबाईल नंबर (१० अंक):'}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl font-black text-slate-700 text-sm">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="उदा. 9822334455"
                        className="flex-1 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold tracking-wider outline-none focus:bg-white transition"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isEn
                        ? 'New users will be registered automatically to create or view biodatas.'
                        : 'नवीन सदस्यांचे खाते लगेच तयार होईल व अस्तित्वात असलेले खाते थेट उघडेल.'}
                    </p>
                  </div>

                  {/* Primary Action: Instant 1-Click Login */}
                  <button
                    type="button"
                    onClick={() => handleDirectMobileLogin()}
                    disabled={isLoading || mobileNumber.length !== 10}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    )}
                    <span>
                      {isEn ? '⚡ Instant 1-Click Login' : '⚡ झटपट १-क्लिक लॉगिन (Instant Login)'}
                    </span>
                  </button>

                  {/* Secondary Action: OTP Mode Option */}
                  <div className="pt-1 border-t border-slate-200">
                    {!isOtpMode ? (
                      <button
                        type="button"
                        onClick={handleSendMobileOtp}
                        disabled={mobileNumber.length !== 10}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isEn ? 'Or login with 4-Digit OTP Code' : 'किंवा ४ अंकी OTP कोड मागवून लॉगिन करा'}</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-300 rounded-2xl space-y-2.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-slate-800">
                            {isEn ? 'Enter 4-digit code:' : '४ अंकी पडताळणी कोड टाका:'}
                          </span>
                          {sentDemoOtp && (
                            <button
                              type="button"
                              onClick={() => setMobileOtp(sentDemoOtp)}
                              className="text-[11px] text-emerald-700 font-black underline cursor-pointer hover:text-emerald-900"
                            >
                              कोड ऑटो-फिल करा ({sentDemoOtp})
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={mobileOtp}
                            onChange={(e) => setMobileOtp(e.target.value)}
                            placeholder="उदा. 4321"
                            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-center text-base font-black tracking-widest outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleVerifyMobileOtp()}
                            disabled={isLoading || !mobileOtp.trim()}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'सत्यापित करा'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          {otpTimer > 0 ? (
                            <span>पुन्हा पाठवा ({otpTimer}s)</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendMobileOtp}
                              className="text-[#800C1E] font-bold hover:underline cursor-pointer"
                            >
                              पुन्हा कोड पाठवा (Resend OTP)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsOtpMode(false)}
                            className="text-slate-500 hover:underline cursor-pointer"
                          >
                            रद्द करा
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 1: TRUECALLER 1-TAP LOGIN */}
              {activeTab === 'truecaller' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#0087FF] text-white flex items-center justify-center shadow-md shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                          Truecaller थेट पडताळणी लॉगिन
                        </h4>
                        <p className="text-[10.5px] text-slate-600 font-medium">
                          Truecaller नोंदणीकृत नंबरने सुरक्षित प्रवेश
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Truecaller मोबाईल नंबर (१० अंक):
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          maxLength={10}
                          value={truecallerMobile || mobileNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setTruecallerMobile(val);
                            setMobileNumber(val);
                          }}
                          placeholder="उदा. 9876543210"
                          className="w-full bg-white border border-blue-300 rounded-xl px-3.5 py-2.5 pl-12 text-sm sm:text-base font-black tracking-wider outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="absolute left-3.5 top-2.5 font-bold text-slate-500 text-xs sm:text-sm">
                          +91
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTruecallerLogin(truecallerMobile || mobileNumber)}
                      disabled={isLoading || (truecallerMobile.length < 10 && mobileNumber.length < 10)}
                      className="w-full py-3 bg-[#0087FF] hover:bg-[#0070D4] text-white rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      <span>Truecaller द्वारे थेट लॉगिन करा</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>फेक किंवा बनावट प्रोफाईल रोखण्यासाठी Truecaller पडताळणी</span>
                  </div>
                </div>
              )}

              {/* TAB 2: SECURE EMAIL LOGIN */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-3.5 animate-fadeIn">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      ई-मेल पत्ता (Email Address):
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="उदा. yourname@gmail.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 pl-9 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-black text-slate-700">
                        पासवर्ड (Password):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordEmail(emailInput);
                          setIsForgotPasswordMode(true);
                        }}
                        className="text-[11px] text-[#800C1E] hover:underline font-bold"
                      >
                        पासवर्ड विसरलात?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="किमान ६ अक्षरी पासवर्ड"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 pl-9 pr-10 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:from-[#A71930] hover:to-[#800C1E] text-white rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60 mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    <span>सुरक्षित लॉगिन करा (Sign In)</span>
                  </button>

                  <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      खात्याच्या सुरक्षेसाठी केवळ सत्यापित (Verified Email) सदस्यांनाच डॅशबोर्ड व प्रोफाइल पाहण्याचा पूर्ण अधिकार दिला जातो.
                    </span>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="text-slate-600">
            <span>नवीन सदस्य आहात? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsRegisterOpen(true);
              }}
              className="font-black text-[#800C1E] hover:underline cursor-pointer"
            >
              येथे मोफत नोंदणी करा
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              setIsAdminOpen(true);
            }}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>प्रशासक लॉगिन (Admin)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
