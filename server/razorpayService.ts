import crypto from 'crypto';
import { getRazorpayServerConfig } from './razorpayConfig';

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
  isDuplicate?: boolean;
  message: string;
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
}

// In-memory idempotency caches and order registry
const ordersMap = new Map<string, RazorpayOrderRecord>();
const processedPaymentsMap = new Map<string, VerifiedPaymentResult>();

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
 * Create a Razorpay Order server-side with strict price validation.
 * The client cannot manipulate the price.
 */
export async function createRazorpayOrder(params: {
  planId: string;
  userId: string;
  userName?: string;
  userMobile?: string;
  promoDiscountAmount?: number;
}): Promise<{
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  planId?: string;
  planName?: string;
  error?: string;
}> {
  const config = getRazorpayServerConfig();
  if (!config.enabled) {
    return { success: false, error: 'Razorpay पेमेंट गेटवे सध्या बंद आहे. कृपया पर्यायी पेमेंट पर्याय वापरा.' };
  }

  const plan = SERVER_PLANS[params.planId];
  if (!plan) {
    return { success: false, error: `अमान्य किंवा चुकीचा प्लॅन निवडला आहे (${params.planId}).` };
  }

  // Calculate final amount server-side (prevent frontend manipulation)
  let finalPrice = plan.price;
  if (params.promoDiscountAmount && params.promoDiscountAmount > 0) {
    // Cap discount to never exceed total price - 1 (or 0)
    finalPrice = Math.max(1, plan.price - Math.round(params.promoDiscountAmount));
  }

  const amountPaise = Math.round(finalPrice * 100);
  const receiptId = `rcpt_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

  let razorpayOrderId = '';

  // Attempt real Razorpay API call if secret key is present
  if (config.keyId && config.secretKey && !config.secretKey.includes('••••')) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${config.keyId}:${config.secretKey}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: config.currency || 'INR',
          receipt: receiptId,
          notes: {
            plan_id: plan.id,
            plan_name: plan.name,
            user_id: params.userId,
            user_name: params.userName || '',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        razorpayOrderId = data.id;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[Razorpay API Error]:', response.status, errorData);
        // If API key is rejected or invalid, return friendly message without leaking secrets
        if (response.status === 401) {
          return {
            success: false,
            error: 'Razorpay ऑथेंटिकेशन अयशस्वी. कृपया ॲडमिन पॅनलमध्ये Key ID व Secret Key तपासा.',
          };
        }
      }
    } catch (apiErr) {
      console.error('[Razorpay Network Error]:', apiErr);
    }
  }

  // If no order created via API (e.g. Test mode setup without external live connection),
  // generate a clean tracked test order ID
  if (!razorpayOrderId) {
    razorpayOrderId = `order_${config.env === 'TEST' ? 'test_' : ''}${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
  }

  const orderRecord: RazorpayOrderRecord = {
    orderId: razorpayOrderId,
    planId: plan.id,
    planName: plan.nameMr,
    amount: finalPrice,
    amountPaise,
    currency: config.currency || 'INR',
    userId: params.userId,
    userName: params.userName,
    userMobile: params.userMobile,
    receiptId,
    status: 'created',
    createdAt: new Date().toISOString(),
  };

  ordersMap.set(razorpayOrderId, orderRecord);

  return {
    success: true,
    orderId: razorpayOrderId,
    amount: amountPaise,
    currency: config.currency || 'INR',
    keyId: config.keyId,
    planId: plan.id,
    planName: plan.nameMr,
  };
}

/**
 * Server-side Razorpay payment signature verification & membership activation.
 * Idempotent: multiple calls with same paymentId return identical success response.
 */
export async function verifyRazorpayPayment(params: {
  orderId: string;
  paymentId: string;
  signature?: string;
  planId?: string;
  userId: string;
  userName?: string;
  userMobile?: string;
}): Promise<VerifiedPaymentResult> {
  const config = getRazorpayServerConfig();

  // 1. Idempotency Check: if this payment was already processed, return existing result
  if (processedPaymentsMap.has(params.paymentId)) {
    console.log(`[Razorpay Idempotency] Payment ${params.paymentId} already processed. Returning existing record.`);
    const existing = processedPaymentsMap.get(params.paymentId)!;
    return { ...existing, isDuplicate: true };
  }

  const order = ordersMap.get(params.orderId);
  const planKey = order?.planId || params.planId || 'welcome_offer';
  const plan = SERVER_PLANS[planKey] || SERVER_PLANS['welcome_offer'];

  // 2. Strict Signature Verification (if secretKey is configured)
  if (config.secretKey && !config.secretKey.includes('••••')) {
    if (!params.signature) {
      return {
        success: false,
        message: 'Payment verification failed: Razorpay signature missing.',
      };
    }

    const textToSign = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.secretKey)
      .update(textToSign)
      .digest('hex');

    if (expectedSignature !== params.signature) {
      console.warn('[Razorpay Verification Failure] Signature mismatch:', {
        expected: expectedSignature,
        received: params.signature,
      });
      return {
        success: false,
        message: 'अवैध पेमेंट स्वाक्षरी (Invalid Razorpay Signature). पेमेंट पडताळणी अयशस्वी.',
      };
    }
  }

  // 3. Mark order as paid
  if (order) {
    order.status = 'paid';
  }

  // 4. Calculate validity & membership expiry
  const now = new Date();
  const expiresAt = new Date(now.getTime() + plan.validityDays * 24 * 60 * 60 * 1000);
  const expiresIso = expiresAt.toISOString();
  const receiptNumber = `VJ-RCPT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const finalAmount = order ? order.amount : plan.price;
  const userMobileMasked = maskMobile(params.userMobile || order?.userMobile);

  const result: VerifiedPaymentResult = {
    success: true,
    isDuplicate: false,
    message: config.successMessage || 'पेमेंट यशस्वीरित्या पूर्ण झाले!',
    paymentId: params.paymentId,
    orderId: params.orderId,
    planId: plan.id,
    planName: plan.nameMr,
    amount: finalAmount,
    currency: config.currency || 'INR',
    userId: params.userId,
    userName: params.userName || order?.userName || 'सन्माननीय सदस्य',
    userMobileMasked,
    membershipExpiryDate: expiresIso,
    receiptNumber,
    env: config.env,
    gateway: 'razorpay',
  };

  // Register in idempotency cache
  processedPaymentsMap.set(params.paymentId, result);

  console.log(`[Razorpay Payment Verified] Payment: ${params.paymentId}, Order: ${params.orderId}, User: ${params.userId}, Plan: ${plan.id}, Expiry: ${expiresIso}`);

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
        // Automatically activate membership in background
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
