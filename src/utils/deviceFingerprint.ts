/**
 * 🛡️ Vanjari Jodi Hardware & Browser Device Fingerprinting Engine
 * Generates an immutable, persistent device identifier for anti-fraud & scam prevention.
 */

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Renders a tiny off-screen canvas to extract GPU/font-rasterization signature
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('VanjariJodi#🛡️$2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('VanjariJodi#🛡️$2026', 4, 17);

    return simpleHash(canvas.toDataURL());
  } catch (e) {
    return 'canvas-err';
  }
}

/**
 * Extracts WebGL graphics card vendor & unmasked renderer
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      return simpleHash(`${vendor}:::${renderer}`);
    }
    return 'webgl-basic';
  } catch (e) {
    return 'webgl-err';
  }
}

/**
 * Returns comprehensive device metadata
 */
export function getDeviceHardwareInfo(): {
  deviceFingerprint: string;
  screen: string;
  platform: string;
  cores: number;
  canvasHash: string;
  webglHash: string;
  timezone: string;
  language: string;
} {
  if (typeof window === 'undefined') {
    return {
      deviceFingerprint: 'SSR-SERVER',
      screen: 'unknown',
      platform: 'server',
      cores: 1,
      canvasHash: '',
      webglHash: '',
      timezone: 'UTC',
      language: 'mr',
    };
  }

  const screenStr = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth || 24}`;
  const platform = navigator.platform || (navigator as any).userAgentData?.platform || 'unknown';
  const cores = navigator.hardwareConcurrency || 4;
  const canvasHash = getCanvasFingerprint();
  const webglHash = getWebGLFingerprint();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  const language = navigator.language || 'mr';

  const rawSeed = `${screenStr}##${platform}##${cores}##${canvasHash}##${webglHash}##${timezone}`;
  const deviceFingerprint = `DEV-${simpleHash(rawSeed)}-${simpleHash(navigator.userAgent || '')}`;

  return {
    deviceFingerprint,
    screen: screenStr,
    platform,
    cores,
    canvasHash,
    webglHash,
    timezone,
    language,
  };
}

/**
 * Obtains or retrieves the persistent unique device fingerprint
 */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'SSR-DEVICE';

  try {
    const saved = localStorage.getItem('vanjari_device_fingerprint');
    if (saved && saved.startsWith('DEV-')) {
      return saved;
    }

    const { deviceFingerprint } = getDeviceHardwareInfo();
    localStorage.setItem('vanjari_device_fingerprint', deviceFingerprint);
    sessionStorage.setItem('vanjari_device_fingerprint', deviceFingerprint);

    return deviceFingerprint;
  } catch (e) {
    return `DEV-${simpleHash(navigator.userAgent || 'generic')}`;
  }
}

/**
 * Checks if the current client device fingerprint is banned
 */
export function isCurrentDeviceBanned(bannedDevices: string[]): boolean {
  if (!Array.isArray(bannedDevices) || bannedDevices.length === 0) return false;
  const currentFp = getDeviceFingerprint();
  return bannedDevices.includes(currentFp);
}
