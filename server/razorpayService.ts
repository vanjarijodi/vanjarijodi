import crypto from 'crypto';
import Razorpay from 'razorpay';
import { getRazorpayServerConfig } from './razorpayConfig';
import { loadJsonData, saveJsonData } from './storageService';

export interface PlanConfig {
  id: string;
  name: string;
  nameMr: string;
  price: number;
  durationMonths: number;
  validityDays: number;
  unlockCount: number;
}

// Server-side authoritative source of truth for plans and pricing
export const SERVER_PLANS: Record<string, PlanConfig> = {
  single_kundli: {
    id: 'single_kundli',
    name: 'Single Kundli Pass',
    nameMr: 'एकाच जोडीची कुंडली जुळवणी (रु. ४९/-)',
    price: 49,
    durationMonths: 1,
    validityDays: 30,
    unlockCount: 1,
  },
  welcome_offer: {
    id: 'welcome_offer',
    name: 'Welcome Offer Membership Plan',
    nameMr: 'वेलकम स्पेशल ऑफर प्लॅन (रु. ३९८/-)',
    price: 398,
    durationMonths: 6,
    validityDays: 180,
    unlockCount: 50,
  },
  silver: {
    id: 'silver',
    name: 'Silver Plan',
    nameMr: 'सिल्व्हर प्लॅन (रु. ४९९/-)',
    price: 499,
    durationMonths: 3,
    validityDays: 90,
    unlockCount: 25,
  },
  gold: {
    id: 'gold',
    name: 'Gold Plan',
    nameMr: 'गोल्ड प्लॅन (रु. ९९९/-)',
    price: 999,
    durationMonths: 6,
    validityDays: 180,
    unlockCount: 75,
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum Plan',
    nameMr: 'प्लॅटिनम प्लॅन (रु. १९९९/-)',
    price: 1999,
    durationMonths: 12,
    validityDays: 365,
    unlockCount: 150,
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond Plan',
    nameMr: 'डायमंड प्लॅन (रु. २९९९/-)',
    price: 2999,
    durationMonths: 24,
    validityDays: 730,
    unlockCount: 300,
  },
  vip: {
    id: 'vip',
    name: 'VIP Lifetime Plan',
    nameMr: 'व्हीआयपी आजीवन प्लॅन (रु. ४९९९/-)',
    price: 4999,
    durationMonths: 120,
    validityDays: 3650,
    unlockCount: 1000,
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Membership',
    nameMr: 'आजीवन सदस्यत्व प्लॅन (रु. ४९९९/-)',
    price: 4999,
    durationMonths: 120,
    validityDays: 3650,
    unlockCount: 1000,
  },
};

export interface RazorpayOrderRecord {
  orderId: string;
  planId: string;
  planName: string;
  amount: number; // in rupees
  amountPaise: number;
  currency: string;
  userId: string;
  userName?: string;
  userMobile?: string;
  receiptId: string;
  status: 'created' | 'paid' | 'failed' | 'attempted';
  createdAt: string;
}

export interface VerifiedPaymentResult {
  success: boolean;
  verified?: boolean;
  isDuplicate?: boolean;
  message: string;
  error?: string;
  paymentId?: string;
  orderId?: string;
  planId?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  userId?: string;
  userName?: string;
  userMobileMasked?: string;
  membershipExpiryDate?: string;
  receiptNumber?: string;
  env?: 'TEST' | 'LIVE';
  gateway?: 'razorpay';
  statusCode?: number;
  status?: string;
}

// Persistent storage backed order registry and idempotency cache
const initialOrders = loadJsonData<RazorpayOrderRecord[]>('orders.json', []);
const ordersMap = new Map<string, RazorpayOrderRecord>(
  initialOrders.map((o) => [o.orderId, o])
);

const initialPayments = loadJsonData<VerifiedPaymentResult[]>('processed_payments.json', []);
const processedPaymentsMap = new Map<string, VerifiedPaymentResult>(
  initialPayments.filter((p) => p.paymentId).map((p) => [p.paymentId!, p])
);

function persistOrders() {
  saveJsonData('orders.json', Array.from(ordersMap.values()));
}

function persistPayments() {
  saveJsonData('processed_payments.json', Array.from(processedPaymentsMap.values()));
}

/**
 * Mask user mobile number for safe public and receipt display (e.g. 98XXXXXX10)
 */
