import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, FileText, Lock, RefreshCw, Phone, Mail, MapPin, CheckCircle2, Info, Building, CreditCard } from 'lucide-react';

export type PolicyTabType = 'terms' | 'privacy' | 'refund' | 'contact' | 'about_pricing';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  initialTab?: PolicyTabType;
  onClose: () => void;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const { siteConfig, language } = useApp();
  const [activeTab, setActiveTab] = useState<PolicyTabType>(initialTab);

  if (!isOpen) return null;

  const appName = siteConfig?.logoTitle || 'वंजारी जोडी मॅट्रिमोनी (VanjariJodi)';
  const contactPhone = siteConfig?.contactPhone || '910000000000';
  const contactEmail = siteConfig?.contactEmail || 'gitevijay123@gmail.com';
  const contactAddress = siteConfig?.contactAddress || 'महाराष्ट्र, भारत';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white text-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-amber-300/60 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] px-5 py-4 text-amber-100 flex items-center justify-between shrink-0 border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400 text-[#800C1E] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-200 tracking-tight">
                {language === 'en' ? 'Legal Policies & Compliance' : 'कायदेशीर धोरणे व माहिती (Legal & Compliance)'}
              </h2>
              <p className="text-[11px] text-amber-100/90 font-medium">
                {appName} • {language === 'en' ? 'Official Terms, Privacy & Refund Information' : 'अधिकृत अटी, गोपनीयता व परतावा माहिती'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-amber-100 transition-all cursor-pointer"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="bg-amber-50/80 border-b border-amber-200 p-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-thin">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Terms & Conditions' : 'अटी व शर्ती (Terms)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Privacy Policy' : 'गोपनीयता धोरण (Privacy)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'refund'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Refund Policy' : 'परतावा व रद्द धोरण (Refund)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Contact Us' : 'संपर्क साधा (Contact Us)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('about_pricing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'about_pricing'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'About & Plans' : 'आमच्याबद्दल व वर्गणी (Pricing)'}</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 leading-relaxed text-xs sm:text-sm">
          
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <FileText className="w-5 h-5 text-[#A71930]" />
                <h3>१. वापराच्या अटी व शर्ती (Terms & Conditions)</h3>
              </div>

              <p className="text-slate-600 font-medium">
                '{appName}' मॅट्रिमोनी मंचावर आपले स्वागत आहे. या वेबसाईटचा वापर करून आपण खालील अटी व शर्तींना मान्यता देत आहात.
              </p>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">पात्रता (Eligibility):</strong> या मंचावर नोंदणी करण्यासाठी वधूचे वय किमान १८ वर्षे आणि वराचे वय किमान २१ वर्षे असणे कायद्यानुसार बंधनकारक आहे.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">माहितीची सत्यता (Authenticity of Details):</strong> वापरकर्त्याने दिलेली वैयक्तिक, शैक्षणिक, कौटुंबिक व छायाचित्राची माहिती खरी असणे आवश्यक आहे. चुकीची किंवा खोटी माहिती आढळल्यास प्रोफाईल तात्काळ निलंबित केली जाईल.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">स्वतंत्र पडताळणी (Self Verification):</strong> 'वंजारी जोडी' हे केवळ वधू-वर व त्यांच्या पालकांना एकत्र आणणारे माध्यम आहे. विवाह निश्चित करण्यापूर्वी दोन्ही बाजूंनी परस्परांच्या माहितीची प्रत्यक्ष खात्री (Verification) करून घेणे ही पालकांची स्वतःची जबाबदारी असेल.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">खात्याची सुरक्षा (Account Safety):</strong> तुमचा लॉगिन आयडी, पासवर्ड किंवा ओटीपी दुसऱ्या कोणाशीही शेअर करू नका.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Lock className="w-5 h-5 text-[#A71930]" />
                <h3>२. गोपनीयता धोरण (Privacy Policy)</h3>
              </div>

              <p className="text-slate-600 font-medium">
                आम्ही आपल्या गोपनीयतेचा आणि वैयक्तिक माहितीचा पूर्ण आदर करतो. तुमच्या माहितीचे संरक्षण कसे केले जाते याचा तपशील खालीलप्रमाणे आहे:
              </p>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">सुरक्षित माहिती (Data Protection):</strong> तुमची मोबाईल नंबर, छायाचित्रे आणि वैयक्तिक तपशील एनक्रिप्टेड आणि सुरक्षित सर्व्हरवर साठवले जातात.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">संपर्क तपशील नियंत्रण (Contact Visibility Control):</strong> तुम्ही तुमच्या प्रोफाईल सेटिंग्जमधून तुमचा संपर्क क्रमांक किंवा फोटो लपवण्याचा किंवा फक्त मंजूर सदस्यांना दाखवण्याचा पर्याय निवडू शकता.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">तिसऱ्या पक्षास माहिती न देणे (No Third-Party Sharing):</strong> आम्ही तुमची वैयक्तिक माहिती कोणत्याही जाहिरातदार किंवा तिसऱ्या पक्षाला विकत नाही किंवा शेअर करत नाही.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">प्रोफाईल हटवणे (Profile Removal):</strong> लग्न जुळल्यास किंवा इतर कारणाने तुम्ही ॲपवरून थेट प्रोफाईल काढण्याचा (Profile Removal) अर्ज पाठवू शकता, ज्यामुळे तुमची माहिती कायमची काढली जाते.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <RefreshCw className="w-5 h-5 text-[#A71930]" />
                <h3>३. परतावा व रद्द धोरण (Refund & Cancellation Policy)</h3>
              </div>

              <p className="text-slate-600 font-medium">
                'वंजारी जोडी' वरील ऑनलाईन वर्गणी / प्रीमियम प्लॅन खरेदीसाठीचे परतावा नियम खालीलप्रमाणे लागू राहतील:
              </p>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">सेवा सक्रियता (Instant Service Activation):</strong> वर्गणीचा भरणा यशस्वी होताच डिजिटल प्लॅन व संपर्क क्रमांक पाहण्याची सुविधा तात्काळ सक्रिय होते.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">तांत्रिक त्रुटी आणि दुप्पट पेमेंट (Double Payment / Technical Failure):</strong> जर तांत्रिक चुकीमुळे एकाच प्लॅनसाठी तुमच्या खात्यातून दोनदा रक्कम कपात झाली असेल, तर अतिरिक्त कपात झालेली रक्कम ५ ते ७ कार्यालयीन दिवसांत (5-7 Working Days) तुमच्या मूळ पेमेंट स्त्रोतामध्ये (Original Payment Source - Payment Gateway/Bank) आपोआप परतावा (Refund) केली जाईल.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">सामान्य परतावा नियम (General Non-Refundable Policy):</strong> डिजिटल सेवा तात्काळ सुरू होत असल्यामुळे एकदा सक्रिय झालेला प्लॅन किंवा वापरलेले संपर्क क्रेडिट्स रद्द करता येत नाहीत आणि साधारण परिस्थितीमध्ये परतावा दिला जात नाही.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">परताव्यासाठी संपर्क (Refund Helpline):</strong> कोणत्याही पेमेंट संबंधित अडचणीसाठी तुम्ही आमच्या ॲडमिनशी किंवा <a href={`mailto:${contactEmail}`} className="text-[#A71930] font-bold underline">{contactEmail}</a> वर संपर्क साधू शकता. तक्रार प्राप्त झाल्यानंतर २४ ते ४८ तासांत तिचे निवारण केले जाईल.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Phone className="w-5 h-5 text-[#A71930]" />
                <h3>४. आमच्याशी संपर्क साधण्यासाठी (Contact Us)</h3>
              </div>

              <p className="text-slate-600 font-medium">
                कोणत्याही चौकशी, मदत किंवा मार्गदर्शनासाठी आमच्या मदत कक्षाशी संपर्क साधा:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-[#A71930]" />
                    <span>मोबाईल / व्हॉट्सॲप नंबर</span>
                  </div>
                  <p className="text-slate-900 font-black text-sm">{contactPhone}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-[#A71930]" />
                    <span>ई-मेल पत्ता (Email)</span>
                  </div>
                  <p className="text-slate-900 font-black text-sm">{contactEmail}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#A71930]" />
                    <span>अधिकृत कार्यालयीन पत्ता (Office Address)</span>
                  </div>
                  <p className="text-slate-900 font-extrabold text-sm">{contactAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT US & PRICING */}
          {activeTab === 'about_pricing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Building className="w-5 h-5 text-[#A71930]" />
                <h3>५. आमच्याबद्दल व वर्गणी योजना (About Us & Pricing Plans)</h3>
              </div>

              <p className="text-slate-600 font-medium">
                {siteConfig?.aboutUsText || 'वंजारी समाजातील वधू-वरांसाठी विश्वासाचे आणि सर्व सोयींनी युक्त डिजिटल मॅट्रिमोनी व्यासपीठ.'}
              </p>

              <div className="bg-gradient-to-r from-amber-100/80 to-amber-50 p-4 rounded-2xl border border-amber-300 space-y-2">
                <h4 className="font-extrabold text-[#800C1E] text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#A71930]" />
                  <span>प्रीमियम सदस्यत्व व सेवा (Services Offered):</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium text-xs sm:text-sm">
                  <li>मोफत नाव नोंदणी व बायोडाटा तयार करणे</li>
                  <li>इच्छुक प्रोफाईलचे थेट मोबाईल व व्हॉट्सॲप नंबर अनलॉक करणे</li>
                  <li>प्रिंटेड आकर्षक बायोडाटा डाऊनलोड व पीडीएफ शेअरिंग</li>
                  <li>सुरक्षित व गोपनीयता जपून मॅट्रिमोनी सेवा</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>© 2026 {appName}. All Rights Reserved.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#800C1E] hover:bg-[#A71930] text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            समजले / बंद करा
          </button>
        </div>

      </div>
    </div>
  );
};
