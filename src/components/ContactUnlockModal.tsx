import React from 'react';
import { useApp } from '../context/AppContext';
import { isGooglePlayReviewActive } from '../utils/playStorePaymentHelper';
import { CompliantAssistedMembershipModal } from './CompliantAssistedMembershipModal';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { formatProfileDisplayName } from '../utils/nameFormatter';
import {
  X,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';

export const ContactUnlockModal: React.FC = () => {
  const {
    isContactUnlockModalOpen,
    setIsContactUnlockModalOpen,
    selectedProfileForUnlock,
    setSelectedProfileForUnlock,
    siteConfig,
    currentUser,
    unlockContact,
    isAdminLoggedIn,
    language,
  } = useApp();

  useModalScrollLock(isContactUnlockModalOpen && !!selectedProfileForUnlock);

  if (!isContactUnlockModalOpen || !selectedProfileForUnlock) return null;

  const handleClose = () => {
    setIsContactUnlockModalOpen(false);
    setSelectedProfileForUnlock(null);
  };

  // If Offer Mode or Review Mode is explicitly active, allow 1-click free unlock
  if (
    isGooglePlayReviewActive(siteConfig) ||
    siteConfig?.isOfferModeEnabled ||
    siteConfig?.disableAllPaymentsInOfferMode
  ) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 overflow-hidden pt-safe pb-safe">
        <div className="relative w-full h-full sm:h-auto max-w-lg bg-gradient-to-b from-amber-50 via-white to-amber-50 rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border-2 border-amber-300/80 overflow-hidden sm:my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-[#A71930] text-amber-100 px-6 py-4 flex items-center justify-between border-b border-amber-300/30">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-300/40">
                <PhoneCall className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg leading-tight text-white">
                  संपर्क क्रमांक माहिती
                </h3>
                <p className="text-xs text-amber-200">
                  अधिकृत वंजारी जोडी समाज सेवा
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
                  {formatProfileDisplayName(
                    selectedProfileForUnlock.fullName,
                    currentUser,
                    isAdminLoggedIn,
                    false,
                    siteConfig,
                    language,
                    false,
                    selectedProfileForUnlock.id
                  )}
                </h4>
                <p className="text-xs text-slate-600">
                  {selectedProfileForUnlock.district} • {selectedProfileForUnlock.education}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>सत्यापित प्रोफाईल</span>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFDF5] border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-4 shadow-lg">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-black text-emerald-800">
                🎁 विशेष सण / मोफत संपर्क सेवा चालू आहे!
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                {siteConfig?.offerModeText || 'सध्या सर्व सदस्यांसाठी संपर्क क्रमांक पाहणे पूर्णपणे मोफत ठेवण्यात आले आहे.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  unlockContact(selectedProfileForUnlock.id);
                  handleClose();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-extrabold text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition cursor-pointer border border-emerald-300"
              >
                <span>🎉 १-क्लिकवर मोफत संपर्क पहा</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Strictly render the 100% Google Play Policy Compliant Assisted Account Sync Modal (Zero In-App Purchase)
  return (
    <CompliantAssistedMembershipModal
      isOpen={isContactUnlockModalOpen}
      onClose={handleClose}
      featureTitle="संपर्क क्रमांक"
      targetProfileName={selectedProfileForUnlock.fullName}
    />
  );
};
