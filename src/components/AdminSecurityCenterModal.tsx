import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Ban,
  Unlock,
  Activity,
  History,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  UserX,
  FileText,
  CheckCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  fetchSecurityLogs,
  fetchAdminAuditLogs,
  toggleIpQuarantine,
  logAdminAuditRecord
} from '../utils/securityService';
import { SecurityLogEvent, AdminAuditLogRecord } from '../types';

interface AdminSecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSecurityCenterModal: React.FC<AdminSecurityCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language, profiles, toggleBlockProfile, siteConfig } = useApp();
  const [activeTab, setActiveTab] = useState<'live_feed' | 'threats' | 'blocked_ips' | 'admin_audits'>('live_feed');

  const [logs, setLogs] = useState<SecurityLogEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRecord[]>([]);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    totalEvents: number;
    successfulLogins: number;
    failedLogins: number;
    suspiciousEvents: number;
    blockedIpsCount: number;
  }>({
    totalEvents: 0,
    successfulLogins: 0,
    failedLogins: 0,
    suspiciousEvents: 0,
    blockedIpsCount: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [filterEventType, setFilterEventType] = useState('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualIpInput, setManualIpInput] = useState('');
  const [manualIpReason, setManualIpReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, auditsRes] = await Promise.all([
        fetchSecurityLogs({
          eventType: filterEventType,
          riskLevel: filterRiskLevel,
          search: searchQuery,
          limit: 100
        }),
        fetchAdminAuditLogs({ limit: 100 })
      ]);

      if (logsRes.success) {
        setLogs(logsRes.logs || []);
        if (logsRes.stats) setStats(logsRes.stats);
        if (logsRes.blockedIps) setBlockedIps(logsRes.blockedIps);
      }

      if (auditsRes.success) {
        setAuditLogs(auditsRes.auditLogs || []);
      }
    } catch (err) {
      console.error('Error fetching admin security center data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, filterEventType, filterRiskLevel]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleIp = async (ip: string, block: boolean, reason?: string) => {
    const confirmMsg = block
      ? `तुम्हाला IP (${ip}) ब्लॉक / प्रतिबंधित करायचा आहे का?`
      : `तुम्हाला IP (${ip}) अनब्लॉक करायचा आहे का?`;
    if (!window.confirm(confirmMsg)) return;

    const res = await toggleIpQuarantine(ip, block, reason || 'Manual admin action');
    if (res.success) {
      setActionMessage(block ? `IP ${ip} ब्लॉक करण्यात आला.` : `IP ${ip} अनब्लॉक करण्यात आला.`);
      logAdminAuditRecord({
        adminName: 'वंजारी जोडी टीम',
        action: block ? 'IP_BLOCKED' : 'IP_UNBLOCKED',
        category: 'SECURITY',
        targetEntityId: ip,
        details: `IP पत्ता ${ip} ${block ? 'ब्लॉक' : 'अनब्लॉक'} केला. Reason: ${reason || 'N/A'}`
      });
      loadData();
    }
  };

  const handleManualBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpInput.trim()) return;
    await handleToggleIp(manualIpInput.trim(), true, manualIpReason.trim() || 'Manual IP Block');
    setManualIpInput('');
    setManualIpReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-red-950 text-white p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  {language === 'mr' ? 'प्रशासक सुरक्षा नियंत्रण केंद्र' : 'Admin Security & Threat Center'}
                </h2>
                <span className="px-2 py-0.5 bg-red-600/40 border border-red-500/50 text-red-300 rounded-full text-xs font-semibold">
                  LIVE SHIELD
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {language === 'mr'
                  ? 'रिअल-टाइम सुरक्षा लॉग्ज, संशयास्पद हालचाली, IP क्वारंटाईन व ऑडिट ट्रेल्स'
                  : 'Real-time security logs, intrusion detection, IP quarantine & audit trails'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-gray-900 text-white border-b border-gray-800 text-xs">
          <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700">
            <span className="text-gray-400 block">{language === 'mr' ? 'एकूण सुरक्षा इव्हेंट्स' : 'Total Events'}</span>
            <span className="text-xl font-bold text-white mt-1 block">{stats.totalEvents}</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/50">
            <span className="text-emerald-400 block">{language === 'mr' ? 'यशस्वी लॉगिन' : 'Successful Logins'}</span>
            <span className="text-xl font-bold text-emerald-300 mt-1 block">{stats.successfulLogins}</span>
          </div>
          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/50">
            <span className="text-amber-400 block">{language === 'mr' ? 'अयशस्वी लॉगिन' : 'Failed Logins'}</span>
            <span className="text-xl font-bold text-amber-300 mt-1 block">{stats.failedLogins}</span>
          </div>
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/50">
            <span className="text-rose-400 block">{language === 'mr' ? 'संशयास्पद / धोके' : 'Suspicious Threats'}</span>
            <span className="text-xl font-bold text-rose-300 mt-1 block">{stats.suspiciousEvents}</span>
          </div>
          <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-800/50 col-span-2 sm:col-span-1">
            <span className="text-purple-400 block">{language === 'mr' ? 'क्वारंटाईन IP' : 'Blocked IPs'}</span>
            <span className="text-xl font-bold text-purple-300 mt-1 block">{stats.blockedIpsCount}</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('live_feed')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'live_feed'
                ? 'border-red-900 text-red-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            {language === 'mr' ? 'सुरक्षा लॉग्ज (Security Logs)' : 'Live Security Logs'}
            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded-full text-xs font-bold">
              {logs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('threats')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'threats'
                ? 'border-red-900 text-red-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            {language === 'mr' ? 'धोका विश्लेषण (Threat Detection)' : 'Threat Detection'}
            {stats.suspiciousEvents > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
                {stats.suspiciousEvents}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('blocked_ips')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'blocked_ips'
                ? 'border-red-900 text-red-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Ban className="w-4 h-4" />
            {language === 'mr' ? 'ब्लॉक केलेले IP (Quarantine)' : 'Blocked IPs'}
            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded-full text-xs font-bold">
              {blockedIps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('admin_audits')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'admin_audits'
                ? 'border-red-900 text-red-900 bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            {language === 'mr' ? 'प्रशासक ऑडिट ट्रेल्स (Admin Audits)' : 'Admin Audit Logs'}
          </button>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div className="bg-emerald-50 text-emerald-900 px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-emerald-200">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Live Security Feed */}
          {activeTab === 'live_feed' && (
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={language === 'mr' ? 'नाव, मोबाईल, IP, ई-मेल शोधा...' : 'Search Name, IP, Mobile...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:outline-none bg-white"
                  />
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  <select
                    value={filterEventType}
                    onChange={(e) => setFilterEventType(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none"
                  >
                    <option value="all">{language === 'mr' ? 'सर्व इव्हेंट्स' : 'All Events'}</option>
                    <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                    <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                    <option value="SUSPICIOUS_LOGIN_ATTEMPT">SUSPICIOUS_ATTEMPT</option>
                    <option value="UNAUTHORIZED_ACCESS_ATTEMPT">UNAUTHORIZED_ACCESS</option>
                    <option value="SESSION_REVOKED">SESSION_REVOKED</option>
                    <option value="PASSWORD_RESET_SUCCESS">PASSWORD_RESET</option>
                  </select>

                  <select
                    value={filterRiskLevel}
                    onChange={(e) => setFilterRiskLevel(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none"
                  >
                    <option value="all">{language === 'mr' ? 'सर्व रिस्क लेव्हल्स' : 'All Risk Levels'}</option>
                    <option value="critical">Critical Risk</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>

                  <button
                    onClick={loadData}
                    className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded-lg text-xs font-semibold shadow"
                  >
                    {language === 'mr' ? 'फिल्टर लावा' : 'Filter'}
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">{language === 'mr' ? 'इव्हेंट' : 'Event'}</th>
                      <th className="p-3">{language === 'mr' ? 'सदस्य / युझर' : 'Member / User'}</th>
                      <th className="p-3">{language === 'mr' ? 'IP व डिव्हाइस' : 'IP & Device'}</th>
                      <th className="p-3">{language === 'mr' ? 'रिस्क स्कोअर' : 'Risk Score'}</th>
                      <th className="p-3">{language === 'mr' ? 'तारीख / वेळ' : 'Timestamp'}</th>
                      <th className="p-3 text-right">{language === 'mr' ? 'कृती' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          {language === 'mr' ? 'कोणत्याही सुरक्षा नोंदी सापडल्या नाहीत.' : 'No security logs found.'}
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/70 transition">
                          <td className="p-3 font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold inline-block ${
                                log.eventType === 'LOGIN_SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.eventType === 'LOGIN_FAILED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {log.eventType}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-gray-900">{log.userName || log.userId}</div>
                            {log.userMobile && <div className="text-gray-500 text-xs">📞 {log.userMobile}</div>}
                            {log.userEmail && <div className="text-gray-400 text-xs">{log.userEmail}</div>}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-gray-900 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-gray-400" />
                              {log.ip}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {log.browser} ({log.os})
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  log.riskLevel === 'critical'
                                    ? 'bg-red-600 text-white'
                                    : log.riskLevel === 'high'
                                    ? 'bg-rose-100 text-rose-800'
                                    : log.riskLevel === 'medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {log.riskScore}% {log.riskLevel.toUpperCase()}
                              </span>
                            </div>
                            {log.riskReasons && log.riskReasons.length > 0 && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1" title={log.riskReasons.join(', ')}>
                                {log.riskReasons[0]}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-gray-600 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString('mr-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleIp(log.ip, !blockedIps.includes(log.ip), `Flagged from log: ${log.id}`)}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                                blockedIps.includes(log.ip)
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              {blockedIps.includes(log.ip)
                                ? (language === 'mr' ? 'अनब्लॉक करा' : 'Unblock IP')
                                : (language === 'mr' ? 'IP ब्लॉक करा' : 'Block IP')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Threat Detection */}
          {activeTab === 'threats' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-rose-950 text-sm">
                    {language === 'mr' ? 'स्वयंचलित घुसखोरी व ब्रूट-फोर्स प्रतिबंधक ढाल' : 'Automated Intrusion & Brute-Force Shield'}
                  </h3>
                  <p className="text-xs text-rose-800 mt-1">
                    {language === 'mr'
                      ? 'सिस्टम प्रत्येक लॉगिन प्रयत्नाचा रिस्क स्कोअर मोजते. सतत ५ पेक्षा जास्त चुकीचे प्रयत्न झाल्यास IP आपोआप तात्पुरता थांबवला जातो.'
                      : 'Every login attempt is evaluated by the server-side risk analyzer. Repeated malicious requests are automatically flagged and throttled.'}
                  </p>
                </div>
              </div>

              {/* Threat Logs Filtered */}
              <div className="space-y-3">
                {logs.filter(l => l.riskLevel === 'high' || l.riskLevel === 'critical').length === 0 ? (
                  <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-gray-700 text-sm">
                      {language === 'mr' ? 'सध्या कोणतीही गंभीर सुरक्षा त्रुटी किंवा धोका आढळला नाही.' : 'No high-risk security threats detected.'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'mr' ? 'सिस्टम सुरक्षित आणि स्थिर आहे.' : 'System is secure and running normally.'}
                    </p>
                  </div>
                ) : (
                  logs
                    .filter(l => l.riskLevel === 'high' || l.riskLevel === 'critical')
                    .map((threat) => (
                      <div
                        key={threat.id}
                        className="border border-rose-200 bg-rose-50/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-red-600 text-white rounded text-xs font-bold">
                              CRITICAL RISK ({threat.riskScore}%)
                            </span>
                            <span className="font-mono text-xs font-bold text-gray-900">
                              IP: {threat.ip}
                            </span>
                          </div>

                          <div className="text-xs text-gray-800">
                            <strong>{language === 'mr' ? 'कारण:' : 'Reason:'}</strong>{' '}
                            {threat.riskReasons?.join(' • ') || 'Multiple suspicious indicators'}
                          </div>

                          <div className="text-xs text-gray-500 flex items-center gap-4">
                            <span>User Agent: {threat.userAgent}</span>
                            <span>
                              Time:{' '}
                              {new Date(threat.timestamp).toLocaleTimeString('mr-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleIp(threat.ip, !blockedIps.includes(threat.ip), 'Critical threat mitigated')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow transition shrink-0"
                        >
                          {blockedIps.includes(threat.ip) ? 'Unblock IP' : 'Block IP Immediately'}
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Blocked IPs */}
          {activeTab === 'blocked_ips' && (
            <div className="space-y-5">
              {/* Manual IP Block Form */}
              <form onSubmit={handleManualBlockIp} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === 'mr' ? 'नवीन IP ब्लॉक करा (IP Address)' : 'Block New IP Address'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. 192.168.1.1 किंवा 185.220.101.5"
                    value={manualIpInput}
                    onChange={(e) => setManualIpInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-900"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {language === 'mr' ? 'ब्लॉक करण्याचे कारण (Reason)' : 'Reason for Blocking'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. DDoS / Brute-force bot attempt"
                    value={manualIpReason}
                    onChange={(e) => setManualIpReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-900"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-900 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow transition shrink-0"
                >
                  {language === 'mr' ? 'IP ब्लॉक करा' : 'Block IP'}
                </button>
              </form>

              {/* Blocked IPs Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">{language === 'mr' ? 'प्रतिबंधित IP पत्ता' : 'Blocked IP Address'}</th>
                      <th className="p-3">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                      <th className="p-3 text-right">{language === 'mr' ? 'कृती' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blockedIps.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-gray-400">
                          {language === 'mr' ? 'सध्या कोणताही IP प्रतिबंधित नाही.' : 'No IPs currently blocked.'}
                        </td>
                      </tr>
                    ) : (
                      blockedIps.map((ip) => (
                        <tr key={ip} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-gray-900">
                            {ip}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-xs">
                              Quarantined
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleIp(ip, false)}
                              className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-xs font-semibold transition"
                            >
                              {language === 'mr' ? 'अनब्लॉक करा' : 'Unblock'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Admin Audit Logs */}
          {activeTab === 'admin_audits' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">{language === 'mr' ? 'कृती (Action)' : 'Action'}</th>
                      <th className="p-3">{language === 'mr' ? 'प्रशासक' : 'Admin'}</th>
                      <th className="p-3">{language === 'mr' ? 'तपशील' : 'Details'}</th>
                      <th className="p-3">{language === 'mr' ? 'तारीख व वेळ' : 'Date & Time'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-400">
                          {language === 'mr' ? 'कोणत्याही ऑडिट नोंदी सापडल्या नाहीत.' : 'No audit logs found.'}
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="p-3 font-semibold text-red-900">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-xs">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-900">
                            {log.adminName}
                          </td>
                          <td className="p-3 text-gray-700">
                            {log.details}
                          </td>
                          <td className="p-3 text-gray-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString('mr-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3.5 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {language === 'mr' ? 'वंजारी जोडी मॅट्रिमोनी सायबर डिफेन्स प्रणाली सक्रिय' : 'Vanjari Jodi Cyber Defense Shield Active'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold transition"
          >
            {language === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
