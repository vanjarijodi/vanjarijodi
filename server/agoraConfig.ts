import fs from 'fs';
import path from 'path';

export interface AgoraServerConfig {
  enabled: boolean;
  appId: string;
  appCertificate: string;
  allowRegisteredOnly: boolean;
  adminDisplayName: string;
  updatedAt: string;

  // ⏰ Calling Operating Hours & Schedule (वेळ मर्यादा)
  scheduleEnabled: boolean;
  scheduleStartTime: string; // e.g. "10:00" (24hr format)
  scheduleEndTime: string;   // e.g. "20:00" (24hr format)
  scheduleDays: number[];    // 0 = Sun, 1 = Mon ... 6 = Sat
  offHoursMessage: string;

  // ⚡ Advanced Controls (भारी फीचर्स)
  adminStatus: 'online' | 'busy' | 'offline';
  dndUntil?: number | null;
  allowOnlyVerified: boolean;
  allowOnlyPaid: boolean;
  maxCallsPerDayPerUser: number;
}

const SECURE_AGORA_PATH = path.join(process.cwd(), 'server', 'secureAgoraConfig.json');

// User requested exact Agora App ID:
export const DEFAULT_AGORA_APP_ID = '0264722151804051ad63ea12fd164935';

let runtimeAgoraConfig: AgoraServerConfig = {
  enabled: true,
  appId: process.env.AGORA_APP_ID || DEFAULT_AGORA_APP_ID,
  appCertificate: process.env.AGORA_APP_CERTIFICATE || '',
  allowRegisteredOnly: true,
  adminDisplayName: 'वंजारी जोडी ॲडमिन सपोर्ट',
  updatedAt: new Date().toISOString(),

  // Calling Schedule Defaults (10:00 AM to 08:00 PM IST)
  scheduleEnabled: true,
  scheduleStartTime: '10:00',
  scheduleEndTime: '20:00',
  scheduleDays: [0, 1, 2, 3, 4, 5, 6],
  offHoursMessage: 'सध्या कॉलिंग वेळ संपली आहे. ऑडिओ कॉलिंग वेळ दररोज सकाळी १०:०० ते संध्याकाळी ०८:०० दरम्यान सुरू असते. कृपया वेळेत संपर्क साधा किंवा थेट व्हॉट्सॲप मेसेज पाठवा.',

  adminStatus: 'online',
  dndUntil: null,
  allowOnlyVerified: false,
  allowOnlyPaid: false,
  maxCallsPerDayPerUser: 5,
};

