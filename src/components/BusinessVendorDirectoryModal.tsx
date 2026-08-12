import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BusinessVendor } from '../types';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import {
  X,
  Building2,
  Phone,
  MessageCircle,
  Search,
  MapPin,
  Tag,
  Percent,
  FileText,
  Plus,
  ChevronRight,
  Handshake,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Calendar,
  XCircle,
  Store,
  Send
} from 'lucide-react';

export const BusinessVendorDirectoryModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const {
    siteConfig,
    businessVendors,
    setIsBusinessVendorRegisterModalOpen,
    setIsVendorPortalOpen,
    submitVendorBookingInquiry
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedWeddingDate, setSelectedWeddingDate] = useState<string>('');
  const [onlyAvailableOnDate, setOnlyAvailableOnDate] = useState<boolean>(false);
  const [selectedVendorForDetails, setSelectedVendorForDetails] = useState<BusinessVendor | null>(null);

  // Booking Inquiry Modal State
  const [inquiryVendor, setInquiryVendor] = useState<BusinessVendor | null>(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryMobile, setInquiryMobile] = useState('');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const categoriesList = siteConfig.customVendorCategories || [
    'मंगल कार्यालय व लॉन्स',
    'बँड बाजा व वाद्यवृंद',
    'डेकोरेशन व मंडप',
    'कॅटरिंग व स्वयंपाकी (Catering)',
    'मांडव, खुर्च्या व भांडे भांडार',
    'फोटोग्राफी व व्हिडियोग्राफी',
    'मेकअप आर्टिस्ट व मेहंदी',
    'ट्रॅव्हल्स व लग्न गाड्या',
    'पौरोहित्य / भटजी',
    'इतर लग्न व्यवसाय'
  ];

  // Approved vendors visible to users
  const approvedVendors = businessVendors.filter(
    (v) => v.status === 'approved' || v.status === undefined
  );

  const filteredVendors = approvedVendors.filter((vendor) => {
    const matchesCategory =
      selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesDistrict =
      selectedDistrict === 'all' ||
      (vendor.district || '').toLowerCase().includes(selectedDistrict.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      (vendor.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.district || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.address && vendor.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const isBookedOnSelectedDate =
      selectedWeddingDate && vendor.bookedDates?.includes(selectedWeddingDate);

    if (onlyAvailableOnDate && isBookedOnSelectedDate) {
      return false;
    }

    return matchesCategory && matchesDistrict && matchesSearch;
  });

  const handleBookingViaAdmin = (vendor: BusinessVendor) => {
    const adminPhone = siteConfig.contactWhatsapp || siteConfig.contactPhone || '910000000000';
    const cleanPhone = (adminPhone || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `नमस्कार वंजारी जोडी ॲडमिन, मला "${vendor.businessName}" (${vendor.category}, ${vendor.district}) बद्दल माहिती आणि बुकींग करायचे आहे. ${selectedWeddingDate ? `माझ्या लग्नाची तारीख: ${selectedWeddingDate}` : ''}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleDirectWhatsapp = (vendor: BusinessVendor) => {
    const phone = ((vendor.whatsapp || vendor.mobile) || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.length === 10 ? '91' + phone : phone;
    const msg = encodeURIComponent(
      `नमस्कार ${vendor.ownerName} जी, मी वंजारी जोडी पोर्टलवरून आपल्या "${vendor.businessName}" व्यवसायाबद्दल माहिती पाहिला आहे. मला लग्नकार्यासाठी बुकींग / चौकशी करायची आहे. ${selectedWeddingDate ? `तारीख: ${selectedWeddingDate}` : ''}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleSendInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryVendor || !inquiryName || !inquiryMobile || !inquiryDate) return;

    submitVendorBookingInquiry({
      vendorId: inquiryVendor.id,
      vendorName: inquiryVendor.businessName,
      userName: inquiryName,
      userMobile: inquiryMobile,
      eventDate: inquiryDate,
      notes: inquiryNotes
    });

    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryVendor(null);
      setInquiryName('');
      setInquiryMobile('');
      setInquiryDate('');
      setInquiryNotes('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl text-white overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-amber-300">
                  वंजारी लग्न व्यवसाय व मंगल कार्यालय डिरेक्टरी
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {approvedVendors.length} व्हेंडर्स
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                मंगल कार्यालये, लॉन्स, कॅटरिंग, बँड बाजा, फोटोग्राफी व लग्न सोहळ्याशी संबंधित सर्व सेवा
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setIsVendorPortalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>व्हेंडर पोर्टल (Vendor Login)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                setIsBusinessVendorRegisterModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>व्यवसाय नोंदवा</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Banner CTA for Mobile */}
        <div className="p-2.5 sm:hidden bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs gap-1">
          <button
            onClick={() => {
              onClose();
              setIsVendorPortalOpen(true);
            }}
            className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-lg text-[11px] flex items-center gap-1"
          >
            <Store className="w-3 h-3" />
            <span>व्हेंडर पोर्टल</span>
          </button>

          <button
            onClick={() => {
              onClose();
              setIsBusinessVendorRegisterModalOpen(true);
            }}
            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px]"
          >
            + व्यवसाय जोडा
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="व्यवसाय, मालकाचे नाव, जिल्हा शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">सर्व श्रेणी (All Categories)</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">सर्व जिल्हे (All Districts)</option>
                {MAHARASHTRA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist} className="bg-slate-900 text-white">
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wedding Date Selector Filter */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 shrink-0">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>लग्न तारीख उपलब्धता तपासा:</span>
            </span>

            <input
              type="date"
              value={selectedWeddingDate}
              onChange={(e) => setSelectedWeddingDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-mono shadow-inner"
            />

            {selectedWeddingDate && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWeddingDate('');
                    setOnlyAvailableOnDate(false);
                  }}
                  className="text-[11px] text-rose-300 hover:underline cursor-pointer font-bold"
                >
                  तारीख क्लिअर करा (Clear)
                </button>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <input
                    type="checkbox"
                    checked={onlyAvailableOnDate}
                    onChange={(e) => setOnlyAvailableOnDate(e.target.checked)}
                    className="rounded accent-amber-500 cursor-pointer"
                  />
                  <span>केवळ या तारखेला उपलब्ध असणारे दाखवा</span>
                </label>
              </div>
            )}
          </div>

          {/* Quick Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              सर्व श्रेणी ({approvedVendors.length})
            </button>
            {categoriesList.map((cat) => {
              const count = approvedVendors.filter((v) => v.category === cat).length;
              if (count === 0 && selectedCategory !== cat) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Vendors Grid / List Body */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-300">
                या शोध निकालात कोणताही व्यवसाय सापडला नाही
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                इतर श्रेणी किंवा जिल्हा निवडून पहा किंवा स्वतःच्या व्यवसायाची नोंदणी करा.
              </p>
              <button
                onClick={() => {
                  onClose();
                  setIsBusinessVendorRegisterModalOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>येथे तुमचा व्यवसाय जोडा</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVendors.map((vendor) => {
                const isBooked = selectedWeddingDate && vendor.bookedDates?.includes(selectedWeddingDate);

                return (
                  <div
                    key={vendor.id}
                    className={`bg-slate-950/70 border rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-lg ${
                      isBooked
                        ? 'border-rose-500/50 bg-rose-950/10'
                        : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      {/* Image & Header Info */}
                      <div className="flex gap-3 items-start mb-2">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700 group-hover:border-amber-500/50">
                          <img
                            src={vendor.photoUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400'}
                            alt={vendor.businessName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-950/80 backdrop-blur rounded text-[9px] font-bold text-amber-300 flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" />
                            {vendor.viewsCount || 45}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold truncate">
                              {vendor.category}
                            </span>
                            {vendor.status === 'approved' && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3" />
                                प्रमाणित
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                            {vendor.businessName}
                          </h3>

                          <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>मालक: {vendor.ownerName}</span>
                          </p>

                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate">{vendor.district} {vendor.taluka ? `(${vendor.taluka})` : ''}</span>
                          </p>
                        </div>
                      </div>

                      {/* DATE AVAILABILITY BADGE */}
                      {selectedWeddingDate && (
                        <div className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between my-2 ${
                          isBooked
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        }`}>
                          {isBooked ? (
                            <>
                              <span className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{selectedWeddingDate} या तारखेला सुपारी बुक आहे</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setOnlyAvailableOnDate(true)}
                                className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] font-bold border border-rose-500/30 hover:bg-rose-500/40 cursor-pointer"
                              >
                                मोकळे पर्याय पहा
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{selectedWeddingDate} या दिवशी उपलब्ध आहे (Available)</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rates & Discount Badges */}
                      <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5 my-2 text-xs">
                        <div className="flex items-start gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-slate-200 font-medium leading-tight">
                            <strong className="text-amber-300">दर:</strong> {vendor.ratesAndPackages}
                          </span>
                        </div>

                        {vendor.memberDiscount && (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            <Percent className="w-3 h-3 shrink-0" />
                            <span>{vendor.memberDiscount}</span>
                          </div>
                        )}
                      </div>

                      {vendor.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 my-2 italic">
                          "{vendor.description}"
                        </p>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 mt-2">
                      
                      <button
                        type="button"
                        onClick={() => {
                          setInquiryVendor(vendor);
                          if (selectedWeddingDate) setInquiryDate(selectedWeddingDate);
                        }}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>तारीख बुक / चौकशी करा</span>
                      </button>

                      {siteConfig.showVendorContactsToPublic !== false ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                          <a
                            href={`tel:${vendor.mobile}`}
                            className="flex-1 py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors border border-slate-700"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>कॉलींग</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDirectWhatsapp(vendor)}
                            className="flex-1 py-2 px-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>व्हाट्सॲप</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBookingViaAdmin(vendor)}
                          className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-200" />
                          <span>ॲडमिनद्वारे बुकींग करा</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedVendorForDetails(vendor)}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-amber-500/30 cursor-pointer"
                      >
                        <span>तपशील</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOOKING INQUIRY MODAL */}
        {inquiryVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-5 text-white space-y-4">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-amber-300">
                    बुकींग चौकशी अर्ज पाठवा
                  </h3>
                  <p className="text-xs text-slate-300 font-bold">
                    {inquiryVendor.businessName} ({inquiryVendor.district})
                  </p>
                </div>

                <button
                  onClick={() => setInquiryVendor(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {inquirySubmitted ? (
                <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-black text-emerald-300">
                    तुमची बुकींग चौकशी पाठवण्यात आली आहे!
                  </h4>
                  <p className="text-xs text-slate-300">
                    व्हेंडर लवकरच तुमच्याशी संपर्क साधेल.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-amber-300 font-bold mb-1">१. तुमचे पूर्ण नाव:</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. राजेश सांगळे"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-bold mb-1">२. तुमचा मोबाईल नंबर:</label>
                    <input
                      type="tel"
                      required
                      placeholder="उदा. 9822000000"
                      value={inquiryMobile}
                      onChange={(e) => setInquiryMobile(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-bold mb-1">३. लग्नाची / कार्याची तारीख:</label>
                    <input
                      type="date"
                      required
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-bold mb-1">४. टीप / संदेश (Optional):</label>
                    <textarea
                      rows={2}
                      placeholder="उदा. जेवण ५०० लोकांचे आहे, हॉल उपलब्धता सांगा..."
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>चौकशी अर्ज सबमिट करा</span>
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

        {/* Detailed Vendor Modal */}
        {selectedVendorForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 text-white space-y-4 max-h-[85vh] overflow-y-auto">
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold">
                    {selectedVendorForDetails.category}
                  </span>
                  <h3 className="text-lg font-black text-amber-300 mt-1">
                    {selectedVendorForDetails.businessName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    मालक: {selectedVendorForDetails.ownerName}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedVendorForDetails(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Preview */}
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={selectedVendorForDetails.photoUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'}
                  alt={selectedVendorForDetails.businessName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details Box */}
              <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300">पत्ता:</strong>
                    <p className="text-slate-400">{selectedVendorForDetails.address || selectedVendorForDetails.district}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-slate-800">
                  <Tag className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">दर व पॅकेज तपशील:</strong>
                    <p className="text-slate-200">{selectedVendorForDetails.ratesAndPackages}</p>
                  </div>
                </div>

                {selectedVendorForDetails.memberDiscount && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-emerald-400 font-bold">
                    <Percent className="w-4 h-4 shrink-0" />
                    <span>{selectedVendorForDetails.memberDiscount}</span>
                  </div>
                )}

                {selectedVendorForDetails.pdfUrl && (
                  <div className="pt-2 border-t border-slate-800">
                    <a
                      href={selectedVendorForDetails.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold hover:bg-rose-500/30 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>रेट कार्ड / ब्रोशर (PDF) डाऊनलोड करा</span>
                    </a>
                  </div>
                )}
              </div>

              {selectedVendorForDetails.description && (
                <div className="text-xs bg-slate-950/60 p-3 rounded-xl text-slate-300 border border-slate-800 leading-relaxed">
                  <p className="font-bold text-amber-300 mb-1">विशेष सोयी व माहिती:</p>
                  {selectedVendorForDetails.description}
                </div>
              )}

              {/* Contact Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleBookingViaAdmin(selectedVendorForDetails)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Handshake className="w-4 h-4" />
                  <span>ॲडमिनद्वारे बुकींग करा</span>
                </button>

                {siteConfig.showVendorContactsToPublic !== false && (
                  <a
                    href={`tel:${selectedVendorForDetails.mobile}`}
                    className="py-2.5 px-4 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>कॉलींग</span>
                  </a>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
