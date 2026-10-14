import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ override: true });

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
  env: ((process.env.RAZORPAY_ENV || 'TEST').toUpperCase() === 'LIVE' ? 'LIVE' : 'TEST') as 'TEST' | 'LIVE',
  keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '',
  secretKey: process.env.RAZORPAY_KEY_SECRET || '',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  currency: 'INR',
  displayName: 'वंजारी जोडी (Vanjari Jodi Matrimony)',
  successMessage: 'पेमेंट यशस्वीरित्या पूर्ण झाले! आपली मेंबरशिप तात्काळ सक्रिय करण्यात आली आहे.',
  failureMessage: 'पेमेंट पूर्ण होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.',
  updatedAt: new Date().toISOString(),
};

function cleanStringVal(val?: string): string {
  if (!val) return '';
  return String(val).replace(/['"\r\n]/g, '').trim();
}

function isCleanRazorpayKeyId(val?: string): boolean {
  if (!val) return false;
  const cleaned = cleanStringVal(val);
  // Exclude known expired key
  if (cleaned === 'rzp_test_TjuIRO7jGY8SMC') return false;
  return /^rzp_(test|live)_[a-zA-Z0-9]+$/.test(cleaned);
}

function isCleanRazorpaySecret(val?: string): boolean {
  if (!val) return false;
  const cleaned = cleanStringVal(val);
  // Exclude known expired secret or masked secrets
  if (cleaned === 'UNSfIrF5j8vGPPOuIVtdq0qa' || cleaned.includes('••••')) return false;
  return cleaned.length >= 8;
}

// Load saved config if present on disk
function loadPersistedConfig() {
  try {
    if (fs.existsSync(SECURE_CONFIG_PATH)) {
      const raw = fs.readFileSync(SECURE_CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      
      const envKeyId = cleanStringVal(process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID);
      const parsedKeyId = cleanStringVal(parsed.keyId);
      
      const keyId = isCleanRazorpayKeyId(parsedKeyId)
        ? parsedKeyId
        : (isCleanRazorpayKeyId(envKeyId) ? envKeyId : (isCleanRazorpayKeyId(runtimeConfig.keyId) ? runtimeConfig.keyId : 'rzp_test_Tjv2KmibmntmMX'));

      const parsedSecret = cleanStringVal(parsed.secretKey);
      const envSecret = cleanStringVal(process.env.RAZORPAY_KEY_SECRET);
      const secretKey = isCleanRazorpaySecret(parsedSecret)
        ? parsedSecret
        : (isCleanRazorpaySecret(envSecret) ? envSecret : (isCleanRazorpaySecret(runtimeConfig.secretKey) ? runtimeConfig.secretKey : 'aWonN1l3mdRKgYVUJx0L60Cr'));

      let envMode: 'TEST' | 'LIVE' = 'TEST';
      if (keyId.startsWith('rzp_live_')) {
        envMode = 'LIVE';
      } else if (keyId.startsWith('rzp_test_')) {
        envMode = 'TEST';
      } else {
        envMode = ((process.env.RAZORPAY_ENV || parsed.env || 'TEST').toUpperCase() === 'LIVE' ? 'LIVE' : 'TEST');
      }

      runtimeConfig = {
        ...runtimeConfig,
        ...parsed,
        keyId,
        secretKey,
        webhookSecret: cleanStringVal(process.env.RAZORPAY_WEBHOOK_SECRET) || cleanStringVal(parsed.webhookSecret) || runtimeConfig.webhookSecret,
        env: envMode,
      };
    }
  } catch (err) {
    console.warn('[RazorpayConfig] Failed to load persisted secure config:', err);
  }
}

loadPersistedConfig();

export function getRazorpayServerConfig(): RazorpayServerConfig {
  const parsedKey = isCleanRazorpayKeyId(runtimeConfig.keyId) ? runtimeConfig.keyId : '';
  const envKeyId = cleanStringVal(process.env.RAZORPAY_KEY_ID);
  const keyId = parsedKey || (isCleanRazorpayKeyId(envKeyId) ? envKeyId : 'rzp_test_Tjv2KmibmntmMX');

  const parsedSecret = isCleanRazorpaySecret(runtimeConfig.secretKey) ? runtimeConfig.secretKey : '';
  const envSecret = cleanStringVal(process.env.RAZORPAY_KEY_SECRET);
  const secretKey = parsedSecret || (isCleanRazorpaySecret(envSecret) ? envSecret : 'aWonN1l3mdRKgYVUJx0L60Cr');

  let envMode: 'TEST' | 'LIVE' = runtimeConfig.env;
  if (keyId.startsWith('rzp_live_')) {
    envMode = 'LIVE';
  } else if (keyId.startsWith('rzp_test_')) {
    envMode = 'TEST';
  }

  return {
    ...runtimeConfig,
    keyId,
    secretKey,
    webhookSecret: cleanStringVal(process.env.RAZORPAY_WEBHOOK_SECRET) || runtimeConfig.webhookSecret,
    env: envMode,
  };
}

/**
 * Public configuration safe for frontend clients.
 * NEVER returns secretKey or webhookSecret.
 */
export function getRazorpayPublicConfig() {
  const current = getRazorpayServerConfig();
  return {
    enabled: current.enabled,
    env: current.env,
    keyId: current.keyId,
    currency: current.currency || 'INR',
    displayName: current.displayName,
    successMessage: current.successMessage,
    failureMessage: current.failureMessage,
  };
}

/**
 * Validates mode vs key prefix matching
 */
export function validateRazorpayModeKey(env: 'TEST' | 'LIVE', keyId: string): { valid: boolean; error?: string } {
  if (!keyId || !keyId.trim()) {
    return { valid: false, error: 'Razorpay is not configured. Please contact administrator.' };
  }
  const cleanKey = keyId.trim();
  if (env === 'TEST' && !cleanKey.startsWith('rzp_test_')) {
    return { valid: false, error: 'Key ID prefix mismatch: Environment is set to TEST, but Key ID does not start with "rzp_test_".' };
  }
  if (env === 'LIVE' && !cleanKey.startsWith('rzp_live_')) {
    return { valid: false, error: 'Key ID prefix mismatch: Environment is set to LIVE, but Key ID does not start with "rzp_live_".' };
  }
  return { valid: true };
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
      const trimmedKey = String(updates.keyId).replace(/['"]/g, '').trim();
      if (trimmedKey) {
        runtimeConfig.keyId = trimmedKey;
        if (trimmedKey.startsWith('rzp_live_')) {
          runtimeConfig.env = 'LIVE';
        } else if (trimmedKey.startsWith('rzp_test_')) {
          runtimeConfig.env = 'TEST';
        }
      }
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

    // Instantly sync active process.env for real-time order creation without restarting server
    process.env.RAZORPAY_KEY_ID = runtimeConfig.keyId;
    process.env.VITE_RAZORPAY_KEY_ID = runtimeConfig.keyId;
    process.env.RAZORPAY_KEY_SECRET = runtimeConfig.secretKey;
    process.env.RAZORPAY_ENV = runtimeConfig.env;

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

    // Also persist to .env for system compatibility
    try {
      const envPath = path.join(process.cwd(), '.env');
      const envLines = [
        `RAZORPAY_KEY_ID=${runtimeConfig.keyId}`,
        `RAZORPAY_KEY_SECRET=${runtimeConfig.secretKey}`,
        `VITE_RAZORPAY_KEY_ID=${runtimeConfig.keyId}`,
        `RAZORPAY_ENV=${runtimeConfig.env}`,
      ].join('\n') + '\n';
      fs.writeFileSync(envPath, envLines, 'utf-8');
    } catch (envErr) {
      console.warn('[RazorpayConfig] Could not sync .env file:', envErr);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update Razorpay configuration' };
  }
}
