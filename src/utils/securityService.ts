import { SecurityLogEvent, UserSession, AdminAuditLogRecord } from '../types';

export async function logSecurityEvent(payload: {
  userId: string;
  userName?: string;
  userEmail?: string;
  userMobile?: string;
  eventType: SecurityLogEvent['eventType'];
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; log?: SecurityLogEvent; riskScore?: number; riskLevel?: string }> {
  try {
    const clientMeta = {
      ...payload.metadata,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    };

    const response = await fetch('/api/security/log-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        userAgent: navigator.userAgent,
        metadata: clientMeta,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('Security logging server response error:', err);
      return { success: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to report security log:', error);
    return { success: false };
  }
}

export async function fetchSecurityLogs(params?: {
  userId?: string;
  eventType?: string;
  riskLevel?: string;
  search?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  logs: SecurityLogEvent[];
  stats?: {
    totalEvents: number;
    successfulLogins: number;
    failedLogins: number;
    suspiciousEvents: number;
    blockedIpsCount: number;
  };
  blockedIps?: string[];
}> {
  try {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.eventType && params.eventType !== 'all') query.set('eventType', params.eventType);
    if (params?.riskLevel && params.riskLevel !== 'all') query.set('riskLevel', params.riskLevel);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`/api/security/logs?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch security logs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return { success: false, logs: [] };
  }
}

export async function fetchUserSessions(userId: string): Promise<{
  success: boolean;
  sessions: UserSession[];
  currentIp?: string;
}> {
  try {
    const response = await fetch(`/api/security/user-sessions/${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error('Failed to fetch user sessions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return { success: false, sessions: [] };
  }
}

export async function revokeUserSessions(payload: {
  userId: string;
  sessionId?: string;
  revokeAllOther?: boolean;
}): Promise<{ success: boolean; message: string; remainingSessions?: UserSession[] }> {
  try {
    const response = await fetch('/api/security/revoke-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to revoke session');
    return await response.json();
  } catch (error) {
    console.error('Error revoking user session:', error);
    return { success: false, message: 'सत्र बंद करताना त्रुटी आली.' };
  }
}

export async function fetchAdminAuditLogs(params?: {
  category?: string;
  search?: string;
  limit?: number;
}): Promise<{ success: boolean; auditLogs: AdminAuditLogRecord[] }> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`/api/security/admin-audit-logs?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch admin audit logs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    return { success: false, auditLogs: [] };
  }
}

export async function logAdminAuditRecord(record: {
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  adminRole?: string;
  action: string;
  category?: AdminAuditLogRecord['category'];
  targetEntityId?: string;
  targetEntityType?: string;
  targetEntityName?: string;
  details: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
}): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/security/admin-audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return await response.json();
  } catch (error) {
    console.error('Error logging admin audit record:', error);
    return { success: false };
  }
}

export async function toggleIpQuarantine(ip: string, block: boolean, reason?: string): Promise<{
  success: boolean;
  isBlocked: boolean;
  blockedIps: string[];
}> {
  try {
    const response = await fetch('/api/security/toggle-ip-block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, block, reason }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling IP block:', error);
    return { success: false, isBlocked: false, blockedIps: [] };
  }
}

export async function checkClientAccess(payload: {
  deviceFingerprint?: string;
  mobile?: string;
}): Promise<{ allowed: boolean; reason?: string; message?: string }> {
  try {
    const response = await fetch('/api/security/check-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.warn('Check access offline or failed, allowing client:', error);
    return { allowed: true };
  }
}

export async function nuclearBanMember(payload: {
  userId: string;
  userName?: string;
  mobile?: string;
  ip?: string;
  deviceFingerprint?: string;
  reason?: string;
}): Promise<{
  success: boolean;
  message?: string;
  blockedIps?: string[];
  bannedDevices?: string[];
  bannedMobiles?: string[];
}> {
  try {
    const response = await fetch('/api/security/nuclear-ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error('Error executing nuclear ban:', error);
    return { success: false, message: 'बॅन प्रक्रियेत त्रुटी आली.' };
  }
}

export async function fetchBlacklist(): Promise<{
  success: boolean;
  blockedIps: string[];
  bannedDevices: string[];
  bannedMobiles: string[];
}> {
  try {
    const response = await fetch('/api/security/blacklist');
    return await response.json();
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return { success: false, blockedIps: [], bannedDevices: [], bannedMobiles: [] };
  }
}

export async function toggleDeviceBan(deviceFingerprint: string, block: boolean): Promise<{
  success: boolean;
  isBanned?: boolean;
  bannedDevices?: string[];
}> {
  try {
    const response = await fetch('/api/security/toggle-device-ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceFingerprint, block }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling device ban:', error);
    return { success: false };
  }
}

export async function toggleMobileBan(mobile: string, block: boolean): Promise<{
  success: boolean;
  isBanned?: boolean;
  bannedMobiles?: string[];
}> {
  try {
    const response = await fetch('/api/security/toggle-mobile-ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, block }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling mobile ban:', error);
    return { success: false };
  }
}

export async function toggleIpBan(ip: string, block: boolean): Promise<{
  success: boolean;
  isBanned?: boolean;
  blockedIps?: string[];
}> {
  try {
    const response = await fetch('/api/security/toggle-ip-ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, block }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling ip ban:', error);
    return { success: false };
  }
}
