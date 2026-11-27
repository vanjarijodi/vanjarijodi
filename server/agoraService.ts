import fs from 'fs';
import path from 'path';
import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { getAgoraServerConfig, checkCallAvailability, updateAgoraServerConfig } from './agoraConfig.ts';

export interface AdminCallDevice {
  fcmToken: string;
  deviceName: string;
  platform?: string;
  registeredAt: string;
  lastSeenAt: string;
}

export interface AdminCallSettings {
  callSupportEnabled: boolean;
  dndMode: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  busyAutoReplyMessage: string;
  ringtoneType: 'classic' | 'whatsapp_style' | 'soft_bell';
  vibrationEnabled: boolean;
  maxCallDurationMinutes: number;
  updatedAt: string;
}

const ADMIN_DEVICES_PATH = path.join(process.cwd(), 'server', 'adminCallDevices.json');
const ADMIN_CALL_SETTINGS_PATH = path.join(process.cwd(), 'server', 'adminCallSettings.json');

let adminCallDevices: AdminCallDevice[] = [];
let adminCallSettings: AdminCallSettings = {
  callSupportEnabled: true,
  dndMode: false,
  workingHoursStart: '09:00',
  workingHoursEnd: '21:00',
  busyAutoReplyMessage:
    'नमस्कार! सध्या वंजारी जोडी ॲडमिन कॉल सपोर्ट व्यस्त (DND) आहे किंवा कामाची वेळ (सकाळी ०९:०० ते रात्री ०९:००) संपली आहे. कृपया थोड्या वेळाने कॉल करा किंवा थेट WhatsApp वर मेसेज पाठवा.',
  ringtoneType: 'whatsapp_style',
  vibrationEnabled: true,
  maxCallDurationMinutes: 10,
  updatedAt: new Date().toISOString(),
};

