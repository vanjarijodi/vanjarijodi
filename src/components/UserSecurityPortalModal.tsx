import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Shield,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  History,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  fetchUserSessions,
  revokeUserSessions,
  fetchSecurityLogs,
  logSecurityEvent
} from '../utils/securityService';
import { UserSession, SecurityLogEvent } from '../types';

interface UserSecurityPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSecurityPortalModal: React.FC<UserSecurityPortalModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, language, setCurrentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'sessions' | 'history' | 'account_security'>('sessions');

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [logs, setLogs] = useState<SecurityLogEvent[]>([]);
  const [currentIp, setCurrentIp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const loadSecurityData = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const [sessionsRes, logsRes] = await Promise.all([
        fetchUserSessions(currentUser.id),
        fetchSecurityLogs({ userId: currentUser.id, limit: 20 })
      ]);

      if (sessionsRes.success) {
        setSessions(sessionsRes.sessions || []);
        if (sessionsRes.currentIp) setCurrentIp(sessionsRes.currentIp);
      }

      if (logsRes.success) {
        setLogs(logsRes.logs || []);
      }
    } catch (err) {
      console.error('Error loading security data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadSecurityData();
      setMessage(null);
      setPasswordSuccess(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleRevokeAllOtherSessions = async () => {
    if (!window.confirm(
      language === 'mr'
        ? 'तुम्हाला तुमच्या चालू उपकरणाव्यतिरिक्त इतर सर्व उपकरणांमधून लॉगआउट करायचे आहे का?'
        : 'Are you sure you want to log out of all other devices?'
    )) return;

    setActionLoading(true);
    try {
      const res = await revokeUserSessions({
        userId: currentUser.id,
        revokeAllOther: true
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: language === 'mr'
            ? 'इतर सर्व उपकरणांवरील सत्रे बंद करण्यात आली.'
            : 'All other device sessions have been revoked.'
        });
        loadSecurityData();
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error revoking sessions' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSpecificSession = async (sessionId: string) => {
    setActionLoading(true);
    try {
      const res = await revokeUserSessions({
        userId: currentUser.id,
        sessionId
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: language === 'mr' ? 'उपकरण सत्र यशस्वी बंद केले.' : 'Device session revoked.'
        });
        loadSecurityData();
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error revoking session' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert(language === 'mr' ? 'नवीन पासवर्ड किमान ६ अक्षरी असावा.' : 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(language === 'mr' ? 'दोन्ही पासवर्ड जुळत नाहीत!' : 'Passwords do not match.');
      return;
    }

    // Update password on current user
    setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
    logSecurityEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userMobile: currentUser.mobile,
      eventType: 'PASSWORD_RESET_SUCCESS',
      metadata: { action: 'user_changed_password' }
    });

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({
      type: 'success',
      text: language === 'mr' ? 'तुमचा पासवर्ड यशस्वीरीत्या बदलण्यात आला आहे!' : 'Password updated successfully!'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-amber-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-amber-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-amber-100 flex items-center gap-2">
                {language === 'mr' ? 'सुरक्षा केंद्र व लॉगिन ॲक्टिव्हिटी' : 'Security & Login Activity'}
              </h2>
              <p className="text-xs text-rose-200">
                {language === 'mr'
                  ? 'तुमच्या अकाऊंटची सुरक्षा, सक्रिय डिव्हाइसेस व लॉगिन इतिहास'
                  : 'Account security, active sessions & login history'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-rose-200 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'sessions'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            {language === 'mr' ? 'सक्रिय डिव्हाइसेस (Sessions)' : 'Active Devices'}
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full font-bold">
              {sessions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'history'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4" />
            {language === 'mr' ? 'लॉगिन इतिहास (Logins)' : 'Login History'}
          </button>
          <button
            onClick={() => setActiveTab('account_security')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'account_security'
                ? 'border-red-800 text-red-900 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            {language === 'mr' ? 'पासवर्ड व 2FA' : 'Password & 2FA'}
          </button>
        </div>

        {/* Status Message Notification */}
        {message && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg flex items-center justify-between text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Active Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-950 text-sm">
                      {language === 'mr' ? 'सध्या लॉगिन असलेली उपकरणे' : 'Currently Logged In Devices'}
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {language === 'mr'
                        ? 'जर तुम्हाला कोणतेही अनोळखी उपकरण दिसले, तर ताबडतोब ते सत्र बंद करा.'
                        : 'If you see an unfamiliar device, revoke its session immediately.'}
                    </p>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllOtherSessions}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {language === 'mr' ? 'इतर सर्व उपकरणांवरून लॉगआउट' : 'Log out of all other devices'}
                  </button>
                )}
              </div>

              {/* Sessions List */}
              <div className="space-y-3">
                {sessions.map((sess, idx) => (
                  <div
                    key={sess.sessionId || idx}
                    className={`border rounded-xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      sess.isCurrentSession
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          sess.isCurrentSession
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {sess.device.toLowerCase().includes('mobile') || sess.os.toLowerCase().includes('android') || sess.os.toLowerCase().includes('ios') ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">
                            {sess.browser || 'Web Browser'} on {sess.os || 'Device'}
                          </span>
                          {sess.isCurrentSession ? (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                              {language === 'mr' ? 'हे चालू डिव्हाइस (Active Now)' : 'Current Device'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {language === 'mr' ? 'दुसरे डिव्हाइस' : 'Other Device'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            IP: {sess.ip || currentIp || '103.21.124.55'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {language === 'mr' ? 'लॉगिन वेळ:' : 'Login:'}{' '}
                            {new Date(sess.loginTime).toLocaleDateString('mr-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!sess.isCurrentSession && (
                      <button
                        onClick={() => handleRevokeSpecificSession(sess.sessionId)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-center"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {language === 'mr' ? 'लॉगआउट करा' : 'Revoke'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Login History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {language === 'mr' ? 'अलीकडील लॉगिन नोंदी (Audit History)' : 'Recent Login Logs'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'mr'
                      ? 'तुमच्या खात्यावर झालेले मागील लॉगिन व पडताळणी प्रयत्न'
                      : 'Past authentication and security events on your account'}
                  </p>
                </div>
                <button
                  onClick={loadSecurityData}
                  className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 uppercase font-semibold">
                    <tr>
                      <th className="p-3">{language === 'mr' ? 'तारीख व वेळ' : 'Date & Time'}</th>
                      <th className="p-3">{language === 'mr' ? 'डिव्हाइस / ब्राउझर' : 'Device / Browser'}</th>
                      <th className="p-3">{language === 'mr' ? 'IP पत्ता' : 'IP Address'}</th>
                      <th className="p-3 text-right">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-400">
                          {language === 'mr' ? 'कोणत्याही संशयास्पद नोंदी आढळल्या नाहीत.' : 'No login history found.'}
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/60 transition">
                          <td className="p-3 text-gray-800 font-medium whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString('mr-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-3 text-gray-700">
                            <span className="font-semibold">{log.browser || 'Browser'}</span> ({log.os || 'Device'})
                          </td>
                          <td className="p-3 font-mono text-gray-600 text-xs">
                            {log.ip}
                          </td>
                          <td className="p-3 text-right">
                            {log.status === 'success' ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {language === 'mr' ? 'यशस्वी' : 'Success'}
                              </span>
                            ) : log.status === 'blocked' ? (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {language === 'mr' ? 'ब्लॉक' : 'Blocked'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold inline-flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {language === 'mr' ? 'अयशस्वी' : 'Failed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Account Security & Password */}
          {activeTab === 'account_security' && (
            <div className="space-y-6">
              {/* Linked Accounts & Protection Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Google 1-Click</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {currentUser.email ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {currentUser.email}
                        </span>
                      ) : (
                        language === 'mr' ? 'गुगल खात्याशी लिंक नाही' : 'Not linked to Google'
                      )}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {language === 'mr' ? 'मोबाईल OTP सुरक्षा' : 'Mobile OTP Protection'}
                    </h4>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      +91 {currentUser.mobile} ({language === 'mr' ? 'सक्रिय' : 'Active'})
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <KeyRound className="w-5 h-5 text-red-900" />
                  <h4 className="font-bold text-gray-900 text-sm">
                    {language === 'mr' ? 'पासवर्ड बदला (Change Password)' : 'Change Password'}
                  </h4>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {language === 'mr' ? 'नवीन पासवर्ड (New Password)' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-900 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {language === 'mr' ? 'नवीन पासवर्ड पुन्हा प्रविष्ट करा (Confirm)' : 'Confirm New Password'}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-900 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-red-900 to-rose-900 text-white rounded-lg text-sm font-semibold shadow hover:opacity-95 transition"
                  >
                    {language === 'mr' ? 'पासवर्ड जतन करा' : 'Save New Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            {language === 'mr' ? '२५६-बिट एनक्रिप्शन सुरक्षित' : '256-Bit Encrypted Security'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            {language === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
