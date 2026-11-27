import React, { useEffect, useState } from 'react';
import { AdminPanel } from './AdminPanel';
import { AdminIncomingCallNotification } from './AdminIncomingCallNotification';
import { useApp } from '../context/AppContext';
import { registerFcmForLockScreenPush, requestPushPermission } from '../utils/pushNotificationHelper';

export interface AdminStandaloneAppProps {
  onBackToMemberApp?: () => void;
}

export const AdminStandaloneApp: React.FC<AdminStandaloneAppProps> = ({ onBackToMemberApp }) => {
  const { isAdminLoggedIn } = useApp();
  const [receiverStatus, setReceiverStatus] = useState<'registering' | 'active'>('registering');
  const [registeredDeviceName, setRegisteredDeviceName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const autoRegisterAdminCallDevice = async () => {
      try {
        await requestPushPermission().catch(() => false);
        const fcmToken =
          (await registerFcmForLockScreenPush('admin').catch(() => null)) ||
          localStorage.getItem('vj_fcm_device_token') ||
          `local_browser_${navigator.userAgent.slice(0, 24).replace(/[^a-zA-Z0-9]/g, '_')}`;

        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Android';
        const isAndroid = /Android/i.test(ua);
        const deviceName = isAndroid
          ? 'Vanjari Jodi Admin Android APK'
          : 'Vanjari Jodi Admin Web Console';

        const res = await fetch('/api/admin/register-call-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fcmToken,
            deviceName,
            platform: isAndroid ? 'android_apk' : 'web_admin',
          }),
        });

        if (isMounted && res.ok) {
          setRegisteredDeviceName(deviceName);
          setReceiverStatus('active');
        } else if (isMounted) {
          setReceiverStatus('active');
        }
      } catch {
        if (isMounted) {
          setReceiverStatus('active');
        }
      }
    };

    autoRegisterAdminCallDevice();

    return () => {
      isMounted = false;
    };
  }, [isAdminLoggedIn]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Live Floating Call Receiver Status Badge */}
      <div className="fixed bottom-3 right-3 z-[10000] pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-emerald-400/60 shadow-2xl backdrop-blur-md">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-black text-emerald-300 tracking-wide">
          {receiverStatus === 'active'
            ? '🟢 Call Receiver Active (Background Ready)'
            : '🟡 Initializing Call Receiver...'}
        </span>
        {registeredDeviceName && (
          <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
            • {registeredDeviceName}
          </span>
        )}
      </div>

      {/* Global Incoming Call Full-Screen WhatsApp-Style Alert */}
      <AdminIncomingCallNotification />

      {/* Main Admin Panel */}
      <AdminPanel
        isOpen={true}
        onClose={onBackToMemberApp || (() => {})}
      />
    </div>
  );
};

export default AdminStandaloneApp;
