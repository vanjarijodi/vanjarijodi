import type { Express, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { loadJsonData, saveJsonData } from './storageService.ts';
import { sendEmailOtp, isValidEmailAddress } from './emailOtpService.ts';

// ============================================================================
// 1. DATA INTERFACES (`users` & `otp_verifications` — Email OTP + 4-Digit MPIN)
// ============================================================================

export interface AuthUserRecord {
  id: string;
  mobile_number: string;       // 10-digit mobile number (optional when email-only)
  email?: string;              // Verified email address for Email OTP
  mpin_hash: string | null;    // bcrypt hash of 4-digit MPIN
  is_phone_verified: boolean;  // Backwards-compatible verified flag (true after Email OTP)
  is_email_verified?: boolean; // Set to true once Email OTP is verified
  created_at: string;          // ISO timestamp
  updated_at?: string;         // ISO timestamp
}

export interface OtpVerificationRecord {
  key: string;                 // Normalized lowercase email address
  email: string;               // Target email address
  mobile_number?: string;      // Optional linked 10-digit mobile number
  otp_code_hash: string | null;// bcrypt hash of 4-digit OTP (null when invalidated/used)
  otp_count: number;           // Number of OTPs requested in current 24-hr rolling window
  window_start_at: string;     // ISO timestamp for 24-hr rolling window start
  expires_at: string;          // ISO timestamp (5 minutes TTL)
  failed_attempts: number;     // Brute-force counter (invalidates OTP at 3 wrong attempts)
  last_sent_at: string;        // ISO timestamp for 60-second resend cooldown
}

// ============================================================================
// 2. SECURITY & RATE LIMITING CONSTANTS
// ============================================================================

const APP_DOMAIN = 'vanjarijodi.web.app';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const SIXTY_SECONDS_MS = 60 * 1000;
const MAX_OTPS_PER_24_HOURS = 5;
const MAX_FAILED_OTP_ATTEMPTS = 3;
const BCRYPT_SALT_ROUNDS = 10;

const BLOCK_24H_MESSAGE_MR =
  'तुम्ही २४ तासांची OTP मर्यादा ओलांडली आहे. कृपया २४ तासांनंतर प्रयत्न करा.';

const RUNTIME_FALLBACK_JWT_SECRET = crypto.randomBytes(32).toString('hex');

// ============================================================================
// 3. FIREBASE ADMIN SDK & FIRESTORE INITIALIZATION
// ============================================================================

function getAdminFirestore(): Firestore | null {
  try {
    if (!getApps().length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'vanjarijodi',
        });
      } else {
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'vanjarijodi',
        });
      }
    }
    return getFirestore();
  } catch {
    return null;
  }
}

// ============================================================================
// 4. JWT & FIREBASE CUSTOM TOKEN HELPERS (30-Day Persistent Auto-Login)
// ============================================================================

function getJwtSecret(): string {
  return (
    process.env.JWT_SECRET ||
    process.env.FIREBASE_JWT_SECRET ||
    RUNTIME_FALLBACK_JWT_SECRET
  );
}

export function signAuthJwt(payload: {
  sub: string;
  mobile_number: string;
  email?: string;
  is_phone_verified: boolean;
}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const nowSec = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: nowSec,
      exp: nowSec + 30 * 24 * 60 * 60,
      iss: APP_DOMAIN,
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifyAuthJwt(token: string): {
  valid: boolean;
  payload?: { sub: string; mobile_number: string; email?: string; is_phone_verified: boolean; exp: number };
} {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return { valid: false };
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return { valid: false };

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (!decoded.exp || Math.floor(Date.now() / 1000) > decoded.exp) {
      return { valid: false };
    }
    return { valid: true, payload: decoded };
  } catch {
    return { valid: false };
  }
}

async function tryCreateFirebaseCustomToken(
  uid: string,
  mobileNumber: string,
  email?: string
): Promise<string | undefined> {
  try {
    if (!getApps().length) return undefined;
    return await getAuth().createCustomToken(uid, {
      mobile_number: mobileNumber,
      email: email || undefined,
      is_email_verified: true,
      is_phone_verified: true,
    });
  } catch {
    return undefined;
  }
}

// ============================================================================
// 5. REPOSITORY (`users` & `otp_verifications` + Device Rate Limit)
// ============================================================================

function sanitizeDocKey(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '_')
    .slice(0, 140);
}

function loadLocalUsersMap(): Record<string, AuthUserRecord> {
  return loadJsonData<Record<string, AuthUserRecord>>('mobile_auth_users.json', {});
}

function saveLocalUsersMap(map: Record<string, AuthUserRecord>) {
  saveJsonData('mobile_auth_users.json', map);
}

function loadLocalOtpMap(): Record<string, OtpVerificationRecord> {
  return loadJsonData<Record<string, OtpVerificationRecord>>('email_otp_verifications.json', {});
}

