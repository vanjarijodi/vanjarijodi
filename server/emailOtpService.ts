import nodemailer from 'nodemailer';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { loadJsonData, saveJsonData } from './storageService.ts';

export type EmailOtpProvider = 'gmail' | 'smtp' | 'resend';

export interface EmailOtpConfig {
  provider: EmailOtpProvider;
  isEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  resendApiKey: string;
  fromName: string;
  fromEmail: string;
  updatedAt?: string;
}

const DEFAULT_EMAIL_OTP_CONFIG: EmailOtpConfig = {
  provider: (process.env.EMAIL_OTP_PROVIDER as EmailOtpProvider) || 'gmail',
  isEnabled: Boolean(process.env.SMTP_PASS || process.env.RESEND_API_KEY),
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT || 465),
  smtpSecure: String(process.env.SMTP_SECURE || 'true') !== 'false',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  fromName: process.env.SMTP_FROM_NAME || 'वंजारी जोडी मॅट्रिमोनी (Vanjari Jodi)',
  fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || '',
};

const EMAIL_CONFIG_FILE = 'email_otp_config.json';

function getAdminFirestoreSafe(): Firestore | null {
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

export function isValidEmailAddress(email: string): boolean {
  const clean = String(email || '').trim().toLowerCase();
  return clean.length >= 5 && clean.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
}

/**
 * Validates SMTP host to block loopback, link-local, and private network addresses (SSRF protection).
 */
export function isSafeSmtpHost(host: string): boolean {
  const clean = String(host || '').trim().toLowerCase();
  if (!clean || clean.length > 253) return false;
  if (!/^[a-z0-9.-]+$/.test(clean)) return false;

  const blockedExact = ['localhost', '0.0.0.0', '::1', 'metadata.google.internal'];
  if (blockedExact.includes(clean)) return false;

  const blockedPrefixes = [
    '127.',
    '10.',
    '192.168.',
    '169.254.',
    '0.',
    '172.16.', '172.17.', '172.18.', '172.19.',
    '172.20.', '172.21.', '172.22.', '172.23.',
    '172.24.', '172.25.', '172.26.', '172.27.',
    '172.28.', '172.29.', '172.30.', '172.31.',
  ];
  if (blockedPrefixes.some((p) => clean.startsWith(p))) return false;
  if (!clean.includes('.')) return false;
  return true;
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function loadEmailOtpConfig(): Promise<EmailOtpConfig> {
  const local = loadJsonData<Partial<EmailOtpConfig>>(EMAIL_CONFIG_FILE, {});
  let merged: EmailOtpConfig = {
    ...DEFAULT_EMAIL_OTP_CONFIG,
    ...local,
    smtpUser: String(local.smtpUser || process.env.SMTP_USER || '').trim(),
    smtpPass: String(local.smtpPass || process.env.SMTP_PASS || '').trim(),
    resendApiKey: String(local.resendApiKey || process.env.RESEND_API_KEY || '').trim(),
    fromEmail: String(local.fromEmail || process.env.SMTP_FROM || local.smtpUser || process.env.SMTP_USER || '').trim(),
  };

  // Fallback to Firestore app_config/email_otp_config if no local/env credentials
  if (!merged.smtpPass && !merged.resendApiKey) {
    const db = getAdminFirestoreSafe();
    if (db) {
      try {
        const snap = await db.collection('app_config').doc('email_otp_config').get();
        if (snap.exists) {
          const remote = (snap.data() || {}) as Partial<EmailOtpConfig>;
          merged = {
            ...merged,
            ...remote,
          };
          if (merged.smtpPass || merged.resendApiKey) {
            saveJsonData(EMAIL_CONFIG_FILE, merged);
          }
        }
      } catch {
        // Ignore if Firestore admin credentials are not configured in preview
      }
    }
  }

  return merged;
}

export async function saveEmailOtpConfig(updates: Partial<EmailOtpConfig>): Promise<EmailOtpConfig> {
  const current = await loadEmailOtpConfig();
  const nextProvider: EmailOtpProvider =
    updates.provider && ['gmail', 'smtp', 'resend'].includes(updates.provider)
      ? updates.provider
      : current.provider || 'gmail';

  let nextHost = String(updates.smtpHost ?? current.smtpHost ?? 'smtp.gmail.com').trim();
  let nextPort = Number(updates.smtpPort ?? current.smtpPort ?? 465) || 465;
  let nextSecure =
    typeof updates.smtpSecure === 'boolean' ? updates.smtpSecure : nextPort === 465;

  if (nextProvider === 'gmail') {
    nextHost = 'smtp.gmail.com';
    nextPort = 465;
    nextSecure = true;
  } else if (nextProvider === 'smtp' && !isSafeSmtpHost(nextHost)) {
    throw new Error('कृपया वैध सार्वजनिक SMTP Host प्रविष्ट करा (उदा. smtp.gmail.com किंवा smtp.zoho.in).');
  }

  const incomingPass = String(updates.smtpPass || '').trim();
  const incomingResend = String(updates.resendApiKey || '').trim();

  const nextUser = String(updates.smtpUser ?? current.smtpUser ?? '').trim();
  const nextFromEmail = String(updates.fromEmail ?? current.fromEmail ?? nextUser).trim();

  const updated: EmailOtpConfig = {
    ...current,
    provider: nextProvider,
    isEnabled: typeof updates.isEnabled === 'boolean' ? updates.isEnabled : true,
    smtpHost: nextHost,
    smtpPort: nextPort,
    smtpSecure: nextSecure,
    smtpUser: nextUser,
    smtpPass:
      incomingPass && !incomingPass.startsWith('••••')
        ? incomingPass.replace(/\s+/g, '') // Strip spaces from Gmail 16-char App Passwords automatically
        : current.smtpPass,
    resendApiKey:
      incomingResend && !incomingResend.startsWith('••••')
        ? incomingResend
        : current.resendApiKey,
    fromName: String(updates.fromName ?? current.fromName ?? 'वंजारी जोडी मॅट्रिमोनी').trim(),
    fromEmail: nextFromEmail || nextUser,
    updatedAt: new Date().toISOString(),
  };

  saveJsonData(EMAIL_CONFIG_FILE, updated);

  const db = getAdminFirestoreSafe();
  if (db) {
    try {
      await db.collection('app_config').doc('email_otp_config').set(updated, { merge: true });
    } catch {
      // Local JSON mirror already saved
    }
  }

  return updated;
}

export async function getPublicEmailOtpConfig() {
  const cfg = await loadEmailOtpConfig();
  const hasPassword = Boolean(cfg.smtpPass);
  const hasResendKey = Boolean(cfg.resendApiKey);
  const isConfigured =
    cfg.provider === 'resend'
      ? Boolean(hasResendKey && cfg.fromEmail)
      : Boolean(cfg.smtpUser && hasPassword);

  return {
    provider: cfg.provider,
    isEnabled: cfg.isEnabled,
    smtpHost: cfg.smtpHost,
    smtpPort: cfg.smtpPort,
    smtpSecure: cfg.smtpSecure,
    smtpUser: cfg.smtpUser,
    fromName: cfg.fromName,
    fromEmail: cfg.fromEmail,
    hasPassword,
    hasResendKey,
    isConfigured,
    smtpPass: hasPassword ? '••••••••••••••••' : '',
    resendApiKey: hasResendKey ? '••••••••••••••••' : '',
    updatedAt: cfg.updatedAt,
  };
}

export async function sendEmailOtp(
  toEmail: string,
  otpCode: string,
  purpose = 'verification'
): Promise<{ sent: boolean; provider: string; error?: string }> {
  const cleanEmail = String(toEmail || '').trim().toLowerCase();
  if (!isValidEmailAddress(cleanEmail)) {
    return {
      sent: false,
      provider: 'email',
      error: 'कृपया वैध ईमेल पत्ता (Email Address) प्रविष्ट करा.',
    };
  }

  const cfg = await loadEmailOtpConfig();
  const safeOtp = escapeHtml(otpCode);
  const safeFromName = escapeHtml(cfg.fromName || 'वंजारी जोडी मॅट्रिमोनी');

  const purposeTitleMr =
    purpose === 'forgot_password' || purpose === 'reset_mpin'
      ? 'MPIN / पासवर्ड रिसेट पडताळणी कोड'
      : purpose === 'test'
      ? 'लाईव्ह टेस्ट ईमेल OTP पडताळणी'
      : 'खाते पडताळणी व लॉगिन OTP कोड';

  const subject = `${otpCode} - वंजारी जोडी (Vanjari Jodi) ${purposeTitleMr}`;
  const textBody = [
    `नमस्कार,`,
    ``,
    `वंजारी जोडी मॅट्रिमोनी (Vanjari Jodi) साठी तुमचा ४-अंकी ईमेल पडताळणी कोड (OTP): ${otpCode}`,
    ``,
    `हा OTP पुढील ५ मिनिटांसाठी वैध आहे. कृपया हा कोड कोणाशीही शेअर करू नका.`,
    ``,
    `- ${cfg.fromName || 'वंजारी जोडी मॅट्रिमोनी'}`,
  ].join('\n');

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #fffbf2; border: 2px solid #f59e0b; border-radius: 18px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #800C1E, #A71930); padding: 22px 24px; text-align: center; color: #ffffff;">
        <div style="font-size: 12px; letter-spacing: 1px; color: #fde68a; font-weight: 700; text-transform: uppercase;">Vanjari Jodi Official Matrimony</div>
        <h1 style="margin: 6px 0 0; font-size: 20px; font-weight: 800;">${safeFromName}</h1>
      </div>
      <div style="padding: 26px 24px; color: #1e293b; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #800C1E;">${escapeHtml(purposeTitleMr)}</p>
        <p style="margin: 0 0 20px; font-size: 13px; color: #475569; line-height: 1.6;">
          तुमची ईमेल पडताळणी पूर्ण करण्यासाठी खालील <strong>४-अंकी OTP कोड</strong> ॲप किंवा वेबसाईटमध्ये टाका:
        </p>
        <div style="display: inline-block; background: #ffffff; border: 2px dashed #b45309; border-radius: 14px; padding: 14px 34px; margin: 6px 0 18px;">
          <span style="font-size: 34px; font-weight: 900; letter-spacing: 12px; color: #800C1E; font-family: monospace;">${safeOtp}</span>
        </div>
        <p style="margin: 0 0 10px; font-size: 12px; color: #64748b;">
          ⏱️ हा कोड <strong>५ मिनिटांसाठी</strong> वैध आहे. सुरक्षेसाठी हा कोड कोणाशीही शेअर करू नका.
        </p>
        <p style="margin: 14px 0 0; font-size: 11px; color: #94a3b8;">
          जर तुम्ही हा OTP मागवला नसेल, तर कृपया या ईमेलकडे दुर्लक्ष करा.
        </p>
      </div>
    </div>
  `;

  // Provider 1: Resend HTTP API
  if (cfg.provider === 'resend') {
    if (!cfg.resendApiKey) {
      return {
        sent: false,
        provider: 'resend',
        error: 'Email OTP सेटिंग्ज अपूर्ण आहेत: अ‍ॅडमिन पॅनेलमध्ये Resend API Key सेव्ह करा.',
      };
    }
    try {
      const fromAddress = cfg.fromEmail
        ? `${cfg.fromName || 'Vanjari Jodi'} <${cfg.fromEmail}>`
        : 'Vanjari Jodi <onboarding@resend.dev>';

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [cleanEmail],
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        return { sent: true, provider: 'resend' };
      }
      return {
        sent: false,
        provider: 'resend',
        error: data?.message || data?.error || `Resend Email HTTP ${resp.status}`,
      };
    } catch (err: any) {
      return {
        sent: false,
        provider: 'resend',
        error: err?.message || 'Resend ईमेल पाठवताना नेटवर्क त्रुटी आली.',
      };
    }
  }

  // Provider 2: Gmail App Password or Custom SMTP via Nodemailer
  const smtpUser = cfg.smtpUser.trim();
  const smtpPass = cfg.smtpPass.trim();
  const smtpHost = cfg.provider === 'gmail' ? 'smtp.gmail.com' : cfg.smtpHost.trim();
  const smtpPort = cfg.provider === 'gmail' ? 465 : Number(cfg.smtpPort || 465);
  const smtpSecure = cfg.provider === 'gmail' ? true : Boolean(cfg.smtpSecure);

  if (!smtpUser || !smtpPass) {
    return {
      sent: false,
      provider: cfg.provider,
      error:
        'ईमेल OTP सेटिंग्ज कॉन्फिगर केलेल्या नाहीत — अ‍ॅडमिन पॅनेलमधील "📧 ईमेल OTP गेटवे" मध्ये तुमचा Gmail ID व App Password सेव्ह करा.',
    };
  }

  if (!isSafeSmtpHost(smtpHost)) {
    return {
      sent: false,
      provider: cfg.provider,
      error: 'अवैध SMTP Host. कृपया अ‍ॅडमिन पॅनेलमध्ये वैध SMTP सर्व्हर तपासा.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 12000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const senderEmail = cfg.fromEmail || smtpUser;
    await transporter.sendMail({
      from: `"${cfg.fromName || 'वंजारी जोडी मॅट्रिमोनी'}" <${senderEmail}>`,
      to: cleanEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return { sent: true, provider: cfg.provider };
  } catch (err: any) {
    const rawMsg = String(err?.message || '');
    let friendlyErr = rawMsg || 'SMTP ईमेल सर्व्हर त्रुटी';
    if (rawMsg.includes('535') || rawMsg.toLowerCase().includes('invalid login') || rawMsg.toLowerCase().includes('username and password not accepted')) {
      friendlyErr =
        'Gmail/SMTP लॉगिन नाकारले गेले — कृपया सामान्य पासवर्डऐवजी Google Account मधून तयार केलेला १६-अक्षरी App Password टाका.';
    }
    return {
      sent: false,
      provider: cfg.provider,
      error: friendlyErr,
    };
  }
}
