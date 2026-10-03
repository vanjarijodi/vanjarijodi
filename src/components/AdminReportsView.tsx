import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  PauseCircle,
  Ban,
  Trash2,
  Filter,
  Search,
  MessageCircle,
  ExternalLink,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileReport } from '../types';

export const AdminReportsView: React.FC = () => {
  const { profileReports, resolveProfileReport, profiles, toggleBlockProfile, deleteProfileDirect } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<ProfileReport | null>(null);

  const filteredReports = profileReports.filter((r) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'pending'
        ? r.status === 'pending'
        : r.status !== 'pending';

    const matchesSearch =
      r.reportedProfileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporterUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 rounded-2xl text-rose-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-sm sm:text-base">
              सदस्य तक्रारी व रिपोर्ट निवारण केंद्र (Member Reports Center)
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              इतर सदस्यांनी दाखल केलेल्या तक्रारींची शहानिशा करा व निर्णय घ्या
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer border ${
              filterStatus === 'pending'
                ? 'bg-[#800C1E] text-white border-[#800C1E]'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            प्रलंबित ({profileReports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer border ${
              filterStatus === 'all'
                ? 'bg-[#800C1E] text-white border-[#800C1E]'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            सर्व ({profileReports.length})
          </button>
        </div>
      </div>

      {/* Reports Table / Cards */}
      {filteredReports.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border-2 border-amber-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">कोणतीही प्रलंबित तक्रार आढळली नाही!</h3>
          <p className="text-xs text-slate-500">सर्व सदस्यांच्या प्रोफाईल तक्रारींचे निवारण पूर्ण झाले आहे.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const reportedCandidate = profiles.find((p) => p.id === report.reportedProfileId);
            const isResolved = report.status !== 'pending';

            return (
              <div
                key={report.id}
                className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3 font-bold text-xs text-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-black border border-rose-300">
                      🚨 {report.categoryLabel}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      तक्रार तारीख: {new Date(report.createdAt).toLocaleDateString('mr-IN')}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black w-fit ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isResolved ? `✅ निर्धारीत (${report.resolvedAction || 'निरसन'})` : '⏳ प्रलंबित (Pending Review)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                  {/* Reported Member */}
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-500 mb-1">
                      तक्रार असलेली प्रोफाईल (Reported Member):
                    </div>
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          reportedCandidate?.photoUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                        }
                        alt={report.reportedProfileName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover border border-amber-300"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{report.reportedProfileName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID: {report.reportedProfileId} • {report.reportedProfileMobile || 'नंबर उपलब्ध नाही'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reporter Member */}
                  <div>
                    <div className="text-[10px] uppercase font-black text-slate-500 mb-1">
                      तक्रारदार सदस्य (Reporter Member):
                    </div>
                    <div className="font-bold text-slate-900">{report.reporterUserName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      ID: {report.reporterUserId} • {report.reporterUserMobile || 'नंबर उपलब्ध नाही'}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-slate-500">तक्रारीचा सविस्तर तपशील:</div>
                  <p className="text-slate-800 font-medium text-xs leading-relaxed">{report.description}</p>
                </div>

                {/* Decision Actions */}
                {!isResolved && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-100">
                    <button
                      onClick={() => resolveProfileReport(report.id, 'dismiss')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                    >
                      तक्रार फेटाळा (Dismiss)
                    </button>

                    <button
                      onClick={() => resolveProfileReport(report.id, 'warning')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>सूचना पाठवा (Warning)</span>
                    </button>

                    <button
                      onClick={() => resolveProfileReport(report.id, 'suspend')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>खाते रोखा / ब्लॉक करा</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
