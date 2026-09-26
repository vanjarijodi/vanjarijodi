import React, { useState } from 'react';
import { X, AlertTriangle, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';
import { UserProfile, ProfileReport } from '../types';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface ReportProfileModalProps {
  isOpen: boolean;
  profile: UserProfile | null;
  onClose: () => void;
}

export const ReportProfileModal: React.FC<ReportProfileModalProps> = ({ isOpen, profile, onClose }) => {
  const { currentUser, submitProfileReport } = useApp();
  const [category, setCategory] = useState<ProfileReport['category']>('fake_abusive');
  const [description, setDescription] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useModalScrollLock(isOpen && !!profile);

  if (!isOpen || !profile) return null;

  const categories: { key: ProfileReport['category']; label: string; desc: string }[] = [
    { key: 'fake_abusive', label: 'बनावट / आक्षेपार्ह प्रोफाईल (Fake / Abusive)', desc: 'प्रोफाईल बनावट किंवा आक्षेपार्ह वाटत आहे' },
    { key: 'misleading_info', label: 'दिशाभूल करणारी माहिती (Misleading Info)', desc: 'नाव, वय, नोकरी किंवा कुटुंबाची खोटी माहिती' },
    { key: 'financial_fraud', label: 'आर्थिक फसवणूक / पैशांची मागणी (Financial Fraud)', desc: 'पैशांची मागणी किंवा आर्थिक फसवणुकीचा प्रयत्न' },
    { key: 'unauthorized_photos', label: 'अनधिकृत फोटो (Unauthorized Photos)', desc: 'दुसऱ्या कोणाचे फोटो वापरले आहेत' },
    { key: 'unprofessional_behavior', label: 'अयोग्य / गैरवर्तणूक (Unprofessional Behavior)', desc: 'चॅट किंवा कॉलवर गैरवर्तणूक केली' },
    { key: 'other', label: 'इतर कारण (Other Reason)', desc: 'वरील सूचीत नसलेले इतर कारण' },
  ];

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProofImage(ev.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('कृपया सविस्तर तक्रार विवरण (Description) नोंदवा.');
      return;
    }

    const categoryObj = categories.find(c => c.key === category);

    const reportData: ProfileReport = {
      id: 'rep_' + Date.now(),
      reporterUserId: currentUser?.id || 'guest_user',
      reporterUserName: currentUser?.fullName || 'अज्ञात युझर (Guest)',
      reporterUserMobile: currentUser?.mobile || '',
      reportedProfileId: profile.id,
      reportedProfileName: profile.fullName,
      reportedProfileMobile: profile.mobile,
      category,
      categoryLabel: categoryObj?.label || category,
      description,
      proofImageUrl: proofImage,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    submitProfileReport(reportData);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 overflow-hidden pt-safe pb-safe">
      <div className="bg-white rounded-none sm:rounded-3xl max-w-lg w-full h-full sm:h-auto overflow-hidden shadow-2xl border-0 sm:border border-amber-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col sm:my-auto max-h-none sm:max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">प्रोफाईल तक्रार नोंदवा (Report Profile)</h3>
              <p className="text-xs text-amber-200">तुमची तक्रार थेट ॲडमिन कडे पाठवली जाईल</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center border-4 border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-800">तक्रार यशस्वीरित्या नोंदवली गेली!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                ॲडमिन टीम या रिपोर्टची चौकशी करून आवश्यक ती कायदेशीर व तांत्रिक कारवाई करेल. धन्यवाद!
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#A71930] text-white font-bold rounded-2xl shadow-md hover:bg-[#800C1E]"
              >
                बंद करा
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Reported Profile Box */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium block">तक्रार असलेले स्थळ:</span>
                  <span className="font-black text-[#A71930] text-sm">{profile.fullName}</span>
                  <span className="text-slate-600 ml-2">(आयडी: {profile.id})</span>
                </div>
              </div>

              {/* Category Radio Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  १. तक्रारीचे कारण निवडा (Category) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {categories.map((c) => (
                    <label
                      key={c.key}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all text-xs ${
                        category === c.key ? 'bg-red-50 border-red-400 text-red-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportCategory"
                        checked={category === c.key}
                        onChange={() => setCategory(c.key)}
                        className="mt-0.5 accent-red-600"
                      />
                      <div>
                        <div>{c.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{c.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  २. सविस्तर माहिती / कारण (Detailed Description) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError('');
                  }}
                  placeholder="काय अडचण किंवा फसवणूक झाली आहे याचे सविस्तर वर्णन येथे लिहा..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              {/* Optional Proof Screenshot */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  ३. पुरावा / स्क्रीनशॉट (Screenshot Proof - Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>स्क्रीनशॉट अपलोड करा</span>
                    <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                  </label>
                  {proofImage && <span className="text-[10px] text-emerald-600 font-bold">✓ इमेज अपलोड झाली</span>}
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>तक्रार सादर करा (Submit Report)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
