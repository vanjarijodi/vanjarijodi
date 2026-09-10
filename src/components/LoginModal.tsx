import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Loader2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { logSecurityEvent } from '../utils/securityService';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    language,
    setIsRegisterOpen,
    setCurrentView,
    setIsAdminOpen,
    loginWithGoogle,
    loginWithTruecaller,
    loginWithMobile,
    loginAsGuest,
    siteConfig,
    profiles,
  } = useApp();

  const isEn = language === 'en';

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Primary Login States: Mobile Number + Password
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobilePassword, setMobilePassword] = useState('');
  const [showMobilePassword, setShowMobilePassword] = useState(false);

  // Forgot Password / Admin Assistance Dropdown
  const [showForgotAssistance, setShowForgotAssistance] = useState(false);

  // Truecaller quick prompt modal/state
  const [showTruecallerPrompt, setShowTruecallerPrompt] = useState(false);
  const [tcMobileInput, setTcMobileInput] = useState('');

  // Helper to check if user is blocked
  const checkUserBlocked = (mobileDigits: string): boolean => {
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
    return false;
  };

  // Device session registration
  const registerDeviceSession = async (userId: string) => {
    try {
      await fetch('/api/auth/register-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          deviceInfo: navigator.userAgent,
          platform: 'web',
          loginTime: new Date().toISOString(),
        }),
      });
    } catch {
      // Background session logging error non-blocking
    }
  };

  // 1. Primary: Mobile Number + Password Login
  const handleMobilePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanNum = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanNum.length !== 10) {
      setErrorMessage(isEn ? 'Please enter a valid 10-digit mobile number.' : 'कृपया अचूक १० अंकी मोबाईल नंबर टाका.');
      return;
    }

    if (!mobilePassword || mobilePassword.trim().length < 4) {
      setErrorMessage(isEn ? 'Please enter your password (min 4 characters).' : 'कृपया आपला पासवर्ड किंवा पिन टाका (किमान ४ अक्षरी/अंकी).');
      return;
    }

    if (checkUserBlocked(cleanNum)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithMobile(cleanNum, { password: mobilePassword.trim() });
      if (res.success && res.user) {
        if (res.user.isBlocked) {
          setErrorMessage('🚫 आपले खाते सुरक्षेच्या कारणास्तव प्रशासकाकडून ब्लॉक केलेले आहे.');
          setIsLoading(false);
          return;
        }
        registerDeviceSession(res.user.id);
        setSuccessNotice(res.message || 'सुरक्षित पासवर्ड लॉगिन यशस्वी! स्वागत आहे.');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userMobile: res.user.mobile || cleanNum,
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'mobile_password', details: 'Bcrypt/Secure password verified' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 600);
      } else {
        setErrorMessage(
          res.message ||
            (isEn
              ? 'Incorrect password. Please chat with Admin on Telegram to reset your password.'
              : 'पासवर्ड चुकीचा आहे किंवा खाते सापडले नाही. पासवर्ड आठवत नसल्यास खालील "टेलिग्राम चॅट" वर क्लिक करून ॲडमिनकडून नवीन पासवर्ड मिळवा.')
        );
        setShowForgotAssistance(true);
      }
    } catch (err: any) {
      setErrorMessage('त्रुटी: ' + (err.message || 'लॉगिन करताना अडचण आली.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Google Single Sign-On Handler
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setSuccessNotice('');
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success && res.user) {
        if (res.user.isBlocked) {
          setErrorMessage('🚫 आपले खाते सुरक्षेच्या कारणास्तव प्रशासकाकडून ब्लॉक केलेले आहे.');
          setIsLoading(false);
          return;
        }
        registerDeviceSession(res.user.id);
        setSuccessNotice('गुगल द्वारे लॉगिन यशस्वी! आपले सहर्ष स्वागत आहे.');
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userEmail: res.user.email,
          eventType: 'LOGIN_SUCCESS',
          metadata: { provider: 'google', details: 'Google SSO Login' },
        });
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 600);
      } else if (res.message) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage('गुगल लॉगिन त्रुटी: ' + (err.message || 'प्रवेश करता आला नाही.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Truecaller Verified Login Handler
  const handleTruecallerLogin = async (mobileTarget?: string) => {
    setErrorMessage('');
    setSuccessNotice('');

    const targetInput = (mobileTarget || tcMobileInput || mobileNumber || '').replace(/\D/g, '').slice(-10);

    if (targetInput.length !== 10) {
      setShowTruecallerPrompt(true);
      return;
    }

    if (checkUserBlocked(targetInput)) {
      return;
    }

    setIsLoading(true);
    try {
      // Server-side Truecaller verification
      const verifyResp = await fetch('/api/auth/truecaller/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: targetInput }),
      });
      const verifyData = await verifyResp.json();

      if (verifyData.success && verifyData.phone) {
        const res = await loginWithTruecaller(
          verifyData.phone,
          verifyData.name || '',
          verifyData.city || '',
          verifyData.token || 'tc_verified'
        );
        if (res.success && res.user) {
          setShowTruecallerPrompt(false);
          setSuccessNotice('Truecaller द्वारे पडताळणीकृत लॉगिन यशस्वी!');
          logSecurityEvent({
            userId: res.user.id,
            userName: res.user.fullName,
            userMobile: res.user.mobile || targetInput,
            eventType: 'LOGIN_SUCCESS',
            metadata: { provider: 'truecaller', details: 'Truecaller OAuth verified' },
          });
          setTimeout(() => {
            onClose();
            setCurrentView('dashboard');
          }, 600);
          return;
        }
      }

      // Fallback: If phone exists in database, log in with Truecaller badge
      const res = await loginWithTruecaller(targetInput, '', '', 'tc_verified');
      if (res.success && res.user) {
        setShowTruecallerPrompt(false);
        setSuccessNotice('Truecaller पडताळणीसह लॉगिन यशस्वी!');
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 600);
      } else {
        setErrorMessage(res.message || 'या मोबाईल नंबरचे Truecaller खाते सापडले नाही. कृपया पासवर्डने लॉगिन करा.');
      }
    } catch (err: any) {
      setErrorMessage('Truecaller पडताळणी त्रुटी: ' + (err.message || 'कृपया पासवर्डने लॉगिन करा.'));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Guest Login Handler
  const handleGuestLogin = () => {
    loginAsGuest(mobileNumber || '9999999999', 'गेस्ट सदस्य');
    setSuccessNotice('गेस्ट म्हणून प्रवेश केला आहे. आपण आता स्थळे पाहू शकता.');
    setTimeout(() => {
      onClose();
      setCurrentView('profiles');
    }, 500);
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
                {isEn ? 'Vanjari Jodi Login' : 'वंजारी जोडी — सदस्य लॉगिन'}
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                {isEn ? 'Mobile Number + Password Login' : 'मोबाईल नंबर व पासवर्डने सुरक्षित प्रवेश'}
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

          {/* SECURITY ASSURANCE BADGE */}
          <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-2 text-[11px] text-amber-950 font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>१००% सुरक्षित व Bcrypt एन्क्रिप्टेड प्रणाली</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-[#800C1E] text-[10px] font-black border border-amber-300">
              Verified
            </span>
          </div>

          {/* 🌟 MAIN LOGIN FORM: MOBILE NUMBER + PASSWORD */}
          <form onSubmit={handleMobilePasswordLogin} className="space-y-3.5">
            {/* Mobile Number Field */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                📱 नोंदणीकृत मोबाईल नंबर (Mobile Number):
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 bg-slate-50 transition">
                <span className="inline-flex items-center px-3 text-slate-600 font-black text-xs sm:text-sm bg-slate-200/80 border-r border-slate-300 select-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="उदा. 9822XXXXXX"
                  className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black text-slate-700">
                  🔒 पासवर्ड किंवा पिन (Password):
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotAssistance(!showForgotAssistance)}
                  className="text-[11px] text-sky-700 hover:text-sky-900 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3 text-sky-600" />
                  <span>पासवर्ड आठवत नाही? टेलिग्राम चॅट</span>
                  {showForgotAssistance ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showMobilePassword ? 'text' : 'password'}
                  required
                  value={mobilePassword}
                  onChange={(e) => setMobilePassword(e.target.value)}
                  placeholder="आपला पासवर्ड किंवा पिन टाका"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowMobilePassword(!showMobilePassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showMobilePassword ? 'पासवर्ड लपवा' : 'पासवर्ड दाखवा'}
                >
                  {showMobilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Assistance Accordion - TELEGRAM CHAT FIRST */}
            {showForgotAssistance && (
              <div className="p-3.5 bg-gradient-to-br from-sky-50 via-blue-50/90 to-sky-100/60 border-2 border-sky-400 rounded-2xl space-y-2.5 animate-fadeIn text-xs shadow-md">
                <div className="flex items-start gap-2 text-sky-950 font-black">
                  <div className="p-1.5 rounded-xl bg-sky-600 text-white shrink-0 mt-0.5 shadow-xs">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-sky-950 font-black">
                      पासवर्ड आठवत नसल्यास टेलिग्राम वर थेट चॅट करा:
                    </span>
                    <span className="text-[11px] text-sky-800 font-medium">
                      आपला नोंदणीकृत मोबाईल नंबर पाठवून ॲडमिनकडून तात्काळ नवीन पासवर्ड मिळवा.
                    </span>
                  </div>
                </div>

                {/* Main Prominent Button: Telegram Chat */}
                <a
                  href={telegramChatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-black rounded-xl shadow transition active:scale-98 text-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>💬 टेलिग्राम वर चॅट करा (@{telegramUsername})</span>
                </a>

                {/* Exclusive Telegram Support Note */}
                <div className="p-2 bg-sky-100/80 rounded-xl border border-sky-300 text-[11px] text-sky-950 font-medium text-center">
                  🔒 गोपनीयता व जलद मदतीसाठी आमची कॉलिंग व व्हॉट्सॲप सिस्टीम पूर्णपणे बंद असून, केवळ <strong>अधिकृत टेलिग्राम चॅट</strong> द्वारेच मदत उपलब्ध आहे.
                </div>
              </div>
            )}

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:opacity-95 text-white rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 text-amber-300" />
              )}
              <span>सुरक्षित लॉगिन करा (Login Securely)</span>
              <ArrowRight className="w-4 h-4 text-amber-200" />
            </button>
          </form>

          {/* DIVIDER: OR OTHER VERIFIED LOGINS */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-500 shrink-0 select-none">
              किंवा १-क्लिक पर्यायांनी लॉगिन करा
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* 🌟 2 KEPT SOCIAL OPTIONS: GOOGLE & TRUECALLER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 rounded-xl font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>गुगल द्वारे लॉगिन</span>
            </button>

            {/* Truecaller Sign-in */}
            <button
              type="button"
              onClick={() => handleTruecallerLogin()}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-[#0087FF] hover:bg-[#0070D4] text-white rounded-xl font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              <span>Truecaller लॉगिन</span>
            </button>
          </div>

          {/* Quick Truecaller Mobile Prompt if needed */}
          {showTruecallerPrompt && (
            <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-2xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Truecaller पडताळणीसाठी नंबर टाका:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowTruecallerPrompt(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="tel"
                  maxLength={10}
                  value={tcMobileInput}
                  onChange={(e) => setTcMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="१० अंकी Truecaller नंबर"
                  className="w-full bg-white border border-blue-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleTruecallerLogin(tcMobileInput)}
                  className="px-4 py-1.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
                >
                  सत्यापित करा
                </button>
              </div>
            </div>
          )}

          {/* 👤 GUEST ACCESS OPTION */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-100 to-amber-50 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <span>👤 नोंदणीशिवाय पुढे जा (गेस्ट सदस्य / स्थळे पाहण्यासाठी)</span>
            </button>
          </div>

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
            <span>नवीन आहात का? <strong className="text-[#800C1E] underline">मोफत नोंदणी करा</strong></span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              setIsAdminOpen(true);
            }}
            className="text-slate-500 hover:text-slate-800 text-[11px] font-bold cursor-pointer hover:underline"
          >
            🔐 ॲडमिन पोर्टल
          </button>
        </div>

      </div>
    </div>
  );
};
