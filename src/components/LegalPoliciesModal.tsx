import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { X, ShieldCheck, FileText, Lock, RefreshCw, Phone, Mail, MapPin, CheckCircle2, Info, Building, CreditCard, Scale, UserCheck, AlertTriangle, MessageCircle, Clock, Award } from 'lucide-react';

export type PolicyTabType = 'terms' | 'privacy' | 'refund' | 'cancellation' | 'shipping' | 'about' | 'pricing' | 'contact' | 'grievance';

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

  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const isEn = language === 'en';
  const businessName = siteConfig?.businessName || 'VANJARIJODI MATRIMONY';
  const tradeName = siteConfig?.tradeName || 'Vanjari Jodi';
  const appName = isEn ? 'Vanjari Jodi Matrimony' : (siteConfig?.logoTitle || 'वंजारी जोडी मॅट्रिमोनी');
  const contactEmail = siteConfig?.contactEmail || 'gitevijay123@gmail.com';
  const telegramUsername = siteConfig?.telegramUsername || 'Primemultiservice';
  const contactAddress = siteConfig?.contactAddress || 'At Post Padali, Taluka Shirur (Kasar), District Beed, Maharashtra - 413249';
  const operatingHours = siteConfig?.operatingHours || 'Monday to Saturday | 10:00 AM – 06:00 PM';

  // Grievance Officer details
  const grievanceOfficerName = siteConfig?.grievanceOfficerName || 'Gite Vijay';
  const grievanceOfficerEmail = siteConfig?.grievanceOfficerEmail || 'gitevijay123@gmail.com';
  const grievanceOfficerAddress = siteConfig?.grievanceOfficerAddress || 'At Post Padali, Taluka Shirur (Kasar), District Beed, Maharashtra - 413249';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 pt-safe pb-safe">
      <div className="bg-white text-slate-800 w-full h-full sm:h-auto max-w-4xl max-h-none sm:max-h-[90vh] rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-amber-300/60 flex flex-col overflow-hidden sm:my-auto">
        
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
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms & Conditions</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'refund'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Return & Refund Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('cancellation')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cancellation'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancellation Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Shipping & Delivery Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pricing & Services (INR)</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact & Address</span>
          </button>

          <button
            onClick={() => setActiveTab('grievance')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'grievance'
                ? 'bg-[#800C1E] text-amber-200 shadow-md border border-amber-400'
                : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>Grievance Officer</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 leading-relaxed text-xs sm:text-sm">
          
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <FileText className="w-5 h-5 text-[#A71930]" />
                <h3>1. Terms & Conditions of Service</h3>
              </div>

              {/* MANDATORY PAYU OPERATED BY OPENING STATEMENT */}
              <div className="p-4 bg-amber-100 border-2 border-amber-400 rounded-2xl text-slate-900 font-bold text-xs sm:text-sm leading-relaxed shadow-sm">
                <p className="text-[#800C1E] font-black text-sm mb-1">📌 Operator Declaration:</p>
                "Vanjarijodi Matrimony is a brand owned, operated, and managed by <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>. All billing, invoices, customer receipts, and digital payment transactions are officially processed under the registered legal entity <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>. Throughout the site, the terms 'we', 'us', and 'our' refer to <strong>PRIME MULTI SERVICES AND SUPPLIERS</strong>."
              </div>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-slate-800">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">1. Services:</strong> Matrimonial matchmaking and biodata sharing services for registered community members seeking prospective life alliances.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2. Statutory Eligibility:</strong> Users must be of legal marriageable age in India (18 years for females, 21 years for males). Registrations are open to unmarried, divorced, or widowed individuals of legal marital capacity.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">3. Account Responsibilities:</strong> Users are strictly responsible for maintaining profile authenticity, truthful information, and credentials security. Any fraudulent activity, misrepresentation, abusive conduct, or misuse will lead to immediate profile termination and permanent blocking without notice.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">4. Section 79 IT Act Intermediary Immunity:</strong> VANJARIJODI MATRIMONY operates strictly as an "Intermediary" under Section 79 of the Information Technology Act, 2000. The platform facilitates user-submitted profile communication and does not originate, alter, or warrant third-party profile data. The platform operator incurs no legal or criminal liability for misrepresentations or false claims made by users.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">5. Mandatory Family Due Diligence:</strong> VANJARIJODI MATRIMONY provides basic mobile and profile verification only. Candidates, parents, and guardians are solely responsible for independently verifying character, employment, family background, and credentials before finalizing any marriage alliance.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">6. Limitation of Financial Liability:</strong> Under any legal dispute, the cumulative monetary liability of VANJARIJODI MATRIMONY shall be strictly limited to the actual subscription fee paid by the user.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">7. Exclusive Court Jurisdiction:</strong> All legal disputes or proceedings relating to this portal shall be subject strictly and exclusively to the jurisdiction of the competent Courts at <strong>Beed, Maharashtra, India</strong>.
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
                <h3>2. Privacy Policy & Data Security</h3>
              </div>

              <p className="text-slate-700 font-medium leading-relaxed">
                <strong>VANJARIJODI MATRIMONY</strong> (Trade Name: <strong>Vanjari Jodi</strong>) respects user privacy and handles personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and IT Intermediary Rules, 2021:
              </p>

              <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-slate-800">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Data Collected:</strong> We collect user-consented details including full name, birth date, gender, mobile number, sub-caste, education, occupation, city, and profile photos solely for matrimonial matchmaking.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Privacy & Number Masking:</strong> Direct contact numbers and biodata files are kept confidential and are revealed only to authorized paid members or upon mutual interest expression.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">No Third-Party Commercial Sale:</strong> Private data is strictly protected and never sold or shared with commercial telemarketers or external brokers.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Right to Profile Deletion:</strong> Members can request account or profile deletion at any time by contacting support at <strong>{contactEmail}</strong> or through their account profile settings.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RETURN & REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <RefreshCw className="w-5 h-5 text-[#A71930]" />
                <h3>3. Return & Refund Policy</h3>
              </div>

              <div className="space-y-3.5 bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-800">
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-1.5">
                  <strong className="text-[#800C1E] font-black text-sm block">🚫 Non-Refundable Policy</strong>
                  <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
                    "Non-Refundable Policy: Once an online membership or subscription plan is purchased and activated on Vanjarijodi Matrimony, the fee is STRICTLY NON-REFUNDABLE under any circumstances as premium digital services and profile accesses are provisioned instantly."
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-400 rounded-xl space-y-1.5">
                  <strong className="text-emerald-950 font-black text-sm block">⚡ Failed / Technical Error Transactions</strong>
                  <p className="text-emerald-900 text-xs sm:text-sm leading-relaxed font-medium">
                    "In the event of a technical failure where payment is debited from the customer's account but the membership plan is not activated, the entire transaction amount will be automatically refunded back to the original source account within 5 to 7 business days."
                  </p>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-300 rounded-xl space-y-1 text-xs">
                  <strong className="text-sky-950 font-bold block">💳 Refund Mode & Processing:</strong>
                  <p className="text-slate-700">
                    All eligible refunds are credited back to the original payment instrument (UPI ID, Debit/Credit Card, or Net Banking account) used during checkout.
                  </p>
                  <p className="text-slate-700 pt-1">
                    To report a duplicate transaction, email your payment reference ID / UTR to <strong>{contactEmail}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CANCELLATION POLICY */}
          {activeTab === 'cancellation' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <X className="w-5 h-5 text-[#A71930]" />
                <h3>4. Cancellation Policy</h3>
              </div>

              <div className="space-y-3.5 bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-800">
                <div className="p-3.5 bg-amber-100 border border-amber-400 rounded-xl space-y-1.5">
                  <strong className="text-amber-950 font-black text-sm block">⏱️ Cancellation Duration: Anytime Directly in Settings</strong>
                  <p className="text-amber-900 text-xs sm:text-sm leading-relaxed font-medium">
                    "Users can cancel or deactivate their membership profile at any time directly through their account profile settings."
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-xs text-slate-700">
                  <p><strong>How to Cancel / Deactivate Profile:</strong> Log in to your account, navigate to Profile &gt; Edit Profile / Settings, and select 'Deactivate Profile' or 'Hide Profile'. You may also submit a written cancellation request to <strong>{contactEmail}</strong>.</p>
                  <p><strong>Effect of Cancellation:</strong> Upon deactivation, your profile will immediately become invisible to other members and contact unlocking requests will cease.</p>
                  <p><strong>No Auto-Debit / No Auto-Renewal:</strong> VANJARIJODI MATRIMONY does NOT charge recurring auto-debit fees. Once your subscription period expires, your plan simply lapses without any surprise charges.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SHIPPING & DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Clock className="w-5 h-5 text-[#A71930]" />
                <h3>5. Shipping & Delivery Policy (Digital Services)</h3>
              </div>

              <div className="space-y-3.5 bg-amber-50/80 p-4 rounded-2xl border-2 border-amber-300 text-xs sm:text-sm text-slate-800">
                <div className="p-3.5 bg-emerald-100 border border-emerald-400 rounded-xl space-y-1.5">
                  <strong className="text-emerald-950 font-black text-sm block">⚡ Delivery Mode: Digital Access / Online Delivery</strong>
                  <p className="text-emerald-900 text-xs sm:text-sm leading-relaxed font-medium">
                    "Service Delivery: Upon successful completion and confirmation of payment, the selected matrimonial subscription plan and its premium contact access features will be activated instantly (or within a maximum window of 30 minutes)."
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-xs text-slate-700">
                  <p><strong>Instant Digital Activation:</strong> Upon successful completion of online payment via PayU / UPI / NetBanking / Cards, member profile access, contact unlock limits, and premium features are provisioned <strong>instantly (within 0 to 5 minutes)</strong> on your logged-in dashboard.</p>
                  <p><strong>Delivery Confirmation:</strong> A confirmation SMS / email receipt is sent immediately to the user's registered contact details.</p>
                  <p><strong>Physical Goods Disclaimer:</strong> No physical goods or packages are shipped. All services, biodata PDF generators, and contact access are delivered electronically via web and mobile application.</p>
                  <p><strong>Support for Activation Inquiries:</strong> If you face any delay in digital service activation, reach out to customer support via email at <strong>{contactEmail}</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Building className="w-5 h-5 text-[#A71930]" />
                <h3>6. About Us - VANJARIJODI MATRIMONY</h3>
              </div>

              <div className="space-y-3 bg-amber-50/80 p-4 rounded-2xl border border-amber-300 text-xs sm:text-sm text-slate-800 leading-relaxed">
                <p>
                  "Vanjarijodi Matrimony is a brand owned, operated, and managed by PRIME MULTI SERVICES AND SUPPLIERS. All billing, invoices, customer receipts, and digital payment transactions are officially processed under the registered legal entity PRIME MULTI SERVICES AND SUPPLIERS."
                </p>

                <p>
                  Our mission is to combine traditional community matchmaking values with modern, secure mobile technology, offering an easy-to-use, confidential, and affordable platform for finding compatible life partners across Maharashtra and worldwide.
                </p>

                <div className="p-3.5 bg-white border border-amber-300 rounded-xl space-y-1.5 text-xs">
                  <strong className="text-[#800C1E] block font-bold">Platform Features & Standards:</strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Mobile number and identity-screened community member profiles</li>
                    <li>Privacy-first number masking & mutual interest contact unlocks</li>
                    <li>Community guidance on Gotra, Wadhe Bhau, & Kuli traditions</li>
                    <li>Transparent INR pricing compliant with Indian payment gateway guidelines</li>
                    <li>Responsive customer helpline active Monday to Saturday | 10:00 AM – 06:00 PM</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PRICING & PRODUCTS / SERVICES (INR) */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <CreditCard className="w-5 h-5 text-[#A71930]" />
                <h3>7. Products, Services & Pricing in INR (₹)</h3>
              </div>

              <p className="text-slate-700 font-medium leading-relaxed">
                <strong>VANJARIJODI MATRIMONY</strong> offers transparent, fixed digital subscription plans denominated strictly in <strong>Indian Rupees (INR - ₹)</strong>:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Silver Plan */}
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full uppercase">
                      Silver Plan
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#800C1E]">₹499</span>
                      <span className="text-xs text-slate-500 font-bold">INR / 3 Months</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">90 Days Full Digital Access</p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-1.5">✓ 25 Verified Contact Unlocks</li>
                      <li className="flex items-center gap-1.5">✓ Mutual Like Number Unlocks</li>
                      <li className="flex items-center gap-1.5">✓ Unlimited Express Interest (Likes)</li>
                      <li className="flex items-center gap-1.5">✓ 36 Gun Vedic Kundali Milan</li>
                      <li className="flex items-center gap-1.5">✓ Instant Digital Activation</li>
                    </ul>
                  </div>
                </div>

                {/* Gold Plan */}
                <div className="bg-gradient-to-b from-amber-50 to-rose-50/40 p-4 rounded-2xl border-2 border-amber-400 shadow-md flex flex-col justify-between relative">
                  <div className="absolute -top-3 right-3 bg-[#800C1E] text-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-amber-200 text-[#800C1E] text-[11px] font-black rounded-full uppercase">
                      Gold Plan
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#800C1E]">₹999</span>
                      <span className="text-xs text-slate-500 font-bold">INR / 6 Months</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">180 Days Full Digital Access</p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-1.5">✓ 75 Verified Contact Unlocks</li>
                      <li className="flex items-center gap-1.5">✓ Direct WhatsApp & Calls</li>
                      <li className="flex items-center gap-1.5">✓ Unlimited Express Interest (Likes)</li>
                      <li className="flex items-center gap-1.5">✓ Printable Color PDF Biodata</li>
                      <li className="flex items-center gap-1.5">✓ Instant Digital Activation</li>
                    </ul>
                  </div>
                </div>

                {/* Platinum Plan */}
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-full uppercase">
                      Platinum Plan
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#800C1E]">₹1499</span>
                      <span className="text-xs text-slate-500 font-bold">INR / 12 Months</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">1 Full Year (365 Days Access)</p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-1.5">✓ Unlimited Contact Unlocks</li>
                      <li className="flex items-center gap-1.5">✓ Top Priority Search Listing</li>
                      <li className="flex items-center gap-1.5">✓ Verified Profile Badge Guarantee</li>
                      <li className="flex items-center gap-1.5">✓ Personal Matchmaking Assistance</li>
                      <li className="flex items-center gap-1.5">✓ Instant Digital Activation</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: CONTACT US & REGISTERED ADDRESS */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Phone className="w-5 h-5 text-[#A71930]" />
                <h3>8. Contact Us & Registered Address</h3>
              </div>

              <p className="text-slate-700 font-medium">
                For customer support, membership inquiries, or payment compliance assistance, contact our registered office:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <Building className="w-4 h-4 text-[#A71930]" />
                    <span>Business / Legal Name</span>
                  </div>
                  <p className="text-slate-900 font-black text-base">PRIME MULTI SERVICES AND SUPPLIERS</p>
                  <p className="text-slate-600 text-xs font-semibold">Brand Name: Vanjarijodi Matrimony</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#A71930]" />
                    <span>Registered Office Address</span>
                  </div>
                  <p className="text-slate-900 font-black text-sm">At Post Padali, Taluka Shirur (Kasar), District Beed, Maharashtra - 413249</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-[#800C1E] font-bold text-xs uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-[#A71930]" />
                    <span>Customer Support & Grievance Email</span>
                  </div>
                  <p className="text-slate-900 font-black text-sm">
                    <a href={`mailto:${contactEmail}`} className="hover:underline text-[#A71930]">{contactEmail}</a>
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Working Hours</span>
                  </div>
                  <p className="text-emerald-950 font-black text-sm">{operatingHours}</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-300 space-y-1 sm:col-span-2">
                  <strong className="text-blue-900 font-black text-sm block">Support Communication Notice:</strong>
                  <p className="text-blue-800 text-xs sm:text-sm font-medium leading-relaxed">
                    "For prompt assistance, please contact us via our official email ({contactEmail}). All customer queries, support requests, and grievances will be acknowledged, reviewed, and resolved within 3 to 5 business days."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: GRIEVANCE REDRESSAL OFFICER */}
          {activeTab === 'grievance' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-base border-b border-amber-200 pb-2">
                <Scale className="w-5 h-5 text-[#A71930]" />
                <h3>9. Grievance Redressal Mechanism (IT Rules 2021)</h3>
              </div>

              <div className="bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <p className="text-xs text-slate-700 font-medium">
                  In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the contact details of the Grievance Officer are published below:
                </p>

                <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Designated Grievance Officer</span>
                    <p className="text-slate-900 font-black text-base">{grievanceOfficerName}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Grievance Email Address</span>
                    <p className="text-slate-900 font-bold">
                      <a href={`mailto:${grievanceOfficerEmail}`} className="text-[#A71930] hover:underline">{grievanceOfficerEmail}</a>
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Office Location</span>
                    <p className="text-slate-800 font-medium">{grievanceOfficerAddress}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-100/70 rounded-xl border border-amber-300 text-slate-700 text-xs space-y-1">
                  <p><strong>Acknowledgement SLA:</strong> Grievance complaints are acknowledged within 24 hours of receipt.</p>
                  <p><strong>Resolution SLA:</strong> Complaints are investigated and fully resolved within 15 days.</p>
                </div>
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
