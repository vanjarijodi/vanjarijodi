import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, FileText, Lock, RefreshCw, Phone, Mail, MapPin, CheckCircle2, Info, Building, CreditCard, Scale, UserCheck, AlertTriangle } from 'lucide-react';

export type PolicyTabType = 'terms' | 'privacy' | 'refund' | 'contact' | 'about_pricing' | 'grievance';

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

  const isEn = language === 'en';
  const appName = isEn ? 'Vanjari Jodi Matrimony (VanjariJodi)' : (siteConfig?.logoTitle || 'वंजारी जोडी मॅट्रिमोनी');
  const contactPhone = siteConfig?.contactPhone || '+91 9405790916';
  const contactEmail = siteConfig?.contactEmail || 'gitevijay123@gmail.com';
  const contactAddress = siteConfig?.contactAddress || 'परळी वैजनाथ / नाशिक / पुणे, महाराष्ट्र (४१४००१)';

  // Grievance Officer details provided strictly by the user
  const grievanceOfficerName = siteConfig?.grievanceOfficerName || 'Gite Vijay';
  const grievanceOfficerEmail = siteConfig?.grievanceOfficerEmail || 'gitevijay123@gmail.com';
  const grievanceOfficerPhone = siteConfig?.grievanceOfficerPhone || '+91 9405790916';
  const grievanceOfficerAddress = siteConfig?.grievanceOfficerAddress || contactAddress;

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
                {isEn ? 'Legal Policies & Statutory Compliance' : 'कायदेशीर धोरणे व माहिती (Legal & Compliance)'}
              </h2>
              <p className="text-[11px] text-amber-100/90 font-medium">
                {appName} • {isEn ? 'Official Terms, Privacy, Refund & Grievance Redressal' : 'अधिकृत अटी, गोपनीयता, परतावा व तक्रार निवारण कक्ष'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-amber-100 transition-all cursor-pointer"
            title={isEn ? 'Close' : 'बंद करा'}
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
            <span>{isEn ? 'Terms & Conditions' : 'अटी व शर्ती (Terms)'}</span>
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
            <span>{isEn ? 'Privacy Policy' : 'गोपनीयता धोरण (Privacy)'}</span>
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
            <span>{isEn ? 'Refund Policy' : 'परतावा व रद्द धोरण (Refund)'}</span>
          </button>

          {/* Grievance Officer Tab - Mandatory IT Rule Compliance */}
          <button
            onClick={() => setActiveTab('grievance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'grievance'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'Grievance Officer (IT Rules)' : 'तक्रार निवारण अधिकारी (Grievance)'}</span>
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
            <span>{isEn ? 'Contact Us' : 'संपर्क साधा (Contact Us)'}</span>
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
            <span>{isEn ? 'About & Plans' : 'आमच्याबद्दल व वर्गणी (Pricing)'}</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 leading-relaxed text-xs sm:text-sm">
          
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <FileText className="w-5 h-5 text-[#A71930]" />
                <h3>{isEn ? '1. Terms & Conditions of Use' : '१. वापराच्या अटी व शर्ती (Terms & Conditions)'}</h3>
              </div>

              <p className="text-slate-600 font-medium">
                {isEn
                  ? `Welcome to '${appName}'. By accessing or using our matrimonial matchmaking services, you agree to be bound by the following Terms and Conditions under the Information Technology Act, 2000 and applicable Indian laws.`
                  : `'${appName}' मॅट्रिमोनी मंचावर आपले स्वागत आहे. या वेबसाईटचा वापर करून आपण खालील अटी व शर्तींना मान्यता देत आहात.`}
              </p>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Eligibility Criteria:' : 'पात्रता (Eligibility):'}</strong> {isEn ? 'Users must be legally eligible for marriage in India (Brides must be at least 18 years and Grooms must be at least 21 years of age). Single, divorced, and widowed individuals from the community may register.' : 'या मंचावर नोंदणी करण्यासाठी वधूचे वय किमान १८ वर्षे आणि वराचे वय किमान २१ वर्षे असणे कायद्यानुसार बंधनकारक आहे.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Authenticity of Information:' : 'माहितीची सत्यता (Authenticity of Details):'}</strong> {isEn ? 'Users must provide accurate, truthful personal, educational, family, and photograph records. Providing deceptive or forged profiles is strictly prohibited and subject to immediate account suspension and legal reporting.' : 'वापरकर्त्याने दिलेली वैयक्तिक, शैक्षणिक, कौटुंबिक व छायाचित्राची माहिती खरी असणे आवश्यक आहे. चुकीची किंवा खोटी माहिती आढळल्यास प्रोफाईल तात्काळ निलंबित केली जाईल.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Independent Verification:' : 'स्वतंत्र पडताळणी (Self Verification):'}</strong> {isEn ? "VanjariJodi serves strictly as a digital matchmaking facilitator (Intermediary). Parents, guardians, and candidates are solely responsible for independently investigating and verifying the bride/groom's character, employment, and family background prior to finalizing any alliance." : "'वंजारी जोडी' हे केवळ वधू-वर व त्यांच्या पालकांना एकत्र आणणारे माध्यम आहे. विवाह निश्चित करण्यापूर्वी दोन्ही बाजूंनी परस्परांच्या माहितीची प्रत्यक्ष खात्री (Verification) करून घेणे ही पालकांची स्वतःची जबाबदारी असेल."}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Account Confidentiality:' : 'खात्याची सुरक्षा (Account Safety):'}</strong> {isEn ? 'Users are responsible for safeguarding their login credentials. Never disclose your OTP or password to unauthorized third parties.' : 'तुमचा लॉगिन आयडी, पासवर्ड किंवा ओटीपी दुसऱ्या कोणाशीही शेअर करू नका.'}
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
                <h3>{isEn ? '2. Privacy Policy & Data Protection' : '२. गोपनीयता धोरण (Privacy Policy)'}</h3>
              </div>

              <p className="text-slate-600 font-medium">
                {isEn
                  ? 'We take data protection and privacy very seriously in accordance with the Digital Personal Data Protection (DPDP) Act and IT Rules. Here is how your personal data is handled:'
                  : 'आम्ही आपल्या गोपनीयतेचा आणि वैयक्तिक माहितीचा पूर्ण आदर करतो. तुमच्या माहितीचे संरक्षण कसे केले जाते याचा तपशील खालीलप्रमाणे आहे:'}
              </p>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Secure Data Encryption:' : 'सुरक्षित माहिती (Data Protection):'}</strong> {isEn ? 'Mobile numbers, government ID proofs (Aadhaar where applicable), and photographs are securely stored on encrypted enterprise cloud databases.' : 'तुमची मोबाईल नंबर, छायाचित्रे आणि वैयक्तिक तपशील एनक्रिप्टेड आणि सुरक्षित सर्व्हरवर साठवले जातात.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Granular Privacy Controls:' : 'संपर्क तपशील नियंत्रण (Contact Visibility Control):'}</strong> {isEn ? 'You retain full autonomy over your contact number and photograph visibility. You may hide your mobile number or allow access only to approved/mutual-like connections.' : 'तुम्ही तुमच्या प्रोफाईल सेटिंग्जमधून तुमचा संपर्क क्रमांक किंवा फोटो लपवण्याचा किंवा फक्त मंजूर सदस्यांना दाखवण्याचा पर्याय निवडू शकता.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Zero Third-Party Commercial Sale:' : 'तिसऱ्या पक्षास माहिती न देणे (No Third-Party Sharing):'}</strong> {isEn ? 'We never sell, rent, or lease your private matchmaking data to telemarketers, commercial advertisers, or external brokers.' : 'आम्ही तुमची वैयक्तिक माहिती कोणत्याही जाहिरातदार किंवा तिसऱ्या पक्षाला विकत नाही किंवा शेअर करत नाही.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Right to Erasure / Profile Removal:' : 'प्रोफाईल हटवणे (Profile Removal):'}</strong> {isEn ? 'Once marriage is finalized or if you wish to discontinue, you can initiate a Profile Removal request to permanently purge your data from public viewing.' : 'लग्न जुळल्यास किंवा इतर कारणाने तुम्ही ॲपवरून थेट प्रोफाईल काढण्याचा (Profile Removal) अर्ज पाठवू शकता, ज्यामुळे तुमची माहिती कायमची काढली जाते.'}
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
                <h3>{isEn ? '3. Refund & Cancellation Policy' : '३. परतावा व रद्द धोरण (Refund & Cancellation Policy)'}</h3>
              </div>

              <p className="text-slate-600 font-medium">
                {isEn
                  ? 'The following policy outlines digital subscription fees, payment processing, and refund guidelines:'
                  : "'वंजारी जोडी' वरील ऑनलाईन वर्गणी / प्रीमियम प्लॅन खरेदीसाठीचे परतावा नियम खालीलप्रमाणे लागू राहतील:"}
              </p>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Instant Service Activation:' : 'सेवा सक्रियता (Instant Service Activation):'}</strong> {isEn ? 'Upon successful payment verification, membership plans and contact unlock privileges activate instantly in real-time.' : 'वर्गणीचा भरणा यशस्वी होताच डिजिटल प्लॅन व संपर्क क्रमांक पाहण्याची सुविधा तात्काळ सक्रिय होते.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Duplicate / Failed Deductions:' : 'तांत्रिक त्रुटी आणि दुप्पट पेमेंट (Double Payment / Technical Failure):'}</strong> {isEn ? 'If your bank account was debited multiple times due to gateway timeouts or technical faults, the duplicate amount will be automatically refunded to your original payment source within 5-7 business working days.' : 'जर तांत्रिक चुकीमुळे एकाच प्लॅनसाठी तुमच्या खात्यातून दोनदा रक्कम कपात झाली असेल, तर अतिरिक्त कपात झालेली रक्कम ५ ते ७ कार्यालयीन दिवसांत (5-7 Working Days) तुमच्या मूळ पेमेंट स्त्रोतामध्ये (Original Payment Source - Payment Gateway/Bank) आपोआप परतावा (Refund) केली जाईल.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Non-Refundable Used Services:' : 'सामान्य परतावा नियम (General Non-Refundable Policy):'}</strong> {isEn ? 'Since contact details and matchmaking features are rendered immediately upon subscription, membership fees once utilized cannot be refunded.' : 'डिजिटल सेवा तात्काळ सुरू होत असल्यामुळे एकदा सक्रिय झालेला प्लॅन किंवा वापरलेले संपर्क क्रेडिट्स रद्द करता येत नाहीत आणि साधारण परिस्थितीमध्ये परतावा दिला जात नाही.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">{isEn ? 'Payment Grievance Escalation:' : 'परताव्यासाठी संपर्क (Refund Helpline):'}</strong> {isEn ? 'For any payment or invoice clarification, write directly to our helpdesk at ' : 'कोणत्याही पेमेंट संबंधित अडचणीसाठी तुम्ही आमच्या ॲडमिनशी किंवा '}<a href={`mailto:${contactEmail}`} className="text-[#A71930] font-bold underline">{contactEmail}</a>{isEn ? '. Requests are resolved within 24 to 48 hours.' : ' वर संपर्क साधू शकता. तक्रार प्राप्त झाल्यानंतर २४ ते ४८ तासांत तिचे निवारण केले जाईल.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GRIEVANCE REDRESSAL OFFICER (IT ACT 2000 & DPDP ACT COMPLIANCE) */}
          {activeTab === 'grievance' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Scale className="w-5 h-5 text-[#A71930]" />
                <h3>{isEn ? '4. Grievance Redressal Officer (IT Rules Compliance)' : '४. तक्रार निवारण अधिकारी व कायदेशीर कक्ष (Grievance Redressal)'}</h3>
              </div>

              <div className="bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#800C1E] text-amber-200 shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-[#800C1E]">
                      {isEn ? 'Statutory Appointment under Information Technology (Intermediary Guidelines) Rules, 2021' : 'माहिती तंत्रज्ञान कायदा (IT Act 2000 & Rules 2021) अंतर्गत नियुक्त तक्रार निवारण अधिकारी'}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {isEn
                        ? 'In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Data Protection regulations, the contact details of the Grievance Officer are published below:'
                        : 'माहिती तंत्रज्ञान कायद्यानुसार संकेतस्थळावर कोणत्याही वापरकर्त्याच्या तक्रारीचे वेळेत निवारण करण्यासाठी खालीलप्रमाणे अधिकृत तक्रार निवारण अधिकारी (Grievance Officer) नियुक्त करण्यात आले आहेत:'}
                    </p>
                  </div>
                </div>

                {/* Grievance Officer Card */}
                <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      {isEn ? 'Designated Grievance Officer' : 'तक्रार निवारण अधिकारी (नाव)'}
                    </span>
                    <p className="text-slate-900 font-black text-base flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#A71930]" />
                      <span>{grievanceOfficerName}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      {isEn ? 'Official Email for Grievances' : 'अधिकृत तक्रार निवारण ईमेल'}
                    </span>
                    <p className="text-slate-900 font-bold">
                      <a href={`mailto:${grievanceOfficerEmail}`} className="text-[#A71930] hover:underline flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-[#A71930]" />
                        <span>{grievanceOfficerEmail}</span>
                      </a>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      {isEn ? 'Direct Grievance Contact / Phone' : 'तक्रार निवारण संपर्क क्रमांक'}
                    </span>
                    <p className="text-slate-900 font-black text-sm flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-[#A71930]" />
                      <a href={`tel:${grievanceOfficerPhone.replace(/\s+/g, '')}`} className="text-slate-900 hover:text-[#A71930]">
                        {grievanceOfficerPhone}
                      </a>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      {isEn ? 'Jurisdiction & Office Location' : 'अधिकार क्षेत्र व कार्यालयीन पत्ता'}
                    </span>
                    <p className="text-slate-800 font-medium flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#A71930] shrink-0" />
                      <span>{grievanceOfficerAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Timeline and SLA Note */}
                <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300 text-slate-700 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#800C1E]">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{isEn ? 'Grievance Redressal SLA & Turnaround Timeline:' : 'तक्रार निवारण कालमर्यादा व नियम (Timeline):'}</span>
                  </div>
                  <p>
                    {isEn
                      ? '1. All received grievances (fake profile, abusive content, financial impersonation, or privacy breach) are acknowledged within 24 hours of receipt.'
                      : '१. प्राप्त झालेल्या सर्व तक्रारींची (खोटे प्रोफाईल, आक्षेपार्ह मजकूर किंवा गैरव्यवहार) २४ तासांत दखल घेतली जाईल.'}
                  </p>
                  <p>
                    {isEn
                      ? '2. Grievances are systematically investigated and fully resolved within 15 days in compliance with statutory provisions.'
                      : '२. कायदेशीर नियमांनुसार संपूर्ण चौकशी करून १५ दिवसांच्या आत तक्रारीचे निवारण केले जाईल.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Phone className="w-5 h-5 text-[#A71930]" />
                <h3>{isEn ? '5. Contact Helpdesk & Support' : '५. आमच्याशी संपर्क साधण्यासाठी (Contact Us)'}</h3>
              </div>

              <p className="text-slate-600 font-medium">
                {isEn
                  ? 'For general inquiries, profile verification assistance, or member support, reach our helpdesk team:'
                  : 'कोणत्याही चौकशी, मदत किंवा मार्गदर्शनासाठी आमच्या मदत कक्षाशी संपर्क साधा:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'Mobile / WhatsApp Helpline' : 'मोबाईल / व्हॉट्सॲप नंबर'}</span>
                  </div>
                  <p className="text-slate-900 font-black text-sm">{contactPhone}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'Official Email Address' : 'ई-मेल पत्ता (Email)'}</span>
                  </div>
                  <p className="text-slate-900 font-black text-sm">{contactEmail}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'Office Location & Administrative Address' : 'अधिकृत कार्यालयीन पत्ता (Office Address)'}</span>
                  </div>
                  <p className="text-slate-900 font-extrabold text-sm">{contactAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT US & PRICING */}
          {activeTab === 'about_pricing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Building className="w-5 h-5 text-[#A71930]" />
                <h3>{isEn ? '6. About Platform & Membership Plans' : '६. आमच्याबद्दल व वर्गणी योजना (About Us & Pricing Plans)'}</h3>
              </div>

              <p className="text-slate-600 font-medium">
                {isEn
                  ? 'Vanjari Jodi Matrimony is the dedicated matchmaking network for Vanjari community families across Maharashtra and abroad, combining verified profiles with high privacy and community cultural traditions.'
                  : (siteConfig?.aboutUsText || 'वंजारी समाजातील वधू-वरांसाठी विश्वासाचे आणि सर्व सोयींनी युक्त डिजिटल मॅट्रिमोनी व्यासपीठ.')}
              </p>

              <div className="bg-gradient-to-r from-amber-100/80 to-amber-50 p-4 rounded-2xl border border-amber-300 space-y-2">
                <h4 className="font-extrabold text-[#800C1E] text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#A71930]" />
                  <span>{isEn ? 'Services Offered:' : 'प्रीमियम सदस्यत्व व सेवा (Services Offered):'}</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium text-xs sm:text-sm">
                  <li>{isEn ? 'Free profile registration & automated matrimonial biodata generation' : 'मोफत नाव नोंदणी व बायोडाटा तयार करणे'}</li>
                  <li>{isEn ? 'Direct mobile & WhatsApp unlocking for interested profiles' : 'इच्छुक प्रोफाईलचे थेट मोबाईल व व्हॉट्सॲप नंबर अनलॉक करणे'}</li>
                  <li>{isEn ? 'High-quality printable biodata download and PDF sharing' : 'प्रिंटेड आकर्षक बायोडाटा डाऊनलोड व पीडीएफ शेअरिंग'}</li>
                  <li>{isEn ? 'End-to-end privacy controls and Aadhaar-backed credibility' : 'सुरक्षित व गोपनीयता जपून मॅट्रिमोनी सेवा'}</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>© 2026 {appName}. {isEn ? 'All Rights Reserved.' : 'सर्व हक्क सुरक्षित.'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#800C1E] hover:bg-[#A71930] text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            {isEn ? 'Close Window' : 'समजले / बंद करा'}
          </button>
        </div>

      </div>
    </div>
  );
};
