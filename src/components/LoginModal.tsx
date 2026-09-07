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
  EyeOff
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { logSecurityEvent } from '../utils/securityService';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';

type LoginTab = 'truecaller' | 'email';

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
    sendPasswordReset,
  } = useApp();

  const isEn = language === 'en';

  // Strict 2-Option Authentication Tab: Truecaller OR Email
  const [activeTab, setActiveTab] = useState<LoginTab>('truecaller');

  // Loading & State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

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

  if (!isOpen) return null;

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

  // 5. Handle Truecaller 1-Tap Login
  const handleTruecallerLogin = async (manualToken?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    const tokenToUse = manualToken || truecallerToken;

    // Check if on Android and Truecaller SDK deep-link is available
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (!tokenToUse) {
      if (isAndroid) {
        // Attempt official Truecaller Android deep link request
        const requestId = 'tc_req_' + Date.now();
        const partnerKey = 'tc_vanjarijodi';
        const partnerName = 'VanjariJodi';
        const intentUrl = `truecallersdk://truesdk/web_verify?requestNonce=${requestId}&partnerKey=${partnerKey}&partnerName=${encodeURIComponent(partnerName)}`;
        
        // Show guidance
        window.location.href = intentUrl;

        // In case Truecaller app did not capture, show fallback
        setTimeout(() => {
          setIsLoading(false);
          setShowManualTokenField(true);
          setErrorMessage('Truecaller ॲप सुरू झाले नसल्यास, कृपया Truecaller कडून मिळालेला ऑथरायझेशन कोड खाली प्रविष्ट करा किंवा ई-मेल लॉगिन वापरा.');
        }, 2500);
        return;
      } else {
        // Non-Android / Desktop Truecaller requires official OAuth token
        setShowManualTokenField(true);
        setIsLoading(false);
        setErrorMessage('डेस्कटॉप किंवा वेब ब्राउझरसाठी Truecaller OAuth टोकन आवश्यक आहे. किंवा सोप्या पद्धतीने ई-मेलने लॉगिन करा.');
        return;
      }
    }

    // Call Backend Verification (Strict: Rejects client-side fabrication)
    try {
      const res = await loginWithTruecaller(tokenToUse);
      if (res.success && res.user) {
        setSuccessNotice('Truecaller द्वारे 100% सत्यापित लॉगिन यशस्वी!');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userMobile: res.user.mobile || '',
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'truecaller', details: 'Official Truecaller authentication token validated' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 800);
      } else {
        setErrorMessage(res.message || 'Truecaller प्रमाणीकरण अयशस्वी. कृपया वैध टोकन वापरा किंवा ई-मेलने लॉगिन करा.');
      }
    } catch (err: any) {
      setErrorMessage('Truecaller पडताळणी त्रुटी: ' + (err.message || 'कृपया ई-मेल लॉगिन वापरा'));
    } finally {
      setIsLoading(false);
    }
  };

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
            /* CASE C: STRICT 2-OPTION AUTHENTICATION TABS (TRUECALLER & EMAIL) */
            <div className="space-y-4">
              
              {/* TWO CLEAN TABS */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('truecaller');
                    setErrorMessage('');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'truecaller'
                      ? 'bg-[#0087FF] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Truecaller 1-टॅप</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('email');
                    setErrorMessage('');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-[#800C1E] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>ई-मेल लॉगिन</span>
                </button>
              </div>

              {/* TAB 1: TRUECALLER 1-TAP LOGIN */}
              {activeTab === 'truecaller' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl text-center space-y-2.5">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#0087FF] text-white flex items-center justify-center shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        अधिकृत Truecaller 1-टॅप लॉगिन
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        ओटीपी टाइप न करता Truecaller द्वारे एका क्लिकवर आपला खरा व पडताळणीकृत मोबाईल नंबर सुरक्षित जोडा.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTruecallerLogin()}
                      disabled={isLoading}
                      className="w-full py-3 bg-[#0087FF] hover:bg-[#0070D4] text-white rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                      <span>Truecaller सह लॉगिन करा</span>
                    </button>
                  </div>

                  {showManualTokenField && (
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-2xl space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Truecaller Authorization Token / Code:
                      </label>
                      <input
                        type="text"
                        value={truecallerToken}
                        onChange={(e) => setTruecallerToken(e.target.value)}
                        placeholder="Truecaller OAuth Token प्रविष्ट करा"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleTruecallerLogin(truecallerToken)}
                        disabled={isLoading || !truecallerToken.trim()}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        टोकन व्हेरिफाय करा
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>फेक किंवा बनावट नंबर रोखण्यासाठी 100% कडक सुरक्षा</span>
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