export function maskMobile(mobile?: string): string {
  if (!mobile) return 'XXXXXX0000';
  const digits = mobile.replace(/[^0-9]/g, '');
  if (digits.length < 10) return 'XXXXXX' + digits.slice(-4);
  const last10 = digits.slice(-10);
  return `${last10.slice(0, 2)}XXXXXX${last10.slice(-2)}`;
}

/**
 * Get configured Razorpay SDK instance
 */
export function getRazorpayClient(): Razorpay | null {
  const config = getRazorpayServerConfig();
  if (config.keyId && config.secretKey && !config.secretKey.includes('••••')) {
    try {
      return new Razorpay({
        key_id: config.keyId,
        key_secret: config.secretKey,
      });
    } catch (e) {
      console.error('[Razorpay SDK Init Error]:', e);
      return null;
    }
  }
  return null;
}

/**
 * Create a Razorpay Order server-side with strict price and amount validation.
 * Accepts either a predefined planId OR explicit amount in paise/rupees.
 */
export async function createRazorpayOrder(params: {
  planId?: string;
  amount?: number; // amount in paise or rupees
  amountInPaise?: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
  userId?: string;
  userName?: string;
  userMobile?: string;
  promoDiscountAmount?: number;
}): Promise<{
  success: boolean;
  order_id?: string;
  orderId?: string;
  id?: string;
  amount?: number;
  currency?: string;
  key_id?: string;
  keyId?: string;
  planId?: string;
  planName?: string;
  receipt?: string;
  error?: string;
  statusCode?: number;
}> {
  const config = getRazorpayServerConfig();
  if (!config.enabled) {
    return {
      success: false,
      statusCode: 503,
      error: 'Razorpay payment gateway is currently disabled. Please use manual UPI.',
    };
  }

  let finalPriceRupees = 0;
  let amountPaise = 0;
  let planId = params.planId || 'custom';
  let planName = 'Custom Payment';

  if (params.planId && SERVER_PLANS[params.planId]) {
    const plan = SERVER_PLANS[params.planId];
    planId = plan.id;
    planName = plan.nameMr;
    finalPriceRupees = plan.price;
    if (params.promoDiscountAmount && params.promoDiscountAmount > 0) {
      finalPriceRupees = Math.max(1, plan.price - Math.round(params.promoDiscountAmount));
    }
    amountPaise = Math.round(finalPriceRupees * 100);
  } else if (params.amountInPaise && params.amountInPaise > 0) {
    amountPaise = Math.round(params.amountInPaise);
    finalPriceRupees = amountPaise / 100;
  } else if (params.amount && params.amount > 0) {
    // If amount is >= 100 and likely in paise already
    if (params.amount >= 100 && Number.isInteger(params.amount) && !params.planId) {
      // Standard API callers send amount in paise directly
      amountPaise = Math.round(params.amount);
      finalPriceRupees = amountPaise / 100;
    } else {
      finalPriceRupees = params.amount;
      amountPaise = Math.round(params.amount * 100);
    }
  } else {
    // Default fallback to welcome offer
    const plan = SERVER_PLANS['welcome_offer'];
    planId = plan.id;
    planName = plan.nameMr;
    finalPriceRupees = plan.price;
    amountPaise = Math.round(finalPriceRupees * 100);
  }

  // Minimum amount validation: At least 100 paise (₹1.00)
  if (amountPaise < 100) {
    return {
      success: false,
      statusCode: 400,
      error: 'किमान पेमेंट रक्कम १०० पैसे (₹१.००) असणे आवश्यक आहे. (Amount must be at least 100 paise / ₹1.00)',
    };
  }

  const receiptId = params.receipt || `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;
  const currency = (params.currency || config.currency || 'INR').toUpperCase();
  let razorpayOrderId = '';

  const rzpClient = getRazorpayClient();
  if (rzpClient) {
    try {
      const order = await rzpClient.orders.create({
        amount: amountPaise,
        currency,
        receipt: receiptId,
        notes: {
          plan_id: planId,
          plan_name: planName,
          user_id: params.userId || 'guest-user',
          user_name: params.userName || '',
          user_mobile: params.userMobile || '',
          ...(params.notes || {}),
        },
      });

      if (order && order.id) {
        razorpayOrderId = order.id;
      }
    } catch (apiErr: any) {
      console.error('[Razorpay SDK Create Order Error]:', apiErr);
      const status = apiErr?.statusCode || apiErr?.status || (apiErr?.error?.code === 'BAD_REQUEST_ERROR' ? 400 : 500);
      const isAuthError = status === 401 || String(apiErr?.message || '').includes('auth');
      
      if (isAuthError) {
        return {
          success: false,
          statusCode: 401,
          error: 'Razorpay ऑथेंटिकेशन अयशस्वी (401 Unauthorized). Key ID व Secret Key तपासा.',
        };
      }

      // If Razorpay API rejects order with a fatal error, return 500
      if (status >= 400 && status < 500 && apiErr?.error?.description) {
        return {
          success: false,
          statusCode: status,
          error: apiErr.error.description || 'Razorpay order creation failed.',
        };
      }
    }
  }

  // If no order created via SDK, attempt standard REST API fetch
  if (!razorpayOrderId && config.keyId && config.secretKey && !config.secretKey.includes('••••')) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${config.keyId}:${config.secretKey}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency,
          receipt: receiptId,
          notes: {
            plan_id: planId,
            plan_name: planName,
            user_id: params.userId || 'guest-user',
            user_name: params.userName || '',
            ...(params.notes || {}),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        razorpayOrderId = data.id;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[Razorpay API Orders Fallback Error]:', response.status, errorData);
        if (response.status === 401) {
          return {
            success: false,
            statusCode: 401,
            error: 'Razorpay ऑथेंटिकेशन अयशस्वी (401 Unauthorized). Key ID व Secret Key तपासा.',
          };
        }
      }
    } catch (restErr) {
      console.error('[Razorpay REST API Error]:', restErr);
    }
  }

  // Test mode fallback order ID if keys are offline or in test mock mode
  if (!razorpayOrderId) {
    razorpayOrderId = `order_${config.env === 'TEST' ? 'test_' : ''}${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
  }

  const orderRecord: RazorpayOrderRecord = {
    orderId: razorpayOrderId,
    planId,
    planName,
    amount: finalPriceRupees,
    amountPaise,
    currency,
    userId: params.userId || 'guest-user',
    userName: params.userName,
    userMobile: params.userMobile,
    receiptId,
    status: 'created',
    createdAt: new Date().toISOString(),
  };

  ordersMap.set(razorpayOrderId, orderRecord);
  persistOrders();

  return {
    success: true,
    order_id: razorpayOrderId,
    orderId: razorpayOrderId,
    id: razorpayOrderId,
    amount: amountPaise,
    currency,
    receipt: receiptId,
    key_id: config.keyId,
    keyId: config.keyId,
    planId,
    planName,
  };
}

