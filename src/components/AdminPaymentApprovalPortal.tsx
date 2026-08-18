import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { downloadPaymentInvoicePDF, InvoiceData } from '../utils/invoiceGenerator';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Settings,
  AlertTriangle,
  Loader2,
  FileText,
  Smartphone,
  QrCode,
  DollarSign,
  ChevronRight,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';

export const AdminPaymentApprovalPortal: React.FC = () => {
  const {
    siteConfig,
    updateSiteConfig,
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    logActivity,
    profiles,
  } = useApp();

  // Active Tab: 'pending' | 'approved' | 'rejected' | 'all' | 'settings'
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all' | 'settings'>('pending');

  // Backend Requests State & Filters
  const [backendRequests, setBackendRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [counts, setCounts] = useState<{ all: number; pending: number; approved: number; rejected: number }>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    upi_id: siteConfig?.paymentUpiId || 'vanjarijodi@paytm',
    business_name: 'Vanjari Jodi Matrimony',
    whatsapp_api_token: '',
    currency: 'INR',
    qr_code_url: siteConfig?.paymentQrUrl || '',
    support_mobile: '+91 9800000000',
    payment_note: 'कृपया पेमेंट करताना योग्य UTR नंबर टाकावा.',
  });
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Quick View Screenshot Modal State
  const [previewScreenshot, setPreviewScreenshot] = useState<{
    url: string;
    utr: string;
    userName: string;
    amount: number;
    planName: string;
  } | null>(null);

  // Rejection Reason Modal State
  const [rejectModalData, setRejectModalData] = useState<{
    requestId: string;
    userName: string;
    utrNumber: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('पेमेंट बँक खात्यात जमा झालेले नाही किंवा UTR क्रमांक चुकीचा आहे.');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  // Action Loading & Feedback State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Fetch Requests from Backend API
  const fetchBackendRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const res = await fetch(`/api/admin/payment-requests?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setBackendRequests(data.requests || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Error fetching backend payment requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch Settings from Backend
  const fetchBackendSettings = async () => {
    try {
      const res = await fetch('/api/payment/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettingsForm({
          upi_id: data.settings.upi_id || siteConfig?.paymentUpiId || 'vanjarijodi@paytm',
          business_name: data.settings.business_name || 'Vanjari Jodi Matrimony',
          whatsapp_api_token: data.settings.whatsapp_api_token || '',
          currency: data.settings.currency || 'INR',
          qr_code_url: data.settings.qr_code_url || siteConfig?.paymentQrUrl || '',
          support_mobile: data.settings.support_mobile || '+91 9800000000',
          payment_note: data.settings.payment_note || 'कृपया पेमेंट करताना योग्य UTR नंबर टाकावा.',
        });
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
    }
  };

  useEffect(() => {
    fetchBackendRequests();
    fetchBackendSettings();
  }, [searchQuery]);

  // Save Settings to Backend & Context
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      setSettingsSuccess(null);

      const res = await fetch('/api/payment/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      const data = await res.json();
      if (data.success) {
        setSettingsSuccess('✅ UPI व व्यवसाय पेमेंट सेटिंग्ज यशस्वीरित्या अपडेट झाल्या आहेत!');
        // Update AppContext siteConfig
        updateSiteConfig({
          paymentUpiId: settingsForm.upi_id,
          paymentQrUrl: settingsForm.qr_code_url,
          paymentNote: settingsForm.payment_note,
        });
        setTimeout(() => setSettingsSuccess(null), 3500);
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Copy UTR with Toast
  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // One-Click Approval Handler
  // 1. Updates backend status to 'approved'
  // 2. Extends user membership plan with calculated expiry
  // 3. Generates and downloads official branded PDF Invoice
  // 4. Opens WhatsApp notification ready to send
  const handleOneClickApprove = async (reqItem: any) => {
    try {
      setActionLoadingId(reqItem.id);
      const res = await fetch(`/api/admin/payment-requests/${reqItem.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_note: 'पेमेंट ॲडमिनद्वारे तपासले व मंजूर केले गेले.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Trigger AppContext state update
        approvePaymentRequest(reqItem.id);

        logActivity(
          'Payment Request Approved',
          `प्रशासकाने ${reqItem.user_name || reqItem.userName} चे ₹${reqItem.amount} (UTR: ${reqItem.utr_number || reqItem.utrNumber}) पेमेंट मंजूर केले.`,
          'Admin'
        );

        // 1. Generate & Download PDF Payment Invoice
        if (data.invoiceData) {
          downloadPaymentInvoicePDF(data.invoiceData);
        }

        // 2. Open WhatsApp Web / App if mobile available
        if (data.waLink) {
          window.open(data.waLink, '_blank');
        }

        setStatusFeedback(`✅ ${reqItem.user_name || reqItem.userName} यांचे पेमेंट मंजूर झाले, पावती डाउनलोड झाली व व्हॉट्सॲप मेसेज तयार झाला!`);
        setTimeout(() => setStatusFeedback(null), 4000);

        // Refresh List
        fetchBackendRequests();
      }
    } catch (err: any) {
      console.error('Error approving payment:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Request Handler
  const handleConfirmReject = async () => {
    if (!rejectModalData) return;
    try {
      setIsRejecting(true);
      const res = await fetch(`/api/admin/payment-requests/${rejectModalData.requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await res.json();
      if (data.success) {
        rejectPaymentRequest(rejectModalData.requestId);
        setRejectModalData(null);
        setStatusFeedback('पेमेंट विनंती नाकारण्यात आली.');
        setTimeout(() => setStatusFeedback(null), 3000);
        fetchBackendRequests();
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
    } finally {
      setIsRejecting(false);
    }
  };

  // Direct Invoice Download Button
  const handleDownloadInvoiceDirect = (reqItem: any) => {
    const invData: InvoiceData = {
      invoiceNumber: `INV-${(reqItem.id || '').replace(/[^0-9]/g, '').slice(-6) || Date.now().toString().slice(-6)}`,
      paymentId: reqItem.id,
      utrNumber: reqItem.utr_number || reqItem.utrNumber || 'N/A',
      userName: reqItem.user_name || reqItem.userName || 'Member',
      userMobile: reqItem.user_mobile || reqItem.userMobile || '',
      planName: reqItem.plan_name || reqItem.planName || 'Vanjari Jodi Plan',
      planDuration: reqItem.plan_duration || 'Standard',
      amount: Number(reqItem.amount) || 299,
      currency: settingsForm.currency,
      paymentDate: reqItem.created_at || reqItem.createdAt || new Date().toISOString(),
      membershipExpiryDate: reqItem.membership_expires_at || reqItem.approved_at || new Date().toISOString(),
      businessName: settingsForm.business_name,
      upiId: settingsForm.upi_id,
    };
    downloadPaymentInvoicePDF(invData);
  };

  // Send / Resend WhatsApp Confirmation
  const handleSendWhatsApp = (reqItem: any) => {
    const cleanMobile = (reqItem.user_mobile || reqItem.userMobile || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanMobile) {
      alert('मोबाईल नंबर उपलब्ध नाही');
      return;
    }
    const message = `🎉 *वंजारी जोडी मॅट्रिमोनी - पेमेंट पावती व मेंबरशिप!* 🎉\n\nनमस्कार *${reqItem.user_name || reqItem.userName}*,\nतुमचे ₹${reqItem.amount} चे पेमेंट (UTR: ${reqItem.utr_number || reqItem.utrNumber}) यशस्वीरीत्या मंजूर झाले आहे.\n\n📋 *प्लॅन:* ${reqItem.plan_name || reqItem.planName}\n🔐 *स्टेटस:* Active Premium Member\n\nआता तुम्ही सर्व वधू-वर प्रोफाईल्सचे संपर्क नंबर पाहू शकता!\n\n🌐 लॉगिन: https://vanjarijodi.org\n📞 मदत: ${settingsForm.support_mobile}\n\n॥ श्री संत भगवान बाबा प्रसन्न ॥`;
    const waUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Filtered List
  const displayedRequests = backendRequests.filter((r) => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'approved') return r.status === 'approved';
    if (activeTab === 'rejected') return r.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#9B1228] to-[#800C1E] rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 backdrop-blur-md flex items-center justify-center border border-amber-300/30">
                <DollarSign className="w-5 h-5 text-amber-300" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-white tracking-wide">
                डायनॅमिक UPI पेमेंट व पडताळणी पोर्टल
              </h2>
            </div>
            <p className="text-xs text-amber-200/90 mt-1 max-w-xl">
              १२-अंकी UTR पडताळणी, १-क्लिक मेंबरशिप ॲक्टिव्हेशन, GST PDF इन्व्हॉइस व व्हॉट्सॲप नोटिफिकेशन सिस्टम.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBackendRequests}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 backdrop-blur-md border border-white/20 transition shadow-inner"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश करा</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-1">
          {/* Pending Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
              activeTab === 'pending'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>प्रलंबित विनंत्या (Pending)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/20 font-black">
              {counts.pending}
            </span>
          </button>

          {/* Approved Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
              activeTab === 'approved'
                ? 'bg-emerald-400 text-emerald-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>मंजूर पेमेंट (Approved)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/20 font-black">
              {counts.approved}
            </span>
          </button>

          {/* Rejected Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
              activeTab === 'rejected'
                ? 'bg-rose-400 text-rose-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>नाकारलेले (Rejected)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/20 font-black">
              {counts.rejected}
            </span>
          </button>

          {/* All Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>सर्व नोंदी ({counts.all})</span>
          </button>

          {/* UPI Settings Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
              activeTab === 'settings'
                ? 'bg-amber-300 text-amber-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ UPI व व्यवसाय सेटिंग्ज (Instant Config)</span>
          </button>
        </div>
      </div>

      {/* Global Status Feedback Toast */}
      {statusFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 flex items-center space-x-2.5 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: PAYMENTS LIST (Pending / Approved / Rejected / All)   */}
      {/* ------------------------------------------------------------- */}
      {activeTab !== 'settings' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="UTR नंबर, सदस्याचे नाव, मोबाईल किंवा प्लॅन शोधा..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-600 px-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Payments Table / Cards */}
          {isLoadingRequests ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-[#800C1E] animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">पेमेंट नोंदी लोड होत आहेत...</p>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Clock className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="text-base font-bold text-gray-700">कोणतीही पेमेंट नोंद आढळली नाही</h4>
              <p className="text-xs text-gray-500">
                {activeTab === 'pending'
                  ? 'सध्या कोणतीही प्रलंबित पेमेंट विनंती नाही.'
                  : 'शोध निकषाशी जुळणारी नोंद उपलब्ध नाही.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl p-5 border transition shadow-sm hover:shadow-md ${
                      isPending
                        ? 'border-amber-200 bg-amber-50/20'
                        : isApproved
                        ? 'border-emerald-200'
                        : 'border-rose-200 bg-rose-50/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Member Info & Plan Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {isPending ? '⏳ प्रलंबित (Pending)' : isApproved ? '✅ मंजूर (Approved)' : '❌ नाकारले (Rejected)'}
                          </span>

                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-mono">
                            {new Date(req.created_at || req.createdAt).toLocaleString('mr-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-gray-900">
                            {req.user_name || req.userName || 'Member'}
                          </h4>
                          <span className="text-xs text-gray-500 font-medium">
                            ({req.user_mobile || req.userMobile || 'No Mobile'})
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">
                            {req.plan_name || req.planName}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-[#800C1E] text-sm">
                            ₹{req.amount}
                          </span>
                        </p>
                      </div>

                      {/* Middle: 12-Digit UTR with Click-to-Copy & Screenshot */}
                      <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase font-bold block">
                            बँक UTR क्रमांक:
                          </span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-xs sm:text-sm font-black text-slate-800 tracking-wider">
                              {req.utr_number || req.utrNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(req.utr_number || req.utrNumber)}
                              className="p-1 rounded-md hover:bg-slate-200 text-gray-600 transition"
                              title="Copy UTR"
                            >
                              {copiedUtr === (req.utr_number || req.utrNumber) ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Screenshot Thumbnail / Quick View */}
                        {req.screenshot_url || req.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewScreenshot({
                                url: req.screenshot_url || req.screenshotUrl,
                                utr: req.utr_number || req.utrNumber,
                                userName: req.user_name || req.userName,
                                amount: req.amount,
                                planName: req.plan_name || req.planName,
                              })
                            }
                            className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shadow-inner flex-shrink-0"
                          >
                            <img
                              src={req.screenshot_url || req.screenshotUrl}
                              alt="Receipt Screenshot"
                              className="w-full h-full object-cover group-hover:scale-110 transition"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 text-center font-medium border border-dashed border-gray-300">
                            पावती नाही
                          </div>
                        )}
                      </div>

                      {/* Right: Actions (1-Click Approve, Reject, PDF Invoice, WhatsApp) */}
                      <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                        {isPending ? (
                          <>
                            {/* One-Click Approve */}
                            <button
                              type="button"
                              disabled={actionLoadingId === req.id}
                              onClick={() => handleOneClickApprove(req)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md hover:shadow-lg transition active:scale-98"
                            >
                              {actionLoadingId === req.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                              )}
                              <span>१-क्लिक मंजूर करा (Approve)</span>
                            </button>

                            {/* Reject Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setRejectModalData({
                                  requestId: req.id,
                                  userName: req.user_name || req.userName,
                                  utrNumber: req.utr_number || req.utrNumber,
                                })
                              }
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>नाकारा</span>
                            </button>
                          </>
                        ) : isApproved ? (
                          <>
                            {/* Download Invoice PDF */}
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoiceDirect(req)}
                              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-700" />
                              <span>PDF इन्व्हॉइस</span>
                            </button>

                            {/* Send WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleSendWhatsApp(req)}
                              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp पावती</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-xs text-rose-700 font-medium italic">
                            शेरा: {req.admin_note || 'नाकारण्यात आले'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: INSTANT UPI & BUSINESS CONFIG FORM                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                UPI व व्यवसाय पेमेंट सेटिंग्ज (Live Config)
              </h3>
              <p className="text-xs text-gray-500">
                येथील सेटिंग्ज बदलताच संपूर्ण वेबसाईटवरील UPI Deep Link, QR Code व पावती तत्काळ अपडेट होते.
              </p>
            </div>
          </div>

          {settingsSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* UPI ID */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  पेमेंट UPI आयडी (Merchant UPI ID) *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.upi_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                  placeholder="उदा. vanjarijodi@paytm किंवा 9800000000@ybl"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-800 focus:bg-white focus:border-[#800C1E] focus:outline-none"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  या UPI आयडीवर सदस्यांचे पैसे थेट जमा होतील.
                </span>
              </div>

              {/* Merchant / Business Name */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  व्यवसाय / मर्चंट नाव (Business Name) *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.business_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, business_name: e.target.value })}
                  placeholder="उदा. Vanjari Jodi Matrimony"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#800C1E] focus:outline-none"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  UPI ॲप्स (GPay/PhonePe) मध्ये हे नाव दिसेल.
                </span>
              </div>

              {/* Currency */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  चलन (Currency)
                </label>
                <input
                  type="text"
                  value={settingsForm.currency}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                  placeholder="INR"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#800C1E] focus:outline-none"
                />
              </div>

              {/* WhatsApp API Token (Optional) */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  WhatsApp API Token (पर्यायी)
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsapp_api_token}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_api_token: e.target.value })}
                  placeholder="व्हॉट्सॲप ऑटोमेशन टोकन"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-[#800C1E] focus:outline-none"
                />
              </div>

              {/* Support Helpline */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  ग्राहक सेवा संपर्क क्रमांक (Support Helpline)
                </label>
                <input
                  type="text"
                  value={settingsForm.support_mobile}
                  onChange={(e) => setSettingsForm({ ...settingsForm, support_mobile: e.target.value })}
                  placeholder="+91 9800000000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#800C1E] focus:outline-none"
                />
              </div>

              {/* Custom QR Code Image URL */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1">
                  कस्टम QR कोड इमेज URL (पर्यायी)
                </label>
                <input
                  type="url"
                  value={settingsForm.qr_code_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, qr_code_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:border-[#800C1E] focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Settings */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-8 py-3.5 bg-[#800C1E] hover:bg-[#6A0A19] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>सेव्ह होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>सेटिंग्ज त्वरित सेव्ह करा (Save Config)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: QUICK VIEW SCREENSHOT MODAL                          */}
      {/* ------------------------------------------------------------- */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">पेमेंट पावती स्क्रीनशॉट</h4>
                <p className="text-xs text-gray-400">
                  {previewScreenshot.userName} • UTR: {previewScreenshot.utr}
                </p>
              </div>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewScreenshot.url}
                alt="Receipt Full Preview"
                className="max-h-[60vh] object-contain rounded-xl shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-white flex items-center justify-between border-t border-slate-200">
              <span className="font-mono font-bold text-xs text-emerald-800">
                UTR: {previewScreenshot.utr}
              </span>
              <a
                href={previewScreenshot.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#800C1E] font-bold flex items-center space-x-1 hover:underline"
              >
                <span>मूळ फोटो पाहा</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: REJECT REASON MODAL                                  */}
      {/* ------------------------------------------------------------- */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center space-x-2.5 text-rose-700">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-bold text-base">पेमेंट विनंती नाकारा (Reject Payment)</h4>
            </div>

            <p className="text-xs text-gray-600">
              सदस्य: <strong className="text-gray-900">{rejectModalData.userName}</strong> | UTR:{' '}
              <strong className="font-mono text-gray-900">{rejectModalData.utrNumber}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                नाकारण्याचे कारण (Admin Note):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* Quick Reason Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'चुकीचा / अमान्य UTR क्रमांक',
                'पेमेंट बँक खात्यात जमा झाले नाही',
                'अस्पष्ट स्क्रीनशॉट पावती',
                'कमी रक्कम भरली आहे',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-gray-700 font-medium"
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md"
              >
                {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span>नाकारणे निश्चित करा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
