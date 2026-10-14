import AgoraRTC, {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
} from 'agora-rtc-sdk-ng';

export interface AgoraPublicConfig {
  enabled: boolean;
  appId: string;
  allowRegisteredOnly: boolean;
  adminDisplayName: string;
  scheduleEnabled?: boolean;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  scheduleStartTime12?: string;
  scheduleEndTime12?: string;
  isAvailableNow?: boolean;
  availabilityStatus?: string;
  availabilityMessage?: string;
  nextAvailableTime?: string;
  allowOnlyVerified?: boolean;
  allowOnlyPaid?: boolean;
  adminStatus?: 'online' | 'busy' | 'offline';
}

export const DEFAULT_AGORA_APP_ID = '0264722151804051ad63ea12fd164935';

let rtcClient: IAgoraRTCClient | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;
let remoteAudioTrack: IRemoteAudioTrack | null = null;
let audioContext: AudioContext | null = null;
let ringOscillator: OscillatorNode | null = null;
let ringInterval: any = null;

// Configure Agora logging - Level 4 = NONE (silences internal SDK console noise)
try {
  AgoraRTC.setLogLevel(4);
} catch (e) {}

/**
 * Fetch Agora Public Config from server
 */
export async function getAgoraConfig(): Promise<AgoraPublicConfig | null> {
  try {
    const res = await fetch(`/api/agora/config?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        return data.config as AgoraPublicConfig;
      }
    }
  } catch (err) {
    console.warn('[Agora] Could not fetch public config:', err);
  }
  return null;
}

/**
 * Synthesize tones with Web Audio API (Phone ringback, incoming ringtone, call disconnect)
 */
export function playCallAudioTone(type: 'ringback' | 'incoming' | 'end' | 'waiting') {
  stopCallAudioTone();

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();

    if (type === 'ringback') {
      // Outgoing phone ring: 400Hz + 450Hz beep for 1.5s, silence 2s
      const playBeep = () => {
        if (!audioContext || audioContext.state === 'closed') return;
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, audioContext.currentTime);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(450, audioContext.currentTime);

        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioContext.destination);

        osc1.start();
        osc2.start();
        osc1.stop(audioContext.currentTime + 1.2);
        osc2.stop(audioContext.currentTime + 1.2);
      };

      playBeep();
      ringInterval = setInterval(playBeep, 3000);
    } else if (type === 'waiting') {
      // Gentle telecom call waiting pip-pip tone (440Hz short double pip, repeated every 3.5s)
      const playWaitingPip = () => {
        if (!audioContext || audioContext.state === 'closed') return;
        const now = audioContext.currentTime;

        // First pip
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        gain1.gain.setValueAtTime(0.06, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.start(now);
        osc1.stop(now + 0.12);

        // Second pip after 150ms
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, now + 0.15);
        gain2.gain.setValueAtTime(0.06, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.27);
      };

      playWaitingPip();
      ringInterval = setInterval(playWaitingPip, 3500);
    } else if (type === 'incoming') {
      // Pleasant melodic chime for incoming call (Marimba style: 523Hz -> 659Hz -> 784Hz)
      const playChime = () => {
        if (!audioContext || audioContext.state === 'closed') return;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = audioContext!.createOscillator();
          const gain = audioContext!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioContext!.currentTime + idx * 0.15);
          gain.gain.setValueAtTime(0.12, audioContext!.currentTime + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + idx * 0.15 + 0.35);

          osc.connect(gain);
          gain.connect(audioContext!.destination);

          osc.start(audioContext!.currentTime + idx * 0.15);
          osc.stop(audioContext!.currentTime + idx * 0.15 + 0.35);
        });
      };

      playChime();
      ringInterval = setInterval(playChime, 2000);
    } else if (type === 'end') {
      // Quick double low beep for disconnect
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.4);
    }
  } catch (e) {
    console.warn('Audio tone error:', e);
  }
}

export function stopCallAudioTone() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
  if (ringOscillator) {
    try { ringOscillator.stop(); } catch (e) {}
    ringOscillator = null;
  }
  if (audioContext) {
    try { audioContext.close(); } catch (e) {}
    audioContext = null;
  }
}

/**
 * Join an Agora Web Voice Audio Channel
 */
export async function joinAgoraAudioCall(params: {
  appId: string;
  channelName: string;
  token?: string | null;
  uid?: number | string;
  onRemoteUserJoined?: (uid: string | number) => void;
  onRemoteUserLeft?: (uid: string | number) => void;
  onVolumeChange?: (volume: number) => void;
  onMicDenied?: (err: any) => void;
  onTokenError?: (err: any) => void;
  onError?: (err: any) => void;
}): Promise<{ client: IAgoraRTCClient | null; localTrack: IMicrophoneAudioTrack | null; success: boolean }> {
  // If already in call, leave first
  await leaveAgoraAudioCall();

  rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

  // Handle remote member published audio track
  rtcClient.on('user-published', async (user, mediaType) => {
    try {
      await rtcClient?.subscribe(user, mediaType);
      if (mediaType === 'audio' && user.audioTrack) {
        remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
        if (params.onRemoteUserJoined) {
          params.onRemoteUserJoined(user.uid);
        }
      }
    } catch (subErr) {
      console.warn('[Agora] Error subscribing to remote audio:', subErr);
    }
  });

  // Handle remote user leaving
  rtcClient.on('user-left', (user) => {
    if (params.onRemoteUserLeft) {
      params.onRemoteUserLeft(user.uid);
    }
  });

  // Create local microphone audio track with echo cancellation & noise suppression
  try {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      AEC: true, // Acoustic Echo Cancellation
      ANS: true, // Automatic Noise Suppression
      AGC: true, // Automatic Gain Control
    });
  } catch (micErr: any) {
    // Fallback: Try with simple standard audio track without heavy processing
    try {
      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    } catch (fallbackErr: any) {
      const isDenied =
        fallbackErr?.code === 'PERMISSION_DENIED' ||
        fallbackErr?.name === 'NotAllowedError' ||
        String(fallbackErr?.message || '').toLowerCase().includes('permission denied');
      if (isDenied && params.onMicDenied) {
        params.onMicDenied(fallbackErr);
      }
    }
  }

  // Enable volume indicator if client active
  try {
    rtcClient.enableAudioVolumeIndicator();
    rtcClient.on('volume-indicator', (volumes) => {
      if (params.onVolumeChange && volumes.length > 0) {
        const top = volumes[0]?.level || 0;
        params.onVolumeChange(Math.round(top * 100));
      }
    });
  } catch (e) {}

  // Join Agora channel
  let joinSuccess = false;
  try {
    const effectiveAppId = (params.appId && params.appId.trim()) || DEFAULT_AGORA_APP_ID;
    await rtcClient.join(
      effectiveAppId,
      params.channelName,
      params.token || null,
      params.uid || null
    );
    joinSuccess = true;

    // Publish microphone audio if track exists
    if (localAudioTrack) {
      try {
        await rtcClient.publish(localAudioTrack);
      } catch (pubErr) {
        console.warn('[Agora] Publish track fallback:', pubErr);
      }
    }
  } catch (joinErr: any) {
    const errMsg = String(joinErr?.message || joinErr?.code || joinErr || '');
    const isTokenRequired =
      errMsg.includes('dynamic use static key') ||
      errMsg.includes('CAN_NOT_GET_GATEWAY_SERVER') ||
      errMsg.includes('INVALID_TOKEN');

    if (isTokenRequired && params.onTokenError) {
      params.onTokenError(joinErr);
    }
    if (params.onError) {
      params.onError(joinErr);
    }

    try {
      await rtcClient.leave();
    } catch (e) {}
    rtcClient = null;
  }

  return { client: rtcClient, localTrack: localAudioTrack, success: joinSuccess };
}

/**
 * Mute or Unmute local microphone
 */
export async function toggleMicrophoneMuted(muted: boolean): Promise<boolean> {
  if (localAudioTrack) {
    await localAudioTrack.setEnabled(!muted);
    return !muted;
  }
  return false;
}

/**
 * Leave Agora Audio Call & release tracks
 */
export async function leaveAgoraAudioCall(): Promise<void> {
  stopCallAudioTone();

  if (localAudioTrack) {
    try {
      localAudioTrack.stop();
      localAudioTrack.close();
    } catch (e) {}
    localAudioTrack = null;
  }

  if (remoteAudioTrack) {
    try {
      remoteAudioTrack.stop();
    } catch (e) {}
    remoteAudioTrack = null;
  }

  if (rtcClient) {
    try {
      await rtcClient.leave();
    } catch (e) {}
    rtcClient = null;
  }
}

/**
 * Access active local microphone track
 */
export function getLocalAudioTrack(): IMicrophoneAudioTrack | null {
  return localAudioTrack;
}

/**
 * Access active remote audio track
 */
export function getRemoteAudioTrack(): IRemoteAudioTrack | null {
  return remoteAudioTrack;
}

/**
 * Adjust remote playback volume for speaker / earpiece modes.
 * @param volume Integer 0 to 100 (100 = full speaker, 30 = gentle earpiece)
 */
export function setPlaybackVolume(volume: number): void {
  if (remoteAudioTrack) {
    try {
      const clamped = Math.max(0, Math.min(100, volume));
      remoteAudioTrack.setVolume(clamped);
    } catch (err) {
      console.warn('[Agora] Volume adjustment error:', err);
    }
  }
}

/**
 * Toggle Speakerphone mode: High volume (100%) vs Earpiece/Normal volume (35%)
 */
export function setSpeakerphoneOn(isSpeaker: boolean): void {
  setPlaybackVolume(isSpeaker ? 100 : 35);
}

// In-browser Call Audio Recorder (MediaRecorder on mixed tracks)
let activeMediaRecorder: MediaRecorder | null = null;
let recordedAudioChunks: Blob[] = [];

/**
 * Start In-Call Audio Recording (Mixes local mic and remote audio)
 */
export function startCallRecording(): boolean {
  try {
    if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
      return true;
    }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return false;

    const recordCtx = new AudioCtx();
    const destinationNode = recordCtx.createMediaStreamDestination();

    // 1. Add Local Mic Stream
    if (localAudioTrack) {
      const localMediaTrack = localAudioTrack.getMediaStreamTrack();
      if (localMediaTrack) {
        const localSource = recordCtx.createMediaStreamSource(new MediaStream([localMediaTrack]));
        localSource.connect(destinationNode);
      }
    }

    // 2. Add Remote Audio Stream
    if (remoteAudioTrack) {
      const remoteMediaTrack = remoteAudioTrack.getMediaStreamTrack();
      if (remoteMediaTrack) {
        const remoteSource = recordCtx.createMediaStreamSource(new MediaStream([remoteMediaTrack]));
        remoteSource.connect(destinationNode);
      }
    }

    const mixedStream = destinationNode.stream;
    recordedAudioChunks = [];
    activeMediaRecorder = new MediaRecorder(mixedStream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
    });

    activeMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedAudioChunks.push(e.data);
      }
    };

    activeMediaRecorder.start(1000);
    return true;
  } catch (err) {
    console.warn('[Agora] Call recording start error:', err);
    return false;
  }
}

/**
 * Stop Call Recording and return downloaded audio or blob
 */
export function stopCallRecording(autoDownload = true, filenamePrefix = 'Vanjari_Jodi_Call'): Blob | null {
  try {
    if (!activeMediaRecorder) return null;
    if (activeMediaRecorder.state !== 'inactive') {
      activeMediaRecorder.stop();
    }
    const audioBlob = new Blob(recordedAudioChunks, { type: 'audio/webm' });
    activeMediaRecorder = null;

    if (autoDownload && audioBlob.size > 0) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenamePrefix}_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    }
    return audioBlob;
  } catch (err) {
    console.warn('[Agora] Stop call recording error:', err);
    activeMediaRecorder = null;
    return null;
  }
}

export function isCallRecordingActive(): boolean {
  return Boolean(activeMediaRecorder && activeMediaRecorder.state === 'recording');
}
