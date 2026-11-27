/**
 * Google Play Store Review & External Chrome Payment Helper
 * Ensures 100% compliance with Google Play Store Payments Policy.
 * Redirects in-app purchases to the official web portal in Chrome with Razorpay.
 */

export interface PaymentRedirectParams {
  planId: string;
  planName?: string;
  amount?: number;
  userId?: string;
  userName?: string;
  userMobile?: string;
  promoCode?: string;
}

/**
 * Legacy compatibility helper — app now runs in permanent Final Launch Zero-Payment Mode
 * (no temporary Review Mode toggle required).
 */
export function isGooglePlayReviewActive(_siteConfig?: any): boolean {
  return false;
}

/**
 * Permanent Zero-Payment App Mode:
 * Everywhere inside the Android App / main app shell, ZERO payment/pricing UI is shown.
 * Only the dedicated standalone web route (/pay or /payment) operates independently on web.
 */
export function isActivationCodeOnlyMode(_siteConfig?: any): boolean {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (
      path === '/pay' ||
      path === '/pay/' ||
      path.startsWith('/pay') ||
      path === '/payment' ||
      path === '/payment/' ||
      path.startsWith('/payment')
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Detects if the current session is running inside an Android native APK / Capacitor WebView
 */
export function isNativeAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Capacitor native platform detection
  const capacitor = (window as any).Capacitor;
  if (capacitor && typeof capacitor.isNativePlatform === 'function' && capacitor.isNativePlatform()) {
    return true;
  }
  if (capacitor && capacitor.getPlatform && capacitor.getPlatform() === 'android') {
    return true;
  }

  // 2. URL Protocol / Host check (Capacitor runs on https://localhost or capacitor://localhost)
  if (window.location.protocol === 'capacitor:' || window.location.hostname === 'localhost') {
    return true;
  }

  // 3. Android WebView User Agent check
  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isWebView = /wv|Version\/[\d.]+/i.test(ua) && isAndroid;

  return isWebView;
}

/**
 * Permanent Final Launch Play Store Compliant Mode:
 * Returns true everywhere in the App (and false ONLY on standalone web route /pay or /payment).
 * Ensures ZERO payment gateways, ZERO pricing/₹ mentions, ZERO refund/checkout text inside the App.
 */
export function isCompliantMobileApp(): boolean {
  if (typeof window === 'undefined') return true;

  const path = window.location.pathname.toLowerCase();
  if (
    path === '/pay' ||
    path === '/pay/' ||
    path.startsWith('/pay') ||
    path === '/payment' ||
    path === '/payment/' ||
    path.startsWith('/payment')
  ) {
    return false;
  }

  return true;
}

/**
 * Builds the canonical web payment URL for Chrome checkout
 */
export function buildWebPaymentUrl(params: PaymentRedirectParams, customDomain?: string): string {
  if (typeof window === 'undefined') return '';

  let baseOrigin = window.location.origin;

  // If explicitly provided custom domain, prioritize it
  if (customDomain && !customDomain.includes('localhost')) {
    baseOrigin = customDomain.replace(/\/$/, '');
  } else if (
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && isNativeAndroidApp())
  ) {
    // Inside native Capacitor Android build, route to official public production portal
    baseOrigin = 'https://vanjarijodi.web.app';
  }

  const query = new URLSearchParams();
  if (params.planId) query.set('plan', params.planId);
  if (params.planName) query.set('planName', params.planName);
  if (params.amount) query.set('amount', String(params.amount));
  if (params.userId) query.set('userId', params.userId);
  if (params.userName) query.set('userName', params.userName);
  if (params.userMobile) query.set('userMobile', params.userMobile);
  if (params.promoCode) query.set('promo', params.promoCode);
  query.set('source', 'android_app');
  query.set('t', String(Date.now()));

  return `${baseOrigin}/pay?${query.toString()}`;
}

/**
 * Reliably launches Google Chrome or the default external system browser
 */
export function openPaymentInExternalChrome(payUrl: string): boolean {
  if (!payUrl || typeof window === 'undefined') return false;

  console.log('[PlayStorePayment] Opening payment in Chrome / External browser:', payUrl);

  // Strategy 1: Capacitor Browser Plugin (opens in full external Chrome / Custom Tab)
  try {
    const capacitor = (window as any).Capacitor;
    if (capacitor?.Plugins?.Browser?.open) {
      capacitor.Plugins.Browser.open({ url: payUrl });
      return true;
    }
  } catch (capErr) {
    console.warn('[PlayStorePayment] Capacitor Browser plugin check:', capErr);
  }

  // Strategy 2: Android Chrome Intent fallback for Android devices
  try {
    const parsed = new URL(payUrl);
    const hostWithPort = parsed.host;
    const pathAndQuery = `${parsed.pathname.replace(/^\//, '')}${parsed.search}`;
    const chromeIntent = `intent://${hostWithPort}/${pathAndQuery}#Intent;scheme=https;package=com.android.chrome;end`;

    if (/android/i.test(navigator.userAgent || '')) {
      const intentAnchor = document.createElement('a');
      intentAnchor.href = chromeIntent;
      intentAnchor.rel = 'noopener noreferrer';
      document.body.appendChild(intentAnchor);
      intentAnchor.click();
      document.body.removeChild(intentAnchor);
      return true;
    }
  } catch (intentErr) {
    console.warn('[PlayStorePayment] Chrome intent failed:', intentErr);
  }

  // Strategy 3: window.open with _system for Cordova / WebView / PWA
  try {
    const opened = window.open(payUrl, '_system');
    if (opened) return true;
  } catch (err) {
    console.warn('[PlayStorePayment] window.open _system failed:', err);
  }

  // Strategy 4: Standard external target anchor
  try {
    const a = document.createElement('a');
    a.href = payUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (aErr) {
    console.warn('[PlayStorePayment] Anchor open failed:', aErr);
  }

  // Strategy 5: Direct location redirect
  window.location.href = payUrl;
  return true;
}

/**
 * Checks server-side membership status for a user
 */
export async function fetchUserMembershipStatus(userId: string): Promise<{
  hasMembership: boolean;
  isExpired: boolean;
  membership: any;
}> {
  if (!userId) {
    return { hasMembership: false, isExpired: false, membership: null };
  }

  try {
    const res = await fetch(`/api/payment/user-membership/${encodeURIComponent(userId)}?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      return {
        hasMembership: Boolean(data.hasMembership),
        isExpired: Boolean(data.isExpired),
        membership: data.membership || null,
      };
    }
  } catch (e) {
    console.warn('[PlayStorePayment] Membership status query error:', e);
  }

  return { hasMembership: false, isExpired: false, membership: null };
}
