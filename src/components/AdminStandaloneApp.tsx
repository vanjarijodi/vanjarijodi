import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  Phone,
  CreditCard,
  Users,
  Search,
  Bell,
  Download,
  Upload,
  Smartphone,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Copy,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Settings,
  LogOut,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Check,
  FileText,
  Volume2,
  Radio,
  Sliders,
  Send,
  Building2,
  Share2,
  Grid,
  ShieldAlert,
  Ban,
  Clock,
  Trash2
} from 'lucide-react';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { VerifiedBadge } from './VerifiedBadge';
import { UserProfile, PaymentRequest } from '../types';
import { AdminPanel } from './AdminPanel';
import { AdminIncomingCallNotification } from './AdminIncomingCallNotification';
import { AudioCallModal } from './AudioCallModal';
import { AdminReportsView } from './AdminReportsView';
import { AdminAgoraSettings } from './AdminAgoraSettings';
import { AndroidPushNotificationBanner } from './AndroidPushNotificationBanner';
import {
  triggerBrowserPushNotification,
  playNotificationSound,
  requestPushPermission,
  triggerDeviceVibration,
  isPushNotificationSupported
} from '../utils/pushNotificationHelper';
import { fetchBlacklist, toggleIpQuarantine, toggleMobileBan, toggleDeviceBan } from '../utils/securityService';

interface AdminStandaloneAppProps {
  onBackToMemberApp?: () => void;
}

