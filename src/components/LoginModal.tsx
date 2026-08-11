import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Sparkles, UserCheck, ShieldCheck, UserPlus, PhoneCall, CheckCircle2, ArrowRight } from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';

export const LoginModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { t, language, setIsRegisterOpen, setCurrentUser, setCurrentView, profiles, setIsAdminOpen, loginAsGuest, siteConfig, loginModalMode } = useApp();

  const isGuestAllowed = siteConfig?.enableGuestLogin !== false;

  // Mode: 'member_otp' | 'member_pass' | 'guest'
  const [mode, setMode] = useState<'member_otp' | 'member_pass' | 'guest'>('member_otp');

  // Synchronize modal sub-mode when opened or configured externally
  React.useEffect(() => {
    if (isOpen && loginModalMode) {
      setMode(loginModalMode);
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

  // Handler: Send OTP for Member
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
        alert(
          language === 'mr'
            ? 'या मोबाईल नंबरची किंवा ई-मेलची नोंदणी सापडली नाही! कृपया आधी "नवीन नोंदणी" फॉर्म भरा.'
            : 'No registered user found with this mobile/email. Please register first.'
        );
        return;
      }

      if (match.isBlocked) {
        alert(language === 'mr' ? '🚫 क्षमस्व! तुमचे अकाऊंट ॲडमिनद्वारे ब्लॉक करण्यात आले आहे. कृपया अधिक माहितीसाठी ॲडमिनशी संपर्क साधा.' : 'Your account has been blocked by Admin.');
        return;
      }
      setCurrentUser(match);
      setCurrentView('profiles');
      alert(language === 'mr' ? `सस्नेह नमस्कार ${match.fullName}! हयात सदस्य लॉगिन यशस्वी झाले.` : `Welcome ${match.fullName}! Login successful.`);
      onClose();
    } else {
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
      alert(
        language === 'mr'
          ? 'या मोबाईल नंबरची किंवा ई-मेलची नोंदणी सापडली नाही! कृपया आधी "नवीन नोंदणी" फॉर्म भरा.'
          : 'No registered user found with this mobile/email. Please register first.'
      );
      return;
    }

    if (match.isBlocked) {
      alert(language === 'mr' ? '🚫 क्षमस्व! तुमचे अकाऊंट ॲडमिनद्वारे ब्लॉक करण्यात आले आहे. कृपया अधिक माहितीसाठी ॲडमिनशी संपर्क साधा.' : 'Your account has been blocked by Admin.');
      return;
    }

    if (match.password !== memberPassword) {
      alert(language === 'mr' ? 'चुकीचा पासवर्ड! कृपया पुन्हा प्रयत्न करा.' : 'Invalid password! Please try again.');
      return;
    }

    setCurrentUser(match);
    setCurrentView('profiles');
    alert(language === 'mr' ? `नमस्कार ${match.fullName}! लॉगिन यशस्वी.` : `Welcome ${match.fullName}!`);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-100/90 border-b border-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#A71930] fill-[#A71930]" />
            <h2 className="text-base sm:text-lg font-black text-[#A71930]">
              वंजारी जोडी पोर्टल लॉगिन (Portal Access)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-amber-200/60 hover:bg-amber-200 text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Centered Brand Logo */}
          <div className="flex flex-col items-center justify-center py-4 bg-white border border-amber-200/60 rounded-3xl shadow-sm">
            <VanjariJodiLogo variant="stacked" size={80} />
            <p className="text-[10px] sm:text-xs text-amber-700 font-extrabold mt-2 italic bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              ॥ श्री संत भगवान बाबा प्रसन्न ॥
            </p>
          </div>

          {/* Top Option 1: New Member Registration Banner */}
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
              className="px-3 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-xs font-black shadow flex items-center gap-1 shrink-0"
            >
              <span>नवीन नोंदणी</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={`grid ${isGuestAllowed ? 'grid-cols-3' : 'grid-cols-2'} gap-1 bg-amber-100/80 p-1.5 rounded-2xl border border-amber-200 text-xs font-extrabold text-center`}>
            <button
              type="button"
              onClick={() => {
                setMode('member_otp');
                setMemberOtpSent(false);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'member_otp'
                  ? 'bg-[#A71930] text-amber-100 shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-amber-200/50'
              }`}
            >
              🔑 जुने सदस्य (OTP)
            </button>
            <button
              type="button"
              onClick={() => setMode('member_pass')}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'member_pass'
                  ? 'bg-[#A71930] text-amber-100 shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-amber-200/50'
              }`}
            >
              🔒 पासवर्ड लॉगिन
            </button>
            {isGuestAllowed && (
              <button
                type="button"
                onClick={() => {
                  setMode('guest');
                  setGuestOtpSent(false);
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  mode === 'guest'
                    ? 'bg-[#A71930] text-amber-100 shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-amber-200/50'
                }`}
              >
                👤 गेस्ट प्रवेश
              </button>
            )}
          </div>

          {/* MODE 1: Existing Member OTP Login */}
          {mode === 'member_otp' && (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300 shadow-sm">
              <div className="flex items-center justify-between border-b pb-2 border-amber-200">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#A71930]" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    सदस्य लॉगिन - ३ सोपे पडताळणी पर्याय
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
                  <span>📧 ई-मेल OTP</span>
                </button>
              </div>

              <form onSubmit={handleVerifyMemberOtpLogin} className="space-y-3 text-xs sm:text-sm font-semibold">
                {verificationMethod === 'app_otp' && (
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
                        className="flex-1 bg-amber-50/50 border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930] font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleSendMemberOtp}
                        className="px-3.5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow shrink-0 cursor-pointer"
                      >
                        OTP पाठवा
                      </button>
                    </div>
                  </div>
                )}

                {verificationMethod === 'whatsapp' && (
                  <div className="space-y-2 bg-emerald-50 p-3 rounded-xl border border-emerald-300">
                    <label className="block text-emerald-950 font-black">
                      💬 १० अंकी मोबाईल नंबर टाका व WhatsApp १-क्लिक पडताळा:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="उदा. 9822145890"
                        value={memberMobile}
                        onChange={(e) => setMemberMobile(e.target.value)}
                        maxLength={10}
                        className="flex-1 bg-white border-2 border-emerald-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-emerald-600 font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!memberMobile || memberMobile.length < 10) {
                            alert('कृपया वैध १० अंकी मोबाईल नंबर टाका.');
                            return;
                          }
                          const code = Math.floor(100000 + Math.random() * 900000).toString();
                          setGeneratedMemberOtp(code);
                          setMemberOtpInput(code);
                          setMemberOtpSent(true);
                          const waText = encodeURIComponent(`नमस्कार वंजारी जोडी टीम, माझा लॉगिन पडताळणी कोड आहे: ${code}`);
                          const adminWa = (siteConfig?.contactWhatsapp || '0000000000').replace(/\D/g, '');
                          const cleanWa = adminWa.length === 10 ? '91' + adminWa : (adminWa || '910000000000');
                          window.open(`https://wa.me/${cleanWa}?text=${waText}`, '_blank');
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow flex items-center gap-1 cursor-pointer"
                      >
                        <span>WhatsApp वर पाठवा</span>
                      </button>
                    </div>
                  </div>
                )}

                {verificationMethod === 'email' && (
                  <div className="space-y-2 bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <label className="block text-blue-950 font-black">
                      📧 तुमची नोंदणीकृत ई-मेल आयडी:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="उदा. pooja.munde@gmail.com"
                        value={memberEmail}
                        onChange={(e) => {
                          setMemberEmail(e.target.value);
                          setMemberMobile(e.target.value);
                        }}
                        className="flex-1 bg-white border-2 border-blue-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-blue-600 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!memberEmail || !memberEmail.includes('@')) {
                            alert('कृपया वैध ई-मेल आयडी टाका.');
                            return;
                          }
                          const code = Math.floor(100000 + Math.random() * 900000).toString();
                          setGeneratedMemberOtp(code);
                          setMemberOtpSent(true);
                          alert(`ई-मेल पडताळणी कोड पाठवला आहे: ${code}`);
                        }}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow cursor-pointer"
                      >
                        ई-मेल OTP पाठवा
                      </button>
                    </div>
                  </div>
                )}

                {memberOtpSent && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-[11px] text-emerald-800 font-extrabold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>पडताळणी कोड प्राप्त झाला! कोड: <strong>{generatedMemberOtp}</strong> प्रविष्ट करा.</span>
                    </div>
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        🔑 ६ अंकी पडताळणी OTP:
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. 849201"
                        value={memberOtpInput}
                        onChange={(e) => setMemberOtpInput(e.target.value)}
                        maxLength={6}
                        className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#A71930] font-mono text-center font-black tracking-widest text-base"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-lg border border-amber-300/40 cursor-pointer"
                    >
                      सदस्य लॉगिन पडताळा
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* MODE 2: Existing Member Password Login */}
          {mode === 'member_pass' && (
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-300 shadow-sm">
              <div className="flex items-center gap-2 border-b pb-2 border-amber-200">
                <Lock className="w-4 h-4 text-[#A71930]" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                  हयात / नोंदणीकृत सदस्य - पासवर्डद्वारे लॉगिन
                </h3>
              </div>

              <form onSubmit={handleMemberPasswordLogin} className="space-y-3 text-xs sm:text-sm font-semibold">
                <div>
                  <label className="block text-slate-800 font-extrabold mb-1">
                    📱 मोबाईल नंबर / ई-मेल:
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. 9822145890"
                    value={memberMobile}
                    onChange={(e) => setMemberMobile(e.target.value)}
                    className="w-full bg-amber-50/50 border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-extrabold mb-1">
                    🔒 पासवर्ड:
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    className="w-full bg-amber-50/50 border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-lg border border-amber-300/40 cursor-pointer"
                >
                  पासवर्डने लॉगिन करा
                </button>
              </form>
            </div>
          )}

          {/* MODE 3: Guest Login with MANDATORY Mobile Number & OTP Verification */}
          {mode === 'guest' && (
            <form onSubmit={handleVerifyGuestOtpAndLogin} className="space-y-3 bg-[#FFFDF0] p-4 rounded-2xl border-2 border-amber-400 shadow-sm">
              <div className="flex items-center gap-2 text-[#A71930] font-black text-xs sm:text-sm pb-1 border-b border-amber-200">
                <UserCheck className="w-5 h-5 text-[#A71930]" />
                <span>पाहुणे / गेस्ट प्रवेश (Guest Login - OTP पडताळणीसह)</span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                गेस्ट म्हणून प्रवेश करण्यासाठी मोबाईल नंबर प्रविष्ट करून OTP पडताळणी करणे बंधनकारक आहे.
              </p>

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
                    🔑 प्राप्त झालेला पडताळणी कोड टाका (पडताळणी OTP: <strong>{generatedGuestOtp}</strong>)
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
                    className="w-full py-3 mt-1 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-lg border border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Admin Portal Direct Link */}
          <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold">पोर्टल समस्या आहे का?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsAdminOpen(true);
              }}
              className="text-[#800C1E] font-extrabold underline flex items-center gap-1 hover:text-[#A71930]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#A71930]" />
              <span>ॲडमिन प्रवेश (Admin Portal)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

