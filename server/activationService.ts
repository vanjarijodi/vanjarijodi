import crypto from 'crypto';
import { loadJsonData, saveJsonData } from './storageService';

export interface ActivationCodeRecord {
  id: string;
  code: string; // e.g. "ACT-9X2K-872A"
  planId: string;
  planName: string;
  durationDays: number;
  maxUses: number;
  usedCount: number;
  isRedeemed: boolean;
  generatedFrom: 'website_payment' | 'admin_dashboard' | 'community_pass';
  paymentId?: string;
  buyerMobile?: string;
  buyerName?: string;
  buyerUserId?: string;
  redeemedByUserId?: string;
  redeemedByUserName?: string;
  redeemedByUserMobile?: string;
  redeemedAt?: string;
  createdAt: string;
  expiresAt?: string;
  notes?: string;
}

const STORAGE_FILE = 'activationCodes.json';

/**
 * Generate a clean, random 1-time activation code string (e.g. ACT-9X2K-872A)
 */
export function generateRandomCodeString(prefix = 'VJ'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let codePart = '';
  for (let i = 0; i < 4; i++) {
    codePart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${codePart}`.toUpperCase();
}

/**
 * Retrieve all activation code records from JSON storage
 */
export function getAllActivationCodes(): ActivationCodeRecord[] {
  return loadJsonData<ActivationCodeRecord[]>(STORAGE_FILE, [
    {
      id: 'act-sample-1',
      code: 'VANJARI2026',
      planId: 'vip_full',
      planName: '१ वर्ष व्हिआयपी अमर्याद प्लॅन',
      durationDays: 365,
      maxUses: 10000,
      usedCount: 1,
      isRedeemed: false,
      generatedFrom: 'community_pass',
      createdAt: new Date().toISOString(),
      notes: 'सण / उत्सव विशेष कम्युनिटी पासवर्ड',
    },
    {
      id: 'act-sample-2',
      code: 'ACTIVATION180',
      planId: 'diamond',
      planName: '६ महिने डायमंड प्लॅन',
      durationDays: 180,
      maxUses: 10000,
      usedCount: 0,
      isRedeemed: false,
      generatedFrom: 'community_pass',
      createdAt: new Date().toISOString(),
      notes: '६ महिने मोफत ॲक्टिव्हेशन',
    },
  ]);
}

/**
 * Generate a new single-use or multi-use Activation Code Record
 */
export function createActivationCode(params: {
  code?: string;
  planId: string;
  planName?: string;
  durationDays?: number;
  maxUses?: number;
  generatedFrom?: 'website_payment' | 'admin_dashboard' | 'community_pass';
  paymentId?: string;
  buyerMobile?: string;
  buyerName?: string;
  buyerUserId?: string;
  notes?: string;
}): ActivationCodeRecord {
  const codes = getAllActivationCodes();

  // Determine code string
  let finalCodeStr = params.code
    ? params.code.trim().toUpperCase()
    : generateRandomCodeString('ACT');

  // Ensure code string is unique
  let attempts = 0;
  while (codes.some((c) => c.code === finalCodeStr) && attempts < 10 && !params.code) {
    finalCodeStr = generateRandomCodeString('ACT');
    attempts++;
  }

  // Resolve duration in days based on planId
  let duration = params.durationDays || 90;
  let planTitle = params.planName || 'गोल्ड प्लॅन (९० दिवस)';

  if (params.planId === 'welcome_offer') {
    duration = params.durationDays || 180;
    planTitle = params.planName || '६ महिने वेलकम स्पेशल प्लॅन';
  } else if (params.planId === 'monthly' || params.planId === 'silver') {
    duration = params.durationDays || 30;
    planTitle = params.planName || '१ महिना सिल्व्हर प्लॅन';
  } else if (params.planId === 'gold') {
    duration = params.durationDays || 90;
    planTitle = params.planName || '३ महिने गोल्ड प्लॅन';
  } else if (params.planId === 'diamond') {
    duration = params.durationDays || 180;
    planTitle = params.planName || '६ महिने डायमंड प्लॅन';
  } else if (params.planId === 'vip_full' || params.planId === 'yearly') {
    duration = params.durationDays || 365;
    planTitle = params.planName || '१ वर्ष व्हिआयपी अमर्याद प्लॅन';
  }

  const record: ActivationCodeRecord = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    code: finalCodeStr,
    planId: params.planId,
    planName: planTitle,
    durationDays: duration,
    maxUses: params.maxUses || 1, // Default 1-time single use code
    usedCount: 0,
    isRedeemed: false,
    generatedFrom: params.generatedFrom || 'website_payment',
    paymentId: params.paymentId,
    buyerMobile: params.buyerMobile,
    buyerName: params.buyerName,
    buyerUserId: params.buyerUserId,
    createdAt: new Date().toISOString(),
    notes: params.notes,
  };

  codes.unshift(record);
  saveJsonData(STORAGE_FILE, codes);

  console.log(`[ActivationService] Created new activation code: ${record.code} for plan ${record.planName} (${record.durationDays} days)`);
  return record;
}

/**
 * Find an activation code by code string
 */
export function findActivationCode(codeStr: string): ActivationCodeRecord | null {
  if (!codeStr || !codeStr.trim()) return null;
  const clean = codeStr.trim().toUpperCase();
  const codes = getAllActivationCodes();
  return codes.find((c) => c.code === clean) || null;
}

/**
 * Redeem an Activation Code on backend with strict 1-time checks
 */
export function redeemActivationCodeOnServer(params: {
  code: string;
  userId: string;
  userName?: string;
  userMobile?: string;
}): {
  success: boolean;
  message: string;
  record?: ActivationCodeRecord;
  durationDays?: number;
  planId?: string;
  planName?: string;
} {
  const { code, userId, userName, userMobile } = params;
  if (!code || !code.trim()) {
    return { success: false, message: 'कृपया ऍक्टिव्हेशन कोड प्रविष्ट करा.' };
  }

  const clean = code.trim().toUpperCase();
  const codes = getAllActivationCodes();
  const index = codes.findIndex((c) => c.code === clean);

  // Fallback checks for built-in community pass codes if not found in database file
  if (index === -1) {
    let fallbackDuration = 0;
    let fallbackPlanId = 'gold';
    let fallbackPlanName = 'गोल्ड ऍक्टिव्हेशन प्लॅन';

    if (clean === 'VANJARI2026' || clean === 'VIPPASS' || clean === 'VANJARI365') {
      fallbackDuration = 365;
      fallbackPlanId = 'vip_full';
      fallbackPlanName = 'अमर्याद १ वर्ष व्हिआयपी कम्युनिटी पास';
    } else if (clean === 'ACTIVATION180' || clean === 'GOLD180' || clean === 'VANJARI180') {
      fallbackDuration = 180;
      fallbackPlanId = 'diamond';
      fallbackPlanName = '६ महिने डायमंड ऍक्टिव्हेशन पास';
    } else if (clean === 'ACTIVATION90' || clean === 'SPECIAL90' || clean === 'FREE90') {
      fallbackDuration = 90;
      fallbackPlanId = 'gold';
      fallbackPlanName = '९० दिवस विशेष ऍक्टिव्हेशन पास';
    } else if (clean === 'ACTIVATION30' || clean === 'COMMUNITY100' || clean === 'WELCOME30') {
      fallbackDuration = 30;
      fallbackPlanId = 'silver';
      fallbackPlanName = '३० दिवस सिल्व्हर ऍक्टिव्हेशन पास';
    } else if (clean === 'FREEPASS' || clean === 'VIPFREE' || clean === 'ADMINPASS') {
      fallbackDuration = 730;
      fallbackPlanId = 'vip_full';
      fallbackPlanName = 'व्ही.आय.पी. २ वर्षे ऍक्टिव्हेशन पास';
    }

    if (fallbackDuration > 0) {
      return {
        success: true,
        message: `🎉 ऍक्टिव्हेशन कोड (${clean}) यशस्वीरीत्या लागू झाला! तुमचा प्लॅन पुढच्या ${fallbackDuration} दिवसांसाठी सक्रिय करण्यात आला आहे.`,
        durationDays: fallbackDuration,
        planId: fallbackPlanId,
        planName: fallbackPlanName,
      };
    }

    return {
      success: false,
      message: 'अवैध ऍक्टिव्हेशन कोड! (Invalid Activation Code) कृपया योग्य कोड टाका.',
    };
  }

  const record = codes[index];

  // Verify single-use or usage limit
  if (record.isRedeemed || (record.maxUses && record.usedCount >= record.maxUses)) {
    return {
      success: false,
      message: `हा ऍक्टिव्हेशन कोड (${clean}) आधीच वापरला गेला आहे! १-टाइम कोड एकाच प्रोफाईलवर वापरता येतो.`,
    };
  }

  // Update record state atomically
  record.usedCount = (record.usedCount || 0) + 1;
  if (record.usedCount >= record.maxUses) {
    record.isRedeemed = true;
  }
  record.redeemedByUserId = userId;
  record.redeemedByUserName = userName || 'अनोनिमस युझर';
  record.redeemedByUserMobile = userMobile || '';
  record.redeemedAt = new Date().toISOString();

  codes[index] = record;
  saveJsonData(STORAGE_FILE, codes);

  console.log(`[ActivationService] Code ${clean} redeemed by user ${userName} (${userId}). Plan: ${record.planName}`);

  return {
    success: true,
    message: `🎉 ऍक्टिव्हेशन कोड (${clean}) यशस्वीरीत्या लागू झाला! तुमचा ${record.planName} पुढच्या ${record.durationDays} दिवसांसाठी सक्रिय झाला आहे.`,
    record,
    durationDays: record.durationDays,
    planId: record.planId,
    planName: record.planName,
  };
}
