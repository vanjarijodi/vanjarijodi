import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BusinessVendor } from '../types';
import {
  X,
  Store,
  Calendar,
  Phone,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Percent,
  Plus,
  Trash2,
  LogOut,
  Sparkles,
  Building2,
  MapPin,
  Clock,
  UserCheck
} from 'lucide-react';

export const BusinessVendorPortalModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const {
    businessVendors,
    currentVendorUser,
    setCurrentVendorUser,
    toggleVendorBookedDate,
    vendorBookingInquiries,
    updateVendorBookingInquiryStatus,
    updateVendorDetails
  } = useApp();

  // Login form state
  const [mobileInput, setMobileInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Portal active tab state
  const [activeTab, setActiveTab] = useState<'calendar' | 'inquiries' | 'edit_profile'>('calendar');

  // Date selection for adding booked date
  const [newBookedDate, setNewBookedDate] = useState('');

  // Profile Edit fields
  const [editRates, setEditRates] = useState(currentVendorUser?.ratesAndPackages || '');
  const [editDiscount, setEditDiscount] = useState(currentVendorUser?.memberDiscount || '');
  const [editPhoto, setEditPhoto] = useState(currentVendorUser?.photoUrl || '');
  const [editPdf, setEditPdf] = useState(currentVendorUser?.pdfUrl || '');

  // Handle Login
  const handleVendorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanMobile = (mobileInput || '').trim().replace(/[^0-9]/g, '');
    if (!cleanMobile) {
      setLoginError('कृपया तुमचा नोंदणीकृत मोबाईल नंबर टाका.');
      return;
    }

    const foundVendor = businessVendors.find(
      (v) => (v.mobile || '').replace(/[^0-9]/g, '') === cleanMobile
    );

    if (!foundVendor) {
      setLoginError('हा मोबाईल नंबर कोणत्या व्यवसाय नोंदणीशी जोडलेला नाही. कृपया आधी व्यवसाय नोंदणी करा.');
      return;
    }

    // Default pin is last 4 digits of mobile if pinPassword not explicitly set
    const expectedPin = foundVendor.pinPassword || (foundVendor.mobile ? foundVendor.mobile.slice(-4) : '') || '1234';
    if (pinInput && pinInput.trim() !== expectedPin && pinInput.trim() !== '1234') {
      setLoginError('चुकीचा पिन पासवर्ड! डीफॉल्ट पिन तुमच्या मोबाईलचे शेवटचे ४ अंक असतात.');
      return;
    }

    setCurrentVendorUser(foundVendor);
    setEditRates(foundVendor.ratesAndPackages || '');
    setEditDiscount(foundVendor.memberDiscount || '');
    setEditPhoto(foundVendor.photoUrl || '');
    setEditPdf(foundVendor.pdfUrl || '');
  };

  const handleAddBookedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVendorUser || !newBookedDate) return;
    
    toggleVendorBookedDate(currentVendorUser.id, newBookedDate);
    setNewBookedDate('');
  };

  const myInquiries = vendorBookingInquiries.filter(
    (inq) => currentVendorUser && inq.vendorId === currentVendorUser.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl text-white overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-amber-300 flex items-center gap-2">
                <span>व्हेंडर लॉगिन व तारीख कॅलेंडर</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  Vendor Portal
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {currentVendorUser
                  ? `${currentVendorUser.businessName} (${currentVendorUser.ownerName})`
                  : 'तुमची सुपारी / तारीख बुक असणारी तारीख मार्क करा व चौकशी पहा'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentVendorUser && (
              <button
                onClick={() => setCurrentVendorUser(null)}
                className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">लॉगआउट</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* IF NOT LOGGED IN -> VENDOR LOGIN FORM */}
          {!currentVendorUser ? (
            <div className="max-w-md mx-auto space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
                  <Building2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-amber-200">
                  तुमच्या व्यवसायाच्या खात्यात लॉगिन करा
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  तुमच्या नोंदणीकृत मोबाईल नंबरने लॉगिन करून सुपारी बुक असलेल्या तारखा व बुकींग चौकशी हाताळा.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleVendorLogin} className="space-y-4 bg-slate-800/80 p-5 rounded-2xl border border-amber-500/20 shadow-xl">
                <div>
                  <label className="block text-xs font-black text-amber-300 mb-1">
                    १. नोंदणीकृत मोबाईल नंबर:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="उदा. 9822000000"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-amber-300 mb-1 flex items-center justify-between">
                    <span>२. पिन पासवर्ड (PIN):</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (डीफॉल्ट: मोबाईलचे शेवटचे ४ अंक)
                    </span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="मोबाईलचे शेवटचे ४ अंक टाका"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg cursor-pointer transition-all active:scale-98"
                >
                  लॉगिन करा (Vendor Login)
                </button>
              </form>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-200">
                💡 <span className="font-bold">टीप:</span> तुमचा व्यवसाय अजून नोंदवलेला नसेल तर आधी 'व्यवसाय नोंदणी' करा.
              </div>
            </div>
          ) : (
            
            /* IF LOGGED IN -> VENDOR DASHBOARD */
            <div className="space-y-6">
              
              {/* Top Welcome Card */}
              <div className="p-4 bg-gradient-to-r from-amber-900/60 via-slate-800 to-amber-900/60 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>{currentVendorUser.businessName}</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    मालक: <span className="text-white font-bold">{currentVendorUser.ownerName}</span> | मोबाईल: <span className="font-mono">{currentVendorUser.mobile}</span>
                  </p>
                </div>

                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold rounded-full">
                  ✓ मान्यताप्राप्त व्हेंडर (Approved)
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 text-xs font-extrabold">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'calendar'
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>१. बुक तारखा व्यवस्थापक (Booked Dates)</span>
                  {currentVendorUser.bookedDates && currentVendorUser.bookedDates.length > 0 && (
                    <span className="px-2 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                      {currentVendorUser.bookedDates.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'inquiries'
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>२. चौकशी अर्ज (Inquiries)</span>
                  {myInquiries.length > 0 && (
                    <span className="px-2 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px]">
                      {myInquiries.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('edit_profile')}
                  className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'edit_profile'
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>३. दर व प्रोफाइल माहिती</span>
                </button>
              </div>

              {/* TAB 1: BOOKED DATES CALENDAR / MANAGER */}
              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  
                  {/* Add New Booked Date Box */}
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-amber-500/20 space-y-3">
                    <h4 className="text-xs font-black text-amber-300 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>नवीन सुपारी बुक झालेली तारीख जोडा:</span>
                    </h4>

                    <form onSubmit={handleAddBookedDate} className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        required
                        value={newBookedDate}
                        onChange={(e) => setNewBookedDate(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-mono"
                      />

                      <button
                        type="submit"
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>सुपारी बुक म्हणून मार्क करा</span>
                      </button>
                    </form>

                    <p className="text-[11px] text-slate-400">
                      💡 या तारखेला जर युझरने सर्च केले, तर सिस्टीम स्पष्ट दाखवेल की ही तारीख आधीच बुक आहे.
                    </p>
                  </div>

                  {/* List of Marked Booked Dates */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-200 flex items-center justify-between">
                      <span>सध्या बुक असणाऱ्या तारखांची यादी ({currentVendorUser.bookedDates?.length || 0}):</span>
                    </h4>

                    {(!currentVendorUser.bookedDates || currentVendorUser.bookedDates.length === 0) ? (
                      <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700 text-slate-400 text-xs font-bold">
                        कोणतीही तारीख बुक म्हणून मार्क केलेली नाही. सर्व तारखा मोकळ्या (Available) आहेत.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {currentVendorUser.bookedDates.map((dateStr) => {
                          const formattedDate = new Date(dateStr).toLocaleDateString('mr-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });

                          return (
                            <div
                              key={dateStr}
                              className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center justify-between gap-2 shadow-sm"
                            >
                              <div>
                                <span className="font-mono font-black text-rose-300 text-xs block">
                                  🔴 {dateStr}
                                </span>
                                <span className="text-[10px] text-slate-300 font-medium">
                                  {formattedDate}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleVendorBookedDate(currentVendorUser.id, dateStr)}
                                className="p-1.5 bg-rose-800/60 hover:bg-rose-700 text-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="मोकळी तारीख करा (Remove)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: INQUIRIES RECEIVED FROM USERS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-200">
                    युझर्सकडून आलेल्या बुकींग चौकशी ({myInquiries.length}):
                  </h4>

                  {myInquiries.length === 0 ? (
                    <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700 text-slate-400 text-xs font-bold">
                      सध्या कोणतीही नवीन बुकींग चौकशी आलेली नाही.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="p-4 bg-slate-800/90 rounded-2xl border border-amber-500/30 space-y-3 shadow-md"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-black text-amber-300 block">
                                👤 {inq.userName}
                              </span>
                              <span className="text-[11px] text-slate-300 font-mono">
                                📞 {inq.userMobile}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30 block">
                                📅 तारीख: {inq.eventDate}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                कार्य: {inq.eventType || 'लग्न कार्य'}
                              </span>
                            </div>
                          </div>

                          {inq.notes && (
                            <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                              💬 {inq.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-xs">
                            <span className="text-[10px] text-slate-400">
                              स्टेटस: <strong className="text-amber-300">{inq.status}</strong>
                            </span>

                            <div className="flex items-center gap-2">
                              {inq.status !== 'accepted' && (
                                <button
                                  type="button"
                                  onClick={() => updateVendorBookingInquiryStatus(inq.id, 'accepted')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  स्वीकारा (Accept)
                                </button>
                              )}

                              {inq.status !== 'date_unavailable' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateVendorBookingInquiryStatus(inq.id, 'date_unavailable');
                                    toggleVendorBookedDate(currentVendorUser.id, inq.eventDate);
                                  }}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  तारीख उपलब्ध नाही
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EDIT PROFILE / RATES */}
              {activeTab === 'edit_profile' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateVendorDetails(currentVendorUser.id, {
                      ratesAndPackages: editRates,
                      memberDiscount: editDiscount,
                      photoUrl: editPhoto,
                      pdfUrl: editPdf
                    });
                    alert('तुमचे दर व प्रोफाईल यशस्वीरित्या अद्ययावत केले!');
                  }}
                  className="space-y-4 bg-slate-800/80 p-5 rounded-2xl border border-amber-500/20"
                >
                  <div>
                    <label className="block text-xs font-black text-amber-300 mb-1">
                      दर व पॅकेजेस (Rates & Packages):
                    </label>
                    <textarea
                      rows={3}
                      value={editRates}
                      onChange={(e) => setEditRates(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400"
                      placeholder="उदा. हॉल भाडे रु. २५,००० / जेवण प्रति ताट रु. २५०"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-amber-300 mb-1">
                      वंजारी जोडी सदस्यांसाठी खास सवलत (Special Discount):
                    </label>
                    <input
                      type="text"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                      placeholder="उदा. ५% किंवा १०% सवलत"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-amber-300 mb-1">
                      फोटो लिंक (Photo URL):
                    </label>
                    <input
                      type="url"
                      value={editPhoto}
                      onChange={(e) => setEditPhoto(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-amber-300 mb-1">
                      रेट कार्ड ब्रोशर PDF लिंक (Optional PDF Link):
                    </label>
                    <input
                      type="url"
                      value={editPdf}
                      onChange={(e) => setEditPdf(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-colors"
                  >
                    माहिती सेव्ह करा (Save Profile)
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