function saveLocalOtpMap(map: Record<string, OtpVerificationRecord>) {
  saveJsonData('email_otp_verifications.json', map);
}

async function getUserFromStore(identifier: string): Promise<AuthUserRecord | null> {
  const cleanKey = sanitizeDocKey(identifier);
  if (!cleanKey) return null;
  const localMap = loadLocalUsersMap();

  if (localMap[cleanKey]) return localMap[cleanKey];

  // Also search by email field if identifier is an email
  if (cleanKey.includes('@')) {
    const matched = Object.values(localMap).find(
      (u) => String(u.email || '').trim().toLowerCase() === cleanKey
    );
    if (matched) return matched;
  }

  const db = getAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('users').doc(cleanKey).get();
      if (snap.exists) {
        const data = snap.data() as AuthUserRecord;
        localMap[cleanKey] = data;
        saveLocalUsersMap(localMap);
        return data;
      }
    } catch {
      // Fallback to local mirror
    }
  }
  return null;
}

async function saveUserToStore(record: AuthUserRecord): Promise<void> {
  const localMap = loadLocalUsersMap();
  const primaryKey = record.mobile_number || sanitizeDocKey(record.email || record.id);
  localMap[primaryKey] = record;
  if (record.email) {
    localMap[sanitizeDocKey(record.email)] = record;
  }
  saveLocalUsersMap(localMap);

  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('users').doc(primaryKey).set(record, { merge: true });
    } catch {
      // Mirrored locally
    }
  }
}

async function getOtpFromStore(emailKey: string): Promise<OtpVerificationRecord | null> {
  const key = sanitizeDocKey(emailKey);
  if (!key) return null;
  const localMap = loadLocalOtpMap();
  const db = getAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('otp_verifications').doc(key).get();
      if (snap.exists) {
        const data = snap.data() as OtpVerificationRecord;
        localMap[key] = data;
        saveLocalOtpMap(localMap);
        return data;
      }
    } catch {
      // Fallback to local mirror
    }
  }
  return localMap[key] || null;
}

async function saveOtpToStore(record: OtpVerificationRecord): Promise<void> {
  const key = sanitizeDocKey(record.key || record.email);
  const localMap = loadLocalOtpMap();
  localMap[key] = record;
  saveLocalOtpMap(localMap);

  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('otp_verifications').doc(key).set(record, { merge: true });
    } catch {
      // Mirrored locally
    }
  }
}

export interface DeviceOtpLimitRecord {
  device_id: string;
  otp_count: number;
  window_start_at: string;
  last_sent_at: string;
  targets_requested: string[];
}

function loadLocalDeviceOtpMap(): Record<string, DeviceOtpLimitRecord> {
  return loadJsonData<Record<string, DeviceOtpLimitRecord>>('email_device_otp_limits.json', {});
}

function saveLocalDeviceOtpMap(map: Record<string, DeviceOtpLimitRecord>) {
  saveJsonData('email_device_otp_limits.json', map);
}

async function getDeviceOtpLimit(deviceId: string): Promise<DeviceOtpLimitRecord | null> {
  const localMap = loadLocalDeviceOtpMap();
  const db = getAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('device_otp_limits').doc(deviceId).get();
      if (snap.exists) {
        const data = snap.data() as DeviceOtpLimitRecord;
        localMap[deviceId] = data;
        saveLocalDeviceOtpMap(localMap);
        return data;
      }
    } catch {}
  }
  return localMap[deviceId] || null;
}

async function saveDeviceOtpLimit(record: DeviceOtpLimitRecord): Promise<void> {
  const localMap = loadLocalDeviceOtpMap();
  localMap[record.device_id] = record;
  saveLocalDeviceOtpMap(localMap);

  const db = getAdminFirestore();
  if (db) {
    try {
      await db.collection('device_otp_limits').doc(record.device_id).set(record, { merge: true });
    } catch {}
  }
}

function extractClientDeviceId(req: Request): string {
  const rawFp =
    req.body?.deviceFingerprint ||
    req.body?.device_id ||
    req.headers['x-device-fingerprint'] ||
    req.headers['x-forwarded-for'] ||
    req.ip ||
    'default_device';
  const str = Array.isArray(rawFp) ? rawFp[0] : String(rawFp);
  return str.trim().replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 96) || 'default_device';
}

// ============================================================================
// 6. EXPRESS / NODE.JS AUTH ROUTES (Email OTP + 4-Digit MPIN — Zero SMS, Zero Truecaller)
// ============================================================================

