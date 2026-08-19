import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, HeartHandshake, Sparkles, CheckCircle, Lock, MessageSquare } from 'lucide-react';

export const ProfileRemovalModal: React.FC = () => {
  const {
    currentUser,
    isProfileRemovalModalOpen,
    setIsProfileRemovalModalOpen,
    submitProfileRemovalRequest
  } = useApp();

  const [reason, setReason] = useState<'marriage_fixed' | 'personal_reasons' | 'other'>('marriage_fixed');
  const [partnerDetails, setPartnerDetails] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isProfileRemovalModalOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitProfileRemovalRequest({
      profileId: currentUser.id,
      profileName: currentUser.fullName,
      profileMobile: currentUser.mobileNumber,
      reason,
      partnerDetails,
      feedbackText
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsProfileRemovalModalOpen(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFDF5] w-full max-w-lg rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] p-4 sm:p-5 text-amber-100 flex items-center justify-between border-b border-amber-400/30 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-[#800C1E] rounded-xl shadow shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-lg tracking-tight text-amber-200">
                प्रोफाईल काढण्यासाठी किंवा विवाह जुळल्याची नोंदणी
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-100/80 font-medium">
                Request Profile Removal / Marriage Fixed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileRemovalModalOpen(false)}
            className="p-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="text-xl font-black text-[#A71930]">आपली विनंती यशस्वीपणे पाठवली आहे!</h4>
            <p className="text-xs sm:text-sm text-slate-700 max-w-sm mx-auto font-medium">
              ॲडमिन द्वारे पडताळणी करून तुमची प्रोफाईल काढून घेतली जाईल आणि मनःपूर्वक शुभेच्छा संदेश पाठवला जाईल. धन्यवाद!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* User Badge */}
            <div className="bg-amber-100/70 p-3 sm:p-3.5 rounded-2xl border border-amber-300 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] sm:text-xs">सदस्याचे नाव:</span>
                <span className="font-black text-slate-900 text-xs sm:text-sm">{currentUser.fullName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-bold block text-[10px] sm:text-xs">आयडी / मोबाईल:</span>
                <span className="font-mono font-extrabold text-[#A71930] text-xs">{currentUser.id} • {currentUser.mobileNumber}</span>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-[#800C1E]">
                प्रोफाईल काढण्याचे मुख्य कारण निवडा (Select Reason):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setReason('marriage_fixed')}
                  className={`p-3 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    reason === 'marriage_fixed'
                      ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow-md'
                      : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-base">💍</span>
                  <span>लग्न जुळले (Marriage Fixed)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReason('personal_reasons')}
                  className={`p-3 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    reason === 'personal_reasons'
                      ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow-md'
                      : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>वैयक्तिक कारण (Personal)</span>
                </button>
              </div>
            </div>

            {/* Marriage Details Form (if marriage fixed) */}
            {reason === 'marriage_fixed' && (
              <div className="space-y-3 bg-amber-50 p-3.5 sm:p-4 rounded-2xl border border-amber-300">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    जोडीदाराचे नाव / स्थळाविषयी संक्षिप्त माहिती (Partner Details - Optional):
                  </label>
                  <input
                    type="text"
                    value={partnerDetails}
                    onChange={(e) => setPartnerDetails(e.target.value)}
                    placeholder="उदा. विवाह निश्चित झाला किंवा संक्षिप्त माहिती..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>वंजारी जोडी पोर्टलबद्दल तुमचा अभिप्राय / संदेश:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="वंजारी जोडी पोर्टलमुळे आमचा विवाह सहज व सुलभरीत्या जुळला. मनापासून धन्यवाद!"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    हा अभिप्राय प्रशासकाच्या मान्यतेनंतर मुख्य पानावर 'यशोगाथा' (Success Story) मध्ये प्रसिद्ध केला जाईल.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 pb-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:from-[#A71930] hover:to-[#800C1E] text-amber-100 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 border border-amber-300 cursor-pointer transition-all active:scale-98"
              >
                <HeartHandshake className="w-4 h-4 text-amber-300 shrink-0" />
                <span>प्रशासकाकडे अर्ज पाठवा (Submit Request)</span>
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};