function loadPersistedAgoraConfig() {
  try {
    if (fs.existsSync(SECURE_AGORA_PATH)) {
      const raw = fs.readFileSync(SECURE_AGORA_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      runtimeAgoraConfig = {
        ...runtimeAgoraConfig,
        ...parsed,
        appId: (parsed.appId && parsed.appId.trim()) || process.env.AGORA_APP_ID || DEFAULT_AGORA_APP_ID,
        appCertificate: (parsed.appCertificate && parsed.appCertificate.trim()) || process.env.AGORA_APP_CERTIFICATE || runtimeAgoraConfig.appCertificate,
        scheduleEnabled: parsed.scheduleEnabled !== undefined ? Boolean(parsed.scheduleEnabled) : runtimeAgoraConfig.scheduleEnabled,
        scheduleStartTime: parsed.scheduleStartTime || runtimeAgoraConfig.scheduleStartTime,
        scheduleEndTime: parsed.scheduleEndTime || runtimeAgoraConfig.scheduleEndTime,
        scheduleDays: Array.isArray(parsed.scheduleDays) ? parsed.scheduleDays : runtimeAgoraConfig.scheduleDays,
        offHoursMessage: parsed.offHoursMessage || runtimeAgoraConfig.offHoursMessage,
        adminStatus: parsed.adminStatus || runtimeAgoraConfig.adminStatus,
        allowOnlyVerified: Boolean(parsed.allowOnlyVerified),
        allowOnlyPaid: Boolean(parsed.allowOnlyPaid),
        maxCallsPerDayPerUser: parsed.maxCallsPerDayPerUser || runtimeAgoraConfig.maxCallsPerDayPerUser,
      };
    }
  } catch (e) {
    console.warn('[AgoraConfig] Could not load persisted config:', e);
  }
}

loadPersistedAgoraConfig();

export function getAgoraServerConfig(): AgoraServerConfig {
  const effectiveAppId = runtimeAgoraConfig.appId?.trim() || process.env.AGORA_APP_ID || DEFAULT_AGORA_APP_ID;
  return {
    ...runtimeAgoraConfig,
    appId: effectiveAppId,
    appCertificate: runtimeAgoraConfig.appCertificate || process.env.AGORA_APP_CERTIFICATE || '',
  };
}

/**
 * Format 24-hr time string (e.g. "10:00", "20:30") to 12-hr readable string (e.g. "10:00 AM", "08:30 PM")
 */
export function formatTime12(timeStr: string): string {
  try {
    const [h, m] = (timeStr || '10:00').split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12 < 10 ? '0' : ''}${hour12}:${m < 10 ? '0' : ''}${m} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}

/**
 * Evaluate if the call engine is currently accessible based on Master toggle, Admin status, and Schedule.
 */
export function checkCallAvailability(): {
  available: boolean;
  status: 'online' | 'busy' | 'offline' | 'off_hours' | 'disabled';
  reason?: string;
  message: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
  scheduleStartTime12: string;
  scheduleEndTime12: string;
  isScheduleEnabled: boolean;
  nextAvailableTime?: string;
} {
  const config = getAgoraServerConfig();
  const startTime12 = formatTime12(config.scheduleStartTime || '10:00');
  const endTime12 = formatTime12(config.scheduleEndTime || '20:00');

  // 1. Master toggle check (बंद / चालू)
  if (!config.enabled) {
    return {
      available: false,
      status: 'disabled',
      reason: 'disabled',
      message: 'सध्या इन-ॲप ऑडिओ कॉलिंग सेवा प्रशासकाद्वारे तात्पुरती बंद करण्यात आली आहे. कृपया हेल्पलाइनवर संपर्क साधा.',
      scheduleStartTime: config.scheduleStartTime || '10:00',
      scheduleEndTime: config.scheduleEndTime || '20:00',
      scheduleStartTime12: startTime12,
      scheduleEndTime12: endTime12,
      isScheduleEnabled: Boolean(config.scheduleEnabled),
    };
  }

  // 2. Admin Presence Check
  if (config.adminStatus === 'offline') {
    return {
      available: false,
      status: 'offline',
      reason: 'offline',
      message: 'ॲडमिन सध्या ऑफलाईन आहेत. कृपया थेट व्हॉट्सॲपवर संपर्क साधा किंवा थोड्या वेळाने प्रयत्न करा.',
      scheduleStartTime: config.scheduleStartTime || '09:00',
      scheduleEndTime: config.scheduleEndTime || '22:00',
      scheduleStartTime12: startTime12,
      scheduleEndTime12: endTime12,
      isScheduleEnabled: Boolean(config.scheduleEnabled),
    };
  }

  // Admin is talking / busy: ALLOW CALL WAITING!
  if (config.adminStatus === 'busy') {
    return {
      available: true,
      status: 'busy',
      reason: 'busy_call_waiting',
      message: 'ॲडमिन सध्या दुसऱ्या महत्त्वाच्या कॉलवर बोलत आहेत. आपला कॉल वेटिंगवर (प्रतीक्षेत) जोडला जाईल.',
      scheduleStartTime: config.scheduleStartTime || '09:00',
      scheduleEndTime: config.scheduleEndTime || '22:00',
      scheduleStartTime12: startTime12,
      scheduleEndTime12: endTime12,
      isScheduleEnabled: Boolean(config.scheduleEnabled),
    };
  }

  // 3. DND Pause Check
  if (config.dndUntil && Date.now() < config.dndUntil) {
    const minsLeft = Math.ceil((config.dndUntil - Date.now()) / (60 * 1000));
    return {
      available: true,
      status: 'busy',
      reason: 'dnd_waiting',
      message: `ॲडमिन सध्या मिटींग/ब्रेकमध्ये आहेत (पुढील ${minsLeft} मिनिटे). आपला कॉल वेटिंगवर राहील.`,
      scheduleStartTime: config.scheduleStartTime || '09:00',
      scheduleEndTime: config.scheduleEndTime || '22:00',
      scheduleStartTime12: startTime12,
      scheduleEndTime12: endTime12,
      isScheduleEnabled: Boolean(config.scheduleEnabled),
    };
  }

  // 4. Operating Hours Schedule Check (वेळ मर्यादा)
  if (config.scheduleEnabled) {
    const now = new Date();
    // Convert to IST (Asia/Kolkata, UTC+5:30)
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 3600000 * 5.5);
    const currentH = istTime.getHours();
    const currentM = istTime.getMinutes();
    const currentDay = istTime.getDay(); // 0 is Sunday, 1 is Monday...
    const currentMinutes = currentH * 60 + currentM;

    const [startH, startM] = (config.scheduleStartTime || '10:00').split(':').map(Number);
    const [endH, endM] = (config.scheduleEndTime || '20:00').split(':').map(Number);
    const startMinutes = (startH || 10) * 60 + (startM || 0);
    const endMinutes = (endH || 20) * 60 + (endM || 0);

    const isDayAllowed = !config.scheduleDays || config.scheduleDays.length === 0 || config.scheduleDays.includes(currentDay);
    const isTimeAllowed = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

    if (!isDayAllowed || !isTimeAllowed) {
      return {
        available: false,
        status: 'off_hours',
        reason: 'off_hours',
        message: config.offHoursMessage || `सध्या कॉलिंग वेळ संपली आहे. कॉलिंग वेळ सकाळी ${startTime12} ते संध्याकाळी ${endTime12} दरम्यान सुरू असते.`,
        scheduleStartTime: config.scheduleStartTime || '10:00',
        scheduleEndTime: config.scheduleEndTime || '20:00',
        scheduleStartTime12: startTime12,
        scheduleEndTime12: endTime12,
        isScheduleEnabled: true,
        nextAvailableTime: `सकाळी ${startTime12}`,
      };
    }
  }

  return {
    available: true,
    status: 'online',
    message: `कॉलिंग सुरू आहे (वेळ: ${startTime12} ते ${endTime12})`,
    scheduleStartTime: config.scheduleStartTime || '10:00',
    scheduleEndTime: config.scheduleEndTime || '20:00',
    scheduleStartTime12: startTime12,
    scheduleEndTime12: endTime12,
    isScheduleEnabled: Boolean(config.scheduleEnabled),
  };
}

