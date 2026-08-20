import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentConfig } from '../types';
import { uploadToCloudinary } from '../utils/cloudinary';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Sparkles,
  RefreshCw,
  Info,
  Upload
} from 'lucide-react';

export const AdminPaymentSettings: React.FC = () => {
  const { paymentConfig, updatePaymentConfig, siteConfig, updateSiteConfig, isAdminLoggedIn, setIsAdminLoggedIn } = useApp();

  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [formData, setFormData] = useState<PaymentConfig>({
    upiId: paymentConfig?.upiId || siteConfig?.paymentUpiId || 'hange.usha@ybl',
    payeeName: paymentConfig?.payeeName || siteConfig?.paymentPayeeName || 'Usha Hange',
    amount: paymentConfig?.amount || '199.00',
    transactionNote: paymentConfig?.transactionNote || 'Vanjari Jodi Registration',
    phonepeUpiId: paymentConfig?.phonepeUpiId || paymentConfig?.upiId || siteConfig?.paymentUpiId || 'hange.usha@ybl',
    gpayUpiId: paymentConfig?.gpayUpiId || '',
    paytmUpiId: paymentConfig?.paytmUpiId || 'hange.usha@ybl',
    bhimUpiId: paymentConfig?.bhimUpiId || 'hange.usha@ybl',
    adminMobileNumber: paymentConfig?.adminMobileNumber || '',
    whatsappNumber: paymentConfig?.whatsappNumber || '7083070830',
    merchantQrImageUrl: paymentConfig?.merchantQrImageUrl || siteConfig?.paymentQrCodeUrl || siteConfig?.paymentQrUrl || '',
    updatedAt: paymentConfig?.updatedAt || new Date().toISOString()
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (paymentConfig) {
      setFormData({
        upiId: paymentConfig.upiId || siteConfig?.paymentUpiId || 'hange.usha@ybl',
        payeeName: paymentConfig.payeeName || siteConfig?.paymentPayeeName || 'Usha Hange',
        amount: paymentConfig.amount || '199.00',
        transactionNote: paymentConfig.transactionNote || 'Vanjari Jodi Registration',
        phonepeUpiId: paymentConfig.phonepeUpiId || paymentConfig.upiId || siteConfig?.paymentUpiId || 'hange.usha@ybl',
        gpayUpiId: paymentConfig.gpayUpiId || '',
        paytmUpiId: paymentConfig.paytmUpiId || 'hange.usha@ybl',
        bhimUpiId: paymentConfig.bhimUpiId || 'hange.usha@ybl',
        adminMobileNumber: paymentConfig.adminMobileNumber || '',
        whatsappNumber: paymentConfig.whatsappNumber || '7083070830',
        merchantQrImageUrl: paymentConfig.merchantQrImageUrl || siteConfig?.paymentQrCodeUrl || siteConfig?.paymentQrUrl || '',
        updatedAt: paymentConfig.updatedAt || new Date().toISOString()
      });
    }
  }, [paymentConfig, siteConfig?.paymentUpiId, siteConfig?.paymentQrCodeUrl]);

  const generatedUpiLink = `upi://pay?pa=${encodeURIComponent(formData.upiId.trim())}&pn=${encodeURIComponent(formData.payeeName.trim())}&am=${encodeURIComponent(formData.amount.trim())}&cu=INR&tn=${encodeURIComponent(formData.transactionNote.trim())}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(generatedUpiLink)}`;

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput === '7083' || adminPinInput === '9800' || adminPinInput === 'admin123') {
      setIsAdminLoggedIn(true);
      setPinError('');
    } else {
      setPinError('चुकीचा ॲडमिन पिन कोड! (Invalid Admin PIN)');
    }
  };

  const handleQrFileUpload = async (file: File) => {
    try {
      setIsUploadingQr(true);
      // Upload to Cloudinary first
      const uploadRes = await uploadToCloudinary(file, 'vanjarijodi_payment_qr');
      if (uploadRes && uploadRes.url) {
        setFormData((prev) => ({ ...prev, merchantQrImageUrl: uploadRes.url }));
        setToastMessage({ type: 'success', text: '✅ QR कोड फोटो यशस्वीरीत्या अपलोड झाला!' });
      } else {
        // Fallback to local Base64 Data URL
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const result = loadEvt.target?.result as string;
          if (result) {
            setFormData((prev) => ({ ...prev, merchantQrImageUrl: result }));
            setToastMessage({ type: 'success', text: '✅ QR कोड फोटो निवडला गेला!' });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.warn('QR file upload fallback to base64:', err);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          setFormData((prev) => ({ ...prev, merchantQrImageUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.upiId.trim() || !formData.payeeName.trim() || !formData.amount.trim()) {
      setToastMessage({ type: 'error', text: 'कृपया सर्व आवश्यक रकाने अचूक भरा.' });
      return;
    }

    try {
      setIsSaving(true);
      setToastMessage(null);

      const targetQr = (formData.merchantQrImageUrl || '').trim();
      const updatedConfigObj = {
        upiId: formData.upiId.trim(),
        payeeName: formData.payeeName.trim(),
        amount: formData.amount.trim(),
        transactionNote: formData.transactionNote.trim(),
        phonepeUpiId: (formData.phonepeUpiId || formData.upiId).trim(),
        gpayUpiId: (formData.gpayUpiId || '').trim(),
        paytmUpiId: (formData.paytmUpiId || '').trim(),
        bhimUpiId: (formData.bhimUpiId || '').trim(),
        adminMobileNumber: (formData.adminMobileNumber || '').trim(),
        whatsappNumber: (formData.whatsappNumber || '7083070830').trim(),
        merchantQrImageUrl: targetQr,
        qrCodeUrl: targetQr,
        updatedAt: new Date().toISOString()
      };

      const success = await updatePaymentConfig(updatedConfigObj);

      // Also update siteConfig
      updateSiteConfig({
        paymentUpiId: formData.upiId.trim(),
        paymentPayeeName: formData.payeeName.trim(),
        paymentNote: formData.transactionNote.trim(),
        paymentQrUrl: targetQr,
        paymentQrCodeUrl: targetQr
      });

      if (success) {
        setToastMessage({
          type: 'success',
          text: '✅ पेमेंट सेटिंग्ज, UPI ID व QR कोड तात्काळ सर्वत्र (Firestore & App) अपडेट झाले!'
        });
      } else {
        setToastMessage({
          type: 'error',
          text: 'सेटिंग्ज सेव्ह करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
        });
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: `त्रुटी: ${err?.message || 'अनोळखी एरर'}`
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUpiLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If Admin not authenticated via AppContext or PIN
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-3xl shadow-xl border border-amber-200 text-slate-800">
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 bg-rose-100 text-[#800C1E] rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900">ॲडमिन सिक्युरिटी लॉगिन (Admin Verification)</h3>
          <p className="text-xs text-slate-500">
            पेमेंट सेटिंग्ज बदलण्यासाठी कृपया तुमचा ॲडमिन सिक्रेट पिन टाका.
          </p>
        </div>

        {pinError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ॲडमिन पिन कोड (PIN):</label>
            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="पिन कोड टाका"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono text-lg font-bold text-slate-900 focus:bg-white focus:border-[#800C1E] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#800C1E] hover:bg-[#680918] text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>लॉगिन करा & सेटिंग्ज उघडा</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-[#800C1E] to-rose-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>डायनॅमिक पेमेंट कंट्रोल सेंटर</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              पेमेंट सेटिंग्ज मॅनेजमेंट (Payment Config Dashboard)
            </h2>
            <p className="text-xs text-amber-100/80 max-w-2xl">
              येथून बदललेला UPI आयडी, पेई नाव व नोंदणी फी संपूर्ण वेबसाईटवर Real-Time अपडेट होईल. (Firestore Document: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">settings/payment_config</code>)
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>सुरक्षित ॲडमिन मोड सक्रिय</span>
          </div>
        </div>
      </div>

      {/* Notifications Toast */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border shadow-md flex items-center justify-between text-xs sm:text-sm font-bold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#800C1E] flex items-center justify-center shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">UPI व मर्चंट माहिती एडिट करा</h3>
              <p className="text-xs text-slate-500">Firestore मधील फॉर्म व्हॅल्यू बदलून त्वरित सेव्ह करा</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Input 1: Single PhonePe / Primary UPI ID */}
            <div className="bg-purple-50/70 p-5 rounded-2xl border-2 border-purple-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-950 block">
                  १. PhonePe / मुख्य UPI आयडी (UPI ID) <span className="text-rose-600">*</span>
                </label>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-2 py-0.5 rounded-full">
                  सर्व ॲप्ससाठी लागू (All-in-One)
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  upiId: e.target.value, 
                  phonepeUpiId: e.target.value,
                  paytmUpiId: e.target.value,
                  bhimUpiId: e.target.value
                })}
                placeholder="उदा. hangemahesh@ybl"
                className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:border-purple-600 focus:outline-none transition shadow-sm"
              />
              <p className="text-[11px] text-purple-900 leading-relaxed flex items-start gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>हा एकच PhonePe UPI आयडी (<strong>{formData.upiId || 'hangemahesh@ybl'}</strong>) PhonePe, Google Pay, Paytm, BHIM आणि QR कोडद्वारे सर्व ग्राहकांकडून पेमेंट घेण्यासाठी वापरला जाईल.</span>
              </p>
            </div>

            {/* Input 2: Payee Name */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                २. प्राप्तकर्त्याचे नाव (Payee / Merchant Name) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.payeeName}
                onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                placeholder="उदा. Mahesh Hange"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-[#800C1E] focus:outline-none transition shadow-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                PhonePe, GPay व Paytm मधील पेमेंट स्क्रीनवर हे नाव दिसेल.
              </p>
            </div>

            {/* Input 3: Registration Amount */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                ३. नोंदणी फी / रक्कम (Registration Amount - ₹) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="199.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:border-[#800C1E] focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            {/* Input 4: Admin WhatsApp & Helpline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  ४. ॲडमिन WhatsApp नंबर (हेल्पलाइन)
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="उदा. 7083070830"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 focus:bg-white focus:border-[#800C1E] focus:outline-none transition shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  ५. ट्रान्सफर नोट (Transaction Note)
                </label>
                <input
                  type="text"
                  value={formData.transactionNote}
                  onChange={(e) => setFormData({ ...formData, transactionNote: e.target.value })}
                  placeholder="VanjariJodiReg"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#800C1E] focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            {/* Input 6: Merchant All-In-One QR Code Image / Upload */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#800C1E]" />
                  <span>६. मर्चंट QR कोड फोटो किंवा इमेज URL (पर्यायी)</span>
                </label>
                {formData.merchantQrImageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, merchantQrImageUrl: '' })}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    कस्टम QR हटवा (ऑटो QR वापरा)
                  </button>
                )}
              </div>

              {/* Upload QR Image File */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto px-4 py-2.5 bg-white border-2 border-dashed border-amber-400 hover:border-[#800C1E] text-slate-700 hover:text-[#800C1E] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm">
                  {isUploadingQr ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#800C1E] animate-spin" />
                      <span>अपलोड होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>QR कोडचा फोटो निवडा (Upload QR)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingQr}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleQrFileUpload(file);
                      }
                    }}
                  />
                </label>

                <span className="text-xs text-slate-400 font-bold">किंवा URL:</span>

                <input
                  type="text"
                  value={formData.merchantQrImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, merchantQrImageUrl: e.target.value })}
                  placeholder="https://... इमेज URL"
                  className="flex-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-[#800C1E] focus:outline-none transition"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                💡 जर तुमच्याकडे PhonePe मर्चंटचा स्टँडी किंवा स्कॅनर QR असेल तर त्याचा फोटो अपलोड करा. काही न निवडल्यास सिस्टीम तुमच्या UPI आयडीवरून <strong>लाइव्ह ऑटोमॅटिक QR कोड</strong> तयार करेल.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                शेवटचा बदल: {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString('mr-IN') : 'आत्ताच'}
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3.5 bg-[#800C1E] hover:bg-[#680918] disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition flex items-center space-x-2 cursor-pointer active:scale-98"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Firestore मध्ये सेव्ह होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Save & Update Settings (तत्काळ लागू करा)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic QR Code Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm">लाइव्ह QR कोड पूर्वावलोकन</h4>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${formData.merchantQrImageUrl ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                {formData.merchantQrImageUrl ? 'कस्टम अपलोड केलेला QR' : 'Live Auto-Generated'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center text-slate-900 space-y-2">
              <img
                src={formData.merchantQrImageUrl || qrCodeUrl}
                alt="Payment QR Code"
                className="w-48 h-48 object-contain rounded-xl border border-slate-200 shadow-inner"
              />
              <div className="text-center space-y-0.5">
                <p className="font-black text-sm text-slate-900">{formData.payeeName}</p>
                <p className="font-mono font-bold text-xs text-[#800C1E]">{formData.upiId}</p>
                <p className="text-xs font-black text-emerald-700">रक्कम: ₹{formData.amount}</p>
              </div>
            </div>

            {/* Deep Link Test Launcher */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                लाइव्ह जनरेट केलेली UPI Intent URL:
              </label>
              <div className="p-2.5 bg-slate-800 rounded-xl text-[10px] font-mono text-amber-200 break-all select-all border border-slate-700">
                {generatedUpiLink}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 cursor-pointer transition"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>कॉपी झाली!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>UPI लिंक कॉपी करा</span>
                    </>
                  )}
                </button>

                <a
                  href={generatedUpiLink}
                  className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow cursor-pointer transition"
                >
                  <span>टेस्ट करा</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Integration Info Box */}
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 text-amber-900 space-y-2">
            <h5 className="font-bold text-xs flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-[#800C1E]" />
              <span>कसे काम करते? (How it works)</span>
            </h5>
            <ul className="text-[11px] space-y-1.5 text-amber-900/90 list-disc list-inside leading-relaxed">
              <li>
                तुम्ही येथे सेटिंग्ज सेव्ह करताच Firestore <code className="font-mono bg-amber-200/60 px-1 py-0.5 rounded text-amber-950 font-bold">settings/payment_config</code> अपडेट होते.
              </li>
              <li>
                वापरकर्त्यांच्या फोनवर dynamic modal आपोआप हेच UPI ID आणि रक्कम दाखवतो.
              </li>
              <li>
                PhonePe, Google Pay व Paytm direct triggers याच माहितीचा वापर करून पेमेंट स्क्रीन उघडतात.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
