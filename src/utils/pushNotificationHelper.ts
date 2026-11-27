// Push Notification, Lock-Screen Service Worker & Sound Chime Utility for Vanjari Jodi Matrimony
import app from '../firebase';
import { getMessaging, getToken, onMessage, isSupported as isFcmSupported } from 'firebase/messaging';
import { syncDocToFirestore } from './firestoreSync';

// Singleton AudioContext and Preloaded HTML5 Audio for reliable sound playback
let sharedAudioContext: AudioContext | null = null;
let preloadedChimeAudio: HTMLAudioElement | null = null;
let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
let activeLockScreenUserId: string | null = null;
const deliveredClientNotifIds = new Set<string>();

// Load already-seen notification IDs from localStorage so we don't re-alert old history on boot
try {
  if (typeof window !== 'undefined') {
    const rawSeen = localStorage.getItem('vj_delivered_push_ids');
    if (rawSeen) {
      const parsed = JSON.parse(rawSeen);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: string) => deliveredClientNotifIds.add(String(id)));
      }
    }
  }
} catch {}

export function markNotificationDeliveredOnDevice(id?: string): boolean {
  if (!id) return false;
  if (deliveredClientNotifIds.has(id)) return true; // already delivered
  deliveredClientNotifIds.add(id);
  try {
    if (typeof window !== 'undefined') {
      const recent = Array.from(deliveredClientNotifIds).slice(-150);
      localStorage.setItem('vj_delivered_push_ids', JSON.stringify(recent));
    }
  } catch {}
  return false;
}

// Ensure Service Worker (/sw.js) is registered & active for Lock-Screen Push Notifications
export async function ensureServiceWorkerRegistered(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        try {
          await reg.update();
        } catch {}
        return reg;
      })
      .catch(async () => {
        try {
          return (await navigator.serviceWorker.ready) || null;
        } catch {
          return null;
        }
      });
  }
  return swRegistrationPromise;
}

// Register Firebase Cloud Messaging (FCM) Token & Sync with Backend + Firestore `deviceTokens`
export async function registerFcmForLockScreenPush(userId?: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isFcmSupported().catch(() => false);
    if (!supported) return null;

    const reg = await ensureServiceWorkerRegistered();
    if (!reg) return null;

    const messaging = getMessaging(app);

    // Listen to foreground FCM messages and route them through lock-screen & chime engine
    onMessage(messaging, (payload) => {
      const notif = payload.notification || {};
      const data = payload.data || {};
      const notifId = data.id || `fcm-${Date.now()}`;
      if (markNotificationDeliveredOnDevice(notifId)) return;

      triggerBrowserPushNotification(
        notif.title || data.title || '🔔 वंजारी जोडी मॅट्रिमोनी',
        {
          id: notifId,
          body: notif.body || data.body || 'नवीन विवाह जुळवणी व संदेश सूचना!',
          icon: notif.icon || '/icon-192.png',
          tag: notifId,
          url: data.url || '/',
          playSound: true,
          type: (data.type as any) || 'system',
        }
      );
    });

    const vapidKey = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY || undefined;
    const token = await getToken(messaging, {
      serviceWorkerRegistration: reg,
      ...(vapidKey ? { vapidKey } : {}),
    }).catch(() => null);

    if (token) {
      const cleanUser = userId || activeLockScreenUserId || 'guest';
      localStorage.setItem('vj_fcm_device_token', token);

      // 1. Save in Firestore `deviceTokens`
      syncDocToFirestore('deviceTokens', token.slice(-36), {
        id: token.slice(-36),
        userId: cleanUser,
        fcmToken: token,
        platform: 'android_web_lockscreen',
        updatedAt: new Date().toISOString(),
      });

      // 2. Register with Backend Express Server for Multicast High-Priority FCM Push
      fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: cleanUser,
          fcmToken: token,
          platform: 'android_web_lockscreen',
        }),
      }).catch(() => {});
    }

    return token;
  } catch {
    return null;
  }
}

