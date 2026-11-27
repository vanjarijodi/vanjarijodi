import React, { useState, useEffect } from 'react';
import {
  isPushNotificationSupported,
  getPushPermissionState,
  requestPushPermission,
  triggerBrowserPushNotification,
  playNotificationSound,
  testPushNotificationAndSound,
  triggerDeviceVibration
} from '../utils/pushNotificationHelper';
import { BellRing, X, CheckCircle2, Volume2, Sparkles, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PushNotificationBanner: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useApp();
  const [permissionState, setPermissionState] = useState<string>('unsupported');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [justEnabled, setJustEnabled] = useState<boolean>(false);
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);

  useEffect(() => {
    if (!isPushNotificationSupported()) {
      setPermissionState('unsupported');
      return;
    }

    const state = getPushPermissionState();
    setPermissionState(state);

    const dismissed = sessionStorage.getItem('vanjari_push_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleEnablePush = async () => {
    try {
      const res = await requestPushPermission();
      setPermissionState(res);

      if (res === 'granted') {
        setJustEnabled(true);
        playNotificationSound();
        triggerDeviceVibration([200, 100, 200]);
        triggerBrowserPushNotification('🎉 पुश नोटिफिकेशन्स सुरू झाले!', {
          body: 'वंजारी जोडीवर नवीन अनुरूप स्थळे, मेसेज व ॲडमिन अपडेट्सचे अलर्ट तुम्हाला ध्वनीसह त्वरित मिळतील.',
          icon: '/icon-192.png',
          playSound: true,
          type: 'system'
        });

        setTimeout(() => {
          setIsDismissed(true);
          sessionStorage.setItem('vanjari_push_banner_dismissed', 'true');
        }, 4000);
      } else if (res === 'denied') {
        alert('डिव्हाइसवर नोटिफिकेशन्स ब्लॉक (Denied) आहेत. कृपया ब्राऊझर किंवा फोनच्या Settings ➜ Site Settings मध्ये जाऊन Notification Permission "Allow" करा.');
      }
    } catch (e) {
      console.error('Error enabling push:', e);
    }
  };

  const handleTestSound = async () => {
    setIsTestingSound(true);
    try {
      await testPushNotificationAndSound();
    } catch (err) {
      console.error('Error testing sound & push:', err);
    } finally {
      setTimeout(() => setIsTestingSound(false), 1500);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('vanjari_push_banner_dismissed', 'true');
  };

  // Only show if supported, permission is 'default' (not granted, not denied), and not dismissed
  if (permissionState !== 'default' && !justEnabled) {
    return null;
  }

  if (isDismissed && !justEnabled) {
    return null;
  }

  return (
    <div className="relative z-40 bg-gradient-to-r from-[#800C1E] via-[#9B1229] to-[#800C1E] text-white border-b-2 border-amber-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 border border-amber-300/40 animate-pulse">
            <BellRing className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            {justEnabled ? (
              <div className="flex items-center space-x-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>पुश नोटिफिकेशन्स व ध्वनी यशस्वीरित्या चालू झाले आहेत! धन्यवाद.</span>
              </div>
            ) : (
              <div>
                <span className="font-bold text-amber-200">🔔 पुश नोटिफिकेशन्स व ध्वनी: </span>
                <span className="text-slate-100 font-medium">
                  नवीन विवाह स्थळे, थेट चॅट मेसेज व सूचनांचे अलर्ट ध्वनीसह मोबाईलवर मिळवा.
                </span>
              </div>
            )}
          </div>
        </div>

        {!justEnabled && (
          <div className="flex items-center space-x-2 shrink-0">
            {/* Test Sound Button */}
            <button
              type="button"
              onClick={handleTestSound}
              disabled={isTestingSound}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-200 font-bold rounded-lg border border-amber-300/40 transition flex items-center space-x-1.5 text-xs cursor-pointer active:scale-95"
              title="सूचना ध्वनी ऐका"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{isTestingSound ? 'ध्वनी वाजत आहे...' : 'ध्वनी चाचणी (Test Sound)'}</span>
            </button>

            {/* Enable Push Button */}
            <button
              type="button"
              onClick={handleEnablePush}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold rounded-lg shadow transition flex items-center space-x-1.5 text-xs cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>सूचना चालू करा (Allow Alerts)</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              title="नंतर करा"
              className="p-1 rounded-md text-amber-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