export function registerMobileAuthRoutes(app: Express) {
  /**
   * 0. POST /api/auth/check-user
   * Checks whether a user already has an MPIN configured (by 10-digit mobile or email).
   * Returning users can log in directly with their 4-digit MPIN without needing any OTP.
   */
  app.post('/api/auth/check-user', async (req: Request, res: Response) => {
    try {
      const rawPhone = req.body?.mobile_number || req.body?.phone || req.body?.mobile || '';
      const rawEmail = String(req.body?.email || '').trim().toLowerCase();
      const mobileNumber = String(rawPhone).replace(/\D/g, '').slice(-10);

      if (mobileNumber.length !== 10 && !isValidEmailAddress(rawEmail)) {
        return res.status(400).json({
          success: false,
          error: 'कृपया अचूक १० अंकी मोबाईल नंबर किंवा वैध ईमेल पत्ता टाका.',
        });
      }

      const lookupKey = mobileNumber.length === 10 ? mobileNumber : rawEmail;
      const user = await getUserFromStore(lookupKey);
      const credsLedger = loadJsonData<Record<string, any>>('member_credentials_ledger.json', {});
      const ledgerUser =
        (mobileNumber && credsLedger[mobileNumber]) ||
        (rawEmail &&
          Object.values(credsLedger).find(
            (c: any) => String(c?.email || '').trim().toLowerCase() === rawEmail
          ));

      const isVerified = Boolean(
        user?.is_email_verified ||
          user?.is_phone_verified ||
          ledgerUser?.passwordHash ||
          ledgerUser?.isEmailVerified ||
          ledgerUser?.isPhoneVerified
      );
      const hasMpin = Boolean(user?.mpin_hash || ledgerUser?.passwordHash);
      const savedEmail = user?.email || ledgerUser?.email || (isValidEmailAddress(rawEmail) ? rawEmail : undefined);

      return res.json({
        success: true,
        mobile_number: mobileNumber || user?.mobile_number || '',
        email: savedEmail,
        exists: Boolean(user || ledgerUser),
        is_phone_verified: isVerified,
        is_email_verified: Boolean(user?.is_email_verified || isVerified),
        has_mpin: hasMpin,
        fullName: ledgerUser?.fullName || undefined,
        gender: ledgerUser?.gender || undefined,
        planId: ledgerUser?.planId || undefined,
        hasPaidMembership: Boolean(ledgerUser),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * 1. POST /api/auth/send-otp
   * Sends a cryptographically secure 4-digit OTP strictly via EMAIL (Gmail / SMTP / Resend).
   * - Zero SMS OTP.
   * - Enforces 24h rolling window rate limit + 60s resend cooldown per email & device.
   * - Dispatches email BEFORE consuming quota; returns HTTP 422 JSON if email delivery fails.
   */
  app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      const rawPhone = req.body?.mobile_number || req.body?.phone || req.body?.mobile || '';
      const mobileNumber = String(rawPhone).replace(/\D/g, '').slice(-10);
      let email = String(req.body?.email || '').trim().toLowerCase();
      const purpose = String(req.body?.purpose || 'verification').trim();
      const deviceId = extractClientDeviceId(req);

      // If email wasn't passed directly, try looking up stored email for this mobile number
      if (!email && mobileNumber.length === 10) {
        const existingUser = await getUserFromStore(mobileNumber);
        const credsLedger = loadJsonData<Record<string, any>>('member_credentials_ledger.json', {});
        const foundEmail = existingUser?.email || credsLedger[mobileNumber]?.email || '';
        if (isValidEmailAddress(foundEmail)) {
          email = String(foundEmail).trim().toLowerCase();
        }
      }

      if (!isValidEmailAddress(email)) {
        return res.status(400).json({
          success: false,
          requireEmail: true,
          error: 'कृपया ईमेल OTP मिळवण्यासाठी तुमचा वैध ईमेल पत्ता (उदा. name@gmail.com) टाका.',
        });
      }

      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();

      // CHECK A: 24-Hour Rate Limit per Device
      const existingDeviceRecord = await getDeviceOtpLimit(deviceId);
      let deviceOtpCount = 0;
      let deviceWindowStartMs = nowMs;
      let deviceTargetsUsed: string[] = [];

      if (existingDeviceRecord) {
        const prevDevWindowMs = new Date(existingDeviceRecord.window_start_at).getTime() || nowMs;
        if (nowMs - prevDevWindowMs < TWENTY_FOUR_HOURS_MS) {
          deviceOtpCount = existingDeviceRecord.otp_count || 0;
          deviceWindowStartMs = prevDevWindowMs;
          deviceTargetsUsed = Array.isArray(existingDeviceRecord.targets_requested)
            ? existingDeviceRecord.targets_requested
            : [];

          if (deviceOtpCount >= MAX_OTPS_PER_24_HOURS) {
            return res.status(429).json({
              success: false,
              error: BLOCK_24H_MESSAGE_MR,
              is24HourBlocked: true,
              deviceBlocked: true,
              resetAt: new Date(prevDevWindowMs + TWENTY_FOUR_HOURS_MS).toISOString(),
            });
          }

          const devLastSentMs = new Date(existingDeviceRecord.last_sent_at).getTime() || 0;
          if (nowMs - devLastSentMs < SIXTY_SECONDS_MS) {
            const remainingSeconds = Math.ceil((SIXTY_SECONDS_MS - (nowMs - devLastSentMs)) / 1000);
            return res.status(429).json({
              success: false,
              error: `कृपया नवीन ईमेल OTP मागवण्यासाठी ${remainingSeconds} सेकंद प्रतीक्षा करा.`,
              cooldownSeconds: remainingSeconds,
            });
          }
        }
      }

      // CHECK B: 24-Hour Rate Limit per Email Address
      const existingOtp = await getOtpFromStore(email);
      let otpCount = 0;
      let windowStartAtMs = nowMs;

      if (existingOtp) {
        const prevWindowStartMs = new Date(existingOtp.window_start_at).getTime() || nowMs;
        if (nowMs - prevWindowStartMs < TWENTY_FOUR_HOURS_MS) {
          otpCount = existingOtp.otp_count || 0;
          windowStartAtMs = prevWindowStartMs;

          if (otpCount >= MAX_OTPS_PER_24_HOURS) {
            return res.status(429).json({
              success: false,
              error: BLOCK_24H_MESSAGE_MR,
              is24HourBlocked: true,
              resetAt: new Date(prevWindowStartMs + TWENTY_FOUR_HOURS_MS).toISOString(),
            });
          }

          const lastSentMs = new Date(existingOtp.last_sent_at).getTime() || 0;
          if (nowMs - lastSentMs < SIXTY_SECONDS_MS) {
            const remainingSeconds = Math.ceil((SIXTY_SECONDS_MS - (nowMs - lastSentMs)) / 1000);
            return res.status(429).json({
              success: false,
              error: `कृपया नवीन ईमेल OTP मागवण्यासाठी ${remainingSeconds} सेकंद प्रतीक्षा करा.`,
              cooldownSeconds: remainingSeconds,
            });
          }
        }
      }

      // Generate Cryptographically Secure 4-Digit OTP
      const otpCode = crypto.randomInt(1000, 10000).toString();

      // Dispatch Email OTP BEFORE incrementing quota or saving hash
      const emailResult = await sendEmailOtp(email, otpCode, purpose);

      // Log email OTP stats for Admin monitoring
      try {
        const todayKey = nowIso.slice(0, 10);
        const otpStats = loadJsonData<any>('sms_usage_stats.json', {
          totalSent: 0,
          mpinSavedCount: 142,
          dailyCounts: {},
          quotaSettings: { dailyGlobalSmsCap: 500 },
          recentLogs: [],
        });
        if (emailResult.sent) {
          otpStats.totalSent = Number(otpStats.totalSent || 0) + 1;
          if (!otpStats.dailyCounts) otpStats.dailyCounts = {};
          otpStats.dailyCounts[todayKey] = Number(otpStats.dailyCounts[todayKey] || 0) + 1;
        }
        if (!Array.isArray(otpStats.recentLogs)) otpStats.recentLogs = [];
        otpStats.recentLogs.unshift({
          id: `email_otp_${nowMs}`,
          mobile: email,
          memberName: emailResult.sent ? 'Email OTP Sent' : 'Email OTP Failed',
          category: 'email_otp_verification',
          message: `4-digit Email OTP dispatched to ${email}`,
          smsSent: emailResult.sent,
          providerNote: emailResult.error || `Delivered via ${emailResult.provider}`,
          sentAt: nowIso,
        });
        otpStats.recentLogs = otpStats.recentLogs.slice(0, 40);
        saveJsonData('sms_usage_stats.json', otpStats);
      } catch {}

      if (!emailResult.sent) {
        return res.status(422).json({
          success: false,
          emailSent: false,
          smsSent: false,
          error: 'ईमेल OTP पाठवता आला नाही: ' + (emailResult.error || 'ईमेल सर्व्हर त्रुटी'),
        });
      }

      const otpCodeHash = await bcrypt.hash(otpCode, BCRYPT_SALT_ROUNDS);
      const expiresAtIso = new Date(nowMs + FIVE_MINUTES_MS).toISOString();
      const newOtpCount = otpCount + 1;
      const newDeviceOtpCount = deviceOtpCount + 1;

      const updatedRecord: OtpVerificationRecord = {
        key: email,
        email,
        mobile_number: mobileNumber.length === 10 ? mobileNumber : undefined,
        otp_code_hash: otpCodeHash,
        otp_count: newOtpCount,
        window_start_at: new Date(windowStartAtMs).toISOString(),
        expires_at: expiresAtIso,
        failed_attempts: 0,
        last_sent_at: nowIso,
      };

      await saveOtpToStore(updatedRecord);

      if (!deviceTargetsUsed.includes(email)) {
        deviceTargetsUsed.push(email);
      }
      await saveDeviceOtpLimit({
        device_id: deviceId,
        otp_count: newDeviceOtpCount,
        window_start_at: new Date(deviceWindowStartMs).toISOString(),
        last_sent_at: nowIso,
        targets_requested: deviceTargetsUsed,
      });

      const remainingEmailOtps = Math.max(0, MAX_OTPS_PER_24_HOURS - newOtpCount);
      const remainingDeviceOtps = Math.max(0, MAX_OTPS_PER_24_HOURS - newDeviceOtpCount);
      const effectiveRemaining = Math.min(remainingEmailOtps, remainingDeviceOtps);

      return res.json({
        success: true,
        email,
        phone: mobileNumber || undefined,
        mobile_number: mobileNumber || undefined,
        channel: 'email',
        otpLength: 4,
        cooldownSeconds: 60,
        remainingOtpsIn24h: effectiveRemaining,
        emailSent: true,
        message: `📧 ४-अंकी OTP कोड ${email} वर पाठवला आहे (Inbox किंवा Spam फोल्डर तपासा).`,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'ईमेल OTP पाठवताना सर्व्हर त्रुटी आली: ' + (err.message || ''),
      });
    }
  });

  /**
   * 2. POST /api/auth/verify-otp
   * Validates 4-digit Email OTP against bcrypt hash, marks user verified, sets MPIN if supplied, and issues JWT.
   */
  app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
    try {
      const rawPhone = req.body?.mobile_number || req.body?.phone || req.body?.mobile || '';
      const mobileNumber = String(rawPhone).replace(/\D/g, '').slice(-10);
      let email = String(req.body?.email || '').trim().toLowerCase();
      const cleanOtp = String(req.body?.otp || '').trim();
      const rawMpin = req.body?.mpin ? String(req.body.mpin).trim() : '';

      if (!email && mobileNumber.length === 10) {
        const existingUser = await getUserFromStore(mobileNumber);
        if (existingUser?.email) {
          email = existingUser.email.trim().toLowerCase();
        }
      }

      if (!isValidEmailAddress(email)) {
        return res.status(400).json({ success: false, error: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.' });
      }

      if (!/^[0-9]{4,6}$/.test(cleanOtp)) {
        return res.status(400).json({
          success: false,
          error: 'कृपया वैध ४-अंकी ईमेल OTP कोड टाका.',
        });
      }

      const record = await getOtpFromStore(email);
      const nowMs = Date.now();

      if (!record || !record.otp_code_hash) {
        return res.status(400).json({
          success: false,
          error: 'कोणताही सक्रिय ईमेल OTP आढळला नाही किंवा तो रद्द झाला आहे. कृपया नवीन OTP मागवा.',
        });
      }

      if (nowMs > new Date(record.expires_at).getTime()) {
        record.otp_code_hash = null;
        await saveOtpToStore(record);
        return res.status(400).json({
          success: false,
          error: 'हा ईमेल OTP कोड कालबाह्य (५ मिनिटे पूर्ण) झाला आहे. कृपया नवीन OTP मागवा.',
        });
      }

      const isMatch = await bcrypt.compare(cleanOtp, record.otp_code_hash);
      if (!isMatch) {
        record.failed_attempts = (record.failed_attempts || 0) + 1;

        if (record.failed_attempts >= MAX_FAILED_OTP_ATTEMPTS) {
          record.otp_code_hash = null;
          await saveOtpToStore(record);

          return res.status(400).json({
            success: false,
            otpInvalidated: true,
            attemptsRemaining: 0,
            error:
              '३ वेळा चुकीचा OTP टाकल्यामुळे सुरक्षेसाठी हा OTP तात्काळ रद्द करण्यात आला आहे. कृपया नवीन ईमेल OTP मागवा.',
          });
        }

        await saveOtpToStore(record);
        const remaining = MAX_FAILED_OTP_ATTEMPTS - record.failed_attempts;
        return res.status(400).json({
          success: false,
          attemptsRemaining: remaining,
          error: `चुकीचा ईमेल OTP कोड! कृपया अचूक ४-अंकी कोड टाका. (उर्वरित प्रयत्न: ${remaining})`,
        });
      }

      // OTP Verified — single-use invalidation
      record.otp_code_hash = null;
      record.failed_attempts = 0;
      await saveOtpToStore(record);

      const effectiveMobile = mobileNumber.length === 10 ? mobileNumber : record.mobile_number || '';
      const existingUser =
        (effectiveMobile ? await getUserFromStore(effectiveMobile) : null) ||
        (await getUserFromStore(email));

      let mpinHash = existingUser?.mpin_hash || null;
      if (rawMpin && /^[0-9]{4}$/.test(rawMpin)) {
        mpinHash = await bcrypt.hash(rawMpin, BCRYPT_SALT_ROUNDS);
      }

      const nowIso = new Date().toISOString();
      const userId = existingUser?.id || (effectiveMobile ? `VJ_${effectiveMobile}` : `VJ_${sanitizeDocKey(email)}`);
      const userRecord: AuthUserRecord = {
        id: userId,
        mobile_number: effectiveMobile || existingUser?.mobile_number || '',
        email,
        mpin_hash: mpinHash,
        is_phone_verified: true,
        is_email_verified: true,
        created_at: existingUser?.created_at || nowIso,
        updated_at: nowIso,
      };

      await saveUserToStore(userRecord);

      // Sync to credentials ledger
      if (effectiveMobile) {
        const credsLedger = loadJsonData<Record<string, any>>('member_credentials_ledger.json', {});
        credsLedger[effectiveMobile] = {
          ...(credsLedger[effectiveMobile] || {}),
          loginId: effectiveMobile,
          mobile: `+91 ${effectiveMobile}`,
          email,
          isEmailVerified: true,
          isPhoneVerified: true,
          ...(mpinHash ? { passwordHash: mpinHash } : {}),
          updatedAt: nowIso,
        };
        saveJsonData('member_credentials_ledger.json', credsLedger);
      }

      const jwtToken = signAuthJwt({
        sub: userRecord.id,
        mobile_number: userRecord.mobile_number,
        email,
        is_phone_verified: true,
      });
      const firebaseCustomToken = await tryCreateFirebaseCustomToken(
        userRecord.id,
        userRecord.mobile_number,
        email
      );

      return res.json({
        success: true,
        verified: true,
        email,
        phone: userRecord.mobile_number,
        mobile_number: userRecord.mobile_number,
        is_email_verified: true,
        is_phone_verified: true,
        require_mpin_setup: !Boolean(userRecord.mpin_hash),
        token: jwtToken,
        firebaseCustomToken,
        verificationToken: jwtToken,
        user: {
          id: userRecord.id,
          email,
          mobile_number: userRecord.mobile_number,
          is_email_verified: true,
          is_phone_verified: true,
        },
        message: '✅ ईमेल OTP पडताळणी यशस्वी झाली!',
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'ईमेल OTP पडताळणीत त्रुटी आली: ' + (err.message || ''),
      });
    }
  });

  /**
   * 2B. POST /api/auth/set-mpin
   * Sets hashed 4-digit MPIN after Email OTP verification.
   */
  app.post('/api/auth/set-mpin', async (req: Request, res: Response) => {
    try {
      const rawPhone = req.body?.mobile_number || req.body?.phone || req.body?.mobile || '';
      const mobileNumber = String(rawPhone).replace(/\D/g, '').slice(-10);
      const email = String(req.body?.email || '').trim().toLowerCase();
      const rawMpin = String(req.body?.mpin || '').trim();

      if (mobileNumber.length !== 10 && !isValidEmailAddress(email)) {
        return res.status(400).json({ success: false, error: 'कृपया १० अंकी मोबाईल नंबर किंवा ईमेल टाका.' });
      }
      if (!rawMpin || rawMpin.length < 4) {
        return res.status(400).json({
          success: false,
          error: 'कृपया किमान ४-अंकी MPIN / पासवर्ड सेट करा (उदा. 1234).',
        });
      }

      const user =
        (mobileNumber.length === 10 ? await getUserFromStore(mobileNumber) : null) ||
        (isValidEmailAddress(email) ? await getUserFromStore(email) : null);

      if (!user || (!user.is_email_verified && !user.is_phone_verified)) {
        return res.status(403).json({
          success: false,
          error: 'MPIN सेट करण्यापूर्वी ईमेल OTP ने पडताळणी करणे आवश्यक आहे.',
        });
      }

      const mpinHash = await bcrypt.hash(rawMpin, BCRYPT_SALT_ROUNDS);
      const nowIso = new Date().toISOString();
      user.mpin_hash = mpinHash;
      if (isValidEmailAddress(email)) user.email = email;
      user.updated_at = nowIso;
      await saveUserToStore(user);

      if (user.mobile_number) {
        const credsLedger = loadJsonData<Record<string, any>>('member_credentials_ledger.json', {});
        credsLedger[user.mobile_number] = {
          ...(credsLedger[user.mobile_number] || {}),
          loginId: user.mobile_number,
          mobile: `+91 ${user.mobile_number}`,
          email: user.email,
          passwordHash: mpinHash,
          isEmailVerified: true,
          isPhoneVerified: true,
          updatedAt: nowIso,
        };
        saveJsonData('member_credentials_ledger.json', credsLedger);
      }

      const jwtToken = signAuthJwt({
        sub: user.id,
        mobile_number: user.mobile_number,
        email: user.email,
        is_phone_verified: true,
      });

      return res.json({
        success: true,
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          mobile_number: user.mobile_number,
          is_email_verified: true,
          is_phone_verified: true,
        },
        message: 'तुमचा ४-अंकी MPIN यशस्वीरित्या सेट झाला आहे!',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * 3. POST /api/auth/login-mpin
   * Returning User Instant Login with 4-Digit MPIN (no OTP needed).
   */
  app.post('/api/auth/login-mpin', async (req: Request, res: Response) => {
    try {
      const rawPhone = req.body?.mobile_number || req.body?.phone || req.body?.mobile || '';
      const mobileNumber = String(rawPhone).replace(/\D/g, '').slice(-10);
      const email = String(req.body?.email || '').trim().toLowerCase();
      const rawMpin = String(req.body?.mpin || req.body?.password || '').trim();

      if (mobileNumber.length !== 10 && !isValidEmailAddress(email)) {
        return res.status(400).json({
          success: false,
          error: 'कृपया अचूक १० अंकी मोबाईल नंबर किंवा ईमेल टाका.',
        });
      }

      if (!rawMpin || rawMpin.length < 4) {
        return res.status(400).json({
          success: false,
          error: 'कृपया तुमचा ४-अंकी MPIN / पासवर्ड टाका.',
        });
      }

      const user =
        (mobileNumber.length === 10 ? await getUserFromStore(mobileNumber) : null) ||
        (isValidEmailAddress(email) ? await getUserFromStore(email) : null);

      const credsLedger = loadJsonData<Record<string, any>>('member_credentials_ledger.json', {});
      const ledgerRecord =
        (mobileNumber && credsLedger[mobileNumber]) ||
        (user?.mobile_number && credsLedger[user.mobile_number]) ||
        (email &&
          Object.values(credsLedger).find(
            (c: any) => String(c?.email || '').trim().toLowerCase() === email
          ));

      const storedHash = user?.mpin_hash || ledgerRecord?.passwordHash;
      if (!storedHash) {
        return res.status(404).json({
          success: false,
          requireOtpVerification: true,
          error: 'या खात्यासाठी अद्याप MPIN सेट केलेला नाही. कृपया प्रथम ईमेल OTP ने पडताळणी करा.',
        });
      }

      let isValidMpin = false;
      if (storedHash.startsWith('$2')) {
        isValidMpin = await bcrypt.compare(rawMpin, storedHash);
      } else {
        isValidMpin = rawMpin === storedHash;
      }

      if (!isValidMpin && ledgerRecord?.passwordHash && ledgerRecord.passwordHash !== storedHash) {
        if (ledgerRecord.passwordHash.startsWith('$2')) {
          isValidMpin = await bcrypt.compare(rawMpin, ledgerRecord.passwordHash);
        } else {
          isValidMpin = rawMpin === ledgerRecord.passwordHash;
        }
      }

      if (!isValidMpin) {
        return res.status(401).json({
          success: false,
          error: 'चुकीचा MPIN किंवा पासवर्ड! कृपया अचूक MPIN टाका.',
        });
      }

      const resolvedMobile = mobileNumber || user?.mobile_number || ledgerRecord?.loginId || '';
      const resolvedEmail = user?.email || ledgerRecord?.email || email || undefined;
      const userId = user?.id || `VJ_${resolvedMobile || sanitizeDocKey(resolvedEmail || 'member')}`;

      const jwtToken = signAuthJwt({
        sub: userId,
        mobile_number: resolvedMobile,
        email: resolvedEmail,
        is_phone_verified: true,
      });
      const firebaseCustomToken = await tryCreateFirebaseCustomToken(
        userId,
        resolvedMobile,
        resolvedEmail
      );

      return res.json({
        success: true,
        token: jwtToken,
        firebaseCustomToken,
        user: {
          id: userId,
          mobile_number: resolvedMobile,
          email: resolvedEmail,
          is_email_verified: true,
          is_phone_verified: true,
          fullName: ledgerRecord?.fullName || undefined,
          gender: ledgerRecord?.gender || undefined,
          hasPaidMembership: Boolean(ledgerRecord?.hasPaidMembership || ledgerRecord?.planId),
          planId: ledgerRecord?.planId || undefined,
          planName: ledgerRecord?.planName || undefined,
        },
        message: 'लॉगिन पडताळणी यशस्वी! आपले स्वागत आहे.',
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'लॉगिन करताना त्रुटी आली: ' + (err.message || ''),
      });
    }
  });

  /**
   * 4. POST /api/auth/google-verify
   * Cryptographically verifies a Firebase Google Sign-In ID token via Firebase Admin verifyIdToken()
   * (needs no IAM, works on any project) and issues a 30-day session JWT. Zero SMTP/OTP required!
   */
  app.post('/api/auth/google-verify', async (req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const idToken = String(req.body?.idToken || '').trim();
      const rawPhone = req.body?.mobile_number || req.body?.phone || req.body?.mobile || '';
      const mobileNumber = String(rawPhone).replace(/\D/g, '').slice(-10);
      const rawMpin = req.body?.mpin ? String(req.body.mpin).trim() : '';

      if (!idToken || idToken.length < 50) {
        return res.status(400).json({
          success: false,
          error: 'वैध Google पडताळणी टोकन आढळले नाही. कृपया पुन्हा गुगलने लॉगिन करा.',
        });
      }

      // Initialize Firebase Admin with projectId only (verifyIdToken requires no IAM credentials)
      if (!getApps().length) {
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'vanjarijodi',
        });
      }

      let decoded: any;
      try {
        decoded = await getAuth().verifyIdToken(idToken);
      } catch (verifyErr: any) {
        return res.status(401).json({
          success: false,
          error: 'गुगल टोकन पडताळणी अयशस्वी झाली. कृपया पुन्हा गुगलने लॉगिन करा.',
        });
      }

      const verifiedEmail = String(decoded?.email || '').trim().toLowerCase();
      if (!verifiedEmail || !isValidEmailAddress(verifiedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'या गुगल खात्याशी वैध ईमेल पत्ता जोडलेला नाही.',
        });
      }

      const displayName = String(decoded?.name || '').trim();
      const photoURL = String(decoded?.picture || '').trim();
      const firebaseUid = String(decoded?.uid || '').trim();

      const existingUser =
        (mobileNumber.length === 10 ? await getUserFromStore(mobileNumber) : null) ||
        (await getUserFromStore(verifiedEmail));

      let mpinHash = existingUser?.mpin_hash || null;
      if (rawMpin && /^[0-9]{4}$/.test(rawMpin)) {
        mpinHash = await bcrypt.hash(rawMpin, BCRYPT_SALT_ROUNDS);
      }

      const effectiveMobile = mobileNumber.length === 10 ? mobileNumber : existingUser?.mobile_number || '';
      const nowIso = new Date().toISOString();
      const userId =
        existingUser?.id ||
        (effectiveMobile ? `VJ_${effectiveMobile}` : `VJ_${sanitizeDocKey(verifiedEmail)}`);

      const userRecord: AuthUserRecord = {
        id: userId,
        mobile_number: effectiveMobile,
        email: verifiedEmail,
        mpin_hash: mpinHash,
        is_phone_verified: true,
        is_email_verified: true,
        created_at: existingUser?.created_at || nowIso,
        updated_at: nowIso,
      };

      await saveUserToStore(userRecord);

      if (effectiveMobile) {
        const credsLedger = loadJsonData<Record<string, any>>('member_credentials_ledger.json', {});
        credsLedger[effectiveMobile] = {
          ...(credsLedger[effectiveMobile] || {}),
          loginId: effectiveMobile,
          mobile: `+91 ${effectiveMobile}`,
          email: verifiedEmail,
          isEmailVerified: true,
          isPhoneVerified: true,
          authProvider: 'google',
          ...(mpinHash ? { passwordHash: mpinHash } : {}),
          updatedAt: nowIso,
        };
        saveJsonData('member_credentials_ledger.json', credsLedger);
      }

      const jwtToken = signAuthJwt({
        sub: userRecord.id,
        mobile_number: userRecord.mobile_number,
        email: verifiedEmail,
        is_phone_verified: true,
      });

      return res.json({
        success: true,
        verified: true,
        provider: 'google',
        uid: firebaseUid,
        email: verifiedEmail,
        displayName,
        photoURL,
        mobile_number: userRecord.mobile_number,
        is_email_verified: true,
        is_phone_verified: true,
        token: jwtToken,
        user: {
          id: userRecord.id,
          email: verifiedEmail,
          displayName,
          photoURL,
          mobile_number: userRecord.mobile_number,
          is_email_verified: true,
          is_phone_verified: true,
          has_mpin: Boolean(userRecord.mpin_hash),
        },
        message: '✅ गुगल खात्याद्वारे सुरक्षित लॉगिन व पडताळणी यशस्वी झाली!',
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'गुगल पडताळणी दरम्यान सर्व्हर त्रुटी आली: ' + (err.message || ''),
      });
    }
  });

  /**
   * 5. GET /api/auth/me
   * Validates stored JWT token on app launch for instant persistent auto-login.
   */
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!authHeader) {
      return res.status(401).json({ authenticated: false });
    }

    const verified = verifyAuthJwt(authHeader);
    if (!verified.valid || !verified.payload) {
      return res.status(401).json({ authenticated: false });
    }

    const credsLedger = loadJsonData<Record<string, any>>('member_credentials_ledger.json', {});
    const ledgerRecord = verified.payload.mobile_number
      ? credsLedger[verified.payload.mobile_number]
      : undefined;

    return res.json({
      authenticated: true,
      user: {
        id: verified.payload.sub,
        mobile_number: verified.payload.mobile_number,
        email: verified.payload.email,
        is_email_verified: verified.payload.is_phone_verified,
        is_phone_verified: verified.payload.is_phone_verified,
        hasPaidMembership: Boolean(ledgerRecord),
        planId: ledgerRecord?.planId || undefined,
      },
    });
  });
}
