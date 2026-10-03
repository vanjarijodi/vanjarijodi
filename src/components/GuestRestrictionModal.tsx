import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, UserPlus, LogIn, X, Lock, Sparkles, HeartHandshake } from 'lucide-react';

export const GuestRestrictionModal: React.FC = () => {
  const {
    isGuestRestrictionModalOpen,
    setIsGuestRestrictionModalOpen,
    restrictedFeatureName,
    setIsRegisterOpen,
    setIsLoginOpen
  } = useApp();

  if (!isGuestRestrictionModalOpen) return null;

  const handleRegisterClick = () => {
    setIsGuestRestrictionModalOpen(false);
    setIsRegisterOpen(true);
  };

  const handleLoginClick = () => {
    setIsGuestRestrictionModalOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-amber-300 overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A71930] via-[#800C1E] to-[#A71930] text-amber-100 p-5 text-center relative">
          <button
            onClick={() => setIsGuestRestrictionModalOpen(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 text-amber-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-amber-400/20 rounded-full border border-amber-300/40 flex items-center justify-center mx-auto mb-2 text-amber-300">
            <Lock className="w-6 h-6" />
          </div>
          
          <h3 className="font-extrabold text-xl text-white">
            खाते नोंदणी आवश्यक!
          </h3>
          <p className="text-xs text-amber-200 mt-1">
            Account Registration Required
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-center">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#A71930] bg-white px-2.5 py-1 rounded-full border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{restrictedFeatureName || 'ही सुविधा'} अतिथी युझर्ससाठी मर्यादित आहे</span>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-relaxed pt-1">
              "तुमचा योग्य जीवनसाथी शोधण्यासाठी आजच नोंदणी करा! संपूर्ण प्रोफाईल आणि संपर्क क्रमांक पाहण्यासाठी येथे क्लिक करा."
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleRegisterClick}
              className="w-full py-3.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-extrabold rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>नवीन नोंदणी करा (Register Now)</span>
            </button>

            <button
              onClick={handleLoginClick}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>आधीच खाते आहे? लॉगिन करा</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 pt-1">
            <HeartHandshake className="w-3.5 h-3.5 text-[#A71930]" />
            <span>॥ श्री संत भगवान बाबा प्रसन्न ॥ • वंजारी जोडी मॅट्रिमोनी</span>
          </p>
        </div>
      </div>
    </div>
  );
};
