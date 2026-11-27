import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  User,
  AlertTriangle,
  Loader2,
  Sparkles,
  MessageSquare,
  RotateCcw,
  Clock,
  Radio,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import {
  joinAgoraAudioCall,
  leaveAgoraAudioCall,
  toggleMicrophoneMuted,
  playCallAudioTone,
  stopCallAudioTone,
  getAgoraConfig,
  setSpeakerphoneOn,
  DEFAULT_AGORA_APP_ID,
} from '../services/agoraClient';
import { useApp } from '../context/AppContext';

interface AudioCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'admin' | 'member';
  adminName?: string;
  adminPhoto?: string;
}

export const AudioCallModal: React.FC<AudioCallModalProps> = ({
  isOpen,
  onClose,
  adminName = 'वंजारी जोडी ॲडमिन सपोर्ट',
  adminPhoto,
}) => {
  const { currentUser, siteConfig } = useApp();

  const [callState, setCallState] = useState<
    'idle' | 'mic_permission_required' | 'initiating' | 'ringing' | 'waiting' | 'connected' | 'ended' | 'rejected' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRequestingMic, setIsRequestingMic] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [waitingDuration, setWaitingDuration] = useState<number>(0);
  const [voiceLevel, setVoiceLevel] = useState<number>(0);
  const [callId, setCallId] = useState<string | null>(null);
  const [waitingOrder, setWaitingOrder] = useState<number>(1);
  const [activeCallerName, setActiveCallerName] = useState<string>('');

  const durationTimerRef = useRef<any>(null);
  const waitingTimerRef = useRef<any>(null);
  const pollStatusTimerRef = useRef<any>(null);

  // Clean format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Check microphone permission and handle start
  useEffect(() => {
    if (isOpen) {
      checkPermissionAndInitiate();
    } else {
      endCallCleanup();
    }

    return () => {
      endCallCleanup();
    };
  }, [isOpen]);

  const endCallCleanup = () => {
    stopCallAudioTone();
    leaveAgoraAudioCall();
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
    if (pollStatusTimerRef.current) clearInterval(pollStatusTimerRef.current);
    setCallDuration(0);
    setWaitingDuration(0);
    setVoiceLevel(0);
    setIsRequestingMic(false);
  };

  const checkPermissionAndInitiate = async () => {
    setErrorMessage(null);
    setCallDuration(0);
    setWaitingDuration(0);

    if (!currentUser) {
      setCallState('error');
      setErrorMessage('कॉल करण्यासाठी आधी मोफत नोंदणी किंवा लॉगिन करा.');
      return;
    }

    // Check navigator.permissions if available
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const perm = await navigator.permissions.query({ name: 'microphone' as any });
        if (perm.state === 'granted') {
          // Microphone is already allowed, start call directly
          startSupportCall();
          return;
        } else if (perm.state === 'denied') {
          setCallState('error');
          setErrorMessage(
            'मायक्रोफोन परवानगी ब्राऊझर सेटिंग्जमध्ये ब्लॉक केलेली आहे. कृपया ब्राऊझर पत्ता पट्टी (Address Bar) मधील 🔒 कुलूप किंवा माईक चिन्हावर क्लिक करून "Allow" करा व पुन्हा प्रयत्न करा.'
          );
          return;
        }
      }
    } catch (e) {}

    // If permission state is prompt, unconfirmed, or permissions API not supported:
    // Show dedicated mic prompt so user click directly triggers browser native permission popup
    setCallState('mic_permission_required');
  };

  // Directly triggered from user click so browser ALWAYS presents native mic permission dialog
  const handleRequestMicAndStartCall = async () => {
    setIsRequestingMic(true);
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('आपल्या ब्राउझरमध्ये मायक्रोफोन सपोर्ट उपलब्ध नाही. कृपया गुगल क्रोम वापरा.');
      }

      // Directly invoke getUserMedia on user click gesture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop test stream tracks cleanly
      stream.getTracks().forEach((track) => track.stop());
      setIsRequestingMic(false);

      // Permission granted! Start call
      startSupportCall();
    } catch (err: any) {
      setIsRequestingMic(false);
      console.warn('[AudioCallModal] User mic permission prompt result:', err?.name || err?.message);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        String(err?.message || '').toLowerCase().includes('denied');

      setCallState('error');
      if (isDenied) {
        setErrorMessage(
          'मायक्रोफोन परवानगी नाकारली गेली आहे. कृपया ब्राऊझर पत्ता पट्टी (Address Bar) मधील 🔒 किंवा माईक आयकॉनवर क्लिक करून "Allow" निवडा व पुन्हा प्रयत्न करा.'
        );
      } else {
        setErrorMessage(err?.message || 'मायक्रोफोन सुरू करता आला नाही. कृपया माईक किंवा हेडफोन तपासा.');
      }
    }
  };

  const startSupportCall = async () => {
    setCallState('initiating');
    setErrorMessage(null);
    setCallDuration(0);
    setWaitingDuration(0);

    if (!currentUser) {
      setCallState('error');
      setErrorMessage('कॉल करण्यासाठी आधी मोफत नोंदणी किंवा लॉगिन करा.');
      return;
    }

    // 1. Get Agora public config
    const agoraConfig = await getAgoraConfig();
    const effectiveAppId = agoraConfig?.appId?.trim() || DEFAULT_AGORA_APP_ID;

    // Only block if explicitly disabled completely
    if (agoraConfig?.enabled === false) {
      setCallState('error');
      setErrorMessage('सध्या कॉलिंग सेवा तात्पुरती बंद आहे. कृपया थेट व्हॉट्सॲपवर संपर्क साधा.');
      return;
    }

    // Only block if admin status is strictly offline
    if (agoraConfig?.adminStatus === 'offline') {
      setCallState('error');
      setErrorMessage('ॲडमिन सध्या ऑफलाईन आहेत. कृपया थेट व्हॉट्सॲपवर संपर्क साधा किंवा थोड्या वेळाने प्रयत्न करा.');
      return;
    }

    // If outside operating hours and schedule is enabled
    if (agoraConfig?.availabilityStatus === 'off_hours' && agoraConfig?.isAvailableNow === false) {
      setCallState('error');
      setErrorMessage(agoraConfig.availabilityMessage || 'सध्या कॉलिंग वेळ संपली आहे. कृपया अधिकृत वेळेत संपर्क करा.');
      return;
    }

    try {
      // 2. Initiate call on backend
      const res = await fetch('/api/agora/call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: currentUser.id,
          callerName: currentUser.fullName || 'सन्माननीय सदस्य',
          callerMobile: currentUser.mobile || currentUser.mobileNumber || '',
          callerPhoto: (currentUser.photos && currentUser.photos[0]) || (currentUser as any).profilePhoto || '',
          callerDistrict: currentUser.district || '',
          callerTier: currentUser.membershipTier || 'free',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.call) {
        setCallState('error');
        setErrorMessage(data.error || 'कॉल सुरू करता आला नाही.');
        return;
      }

      const activeCall = data.call;
      setCallId(activeCall.callId);

      // Check if call is placed on WAITING (admin currently talking to someone else)
      if (data.isWaiting || activeCall.status === 'waiting') {
        setCallState('waiting');
        setWaitingOrder(data.waitingOrder || activeCall.waitingOrder || 1);
        setActiveCallerName(data.activeCallerName || activeCall.activeCallerName || 'दुसऱ्या सदस्याशी');
        playCallAudioTone('waiting');
        if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
        waitingTimerRef.current = setInterval(() => {
          setWaitingDuration((prev) => prev + 1);
        }, 1000);
      } else {
        setCallState('ringing');
        playCallAudioTone('ringback');
      }

      // Join Agora audio channel on caller side in advance so ready when accepted
      const callerUid = Math.floor(100000 + Math.random() * 899999);
      try {
        await joinAgoraAudioCall({
          appId: data.appId || effectiveAppId,
          channelName: activeCall.channelName,
          token: data.token,
          uid: callerUid,
          onRemoteUserJoined: () => {
            stopCallAudioTone();
            if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
            setCallState('connected');
            startDurationTimer();
          },
          onRemoteUserLeft: () => {
            handleCallEndedByAdmin();
          },
          onVolumeChange: (vol) => {
            setVoiceLevel(vol);
          },
          onMicDenied: () => {
            stopCallAudioTone();
            setCallState('error');
            setErrorMessage(
              'मायक्रोफोन परवानगी नाकारली गेली आहे. कृपया ब्राऊझर पत्ता पट्टी (Address Bar) मधील कुलूप 🔒 किंवा माईक चिन्हावर क्लिक करून परवानगी द्या.'
            );
          },
          onTokenError: () => {
            console.warn('[AudioCallModal] Agora token authentication required');
            stopCallAudioTone();
            setCallState('error');
            setErrorMessage(
              'ऑडिओ सर्व्हर सुरक्षा टोकन प्रमाणीकरण प्रक्रियेत आहे (Agora Certificate Token Required). कृपया ॲडमिनशी व्हॉट्सॲपवर संपर्क साधा.'
            );
          },
        });
      } catch (rtcErr) {
        console.warn('[AudioCallModal] RTC join fallback:', rtcErr);
      }

      // Poll status if admin accepts / rejects / waiting status updates
      pollStatusTimerRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/agora/call/status/${activeCall.callId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.success && statusData.call) {
              const status = statusData.call.status;
              if (status === 'connected') {
                stopCallAudioTone();
                if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
                setCallState('connected');
                startDurationTimer();
              } else if (status === 'ringing') {
                // If call was in waiting queue and now promoted to ringing!
                setCallState('ringing');
                playCallAudioTone('ringback');
              } else if (status === 'waiting') {
                setCallState('waiting');
              } else if (status === 'rejected') {
                clearInterval(pollStatusTimerRef.current);
                if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
                stopCallAudioTone();
                playCallAudioTone('end');
                setCallState('rejected');
                setTimeout(() => onClose(), 2500);
              } else if (status === 'ended' || status === 'missed') {
                clearInterval(pollStatusTimerRef.current);
                if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
                handleCallEndedByAdmin();
              }
            }
          }
        } catch (e) {}
      }, 1500);
    } catch (err: any) {
      console.error('[AudioCallModal] Error initiating call:', err);
      setCallState('error');
      setErrorMessage(err.message || 'कॉल जोडताना तांत्रिक अडचण आली.');
    }
  };

  const startDurationTimer = () => {
    if (!durationTimerRef.current) {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleCallEndedByAdmin = () => {
    stopCallAudioTone();
    playCallAudioTone('end');
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // User manually ends call or cancels waiting
  const handleEndCall = async () => {
    stopCallAudioTone();
    playCallAudioTone('end');
    setCallState('ended');

    if (callId) {
      try {
        await fetch('/api/agora/call/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, action: 'end' }),
        });
      } catch (e) {}
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Toggle Mute
  const handleToggleMute = async () => {
    const nextMuted = !isMuted;
    await toggleMicrophoneMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white rounded-3xl p-6 shadow-2xl border border-slate-800 text-center flex flex-col items-center justify-between min-h-[480px] overflow-hidden">
        {/* Top Header Badge */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>सुरक्षित इन-ॲप ऑडिओ कॉल</span>
          </div>
          <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-700">
            {callState === 'waiting' ? '⏳ कॉल वेटिंग' : 'HD Voice RTC'}
          </span>
        </div>

        {/* Center Admin Avatar & Pulsing Rings */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Animated Glow Rings when ringing or connected */}
          {(callState === 'ringing' || callState === 'connected') && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-[#800C1E]/20 animate-ping opacity-75" />
              <div
                className="absolute w-44 h-44 rounded-full border border-amber-500/30 transition-all duration-300"
                style={{
                  transform: `scale(${1 + (voiceLevel / 100) * 0.4})`,
                  opacity: callState === 'connected' ? 0.8 : 0.2,
                }}
              />
            </>
          )}

          {/* Special Amber Pulsing Ring for Call Waiting State */}
          {callState === 'waiting' && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-amber-500/20 animate-ping opacity-75" />
              <div className="absolute w-40 h-40 rounded-full border-2 border-amber-500/50 animate-pulse" />
            </>
          )}

          <div
            className={`relative w-28 h-28 rounded-full overflow-hidden border-4 shadow-2xl bg-gradient-to-br from-[#800C1E] to-[#500813] flex items-center justify-center ${
              callState === 'waiting' ? 'border-amber-400 animate-pulse' : 'border-amber-400/80'
            }`}
          >
            {adminPhoto || siteConfig?.logoUrl ? (
              <img
                src={adminPhoto || siteConfig?.logoUrl || '/vanjari-jodi-official-logo.png'}
                alt="Admin Support"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-14 h-14 text-amber-200" />
            )}
          </div>
        </div>

        {/* Status & Name */}
        <div className="space-y-1.5 w-full">
          <h3 className="text-xl font-black text-amber-100 font-serif">
            {adminName}
          </h3>
          <p className="text-xs text-slate-400">
            वंजारी जोडी वधू-वर सूचक केंद्र हेल्पलाईन
          </p>

          {/* Call Status Label */}
          <div className="pt-2">
            {callState === 'mic_permission_required' && (
              <div className="space-y-3 max-w-xs mx-auto animate-fade-in text-center pt-1">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center shadow-lg">
                  <Mic className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-100">
                    मायक्रोफोन परवानगी द्या
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    ॲडमिन सपोर्टशी ॲपमध्ये ऑडिओ कॉल करण्यासाठी खालील बटण दाबून मायक्रोफोन परवानगी द्या (Allow Mic).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRequestMicAndStartCall}
                  disabled={isRequestingMic}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg active:scale-95 transition flex items-center justify-center space-x-2 cursor-pointer border border-emerald-400/40"
                >
                  {isRequestingMic ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>परवानगी तपासत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-300" />
                      <span>मायक्रोफोन सुरू करा व कॉल जोडा</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {callState === 'initiating' && (
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-700/50">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>कनेक्शन जोडत आहे...</span>
              </div>
            )}

            {/* CALL WAITING STATE */}
            {callState === 'waiting' && (
              <div className="space-y-2 max-w-xs mx-auto animate-fade-in">
                <div className="inline-flex items-center space-x-2 text-xs font-black text-amber-300 bg-gradient-to-r from-amber-950/90 to-orange-950/90 px-4 py-1.5 rounded-full border border-amber-500/60 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>कॉल वेटिंगवर आहे (Call Waiting)</span>
                </div>

                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-left space-y-1.5 shadow-inner">
                  <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <span>ॲडमिन सध्या दुसऱ्या सदस्याशी बोलत आहेत</span>
                  </div>
                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    कृपया थांबा, तुमचा कॉल कापू नका. ॲडमिनला समजले आहे की तुमचा कॉल येत आहे. सध्याचा कॉल संपताच तुमचा कॉल लगेच जोडला जाईल.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-amber-200/90 font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>प्रतीक्षा वेळ:</span>
                    </span>
                    <span className="font-bold text-amber-300 text-xs">{formatTime(waitingDuration)}</span>
                  </div>
                </div>
              </div>
            )}

            {callState === 'ringing' && (
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-700/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ॲडमिनला रिंग होत आहे (Ringing...)...</span>
              </div>
            )}

            {callState === 'connected' && (
              <div className="inline-flex items-center space-x-2 text-sm font-black text-emerald-300 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/60 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="tracking-widest font-mono text-base">{formatTime(callDuration)}</span>
              </div>
            )}

            {callState === 'rejected' && (
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-300 bg-rose-950/70 px-3 py-1 rounded-full border border-rose-800">
                <span>कॉल नाकारण्यात आला किंवा ॲडमिन अनुपलब्ध आहेत.</span>
              </div>
            )}

            {callState === 'ended' && (
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                <span>कॉल समाप्त झाला.</span>
              </div>
            )}

            {callState === 'error' && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 space-y-1">
                <div className="flex items-center justify-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>कॉल जोडता आला नाही</span>
                </div>
                <p className="text-[11px] text-rose-300/90 leading-relaxed">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Wave Visualizer when Connected */}
        {callState === 'connected' && (
          <div className="flex items-center justify-center space-x-1 h-6 my-2">
            {[40, 70, 100, 60, 80, 50, 90, 40].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-amber-400 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(6, (h * (voiceLevel + 20)) / 100)}px`,
                  opacity: voiceLevel > 5 ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Current Caller Information Strip (कॉल कोण करत आहे ते स्पष्ट दिसण्यासाठी) */}
        {currentUser && (
          <div className="w-full mt-2 mb-1 p-2 bg-slate-800/60 rounded-xl border border-slate-700/60 text-left flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.fullName ? currentUser.fullName[0] : 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-amber-200 truncate leading-tight">
                  {currentUser.fullName || 'सदस्य'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  ID: {currentUser.id || 'N/A'} • {currentUser.mobile || currentUser.mobileNumber || ''}
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 shrink-0">
              कॉल करणारा
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="w-full pt-3 flex flex-col items-center justify-center gap-3 border-t border-slate-800/80">
          {callState === 'connected' && (
            <div className="flex items-center justify-center space-x-6">
              {/* Mute Microphone Button */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isMuted
                    ? 'bg-amber-600 text-white border-2 border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
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
                title="कॉल कट करा (End Call)"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              {/* Speakerphone Toggle Button (लाऊड स्पीकर / इअरपीस) */}
              <button
                type="button"
                onClick={() => {
                  const nextSpeaker = !isSpeakerMuted;
                  setIsSpeakerMuted(nextSpeaker);
                  setSpeakerphoneOn(nextSpeaker);
                }}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isSpeakerMuted
                    ? 'bg-emerald-600 text-white border-2 border-emerald-300 ring-2 ring-emerald-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={isSpeakerMuted ? 'लाऊड स्पीकर चालू आहे (Speaker On)' : 'लाऊड स्पीकर सुरू करा'}
              >
                {isSpeakerMuted ? <Volume2 className="w-6 h-6 text-white" /> : <Headphones className="w-6 h-6" />}
              </button>
            </div>
          )}

          {/* Action Controls when not connected */}
          {callState === 'mic_permission_required' ? (
            <div className="flex items-center gap-2 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer border border-slate-700 transition"
              >
                रद्द करा
              </button>
            </div>
          ) : callState !== 'error' && callState !== 'connected' ? (
            <button
              type="button"
              onClick={handleEndCall}
              className={`w-16 h-16 rounded-full text-white flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer border-2 ${
                callState === 'waiting'
                  ? 'bg-rose-600 hover:bg-rose-700 border-rose-400'
                  : 'bg-rose-600 hover:bg-rose-700 border-rose-400 hover:shadow-rose-900/50'
              }`}
              title={callState === 'waiting' ? 'प्रतीक्षा रद्द करा (Cancel Call)' : 'कॉल कट करा (End Call)'}
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          ) : callState === 'error' ? (
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer border border-slate-700 transition"
                >
                  बंद करा
                </button>

                <button
                  type="button"
                  onClick={handleRequestMicAndStartCall}
                  disabled={isRequestingMic}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                  <span>पुन्हा प्रयत्न करा</span>
                </button>
              </div>

              {/* Direct Support Phone Call Fallback (कॉलला एरर आल्यास थेट फोन डायल करण्याचा सोपा पर्याय) */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <a
                  href={`tel:+91${String(siteConfig?.contactPhone || '9822012345').replace(/[^0-9]/g, '').slice(-10)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>थेट सपोर्ट नंबरवर कॉल करा (+91 {String(siteConfig?.contactPhone || '9822012345').replace(/[^0-9]/g, '').slice(-10)})</span>
                </a>

                {(siteConfig?.contactWhatsapp || siteConfig?.contactPhone) && (
                  <a
                    href={`https://wa.me/91${(siteConfig.contactWhatsapp || siteConfig.contactPhone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `नमस्ते, मी वंजारी जोडी (Vanjari Jodi) ॲपवरून संपर्क करत आहे. माझे नाव: ${currentUser?.fullName || ''}, User ID: ${currentUser?.id || ''}, फोन: ${currentUser?.mobile || currentUser?.mobileNumber || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp वर मेसेज किंवा ऑडिओ कॉल करा</span>
                  </a>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
