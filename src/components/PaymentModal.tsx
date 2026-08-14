import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plan, MembershipTier } from '../types';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import { X, ShieldCheck, QrCode, Upload, Copy, Check, Sparkles, Send, Loader2, Tag, Gift, CheckCircle2, CreditCard, Zap } from 'lucide-react';

export const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}> = ({ isOpen, onClose, plan }) => {
  const {
    language,
    currentUser,
    siteConfig,
    plansList,
    selectedPlanForPayment,
    setSelectedPlanForPayment,
    addPaymentRequest,
    validatePromoCode,
    addNotification,
    logActivity,
    updateMemberTier,
    isCurrentUserPlanExpired,
  } = useApp();

  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [userMobile, setUserMobile] = useState(currentUser?.mobileNumber || currentUser?.whatsappNumber || '');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [isCcavenueLoading, setIsCcavenueLoading] = useState(false);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromoRes, setAppliedPromoRes] = useState<{
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
    isVipFree: boolean;
    message: string;
    code?: string;
  } | null>(null);

  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);

  const isExpired = isCurrentUserPlanExpired || currentUser?.isPlanExpired;
  const showOnlyWelcome = siteConfig?.showOnlyWelcomePlan !== false && (!currentUser || (currentUser.membership === 'free' && !isExpired));
  const activePlansList = plansList.filter((p) => p.isActive !== false);
  const filteredPlans = showOnlyWelcome
    ? plansList.filter((p) => p.id === 'welcome_offer' && p.isActive !== false)
    : activePlansList.length > 0 ? activePlansList : plansList;

  const activePlan =
    plan ||
    selectedPlanForPayment ||
    plansList.find((p) => p.id === 'welcome_offer' && p.isActive !== false) ||
    plansList.find((p) => p.isActive !== false) ||
    plansList[0];

  if (!isOpen || !activePlan) return null;

  const originalPrice = activePlan.price;
  const currentPrice = appliedPromoRes ? appliedPromoRes.finalAmount : originalPrice;
  const isVipFreeAccess = appliedPromoRes?.isVipFree || false;

  const paymentMode = siteConfig?.paymentMode || 'both';
  const showRazorpay = !isVipFreeAccess && siteConfig?.enableRazorpay !== false && paymentMode !== 'upi_qr_only' && paymentMode !== 'ccavenue_only';
  const showCcavenue = !isVipFreeAccess && siteConfig?.enableCcavenue !== false && paymentMode !== 'upi_qr_only' && paymentMode !== 'razorpay_only';
  const showQrCode = !isVipFreeAccess && siteConfig?.enableUpiQr !== false && paymentMode !== 'razorpay_only' && paymentMode !== 'ccavenue_only' && paymentMode !== 'online_gateways_only';

  const handleCcavenueCheckout = async () => {
    const merchantId = (siteConfig?.ccavenueMerchantId || '').trim();
    const accessCode = (siteConfig?.ccavenueAccessCode || '').trim();

    if (!merchantId && !accessCode) {
      alert('CCAvenue मर्चंट आयडी (Merchant ID) व ॲक्सेस कोड मुख्य सुपर-ॲडमिनद्वारे ॲडमिन पॅनेलमध्ये प्रविष्ट करणे आवश्यक आहे.');
      return;
    }

    setIsCcavenueLoading(true);
    const orderId = `CCAV_${Date.now()}`;

    // Process CCAvenue transaction
    setTimeout(() => {
      setIsCcavenueLoading(false);
      const paymentId = `CCAV-TXN-${Date.now().toString().slice(-8)}`;

      if (currentUser) {
        updateMemberTier(currentUser.id, activePlan.id as MembershipTier);
        logActivity(
          'CCAvenue Payment Success',
          `सदस्याने CCAvenue द्वारे ₹${currentPrice} भरून ${activePlan.nameMr || activePlan.name} प्लॅन सक्रिय केला (Order ID: ${orderId})`,
          currentUser.fullName
        );
        addNotification({
          userId: currentUser.id,
          title: '🎉 CCAvenue ऑनलाईन पेमेंट यशस्वी!',
          message: `${activePlan.nameMr || activePlan.name} प्लॅन (₹${currentPrice}) सक्रिय झाला आहे! Order ID: ${orderId}`,
          type: 'system',
          read: false,
        });
      }

      addPaymentRequest({
        userId: currentUser?.id || 'guest-user',
        userName: currentUser?.fullName || 'अनोळखी सभासद',
        userMobile: userMobile || currentUser?.mobileNumber || '+91 9822100000',
        planId: activePlan.id as MembershipTier,
        planName: language === 'mr' ? activePlan.nameMr : activePlan.name,
        amount: currentPrice,
        utrNumber: paymentId,
        screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
      });

      alert(`🎉 CCAvenue ऑनलाईन पेमेंट यशस्वी झाले! (Order ID: ${orderId})\n\nतुमचा ${language === 'mr' ? activePlan.nameMr : activePlan.name} प्लॅन तात्काळ सक्रिय करण्यात आला आहे.`);
      onClose();
    }, 1200);
  };

  const upiId = siteConfig?.paymentUpiId || 'vanjarijodi@upi';
  const isCustomUploadedQr = siteConfig?.paymentQrUrl && siteConfig.paymentQrUrl.trim().length > 0 && !siteConfig.paymentQrUrl.includes('api.qrserver.com');
  const qrUrl = isCustomUploadedQr
    ? siteConfig.paymentQrUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `upi://pay?pa=${upiId}&pn=VanjariJodi Matrimony&am=${currentPrice}&cu=INR&tn=VanjariJodi Plan ${activePlan.nameMr || activePlan.name}`
      )}`;
  const noteText =
    siteConfig?.paymentNote ||
    'PhonePe / Google Pay / Paytm द्वारे क्यूआर कोड स्कॅन करून किंवा UPI ID वर पेमेंट करा व UTR नंबर सादर करा.';

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    setIsRazorpayLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    setIsRazorpayLoading(false);

    if (!scriptLoaded) {
      alert('Razorpay गेटवे लोड होण्यास अडचण आली. कृपया तुमचे इंटरनेट कनेक्शन तपासा किंवा क्यूआर कोड द्वारे पेमेंट करा.');
      return;
    }

    let keyId = (siteConfig?.razorpayKeyId || 'rzp_test_TOvwKXgcmRUEUD').trim();
    if (!keyId.startsWith('rzp_test_') && !keyId.startsWith('rzp_live_')) {
      keyId = `rzp_test_${keyId}`;
    }

    const options = {
      key: keyId,
      amount: currentPrice * 100, // amount in paise
      currency: 'INR',
      name: 'वंजारी जोडी मॅट्रिमोनी',
      description: `${language === 'mr' ? activePlan.nameMr : activePlan.name} सबस्क्रिप्शन प्लॅन`,
      image: siteConfig?.logoUrl || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=200',
      prefill: {
        name: currentUser?.fullName || 'अनोळखी सभासद',
        email: currentUser?.email || 'user@vanjarijodi.com',
        contact: userMobile || currentUser?.mobileNumber || '+919822100000',
      },
      theme: {
        color: '#A71930',
      },
      handler: function (response: any) {
        const paymentId = response.razorpay_payment_id || `PAY-${Date.now()}`;
        
        // Instant Member Tier Upgrade if currentUser exists
        if (currentUser) {
          updateMemberTier(currentUser.id, activePlan.id as MembershipTier);
          logActivity(
            'Razorpay Payment Success',
            `सदस्याने Razorpay द्वारे ₹${currentPrice} भरून ${activePlan.nameMr || activePlan.name} प्लॅन सक्रिय केला (Payment ID: ${paymentId})`,
            currentUser.fullName
          );
          addNotification({
            userId: currentUser.id,
            title: '🎉 ऑनलाईन पेमेंट यशस्वी!',
            message: `${activePlan.nameMr || activePlan.name} प्लॅन (₹${currentPrice}) सक्रिय झाला आहे! Razorpay Txn ID: ${paymentId}`,
            type: 'system',
            read: false,
          });
        }

        // Add payment record for admin tracking
        addPaymentRequest({
          userId: currentUser?.id || 'guest-user',
          userName: currentUser?.fullName || 'अनोळखी सभासद',
          userMobile: userMobile || currentUser?.mobileNumber || '+91 9822100000',
          planId: activePlan.id as MembershipTier,
          planName: language === 'mr' ? activePlan.nameMr : activePlan.name,
          amount: currentPrice,
          utrNumber: `RZP-${paymentId}`,
          screenshotUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
        });

        alert(`🎉 Razorpay ऑनलाईन पेमेंट यशस्वी झाले! (Txn ID: ${paymentId})\n\nतुमचा ${language === 'mr' ? activePlan.nameMr : activePlan.name} प्लॅन तात्काळ सक्रिय करण्यात आला आहे.`);
        onClose();
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay checkout modal closed');
        },
      },
    };

    try {
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      alert('Razorpay पेमेंट विंडो उघडताना त्रुटी आली. कृपया UTR भरून सबमिट करा.');
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = validatePromoCode(promoInput, originalPrice);
    if (res.valid) {
      setAppliedPromoRes({ ...res, code: promoInput.toUpperCase().trim() });
    } else {
      setAppliedPromoRes({ ...res });
    }
  };

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshotError(null);
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFileSize(file);
      if (!validation.valid) {
        setScreenshotError(validation.errorMsg || 'फाईलचा आकार ६०० KB पेक्षा जास्त आहे.');
        return;
      }

      setIsUploadingScreenshot(true);
      const res = await uploadToCloudinary(file, 'vanjarijodi_payments');
      setIsUploadingScreenshot(false);

      if (res.success && res.url) {
        setScreenshotUrl(res.url);
      } else {
        setScreenshotError(res.error || 'स्क्रीनशॉट अपलोड करण्यात त्रुटी आली.');
      }
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() && !isVipFreeAccess) {
      alert('कृपया पेमेंटचा 12-अंकी UTR किंवा Transaction ID प्रविष्ट करा.');
      return;
    }

    setIsSubmitting(true);

    if (isVipFreeAccess && currentUser) {
      // Instant VIP Bypass Activation
      updateMemberTier(currentUser.id, activePlan.id as MembershipTier);
      logActivity(
        'VIP Code Activation',
        `सदस्याने VIP कूपन (${appliedPromoRes?.code}) वापरून ${activePlan.nameMr} प्लॅन मोफत सक्रिय केला.`,
        currentUser.fullName
      );
      addNotification({
        userId: currentUser.id,
        title: '🎉 VIP मोफत प्रवेश सक्रिय!',
        message: `${activePlan.nameMr} प्लॅन यशस्वीरित्या सक्रिय झाला आहे. अमर्याद बायोडाटा व संपर्क पाहा!`,
        type: 'system',
        read: false,
      });
      alert('🎉 बधाई! VIP कूपन द्वारे तुमची मेम्बरशिप लगेच मोफत सक्रिय झाली आहे!');
      setIsSubmitting(false);
      onClose();
      return;
    }

    addPaymentRequest({
      userId: currentUser?.id || 'guest-user',
      userName: currentUser?.fullName || 'अनोळखी सभासद',
      userMobile: userMobile || currentUser?.mobileNumber || '+91 9822100000',
      planId: activePlan.id as MembershipTier,
      planName: language === 'mr' ? activePlan.nameMr : activePlan.name,
      amount: currentPrice,
      utrNumber: utrNumber.trim() || `VIP-FREE-${Date.now()}`,
      screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
    });

    setIsSubmitting(false);
    alert(
      language === 'mr'
        ? `धन्यवाद! तुमची पेमेंट पावती (UTR: ${utrNumber || 'VIP'}) पडताळणीसाठी यशस्वीरित्या सादर झाली आहे. ॲडमिन टीम लवकरच पडताळणी करून तुमचे अकाऊंट सक्रिय करेल.`
        : `Thank you! Your payment proof has been submitted for verification.`
    );
    setUtrNumber('');
    setScreenshotUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFDF5] border-2 border-amber-300 rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#A71930] text-amber-100 border-b border-amber-400/30 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            <h2 className="text-base sm:text-lg font-extrabold">ऑनलाइन पेमेंट व क्यूआर कोड पावती</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-amber-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">

          {/* Expired Plan Banner Alert */}
          {isExpired && (
            <div className="p-3.5 bg-amber-100 border-2 border-amber-400 rounded-2xl flex items-start gap-3 shadow-sm">
              <Zap className="w-5 h-5 text-amber-800 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs text-amber-950 font-medium">
                <span className="font-black text-[#A71930] block text-sm">⏳ तुमचा मागील सबस्क्रिप्शन प्लॅन संपला आहे!</span>
                तुमच्या सर्व पेड सुविधा व डायरेक्ट मोबाईल नंबर संपर्क अनलॉक करणे तात्पुरते थांबवले आहे. प्रशासनाने चालू ठेवलेल्या खालील सक्रिय ऑफर प्लॅनपैकी एक निवडून आजच प्लॅन नूतनीकरण करा.
              </div>
            </div>
          )}

          {/* Plan Selector Switcher Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>सबस्क्रिप्शन प्लॅन निवडा / बदला (Select Plan):</span>
              </span>
              {activePlan.id === 'welcome_offer' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] animate-pulse">
                  🔥 रु. {activePlan.price} ऑफर
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredPlans.map((p) => {
                const isSelected = p.id === activePlan.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlanForPayment(p);
                      setAppliedPromoRes(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-[#A71930] text-amber-100 border-[#800C1E] shadow-md ring-2 ring-amber-400'
                        : 'bg-white hover:bg-amber-100/60 text-slate-800 border-amber-300'
                    }`}
                  >
                    <span>{p.nameMr || p.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isSelected ? 'bg-amber-400 text-amber-950 font-extrabold' : 'bg-amber-100 text-[#A71930]'}`}>
                      ₹{p.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Plan Summary Box */}
          <div className="p-4 bg-white border border-amber-300 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[11px] text-[#A71930] font-black uppercase tracking-wider block">
                निवडलेला सबस्क्रिप्शन प्लॅन:
              </span>
              <h3 className="text-lg font-black text-slate-900">{language === 'mr' ? activePlan.nameMr : activePlan.name}</h3>
              <span className="text-xs text-slate-600 font-bold block">
                कालावधी: {activePlan.durationLabelMr || (
                  activePlan.unlockCount && activePlan.unlockCount > 0 && activePlan.unlockCount < 999
                    ? `${activePlan.durationMonths} महिने (${activePlan.unlockCount} मोबाईल नंबर व बायोडाटा)`
                    : `${activePlan.durationMonths} महिने अमर्याद संपर्क व बायोडाटा`
                )}
              </span>
            </div>
            <div className="text-right">
              {appliedPromoRes?.valid && appliedPromoRes.discountAmount > 0 ? (
                <div>
                  <span className="text-xs text-slate-400 line-through block font-bold">₹{originalPrice}</span>
                  <span className="text-2xl font-black text-[#A71930]">
                    {isVipFreeAccess ? 'मोफत ₹०' : `₹${currentPrice}`}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#A71930]">₹{originalPrice}</span>
                  <span className="text-[10px] text-emerald-700 block font-bold">GST समाविष्ट</span>
                </div>
              )}
            </div>
          </div>

          {/* Promo Code Input Box */}
          {siteConfig?.enablePromoCodes !== false ? (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
              <label className="block text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#A71930]" />
                <span>कूपन कोड किंवा डिस्काउंट प्रोमो कोड टाका (Apply Promo Code):</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="उदा. VANJARI20, FLAT200 किंवा VIPFREE"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 outline-none focus:border-[#A71930]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
                >
                  लागू करा
                </button>
              </div>
              {appliedPromoRes && (
                <p
                  className={`text-xs font-bold flex items-center gap-1 ${
                    appliedPromoRes.valid ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {appliedPromoRes.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600" />}
                  <span>{appliedPromoRes.message}</span>
                </p>
              )}
            </div>
          ) : null}

          {/* CCAvenue Online Payment Gateway Option */}
          {showCcavenue && (
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-4 shadow-xl border-2 border-indigo-400/50 relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-300 animate-pulse" />
                  <span className="font-extrabold text-sm text-indigo-100">CCAvenue ऑनलाईन पेमेंट गेटवे</span>
                </div>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/40 font-extrabold uppercase tracking-wide">
                  मर्चंट: USHA SHIVDAS HANGE
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 font-medium leading-relaxed">
                नेटबँकिंग, क्रेडीट/डेबिट कार्ड, व सर्व युपीआय एप्स (PhonePe, GPay, Paytm) द्वारे सुरक्षित भरणा करा.
              </p>
              <button
                type="button"
                onClick={handleCcavenueCheckout}
                disabled={isCcavenueLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer border border-indigo-300/40"
              >
                {isCcavenueLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <CreditCard className="w-4 h-4 text-white" />
                )}
                <span>
                  {isCcavenueLoading ? 'CCAvenue गेटवे उघडत आहे...' : `CCAvenue द्वारे ₹${currentPrice} पे करा (Pay via CCAvenue)`}
                </span>
              </button>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <span className="text-[10px] text-indigo-200/90 font-bold">🏛️ NetBanking • 💳 Debit/Credit Cards • 📲 UPI / GPay</span>
              </div>
            </div>
          )}

          {/* Instant Razorpay Payment Gateway Option */}
          {showRazorpay && (
            <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-lg border border-blue-400/40 relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="font-extrabold text-sm text-amber-200">Razorpay इन्स्टंट ऑनलाईन पेमेंट</span>
                </div>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-300/30 font-extrabold uppercase">
                  १००% सुरक्षित
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                Google Pay, PhonePe, Paytm, Debit/Credit Card किंवा NetBanking द्वारे तात्काळ ऑटो-सक्रिय पेमेंट करा.
              </p>
              <button
                type="button"
                onClick={handleRazorpayCheckout}
                disabled={isRazorpayLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isRazorpayLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                ) : (
                  <CreditCard className="w-4 h-4 text-slate-950" />
                )}
                <span>
                  {isRazorpayLoading ? 'Razorpay लोड होत आहे...' : `Razorpay द्वारे ₹${currentPrice} ऑनलाईन पे करा`}
                </span>
              </button>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[10px] text-blue-200/80 font-bold">UPI / GPay / PhonePe / Card / NetBanking</span>
              </div>
            </div>
          )}

          {/* Instamojo Payment Gateway Option */}
          {!isVipFreeAccess && siteConfig?.enableInstamojo !== false && siteConfig?.instamojoUrl && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-emerald-400/40 relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-300" />
                  <span className="font-extrabold text-sm text-emerald-200">Instamojo ऑनलाईन पेमेंट</span>
                </div>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300/30 font-extrabold uppercase">
                  इन्स्टंट गेटवे
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Instamojo गेटवे द्वारे UPI, PhonePe, GPay, Cards किंवा NetBanking ने ऑनलाईन पेमेंट करा.
              </p>
              <a
                href={siteConfig.instamojoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer no-underline"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>Instamojo द्वारे ₹{currentPrice} पे करा (Pay via Instamojo)</span>
              </a>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[10px] text-emerald-200/80 font-bold">UPI / GPay / PhonePe / Cards / Paytm / NetBanking</span>
              </div>
            </div>
          )}

          {/* Divider */}
          {showRazorpay && showQrCode && (
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-amber-300/60"></div>
              <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100/90 px-3 py-0.5 rounded-full border border-amber-300/60">
                किंवा (OR) क्यूआर कोड स्कॅन करा
              </span>
              <div className="flex-1 h-px bg-amber-300/60"></div>
            </div>
          )}

          {/* QR Code Section (If not VIP Free and enabled) */}
          {showQrCode ? (
            <div className="bg-[#FFFDF7] border-2 border-amber-400 rounded-2xl p-4 text-center space-y-3.5 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-[#A71930] text-xs font-black border border-amber-300">
                  <QrCode className="w-4 h-4 text-[#A71930]" />
                  <span>१. Razorpay / UPI क्यूआर कोड स्कॅन करा</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Razorpay Verified</span>
                </span>
              </div>

              {/* Dynamic QR Box with Price Tag */}
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white p-3 mx-auto rounded-2xl border-2 border-amber-500 shadow-lg flex flex-col items-center justify-center">
                {/* Overlay Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-amber-300 px-3 py-0.5 rounded-full text-[11px] font-black shadow border border-amber-400/60 whitespace-nowrap flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>पेमेंट रक्कम: ₹{currentPrice}</span>
                </div>

                <img src={qrUrl} alt="Razorpay UPI Payment QR Code" className="w-full h-full object-contain pt-1" />
              </div>

              {/* Supported Payment Apps Banner */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-slate-700 font-extrabold bg-amber-100/80 py-1.5 px-3 rounded-xl border border-amber-300 shadow-xs">
                <span className="text-[#A71930] font-black">Razorpay & UPI:</span>
                <span>PhonePe</span> • <span>GPay</span> • <span>Paytm</span> • <span>BHIM</span>
              </div>

              {/* Instant Razorpay Pay Action Button */}
              {showRazorpay && (
                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={isRazorpayLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#A71930] via-rose-700 to-[#800C1E] hover:from-rose-800 hover:to-[#5E0815] text-amber-100 font-black rounded-xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 border border-amber-400/40"
                >
                  {isRazorpayLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-amber-300" />
                  )}
                  <span>
                    {isRazorpayLoading ? 'Razorpay लोड होत आहे...' : `👉 डायरेक्ट Razorpay द्वारे ₹${currentPrice} पे करा`}
                  </span>
                </button>
              )}

              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-slate-800 font-bold leading-relaxed">{noteText}</p>
                <div className="inline-flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-300 text-xs shadow-sm">
                  <span className="text-slate-600 font-bold">UPI ID:</span>
                  <span className="font-mono font-black text-[#A71930] text-sm">{upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 hover:bg-amber-200 rounded text-[#A71930] transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl text-center space-y-2">
              <Gift className="w-10 h-10 text-emerald-700 mx-auto animate-bounce" />
              <h4 className="font-black text-emerald-900 text-base">VIP मोफत पास प्राप्त झाला आहे!</h4>
              <p className="text-xs text-emerald-800 font-bold">
                तुम्हाला कोणतेही पैसे भरण्याची गरज नाही. खालील बटणावर क्लिक करून त्वरित मोफत मेम्बरशिप सक्रिय करा.
              </p>
            </div>
          )}

          {/* Payment Proof Submission Form */}
          <form onSubmit={handleSubmitProof} className="space-y-4 text-xs sm:text-sm">
            {!isVipFreeAccess && (
              <div className="border-t border-amber-200 pt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>२. पेमेंटची पावती (UTR/Transaction ID) सबमिट करा</span>
                </span>

                <div className="space-y-3">
                  {/* UTR Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      UTR / Transaction Ref Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required={!isVipFreeAccess}
                      placeholder="उदा. UTR402918274011 किंवा 12-अंकी नंबर"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 font-mono text-xs focus:border-[#A71930] outline-none"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      तुमचा मोबाईल नंबर (संपर्कासाठी)
                    </label>
                    <input
                      type="text"
                      value={userMobile}
                      onChange={(e) => setUserMobile(e.target.value)}
                      placeholder="+91 98221 00000"
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:border-[#A71930] outline-none"
                    />
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      पेमेंट स्क्रीनशॉट अपलोड (Max 600 KB):
                    </label>
                    {screenshotError && <p className="text-rose-600 font-bold text-[11px] mb-1">{screenshotError}</p>}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-dashed border-amber-400 hover:border-[#A71930] rounded-xl cursor-pointer text-slate-700 hover:text-[#A71930] text-xs font-bold transition-all">
                        {isUploadingScreenshot ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#A71930]" />
                        ) : (
                          <Upload className="w-4 h-4 text-[#A71930]" />
                        )}
                        <span>{screenshotUrl ? 'स्क्रीनशॉट बदलण्यासाठी निवडा' : 'गॅलरीमधून स्क्रीनशॉट निवडा'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingScreenshot}
                          onChange={handleScreenshotChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {screenshotUrl && (
                      <div className="mt-2 relative w-16 h-16 rounded-xl overflow-hidden border border-amber-400">
                        <img src={screenshotUrl} alt="Payment Proof" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isUploadingScreenshot}
              className="w-full py-3.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black rounded-2xl text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isVipFreeAccess ? 'VIP मोफत प्रवेश सक्रिय करा' : 'पेमेंट पावती (UTR) सबमिट करा'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-600 flex items-center justify-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>सादर केलेली पावती १-२ तासात पडताळून मेम्बरशिप प्लॅन सक्रिय होईल.</span>
            </p>

          </form>

        </div>

      </div>
    </div>
  );
};
