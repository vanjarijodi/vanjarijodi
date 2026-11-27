import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  User,
  ShieldCheck,
  Volume2,
  ArrowRightLeft,
  CheckCircle,
  Headphones,
  Disc,
  StopCircle,
} from 'lucide-react';
import {
  joinAgoraAudioCall,
  leaveAgoraAudioCall,
  toggleMicrophoneMuted,
  setSpeakerphoneOn,
  startCallRecording,
  stopCallRecording,
  DEFAULT_AGORA_APP_ID,
} from '../services/agoraClient';
import { playCallAudioTone, stopCallAudioTone, AdminRingtoneType } from '../utils/callAudioTones';
import { triggerDeviceVibration } from '../utils/pushNotificationHelper';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface IncomingCallData {
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
  initiatedAt: number;
  ringtoneType?: AdminRingtoneType;
  vibrationEnabled?: boolean;
}

export const AdminIncomingCallNotification: React.FC = () => {
  const [activeCall, setActiveCall] = useState<IncomingCallData | null>(null);
  const [waitingCall, setWaitingCall] = useState<IncomingCallData | null>(null);
  const [callState, setCallState] = useState<'idle' | 'incoming' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [voiceLevel, setVoiceLevel] = useState<number>(0);
  const [waitingAcknowledged, setWaitingAcknowledged] = useState<boolean>(false);
  const [ringtoneStyle, setRingtoneStyle] = useState<AdminRingtoneType>('whatsapp_style');
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);

  const durationTimerRef = useRef<any>(null);
  const pollTimerRef = useRef<any>(null);
  const vibrationLoopRef = useRef<any>(null);
  const ringTimeoutRef = useRef<any>(null);
  const titleFlashIntervalRef = useRef<any>(null);
  const originalTitleRef = useRef<string>(typeof document !== 'undefined' ? document.title : '');
  const lastWaitingAlertCallIdRef = useRef<string | null>(null);

  // Fetch admin call settings (ringtoneType, vibrationEnabled)
  useEffect(() => {
    fetch('/api/admin/call-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.settings) {
          if (data.settings.ringtoneType) {
            setRingtoneStyle(data.settings.ringtoneType);
            try {
              localStorage.setItem('vj_admin_ringtone_type', data.settings.ringtoneType);
            } catch {}
          }
          if (data.settings.vibrationEnabled !== undefined) {
            setVibrationEnabled(Boolean(data.settings.vibrationEnabled));
          }
        }
      })
      .catch(() => {});
  }, []);

  const stopAllRingingAndVibration = () => {
    stopCallAudioTone();
    if (vibrationLoopRef.current) {
      clearInterval(vibrationLoopRef.current);
      vibrationLoopRef.current = null;
    }
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch {}
    if (titleFlashIntervalRef.current) {
      clearInterval(titleFlashIntervalRef.current);
      titleFlashIntervalRef.current = null;
      if (typeof document !== 'undefined') document.title = originalTitleRef.current;
    }
  };

  const triggerContinuousRingingAndVibration = (incoming: IncomingCallData) => {
    stopAllRingingAndVibration();

    const style =
      incoming.ringtoneType ||
      ((typeof localStorage !== 'undefined' &&
        (localStorage.getItem('vj_admin_ringtone_type') as AdminRingtoneType)) ||
        ringtoneStyle);

    // 1. Continuous looping ringtone audio
    playCallAudioTone('incoming', style);

    // 2. Continuous looping device vibration until Answered, Rejected, or 45s timeout
    const shouldVibrate =
      incoming.vibrationEnabled !== undefined ? Boolean(incoming.vibrationEnabled) : vibrationEnabled;
    if (shouldVibrate) {
      triggerDeviceVibration([800, 400, 800, 400, 800]);
      vibrationLoopRef.current = setInterval(() => {
        try {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([800, 400, 800]);
          }
        } catch {}
      }, 2400);
    }

    // 3. Auto-stop after 45-second timeout if unanswered
    ringTimeoutRef.current = setTimeout(() => {
      stopAllRingingAndVibration();
      setCallState((prev) => (prev === 'incoming' ? 'idle' : prev));
      setActiveCall((prev) => (prev?.callId === incoming.callId ? null : prev));
    }, 45000);

    // 4. Browser / Lock-screen Notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`📞 इनकमिंग कॉल: ${incoming.callerName}`, {
          body: `प्रोफाईल ID: ${incoming.callerId} • मोबाईल: ${incoming.callerMobile || 'N/A'} (${incoming.callerDistrict || 'महाराष्ट्र'})`,
          icon: incoming.callerPhoto || '/icon-192.png',
          tag: 'admin-call-' + incoming.callId,
          requireInteraction: true,
        });
      } catch {}
    }

    // 5. Flash document title
    if (typeof document !== 'undefined') {
      originalTitleRef.current = document.title;
      let flash = false;
      titleFlashIntervalRef.current = setInterval(() => {
        document.title = flash ? `📞 [कॉल येत आहे] ${incoming.callerName}` : `🔔 वंजारी जोडी ॲडमिन कॉल!`;
        flash = !flash;
      }, 800);
    }
  };

  // Real-Time Firestore Listener on `app_config/admin_active_call` for instant wake-up
  useEffect(() => {
    try {
      const callDocRef = doc(db, 'app_config', 'admin_active_call');
      const unsub = onSnapshot(
        callDocRef,
        (snap) => {
          if (!snap.exists()) return;
          const data = snap.data() as IncomingCallData;
          if (!data || !data.callId) return;
          const ageMs = Date.now() - Number(data.initiatedAt || 0);
          if (data.status === 'ringing' && ageMs <= 45000 && callState === 'idle') {
            setActiveCall(data);
            setCallState('incoming');
            triggerContinuousRingingAndVibration(data);
          } else if (
            (data.status === 'ended' || data.status === 'rejected' || data.status === 'missed') &&
            activeCall?.callId === data.callId &&
            callState === 'incoming'
          ) {
            stopAllRingingAndVibration();
            setCallState('idle');
            setActiveCall(null);
          }
        },
        () => {}
      );
      return () => unsub();
    } catch {
      return undefined;
    }
  }, [callState, activeCall?.callId]);

  // Poll for incoming calls & call waiting every 1.5s
  useEffect(() => {
    const checkIncomingAndQueue = async () => {
      // 1. If currently connected in a call
      if (callState === 'connected' && activeCall) {
        try {
          const res = await fetch(`/api/agora/call/status/${activeCall.callId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.call && (data.call.status === 'ended' || data.call.status === 'rejected')) {
              handleEndCall();
              return;
            }
          }

          const queueRes = await fetch('/api/agora/call/incoming');
          if (queueRes.ok) {
            const qData = await queueRes.json();
            const waitingList: IncomingCallData[] =
              qData.queue?.waitingCalls ||
              (Array.isArray(qData.calls) ? qData.calls.filter((c: any) => c.status === 'waiting') : []);

            if (waitingList.length > 0) {
              const currentWaiting = waitingList[0];
              setWaitingCall(currentWaiting);

              if (lastWaitingAlertCallIdRef.current !== currentWaiting.callId) {
                lastWaitingAlertCallIdRef.current = currentWaiting.callId;
                setWaitingAcknowledged(false);
                playCallAudioTone('waiting');
                triggerDeviceVibration([300, 100, 300]);

                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                  try {
                    new Notification(`⏳ दुसरा कॉल वेटिंगवर: ${currentWaiting.callerName}`, {
                      body: `मोबाईल: ${currentWaiting.callerMobile || 'N/A'}, जिल्हा: ${currentWaiting.callerDistrict || 'महाराष्ट्र'}. कॉल वेटिंगवर आहे.`,
                      icon: currentWaiting.callerPhoto || '/icon-192.png',
                      tag: 'admin-waiting-call-' + currentWaiting.callId,
                    });
                  } catch {}
                }
              }
            } else {
              setWaitingCall(null);
            }
          }
        } catch {}
        return;
      }

      // 2. If idle or incoming: poll for fresh incoming calls
      try {
        const res = await fetch('/api/agora/call/incoming');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.calls) && data.calls.length > 0) {
            const incoming = data.calls.find((c: any) => c.status === 'ringing') || data.calls[0];

            if (incoming.status === 'ringing' && callState === 'idle') {
              setActiveCall(incoming);
              setCallState('incoming');
              triggerContinuousRingingAndVibration(incoming);
            }
          } else if (callState === 'incoming') {
            stopAllRingingAndVibration();
            setCallState('idle');
            setActiveCall(null);
          }
        }
      } catch {}
    };

    pollTimerRef.current = setInterval(checkIncomingAndQueue, 1500);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      stopAllRingingAndVibration();
    };
  }, [callState, activeCall]);

  // Clean timer format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Accept incoming ringing call
  const handleAcceptCall = async () => {
    if (!activeCall) return;
    stopAllRingingAndVibration();

    try {
      const res = await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: activeCall.callId, action: 'accept', uid: 1001 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        handleEndCall();
        return;
      }

      setCallState('connected');
      setCallDuration(0);

      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      try {
        await joinAgoraAudioCall({
          appId: data.appId || DEFAULT_AGORA_APP_ID,
          channelName: activeCall.channelName,
          token: data.token,
          uid: 1001,
          onRemoteUserLeft: () => {
            handleEndCall();
          },
          onVolumeChange: (vol) => {
            setVoiceLevel(vol);
          },
          onMicDenied: () => {
            console.warn('[AdminIncomingCall] Admin mic permission was denied');
          },
          onTokenError: () => {
            console.warn('[AdminIncomingCall] Agora App Certificate token required');
          },
        });
      } catch (agoraErr) {
        console.warn('[AdminIncomingCall] RTC audio join warning:', agoraErr);
      }
    } catch (err: any) {
      console.error('[AdminIncomingCall] Error accepting call:', err);
      handleEndCall();
    }
  };

  // Switch to Call Waiting caller
  const handleSwitchToWaitingCall = async () => {
    if (!waitingCall) return;
    stopAllRingingAndVibration();
    leaveAgoraAudioCall();

    try {
      const res = await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: waitingCall.callId, action: 'switch_to_waiting', uid: 1001 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.call) {
        handleEndCall();
        return;
      }

      const nextCall = waitingCall;
      setActiveCall(nextCall);
      setWaitingCall(null);
      setCallDuration(0);
      setWaitingAcknowledged(false);

      try {
        await joinAgoraAudioCall({
          appId: data.appId || DEFAULT_AGORA_APP_ID,
          channelName: nextCall.channelName,
          token: data.token,
          uid: 1001,
          onRemoteUserLeft: () => {
            handleEndCall();
          },
          onVolumeChange: (vol) => {
            setVoiceLevel(vol);
          },
        });
      } catch (e) {
        console.warn('[AdminIncomingCall] Switch call RTC join warning:', e);
      }
    } catch (e) {
      console.error('Error switching to waiting call:', e);
    }
  };

  const handleAcknowledgeWaiting = async () => {
    if (!waitingCall) return;
    try {
      await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: waitingCall.callId, action: 'acknowledge_waiting' }),
      });
      setWaitingAcknowledged(true);
    } catch {}
  };

  const handleRejectWaitingCall = async () => {
    if (!waitingCall) return;
    try {
      await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: waitingCall.callId, action: 'reject' }),
      });
      setWaitingCall(null);
    } catch {}
  };

  // Reject / Decline incoming call
  const handleRejectCall = async () => {
    if (!activeCall) return;
    stopAllRingingAndVibration();

    try {
      await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: activeCall.callId, action: 'reject' }),
      });
    } catch {}

    setCallState('idle');
    setActiveCall(null);
  };

  // End active call
  const handleEndCall = async () => {
    stopAllRingingAndVibration();
    leaveAgoraAudioCall();

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (activeCall) {
      try {
        await fetch('/api/agora/call/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: activeCall.callId, action: 'end' }),
        });
      } catch {}
    }

    playCallAudioTone('end');

    if (waitingCall) {
      const promotedCall = waitingCall;
      setActiveCall(promotedCall);
      setWaitingCall(null);
      setCallState('incoming');
      setCallDuration(0);
      triggerContinuousRingingAndVibration(promotedCall);
    } else {
      setCallState('idle');
      setActiveCall(null);
      setCallDuration(0);
    }
  };

  const handleToggleMute = async () => {
    const nextMuted = !isMuted;
    await toggleMicrophoneMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const handleToggleSpeaker = () => {
    const nextSpeaker = !isSpeakerOn;
    setIsSpeakerOn(nextSpeaker);
    setSpeakerphoneOn(nextSpeaker);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopCallRecording(true, `Vanjari_Admin_Call_${activeCall?.callerName || 'Member'}`);
      setIsRecording(false);
    } else {
      const ok = startCallRecording();
      if (ok) {
        setIsRecording(true);
      }
    }
  };

  if (callState === 'idle' || !activeCall) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-b from-[#071E18] via-[#0B141A] to-black text-white select-none animate-fade-in">
      <div className="w-full h-full max-w-md mx-auto flex flex-col items-center justify-between px-6 py-8 sm:my-6 sm:h-[90vh] sm:max-h-[680px] sm:rounded-[2.5rem] sm:border-2 sm:border-emerald-500/40 sm:shadow-[0_0_80px_rgba(16,185,129,0.25)] relative overflow-hidden">
        
        {/* Top WhatsApp-Style Encrypted / Live Call Header */}
        <div className="w-full text-center space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {callState === 'incoming'
                ? '📞 वंजारी जोडी — इनकमिंग ऑडिओ कॉल'
                : '🟢 वंजारी जोडी — थेट संभाषण सुरू'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Agora HD Voice • Admin Support Desk</span>
          </p>
        </div>

        {/* Caller Avatar with Concentric Pulsing Rings */}
        <div className="flex flex-col items-center my-2">
          <div className="relative flex items-center justify-center my-4">
            {callState === 'incoming' && (
              <>
                <div className="absolute -inset-6 rounded-full bg-emerald-500/15 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-emerald-400/25 animate-pulse" />
              </>
            )}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-emerald-400 shadow-2xl bg-slate-800 flex items-center justify-center">
              {activeCall.callerPhoto ? (
                <img
                  src={activeCall.callerPhoto}
                  alt={activeCall.callerName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-emerald-300/80" />
              )}
            </div>
          </div>

          {/* Caller Full Name, Profile ID & Mobile Number */}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight text-center mt-2">
            {activeCall.callerName}
          </h2>

          <div className="mt-3 w-full min-w-[270px] bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">प्रोफाईल आयडी (Profile ID):</span>
              <span className="font-mono font-black text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                {activeCall.callerId || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">मोबाईल नंबर (Mobile):</span>
              <span className="font-mono font-black text-emerald-300 text-sm">
                📱 {activeCall.callerMobile || 'उपलब्ध नाही'}
              </span>
            </div>
            {activeCall.callerDistrict && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">जिल्हा / शहर:</span>
                <span className="text-white font-bold">{activeCall.callerDistrict}</span>
              </div>
            )}
          </div>

          {/* Ringing Status or Active Call Timer */}
          <div className="mt-3">
            {callState === 'incoming' ? (
              <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-300 bg-emerald-950/90 px-4 py-1.5 rounded-full border border-emerald-500/50 animate-pulse">
                <span>🔔 सतत रिंग आणि व्हायब्रेशन सुरू आहे...</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-base font-black text-emerald-300 bg-emerald-950/90 px-5 py-1.5 rounded-full border border-emerald-500/60 font-mono">
                <span>{formatTime(callDuration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Call Waiting Banner when already connected */}
        {callState === 'connected' && waitingCall && (
          <div className="w-full my-2 p-3 bg-gradient-to-r from-amber-950/90 via-orange-950/95 to-amber-900/90 border-2 border-amber-400 rounded-2xl text-left shadow-2xl">
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-700/60">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  ⚠️ दुसरा कॉल वेटिंगवर आहे!
                </span>
              </div>
              <span className="text-[10px] bg-black/50 text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/40">
                Call Waiting
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-amber-400/80 shrink-0 flex items-center justify-center">
                  {waitingCall.callerPhoto ? (
                    <img src={waitingCall.callerPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-amber-200" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-xs text-white leading-tight">{waitingCall.callerName}</p>
                  <p className="text-[11px] text-amber-200 font-mono">
                    ID: {waitingCall.callerId} • {waitingCall.callerMobile || 'मोबाईल उपलब्ध'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleSwitchToWaitingCall}
                className="flex-1 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-black rounded-xl shadow flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>हा कॉल उचला (स्विच)</span>
              </button>

              {!waitingAcknowledged ? (
                <button
                  type="button"
                  onClick={handleAcknowledgeWaiting}
                  className="py-1.5 px-2.5 bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-bold rounded-xl border border-amber-400/50 cursor-pointer transition"
                >
                  थांबवा
                </button>
              ) : (
                <span className="py-1 px-2 text-[10px] text-emerald-300 bg-emerald-950/60 rounded-lg flex items-center gap-1 border border-emerald-600/40">
                  <CheckCircle className="w-3 h-3" />
                  <span>प्रतीक्षेत</span>
                </span>
              )}

              <button
                type="button"
                onClick={handleRejectWaitingCall}
                className="py-1.5 px-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-bold rounded-xl border border-rose-700/50 cursor-pointer transition"
              >
                नाकारा
              </button>
            </div>
          </div>
        )}

        {/* Voice Visualizer when Connected */}
        {callState === 'connected' && (
          <div className="flex items-center justify-center space-x-1 h-5 my-1">
            {[30, 60, 90, 50, 80, 40, 70].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-emerald-400 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(4, (h * (voiceLevel + 20)) / 100)}px`,
                  opacity: voiceLevel > 5 ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom Large WhatsApp-Style Action Controls */}
        <div className="w-full pt-4 pb-2">
          {callState === 'incoming' ? (
            <div className="flex items-center justify-around w-full px-4">
              {/* Large Red Reject Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectCall}
                  className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-transform active:scale-90 cursor-pointer border-2 border-rose-300"
                  title="कॉल नाकारा (Reject)"
                >
                  <PhoneOff className="w-9 h-9" />
                </button>
                <span className="text-xs font-black text-rose-300 tracking-wide">
                  नाकारा (Reject)
                </span>
              </div>

              {/* Large Green Accept Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptCall}
                  className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.75)] transition-transform active:scale-90 cursor-pointer border-2 border-emerald-200 animate-bounce"
                  title="कॉल उचला (Accept)"
                >
                  <Phone className="w-9 h-9" />
                </button>
                <span className="text-xs font-black text-emerald-300 tracking-wide">
                  उचला (Accept)
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              {/* Mute Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isMuted ? 'bg-amber-600 text-white border-2 border-amber-300' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                title={isMuted ? 'माईक चालू करा' : 'माईक बंद करा (Mute)'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Speakerphone Toggle */}
              <button
                type="button"
                onClick={handleToggleSpeaker}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isSpeakerOn ? 'bg-emerald-600 text-white border-2 border-emerald-300 ring-2 ring-emerald-400/50' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                title={isSpeakerOn ? 'स्पीकर चालू आहे (Speakerphone ON)' : 'स्पीकर सुरू करा'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5 text-white" /> : <Headphones className="w-5 h-5" />}
              </button>

              {/* Call Recording Toggle */}
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isRecording ? 'bg-rose-600 text-white border-2 border-rose-300 ring-2 ring-rose-400/60 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                title={isRecording ? 'कॉल रेकॉर्डिंग थांबवा व सेव्ह करा' : 'कॉल रेकॉर्ड करा'}
              >
                {isRecording ? <StopCircle className="w-5 h-5 text-white" /> : <Disc className="w-5 h-5 text-amber-300" />}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-15 h-15 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer border-2 border-rose-400 ml-1"
                title="कॉल संपवा (End Call)"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
