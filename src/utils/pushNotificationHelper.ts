// Push Notification & Sound Chime Utility for Vanjari Jodi Matrimony

// Singleton AudioContext and Preloaded HTML5 Audio for reliable sound playback
let sharedAudioContext: (AudioContext | null) = null;
let preloadedChimeAudio: (HTMLAudioElement | null) = null;
let isAudioEngineUnlocked = false;

// Initialize and unlock audio on first user touch/click (resolves mobile/browser autoplay policy)
export function initAudioUnlock(): void {
  if (typeof window === 'undefined') return;

  // Pre-instantiate HTML5 Audio element
  try {
    if (!preloadedChimeAudio) {
      preloadedChimeAudio = new Audio('/sounds/notification.mp3');
      preloadedChimeAudio.volume = 0.85;
      preloadedChimeAudio.load();
    }
  } catch (e) {
    // Ignore audio preloading errors
  }

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
        // Play silent 1-sample buffer to warm up mobile WebKit / Android audio pipelines
        if (sharedAudioContext) {
          const buffer = sharedAudioContext.createBuffer(1, 1, 22050);
          const source = sharedAudioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(sharedAudioContext.destination);
          source.start(0);
        }
      }

      if (preloadedChimeAudio) {
        // Unlock HTML5 Audio
        preloadedChimeAudio.play().then(() => {
          preloadedChimeAudio?.pause();
          if (preloadedChimeAudio) preloadedChimeAudio.currentTime = 0;
        }).catch(() => {});
      }

      isAudioEngineUnlocked = true;
    } catch (e) {
      console.warn('Audio unlock warning:', e);
    }

    // Clean up event listeners after first user interaction
    window.removeEventListener('click', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };

  window.addEventListener('click', unlock, true);
  window.addEventListener('touchstart', unlock, true);
  window.addEventListener('keydown', unlock, true);

  // Also setup Service Worker message listener
  setupServiceWorkerMessageListener();
}

// Plays a pleasant notification chime using both HTML5 Audio & Web Audio API
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;

  let html5Played = false;

  // 1. Attempt HTML5 Audio Playback
  try {
    const audio = preloadedChimeAudio || new Audio('/sounds/notification.mp3');
    audio.volume = 0.85;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          html5Played = true;
        })
        .catch(() => {
          // If HTML5 audio is blocked, synthesize with Web Audio API below
          synthesizeChimeSound();
        });
    }
  } catch (err) {
    // Fall back to oscillator synthesis
    synthesizeChimeSound();
  }

  // 2. Also run synthesizer if HTML5 hasn't played or for rich layered bell harmonics
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
    masterGain.gain.setValueAtTime(0.7, now);
    masterGain.connect(ctx.destination);

    // Chime Note 1: E5 (659.25 Hz) + Octave E6 (1318.5 Hz)
    playTone(ctx, masterGain, 659.25, now, 0.4, 0.35);
    playTone(ctx, masterGain, 1318.5, now, 0.3, 0.15);

    // Chime Note 2: G#5 (830.61 Hz) + Octave G#6 (1661.2 Hz)
    playTone(ctx, masterGain, 830.61, now + 0.12, 0.45, 0.4);
    playTone(ctx, masterGain, 1661.2, now + 0.12, 0.35, 0.2);

    // Chime Note 3: B5 (987.77 Hz) + Resolution Harmonics
    playTone(ctx, masterGain, 987.77, now + 0.24, 0.6, 0.45);
    playTone(ctx, masterGain, 1975.5, now + 0.24, 0.5, 0.25);
  } catch (e) {
    console.warn('Audio synthesis failed:', e);
  }
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

    // Soft attack & exponential decay envelope
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (e) {}
}

// Trigger device physical vibration pattern on mobile phones
export function triggerDeviceVibration(pattern: number[] = [220, 100, 220]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Vibration not supported or allowed
  }
}

export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPushPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!isPushNotificationSupported()) return 'unsupported';
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      playNotificationSound();
      triggerDeviceVibration([200, 100, 200]);
    }
    return perm;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export interface PushOptions {
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
  // 1. Play sound & vibrate
  if (options.playSound !== false) {
    playNotificationSound();
    triggerDeviceVibration([200, 100, 200]);
  }

  // 2. Dispatch custom in-app top drop-down toast event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('vanjari_new_notification_toast', {
        detail: {
          title,
          body: options.body,
          icon: options.icon || '/icon-192.png',
          avatarUrl: options.avatarUrl,
          url: options.url,
          type: options.type || 'system',
          timestamp: Date.now()
        }
      })
    );
  }

  if (!isPushNotificationSupported()) return false;

  if (Notification.permission === 'granted') {
    // 3. Try Service Worker showNotification first (Required for Android Chrome, PWA & Mobile Web)
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then((reg) => {
          if (reg && reg.showNotification) {
            reg.showNotification(title, {
              body: options.body,
              icon: options.icon || '/icon-192.png',
              badge: '/icon-192.png',
              tag: options.tag || `vanjari-push-${Date.now()}`,
              data: { url: options.url || '/' },
              vibrate: [250, 100, 250, 100, 250],
              sound: '/sounds/notification.mp3',
              silent: false,
              renotify: true
            } as any);
          }
        })
        .catch(() => {});
    }

    // 4. Desktop / Browser Notification fallback
    try {
      const n = new Notification(title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        tag: options.tag || `vanjari-push-${Date.now()}`,
        badge: '/icon-192.png',
        silent: false
      } as any);

      n.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        n.close();
      };
      return true;
    } catch (err) {
      // Handled by service worker or top in-app toast
    }
    return true;
  }

  return false;
}

// One-click function to test push notification, sound, vibration, and in-app toast
export async function testPushNotificationAndSound(): Promise<{
  soundPlayed: boolean;
  permission: string;
  pushSent: boolean;
}> {
  playNotificationSound();
  triggerDeviceVibration([250, 100, 250]);

  let perm = getPushPermissionState();
  if (perm === 'default') {
    perm = await requestPushPermission();
  }

  const pushSent = triggerBrowserPushNotification('🔔 वंजारी जोडी — ध्वनी व सूचना चाचणी', {
    body: 'पुश नोटिफिकेशन्स आणि ऑडिओ आवाज यशस्वीरित्या चालू झाले आहेत! नवीन स्थळे व मेसेजचे अलर्ट तुम्हाला त्वरित मिळतील.',
    icon: '/icon-192.png',
    playSound: true,
    type: 'system',
    url: '/'
  });

  return {
    soundPlayed: true,
    permission: perm,
    pushSent
  };
}

// Connect Service Worker messages to in-app audio chime & toast
function setupServiceWorkerMessageListener() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        const notif = event.data.data || {};
        playNotificationSound();
        triggerDeviceVibration([200, 100, 200]);

        window.dispatchEvent(
          new CustomEvent('vanjari_new_notification_toast', {
            detail: {
              title: notif.title || '🔔 नवीन सूचना',
              body: notif.body || 'वंजारी जोडीवर नवीन अपडेट आले आहे.',
              icon: notif.icon || '/icon-192.png',
              url: notif.url || '/',
              type: notif.type || 'system',
              timestamp: Date.now()
            }
          })
        );
      }
    });
  } catch (e) {}
}
