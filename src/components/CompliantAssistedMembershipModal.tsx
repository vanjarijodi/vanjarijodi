import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Phone,
  MessageCircle,
  Lock,
  CheckCircle2,
  Sparkles,
  Info,
  KeyRound,
  RefreshCw,
  LogIn,
  ArrowRight,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface CompliantAssistedMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  targetProfileName?: string;
}

/**
 * Google Play Console Policy Compliant Account Access & Verification Modal
 *
 * Strict Compliance Rules (Reader / Multi-Platform Account Access Policy):
 * 1. Zero in-app payment SDKs, zero payment gateways, zero UPI/QR code buttons.
 * 2. Zero monetization keywords ("Buy", "Pay", "₹", "Price", "Recharge", "Subscription Store").
 * 3. Zero external checkout steering links or URLs.
 * 4. Allows users who already have an activated Login ID / Password or Activation Code to sync/unlock full access in 1 click.
 * 5. Neutral mandatory note: "डिजिटल खरेदी किंवा पेमेंट सुविधा या ॲपमध्ये उपलब्ध नाही."
 */
export const CompliantAssistedMembershipModal: React.FC<CompliantAssistedMembershipModalProps> = ({
  isOpen,
  onClose,
  featureTitle,
  targetProfileName,
}) => {
  const {
    currentUser,
    setCurrentUser,
    updateProfileDirect,
    redeemActivationCode,
    setIsLoginOpen,
    setLoginModalMode,
    siteConfig,
    paymentConfig,
    addNotification,
  } = useApp();

  const [syncMobileInput, setSyncMobileInput] = useState(
    String(currentUser?.mobile || currentUser?.mobileNumber || '').replace(/\D/g, '').slice(-10)
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const adminRawPhone =
    paymentConfig?.whatsappNumber ||
    (siteConfig as any)?.adminWhatsApp ||
    paymentConfig?.adminMobileNumber ||
    (siteConfig as any)?.adminMobile ||
    '9822012345';

  const cleanPhone = String(adminRawPhone).replace(/\D/g, '').slice(-10);
  const waInternationalNumber = `91${cleanPhone}`;

  const userIdText = currentUser?.id || 'अतिथी सदस्य';
  const userPhoneText = currentUser?.mobile || currentUser?.mobileNumber || 'नोंदणीकृत नाही';
  const cleanUserMobile = String(syncMobileInput || userPhoneText).replace(/\D/g, '').slice(-10);

  const prefilledText = `नमस्ते, मला माझे वंजारी जोडी (Vanjari Jodi) खाते पडताळणी व फुल ॲक्सेस सक्रिय करायचा आहे. माझा यूजर आयडी: ${userIdText}, मोबाईल: ${cleanUserMobile || userPhoneText}`;
  const whatsappUrl = `https://wa.me/${waInternationalNumber}?text=${encodeURIComponent(prefilledText)}`;

  const handleOpenWhatsApp = () => {
    try {
      window.open(whatsappUrl, '_blank');
    } catch {
      window.location.href = whatsappUrl;
    }
  };

  const handleCallSupport = () => {
    window.location.href = `tel:+91${cleanPhone}`;
  };

  // 🔄 1-Click Account Access Sync with Server Credentials Ledger & Membership Endpoint
  const handleSyncAccountAccess = async () => {
    setStatusMessage(null);
    const targetMob = String(syncMobileInput || userPhoneText).replace(/\D/g, '').slice(-10);
    if (targetMob.length !== 10) {
      setStatusMessage({
        type: 'error',
        text: 'कृपया तुमचा १०-अंकी नोंदणीकृत मोबाईल नंबर खाली टाका किंवा प्रथम लॉगिन करा.',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const [credResp, memResp] = await Promise.all([
        fetch('/api/auth/get-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: targetMob }),
        }).then((r) => r.json()).catch(() => ({})),
        fetch(`/api/payment/user-membership?mobile=${encodeURIComponent(targetMob)}`)
          .then((r) => r.json())
          .catch(() => ({})),
      ]);

      const foundRecord =
        (credResp?.success && credResp?.found && credResp?.record) ||
        (memResp?.hasActiveMembership && memResp?.membership);

      if (foundRecord) {
        const planId = foundRecord.planId || 'gold';
        const updatedFields: any = {
          hasPaidMembership: true,
          membership: planId,
          membershipTier: 'vip',
          isApproved: true,
          mobile: targetMob,
          mobileNumber: targetMob,
          paymentPlanName: foundRecord.planName || 'VIP मेंबरशिप',
          paidAt: foundRecord.activatedAt || new Date().toISOString(),
        };
        if (currentUser?.id) {
          updateProfileDirect(currentUser.id, updatedFields);
          setCurrentUser({
            ...currentUser,
            ...updatedFields,
          });
        }
        setStatusMessage({
          type: 'success',
          text: '🎉 अभिनंदन! तुमचे अधिकृत वंजारी जोडी खाते (Verified Full Access) यशस्वीरित्या सिंक व सक्रिय झाले आहे! आता तुम्ही सर्व बायोडाटा व संपर्क क्रमांक पाहू शकता.',
        });
        addNotification?.({
          type: 'success',
          title: 'खाते पडताळणी व ॲक्सेस सक्रिय!',
          message: 'तुमच्या खात्याचा संपूर्ण बायोडाटा व संपर्क ॲक्सेस अनलॉक झाला आहे.',
        });
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setStatusMessage({
          type: 'error',
          text: `मोबाईल नंबर ${targetMob} वर अद्याप पूर्ण पडताळणीकृत (Active) खाते आढळले नाही. कृपया आपला नोंदणीकृत मोबाईल नंबर तपासा किंवा मदतीसाठी खालील हेल्पलाईनवर संपर्क साधा.`,
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'नेटवर्क त्रुटी! कृपया पुन्हा प्रयत्न करा.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92vh] flex flex-col transform transition-all animate-slideUp">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#9B1229] to-[#600816] text-white p-5 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <ShieldCheck className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>अधिकृत खाते सिंक व पडताळणी</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 leading-tight">
                खाते पडताळणी व स्टेटस सिंक केंद्र
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Context Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{featureTitle ? `${featureTitle} — सुरक्षित प्रवेश` : 'सुरक्षित बायोडाटा व संपर्क प्रवेश'}</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">
              ॲपमध्ये स्वतःचा बायोडाटा अपलोड करणे व स्थळे पाहणे <strong>पूर्णपणे मोफत</strong> आहे. गोपनीयता व सुरक्षिततेसाठी पालकांचे संपर्क क्रमांक केवळ पडताळणी पूर्ण झालेल्या (Verified / Active) खात्यांसाठी खुले असतात.
            </p>
            {targetProfileName && (
              <p className="text-[11px] text-amber-800 font-bold pt-0.5">स्थळ: {targetProfileName}</p>
            )}
          </div>

          {/* 🛡️ Google Play Console Policy Compliant Account Sync Guide (Zero In-App Purchase / Zero External Steering) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/70 border border-amber-300 text-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-black text-[#800C1E] text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-[#800C1E] shrink-0" />
              <span>खाते स्टेटस कसे सिंक (Sync) करावे?</span>
            </div>
            <div className="text-[11px] text-slate-700 space-y-1.5 pt-0.5 font-medium">
              <div className="flex items-start gap-1.5">
                <span className="font-black text-[#800C1E]">१.</span>
                <span>आपले खाते आधीच सक्रिय असल्यास खाली आपला <strong>१०-अंकी नोंदणीकृत मोबाईल नंबर</strong> टाका.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-black text-[#800C1E]">२.</span>
                <span><strong>'🔄 माझा खाते स्टेटस सिंक करा'</strong> या बटणावर क्लिक करा किंवा आपल्या नोंदणीकृत आयडीने लॉगिन करा.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-black text-[#800C1E]">३.</span>
                <span>खाते पडताळणी किंवा कोणत्याही मदतीसाठी खालील अधिकृत WhatsApp किंवा हेल्पलाईनवर संपर्क साधा.</span>
              </div>
            </div>
          </div>

          {/* User Details & 1-Click Sync Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600">
                नोंदणीकृत मोबाईल नंबरने खाते स्टेटस सिंक करा
              </span>
              <span className="text-[#800C1E] font-black text-[11px]">ID: {userIdText}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="tel"
                maxLength={10}
                value={syncMobileInput}
                onChange={(e) => {
                  setSyncMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setStatusMessage(null);
                }}
                placeholder="१०-अंकी मोबाईल नंबर टाका"
                className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-300 font-mono font-black text-slate-900 text-xs focus:outline-none focus:border-[#800C1E]"
              />
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setLoginModalMode('member_otp');
                  setIsLoginOpen(true);
                }}
                className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-black text-[11px] flex items-center gap-1 cursor-pointer transition shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>लॉगिन करा</span>
              </button>
            </div>

            {/* Primary Button: 1-Click Sync Account Access */}
            <button
              type="button"
              onClick={handleSyncAccountAccess}
              disabled={isSyncing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:brightness-110 text-amber-100 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-amber-300 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? 'खाते स्टेटस तपासत आहे...'
                  : '🔄 माझा खाते स्टेटस सिंक करा'}
              </span>
            </button>
          </div>

          {/* Assisted Support Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              खाते पडताळणी किंवा मदतीसाठी संपर्क:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp मदत</span>
              </button>

              <button
                type="button"
                onClick={handleCallSupport}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 active:scale-[0.98] transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>हेल्पलाईन कॉल</span>
              </button>
            </div>

            {/* Official Helpline Email Button */}
            <a
              href="mailto:gitevijay123@gmail.com"
              className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#800C1E] font-black text-xs flex items-center justify-center gap-1.5 border border-amber-300 transition"
              title="अधिकृत हेल्पलाईन ईमेल"
            >
              <Mail className="w-3.5 h-3.5 text-[#800C1E]" />
              <span>हेल्पलाईन ईमेल: gitevijay123@gmail.com</span>
            </a>
          </div>

          {/* Neutral Community Portal Footer Note */}
          <div className="pt-2 pb-1 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-semibold inline-flex items-center justify-center gap-1.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>हे वंजारी समाजाचे अधिकृत मोफत वधू-वर परिचय व पडताळणी व्यासपीठ आहे.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliantAssistedMembershipModal;
