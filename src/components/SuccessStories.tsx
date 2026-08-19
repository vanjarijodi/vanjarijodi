import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import { Heart, Sparkles, Calendar, MapPin, Quote, ChevronLeft, ChevronRight, PlusCircle, X, CheckCircle, Upload, Loader2 } from 'lucide-react';

export const SuccessStories: React.FC = () => {
  const { language, successStories, isSuccessStoriesEnabled, submitSuccessStory, currentUser } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form states for self submission
  const [coupleName, setCoupleName] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [district, setDistrict] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [isUploadingStoryImage, setIsUploadingStoryImage] = useState(false);
  const [storyImageError, setStoryImageError] = useState<string | null>(null);

  // Show only approved success stories on public index page
  const approvedStories = successStories.filter((s) => s.status === 'approved' || !s.status);

  if (!isSuccessStoriesEnabled) return null;

  const activeStories = approvedStories.length > 0 ? approvedStories : successStories;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeStories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeStories.length) % activeStories.length);
  };

  const currentStory = activeStories[currentIndex] || activeStories[0];

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleName || !storyText) {
      alert('कृपया जोडप्याचे नाव आणि यशोगाथा प्रविष्ट करा.');
      return;
    }

    submitSuccessStory({
      coupleName,
      marriageDate: marriageDate || new Date().toISOString().split('T')[0],
      district: district || 'बीड',
      image: imageUrl || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
      story: storyText,
      storyMr: storyText,
      submittedByUserId: currentUser?.id,
      submittedByUserName: currentUser?.fullName,
    });

    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setIsSubmitModalOpen(false);
      setCoupleName('');
      setMarriageDate('');
      setDistrict('');
      setImageUrl('');
      setStoryText('');
    }, 2500);
  };

  return (
    <section id="success-stories-section" className="py-20 bg-slate-950 border-t border-amber-500/20 text-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30 uppercase tracking-widest">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
            <span>यशस्वी विवाह गाथा (Happy Couples)</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            आनंदी वंजारी जोडप्यांच्या <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">यशोगाथा</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            वंजारीजोडीच्या माध्यमातून एकत्र आलेली आणि सुखी संसार सुरू केलेली आमची यशस्वी जोडपी.
          </p>

          {/* User Self Submission Trigger Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 border border-amber-300"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>आपलीही यशोगाथा जोडा (आम्ही जुळलो)</span>
            </button>
          </div>
        </div>

        {/* IMAGE SLIDER FEATURED SHOWCASE */}
        {currentStory && (
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl relative">
            
            <div className="grid md:grid-cols-12 items-stretch">
              
              {/* Left: Couple Image */}
              <div className="md:col-span-6 relative h-72 md:h-auto min-h-[320px] overflow-hidden bg-slate-950">
                <img
                  src={currentStory.image}
                  alt={currentStory.coupleName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-950" />
                
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>यशस्वी विवाह</span>
                </div>
              </div>

              {/* Right: Story Details */}
              <div className="md:col-span-6 p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-amber-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>{currentStory.marriageDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>{currentStory.district}</span>
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white">
                    {currentStory.coupleName}
                  </h3>

                  <div className="relative pt-2">
                    <Quote className="w-8 h-8 text-amber-500/20 absolute -top-2 -left-2 rotate-180" />
                    <p className="text-sm text-slate-300 italic pl-6 leading-relaxed">
                      "{language === 'mr' ? currentStory.storyMr || currentStory.story : currentStory.story}"
                    </p>
                  </div>
                </div>

                {/* Slider Navigation & Counter */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    कथा {currentIndex + 1} पैकी {activeStories.length}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevSlide}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400 transition-all active:scale-95"
                      aria-label="Previous Couple"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400 transition-all active:scale-95"
                      aria-label="Next Couple"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* USER SUCCESS STORY SUBMISSION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-amber-300">
                  आपली यशोगाथा सादर करा (आम्ही जुळलो)
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmittedSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-black text-emerald-300">यशोगाथा पाठवली गेली!</h4>
                <p className="text-xs text-slate-300">
                  तुमची यशोगाथा प्रशासकांकडे (Admin) पाठवली आहे. मंजुरीनंतर ती होमपेजवर दिसेल.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitStory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">जोडप्याचे नाव (उदा. वर व वधूचे नाव):</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. वर व वधूचे नाव"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">विवाह तारीख:</label>
                    <input
                      type="date"
                      value={marriageDate}
                      onChange={(e) => setMarriageDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">जिल्हा:</label>
                    <input
                      type="text"
                      placeholder="उदा. बीड / नाशिक"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    जोडप्याचा फोटो (Upload Photo - स्पष्ट HD फोटो, ऑटो कॉम्प्रेस होतो):
                  </label>
                  {storyImageError && (
                    <p className="text-rose-400 font-bold text-[11px]">{storyImageError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="https://... किंवा खालील बटणाने फोटो अपलोड करा"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400 text-xs"
                    />
                    <label className="px-3.5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer flex items-center gap-1 shrink-0 shadow">
                      {isUploadingStoryImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>फोटो जोडा</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          setStoryImageError(null);
                          const file = e.target.files?.[0];
                          if (file) {
                            const val = validateFileSize(file);
                            if (!val.valid) {
                              setStoryImageError(val.errorMsg || 'फोटो अपलोड अयशस्वी.');
                              return;
                            }
                            setIsUploadingStoryImage(true);
                            const res = await uploadToCloudinary(file, 'vanjarijodi_stories');
                            setIsUploadingStoryImage(false);
                            if (res.success && res.url) {
                              setImageUrl(res.url);
                            } else {
                              setStoryImageError(res.error || 'फोटो अपलोड अयशस्वी.');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-400/50 mt-1">
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">यशोगाथा अनुभव / मनोगत:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="वंजारीजोडी पोर्टलद्वारे आमचे लग्न कसे जुळले याचा संक्षिप्त अनुभव लिहा..."
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-black text-slate-950 text-xs shadow-lg hover:brightness-110"
                >
                  यशोगाथा सबमिट करा (Submit For Approval)
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
