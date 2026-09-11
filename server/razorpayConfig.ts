import fs from 'fs';
import path from 'path';

export interface RazorpayServerConfig {
  enabled: boolean;
  env: 'TEST' | 'LIVE';
  keyId: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  displayName: string;
  successMessage: string;
  failureMessage: string;
  updatedAt: string;
}

const SECURE_CONFIG_PATH = path.join(process.cwd(), 'server', 'securePaymentConfig.json');

// Default initial config with environment variable fallbacks
let runtimeConfig: RazorpayServerConfig = {
  enabled: true,
  env: (process.env.RAZORPAY_ENV === 'LIVE' ? 'LIVE' : 'TEST') as 'TEST' | 'LIVE',
  keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_VanjariJodiPay',
  secretKey: process.env.RAZORPAY_KEY_SECRET || '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  currency: 'INR',
  displayName: 'Vanjari Jodi Matrimony',
  successMessage: 'पेमेंट यशस्वीरित्या पूर्ण झाले! आपली मेंबरशिप तात्काळ सक्रिय करण्यात आली आहे.',
  failureMessage: 'पेमेंट पूर्ण होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.',
  updatedAt: new Date().toISOString(),
};

// Load saved config if present on disk
function loadPersistedConfig() {
  try {
    if (fs.existsSync(SECURE_CONFIG_PATH)) {
      const raw = fs.readFileSync(SECURE_CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      runtimeConfig = {
        ...runtimeConfig,
        ...parsed,
        // Environment variables override if explicitly set
        keyId: process.env.RAZORPAY_KEY_ID || parsed.keyId || runtimeConfig.keyId,
        secretKey: process.env.RAZORPAY_KEY_SECRET || parsed.secretKey || runtimeConfig.secretKey,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || parsed.webhookSecret || runtimeConfig.webhookSecret,
        env: (process.env.RAZORPAY_ENV || parsed.env || runtimeConfig.env) as 'TEST' | 'LIVE',
      };
    }
  } catch (err) {
    console.warn('[RazorpayConfig] Failed to load persisted secure config:', err);
  }
}

loadPersistedConfig();

export function getRazorpayServerConfig(): RazorpayServerConfig {
  return runtimeConfig;
}

/**
 * Public configuration safe for frontend clients.
 * NEVER returns secretKey or webhookSecret.
 */
export function getRazorpayPublicConfig() {
  return {
    enabled: runtimeConfig.enabled,
    env: runtimeConfig.env,
    keyId: runtimeConfig.keyId,
    currency: runtimeConfig.currency || 'INR',
    displayName: runtimeConfig.displayName,
    successMessage: runtimeConfig.successMessage,
    failureMessage: runtimeConfig.failureMessage,
  };
}

/**
 * Super Admin configuration with fully masked secret key.
 * Never exposes plaintext secret key to UI.
 */
export function getRazorpayAdminConfig() {
  const hasSecret = Boolean(runtimeConfig.secretKey && runtimeConfig.secretKey.trim().length > 0);
  return {
    enabled: runtimeConfig.enabled,
    env: runtimeConfig.env,
    keyId: runtimeConfig.keyId,
    hasSecretKey: hasSecret,
    secretKeyMasked: hasSecret ? '••••••••••••••••' : '',
    hasWebhookSecret: Boolean(runtimeConfig.webhookSecret),
    currency: runtimeConfig.currency || 'INR',
    displayName: runtimeConfig.displayName,
    successMessage: runtimeConfig.successMessage,
    failureMessage: runtimeConfig.failureMessage,
    updatedAt: runtimeConfig.updatedAt,
  };
}

/**
 * Updates Razorpay settings securely.
 * Saves to server/securePaymentConfig.json.
 */
export function updateRazorpayServerConfig(updates: Partial<RazorpayServerConfig>): { success: boolean; error?: string } {
  try {
    if (updates.env && !['TEST', 'LIVE'].includes(updates.env)) {
      return { success: false, error: 'Environment must be TEST or LIVE' };
    }

    // Key ID validation if provided
    if (updates.keyId !== undefined) {
      const trimmedKey = updates.keyId.trim();
      if (trimmedKey && !trimmedKey.startsWith('rzp_test_') && !trimmedKey.startsWith('rzp_live_')) {
        return { success: false, error: 'Razorpay Key ID must start with rzp_test_ or rzp_live_' };
      }
      runtimeConfig.keyId = trimmedKey;
    }

    // Secret Key validation: only update if non-empty and not masked
    if (updates.secretKey !== undefined) {
      const trimmedSecret = updates.secretKey.trim();
      if (trimmedSecret && !trimmedSecret.includes('••••')) {
        runtimeConfig.secretKey = trimmedSecret;
      }
    }

    if (updates.webhookSecret !== undefined) {
      const trimmedWs = updates.webhookSecret.trim();
      if (trimmedWs && !trimmedWs.includes('••••')) {
        runtimeConfig.webhookSecret = trimmedWs;
      }
    }

    if (updates.enabled !== undefined) runtimeConfig.enabled = Boolean(updates.enabled);
    if (updates.env !== undefined) runtimeConfig.env = updates.env;
    if (updates.currency !== undefined) runtimeConfig.currency = updates.currency.trim().toUpperCase() || 'INR';
    if (updates.displayName !== undefined) runtimeConfig.displayName = updates.displayName.trim();
    if (updates.successMessage !== undefined) runtimeConfig.successMessage = updates.successMessage.trim();
    if (updates.failureMessage !== undefined) runtimeConfig.failureMessage = updates.failureMessage.trim();

    runtimeConfig.updatedAt = new Date().toISOString();

    // Persist to secure server file
    try {
      const secureDir = path.dirname(SECURE_CONFIG_PATH);
      if (!fs.existsSync(secureDir)) {
        fs.mkdirSync(secureDir, { recursive: true });
      }
      fs.writeFileSync(SECURE_CONFIG_PATH, JSON.stringify(runtimeConfig, null, 2), { mode: 0o600 });
    } catch (persistErr) {
      console.warn('[RazorpayConfig] Note: could not write to disk, config kept in memory:', persistErr);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update Razorpay configuration' };
  }
}