// Sync Logged-in User ID with Service Worker so background & lock-screen polling knows which user's alerts to show
export async function syncUserWithLockScreenServiceWorker(
  userId: string | null | undefined,
  existingNotificationIds: string[] = []
): Promise<void> {
  if (typeof window === 'undefined') return;
  activeLockScreenUserId = userId || null;

  existingNotificationIds.forEach((id) => {
    if (id) deliveredClientNotifIds.add(id);
  });

  const reg = await ensureServiceWorkerRegistered();
  if (reg) {
    const sw = reg.active || reg.waiting || reg.installing;
    if (sw) {
      sw.postMessage({
        type: 'REGISTER_SW_USER',
        userId: activeLockScreenUserId || 'all',
        seenIds: Array.from(deliveredClientNotifIds).slice(-100),
      });
    }

    // Request Background Sync / Periodic Sync if supported by Android Chrome PWA
    try {
      if ('sync' in reg && (reg as any).sync?.register) {
        (reg as any).sync.register('vanjari-jodi-notif-sync').catch(() => {});
      }
      if ('periodicSync' in reg && (reg as any).periodicSync?.register) {
        (reg as any).periodicSync
          .register('vanjari-jodi-periodic-notif', { minInterval: 60 * 1000 })
          .catch(() => {});
      }
    } catch {}
  }

  if (Notification.permission === 'granted' && userId) {
    registerFcmForLockScreenPush(userId).catch(() => {});
  }
}

// Initialize and unlock audio on first user touch/click (resolves mobile/browser autoplay policy)
export function initAudioUnlock(): void {
  if (typeof window === 'undefined') return;

  // Register Service Worker immediately on boot
  ensureServiceWorkerRegistered().then((reg) => {
    if (reg && Notification.permission === 'granted') {
      registerFcmForLockScreenPush(activeLockScreenUserId || undefined).catch(() => {});
    }
  });

  // Pre-instantiate HTML5 Audio element
  try {
    if (!preloadedChimeAudio) {
      preloadedChimeAudio = new Audio('/sounds/notification.mp3');
      preloadedChimeAudio.volume = 0.9;
      preloadedChimeAudio.load();
    }
  } catch {}

  const unlock = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
          sharedAudioContext = new AudioContextClass();
        }
        if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
          sharedAudioContext.resume().catch(() => {});
        }
        if (sharedAudioContext) {
          const buffer = sharedAudioContext.createBuffer(1, 1, 22050);
          const source = sharedAudioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(sharedAudioContext.destination);
          source.start(0);
        }
      }

      if (preloadedChimeAudio) {
        preloadedChimeAudio
          .play()
          .then(() => {
            preloadedChimeAudio?.pause();
            if (preloadedChimeAudio) preloadedChimeAudio.currentTime = 0;
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('Audio unlock warning:', e);
    }

    window.removeEventListener('click', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };

  window.addEventListener('click', unlock, true);
  window.addEventListener('touchstart', unlock, true);
  window.addEventListener('keydown', unlock, true);

  setupServiceWorkerMessageListener();
}

// Plays a pleasant notification chime using both HTML5 Audio & Web Audio API
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  let html5Played = false;

  try {
    const audio = preloadedChimeAudio || new Audio('/sounds/notification.mp3');
    audio.volume = 0.9;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          html5Played = true;
        })
        .catch(() => {
          synthesizeChimeSound();
        });
    }
  } catch {
    synthesizeChimeSound();
  }

  if (!html5Played) {
    synthesizeChimeSound();
  }
}

// High-fidelity synthesized bell chime with warm harmonic overtones
function synthesizeChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
      sharedAudioContext = new AudioContextClass();
    }

    const ctx = sharedAudioContext;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.75, now);
    masterGain.connect(ctx.destination);

    playTone(ctx, masterGain, 659.25, now, 0.4, 0.35);
    playTone(ctx, masterGain, 1318.5, now, 0.3, 0.15);

    playTone(ctx, masterGain, 830.61, now + 0.12, 0.45, 0.4);
    playTone(ctx, masterGain, 1661.2, now + 0.12, 0.35, 0.2);

    playTone(ctx, masterGain, 987.77, now + 0.24, 0.6, 0.45);
    playTone(ctx, masterGain, 1975.5, now + 0.24, 0.5, 0.25);
  } catch {}
}

function playTone(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  duration: number,
  peakGain: number
) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {}
}

// Trigger device physical vibration pattern on mobile phones
export function triggerDeviceVibration(pattern: number[] = [300, 100, 300, 100, 400]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {}
}

export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && ('Notification' in window || 'serviceWorker' in navigator);
}

export function getPushPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      playNotificationSound();
      triggerDeviceVibration([300, 100, 300]);
      await ensureServiceWorkerRegistered();
      registerFcmForLockScreenPush(activeLockScreenUserId || undefined).catch(() => {});
    }
    return perm;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export interface PushOptions {
  id?: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  playSound?: boolean;
  avatarUrl?: string;
  type?: 'interest' | 'match' | 'chat' | 'payment' | 'system';
}

