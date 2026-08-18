import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Sparkles,
  UserCheck,
  ShieldCheck,
  UserPlus,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { logSecurityEvent } from '../utils/securityService';

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    t,
    language,
    setIsRegisterOpen,
    setCurrentUser,
    setCurrentView,
    profiles,
    setIsAdminOpen,
    loginAsGuest,
    loginWithGoogle,
    loginWithEmail,
    siteConfig,
    loginModalMode
  } = useApp();

  const isGuestAllowed = siteConfig?.enableGuestLogin !== false;

  // Mode: 'google' | 'member_otp' | 'member_email' | 'member_pass' | 'guest'
  const [mode, setMode] = useState<'google' | 'member_otp' | 'member_email' | 'member_pass' | 'guest'>('member_otp');

  // Google Sign-In Loading & New User Success State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSuccessData, setGoogleSuccessData] = useState<{
    userName: string;
    isNewUser: boolean;
    email: string;
  } | null>(null);

  // Synchronize modal sub-mode when opened or configured externally
  React.useEffect(() => {
    if (isOpen && loginModalMode) {
      if (loginModalMode === 'guest') setMode('guest');
      else if (loginModalMode === 'member_pass') setMode('member_pass');
      else setMode('member_otp');
    }
    if (!isOpen) {
      setGoogleSuccessData(null);
      setIsGoogleLoading(false);
    }
  }, [isOpen, loginModalMode]);

  // Verification Method: 'app_otp' | 'whatsapp' | 'email'
  const [verificationMethod, setVerificationMethod] = useState<'app_otp' | 'whatsapp' | 'email'>('app_otp');

  // Member Login States
  const [memberMobile, setMemberMobile] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberOtpSent, setMemberOtpSent] = useState(false);
  const [memberOtpInput, setMemberOtpInput] = useState('');
  const [generatedMemberOtp, setGeneratedMemberOtp] = useState('849201');
  const [memberPassword, setMemberPassword] = useState('');

  // Email Direct Login States
  const [emailInput, setEmailInput] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('519342');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Guest Login States (With mandatory Mobile + OTP)
  const [guestMobile, setGuestMobile] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestDistrict, setGuestDistrict] = useState('बीड (Beed)');
  const [guestOtpSent, setGuestOtpSent] = useState(false);
  const [guestOtpInput, setGuestOtpInput] = useState('');
  const [generatedGuestOtp, setGeneratedGuestOtp] = useState('654321');

  // Auto fallback if guest mode is disabled by admin
  React.useEffect(() => {
    if (mode === 'guest' && !isGuestAllowed) {
      setMode('member_otp');
    }
  }, [mode, isGuestAllowed]);

  if (!isOpen) return null;

  // Handler: Google 1-Click Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const res = await loginWithGoogle();
      if (res.success && res.user) {
        logSecurityEvent({
          userId: res.user.id,
          userName: res.user.fullName,
          userEmail: res.user.email || '',
          userMobile: res.user.mobile || '',
          eventType: 'LOGIN_SUCCESS',
          metadata: { authProvider: 'google.com', isNewUser: !!res.isNewUser }
        });

        if (res.isNewUser) {
          setGoogleSuccessData({
            userName: res.user.fullName,
            isNewUser: true,
            email: res.user.email || ''
          });
        } else {
          setCurrentView('profiles');
          alert(
            language === 'mr'
              ? `🎉 सस्नेह नमस्कार ${res.user.fullName}! गुगल लॉगिन यशस्वी झाले.`
              : `Welcome ${res.user.fullName}! Google Login successful.`
          );
          onClose();
        }
      } else if (res.message && res.message !== 'Google login cancelled') {
        logSecurityEvent({
          userId: 'anonymous_google_fail',
          eventType: 'LOGIN_FAILED',
          metadata: { authProvider: 'google.com', error: res.message }
        });
        alert(language === 'mr' ? `गुगल लॉगिन त्रुटी: ${res.message}` : `Google login error: ${res.message}`);
      }
    } catch (err: any) {
      logSecurityEvent({
        userId: 'anonymous_google_fail',
        eventType: 'LOGIN_FAILED',
        metadata: { authProvider: 'google.com', error: err?.message }
      });
      alert(language === 'mr' ? 'गुगल लॉगिन करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to sign in with Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handler: Send OTP for Member (Mobile/Email)
  const handleSendMemberOtp = () => {
    if (!memberMobile || memberMobile.trim().replace(/\D/g, '').length < 10) {
      alert(language === 'mr' ? 'कृपया तुमचा वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.' : 'Please enter valid 10-digit mobile number.');
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedMemberOtp(newOtp);
    setMemberOtpSent(true);
    alert(language === 'mr' ? `तुमचा पडताळणी OTP पाठवला आहे: ${newOtp}` : `Verification OTP sent: ${newOtp}`);
  };

  // Handler: Verify Member OTP & Login
  const handleVerifyMemberOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberOtpInput === generatedMemberOtp) {
      const cleanInput = memberMobile.replace(/\D/g, '');
      const match = profiles.find((p) => {
        const cleanP = (p.mobile || '').replace(/\D/g, '');
        return (cleanInput && cleanP.includes(cleanInput)) || (p.email && p.email.toLowerCase() === memberMobile.trim().toLowerCase());
      });

      if (!match) {
        logSecurityEvent({
          userId: 'unknown_mobile_' + cleanInput,
          userMobile: memberMobile,
          eventType: 'LOGIN_FAILED',
          metadata: { reason: 'User not registered', authProvider: 'mobile_otp' }
        });
        alert(
          language === 'mr'
            ? 'या मोबाईल नंबरची किंवा ई-मेलची नोंदणी सापडली नाही! कृपया आधी "नवीन नोंदणी" फॉर्म भरा किंवा वर "Google लॉगिन" वापरा.'
            : 'No registered user found with this mobile/email. Please register first or use Google Login.'
        );
        return;
      }

      if (match.isBlocked) {
        logSecurityEvent({
          userId: match.id,
          userName: match.fullName,
          userMobile: match.mobile,
          eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          metadata: { reason: 'Blocked account login attempted', authProvider: 'mobile_otp' }
        });
        alert(language === 'mr' ? '🚫 क्षमस्व! तुमचे अकाऊंट ॲडमिनद्वारे ब्लॉक करण्यात आले आहे. कृपया अधिक माहितीसाठी ॲडमिनशी संपर्क साधा.' : 'Your account has been blocked by Admin.');
        return;
      }

      logSecurityEvent({
        userId: match.id,
        userName: match.fullName,
        userMobile: match.mobile,
        userEmail: match.email,
        eventType: 'LOGIN_SUCCESS',
        metadata: { authProvider: 'mobile_otp' }
      });

      setCurrentUser(match);
      setCurrentView('profiles');
      alert(language === 'mr' ? `सस्नेह नमस्कार ${match.fullName}! हयात सदस्य लॉगिन यशस्वी झाले.` : `Welcome ${match.fullName}! Login successful.`);
      onClose();
    } else {
      logSecurityEvent({
        userId: 'invalid_otp_attempt',
        userMobile: memberMobile,
        eventType: 'LOGIN_FAILED',
        metadata: { reason: 'Incorrect OTP entered', authProvider: 'mobile_otp' }
      });
      alert(language === 'mr' ? `चुकीचा OTP! प्रविष्ट केलेला OTP जुळत नाही. प्राप्त झालेला OTP: ${generatedMemberOtp}` : `Invalid OTP! Please enter ${generatedMemberOtp}`);
    }
  };

  // Handler: Member Password Login
  const handleMemberPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberMobile) {
      alert(language === 'mr' ? 'मोबाईल नंबर किंवा ई-मेल टाका.' : 'Enter Mobile or Email.');
      return;
    }
    const cleanInput = memberMobile.replace(/\D/g, '');
    const match = profiles.find((p) => {
      const cleanP = (p.mobile || '').replace(/\D/g, '');
      return (cleanInput && cleanP.includes(cleanInput)) || (p.email && p.email.toLowerCase() === memberMobile.trim().toLowerCase());
    });

    if (!match) {
      logSecurityEvent({
        userId: 'unknown_' + cleanInput,
        userMobile: memberMobile,
        eventType: 'LOGIN_FAILED',
        metadata: { reason: 'Profile not found', authProvider: 'password' }
      });
      alert(
        language === 'mr'
          ? 'या मोबाईल नंबरची किंवा ई-मेलची नोंदणी सापडली नाही! कृपया आधी "नवीन नोंदणी" फॉर्म भरा.'
          : 'No registered user found with this mobile/email. Please register first.'
      );
      return;
    }

    if (match.isBlocked) {
      logSecurityEvent({
        userId: match.id,
        userName: match.fullName,
        userMobile: match.mobile,
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        metadata: { reason: 'Blocked account access attempted', authProvider: 'password' }
      });
      alert(language === 'mr' ? '🚫 क्षमस्व! तुमचे अकाऊंट ॲडमिनद्वारे ब्लॉक करण्यात आले आहे. कृपया अधिक माहितीसाठी ॲडमिनशी संपर्क साधा.' : 'Your account has been blocked by Admin.');
      return;
    }

    if (match.password !== memberPassword) {
      logSecurityEvent({
        userId: match.id,
        userName: match.fullName,
        userMobile: match.mobile,
        eventType: 'LOGIN_FAILED',
        metadata: { reason: 'Invalid password', authProvider: 'password' }
      });
      alert(language === 'mr' ? 'चुकीचा पासवर्ड! कृपया पुन्हा प्रयत्न करा.' : 'Invalid password! Please try again.');
      return;
    }

    logSecurityEvent({
      userId: match.id,
      userName: match.fullName,
      userMobile: match.mobile,
      userEmail: match.email,
      eventType: 'LOGIN_SUCCESS',
      metadata: { authProvider: 'password' }
    });

    setCurrentUser(match);
    setCurrentView('profiles');
    alert(language === 'mr' ? `नमस्कार ${match.fullName}! लॉगिन यशस्वी.` : `Welcome ${match.fullName}!`);
    onClose();
  };

  // Handler: Send OTP for Email Login
  const handleSendEmailOtp = () => {
    if (!emailInput || !emailInput.includes('@')) {
      alert(language === 'mr' ? 'कृपया वैध ई-मेल पत्ता प्रविष्ट करा.' : 'Please enter a valid email address.');
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailOtp(newOtp);
    setEmailOtpSent(true);
    alert(language === 'mr' ? `तुमच्या ${emailInput} वर OTP पाठवला आहे: ${newOtp}` : `Verification OTP sent to ${emailInput}: ${newOtp}`);
  };

  // Handler: Verify Email OTP & Login / Register
  const handleVerifyEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtpInput === generatedEmailOtp) {
      setIsEmailLoading(true);
      try {
        const res = await loginWithEmail(emailInput);
        if (res.success && res.user) {
          logSecurityEvent({
            userId: res.user.id,
            userName: res.user.fullName,
            userEmail: res.user.email || emailInput,
            eventType: 'LOGIN_SUCCESS',
            metadata: { authProvider: 'email_otp', isNewUser: !!res.isNewUser }
          });

          if (res.isNewUser) {
            setGoogleSuccessData({
              userName: res.user.fullName,
              isNewUser: true,
              email: res.user.email || emailInput
            });
          } else {
            setCurrentView('profiles');
            alert(
              language === 'mr'
                ? `सस्नेह नमस्कार ${res.user.fullName}! ई-मेल लॉगिन यशस्वी झाले.`
                : `Welcome ${res.user.fullName}! Email login successful.`
            );
            onClose();
          }
        } else {
          logSecurityEvent({
            userId: 'unknown_email_' + emailInput,
            userEmail: emailInput,
            eventType: 'LOGIN_FAILED',
            metadata: { error: res.message, authProvider: 'email_otp' }
          });
          alert(res.message || 'Login error');
        }
      } catch (err: any) {
        alert('ई-मेल लॉगिन करताना त्रुटी आली.');
      } finally {
        setIsEmailLoading(false);
      }
    } else {
      logSecurityEvent({
        userId: 'invalid_email_otp',
        userEmail: emailInput,
        eventType: 'LOGIN_FAILED',
        metadata: { reason: 'Incorrect email OTP', authProvider: 'email_otp' }
      });
      alert(language === 'mr' ? `चुकीचा OTP! स्क्रीनवर दाखवलेला OTP (${generatedEmailOtp}) प्रविष्ट करा.` : `Invalid OTP. Enter ${generatedEmailOtp}`);
    }
  };

  // Handler: Send OTP for Guest Login
  const handleSendGuestOtp = () => {
    if (!guestMobile || guestMobile.trim().replace(/\D/g, '').length < 10) {
      alert(language === 'mr' ? 'गेस्ट प्रवेशासाठी तुमचा वैध १० अंकी मोबाईल नंबर प्रविष्ट करणे अनिवार्य आहे.' : 'Please enter valid 10-digit mobile number for guest login.');
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedGuestOtp(newOtp);
    setGuestOtpSent(true);
    alert(language === 'mr' ? `गेस्ट पडताळणी OTP पाठवला आहे: ${newOtp} (हा OTP टाकून पडताळणी पूर्ण करा)` : `Guest Verification OTP: ${newOtp}`);
  };

  // Handler: Verify Guest OTP & Submit Guest Login
  const handleVerifyGuestOtpAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestOtpSent) {
      alert(language === 'mr' ? 'प्रथम "OTP पाठवा" वर क्लिक करा.' : 'Click "Send OTP" first.');
      return;
    }
    if (guestOtpInput === generatedGuestOtp) {
      loginAsGuest(guestMobile, guestName || 'पाहुणे सदस्य', guestDistrict);
      setCurrentView('profiles');
      alert(language === 'mr' ? `मोबाईल ${guestMobile} पडताळणी यशस्वी! गेस्ट म्हणून तुमचा प्रवेश मंजूर झाला आहे.` : `Mobile ${guestMobile} verified! Guest access granted.`);
      onClose();
    } else {
      alert(language === 'mr' ? `चुकीचा OTP! स्क्रीनवर दाखवलेला OTP (${generatedGuestOtp}) प्रविष्ट करा.` : `Invalid OTP. Enter ${generatedGuestOtp}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-100/90 border-b border-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#A71930] fill-[#A71930]" />
            <h2 className="text-base sm:text-lg font-black text-[#A71930]">
              वंजारी जोडी पोर्टल लॉगिन (Member Access)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-amber-200/60 hover:bg-amber-200 text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Centered Brand Logo */}
          <div className="flex flex-col items-center justify-center py-3 bg-white border border-amber-200/60 rounded-3xl shadow-sm">
            <VanjariJodiLogo variant="stacked" size={70} />
            <p className="text-[10px] sm:text-xs text-amber-800 font-extrabold mt-1.5 italic bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200">
              ॥ श्री संत भगवान बाबा प्रसन्न ॥
            </p>
          </div>

          {/* New User Welcome / Success Screen after Google or Email Registration */}
          {googleSuccessData ? (
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl border-2 border-emerald-400 shadow-md text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  🎉 लॉगिन व खाते नोंदणी यशस्वी!
                </h3>
                <p className="text-xs font-bold text-emerald-800 mt-1">
                  सस्नेह नमस्कार, <span className="text-slate-950 font-black">{googleSuccessData.userName}</span>!
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  तुमचा ई-मेल: <span className="font-mono font-bold text-slate-800">{googleSuccessData.email}</span> यशस्वीरित्या पडताळला गेला आहे.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 text-left space-y-1.5">
                <p className="font-extrabold text-[#A71930]">💡 पुढे काय करायचे आहे?</p>
                <p className="text-[11px] leading-relaxed">
                  आपले मूलभूत खाते तयार झाले आहे. योग्य व अनुरूप स्थळांच्या संपर्कासाठी आपण आता आपला विवाह बायोडाटा पूर्ण करू शकता किंवा थेट स्थळे पाहू शकता.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsRegisterOpen(true);
                  }}
                  className="py-2.5 px-3 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-xs font-black shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>बायोडाटा पूर्ण करा</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('profiles');
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>स्थळे पाहणे सुरू करा</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* PRIMARY PROMINENT FEATURE: Google 1-Click Login Button */}
              <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 p-3.5 rounded-2xl border-2 border-amber-300 shadow-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide">
                    जलद व सुरक्षित १-क्लिक प्रवेश (Fast Google Access)
                  </span>
                </div>
                
                <button
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 bg-white hover:bg-amber-50/50 border-2 border-slate-300 hover:border-amber-500 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-95 disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 text-amber-700 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#A71930] transition">
                      Google द्वारे १-क्लिक लॉगिन (Sign in with Google)
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      पासवर्ड किंवा OTP ची गरज नाही • १ सेकंदात थेट सुरू
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-amber-200"></div>
                <span className="text-[11px] font-bold text-amber-800 uppercase">किंवा मोबाईल / ई-मेल द्वारे</span>
                <div className="flex-1 h-px bg-amber-200"></div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className={`grid ${isGuestAllowed ? 'grid-cols-4' : 'grid-cols-3'} gap-1 bg-amber-100/80 p-1 rounded-2xl border border-amber-200 text-[11px] font-extrabold text-center`}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('member_otp');
                    setMemberOtpSent(false);
                  }}
                  className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer truncate ${
                    mode === 'member_otp'
                      ? 'bg-[#A71930] text-amber-100 shadow-md font-black'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-amber-200/50'
                  }`}
                >
                  📱 मोबाईल OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('member_email');
                    setEmailOtpSent(false);
                  }}
                  className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer truncate ${
                    mode === 'member_email'
                      ? 'bg-[#A71930] text-amber-100 shadow-md font-black'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-amber-200/50'
                  }`}
                >
                  📧 ई-मेल लॉगिन
                </button>
                <button
                  type="button"
                  onClick={() => setMode('member_pass')}
                  className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer truncate ${
                    mode === 'member_pass'
                      ? 'bg-[#A71930] text-amber-100 shadow-md font-black'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-amber-200/50'
                  }`}
                >
                  🔒 पासवर्ड
                </button>
                {isGuestAllowed && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('guest');
                      setGuestOtpSent(false);
                    }}
                    className={`py-1.5 px-1 rounded-xl transition-all cursor-pointer truncate ${
                      mode === 'guest'
                        ? 'bg-[#A71930] text-amber-100 shadow-md font-black'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-amber-200/50'
                    }`}
                  >
                    👤 गेस्ट
                  </button>
                )}
              </div>

              {/* MODE 1: Existing Member Mobile OTP Login */}
              {mode === 'member_otp' && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-[#A71930]" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        सदस्य लॉगिन - मोबाईल पडताळणी पर्याय
                      </h3>
                    </div>
                  </div>

                  {/* 3 Verification Method Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-amber-50 rounded-xl border border-amber-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setVerificationMethod('app_otp')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        verificationMethod === 'app_otp'
                          ? 'bg-[#A71930] text-amber-100 shadow font-black'
                          : 'text-slate-700 hover:bg-amber-100'
                      }`}
                    >
                      <span>⚡ इन-अॅप OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationMethod('whatsapp')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        verificationMethod === 'whatsapp'
                          ? 'bg-emerald-600 text-white shadow font-black'
                          : 'text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <span>💬 WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationMethod('email')}
                      className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        verificationMethod === 'email'
                          ? 'bg-blue-600 text-white shadow font-black'
                          : 'text-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      <span>📧 SMS / ई-मेल</span>
                    </button>
                  </div>

                  <form onSubmit={handleVerifyMemberOtpLogin} className="space-y-3 text-xs sm:text-sm font-semibold">
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        📱 नोंदणीकृत १० अंकी मोबाईल नंबर:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          placeholder="उदा. 9822145890"
                          value={memberMobile}
                          onChange={(e) => setMemberMobile(e.target.value)}
                          maxLength={10}
                          className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-mono text-sm font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleSendMemberOtp}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow shrink-0 cursor-pointer"
                        >
                          {memberOtpSent ? 'पुन्हा पाठवा' : 'OTP पाठवा'}
                        </button>
                      </div>
                    </div>

                    {memberOtpSent ? (
                      <div className="space-y-2 pt-2 border-t border-amber-200 animate-in fade-in duration-150">
                        <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-[11px] text-emerald-900 font-bold">
                          🔑 प्राप्त पडताळणी कोड टाका (चाचणी OTP: <strong>{generatedMemberOtp}</strong>)
                        </div>
                        <div>
                          <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                            ६ अंकी पडताळणी OTP:
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. 849201"
                            required
                            value={memberOtpInput}
                            onChange={(e) => setMemberOtpInput(e.target.value)}
                            maxLength={6}
                            className="w-full bg-white border-2 border-amber-400 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-mono text-center font-black tracking-widest text-base"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-md border border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>OTP पडताळा व लॉगिन करा</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-bold text-center">
                        👆 मोबाईल नंबर टाकून <strong>"OTP पाठवा"</strong> बटणावर क्लिक करा.
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* MODE 2: Email Direct Login */}
              {mode === 'member_email' && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#A71930]" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        ई-मेल / Gmail द्वारे थेट प्रवेश
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyEmailLogin} className="space-y-3 text-xs sm:text-sm font-semibold">
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        📧 ई-मेल पत्ता (Email Address):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="उदा. vanjari.member@gmail.com"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow shrink-0 cursor-pointer"
                        >
                          {emailOtpSent ? 'पुन्हा पाठवा' : 'OTP पाठवा'}
                        </button>
                      </div>
                    </div>

                    {emailOtpSent ? (
                      <div className="space-y-2 pt-2 border-t border-amber-200 animate-in fade-in duration-150">
                        <div className="p-2 bg-blue-50 border border-blue-300 rounded-xl text-[11px] text-blue-900 font-bold">
                          🔑 प्राप्त पडताळणी कोड टाका (चाचणी OTP: <strong>{generatedEmailOtp}</strong>)
                        </div>
                        <div>
                          <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                            ६ अंकी ई-मेल OTP:
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. 519342"
                            required
                            value={emailOtpInput}
                            onChange={(e) => setEmailOtpInput(e.target.value)}
                            maxLength={6}
                            className="w-full bg-white border-2 border-amber-400 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-mono text-center font-black tracking-widest text-base"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isEmailLoading}
                          className="w-full py-2.5 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-md border border-amber-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                          <span>ई-मेल OTP पडताळा व पुढे जा</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-bold text-center">
                        👆 आपला Gmail / ई-मेल टाकून <strong>"OTP पाठवा"</strong> वर क्लिक करा. नवीन सदस्य असल्यास आपोआप खाते सुरू होईल.
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* MODE 3: Member Password Login */}
              {mode === 'member_pass' && (
                <form onSubmit={handleMemberPasswordLogin} className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300 shadow-sm">
                  <div className="flex items-center gap-2 border-b pb-2 border-amber-200">
                    <Lock className="w-4 h-4 text-[#A71930]" />
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      पासवर्ड द्वारे सदस्य लॉगिन
                    </h3>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                      📱 मोबाईल नंबर किंवा ई-मेल:
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. 9822145890 किंवा email@gmail.com"
                      required
                      value={memberMobile}
                      onChange={(e) => setMemberMobile(e.target.value)}
                      className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                      🔒 पासवर्ड:
                    </label>
                    <input
                      type="password"
                      placeholder="तुमचा पासवर्ड प्रविष्ट करा"
                      required
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-bold text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-md border border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>लॉगिन करा</span>
                  </button>
                </form>
              )}

              {/* MODE 4: Guest Login */}
              {mode === 'guest' && isGuestAllowed && (
                <form onSubmit={handleVerifyGuestOtpAndLogin} className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300 shadow-sm">
                  <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#A71930]" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        गेस्ट प्रवेश (Visitor Access)
                      </h3>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                      📱 तुमचा १० अंकी मोबाईल नंबर <span className="text-rose-600">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="उदा. 9822145890"
                        required
                        value={guestMobile}
                        onChange={(e) => setGuestMobile(e.target.value)}
                        maxLength={10}
                        className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-mono text-sm font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleSendGuestOtp}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow shrink-0 cursor-pointer"
                      >
                        {guestOtpSent ? 'पुन्हा OTP पाठवा' : 'OTP पाठवा'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                      👤 पूर्ण नाव (पर्यायी):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. रामराव फड"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-[#A71930] text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                      📍 जिल्हा / शहर (पर्यायी):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. बीड / परळी / पुणे"
                      value={guestDistrict}
                      onChange={(e) => setGuestDistrict(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-[#A71930] text-xs font-bold"
                    />
                  </div>

                  {/* Guest OTP Step */}
                  {guestOtpSent ? (
                    <div className="space-y-2 pt-2 border-t border-amber-200 animate-in fade-in duration-150">
                      <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-[11px] text-emerald-900 font-bold">
                        🔑 प्राप्त पडताळणी कोड टाका (पडताळणी OTP: <strong>{generatedGuestOtp}</strong>)
                      </div>
                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1 text-xs">
                          ६ अंकी पडताळणी OTP:
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. 654321"
                          required
                          value={guestOtpInput}
                          onChange={(e) => setGuestOtpInput(e.target.value)}
                          maxLength={6}
                          className="w-full bg-white border-2 border-amber-400 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-mono text-center font-black tracking-widest text-base"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-lg border border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>OTP पडताळा व गेस्ट प्रवेश मिळवा</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-100/60 rounded-xl border border-amber-300 text-[11px] text-amber-900 font-bold text-center">
                      👆 प्रथम वर मोबाईल नंबर टाकून <strong>"OTP पाठवा"</strong> बटणावर क्लिक करा.
                    </div>
                  )}
                </form>
              )}

              {/* Bottom Option: New Member Registration Banner */}
              <div className="p-3 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-2xl border border-amber-300 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#A71930] shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900">नवी नोंदणी करायची आहे?</p>
                    <p className="text-[10px] text-slate-600 font-medium">नवीन सदस्य नोंदणी फॉर्म भरा</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsRegisterOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-xs font-black shadow flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>नवीन नोंदणी</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Admin Portal Direct Link */}
              <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold">पोर्टल समस्या आहे का?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsAdminOpen(true);
                  }}
                  className="text-[#800C1E] font-extrabold underline flex items-center gap-1 hover:text-[#A71930] cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A71930]" />
                  <span>ॲडमिन प्रवेश (Admin Portal)</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
