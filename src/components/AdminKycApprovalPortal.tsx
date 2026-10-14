import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Search,
  Filter,
  FileText,
  User,
  AlertTriangle,
  ZoomIn,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';

export const AdminKycApprovalPortal: React.FC = () => {
  const { profiles, updateProfileDirect, sendPushNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetUser, setRejectTargetUser] = useState<UserProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Filter users by verification status
  const filteredUsers = profiles.filter((p) => {
    const status = p.verification_status || (p.aadhaarVerified ? 'Approved' : 'Not Submitted');
    const matchesTab =
      activeTab === 'pending'
        ? status === 'Pending Review'
        : activeTab === 'approved'
        ? status === 'Approved'
        : status === 'Rejected';

    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mobile.includes(searchTerm) ||
      (p.aadhaar_number && p.aadhaar_number.includes(searchTerm)) ||
      (p.district && p.district.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const pendingCount = profiles.filter((p) => p.verification_status === 'Pending Review').length;
  const approvedCount = profiles.filter(
    (p) => p.verification_status === 'Approved' || (p.aadhaarVerified && p.isVerified)
  ).length;
  const rejectedCount = profiles.filter((p) => p.verification_status === 'Rejected').length;

  const handleApprove = async (user: UserProfile) => {
    if (!window.confirm(`${user.fullName} यांची आधार व सेल्फी पडताळणी मंजूर करायची आहे का?`)) return;

    await updateProfileDirect(user.id, {
      verification_status: 'Approved',
      isVerified: true,
      aadhaarVerified: true,
      showVerifiedBadge: true,
      verification_approved_at: new Date().toISOString(),
      approved_by_admin: 'Super Admin',
      rejection_reason: ''
    });

    sendPushNotification(
      user.id,
      '🎉 अधिकृत पडताळणी मंजूर (Blue Tick Active)!',
      'अभिनंदन! आपले आधार कार्ड व सेल्फी पडताळणी मंजूर झाली असून प्रोफाइलवर Blue Tick सक्रिय झाली आहे.'
    );

    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    }
  };

  const handleOpenReject = (user: UserProfile) => {
    setRejectTargetUser(user);
    setRejectionReason('आधार कार्डवरील नाव व प्रोफाइलचे नाव जुळत नाही.');
    setAdminNotes('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetUser) return;
    if (!rejectionReason.trim()) {
      alert('कृपया नाकारण्याचे कारण नोंदवा.');
      return;
    }

    await updateProfileDirect(rejectTargetUser.id, {
      verification_status: 'Rejected',
      isVerified: false,
      aadhaarVerified: false,
      rejection_reason: rejectionReason.trim(),
      adminNotice: `पडताळणी नाकारली: ${rejectionReason.trim()}`
    });

    sendPushNotification(
      rejectTargetUser.id,
      '⚠️ पडताळणी नाकारली (Verification Rejected)',
      `कारणास्तव पडताळणी नाकारली: ${rejectionReason.trim()}. कृपया योग्य कागदपत्रे पुन्हा अपलोड करा.`
    );

    setIsRejectModalOpen(false);
    setRejectTargetUser(null);
    if (selectedUser?.id === rejectTargetUser.id) {
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              युझर KYC व आधार पडताळणी केंद्र
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                Verification Portal
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              सदस्यांनी अपलोड केलेले आधार कार्ड व सेल्फी तपासून ब्लू टिक (Blue Tick) मंजूर किंवा नामंजूर करा
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            प्रलंबित ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            मंजूर ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            नाकारलेले ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="नाव, मोबाईल क्रमांक, आधार क्रमांक किंवा जिल्ह्यानुसार शोधा..."
          className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
        />
      </div>

      {/* Main List & Review Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Users List */}
        <div className={`${selectedUser ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
          {filteredUsers.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">या यादीत कोणतीही विनंती नाही!</h3>
              <p className="text-xs text-slate-500">निवडलेल्या टॅबमध्ये सर्व कागदपत्रे तपासली गेली आहेत.</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#800C1E] shadow-md ring-2 ring-[#800C1E]/20'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.selfie_image || user.photoUrl || user.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={user.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                          {user.fullName}
                          {user.verification_status === 'Approved' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-100" />
                          )}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold mt-0.5">
                          <span>📱 {user.mobile}</span>
                          <span>•</span>
                          <span>📍 {user.district || 'महाराष्ट्र'}</span>
                        </div>
                        {user.aadhaar_number && (
                          <div className="text-[11px] font-mono font-bold text-slate-700 mt-1">
                            आधार: {user.aadhaar_number}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        user.verification_status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.verification_status === 'Pending Review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {user.verification_status || 'Pending Review'}
                    </span>
                  </div>

                  {user.rejection_reason && (
                    <div className="mt-2.5 p-2 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-800 font-semibold">
                      नाकारण्याचे कारण: {user.rejection_reason}
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      सबमिट तारीख: {user.verification_submitted_at ? new Date(user.verification_submitted_at).toLocaleDateString('mr-IN') : 'नुकतेच'}
                    </span>
                    <button
                      type="button"
                      className="text-[#800C1E] font-black hover:underline flex items-center gap-1"
                    >
                      कागदपत्रे तपासा <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Document Review Side Panel */}
        {selectedUser && (
          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-lg space-y-4 animate-fadeIn sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#800C1E] flex items-center justify-center font-black">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedUser.fullName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    मोबाईल: {selectedUser.mobile} • वय: {selectedUser.age} वर्षे • जिल्हा: {selectedUser.district}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aadhaar Info */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">नोंदवलेला आधार क्रमांक:</span>
                <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                  {selectedUser.aadhaar_number || 'उपलब्ध नाही'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-500 block">सद्यस्थिती:</span>
                <span className="text-xs font-black text-amber-700">
                  {selectedUser.verification_status || 'Pending Review'}
                </span>
              </div>
            </div>

            {/* Documents Grid: Aadhaar Front, Aadhaar Back, Selfie */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Front */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                  १. आधार समोरील (Front)
                </span>
                {selectedUser.aadhaar_front_image ? (
                  <div
                    onClick={() => setZoomImage(selectedUser.aadhaar_front_image!)}
                    className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 cursor-pointer aspect-video bg-slate-100"
                  >
                    <img
                      src={selectedUser.aadhaar_front_image}
                      alt="Front"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      <ZoomIn className="w-5 h-5 mr-1" /> मोठे करा
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100 border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    अपलोड नाही
                  </div>
                )}
              </div>

              {/* Back */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                  २. आधार मागील (Back)
                </span>
                {selectedUser.aadhaar_back_image ? (
                  <div
                    onClick={() => setZoomImage(selectedUser.aadhaar_back_image!)}
                    className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 cursor-pointer aspect-video bg-slate-100"
                  >
                    <img
                      src={selectedUser.aadhaar_back_image}
                      alt="Back"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      <ZoomIn className="w-5 h-5 mr-1" /> मोठे करा
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100 border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    अपलोड नाही
                  </div>
                )}
              </div>

              {/* Selfie */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                  ३. थेट सेल्फी (Selfie)
                </span>
                {selectedUser.selfie_image ? (
                  <div
                    onClick={() => setZoomImage(selectedUser.selfie_image!)}
                    className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 cursor-pointer aspect-video bg-slate-100"
                  >
                    <img
                      src={selectedUser.selfie_image}
                      alt="Selfie"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      <ZoomIn className="w-5 h-5 mr-1" /> मोठे करा
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100 border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    अपलोड नाही
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Approve / Reject */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleOpenReject(selectedUser)}
                className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> पडताळणी नाकारा (Reject)
              </button>

              <button
                onClick={() => handleApprove(selectedUser)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-xl shadow-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" /> पडताळणी मंजूर करा (Approve & Blue Tick)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Image Zoom Modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={zoomImage} alt="Zoomed Document" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason & Notes */}
      {isRejectModalOpen && rejectTargetUser && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-rose-700 text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> पडताळणी नाकारण्याचे कारण नोंदवा
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              युझर <strong>{rejectTargetUser.fullName}</strong> यांना हे कारण त्यांच्या ॲप स्क्रीनवर दिसेल जेणेकरून ते दुरुस्ती करून पुन्हा सबमिट करू शकतील.
            </p>

            {/* Quick Reason presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">जलद कारणे (Quick Presets):</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'आधार कार्डवरील फोटो अस्पष्ट आहे.',
                  'आधारवरील नाव आणि प्रोफाईल नाव जुळत नाही.',
                  'सेल्फी फोटोमध्ये चेहरा स्पष्ट दिसत नाही.',
                  'आधार कार्डचा मागील भाग (पत्ता) जोडलेला नाही.',
                  'कागदपत्रे अर्धवट किंवा बनावट वाटत आहेत.'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-amber-100 rounded-lg text-slate-700 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">सविस्तर कारण (Reason):</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:border-rose-500 outline-none"
                placeholder="उदा. कृपया मूळ आधार कार्डचा स्पष्ट फोटो जोडा..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                रद्द करा
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer"
              >
                नाकारून सेव्ह करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
