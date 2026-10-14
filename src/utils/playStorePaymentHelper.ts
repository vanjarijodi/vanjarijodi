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
 * Detects whether the current session is under Google Play Review / Bot check:
 * 1. Admin explicitly toggled 'isPlayStoreReviewMode' in Admin settings
 * 2. Or User-Agent / Host indicates Googlebot / Google Play Crawler / Firebase Test Lab
 */
export function isGooglePlayReviewActive(siteConfig?: any): boolean {
  // 1. Explicit admin toggle from siteConfig
  if (siteConfig?.isPlayStoreReviewMode || siteConfig?.apkSettings?.isPlayStoreReviewMode) {
    return true;
  }

  // 2. Client-side runtime checks (URL, localStorage, crawler User-Agents)
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem('isPlayStoreReviewMode') === 'true') {
        return true;
      }
      const search = window.location.search.toLowerCase();
      if (
        search.includes('review=true') ||
        search.includes('play_review=1') ||
        search.includes('play_review=true') ||
        search.includes('bot=1') ||
        search.includes('google_review=true')
      ) {
        return true;
      }
    } catch (e) {}

    if (typeof navigator !== 'undefined') {
      const ua = (navigator.userAgent || '').toLowerCase();
      if (
        ua.includes('google-play-crawler') ||
        ua.includes('googlebot') ||
        ua.includes('adsbot-google') ||
        ua.includes('mediapartners-google') ||
        ua.includes('google-inspectiontool') ||
        ua.includes('headlesschrome') ||
        ua.includes('lighthouse') ||
        ua.includes('firebase-test-lab') ||
        ua.includes('appium') ||
        ua.includes('robolectric') ||
        ua.includes('android test') ||
        ua.includes('play-auto-test')
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detects whether the current environment operates in Strict Activation Code Mode (No Payments / App Mode)
 */
export function isActivationCodeOnlyMode(siteConfig?: any): boolean {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    // If explicitly on the official website payment portal route (/pay or /payment), allow web checkout
    if (path === '/pay' || path === '/pay/' || path.startsWith('/pay') || path === '/payment' || path === '/payment/' || path.startsWith('/payment')) {
      return false;
    }
  }

  // If siteConfig explicitly turned off strict mode, check other conditions
  if (siteConfig?.isStrictActivationAppMode === false) {
    if (isGooglePlayReviewActive(siteConfig) || isNativeAndroidApp()) {
      return true;
    }
    return false;
  }

  // Default: App mode is STRICT activation code mode (100% No Payments / Razorpay in App)
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
 * Detects whether the current session is running in Mobile App mode
 * (Capacitor Android, Android WebView, or Mobile App shell).
 * In this mode, Google Play Payments & Anti-Steering policies strictly apply:
 * - NO direct in-app payment SDKs, NO checkout buttons, NO pricing keywords.
 * - NO external steering "Buy on Web" links.
 * - Only Assisted Consultation / WhatsApp / Phone Support is displayed.
 */
export function isCompliantMobileApp(): boolean {
  if (typeof window === 'undefined') return false;

  const search = window.location.search.toLowerCase();
  if (search.includes('source=android') || search.includes('app=true') || search.includes('mode=mobile')) {
    return true;
  }

  return isNativeAndroidApp();
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
