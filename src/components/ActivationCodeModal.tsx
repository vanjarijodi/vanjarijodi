import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  PhoneCall,
  Globe,
  LogIn,
} from 'lucide-react';

interface ActivationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCode?: string;
  onSuccess?: () => void;
}

export const ActivationCodeModal: React.FC<ActivationCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    currentUser,
    setCurrentUser,
    updateProfileDirect,
    siteConfig,
    setIsLoginOpen,
    setLoginModalMode,
  } = useApp();

  const [mobileInput, setMobileInput] = useState<string>(
    String(currentUser?.mobile || currentUser?.mobileNumber || '').replace(/\D/g, '').slice(-10)
  );
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const handleSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanMob = mobileInput.replace(/\D/g, '').slice(-10);
    if (cleanMob.length !== 10) {
      setError('कृपया तुमचा १०-अंकी नोंदणीकृत मोबाईल नंबर टाका.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const [credResp, memResp] = await Promise.all([
        fetch('/api/auth/get-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: cleanMob }),
        })
          .then((r) => r.json())
          .catch(() => ({})),
        fetch(`/api/payment/user-membership?mobile=${encodeURIComponent(cleanMob)}`)
          .then((r) => r.json())
          .catch(() => ({})),
      ]);

      const foundRecord =
        (credResp?.success && credResp?.found && credResp?.record) ||
        (memResp?.hasActiveMembership && memResp?.membership);

      setIsSubmitting(false);

      if (foundRecord) {
        const planId = foundRecord.planId || 'gold';
        const updatedFields: any = {
          hasPaidMembership: true,
          membership: planId,
          membershipTier: 'vip',
          isApproved: true,
          mobile: cleanMob,
          mobileNumber: cleanMob,
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
        setSuccessMsg('🎉 तुमचे वंजारी जोडी खाते यशस्वीरित्या सिंक व सक्रिय झाले आहे!');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 2000);
      } else {
        setError(
          `मोबाईल नंबर ${cleanMob} वर अद्याप सक्रिय स्टेटस आढळला नाही. कृपया आपला नोंदणीकृत मोबाईल नंबर तपासा किंवा मदतीसाठी हेल्पलाईनवर संपर्क साधा.`
        );
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'तात्पुरती त्रुटी आली.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header Bar */}
        <div className="relative p-5 pb-4 bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-slate-950">
              <ShieldCheck className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>अधिकृत खाते सिंक व पडताळणी केंद्र</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                🔄 माझा खाते स्टेटस सिंक करा
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 text-xs text-emerald-100">
            <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>अधिकृत खाते सिंक व पडताळणी प्रणाली</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              ॲपमध्ये सर्व बायोडाटा अपलोड करणे व स्थळे पाहणे मोफत आहे. आपले खाते आधीच पडताळणीकृत व सक्रिय असल्यास खाली आपला <strong>१०-अंकी नोंदणीकृत मोबाईल नंबर</strong> टाकून खाते स्टेटस सिंक करा.
            </p>
          </div>

          {/* Sync Form */}
          <form onSubmit={handleSync} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1.5">
                तुमचा १०-अंकी नोंदणीकृत मोबाईल नंबर:
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileInput}
                  onChange={(e) => {
                    setMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setError(null);
                  }}
                  placeholder="उदा. 9822012345"
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-950 border-2 border-amber-500/40 focus:border-amber-400 text-white font-mono text-base font-black tracking-wider placeholder-slate-600 focus:outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setLoginModalMode('member_otp');
                    setIsLoginOpen(true);
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs border border-amber-500/30 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>लॉगिन करा</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-emerald-950 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-5 h-5 text-slate-950 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'तपासत आहे...' : '🔄 माझा खाते स्टेटस सिंक करा'}</span>
            </button>
          </form>

          {/* Help Footer */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>मदतीसाठी अधिकृत हेल्पलाईन:</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${siteConfig?.contactEmail || 'gitevijay123@gmail.com'}`}
                  className="font-bold text-amber-300 hover:underline"
                >
                  📧 {siteConfig?.contactEmail || 'gitevijay123@gmail.com'}
                </a>
                <a
                  href={`tel:${siteConfig?.contactPhone || '9067969553'}`}
                  className="font-bold text-amber-300 hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3 text-amber-400" />
                  <span>{siteConfig?.contactPhone || '+91 90679 69553'}</span>
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              हे वंजारी समाजाचे अधिकृत मोफत वधू-वर परिचय व पडताळणी व्यासपीठ आहे.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

