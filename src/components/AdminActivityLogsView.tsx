import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserActivityLog } from '../types';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Activity,
  Smartphone,
  Monitor,
  Heart,
  MessageCircle,
  CreditCard,
  Eye,
  ShieldCheck,
  FileText,
  Clock,
  User,
  Layers,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

interface AdminActivityLogsViewProps {
  onSelectMember?: (profileId: string) => void;
}

export const AdminActivityLogsView: React.FC<AdminActivityLogsViewProps> = ({
  onSelectMember,
}) => {
  const { userActivityLogs, profiles } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUserType, setSelectedUserType] = useState<'all' | 'registered' | 'guest'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Categories config
  const categories = [
    { id: 'all', label: 'सर्व ॲक्टिव्हिटी (All)', icon: Layers, count: userActivityLogs.length },
    { id: 'chat', label: 'चॅट संदेश (Chat)', icon: MessageCircle, color: 'text-sky-600 bg-sky-50' },
    { id: 'like', label: 'लाईक्स व पसंती (Likes)', icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { id: 'payment', label: 'पेमेंट व सबस्क्रिप्शन (Payments)', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'profile_view', label: 'प्रोफाईल दर्शन (Views)', icon: Eye, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'verification', label: 'पडताळणी (Verification)', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
    { id: 'biodata_kundali', label: 'बायोडाटा व कुंडली (Biodata/PDF)', icon: FileText, color: 'text-purple-600 bg-purple-50' },
    { id: 'login', label: 'लॉगिन / प्रवेश (Logins)', icon: User, color: 'text-blue-600 bg-blue-50' },
  ];

  // Helper to get category style & icon
  const getCategoryMeta = (cat?: string) => {
    switch (cat) {
      case 'chat':
        return { label: 'चॅट संदेश', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300', icon: MessageCircle };
      case 'like':
        return { label: 'पसंती / लाईक', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300', icon: Heart };
      case 'payment':
        return { label: 'पेमेंट व्यवहार', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CreditCard };
      case 'profile_view':
        return { label: 'प्रोफाईल पाहिली', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Eye };
      case 'verification':
        return { label: 'सुरक्षा पडताळणी', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', icon: ShieldCheck };
      case 'biodata_kundali':
        return { label: 'बायोडाटा / कुंडली', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300', icon: FileText };
      case 'login':
        return { label: 'लॉगिन प्रवेश', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300', icon: User };
      default:
        return { label: 'सिस्टीम ॲक्शन', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300', icon: Activity };
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return userActivityLogs
      .filter((log) => {
        // Search text
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchUser = (log.userName || '').toLowerCase().includes(q);
          const matchMobile = (log.userMobile || '').includes(q);
          const matchAction = (log.action || '').toLowerCase().includes(q);
          const matchDetails = (log.details || '').toLowerCase().includes(q);
          const matchTarget = (log.targetProfileName || '').toLowerCase().includes(q);
          const matchDevice = (log.deviceInfo || '').toLowerCase().includes(q);
          if (!matchUser && !matchMobile && !matchAction && !matchDetails && !matchTarget && !matchDevice) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (log.category !== selectedCategory) return false;
        }

        // User type filter
        if (selectedUserType !== 'all') {
          if (log.userType !== selectedUserType) return false;
        }

        // Date filter
        if (dateFilter !== 'all') {
          const logDate = new Date(log.timestamp);
          const now = new Date();
          if (!isNaN(logDate.getTime())) {
            const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
            if (dateFilter === 'today' && diffDays > 1) return false;
            if (dateFilter === 'week' && diffDays > 7) return false;
            if (dateFilter === 'month' && diffDays > 30) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [userActivityLogs, searchTerm, selectedCategory, selectedUserType, dateFilter, sortOrder]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('डाउनलोड करण्यासाठी कोणताही ॲक्टिव्हिटी डेटा उपलब्ध नाही.');
      return;
    }

    const headers = ['तारीख व वेळ', 'सदस्याचे नाव', 'मोबाईल नंबर', 'प्रकार', 'श्रेणी', 'कृती (Action)', 'सविस्तर तपशील', 'टार्गेट प्रोफाईल', 'डिव्हाइस माहिती'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp || ''}"`,
      `"${l.userName || ''}"`,
      `"${l.userMobile || ''}"`,
      `"${l.userType || 'registered'}"`,
      `"${l.category || ''}"`,
      `"${l.action || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.targetProfileName || ''}"`,
      `"${(l.deviceInfo || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VanjariJodi_ActivityLogs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] rounded-3xl p-5 sm:p-6 text-white border-2 border-amber-300 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-amber-400 text-[#800C1E] rounded-2xl shadow-lg shrink-0">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-amber-200">
                  सदस्य ॲक्टिव्हिटी व रिअल-टाइम ऑडिट लॉग्स
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[11px] font-black border border-amber-400/30">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium mt-1">
                प्रत्येक सदस्याने आणि अतिथीने ॲप/वेबसाईटवर केलेल्या प्रत्येक हालचालीची (लॉगिन, लाईक, चॅट, पेमेंट, बायोडाटा व्ह्यू) अचूक नोंद.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-amber-300 hover:bg-amber-400 text-[#800C1E] font-black text-xs rounded-xl shadow border border-amber-400 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              title="सर्व नोंदी एक्सेल/CSV मध्ये डाउनलोड करा"
            >
              <Download className="w-4 h-4" />
              <span>CSV एक्सपोर्ट ({filteredLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Activity Stats Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-amber-300/30 text-xs">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-amber-300/20">
            <span className="text-[11px] text-amber-200/80 font-bold block">एकूण नोंदी</span>
            <span className="text-base sm:text-lg font-black text-white">{userActivityLogs.length}</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-amber-300/20">
            <span className="text-[11px] text-amber-200/80 font-bold block">चॅट व संवाद</span>
            <span className="text-base sm:text-lg font-black text-sky-300">
              {userActivityLogs.filter((l) => l.category === 'chat').length}
            </span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-amber-300/20">
            <span className="text-[11px] text-amber-200/80 font-bold block">लाईक्स व पसंती</span>
            <span className="text-base sm:text-lg font-black text-rose-300">
              {userActivityLogs.filter((l) => l.category === 'like').length}
            </span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 border border-amber-300/20">
            <span className="text-[11px] text-amber-200/80 font-bold block">पेमेंट हालचाली</span>
            <span className="text-base sm:text-lg font-black text-emerald-300">
              {userActivityLogs.filter((l) => l.category === 'payment').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="सदस्याचे नाव, मोबाईल, टार्गेट प्रोफाईल किंवा कृती शोधा..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-amber-300 bg-amber-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A71930] font-bold text-slate-900"
            />
          </div>

          {/* User Type */}
          <div className="sm:col-span-3">
            <select
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value as any)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-amber-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#A71930]"
            >
              <option value="all">सर्व युजर्स (All Types)</option>
              <option value="registered">नोंदणीकृत सदस्य (Registered)</option>
              <option value="guest">अतिथी युजर्स (Guest/Visitor)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 text-xs rounded-xl border border-amber-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#A71930]"
            >
              <option value="all">सर्व कालावधी (All Time)</option>
              <option value="today">आजची ॲक्टिव्हिटी (Today)</option>
              <option value="week">गेल्या ७ दिवसांतील (Last 7 Days)</option>
              <option value="month">या महिन्यातील (This Month)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs font-black">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#A71930] text-amber-100 border-[#A71930] shadow-sm scale-105'
                    : 'bg-amber-50/50 hover:bg-amber-100 text-slate-700 border-amber-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="ml-auto px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            title="क्रम बदला"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortOrder === 'desc' ? 'नवीनतम आधी' : 'जुने आधी'}</span>
          </button>
        </div>
      </div>

      {/* Logs Feed Cards / Table */}
      <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-14 h-14 bg-amber-100 text-[#A71930] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Activity className="w-7 h-7" />
            </div>
            <h4 className="font-black text-slate-800 text-sm">कोणतीही ॲक्टिव्हिटी नोंद सापडली नाही</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              निवडलेल्या फिल्टरनुसार कोणताही लॉग उपलब्ध नाही. कृपया शोध शब्द किंवा फिल्टर बदलून पहा.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-amber-100">
            {filteredLogs.map((log) => {
              const meta = getCategoryMeta(log.category);
              const CatIcon = meta.icon;
              const isGuest = log.userType === 'guest';

              return (
                <div
                  key={log.id}
                  className="p-3.5 sm:p-4 hover:bg-amber-50/50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  {/* Left Column: Icon + User Info + Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-2xl shrink-0 border mt-0.5 ${meta.badgeClass}`}>
                      <CatIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Member Name */}
                        <button
                          type="button"
                          onClick={() => {
                            if (log.userId && onSelectMember) {
                              onSelectMember(log.userId);
                            }
                          }}
                          className="font-black text-slate-900 text-xs sm:text-sm hover:text-[#A71930] transition text-left cursor-pointer flex items-center gap-1"
                        >
                          <span>{log.userName || 'सदस्य'}</span>
                          {isGuest && (
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 text-[9px] font-bold">
                              अतिथी
                            </span>
                          )}
                        </button>

                        {/* Mobile Number */}
                        {log.userMobile && (
                          <span className="text-[11px] font-mono font-bold text-[#A71930] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            📞 {log.userMobile}
                          </span>
                        )}

                        {/* Category Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </div>

                      {/* Action Title & Detail */}
                      <p className="font-extrabold text-slate-800 text-xs">
                        {log.action}
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                        {log.details}
                      </p>

                      {/* Target Profile If Any */}
                      {log.targetProfileName && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/70 border border-amber-300 rounded-lg text-[11px] text-amber-900 font-bold mt-0.5">
                          <span>🎯 संबंधित प्रोफाईल:</span>
                          <span className="font-black text-[#800C1E]">{log.targetProfileName}</span>
                          {log.targetProfileId && (
                            <span className="text-[9px] font-mono text-slate-500">({log.targetProfileId})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Timestamp & Device Info */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-100 gap-1 text-right">
                    <div className="flex items-center gap-1 text-slate-500 font-mono text-[10.5px]">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{log.timestamp}</span>
                    </div>

                    {log.deviceInfo && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200" title={log.deviceInfo}>
                        {log.deviceInfo.toLowerCase().includes('mobile') || log.deviceInfo.toLowerCase().includes('android') || log.deviceInfo.toLowerCase().includes('iphone') ? (
                          <Smartphone className="w-3 h-3 text-slate-400" />
                        ) : (
                          <Monitor className="w-3 h-3 text-slate-400" />
                        )}
                        <span className="truncate max-w-[140px]">{log.deviceInfo}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
