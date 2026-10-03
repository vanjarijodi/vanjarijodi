import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  QrCode,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminPaymentManagementDashboard: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useApp();

  // Analytics data from /api/admin/payment-analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters (Section 11)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Gateway Controls State (Section 13)
  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean>(
    siteConfig?.razorpayEnabled !== false
  );
  const [qrEnabled, setQrEnabled] = useState<boolean>(
    siteConfig?.qrPaymentEnabled !== false
  );
  const [gatewayMode, setGatewayMode] = useState<'both' | 'razorpay_only' | 'qr_only'>('both');
  const [isSavingGateway, setIsSavingGateway] = useState<boolean>(false);
  const [gatewaySavedMsg, setGatewaySavedMsg] = useState<string | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Razorpay Live Configuration State
  const [rzpKeyId, setRzpKeyId] = useState<string>('');
  const [rzpSecretKey, setRzpSecretKey] = useState<string>('');
  const [rzpEnv, setRzpEnv] = useState<'LIVE' | 'TEST'>('LIVE');
  const [rzpHasSecret, setRzpHasSecret] = useState<boolean>(false);
  const [isSavingRzp, setIsSavingRzp] = useState<boolean>(false);
  const [rzpSaveMsg, setRzpSaveMsg] = useState<string | null>(null);

  // Razorpay Security PIN Protection (PIN: 986188)
  const [isRzpUnlocked, setIsRzpUnlocked] = useState<boolean>(false);
  const [rzpPinInput, setRzpPinInput] = useState<string>('');
  const [rzpPinError, setRzpPinError] = useState<string | null>(null);

  const handleUnlockRzp = (e: React.FormEvent) => {
    e.preventDefault();
    setRzpPinError(null);
    const clean = rzpPinInput.trim();
    if (clean === '986188') {
      setIsRzpUnlocked(true);
      setRzpPinInput('');
      setRzpPinError(null);
    } else {
      setRzpPinError('❌ चुकीचा सुरक्षा पिन! कृपया योग्य पिन प्रविष्ट करा.');
    }
  };

  const handleLockRzp = () => {
    setIsRzpUnlocked(false);
    setRzpPinInput('');
    setRzpPinError(null);
  };

  // Fetch Payment Analytics
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (paymentMethod !== 'all') params.set('paymentMethod', paymentMethod);
      if (planFilter !== 'all') params.set('plan', planFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/payment-analytics?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setAnalytics(data);
      } else {
        setFetchError(data.error || 'अहवाल लोड करता आला नाही.');
      }
    } catch (err: any) {
      setFetchError('नेटवर्क अडचण आली.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, startDate, endDate, paymentMethod, planFilter, statusFilter]);

  // Load gateway settings & Razorpay credentials
  useEffect(() => {
    fetch('/api/payment/gateway-settings')
      .then(async (res) => {
        if (!res.ok) return null;
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then((data) => {
        if (data && data.success && data.settings) {
          setRazorpayEnabled(data.settings.razorpayEnabled !== false);
          setQrEnabled(data.settings.qrPaymentEnabled !== false);
          setGatewayMode(data.settings.gatewayMode || 'both');
        }
      })
      .catch(() => {});

    fetch('/api/admin/payment/razorpay-credentials')
      .then(async (res) => {
        if (!res.ok) return null;
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
      .then((data) => {
        if (data && data.success && data.config) {
          setRzpKeyId(data.config.keyId || '');
          setRzpEnv(data.config.env || 'LIVE');
          setRzpHasSecret(Boolean(data.config.hasSecretKey));
        }
      })
      .catch(() => {});
  }, []);

  // Save Razorpay Live Credentials
  const handleSaveRazorpayCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRzp(true);
    setRzpSaveMsg(null);
    try {
      const payload: any = {
        keyId: rzpKeyId,
        env: rzpEnv,
      };
      if (rzpSecretKey && rzpSecretKey.trim().length > 0) {
        payload.secretKey = rzpSecretKey.trim();
      }

      const res = await fetch('/api/admin/payment/razorpay-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) {
        setRzpSecretKey('');
        setRzpHasSecret(Boolean(data.config?.hasSecretKey));
        setRzpSaveMsg('✅ Razorpay Live क्रेडेंशियल्स यशस्वीरित्या सेव्ह झाले!');
        setTimeout(() => setRzpSaveMsg(null), 4000);
      } else {
        setRzpSaveMsg(`❌ त्रुटी: ${data.error || 'सेव्ह करता आले नाही.'}`);
      }
    } catch (err: any) {
      setRzpSaveMsg('❌ नेटवर्क त्रुटी आली.');
    } finally {
      setIsSavingRzp(false);
    }
  };

  const handleDatePresetChange = (preset: 'all' | 'today' | 'month' | 'custom') => {
    setDateFilter(preset);
    const now = new Date();
    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(todayStr);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Save Gateway Settings (Section 13)
  const handleSaveGatewaySettings = async (
    newRazorpay: boolean,
    newQr: boolean,
    newMode: 'both' | 'razorpay_only' | 'qr_only'
  ) => {
    setIsSavingGateway(true);
    try {
      const res = await fetch('/api/payment/gateway-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayEnabled: newRazorpay,
          qrPaymentEnabled: newQr,
          gatewayMode: newMode,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (data.success) {
        setRazorpayEnabled(newRazorpay);
        setQrEnabled(newQr);
        setGatewayMode(newMode);
        updateSiteConfig({
          razorpayEnabled: newRazorpay,
          qrPaymentEnabled: newQr,
        });
        setGatewaySavedMsg('✅ पेमेंट गेटवे सेटिंग्ज यशस्वीरीत्या अपडेट झाल्या!');
        setTimeout(() => setGatewaySavedMsg(null), 3500);
      }
    } catch (err) {
      console.error('Error saving gateway settings:', err);
    } finally {
      setIsSavingGateway(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = analytics?.stats || {
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingManualPayments: 0,
    razorpayPayments: 0,
    razorpayRevenue: 0,
    qrUpiPayments: 0,
    qrUpiRevenue: 0,
    freeMemberships: 0,
    activeMemberships: 0,
    expiredMemberships: 0,
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>सेंट्रलाइज्ड पेमेंट व रेव्हेन्यू ॲनालिटिक्स</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif">
            पेमेंट व्यवस्थापन डॅशबोर्ड (Payment Dashboard)
          </h2>
          <p className="text-xs text-amber-200/90 mt-1 max-w-xl">
            Razorpay ऑटोमॅटिक पेमेंट्स, UPI/QR मॅन्युअल नोंदी आणि ॲडमिन मोफत सदस्यता अहवाल
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md border border-white/20 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>डॅशबोर्ड रिफ्रेश करा</span>
        </button>
      </div>

      {/* 2. Gateway Settings Control Center (Section 13) */}
      <div className="bg-white p-5 rounded-3xl border-2 border-amber-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#800C1E] flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                पेमेंट गेटवे स्विचर व मोड नियंत्रण (Gateway Mode Switcher)
              </h3>
              <p className="text-xs text-gray-500">
                कोणताही कोड बदल न करता पेमेंट पद्धती चालू/बंद करा
              </p>
            </div>
          </div>
          {gatewaySavedMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-300 animate-in fade-in">
              {gatewaySavedMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mode 1: Razorpay + QR (Recommended) */}
          <div
            onClick={() => handleSaveGatewaySettings(true, true, 'both')}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
              gatewayMode === 'both' && razorpayEnabled && qrEnabled
                ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>3. Razorpay + QR (शिफारस केलेले)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                सर्वात लोकप्रिय
              </span>
            </div>
            <p className="text-[11px] text-gray-600">
              Razorpay मुख्य ऑटोमॅटिक पर्याय म्हणून दिसेल + मॅन्युअल QR पर्यायी म्हणून उपलब्ध राहील.
            </p>
          </div>

          {/* Mode 2: Razorpay Only */}
          <div
            onClick={() => handleSaveGatewaySettings(true, false, 'razorpay_only')}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
              gatewayMode === 'razorpay_only' || (razorpayEnabled && !qrEnabled)
                ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-700" />
                <span>1. Razorpay Only</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                100% ऑटोमॅटिक
              </span>
            </div>
            <p className="text-[11px] text-gray-600">
              केवळ Razorpay द्वारे पेमेंट स्वीकारले जाईल. कोणत्याही मॅन्युअल मंजुरीची गरज राहणार नाही.
            </p>
          </div>

          {/* Mode 3: QR Only */}
          <div
            onClick={() => handleSaveGatewaySettings(false, true, 'qr_only')}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
              gatewayMode === 'qr_only' || (!razorpayEnabled && qrEnabled)
                ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-700" />
                <span>2. QR / UPI Only</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                मॅन्युअल मोड
              </span>
            </div>
            <p className="text-[11px] text-gray-600">
              केवळ QR कोड व UTR सबमिशन दिसेल. ॲडमिन पडताळणी आवश्यक राहील.
            </p>
          </div>
        </div>

        {/* Razorpay LIVE Configuration Box with Master PIN Protection */}
        {!isRzpUnlocked ? (
          <div className="mt-4 pt-4 border-t border-amber-200/80 bg-gradient-to-br from-amber-50 to-rose-50/60 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#800C1E] text-amber-200 rounded-xl">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#800C1E]">
                    🔒 Razorpay सिक्रेट की सुरक्षित लॉक (Master PIN Protected)
                  </h4>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    Google Play Console टेस्टर्स किंवा इतरांना Razorpay सिक्रेट की दिसू नये म्हणून सुरक्षित पासवर्ड आवश्यक आहे.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                सुरक्षित कुलूप (Locked)
              </span>
            </div>

            <form onSubmit={handleUnlockRzp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="password"
                  value={rzpPinInput}
                  onChange={(e) => {
                    setRzpPinInput(e.target.value);
                    setRzpPinError(null);
                  }}
                  placeholder="६ अंकी मास्टर सिक्युरिटी पिन टाका..."
                  className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#800C1E]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-amber-100 rounded-xl text-xs font-black shadow transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>पिन अनलॉक करा (Unlock Secrets)</span>
              </button>
            </form>

            {rzpPinError && (
              <p className="text-xs font-bold text-rose-700 bg-rose-100/70 p-2 rounded-lg border border-rose-300">
                {rzpPinError}
              </p>
            )}

            <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-[11px] text-slate-600 leading-relaxed font-medium">
              💡 <strong>ॲडमिन सूचना:</strong> गुगल प्ले कन्सोल टेस्टरसोबत तुम्ही मुख्य ॲडमिन पासवर्ड शेअर करू शकता. जोपर्यंत अधिकृत ६ अंकी सुरक्षा पिन टाकला जात नाही, तोपर्यंत तुमची खरी Razorpay Live Key आणि Secret Key कोणत्याही टेस्टर किंवा कर्मचाऱ्याला दिसणार नाही.
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSaveRazorpayCredentials}
            className="mt-4 pt-4 border-t border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-emerald-50/40 p-4 rounded-2xl border-2 border-emerald-400 space-y-3 animate-fadeIn"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Razorpay अधिकृत LIVE क्रेडेंशियल्स व्यवस्थापन (Production Mode)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    ✓ मास्टर पिनद्वारे यशस्वीपणे अनलॉक झाले
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  rzpEnv === 'LIVE' 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {rzpEnv === 'LIVE' ? '🟢 LIVE MODE सक्रिय' : '🟡 TEST MODE'}
                </span>
                <button
                  type="button"
                  onClick={handleLockRzp}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="पुन्हा लॉक करा"
                >
                  <Lock className="w-3 h-3 text-slate-700" />
                  <span>पुन्हा लॉक करा</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  मोड (Environment)
                </label>
                <select
                  value={rzpEnv}
                  onChange={(e) => setRzpEnv(e.target.value as 'LIVE' | 'TEST')}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="LIVE">🟢 LIVE Mode (थेट ऑनलाईन पेमेंट्स)</option>
                  <option value="TEST">🟡 TEST Mode (डेव्हलपमेंट चाचणी)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Razorpay Key ID (उदा. rzp_live_...)
                </label>
                <input
                  type="text"
                  value={rzpKeyId}
                  onChange={(e) => setRzpKeyId(e.target.value)}
                  placeholder="rzp_live_xxxxxxxxxxxx"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Key Secret (गुप्त की)</span>
                  {rzpHasSecret && (
                    <span className="text-[10px] text-emerald-700 font-bold">✓ सेव्ह आहे</span>
                  )}
                </label>
                <input
                  type="password"
                  value={rzpSecretKey}
                  onChange={(e) => setRzpSecretKey(e.target.value)}
                  placeholder={rzpHasSecret ? '•••••••••••••••• (बदलण्यासाठी नवीन टाका)' : 'Secret Key टाका'}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2">
              <p className="text-[10px] text-slate-500">
                💡 Secret Key ही सुरक्षितपणे सर्व्हरवर सेव्ह केली जाते आणि कधीही युझरच्या ब्राऊझरला दाखवली जात नाही.
              </p>

              <div className="flex items-center gap-2">
                {rzpSaveMsg && (
                  <span className="text-xs font-bold text-slate-800">
                    {rzpSaveMsg}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSavingRzp}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingRzp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>सेव्ह करत आहे...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Razorpay Live की सेव्ह करा</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 3. KPI Cards Grid (Section 11) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">एकूण महसूल</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {stats.successfulPayments} यशस्वी व्यवहार
          </p>
        </div>

        {/* Today's Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">आजचा महसूल</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-800">
            ₹{stats.todayRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">आज जमा झालेली रक्कम</p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">या महिन्याचा महसूल</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-900">
            ₹{stats.monthRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">चालू महिन्यातील एकूण</p>
        </div>

        {/* Razorpay Automatic */}
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-xs font-bold">Razorpay ऑटो-पेमेंट</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950">
            {stats.razorpayPayments}
          </div>
          <p className="text-[11px] text-indigo-800 font-bold mt-1">
            ₹{stats.razorpayRevenue.toLocaleString('en-IN')} • विना-ॲडमिन थेट सक्रिय
          </p>
        </div>

        {/* Pending Manual QR */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold">प्रलंबित मॅन्युअल QR</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#800C1E]">
            {stats.pendingManualPayments}
          </div>
          <p className="text-[11px] text-amber-900 font-semibold mt-1">
            बँक पडताळणी बाकी
          </p>
        </div>

        {/* QR / UPI Approved */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">QR / UPI मंजूर</span>
            <QrCode className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-900">
            {stats.qrUpiPayments}
          </div>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            ₹{stats.qrUpiRevenue.toLocaleString('en-IN')} मॅन्युअल मंजूर
          </p>
        </div>

        {/* Free Memberships */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">मोफत गिफ्ट सदस्यत्व</span>
            <Gift className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-900">
            {stats.freeMemberships}
          </div>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            ॲडमिन १-क्लिक वाटप
          </p>
        </div>

        {/* Active vs Expired */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold">सक्रिय सदस्यत्वे</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900">
            {stats.activeMemberships}
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            {stats.expiredMemberships} कालबाह्य (Expired)
          </p>
        </div>
      </div>

      {/* 4. Filter Toolbar (Section 11) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span>अहवाल फिल्टर्स (Date, Method, Plan, Status, Search)</span>
          </h4>
          <button
            onClick={() => {
              setDateFilter('all');
              setStartDate('');
              setEndDate('');
              setPaymentMethod('all');
              setPlanFilter('all');
              setStatusFilter('all');
              setSearchTerm('');
            }}
            className="text-xs text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
          >
            सर्व फिल्टर्स रीसेट करा
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAnalytics()}
              placeholder="नाव, मोबाईल, UTR, आयडी..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#800C1E]"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => handleDatePresetChange(e.target.value as any)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none"
          >
            <option value="all">सर्व कालावधी (All Time)</option>
            <option value="today">आजचे पेमेंट्स (Today)</option>
            <option value="month">या महिन्यातील (This Month)</option>
            <option value="custom">कस्टम तारीख रेंज (Custom Date)</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none"
          >
            <option value="all">सर्व पद्धती (All Methods)</option>
            <option value="razorpay">Razorpay Gateway (ऑटो)</option>
            <option value="upi_qr">मॅन्युअल UPI / QR</option>
            <option value="free_grant">ॲडमिन मोफत भेट (Free Access)</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none"
          >
            <option value="all">सर्व प्लॅन्स (All Plans)</option>
            <option value="welcome_offer">वेलकम ऑफर (₹398)</option>
            <option value="monthly">सिल्व्हर / 3 महिने</option>
            <option value="gold">गोल्ड / 6 महिने</option>
            <option value="diamond">डायमंड / 1 वर्ष</option>
            <option value="lifetime">लाइफटाईम</option>
            <option value="free_admin_grant">मोफत ॲक्सेस</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none"
          >
            <option value="all">सर्व स्टेटस (All Status)</option>
            <option value="approved">मंजूर / यशस्वी (Approved/Success)</option>
            <option value="pending">प्रलंबित (Pending Review)</option>
            <option value="rejected">नाकारलेले (Rejected)</option>
          </select>
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">पासून:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-1.5 border border-gray-200 rounded-lg outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">पर्यंत:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-1.5 border border-gray-200 rounded-lg outline-none"
              />
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-3 py-1.5 bg-[#800C1E] text-white rounded-lg font-bold cursor-pointer"
            >
              लागू करा
            </button>
          </div>
        )}
      </div>

      {/* 5. Transactions Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              पेमेंट व्यवहारांची यादी (Payment Transactions)
            </h4>
            <p className="text-xs text-gray-500">
              एकूण सापडलेले रेकॉर्ड्स: {analytics?.filteredCount || 0}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <th className="p-3">तारीख व वेळ</th>
                <th className="p-3">सदस्य नाव व संपर्क</th>
                <th className="p-3">प्लॅन व रक्कम</th>
                <th className="p-3">पेमेंट पद्धत</th>
                <th className="p-3">UTR / Payment ID</th>
                <th className="p-3">स्टेटस</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
                    <span>रेकॉर्ड्स लोड होत आहेत...</span>
                  </td>
                </tr>
              ) : analytics?.records?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    निवडलेल्या फिल्टरनुसार कोणताही पेमेंट व्यवहार आढळला नाही.
                  </td>
                </tr>
              ) : (
                analytics?.records?.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-amber-50/40 transition">
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {new Date(rec.created_at).toLocaleDateString('mr-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(rec.created_at).toLocaleTimeString('mr-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-gray-900">{rec.user_name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {rec.user_mobile || rec.user_id}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-gray-900">{rec.plan_name}</div>
                      <div className="font-black text-emerald-700">
                        {rec.amount > 0 ? `₹${rec.amount}` : 'मोफत (₹0)'}
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      {rec.payment_method === 'razorpay' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          ⚡ Razorpay Auto
                        </span>
                      ) : rec.payment_method === 'admin_grant' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                          🎁 मोफत भेट (Admin)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                          📱 मॅन्युअल UPI / QR
                        </span>
                      )}
                    </td>

                    <td className="p-3 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[120px]">{rec.utr_number}</span>
                        <button
                          onClick={() => handleCopy(rec.utr_number)}
                          className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                          title="कॉपी करा"
                        >
                          {copiedId === rec.utr_number ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      {rec.status === 'approved' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          ✓ मंजूर (Active)
                        </span>
                      ) : rec.status === 'pending' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 animate-pulse">
                          ⏳ प्रलंबित (Pending)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800">
                          ✕ अमान्य (Rejected)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
