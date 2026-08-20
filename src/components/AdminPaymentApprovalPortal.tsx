import React, { useState, useEffect, useMemo } from 'react';
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
  PhoneCall,
  Lock,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Trash2,
  Tag,
  Gift,
  Percent,
  TrendingUp,
  Users,
} from 'lucide-react';

export const AdminPaymentApprovalPortal: React.FC = () => {
  const {
    siteConfig,
    updateSiteConfig,
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    deletePaymentRequest,
    payPerContactRequests,
    approvePayPerContactRequest,
    rejectPayPerContactRequest,
    deletePayPerContactRequest,
    logActivity,
    profiles,
    promoCodes,
  } = useApp();

  // Active Tab: 'pending' | 'approved' | 'rejected' | 'all' | 'contact_unlocks' | 'promo_report' | 'settings'
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all' | 'contact_unlocks' | 'promo_report' | 'settings'>('pending');

  // Sub-filter for request type: 'all' | 'plans' | 'contacts'
  const [requestTypeFilter, setRequestTypeFilter] = useState<'all' | 'plans' | 'contacts'>('all');

  // Backend Requests State & Filters
  const [backendRequests, setBackendRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBankGuide, setShowBankGuide] = useState<boolean>(true);

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
    isContactUnlock?: boolean;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('बँक खात्यात पैसे जमा झालेले नाहीत किंवा UTR क्रमांक जुळत नाही.');
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
      if (data.success && Array.isArray(data.requests)) {
        setBackendRequests(data.requests);
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

  // Combine All Requests (Backend + AppContext Plans + Contact Unlocks) for unified search & deduplication
  const allUnifiedRequests = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<string>();

    // 1. Backend requests
    backendRequests.forEach((r) => {
      seenIds.add(r.id);
      list.push({
        id: r.id,
        userId: r.user_id || r.userId,
        userName: r.user_name || r.userName,
        userMobile: r.user_mobile || r.userMobile,
        planName: r.plan_name || r.planName,
        planId: r.plan_id || r.planId,
        amount: Number(r.amount) || 0,
        utrNumber: r.utr_number || r.utrNumber,
        screenshotUrl: r.screenshot_url || r.screenshotUrl,
        status: r.status,
        createdAt: r.created_at || r.createdAt,
        adminNote: r.admin_note || r.adminNote,
        promoCode: r.promo_code || r.promoCode,
        discountAmount: Number(r.discount_amount || r.discountAmount) || 0,
        originalAmount: Number(r.original_amount || r.originalAmount) || Number(r.amount) || 0,
        type: 'plan',
      });
    });

    // 2. Local context payment requests
    paymentRequests.forEach((r) => {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        list.push({
          ...r,
          promoCode: r.promoCode || (r.adminNote?.includes('कूपन कोड लागू:') ? r.adminNote.split('कूपन कोड लागू:')[1]?.split(' ')[1] : undefined),
          discountAmount: Number(r.discountAmount) || 0,
          originalAmount: Number(r.originalAmount) || Number(r.amount) || 0,
          type: 'plan',
        });
      }
    });

    // 3. Contact Unlocks
    payPerContactRequests.forEach((r) => {
      list.push({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        userMobile: r.userMobile,
        planName: `संपर्क अनलॉक: ${r.targetProfileName}`,
        targetProfileId: r.targetProfileId,
        targetProfileName: r.targetProfileName,
        targetProfileMobile: r.targetProfileMobile,
        amount: r.amount,
        utrNumber: r.utrNumber,
        screenshotUrl: r.screenshotUrl,
        status: r.status,
        createdAt: r.createdAt,
        adminNote: r.adminNote,
        type: 'contact_unlock',
      });
    });

    return list;
  }, [backendRequests, paymentRequests, payPerContactRequests]);

  // Anti-Fraud Analytics: Compute Duplicate UTR & Duplicate Screenshot counts across the entire ecosystem
  const fraudAnalytics = useMemo(() => {
    const utrCounts: Record<string, number> = {};
    const screenshotCounts: Record<string, number> = {};

    allUnifiedRequests.forEach((item) => {
      const cleanUtr = (item.utrNumber || '').trim();
      if (cleanUtr && cleanUtr.length >= 6) {
        utrCounts[cleanUtr] = (utrCounts[cleanUtr] || 0) + 1;
      }

      const scr = (item.screenshotUrl || '').trim();
      if (scr && scr.length > 15 && !scr.includes('sample')) {
        screenshotCounts[scr] = (screenshotCounts[scr] || 0) + 1;
      }
    });

    // Also check registered profile history
    profiles.forEach((p) => {
      if (p.paymentUtr) {
        const clean = p.paymentUtr.trim();
        utrCounts[clean] = (utrCounts[clean] || 0) + 1;
      }
    });

    return { utrCounts, screenshotCounts };
  }, [allUnifiedRequests, profiles]);

  // Comprehensive Promo Code Usage & Revenue Analytics
  const promoAnalytics = useMemo(() => {
    const promoTransactions = allUnifiedRequests.filter(
      (r) => !!r.promoCode || (r.adminNote && r.adminNote.includes('कूपन'))
    );

    let totalPromoUses = 0;
    let totalDiscountGiven = 0;
    let totalPromoRevenue = 0;

    const breakdown: Record<
      string,
      {
        code: string;
        count: number;
        discountTotal: number;
        revenueTotal: number;
        orders: any[];
      }
    > = {};

    // Initialize all existing promo codes from context
    promoCodes.forEach((p) => {
      breakdown[p.code.toUpperCase()] = {
        code: p.code.toUpperCase(),
        count: p.usedCount || 0,
        discountTotal: 0,
        revenueTotal: 0,
        orders: [],
      };
    });

    promoTransactions.forEach((t) => {
      const rawCode = (t.promoCode || 'CUSTOM').toUpperCase();
      totalPromoUses++;
      totalDiscountGiven += Number(t.discountAmount) || 0;
      totalPromoRevenue += Number(t.amount) || 0;

      if (!breakdown[rawCode]) {
        breakdown[rawCode] = {
          code: rawCode,
          count: 0,
          discountTotal: 0,
          revenueTotal: 0,
          orders: [],
        };
      }

      breakdown[rawCode].count++;
      breakdown[rawCode].discountTotal += Number(t.discountAmount) || 0;
      breakdown[rawCode].revenueTotal += Number(t.amount) || 0;
      breakdown[rawCode].orders.push(t);
    });

    return {
      totalPromoUses,
      totalDiscountGiven,
      totalPromoRevenue,
      promoTransactions,
      breakdownList: Object.values(breakdown),
    };
  }, [allUnifiedRequests, promoCodes]);

  // Counts Calculation
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let contactUnlocks = 0;
    let duplicateAlerts = 0;

    allUnifiedRequests.forEach((r) => {
      if (r.status === 'pending') pending++;
      if (r.status === 'approved') approved++;
      if (r.status === 'rejected') rejected++;
      if (r.type === 'contact_unlock') contactUnlocks++;

      const isDupUtr = (fraudAnalytics.utrCounts[r.utrNumber] || 0) > 1;
      const isDupScr = r.screenshotUrl && (fraudAnalytics.screenshotCounts[r.screenshotUrl] || 0) > 1;
      if (isDupUtr || isDupScr) {
        duplicateAlerts++;
      }
    });

    return {
      all: allUnifiedRequests.length,
      pending,
      approved,
      rejected,
      contactUnlocks,
      duplicateAlerts,
      promoOrders: promoAnalytics.totalPromoUses,
    };
  }, [allUnifiedRequests, fraudAnalytics, promoAnalytics]);

  // Filtered List
  const displayedRequests = useMemo(() => {
    return allUnifiedRequests.filter((r) => {
      // Tab matching
      if (activeTab === 'pending' && r.status !== 'pending') return false;
      if (activeTab === 'approved' && r.status !== 'approved') return false;
      if (activeTab === 'rejected' && r.status !== 'rejected') return false;
      if (activeTab === 'contact_unlocks' && r.type !== 'contact_unlock') return false;
      if (activeTab === 'promo_report' && !r.promoCode && (!r.adminNote || !r.adminNote.includes('कूपन'))) return false;

      // Sub-type filter
      if (requestTypeFilter === 'plans' && r.type !== 'plan') return false;
      if (requestTypeFilter === 'contacts' && r.type !== 'contact_unlock') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesUtr = (r.utrNumber || '').toLowerCase().includes(q);
        const matchesName = (r.userName || '').toLowerCase().includes(q);
        const matchesMobile = (r.userMobile || '').toLowerCase().includes(q);
        const matchesPlan = (r.planName || '').toLowerCase().includes(q);
        if (!matchesUtr && !matchesName && !matchesMobile && !matchesPlan) {
          return false;
        }
      }

      return true;
    });
  }, [allUnifiedRequests, activeTab, requestTypeFilter, searchQuery]);

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
  const handleOneClickApprove = async (reqItem: any) => {
    try {
      setActionLoadingId(reqItem.id);

      if (reqItem.type === 'contact_unlock') {
        // Approve Contact Unlock
        approvePayPerContactRequest(reqItem.id);
        setStatusFeedback(`✅ ${reqItem.userName} यांची संपर्क क्रमांक अनलॉक विनंती मंजूर झाली!`);
        setTimeout(() => setStatusFeedback(null), 4000);
        return;
      }

      // Approve Membership Plan Request
      const res = await fetch(`/api/admin/payment-requests/${reqItem.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_note: 'पेमेंट ॲडमिनद्वारे पडताळून मंजूर केले गेले.',
        }),
      });

      const data = await res.json();
      approvePaymentRequest(reqItem.id);

      logActivity(
        'Payment Request Approved',
        `प्रशासकाने ${reqItem.userName} चे ₹${reqItem.amount} (UTR: ${reqItem.utrNumber}) पेमेंट मंजूर केले.`,
        'Admin'
      );

      // Download PDF Invoice
      if (data?.invoiceData) {
        downloadPaymentInvoicePDF(data.invoiceData);
      } else {
        handleDownloadInvoiceDirect(reqItem);
      }

      // Open WhatsApp Web
      if (data?.waLink) {
        window.open(data.waLink, '_blank');
      }

      setStatusFeedback(`✅ ${reqItem.userName} यांचे पेमेंट मंजूर झाले, पावती डाउनलोड झाली व मेंबरशिप सक्रिय झाली!`);
      setTimeout(() => setStatusFeedback(null), 4000);

      fetchBackendRequests();
    } catch (err: any) {
      console.error('Error approving payment:', err);
      // Fallback local approval
      approvePaymentRequest(reqItem.id);
      setStatusFeedback(`✅ ${reqItem.userName} यांचे पेमेंट स्थानिक पातळीवर मंजूर झाले!`);
      setTimeout(() => setStatusFeedback(null), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Request Handler
  const handleConfirmReject = async () => {
    if (!rejectModalData) return;
    try {
      setIsRejecting(true);

      if (rejectModalData.isContactUnlock) {
        rejectPayPerContactRequest(rejectModalData.requestId);
        setRejectModalData(null);
        setStatusFeedback('संपर्क अनलॉक विनंती अमान्य करण्यात आली.');
        setTimeout(() => setStatusFeedback(null), 3000);
        return;
      }

      const res = await fetch(`/api/admin/payment-requests/${rejectModalData.requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      rejectPaymentRequest(rejectModalData.requestId);
      setRejectModalData(null);
      setStatusFeedback('पेमेंट विनंती नाकारण्यात आली.');
      setTimeout(() => setStatusFeedback(null), 3000);
      fetchBackendRequests();
    } catch (err) {
      console.error('Error rejecting payment:', err);
      rejectPaymentRequest(rejectModalData.requestId);
      setRejectModalData(null);
    } finally {
      setIsRejecting(false);
    }
  };

  // Direct Invoice Download Button
  const handleDownloadInvoiceDirect = (reqItem: any) => {
    const invData: InvoiceData = {
      invoiceNumber: `INV-${(reqItem.id || '').replace(/[^0-9]/g, '').slice(-6) || Date.now().toString().slice(-6)}`,
      paymentId: reqItem.id,
      utrNumber: reqItem.utrNumber || 'N/A',
      userName: reqItem.userName || 'Member',
      userMobile: reqItem.userMobile || '',
      planName: reqItem.planName || 'Vanjari Jodi Membership Plan',
      planDuration: '६ महिने (Standard)',
      amount: Number(reqItem.amount) || 299,
      currency: settingsForm.currency,
      paymentDate: reqItem.createdAt || new Date().toISOString(),
      membershipExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      businessName: settingsForm.business_name,
      upiId: settingsForm.upi_id,
    };
    downloadPaymentInvoicePDF(invData);
  };

  // Send WhatsApp Clarification
  const handleSendWhatsAppClarification = (reqItem: any) => {
    const cleanMobile = (reqItem.userMobile || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanMobile) {
      alert('मोबाईल नंबर उपलब्ध नाही');
      return;
    }
    const isDup = (fraudAnalytics.utrCounts[reqItem.utrNumber] || 0) > 1;
    let message = '';

    if (isDup) {
      message = `नमस्कार *${reqItem.userName}*,\n\nवंजारी जोडी मॅट्रिमोनी वरून संपर्क करत आहोत. तुम्ही सबमिट केलेला UTR क्रमांक (*${reqItem.utrNumber}*) आधीच वापरलेला दिसत आहे. कृपया तुमच्या बँक पावतीचा खरा आणि स्पष्ट फोटो किंवा योग्य UTR क्रमांक पाठवा.\n\nधन्यवाद,\n*वंजारी जोडी मॅट्रिमोनी टीम*`;
    } else if (reqItem.status === 'approved') {
      message = `🎉 *वंजारी जोडी मॅट्रिमोनी - पेमेंट मंजूर!* 🎉\n\nनमस्कार *${reqItem.userName}*,\nतुमचे ₹${reqItem.amount} चे पेमेंट (UTR: ${reqItem.utrNumber}) यशस्वीरीत्या मंजूर झाले आहे.\n\n📋 *प्लॅन:* ${reqItem.planName}\n🔐 *स्टेटस:* ॲक्टिव्ह मेंबर\n\n🌐 लॉगिन: https://vanjarijodi.org\n📞 मदत: ${settingsForm.support_mobile}`;
    } else {
      message = `नमस्कार *${reqItem.userName}*,\n\nवंजारी जोडी मॅट्रिमोनीवर तुमच्या ₹${reqItem.amount} च्या पेमेंट पावतीची (UTR: ${reqItem.utrNumber}) पडताळणी चालू आहे. काही शंका असल्यास कृपया या नंबरवर संपर्क साधा.\n\n- वंजारी जोडी मॅनेजमेंट`;
    }

    const waUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#9B1228] to-[#800C1E] rounded-3xl p-6 sm:p-7 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 backdrop-blur-md flex items-center justify-center border border-amber-300/30 shadow-inner">
                <DollarSign className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-wide">
                  मॅन्युअल UPI पेमेंट व पडताळणी पोर्टल
                </h2>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  फसवणूक प्रतिबंधक (Anti-Fraud UTR & Screenshot Check) आणि १-क्लिक ॲडमिन मंजुरी सिस्टीम
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {counts.duplicateAlerts > 0 && (
              <div className="px-3 py-1.5 bg-rose-500/30 border border-rose-300/50 rounded-xl text-rose-200 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-300" />
                <span>{counts.duplicateAlerts} डुप्लिकेट इशारे</span>
              </div>
            )}
            <button
              type="button"
              onClick={fetchBackendRequests}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 backdrop-blur-md border border-white/20 transition shadow-inner cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
              <span>रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-1">
          {/* Pending Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>प्रलंबित (Pending)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/20 font-black">
              {counts.pending}
            </span>
          </button>

          {/* Approved Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-400 text-emerald-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>मंजूर (Approved)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/20 font-black">
              {counts.approved}
            </span>
          </button>

          {/* Contact Unlocks Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('contact_unlocks')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'contact_unlocks'
                ? 'bg-teal-400 text-teal-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>संपर्क अनलॉक ({counts.contactUnlocks})</span>
          </button>

          {/* Rejected Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>सर्व नोंदी ({counts.all})</span>
          </button>

          {/* Promo Code Report Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('promo_report')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'promo_report'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Gift className="w-4 h-4 text-emerald-300" />
            <span>🏷️ कूपन वापर अहवाल ({counts.promoOrders})</span>
          </button>

          {/* UPI Settings Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-300 text-amber-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ UPI व मर्चंट सेटिंग्ज</span>
          </button>
        </div>
      </div>

      {/* Collapsible Admin Bank Verification Quick Guide */}
      {activeTab !== 'settings' && activeTab !== 'promo_report' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <h4 className="font-bold text-sm text-slate-900">
                💡 ॲडमिन मॅन्युअल पडताळणी मार्गदर्शिका (Bank Verification Guide)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowBankGuide(!showBankGuide)}
              className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
            >
              {showBankGuide ? 'लपवा (Hide)' : 'मार्गदर्शन पाहा (Show)'}
            </button>
          </div>

          {showBankGuide && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-200/80 text-xs text-slate-700">
              <div className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0">१</span>
                <p>
                  <strong>UTR कॉपी करा:</strong> कार्डवरील <strong>📋 कॉपी</strong> बटण दाबा.
                </p>
              </div>

              <div className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0">२</span>
                <p>
                  <strong>बँक ॲप उघडा:</strong> PhonePe/Paytm/Bank मध्ये UTR सर्च करून ₹ रक्कम व नाव तपासा.
                </p>
              </div>

              <div className="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0">३</span>
                <p>
                  <strong>मंजूर करा:</strong> पैसे बँक खात्यात आल्याची खात्री झाल्यावरच हिरवे <strong>१-क्लिक मंजूर करा</strong> बटण दाबा.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Status Feedback Toast */}
      {statusFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 flex items-center space-x-2.5 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: PAYMENTS & UNLOCK REQUESTS LIST                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab !== 'settings' && activeTab !== 'promo_report' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="UTR नंबर, सदस्याचे नाव, मोबाईल किंवा प्लॅन शोधा..."
                className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800C1E]/20 text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Request Type Selector */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setRequestTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  requestTypeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                सर्व प्रकार
              </button>
              <button
                type="button"
                onClick={() => setRequestTypeFilter('plans')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  requestTypeFilter === 'plans'
                    ? 'bg-[#800C1E] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                मेंबरशिप प्लॅन्स
              </button>
              <button
                type="button"
                onClick={() => setRequestTypeFilter('contacts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  requestTypeFilter === 'contacts'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                संपर्क अनलॉक
              </button>
            </div>
          </div>

          {/* Payments Table / Cards */}
          {isLoadingRequests ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-[#800C1E] animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">पेमेंट व UTR नोंदी लोड होत आहेत...</p>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Clock className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="text-base font-bold text-gray-700">कोणतीही पेमेंट नोंद आढळली नाही</h4>
              <p className="text-xs text-gray-500">
                {activeTab === 'pending'
                  ? 'सध्या कोणतीही प्रलंबित पेमेंट विनंती नाही. सर्व विनंत्या तपासल्या गेल्या आहेत.'
                  : 'शोध निकषाशी जुळणारी नोंद उपलब्ध नाही.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const isContactUnlock = req.type === 'contact_unlock';

                // Fraud analytics checks
                const utrDupCount = fraudAnalytics.utrCounts[req.utrNumber] || 0;
                const isDuplicateUtr = utrDupCount > 1;

                const scrDupCount = req.screenshotUrl ? fraudAnalytics.screenshotCounts[req.screenshotUrl] || 0 : 0;
                const isDuplicateScreenshot = scrDupCount > 1;

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl p-5 border-2 transition shadow-sm hover:shadow-md space-y-3.5 ${
                      isDuplicateUtr || isDuplicateScreenshot
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                        : isPending
                        ? 'border-amber-300 bg-amber-50/20'
                        : isApproved
                        ? 'border-emerald-300'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    {/* Top Fraud Warning Badge if Duplicate Detected */}
                    {(isDuplicateUtr || isDuplicateScreenshot) && (
                      <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-2 text-rose-800 text-xs font-bold animate-pulse">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            {isDuplicateUtr && isDuplicateScreenshot
                              ? `⚠️ सतर्कता: हा UTR क्रमांक (${utrDupCount} वेळा) आणि स्क्रीनशॉट डुप्लिकेट आहे! त्वरित बँक ॲपमध्ये पडताळणी करा.`
                              : isDuplicateUtr
                              ? `⚠️ सतर्कता: हा UTR क्रमांक (${req.utrNumber}) आधीच ${utrDupCount} वेळा सिस्टममध्ये सबमिट झाला आहे! (Duplicate UTR)`
                              : `⚠️ सतर्कता: ही स्क्रीनशॉट पावती इतर सदस्यांच्या पावतीशी जुळत आहे (Duplicate Screenshot).`}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] uppercase font-mono shrink-0">
                          संशयास्पद
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Member Info & Plan Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          {/* Type Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              isContactUnlock
                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}
                          >
                            {isContactUnlock ? '📞 पे-पर-काँटॅक्ट' : '👑 मेंबरशिप प्लॅन'}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border-rose-300'
                            }`}
                          >
                            {isPending ? '⏳ पडताळणी प्रलंबित' : isApproved ? '✅ मंजूर (Approved)' : '❌ नाकारले (Rejected)'}
                          </span>

                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-mono">
                            {new Date(req.createdAt).toLocaleString('mr-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-gray-900 truncate">
                            {req.userName || 'सदस्य'}
                          </h4>
                          <span className="text-xs text-gray-500 font-medium shrink-0">
                            ({req.userMobile || 'मोबाईल नाही'})
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-semibold text-slate-800 text-xs">
                            {req.planName}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          {req.originalAmount && req.originalAmount > req.amount ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs text-gray-400 line-through">
                                ₹{req.originalAmount}
                              </span>
                              <span className="font-extrabold text-emerald-700 text-sm">
                                ₹{req.amount}
                              </span>
                            </div>
                          ) : (
                            <span className="font-extrabold text-[#800C1E] text-sm">
                              ₹{req.amount}
                            </span>
                          )}
                        </div>

                        {/* Promo Code Applied Tag */}
                        {(req.promoCode || (req.discountAmount && req.discountAmount > 0)) && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md text-[10px] font-black flex items-center gap-1">
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>कूपन: {req.promoCode || 'PROMO'}</span>
                            </span>
                            {req.discountAmount > 0 && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                ₹{req.discountAmount} सवलत लागू
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Middle: 12-Digit UTR with Click-to-Copy & Screenshot */}
                      <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block">
                              १२-अंकी UTR क्रमांक:
                            </span>
                            {isDuplicateUtr && (
                              <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                                डुप्लिकेट ({utrDupCount})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span
                              className={`font-mono text-xs sm:text-sm font-black tracking-wider ${
                                isDuplicateUtr ? 'text-rose-700 bg-rose-50 px-1 rounded' : 'text-slate-900'
                              }`}
                            >
                              {req.utrNumber || 'N/A'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(req.utrNumber)}
                              className="p-1 rounded-md hover:bg-slate-200 text-gray-600 transition cursor-pointer"
                              title="UTR कॉपी करा"
                            >
                              {copiedUtr === req.utrNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Screenshot Thumbnail / Quick View */}
                        {req.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewScreenshot({
                                url: req.screenshotUrl,
                                utr: req.utrNumber,
                                userName: req.userName,
                                amount: req.amount,
                                planName: req.planName,
                              })
                            }
                            className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shadow-inner flex-shrink-0 cursor-pointer"
                          >
                            <img
                              src={req.screenshotUrl}
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
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer"
                            >
                              {actionLoadingId === req.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                              )}
                              <span>१-क्लिक मंजूर करा (Approve)</span>
                            </button>

                            {/* WhatsApp Clarification */}
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppClarification(req)}
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl transition cursor-pointer"
                              title="WhatsApp वर मेसेज पाठवा"
                            >
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                            </button>

                            {/* Reject Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setRejectModalData({
                                  requestId: req.id,
                                  userName: req.userName,
                                  utrNumber: req.utrNumber,
                                  isContactUnlock,
                                })
                              }
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>नाकारा</span>
                            </button>
                          </>
                        ) : isApproved ? (
                          <>
                            {/* Download Invoice PDF for Plans */}
                            {!isContactUnlock && (
                              <button
                                type="button"
                                onClick={() => handleDownloadInvoiceDirect(req)}
                                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-amber-700" />
                                <span>PDF पावती</span>
                              </button>
                            )}

                            {/* WhatsApp Confirmation */}
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppClarification(req)}
                              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp पावती</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-rose-700 font-medium italic">
                              शेरा: {req.adminNote || 'अमान्य'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppClarification(req)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition cursor-pointer"
                              title="कारण विचारा"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
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
      {/* VIEW 2: PROMO CODE USAGE & FINANCIAL REPORT                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'promo_report' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-[#800C1E]/90 to-slate-950 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-amber-400/20 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>🏷️ कूपन व प्रोमो कोड्स वापर अहवाल</span>
                    <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 rounded-full text-xs font-mono">
                      Analytics & Revenue
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    कोणत्या सदस्याने कोणता प्रोमो कोड वापरला, किती सवलत मिळाली व एकूण किती रक्कम जमा झाली याचा रिअल-टाईम हिशोब.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={fetchBackendRequests}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 backdrop-blur-md border border-white/20 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
                  <span>रिफ्रेश</span>
                </button>
              </div>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold mb-1">
                  <span>एकूण प्रोमो ऑर्डर्स</span>
                  <Tag className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {promoAnalytics.totalPromoUses}
                </div>
                <p className="text-[10px] text-emerald-300 mt-1 font-medium">
                  यशस्वीरित्या कूपन लागू केलेल्या नोंदी
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold mb-1">
                  <span>एकूण दिलेली सवलत</span>
                  <Percent className="w-4 h-4 text-rose-300" />
                </div>
                <div className="text-2xl font-black text-rose-300 font-mono">
                  ₹{promoAnalytics.totalDiscountGiven.toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-300 mt-1 font-medium">
                  सदस्यांना मिळालेली एकूण सूट
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold mb-1">
                  <span>प्रत्यक्ष गोळा झालेली रक्कम</span>
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-2xl font-black text-emerald-300 font-mono">
                  ₹{promoAnalytics.totalPromoRevenue.toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-emerald-200 mt-1 font-medium">
                  कूपन वापरून आलेले निव्वळ उत्पन्न
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
                <div className="flex items-center justify-between text-slate-300 text-xs font-bold mb-1">
                  <span>सक्रिय कूपन्स संख्या</span>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {promoCodes.length}
                </div>
                <p className="text-[10px] text-cyan-200 mt-1 font-medium">
                  सिस्टममध्ये उपलब्ध प्रोमो कोड्स
                </p>
              </div>
            </div>
          </div>

          {/* Section: Promo Code Wise Summary Cards */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>प्रत्येक प्रोमो कोडनुसार सारांश (Code-wise Performance Breakdown)</span>
            </h4>

            {promoAnalytics.breakdownList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                कोणतेही कूपन किंवा प्रोमो कोड्स अद्याप तयार केलेले नाहीत.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promoAnalytics.breakdownList.map((item) => {
                  const configuredPromo = promoCodes.find(
                    (p) => p.code.toUpperCase() === item.code.toUpperCase()
                  );
                  return (
                    <div
                      key={item.code}
                      className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl p-4 border-2 border-slate-200 hover:border-emerald-300 transition shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 bg-emerald-700 text-white font-mono font-black text-xs rounded-lg shadow-sm">
                            {item.code}
                          </span>
                          {configuredPromo && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {configuredPromo.discountType === 'percentage'
                                ? `${configuredPromo.discountValue}% सूट`
                                : configuredPromo.discountType === 'vip_free'
                                ? '१००% मोफत VIP'
                                : `₹${configuredPromo.discountValue} सवलत`}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.count} वेळा वापर
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-gray-500 block">एकूण सवलत:</span>
                          <span className="font-mono font-extrabold text-rose-600">
                            ₹{item.discountTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-gray-500 block">गोळा रक्कम:</span>
                          <span className="font-mono font-extrabold text-emerald-700">
                            ₹{item.revenueTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Detailed User-wise Promo Transactions Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#800C1E]" />
                  <span>कूपन वापरलेल्या सदस्यांची सविस्तर यादी (User-wise Transactions)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  येथे कोणत्या सदस्याने कोणता प्लॅन किती सवलत घेऊन खरेदी केला याची संपूर्ण माहिती आहे.
                </p>
              </div>

              <div className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl">
                एकूण नोंदी: {promoAnalytics.promoTransactions.length}
              </div>
            </div>

            {promoAnalytics.promoTransactions.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <Gift className="w-12 h-12 text-slate-300 mx-auto" />
                <h5 className="font-bold text-slate-700 text-sm">कोणताही प्रोमो कोड वापर अद्याप झालेला नाही</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  जेव्हा सदस्य पेमेंट करताना प्रोमो कोड टाकतील, तेव्हा त्यांची सविस्तर यादी आणि सवलतीची रक्कम येथे आपोआप दिसेल.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                      <th className="p-3">सदस्य नाव व मोबाईल</th>
                      <th className="p-3">कूपन कोड</th>
                      <th className="p-3">प्लॅन नाव</th>
                      <th className="p-3 text-right">मूळ किंमत</th>
                      <th className="p-3 text-right">मिळालेली सवलत</th>
                      <th className="p-3 text-right">भरलेली प्रत्यक्ष रक्कम</th>
                      <th className="p-3">UTR व तारीख</th>
                      <th className="p-3 text-center">स्टेटस</th>
                      <th className="p-3 text-center">कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {promoAnalytics.promoTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-amber-50/30 transition">
                        {/* User Name & Mobile */}
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-xs">
                            {tx.userName || 'अनामिक सदस्य'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {tx.userMobile || 'मोबाईल नाही'}
                          </div>
                        </td>

                        {/* Promo Code Badge */}
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md font-mono font-black text-[11px] inline-flex items-center gap-1">
                            <Tag className="w-3 h-3 text-emerald-600" />
                            <span>{tx.promoCode || 'PROMO'}</span>
                          </span>
                        </td>

                        {/* Plan */}
                        <td className="p-3 font-medium text-slate-800">
                          {tx.planName || 'मेंबरशिप प्लॅन'}
                        </td>

                        {/* Original Price */}
                        <td className="p-3 text-right font-mono text-slate-500">
                          ₹{tx.originalAmount || tx.amount}
                        </td>

                        {/* Discount */}
                        <td className="p-3 text-right font-mono font-bold text-rose-600">
                          -₹{tx.discountAmount || 0}
                        </td>

                        {/* Final Paid Amount */}
                        <td className="p-3 text-right font-mono font-black text-emerald-700 text-sm">
                          ₹{tx.amount}
                        </td>

                        {/* UTR & Date */}
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-800 text-[11px]">
                            {tx.utrNumber || 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleDateString('mr-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              tx.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : tx.status === 'pending'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-rose-100 text-rose-900 border-rose-300'
                            }`}
                          >
                            {tx.status === 'approved' ? 'मंजूर' : tx.status === 'pending' ? 'प्रलंबित' : 'नाकारले'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {tx.screenshotUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewScreenshot({
                                    url: tx.screenshotUrl,
                                    utr: tx.utrNumber,
                                    userName: tx.userName,
                                    amount: tx.amount,
                                    planName: tx.planName,
                                  })
                                }
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                title="पावती पाहा"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppClarification(tx)}
                              className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                              title="WhatsApp मेसेज"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: INSTANT UPI & BUSINESS CONFIG FORM                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                UPI व मर्चंट पेमेंट सेटिंग्ज (Instant Config)
              </h3>
              <p className="text-xs text-gray-500">
                येथील UPI आयडी व सेटिंग्ज बदलताच संपूर्ण वेबसाईटवरील PhonePe, GPay, Paytm Deep Links व QR Code तत्काळ बदलतात.
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
                  मर्चंट UPI आयडी (Merchant UPI ID) *
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
                  या UPI आयडीवर सदस्यांचे पैसे थेट बँक खात्यात जमा होतील.
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
                  UPI ॲप्स (GPay/PhonePe) मध्ये पेमेंट करताना हे नाव दिसेल.
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
              <div className="sm:col-span-2">
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
                <span className="text-[11px] text-gray-500 mt-1 block">
                  रिकामे ठेवल्यास सिस्टीम आपोआप डायनॅमिक QR कोड तयार करेल.
                </span>
              </div>
            </div>

            {/* Submit Settings */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-8 py-3.5 bg-[#800C1E] hover:bg-[#6A0A19] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
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
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
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
      {/* MODAL 2: REJECT REASON MODAL WITH PRESET MARATHI REASONS      */}
      {/* ------------------------------------------------------------- */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center space-x-2.5 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
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

            {/* Quick Marathi Reason Pills */}
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 font-bold block">त्वरित कारणे निवडा:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'बँक खात्यात पैसे जमा झाले नाहीत / बनावट UTR',
                  'हा UTR क्रमांक आधीच वापरलेला आहे (Duplicate UTR)',
                  'स्क्रीनशॉट अस्पष्ट / जुना आहे',
                  'रक्कम अपूर्ण भरली आहे',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-gray-700 font-medium cursor-pointer transition"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100 cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md cursor-pointer disabled:opacity-50"
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
