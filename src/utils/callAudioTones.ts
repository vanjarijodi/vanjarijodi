/**
 * Pure Web Audio API tone synthesizer for Vanjari Jodi calling tones.
 * Independent of Agora RTC SDK to keep bundles lightweight and prevent chunk loading delays.
 */

let audioContext: AudioContext | null = null;
let ringOscillator: OscillatorNode | null = null;
let ringInterval: any = null;

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

export type AdminRingtoneType = 'classic' | 'whatsapp_style' | 'soft_bell';

export function playCallAudioTone(
  type: 'ringback' | 'incoming' | 'end' | 'waiting',
  ringtoneType: AdminRingtoneType = 'whatsapp_style'
) {
  stopCallAudioTone();

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();

    if (type === 'ringback') {
      // Outgoing phone ring: 400Hz + 450Hz beep for 1.2s, silence 2s
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
      // Gentle telecom call waiting pip-pip tone
      const playWaitingPip = () => {
        if (!audioContext || audioContext.state === 'closed') return;
        const now = audioContext.currentTime;

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
      const effectiveStyle =
        ringtoneType ||
        ((typeof localStorage !== 'undefined' &&
          (localStorage.getItem('vj_admin_ringtone_type') as AdminRingtoneType)) ||
          'whatsapp_style');

      const playChime = () => {
        if (!audioContext || audioContext.state === 'closed') return;

        if (effectiveStyle === 'classic') {
          // Classic Dual-Tone Telephone Ring (440Hz + 480Hz double cadence)
          [0, 0.6].forEach((offset) => {
            if (!audioContext || audioContext.state === 'closed') return;
            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const startAt = audioContext.currentTime + offset;
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(440, startAt);
            osc2.frequency.setValueAtTime(480, startAt);
            gain.gain.setValueAtTime(0.14, startAt);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.45);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioContext.destination);
            osc1.start(startAt);
            osc2.start(startAt);
            osc1.stop(startAt + 0.45);
            osc2.stop(startAt + 0.45);
          });
        } else if (effectiveStyle === 'soft_bell') {
          // Soft Harmonic Temple/Crystal Bell (587.33Hz -> 880Hz -> 1174.66Hz)
          const notes = [587.33, 880, 1174.66];
          notes.forEach((freq, idx) => {
            if (!audioContext || audioContext.state === 'closed') return;
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const startAt = audioContext.currentTime + idx * 0.22;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startAt);
            gain.gain.setValueAtTime(0.12, startAt);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.55);
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start(startAt);
            osc.stop(startAt + 0.55);
          });
        } else {
          // WhatsApp-style upbeat rhythmic marimba chime (523Hz -> 659Hz -> 784Hz -> 1046Hz -> 784Hz -> 1046Hz)
          const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            if (!audioContext || audioContext.state === 'closed') return;
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const startAt = audioContext.currentTime + idx * 0.13;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startAt);
            gain.gain.setValueAtTime(0.15, startAt);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.32);

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start(startAt);
            osc.stop(startAt + 0.32);
          });
        }
      };

      playChime();
      ringInterval = setInterval(playChime, 2000);
    } else if (type === 'end') {
      // Disconnect beep
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
