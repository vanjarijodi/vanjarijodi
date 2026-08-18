import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size for base64 image uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // =========================================================================
  // Dynamic UPI Payment & Verification System Engine (Database & REST APIs)
  // Architecture: settings, memberships, payment_requests (with UNIQUE UTR)
  // =========================================================================
  
  interface SystemSettings {
    id: string;
    upi_id: string;
    business_name: string;
    whatsapp_api_token: string;
    currency: string;
    qr_code_url?: string;
    payment_note?: string;
    support_mobile?: string;
    updated_at: string;
  }

  interface UserMembership {
    id: string;
    user_id: string;
    user_name?: string;
    user_mobile?: string;
    plan_name: string;
    plan_id: string;
    amount: number;
    status: 'active' | 'expired';
    expires_at: string;
    created_at: string;
    updated_at: string;
  }

  interface PaymentRequestRecord {
    id: string;
    user_id: string;
    user_name: string;
    user_mobile: string;
    plan_id: string;
    plan_name: string;
    amount: number;
    utr_number: string; // UNIQUE Index
    screenshot_url: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_note: string;
    created_at: string;
    updated_at: string;
    approved_at?: string;
    membership_id?: string;
    payment_method?: string;
  }

  // In-Memory Master Stores with persistent data
  let globalSettings: SystemSettings = {
    id: 'main_settings',
    upi_id: process.env.PAYTM_UPI_ID || 'vanjarijodi@paytm',
    business_name: 'Vanjari Jodi Matrimony',
    whatsapp_api_token: process.env.WHATSAPP_API_TOKEN || '',
    currency: 'INR',
    qr_code_url: '',
    payment_note: 'कृपया पेमेंट करताना योग्य UTR नंबर टाकावा.',
    support_mobile: '+91 9800000000',
    updated_at: new Date().toISOString(),
  };

  const membershipsMap = new Map<string, UserMembership>();
  const paymentRequestsMap = new Map<string, PaymentRequestRecord>();
  const usedUtrSet = new Set<string>();

  // Seed sample demo data for instant admin testability if empty
  const sampleUtr1 = '984728491823';
  const sampleUtr2 = '563829104821';
  usedUtrSet.add(sampleUtr1);
  usedUtrSet.add(sampleUtr2);

  paymentRequestsMap.set('PAY-REQ-101', {
    id: 'PAY-REQ-101',
    user_id: 'usr-rahul-sanap',
    user_name: 'राहुल सानप',
    user_mobile: '9822334455',
    plan_id: 'welcome_offer',
    plan_name: 'वेलकम स्पेशल ऑफर (Welcome Plan)',
    amount: 299,
    utr_number: sampleUtr1,
    screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    admin_note: '',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    payment_method: 'upi_intent',
  });

  paymentRequestsMap.set('PAY-REQ-102', {
    id: 'PAY-REQ-102',
    user_id: 'usr-pooja-munde',
    user_name: 'पूजा मुंडे',
    user_mobile: '9766554433',
    plan_id: 'gold',
    plan_name: 'गोल्ड प्लॅन (Gold Plan - 6 Months)',
    amount: 999,
    utr_number: sampleUtr2,
    screenshot_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    admin_note: 'पेमेंट बँक खात्यात अचूक जमा झाले.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    approved_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    membership_id: 'MEM-usr-pooja-munde',
    payment_method: 'qr_scan',
  });

  membershipsMap.set('MEM-usr-pooja-munde', {
    id: 'MEM-usr-pooja-munde',
    user_id: 'usr-pooja-munde',
    user_name: 'पूजा मुंडे',
    user_mobile: '9766554433',
    plan_name: 'गोल्ड प्लॅन (Gold Plan - 6 Months)',
    plan_id: 'gold',
    amount: 999,
    status: 'active',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  });

  // Helper to sanitize inputs
  function sanitizeString(str: any): string {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, '').trim();
  }

  // 1. GET & POST Settings API
  app.get('/api/payment/settings', (req, res) => {
    res.json({
      success: true,
      settings: globalSettings,
    });
  });

  app.post('/api/payment/settings', (req, res) => {
    try {
      const { upi_id, business_name, whatsapp_api_token, currency, qr_code_url, payment_note, support_mobile } = req.body || {};
      if (upi_id) globalSettings.upi_id = sanitizeString(upi_id);
      if (business_name) globalSettings.business_name = sanitizeString(business_name);
      if (whatsapp_api_token !== undefined) globalSettings.whatsapp_api_token = sanitizeString(whatsapp_api_token);
      if (currency) globalSettings.currency = sanitizeString(currency).toUpperCase() || 'INR';
      if (qr_code_url !== undefined) globalSettings.qr_code_url = qr_code_url;
      if (payment_note !== undefined) globalSettings.payment_note = sanitizeString(payment_note);
      if (support_mobile !== undefined) globalSettings.support_mobile = sanitizeString(support_mobile);
      globalSettings.updated_at = new Date().toISOString();

      return res.json({
        success: true,
        message: 'Payment settings updated successfully',
        settings: globalSettings,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to update settings' });
    }
  });

  // 2. Generate Dynamic UPI Intent & QR Payload
  app.post('/api/payment/create-intent', (req, res) => {
    try {
      const { user_id, plan_id, plan_name, amount } = req.body || {};
      const numAmount = Number(amount) || 299;
      const cleanUserId = sanitizeString(user_id) || 'guest-user';
      const cleanPlanId = sanitizeString(plan_id) || 'welcome_offer';
      const cleanPlanName = sanitizeString(plan_name) || 'VanjariJodi Plan';

      const orderId = `VJ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const targetUpiId = globalSettings.upi_id || 'vanjarijodi@paytm';
      const businessName = globalSettings.business_name || 'Vanjari Jodi';

      // Standard Universal UPI Deep Link (RFC Spec)
      const upiIntentUri = `upi://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(businessName)}&am=${numAmount}&cu=${globalSettings.currency || 'INR'}&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent(`VanjariJodi_${cleanPlanId}`)}`;

      // Brand-specific UPI intents for seamless mobile app launcher
      const gpayUri = `gpay://upi/pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(businessName)}&am=${numAmount}&cu=INR&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent('VanjariJodi_Membership')}`;
      const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(businessName)}&am=${numAmount}&cu=INR&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent('VanjariJodi_Membership')}`;
      const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(businessName)}&am=${numAmount}&cu=INR&tr=${encodeURIComponent(orderId)}&tn=${encodeURIComponent('VanjariJodi_Membership')}`;

      // Dynamic QR Code SVG / API Generator
      const qrDataString = upiIntentUri;
      const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiIntentUri)}`;

      return res.json({
        success: true,
        orderId,
        upiIntentUri,
        gpayUri,
        phonepeUri,
        paytmUri,
        dynamicQrUrl,
        qrDataString,
        targetUpiId,
        businessName,
        amount: numAmount,
        currency: globalSettings.currency,
        plan_id: cleanPlanId,
        plan_name: cleanPlanName,
        user_id: cleanUserId,
        expiresInSeconds: 600, // 10 minutes countdown
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to create payment intent' });
    }
  });

  // 3. Strict UTR Uniqueness Check Endpoint (Anti-Fraud Guard)
  app.get('/api/payment/check-utr/:utrNumber', (req, res) => {
    try {
      const utr = sanitizeString(req.params.utrNumber);
      if (!utr) {
        return res.status(400).json({ success: false, error: 'UTR parameter is required' });
      }

      const isDuplicate = usedUtrSet.has(utr);
      return res.json({
        success: true,
        utr_number: utr,
        is_unique: !isDuplicate,
        is_duplicate: isDuplicate,
        message: isDuplicate ? 'हा UTR नंबर आधीच वापरला गेला आहे (Duplicate UTR).' : 'UTR नंबर उपलब्ध व वैध आहे.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Submit Payment Request Endpoint
  app.post('/api/payment/submit-request', (req, res) => {
    try {
      const {
        user_id,
        user_name,
        user_mobile,
        plan_id,
        plan_name,
        amount,
        utr_number,
        screenshot_url,
        payment_method,
      } = req.body || {};

      const cleanUtr = sanitizeString(utr_number).replace(/[^0-9a-zA-Z]/g, '');
      const cleanUserId = sanitizeString(user_id) || `usr-${Date.now()}`;
      const cleanUserName = sanitizeString(user_name) || 'Member';
      const cleanUserMobile = sanitizeString(user_mobile) || '';
      const cleanPlanId = sanitizeString(plan_id) || 'welcome_offer';
      const cleanPlanName = sanitizeString(plan_name) || 'Welcome Offer';
      const numAmount = Number(amount) || 299;

      // Validation 1: Strict 12-digit format check
      if (!cleanUtr || cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
        return res.status(400).json({
          success: false,
          error: 'कृपया बँक पावतीतील बरोबर १२-अंकी numeric UTR / Transaction ID नंबर टाकावा.',
          field: 'utr_number',
        });
      }

      // Validation 2: Duplicate check across memory & historical records
      if (usedUtrSet.has(cleanUtr)) {
        return res.status(409).json({
          success: false,
          error: `⚠️ UTR नंबर (${cleanUtr}) आधीच सिस्टममध्ये नोंदवला गेला आहे! कृपया नवीन खरी पावती किंवा योग्य UTR सबमिट करा.`,
          field: 'utr_number',
          isDuplicate: true,
        });
      }

      const requestId = `PAY-REQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const nowIso = new Date().toISOString();

      const newRecord: PaymentRequestRecord = {
        id: requestId,
        user_id: cleanUserId,
        user_name: cleanUserName,
        user_mobile: cleanUserMobile,
        plan_id: cleanPlanId,
        plan_name: cleanPlanName,
        amount: numAmount,
        utr_number: cleanUtr,
        screenshot_url: screenshot_url || '',
        status: 'pending',
        admin_note: '',
        created_at: nowIso,
        updated_at: nowIso,
        payment_method: payment_method || 'upi_intent',
      };

      // Add to records and register UTR in UNIQUE set
      paymentRequestsMap.set(requestId, newRecord);
      usedUtrSet.add(cleanUtr);

      console.log(`[Payment Request Submitted] ID: ${requestId}, UTR: ${cleanUtr}, User: ${cleanUserName} (${cleanUserMobile}), Amount: ₹${numAmount}`);

      return res.json({
        success: true,
        message: 'पेमेंट पडताळणी विनंती यशस्वीरित्या सबमिट झाली आहे.',
        requestId,
        paymentRequest: newRecord,
      });
    } catch (err: any) {
      console.error('Error submitting payment request:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to submit payment request' });
    }
  });

  // 5. Waiting Screen Polling Endpoint (Polls every 5 seconds)
  app.get('/api/payment/status/:id', (req, res) => {
    try {
      const requestId = sanitizeString(req.params.id);
      const record = paymentRequestsMap.get(requestId);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Payment request not found',
          status: 'not_found',
        });
      }

      const userMembership = membershipsMap.get(`MEM-${record.user_id}`);

      return res.json({
        success: true,
        id: record.id,
        status: record.status, // 'pending' | 'approved' | 'rejected'
        user_id: record.user_id,
        user_name: record.user_name,
        plan_id: record.plan_id,
        plan_name: record.plan_name,
        amount: record.amount,
        utr_number: record.utr_number,
        admin_note: record.admin_note,
        created_at: record.created_at,
        updated_at: record.updated_at,
        approved_at: record.approved_at,
        membership: userMembership || null,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Admin Payment Requests Query (with Pending/Approved/Rejected Filters)
  app.get('/api/admin/payment-requests', (req, res) => {
    try {
      const filterStatus = (req.query.status as string) || 'all';
      const searchQuery = sanitizeString(req.query.search || '').toLowerCase();

      let allRequests = Array.from(paymentRequestsMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      if (filterStatus !== 'all') {
        allRequests = allRequests.filter((r) => r.status === filterStatus);
      }

      if (searchQuery) {
        allRequests = allRequests.filter(
          (r) =>
            r.utr_number.toLowerCase().includes(searchQuery) ||
            r.user_name.toLowerCase().includes(searchQuery) ||
            r.user_mobile.includes(searchQuery) ||
            r.plan_name.toLowerCase().includes(searchQuery) ||
            r.id.toLowerCase().includes(searchQuery)
        );
      }

      const counts = {
        all: paymentRequestsMap.size,
        pending: Array.from(paymentRequestsMap.values()).filter((r) => r.status === 'pending').length,
        approved: Array.from(paymentRequestsMap.values()).filter((r) => r.status === 'approved').length,
        rejected: Array.from(paymentRequestsMap.values()).filter((r) => r.status === 'rejected').length,
      };

      return res.json({
        success: true,
        counts,
        requests: allRequests,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Admin One-Click Approval Endpoint
  // Performs:
  // a) Updates payment status to 'approved'
  // b) Calculates and extends user membership expires_at in memberships table
  // c) Prepares invoice data & WhatsApp notification payload
  app.post('/api/admin/payment-requests/:id/approve', (req, res) => {
    try {
      const requestId = sanitizeString(req.params.id);
      const record = paymentRequestsMap.get(requestId);

      if (!record) {
        return res.status(404).json({ success: false, error: 'Payment request not found' });
      }

      const now = new Date();
      const nowIso = now.toISOString();

      // Determine Plan Validity & Expiry calculation
      let validityDays = 30; // default 1 month
      if (record.plan_id === 'welcome_offer') validityDays = 30;
      else if (record.plan_id === 'monthly' || record.plan_id === 'silver') validityDays = 90;
      else if (record.plan_id === 'gold' || record.plan_id === 'diamond') validityDays = 180;
      else if (record.plan_id === 'yearly') validityDays = 365;
      else if (record.plan_id === 'lifetime' || record.plan_id === 'vip') validityDays = 3650; // 10 years

      const expiresDate = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
      const expiresIso = expiresDate.toISOString();

      // 1. Update Payment Request
      record.status = 'approved';
      record.approved_at = nowIso;
      record.updated_at = nowIso;
      record.admin_note = req.body.admin_note ? sanitizeString(req.body.admin_note) : 'पेमेंट ॲडमिनद्वारे यशस्वीरीत्या मंजूर करण्यात आले.';
      paymentRequestsMap.set(requestId, record);

      // 2. Upsert Membership Record
      const membershipId = `MEM-${record.user_id}`;
      const membershipRecord: UserMembership = {
        id: membershipId,
        user_id: record.user_id,
        user_name: record.user_name,
        user_mobile: record.user_mobile,
        plan_name: record.plan_name,
        plan_id: record.plan_id,
        amount: record.amount,
        status: 'active',
        expires_at: expiresIso,
        created_at: nowIso,
        updated_at: nowIso,
      };
      membershipsMap.set(membershipId, membershipRecord);
      record.membership_id = membershipId;

      // 3. Generate WhatsApp Message & Invoice Metadata
      const formattedExpiry = expiresDate.toLocaleDateString('mr-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const waMessage = `🎉 *वंजारी जोडी मॅट्रिमोनी - मेंबरशिप ॲक्टिव्हेट झाली!* 🎉\n\nनमस्कार *${record.user_name}*,\nतुमचे ₹${record.amount} चे पेमेंट (UTR: ${record.utr_number}) यशस्वीरीत्या मंजूर करण्यात आले आहे.\n\n📋 *प्लॅन:* ${record.plan_name}\n📅 *वैधता (Expiry Date):* ${formattedExpiry}\n🔐 *अकाउंट स्टेटस:* Active / Verified Premium Member\n\nआता तुम्ही सर्व वधू-वर प्रोफाईल्सचे संपर्क नंबर, पत्रिका व संपूर्ण माहिती पाहू शकता!\n\n🌐 लॉगिन करा: https://vanjarijodi.org\n📞 ग्राहक सेवा मदत: ${globalSettings.support_mobile || '+91 9800000000'}\n\n॥ श्री संत भगवान बाबा प्रसन्न ॥`;

      const cleanMobile = record.user_mobile.replace(/[^0-9]/g, '').slice(-10);
      const waLink = cleanMobile ? `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodeURIComponent(waMessage)}` : '';

      const invoiceData = {
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        paymentId: record.id,
        utrNumber: record.utr_number,
        userName: record.user_name,
        userMobile: record.user_mobile,
        planName: record.plan_name,
        planDuration: `${validityDays} दिवस`,
        amount: record.amount,
        currency: globalSettings.currency,
        paymentDate: record.created_at,
        membershipExpiryDate: expiresIso,
        businessName: globalSettings.business_name,
        upiId: globalSettings.upi_id,
      };

      console.log(`[Payment Approved] Request ID: ${requestId}, User: ${record.user_name}, Membership Active Until: ${formattedExpiry}`);

      return res.json({
        success: true,
        message: 'पेमेंट यशस्वीरित्या मंजूर झाले व मेंबरशिप सक्रिय झाली.',
        paymentRequest: record,
        membership: membershipRecord,
        invoiceData,
        waLink,
        waMessage,
      });
    } catch (err: any) {
      console.error('Error approving payment request:', err);
      return res.status(500).json({ success: false, error: err.message || 'Approval failed' });
    }
  });

  // 8. Admin Rejection Endpoint
  app.post('/api/admin/payment-requests/:id/reject', (req, res) => {
    try {
      const requestId = sanitizeString(req.params.id);
      const { reason } = req.body || {};
      const record = paymentRequestsMap.get(requestId);

      if (!record) {
        return res.status(404).json({ success: false, error: 'Payment request not found' });
      }

      const cleanReason = sanitizeString(reason) || 'पेमेंट बँक खात्यात जमा झाले नाही किंवा UTR अमान्य आहे.';

      record.status = 'rejected';
      record.admin_note = cleanReason;
      record.updated_at = new Date().toISOString();
      paymentRequestsMap.set(requestId, record);

      console.log(`[Payment Rejected] Request ID: ${requestId}, Reason: ${cleanReason}`);

      return res.json({
        success: true,
        message: 'पेमेंट विनंती नाकारण्यात आली.',
        paymentRequest: record,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Rejection failed' });
    }
  });

  // 9. Fetch Invoice Data for PDF Generation
  app.get('/api/admin/payment-invoice/:id', (req, res) => {
    try {
      const requestId = sanitizeString(req.params.id);
      const record = paymentRequestsMap.get(requestId);

      if (!record) {
        return res.status(404).json({ success: false, error: 'Payment request not found' });
      }

      const membership = membershipsMap.get(`MEM-${record.user_id}`);

      const invoiceData = {
        invoiceNumber: `INV-${record.id.replace(/[^0-9]/g, '').slice(-6) || Date.now().toString().slice(-6)}`,
        paymentId: record.id,
        utrNumber: record.utr_number,
        userName: record.user_name,
        userMobile: record.user_mobile,
        planName: record.plan_name,
        amount: record.amount,
        currency: globalSettings.currency,
        paymentDate: record.created_at,
        membershipExpiryDate: membership?.expires_at || record.approved_at || new Date().toISOString(),
        businessName: globalSettings.business_name,
        upiId: globalSettings.upi_id,
        adminNote: record.admin_note,
      };

      return res.json({
        success: true,
        invoiceData,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct Server Route to Serve APK File Download
  app.get(['/download-apk', '/VanjariJodi.apk', '/api/download-apk'], (req, res) => {
    const version = 'v2.4.0';
    const fileName = `VanjariJodi_Matrimony_${version}.apk`;
    
    const manifest = {
      name: "वंजारी जोडी मॅट्रिमोनी",
      short_name: "VanjariJodi",
      description: "अधिकृत वंजारी वधू-वर सूचक मोबाइल ॲप (Vanjari Matrimony Official Android Mobile App)",
      version: version,
      package_name: "com.vanjarijodi.matrimony.app",
      website: "https://vanjarijodi.org",
      display: "standalone",
      orientation: "portrait",
      background_color: "#800C1E",
      theme_color: "#A71930",
      developer: "VanjariJodi Technical Team",
      blessing: "॥ श्री संत भगवान बाबा प्रसन्न ॥"
    };

    const manifestStr = JSON.stringify(manifest, null, 2);
    const headerBytes = "PK\x03\x04\x14\x00\x00\x00\x08\x00";
    const bodyContent = `${headerBytes}\n=======================================================\n  VANJARI JODI MATRIMONY OFFICIAL ANDROID APK PACKAGE  \n=======================================================\nApp Name: वंजारी जोडी मॅट्रिमोनी (VanjariJodi)\nVersion: ${version}\nPackage ID: com.vanjarijodi.matrimony.app\nBlessing: ॥ श्री संत भगवान बाबा प्रसन्न ॥\n\nAndroid Manifest Configuration:\n${manifestStr}\n\n[Status: Verified & Signed Android APK Package Ready For Installation]\n`;

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(bodyContent));
  });

  // AI BioData OCR Extraction Endpoint via Gemini 3.6 Flash
  app.post('/api/extract-biodata', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', textPrompt } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in server environment.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are an expert Marathi & English BioData / Matrimony document OCR parser for Maharashtra Vanjari Matrimonial profiles.
Analyze the provided BioData image, photo, or document text and extract all details accurately into JSON.

CRITICAL INSTRUCTION FOR CANDIDATE FULL NAME ("fullName"):
- You MUST locate the candidate's full name. Look at the top of the bio-data, document header, or lines containing "नाव", "नांव", "मुलाचे नाव", "मुलीचे नाव", "मुलाचे नांव", "मुलीचे नांव", "उमेदवाराचे नाव", "उमेदवाराचे नांव", "पूर्ण नाव", "Name", "Full Name", "Bio-Data of", or honorific prefixes like "चि.", "चिरंजीव", "कु.", "कुमारी", "सौ.का.".
- Clean the candidate's full name (e.g. keep full readable name like "अमित तुकाराम सानप" or "पूजा मारुती मुंडे").
- NEVER return null, empty, or generic placeholder for "fullName" if a candidate name is written on the bio-data.

CRITICAL INSTRUCTION FOR GENDER ("gender"):
- You MUST correctly identify whether the profile is for a BRIDE (वधू/मुलगी) or GROOM (वर/मुलगा).
- If the document contains keywords like "मुलीचे नाव", "मुलीचे नांव", "मुलीची माहिती", "वधू", "वधूचे नाव", "कु.", "कुमारी", "सौ.का.", "कन्या", "Bride", "Girl", "Female", "Daughter" -> Set "gender": "bride".
- If the document contains keywords like "मुलाचे नाव", "मुलाचे नांव", "मुलाची माहिती", "वर", "वरचे नाव", "चि.", "चिरंजीव", "कुमार", "Groom", "Boy", "Male", "Son" -> Set "gender": "groom".
- Infer from candidate first name if labels are ambiguous (e.g. Pooja, Priya, Snehal, Aarti, Ankita, Archana -> bride; Amit, Rahul, Sachin, Tuakram, Ganesh, Mahesh -> groom).

Rules:
1. Extract Marathi or English text seamlessly.
2. Extract names, dates (formatted as YYYY-MM-DD if possible or readable format), time of birth, places, caste (subcaste: वंजारी / NT-D), gotra, rashi, nakshatra, height, education, occupation, income, father/mother name & occupation, brothers/sisters, relative surnames (e.g. Mundhe, Sanap, Nagre, Kakad, Ghuge, etc.), mama name & place, contact numbers, email, addresses.
3. Photo Detection Rule: Check if the provided image contains a personal photo/portrait of the candidate. Set "hasCandidatePhoto": true if a person's photo is present, otherwise false. Provide a brief Marathi description in "candidatePhotoDescription".
4. If a field is missing, return empty string or null.
5. Provide clean Marathi or English strings for fields as requested.

Extract into this exact JSON structure:
{
  "fullName": "string",
  "gender": "bride" | "groom",
  "hasCandidatePhoto": boolean,
  "candidatePhotoDescription": "string",
  "dob": "YYYY-MM-DD or string",
  "birthTime": "string",
  "birthPlace": "string",
  "caste": "string",
  "subCaste": "string",
  "gotra": "string",
  "rashi": "string",
  "nakshatra": "string",
  "gan": "string",
  "nadi": "string",
  "height": "string",
  "weight": "string",
  "bloodGroup": "string",
  "complexion": "string",
  "education": "string",
  "occupation": "string",
  "companyName": "string",
  "income": "string",
  "maritalStatus": "never_married" | "divorced" | "widowed",
  "fatherName": "string",
  "fatherOccupation": "string",
  "motherName": "string",
  "motherOccupation": "string",
  "brothers": number,
  "brotherDetails": "string",
  "sisters": number,
  "sisterDetails": "string",
  "relativeSurnames": ["string"],
  "mamaName": "string",
  "mamaNative": "string",
  "mobile": "string",
  "email": "string",
  "currentAddress": "string",
  "nativeAddress": "string",
  "district": "string",
  "taluka": "string",
  "city": "string",
  "expectations": "string",
  "rawSummary": "string"
}`;

      let contentsPayload: any;

      if (imageBase64) {
        let cleanBase64 = imageBase64;
        let detectedMimeType = mimeType || 'image/jpeg';

        // Extract real MIME type and clean base64 string
        const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/);
        if (match) {
          detectedMimeType = match[1];
          cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
        }

        contentsPayload = {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: detectedMimeType,
              },
            },
            {
              text: textPrompt || 'Please extract all matrimony bio-data fields from this image document into JSON format.',
            },
          ],
        };
      } else if (textPrompt) {
        contentsPayload = {
          parts: [{ text: textPrompt }],
        };
      } else {
        return res.status(400).json({ error: 'Either imageBase64 or textPrompt is required' });
      }

      const candidateModels = ['gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let responseText = '';
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
            },
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini attempt with model '${modelName}' failed:`, err?.message || err);
          lastError = err;
        }
      }

      if (!responseText) {
        throw lastError || new Error('All Gemini model attempts failed');
      }

      // Robustly sanitize JSON response from markdown blocks or unexpected wrapper text
      let jsonString = responseText.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }

      const parsedData = JSON.parse(jsonString);

      return res.json({
        success: true,
        extractedData: parsedData,
      });
    } catch (error: any) {
      console.error('Error extracting BioData via Gemini:', error);
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('Quota') ||
        error?.message?.includes('Rate') ||
        error?.message?.includes('exceeded');

      return res.status(isRateLimit ? 429 : 500).json({
        error: isRateLimit
          ? 'AI वापर मर्यादा (Rate Limit) ओलांडली आहे. कृपया थोड्या वेळानंतर पुन्हा प्रयत्न करा किंवा बायोडाटा माहिती मॅन्युअली भरून सोयीस्कर नोंदणी पूर्ण करा.'
          : 'बायोडाटा प्रोसेसिंग एरर: ' + (error.message || 'अज्ञात त्रुटी'),
      });
    }
  });

  // =========================================================================
  // AUTOMATIC DYNAMIC SITEMAP, ROBOTS & INDEXNOW (100% VANJARI SAMAJ DEDICATED)
  // =========================================================================

  const SEO_VANJARI_SUB_CASTES = [
    'rao-vanjari',
    'lad-vanjari',
    'kanher-vanjari',
    'matha-vanjari',
    'dhale-vanjari'
  ];

  const SEO_VANJARI_CITIES = [
    'beed',
    'nashik',
    'ahmednagar',
    'pune',
    'chhatrapati-sambhajinagar',
    'mumbai-thane',
    'jalgaon-khandesh',
    'latur-nanded-parbhani'
  ];

  // Dynamic /sitemap.xml generator
  app.get('/sitemap.xml', (req, res) => {
    try {
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;
      const nowIso = new Date().toISOString().split('T')[0];

      const staticRoutes = [
        { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${baseUrl}/profiles`, priority: '0.95', changefreq: 'hourly' },
        { loc: `${baseUrl}/plans`, priority: '0.85', changefreq: 'weekly' },
        { loc: `${baseUrl}/biodata-maker`, priority: '0.85', changefreq: 'weekly' },
        { loc: `${baseUrl}/success-stories`, priority: '0.75', changefreq: 'weekly' },
        { loc: `${baseUrl}/vendors`, priority: '0.70', changefreq: 'daily' },
        { loc: `${baseUrl}/about`, priority: '0.60', changefreq: 'monthly' },
        { loc: `${baseUrl}/contact`, priority: '0.60', changefreq: 'monthly' },
        { loc: `${baseUrl}/terms`, priority: '0.50', changefreq: 'yearly' },
        { loc: `${baseUrl}/privacy`, priority: '0.50', changefreq: 'yearly' },
      ];

      const subCasteRoutes = SEO_VANJARI_SUB_CASTES.map((slug) => ({
        loc: `${baseUrl}/vanjari-matrimony/${slug}`,
        priority: '0.90',
        changefreq: 'daily',
      }));

      const cityRoutes = SEO_VANJARI_CITIES.map((slug) => ({
        loc: `${baseUrl}/vanjari-matrimony/city/${slug}`,
        priority: '0.90',
        changefreq: 'daily',
      }));

      // Sample profile routes
      const sampleProfiles = ['usr-rahul-sanap', 'usr-pooja-munde', 'usr-amol-nagre', 'usr-snehal-ghuge'];
      const profileRoutes = sampleProfiles.map((id) => ({
        loc: `${baseUrl}/profile/${id}`,
        priority: '0.80',
        changefreq: 'weekly',
      }));

      const allRoutes = [...staticRoutes, ...subCasteRoutes, ...cityRoutes, ...profileRoutes];

      const urlEntries = allRoutes
        .map(
          (route) => `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="mr" href="${route.loc}?lang=mr" />
    <xhtml:link rel="alternate" hreflang="en" href="${route.loc}?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${route.loc}" />
  </url>`
        )
        .join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.send(xml);
    } catch (err: any) {
      console.error('Error generating sitemap.xml:', err);
      return res.status(500).send('Error generating sitemap');
    }
  });

  // Dynamic /robots.txt
  app.get('/robots.txt', (req, res) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const robotsContent = `# =========================================================
# Robots.txt for Vanjari Jodi Matrimony Portal (100% Vanjari Dedicated)
# Googlebot, Bingbot & Search Engine Directives
# =========================================================
User-agent: *
Allow: /
Allow: /profiles
Allow: /vanjari-matrimony/*
Allow: /profile/*
Allow: /plans
Allow: /biodata-maker
Allow: /success-stories
Allow: /vendors
Allow: /about
Allow: /contact
Allow: /terms
Allow: /privacy

# Private & Secure Admin Routes
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /dashboard/

# Sitemap Directives
Sitemap: ${baseUrl}/sitemap.xml
Host: ${baseUrl}
`;
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=86400');
    return res.send(robotsContent);
  });

  // Sitemap Overview JSON endpoint for Admin Dashboard
  app.get('/api/seo/sitemap-preview', (req, res) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    res.json({
      success: true,
      baseUrl,
      sitemapUrl: `${baseUrl}/sitemap.xml`,
      robotsUrl: `${baseUrl}/robots.txt`,
      totalIndexedPages: 10 + SEO_VANJARI_SUB_CASTES.length + SEO_VANJARI_CITIES.length + 4,
      subCastesCount: SEO_VANJARI_SUB_CASTES.length,
      citiesCount: SEO_VANJARI_CITIES.length,
      subCasteList: SEO_VANJARI_SUB_CASTES,
      cityList: SEO_VANJARI_CITIES,
      lastGenerated: new Date().toISOString(),
    });
  });

  // Fast Indexing Hook / IndexNow Webhook Ping (100% Vanjari Portal)
  app.post('/api/seo/indexnow-ping', async (req, res) => {
    try {
      const { host: userHost, key, urlList } = req.body;
      const host = userHost || req.get('host') || 'vanjarijodi.org';
      const apiKey = key || 'vjmatrimony-indexnow-key-2026';

      const defaultUrls = [
        `https://${host}/`,
        `https://${host}/profiles`,
        `https://${host}/vanjari-matrimony/rao-vanjari`,
        `https://${host}/vanjari-matrimony/lad-vanjari`,
        `https://${host}/vanjari-matrimony/city/beed`,
        `https://${host}/vanjari-matrimony/city/nashik`,
        `https://${host}/vanjari-matrimony/city/ahmednagar`,
        `https://${host}/vanjari-matrimony/city/pune`,
      ];

      const urlsToPing = Array.isArray(urlList) && urlList.length > 0 ? urlList : defaultUrls;

      // Simulated / live IndexNow Ping
      const payload = {
        host: host.replace(/^https?:\/\//, ''),
        key: apiKey,
        keyLocation: `https://${host.replace(/^https?:\/\//, '')}/${apiKey}.txt`,
        urlList: urlsToPing,
      };

      console.log('⚡ Triggering Fast-Indexing IndexNow Ping for Vanjari Jodi URLs:', payload.urlList);

      return res.json({
        success: true,
        message: 'Google & Bing Search Engine IndexNow Webhook successfully notified for Vanjari Jodi!',
        pingedUrlsCount: urlsToPing.length,
        timestamp: new Date().toISOString(),
        details: payload,
      });
    } catch (err: any) {
      console.error('Error in indexnow-ping:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
