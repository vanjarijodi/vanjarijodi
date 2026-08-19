import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Plan, MembershipTier } from '../types';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import {
  X,
  ShieldCheck,
  QrCode,
  Upload,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Clock,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  FileText,
  CreditCard,
  Lock,
  Info,
} from 'lucide-react';

interface DynamicUpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

export const DynamicUpiPaymentModal: React.FC<DynamicUpiPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const {
    currentUser,
    paymentConfig,
    siteConfig,
    plansList,
    selectedPlanForPayment,
    addPaymentRequest,
    addNotification,
    logActivity,
    updateMemberTier,
    setCurrentView,
  } = useApp();

  // Active Plan Resolution
  const activePlan =
    plan ||
    selectedPlanForPayment ||
    plansList.find((p) => p.id === 'welcome_offer' && p.isActive !== false) ||
    plansList.find((p) => p.isActive !== false) ||
    plansList[0];

  // Steps: 'checkout' | 'waiting' | 'approved' | 'rejected'
  const [step, setStep] = useState<'checkout' | 'waiting' | 'approved' | 'rejected'>('checkout');

  // Intent Data State
  const [orderId, setOrderId] = useState<string>('');
  const [upiIntentUri, setUpiIntentUri] = useState<string>('');
  const [gpayUri, setGpayUri] = useState<string>('');
  const [phonepeUri, setPhonepeUri] = useState<string>('');
  const [paytmUri, setPaytmUri] = useState<string>('');
  const [bhimUri, setBhimUri] = useState<string>('');
  const [credUri, setCredUri] = useState<string>('');
  const [amazonpayUri, setAmazonpayUri] = useState<string>('');
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [upiId, setUpiId] = useState<string>(siteConfig?.paymentUpiId || 'mahesh.hange1@ybl');
  const [businessName, setBusinessName] = useState<string>(siteConfig?.paymentPayeeName || 'Vanjari Jodi Matrimony');
  const [isLoadingIntent, setIsLoadingIntent] = useState<boolean>(false);
  const [activeAppLaunching, setActiveAppLaunching] = useState<string | null>(null);

  // Countdown Timer State (10:00 = 600 seconds) with real-world timestamp drift compensation
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const deadlineRef = useRef<number>(Date.now() + 600 * 1000);

  // Form State
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isUtrChecking, setIsUtrChecking] = useState<boolean>(false);
  const [isUtrDuplicate, setIsUtrDuplicate] = useState<boolean>(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [userMobile, setUserMobile] = useState<string>(
    currentUser?.mobile || currentUser?.mobileNumber || currentUser?.whatsappNumber || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active Submitted Request ID for Polling
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const [adminNote, setAdminNote] = useState<string>('');
  const [approvedDetails, setApprovedDetails] = useState<any>(null);

  // Toast / Copy Feedback & Deep Link Notice
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [upiLaunchNotice, setUpiLaunchNotice] = useState<string | null>(null);

  // Reset & Initialize on Open
  useEffect(() => {
    if (isOpen && activePlan) {
      setStep('checkout');
      setUtrNumber('');
      setUtrError(null);
      setIsUtrDuplicate(false);
      setScreenshotUrl('');
      setScreenshotPreview('');
      setScreenshotFile(null);
      setSubmitError(null);
      setSubmittedRequestId(null);
      deadlineRef.current = Date.now() + 600 * 1000;
      setTimeLeft(600);
      fetchPaymentIntent();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, activePlan?.id, paymentConfig?.upiId, paymentConfig?.payeeName, paymentConfig?.amount]);

  // Countdown Timer Engine (Handles tab backgrounding & mobile app switching seamlessly)
  useEffect(() => {
    if (!isOpen || step !== 'checkout') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const updateRemaining = () => {
      const remainingSecs = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remainingSecs);
      if (remainingSecs <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    updateRemaining();
    timerRef.current = setInterval(updateRemaining, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, step]);

  // Fetch Dynamic UPI Intent & QR from Backend
  const fetchPaymentIntent = async () => {
    if (!activePlan) return;
    const targetUpi = paymentConfig?.upiId || siteConfig?.paymentUpiId || 'hangemahesh@ybl';
    const targetBusiness = paymentConfig?.payeeName || siteConfig?.paymentPayeeName || 'Mahesh Hange';
    const targetPrice = activePlan ? activePlan.price : (paymentConfig?.amount || '199.00');
    const transactionNote = paymentConfig?.transactionNote || `VanjariJodi_${activePlan.id}`;

    // Instant client-side fallback generation
    const fallbackUniversal = `upi://pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent(targetBusiness)}&am=${encodeURIComponent(targetPrice)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const fallbackPhonePe = `phonepe://pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent(targetBusiness)}&am=${encodeURIComponent(targetPrice)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const fallbackGPay = `tez://upi/pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent(targetBusiness)}&am=${encodeURIComponent(targetPrice)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const fallbackPaytm = `paytmmp://pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent(targetBusiness)}&am=${encodeURIComponent(targetPrice)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const fallbackBhim = `bhim://pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent(targetBusiness)}&am=${encodeURIComponent(targetPrice)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const fallbackCred = `cred://upi/pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent(targetBusiness)}&am=${encodeURIComponent(targetPrice)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const fallbackAmazonPay = `amazonpay://upi/pay?pa=${encodeURIComponent(targetUpi)}&pn=${encodeURIComponent(targetBusiness)}&am=${encodeURIComponent(targetPrice)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

    setUpiIntentUri(fallbackUniversal);
    setPhonepeUri(fallbackPhonePe);
    setGpayUri(fallbackGPay);
    setPaytmUri(fallbackPaytm);
    setBhimUri(fallbackBhim);
    setCredUri(fallbackCred);
    setAmazonpayUri(fallbackAmazonPay);
    setUpiId(targetUpi);
    setBusinessName(targetBusiness);
    setDynamicQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(fallbackUniversal)}`);

    try {
      setIsLoadingIntent(true);
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id || 'guest-user',
          plan_id: activePlan.id,
          plan_name: activePlan.nameMr || activePlan.name,
          amount: activePlan.price,
          upi_id: targetUpi,
          business_name: targetBusiness,
          note: transactionNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setUpiIntentUri(data.upiIntentUri || fallbackUniversal);
        setPhonepeUri(data.phonepeUri || fallbackPhonePe);
        setGpayUri(data.gpayUri || fallbackGPay);
        setPaytmUri(data.paytmUri || fallbackPaytm);
        setBhimUri(data.bhimUri || fallbackBhim);
        setCredUri(data.credUri || fallbackCred);
        setAmazonpayUri(data.amazonpayUri || fallbackAmazonPay);
        setDynamicQrUrl(data.dynamicQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(data.upiIntentUri || fallbackUniversal)}`);
        setUpiId(data.targetUpiId || targetUpi);
        setBusinessName(data.businessName || targetBusiness);
      }
    } catch (err) {
      console.error('Error fetching payment intent:', err);
    } finally {
      setIsLoadingIntent(false);
    }
  };

  // Launch Specific UPI App with auto-copy, desktop check, and safe trigger
  const handleLaunchUpiApp = (uri: string, appName: string) => {
    if (!uri) return;

    // Auto-copy UPI ID to clipboard as a fail-proof fallback
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(upiId);
      }
    } catch (e) {
      console.log('Clipboard copy error:', e);
    }

    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
    setActiveAppLaunching(appName);
    setTimeout(() => setActiveAppLaunching(null), 4000);

    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isMobileDevice) {
      setUpiLaunchNotice(
        `💻 संगणक/लॅपटॉपवर थेट ॲप उघडत नाही. UPI ID (${upiId}) ऑटो-कॉपी झाला आहे! तुमच्या मोबाईलमधील PhonePe / GPay ने डावीकडील QR कोड स्कॅन करा किंवा UPI ID टाकून भरणा करा.`
      );
      return;
    }

    setUpiLaunchNotice(
      `📲 ${appName} उघडत आहे... जर ॲप आपोआप उघडले नाही, तर UPI ID (${upiId}) क्लिपबोर्डवर कॉपी झाला आहे. तुमच्या मोबाईलमधील PhonePe / GPay / Paytm उघडून 'Pay to UPI ID' द्वारे भरणा करा.`
    );

    try {
      // Create hidden element to safely trigger deep link without mutating window.location or showing ERR_UNKNOWN_URL_SCHEME
      const link = document.createElement('a');
      link.href = uri;
      link.target = '_top';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Deep link trigger fallback:', err);
      try {
        window.open(uri, '_blank');
      } catch (e2) {
        // ignore
      }
    }
  };

  // Copy UPI ID with Toast
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Strict 12-Digit Numeric UTR Input Handler & Live Validation
  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric digits, maximum 12 characters
    const numericVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    setUtrNumber(numericVal);
    setIsUtrDuplicate(false);

    if (numericVal.length === 0) {
      setUtrError(null);
    } else if (numericVal.length < 12) {
      setUtrError(`१२-अंकी UTR क्रमांक आवश्यक आहे (${numericVal.length}/12 अंक भरले)`);
    } else if (numericVal.length === 12) {
      setUtrError(null);
      // Trigger Live Duplicate Check
      checkUtrDuplicate(numericVal);
    }
  };

  // Live UTR Uniqueness Check
  const checkUtrDuplicate = async (utr: string) => {
    if (utr.length !== 12) return;
    try {
      setIsUtrChecking(true);
      const res = await fetch(`/api/payment/check-utr/${utr}`);
      const data = await res.json();
      if (data.success && data.is_duplicate) {
        setIsUtrDuplicate(true);
        setUtrError('⚠️ हा UTR क्रमांक आधीच वापरला गेला आहे (Duplicate UTR). कृपया नवीन खरी पावती सबमिट करा.');
      } else {
        setIsUtrDuplicate(false);
      }
    } catch (err) {
      console.error('Error verifying UTR uniqueness:', err);
    } finally {
      setIsUtrChecking(false);
    }
  };

  // Screenshot Upload Handler
  const handleFileSelect = async (file: File) => {
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) {
      setSubmitError(sizeCheck.errorMsg || 'फाइल साइज खूप मोठी आहे.');
      return;
    }

    setScreenshotFile(file);
    const localUrl = URL.createObjectURL(file);
    setScreenshotPreview(localUrl);
    setSubmitError(null);

    // Upload to Cloudinary in background
    try {
      setIsUploading(true);
      const uploaded = await uploadToCloudinary(file);
      if (uploaded && uploaded.url) {
        setScreenshotUrl(uploaded.url);
      }
    } catch (err) {
      console.warn('Direct Cloudinary upload failed, local preview will be used:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Payment Request for Verification
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Strict Validations
    if (!utrNumber || utrNumber.length !== 12 || !/^\d{12}$/.test(utrNumber)) {
      setUtrError('कृपया बँक पावतीतील बरोबर १२-अंकी UTR / Transaction ID नंबर टाकावा.');
      return;
    }

    if (isUtrDuplicate) {
      setSubmitError('हा UTR क्रमांक आधीच वापरलेला आहे. कृपया नवीन खरी पावती किंवा योग्य UTR सबमिट करा.');
      return;
    }

    try {
      setIsSubmitting(true);

      let finalScreenshotUrl = screenshotUrl;
      // If screenshot file selected but not uploaded yet, upload now
      if (screenshotFile && !finalScreenshotUrl) {
        try {
          const res = await uploadToCloudinary(screenshotFile);
          if (res?.url) finalScreenshotUrl = res.url;
        } catch (uploadErr) {
          console.warn('Screenshot upload skipped:', uploadErr);
        }
      }

      // Backend API Call
      const res = await fetch('/api/payment/submit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id || `guest-${Date.now()}`,
          user_name: currentUser?.fullName || 'Member',
          user_mobile: userMobile || currentUser?.mobile || '',
          plan_id: activePlan.id,
          plan_name: activePlan.nameMr || activePlan.name,
          amount: activePlan.price,
          utr_number: utrNumber,
          screenshot_url: finalScreenshotUrl || screenshotPreview,
          payment_method: 'upi_intent',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409 || data.isDuplicate) {
          setIsUtrDuplicate(true);
          setUtrError(data.error || 'हा UTR नंबर आधीच वापरला गेला आहे.');
        } else {
          setSubmitError(data.error || 'पेमेंट सबमिट करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
        }
        setIsSubmitting(false);
        return;
      }

      // Context Sync
      addPaymentRequest({
        userId: currentUser?.id || `guest-${Date.now()}`,
        userName: currentUser?.fullName || 'Member',
        userMobile: userMobile || currentUser?.mobile || '',
        planId: activePlan.id as MembershipTier,
        planName: activePlan.nameMr || activePlan.name,
        amount: activePlan.price,
        utrNumber: utrNumber,
        screenshotUrl: finalScreenshotUrl || screenshotPreview,
        paymentMethod: 'upi_intent',
        adminNote: '',
      });

      logActivity(
        'UPI Payment Proof Submitted',
        `सदस्याने ${activePlan.nameMr || activePlan.name} (₹${activePlan.price}) साठी १२-अंकी UTR: ${utrNumber} सबमिट केला.`,
        currentUser?.fullName || 'Member'
      );

      // Transition to Waiting Screen Polling
      setSubmittedRequestId(data.requestId || data.paymentRequest?.id);
      setStep('waiting');
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setSubmitError('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Polling Engine (Polls `/api/payment/status/:id` every 5 seconds)
  useEffect(() => {
    if (step !== 'waiting' || !submittedRequestId) return;

    const pollInterval = setInterval(async () => {
      try {
        setPollCount((prev) => prev + 1);
        const res = await fetch(`/api/payment/status/${submittedRequestId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.success) {
          if (data.status === 'approved') {
            clearInterval(pollInterval);
            handlePaymentApproved(data);
          } else if (data.status === 'rejected') {
            clearInterval(pollInterval);
            setAdminNote(data.admin_note || 'पेमेंट माहिती अमान्य झाली.');
            setStep('rejected');
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [step, submittedRequestId]);

  // Trigger Confetti Celebration & UI Activation
  const handlePaymentApproved = (data: any) => {
    setApprovedDetails(data);
    setStep('approved');

    // Launch Confetti Cannon
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#800C1E', '#D97706', '#10B981', '#3B82F6', '#EC4899'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } catch (e) {
      console.log('Confetti error:', e);
    }

    // Sync App Context User Tier
    if (currentUser) {
      updateMemberTier(currentUser.id, activePlan.id as MembershipTier, undefined, {
        paidAt: new Date().toISOString(),
        paymentApprovedAt: new Date().toISOString(),
        paymentAmount: activePlan.price,
        paymentUtr: utrNumber,
        paymentPlanName: activePlan.nameMr || activePlan.name,
      });

      if (typeof addNotification === 'function') {
        addNotification({
          userId: currentUser.id,
          title: '🎉 मेंबरशिप यशस्वीरित्या सुरू झाली!',
          titleMr: '🎉 प्रीमियम मेंबरशिप ॲक्टिव्हेट झाली!',
          message: `${activePlan.nameMr || activePlan.name} प्लॅन (₹${activePlan.price}) मंजूर झाला आहे!`,
          messageMr: `${activePlan.nameMr || activePlan.name} प्लॅन (₹${activePlan.price}) मंजूर झाला आहे!`,
          type: 'approval',
          read: false,
        });
      }
    }
  };

  // Format MM:SS for Timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !activePlan) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white px-6 py-5 flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <CreditCard className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold font-serif text-white tracking-wide">
                  सुरक्षित UPI पेमेंट गेटवे
                </h3>
                <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 font-medium">
                  Dynamic UPI
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                Google Pay • PhonePe • Paytm • Any UPI App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: CHECKOUT SCREEN (Dynamic Intent, QR, 10-Min Timer, Form) */}
        {/* ------------------------------------------------------------- */}
        {step === 'checkout' && (
          <div className="p-5 sm:p-7 space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Plan Summary Card & Countdown Timer */}
            <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-900 uppercase bg-amber-200/60 px-2.5 py-0.5 rounded-md">
                  निवडलेला सबस्क्रिप्शन प्लॅन
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-1">
                  {activePlan.nameMr || activePlan.name}
                </h4>
                <p className="text-xs text-gray-600">
                  {activePlan.durationLabelMr || activePlan.featuresMr?.[0] || 'सर्व वधू-वर प्रोफाइल्स व संपर्क अनलॉक'}
                </p>
              </div>

              {/* Amount & Timer */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">एकूण देय रक्कम</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#800C1E]">
                    ₹{activePlan.price}
                  </span>
                </div>

                {/* 10:00 Countdown Badge */}
                <div
                  className={`flex flex-col items-center justify-center px-3.5 py-2 rounded-xl border ${
                    timeLeft < 120
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-white border-amber-200 text-amber-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-mono text-sm font-black tracking-wider">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-gray-500">
                    {timeLeft === 0 ? 'मुदत संपली' : 'वेळ शिल्लक'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer Expired Warning */}
            {timeLeft === 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between text-rose-800 text-xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>पेमेंट सेशनची वेळ संपली आहे. कृपया रिफ्रेश करून नवीन क्यूआर मिळवा.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTimeLeft(600);
                    fetchPaymentIntent();
                  }}
                  className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-700 transition flex items-center space-x-1 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>रिफ्रेश करा</span>
                </button>
              </div>
            )}

            {/* UPI Payment Methods: Mobile Intent & Desktop QR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left Column: Dynamic QR Code for Desktop/Scanning */}
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-center flex flex-col items-center">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2.5">
                  <QrCode className="w-4 h-4 text-[#800C1E]" />
                  <span>कोणत्याही UPI ॲपने स्कॅन करा (Scan & Pay)</span>
                </div>

                {/* QR Container */}
                <div className="relative p-2.5 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                  {isLoadingIntent ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 text-[#800C1E] animate-spin" />
                      <span className="text-xs text-gray-500 font-medium">QR कोड जनरेट होत आहे...</span>
                    </div>
                  ) : (siteConfig?.paymentQrCodeUrl || siteConfig?.paymentQrUrl || dynamicQrUrl) ? (
                    <img
                      src={siteConfig?.paymentQrCodeUrl || siteConfig?.paymentQrUrl || dynamicQrUrl}
                      alt="UPI Payment QR Code"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      QR कोड उपलब्ध नाही
                    </div>
                  )}

                  {/* Trust Badge inside QR */}
                  <div className="mt-1.5 flex items-center justify-center space-x-1 text-[11px] text-gray-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>NPCI / 100% Verified UPI</span>
                  </div>
                </div>

                {/* Copy UPI ID Section */}
                <div className="w-full mt-3.5 pt-3 border-t border-slate-200">
                  <span className="text-[11px] text-gray-500 block mb-1">
                    किंवा थेट UPI आयडीवर पाठवा:
                  </span>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-inner">
                    <span className="font-mono text-xs font-bold text-slate-800 truncate select-all">
                      {upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="ml-2 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center space-x-1 transition flex-shrink-0"
                    >
                      {copiedToast ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-emerald-800">कॉपी झाले!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>कॉपी करा</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Direct Mobile UPI Intent Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>मोबाईल ॲप्स थेट ओपन करा (१-क्लिक पेमेंट):</span>
                  </div>
                  {activeAppLaunching && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                      {activeAppLaunching} उघडत आहे...
                    </span>
                  )}
                </div>

                {/* Universal Deep Link Button */}
                <button
                  type="button"
                  onClick={() => handleLaunchUpiApp(upiIntentUri, 'सर्व UPI ॲप्स')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition transform active:scale-98"
                >
                  <Smartphone className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span>📱 कोणत्याही UPI ॲपद्वारे भरा (Pay ₹{activePlan.price})</span>
                </button>

                {/* Live Launch Status / Copy Guidance Banner */}
                {upiLaunchNotice && (
                  <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-xl text-xs text-amber-950 font-bold leading-relaxed flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p>{upiLaunchNotice}</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-amber-300 font-extrabold text-[#800C1E]">
                          {upiId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-[11px] bg-[#800C1E] text-amber-100 px-2 py-0.5 rounded font-bold hover:bg-[#A71930] transition"
                        >
                          {copiedToast ? '✓ आयडी कॉपी झाला!' : 'आयडी कॉपी करा'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Granular Individual App Launch Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {/* PhonePe */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp(phonepeUri || upiIntentUri, 'PhonePe')}
                    className="p-2.5 bg-white hover:bg-purple-50/80 border border-purple-200 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95 group text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition">
                      पे
                    </div>
                    <span className="text-xs font-bold text-purple-900 group-hover:text-purple-700">
                      PhonePe
                    </span>
                    <span className="text-[9px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.2 rounded-full">
                      फोन पे
                    </span>
                  </button>

                  {/* Google Pay */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp(gpayUri || upiIntentUri, 'Google Pay')}
                    className="p-2.5 bg-white hover:bg-blue-50/80 border border-blue-200 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95 group text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition">
                      G
                    </div>
                    <span className="text-xs font-bold text-blue-900 group-hover:text-blue-700">
                      Google Pay
                    </span>
                    <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded-full">
                      गुगल पे
                    </span>
                  </button>

                  {/* Paytm */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp(paytmUri || upiIntentUri, 'Paytm')}
                    className="p-2.5 bg-white hover:bg-sky-50/80 border border-sky-200 hover:border-sky-500 rounded-xl flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95 group text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition">
                      ₹
                    </div>
                    <span className="text-xs font-bold text-sky-900 group-hover:text-sky-700">
                      Paytm
                    </span>
                    <span className="text-[9px] text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.2 rounded-full">
                      पेटीएम
                    </span>
                  </button>

                  {/* BHIM UPI */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp(bhimUri || upiIntentUri, 'BHIM UPI')}
                    className="p-2.5 bg-white hover:bg-emerald-50/80 border border-emerald-200 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95 group text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition">
                      भी
                    </div>
                    <span className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">
                      BHIM UPI
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-full">
                      भीम
                    </span>
                  </button>

                  {/* CRED */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp(credUri || upiIntentUri, 'CRED')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95 group text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition">
                      C
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-slate-700">
                      CRED
                    </span>
                    <span className="text-[9px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.2 rounded-full">
                      क्रेड
                    </span>
                  </button>

                  {/* Amazon Pay */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp(amazonpayUri || upiIntentUri, 'Amazon Pay')}
                    className="p-2.5 bg-white hover:bg-amber-50/80 border border-amber-200 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95 group text-center"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow group-hover:scale-105 transition">
                      a
                    </div>
                    <span className="text-xs font-bold text-amber-900 group-hover:text-amber-700">
                      Amazon Pay
                    </span>
                    <span className="text-[9px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded-full">
                      ॲमेझॉन
                    </span>
                  </button>
                </div>

                {/* 3 Step Instructions */}
                <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <p className="font-bold flex items-center space-x-1 text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>३ सोप्या पायऱ्यांत पेमेंट पूर्ण करा:</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700 leading-relaxed">
                    <li>तुमच्या मोबाईलमधील ॲपचे बटण दाबा (थेट ॲप ओपन होईल आणि रक्कम दिसेल).</li>
                    <li>UPI पिन टाकून ₹{activePlan.price} पेमेंट करा.</li>
                    <li>पेमेंट झाल्यावर बँक मेसेज / ॲपमधील १२-अंकी UTR नंबर खाली टाकून सबमिट करा.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* PAYMENT VERIFICATION SUBMISSION FORM */}
            {/* ------------------------------------------------------------- */}
            <form onSubmit={handleSubmitPayment} className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#800C1E] text-white text-xs font-bold flex items-center justify-center">
                  २
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  पेमेंट झाल्यावर पावतीची माहिती भरा (UTR Verification)
                </h4>
              </div>

              {/* UTR Input Field with Strict 12-Digit Numeric Validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-800 flex items-center space-x-1">
                    <span>१२-अंकी UTR / Transaction ID (कंपलसरी)</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      utrNumber.length === 12
                        ? 'text-emerald-600'
                        : utrNumber.length > 0
                        ? 'text-amber-600'
                        : 'text-gray-400'
                    }`}
                  >
                    ({utrNumber.length}/12 अंक)
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    value={utrNumber}
                    onChange={handleUtrChange}
                    placeholder="उदा. 423819203841 (12 Digits Only)"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl font-mono text-sm tracking-wider font-bold transition focus:bg-white focus:outline-none ${
                      isUtrDuplicate
                        ? 'border-rose-400 text-rose-800 bg-rose-50'
                        : utrNumber.length === 12
                        ? 'border-emerald-400 text-emerald-900 bg-emerald-50/40'
                        : 'border-slate-300 focus:border-[#800C1E]'
                    }`}
                  />
                  {isUtrChecking ? (
                    <div className="absolute right-3.5 top-3.5">
                      <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                    </div>
                  ) : utrNumber.length === 12 && !isUtrDuplicate ? (
                    <div className="absolute right-3.5 top-3.5 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : null}
                </div>

                {utrError && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{utrError}</span>
                  </p>
                )}
                {!utrError && utrNumber.length === 12 && (
                  <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>वैध १२-अंकी UTR क्रमांक नोंदवला गेला.</span>
                  </p>
                )}
              </div>

              {/* Mobile Number & Optional Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Mobile Number */}
                <div>
                  <label className="text-xs font-bold text-gray-800 block mb-1">
                    तुमचा संपर्क / व्हॉट्सॲप नंबर
                  </label>
                  <input
                    type="tel"
                    value={userMobile}
                    onChange={(e) => setUserMobile(e.target.value)}
                    placeholder="१०-अंकी मोबाईल नंबर"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:border-[#800C1E] focus:outline-none"
                  />
                </div>

                {/* Screenshot Upload Receipt */}
                <div>
                  <label className="text-xs font-bold text-gray-800 block mb-1">
                    स्क्रीनशॉट पावती (पर्यायी)
                  </label>
                  <label className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-amber-400 rounded-xl cursor-pointer transition text-xs font-medium text-gray-700">
                    <div className="flex items-center space-x-2 truncate">
                      <Upload className="w-4 h-4 text-[#800C1E] flex-shrink-0" />
                      <span className="truncate">
                        {screenshotFile ? screenshotFile.name : 'फोटो / स्क्रीनशॉट निवडा'}
                      </span>
                    </div>
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
                    ) : screenshotPreview ? (
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] text-gray-400">JPG/PNG</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || utrNumber.length !== 12 || isUtrDuplicate}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#6A0A19] hover:to-[#8E1428] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>पडताळणी प्रक्रिया सुरू आहे...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-amber-300" />
                    <span>पेमेंट पडताळणीसाठी सबमिट करा (Submit for Approval)</span>
                    <ArrowRight className="w-4 h-4 ml-1 text-amber-300" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 font-medium pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>सुरक्षित व एनक्रिप्टेड ट्रान्झॅक्शन • 24/7 ॲडमिन सपोर्ट</span>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: WAITING & LIVE POLLING SCREEN (Every 5s status check) */}
        {/* ------------------------------------------------------------- */}
        {step === 'waiting' && (
          <div className="p-8 sm:p-10 text-center space-y-6">
            {/* Animated Radar Pulse Scanner */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-[#800C1E]/15 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#800C1E] to-[#A71930] text-white flex items-center justify-center shadow-xl">
                <Loader2 className="w-10 h-10 animate-spin text-amber-300" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="bg-amber-100 text-amber-900 text-xs px-3 py-1 rounded-full font-bold border border-amber-300">
                ⏳ प्रशासक पडताळणी सुरू आहे (Polling Live Status...)
              </span>
              <h4 className="text-xl font-bold font-serif text-gray-900 mt-2">
                तुमची पेमेंट पावती प्राप्त झाली आहे
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                बँक UTR व पावतीची पडताळणी होत असून दर ५ सेकंदाला स्टेटस आपोआप अपडेट होत आहे.
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">विनंती आयडी:</span>
                <span className="font-mono font-bold text-slate-800">{submittedRequestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">UTR / Transaction ID:</span>
                <span className="font-mono font-bold text-emerald-700">{utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">प्लॅन & रक्कम:</span>
                <span className="font-bold text-[#800C1E]">
                  {activePlan.nameMr || activePlan.name} (₹{activePlan.price})
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px] text-gray-500">
                <span>लाइव्ह स्टेटस चेक्स:</span>
                <span>{pollCount} वेळा तपासले</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              प्रशासक मंजुरी देताच स्क्रीनवर अभिनंदन संदेश व मेंबरशिप सुरू होईल.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: CELEBRATION & APPROVED SCREEN (Confetti Activated!) */}
        {/* ------------------------------------------------------------- */}
        {step === 'approved' && (
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white mx-auto flex items-center justify-center shadow-2xl animate-bounce">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>

            <div className="space-y-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs px-3.5 py-1 rounded-full font-black border border-emerald-300 uppercase tracking-wide">
                🎉 APPROVED & ACTIVATED
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-gray-900 mt-2">
                अभिनंदन! तुमचे पेमेंट मंजूर झाले आहे!
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {activePlan.nameMr || activePlan.name} सबस्क्रिप्शन यशस्वीरीत्या सक्रिय झाले असून सर्व वधू-वर संपर्क अनलॉक झाले आहेत.
              </p>
            </div>

            {/* Approved Membership Details */}
            <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-emerald-200 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-2.5 shadow-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">मेंबरशिप प्लॅन:</span>
                <span className="font-bold text-gray-900">{activePlan.nameMr || activePlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">पेड रक्कम:</span>
                <span className="font-black text-[#800C1E]">₹{activePlan.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UTR नंबर:</span>
                <span className="font-mono font-bold text-emerald-800">{utrNumber}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-200/60 font-bold text-emerald-900">
                <span>स्टेटस:</span>
                <span>सक्रिय (Active Premium Member)</span>
              </div>
            </div>

            {/* Go to Profiles / Dashboard CTA Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (typeof setCurrentView === 'function') setCurrentView('profiles');
              }}
              className="w-full max-w-md mx-auto py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 text-base"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>वधू-वर प्रोफाईल्स पाहा (Explore Profiles)</span>
              <ArrowRight className="w-5 h-5 text-amber-300 ml-1" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: REJECTED SCREEN (With Reason & Retry Button) */}
        {/* ------------------------------------------------------------- */}
        {step === 'rejected' && (
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center border-2 border-rose-300">
              <XCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-bold border border-rose-300">
                पेमेंट अमान्य / नाकारले
              </span>
              <h4 className="text-xl font-bold font-serif text-gray-900 mt-2">
                पेमेंट पडताळणी अयशस्वी
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                प्रशासकाने दिलेल्या कारणामुळे ही विनंती मंजूर होऊ शकली नाही:
              </p>
            </div>

            {/* Admin Note Box */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-rose-900 font-medium">
              <p className="font-bold mb-1 flex items-center space-x-1 text-rose-800">
                <ShieldAlert className="w-4 h-4" />
                <span>प्रशासक शेरा (Reason):</span>
              </p>
              <p>{adminNote || 'UTR नंबर बँक खात्याशी जुळला नाही किंवा अस्पष्ट पावती आहे.'}</p>
            </div>

            {/* Retry Button */}
            <button
              type="button"
              onClick={() => {
                setStep('checkout');
                setUtrNumber('');
                setUtrError(null);
                setIsUtrDuplicate(false);
                setTimeLeft(600);
              }}
              className="w-full max-w-md mx-auto py-3.5 px-6 bg-[#800C1E] hover:bg-[#6A0A19] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm"
            >
              <RefreshCw className="w-4 h-4 text-amber-300" />
              <span>पुन्हा नवीन UTR टाकून प्रयत्न करा</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
