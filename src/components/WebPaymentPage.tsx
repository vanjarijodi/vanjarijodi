import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { initiateRazorpayPayment, getRazorpayPublicConfig } from '../services/razorpayClient';
import { downloadPaymentInvoice } from '../utils/invoiceGenerator';
import { syncDocToFirestore } from '../utils/firestoreSync';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Sparkles,
  Download,
  AlertTriangle,
  Loader2,
  Home,
  Copy,
  KeyRound
} from 'lucide-react';

export const WebPaymentPage: React.FC = () => {
  const { plansList, siteConfig, addPaymentRequest, currentUser, addNotification, updateMemberTier } = useApp();

  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());
  const [selectedPlanId, setSelectedPlanId] = useState<string>('welcome_offer');
  const [userName, setUserName] = useState<string>('');
  const [userMobile, setUserMobile] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [isFromApp, setIsFromApp] = useState<boolean>(false);

  // Payment states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [approvedDetails, setApprovedDetails] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);

      const planFromUrl = params.get('plan') || 'welcome_offer';
      setSelectedPlanId(planFromUrl);

      const nameFromUrl = params.get('userName') || currentUser?.fullName || '';
      const mobileFromUrl = params.get('userMobile') || currentUser?.mobile || currentUser?.mobileNumber || '';
      const userIdFromUrl = params.get('userId') || currentUser?.id || 'guest-user';
      const amtFromUrl = params.get('amount') ? Number(params.get('amount')) : null;
      const promoFromUrl = params.get('promo') || '';
      const sourceFromUrl = params.get('source') === 'android_app';

      setUserName(nameFromUrl);
      setUserMobile(mobileFromUrl);
      setUserId(userIdFromUrl);
      setCustomAmount(amtFromUrl);
      setPromoCode(promoFromUrl);
      setIsFromApp(sourceFromUrl);
    }
  }, [currentUser]);

  // Find target plan
  const targetPlan =
    plansList.find((p) => p.id === selectedPlanId) ||
    plansList.find((p) => p.id === 'welcome_offer') ||
    plansList[0] || {
      id: 'welcome_offer',
      name: 'Welcome Offer Plan',
      nameMr: '🔥 वेलकम ऑफर प्लॅन',
      price: 398,
      duration: '६ महिने (180 दिवस)',
      contactViews: 100,
    };

  const finalAmount = customAmount || targetPlan.price || 398;

  const handlePayWithRazorpay = async () => {
    setPaymentError(null);
    setIsLoading(true);

    try {
      await initiateRazorpayPayment({
        planId: targetPlan.id,
        planName: targetPlan.nameMr || targetPlan.name,
        amount: finalAmount,
        userId: userId || 'web-user',
        userName: userName || 'सन्माननीय सदस्य',
        userMobile: userMobile || '',
        notes: {
          source: isFromApp ? 'android_chrome_external' : 'web_portal',
          promo_code: promoCode,
        },
        onSuccess: (verifiedData) => {
          setIsLoading(false);
          setPaymentSuccess(true);
          setApprovedDetails(verifiedData);

          // Add to context payment requests
          addPaymentRequest({
            userId: userId || 'web-user',
            userName: userName || 'सन्माननीय सदस्य',
            userMobile: userMobile || '',
            planId: targetPlan.id as any,
            planName: targetPlan.nameMr || targetPlan.name,
            amount: finalAmount,
            utrNumber: verifiedData.paymentId || verifiedData.orderId || `RZP-${Date.now()}`,
            screenshotUrl: '',
            paymentMethod: 'razorpay',
            adminNote: 'Chrome Web Checkout (Google Play Review Compliant External Payment)',
          });

          if (userId && typeof updateMemberTier === 'function') {
            updateMemberTier(userId, targetPlan.id as any);
          }

          // Instantly sync isPremium: true to Firestore for real-time mobile app unlock
          if (userId) {
            const nowIso = new Date().toISOString();
            const expDays = (targetPlan as any).validityDays || 180;
            const expiresIso = new Date(Date.now() + expDays * 24 * 60 * 60 * 1000).toISOString();
            syncDocToFirestore('profiles', userId, {
              isPremium: true,
              isVerified: true,
              membership: (targetPlan.id || 'gold').toLowerCase(),
              membershipPlan: targetPlan.nameMr || targetPlan.name,
              premiumActivatedAt: nowIso,
              premiumExpiresAt: expiresIso,
              membershipPlanName: targetPlan.nameMr || targetPlan.name,
              membershipExpiryDate: expiresIso,
              isPlanExpired: false,
              paidAt: nowIso,
              paymentApprovedAt: nowIso,
            });
          }

          if (addNotification) {
            addNotification({
              userId: userId || 'web-user',
              title: '🎉 मेंबरशिप यशस्वीरित्या सक्रिय!',
              titleMr: '🎉 मेंबरशिप यशस्वीरित्या सक्रिय!',
              message: `${targetPlan.nameMr || targetPlan.name} प्लॅन (₹${finalAmount}) सुरू झाला आहे!`,
              messageMr: `${targetPlan.nameMr || targetPlan.name} प्लॅन (₹${finalAmount}) सुरू झाला आहे!`,
              type: 'approval',
            });
          }
        },
        onError: (err) => {
          setIsLoading(false);
          setPaymentError(err || 'पेमेंट पूर्ण होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.');
        },
        onDismiss: () => {
          setIsLoading(false);
        },
      });
    } catch (e: any) {
      setIsLoading(false);
      setPaymentError(e.message || 'पेमेंट सुरू करताना त्रुटी आली.');
    }
  };

  const handleDownloadInvoice = () => {
    downloadPaymentInvoice({
      invoiceNumber: approvedDetails?.orderId || `RCP-${Date.now().toString().slice(-6)}`,
      paymentId: approvedDetails?.paymentId || `RZP-${Date.now()}`,
      orderId: approvedDetails?.orderId || `ORD-${Date.now()}`,
      gateway: 'Razorpay Payment Gateway (Official)',
      utrNumber: approvedDetails?.paymentId || `RZP-${Date.now()}`,
      userName: userName || 'सन्माननीय सदस्य',
      userMobile: userMobile || '',
      userDistrict: currentUser?.district || '',
      planName: targetPlan.nameMr || targetPlan.name,
      planDuration: targetPlan.duration || 'सक्रिय वैधता',
      amount: finalAmount,
      currency: 'INR',
      paymentDate: new Date().toLocaleDateString('en-IN'),
      membershipExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      businessName: siteConfig?.logoTitle || 'वंजारी जोडी वधू-वर सूचक केंद्र',
      upiId: siteConfig?.paymentUpiId || 'mahesh.hange1@ybl',
      adminNote: 'Razorpay अधिकृत ऑनलाईन पेमेंट. खाते तात्काळ सक्रिय केले.',
    });
  };

  const handleReturnToApp = () => {
    // Attempt custom scheme deep link or navigate to root
    if (typeof window !== 'undefined') {
      window.location.href = 'intent://vanjarijodi.org/#Intent;scheme=https;package=com.vanjarijodi.app;end';
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-slate-50 to-orange-50/30 text-slate-800 font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* 🚀 Header Ribbon */}
      <header className="bg-gradient-to-r from-[#7A0C1E] via-[#9B111E] to-[#7A0C1E] text-white py-4 px-4 sm:px-8 border-b-2 border-amber-400 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
              <img
                src="/vanjari-jodi-official-logo.png"
                alt="Vanjari Jodi Matrimony"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-300 font-black text-xs sm:text-sm">॥ श्री संत भगवान बाबा प्रसन्न ॥</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                वंजारी जोडी — अधिकृत वेब पेमेंट पोर्टल
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-full border border-amber-300/40 text-xs text-amber-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit SSL Secure Gateway</span>
            </div>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-xs font-bold text-white transition border border-amber-300/30 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>मुख्यपृष्ठ</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Main Body */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 my-auto space-y-5">
        {/* Compliance Notice for Google Play Store Users */}
        {isFromApp && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-950 shadow-xs">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="leading-relaxed">
              <span className="font-black text-emerald-900 block">✓ अधिकृत Google Chrome वेब पेमेंट</span>
              <span>गुगल प्ले नियमानुसार आपले पेमेंट अधिकृत सुरक्षित वेब गेटवेवर उघडण्यात आले आहे.</span>
            </div>
          </div>
        )}

        {paymentSuccess ? (
          /* ======================================================== */
          /* SUCCESS SCREEN */
          /* ======================================================== */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                ✓ पेमेंट यशस्वी
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                अभिनंदन! मेंबरशिप तात्काळ सुरू झाली आहे!
              </h2>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                आपले ₹{finalAmount} चे पेमेंट Razorpay द्वारे अधिकृतरीत्या सत्यापित झाले असून सर्व वधू-वर संपर्क नंबर व बायोडाटा अनलॉक झाले आहेत.
              </p>
            </div>

            {/* 🔑 One-Time Activation Code Card */}
            {(() => {
              const actCode = approvedDetails?.activationCode || `VJ-${Math.floor(1000 + Math.random() * 9000)}`;
              return (
                <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400/80 rounded-2xl p-4 text-center text-white space-y-2 shadow-xl relative overflow-hidden max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5 fill-slate-950" />
                    <span>तुमचा १-टाइम ॲप ॲक्टिव्हेशन कोड</span>
                  </div>

                  <p className="text-xs text-amber-200/90 font-medium">
                    वेबसाईटवर पेमेंट यशस्वी झाल्यानंतर हा कोड तयार झाला आहे. हा कोड कॉपी करून ॲपमध्ये टाका:
                  </p>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <div className="px-5 py-2.5 bg-slate-950 rounded-xl border-2 border-amber-300 text-amber-300 font-mono text-2xl font-black tracking-widest shadow-inner">
                      {actCode}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(actCode);
                        alert(`✅ ॲक्टिव्हेशन कोड (${actCode}) यशस्वीरित्या कॉपी झाला!`);
                      }}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Copy className="w-4 h-4" />
                      <span>कॉपी</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-300/80 block italic">
                    (हा कमी अंकी/अक्षरी कोड ॲपमध्ये टाकल्यावर तुमची सिस्टीम त्वरित ॲक्टिव्हेट होईल)
                  </span>
                </div>
              );
            })()}

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">प्लॅन नाव:</span>
                <span className="font-black text-[#800C1E]">{targetPlan.nameMr || targetPlan.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">भरलेली रक्कम:</span>
                <span className="font-black text-emerald-700 text-sm">₹{finalAmount}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">पेमेंट आयडी (UTR):</span>
                <span className="font-mono font-bold text-slate-700">{approvedDetails?.paymentId || `RZP-${Date.now()}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">वैधता:</span>
                <span className="font-bold text-slate-700">{targetPlan.duration || '६ महिने (180 दिवस)'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleReturnToApp}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:brightness-110 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Smartphone className="w-5 h-5 text-amber-300" />
                <span>📲 वंजारी जोडी ॲप उघडा (Return to App)</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Download className="w-4 h-4 text-slate-700" />
                <span>अधिकृत पावती डाऊनलोड करा (Download Receipt)</span>
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center justify-center gap-1 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>मुख्य वेबसाईटवर जा</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CHECKOUT FORM */
          /* ======================================================== */
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-amber-300/90 shadow-2xl space-y-5">
            {/* Plan Display Header */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/60 p-4 rounded-2xl border border-amber-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#800C1E] text-amber-300 flex items-center justify-center shadow-md shrink-0">
                  <CreditCard className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      {targetPlan.nameMr || targetPlan.name}
                    </span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.2 rounded font-black">
                      अधिकृत
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    वैधता: <strong className="text-[#800C1E]">{targetPlan.duration || '६ महिने (180 दिवस)'}</strong> • सर्व प्रोफाईल्स अनलॉक
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 font-bold block">देय रक्कम</span>
                <span className="text-xl sm:text-2xl font-black text-[#800C1E]">₹{finalAmount}</span>
              </div>
            </div>

            {/* Member Details Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  आपले पूर्ण नाव (Member Full Name):
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="नाव प्रविष्ट करा"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#800C1E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  मोबाईल नंबर (Contact Mobile Number):
                </label>
                <input
                  type="tel"
                  value={userMobile}
                  onChange={(e) => setUserMobile(e.target.value)}
                  placeholder="१०-अंकी मोबाईल नंबर"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-[#800C1E]"
                />
              </div>
            </div>

            {/* Payment Method Badges */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>उपलब्ध पेमेंट पर्याय (Razorpay 100% Safe):</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-black">Zero Extra Fee</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-700 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-200">📱 PhonePe</div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">📱 Google Pay</div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">💳 Cards/ATM</div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">⚡ Paytm / UPI</div>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePayWithRazorpay}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:brightness-110 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span>Razorpay पेमेंट लोड होत आहे...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-amber-300" />
                  <span>Razorpay ने ₹{finalAmount} सुरक्षित भरा (Pay Now)</span>
                  <ArrowRight className="w-5 h-5 text-amber-300" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-500">
              🔒 सुरक्षित 256-Bit SSL एनक्रिप्शन • तात्काळ मेंबरशिप ॲक्टिव्हेशन • कोणतीही मंजुरी वाट न पाहता
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/60">
        <p>© {new Date().getFullYear()} Vanjari Jodi Matrimony. सर्व हक्क सुरक्षित. अधिकृत पेमेंट गेटवे.</p>
      </footer>
    </div>
  );
};

export default WebPaymentPage;
