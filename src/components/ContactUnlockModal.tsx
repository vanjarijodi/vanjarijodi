import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import {
  X,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  PhoneCall,
  Clock,
  Upload,
  AlertCircle,
  IndianRupee,
  Lock,
  ArrowRight,
  Smartphone,
  Sparkles,
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';

export const ContactUnlockModal: React.FC = () => {
  const {
    isContactUnlockModalOpen,
    setIsContactUnlockModalOpen,
    selectedProfileForUnlock,
    setSelectedProfileForUnlock,
    paymentConfig,
    siteConfig,
    currentUser,
    unlockContact,
    addPayPerContactRequest,
    payPerContactRequests,
    paymentRequests,
    profiles,
  } = useApp();

  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);
  const [isUtrChecking, setIsUtrChecking] = useState(false);
  const [isUtrDuplicate, setIsUtrDuplicate] = useState(false);

  if (!isContactUnlockModalOpen || !selectedProfileForUnlock) return null;

  const unlockFee = siteConfig.unlockContactFee || 50;
  const upiId = paymentConfig?.upiId || siteConfig.paymentUpiId || 'hangemahesh@ybl';
  const phonepeUpi = paymentConfig?.phonepeUpiId || upiId;
  const gpayUpi = paymentConfig?.gpayUpiId || (upiId.includes('@ybl') || upiId.includes('@ibl') ? '' : upiId);
  const paytmUpi = paymentConfig?.paytmUpiId || upiId;
  const bhimUpi = paymentConfig?.bhimUpiId || upiId;

  const businessName = paymentConfig?.payeeName || siteConfig.paymentPayeeName || 'Mahesh Hange';
  const note = `Unlock_${selectedProfileForUnlock.id.slice(-6)}`;

  // Construct Direct App Intents
  const universalUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${unlockFee}&cu=INR&tn=${encodeURIComponent(note)}`;
  const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(phonepeUpi)}&pn=${encodeURIComponent(businessName)}&am=${unlockFee}&cu=INR&tn=${encodeURIComponent(note)}`;
  const gpayUri = gpayUpi
    ? `tez://upi/pay?pa=${encodeURIComponent(gpayUpi)}&pn=${encodeURIComponent(businessName)}&am=${unlockFee}&cu=INR&tn=${encodeURIComponent(note)}`
    : universalUri;
  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(paytmUpi)}&pn=${encodeURIComponent(businessName)}&am=${unlockFee}&cu=INR&tn=${encodeURIComponent(note)}`;
  const bhimUri = `bhim://pay?pa=${encodeURIComponent(bhimUpi)}&pn=${encodeURIComponent(businessName)}&am=${unlockFee}&cu=INR&tn=${encodeURIComponent(note)}`;
  const credUri = `cred://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${unlockFee}&cu=INR&tn=${encodeURIComponent(note)}`;
  const amazonpayUri = `amazonpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(businessName)}&am=${unlockFee}&cu=INR&tn=${encodeURIComponent(note)}`;

  const qrCodeUrl =
    paymentConfig?.merchantQrImageUrl ||
    siteConfig.paymentQrCodeUrl ||
    siteConfig.paymentQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(universalUri)}`;

  const [launchNotice, setLaunchNotice] = useState<string | null>(null);

  const handleLaunchApp = (appName: string, customUri?: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(upiId);
      }
    } catch (e) {}

    setLaunchingApp(appName);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
    setTimeout(() => setLaunchingApp(null), 4000);

    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    const formattedPrice = String(unlockFee).replace(/[^0-9.]/g, '');
    const encodedUpi = encodeURIComponent(upiId);
    const encodedBusiness = encodeURIComponent(businessName);
    const encodedNote = encodeURIComponent(note);

    let targetUri = customUri || universalUri;

    if (appName === 'Google Pay') {
      targetUri = isAndroid
        ? `intent://pay?pa=${encodedUpi}&pn=${encodedBusiness}&am=${formattedPrice}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
        : gpayUri;
    } else if (appName === 'PhonePe') {
      targetUri = isAndroid
        ? `intent://pay?pa=${encodedUpi}&pn=${encodedBusiness}&am=${formattedPrice}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=com.phonepe.app;end`
        : phonepeUri;
    } else if (appName === 'Paytm') {
      targetUri = isAndroid
        ? `intent://pay?pa=${encodedUpi}&pn=${encodedBusiness}&am=${formattedPrice}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=net.one97.paytm;end`
        : paytmUri;
    } else if (appName === 'BHIM UPI') {
      targetUri = isAndroid
        ? `intent://pay?pa=${encodedUpi}&pn=${encodedBusiness}&am=${formattedPrice}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=in.org.npci.upiapp;end`
        : bhimUri;
    } else if (appName === 'CRED') {
      targetUri = isAndroid
        ? `intent://pay?pa=${encodedUpi}&pn=${encodedBusiness}&am=${formattedPrice}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=com.dreamplug.androidapp;end`
        : credUri;
    } else if (appName === 'Amazon Pay') {
      targetUri = isAndroid
        ? `intent://pay?pa=${encodedUpi}&pn=${encodedBusiness}&am=${formattedPrice}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=in.amazon.mShop.android.shopping;end`
        : amazonpayUri;
    } else {
      targetUri = universalUri;
    }

    if (!isMobileDevice) {
      setLaunchNotice(
        `💻 संगणक/लॅपटॉपवर थेट ॲप उघडत नाही. UPI ID (${upiId}) क्लिपबोर्डवर कॉपी झाला आहे! तुमच्या मोबाईलमधील PhonePe / GPay द्वारे ₹${formattedPrice} भरणा करा.`
      );
      return;
    }

    setLaunchNotice(
      `📲 ${appName} उघडत आहे (रक्कम: ₹${formattedPrice}). जर ॲप उघडले नाही, तर UPI ID (${upiId}) कॉपी झाला आहे! 'Pay to UPI ID' द्वारे ₹${formattedPrice} पे करा.`
    );

    try {
      const link = document.createElement('a');
      link.href = targetUri;
      link.target = '_top';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Deep link trigger fallback:', err);
      try {
        window.location.href = targetUri;
      } catch (e2) {}
    }

    if (appName !== 'सर्व UPI ॲप्स') {
      setTimeout(() => {
        try {
          const fallbackLink = document.createElement('a');
          fallbackLink.href = universalUri;
          fallbackLink.target = '_top';
          fallbackLink.rel = 'noopener noreferrer';
          document.body.appendChild(fallbackLink);
          fallbackLink.click();
          document.body.removeChild(fallbackLink);
        } catch (e) {}
      }, 1200);
    }
  };

  // Check if there is an existing request for this target profile
  const existingReq = payPerContactRequests.find(
    r =>
      r.userId === (currentUser?.id || 'guest') &&
      r.targetProfileId === selectedProfileForUnlock.id
  );

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Strict 12-Digit Numeric UTR Input Handler & Live Validation
  const handleUtrChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    setUtrNumber(numericVal);
    setIsUtrDuplicate(false);
    setErrorMsg('');

    if (numericVal.length === 12) {
      // Live check in local context first
      const existsInContext =
        payPerContactRequests.some(r => r.utrNumber === numericVal) ||
        paymentRequests.some(r => r.utrNumber === numericVal) ||
        profiles.some(p => p.paymentUtr === numericVal);

      if (existsInContext) {
        setIsUtrDuplicate(true);
        setErrorMsg('⚠️ हा UTR क्रमांक आधीच वापरला गेला आहे (Duplicate UTR). कृपया नवीन खरी पावती सबमिट करा.');
        return;
      }

      // Check backend endpoint
      try {
        setIsUtrChecking(true);
        const res = await fetch(`/api/payment/check-utr/${numericVal}`);
        const data = await res.json();
        if (data.success && data.is_duplicate) {
          setIsUtrDuplicate(true);
          setErrorMsg('⚠️ हा UTR क्रमांक सर्व्हरवर आधीच नोंदवला गेला आहे (Duplicate UTR).');
        }
      } catch (err) {
        console.warn('Backend UTR check skipped:', err);
      } finally {
        setIsUtrChecking(false);
      }
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeCheck = validateFileSize(file);
      if (!sizeCheck.valid) {
        setErrorMsg(sizeCheck.errorMsg || 'फाइल साइज खूप मोठी आहे.');
        return;
      }

      setScreenshotFile(file);
      const localPreview = URL.createObjectURL(file);
      setScreenshotPreview(localPreview);
      setErrorMsg('');

      try {
        setIsUploading(true);
        const res = await uploadToCloudinary(file);
        if (res?.url) {
          setScreenshotUrl(res.url);
        }
      } catch (err) {
        console.warn('Cloudinary upload fallback to local preview:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUtr = utrNumber.trim().replace(/[^0-9]/g, '');
    if (!cleanUtr || cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('कृपया बँक पावतीतील बरोबर १२-अंकी numeric UTR / Transaction ID नंबर टाकावा.');
      return;
    }

    if (isUtrDuplicate) {
      setErrorMsg('हा UTR क्रमांक आधीच वापरलेला आहे. कृपया नवीन खरी पावती किंवा योग्य UTR सबमिट करा.');
      return;
    }

    let finalScreenshot = screenshotUrl;
    if (screenshotFile && !finalScreenshot) {
      try {
        const uploadRes = await uploadToCloudinary(screenshotFile);
        if (uploadRes?.url) finalScreenshot = uploadRes.url;
      } catch (e) {
        finalScreenshot = screenshotPreview || '';
      }
    }

    addPayPerContactRequest({
      userId: currentUser?.id || 'guest-' + Date.now(),
      userName: currentUser?.fullName || 'पाहुणे युझर',
      userMobile: currentUser?.mobile || '+91 99000 00000',
      targetProfileId: selectedProfileForUnlock.id,
      targetProfileName: selectedProfileForUnlock.fullName,
      targetProfileMobile: selectedProfileForUnlock.mobile,
      amount: unlockFee,
      utrNumber: cleanUtr,
      screenshotUrl: finalScreenshot || screenshotPreview || undefined
    });

    setSubmitted(true);
  };

  const handleClose = () => {
    setIsContactUnlockModalOpen(false);
    setSelectedProfileForUnlock(null);
    setUtrNumber('');
    setScreenshotUrl('');
    setScreenshotPreview(null);
    setScreenshotFile(null);
    setSubmitted(false);
    setErrorMsg('');
    setIsUtrDuplicate(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-amber-50 rounded-2xl shadow-2xl border-2 border-amber-300/80 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-[#A71930] text-amber-100 px-6 py-4 flex items-center justify-between border-b border-amber-300/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-300/40">
              <PhoneCall className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight text-white">
                संपर्क क्रमांक अन-लॉक करा
              </h3>
              <p className="text-xs text-amber-200">
                Unlock Contact Number (Pay Per Contact)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-amber-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Target Profile Card Banner */}
          <div className="bg-gradient-to-r from-amber-100/80 to-rose-50 p-3.5 rounded-xl border border-amber-200 flex items-center gap-3.5 shadow-sm">
            <img
              src={
                selectedProfileForUnlock.photos[0] ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
              }
              alt={selectedProfileForUnlock.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#A71930] shadow"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 break-words text-base">
                {selectedProfileForUnlock.fullName}
              </h4>
              <p className="text-xs text-slate-600">
                {selectedProfileForUnlock.district} • {selectedProfileForUnlock.education}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#A71930] bg-white px-2 py-0.5 rounded-full border border-amber-300">
                <Lock className="w-3 h-3" />
                <span>शुल्क: ₹{unlockFee} फक्त</span>
              </div>
            </div>
          </div>

          {/* If Offer Mode or Disable Payments is active */}
          {(siteConfig?.isOfferModeEnabled || siteConfig?.disableAllPaymentsInOfferMode) ? (
            <div className="bg-[#FFFDF5] border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-4 shadow-lg">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <ShieldCheck className="w-8 h-8 text-emerald-600 animate-bounce" />
              </div>
              <h4 className="text-xl font-black text-emerald-800">
                🎁 विशेष सण / नवीन ऑफर चालू आहे!
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                {siteConfig?.offerModeText || 'सध्या सर्व सदस्यांसाठी संपर्क क्रमांक अनलॉक आणि पेमेंट ऑनलाईन पूर्णपणे मोफत ठेवण्यात आले आहे.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  unlockContact(selectedProfileForUnlock.id);
                  alert(`🎉 ${selectedProfileForUnlock.fullName} यांचा संपर्क क्रमांक मोफत अन-लॉक झाला आहे!`);
                  handleClose();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-extrabold text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition cursor-pointer border border-emerald-300"
              >
                <span>🎉 १-क्लिकवर मोफत अन-लॉक करा</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : submitted || (existingReq && existingReq.status === 'pending') ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                पडताळणी प्रलंबित (Pending Approval)
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                तुमची <strong>₹{unlockFee}</strong> संपर्क अनलॉक विनंती प्राप्त झाली आहे. यूटीआर (UTR) क्रमांकाची पडताळणी केल्यानंतर ॲडमिन कडून ५ ते १० मिनिटांत संपर्क क्रमांक थेट दिसू लागेल.
              </p>
              <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs text-left space-y-1">
                <p><strong>लक्ष्य नाव:</strong> {selectedProfileForUnlock.fullName}</p>
                <p><strong>UTR नं:</strong> {utrNumber || existingReq?.utrNumber}</p>
                <p><strong>स्थिती:</strong> <span className="text-amber-700 font-bold">ॲडमिन अप्रूव्हल प्रलंबित</span></p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-[#A71930] text-amber-100 font-bold rounded-xl shadow hover:bg-[#800C1E] transition cursor-pointer"
              >
                समजले / बंद करा
              </button>
            </div>
          ) : (
            <>
              {/* Payment Steps */}
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#A71930] uppercase tracking-wide flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>पायरी १: मोबाईल ॲप्स किंवा QR कोडने पे करा</span>
                    </span>
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      ₹{unlockFee} ऑनलाईन पे
                    </span>
                  </div>

                  {/* 1-Click Direct UPI App Launchers */}
                  <div className="space-y-2 pt-1">
                    {launchingApp && (
                      <div className="text-center text-xs font-bold text-emerald-700 bg-emerald-50 py-1 rounded-lg animate-pulse">
                        🚀 {launchingApp} ॲप थेट उघडत आहे...
                      </div>
                    )}

                    {/* Universal Pay Button */}
                    <button
                      type="button"
                      onClick={() => handleLaunchApp('सर्व UPI ॲप्स')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-amber-300 animate-bounce" />
                      <span>📱 कोणत्याही UPI ॲपद्वारे भरा (Pay ₹{unlockFee})</span>
                    </button>

                    {/* Launch Guidance Banner */}
                    {launchNotice && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-xs font-bold leading-relaxed flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
                        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p>{launchNotice}</p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-amber-300 font-extrabold text-[#800C1E]">
                              {upiId}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="text-[11px] bg-[#800C1E] text-amber-100 px-2 py-0.5 rounded font-bold hover:bg-[#A71930] transition"
                            >
                              {isCopied ? '✓ कॉपी झाले!' : 'कॉपी करा'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* App Icons Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('PhonePe')}
                        className="p-2 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                          पे
                        </div>
                        <span className="text-xs font-bold text-purple-900">PhonePe</span>
                        <span className="text-[9px] text-purple-600">फोन पे</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLaunchApp('Google Pay')}
                        className="p-2 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                          G
                        </div>
                        <span className="text-xs font-bold text-blue-900">Google Pay</span>
                        <span className="text-[9px] text-blue-600">गुगल पे</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLaunchApp('Paytm')}
                        className="p-2 bg-sky-50/70 hover:bg-sky-100 border border-sky-200 hover:border-sky-500 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px]">
                          ₹
                        </div>
                        <span className="text-xs font-bold text-sky-900">Paytm</span>
                        <span className="text-[9px] text-sky-600">पेटीएम</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
                    {/* QR Code Container */}
                    <div className="p-2 bg-white rounded-xl border-2 border-amber-300 shadow-md text-center flex-shrink-0">
                      <img
                        src={qrCodeUrl}
                        alt="UPI Payment QR Code"
                        className="w-28 h-28 object-contain mx-auto"
                      />
                      <span className="text-[9px] font-bold text-slate-500 mt-0.5 block">
                        QR कोड स्कॅन करा
                      </span>
                    </div>

                    {/* UPI ID Copy */}
                    <div className="flex-1 space-y-2 w-full">
                      <p className="text-xs font-medium text-slate-600">
                        किंवा थेट UPI ID वर ₹{unlockFee} पाठवा:
                      </p>
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-300">
                        <span className="font-mono text-xs font-bold text-slate-800 break-all flex-1">
                          {upiId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold flex items-center gap-1 shadow transition cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>कॉपी झाले</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>कॉपी</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium">
                        💡 पेमेंट केल्यानंतर १२ अंकी UTR क्रमांक खाली टाकून सबमिट करा.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Step 2 */}
                <form onSubmit={handleSubmitUtr} className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-3">
                    <span className="text-xs font-bold text-[#A71930] uppercase tracking-wide">
                      पायरी २: UTR नंबर प्रविष्ट करा
                    </span>

                    {errorMsg && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          १२-अंकी UTR / Transaction ID <span className="text-rose-600">*</span>
                        </label>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {utrNumber.length}/12 अंक
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={handleUtrChange}
                          placeholder="उदा. 402918274011"
                          maxLength={12}
                          required
                          className={`w-full px-3 py-2.5 border rounded-xl font-mono text-sm tracking-wider focus:outline-none transition ${
                            isUtrDuplicate
                              ? 'border-rose-500 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-400'
                              : utrNumber.length === 12
                              ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:ring-2 focus:ring-emerald-400'
                              : 'border-slate-300 focus:ring-2 focus:ring-[#A71930] focus:border-[#A71930]'
                          }`}
                        />
                        {isUtrChecking && (
                          <div className="absolute right-3 top-2.5">
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                          </div>
                        )}
                        {utrNumber.length === 12 && !isUtrDuplicate && !isUtrChecking && (
                          <div className="absolute right-3 top-2.5 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        पेमेंट पावती स्क्रीनशॉट (Screenshot Upload)
                      </label>
                      <div className="space-y-2">
                        <label className="w-full px-3 py-2.5 border-2 border-dashed border-amber-300 rounded-xl hover:bg-amber-50/50 cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-slate-700 transition">
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                              <span>अपलोड होत आहे...</span>
                            </>
                          ) : screenshotPreview ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700">स्क्रीनशॉट जोडला गेला आहे</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-amber-600" />
                              <span>स्क्रीनशॉट निवडा (Upload Receipt)</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="hidden"
                          />
                        </label>
                        {screenshotPreview && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-300 shadow-sm mx-auto">
                            <img
                              src={screenshotPreview}
                              alt="Receipt preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUtrChecking || isUtrDuplicate || utrNumber.length !== 12 || isUploading}
                    className="w-full py-3 bg-gradient-to-r from-[#A71930] to-[#800C1E] disabled:opacity-50 text-amber-100 font-extrabold rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
                  >
                    <span>₹{unlockFee} UTR सबमिट करा</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>
                </form>
              </div>
            </>
          )}

          <div className="pt-2 text-center border-t border-slate-200 text-[11px] text-slate-500">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>१००% सुरक्षित वंजारीजोडी पे-पर-काँटॅक्ट सिस्टीम</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
