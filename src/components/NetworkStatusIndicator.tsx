import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false);
      window.location.reload();
    }
  };

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
        <CheckCircle2 className="w-4 h-4" />
        <span>इंटरनेट पुन्हा सुरू झाले! (Connected)</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-slate-950 animate-pulse" />
        <span>इंटरनेट कनेक्शन बंद आहे. कृपया तुमचे नेटवर्क तपासा.</span>
      </div>
      <button
        onClick={handleRetry}
        className="px-3 py-1 bg-slate-900 hover:bg-black text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
      >
        <RefreshCw className="w-3 h-3" />
        <span>पुन्हा जोडा</span>
      </button>
    </div>
  );
};

export default NetworkStatusIndicator;