export function getAgoraPublicConfig() {
  const current = getAgoraServerConfig();
  const availability = checkCallAvailability();
  const effectiveAppId = current.appId?.trim() || DEFAULT_AGORA_APP_ID;

  return {
    enabled: current.enabled !== false,
    appId: effectiveAppId,
    allowRegisteredOnly: current.allowRegisteredOnly,
    adminDisplayName: current.adminDisplayName || 'वंजारी जोडी ॲडमिन सपोर्ट',

    // Schedule & Status for callers
    scheduleEnabled: Boolean(current.scheduleEnabled),
    scheduleStartTime: current.scheduleStartTime || '10:00',
    scheduleEndTime: current.scheduleEndTime || '20:00',
    scheduleStartTime12: formatTime12(current.scheduleStartTime || '10:00'),
    scheduleEndTime12: formatTime12(current.scheduleEndTime || '20:00'),
    isAvailableNow: availability.available,
    availabilityStatus: availability.status,
    availabilityMessage: availability.message,
    nextAvailableTime: availability.nextAvailableTime,

    // Access controls
    allowOnlyVerified: Boolean(current.allowOnlyVerified),
    allowOnlyPaid: Boolean(current.allowOnlyPaid),
    adminStatus: current.adminStatus || 'online',
  };
}

