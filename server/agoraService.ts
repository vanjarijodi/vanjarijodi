import fs from 'fs';
import path from 'path';
import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import { getAgoraServerConfig, checkCallAvailability } from './agoraConfig';

export interface ActiveCallSession {
  callId: string;
  channelName: string;
  callerId: string;
  callerName: string;
  callerMobile?: string;
  callerPhoto?: string;
  callerDistrict?: string;
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
 * Initiate an audio call to Admin with Availability, Call Waiting, and Working Hours Check
 */
export function initiateSupportCall(params: {
  callerId: string;
  callerName: string;
  callerMobile?: string;
  callerPhoto?: string;
  callerDistrict?: string;
  callerTier?: string;
  isVerified?: boolean;
}): {
  success: boolean;
  call?: ActiveCallSession;
  error?: string;
  availability?: any;
  isWaiting?: boolean;
  activeCallerName?: string;
  waitingOrder?: number;
} {
  const availability = checkCallAvailability();

  // If calling service is disabled or offline
  if (!availability.available && availability.status !== 'busy') {
    // Record off-hours missed call attempt in call logs so Admin sees user tried to reach them!
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
      adminNotes: `कॉल प्रयत्न: ${availability.message}`,
    };
    historicalCallLogs.unshift(offHoursLog);
    persistCallLogs();

    return {
      success: false,
      error: availability.message,
      availability,
    };
  }

  const config = getAgoraServerConfig();

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
    }
  }

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