/**
 * Server-side Razorpay payment signature verification & membership activation.
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Idempotent: multiple calls with same paymentId return identical success response.
 */
export async function verifyRazorpayPayment(params: {
  orderId?: string;
  order_id?: string;
  paymentId?: string;
  payment_id?: string;
  signature?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  planId?: string;
  plan_id?: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  userMobile?: string;
  user_mobile?: string;
}): Promise<VerifiedPaymentResult> {
  const config = getRazorpayServerConfig();

  const finalOrderId = params.razorpay_order_id || params.order_id || params.orderId || '';
  const finalPaymentId = params.razorpay_payment_id || params.payment_id || params.paymentId || '';
  const finalSignature = params.razorpay_signature || params.signature || '';
  const finalUserId = params.userId || params.user_id || 'guest-user';
  const finalUserName = params.userName || params.user_name || 'सन्माननीय सदस्य';
  const finalUserMobile = params.userMobile || params.user_mobile || '';

  // 1. Validate required fields
  if (!finalOrderId || !finalPaymentId) {
    return {
      success: false,
      verified: false,
      statusCode: 400,
      message: 'पेमेंट आयडी (payment_id) किंवा ऑर्डर आयडी (order_id) आवश्यक आहे.',
      error: 'Missing required parameters: order_id and payment_id are required.',
    };
  }

  // 2. Idempotency Check: if this payment was already processed, return existing record
  if (processedPaymentsMap.has(finalPaymentId)) {
    console.log(`[Razorpay Idempotency] Payment ${finalPaymentId} already verified and processed.`);
    const existing = processedPaymentsMap.get(finalPaymentId)!;
    return { ...existing, isDuplicate: true };
  }

  const order = ordersMap.get(finalOrderId);
  const planKey = order?.planId || params.planId || params.plan_id || 'welcome_offer';
  const plan = SERVER_PLANS[planKey] || SERVER_PLANS['welcome_offer'];

  // 3. Strict Signature Verification: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
  if (config.secretKey && !config.secretKey.includes('••••')) {
    if (!finalSignature) {
      return {
        success: false,
        verified: false,
        statusCode: 400,
        message: 'स्वाक्षरी पडताळणी अयशस्वी: Razorpay signature प्राप्त झाले नाही.',
        error: 'Missing razorpay_signature.',
      };
    }

    const textToSign = `${finalOrderId}|${finalPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.secretKey)
      .update(textToSign)
      .digest('hex');

    if (expectedSignature !== finalSignature) {
      console.warn('[Razorpay Verification Failure] Signature mismatch:', {
        orderId: finalOrderId,
        paymentId: finalPaymentId,
        expected: expectedSignature,
        received: finalSignature,
      });
      return {
        success: false,
        verified: false,
        statusCode: 400,
        message: 'अवैध पेमेंट स्वाक्षरी (Invalid Razorpay Signature). पेमेंट पडताळणी अयशस्वी.',
        error: 'Invalid payment signature. Signature verification failed.',
      };
    }
  }

  // 4. Mark order as paid
  if (order) {
    order.status = 'paid';
    persistOrders();
  }

  // 5. Calculate validity & membership expiry
  const now = new Date();
  const expiresAt = new Date(now.getTime() + plan.validityDays * 24 * 60 * 60 * 1000);
  const expiresIso = expiresAt.toISOString();
  const receiptNumber = `VJ-RCPT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const finalAmount = order ? order.amount : plan.price;
  const userMobileMasked = maskMobile(finalUserMobile || order?.userMobile);

  const result: VerifiedPaymentResult = {
    success: true,
    verified: true,
    statusCode: 200,
    isDuplicate: false,
    message: config.successMessage || 'पेमेंट यशस्वीरित्या पूर्ण झाले!',
    paymentId: finalPaymentId,
    orderId: finalOrderId,
    planId: plan.id,
    planName: plan.nameMr,
    amount: finalAmount,
    currency: config.currency || 'INR',
    userId: finalUserId,
    userName: finalUserName || order?.userName || 'सन्माननीय सदस्य',
    userMobileMasked,
    membershipExpiryDate: expiresIso,
    receiptNumber,
    env: config.env,
    gateway: 'razorpay',
    status: 'paid',
  };

  // Register in idempotency cache & persist
  processedPaymentsMap.set(finalPaymentId, result);
  persistPayments();

  console.log(
    `[Razorpay Payment Verified & Persisted] Payment: ${finalPaymentId}, Order: ${finalOrderId}, User: ${finalUserId}, Plan: ${plan.id}, Expiry: ${expiresIso}`
  );

  return result;
}

/**
 * Validates Razorpay Webhook signature and idempotently processes payment events.
 */
export function handleRazorpayWebhook(rawBody: string, signature: string): {
  success: boolean;
  event?: string;
  handled?: boolean;
  error?: string;
} {
  const config = getRazorpayServerConfig();
  const secret = config.webhookSecret || config.secretKey;

  if (secret && !secret.includes('••••')) {
    if (!signature) {
      return { success: false, error: 'Missing x-razorpay-signature header' };
    }
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return { success: false, error: 'Invalid webhook signature' };
    }
  }

  try {
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};

      if (paymentId && !processedPaymentsMap.has(paymentId)) {
        verifyRazorpayPayment({
          orderId: orderId || `order_webhook_${Date.now()}`,
          paymentId,
          planId: notes.plan_id,
          userId: notes.user_id || 'guest-user',
          userName: notes.user_name,
        });
      }
      return { success: true, event, handled: true };
    }

    if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const orderId = paymentEntity.order_id;
      if (orderId && ordersMap.has(orderId)) {
        const ord = ordersMap.get(orderId)!;
        ord.status = 'failed';
        persistOrders();
      }
      console.warn(`[Razorpay Webhook] Payment failed for order ${orderId}:`, paymentEntity.error_description);
      return { success: true, event, handled: true };
    }

    return { success: true, event, handled: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Returns all verified payment records for Admin view
 */
export function getAllProcessedPayments(): VerifiedPaymentResult[] {
  return Array.from(processedPaymentsMap.values());
}

/**
 * Find order by ID
 */
export function getOrderRecord(orderId: string): RazorpayOrderRecord | undefined {
  return ordersMap.get(orderId);
}

/**
 * Find payment by ID
 */
export function getProcessedPayment(paymentId: string): VerifiedPaymentResult | undefined {
  return processedPaymentsMap.get(paymentId);
}

