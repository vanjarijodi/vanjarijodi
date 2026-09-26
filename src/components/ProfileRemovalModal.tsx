import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, HeartHandshake, Sparkles, CheckCircle, Lock, AlertTriangle, Trash2, Heart, ShieldAlert } from 'lucide-react';

export const ProfileRemovalModal: React.FC = () => {
  const {
    currentUser,
    isProfileRemovalModalOpen,
    setIsProfileRemovalModalOpen,
    submitProfileRemovalRequest,
    softDeleteProfile,
    logout,
  } = useApp();

  const [reason, setReason] = useState<'marriage_fixed' | 'personal_reasons' | 'privacy' | 'other'>('marriage_fixed');
  const [partnerDetails, setPartnerDetails] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [agreeDisclaimer, setAgreeDisclaimer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [targetUser, setTargetUser] = useState(currentUser);

  React.useEffect(() => {
    if (currentUser) {
      setTargetUser(currentUser);
    }
  }, [currentUser]);

  if (!isProfileRemovalModalOpen || (!currentUser && !isSubmitted && !targetUser)) return null;

  const userToDelete = currentUser || targetUser;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeDisclaimer) {
      alert('कृपया खालील डिस्क्लेमर व नियमांची पुष्टी करा.');
      return;
    }

    if (!userToDelete) {
      alert('वापरकर्ता माहिती उपलब्ध नाही.');
      return;
    }

    setIsDeleting(true);

    try {
      const uId = String(userToDelete.id).trim();
      const uName = userToDelete.fullName || 'सदस्य';
      const uMobile = userToDelete.mobileNumber || userToDelete.mobile || '';

      // 1. Submit removal record & feedback
      submitProfileRemovalRequest({
        profileId: uId,
        profileName: uName,
        profileMobile: uMobile,
        reason: reason === 'privacy' ? 'other' : reason,
        partnerDetails,
        feedbackText
      });

      // 2. Soft delete and move to Deleted Profiles / Recycle Bin
      await softDeleteProfile(uId);

      setIsSubmitted(true);
      setIsDeleting(false);

      setTimeout(() => {
        setIsSubmitted(false);
        setIsProfileRemovalModalOpen(false);
        logout();
      }, 2500);
    } catch (err) {
      console.error('Delete profile error:', err);
      setIsDeleting(false);
      alert('प्रोफाईल हटवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFFDF5] dark:bg-slate-900 w-full max-w-lg rounded-3xl border-2 border-amber-300 dark:border-amber-500/40 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] p-4 sm:p-5 text-amber-100 flex items-center justify-between border-b border-amber-400/30 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-[#800C1E] rounded-xl shadow shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-lg tracking-tight text-amber-200">
                प्रोफाईल डिलीट करा / लग्न जुळल्याची नोंद
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-100/80 font-medium">
                Delete Profile / Marriage Fixed & Experience
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
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 text-slate-800 dark:text-slate-100">
        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
              <CheckCircle className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="text-xl font-black text-[#A71930] dark:text-rose-400">
              आपली प्रोफाईल यशस्वीरीत्या हटवण्यात आली आहे!
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-sm mx-auto font-medium leading-relaxed">
              {reason === 'marriage_fixed'
                ? '💍 लग्न जुळल्याबद्दल वंजारी जोडी परिवाराकडून हार्दिक अभिनंदन व भावी वैवाहिक आयुष्यासाठी खूप खूप शुभेच्छा!'
                : 'आपली प्रोफाईल सुरक्षितपणे अर्काईव्ह करण्यात आली आहे. वंजारी जोडी सोबत जोडल्याबद्दल धन्यवाद!'}
            </p>
            <p className="text-[11px] text-slate-500 font-bold">लॉगआऊट होत आहे...</p>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            
            {/* User Badge */}
            <div className="bg-amber-100/70 dark:bg-slate-800 p-3 sm:p-3.5 rounded-2xl border border-amber-300 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-bold block text-[10px] sm:text-xs">सदस्याचे नाव:</span>
                <span className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{currentUser.fullName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 font-bold block text-[10px] sm:text-xs">आयडी / मोबाईल:</span>
                <span className="font-mono font-extrabold text-[#A71930] dark:text-rose-400 text-xs">{currentUser.id} • {currentUser.mobileNumber || currentUser.mobile}</span>
              </div>
            </div>

            {/* Official Marathi Disclaimer Box */}
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-2 text-rose-950 dark:text-rose-200 text-xs">
              <div className="font-black flex items-center gap-1.5 text-[#800C1E] dark:text-rose-400 text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>महत्त्वाच्या सूचना व नियम (Important Disclaimer):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                <li><strong>शोध यादीतून तात्काळ काढून टाकणे:</strong> प्रोफाईल डिलीट केल्यानंतर तुमचे सर्व फोटो, संपर्क क्रमांक आणि बायोडाटा मुख्य सूचीमधून तात्काळ लपवला जाईल.</li>
                <li><strong>लग्न जुळले असल्यास अनुभव:</strong> जर आपले शुभविवाह जुळले असेल, तर कृपया आपला अनुभव नक्की सांगा. तुमचा अनुभव इतर समाजबांधवांना प्रेरणा देईल.</li>
                <li><strong>डेटा सुरक्षा:</strong> डिलीट झालेली प्रोफाइल ॲडमिन कडे 'डिलीट केलेल्या प्रोफाईल्स' विभागात सुरक्षित राहते.</li>
              </ul>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-[#800C1E] dark:text-amber-400">
                प्रोफाईल डिलीट करण्याचे मुख्य कारण निवडा:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setReason('marriage_fixed')}
                  className={`p-3 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    reason === 'marriage_fixed'
                      ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
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
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>वैयक्तिक कारण</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReason('privacy')}
                  className={`p-3 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    reason === 'privacy'
                      ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>गोपनीयता / इतर</span>
                </button>
              </div>
            </div>

            {/* Marriage Details Form (if marriage fixed) */}
            {reason === 'marriage_fixed' && (
              <div className="space-y-3 bg-amber-50 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-amber-300 dark:border-slate-700 animate-fadeIn">
                <div className="bg-amber-100/80 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 text-xs font-bold text-[#800C1E] dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>अभिनंदन! वंजारी जोडी वधु-वर सूचक केंद्राबद्दल तुमचा अनुभव व शुभेच्छा शेअर करा:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      वर (मुलाचे नाव / Groom Name):
                    </label>
                    <input
                      type="text"
                      value={partnerDetails.split('|')[0] || ''}
                      onChange={(e) => {
                        const parts = partnerDetails.split('|');
                        setPartnerDetails(`${e.target.value}|${parts[1] || ''}|${parts[2] || ''}`);
                      }}
                      placeholder="उदा. राहुल रामराव आव्हाड"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                      वधू (मुलीचे नाव / Bride Name):
                    </label>
                    <input
                      type="text"
                      value={partnerDetails.split('|')[1] || ''}
                      onChange={(e) => {
                        const parts = partnerDetails.split('|');
                        setPartnerDetails(`${parts[0] || ''}|${e.target.value}|${parts[2] || ''}`);
                      }}
                      placeholder="उदा. स्नेहल विठ्ठल सानप"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    विवाह तारीख (Wedding Date):
                  </label>
                  <input
                    type="date"
                    value={partnerDetails.split('|')[2] || ''}
                    onChange={(e) => {
                      const parts = partnerDetails.split('|');
                      setPartnerDetails(`${parts[0] || ''}|${parts[1] || ''}|${e.target.value}`);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>आपला अनुभव व प्रतिक्रिया (Share Your Experience):</span>
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="वंजारी जोडी मॅट्रिमोनी पोर्टलमुळे आम्हाला मनपसंत व सुशिक्षित जोडीदार मिळाला. पोर्टलची सेवा व सुरक्षितता अतिशय उत्तम आहे. धन्यवाद!"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                  />
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    ✨ तुमचा हा प्रेरणादायी अनुभव मुख्य पृष्ठावरील 'यशस्वी विवाह गाथा' (Success Stories) मध्ये समाविष्ट केला जाईल.
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer Checkbox */}
            <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-slate-700 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="agreeDisclaimer"
                checked={agreeDisclaimer}
                onChange={(e) => setAgreeDisclaimer(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#800C1E] focus:ring-[#800C1E] cursor-pointer"
              />
              <label htmlFor="agreeDisclaimer" className="text-xs text-slate-800 dark:text-slate-200 font-bold cursor-pointer select-none">
                मी वरील सर्व नियम व सूचना वाचल्या आहेत. मला माझी प्रोफाईल कायमस्वरूपी डिलीट करायची आहे याची मी खात्री देतो/देते.
              </label>
            </div>

            {/* Submit / Delete Button */}
            <div className="pt-2 pb-2">
              <button
                type="submit"
                disabled={!agreeDisclaimer || isDeleting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 hover:from-rose-800 hover:to-rose-900 text-white font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 border border-rose-400/50 cursor-pointer transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 text-rose-200 shrink-0" />
                <span>{isDeleting ? 'डिलीट होत आहे...' : 'प्रोफाईल डिलीट करा (Confirm & Delete Profile)'}</span>
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};