export function getAgoraAdminConfig() {
  const current = getAgoraServerConfig();
  const availability = checkCallAvailability();
  const hasCert = Boolean(current.appCertificate && current.appCertificate.trim().length > 0);

  return {
    ...current,
    hasAppCertificate: hasCert,
    appCertificateMasked: hasCert ? '••••••••••••••••' : '',
    availability,
  };
}

export function updateAgoraServerConfig(updates: Partial<AgoraServerConfig>): { success: boolean; error?: string } {
  try {
    if (updates.appId !== undefined) {
      runtimeAgoraConfig.appId = String(updates.appId).replace(/['"\s]/g, '').trim() || DEFAULT_AGORA_APP_ID;
    }

    if (updates.appCertificate !== undefined) {
      const cert = String(updates.appCertificate).replace(/['"\s]/g, '').trim();
      if (!cert.includes('••••')) {
        runtimeAgoraConfig.appCertificate = cert;
      }
    }

    if (updates.enabled !== undefined) {
      runtimeAgoraConfig.enabled = Boolean(updates.enabled);
      if (runtimeAgoraConfig.enabled) {
        if (!updates.adminStatus) {
          runtimeAgoraConfig.adminStatus = 'online';
        }
        runtimeAgoraConfig.dndUntil = null;
      }
    }

    if (updates.allowRegisteredOnly !== undefined) {
      runtimeAgoraConfig.allowRegisteredOnly = Boolean(updates.allowRegisteredOnly);
    }

    if (updates.adminDisplayName !== undefined) {
      runtimeAgoraConfig.adminDisplayName = String(updates.adminDisplayName).trim();
    }

    // Schedule updates
    if (updates.scheduleEnabled !== undefined) {
      runtimeAgoraConfig.scheduleEnabled = Boolean(updates.scheduleEnabled);
    }

    if (updates.scheduleStartTime !== undefined) {
      runtimeAgoraConfig.scheduleStartTime = String(updates.scheduleStartTime).trim();
    }

    if (updates.scheduleEndTime !== undefined) {
      runtimeAgoraConfig.scheduleEndTime = String(updates.scheduleEndTime).trim();
    }

    if (updates.scheduleDays !== undefined && Array.isArray(updates.scheduleDays)) {
      runtimeAgoraConfig.scheduleDays = updates.scheduleDays;
    }

    if (updates.offHoursMessage !== undefined) {
      runtimeAgoraConfig.offHoursMessage = String(updates.offHoursMessage).trim();
    }

    // Admin presence & access rules
    if (updates.adminStatus !== undefined && ['online', 'busy', 'offline'].includes(updates.adminStatus)) {
      runtimeAgoraConfig.adminStatus = updates.adminStatus;
    }

    if (updates.dndUntil !== undefined) {
      runtimeAgoraConfig.dndUntil = updates.dndUntil;
    }

    if (updates.allowOnlyVerified !== undefined) {
      runtimeAgoraConfig.allowOnlyVerified = Boolean(updates.allowOnlyVerified);
    }

    if (updates.allowOnlyPaid !== undefined) {
      runtimeAgoraConfig.allowOnlyPaid = Boolean(updates.allowOnlyPaid);
    }

    if (updates.maxCallsPerDayPerUser !== undefined) {
      runtimeAgoraConfig.maxCallsPerDayPerUser = Number(updates.maxCallsPerDayPerUser) || 5;
    }

    runtimeAgoraConfig.updatedAt = new Date().toISOString();

    // Persist to secure server file
    try {
      const dir = path.dirname(SECURE_AGORA_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SECURE_AGORA_PATH, JSON.stringify(runtimeAgoraConfig, null, 2), { mode: 0o600 });
    } catch (saveErr) {
      console.warn('[AgoraConfig] Could not write to disk:', saveErr);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update Agora config' };
  }
}
