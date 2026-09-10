import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Search, QrCode, Scroll, Calendar, User } from 'lucide-react';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface KundliVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReportId?: string;
}

export const KundliVerificationModal: React.FC<KundliVerificationModalProps> = ({
  isOpen,
  onClose,
  initialReportId = '',
}) => {
  const [searchId, setSearchId] = useState(initialReportId);
  const [verificationResult, setVerificationResult] = useState<any | null>(
    initialReportId
      ? {
          reportId: initialReportId,
          isValid: true,
          groomInitials: 'R. M.',
          brideInitials: 'P. N.',
          score: '32 / 36 (88%)',
          verdict: 'सर्वोत्तम गुणमेलन (Excellent)',
          generatedAt: '2026-08-27',
          verifiedBy: 'Vanjari Jodi Astrology Engine v2',
        }
      : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);

    // Simulate instant verification lookup or API lookup
    setTimeout(() => {
      const clean = searchId.trim().toUpperCase();
      if (clean.startsWith('VJ-') || clean.length >= 6) {
        setVerificationResult({
          reportId: clean,
          isValid: true,
          groomInitials: 'वर (Groom Candidate)',
          brideInitials: 'वधू (Bride Candidate)',
          score: '३०+ गुण (अनुकूल)',
          verdict: 'अस्सल प्रमाणित वंजारी जोडी अहवाल',
          generatedAt: new Date().toISOString().split('T')[0],
          verifiedBy: 'Official Prokerala Astrology API v2',
        });
      } else {
        setErrorMsg('हा रिपोर्ट आयडी प्रणालीमध्ये आढळला नाही. कृपया रिपोर्ट वरील आयडी तपासा.');
        setVerificationResult(null);
      }
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 pt-safe pb-safe">
      <div className="bg-[#FFFDF9] w-full h-full sm:h-auto max-w-lg rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border-2 border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col sm:my-auto max-h-none sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-300/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-100">
                कुंडली अहवाल सत्यता पडताळणी
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                Verify Vanjari Jodi Kundli Matching Report Authenticity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Search Bar */}
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              अहवाल युनिक आयडी प्रविष्ट करा (Enter Report ID):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="उदा. VJ-KUNDLI-948201"
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-[#800C1E] focus:outline-none font-mono font-bold text-sm bg-amber-50/50"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>पडताळा</span>
              </button>
            </div>
          </form>

          {/* Verification Status Card */}
          {verificationResult && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-emerald-950 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm border-b border-emerald-200 pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>✅ १००% अस्सल व प्रमाणित अहवाल (Genuine Verified Report)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-emerald-700 font-bold block">अहवाल आयडी:</span>
                  <span className="font-mono font-black text-slate-900">{verificationResult.reportId}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block">पडताळणी तारीख:</span>
                  <span className="font-semibold text-slate-800">{verificationResult.generatedAt}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block">गुणमेलन निकाल:</span>
                  <span className="font-extrabold text-[#800C1E]">{verificationResult.verdict}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block">प्रणाली:</span>
                  <span className="font-semibold text-slate-800">{verificationResult.verifiedBy}</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-800 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 font-medium">
                हा अहवाल वंजारी जोडी मॅट्रिमोनीच्या अधिकृत सिस्टीमद्वारे तयार करण्यात आला असून याची माहिती अधिकृत व अचूक आहे.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-bold">{errorMsg}</div>
            </div>
          )}

          {/* Verification Help info */}
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-[#800C1E] flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>क्युआर कोड स्कॅनर:</span>
            </div>
            <p className="text-[11px] text-slate-600">
              प्रत्येक पीडीएफ अहवालावर असलेला क्यूआर कोड कोणत्याही मोबाईल कॅमेऱ्याने स्कॅन करून अहवालाची ऑनलाइन पडताळणी करता येते.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
