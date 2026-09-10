import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Sliders,
  Power,
  Shield,
  Phone,
  MessageSquare,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Download,
  Printer,
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  User,
  Info,
  Settings,
  Sparkles,
  Lock,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessVendor, VendorSettings, VendorActivityLog } from '../types';

export const AdminVendorManagementCenter: React.FC = () => {
  const {
    vendorSettings,
    updateVendorSettings,
    businessVendors,
    approveBusinessVendor,
    rejectBusinessVendor,
    suspendBusinessVendor,
    deleteBusinessVendor,
    updateVendorDetails,
    addBusinessVendor,
    vendorActivityLogs,
    logVendorActivity,
    siteConfig,
    updateSiteConfig
  } = useApp();

  const [activeTab, setActiveTab] = useState<'toggles' | 'list' | 'logs'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Modal States
  const [editingVendor, setEditingVendor] = useState<BusinessVendor | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<BusinessVendor | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendingVendor, setSuspendingVendor] = useState<BusinessVendor | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [expandedPricingId, setExpandedPricingId] = useState<string | null>(null);

  // New Vendor Form State
  const [newVendorForm, setNewVendorForm] = useState<Partial<BusinessVendor>>({
    businessName: '',
    ownerName: '',
    category: 'मंगलाकार्यालय / हॉल (Hall/Lawn)',
    district: 'छत्रपती संभाजीनगर (औरंगाबाद)',
    mobile: '',
    whatsapp: '',
    address: '',
    ratesAndPackages: '',
    vendorBasePrice: '',
    platformMargin: '',
    customerPrice: '',
    adminPricingNotes: '',
    status: 'approved'
  });

  const categoriesList = [
    'मंगलाकार्यालय / हॉल (Hall/Lawn)',
    'कॅटरिंग व स्वयंपाक (Catering)',
    'फोटोग्राफी व व्हिडिओ (Photography)',
    'डेकोरेशन व मंडप (Decoration)',
    'बँड-बाजा व डीजे (Band/DJ)',
    'मेकअप व ब्युटी (Makeup Artist)',
    'इतर विवाह सेवा (Other Services)'
  ];

  // Filter vendors
  const filteredVendors = businessVendors.filter((v) => {
    const matchesSearch =
      v.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.mobile?.includes(searchTerm) ||
      v.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.taluka?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || v.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'all' || v.category === selectedCategory;

    const matchesDistrict =
      selectedDistrict === 'all' || v.district === selectedDistrict;

    return matchesSearch && matchesStatus && matchesCategory && matchesDistrict;
  });

  // Calculate Metrics
  const totalCount = businessVendors.length;
  const pendingCount = businessVendors.filter((v) => v.status === 'pending').length;
  const approvedCount = businessVendors.filter((v) => v.status === 'approved').length;
  const suspendedCount = businessVendors.filter((v) => v.status === 'suspended').length;
  const rejectedCount = businessVendors.filter((v) => v.status === 'rejected').length;

  const handleToggleSetting = async (key: keyof VendorSettings, currentVal: boolean, label: string) => {
    const newVal = !currentVal;
    await updateVendorSettings({ [key]: newVal });
  };

  const handleModeChange = async (mode: 'information_collection_only' | 'full_services') => {
    await updateVendorSettings({ vendorBusinessMode: mode });
  };

  const handleSaveVendorEdit = () => {
    if (!editingVendor) return;
    updateVendorDetails(editingVendor.id, editingVendor);
    setEditingVendor(null);
  };

  const handleConfirmReject = () => {
    if (!rejectingVendor) return;
    rejectBusinessVendor(rejectingVendor.id, rejectReason || 'प्रशासकीय निकष न बसल्यामुळे नाकारले.');
    setRejectingVendor(null);
    setRejectReason('');
  };

  const handleConfirmSuspend = () => {
    if (!suspendingVendor) return;
    suspendBusinessVendor(suspendingVendor.id, suspendReason || 'तक्रारीमुळे किंवा नूतनीकरणाअभावी निलंबित.');
    setSuspendingVendor(null);
    setSuspendReason('');
  };

  const handleCreateNewVendor = () => {
    if (!newVendorForm.businessName || !newVendorForm.ownerName || !newVendorForm.mobile) {
      alert('कृपया व्यवसायाचे नाव, मालकाचे नाव व मोबाईल नंबर भरा!');
      return;
    }
    addBusinessVendor({
      businessName: newVendorForm.businessName,
      ownerName: newVendorForm.ownerName,
      category: newVendorForm.category || 'इतर विवाह सेवा (Other Services)',
      district: newVendorForm.district || 'छत्रपती संभाजीनगर (औरंगाबाद)',
      taluka: newVendorForm.taluka || '',
      mobile: newVendorForm.mobile,
      whatsapp: newVendorForm.whatsapp || newVendorForm.mobile,
      address: newVendorForm.address || '',
      ratesAndPackages: newVendorForm.ratesAndPackages || '',
      vendorBasePrice: newVendorForm.vendorBasePrice || '',
      platformMargin: newVendorForm.platformMargin || '',
      customerPrice: newVendorForm.customerPrice || '',
      adminPricingNotes: newVendorForm.adminPricingNotes || '',
      status: newVendorForm.status as any || 'approved'
    });
    setIsAddVendorOpen(false);
    setNewVendorForm({
      businessName: '',
      ownerName: '',
      category: 'मंगलाकार्यालय / हॉल (Hall/Lawn)',
      district: 'छत्रपती संभाजीनगर (औरंगाबाद)',
      mobile: '',
      whatsapp: '',
      address: '',
      ratesAndPackages: '',
      status: 'approved'
    });
  };

  const handlePrintVendorList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>वंजारी जोडी - व्हेंडर यादी अहवाल</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #1e293b; }
            h1 { color: #800C1E; font-size: 20px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; color: #800C1E; }
            .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .approved { background: #dcfce7; color: #166534; }
            .pending { background: #fef9c3; color: #854d0e; }
            .suspended { background: #fee2e2; color: #991b1b; }
            .rejected { background: #f1f5f9; color: #475569; }
          </style>
        </head>
        <body>
          <h1>वंजारी जोडी - अधिकृत व्हेंडर व विवाह सेवा यादी (Vendor Management Report)</h1>
          <p>दिनांक: ${new Date().toLocaleDateString('mr-IN')} | एकूण व्हेंडर्स: ${filteredVendors.length}</p>
          <table>
            <thead>
              <tr>
                <th>अ.क्र.</th>
                <th>व्यवसायाचे नाव</th>
                <th>मालकाचे नाव</th>
                <th>श्रेणी (Category)</th>
                <th>जिल्हा / तालुका</th>
                <th>संपर्क मोबाईल</th>
                <th>स्थिती (Status)</th>
                <th>ग्राहकाचा दर (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredVendors
                .map(
                  (v, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${v.businessName}</strong></td>
                  <td>${v.ownerName}</td>
                  <td>${v.category}</td>
                  <td>${v.district} ${v.taluka ? '(' + v.taluka + ')' : ''}</td>
                  <td>${v.mobile}</td>
                  <td><span class="badge ${v.status}">${v.status.toUpperCase()}</span></td>
                  <td>${v.customerPrice || v.ratesAndPackages || 'N/A'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white border-2 border-amber-400 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-100">
                  मास्टर व्हेंडर नियंत्रण व व्यवस्थापन (Vendor Management Center)
                </h2>
                <span className={`px-3 py-0.5 rounded-full text-xs font-black border ${
                  vendorSettings.enableVendorModule
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-400 text-rose-300'
                }`}>
                  {vendorSettings.enableVendorModule ? 'मॉड्यूल चालू (ON)' : 'मॉड्यूल बंद (OFF)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                मास्टर टॉगल, व्हेंडर माहिती संकलन मोड, व्हेंडर नोंदणी मंजुरी, आंतरीक प्राईसिंग व ॲक्टिव्हिटी लॉग.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsAddVendorOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>नवीन व्हेंडर जोडा (Add Vendor)</span>
            </button>
          </div>
        </div>

        {/* METRICS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-700/80">
          <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 font-bold block">एकूण नोंदणी</span>
            <span className="text-base font-black text-white">{totalCount}</span>
          </div>
          <div className="bg-amber-950/40 p-2.5 rounded-2xl border border-amber-500/30 text-center">
            <span className="text-[10px] text-amber-300 font-bold block">प्रलंबित (Pending)</span>
            <span className="text-base font-black text-amber-400">{pendingCount}</span>
          </div>
          <div className="bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-300 font-bold block">मंजूर (Approved)</span>
            <span className="text-base font-black text-emerald-400">{approvedCount}</span>
          </div>
          <div className="bg-rose-950/40 p-2.5 rounded-2xl border border-rose-500/30 text-center">
            <span className="text-[10px] text-rose-300 font-bold block">निलंबित (Suspended)</span>
            <span className="text-base font-black text-rose-400">{suspendedCount}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-700 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-bold block">नाकारलेले (Rejected)</span>
            <span className="text-base font-black text-slate-300">{rejectedCount}</span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>व्हेंडर यादी व मंजुरी ({totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('toggles')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'toggles'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>मास्टर कंट्रोल टॉगल्स (Master Toggles)</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>व्हेंडर ॲक्टिव्हिटी लॉग (Activity Logs)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MASTER TOGGLES & BUSINESS MODE */}
      {activeTab === 'toggles' && (
        <div className="space-y-6 animate-fadeIn">
          {/* MASTER ON/OFF SWITCH */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5">
                  <Power className="w-4 h-4 text-amber-600" />
                  <span>मुख्य सिस्टीम नियंत्रण (Master Control)</span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  व्हेंडर मॉड्यूल मास्टर टॉगल (Vendor Module Master Switch)
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  सदर टॉगल संपूर्ण मोबाईल ॲप व वेबसाईटवरील व्हेंडर सुविधा तात्काळ चालू किंवा बंद करते.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleSetting('enableVendorModule', vendorSettings.enableVendorModule, 'व्हेंडर मॉड्यूल')}
                  className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                    vendorSettings.enableVendorModule
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>
                    {vendorSettings.enableVendorModule ? 'चालू (MASTER ON)' : 'बंद (MASTER OFF)'}
                  </span>
                </button>
              </div>
            </div>

            {/* VENDOR BUSINESS MODE SELECTOR */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950 text-xs sm:text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>व्हेंडर कार्य पद्धती (Vendor Business Mode):</span>
                </span>
                <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-400">
                  सध्याची मोड: {vendorSettings.vendorBusinessMode === 'information_collection_only' ? 'फक्त माहिती संकलन' : 'पूर्ण सर्व्हिस मोड'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Mode 1: Information Collection Only */}
                <div
                  onClick={() => handleModeChange('information_collection_only')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                    vendorSettings.vendorBusinessMode === 'information_collection_only'
                      ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      vendorSettings.vendorBusinessMode === 'information_collection_only'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs sm:text-sm text-slate-900">
                          १. माहिती संकलन मोड (INFORMATION COLLECTION ONLY)
                        </h4>
                        <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                          DEFAULT / चालू
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        या टप्प्यात फक्त व्हेंडर्सची व्यवसाय माहिती, मोबाईल, फोटो व दर संकलित केले जातात. थेट ऑनलाईन बुकिंग किंवा पेमेंट गेटवे बंद राहतो.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mode 2: Full Services Mode */}
                <div
                  onClick={() => handleModeChange('full_services')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                    vendorSettings.vendorBusinessMode === 'full_services'
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      vendorSettings.vendorBusinessMode === 'full_services'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs sm:text-sm text-slate-900">
                          २. पूर्ण व्हेंडर सर्व्हिस मोड (FULL VENDOR SERVICES)
                        </h4>
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                          भविष्यकालीन मोड
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        भविष्यात सर्व्हिस बुकिंग, ॲडव्हान्स टोकन पेमेंट, कस्टमर प्राईसिंग व कमिशन ऑटोमेशन सक्रिय करण्यासाठी.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURE SUB-TOGGLES GRID */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>व्हेंडर उप-सुविधा टॉगल्स (Feature Sub-Toggles):</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* Directory Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">व्हेंडर डिरेक्टरी (Vendor Directory):</span>
                    <span className="text-[10px] text-slate-500 block">ॲपमध्ये व्हेंडर्सची यादी दाखवणे</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorDirectory', vendorSettings.enableVendorDirectory, 'व्हेंडर डिरेक्टरी')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorDirectory ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorDirectory ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Booking Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">बुकिंग सिस्टीम (Booking System):</span>
                    <span className="text-[10px] text-slate-500 block">तारीख बुकिंग व कॅलेंडर</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorBooking', vendorSettings.enableVendorBooking, 'बुकिंग सिस्टीम')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorBooking ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorBooking ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Customer Pricing Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">ग्राहक दर (Customer Pricing):</span>
                    <span className="text-[10px] text-slate-500 block">युझर्सना कस्टमर प्राईस दाखवणे</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorCustomerPricing', vendorSettings.enableVendorCustomerPricing, 'ग्राहक दर')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorCustomerPricing ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorCustomerPricing ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Payment Gateway Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">पेमेंट गेटवे (Vendor Payment):</span>
                    <span className="text-[10px] text-slate-500 block">ॲडव्हान्स टोकन ऑनलाईन भरणे</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorPayment', vendorSettings.enableVendorPayment, 'पेमेंट गेटवे')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorPayment ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorPayment ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Public Phone Display Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">पब्लिक मोबाईल नंबर (Public Mobile):</span>
                    <span className="text-[10px] text-slate-500 block">लोकांना थेट कॉल नंबर दाखवणे</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorPublicMobile', vendorSettings.enableVendorPublicMobile, 'पब्लिक मोबाईल')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorPublicMobile ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorPublicMobile ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Public WhatsApp Display Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">पब्लिक व्हॉट्सॲप (Public WhatsApp):</span>
                    <span className="text-[10px] text-slate-500 block">व्हॉट्सॲप मेसेज बटण दाखवणे</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorPublicWhatsapp', vendorSettings.enableVendorPublicWhatsapp, 'पब्लिक व्हॉट्सॲप')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorPublicWhatsapp ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorPublicWhatsapp ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Rate Card PDF Download Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">रेट कार्ड ब्रोशर PDF:</span>
                    <span className="text-[10px] text-slate-500 block">ब्रोशर / दरपत्रक डाऊनलोड</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorPdf', vendorSettings.enableVendorPdf, 'रेट कार्ड ब्रोशर PDF')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorPdf ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorPdf ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Vendor Registration Form Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-slate-900 block">व्हेंडर नवीन नोंदणी अर्ज:</span>
                    <span className="text-[10px] text-slate-500 block">नवीन व्यवसायाचा अर्ज स्वीकारणे</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enableVendorRegistration', vendorSettings.enableVendorRegistration, 'व्हेंडर नवीन नोंदणी')}
                    className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer ${
                      vendorSettings.enableVendorRegistration ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {vendorSettings.enableVendorRegistration ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR LIST, APPROVAL & INTERNAL PRICING */}
      {activeTab === 'list' && (
        <div className="space-y-4 animate-fadeIn">
          {/* SEARCH & FILTERS TOOLBAR */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="व्हेंडर नाव, मालक, मोबाईल, जिल्हा किंवा तालुक्याने शोधा..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                <button
                  onClick={handlePrintVendorList}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>रिपोर्ट प्रिंट / PDF</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
              <span className="text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>स्थिती (Status):</span>
              </span>

              {['all', 'pending', 'approved', 'suspended', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' && `सर्व (${totalCount})`}
                  {st === 'pending' && `प्रलंबित (${pendingCount})`}
                  {st === 'approved' && `मंजूर (${approvedCount})`}
                  {st === 'suspended' && `निलंबित (${suspendedCount})`}
                  {st === 'rejected' && `नाकारलेले (${rejectedCount})`}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="all">सर्व श्रेणी (All Categories)</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* VENDORS CARDS LIST */}
          <div className="space-y-3">
            {filteredVendors.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Building className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-black text-slate-700 text-sm">कोणतेही व्हेंडर्स सापडले नाहीत</h4>
                <p className="text-xs text-slate-500">शोध किंवा फिल्टर बदलून पुन्हा प्रयत्न करा.</p>
              </div>
            ) : (
              filteredVendors.map((vendor) => {
                const isPricingExpanded = expandedPricingId === vendor.id;

                return (
                  <div
                    key={vendor.id}
                    className={`bg-white rounded-3xl border-2 transition-all p-4 space-y-3 shadow-xs ${
                      vendor.status === 'pending'
                        ? 'border-amber-400 bg-amber-50/20'
                        : vendor.status === 'approved'
                        ? 'border-emerald-300/80'
                        : vendor.status === 'suspended'
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200 opacity-80'
                    }`}
                  >
                    {/* TOP VENDOR INFO BAR */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-[#800C1E] text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                          {vendor.photoUrl ? (
                            <img src={vendor.photoUrl} alt={vendor.businessName} className="w-full h-full object-cover" />
                          ) : (
                            vendor.businessName.charAt(0)
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-slate-900 text-sm sm:text-base">
                              {vendor.businessName}
                            </h3>
                            <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                              {vendor.category}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                vendor.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : vendor.status === 'pending'
                                  ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                                  : vendor.status === 'suspended'
                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {vendor.status === 'approved' && '✓ मंजूर (Approved)'}
                              {vendor.status === 'pending' && '⏳ प्रलंबित (Pending)'}
                              {vendor.status === 'suspended' && '🚫 निलंबित (Suspended)'}
                              {vendor.status === 'rejected' && '❌ नाकारलेले (Rejected)'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>मालक: <strong>{vendor.ownerName}</strong></span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono font-bold text-slate-800">{vendor.mobile}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{vendor.district} {vendor.taluka ? `(${vendor.taluka})` : ''}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QUICK ACTION BUTTONS */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap pt-2 sm:pt-0">
                        {vendor.status === 'pending' && (
                          <button
                            onClick={() => approveBusinessVendor(vendor.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>मंजूर करा</span>
                          </button>
                        )}

                        {vendor.status === 'approved' && (
                          <button
                            onClick={() => setSuspendingVendor(vendor)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>निलंबित करा</span>
                          </button>
                        )}

                        {(vendor.status === 'pending' || vendor.status === 'suspended') && (
                          <button
                            onClick={() => setRejectingVendor(vendor)}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-slate-600" />
                            <span>नाकारा</span>
                          </button>
                        )}

                        {vendor.status === 'suspended' && (
                          <button
                            onClick={() => approveBusinessVendor(vendor.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>पुन्हा मंजूर करा</span>
                          </button>
                        )}

                        <button
                          onClick={() => setEditingVendor(vendor)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer border border-slate-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>संपादित करा</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`खात्री आहे का? '${vendor.businessName}' व्हेंडर कायमचा हटवायचा?`)) {
                              deleteBusinessVendor(vendor.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="हटवा (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* DETAILS & RATES DISPLAY */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">दर / पॅकेजेस (Rates & Packages):</span>
                        <span className="font-extrabold text-slate-900">{vendor.ratesAndPackages || 'माहिती उपलब्ध नाही'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">पत्ता / ठिकाण:</span>
                        <span className="font-medium text-slate-800 truncate block">{vendor.address || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">व्हेंडर पोर्टल पिन/पासवर्ड:</span>
                        <span className="font-mono font-bold text-amber-700">{vendor.pinPassword || '1234'}</span>
                      </div>
                    </div>

                    {/* INTERNAL ADMIN PRICING & MARGIN PANEL (Requirement 6 - ADMIN ONLY) */}
                    <div className="border border-amber-300/80 rounded-2xl bg-amber-50/40 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>आंतरीक ॲडमिन प्राईसिंग व कमिशन मार्जिन (Admin Internal Pricing & Margin) - ADMIN ONLY:</span>
                        </span>
                        <button
                          onClick={() => setExpandedPricingId(isPricingExpanded ? null : vendor.id)}
                          className="text-[11px] font-black text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isPricingExpanded ? 'पलब्ध करा (Collapse)' : 'दर बदला / पहा (Edit Admin Margin)'}</span>
                          {isPricingExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Display Summary */}
                      <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                        <div className="bg-white p-2 rounded-xl border border-amber-200">
                          <span className="text-[10px] text-slate-500 block font-bold">व्हेंडर बेस कॉस्ट (Base Cost):</span>
                          <span className="font-mono font-black text-slate-900">
                            {vendor.vendorBasePrice ? `₹${vendor.vendorBasePrice}` : 'N/A'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-amber-200">
                          <span className="text-[10px] text-slate-500 block font-bold">ॲडमिन मार्जिन (Margin):</span>
                          <span className="font-mono font-black text-emerald-700">
                            {vendor.platformMargin ? `₹${vendor.platformMargin}` : 'N/A'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-amber-200">
                          <span className="text-[10px] text-slate-500 block font-bold">ग्राहकाचा दर (Customer Price):</span>
                          <span className="font-mono font-black text-[#800C1E]">
                            {vendor.customerPrice ? `₹${vendor.customerPrice}` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Edit Pricing Form */}
                      {isPricingExpanded && (
                        <div className="pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fadeIn">
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 block">बेस प्राईस (₹):</label>
                            <input
                              type="number"
                              value={vendor.vendorBasePrice || ''}
                              onChange={(e) =>
                                updateVendorDetails(vendor.id, { vendorBasePrice: e.target.value })
                              }
                              placeholder="उदा. 15000"
                              className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 block">ॲडमिन कमिशन (₹):</label>
                            <input
                              type="number"
                              value={vendor.platformMargin || ''}
                              onChange={(e) =>
                                updateVendorDetails(vendor.id, { platformMargin: e.target.value })
                              }
                              placeholder="उदा. 1500"
                              className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 block">ग्राहक फायनल प्राईस (₹):</label>
                            <input
                              type="number"
                              value={vendor.customerPrice || ''}
                              onChange={(e) =>
                                updateVendorDetails(vendor.id, { customerPrice: e.target.value })
                              }
                              placeholder="उदा. 16500"
                              className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-xs font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VENDOR ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              <span>व्हेंडर प्रशासकीय ॲक्टिव्हिटी लॉग (Vendor Activity Audit Trail)</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">एकूण नोंदी: {vendorActivityLogs.length}</span>
          </div>

          {vendorActivityLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              अजून कोणतीही व्हेंडर ॲक्टिव्हिटी नोंदवली गेलेली नाही.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {vendorActivityLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{log.actionLabel}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        {log.adminUsername}
                      </span>
                      {log.businessName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                          {log.businessName}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 font-medium">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleString('mr-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-rose-300 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-black text-base text-slate-900">व्हेंडर नोंदणी नाकारा (Reject)</h3>
                <p className="text-xs text-slate-500">{rejectingVendor.businessName}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">नाकारण्याचे कारण (Rejection Reason):</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="उदा. मोबाईल नंबर किंवा पत्ता अपूर्ण आहे..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingVendor(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer shadow-md"
              >
                नाकारणे निश्चित करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND MODAL */}
      {suspendingVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-rose-300 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600">
              <Ban className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-black text-base text-slate-900">व्हेंडर निलंबित करा (Suspend)</h3>
                <p className="text-xs text-slate-500">{suspendingVendor.businessName}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">निलंबनाचे कारण (Suspension Reason):</label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="उदा. ग्राहक तक्रारीमुळे किंवा नूतनीकरण बाकी असल्यामुळे..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendingVendor(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer shadow-md"
              >
                निलंबित करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border-2 border-amber-300 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>व्हेंडर माहिती संपादित करा (Edit Vendor Details)</span>
              </h3>
              <button onClick={() => setEditingVendor(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">व्यवसायाचे नाव:</label>
                <input
                  type="text"
                  value={editingVendor.businessName}
                  onChange={(e) => setEditingVendor({ ...editingVendor, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मालकाचे नाव:</label>
                <input
                  type="text"
                  value={editingVendor.ownerName}
                  onChange={(e) => setEditingVendor({ ...editingVendor, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मोबाईल नंबर:</label>
                <input
                  type="text"
                  value={editingVendor.mobile}
                  onChange={(e) => setEditingVendor({ ...editingVendor, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">व्हॉट्सॲप नंबर:</label>
                <input
                  type="text"
                  value={editingVendor.whatsapp || ''}
                  onChange={(e) => setEditingVendor({ ...editingVendor, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">श्रेणी (Category):</label>
                <select
                  value={editingVendor.category}
                  onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">जिल्हा:</label>
                <input
                  type="text"
                  value={editingVendor.district}
                  onChange={(e) => setEditingVendor({ ...editingVendor, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">पत्ता / लोकेशन:</label>
                <input
                  type="text"
                  value={editingVendor.address || ''}
                  onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">दर व पॅकेजेस माहिती:</label>
                <textarea
                  rows={2}
                  value={editingVendor.ratesAndPackages || ''}
                  onChange={(e) => setEditingVendor({ ...editingVendor, ratesAndPackages: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setEditingVendor(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                onClick={handleSaveVendorEdit}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                बदल जतन करा (Save Changes)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {isAddVendorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-amber-400 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                <span>नवीन व्हेंडर व्यवसाय जोडा (Add New Vendor)</span>
              </h3>
              <button onClick={() => setIsAddVendorOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">व्यवसायाचे नाव *:</label>
                <input
                  type="text"
                  value={newVendorForm.businessName}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, businessName: e.target.value })}
                  placeholder="उदा. माउली मंगल कार्यालय"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मालकाचे नाव *:</label>
                <input
                  type="text"
                  value={newVendorForm.ownerName}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, ownerName: e.target.value })}
                  placeholder="उदा. रामेश्वर गिते"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">मोबाईल नंबर *:</label>
                <input
                  type="text"
                  value={newVendorForm.mobile}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, mobile: e.target.value })}
                  placeholder="१०-अंकी मोबाईल"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">श्रेणी (Category):</label>
                <select
                  value={newVendorForm.category}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">जिल्हा:</label>
                <input
                  type="text"
                  value={newVendorForm.district}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">तालुका:</label>
                <input
                  type="text"
                  value={newVendorForm.taluka || ''}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, taluka: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsAddVendorOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                onClick={handleCreateNewVendor}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                व्हेंडर जोडा (Add Vendor)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