export const AdminStandaloneApp: React.FC<AdminStandaloneAppProps> = ({ onBackToMemberApp }) => {
  const {
    profiles,
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    currentUser,
    adminCredentials,
    updateProfileDirect,
    notifications,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    updateSiteConfig,
    profileReports,
    resolveProfileReport,
    isAudioCallModalOpen,
    setIsAudioCallModalOpen,
    setSelectedProfileForModal,
    siteConfig,
    language,
    setCurrentView,
    logout,
  } = useApp();

  // Strict Authentication State - Only unlocked after verifying master admin credentials
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // If user is logged in as a normal member, never auto-unlock admin
    if (currentUser && currentUser.id !== 'admin') {
      return false;
    }
    return Boolean(isAdminLoggedIn);
  });

  const [usernameInput, setUsernameInput] = useState<string>('admin');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [twoFactorPin, setTwoFactorPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showTwoFactorField, setShowTwoFactorField] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Clear any legacy insecure persistent session flag on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vanjari_admin_standalone_session');
    }
  }, []);

  // Active Tab within Quick Access App
  const [activeTab, setActiveTab] = useState<'quick_deck' | 'payments' | 'approvals' | 'kyc' | 'calls' | 'banned' | 'search' | 'broadcast' | 'github' | 'security' | 'full_console'>('quick_deck');

  // Notifications Modal State & Test Call Simulator
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'reports' | 'payments' | 'registrations' | 'kyc'>('all');
  const [isSimulatingCall, setIsSimulatingCall] = useState<boolean>(false);

  // Auto-sync admin logged in status
  useEffect(() => {
    if (isUnlocked) {
      setIsAdminLoggedIn(true);
    }
  }, [isUnlocked, setIsAdminLoggedIn]);

  // Blacklist & Anti-Fraud Center State
  const [blacklistData, setBlacklistData] = useState<{
    blockedIps: string[];
    bannedDevices: string[];
    bannedMobiles: string[];
  }>({ blockedIps: [], bannedDevices: [], bannedMobiles: [] });
  const [manualBanMobile, setManualBanMobile] = useState('');
  const [manualBanIp, setManualBanIp] = useState('');
  const [isBlacklistLoading, setIsBlacklistLoading] = useState(false);

  // Search in member directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchDistrict, setSearchDistrict] = useState<string>('all');

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState<string>('🔔 वंजारी जोडी नवीन अपडेट!');
  const [broadcastMsg, setBroadcastMsg] = useState<string>('आज नवीन १००+ वधू-वर स्थळे जोडली गेली आहेत. आपल्या पसंतीचे स्थळ त्वरित पहा.');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  // GitHub Sync State
  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('vanjari_github_token') || '';
  });
  const [githubRepoName, setGithubRepoName] = useState<string>(() => {
    return localStorage.getItem('vanjari_github_repo') || 'vanjarijodi-admin-app';
  });
  const [isSyncingGitHub, setIsSyncingGitHub] = useState<boolean>(false);
  const [githubSyncResult, setGithubSyncResult] = useState<{ success: boolean; message?: string; repoUrl?: string; error?: string } | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [connectedGitHubUser, setConnectedGitHubUser] = useState<any>(null);

  // Standalone Full Admin Console Modal
  const [isFullConsoleOpen, setIsFullConsoleOpen] = useState<boolean>(false);

  // PWA Install Prompt State
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Check saved GitHub token on mount
  useEffect(() => {
    if (githubToken) {
      fetch('/api/github/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setConnectedGitHubUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [githubToken]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setLoginError('कृपया प्रशासक युझरनेम आणि पासवर्ड दोन्ही प्रविष्ट करा.');
      return;
    }

    setIsVerifying(true);

    try {
      // 1. Attempt secure server-side verification with brute force protection
      const res = await fetch('/api/admin/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
          twoFactorPin: twoFactorPin.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsUnlocked(true);
        setIsAdminLoggedIn(true);
        setLoginError('');
        playNotificationSound();
        return;
      } else if (res.status === 429) {
        setLoginError(data.error || 'अनेक चुकीच्या प्रयत्नांमुळे लॉगिन लॉक झाले आहे. कृपया १५ मिनिटांनी प्रयत्न करा.');
        return;
      }

      // 2. Strict fallback check for master admin credentials (458498 or 12345)
      const expectedPass = adminCredentials?.password || '458498';
      const expectedUser = adminCredentials?.username || 'admin';

      if (
        (cleanUser.toLowerCase() === expectedUser.toLowerCase() || cleanUser.toLowerCase() === 'admin') &&
        (cleanPass === expectedPass || cleanPass === '458498' || cleanPass === '12345')
      ) {
        setIsUnlocked(true);
        setIsAdminLoggedIn(true);
        setLoginError('');
        playNotificationSound();
        return;
      }

      setLoginError(data.error || 'अवैध ॲडमिन युझरनेम किंवा पासवर्ड! प्रवेश नाकारला.');
      setPasswordInput('');
    } catch (err) {
      // Offline fallback
      const expectedPass = adminCredentials?.password || '458498';
      const expectedUser = adminCredentials?.username || 'admin';
      if (
        (cleanUser.toLowerCase() === expectedUser.toLowerCase() || cleanUser.toLowerCase() === 'admin') &&
        (cleanPass === expectedPass || cleanPass === '458498' || cleanPass === '12345')
      ) {
        setIsUnlocked(true);
        setIsAdminLoggedIn(true);
        setLoginError('');
        playNotificationSound();
      } else {
        setLoginError('अवैध ॲडमिन पासवर्ड! कृपया योग्य पासवर्ड प्रविष्ट करा.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vanjari_admin_standalone_session');
    }
    setPasswordInput('');
    setTwoFactorPin('');
    if (onBackToMemberApp) {
      onBackToMemberApp();
    }
  };

  const adminNotifications = useMemo(() => {
    return (notifications || []).filter(
      (n) => n.userId === 'admin' || n.userId === 'all' || n.userId === 'broadcast'
    );
  }, [notifications]);

  const unreadAdminNotificationsCount = useMemo(() => {
    return adminNotifications.filter((n) => !n.isRead).length;
  }, [adminNotifications]);

  const bannedProfiles = useMemo(() => {
    return (profiles || []).filter((p) => p.isBlocked || p.isSuspended || (p as any).autoBannedAt);
  }, [profiles]);

  const handleSimulateTestCall = async () => {
    setIsSimulatingCall(true);
    try {
      const res = await fetch('/api/agora/call/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: 'सागर अशोक वंजारी (चाचणी कॉल)',
          callerMobile: '9876543210',
          callerDistrict: 'छत्रपती संभाजीनगर'
        }),
      });
      const data = await res.json();
      if (data.success) {
        playNotificationSound();
        triggerDeviceVibration([400, 200, 400]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingCall(false);
    }
  };

  const handleToggleAutoApproval = () => {
    const nextVal = siteConfig?.autoApproveNewRegistrations === false ? true : false;
    updateSiteConfig({ autoApproveNewRegistrations: nextVal });
    playNotificationSound();
    addNotification({
      userId: 'admin',
      title: 'ऑटो-अप्रुव्हल सेटिंग अपडेट',
      titleMr: nextVal ? '⚡ नवीन सदस्यांचे ऑटो-अप्रुव्हल सुरू केले!' : '🔒 मॅन्युअल अप्रुव्हल मोड सक्रिय (ॲडमिन मंजुरी आवश्यक)',
      message: nextVal ? 'Auto Approval Enabled' : 'Manual Approval Required',
      messageMr: nextVal ? 'आता नवीन नोंदणी झालेल्या वधू-वरांचे प्रोफाईल आपोआप मंजूर होईल.' : 'आता प्रत्येक नवीन सदस्याला ॲडमिनने मंजूर करणे आवश्यक असेल.',
      type: 'system',
    });
  };

  // Quick Metrics Calculations
  const pendingPayments = useMemo(() => {
    return (paymentRequests || []).filter((r) => r.status === 'pending');
  }, [paymentRequests]);

  const pendingMemberApprovals = useMemo(() => {
    return (profiles || []).filter((p) => p.isApproved === false && !p.isAdmin);
  }, [profiles]);

  const pendingAadhaarVerifications = useMemo(() => {
    return (profiles || []).filter((p) => (p.aadhaarFrontUrl || p.aadhaarCardUrl) && !p.aadhaarVerified);
  }, [profiles]);

  const totalMembersCount = useMemo(() => {
    return (profiles || []).length;
  }, [profiles]);

  const totalRevenue = useMemo(() => {
    return (paymentRequests || [])
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }, [paymentRequests]);

  // Filtered members for instant search
  const filteredMembers = useMemo(() => {
    let list = profiles || [];
    if (searchDistrict !== 'all') {
      list = list.filter((p) => p.district === searchDistrict);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(q) ||
          p.mobile?.includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 30);
  }, [profiles, searchQuery, searchDistrict]);

  // 1-Tap Payment Approve
  const handleQuickApprovePayment = async (item: PaymentRequest) => {
    try {
      await approvePaymentRequest(item.id);
      playNotificationSound();
    } catch (e) {
      console.error(e);
    }
  };

  // 1-Tap Payment Reject
  const handleQuickRejectPayment = async (item: PaymentRequest) => {
    if (confirm(`तुम्हाला खरोखर ${item.userName} यांचे ₹${item.amount} पेमेंट रिजेक्ट करायचे आहे का?`)) {
      try {
        await rejectPaymentRequest(item.id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 1-Tap Member Approve
  const handleQuickApproveMember = (profile: UserProfile) => {
    updateProfileDirect(profile.id, { isApproved: true });
    addNotification({
      userId: profile.id,
      title: '✅ प्रोफाईल मंजूर झाली!',
      titleMr: '✅ तुमची प्रोफाईल ॲडमिनने मंजूर केली आहे!',
      message: 'Your profile has been approved. You can now use all matrimony features.',
      messageMr: 'तुमची प्रोफाईल तपासणी यशस्वीरित्या पूर्ण झाली असून आता इतर सदस्य तुमचा बायोडाटा पाहू शकतात.',
      type: 'system'
    });
    playNotificationSound();
  };

  // 1-Tap Aadhaar Verify
  const handleQuickVerifyAadhaar = (profile: UserProfile) => {
    updateProfileDirect(profile.id, {
      aadhaarVerified: true,
      verification_status: 'Approved'
    });
    addNotification({
      userId: profile.id,
      title: '🪪 आधार दस्तऐवज प्रमाणित झाले!',
      titleMr: '🪪 तुमचे आधार दस्तऐवज ॲडमिनने प्रमाणित केले आहे! (Verified Badge सक्रिय)',
      message: 'Your Aadhaar has been verified by Admin. Blue verification badge is now active.',
      messageMr: 'तुमची आधार ओळख खात्रीशीर ठरली असून तुमच्या प्रोफाईलवर निळा व्हेरिफाईड बॅज झळकला आहे!',
      type: 'system'
    });
    playNotificationSound();
  };

  // 1-Tap Broadcast Notification
  const handleSendBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    setIsSendingBroadcast(true);
    try {
      addNotification({
        userId: 'broadcast',
        title: broadcastTitle.trim(),
        titleMr: broadcastTitle.trim(),
        message: broadcastMsg.trim(),
        messageMr: broadcastMsg.trim(),
        type: 'system'
      });

      triggerBrowserPushNotification(broadcastTitle.trim(), {
        body: broadcastMsg.trim(),
        playSound: true,
        type: 'system'
      });

      playNotificationSound();
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // 1-Tap GitHub Push
  const handleDeployToGitHub = async () => {
    if (!githubToken.trim()) {
      alert('कृपया प्रथम तुमचा GitHub Personal Access Token (PAT) प्रविष्ट करा.');
      return;
    }

    setIsSyncingGitHub(true);
    setGithubSyncResult(null);

    try {
      localStorage.setItem('vanjari_github_token', githubToken.trim());
      localStorage.setItem('vanjari_github_repo', githubRepoName.trim());

      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          repoName: githubRepoName.trim() || 'vanjarijodi-admin-app',
          isPrivate: false,
          commitMessage: `🚀 Deploy Vanjari Jodi Dedicated Admin App & Command Engine [${new Date().toLocaleDateString('mr-IN')}]`,
          branch: 'main'
        }),
      });

      const data = await res.json();
      setGithubSyncResult(data);
      if (data.success) {
        playNotificationSound();
      }
    } catch (err: any) {
      setGithubSyncResult({
        success: false,
        error: err.message || 'GitHub Sync प्रक्रियेत त्रुटी आली.'
      });
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  // 1-Tap Standalone ZIP Download
  const handleDownloadStandaloneZip = () => {
    setIsDownloadingZip(true);
    const link = document.createElement('a');
    link.href = '/api/admin/export-repo-zip';
    link.download = 'VanjariJodi-Admin-GitHub-Repo.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingZip(false);
    }, 3000);
  };

  // PWA Install Click
  const handleInstallPwa = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
      }
    } else {
      addNotification({
        userId: 'admin',
        title: '📱 ॲप इन्स्टॉल मार्गदर्शक',
        titleMr: '📱 ॲप इन्स्टॉल करण्यासाठी:',
        message: 'ब्राऊझर मेन्यूमधून Add to Home screen किंवा Install App निवडा.',
        messageMr: '१. ब्राऊझरच्या वरच्या उजव्या बाजूला असलेल्या तीन डॉट्सवर (⋮) क्लिक करा.\n२. "Install App" किंवा "Add to Home Screen" निवडा.\n३. ॲडमिन ॲप थेट तुमच्या मोबाईल स्क्रीनवर ॲप म्हणून उघडेल!',
        type: 'system'
      });
      playNotificationSound();
    }
  };

  // -------------------------------------------------------------
  // 1. STRICT ACCESS CONTROL GATE (If not unlocked)
  // -------------------------------------------------------------
  if (!isUnlocked) {
    // A. If user is currently logged in as a normal matrimony member (not admin)
    if (currentUser && !currentUser.isAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#1A0A0F] to-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
          <div className="w-full max-w-md bg-slate-900/95 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-black text-rose-300 uppercase tracking-wider inline-block">
                प्रवेश प्रतिबंधित (Access Denied)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                हे केवळ ॲडमिनसाठी आहे!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                तुम्ही सध्या <strong className="text-amber-300">{currentUser.fullName}</strong> या सदस्य खात्यावरून लॉगिन आहात. ॲडमिन पोर्टल केवळ अधिकृत व्यवस्थापकांसाठी आरक्षित आहे; सदस्य येथे प्रवेश करू शकत नाहीत.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1 text-left">
              <p className="flex items-center gap-1.5 font-bold text-slate-300">
                <span>👤 सदस्य नाव:</span>
                <span className="text-white">{currentUser.fullName}</span>
              </p>
              <p className="flex items-center gap-1.5 text-[11px]">
                <span>📱 मोबाईल:</span>
                <span className="font-mono text-slate-300">{currentUser.mobile}</span>
              </p>
              <p className="flex items-center gap-1.5 text-[11px]">
                <span>🆔 सदस्य आयडी:</span>
                <span className="font-mono text-amber-300">{currentUser.id}</span>
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onBackToMemberApp) onBackToMemberApp();
                  else if (setCurrentView) setCurrentView('home');
                  else window.location.href = '/';
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← मुख्य मॅट्रिमोनी ॲपवर परत जा</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  if (onBackToMemberApp) onBackToMemberApp();
                  else if (setCurrentView) setCurrentView('home');
                  else window.location.href = '/';
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>सदस्य खात्यातून लॉग आऊट करा</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // B. Secure Admin Login Gate for Administrators
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#1A0A0F] to-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        {/* Background Decorative Rings */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#800C1E]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Shield & Title */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-[#800C1E] via-[#A71930] to-amber-600 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-amber-400 drop-shadow" />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[11px] font-black text-amber-300 tracking-wider uppercase inline-block">
                🔒 Admin Security Gate
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                वंजारी जोडी ॲडमिन ॲप
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                सुरक्षित प्रशासक नियंत्रण कक्ष (Only for Authorized Admins)
              </p>
            </div>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Secure Admin Credentials Form */}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>प्रशासक युझरनेम (Username):</span>
                <span className="text-[10px] text-slate-500 font-mono">admin</span>
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setLoginError('');
                }}
                placeholder="admin"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">
                ॲडमिन पासवर्ड (Admin Password):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="तुमचा ॲडमिन पासवर्ड टाका"
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 font-mono"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors p-1"
                  title={showPassword ? 'पासवर्ड लपवा' : 'पासवर्ड दाखवा'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Optional 2FA Field Toggle */}
            <div>
              {!showTwoFactorField ? (
                <button
                  type="button"
                  onClick={() => setShowTwoFactorField(true)}
                  className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>+ २FA सिक्युरिटी पिन जोडा (पर्यायी)</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-amber-200">
                      २FA सिक्युरिटी पिन:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTwoFactorField(false);
                        setTwoFactorPin('');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-200"
                    >
                      रद्द करा
                    </button>
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="६ अंकी २FA पिन"
                    value={twoFactorPin}
                    onChange={(e) => setTwoFactorPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-amber-400/40 rounded-lg text-amber-300 text-xs font-mono tracking-widest outline-none"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>पडताळणी होत आहे...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>पडताळणी करा व ॲडमिन ॲप उघडा</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Member Matrimony App */}
          <div className="pt-2 text-center border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (onBackToMemberApp) onBackToMemberApp();
                else if (setCurrentView) setCurrentView('home');
                else window.location.href = '/';
              }}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>मुख्य मॅट्रिमोनी ॲपवर परत जा</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. UNLOCKED EXECUTIVE ADMIN COMMAND APP
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 w-full overflow-x-hidden">
      {/* Real-time Agora Call Notification Overlay */}
      <AdminIncomingCallNotification />

      {/* Real-time Push Notification Banner in Admin App */}
      <AndroidPushNotificationBanner />

      {/* Audio Call Modal */}
      {isAudioCallModalOpen && (
        <AudioCallModal
          isOpen={isAudioCallModalOpen}
          onClose={() => setIsAudioCallModalOpen(false)}
        />
      )}

      {/* Full Console Modal if triggered */}
      {isFullConsoleOpen && (
        <AdminPanel
          isOpen={isFullConsoleOpen}
          onClose={() => setIsFullConsoleOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* 🚀 TOP EXECUTIVE APP HEADER BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-950 via-[#2A040A] to-slate-950 border-b border-amber-500/30 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-xl flex items-center justify-between gap-3">
        {/* Brand Emblem & App Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#800C1E] to-amber-500 p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                वंजारी जोडी ॲडमिन
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[9.5px] font-black text-amber-300">
                PRO APP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              कमांड सेंटर व क्विक ऍक्सेस सिस्टीम
            </p>
          </div>
        </div>

        {/* Action Header Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Admin Notifications Center Bell Button */}
          <button
            type="button"
            onClick={() => setIsNotificationModalOpen(true)}
            className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer active:scale-95"
            title="ॲडमिन सूचना केंद्र (Admin Notifications)"
            aria-label="Admin Notifications"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadAdminNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black animate-pulse shadow">
                {unreadAdminNotificationsCount}
              </span>
            )}
          </button>

          {/* GitHub Status Button */}
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            title="GitHub सिंक व ॲप बिल्डर"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">GitHub</span>
          </button>

          {/* PWA Install Button */}
          <button
            type="button"
            onClick={handleInstallPwa}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer active:scale-95"
            title="मोबाईल स्क्रीनवर सेपरेट ॲप इन्स्टॉल करा"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ॲप इन्स्टॉल करा</span>
          </button>

          {/* Full Console Launch */}
          <button
            type="button"
            onClick={() => setIsFullConsoleOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#800C1E] hover:bg-[#A71930] text-white text-xs font-bold border border-rose-400/30 flex items-center gap-1 transition cursor-pointer active:scale-95"
            title="संपूर्ण ॲडमिन कन्सोल"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">संपूर्ण कन्सोल</span>
          </button>

          {/* Switch to Member App */}
          <button
            type="button"
            onClick={() => {
              if (onBackToMemberApp) onBackToMemberApp();
              else if (setCurrentView) setCurrentView('home');
              else window.location.href = '/';
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="सदस्य ॲप पहा"
          >
            <Eye className="w-4 h-4 text-amber-400" />
          </button>

          {/* Lock App */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
            title="ॲडमिन ॲप लॉक करा"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 📊 LIVE EXECUTIVE STATS STRIP (Clickable Quick Filters) */}
      {/* ========================================================= */}
      <section className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-6 py-2.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2.5 min-w-max">
          {/* 1. Pending Payments Card */}
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-2xl border transition flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'payments'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-amber-400/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                प्रलंबित पेमेंट्स (UTR)
              </div>
              <div className="text-sm font-black flex items-center gap-1.5">
                <span>{pendingPayments.length}</span>
                {pendingPayments.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
            </div>
          </button>

          {/* 2. Pending Member Approvals Card */}
          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-2 rounded-2xl border transition flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'approvals'
                ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-rose-400/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                नवीन सदस्य मंजुरी
              </div>
              <div className="text-sm font-black flex items-center gap-1.5">
                <span>{pendingMemberApprovals.length}</span>
                {pendingMemberApprovals.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
            </div>
          </button>

          {/* 3. Pending Aadhaar KYC Card */}
          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`px-3.5 py-2 rounded-2xl border transition flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'kyc'
                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-sky-400/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                आधार KYC प्रलंबित
              </div>
              <div className="text-sm font-black">
                {pendingAadhaarVerifications.length}
              </div>
            </div>
          </button>

          {/* 4. Agora Live Calling Center */}
          <button
            type="button"
            onClick={() => setActiveTab('calls')}
            className={`px-3.5 py-2 rounded-2xl border transition flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'calls'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-emerald-400/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Agora ऑडिओ कॉल
              </div>
              <div className="text-sm font-black text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>सक्रिय (Ready)</span>
              </div>
            </div>
          </button>

          {/* 5. Total Approved Revenue */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
              ₹
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                एकूण महसूल (Revenue)
              </div>
              <div className="text-sm font-black text-amber-400">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* 6. Total Verified Members */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                एकूण सदस्य संख्या
              </div>
              <div className="text-sm font-black text-white">
                {totalMembersCount}
              </div>
            </div>
          </div>

          {/* 7. Banned Profiles & Reports */}
          <button
            type="button"
            onClick={() => setActiveTab('banned')}
            className={`px-3.5 py-2 rounded-2xl border transition flex items-center gap-2.5 cursor-pointer text-left ${
              activeTab === 'banned'
                ? 'bg-rose-600/20 border-rose-500 text-rose-200'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-rose-500/50'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                बॅन प्रोफाईल्स व तक्रारी
              </div>
              <div className="text-sm font-black text-rose-300 flex items-center gap-1.5">
                <span>{bannedProfiles.length}</span>
                <span className="text-[10px] text-slate-400 font-normal">({profileReports.length} तक्रारी)</span>
              </div>
            </div>
          </button>

          {/* 8. Auto-Approval Setting Quick Toggle */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${siteConfig?.autoApproveNewRegistrations !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  ऑटो-अप्रुव्हल मोड
                </div>
                <div className="text-xs font-black">
                  {siteConfig?.autoApproveNewRegistrations !== false ? (
                    <span className="text-emerald-400">⚡ चालू (Auto Mode)</span>
                  ) : (
                    <span className="text-amber-400">⏳ मॅन्युअल तपासणी</span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoApproval}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95 border ${
                siteConfig?.autoApproveNewRegistrations !== false
                  ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border-amber-500/40'
              }`}
              title="ऑटो-मंजुरी मोड चालू किंवा बंद करा"
            >
              बदला
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 🧭 NAVIGATION QUICK CHIP BAR */}
      {/* ========================================================= */}
      <nav className="bg-slate-900 border-b border-slate-800/80 px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {[
          { id: 'quick_deck', label: '⚡ डॅशबोर्ड', icon: Zap },
          { id: 'payments', label: `💳 पेमेंट्स (${pendingPayments.length})`, icon: CreditCard },
          { id: 'approvals', label: `👥 नवीन सदस्य (${pendingMemberApprovals.length})`, icon: CheckCircle2 },
          { id: 'kyc', label: `🪪 आधार KYC (${pendingAadhaarVerifications.length})`, icon: ShieldCheck },
          { id: 'calls', label: '📞 Agora कॉल सेंटर', icon: Phone },
          { id: 'banned', label: `🚨 बॅन प्रोफाईल्स व तक्रारी (${bannedProfiles.length})`, icon: Ban },
          { id: 'search', label: '🔍 सदस्य शोध', icon: Search },
          { id: 'broadcast', label: '📢 सूचना', icon: Bell },
          { id: 'github', label: '🚀 GitHub', icon: Send },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ========================================================= */}
      {/* 📱 MAIN VIEW BODY CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">

        {/* ------------------------------------------------------- */}
        {/* TAB 1: QUICK ACCESS COMMAND DECK (Overview) */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'quick_deck' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Urgent Alert Banner if pending items exist */}
            {(pendingPayments.length > 0 || pendingMemberApprovals.length > 0) && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border-2 border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-200">
                      त्वरित लक्ष आवश्यक: {pendingPayments.length} पेमेंट्स & {pendingMemberApprovals.length} नवीन सदस्य प्रलंबित आहेत!
                    </h3>
                    <p className="text-xs text-slate-300">
                      खालील १-टॅप बटणे दाबून तात्काळ मंजुरी द्या, जेणेकरून सदस्यांचे संपर्क अनलॉक होतील.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pendingPayments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('payments')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300 transition cursor-pointer shadow"
                    >
                      पेमेंट्स मंजूर करा ({pendingPayments.length})
                    </button>
                  )}
                  {pendingMemberApprovals.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('approvals')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-500 transition cursor-pointer shadow"
                    >
                      सदस्य मंजूर करा ({pendingMemberApprovals.length})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* QUICK ACTIONS 6-PACK GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tile 1: 1-Tap Payments */}
              <div
                onClick={() => setActiveTab('payments')}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/70 transition shadow-lg cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 font-mono text-xs font-black">
                    {pendingPayments.length} प्रलंबित
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                    १-टॅप पेमेंट व UTR मंजुरी
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    PhonePe, Google Pay व QR द्वारे आलेल्या देणग्या व सबस्क्रिप्शन पडताळून १-क्लिकमध्ये सक्रिय करा.
                  </p>
                </div>
                <div className="flex items-center text-xs text-amber-400 font-black gap-1 pt-1">
                  <span>पेमेंट यादी उघडा</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tile 2: 1-Tap Member Approvals */}
              <div
                onClick={() => setActiveTab('approvals')}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-400/70 transition shadow-lg cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 font-mono text-xs font-black">
                    {pendingMemberApprovals.length} नवीन
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-rose-400 transition-colors">
                    नवीन सदस्य प्रोफाईल पडताळणी
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    नोंदणी केलेल्या नवीन वधू-वरांचे बायोडाटा तपासा आणि तात्काळ मंजुरी द्या.
                  </p>
                </div>
                <div className="flex items-center text-xs text-rose-400 font-black gap-1 pt-1">
                  <span>सदस्य यादी उघडा</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tile 3: Agora Call Hub */}
              <div
                onClick={() => setActiveTab('calls')}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-400/70 transition shadow-lg cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Agora Live</span>
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                    Agora इन-ॲप ऑडिओ कॉल सेंटर
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    सदस्यांकडून येणारे थेट ऑडिओ कॉल्स स्वीकारा, रिंगटोन चाचणी घ्या व कॉल क्रेडेन्शियल्स व्यवस्थापित करा.
                  </p>
                </div>
                <div className="flex items-center text-xs text-emerald-400 font-black gap-1 pt-1">
                  <span>कॉल सेंटर उघडा</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tile 4: Fast Search & Unlock */}
              <div
                onClick={() => setActiveTab('search')}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/70 transition shadow-lg cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 font-mono text-xs font-black">
                    {totalMembersCount} सदस्य
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-sky-400 transition-colors">
                    झटपट सदस्य शोध व अनलॉक
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    आयडी (VJ-...), नाव किंवा मोबाईलवरून त्वरित सदस्य शोधा, संपर्क अनलॉक करा किंवा एडिट करा.
                  </p>
                </div>
                <div className="flex items-center text-xs text-sky-400 font-black gap-1 pt-1">
                  <span>शोध सुरू करा</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tile 5: Push Broadcast Alerts */}
              <div
                onClick={() => setActiveTab('broadcast')}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-400/70 transition shadow-lg cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-black">
                    📢 Push Blast
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors">
                    तात्काळ ब्रॉडकास्ट पुश सूचना
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    सर्व नोंदणीकृत सदस्यांच्या मोबाईलवर एका क्लिकमध्ये ध्वनीसह अधिकृत सूचना किंवा ऑफर पाठवा.
                  </p>
                </div>
                <div className="flex items-center text-xs text-indigo-400 font-black gap-1 pt-1">
                  <span>सूचना पाठवा</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Tile 6: GitHub App Push & Sync */}
              <div
                onClick={() => setActiveTab('github')}
                className="p-5 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-400 transition shadow-lg cursor-pointer group space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">
                    🚀 GitHub Engine
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                    GitHub वर ॲप पाठवा व APK बनवा
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    संपूर्ण ॲडमिन ॲप GitHub रिपॉझिटरीवर १-क्लिकमध्ये पुश करा आणि ऑटोमॅटिक APK बिल्ड करा.
                  </p>
                </div>
                <div className="flex items-center text-xs text-emerald-400 font-black gap-1 pt-1">
                  <span>GitHub सेंटर उघडा</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Quick Preview of Recent Pending Payments (Immediate 1-tap resolution) */}
            {pendingPayments.length > 0 && (
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>ताज्या प्रलंबित पेमेंट्स (झटपट १-टॅप मंजुरी)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    सर्व पहा ({pendingPayments.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingPayments.slice(0, 4).map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-amber-400/30 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white truncate">
                            {req.userName || 'सदस्य'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold text-xs">
                            ₹{req.amount}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          UTR: <strong className="text-slate-200">{req.utrNumber || 'N/A'}</strong>
                        </p>
                        <p className="text-[11px] text-amber-400/80 truncate">
                          प्लॅन: {req.planName}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickApprovePayment(req)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow active:scale-95 transition cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>मंजूर</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickRejectPayment(req)}
                          className="px-2 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold text-xs active:scale-95 transition cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 2: PAYMENTS (1-Tap Approvals & Detailed Proofs) */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'payments' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>पेमेंट पडताळणी व त्वरित मंजुरी पोर्टल</span>
                </h2>
                <p className="text-xs text-slate-400">
                  PhonePe, GPay, Paytm व UPI द्वारे आलेले सर्व ट्रान्झॅक्शन्स
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                {pendingPayments.length} प्रलंबित विनंत्या
              </span>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">सध्या कोणतीही प्रलंबित पेमेंट नाही!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  सर्व सदस्यांचे पेमेंट्स मंजूर झाले आहेत. नवीन पेमेंट येताच येथे त्वरित दिसेल.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPayments.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-3xl bg-slate-900 border-2 border-amber-400/40 shadow-xl space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-base font-black text-white">
                            {req.userName || 'सदस्य'}
                          </h4>
                          <p className="text-xs text-slate-400">
                            मोबाईल: <strong className="text-slate-200">{req.userMobile || 'N/A'}</strong>
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs font-mono shadow">
                          ₹{req.amount}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">प्लॅन:</span>
                          <span className="font-bold text-amber-300">{req.planName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">UTR क्रमांक:</span>
                          <span className="font-mono font-black text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                            {req.utrNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">तारीख:</span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(req.createdAt).toLocaleString('mr-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Screenshot Thumbnail Preview if available */}
                      {req.screenshotUrl && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">पेमेंट स्क्रीनशॉट पुरावा:</span>
                          <a
                            href={req.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative rounded-xl overflow-hidden border border-amber-400/40 h-28 bg-slate-950 group"
                          >
                            <img
                              src={req.screenshotUrl}
                              alt="Payment Proof"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Eye className="w-4 h-4" />
                              <span>मोठा फोटो पहा</span>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickApprovePayment(req)}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>मंजूर करा (Approve)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickRejectPayment(req)}
                        className="py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 font-bold text-xs border border-rose-500/30 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>रिजेक्ट</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 3: MEMBER APPROVALS (New Registration Review) */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'approvals' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-400" />
                  <span>नवीन सदस्य पडताळणी व मंजुरी पोर्टल</span>
                </h2>
                <p className="text-xs text-slate-400">
                  नोंदणी झालेले नवीन वधू-वर स्थळे थेट मंजूर करा
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/30">
                {pendingMemberApprovals.length} सदस्य प्रलंबित
              </span>
            </div>

            {pendingMemberApprovals.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">सर्व नवीन सदस्य आधीच मंजूर झालेले आहेत!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  नवीन नोंदणी होताच तिचे प्रोफाईल येथे तात्काळ मंजुरीसाठी दिसेल.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingMemberApprovals.map((profile) => (
                  <div
                    key={profile.id}
                    className="p-4 rounded-3xl bg-slate-900 border-2 border-rose-400/40 shadow-xl space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                        {profile.photos && profile.photos[0] ? (
                          <img
                            src={profile.photos[0]}
                            alt={profile.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">
                            फोटो नाही
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-black text-white truncate">
                            {profile.fullName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          {profile.gender === 'bride' ? 'वधू' : 'वर'} • {profile.age} वर्षे • {profile.height || '५ फूट'}
                        </p>
                        <p className="text-xs text-slate-300 font-semibold truncate mt-0.5">
                          {profile.education || 'शिक्षण'} • {profile.occupation || 'नोकरी/व्यवसाय'}
                        </p>
                        <p className="text-[11px] text-amber-400 mt-0.5 truncate">
                          जिल्हा: {profile.district || 'महाराष्ट्र'} | उपजात: {profile.subCaste || 'वंजारी'}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <p>
                        मोबाईल: <strong className="text-white font-mono">{profile.mobile}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        आयडी: <span className="font-mono text-slate-300">{profile.id}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickApproveMember(profile)}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>मंजूर करा</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProfileForModal(profile)}
                        className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span>बायोडाटा पहा</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 4: AADHAAR KYC VERIFICATION */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'kyc' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <span>आधार व ओळखपत्र पडताळणी (KYC)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  सदस्यांनी जोडलेले आधार कार्ड तपासा व व्हेरिफाईड बॅज द्या
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black border border-sky-500/30">
                {pendingAadhaarVerifications.length} प्रलंबित
              </span>
            </div>

            {pendingAadhaarVerifications.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-sky-400 mx-auto" />
                <h4 className="text-base font-bold text-white">सर्व आधार दस्तऐवज प्रमाणित झालेले आहेत!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  नवीन सदस्याने आधार कार्ड अपलोड केल्यास त्वरित येथे पडताळणीसाठी येईल.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingAadhaarVerifications.map((profile) => (
                  <div
                    key={profile.id}
                    className="p-4 rounded-3xl bg-slate-900 border-2 border-sky-400/40 shadow-xl space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-white truncate">
                          {profile.fullName}
                        </h4>
                        <span className="text-[10px] text-sky-300 font-mono bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                          ID: {profile.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {profile.district} • मोबाईल: {profile.mobile}
                      </p>
                    </div>

                    {/* Aadhaar Images */}
                    <div className="grid grid-cols-2 gap-2">
                      {profile.aadhaarFrontUrl || profile.aadhaarCardUrl ? (
                        <a
                          href={profile.aadhaarFrontUrl || profile.aadhaarCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative rounded-xl overflow-hidden border border-slate-700 h-24 bg-slate-950 group"
                        >
                          <img
                            src={profile.aadhaarFrontUrl || profile.aadhaarCardUrl}
                            alt="Aadhaar Front"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                            Front Side
                          </span>
                        </a>
                      ) : null}

                      {profile.aadhaarBackUrl ? (
                        <a
                          href={profile.aadhaarBackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative rounded-xl overflow-hidden border border-slate-700 h-24 bg-slate-950 group"
                        >
                          <img
                            src={profile.aadhaarBackUrl}
                            alt="Aadhaar Back"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                            Back Side
                          </span>
                        </a>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickVerifyAadhaar(profile)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs shadow active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>आधार व्हेरिफाय करा (Verified Badge द्या)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 5: AGORA REAL-TIME CALL HUB */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'calls' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <AdminAgoraSettings />
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB: BANNED PROFILES & REPORTS HUB */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'banned' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AdminReportsView />
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 6: INSTANT SEARCH & QUICK UNLOCK */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'search' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-400" />
                <span>झटपट सदस्य शोध व संपर्क अनलॉक</span>
              </h2>
              <p className="text-xs text-slate-400">
                कोणत्याही सदस्याचे नाव, मोबाईल किंवा आयडी टाकून एका क्लिकमध्ये माहिती पहा
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="नाव, मोबाईल किंवा आयडी शोधा (उदा. Rahul, 9890..., VJ-101)..."
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white px-2 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMembers.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/40 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                      {p.photos && p.photos[0] ? (
                        <img src={p.photos[0]} alt={p.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                          फोटो नाही
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-white truncate flex items-center gap-1">
                        <span>{p.fullName}</span>
                        {p.isApproved !== false && <VerifiedBadge profile={p} size="sm" showLabel={false} />}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        मोबाईल: <strong className="text-amber-300 font-mono">{p.mobile}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        ID: {p.id} • {p.district} • {p.membership || 'free'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedProfileForModal(p)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 active:scale-95 transition cursor-pointer shrink-0"
                  >
                    पहा
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 7: BROADCAST PUSH NOTIFICATIONS */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'broadcast' && (
          <div className="space-y-4 animate-in fade-in duration-200 max-w-2xl mx-auto">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <span>सर्व सदस्यांना तात्काळ ब्रॉडकास्ट पुश सूचना</span>
              </h2>
              <p className="text-xs text-slate-400">
                १-क्लिकमध्ये सर्व मोबाईल युझर्सना ध्वनीसह हेड-अप पुश नोटिफिकेशन पाठवा
              </p>
            </div>

            {broadcastSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>🎉 ब्रॉडकास्ट सूचना सर्व सदस्यांना यशस्वीरित्या पाठवली गेली आहे!</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcastNotification} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">सूचनेचे शीर्षक (Title):</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="उदा. 🔔 वंजारी जोडी विशेष सूचना"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">संदेश (Message):</label>
                <textarea
                  rows={3}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="सदस्यांना दाखवायचा संदेश येथे लिहा..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Ready-to-use Template Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 block">झटपट टेम्प्लेट्स निवडा:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { t: '🔔 नवीन ५०+ वधू-वर स्थळे उपलब्ध!', m: 'आज तुमच्या पसंतीस उतरतील अशी अनेक नवीन स्थळे जोडली गेली आहेत. त्वरित पहा!' },
                    { t: '🎉 विशेष सवलत ऑफर आज शेवटचा दिवस!', m: 'वेलकम ऑफर मध्ये सर्व संपर्क नंबर त्वरित अनलॉक करा. ऑफर आज रात्री १२ वाजेपर्यंतच.' },
                    { t: '🌟 ॲप अपडेट उपलब्ध!', m: 'अधिक वेगवान व सुरक्षित अनुभवासाठी ॲपचे नवीन व्हर्जन आता उपलब्ध आहे.' }
                  ].map((temp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setBroadcastTitle(temp.t);
                        setBroadcastMsg(temp.m);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 font-bold border border-slate-700 transition cursor-pointer"
                    >
                      {temp.t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingBroadcast}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-sm shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingBroadcast ? 'सूचना पाठवत आहे...' : '📢 सर्व सदस्यांना ध्वनीसह पुश पाठवा'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* TAB 8: GITHUB APP REPOSITORY & SYNC CENTER */}
        {/* ------------------------------------------------------- */}
        {activeTab === 'github' && (
          <div className="space-y-5 animate-in fade-in duration-200 max-w-3xl mx-auto">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <span>GitHub वर ॲप पाठवा (GitHub App Push & Actions Center)</span>
              </h2>
              <p className="text-xs text-slate-400">
                ॲडमिन ॲप व संपूर्ण कोड GitHub वर थेट पुश करा आणि GitHub Actions द्वारे APK डाऊनलोड करा
              </p>
            </div>

            {/* Result banner if synced */}
            {githubSyncResult && (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold ${
                  githubSyncResult.success
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-rose-500/20 border-rose-400 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {githubSyncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span className="text-sm font-black">
                    {githubSyncResult.success ? '🎉 GitHub वर ॲप यशस्वीरित्या पुश झाले!' : 'त्रुटी आली'}
                  </span>
                </div>
                {githubSyncResult.message && <p className="mt-1">{githubSyncResult.message}</p>}
                {githubSyncResult.error && <p className="mt-1 whitespace-pre-line">{githubSyncResult.error}</p>}
                {githubSyncResult.repoUrl && (
                  <a
                    href={githubSyncResult.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs underline"
                  >
                    <span>GitHub Repo उघडा</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Connected Account Card if token validated */}
            {connectedGitHubUser && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={connectedGitHubUser.avatar_url}
                    alt={connectedGitHubUser.login}
                    className="w-10 h-10 rounded-full border border-emerald-400"
                  />
                  <div>
                    <h4 className="text-sm font-black text-white">
                      जोडलेले खाते: @{connectedGitHubUser.login} ({connectedGitHubUser.name || 'GitHub User'})
                    </h4>
                    <p className="text-xs text-slate-400">
                      पब्लिक Repos: {connectedGitHubUser.public_repos} | ईमेल: {connectedGitHubUser.email || 'hospital.hospital916@gmail.com'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Verified Token</span>
                </span>
              </div>
            )}

            {/* GitHub Form Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    GitHub Personal Access Token (PAT):
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=VanjariJodi+Admin+App"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                  >
                    <span>नवीन Token तयार करा (३० सेकंद)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-emerald-400"
                />
                <p className="text-[11px] text-slate-400">
                  टोकनला <strong className="text-amber-300">repo</strong> आणि <strong className="text-amber-300">workflow</strong> परमिशन असावी.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Repository Name (GitHub वरील रिपॉझिटरी नाव):
                </label>
                <input
                  type="text"
                  value={githubRepoName}
                  onChange={(e) => setGithubRepoName(e.target.value)}
                  placeholder="vanjarijodi-admin-app"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-emerald-400"
                />
                <p className="text-[11px] text-slate-400">
                  जर रिपॉझिटरी अस्तित्वात नसेल, तर ती GitHub वर स्वयंचलित तयार केली जाईल.
                </p>
              </div>

              {/* Action Buttons: Push to GitHub & Download ZIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDeployToGitHub}
                  disabled={isSyncingGitHub}
                  className="py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSyncingGitHub ? 'GitHub वर पाठवत आहे...' : '🚀 GitHub वर थेट Push करा'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadStandaloneZip}
                  disabled={isDownloadingZip}
                  className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-400/30 shadow active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingZip ? 'ZIP तयार होत आहे...' : '📦 Admin App (ZIP) डाऊनलोड'}</span>
                </button>
              </div>
            </div>

            {/* Explanation Guide Card */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>GitHub वरील ॲप वर्कफ्लो आणि APK बिल्डर:</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">१.</span>
                  <span><strong>ऑटोमॅटिक GitHub Actions:</strong> रिपॉझिटरीमध्ये <code className="font-mono text-amber-300">.github/workflows/build-admin-app.yml</code> फाईल आधीच जोडली आहे. तुम्ही कोड पुश करताच GitHub स्वयंचलितपणे Android APK बिल्ड करतो.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">२.</span>
                  <span><strong>APK डाऊनलोड:</strong> तुमच्या GitHub रिपोमधील <strong>"Actions"</strong> टॅबमध्ये जाऊन तुम्ही तयार झालेली <code className="font-mono text-emerald-300">VanjariJodi-Admin.apk</code> थेट मोबाईलमध्ये इन्स्टॉल करू शकता.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">३.</span>
                  <span><strong>सेपरेट ॲप PWA:</strong> हे ॲप तुमच्या फोनवर standalone PWA म्हणून चालवण्यासाठी वरील <strong>"📲 ॲप इन्स्टॉल करा"</strong> बटण दाबा.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* 🔔 ADMIN NOTIFICATIONS CENTER MODAL */}
      {/* ========================================================= */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-400/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-950 via-[#2A040A] to-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>ॲडमिन सूचना केंद्र</span>
                    {unreadAdminNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
                        {unreadAdminNotificationsCount} नवीन
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    तक्रारी, ऑटो-बॅन, नवीन सदस्य व पेमेंट्सच्या तात्काळ सूचना
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Test Bar */}
            <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playNotificationSound();
                    triggerDeviceVibration([300, 100, 300]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 transition cursor-pointer"
                  title="रिंगटोन आणि ध्वनी तपासा"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>ध्वनी चाचणी</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const res = await requestPushPermission();
                    if (res === 'granted') {
                      playNotificationSound();
                      triggerDeviceVibration([300, 100, 300]);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 transition cursor-pointer"
                  title="ब्राऊझर सिस्टम पुश सूचना सुरू करा"
                >
                  <Bell className="w-3.5 h-3.5 text-sky-400" />
                  <span>पुश परवानगी</span>
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    adminNotifications.forEach((n) => {
                      if (!n.isRead && markNotificationAsRead) markNotificationAsRead(n.id);
                    });
                    playNotificationSound();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>सर्व वाचले (Mark Read)</span>
                </button>

                {adminNotifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (clearAllNotifications) clearAllNotifications();
                      playNotificationSound();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटवा</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              {[
                { id: 'all', label: `सर्व (${adminNotifications.length})` },
                { id: 'reports', label: `🚨 तक्रारी व ऑटो-बॅन` },
                { id: 'payments', label: `💳 पेमेंट्स (${pendingPayments.length})` },
                { id: 'registrations', label: `👥 नवीन नोंदणी (${pendingMemberApprovals.length})` },
                { id: 'kyc', label: `🪪 KYC (${pendingAadhaarVerifications.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setNotificationFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
                    notificationFilter === f.id
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notifications List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[250px] max-h-[50vh]">
              {(() => {
                const filtered = adminNotifications.filter((n) => {
                  if (notificationFilter === 'reports') {
                    return (
                      n.title?.toLowerCase().includes('report') ||
                      n.titleMr?.includes('तक्रार') ||
                      n.titleMr?.includes('ऑटो-बॅन') ||
                      n.title?.toLowerCase().includes('ban')
                    );
                  }
                  if (notificationFilter === 'payments') {
                    return (
                      n.title?.toLowerCase().includes('payment') ||
                      n.titleMr?.includes('पेमेंट') ||
                      n.titleMr?.includes('पावती')
                    );
                  }
                  if (notificationFilter === 'registrations') {
                    return (
                      n.title?.toLowerCase().includes('registration') ||
                      n.titleMr?.includes('नोंदणी') ||
                      n.titleMr?.includes('सदस्य')
                    );
                  }
                  if (notificationFilter === 'kyc') {
                    return (
                      n.title?.toLowerCase().includes('aadhaar') ||
                      n.titleMr?.includes('आधार') ||
                      n.titleMr?.includes('kyc')
                    );
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-300">कोणतीही प्रलंबित सूचना नाही!</p>
                      <p className="text-xs text-slate-500">
                        नवीन तक्रार, ऑटो-बॅन किंवा नोंदणी होताच येथे तात्काळ दिसेल.
                      </p>
                    </div>
                  );
                }

                return filtered.map((item) => {
                  const isReport =
                    item.title?.toLowerCase().includes('report') ||
                    item.titleMr?.includes('तक्रार') ||
                    item.titleMr?.includes('ऑटो-बॅन');
                  const isPayment =
                    item.title?.toLowerCase().includes('payment') || item.titleMr?.includes('पेमेंट');

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (!item.isRead && markNotificationAsRead) markNotificationAsRead(item.id);
                        if (isReport) {
                          setActiveTab('banned');
                          setIsNotificationModalOpen(false);
                        } else if (isPayment) {
                          setActiveTab('payments');
                          setIsNotificationModalOpen(false);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                        isReport
                          ? 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-500/40'
                          : isPayment
                          ? 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-500/40'
                          : 'bg-slate-950 hover:bg-slate-800/70 border-slate-800'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isReport
                            ? 'bg-rose-500/20 text-rose-400'
                            : isPayment
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-sky-500/20 text-sky-400'
                        }`}
                      >
                        {isReport ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : isPayment ? (
                          <CreditCard className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">
                            {item.titleMr || item.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {(item.timestamp || item.createdAt) ? new Date(item.timestamp || item.createdAt).toLocaleTimeString() : 'आत्ताच'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.messageMr || item.message}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>एकूण सूचना: {adminNotifications.length}</span>
              <button
                type="button"
                onClick={() => setIsNotificationModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
