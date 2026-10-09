import React, { useState } from 'react';
import { UserProfile } from '../types';
import { PhoneOff, Mic, MicOff, Video, VideoOff, ShieldCheck } from 'lucide-react';

export const VideoCallModal: React.FC<{
  user: UserProfile | null;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl text-white overflow-hidden my-auto h-[500px] flex flex-col justify-between">
        
        {/* Call Stream Preview */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src={user.photos[0]}
            alt="video user"
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

          {/* User Call Details Overlay */}
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-white/20 backdrop-blur-md">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            <div>
              <h3 className="font-bold text-sm text-white">{user.fullName}</h3>
              <p className="text-[11px] text-emerald-400 font-mono">HD व्हिडिओ कॉल चालू (००:४२)</p>
            </div>
          </div>

          {/* Self Camera Picture-in-Picture */}
          <div className="absolute bottom-6 right-6 w-32 h-44 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-900">
            {isVideoOff ? (
              <div className="w-full h-full bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-bold">
                कॅमेरा बंद
              </div>
            ) : (
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                alt="my camera"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full font-bold transition-all ${
              isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={onClose}
            className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 scale-110"
            title="कॉल समाप्त करा"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full font-bold transition-all ${
              isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        </div>

      </div>
    </div>
  );
};
