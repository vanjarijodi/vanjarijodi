import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { safeParseJson } from './safeFetchJson';

export interface GoogleSignInResult {
  success: boolean;
  email?: string;
  displayName?: string;
  photoURL?: string;
  uid?: string;
  token?: string;
  mobile_number?: string;
  error?: string;
}

/**
 * 1-Click Google Sign-In with cryptographic server-side Firebase ID token verification.
 * Requires zero SMTP, zero Gmail App Password, and zero OTP typing.
 */
export async function signInWithGoogleVerified(options?: {
  mobileNumber?: string;
  mpin?: string;
}): Promise<GoogleSignInResult> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    if (!fbUser || !fbUser.email) {
      return {
        success: false,
        error: 'या गुगल खात्यावर वैध ईमेल पत्ता आढळला नाही.',
      };
    }

    const idToken = await fbUser.getIdToken();
    const cleanPhone = (options?.mobileNumber || '').replace(/\D/g, '').slice(-10);
    const cleanMpin = (options?.mpin || '').replace(/\D/g, '').slice(0, 4);

    const resp = await fetch('/api/auth/google-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        mobile_number: cleanPhone.length === 10 ? cleanPhone : undefined,
        mpin: cleanMpin.length === 4 ? cleanMpin : undefined,
      }),
    });

    const { data } = await safeParseJson(resp, 'गुगल पडताळणी करताना सर्व्हर त्रुटी आली.');

    if (!resp.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || 'गुगल लॉगिन पडताळणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.',
      };
    }

    if (data.token) {
      try {
        localStorage.setItem('vanjari_auth_jwt_token', data.token);
        if (data.mobile_number) {
          localStorage.setItem('vj_auth_mobile_number', data.mobile_number);
        }
      } catch {
        // ignore storage quota errors
      }
    }

    return {
      success: true,
      email: data.email || fbUser.email.trim().toLowerCase(),
      displayName: data.displayName || fbUser.displayName || '',
      photoURL: data.photoURL || fbUser.photoURL || '',
      uid: data.uid || fbUser.uid,
      token: data.token,
      mobile_number: data.mobile_number || cleanPhone || '',
    };
  } catch (err: any) {
    const code = String(err?.code || '');
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        error: 'गुगल लॉगिन विंडो बंद केली गेली. कृपया पुन्हा "गुगलने लॉगिन करा" वर क्लिक करा.',
      };
    }
    if (code === 'auth/popup-blocked') {
      return {
        success: false,
        error: 'ब्राउझरने गुगल लॉगिन पॉपअप ब्लॉक केले आहे. कृपया Popup Allow करा आणि पुन्हा प्रयत्न करा.',
      };
    }
    if (code === 'auth/unauthorized-domain') {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      return {
        success: false,
        error: `हे डोमेन (${host}) Firebase Console → Authentication → Settings → Authorized domains मध्ये जोडा, त्यानंतर Google Login १-क्लिकमध्ये चालेल.`,
      };
    }
    if (code === 'auth/operation-not-allowed') {
      return {
        success: false,
        error: 'Firebase Console → Authentication → Sign-in method मध्ये "Google" पर्याय Enable करा.',
      };
    }
    return {
      success: false,
      error: err?.message || 'गुगल लॉगिन करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.',
    };
  }
}
