import React from 'react';
import {
  X,
  ShieldCheck,
  Phone,
  MessageCircle,
  Lock,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  UserCheck,
  FileCheck
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
 * Google Play Store Policy Compliant Bottom Sheet / Dialog
 * 
 * Strict Compliance Rules:
 * 1. Zero in-app payment SDKs, zero payment gateways, zero UPI/QR code buttons.
 * 2. Zero monetization keywords ("Buy", "Pay ₹XXX", "Recharge", "Subscription Store").
 * 3. Zero external checkout steering links.
 * 4. Assisted consultation workflow via WhatsApp and Phone Support.
 * 5. Neutral mandatory note: "डिजिटल खरेदी ॲपमध्ये उपलब्ध नाही."
 */
export const CompliantAssistedMembershipModal: React.FC<CompliantAssistedMembershipModalProps> = ({
  isOpen,
  onClose,
  featureTitle,
  targetProfileName,
}) => {
  const { currentUser, siteConfig, paymentConfig } = useApp();

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  // Retrieve admin contact information neutrally
  const adminRawPhone =
    paymentConfig?.whatsappNumber ||
    (siteConfig as any)?.adminWhatsApp ||
    paymentConfig?.adminMobileNumber ||
    (siteConfig as any)?.adminMobile ||
    '9822012345';

  const cleanPhone = String(adminRawPhone).replace(/\D/g, '').slice(-10);
  const waInternationalNumber = `91${cleanPhone}`;

  // Pre-filled WhatsApp message as specified in Google Play compliance requirements
  const userIdText = currentUser?.id || 'अतिथी सदस्य';
  const userPhoneText = currentUser?.mobile || currentUser?.mobileNumber || 'नोंदणीकृत क्रमांक';

  const prefilledText = `नमस्ते, मला माझे वंजारी जोडी (Vanjari Jodi) प्रोफाईल व्हेरिफाय आणि अपग्रेड करायचे आहे. माझा यूजर आयडी: ${userIdText}, फोन: ${userPhoneText}`;
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92vh] flex flex-col transform transition-all animate-slideUp">
        {/* Header Header Banner */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#9B1229] to-[#600816] text-white p-5 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* Close Button */}
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
                <span>अधिकृत सहाय्य व पडताळणी</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 leading-tight">
                अकाउंट पडताळणी आणि प्रीमियम सेवा
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Subtitle / Context Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {featureTitle ? `${featureTitle} - सुरक्षित प्रवेश` : 'सुरक्षित बायोडाटा प्रवेश'}
              </span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">
              बायोडाटा सुरक्षिततेसाठी संपर्क क्रमांक व प्रगत माहिती केवळ पडताळणी पूर्ण झालेल्या सदस्यांसाठी उपलब्ध आहे.
            </p>
            {targetProfileName && (
              <p className="text-[11px] text-amber-800 font-bold pt-1">
                स्थळ: {targetProfileName}
              </p>
            )}
          </div>

          {/* User Details Identification Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>तुमचे सदस्यत्व तपशील</span>
              <span className="text-amber-700 font-black">वंजारी जोडी</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div className="p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">यूजर आयडी:</span>
                <span className="font-bold text-slate-900 truncate block">{userIdText}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">मोबाईल नंबर:</span>
                <span className="font-bold text-slate-900 truncate block">{userPhoneText}</span>
              </div>
            </div>
          </div>

          {/* Verification Benefits */}
          <div className="space-y-2 py-1">
            <span className="text-xs font-black text-slate-800 block">
              पडताळणीनंतर मिळणाऱ्या सुविधा:
            </span>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>सत्यापित स्थळांचे थेट संपर्क क्रमांक व व्हॉट्सॲप पाहण्याची सुविधा</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>सविस्तर जन्मपत्रिका, गुणमेलन व कौटुंबिक पार्श्वभूमी ॲक्सेस</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>वंजारी समाजातील अस्सल, १००% पडताळणी झालेल्या कुटुंबांशी थेट संवाद</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-2.5 pt-2">
            {/* Action Button 1: WhatsApp Support (Primary) */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>WhatsApp वर मदत मिळवा</span>
            </button>

            {/* Action Button 2: Call Support (Secondary) */}
            <button
              type="button"
              onClick={handleCallSupport}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-300/80 active:scale-[0.98] transition cursor-pointer"
            >
              <Phone className="w-4 h-4 text-slate-600" />
              <span>कॉल करा (+91 {cleanPhone})</span>
            </button>
          </div>

          {/* Mandatory Google Play Policy Compliant Neutral Note */}
          <div className="pt-2 pb-1 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-semibold inline-flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>डिजिटल खरेदी ॲपमध्ये उपलब्ध नाही.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliantAssistedMembershipModal;