export function triggerBrowserPushNotification(
  title: string,
  options: PushOptions
): boolean {
  const notifTag = options.tag || options.id || `vanjari-push-${Date.now()}`;
  if (options.id) {
    markNotificationDeliveredOnDevice(options.id);
  }

  // 1. Play sound & vibrate
  if (options.playSound !== false) {
    playNotificationSound();
    triggerDeviceVibration([300, 100, 300, 100, 400]);
  }

  // 2. Dispatch custom in-app top drop-down toast event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vanjari_new_notification_toast', {
        detail: {
          id: notifTag,
          title,
          body: options.body,
          icon: options.icon || '/icon-192.png',
          avatarUrl: options.avatarUrl,
          url: options.url,
          type: options.type || 'system',
          timestamp: Date.now(),
        },
      })
    );
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  if (Notification.permission === 'granted') {
    // 3. ALWAYS use Service Worker showNotification for Lock-Screen & Android Notification Drawer
    ensureServiceWorkerRegistered()
      .then((reg) => {
        const targetReg = reg || (navigator.serviceWorker && navigator.serviceWorker.controller ? null : null);
        if (targetReg && targetReg.showNotification) {
          targetReg
            .showNotification(title, {
              body: options.body,
              icon: options.icon || '/icon-192.png',
              badge: '/icon-192.png',
              tag: notifTag,
              renotify: true,
              requireInteraction: true, // Stays on Phone Lock Screen until tapped
              silent: false,
              vibrate: [300, 100, 300, 100, 400],
              timestamp: Date.now(),
              data: {
                url: options.url || '/',
                id: notifTag,
                type: options.type || 'system',
              },
              actions: [
                { action: 'open', title: '👉 उघडा (Open)' },
                { action: 'dismiss', title: 'बंद करा' },
              ],
            } as any)
            .catch(() => {});
        } else if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_LOCKSCREEN_NOTIFICATION',
            payload: {
              id: notifTag,
              title,
              body: options.body,
              icon: options.icon || '/icon-192.png',
              tag: notifTag,
              url: options.url || '/',
              type: options.type || 'system',
            },
          });
        }
      })
      .catch(() => {});

    // 4. Desktop / Fallback Notification if Service Worker is not controlling the page yet
    try {
      if (!navigator.serviceWorker?.controller) {
        const n = new Notification(title, {
          body: options.body,
          icon: options.icon || '/icon-192.png',
          tag: notifTag,
          badge: '/icon-192.png',
          renotify: true,
          requireInteraction: true,
          silent: false,
        } as any);

        n.onclick = (event) => {
          event.preventDefault();
          window.focus();
          if (options.url) {
            window.location.href = options.url;
          }
          n.close();
        };
      }
      return true;
    } catch {
      // Service Worker handles Android notifications
    }
    return true;
  }

  return false;
}

// One-click function to test push notification, lock-screen alert, sound, and vibration
export async function testPushNotificationAndSound(): Promise<{
  soundPlayed: boolean;
  permission: string;
  pushSent: boolean;
}> {
  playNotificationSound();
  triggerDeviceVibration([300, 100, 300, 100, 400]);

  let perm = getPushPermissionState();
  if (perm === 'default') {
    perm = await requestPushPermission();
  }

  const pushSent = triggerBrowserPushNotification('🔔 वंजारी जोडी — लॉक-स्क्रीन सूचना चाचणी', {
    body: 'फोन लॉक असतानाही पुश नोटिफिकेशन्स आणि ऑडिओ अलर्ट यशस्वीरित्या चालू आहेत! नवीन स्थळे व मेसेजचे अलर्ट तुम्हाला त्वरित मिळतील.',
    icon: '/icon-192.png',
    playSound: true,
    type: 'system',
    url: '/',
  });

  return {
    soundPlayed: true,
    permission: perm,
    pushSent,
  };
}

// Connect Service Worker background messages to in-app audio chime & toast
function setupServiceWorkerMessageListener() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        const notif = event.data.data || {};
        if (notif.id && markNotificationDeliveredOnDevice(notif.id)) {
          return;
        }
        playNotificationSound();
        triggerDeviceVibration([300, 100, 300, 100, 400]);

        window.dispatchEvent(
          new CustomEvent('vanjari_new_notification_toast', {
            detail: {
              id: notif.id,
              title: notif.title || '🔔 नवीन सूचना',
              body: notif.body || 'वंजारी जोडीवर नवीन अपडेट आले आहे.',
              icon: notif.icon || '/icon-192.png',
              url: notif.url || '/',
              type: notif.type || 'system',
              timestamp: Date.now(),
            },
          })
        );
      }
    });
  } catch {}
}
