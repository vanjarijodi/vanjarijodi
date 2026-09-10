import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generatePaymentInvoicePDF, downloadPaymentInvoicePDF, InvoiceData } from '../utils/invoiceGenerator';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Download,
  Share2,
  Send,
  Printer,
  Copy,
  Check,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  Lock,
  FileText,
  Smartphone,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export interface OfficialPaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    receiptNo: string;
    userName: string;
    userMobile: string;
    userEmail?: string;
    userDistrict?: string;
    planName: string;
    planDuration?: string;
    amount: number;
    paymentMethod?: string;
    utrNumber: string;
    paymentDate: string;
    expiryDate: string;
    adminSenderEmail?: string;
    isTestMode?: boolean;
  };
}

export const OfficialPaymentReceiptModal: React.FC<OfficialPaymentReceiptProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { siteConfig, t, language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const senderEmail = data.adminSenderEmail || siteConfig?.contactEmail || 'gitevijay123@gmail.com';
  const founderName = 'वंजारी जोडी टीम';
  const telegramHandle = (siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '');
  const supportContactText = `ई-मेल सपोर्ट: ${senderEmail}`;
  const displayAmount = data.amount || 398;

  const invoiceObj: InvoiceData = {
    invoiceNumber: data.receiptNo,
    paymentId: `PAY-${data.utrNumber.slice(-8)}`,
    utrNumber: data.utrNumber,
    userName: data.userName,
    userMobile: data.userMobile,
    userDistrict: data.userDistrict || 'महाराष्ट्र',
    planName: data.planName,
    planDuration: data.planDuration || '६ महिने वैध (१८० दिवस)',
    amount: displayAmount,
    currency: '₹',
    paymentDate: data.paymentDate,
    membershipExpiryDate: data.expiryDate,
    businessName: siteConfig?.paymentPayeeName || siteConfig?.businessName || 'Usha Shivdas Hange / वंजारी जोडी',
    upiId: siteConfig?.paymentUpiId || 'paytm.s3ms5x7@pty',
    adminNote: 'अधिकृत डिजिटल पावती व सदस्यत्व मंजुरी पत्र'
  };

  const handleDownloadPDF = () => {
    try {
      downloadPaymentInvoicePDF(invoiceObj);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('पावती डाऊनलोड करताना त्रुटी आली. कृपया प्रिंट बटण वापरा.');
    }
  };

  const emailDraftBody = `नमस्कार ${data.userName},

वंजारी जोडी वधू-वर सूचक केंद्रावर आपले सहर्ष स्वागत आहे!
तुमचे ₹${displayAmount} पेमेंट यशस्वीरित्या प्राप्त झाले असून तुमचे सदस्यत्व (VIP Plan: ${data.planName}) सक्रिय करण्यात आले आहे.

--- अधिकृत पावती तपशील ---
पावती क्रमांक: ${data.receiptNo}
सदस्याचे नाव: ${data.userName}
मोबाईल: ${data.userMobile}
प्लान: ${data.planName}
भरलेली रक्कम: ₹${displayAmount}/-
UTR / संदर्भ नंबर: ${data.utrNumber}
तारीख: ${data.paymentDate}
वैधता मुदत: ${data.expiryDate} पर्यंत

प्रेशक (Sender Email): ${senderEmail} (वंजारी जोडी टीम)
${supportContactText}

ताकीद / सूचना (Statutory Intermediary Notice):
मंचावर उपलब्ध सर्व माहितीची सत्यता व वैयक्तिक पडताळणी करणे वधू-वरांच्या पालकांची स्वतःची जबाबदारी आहे.

धन्यवाद,
वंजारी जोडी मॅट्रिमोनी टीम`;

  const handleCopyEmailText = () => {
    navigator.clipboard.writeText(emailDraftBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`*वंजारी जोडी अधिकृत पेमेंट पावती*\n\nसदस्य: ${data.userName}\nपावती क्र: ${data.receiptNo}\nरक्कम: ₹${displayAmount}\nUTR: ${data.utrNumber}\nप्लॅन: ${data.planName}\n\nआपले स्वागत आहे! अधिक तपशीलासाठी gitevijay123@gmail.com वर संपर्क साधा.`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://vanjarijodi.web.app')}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-400 max-w-2xl w-full my-auto overflow-hidden relative text-slate-800">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#5C0815] text-white p-5 sm:p-6 text-center relative border-b-4 border-amber-400">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-black tracking-wide flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>महाराष्ट्र शासन नोंदणीकृत • अधिकृत शासकीय पावती</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-amber-100 tracking-tight">
            वंजारी जोडी वधू-वर सूचक केंद्र
          </h2>
          <p className="text-xs text-amber-200/90 font-semibold mt-0.5">
            अधिकृत पेमेंट पावती व सदस्यत्व नोंदणी प्रमाणपत्र
          </p>
          <p className="text-[11px] text-amber-300/80 font-mono mt-1">
            Sender Email: <span className="underline font-bold text-amber-200">{senderEmail}</span> ({founderName})
          </p>
        </div>

        {/* Test Mode Notification Bar */}
        {data.isTestMode && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
            <span>टेस्ट मोड सक्रिय: चाचणी ई-मेल प्रत्यक्षात पाठवला गेला नाही, ही अधिकृत पावती स्क्रीनवर तयार झाली आहे.</span>
          </div>
        )}

        {/* Printable Official Invoice Body */}
        <div className="p-5 sm:p-7 space-y-6 bg-slate-50/50">
          
          {/* Invoice Header Details Box */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">पावती क्रमांक (Receipt No)</span>
              <span className="text-lg font-black text-[#800C1E] font-mono">{data.receiptNo}</span>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                तारीख: <span className="font-bold">{data.paymentDate}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>पेमेंट मंजूर (PAID)</span>
              </span>
              <div className="text-xs text-slate-500 font-medium mt-1 font-mono">
                UTR: {data.utrNumber}
              </div>
            </div>
          </div>

          {/* Member & Plan Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Member Details */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#800C1E]" />
                <span>सदस्याचे नाव व तपशील</span>
              </h4>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex justify-between"><span className="text-slate-500">नाव:</span> <span className="font-bold text-slate-900">{data.userName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">मोबाईल:</span> <span className="font-mono font-bold text-slate-900">{data.userMobile}</span></div>
                {data.userEmail && <div className="flex justify-between"><span className="text-slate-500">ई-मेल:</span> <span className="font-mono text-slate-800">{data.userEmail}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">जिल्हा:</span> <span className="font-semibold text-slate-800">{data.userDistrict || 'महाराष्ट्र'}</span></div>
              </div>
            </div>

            {/* Plan & Pricing */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#800C1E]" />
                <span>पॅकेज व भरलेली रक्कम</span>
              </h4>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex justify-between"><span className="text-slate-500">पॅकेज नाव:</span> <span className="font-bold text-amber-900">{data.planName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">वैधता मुदत:</span> <span className="font-bold text-emerald-700">{data.planDuration || '६ महिने (१८० दिवस)'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">वैधता समाप्त:</span> <span className="font-mono text-slate-800">{data.expiryDate}</span></div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="font-bold text-slate-900">एकूण भरलेले:</span>
                  <span className="text-lg font-black text-[#800C1E]">₹{displayAmount}/-</span>
                </div>
              </div>
            </div>

          </div>

          {/* Official Stamp & Security Seal */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-black text-center text-[10px] leading-tight shadow-md border-2 border-white shrink-0">
                अधिकृत<br />शिक्का<br />मंजूर
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-amber-950">वंजारी जोडी डिजिटल स्वाक्षरी व शिक्का</h5>
                <p className="text-[11px] text-amber-900/80 font-medium">
                  प्रमाणित: {founderName} | Email: {senderEmail}
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <QrCode className="w-12 h-12 text-slate-700 mx-auto sm:ml-auto mb-1" />
              <span className="text-[10px] font-mono font-bold text-slate-500">VERIFIED RECEIPT</span>
            </div>
          </div>

          {/* Legal Notice & Responsibility Statement */}
          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>महत्त्वाची कायदेशीर ताकीद व सूचना (Statutory Disclaimer):</span>
            </p>
            <p className="italic">
              "वंजारी जोडी हे माहिती तंत्रज्ञान कायदा २००० अंतर्गत एक डिजिटल मध्यस्थ व्यासपीठ आहे. मंचावर नोंदणीकृत बायोडाटा व मोबाईल नंबर पडताळणी केली जाते. तरीही, कोणताही विवाह निश्चित करण्यापूर्वी किंवा आर्थिक व्यवहार करण्यापूर्वी वधू-वरांच्या पालकांनी स्वतःच्या स्तरावर वैयक्तिक, कौटुंबिक व नोकरी/व्यवसायाची प्रत्यक्ष सखोल खात्री (Personal Verification) करणे बंधनकारक आहे."
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          
          <button
            onClick={handleDownloadPDF}
            className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>PDF पावती डाउनलोड करा</span>
          </button>

          <button
            onClick={handleCopyEmailText}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? 'कॉपी झाले!' : 'ई-मेल प्रत कॉपी करा'}</span>
          </button>

          <button
            onClick={handleTelegramShare}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
            <span>टेलिग्रामवर पाठवा</span>
          </button>

        </div>

      </div>
    </div>
  );
};
