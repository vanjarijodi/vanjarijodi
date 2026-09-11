/**
 * Razorpay Payment Gateway Client Service
 * Fully secure client-side handler that coordinates with server-side validation.
 * No Secret Keys are ever loaded or accessed client-side.
 */

export interface RazorpayPublicConfig {
  enabled: boolean;
  env: 'TEST' | 'LIVE';
  keyId: string;
  currency: string;
  displayName: string;
  successMessage: string;
  failureMessage: string;
}

export interface RazorpayCheckoutOptions {
  planId: string;
  planName: string;
  userId: string;
  userName?: string;
  userMobile?: string;
  promoDiscountAmount?: number;
  onSuccess: (result: any) => void;
  onError: (errorMsg: string) => void;
  onDismiss?: () => void;
}

let scriptLoadPromise: Promise<boolean> | null = null;

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as any).Razorpay) return Promise.resolve(true);

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve) => {
      // Check if tag already exists
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay Checkout SDK');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return scriptLoadPromise;
}

/**
 * Fetches public Razorpay configuration from server
 */
export async function getRazorpayPublicConfig(): Promise<RazorpayPublicConfig | null> {
  try {
    const res = await fetch('/api/payment/razorpay/config');
    const data = await res.json();
    if (data && data.success && data.config) {
      return data.config as RazorpayPublicConfig;
    }
    return null;
  } catch (e) {
    console.error('Error fetching Razorpay config:', e);
    return null;
  }
}

/**
 * Creates an authoritative server-side order and opens Razorpay Checkout modal
 */
export async function initiateRazorpayPayment(options: RazorpayCheckoutOptions): Promise<void> {
  const { planId, planName, userId, userName, userMobile, promoDiscountAmount, onSuccess, onError, onDismiss } = options;

  try {
    // 1. Ensure Razorpay script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !(window as any).Razorpay) {
      onError('Razorpay पेमेंट सेवा लोड होऊ शकली नाही. कृपया इंटरनेट कनेक्शन तपासा किंवा पर्यायी पेमेंट वापरा.');
      return;
    }

    // 2. Fetch public configuration
    const config = await getRazorpayPublicConfig();
    if (!config || !config.enabled) {
      onError('Razorpay पेमेंट सध्या उपलब्ध नाही. कृपया मॅन्युअल UPI / QR पर्याय वापरा.');
      return;
    }

    // 3. Create server-side order with verified amount
    const orderRes = await fetch('/api/payment/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: planId,
        user_id: userId,
        user_name: userName || 'सन्माननीय सदस्य',
        user_mobile: userMobile || '',
        promo_discount_amount: promoDiscountAmount || 0,
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      onError(orderData.error || 'पेमेंट ऑर्डर तयार करताना अडचण आली.');
      return;
    }

    // 4. Construct Razorpay modal parameters
    const rzpOptions = {
      key: orderData.keyId || config.keyId,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: config.displayName || 'Vanjari Jodi Matrimony',
      description: `${planName} - अधिकृत मेंबरशिप (${config.env} Mode)`,
      image: '/vanjari-jodi-official-logo-v3.png?v=3',
      order_id: orderData.orderId,
      prefill: {
        name: userName || '',
        contact: userMobile || '',
      },
      notes: {
        plan_id: planId,
        user_id: userId,
      },
      theme: {
        color: '#800C1E', // Brand Crimson Maroon
      },
      modal: {
        backdropclose: false,
        escape: false,
        handleback: true,
        confirm_close: true,
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // 5. Send credentials to server for HMAC-SHA256 signature verification
          const verifyRes = await fetch('/api/payment/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: planId,
              user_id: userId,
              user_name: userName,
              user_mobile: userMobile,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            onSuccess(verifyData);
          } else {
            onError(verifyData.message || 'पेमेंट स्वाक्षरी पडताळणी अयशस्वी झाली. कृपया ग्राहक सेवेशी संपर्क साधा.');
          }
        } catch (vErr: any) {
          console.error('Payment verification error:', vErr);
          onError('पेमेंट पडताळणी करताना नेटवर्क त्रुटी आली. तुमचे पैसे कापले असल्यास टेलिग्रामवर संपर्क साधा.');
        }
      },
    };

    // 5. Open Razorpay Checkout modal
    const razorpayInstance = new (window as any).Razorpay(rzpOptions);
    razorpayInstance.on('payment.failed', (failResponse: any) => {
      console.warn('Razorpay payment failed:', failResponse);
      const reason = failResponse?.error?.description || 'Payment could not be completed. Please try again.';
      onError(reason);
    });

    razorpayInstance.open();
  } catch (err: any) {
    console.error('Razorpay invocation exception:', err);
    onError('Payment could not be completed. Please try again.');
  }
}
