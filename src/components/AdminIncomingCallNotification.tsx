import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  User,
  ShieldCheck,
  MapPin,
  Volume2,
  Clock,
  Radio,
  ArrowRightLeft,
  CheckCircle,
} from 'lucide-react';
import {
  joinAgoraAudioCall,
  leaveAgoraAudioCall,
  toggleMicrophoneMuted,
  playCallAudioTone,
  stopCallAudioTone,
  DEFAULT_AGORA_APP_ID,
} from '../services/agoraClient';
import { triggerDeviceVibration } from '../utils/pushNotificationHelper';

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
}

export const AdminIncomingCallNotification: React.FC = () => {
  const [activeCall, setActiveCall] = useState<IncomingCallData | null>(null);
  const [waitingCall, setWaitingCall] = useState<IncomingCallData | null>(null);
  const [callState, setCallState] = useState<'idle' | 'incoming' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [voiceLevel, setVoiceLevel] = useState<number>(0);
  const [waitingAcknowledged, setWaitingAcknowledged] = useState<boolean>(false);

  const durationTimerRef = useRef<any>(null);
  const pollTimerRef = useRef<any>(null);
  const titleFlashIntervalRef = useRef<any>(null);
  const originalTitleRef = useRef<string>(typeof document !== 'undefined' ? document.title : '');
  const lastWaitingAlertCallIdRef = useRef<string | null>(null);

  // Poll for incoming calls & call waiting every 1.5s
  useEffect(() => {
    const checkIncomingAndQueue = async () => {
      // 1. If currently connected in a call
      if (callState === 'connected' && activeCall) {
        try {
          // Check status of current active call
          const res = await fetch(`/api/agora/call/status/${activeCall.callId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.call && (data.call.status === 'ended' || data.call.status === 'rejected')) {
              handleEndCall();
              return;
            }
          }

          // Also check for waiting calls (दुसरा कॉल वेटिंगवर येत आहे का)
          const queueRes = await fetch('/api/agora/call/incoming');
          if (queueRes.ok) {
            const qData = await queueRes.json();
            const waitingList: IncomingCallData[] =
              qData.queue?.waitingCalls ||
              (Array.isArray(qData.calls) ? qData.calls.filter((c: any) => c.status === 'waiting') : []);

            if (waitingList.length > 0) {
              const currentWaiting = waitingList[0];
              setWaitingCall(currentWaiting);

              // If a new waiting caller just arrived, alert admin with tone & vibration
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
                  } catch (e) {}
                }
              }
            } else {
              setWaitingCall(null);
            }
          }
        } catch (e) {}
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
              playCallAudioTone('incoming');
              triggerDeviceVibration([500, 200, 500, 200, 500]);

              // Browser notification
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                try {
                  new Notification(`📞 इन-कॉल: ${incoming.callerName}`, {
                    body: `वंजारी जोडी ॲपमधून थेट ऑडिओ कॉल येत आहे. मोबाईल: ${incoming.callerMobile || 'N/A'}, जिल्हा: ${incoming.callerDistrict || 'महाराष्ट्र'}`,
                    icon: incoming.callerPhoto || '/icon-192.png',
                    tag: 'admin-call-' + incoming.callId,
                  });
                } catch (notifErr) {}
              }

              // Flash document title
              if (typeof document !== 'undefined') {
                originalTitleRef.current = document.title;
                let flash = false;
                titleFlashIntervalRef.current = setInterval(() => {
                  document.title = flash ? `📞 [कॉल येत आहे] ${incoming.callerName}` : `🔔 वंजारी जोडी ॲडमिन कॉल!`;
                  flash = !flash;
                }, 800);
              }
            }
          } else if (callState === 'incoming') {
            // Ringing timed out or cancelled by caller
            stopCallAudioTone();
            if (titleFlashIntervalRef.current) {
              clearInterval(titleFlashIntervalRef.current);
              titleFlashIntervalRef.current = null;
              if (typeof document !== 'undefined') document.title = originalTitleRef.current;
            }
            setCallState('idle');
            setActiveCall(null);
          }
        }
      } catch (e) {}
    };

    pollTimerRef.current = setInterval(checkIncomingAndQueue, 1500);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (titleFlashIntervalRef.current) {
        clearInterval(titleFlashIntervalRef.current);
        if (typeof document !== 'undefined') document.title = originalTitleRef.current;
      }
      stopCallAudioTone();
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
    stopCallAudioTone();

    if (titleFlashIntervalRef.current) {
      clearInterval(titleFlashIntervalRef.current);
      titleFlashIntervalRef.current = null;
      if (typeof document !== 'undefined') document.title = originalTitleRef.current;
    }

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

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Join Agora Voice Channel as Admin (UID: 1001)
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
        });
      } catch (agoraErr) {
        console.warn('[AdminIncomingCall] RTC audio join warning:', agoraErr);
      }
    } catch (err: any) {
      console.error('[AdminIncomingCall] Error accepting call:', err);
      handleEndCall();
    }
  };

  // Switch to Call Waiting caller (सध्याचा कॉल संपवून नवीन उचला)
  const handleSwitchToWaitingCall = async () => {
    if (!waitingCall) return;
    stopCallAudioTone();
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

      // Join Agora audio channel for the new call
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

  // Acknowledge waiting call (प्रतीक्षेत ठेवा)
  const handleAcknowledgeWaiting = async () => {
    if (!waitingCall) return;
    try {
      await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: waitingCall.callId, action: 'acknowledge_waiting' }),
      });
      setWaitingAcknowledged(true);
    } catch (e) {}
  };

  // Reject / Decline call waiting
  const handleRejectWaitingCall = async () => {
    if (!waitingCall) return;
    try {
      await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: waitingCall.callId, action: 'reject' }),
      });
      setWaitingCall(null);
    } catch (e) {}
  };

  // Reject / Decline incoming call
  const handleRejectCall = async () => {
    if (!activeCall) return;
    stopCallAudioTone();

    try {
      await fetch('/api/agora/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: activeCall.callId, action: 'reject' }),
      });
    } catch (e) {}

    setCallState('idle');
    setActiveCall(null);
  };

  // End active call
  const handleEndCall = async () => {
    stopCallAudioTone();
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
      } catch (e) {}
    }

    playCallAudioTone('end');

    // If there is a waiting call, immediately promote to incoming ringing call!
    if (waitingCall) {
      const promotedCall = waitingCall;
      setActiveCall(promotedCall);
      setWaitingCall(null);
      setCallState('incoming');
      setCallDuration(0);
      playCallAudioTone('incoming');
      triggerDeviceVibration([500, 200, 500]);
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

  if (callState === 'idle' || !activeCall) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-black text-white rounded-3xl p-6 shadow-2xl border-2 border-amber-400 text-center flex flex-col items-center justify-between min-h-[460px] relative">
        {/* Header */}
        <div className="w-full flex items-center justify-between text-xs text-amber-300 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{callState === 'incoming' ? '📞 सदस्याचा इन-कॉल येत आहे!' : '🟢 कॉल चालू आहे'}</span>
          </div>
          <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-400/40">
            Agora RTC
          </span>
        </div>

        {/* Member Photo & Avatar */}
        <div className="relative my-3">
          {callState === 'incoming' && (
            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping" />
          )}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-amber-400 shadow-xl bg-slate-800 flex items-center justify-center mx-auto">
            {activeCall.callerPhoto ? (
              <img
                src={activeCall.callerPhoto}
                alt={activeCall.callerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>
        </div>

        {/* Caller Info */}
        <div className="space-y-1 w-full">
          <h3 className="text-xl font-bold text-white font-serif">{activeCall.callerName}</h3>
          {activeCall.callerMobile && (
            <p className="text-xs font-mono text-amber-300 font-bold tracking-wider">
              📱 {activeCall.callerMobile}
            </p>
          )}
          {activeCall.callerDistrict && (
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{activeCall.callerDistrict}</span>
            </p>
          )}

          {/* Connected Timer or Ringing indicator */}
          <div className="pt-1.5">
            {callState === 'incoming' ? (
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/50 animate-pulse">
                <span>रिंग होत आहे (Incoming Audio Call)...</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 text-sm font-black text-emerald-300 bg-emerald-950/80 px-4 py-1 rounded-full border border-emerald-500/60 font-mono">
                <span>{formatTime(callDuration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* CALL WAITING NOTIFICATION BANNER (दुसरा कॉल वेटिंगवर येत आहे) */}
        {/* ============================================================== */}
        {callState === 'connected' && waitingCall && (
          <div className="w-full my-3 p-3 bg-gradient-to-r from-amber-950/90 via-orange-950/95 to-amber-900/90 border-2 border-amber-400 rounded-2xl text-left shadow-2xl animate-bounce-once">
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
                    {waitingCall.callerMobile || 'मोबाईल उपलब्ध'} • {waitingCall.callerDistrict || 'महाराष्ट्र'}
                  </p>
                </div>
              </div>
            </div>

            {/* Waiting Actions for Admin */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleSwitchToWaitingCall}
                className="flex-1 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-black rounded-xl shadow flex items-center justify-center gap-1 cursor-pointer transition"
                title="हा कॉल उचला आणि सध्याचा कॉल संपवा"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>हा कॉल उचला (स्विच)</span>
              </button>

              {!waitingAcknowledged ? (
                <button
                  type="button"
                  onClick={handleAcknowledgeWaiting}
                  className="py-1.5 px-2.5 bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-bold rounded-xl border border-amber-400/50 cursor-pointer transition"
                  title="प्रतीक्षेत ठेवा"
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
                title="वेटिंग कॉल नाकारा"
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

        {/* Action Buttons */}
        <div className="w-full pt-3 flex items-center justify-center space-x-6 border-t border-slate-800">
          {callState === 'incoming' ? (
            <>
              {/* Reject Button */}
              <button
                type="button"
                onClick={handleRejectCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer border-2 border-rose-400"
                title="कॉल नाकारा (Decline)"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              {/* Accept Button */}
              <button
                type="button"
                onClick={handleAcceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer border-2 border-emerald-300 animate-bounce"
                title="कॉल उचला (Accept)"
              >
                <Phone className="w-7 h-7" />
              </button>
            </>
          ) : (
            <>
              {/* Mute Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isMuted ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}
                title={isMuted ? 'माईक चालू करा' : 'माईक बंद करा (Mute)'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer border-2 border-rose-400"
                title="कॉल संपवा (End Call)"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
