import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import {
  X,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Gift,
  ArrowRight,
  HelpCircle,
  PhoneCall,
  Clock,
  Zap,
  Globe,
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
  defaultCode = '',
  onSuccess,
}) => {
  const { redeemActivationCode, siteConfig } = useApp();
  const [code, setCode] = useState<string>(defaultCode);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const handleApply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('कृपया ऍक्टिव्हेशन कोड प्रविष्ट करा.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await redeemActivationCode(code);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg(res.message);
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
          setCode('');
        }, 2200);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'तात्पुरती त्रुटी आली.');
    }
  };

  const handleQuickCode = (selectedCode: string) => {
    setCode(selectedCode);
    setError(null);
  };

  return (
    <div className="fixed inset-[#0000] z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="relative p-5 pb-4 bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-slate-950">
              <KeyRound className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>१-क्लिक मोफत ऍक्टिव्हेशन</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                🔑 ऍक्टिव्हेशन कोड प्रविष्ट करा
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Info Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">
                ॲपमध्ये कोणतेही इन-ॲप डिजिटल शुल्क आकारले जात नाही!
              </p>
              <p className="text-[11px] text-emerald-200/90 mt-0.5 leading-relaxed">
                तुमच्याकडे असलेला ऍक्टिव्हेशन कोड किंवा रिडीम कोड खाली टाका व त्वरित १-क्लिकमध्ये तुमचा प्लॅन ऍक्टिव्हेट करा.
              </p>
            </div>
          </div>



          {/* Form */}
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1.5">
                तुमचा ऍक्टिव्हेशन कोड (Activation / Coupon Code):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="उदा. VANJARI2026, ACTIVATION90"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border-2 border-amber-500/40 focus:border-amber-400 text-white font-mono text-base font-black tracking-wider uppercase placeholder-slate-600 focus:outline-none shadow-inner"
                  autoFocus
                />
                {code && (
                  <button
                    type="button"
                    onClick={() => setCode('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Sample Codes */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>लोकप्रिय मोफत ऍक्टिव्हेशन कोड्स (Quick Codes):</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { c: 'VANJARI2026', label: '१ वर्ष VIP' },
                  { c: 'ACTIVATION180', label: '६ महिने' },
                  { c: 'ACTIVATION90', label: '९० दिवस' },
                  { c: 'COMMUNITY100', label: '१ महिना' },
                ].map((item) => (
                  <button
                    key={item.c}
                    type="button"
                    onClick={() => handleQuickCode(item.c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border ${
                      code === item.c
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-amber-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {item.c} <span className="opacity-75 text-[10px]">({item.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-semibold animate-shake">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/80 to-emerald-950 border-2 border-emerald-400 text-emerald-200 text-xs font-bold animate-bounce-short flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Gift className="w-5 h-5 text-slate-950" />
              <span>{isSubmitting ? 'तपासत आहे...' : '🚀 ऍक्टिव्हेशन कोड लागू करा'}</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
          </form>

          {/* Help Footer */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1 text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>ऍक्टिव्हेशन कोड हवा असल्यास हेल्पलाईन:</span>
            </div>
            <a
              href={`tel:${siteConfig?.contactPhone || '9850000000'}`}
              className="font-bold text-amber-300 hover:underline flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>{siteConfig?.contactPhone || '+91 9850000000'}</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