function loadAdminCallDevicesAndSettings() {
  try {
    if (fs.existsSync(ADMIN_DEVICES_PATH)) {
      const raw = fs.readFileSync(ADMIN_DEVICES_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        adminCallDevices = parsed;
      }
    }
  } catch (e) {
    console.warn('[AgoraService] Could not load adminCallDevices.json:', e);
  }

  try {
    if (fs.existsSync(ADMIN_CALL_SETTINGS_PATH)) {
      const raw = fs.readFileSync(ADMIN_CALL_SETTINGS_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      adminCallSettings = {
        ...adminCallSettings,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn('[AgoraService] Could not load adminCallSettings.json:', e);
  }
}

function persistAdminCallDevices() {
  try {
    const dir = path.dirname(ADMIN_DEVICES_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ADMIN_DEVICES_PATH, JSON.stringify(adminCallDevices, null, 2), { mode: 0o600 });
  } catch (e) {
    console.warn('[AgoraService] Failed to persist adminCallDevices.json:', e);
  }

  try {
    const db = getFirestore();
    db.doc('app_config/admin_call_devices')
      .set({ devices: adminCallDevices, updatedAt: new Date().toISOString() }, { merge: true })
      .catch(() => {});
  } catch {}
}

function persistAdminCallSettings() {
  try {
    const dir = path.dirname(ADMIN_CALL_SETTINGS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ADMIN_CALL_SETTINGS_PATH, JSON.stringify(adminCallSettings, null, 2), { mode: 0o600 });
  } catch (e) {
    console.warn('[AgoraService] Failed to persist adminCallSettings.json:', e);
  }

  try {
    const db = getFirestore();
    db.doc('app_config/admin_call_settings')
      .set({ ...adminCallSettings }, { merge: true })
      .catch(() => {});
  } catch {}
}

loadAdminCallDevicesAndSettings();

export function getAdminCallDevices(): AdminCallDevice[] {
  return adminCallDevices;
}

export function registerAdminCallDevice(params: {
  fcmToken: string;
  deviceName?: string;
  platform?: string;
}): { success: boolean; devices: AdminCallDevice[] } {
  const cleanToken = String(params.fcmToken || '').trim();
  if (!cleanToken) {
    return { success: false, devices: adminCallDevices };
  }

  const nowIso = new Date().toISOString();
  const cleanName = String(params.deviceName || 'Admin Android Phone').trim();
  const existingIdx = adminCallDevices.findIndex((d) => d.fcmToken === cleanToken);

  if (existingIdx !== -1) {
    adminCallDevices[existingIdx] = {
      ...adminCallDevices[existingIdx],
      deviceName: cleanName || adminCallDevices[existingIdx].deviceName,
      platform: params.platform || adminCallDevices[existingIdx].platform || 'android',
      lastSeenAt: nowIso,
    };
  } else {
    adminCallDevices.unshift({
      fcmToken: cleanToken,
      deviceName: cleanName,
      platform: params.platform || 'android',
      registeredAt: nowIso,
      lastSeenAt: nowIso,
    });
  }

  // Keep up to 25 registered admin devices
  adminCallDevices = adminCallDevices.slice(0, 25);
  persistAdminCallDevices();
  return { success: true, devices: adminCallDevices };
}

export function removeAdminCallDevice(fcmToken: string): { success: boolean; devices: AdminCallDevice[] } {
  adminCallDevices = adminCallDevices.filter((d) => d.fcmToken !== fcmToken);
  persistAdminCallDevices();
  return { success: true, devices: adminCallDevices };
}

export function getAdminCallSettings(): AdminCallSettings {
  return { ...adminCallSettings };
}

export function updateAdminCallSettings(updates: Partial<AdminCallSettings>): AdminCallSettings {
  adminCallSettings = {
    ...adminCallSettings,
    ...(updates.callSupportEnabled !== undefined ? { callSupportEnabled: Boolean(updates.callSupportEnabled) } : {}),
    ...(updates.dndMode !== undefined ? { dndMode: Boolean(updates.dndMode) } : {}),
    ...(updates.workingHoursStart !== undefined ? { workingHoursStart: String(updates.workingHoursStart).trim() || '09:00' } : {}),
    ...(updates.workingHoursEnd !== undefined ? { workingHoursEnd: String(updates.workingHoursEnd).trim() || '21:00' } : {}),
    ...(updates.busyAutoReplyMessage !== undefined
      ? { busyAutoReplyMessage: String(updates.busyAutoReplyMessage).trim() || adminCallSettings.busyAutoReplyMessage }
      : {}),
    ...(updates.ringtoneType !== undefined &&
    ['classic', 'whatsapp_style', 'soft_bell'].includes(updates.ringtoneType)
      ? { ringtoneType: updates.ringtoneType }
      : {}),
    ...(updates.vibrationEnabled !== undefined ? { vibrationEnabled: Boolean(updates.vibrationEnabled) } : {}),
    ...(updates.maxCallDurationMinutes !== undefined
      ? { maxCallDurationMinutes: Math.max(1, Number(updates.maxCallDurationMinutes) || 10) }
      : {}),
    updatedAt: new Date().toISOString(),
  };

  persistAdminCallSettings();

  // Keep primary Agora config synchronized
  updateAgoraServerConfig({
    enabled: adminCallSettings.callSupportEnabled,
    scheduleStartTime: adminCallSettings.workingHoursStart,
    scheduleEndTime: adminCallSettings.workingHoursEnd,
    offHoursMessage: adminCallSettings.busyAutoReplyMessage,
    adminStatus: adminCallSettings.dndMode ? 'offline' : 'online',
  });

  return { ...adminCallSettings };
}

/**
 * Dispatch High-Priority FCM Data + Notification Push to all registered Admin devices
 */
export async function dispatchHighPriorityAdminCallPush(call: ActiveCallSession): Promise<{
  sentCount: number;
  totalTokens: number;
}> {
  // Also sync active call to Firestore app_config/admin_active_call for real-time listeners
  try {
    const db = getFirestore();
    db.doc('app_config/admin_active_call')
      .set(
        {
          ...call,
          ringtoneType: adminCallSettings.ringtoneType,
          vibrationEnabled: adminCallSettings.vibrationEnabled,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
      .catch(() => {});
  } catch {}

  const tokens = adminCallDevices
    .map((d) => d.fcmToken)
    .filter((t) => Boolean(t && !t.startsWith('local_browser_')));

  if (tokens.length === 0) {
    return { sentCount: 0, totalTokens: 0 };
  }

  try {
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: `📞 इनकमिंग कॉल: ${call.callerName}`,
        body: `प्रोफाईल ID: ${call.callerId} • मोबाईल: ${call.callerMobile || 'N/A'} (${call.callerDistrict || 'महाराष्ट्र'})`,
      },
      data: {
        type: 'admin_incoming_call',
        callType: 'audio',
        callId: String(call.callId),
        channelName: String(call.channelName),
        callerId: String(call.callerId),
        callerName: String(call.callerName),
        callerMobile: String(call.callerMobile || ''),
        callerPhoto: String(call.callerPhoto || ''),
        callerDistrict: String(call.callerDistrict || ''),
        ringtoneType: String(adminCallSettings.ringtoneType),
        vibrationEnabled: String(adminCallSettings.vibrationEnabled),
        initiatedAt: String(call.initiatedAt),
        url: '/admin?incomingCall=true',
      },
      android: {
        priority: 'high',
        ttl: 30000,
        notification: {
          channelId: 'admin_incoming_calls',
          sound: 'default',
          defaultVibrateTimings: true,
          priority: 'max',
          visibility: 'public',
        },
      },
    });
    return { sentCount: response.successCount, totalTokens: tokens.length };
  } catch (err) {
    console.warn('[AgoraService] High-priority FCM push dispatch notice:', err);
    return { sentCount: 0, totalTokens: tokens.length };
  }
}

export interface ActiveCallSession {
  callId: string;
  channelName: string;
  callerId: string;
  callerName: string;
  callerMobile?: string;
  callerPhoto?: string;
  callerDistrict?: string;
  callerCity?: string;
  callerAge?: number | string;
  callerGender?: string;
  callerEducation?: string;
  callerTier?: string;
  status: 'ringing' | 'waiting' | 'connected' | 'rejected' | 'ended' | 'missed';
  isWaiting?: boolean;
  waitingOrder?: number;
  adminAcknowledgedWaiting?: boolean;
  activeCallerName?: string; // Caller name of the call admin is currently talking to
  initiatedAt: number;
  connectedAt?: number;
  endedAt?: number;
}

export interface HistoricalCallLog {
  callId: string;
  callerId: string;
  callerName: string;
  callerMobile?: string;
  callerPhoto?: string;
  callerDistrict?: string;
  callerCity?: string;
  callerAge?: number | string;
  callerGender?: string;
  callerEducation?: string;
  callerTier?: string;
  status: 'connected' | 'missed' | 'rejected' | 'ended' | 'off_hours_blocked' | 'waiting';
  duration: number; // Duration in seconds
  initiatedAt: number;
  connectedAt?: number;
  endedAt?: number;
  adminNotes?: string;
  isRead: boolean;
}

// In-memory active calls map
const activeCalls = new Map<string, ActiveCallSession>();

// Persistent Call History Logs
const CALL_LOGS_PATH = path.join(process.cwd(), 'server', 'callLogs.json');
let historicalCallLogs: HistoricalCallLog[] = [];

function loadPersistedCallLogs() {
  try {
    if (fs.existsSync(CALL_LOGS_PATH)) {
      const raw = fs.readFileSync(CALL_LOGS_PATH, 'utf-8');
      historicalCallLogs = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[AgoraService] Could not load persisted call logs:', e);
    historicalCallLogs = [];
  }
}

function persistCallLogs() {
  try {
    const dir = path.dirname(CALL_LOGS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Keep last 300 call logs
    const trimmed = historicalCallLogs.slice(0, 300);
    fs.writeFileSync(CALL_LOGS_PATH, JSON.stringify(trimmed, null, 2), { mode: 0o600 });
  } catch (e) {
    console.warn('[AgoraService] Could not persist call logs:', e);
  }
}

loadPersistedCallLogs();

// Cleanup old active calls and mark missed calls every 10 seconds
setInterval(() => {
  const now = Date.now();
  for (const [callId, call] of activeCalls.entries()) {
    // If ringing for more than 45 seconds without response, mark as missed
    if (call.status === 'ringing' && now - call.initiatedAt > 45000) {
      call.status = 'missed';
      call.endedAt = now;
      updateHistoricalLog(callId, { status: 'missed', endedAt: now, duration: 0 });
    }
    // If waiting in queue for more than 3 minutes without pickup, mark as missed
    if (call.status === 'waiting' && now - call.initiatedAt > 180000) {
      call.status = 'missed';
      call.endedAt = now;
      updateHistoricalLog(callId, { status: 'missed', endedAt: now, duration: 0, adminNotes: 'कॉल वेटिंग कालबाह्य (प्रतीक्षा वेळ संपली)' });
    }
    // Remove calls ended or missed more than 5 minutes ago from active memory
    if ((call.status === 'ended' || call.status === 'rejected' || call.status === 'missed') && call.endedAt && now - call.endedAt > 300000) {
      activeCalls.delete(callId);
    }
  }
}, 10000);

function updateHistoricalLog(callId: string, updates: Partial<HistoricalCallLog>) {
  const idx = historicalCallLogs.findIndex((c) => c.callId === callId);
  if (idx !== -1) {
    historicalCallLogs[idx] = { ...historicalCallLogs[idx], ...updates };
    persistCallLogs();
  }
}

/**
 * Generate Agora RTC token if appCertificate is set, or return empty/null if in App ID only mode.
 */
export function generateAgoraToken(channelName: string, uid: number | string): string | null {
  const config = getAgoraServerConfig();
  if (!config.appId || !config.appCertificate) {
    return null;
  }

  try {
    const expireTime = 3600 * 24; // 24 hours
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTimestamp + expireTime;

    if (typeof uid === 'number') {
      return RtcTokenBuilder.buildTokenWithUid(
        config.appId,
        config.appCertificate,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpireTime,
        privilegeExpireTime
      );
    } else {
      return RtcTokenBuilder.buildTokenWithUserAccount(
        config.appId,
        config.appCertificate,
        channelName,
        String(uid),
        RtcRole.PUBLISHER,
        privilegeExpireTime,
        privilegeExpireTime
      );
    }
  } catch (err) {
    console.warn('[AgoraService] Token generation fallback (no cert or error):', err);
    return null;
  }
}

/**
 * Check if current IST time falls within workingHoursStart and workingHoursEnd
 */
function isWithinAdminWorkingHours(startStr: string, endStr: string): boolean {
  try {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 3600000 * 5.5);
    const currentMinutes = istTime.getHours() * 60 + istTime.getMinutes();

    const [startH, startM] = (startStr || '09:00').split(':').map(Number);
    const [endH, endM] = (endStr || '21:00').split(':').map(Number);
    const startMinutes = (isNaN(startH) ? 9 : startH) * 60 + (isNaN(startM) ? 0 : startM);
    const endMinutes = (isNaN(endH) ? 21 : endH) * 60 + (isNaN(endM) ? 0 : endM);

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  } catch {
    return true;
  }
}

/**
 * Initiate an audio call to Admin with Availability, Call Waiting, DND, and Working Hours Check
 */
export function initiateSupportCall(params: {
  callerId: string;
  callerName: string;
  callerMobile?: string;
  callerPhoto?: string;
  callerDistrict?: string;
  callerCity?: string;
  callerAge?: number | string;
  callerGender?: string;
  callerEducation?: string;
  callerTier?: string;
  isVerified?: boolean;
  bypassScheduleForTest?: boolean;
}): {
  success: boolean;
  call?: ActiveCallSession;
  error?: string;
  busyAutoReplyMessage?: string;
  availability?: any;
  isWaiting?: boolean;
  activeCallerName?: string;
  waitingOrder?: number;
} {
  const settings = getAdminCallSettings();
  const availability = checkCallAvailability();
  const config = getAgoraServerConfig();

  if (!params.bypassScheduleForTest) {
    const outsideWorkingHours =
      config.scheduleEnabled &&
      !isWithinAdminWorkingHours(settings.workingHoursStart, settings.workingHoursEnd);

    if (!settings.callSupportEnabled || settings.dndMode || outsideWorkingHours || (!availability.available && availability.status !== 'busy')) {
      const replyMsg =
        settings.busyAutoReplyMessage ||
        availability.message ||
        'सध्या ॲडमिन कॉल सपोर्ट उपलब्ध नाही. कृपया थोड्या वेळाने संपर्क साधा.';

      const attemptedCallId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const offHoursLog: HistoricalCallLog = {
        callId: attemptedCallId,
        callerId: params.callerId,
        callerName: params.callerName,
        callerMobile: params.callerMobile,
        callerPhoto: params.callerPhoto,
        callerDistrict: params.callerDistrict,
        callerTier: params.callerTier,
        status: 'off_hours_blocked',
        duration: 0,
        initiatedAt: Date.now(),
        endedAt: Date.now(),
        isRead: false,
        adminNotes: `कॉल प्रयत्न (DND/वेळ मर्यादा): ${replyMsg}`,
      };
      historicalCallLogs.unshift(offHoursLog);
      persistCallLogs();

      return {
        success: false,
        error: replyMsg,
        busyAutoReplyMessage: replyMsg,
        availability: {
          ...availability,
          available: false,
          message: replyMsg,
        },
      };
    }
  }

  // Access check: Verified only
  if (config.allowOnlyVerified && !params.isVerified) {
    return {
      success: false,
      error: 'थेट ऑडिओ कॉलिंग सुविधा फक्त आधार प्रमाणित सदस्यांसाठी उपलब्ध आहे. कृपया आधी आधार कार्ड व्हेरिफाय करा.',
      availability,
    };
  }

  // Access check: Paid members only
  if (config.allowOnlyPaid && params.callerTier === 'free') {
    return {
      success: false,
      error: 'थेट ऑडिओ कॉलिंग सेवा फक्त प्रीमियम/सशुल्क सदस्यांसाठी उपलब्ध आहे. कृपया मेंबरशिप प्लॅन निवडा.',
      availability,
    };
  }

  // End any existing active calls by this exact caller
  for (const [id, c] of activeCalls.entries()) {
    if (c.callerId === params.callerId && (c.status === 'ringing' || c.status === 'waiting' || c.status === 'connected')) {
      c.status = 'ended';
      c.endedAt = Date.now();
      updateHistoricalLog(id, { status: 'ended', endedAt: Date.now() });
    }
  }

  // Check if Admin is CURRENTLY in an active connected call with another user
  const currentlyConnected = Array.from(activeCalls.values()).find(
    (c) => c.status === 'connected' && c.callerId !== params.callerId
  );

  const existingWaitingCalls = Array.from(activeCalls.values()).filter(
    (c) => c.status === 'waiting' && c.callerId !== params.callerId
  );

  const isCallWaitingMode = Boolean(currentlyConnected || config.adminStatus === 'busy');
  const waitingOrder = isCallWaitingMode ? existingWaitingCalls.length + 1 : 0;

  const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const channelName = `vj_call_${params.callerId.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;

  const call: ActiveCallSession = {
    callId,
    channelName,
    callerId: params.callerId,
    callerName: params.callerName,
    callerMobile: params.callerMobile,
    callerPhoto: params.callerPhoto,
    callerDistrict: params.callerDistrict,
    callerCity: params.callerCity,
    callerAge: params.callerAge,
    callerGender: params.callerGender,
    callerEducation: params.callerEducation,
    callerTier: params.callerTier,
    status: isCallWaitingMode ? 'waiting' : 'ringing',
    isWaiting: isCallWaitingMode,
    waitingOrder: isCallWaitingMode ? waitingOrder : undefined,
    activeCallerName: currentlyConnected ? currentlyConnected.callerName : undefined,
    adminAcknowledgedWaiting: false,
    initiatedAt: Date.now(),
  };

  activeCalls.set(callId, call);

  // Add initial entry to persistent call history
  const logEntry: HistoricalCallLog = {
    callId,
    callerId: params.callerId,
    callerName: params.callerName,
    callerMobile: params.callerMobile,
    callerPhoto: params.callerPhoto,
    callerDistrict: params.callerDistrict,
    callerCity: params.callerCity,
    callerAge: params.callerAge,
    callerGender: params.callerGender,
    callerEducation: params.callerEducation,
    callerTier: params.callerTier,
    status: (isCallWaitingMode ? 'waiting' : 'ringing') as any,
    duration: 0,
    initiatedAt: Date.now(),
    isRead: false,
    adminNotes: isCallWaitingMode
      ? `कॉल वेटिंग: ॲडमिन सध्या ${currentlyConnected?.callerName || 'दुसऱ्या कॉलरशी'} बोलत असताना आलेला कॉल (क्रमांक: ${waitingOrder})`
      : undefined,
  };
  historicalCallLogs.unshift(logEntry);
  persistCallLogs();

  // Dispatch High-Priority FCM wake-up & Firestore real-time call signal asynchronously
  dispatchHighPriorityAdminCallPush(call).catch((err) => {
    console.warn('[AgoraService] Async FCM push notice:', err);
  });

  return {
    success: true,
    call,
    isWaiting: isCallWaitingMode,
    activeCallerName: currentlyConnected?.callerName,
    waitingOrder,
    availability,
  };
}

/**
 * Get call session by ID
 */
export function getCallSession(callId: string): ActiveCallSession | undefined {
  return activeCalls.get(callId);
}

/**
 * Admin: Get active incoming, waiting, or connected calls
 */
export function getIncomingCallsForAdmin(): ActiveCallSession[] {
  const list: ActiveCallSession[] = [];
  const now = Date.now();
  for (const call of activeCalls.values()) {
    if (call.status === 'ringing' && now - call.initiatedAt <= 45000) {
      list.push(call);
    } else if (call.status === 'waiting' && now - call.initiatedAt <= 180000) {
      list.push(call);
    } else if (call.status === 'connected') {
      list.push(call);
    }
  }
  return list;
}

/**
 * Admin: Get active queue summary (connected call + waiting callers queue)
 */
export function getActiveCallQueueForAdmin(): {
  connectedCall: ActiveCallSession | null;
  waitingCalls: ActiveCallSession[];
  ringingCalls: ActiveCallSession[];
  totalActive: number;
} {
  const now = Date.now();
  let connectedCall: ActiveCallSession | null = null;
  const waitingCalls: ActiveCallSession[] = [];
  const ringingCalls: ActiveCallSession[] = [];

  for (const call of activeCalls.values()) {
    if (call.status === 'connected') {
      connectedCall = call;
    } else if (call.status === 'waiting' && now - call.initiatedAt <= 180000) {
      waitingCalls.push(call);
    } else if (call.status === 'ringing' && now - call.initiatedAt <= 45000) {
      ringingCalls.push(call);
    }
  }

  return {
    connectedCall,
    waitingCalls,
    ringingCalls,
    totalActive: (connectedCall ? 1 : 0) + waitingCalls.length + ringingCalls.length,
  };
}

/**
 * Admin or Caller responds to a call:
 * - 'accept': accept ringing call
 * - 'reject': decline call
 * - 'end': end call (and auto-promote next waiting caller to ringing)
 * - 'switch_to_waiting': end current active call and immediately connect waiting call
 * - 'acknowledge_waiting': notify waiting caller that admin has acknowledged them
 */
export function updateCallStatus(
  callId: string,
  action: 'accept' | 'reject' | 'end' | 'switch_to_waiting' | 'acknowledge_waiting'
): { success: boolean; call?: ActiveCallSession; error?: string; previousCallEnded?: boolean } {
  const call = activeCalls.get(callId);
  if (!call) {
    return { success: false, error: 'कॉल सत्र सापडले नाही किंवा कालबाह्य झाले.' };
  }

  const now = Date.now();

  if (action === 'accept') {
    // If there was any other connected call, end it cleanly
    for (const [otherId, otherCall] of activeCalls.entries()) {
      if (otherId !== callId && otherCall.status === 'connected') {
        otherCall.status = 'ended';
        otherCall.endedAt = now;
        const dur = otherCall.connectedAt ? Math.max(1, Math.round((now - otherCall.connectedAt) / 1000)) : 0;
        updateHistoricalLog(otherId, { status: 'ended', endedAt: now, duration: dur });
      }
    }

    call.status = 'connected';
    call.isWaiting = false;
    call.connectedAt = now;
    updateHistoricalLog(callId, { status: 'connected', connectedAt: now, isRead: true });
  } else if (action === 'switch_to_waiting') {
    // End the existing connected call
    let previousCallEnded = false;
    for (const [otherId, otherCall] of activeCalls.entries()) {
      if (otherId !== callId && otherCall.status === 'connected') {
        otherCall.status = 'ended';
        otherCall.endedAt = now;
        previousCallEnded = true;
        const dur = otherCall.connectedAt ? Math.max(1, Math.round((now - otherCall.connectedAt) / 1000)) : 0;
        updateHistoricalLog(otherId, { status: 'ended', endedAt: now, duration: dur });
      }
    }

    // Now connect this waiting call
    call.status = 'connected';
    call.isWaiting = false;
    call.connectedAt = now;
    updateHistoricalLog(callId, { status: 'connected', connectedAt: now, isRead: true, adminNotes: 'वेटिंगवरून थेट कनेक्ट केले' });
    return { success: true, call, previousCallEnded };
  } else if (action === 'acknowledge_waiting') {
    call.adminAcknowledgedWaiting = true;
    return { success: true, call };
  } else if (action === 'reject') {
    call.status = 'rejected';
    call.endedAt = now;
    updateHistoricalLog(callId, { status: 'rejected', endedAt: now, duration: 0 });
  } else if (action === 'end') {
    call.status = 'ended';
    call.endedAt = now;
    const durationSecs = call.connectedAt ? Math.max(1, Math.round((now - call.connectedAt) / 1000)) : 0;
    updateHistoricalLog(callId, { status: 'ended', endedAt: now, duration: durationSecs });

    // When admin ends the current call, check if there is a waiting call
    const nextWaitingCall = Array.from(activeCalls.values()).find(
      (c) => c.status === 'waiting' && c.callId !== callId
    );
    if (nextWaitingCall) {
      // Automatically promote next waiting caller to ringing so admin can answer!
      nextWaitingCall.status = 'ringing';
      nextWaitingCall.isWaiting = false;
      updateHistoricalLog(nextWaitingCall.callId, { status: 'ringing' as any });
      dispatchHighPriorityAdminCallPush(nextWaitingCall).catch(() => {});
    }
  }

  try {
    const db = getFirestore();
    db.doc('app_config/admin_active_call')
      .set({ ...call, updatedAt: new Date().toISOString() }, { merge: true })
      .catch(() => {});
  } catch {}

  return { success: true, call };
}

/**
 * Admin Call History & Log Management
 */
export function getCallHistoryList(limit = 100): HistoricalCallLog[] {
  return historicalCallLogs.slice(0, limit);
}

export function saveCallNote(callId: string, note: string): boolean {
  const idx = historicalCallLogs.findIndex((c) => c.callId === callId);
  if (idx !== -1) {
    historicalCallLogs[idx].adminNotes = note.trim();
    persistCallLogs();
    return true;
  }
  return false;
}

export function markAllCallsRead(): void {
  historicalCallLogs = historicalCallLogs.map((c) => ({ ...c, isRead: true }));
  persistCallLogs();
}

export function deleteCallLog(callId: string): boolean {
  const prevLen = historicalCallLogs.length;
  historicalCallLogs = historicalCallLogs.filter((c) => c.callId !== callId);
  if (historicalCallLogs.length !== prevLen) {
    persistCallLogs();
    return true;
  }
  return false;
}

export function getUnreadMissedCallCount(): number {
  return historicalCallLogs.filter((c) => (c.status === 'missed' || c.status === 'off_hours_blocked') && !c.isRead).length;
}
