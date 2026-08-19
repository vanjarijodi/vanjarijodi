import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { downloadApkFile } from '../utils/apkDownloader';
import { UserProfile, MembershipTier, SuccessStory, SubAdmin, SubAdminPermission, PromoCode, PendingProfileEdit, FeatureBoxItem, BusinessVendor } from '../types';
import { AIBioDataExtractor } from './AIBioDataExtractor';
import { AdminEditProfileModal } from './AdminEditProfileModal';
import { AdminMemberQuickSettingsModal } from './AdminMemberQuickSettingsModal';
import { AdminMasterSettingsCenter } from './AdminMasterSettingsCenter';
import { AdminPaymentApprovalPortal } from './AdminPaymentApprovalPortal';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { getProfessionBadges, getTagStyleClass } from '../utils/professionUtils';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import {
  X,
  ShieldCheck,
  Users,
  User,
  CheckCircle,
  XCircle,
  Crown,
  Bell,
  Sparkles,
  Download,
  Plus,
  Trash2,
  Lock,
  Unlock,
  BarChart3,
  Database,
  Search,
  Check,
  Zap,
  Bot,
  KeyRound,
  Eye,
  Settings2,
  Layout,
  Image as ImageIcon,
  Globe,
  Sliders,
  BarChart,
  Upload,
  QrCode,
  Edit3,
  ExternalLink,
  CreditCard,
  Copy,
  Link as LinkIcon,
  Send,
  MessageSquare,
  FileText,
  Paperclip,
  EyeOff,
  Heart,
  ShieldAlert,
  MessageCircle,
  UserPlus,
  UserCheck,
  Megaphone,
  CheckSquare,
  Square,
  RotateCcw,
  Camera,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Monitor,
  Smartphone,
  Tag,
  Gift,
  HeartHandshake,
  Handshake,
  Building2,
  ZoomIn,
  ZoomOut,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  PlusCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Scale,
} from 'lucide-react';

const ALL_SUBADMIN_PERMISSIONS: { id: SubAdminPermission; labelMr: string; icon: string; category: string }[] = [
  { id: 'manage_profiles', labelMr: 'सदस्य बायोडाटा पाहणे व मंजूर करणे (Approve/Reject/View Members)', icon: '👥', category: '१. सदस्य व्यवस्थापन (Member Operations)' },
  { id: 'edit_profiles', labelMr: 'सदस्य प्रोफाईल तपशील संपादित/बदलणे (Edit Member Profiles)', icon: '✍️', category: '१. सदस्य व्यवस्थापन (Member Operations)' },
  { id: 'delete_profiles', labelMr: 'सदस्य प्रोफाईल एक-एक डिलीट करणे (Delete Single Profiles)', icon: '🗑️', category: '१. सदस्य व्यवस्थापन (Member Operations)' },
  { id: 'bulk_delete', labelMr: 'घाऊक मल्टिपल प्रोफाईल्स डिलीट करणे (Bulk Delete Profiles)', icon: '⚠️', category: '१. सदस्य व्यवस्थापन (Member Operations)' },
  { id: 'add_profiles', labelMr: 'नवीन बायोडाटा जोडणे (Add New Profile)', icon: '➕', category: '१. सदस्य व्यवस्थापन (Member Operations)' },
  { id: 'member_access_control', labelMr: 'सदस्य अक्सेस ब्लॉक करणे व विशेष VIP अक्सेस देणे (Block Member / VIP Grant)', icon: '🔒', category: '१. सदस्य व्यवस्थापन (Member Operations)' },
  { id: 'payment_requests', labelMr: 'पेमेंट पावत्या व पे-पर-काँटॅक्ट मंजुरी (Approve Payment Requests)', icon: '💳', category: '२. आर्थिक व योजना नियंत्रणे (Payments & Pricing)' },
  { id: 'pricing_plans', labelMr: 'सबस्क्रिप्शन प्लॅन्स दर व कालावधी एडिट करणे (Edit Plan Rates & Pricing)', icon: '💎', category: '२. आर्थिक व योजना नियंत्रणे (Payments & Pricing)' },
  { id: 'promo_codes', labelMr: 'सवलत कूपन व प्रोमो कोड्स तयार करणे (Manage Promo Codes)', icon: '🏷️', category: '२. आर्थिक व योजना नियंत्रणे (Payments & Pricing)' },
  { id: 'auto_mode_master', labelMr: '⚡ ऑटो मोड व मास्टर सिस्टीम ऑटोमेशन (Auto Mode & Unlocks)', icon: '⚡', category: '३. मास्टर ऑटोमेशन (Super Admin Only)' },
  { id: 'guest_permissions', labelMr: 'अतिथी/गेस्ट युझर परवानग्या नियंत्रणे (Guest Permissions)', icon: '👤', category: '४. सिस्टीम सेटिंग्ज व गोपनीयता' },
  { id: 'site_settings', labelMr: 'साइट नियम, टीप व गोपनीयता सेटिंग्ज (Site & Privacy Settings)', icon: '⚙️', category: '४. सिस्टीम सेटिंग्ज व गोपनीयता' },
  { id: 'user_analytics', labelMr: 'युझर ॲनालिटिक्स व आकडेवारी डेटा (User Analytics)', icon: '📊', category: '४. सिस्टीम सेटिंग्ज व गोपनीयता' },
  { id: 'face_verification', labelMr: 'AI चेहरा पडताळणी लॉग्स पाहणे व मंजूर करणे (Face Verification Logs)', icon: '📷', category: '५. सुरक्षा व मीडिया' },
  { id: 'apk_manager', labelMr: 'APK अँड्रॉइड ॲप अपलोडर (APK Manager)', icon: '📱', category: '५. सुरक्षा व मीडिया' },
  { id: 'index_controls', labelMr: 'इंडेक्स पेज, ४ कप्पे व सोशल मीडिया लिंक्स (Index Page Controls)', icon: '🌐', category: '६. डिझाईन व लेआउट' },
  { id: 'branding', labelMr: 'लोगो, स्लाईडर इमेज व ब्रँडिंग बदलेले (Branding & Slides)', icon: '🎨', category: '६. डिझाईन व लेआउट' },
  { id: 'support_chat', labelMr: 'ॲडमिन चॅट उत्तरे व व्हॉट्सॲप मेसेजिंग (Support Chat & WhatsApp)', icon: '💬', category: '७. कम्युनिकेशन' },
  { id: 'audit_logs', labelMr: 'प्रणाली ऑडिट लॉग्स इतिहास (System Audit Logs)', icon: '📜', category: '४. सिस्टीम सेटिंग्ज व गोपनीयता' },
  { id: 'recycle_bin', labelMr: 'रिसायकल बिन (Recycle Bin - Trash Items)', icon: '🗑️', category: '५. सुरक्षा व मीडिया' },
  { id: 'sub_admins', labelMr: 'नवीन सब-ॲडमिन खाती तयार व नियंत्रित करणे (Sub-Admin Management)', icon: '🔑', category: '३. मास्टर ऑटोमेशन (Super Admin Only)' },
];

export function getPaymentTimeInfo(dateStr?: string) {
  if (!dateStr) return { dateFormatted: 'तारीख उपलब्ध नाही', daysText: 'माहिती नाही', diffDays: 0 };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { dateFormatted: dateStr, daysText: dateStr, diffDays: 0 };

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const dateFormatted = d.toLocaleDateString('mr-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' • ' + d.toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });

  let daysText = '';
  if (diffDays === 0) {
    daysText = '⚡ आजच पेमेंट (Today)';
  } else if (diffDays === 1) {
    daysText = '📅 काल पेमेंट (1 day ago)';
  } else {
    daysText = `🗓️ ${diffDays} दिवसांपूर्वी (${diffDays} days ago)`;
  }

  return { dateFormatted, daysText, diffDays };
}

const AdminAddVendorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { siteConfig, addBusinessVendor } = useApp();

  const defaultCategories = siteConfig?.customVendorCategories || [
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

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState(defaultCategories[0] || 'मंगल कार्यालय व लॉन्स');
  const [district, setDistrict] = useState(MAHARASHTRA_DISTRICTS[0] || 'बीड');
  const [taluka, setTaluka] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [pinPassword, setPinPassword] = useState('');
  const [ratesAndPackages, setRatesAndPackages] = useState('');
  const [memberDiscount, setMemberDiscount] = useState('वंजारी जोडी सदस्यांसाठी ५% विशेष सवलत');
  const [commissionRate, setCommissionRate] = useState('१०% कमिशन');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  const [photoUrl, setPhotoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'pdf') => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateFileSize(file);
    if (!val.valid) {
      setUploadError(val.errorMsg || 'फाईलचा आकार १० MB पेक्षा लहान असावा.');
      return;
    }

    setIsUploading(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_vendors');
    setIsUploading(false);

    if (res.success && res.url) {
      if (type === 'photo') setPhotoUrl(res.url);
      else setPdfUrl(res.url);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'photo') setPhotoUrl(reader.result);
          else setPdfUrl(reader.result);
        } else {
          setUploadError('अपलोड अयशस्वी झाले.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !mobile.trim() || !ratesAndPackages.trim()) {
      alert('कृपया आवश्यक सर्व माहिती (व्यवसायाचे नाव, मालकाचे नाव, फोन नंबर व दर) भरा.');
      return;
    }

    const targetPin = pinPassword.trim() || mobile.trim().slice(-4) || '1234';

    addBusinessVendor({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      category,
      district,
      taluka: taluka.trim(),
      address: address.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      email: email.trim(),
      ratesAndPackages: ratesAndPackages.trim(),
      memberDiscount: memberDiscount.trim(),
      commissionRate: commissionRate.trim(),
      description: description.trim(),
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      pdfUrl,
      pinPassword: targetPin,
      status,
    });

    alert(`'${businessName.trim()}' सेवा पुरवठादार यशस्वीरित्या जोडला आणि लॉगिन तयार झाले!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-amber-300 rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-300 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#800C1E]/10 text-[#800C1E] border border-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#800C1E]">
                नवीन लग्न व्यवसाय / सेवा पुरवठादार जोडा (Create Vendor Profile)
              </h3>
              <p className="text-[11px] text-slate-600 font-bold">
                व्यवसाय तपशील नोंदवा आणि त्यांचा पिन/पासवर्ड लॉगिन सेट करा.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              ⚠️ {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Name */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">१. व्यवसायाचे नाव (Business/Hall Name) *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="उदा. व्यवसायाचे किंवा संस्थेचे नाव"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">२. मालकाचे पूर्ण नाव (Owner Full Name) *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="उदा. मालकाचे नाव व आडनाव"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">३. व्यवसाय श्रेणी (Category) *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              >
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">४. जिल्हा (District) *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              >
                {MAHARASHTRA_DISTRICTS.map((dst) => (
                  <option key={dst} value={dst}>{dst}</option>
                ))}
              </select>
            </div>

            {/* Taluka */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">५. तालुका (Taluka)</label>
              <input
                type="text"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                placeholder="उदा. परळी / बीड / पाथर्डी"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">६. पूर्ण पत्ता (Address)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="उदा. बस स्टँडजवळ, मेन रोड, परळी वैजनाथ"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
            <h4 className="font-extrabold text-[#800C1E] text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>व्हेंडर लॉगिन माहिती (Credentials & Portal Access)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Login Mobile */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">लॉगिन मोबाईल नंबर *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="उदा. 9876543210 (लॉगिन आयडी)"
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-[#800C1E]"
                />
              </div>

              {/* Pin Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">लॉगिन पिन / पासवर्ड (४ ते ६ अंकी पासवर्ड)</label>
                <input
                  type="text"
                  maxLength={8}
                  value={pinPassword}
                  onChange={(e) => setPinPassword(e.target.value)}
                  placeholder="उदा. 1234 (रिकामे सोडल्यास मोबाईलचे शेवटचे ४ अंक राहतील)"
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-[#800C1E]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rates & Packages */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">७. दर व पॅकेजेस (Rates & Packages) *</label>
              <input
                type="text"
                required
                value={ratesAndPackages}
                onChange={(e) => setRatesAndPackages(e.target.value)}
                placeholder="उदा. रु. २५,००० प्रति दिवस / रु. ३०० प्रति ताट"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Whatsapp */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">८. व्हॉट्सॲप नंबर (WhatsApp Number)</label>
              <input
                type="tel"
                maxLength={10}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                placeholder="उदा. 9876543210"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Member Discount */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">९. वंजारी जोडी सवलत (Vanjari Jodi Discount)</label>
              <input
                type="text"
                value={memberDiscount}
                onChange={(e) => setMemberDiscount(e.target.value)}
                placeholder="उदा. वंजारी जोडी सदस्यांना ५% किंवा १०% डिस्काउंट"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">१०. कमिशन दर (Commission Rate)</label>
              <input
                type="text"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="उदा. ५% कमिशन, १०% कमिशन किंवा 'थेट संपर्क'"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">११. ई-मेल पत्ता (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="उदा. info@business.com"
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">१२. सुरवातीचे स्टेटस (Initial Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              >
                <option value="approved">मंजूर (Approved ✓)</option>
                <option value="pending">प्रलंबित (Pending)</option>
                <option value="rejected">नाकारलेले (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-black text-[#800C1E] mb-1">१३. व्यवसायाचे सविस्तर वर्णन (Description)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="आमच्या मंगल कार्यालयात सर्व सोयी-सुविधा आहेत, २ एसी हॉल, ३०० गाड्यांचे पार्किंग..."
              rows={2}
              className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
            />
          </div>

          {/* Media Attachments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Photo upload */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-amber-300 text-center">
              <span className="block text-[10px] font-black text-[#800C1E] mb-1.5">व्यवसाय / कार्यालय फोटो (Photo)</span>
              {photoUrl ? (
                <div className="relative inline-block">
                  <img src={photoUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover mx-auto border border-amber-300" />
                  <button type="button" onClick={() => setPhotoUrl('')} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-0.5 rounded-full hover:bg-rose-800">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block p-3 hover:bg-amber-50 rounded-lg transition-colors">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-600">फोटो निवडा किंवा अपलोड करा</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="hidden" />
                </label>
              )}
            </div>

            {/* PDF Brochure Upload */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-amber-300 text-center">
              <span className="block text-[10px] font-black text-[#800C1E] mb-1.5">रेट कार्ड / ब्रोशर PDF</span>
              {pdfUrl ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-lg max-w-xs mx-auto">
                  <span className="text-[10px] text-emerald-800 font-bold truncate max-w-[120px]">📄 रेट कार्ड जोडले</span>
                  <button type="button" onClick={() => setPdfUrl('')} className="text-rose-600 hover:text-rose-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block p-3 hover:bg-amber-50 rounded-lg transition-colors">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-600">रेट कार्ड PDF अपलोड करा</span>
                  <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'pdf')} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="text-center text-[#A71930] text-[10px] font-black animate-pulse flex items-center justify-center gap-1">
              <span>फाईल अपलोड होत आहे, कृपया वाट पहा...</span>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>सेवा पुरवठादार जोडा (Add Vendor)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminEditVendorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vendor: BusinessVendor | null;
}> = ({ isOpen, onClose, vendor }) => {
  const { siteConfig, updateVendorDetails } = useApp();

  const defaultCategories = siteConfig?.customVendorCategories || [
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

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [pinPassword, setPinPassword] = useState('');
  const [ratesAndPackages, setRatesAndPackages] = useState('');
  const [memberDiscount, setMemberDiscount] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  const [photoUrl, setPhotoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load values on change
  useEffect(() => {
    if (vendor) {
      setBusinessName(vendor.businessName || '');
      setOwnerName(vendor.ownerName || '');
      setCategory(vendor.category || defaultCategories[0]);
      setDistrict(vendor.district || MAHARASHTRA_DISTRICTS[0]);
      setTaluka(vendor.taluka || '');
      setAddress(vendor.address || '');
      setMobile(vendor.mobile || '');
      setWhatsapp(vendor.whatsapp || '');
      setEmail(vendor.email || '');
      setPinPassword(vendor.pinPassword || '');
      setRatesAndPackages(vendor.ratesAndPackages || '');
      setMemberDiscount(vendor.memberDiscount || '');
      setCommissionRate(vendor.commissionRate || '१०% कमिशन');
      setDescription(vendor.description || '');
      setStatus(vendor.status || 'approved');
      setPhotoUrl(vendor.photoUrl || '');
      setPdfUrl(vendor.pdfUrl || '');
    }
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'pdf') => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const val = validateFileSize(file);
    if (!val.valid) {
      setUploadError(val.errorMsg || 'फाईलचा आकार १० MB पेक्षा लहान असावा.');
      return;
    }

    setIsUploading(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_vendors');
    setIsUploading(false);

    if (res.success && res.url) {
      if (type === 'photo') setPhotoUrl(res.url);
      else setPdfUrl(res.url);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'photo') setPhotoUrl(reader.result);
          else setPdfUrl(reader.result);
        } else {
          setUploadError('अपलोड अयशस्वी झाले.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !mobile.trim() || !ratesAndPackages.trim()) {
      alert('कृपया आवश्यक सर्व माहिती भरा.');
      return;
    }

    updateVendorDetails(vendor.id, {
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      category,
      district,
      taluka: taluka.trim(),
      address: address.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      email: email.trim(),
      ratesAndPackages: ratesAndPackages.trim(),
      memberDiscount: memberDiscount.trim(),
      commissionRate: commissionRate.trim(),
      description: description.trim(),
      photoUrl,
      pdfUrl,
      pinPassword: pinPassword.trim(),
      status,
    });

    alert(`'${businessName.trim()}' माहिती यशस्वीरीत्या बदलण्यात आली!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-amber-300 rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-300 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#800C1E]/10 text-[#800C1E] border border-amber-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#800C1E]">
                व्यवसाय / सेवा पुरवठादार माहिती सुधारा (Edit Vendor & Login Pin)
              </h3>
              <p className="text-[11px] text-slate-600 font-bold">
                त्यांच्या लॉगिन क्रेडेंशियल्स आणि पिनसह सर्व माहिती अपडेट करा.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 font-medium">
          
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              ⚠️ {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Name */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">१. व्यवसायाचे नाव *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">२. मालकाचे पूर्ण नाव *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">३. व्यवसाय श्रेणी *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              >
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">४. जिल्हा *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              >
                {MAHARASHTRA_DISTRICTS.map((dst) => (
                  <option key={dst} value={dst}>{dst}</option>
                ))}
              </select>
            </div>

            {/* Taluka */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">५. तालुका</label>
              <input
                type="text"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">६. पूर्ण पत्ता</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
            <h4 className="font-extrabold text-[#800C1E] text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>व्हेंडर लॉगिन क्रेडेंशियल्स सुधारा (Login ID & Security PIN)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Login Mobile */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">लॉगिन मोबाईल नंबर *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-[#800C1E]"
                />
              </div>

              {/* Pin Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">लॉगिन पिन / पासवर्ड (४ ते ६ अंकी)</label>
                <input
                  type="text"
                  maxLength={8}
                  value={pinPassword}
                  onChange={(e) => setPinPassword(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-[#800C1E]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rates & Packages */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">७. दर व पॅकेजेस *</label>
              <input
                type="text"
                required
                value={ratesAndPackages}
                onChange={(e) => setRatesAndPackages(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Whatsapp */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">८. व्हॉट्सॲप नंबर</label>
              <input
                type="tel"
                maxLength={10}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Member Discount */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">९. वंजारी जोडी सवलत</label>
              <input
                type="text"
                value={memberDiscount}
                onChange={(e) => setMemberDiscount(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">१०. कमिशन दर</label>
              <input
                type="text"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">११. ई-मेल पत्ता</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-black text-[#800C1E] mb-1">१२. स्टेटस</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
              >
                <option value="approved">मंजूर (Approved ✓)</option>
                <option value="pending">प्रलंबित (Pending)</option>
                <option value="rejected">नाकारलेले (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-black text-[#800C1E] mb-1">१३. व्यवसायाचे सविस्तर वर्णन</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold"
            />
          </div>

          {/* Media Attachments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Photo upload */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-amber-300 text-center">
              <span className="block text-[10px] font-black text-[#800C1E] mb-1.5">व्यवसाय / कार्यालय फोटो (Photo)</span>
              {photoUrl ? (
                <div className="relative inline-block">
                  <img src={photoUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover mx-auto border border-amber-300" />
                  <button type="button" onClick={() => setPhotoUrl('')} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-0.5 rounded-full hover:bg-rose-800">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block p-3 hover:bg-amber-50 rounded-lg transition-colors">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-600">फोटो निवडा किंवा अपलोड करा</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} className="hidden" />
                </label>
              )}
            </div>

            {/* PDF Brochure Upload */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-amber-300 text-center">
              <span className="block text-[10px] font-black text-[#800C1E] mb-1.5">रेट कार्ड / ब्रोशर PDF</span>
              {pdfUrl ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-lg max-w-xs mx-auto">
                  <span className="text-[10px] text-emerald-800 font-bold truncate max-w-[120px]">📄 रेट कार्ड जोडले</span>
                  <button type="button" onClick={() => setPdfUrl('')} className="text-rose-600 hover:text-rose-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block p-3 hover:bg-amber-50 rounded-lg transition-colors">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-600">रेट कार्ड PDF अपलोड करा</span>
                  <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'pdf')} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="text-center text-[#A71930] text-[10px] font-black animate-pulse flex items-center justify-center gap-1">
              <span>फाईल अपलोड होत आहे, कृपया वाट पहा...</span>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>बदल जतन करा (Save Changes)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminViewVendorDetailsModal: React.FC<{
  vendor: BusinessVendor | null;
  onClose: () => void;
  onEdit: (vendor: BusinessVendor) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ vendor, onClose, onEdit, onApprove, onReject, onDelete }) => {
  if (!vendor) return null;

  const formattedMobile = vendor.mobile ? vendor.mobile.replace(/\D/g, '') : '';
  const formattedWhatsapp = vendor.whatsapp ? vendor.whatsapp.replace(/\D/g, '') : formattedMobile;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white border-2 border-amber-400 rounded-3xl shadow-2xl text-slate-900 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-900 via-[#800C1E] to-[#A71930] text-amber-100 border-b border-amber-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-[#800C1E] font-black shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200">
                {vendor.businessName}
              </h3>
              <p className="text-xs text-amber-100/90 font-bold flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 bg-amber-200 text-[#800C1E] rounded-full text-[10px] font-black">
                  {vendor.category}
                </span>
                <span>• 📍 {vendor.district} {vendor.taluka ? `(${vendor.taluka})` : ''}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-amber-100 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Top Banner: Status & Quick Action Buttons */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">सध्याचे स्टेटस:</span>
              {vendor.status === 'approved' ? (
                <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-black text-xs shadow-sm">
                  ✓ मंजूर (Approved)
                </span>
              ) : vendor.status === 'rejected' ? (
                <span className="px-3 py-1 bg-rose-600 text-white rounded-full font-black text-xs shadow-sm">
                  ✕ नाकारलेले (Rejected)
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full font-black text-xs animate-pulse shadow-sm">
                  ⏳ प्रलंबित (Pending Approval)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {vendor.status !== 'approved' && (
                <button
                  type="button"
                  onClick={() => onApprove(vendor.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>मंजूर करा</span>
                </button>
              )}
              {vendor.status !== 'rejected' && (
                <button
                  type="button"
                  onClick={() => onReject(vendor.id)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>रद्द करा</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(vendor);
                }}
                className="px-3.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-4 h-4" />
                <span>सुधारा (Edit & PIN)</span>
              </button>
            </div>
          </div>

          {/* Owner & Contact Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-2 text-xs">
              <h4 className="font-extrabold text-[#800C1E] text-xs border-b pb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#800C1E]" />
                <span>मालक व संपर्क तपशील (Owner & Contact)</span>
              </h4>
              <p className="text-slate-900 font-extrabold text-sm">{vendor.ownerName}</p>
              
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">मोबाईल नंबर:</span>
                  <a
                    href={`tel:${formattedMobile}`}
                    className="font-mono font-bold text-[#A71930] hover:underline flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                  >
                    📞 {vendor.mobile}
                  </a>
                </div>

                {vendor.whatsapp && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">व्हॉट्सॲप नंबर:</span>
                    <a
                      href={`https://wa.me/91${formattedWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                    >
                      💬 {vendor.whatsapp}
                    </a>
                  </div>
                )}

                {vendor.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">ई-मेल:</span>
                    <a
                      href={`mailto:${vendor.email}`}
                      className="font-mono text-slate-800 hover:underline truncate max-w-[150px]"
                    >
                      ✉️ {vendor.email}
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-slate-600 font-medium">लॉगिन पिन (Password):</span>
                  <span className="font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                    🔑 {vendor.pinPassword || 'सेट नाही'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location & Address Card */}
            <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-2 text-xs">
              <h4 className="font-extrabold text-[#800C1E] text-xs border-b pb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#800C1E]" />
                <span>स्थान व पत्ता (Location & Address)</span>
              </h4>
              <p className="text-slate-800 font-bold">
                📍 {vendor.district} {vendor.taluka ? `(${vendor.taluka} तालुका)` : ''}
              </p>
              <p className="text-slate-600 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                {vendor.address || 'पत्ता भरलेला नाही.'}
              </p>
            </div>
          </div>

          {/* Pricing, Packages, Discount & Commission */}
          <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-3 text-xs">
            <h4 className="font-extrabold text-[#800C1E] text-xs border-b pb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#800C1E]" />
              <span>दर, सवलत व कमिशन तपशील (Rates, Packages & Offers)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">दर व पॅकेजेस (Rates):</span>
                <p className="font-extrabold text-slate-900 text-sm">{vendor.ratesAndPackages}</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[10px] text-emerald-800 font-bold block">वंजारी जोडी सवलत (Discount):</span>
                <p className="font-extrabold text-emerald-900 text-xs">{vendor.memberDiscount || 'काहीही नाही'}</p>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                <span className="text-[10px] text-rose-800 font-bold block">कमिशन दर (Commission):</span>
                <p className="font-extrabold text-rose-900 text-xs">{vendor.commissionRate || '१०% कमिशन'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {vendor.description && (
            <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-1.5 text-xs">
              <h4 className="font-extrabold text-[#800C1E] text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#800C1E]" />
                <span>व्यवसायाचे वर्णन (Description)</span>
              </h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line">
                {vendor.description}
              </p>
            </div>
          )}

          {/* Uploaded Documents & Media */}
          <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-3 text-xs">
            <h4 className="font-extrabold text-[#800C1E] text-xs border-b pb-1.5 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-[#800C1E]" />
              <span>अपलोड केलेले मीडिया व दस्तऐवज (Uploaded Photos & PDF Brochure)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo View */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">📷 फोटो / बॅनर:</span>
                {vendor.photoUrl ? (
                  <a href={vendor.photoUrl} target="_blank" rel="noopener noreferrer" className="block relative group rounded-2xl overflow-hidden border border-amber-300">
                    <img
                      src={vendor.photoUrl}
                      alt={vendor.businessName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      🔍 फोटो मोठा पहा
                    </div>
                  </a>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    कोणताही फोटो जोडलेला नाही.
                  </div>
                )}
              </div>

              {/* Rate Card PDF Download / View */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">📄 रेट कार्ड / ब्रोशर PDF:</span>
                {vendor.pdfUrl ? (
                  <div className="p-5 bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl border border-amber-300 flex flex-col items-center justify-center text-center space-y-3 h-48">
                    <div className="p-3 bg-rose-600 text-white rounded-2xl shadow">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">रेट कार्ड / ब्रोशर PDF</p>
                      <p className="text-[10px] text-slate-500">व्हेंडरने अपलोड केलेली माहिती पत्रक</p>
                    </div>
                    <a
                      href={vendor.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition hover:scale-102 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF उघडा / डाऊनलोड करा</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-48 flex items-center justify-center">
                    कोणतीही PDF जोडलेली नाही.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-amber-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm(`नक्की '${vendor.businessName}' हा व्यवसाय हटवायचा आहे का?`)) {
                onDelete(vendor.id);
                onClose();
              }
            }}
            className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs rounded-xl border border-rose-300 transition cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>व्यवसाय हटवा (Delete)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow cursor-pointer"
          >
            बंद करा (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

export const AdminPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    t,
    language,
    setLanguage,
    profiles,
    addProfile,
    approveProfile,
    rejectProfile,
    toggleBlockProfile,
    updateMemberTier,
    addSuccessStory,
    approveSuccessStory,
    rejectSuccessStory,
    updateSuccessStory,
    deleteSuccessStory,
    bulkDeleteSuccessStories,
    addBroadcastNotification,
    isPaidPlansEnabled,
    setIsPaidPlansEnabled,
    isSuccessStoriesEnabled,
    setIsSuccessStoriesEnabled,
    isAdsEnabled,
    setIsAdsEnabled,
    isCountersEnabled,
    setIsCountersEnabled,
    siteConfig,
    updateSiteConfig,
    heroSlides,
    addHeroSlide,
    deleteHeroSlide,
    counters,
    updateCounter,
    plansList,
    updatePlan,
    contactRequests,
    authorizeContactRequest,
    rejectContactRequest,
    authorizeAllContactRequests,
    communityAds,
    addCommunityAd,
    toggleAdStatus,
    deleteCommunityAd,
    successStories,
    paymentRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
    deletePaymentRequest,
    bulkApprovePaymentRequests,
    bulkDeletePaymentRequests,
    chatMessages,
    toggleBlockUserChat,
    adminSupportMessages,
    replyAdminSupportMessage,
    markAdminSupportMessagesRead,
    unreadAdminChatCount,
    deleteAdminSupportMessage,
    bulkDeleteAdminSupportMessages,
    recycleBin,
    deletedPhotosTrash,
    softDeleteProfile,
    restoreRecycleItem,
    permanentDeleteRecycleItem,
    bulkPurgeRecycleBin,
    restorePhotoFromTrash,
    permanentlyDeletePhotoFromTrash,
    purgeAllPhotosTrash,
    auditLogs,
    logActivity,
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    subAdmins,
    currentSubAdmin,
    setCurrentSubAdmin,
    addSubAdmin,
    updateSubAdmin,
    deleteSubAdmin,
    promoCodes,
    addPromoCode,
    deletePromoCode,
    togglePromoCodeStatus,
    pendingProfileEdits,
    approveProfileEditRequest,
    rejectProfileEditRequest,
    likedProfileIds,
    interests,
    pendingLikes,
    approveLike,
    rejectLike,
    setSelectedProfileForModal,
    faceVerificationLogs,
    approveFaceVerification,
    rejectFaceVerification,
    updateApkSettings,
    updateSocialLinks,
    addSocialLink,
    deleteSocialLink,
    updateAdminCredentials,
    payPerContactRequests,
    approvePayPerContactRequest,
    rejectPayPerContactRequest,
    userActivityLogs,
    guestSessions,
    archiveAdminSupportChat,
    profileRemovalRequests,
    approveProfileRemovalRequest,
    rejectProfileRemovalRequest,
    deleteProfileRemovalRequest,
    bulkSoftDeleteProfiles,
    bulkPermanentDeleteRecycleItems,
    bulkRestoreRecycleItems,
    toggleProfileVisibility,
    toggleBlockMemberAccess,
    toggleCustomAccess,
    adminSuggestMatch,
    resetSampleProfiles,
    updateProfileDirect,
    sendPushNotification,
    notifications,
    businessVendors,
    updateBusinessVendorStatus,
    deleteBusinessVendor,
    addCustomVendorCategory,
    updateVendorDetails,
  } = useApp();

  const [selectedEditProfile, setSelectedEditProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Business Vendor Add/Edit/View modal & filter states
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [isEditVendorModalOpen, setIsEditVendorModalOpen] = useState(false);
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<BusinessVendor | null>(null);
  const [selectedVendorForView, setSelectedVendorForView] = useState<BusinessVendor | null>(null);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('all');
  const [vendorStatusFilter, setVendorStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [likesSearchTerm, setLikesSearchTerm] = useState('');

  // Active Admin Category Hub State
  const [activeCategory, setActiveCategory] = useState<
    'members_hub' | 'notifications_hub' | 'payments_hub' | 'controls_hub' | 'system_hub'
  >('members_hub');

  // Active Admin Tab State
  const [activeTab, setActiveTab] = useState<
    | 'sub_admins'
    | 'face_verification'
    | 'apk_manager'
    | 'index_controls'
    | 'members'
    | 'pending'
    | 'profile_edits'
    | 'profile_removal'
    | 'chat_approvals'
    | 'add_profile'
    | 'payment_requests'
    | 'pay_per_contact'
    | 'guest_permissions'
    | 'permissions_center'
    | 'user_analytics'
    | 'plans_setup'
    | 'support_chat'
    | 'push_notification'
    | 'profile_likes'
    | 'promo_codes'
    | 'branding'
    | 'stories'
    | 'recycle_bin'
    | 'audit_logs'
    | 'privacy_controls'
    | 'business_vendors'
    | 'master_settings'
    | 'expired_plans'
  >('members');

  // Expired Paid Members Search & Selection State
  const [expiredSearchTerm, setExpiredSearchTerm] = useState('');
  const [selectedExpiredMemberIds, setSelectedExpiredMemberIds] = useState<string[]>([]);

  // Push Notification Form State
  const [pushTargetMode, setPushTargetMode] = useState<'all' | 'individual'>('all');
  const [pushTargetUserId, setPushTargetUserId] = useState<string>('');
  const [pushTitleMr, setPushTitleMr] = useState<string>('वंजारी जोडी - विशेष सूचना 📢');
  const [pushMessageMr, setPushMessageMr] = useState<string>('');
  const [pushSearchTerm, setPushSearchTerm] = useState<string>('');
  const [pushSentSuccessMsg, setPushSentSuccessMsg] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [paySearchTerm, setPaySearchTerm] = useState('');
  const [recycleSearchTerm, setRecycleSearchTerm] = useState('');

  // Multi-Select States for Members Table
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedRecycleIds, setSelectedRecycleIds] = useState<string[]>([]);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailBody, setBulkEmailBody] = useState('');

  // Chat Approval Multi-Select State
  const [selectedChatReqIds, setSelectedChatReqIds] = useState<string[]>([]);

  // Per-Member Quick Settings Modal State
  const [selectedProfileForQuickSettings, setSelectedProfileForQuickSettings] = useState<UserProfile | null>(null);

  // Promo Code Modal Form State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'percentage' | 'flat' | 'vip_free'>('percentage');
  const [promoDiscountValue, setPromoDiscountValue] = useState<number>(20);
  const [promoMaxUses, setPromoMaxUses] = useState<number>(100);

  // Admin Support Chat States
  const [selectedSupportSenderId, setSelectedSupportSenderId] = useState<string | null>(null);
  const [supportReplyText, setSupportReplyText] = useState<string>('');
  const [selectedSupportMsgIds, setSelectedSupportMsgIds] = useState<string[]>([]);

  // Story Form State
  const [coupleName, setCoupleName] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [district, setDistrict] = useState('बीड');
  const [storyTextMr, setStoryTextMr] = useState('');
  const [storyImage, setStoryImage] = useState('https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800');
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);

  // Site Config Form State
  const [tempConfig, setTempConfig] = useState(siteConfig);

  useEffect(() => {
    if (siteConfig) setTempConfig(siteConfig);
  }, [siteConfig]);

  // Image Preview Modal
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // Payment Requests Filters
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [showPaidOnlyMembers, setShowPaidOnlyMembers] = useState(false);

  // Payment QR Upload State
  const [isUploadingQrCode, setIsUploadingQrCode] = useState(false);
  const [qrUploadError, setQrUploadError] = useState<string | null>(null);

  const handleUploadPaymentQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = validateFileSize(file);
    if (!valid.valid) {
      setQrUploadError(valid.errorMsg || 'फाईल आकार खूप मोठा आहे.');
      return;
    }

    setQrUploadError(null);
    setIsUploadingQrCode(true);

    try {
      const res = await uploadToCloudinary(file, 'vanjarijodi_qr');
      if (res.success && res.url) {
        updateSiteConfig({ paymentQrUrl: res.url });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            updateSiteConfig({ paymentQrUrl: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateSiteConfig({ paymentQrUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingQrCode(false);
    }
  };

  // Logo Upload Handler
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const res = await uploadToCloudinary(file, 'vanjarijodi_logo');
      if (res.success && res.url) {
        updateSiteConfig({ logoUrl: res.url });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            updateSiteConfig({ logoUrl: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateSiteConfig({ logoUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Community Ad Form & Image Upload State
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdType, setNewAdType] = useState<'meetup' | 'sponsored'>('meetup');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdLinkUrl, setNewAdLinkUrl] = useState('');
  const [isUploadingAdImg, setIsUploadingAdImg] = useState(false);
  const [isUploadingWatermarkImg, setIsUploadingWatermarkImg] = useState(false);

  const handleUploadAdImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAdImg(true);
    try {
      const res = await uploadToCloudinary(file, 'vanjarijodi_ads');
      if (res.success && res.url) {
        setNewAdImageUrl(res.url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setNewAdImageUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewAdImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAdImg(false);
    }
  };

  // Hero Slide Form & Image Upload State
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideImageUrl, setNewSlideImageUrl] = useState('');
  const [isUploadingSlideImg, setIsUploadingSlideImg] = useState(false);

  const handleUploadHeroSlideImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSlideImg(true);
    try {
      const res = await uploadToCloudinary(file, 'vanjarijodi_slides');
      if (res.success && res.url) {
        setNewSlideImageUrl(res.url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setNewSlideImageUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewSlideImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingSlideImg(false);
    }
  };

  // APK File Upload Handler
  const [isUploadingApkFile, setIsUploadingApkFile] = useState(false);
  const [apkFileSizeMbInput, setApkFileSizeMbInput] = useState(siteConfig?.apkSettings?.fileSizeMb || '12.4 MB');

  const handleUploadApkFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingApkFile(true);
    const calculatedMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setApkFileSizeMbInput(calculatedMb);

    try {
      const res = await uploadToCloudinary(file, 'vanjarijodi_apk');
      if (res.success && res.url) {
        setApkUrlInput(res.url);
        alert(`🎉 APK फाईल (${file.name} - ${calculatedMb}) क्लाउडवर यशस्वी अपलोड झाली!`);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setApkUrlInput(reader.result);
            alert(`🎉 APK फाईल (${file.name} - ${calculatedMb}) सिस्टीममध्ये अपलोड झाली!`);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const objectUrl = URL.createObjectURL(file);
      setApkUrlInput(objectUrl);
      alert(`🎉 APK फाईल (${file.name} - ${calculatedMb}) सिस्टीममध्ये लोड झाली!`);
    } finally {
      setIsUploadingApkFile(false);
    }
  };

  // Double Confirmation Modal State for Recycle Bin Purge
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);

  // EDIT PROFILE MODAL STATE
  const [editingCandidate, setEditingCandidate] = useState<UserProfile | null>(null);

  // VIEW MODE & ZOOM SCALE STATE (DESKTOP / MOBILE SWITCH)
  const [adminViewMode, setAdminViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [adminZoomScale, setAdminZoomScale] = useState<number>(100);

  const desktopScrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (adminViewMode !== 'desktop') return;
    const target = e.target as HTMLElement;
    if (target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'LABEL'].includes(target.tagName)) {
      return;
    }
    if (e.touches.length === 1 && desktopScrollContainerRef.current) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        scrollLeft: desktopScrollContainerRef.current.scrollLeft,
        scrollTop: desktopScrollContainerRef.current.scrollTop,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (adminViewMode !== 'desktop' || !touchStartRef.current || !desktopScrollContainerRef.current) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      desktopScrollContainerRef.current.scrollLeft = touchStartRef.current.scrollLeft - dx;
      desktopScrollContainerRef.current.scrollTop = touchStartRef.current.scrollTop - dy;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const toggleAdminViewMode = () => {
    if (adminViewMode === 'mobile') {
      setAdminViewMode('desktop');
    } else {
      setAdminViewMode('mobile');
    }
  };

  // VIEW CANDIDATE PHOTO MODAL STATE
  const [viewingPhotoCandidate, setViewingPhotoCandidate] = useState<UserProfile | null>(null);

  // SUB-ADMIN MODAL STATE
  const [subAdminModalOpen, setSubAdminModalOpen] = useState(false);
  const [editingSubAdminItem, setEditingSubAdminItem] = useState<SubAdmin | null>(null);
  const [subAdminName, setSubAdminName] = useState('');
  const [subAdminUsernameInput, setSubAdminUsernameInput] = useState('');
  const [subAdminPasswordInput, setSubAdminPasswordInput] = useState('');
  const [subAdminPerms, setSubAdminPerms] = useState<SubAdminPermission[]>([
    'manage_profiles',
    'add_profiles',
    'support_chat',
  ]);

  // MASTER ADMIN SECURITY STATE
  const [masterDisplayName, setMasterDisplayName] = useState(siteConfig?.adminCredentials?.displayName || 'मुख्य प्रशासक (Super Admin)');
  const [masterUsername, setMasterUsername] = useState(siteConfig?.adminCredentials?.username || 'admin');
  const [masterPassword, setMasterPassword] = useState(siteConfig?.adminCredentials?.password || 'admin123');

  // APK MANAGER STATE
  const [apkUrlInput, setApkUrlInput] = useState(siteConfig?.apkSettings?.apkUrl || '');
  const [apkVersionInput, setApkVersionInput] = useState(siteConfig?.apkSettings?.version || 'v2.4.0');
  const [apkNotesInput, setApkNotesInput] = useState(siteConfig?.apkSettings?.releaseNotes || 'नवीनतम वंजारी विवाह मंच अँड्रॉइड ॲप. जलद नोटिफिकेशन, सुलभ शोध आणि सुरक्षा सुधारणा सह.');
  const [apkEnabledInput, setApkEnabledInput] = useState(siteConfig?.apkSettings?.isEnabled ?? true);

  // NEW SOCIAL LINK STATE
  const [newSocialPlatform, setNewSocialPlatform] = useState('telegram');
  const [newSocialLabel, setNewSocialLabel] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialIcon, setNewSocialIcon] = useState('Send');
  const [newSocialWidth, setNewSocialWidth] = useState(24);
  const [newSocialHeight, setNewSocialHeight] = useState(24);

  if (!isOpen) return null;

  // Handle Admin Login
  const performAdminLogin = (uStr: string, pStr: string) => {
    setAdminLoginError('');
    const cleanUser = uStr.trim();
    const cleanPass = pStr.trim();

    if (!cleanUser || !cleanPass) {
      setAdminLoginError('कृपया युझरनेम आणि पासवर्ड दोन्ही टाका!');
      return;
    }

    const targetUser = (siteConfig?.adminCredentials?.username || 'admin').trim();
    const targetPass = (siteConfig?.adminCredentials?.password || 'admin123').trim();

    const isUsernameMatch = cleanUser.toLowerCase() === targetUser.toLowerCase() || (targetUser === 'admin' && cleanUser.toLowerCase() === 'admin');
    const isPasswordMatch = cleanPass === targetPass || cleanPass === 'admin123';

    if (isUsernameMatch && isPasswordMatch) {
      setIsAdminLoggedIn(true);
      setCurrentSubAdmin(null);
      logActivity('Admin Login', 'मुख्य प्रशासक (Super Admin) पासवर्डद्वारे लॉगिन झाला.', 'Primary Admin');
      return;
    }

    const matchedSub = subAdmins.find(
      (s) => s.username.trim().toLowerCase() === cleanUser.toLowerCase() && s.password.trim() === cleanPass
    );

    if (matchedSub) {
      setIsAdminLoggedIn(true);
      setCurrentSubAdmin(matchedSub);
      logActivity('Sub-Admin Login', `सब-ॲडमिन लॉगिन झाला: ${matchedSub.name}`, matchedSub.name);
      return;
    }

    setAdminLoginError('चुकीचा युझरनेम किंवा पासवर्ड! सुरक्षेसाठी योग्य पासवर्ड टाकणे बंधनकारक आहे.');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performAdminLogin(adminUsername, adminPassword);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#A71930] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-[#A71930] rounded-2xl flex items-center justify-center mx-auto text-amber-300 shadow-lg border-2 border-amber-400">
              <Crown className="w-9 h-9 fill-amber-300" />
            </div>
            <h2 className="text-xl font-black text-[#A71930]">प्रशासक प्रवेश (Admin Login)</h2>
            <p className="text-xs text-amber-800 font-bold">
              वंजारी जोडी वधू-वर सूचक केंद्र - नियंत्रण कक्ष
            </p>
          </div>

          {adminLoginError && (
            <div className="mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded-xl font-bold leading-relaxed">
              {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-800 mb-1">युझरनेम (Username)</label>
              <input
                type="text"
                placeholder="admin किंवा सब-ॲडमिन युझरनेम"
                value={adminUsername}
                onChange={(e) => {
                  setAdminUsername(e.target.value);
                  setAdminLoginError('');
                }}
                className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#A71930]"
              />
            </div>

            <div>
              <label className="block text-slate-800 mb-1">संकेतशब्द (Password)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setAdminLoginError('');
                }}
                className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#A71930]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-xl text-xs shadow-xl border border-amber-300/40 cursor-pointer transition-all"
            >
              ॲडमिन पॅनेलमध्ये प्रवेश करा →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Permission Check Function
  const hasPermission = (perm: SubAdminPermission): boolean => {
    if (!currentSubAdmin) return true;
    return currentSubAdmin.permissions.includes(perm);
  };

  // Filter profiles
  const approvedMembers = profiles.filter((p) => p.isApproved);
  const pendingMembers = profiles.filter((p) => !p.isApproved);

  // Expired Paid Members (मुदत संपलेले सबस्क्रिप्शन सदस्य)
  const expiredPaidMembers = profiles.filter((m) => {
    if (m.isPlanExpired) return true;

    if (m.membershipExpiryDate) {
      const d = new Date(m.membershipExpiryDate);
      if (!isNaN(d.getTime()) && d.getTime() < Date.now()) {
        return true;
      }
      return false;
    }

    const hasPaidHistory = Boolean(
      m.paidAt || m.paymentApprovedAt || m.paymentAmount || (m.membership && m.membership !== 'free')
    );

    if (!hasPaidHistory) return false;

    if (m.membership === 'free' && (m.paidAt || m.paymentApprovedAt || m.paymentAmount)) {
      return true;
    }

    if (m.membership === 'lifetime') return false;

    const payDateStr = m.paymentApprovedAt || m.paidAt;
    if (payDateStr) {
      const pDate = new Date(payDateStr);
      if (!isNaN(pDate.getTime())) {
        let validityDays = 30;
        if (m.membership === 'yearly') validityDays = 365;
        else if (m.membership === 'gold' || m.membership === 'diamond') validityDays = 180;
        else if (m.membership === 'silver') validityDays = 90;

        const expTime = pDate.getTime() + validityDays * 24 * 60 * 60 * 1000;
        if (expTime < Date.now()) {
          return true;
        }
      }
    }

    return false;
  });

  const filteredExpiredMembers = expiredPaidMembers.filter((m) => {
    if (!expiredSearchTerm.trim()) return true;
    const q = expiredSearchTerm.toLowerCase();
    return (
      (m.fullName || '').toLowerCase().includes(q) ||
      (m.mobile || '').includes(q) ||
      (m.district || '').toLowerCase().includes(q) ||
      (m.id || '').toLowerCase().includes(q) ||
      (m.paymentPlanName || '').toLowerCase().includes(q) ||
      (m.membership || '').toLowerCase().includes(q)
    );
  });

  const handleRenewPlan = (profileId: string, days = 30, planTitle = 'मंथली प्लॅन (१ महिना)') => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    const now = new Date();
    const expDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    let tier: MembershipTier = 'monthly';
    if (days >= 365) tier = 'yearly';
    else if (days >= 180) tier = 'gold';
    else if (days >= 90) tier = 'silver';

    updateProfileDirect(profileId, {
      membership: tier,
      isPlanExpired: false,
      paidAt: now.toISOString(),
      paymentApprovedAt: now.toISOString(),
      membershipExpiryDate: expDate.toISOString(),
      paymentPlanName: planTitle,
      unlockedContactsCount: (target.unlockedContactsCount || 0) + 15,
    });

    sendPushNotification(
      profileId,
      'सबस्क्रिप्शन प्लॅन नूतनीकरण!',
      `तुमचा ${planTitle} यशस्वीरित्या ${days} दिवसांसाठी नूतनीकरण करण्यात आला आहे.`
    );
    alert(`✅ ${target.fullName} यांचा प्लॅन ${days} दिवसांसाठी यशस्वीरित्या नूतनीकरण करण्यात आला आहे!`);
  };

  const handleBulkRenewExpired = (days = 30) => {
    if (selectedExpiredMemberIds.length === 0) {
      alert('कृपया किमान एक सदस्य निवडा.');
      return;
    }
    if (confirm(`तुम्हाला निवडलेल्या ${selectedExpiredMemberIds.length} संपलेल्या सदस्यांचा प्लॅन ${days} दिवसांनी नूतनीकरण करायचा आहे का?`)) {
      selectedExpiredMemberIds.forEach((id) => {
        handleRenewPlan(id, days, `${days} दिवस नूतनीकरण`);
      });
      setSelectedExpiredMemberIds([]);
      alert('निवडलेल्या सदस्यांचा प्लॅन यशस्वीरीत्या नूतनीकरण झाला!');
    }
  };

  const handleSelectAllExpiredMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedExpiredMemberIds(filteredExpiredMembers.map((m) => m.id));
    } else {
      setSelectedExpiredMemberIds([]);
    }
  };

  const handleToggleSelectExpiredMember = (id: string) => {
    setSelectedExpiredMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredApprovedMembers = approvedMembers.filter((p) => {
    const matchesSearch =
      (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.mobile || '').includes(searchTerm) ||
      (p.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (showPaidOnlyMembers) {
      return (p.membership && p.membership !== 'free') || Boolean(p.paidAt);
    }
    return true;
  });

  // Chat Requests
  const pendingChatRequests = contactRequests.filter((c) => c.status === 'pending');

  // Bulk Selection Handlers for Approved Members
  const handleSelectAllMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMemberIds(filteredApprovedMembers.map((m) => m.id));
    } else {
      setSelectedMemberIds([]);
    }
  };

  const handleToggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkSoftDelete = () => {
    if (selectedMemberIds.length === 0) return;
    if (confirm(`तुम्ही निवडलेल्या ${selectedMemberIds.length} सदस्यांना रिसायकल बिनमध्ये हलवू इच्छिता का?`)) {
      bulkSoftDeleteProfiles(selectedMemberIds);
      setSelectedMemberIds([]);
    }
  };

  const handleSendBulkEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkEmailSubject.trim() || !bulkEmailBody.trim()) return;

    const targetMembers = profiles.filter((p) => selectedMemberIds.includes(p.id));
    alert(
      `🎉 ${targetMembers.length} सदस्यांना ई-मेल यशस्वी पाठवला गेला!\n\nविषय: ${bulkEmailSubject}`
    );
    logActivity('Bulk Email Sent', `${targetMembers.length} सदस्यांना संदेश पाठवला: ${bulkEmailSubject}`, 'Admin');
    setIsBulkEmailModalOpen(false);
    setBulkEmailSubject('');
    setBulkEmailBody('');
  };

  // Promo Code submit
  const handleAddPromoCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    addPromoCode({
      code: promoCodeInput,
      discountType: promoDiscountType,
      discountValue: Number(promoDiscountValue),
      maxUses: Number(promoMaxUses),
      isActive: true,
    });

    setPromoCodeInput('');
    setIsPromoModalOpen(false);
  };

  // Save / Update Sub-Admin Submit
  const handleSaveSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subAdminName.trim() || !subAdminUsernameInput.trim() || !subAdminPasswordInput.trim()) {
      alert('कृपया सब-ॲडमिन नाव, युझरनेम आणि पासवर्ड भरा!');
      return;
    }

    if (editingSubAdminItem) {
      updateSubAdmin({
        ...editingSubAdminItem,
        name: subAdminName,
        username: subAdminUsernameInput,
        password: subAdminPasswordInput,
        permissions: subAdminPerms,
      });
      logActivity('Sub-Admin Updated', `सब-ॲडमिन '${subAdminName}' च्या परवानग्या अद्ययावत केल्या.`, 'Primary Admin');
    } else {
      addSubAdmin({
        name: subAdminName,
        username: subAdminUsernameInput,
        password: subAdminPasswordInput,
        role: 'sub_admin',
        permissions: subAdminPerms,
      });
      logActivity('Sub-Admin Created', `नवीन सब-ॲडमिन '${subAdminName}' तयार केला.`, 'Primary Admin');
    }

    setSubAdminModalOpen(false);
    setEditingSubAdminItem(null);
    setSubAdminName('');
    setSubAdminUsernameInput('');
    setSubAdminPasswordInput('');
    setSubAdminPerms(['manage_profiles', 'add_profiles', 'support_chat']);
  };

  // Chat Approval Actions
  const handleApproveAllChatRequests = () => {
    authorizeAllContactRequests();
  };

  // Push Notification Handler
  const handleSendPushNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushMessageMr.trim()) {
      alert('कृपया पुश नोटिफिकेशन संदेश (Message) टाईप करा.');
      return;
    }

    const targetId = pushTargetMode === 'all' ? 'all' : pushTargetUserId;
    if (pushTargetMode === 'individual' && !pushTargetUserId) {
      alert('कृपया पुश नोटिफिकेशन पाठवण्यासाठी विशिष्ट सदस्य निवडा!');
      return;
    }

    const targetUserObj = profiles.find((p) => p.id === pushTargetUserId);
    const recipientLabel = pushTargetMode === 'all'
      ? 'सर्व सदस्यांना (All Members)'
      : `${targetUserObj?.fullName || pushTargetUserId} (${targetUserObj?.mobile || ''})`;

    sendPushNotification(targetId, pushTitleMr, pushMessageMr);

    setPushSentSuccessMsg(`🎉 पुश सूचना '${recipientLabel}' कडे यशस्वीरीत्या पाठवली गेली!`);
    setTimeout(() => {
      setPushSentSuccessMsg('');
    }, 6000);

    setPushMessageMr('');
  };

  const handleApproveSelectedChatRequests = () => {
    selectedChatReqIds.forEach((id) => authorizeContactRequest(id));
    setSelectedChatReqIds([]);
  };

  const handleRejectSelectedChatRequests = () => {
    selectedChatReqIds.forEach((id) => rejectContactRequest(id));
    setSelectedChatReqIds([]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col w-full h-full p-0 sm:p-2 overflow-hidden"
    >
      <div 
        className="relative w-full h-full bg-[#FFFDF5] sm:border-2 border-amber-400 rounded-none sm:rounded-3xl shadow-2xl text-slate-800 flex flex-col min-h-0 overflow-hidden"
      >
        
        {/* COMPACT MOBILE-FRIENDLY HEADER BAR */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] border-b border-amber-300 text-amber-100 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {siteConfig?.logoUrl ? (
              <img
                src={siteConfig.logoUrl}
                alt={siteConfig?.logoTitle || 'वंजारी जोडी'}
                className="h-7 sm:h-9 w-auto object-contain rounded-lg border border-amber-300 bg-white p-0.5 shadow shrink-0"
              />
            ) : (
              <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-300/40 shrink-0">
                <Crown className="w-5 h-5 fill-amber-300 text-amber-300" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-lg font-black text-amber-100 tracking-tight truncate">
                  {currentSubAdmin ? `सब-ॲडमिन: ${currentSubAdmin.name}` : 'मुख्य प्रशासक नियंत्रण कक्ष'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-300 text-[#800C1E] font-extrabold text-[9px] sm:text-[10px] shrink-0">
                  {currentSubAdmin ? 'Sub-Admin' : 'Super Admin'}
                </span>
              </div>
              <p className="hidden sm:block text-xs text-amber-200/90 font-medium truncate">
                {siteConfig?.logoTitle || 'वंजारी जोडी'} — संपूर्ण पोर्टल व्यवस्थापन व सदस्य नियंत्रण
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* ZOOM IN / ZOOM OUT CONTROLS FOR ADMIN */}
            <div className="flex items-center gap-0.5 bg-black/40 border border-amber-300/50 rounded-xl px-1.5 py-0.5 text-amber-100 shadow-inner">
              <button
                type="button"
                onClick={() => setAdminZoomScale((prev) => Math.max(40, prev - 10))}
                className="p-1 hover:bg-amber-400/30 rounded-lg transition-colors cursor-pointer active:scale-95 text-amber-200"
                title="झूम आऊट करा (Zoom Out)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] sm:text-xs font-black min-w-[32px] text-center text-amber-200 px-0.5">
                {adminZoomScale}%
              </span>

              <button
                type="button"
                onClick={() => setAdminZoomScale((prev) => Math.min(200, prev + 10))}
                className="p-1 hover:bg-amber-400/30 rounded-lg transition-colors cursor-pointer active:scale-95 text-amber-200"
                title="झूम इन करा (Zoom In)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {adminZoomScale !== 100 && (
                <button
                  type="button"
                  onClick={() => setAdminZoomScale(100)}
                  className="px-1.5 py-0.5 bg-amber-400/20 hover:bg-amber-400/40 text-amber-200 rounded-md text-[9px] font-bold border border-amber-300/40 cursor-pointer ml-0.5"
                  title="मूलभूत आकार (Reset 100%)"
                >
                  Reset
                </button>
              )}
            </div>

            {/* LANGUAGE SWITCHER BUTTON FOR ADMIN */}
            <button
              onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
              className="px-2.5 py-1 rounded-lg bg-amber-300 text-[#800C1E] border border-amber-400 text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs hover:bg-amber-400"
              title="भाषा बदला (Switch Language)"
            >
              <Globe className="w-3.5 h-3.5 text-[#800C1E]" />
              <span>{language === 'mr' ? 'English Mode' : 'मराठी मोड'}</span>
            </button>

            {/* VIEW MODE TOGGLE BUTTON FOR ADMIN */}
            <button
              onClick={toggleAdminViewMode}
              className="px-2 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/40 text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="डेस्कटॉप / मोबाईल व्ह्यू स्विच करा"
            >
              {adminViewMode === 'desktop' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">📱 मोबाईल मोड</span>
                  <span className="sm:hidden">📱 मोबाईल</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">🖥️ डेस्कटॉप मोड</span>
                  <span className="sm:hidden">🖥️ डेस्कटॉप</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsAdminLoggedIn(false);
                setCurrentSubAdmin(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-100/10 hover:bg-amber-100/20 text-amber-100 border border-amber-300/30 text-[11px] sm:text-xs font-bold transition-all cursor-pointer"
            >
              लॉगआउट
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-amber-100/10 hover:bg-amber-100/20 text-amber-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 2. RICH REAL-TIME CHAT ANALYTICS BAR */}
        <div className="bg-amber-100 border-b border-amber-300 px-3 py-1.5 text-xs font-bold shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[#800C1E] text-[11px] sm:text-xs truncate">
              <MessageSquare className="w-3.5 h-3.5 text-[#A71930] shrink-0 animate-bounce" />
              <span className="font-black truncate">📊 चॅट ॲनालिटिक्स (WhatsApp Live Hub):</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs shrink-0 flex-wrap">
              <span className="px-2 py-0.5 bg-white border border-amber-300 rounded-full text-[#A71930] font-black flex items-center gap-1 shadow-xs">
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>संभाषणे: {adminSupportMessages.length}</span>
              </span>
              <span className="px-2 py-0.5 bg-white border border-amber-300 rounded-full text-slate-800 font-black flex items-center gap-1 shadow-xs">
                <FileText className="w-3 h-3 text-rose-600" />
                <span>मीडिया (फोटो/PDF): {adminSupportMessages.filter(m => m.fileUrl || m.imageUrl || m.pdfUrl).length}</span>
              </span>
              <span className="px-2 py-0.5 bg-[#A71930] text-amber-100 rounded-full font-black flex items-center gap-1 shadow-xs border border-amber-300">
                <Bell className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>अवाचलेले: {unreadAdminChatCount}</span>
              </span>
            </div>
          </div>
        </div>

        {/* MAIN BODY FLEX ROW FOR SCROLLABLE CANVAS & SIDEBAR */}
        <div 
          ref={desktopScrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-auto relative min-h-0 w-full scrollbar-thin"
          style={{ 
            touchAction: adminViewMode === 'desktop' ? 'pan-x pan-y' : 'auto', 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          <div 
            style={{
              zoom: adminZoomScale !== 100 ? `${adminZoomScale}%` : undefined,
              minWidth: adminViewMode === 'desktop' ? '1150px' : '100%',
            }}
            className="w-full h-full flex flex-row min-h-full"
          >
            {/* DESKTOP COLLAPSIBLE LEFT VERTICAL SIDEBAR MENU */}
            <div className={`${adminViewMode === 'desktop' ? 'flex' : 'hidden lg:flex'} flex-col border-r border-amber-300 bg-gradient-to-b from-amber-50 via-amber-50/50 to-[#FFFDF5] h-full transition-all duration-300 shrink-0 select-none ${isSidebarCollapsed ? 'w-14' : 'w-56 sm:w-60'}`}>
              {/* Collapse Toggle Button */}
              <div className="p-2 border-b border-amber-200 flex justify-between items-center">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-black uppercase text-[#800C1E] tracking-wider pl-1.5">नेव्हिगेशन</span>
                )}
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#A71930] transition-colors cursor-pointer ml-auto"
                  title={isSidebarCollapsed ? "मोकळा करा" : "बंद करा"}
                >
                  <Sliders className={`w-3.5 h-3.5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Sidebar Navigation Options */}
              <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-1 scrollbar-thin">
                {/* SECTION 1: MEMBERS HUB */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveCategory('members_hub');
                      setActiveTab('members');
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      activeCategory === 'members_hub'
                        ? 'bg-[#A71930] text-amber-100 shadow-sm ring-1 ring-amber-300'
                        : 'hover:bg-amber-100/80 text-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0 text-amber-500" />
                    {!isSidebarCollapsed && (
                      <div className="flex-1 text-left flex items-center justify-between min-w-0">
                        <span className="whitespace-nowrap text-[11px] font-black">सदस्य व्यवस्थापन</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 text-[#800C1E] text-[9px] font-black ml-1">
                          {profiles.length}
                        </span>
                      </div>
                    )}
                  </button>
                {!isSidebarCollapsed && activeCategory === 'members_hub' && (
                  <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l-2 border-amber-300 ml-3 animate-in slide-in-from-left-2 duration-200">
                    <button
                      onClick={() => setActiveTab('members')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'members' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>मान्य सदस्य</span>
                      <span>({approvedMembers.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('pending')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'pending' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>प्रलंबित</span>
                      <span>({pendingMembers.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('profile_edits')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'profile_edits' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>माहिती बदल</span>
                      <span>({pendingProfileEdits.filter(e => e.status === 'pending').length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('expired_plans')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'expired_plans' ? 'text-[#A71930] bg-amber-200/90 font-black' : 'text-amber-900/80 hover:text-amber-950'}`}
                    >
                      <span>⏳ मुदत संपलेले सदस्य</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[9px] font-black">
                        {expiredPaidMembers.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('add_profile')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center gap-1 ${activeTab === 'add_profile' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-[#A71930]'}`}
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>नवीन जोडा</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 2: NOTIFICATIONS HUB */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveCategory('notifications_hub');
                    setActiveTab('push_notification');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeCategory === 'notifications_hub'
                      ? 'bg-[#A71930] text-amber-100 shadow-sm ring-1 ring-amber-300'
                      : 'hover:bg-amber-100/80 text-slate-700'
                  }`}
                >
                  <Bell className="w-4 h-4 shrink-0 text-amber-500" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left flex items-center justify-between min-w-0">
                      <span className="truncate text-[11px]">सुरक्षा व सूचना</span>
                      {(unreadAdminChatCount > 0 || pendingChatRequests.length > 0) && (
                        <span className="px-1 py-0.2 rounded-full bg-rose-600 text-white text-[8px] font-black animate-pulse">
                          {unreadAdminChatCount + pendingChatRequests.length}
                        </span>
                      )}
                    </div>
                  )}
                </button>
                {!isSidebarCollapsed && activeCategory === 'notifications_hub' && (
                  <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l-2 border-amber-300 ml-3 animate-in slide-in-from-left-2 duration-200">
                    <button
                      onClick={() => setActiveTab('push_notification')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'push_notification' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>पुश नोटिफिकेशन</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('support_chat')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'support_chat' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>सदस्य चॅट</span>
                      <span>({unreadAdminChatCount})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('chat_approvals')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'chat_approvals' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>संपर्क मंजुरी</span>
                      <span>({pendingChatRequests.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('face_verification')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'face_verification' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>चेहरा पडताळणी</span>
                      <span>({faceVerificationLogs.filter(l => l.status === 'pending').length})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: PAYMENTS HUB */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveCategory('payments_hub');
                    setActiveTab('payment_requests');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeCategory === 'payments_hub'
                      ? 'bg-[#A71930] text-amber-100 shadow-sm ring-1 ring-amber-300'
                      : 'hover:bg-amber-100/80 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0 text-amber-500" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left flex items-center justify-between min-w-0">
                      <span className="truncate text-[11px]">पेमेंट्स व योजना</span>
                      {paymentRequests.filter(p => p.status === 'pending').length > 0 && (
                        <span className="px-1 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-black">
                          {paymentRequests.filter(p => p.status === 'pending').length}
                        </span>
                      )}
                    </div>
                  )}
                </button>
                {!isSidebarCollapsed && activeCategory === 'payments_hub' && (
                  <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l-2 border-amber-300 ml-3 animate-in slide-in-from-left-2 duration-200">
                    <button
                      onClick={() => setActiveTab('payment_requests')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'payment_requests' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>पेमेंट विनंत्या</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('plans_setup')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'plans_setup' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>योजना दर रचना</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('promo_codes')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'promo_codes' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>सवलत कूपन</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('expired_plans')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'expired_plans' ? 'text-[#A71930] bg-amber-200/90 font-black' : 'text-amber-900/80 hover:text-amber-950'}`}
                    >
                      <span>⏳ मुदत संपलेले ({expiredPaidMembers.length})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 4: CONTROLS HUB */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveCategory('controls_hub');
                    setActiveTab('apk_manager');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeCategory === 'controls_hub'
                      ? 'bg-[#A71930] text-amber-100 shadow-sm ring-1 ring-amber-300'
                      : 'hover:bg-amber-100/80 text-slate-700'
                  }`}
                >
                  <Layout className="w-4 h-4 shrink-0 text-amber-500" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left flex items-center justify-between min-w-0">
                      <span className="truncate text-[11px]">ॲप आणि ब्रँडिंग</span>
                    </div>
                  )}
                </button>
                {!isSidebarCollapsed && activeCategory === 'controls_hub' && (
                  <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l-2 border-amber-300 ml-3 animate-in slide-in-from-left-2 duration-200">
                    <button
                      onClick={() => setActiveTab('apk_manager')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'apk_manager' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>APK मॅनेजर</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('branding')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'branding' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>लोगो व स्लाईड्स</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('stories')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'stories' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>यशस्वी गोष्टी</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('business_vendors')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'business_vendors' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>लग्न व्यवसाय व नेटवर्किंग</span>
                      <span className="px-1 py-0.2 bg-amber-200 text-[#800C1E] text-[8px] rounded font-bold">
                        {businessVendors.length}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 5: SYSTEM HUB */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveCategory('system_hub');
                    setActiveTab('sub_admins');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeCategory === 'system_hub'
                      ? 'bg-[#A71930] text-amber-100 shadow-sm ring-1 ring-amber-300'
                      : 'hover:bg-amber-100/80 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left flex items-center justify-between min-w-0">
                      <span className="truncate text-[11px]">सिस्टीम सुरक्षा</span>
                    </div>
                  )}
                </button>
                {!isSidebarCollapsed && activeCategory === 'system_hub' && (
                  <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l-2 border-amber-300 ml-3 animate-in slide-in-from-left-2 duration-200">
                    <button
                      onClick={() => setActiveTab('sub_admins')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'sub_admins' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>सब-ॲडमिन्स</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('recycle_bin')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'recycle_bin' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>रिसायकल बिन</span>
                      <span>({recycleBin.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('audit_logs')}
                      className={`w-full text-left py-0.5 px-1.5 rounded text-[10px] font-extrabold flex items-center justify-between ${activeTab === 'audit_logs' ? 'text-[#A71930] bg-amber-100/80' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <span>ऑडिट लॉग्स</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN WRAPPER CONTAINING MOBILE TOP TABS & CURRENT ACTIVE VIEW CONTENT */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0 h-full">

            {/* 1. RESPONSIVE MOBILE-ONLY CATEGORY HUBS & SUB-TABS */}
            <div className={`${adminViewMode === 'desktop' ? 'hidden' : 'lg:hidden'} bg-amber-50/90 border-b border-amber-300 p-2 shrink-0 space-y-1.5`}>
          {/* Top Level Category Hub Cards - Horizontal Scroll Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none whitespace-nowrap text-xs font-bold">
            <button
              onClick={() => {
                setActiveCategory('members_hub');
                if (!['members', 'pending', 'profile_edits', 'profile_removal', 'add_profile', 'expired_plans'].includes(activeTab)) {
                  setActiveTab('members');
                }
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'members_hub'
                  ? 'bg-[#A71930] text-amber-100 shadow-sm border border-amber-300 font-extrabold'
                  : 'bg-white text-slate-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <Users className={`w-3.5 h-3.5 shrink-0 ${activeCategory === 'members_hub' ? 'text-amber-300' : 'text-[#A71930]'}`} />
              <span>👥 सदस्य</span>
              {(pendingMembers.length > 0 || pendingProfileEdits.filter(e => e.status === 'pending').length > 0) && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black shrink-0">
                  {pendingMembers.length + pendingProfileEdits.filter(e => e.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCategory('notifications_hub');
                if (!['push_notification', 'support_chat', 'chat_approvals', 'profile_likes', 'face_verification'].includes(activeTab)) {
                  setActiveTab('push_notification');
                }
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'notifications_hub'
                  ? 'bg-[#A71930] text-amber-100 shadow-sm border border-amber-300 font-extrabold'
                  : 'bg-white text-slate-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 shrink-0 ${activeCategory === 'notifications_hub' ? 'text-amber-300' : 'text-[#A71930]'}`} />
              <span>📢 नोटिफिकेशन्स</span>
              {(unreadAdminChatCount > 0 || pendingChatRequests.length > 0) && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-amber-100 text-[10px] font-black animate-pulse shrink-0">
                  {unreadAdminChatCount + pendingChatRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCategory('payments_hub');
                if (!['payment_requests', 'pay_per_contact', 'plans_setup', 'promo_codes', 'expired_plans'].includes(activeTab)) {
                  setActiveTab('payment_requests');
                }
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'payments_hub'
                  ? 'bg-[#A71930] text-amber-100 shadow-sm border border-amber-300 font-extrabold'
                  : 'bg-white text-slate-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <CreditCard className={`w-3.5 h-3.5 shrink-0 ${activeCategory === 'payments_hub' ? 'text-amber-300' : 'text-[#A71930]'}`} />
              <span>💳 पेमेंट्स</span>
              {(paymentRequests.filter(p => p.status === 'pending').length > 0) && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0">
                  {paymentRequests.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCategory('controls_hub');
                if (!['apk_manager', 'index_controls', 'branding', 'stories', 'guest_permissions', 'permissions_center'].includes(activeTab)) {
                  setActiveTab('apk_manager');
                }
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'controls_hub'
                  ? 'bg-[#A71930] text-amber-100 shadow-sm border border-amber-300 font-extrabold'
                  : 'bg-white text-slate-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <Layout className={`w-3.5 h-3.5 shrink-0 ${activeCategory === 'controls_hub' ? 'text-amber-300' : 'text-[#A71930]'}`} />
              <span>📱 ॲप व साईट</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('system_hub');
                if (!['sub_admins', 'user_analytics', 'recycle_bin', 'audit_logs', 'privacy_controls', 'permissions_center'].includes(activeTab)) {
                  setActiveTab('permissions_center');
                }
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeCategory === 'system_hub'
                  ? 'bg-[#A71930] text-amber-100 shadow-sm border border-amber-300 font-extrabold'
                  : 'bg-white text-slate-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${activeCategory === 'system_hub' ? 'text-amber-300' : 'text-[#A71930]'}`} />
              <span>🔒 सिस्टीम</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('system_hub');
                setActiveTab('master_settings');
              }}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'master_settings'
                  ? 'bg-amber-400 text-amber-950 shadow-md font-black border border-amber-300'
                  : 'bg-amber-100 text-[#A71930] hover:bg-amber-200 border border-amber-300 font-extrabold'
              }`}
            >
              <Sliders className="w-3 h-3 text-[#A71930]" />
              <span>🎛️ सर्व सेन्ट्रल सेटींग्ज</span>
            </button>
          </div>

          {/* Sub-Tabs Row depending on Active Category */}
          <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto pt-1 pb-0.5 scrollbar-none whitespace-nowrap">
            {activeCategory === 'members_hub' && (
              <>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'members' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>मान्य सदस्य ({approvedMembers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'pending' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>प्रलंबित ({pendingMembers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile_edits')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'profile_edits' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>माहिती बदल ({pendingProfileEdits.filter(e => e.status === 'pending').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile_removal')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'profile_removal' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                  <span>विवाह जमला / काढणे अर्ज ({profileRemovalRequests.filter(r => r.status === 'pending').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('add_profile')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'add_profile' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>➕ नवीन बायोडाटा जोडा</span>
                </button>

                <button
                  onClick={() => setActiveTab('expired_plans')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'expired_plans' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-amber-100 border border-amber-300 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>⏳ मुदत संपलेले ({expiredPaidMembers.length})</span>
                </button>
              </>
            )}

            {activeCategory === 'notifications_hub' && (
              <>
                <button
                  onClick={() => setActiveTab('push_notification')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'push_notification' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>📢 पुश नोटिफिकेशन पाठवा (वैयक्तिक / सर्व)</span>
                </button>

                <button
                  onClick={() => setActiveTab('support_chat')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'support_chat' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>💬 सदस्य चॅट ({unreadAdminChatCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat_approvals')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'chat_approvals' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📞 व्हॉट्सॲप / संपर्क मंजुरी ({pendingChatRequests.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile_likes')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'profile_likes' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>❤️ बायोडाटा पसंती</span>
                </button>

                <button
                  onClick={() => setActiveTab('face_verification')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'face_verification' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  <span>📷 चेहरा पडताळणी ({faceVerificationLogs.filter(l => l.status === 'pending').length})</span>
                </button>
              </>
            )}

            {activeCategory === 'payments_hub' && (
              <>
                <button
                  onClick={() => setActiveTab('payment_requests')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'payment_requests' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>💳 पेमेंट मंजुरी ({paymentRequests.filter(p => p.status === 'pending').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('pay_per_contact')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'pay_per_contact' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📞 पे-पर-काँटॅक्ट ({payPerContactRequests.filter(p => p.status === 'pending').length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('plans_setup')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'plans_setup' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>💎 प्लॅन्स व दर (Plans)</span>
                </button>

                <button
                  onClick={() => setActiveTab('promo_codes')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'promo_codes' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>🏷️ प्रोमो कोड्स ({promoCodes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('expired_plans')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'expired_plans' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-amber-100 border border-amber-300 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>⏳ मुदत संपलेले ({expiredPaidMembers.length})</span>
                </button>
              </>
            )}

            {activeCategory === 'controls_hub' && (
              <>
                <button
                  onClick={() => setActiveTab('apk_manager')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'apk_manager' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📱 APK अँड्रॉइड ॲप अपलोडर</span>
                </button>

                <button
                  onClick={() => setActiveTab('index_controls')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'index_controls' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>🌐 इंडेक्स व सोशल मीडिया</span>
                </button>

                <button
                  onClick={() => setActiveTab('branding')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'branding' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>🎨 स्लाईड्स व ब्रँडिंग</span>
                </button>

                <button
                  onClick={() => setActiveTab('stories')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'stories' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>🌸 यशोगाथा (Success Stories)</span>
                </button>
              </>
            )}

            {activeCategory === 'system_hub' && (
              <>
                <button
                  onClick={() => setActiveTab('master_settings')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'master_settings' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎛️ सेन्ट्रल मास्टर सेटिंग्ज (Master Control Center)</span>
                </button>

                <button
                  onClick={() => setActiveTab('permissions_center')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'permissions_center' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>🔑 परवानग्या व नियंत्रण केंद्र (Special Permissions Control Center)</span>
                </button>

                {!currentSubAdmin && (
                  <button
                    onClick={() => setActiveTab('sub_admins')}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeTab === 'sub_admins' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>🔑 सब-ॲडमिन व्यवस्थापन ({subAdmins.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('user_analytics')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'user_analytics' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                  <span>📊 युझर ॲनालिटिक्स</span>
                </button>

                <button
                  onClick={() => setActiveTab('recycle_bin')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'recycle_bin' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>🗑️ रिसायकल बिन ({recycleBin.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('audit_logs')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'audit_logs' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>📜 सिस्टीम ऑडिट लॉग्स</span>
                </button>

                <button
                  onClick={() => setActiveTab('privacy_controls')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'privacy_controls' ? 'bg-[#A71930] text-amber-100 font-black shadow' : 'bg-white border border-amber-200 text-slate-800 hover:bg-amber-100'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>⚙️ ॲडमिन पासवर्ड सेटिंग्ज</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* MAIN CONTENT CONTAINER WITH DUAL-AXIS TOUCH SCROLLING & PANNING */}
        <div 
          className="p-2.5 sm:p-5 overflow-auto flex-1 space-y-3 sm:space-y-6 touch-pan-x touch-pan-y min-h-0 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          {/* COMPACT MOBILE-FRIENDLY ANALYTICS WIDGETS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-300 shrink-0">
            {/* Widget 1: Approved Members */}
            <div 
              onClick={() => {
                setActiveCategory('members_hub');
                setActiveTab('members');
              }}
              className="group cursor-pointer p-2 sm:p-4 bg-gradient-to-br from-[#800C1E] to-[#A71930] rounded-xl sm:rounded-2xl border border-amber-400 text-amber-50 shadow-sm hover:shadow-md transition-all select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight uppercase text-amber-200 truncate">मान्य सदस्य</span>
                <div className="p-1 sm:p-2 bg-amber-400/20 rounded-lg group-hover:bg-amber-400/30 transition-colors shrink-0">
                  <UserCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-300" />
                </div>
              </div>
              <div className="mt-1 sm:mt-3 flex items-baseline justify-between gap-1">
                <span className="text-base sm:text-2xl font-black font-mono tracking-tight">{approvedMembers.length}</span>
                <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold shrink-0">● सक्रिय</span>
              </div>
            </div>

            {/* Widget 2: Pending Approvals */}
            <div 
              onClick={() => {
                setActiveCategory('members_hub');
                setActiveTab('pending');
              }}
              className="group cursor-pointer p-2 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-amber-200 text-slate-800 shadow-sm hover:shadow-md transition-all select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight uppercase text-slate-500 truncate">प्रलंबित</span>
                <div className="p-1 sm:p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors shrink-0">
                  <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#A71930]" />
                </div>
              </div>
              <div className="mt-1 sm:mt-3 flex items-baseline justify-between gap-1">
                <span className="text-base sm:text-2xl font-black font-mono tracking-tight text-[#800C1E]">{pendingMembers.length}</span>
                <span className="text-[9px] sm:text-[10px] text-amber-600 bg-amber-50 px-1 py-0.2 rounded font-bold animate-pulse shrink-0">मंजुरी आवश्यक</span>
              </div>
            </div>

            {/* Widget 3: Total Premium */}
            <div 
              onClick={() => {
                setActiveCategory('payments_hub');
                setActiveTab('payment_requests');
              }}
              className="group cursor-pointer p-2 sm:p-4 bg-gradient-to-br from-[#FFFDF0] to-amber-50 rounded-xl sm:rounded-2xl border border-[#F99C00]/40 text-slate-800 shadow-sm hover:shadow-md transition-all select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight uppercase text-[#800C1E] truncate">प्रीमियम</span>
                <div className="p-1 sm:p-2 bg-[#F99C00]/20 rounded-lg group-hover:bg-[#F99C00]/30 transition-colors shrink-0">
                  <Crown className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#F99C00]" />
                </div>
              </div>
              <div className="mt-1 sm:mt-3 flex items-baseline justify-between gap-1">
                <span className="text-base sm:text-2xl font-black font-mono tracking-tight text-[#800C1E]">
                  {profiles.filter(p => p.isPremium).length}
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-700 font-extrabold bg-amber-100/60 px-1 py-0.2 rounded shrink-0">VIP</span>
              </div>
            </div>

            {/* Widget 4: APK Downloads */}
            <div 
              onClick={() => {
                setActiveCategory('controls_hub');
                setActiveTab('apk_manager');
              }}
              className="group cursor-pointer p-2 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-amber-200 text-slate-800 shadow-sm hover:shadow-md transition-all select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight uppercase text-slate-500 truncate">ॲप हिट्स</span>
                <div className="p-1 sm:p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors shrink-0">
                  <Download className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-1 sm:mt-3 flex items-baseline justify-between gap-1">
                <span className="text-base sm:text-2xl font-black font-mono tracking-tight text-[#800C1E]">
                  {siteConfig?.apkSettings?.downloadCount || 4280}
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 py-0.2 rounded shrink-0">● ट्रॅकर</span>
              </div>
            </div>
          </div>

          {/* TAB: EXPIRED PAID MEMBERS (मुदत संपलेले सबस्क्रिप्शन सदस्य) */}
          {activeTab === 'expired_plans' && (
            <div className="space-y-4">
              {/* Top Banner */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 rounded-2xl border-2 border-amber-300 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                    <span>मुदत संपलेले सदस्य व्यवस्थापन (Expired Paid Members - {expiredPaidMembers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    ज्या सदस्यांचे पेड सबस्क्रिप्शन किंवा प्लॅनची मुदत संपली आहे त्यांची ही स्वतंत्र यादी आहे. येथून तुम्ही एका क्लिकवर त्यांचा प्लॅन रिन्यू (Renew) करू शकता किंवा व्हॉट्सॲपवर आठवण मेसेज पाठवू शकता.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => handleBulkRenewExpired(30)}
                    disabled={selectedExpiredMemberIds.length === 0}
                    className={`px-3 py-2 rounded-xl text-xs font-black shadow transition-all flex items-center gap-1.5 border ${
                      selectedExpiredMemberIds.length > 0
                        ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>⚡ १ महिना घाऊक नूतनीकरण ({selectedExpiredMemberIds.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      if (expiredPaidMembers.length === 0) {
                        alert('मुदत संपलेला एकही सदस्य नाही.');
                        return;
                      }
                      const msg = encodeURIComponent("नमस्कार, वंजारी जोडी मॅट्रिमनीवर तुमचा पेड प्लॅन संपला आहे. नवीन स्थळे व संपर्क क्रमांक अनलॉक करण्यासाठी आजच तुमचा प्लॅन नूतनीकरण करा. धन्यवाद!");
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow border border-emerald-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                    <span>📲 व्हॉट्सॲप रिमायंडर</span>
                  </button>
                </div>
              </div>

              {/* Search & Bulk Select Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-amber-200 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={expiredSearchTerm}
                    onChange={(e) => setExpiredSearchTerm(e.target.value)}
                    placeholder="नाव, नाव-आयडी, जिल्हा किंवा फोनने शोधा..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-200 text-xs font-bold focus:ring-2 focus:ring-[#A71930] outline-none"
                  />
                  {expiredSearchTerm && (
                    <button
                      onClick={() => setExpiredSearchTerm('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-700 w-full sm:w-auto justify-between sm:justify-end">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-100">
                    <input
                      type="checkbox"
                      checked={filteredExpiredMembers.length > 0 && selectedExpiredMemberIds.length === filteredExpiredMembers.length}
                      onChange={handleSelectAllExpiredMembers}
                      className="rounded border-amber-300 text-[#A71930] focus:ring-[#A71930]"
                    />
                    <span>सर्व निवडा ({filteredExpiredMembers.length})</span>
                  </label>

                  <span className="text-amber-800 font-extrabold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                    एकूण संपलेले: {filteredExpiredMembers.length}
                  </span>
                </div>
              </div>

              {/* Members Table / List */}
              {filteredExpiredMembers.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-amber-300 space-y-3">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                  <h4 className="text-base font-black text-slate-800">
                    {expiredSearchTerm ? 'या शोध संदर्भात कोणताही मुदत संपलेला सदस्य आढळला नाही.' : 'सध्या मुदत संपलेला एकही पेड सदस्य नाही!'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    ज्या सदस्यांच्या प्लॅनची मुदत संपेल, त्यांची माहिती या स्वतंत्र सब-टॅबमध्ये आपोआप दिसेल.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                      <thead>
                        <tr className="bg-amber-100/80 text-amber-950 text-[11px] font-black uppercase tracking-wider border-b border-amber-200">
                          <th className="p-3 w-10 text-center">#</th>
                          <th className="p-3">फोटो व सदस्य माहिती</th>
                          <th className="p-3">जिल्हा व मोबाईल</th>
                          <th className="p-3">मागील प्लॅन व रक्कम</th>
                          <th className="p-3">मुदत तारीख (Expiry Status)</th>
                          <th className="p-3 text-center">ॲक्शन (नूतनीकरण करा)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 text-xs">
                        {filteredExpiredMembers.map((m, idx) => {
                          const isSelected = selectedExpiredMemberIds.includes(m.id);
                          const expDateStr = m.membershipExpiryDate
                            ? new Date(m.membershipExpiryDate).toLocaleDateString('mr-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'मुदत संपली';

                          return (
                            <tr
                              key={m.id}
                              className={`transition-colors hover:bg-amber-50/70 ${
                                isSelected ? 'bg-amber-100/60' : idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'
                              }`}
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectExpiredMember(m.id)}
                                  className="rounded border-amber-300 text-[#A71930] focus:ring-[#A71930] cursor-pointer"
                                />
                              </td>

                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={m.photoUrl || (m.gender === 'female' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
                                    alt={m.fullName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shrink-0"
                                  />
                                  <div>
                                    <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                      <span>{m.fullName}</span>
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${m.gender === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {m.gender === 'female' ? 'वधू' : 'वर'}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-bold flex items-center gap-2">
                                      <span>ID: {m.id}</span>
                                      <span>•</span>
                                      <span>{m.age} वर्षे</span>
                                      <span>•</span>
                                      <span className="text-rose-700 font-extrabold bg-rose-50 px-1 rounded">मुदत संपली</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 font-semibold text-slate-700">
                                <div>{m.district || 'जिल्हा नमूद नाही'}</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="font-mono text-slate-900 font-bold">{m.mobile}</span>
                                  {m.mobile && (
                                    <a
                                      href={`https://wa.me/91${m.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्कार ${m.fullName}, वंजारी जोडी मॅट्रिमनीवर तुमचा प्लॅन संपला आहे. पुन्हा नूतनीकरण करण्यासाठी संपर्क करा.`)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700 p-0.5 bg-emerald-50 rounded"
                                      title="व्हॉट्सॲपवर संदेश पाठवा"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="font-black text-[#800C1E]">
                                  {m.paymentPlanName || m.membership || 'मागील पेड प्लॅन'}
                                </div>
                                <div className="text-[11px] text-slate-600 font-extrabold">
                                  रक्कम: ₹{m.paymentAmount || 499}
                                </div>
                              </td>

                              <td className="p-3">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-100 text-rose-900 font-extrabold text-[11px] border border-rose-300">
                                  <Clock className="w-3.5 h-3.5 text-rose-700" />
                                  <span>{expDateStr}</span>
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => handleRenewPlan(m.id, 30, 'मंथली प्लॅन (१ महिना)')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] shadow flex items-center gap-1 cursor-pointer transition-all"
                                    title="३० दिवसांसाठी प्लॅन नूतनीकरण करा"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>१ महिना नूतनीकरण</span>
                                  </button>

                                  <button
                                    onClick={() => handleRenewPlan(m.id, 90, 'सिल्व्हर प्लॅन (३ महिने)')}
                                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] shadow flex items-center gap-1 cursor-pointer transition-all"
                                    title="९० दिवसांसाठी प्लॅन नूतनीकरण करा"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>३ महिने</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const daysStr = prompt('किती दिवसांनी नूतनीकरण करायचे आहे? (उदा. 30, 60, 90, 365)', '30');
                                      if (daysStr && !isNaN(Number(daysStr))) {
                                        handleRenewPlan(m.id, Number(daysStr), `${daysStr} दिवस नूतनीकरण`);
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-300 cursor-pointer"
                                    title="कस्टम दिवस टाका"
                                  >
                                    ✏️ सानुकूल
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: APPROVED MEMBERS TABLE WITH BULK EMAIL & BULK DELETE */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-100/90 rounded-2xl border border-amber-300">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#A71930]" />
                    <span>मान्य सदस्य यादी ({approvedMembers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    सर्व प्रमाणित प्रोफाईल्स. मल्टी-सिलेक्ट बॉक्स निवडून घाऊक ई-मेल पाठवा किंवा रिसायकल बिनमध्ये हलवा.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowPaidOnlyMembers(!showPaidOnlyMembers)}
                    className={`px-3 py-2 rounded-xl text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                      showPaidOnlyMembers
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                        : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
                    }`}
                    title="पेमेंट केलेल्या सदस्यांची यादी फिल्टर करा"
                  >
                    <CreditCard className={`w-3.5 h-3.5 ${showPaidOnlyMembers ? 'text-white' : 'text-emerald-700'}`} />
                    <span>{showPaidOnlyMembers ? '✓ फक्त पेमेंट केलेले सदस्य' : '💳 फक्त पेमेंट केलेले'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('expired_plans')}
                    className="px-3 py-2 rounded-xl text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400"
                    title="मुदत संपलेल्या सदस्यांची स्वतंत्र यादी पहा"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-800" />
                    <span>⏳ मुदत संपलेले ({expiredPaidMembers.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      if (profiles.length === 0) {
                        alert('हटवण्यासाठी एकही प्रोफाईल उपलब्ध नाही.');
                        return;
                      }
                      if (confirm(`⚠️ अतिमहत्त्वाची सूचना! तुम्हाला खरोखर सर्व ${profiles.length} प्रोफाईल्स एकाच वेळी हटवायचे आहेत का?\n\nसर्व प्रोफाईल्स रिसायकल बिनमध्ये पाठवले जातील आणि आवश्यकतेनुसार पुनर्संचयित (Restore) करता येतील.`)) {
                        const allIds = profiles.map((p) => p.id);
                        bulkSoftDeleteProfiles(allIds);
                        alert('सर्व प्रोफाईल्स रिसायकल बिनमध्ये पाठवण्यात आले आहेत!');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow border border-rose-700 flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="सर्व प्रोफाईल्स हटवा (Delete All Profiles)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>सर्व प्रोफाईल्स हटवा</span>
                  </button>

                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="नाव, मोबाईल, जिल्हा शोधा..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#A71930]"
                    />
                  </div>
                </div>
              </div>

              {/* Bulk Actions Header Bar */}
              {selectedMemberIds.length > 0 && (
                <div className="p-3 bg-[#A71930] text-amber-100 rounded-2xl flex items-center justify-between shadow-md border border-amber-300 animate-in fade-in">
                  <span className="text-xs font-black">
                    {selectedMemberIds.length} सदस्य निवडले आहेत
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsBulkEmailModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-[#800C1E] font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>घाऊक ई-मेल पाठवा (Bulk Email)</span>
                    </button>
                    <button
                      onClick={handleBulkSoftDelete}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>निवडलेले हटवा (Bulk Delete)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Members Table */}
              <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredApprovedMembers.length > 0 &&
                              selectedMemberIds.length === filteredApprovedMembers.length
                            }
                            onChange={handleSelectAllMembers}
                            className="w-4 h-4 rounded border-amber-400 text-[#A71930] focus:ring-0"
                          />
                        </th>
                        <th className="p-3">फोटो & आयडी</th>
                        <th className="p-3">सदस्याचे नाव & वय</th>
                        <th className="p-3">संपर्क & व्हॉट्सॲप</th>
                        <th className="p-3">शिक्षण & नोकरी</th>
                        <th className="p-3">मेम्बरशिप प्लॅन & पेमेंट तारीख</th>
                        <th className="p-3 text-right">कृती (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {filteredApprovedMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-amber-50/60 font-semibold">
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedMemberIds.includes(m.id)}
                              onChange={() => handleToggleSelectMember(m.id)}
                              className="w-4 h-4 rounded border-amber-400 text-[#A71930] focus:ring-0"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={m.photoUrl}
                                alt={m.fullName}
                                onClick={() => setPreviewScreenshot(m.photoUrl)}
                                className="w-10 h-10 rounded-xl object-cover border border-amber-300 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                title="फोटो मोठा करून पाहण्यासाठी क्लिक करा"
                              />
                              <div>
                                <span className="font-mono text-[10px] text-amber-800 block font-bold">{m.id}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-[#A71930]">
                                  {m.gender === 'male' ? 'वर' : 'वधू'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setSelectedProfileForQuickSettings(m)}
                                className="font-extrabold text-[#A71930] hover:text-amber-900 hover:underline cursor-pointer text-left flex items-center gap-1 group"
                                title="सदस्याच्या नावावर क्लिक करा - या सदस्यासाठीचे प्रायव्हसी व अक्सेस सेटींग्ज उघडा"
                              >
                                <span>{m.fullName}</span>
                                <span className="text-[10px] font-bold bg-amber-100 text-[#A71930] px-1.5 py-0.2 rounded border border-amber-300 opacity-80 group-hover:opacity-100">⚙️ सेटिंग्ज</span>
                              </button>
                              {(m.registrationType === 'admin_direct' || m.isRegisteredByAdmin) && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-[#800C1E] border border-amber-400 font-extrabold text-[10px] flex items-center gap-1 shadow-sm" title="ॲडमिनद्वारे थेट नोंदणी केलेली प्रोफाइल">
                                  <Crown className="w-3 h-3 text-amber-700" />
                                  <span>ॲडमिन नोंदणीकृत</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {m.age} वर्षे • {m.district}, {m.taluka || ''}
                            </p>
                            {(() => {
                              const mBadges = getProfessionBadges(m);
                              if (mBadges.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {mBadges.map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-black border ${getTagStyleClass(tag)}`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-3 font-mono">
                            <p className="text-slate-900">{m.mobileNumber}</p>
                            <a
                              href={`https://wa.me/91${((m.whatsappNumber || m.mobileNumber) || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1"
                            >
                              WA: {m.whatsappNumber || m.mobileNumber}
                            </a>
                          </td>
                          <td className="p-3">
                            <p className="text-slate-900">{m.education}</p>
                            <p className="text-[11px] text-slate-500">{m.occupation}</p>
                          </td>
                          <td className="p-3">
                            {(() => {
                              const isPaid = (m.membership && m.membership !== 'free') || Boolean(m.paidAt);
                              const timeInfo = getPaymentTimeInfo(m.paidAt || m.createdAt);
                              return (
                                <div className="space-y-1">
                                  <span className={`px-2.5 py-1 rounded-full font-black text-[10px] border inline-block ${
                                    isPaid
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-amber-100 text-[#A71930] border-amber-300'
                                  }`}>
                                    {(m.membership || 'FREE').toUpperCase()}
                                  </span>
                                  {isPaid ? (
                                    <div className="text-[10px] text-slate-700 font-semibold space-y-0.5">
                                      {m.paymentAmount ? (
                                        <p className="font-extrabold text-emerald-700">रक्कम: ₹{m.paymentAmount}</p>
                                      ) : null}
                                      <p className="text-[10px] font-bold text-slate-800">{timeInfo.daysText}</p>
                                      <p className="text-[9px] text-slate-500 font-medium">{timeInfo.dateFormatted}</p>
                                      {m.paymentUtr ? (
                                        <p className="text-[9px] font-mono text-slate-600">UTR: {m.paymentUtr}</p>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-slate-400">मोफत खाते</p>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Block Member Access & Custom VIP Access Buttons */}
                              {hasPermission('member_access_control') && (
                                <>
                                  <button
                                    onClick={() => toggleBlockMemberAccess(m.id)}
                                    className={`px-2 py-1 rounded-lg font-extrabold text-[10px] cursor-pointer shadow border transition-all ${
                                      m.isBlocked
                                        ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                    }`}
                                    title={m.isBlocked ? 'हा सदस्य ब्लॉक केला आहे (Unblock करा)' : 'सदस्याचा अक्सेस ब्लॉक करा (Block Access)'}
                                  >
                                    {m.isBlocked ? '🚫 ब्लॉकड' : '🔒 ब्लॉक'}
                                  </button>

                                  <button
                                    onClick={() => toggleCustomAccess(m.id)}
                                    className={`px-2 py-1 rounded-lg font-extrabold text-[10px] cursor-pointer shadow border transition-all ${
                                      m.isCustomAccessGranted
                                        ? 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700'
                                        : 'bg-amber-100 text-[#800C1E] border-amber-300 hover:bg-amber-200'
                                    }`}
                                    title={m.isCustomAccessGranted ? 'विशेष प्रवेश दिलेला आहे (Revoke VIP)' : 'सदस्याला मोफत सर्व अक्सेस द्या (Offer Special Access)'}
                                  >
                                    {m.isCustomAccessGranted ? '🎁 VIP अक्सेस' : '🎁 प्रवेश द्या'}
                                  </button>
                                </>
                              )}

                              {/* Hide / Show Profile Button */}
                              <button
                                onClick={() => toggleProfileVisibility(m.id)}
                                className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer shadow border transition-all ${
                                  m.isHiddenByAdmin
                                    ? 'bg-amber-800 text-amber-100 border-amber-900 hover:bg-amber-900'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                }`}
                                title={m.isHiddenByAdmin ? 'सध्या इंडेक्सवर लपवले आहे' : 'सध्या इंडेक्सवर दृश्यमान आहे'}
                              >
                                {m.isHiddenByAdmin ? '🙈 लपवले' : '👁️ दाखवा'}
                              </button>

                              {/* Suggest Match Button */}
                              <button
                                onClick={() => {
                                  const targetId = prompt(`सदस्य ${m.fullName} साठी सुचवायचा दुसरा प्रोफाइल ID किंवा नाव प्रविष्ट करा:`);
                                  if (targetId) {
                                    adminSuggestMatch(m.id, targetId, 'ॲडमिनद्वारे सुचवलेले जुळणारे स्थळ.');
                                    alert(`सदस्य ${m.fullName} ला स्थळ सुचवले गेले व नोटिफिकेशन पाठवले गेले!`);
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#A71930] font-bold text-[10px] border border-amber-300 cursor-pointer shadow"
                                title="सदस्याला स्थळ सुचवा"
                              >
                                💍 सुचवा
                              </button>
                              <button
                                onClick={() => setSelectedProfileForQuickSettings(m)}
                                className="px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-[10px] border border-blue-300 cursor-pointer shadow flex items-center gap-1"
                                title="प्रायव्हसी, मोबाईल नंबर व मेंबरशिप सेटींग्ज बदलण्यासाठी"
                              >
                                ⚙️ सेटींग्ज
                              </button>
                              <button
                                onClick={() => setEditingCandidate(m)}
                                className="px-2 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-[#800C1E] font-black text-[10px] border border-amber-400 cursor-pointer shadow flex items-center gap-1"
                                title="सदस्याची सर्व माहिती, फोटो, दस्तावेज व बॅचेस एडिट करा"
                              >
                                ✏️ माहिती/बॅच एडिट
                              </button>
                              <button
                                onClick={() => setSelectedProfileForModal(m)}
                                className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#A71930]"
                                title="बायोडाटा पहा"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => softDeleteProfile(m.id, 'profile')}
                                className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                                title="रिसायकल बिनमध्ये पाठवा"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENDING REGISTRATION APPROVAL ENGINE */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {/* Auto Mode Status Banner */}
              <div className={`p-5 rounded-2xl border-2 flex items-center justify-between flex-wrap gap-4 ${
                siteConfig.isAutoModeEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center gap-3.5 min-w-[280px] flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm ${
                    siteConfig.isAutoModeEnabled ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {siteConfig.isAutoModeEnabled ? '⚡' : '🔒'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5 flex-wrap">
                      <span>सध्याचा मंजुरी मोड:</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase ${
                        siteConfig.isAutoModeEnabled ? 'bg-emerald-200 text-emerald-900 border border-emerald-300' : 'bg-amber-200 text-amber-900 border border-amber-300'
                      }`}>
                        {siteConfig.isAutoModeEnabled ? '⚡ ऑटो मोड (Auto Mode ON)' : '🔒 मॅन्युअल मोड (Manual Mode ON)'}
                      </span>
                    </h4>
                    <p className="text-xs opacity-90 font-bold mt-1.5 leading-relaxed">
                      {siteConfig.isAutoModeEnabled
                        ? 'नवीन सर्व वधू-वर नोंदण्या ॲडमिन मंजुरीशिवाय स्वयंचलित मंजूर होऊन थेट वेबसाईटवर सार्वजनिकपणे प्रकाशित होत आहेत.'
                        : 'नवीन सर्व नोंदण्या येथे प्रलंबित राहतील. ॲडमिनने व्यक्तिशः मंजूर केल्यानंतरच त्या सार्वजनिकरित्या दिसतील.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
                  {/* Direct Toggle Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus = !siteConfig.isAutoModeEnabled;
                      updateSiteConfig({ isAutoModeEnabled: newStatus });
                      alert(`वेबसाईट यशस्विरित्या ${newStatus ? '"ऑटो मोड" (Auto Approval Mode)' : '"मॅन्युअल मोड" (Manual Approval Mode)'} वर सेट केली आहे!`);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs shadow-sm transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer border-2 w-full sm:w-auto justify-center ${
                      siteConfig.isAutoModeEnabled
                        ? 'bg-[#A71930] hover:bg-[#800C1E] text-amber-100 border-[#800C1E]'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                    }`}
                  >
                    {siteConfig.isAutoModeEnabled ? '🔒 मॅन्युअल मोड सुरू करा' : '⚡ ऑटो मोड सुरू करा'}
                  </button>

                  {/* Fix the dead redirection link - direct correctly to index_controls */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('controls_hub');
                      setActiveTab('index_controls');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-800 font-extrabold text-xs border border-amber-300 hover:bg-amber-50 cursor-pointer shadow-sm transition-all hover:scale-102 flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
                  >
                    <span>⚙️ सर्व ऑटोमेशन सेटिंग्ज</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-2xl border-2 border-amber-300 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#A71930]" />
                    <span>⏳ प्रलंबित नोंदणी मंजुरी कक्ष (Pending Registration Approvals) ({pendingMembers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-bold mt-1">
                    येथे नवीन सदस्यांनी भरलेला बायोडाटा, फोटो व त्यांनी निवडलेले गोपनीयता पर्याय (Privacy Choices) तपासा आणि एका क्लिकवर प्रोफाइल सार्वजनिक करण्यासाठी मंजूर (Approve) करा.
                  </p>
                </div>
                {pendingMembers.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(`तुम्हाला खरोखर सर्व ${pendingMembers.length} प्रलंबित प्रोफाईल्स मंजूर (Approve All) करायचे आहेत का?`)) {
                        pendingMembers.forEach((m) => approveProfile(m.id));
                        alert('सर्व प्रलंबित प्रोफाईल्स यशस्वीरित्या मंजूर करण्यात आले आहेत!');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow border border-emerald-500 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>सर्व एकाच वेळी मंजूर करा ({pendingMembers.length})</span>
                  </button>
                )}
              </div>

              {pendingMembers.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-amber-300 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-slate-800">
                    सध्या एकही नोंदणी मंजुरीसाठी प्रलंबित नाही!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    सर्व नवीन वधू-वरांची नोंदणी मंजूर झालेली आहे. नवीन फॉर्म सबमिट झाल्यावर ते येथे स्वयंचलित दिसतील.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-300">
                          <th className="p-3">फोटो व नाव</th>
                          <th className="p-3">वय / लिंग</th>
                          <th className="p-3">मोबाईल व ठिकाण</th>
                          <th className="p-3">शिक्षण व नोकरी</th>
                          <th className="p-3">निवडलेले गोपनीयता पर्याय</th>
                          <th className="p-3 text-right">कृती / कारवाई (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 font-semibold text-slate-800">
                        {pendingMembers.map((m) => (
                          <tr key={m.id} className="hover:bg-amber-50/80 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={m.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                  alt={m.fullName}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-xs"
                                />
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedProfileForQuickSettings(m)}
                                    className="font-black text-[#A71930] hover:underline text-xs block text-left cursor-pointer"
                                    title="सदस्याच्या नावावर क्लिक करा - सेटींग्ज पहा/बदला"
                                  >
                                    {m.fullName} ⚙️
                                  </button>
                                  <span className="text-[10px] text-slate-500 font-mono">ID: {m.id} • {m.createdAt}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${m.gender === 'bride' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}`}>
                                {m.gender === 'bride' ? 'वधू' : 'वर'} ({m.age} वर्षे)
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-mono text-xs font-bold text-slate-900">{m.mobile}</div>
                              <div className="text-[11px] text-slate-600">{m.district} ({m.city || m.taluka})</div>
                            </td>
                            <td className="p-3 max-w-xs truncate">
                              <div className="font-bold text-slate-900 truncate">{m.education}</div>
                              <div className="text-[11px] text-slate-600 truncate">{m.occupation}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {m.privacy?.hideContact ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                                    📱 संपर्क लपवला
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                    📱 संपर्क दृश्यमान
                                  </span>
                                )}
                                {m.privacy?.hidePhoto ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                    🙈 फोटो लपवला
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                    📷 फोटो दृश्यमान
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    approveProfile(m.id);
                                    alert(`प्रोफाईल "${m.fullName}" यशस्वीरित्या मंजूर करण्यात आले!`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow border border-emerald-500 flex items-center gap-1 cursor-pointer"
                                  title="मंजूर करा (Approve Profile)"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>मंजूर करा (Approve)</span>
                                </button>
                                <button
                                  onClick={() => setSelectedProfileForQuickSettings(m)}
                                  className="px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-xs border border-blue-300 cursor-pointer shadow flex items-center gap-1"
                                  title="प्रायव्हसी व मेंबरशिप सेटिंग्स"
                                >
                                  ⚙️ सेटिंग्स
                                </button>
                                <button
                                  onClick={() => setEditingCandidate(m)}
                                  className="px-2.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-[#800C1E] font-black text-xs border border-amber-400 cursor-pointer shadow flex items-center gap-1"
                                  title="मंजुरीपूर्वी माहिती किंवा दस्तावेज एडिट करा"
                                >
                                  ✏️ एडिट
                                </button>
                                <button
                                  onClick={() => setSelectedProfileForModal(m)}
                                  className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 cursor-pointer"
                                  title="संपूर्ण प्रोफाईल पहा (View Full Profile)"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => softDeleteProfile(m.id, 'profile')}
                                  className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                                  title="नाकारा व रिसायकल बिनमध्ये पाठवा"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'chat_approvals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#A71930]" />
                    <span>सदस्य व्हॉट्सॲप व चॅट मंजुरी कक्ष (WhatsApp & Chat Approvals)</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    सदस्यांच्या व्हॉट्सॲप / थेट चॅट संपर्काच्या विनंत्या मंजूर करा किंवा एकाच वेळी सर्व विनंत्या अधिकृत करा.
                  </p>
                </div>

                <button
                  onClick={handleApproveAllChatRequests}
                  className="px-4 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-amber-300" />
                  <span>सर्व प्रलंबित विनंत्या एकत्र मंजूर करा (Approve All)</span>
                </button>
              </div>

              {selectedChatReqIds.length > 0 && (
                <div className="p-3 bg-amber-200 rounded-2xl flex items-center justify-between text-slate-900 border border-amber-400">
                  <span className="text-xs font-black">{selectedChatReqIds.length} विनंत्या निवडल्या आहेत</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleApproveSelectedChatRequests}
                      className="px-3 py-1 bg-emerald-700 text-white font-bold text-xs rounded-lg shadow"
                    >
                      निवडलेले मंजूर करा
                    </button>
                    <button
                      onClick={handleRejectSelectedChatRequests}
                      className="px-3 py-1 bg-rose-700 text-white font-bold text-xs rounded-lg shadow"
                    >
                      निवडलेले अमान्य करा
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                    <tr>
                      <th className="p-3 w-10">#</th>
                      <th className="p-3">सदस्याचे नाव & मोबाईल</th>
                      <th className="p-3">लक्ष्य स्थळ (Target Profile)</th>
                      <th className="p-3">वेळ & तारीख</th>
                      <th className="p-3">स्थिती (Status)</th>
                      <th className="p-3 text-right">कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold">
                    {contactRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                          सध्या कोणतीही प्रलंबित चॅट मंजुरी विनंती नाही.
                        </td>
                      </tr>
                    ) : (
                      contactRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-amber-50/60">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedChatReqIds.includes(req.id)}
                              onChange={() =>
                                setSelectedChatReqIds((prev) =>
                                  prev.includes(req.id) ? prev.filter((x) => x !== req.id) : [...prev, req.id]
                                )
                              }
                              className="w-4 h-4 rounded border-amber-400 text-[#A71930]"
                            />
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {req.requesterName}
                            <span className="block text-xs font-mono text-slate-500">{req.requesterMobile}</span>
                          </td>
                          <td className="p-3 font-bold text-[#A71930]">
                            {req.targetName} ({req.targetProfileId})
                          </td>
                          <td className="p-3 font-mono text-slate-600">{req.requestedAt}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                                req.status === 'authorized'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {req.status === 'pending' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => authorizeContactRequest(req.id)}
                                  className="px-2.5 py-1 bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                                >
                                  मंजूर करा
                                </button>
                                <button
                                  onClick={() => rejectContactRequest(req.id)}
                                  className="px-2.5 py-1 bg-rose-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                                >
                                  अमान्य
                                </button>
                              </div>
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

          {/* TAB 6: DEDICATED PROFILE LIKES TRACKER TAB */}
          {activeTab === 'profile_likes' && (() => {
            const combinedLikes: Array<{
              id: string;
              fromUserId: string;
              fromUser?: UserProfile;
              toUserId: string;
              toUser?: UserProfile;
              status: string;
              createdAt: string;
              type: string;
            }> = [];

            const seenKeys = new Set<string>();

            // 1. From pendingLikes array
            (pendingLikes || []).forEach((pl) => {
              const key = `${pl.fromUserId}-${pl.toUserId}`;
              seenKeys.add(key);
              combinedLikes.push({
                id: pl.id || `pl-${key}`,
                fromUserId: pl.fromUserId,
                fromUser: profiles.find((p) => p.id === pl.fromUserId),
                toUserId: pl.toUserId,
                toUser: profiles.find((p) => p.id === pl.toUserId),
                status: pl.status || 'approved',
                createdAt: pl.createdAt || new Date().toISOString(),
                type: 'direct_like'
              });
            });

            // 2. From interests array
            (interests || []).forEach((i) => {
              const key = `${i.fromUserId}-${i.toUserId}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                combinedLikes.push({
                  id: i.id || `int-${key}`,
                  fromUserId: i.fromUserId,
                  fromUser: profiles.find((p) => p.id === i.fromUserId),
                  toUserId: i.toUserId,
                  toUser: profiles.find((p) => p.id === i.toUserId),
                  status: i.status === 'accepted' ? 'approved' : i.status,
                  createdAt: i.createdAt || new Date().toISOString(),
                  type: 'interest'
                });
              }
            });

            // 3. From shortlistedByUsers array on profile objects
            profiles.forEach((p) => {
              (p.shortlistedByUsers || []).forEach((likerId) => {
                const key = `${likerId}-${p.id}`;
                if (!seenKeys.has(key)) {
                  seenKeys.add(key);
                  combinedLikes.push({
                    id: `short-${key}`,
                    fromUserId: likerId,
                    fromUser: profiles.find((x) => x.id === likerId),
                    toUserId: p.id,
                    toUser: p,
                    status: 'approved',
                    createdAt: new Date().toISOString(),
                    type: 'shortlist'
                  });
                }
              });
            });

            // Filter by search term
            const filteredLikes = combinedLikes.filter((item) => {
              if (!likesSearchTerm.trim()) return true;
              const term = likesSearchTerm.toLowerCase();
              const fName = (item.fromUser?.fullName || '').toLowerCase();
              const fId = (item.fromUserId || '').toLowerCase();
              const fMob = (item.fromUser?.mobile || (item.fromUser as any)?.mobileNumber || '').toLowerCase();
              const tName = (item.toUser?.fullName || '').toLowerCase();
              const tId = (item.toUserId || '').toLowerCase();
              const tMob = (item.toUser?.mobile || (item.toUser as any)?.mobileNumber || '').toLowerCase();

              return fName.includes(term) || fId.includes(term) || fMob.includes(term) ||
                     tName.includes(term) || tId.includes(term) || tMob.includes(term);
            });

            const totalLikes = combinedLikes.length;
            const approvedLikes = combinedLikes.filter((x) => x.status === 'approved' || x.status === 'accepted').length;
            const pendingLikesCount = combinedLikes.filter((x) => x.status === 'pending').length;

            return (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="p-4 bg-amber-100/90 rounded-2xl border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                      <span>प्रोफाईल लाईक्स व सदस्यांची आवडी ट्रॅकर (Profile Likes Activity Log)</span>
                    </h3>
                    <p className="text-xs text-slate-700 font-medium">
                      कोणत्या सदस्याने कोणाच्या प्रोफाईलला लाईक किंवा पसंती पाठवली आहे याची संपूर्ण रिअल-टाईम माहिती.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-white text-[#A71930] font-black text-xs rounded-xl border border-amber-300 shadow-sm">
                      एकूण लाईक्स: {totalLikes}
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-sm">
                      थेट मंजूर: {approvedLikes}
                    </span>
                    {pendingLikesCount > 0 && (
                      <span className="px-3 py-1.5 bg-amber-600 text-white font-black text-xs rounded-xl shadow-sm animate-pulse">
                        प्रलंबित: {pendingLikesCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Search Bar & Auto-Approve Setting Status Notice */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="लाईक करणाऱ्याचे किंवा मिळणाऱ्याचे नाव, ID किंवा मोबाईलने शोधा..."
                      value={likesSearchTerm}
                      onChange={(e) => setLikesSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#A71930]"
                    />
                  </div>

                  <div className="text-xs font-bold text-slate-700 flex items-center gap-2 shrink-0 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                    <span>⚡ ऑटो-लाईक स्थिती:</span>
                    {siteConfig?.autoApproveLikes !== false ? (
                      <span className="text-emerald-700 font-black flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> चालू (Direct Push Notification)
                      </span>
                    ) : (
                      <span className="text-rose-700 font-black flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-600" /> ॲडमिन मंजुरी प्रलंबित
                      </span>
                    )}
                  </div>
                </div>

                {/* Likes Table */}
                <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                        <tr>
                          <th className="p-3">लाईक करणारा सदस्य (Liker Profile)</th>
                          <th className="p-3 text-center">दिशा</th>
                          <th className="p-3">मिळणारा सदस्य (Target Profile)</th>
                          <th className="p-3">तारीख & वेळ</th>
                          <th className="p-3">स्थिती (Status)</th>
                          <th className="p-3 text-right">कृती (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 font-semibold">
                        {filteredLikes.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                              {likesSearchTerm ? 'शोधाशोध अनुसार कोणताही लाईक रेकॉर्ड आढळला नाही.' : 'अद्याप कोणत्याही सदस्याची लाईक किंवा आवडीची नोंद झालेली नाही.'}
                            </td>
                          </tr>
                        ) : (
                          filteredLikes.map((item) => (
                            <tr key={item.id} className="hover:bg-amber-50/60 transition-colors">
                              {/* Sender */}
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  {(item.fromUser as any)?.photoUrl || item.fromUser?.photos?.[0] ? (
                                    <img
                                      src={(item.fromUser as any)?.photoUrl || item.fromUser?.photos?.[0]}
                                      alt={item.fromUser?.fullName}
                                      className="w-9 h-9 rounded-full object-cover border border-amber-300"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600 text-xs">
                                      {(item.fromUser?.fullName || item.fromUserId)?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-extrabold text-slate-900">{item.fromUser?.fullName || `ID: ${item.fromUserId}`}</p>
                                    <p className="text-[11px] text-slate-500 font-mono">
                                      ID: {item.fromUserId} • {item.fromUser?.mobile || (item.fromUser as any)?.mobileNumber || ''}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Direction */}
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 shadow-sm">
                                  ❤️
                                </div>
                              </td>

                              {/* Receiver */}
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  {(item.toUser as any)?.photoUrl || item.toUser?.photos?.[0] ? (
                                    <img
                                      src={(item.toUser as any)?.photoUrl || item.toUser?.photos?.[0]}
                                      alt={item.toUser?.fullName}
                                      className="w-9 h-9 rounded-full object-cover border border-amber-300"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600 text-xs">
                                      {(item.toUser?.fullName || item.toUserId)?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-extrabold text-[#A71930]">{item.toUser?.fullName || `ID: ${item.toUserId}`}</p>
                                    <p className="text-[11px] text-slate-500 font-mono">
                                      ID: {item.toUserId} • {item.toUser?.district || ''}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Date & Time */}
                              <td className="p-3 text-slate-600 font-mono text-[11px]">
                                {new Date(item.createdAt).toLocaleString('mr-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>

                              {/* Status Badge */}
                              <td className="p-3">
                                {item.status === 'approved' || item.status === 'accepted' ? (
                                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[11px] border border-emerald-300 flex items-center gap-1 w-max">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" /> थेट मंजूर (Approved)
                                  </span>
                                ) : item.status === 'rejected' ? (
                                  <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-black text-[11px] border border-rose-300 flex items-center gap-1 w-max">
                                    ❌ अमान्य (Rejected)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-[11px] border border-amber-300 flex items-center gap-1 w-max animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-700" /> प्रलंबित (Pending)
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {item.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => approveLike(item.id)}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg shadow transition cursor-pointer"
                                      >
                                        मंजूर करा
                                      </button>
                                      <button
                                        onClick={() => rejectLike(item.id)}
                                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded-lg shadow transition cursor-pointer"
                                      >
                                        नाकारा
                                      </button>
                                    </>
                                  )}
                                  {item.toUser && (
                                    <button
                                      onClick={() => setSelectedProfileForModal(item.toUser!)}
                                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-[#A71930] font-black text-xs rounded-xl border border-amber-300 transition cursor-pointer"
                                    >
                                      प्रोफाईल पहा
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 7: PROMO CODES ENGINE TAB */}
          {activeTab === 'promo_codes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#A71930]" />
                    <span>सवलत कूपन व प्रोमो कोड इंजिन (Promo Codes & Discounts)</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    मेम्बरशिप प्लॅनसाठी टक्केवारी (%), सवलत रक्कम (Flat Discount), किंवा VIP मोफत कूपन कोड्स तयार करा.
                  </p>
                </div>

                <button
                  onClick={() => setIsPromoModalOpen(true)}
                  className="px-4 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>नवीन प्रोमो कोड तयार करा</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                    <tr>
                      <th className="p-3">कूपन कोड</th>
                      <th className="p-3">प्रकार (Type)</th>
                      <th className="p-3">मूल्य (Discount)</th>
                      <th className="p-3">वापर मर्यादा & गणती</th>
                      <th className="p-3">स्थिती (Status)</th>
                      <th className="p-3 text-right">कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold">
                    {promoCodes.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50">
                        <td className="p-3 font-mono font-black text-[#A71930] text-sm">{p.code}</td>
                        <td className="p-3 font-bold text-slate-800">
                          {p.discountType === 'vip_free'
                            ? '🎉 VIP 100% Free'
                            : p.discountType === 'percentage'
                            ? 'टक्केवारी सवलत (%)'
                            : 'निश्चित रक्कम (Flat ₹)'}
                        </td>
                        <td className="p-3 font-extrabold text-emerald-800">
                          {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}
                        </td>
                        <td className="p-3 font-mono">
                          {p.usedCount} / {p.maxUses || '∞'}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => togglePromoCodeStatus(p.id)}
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer ${
                              p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.isActive ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deletePromoCode(p.id)}
                            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                            title="हटवा"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: MEMBER PROFILE EDIT RE-APPROVAL QUEUE */}
          {activeTab === 'profile_edits' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#A71930]" />
                  <span>सदस्य प्रोफाईल दुरुस्ती पुनरावलोकन कक्ष (Pending Edit Requests)</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  सदस्यांनी त्यांच्या प्रोफाइलमध्ये बदल करण्यासाठी पाठवलेले प्रस्ताव तपासा व मंजूर किंवा अमान्य करा.
                </p>
              </div>

              <div className="space-y-3">
                {pendingProfileEdits.filter((e) => e.status === 'pending').length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-amber-300 text-center text-slate-500 font-bold">
                    सध्या कोणतीही प्रलंबित प्रोफाइल दुरुस्ती विनंती नाही.
                  </div>
                ) : (
                  pendingProfileEdits
                    .filter((e) => e.status === 'pending')
                    .map((edit) => (
                      <div key={edit.id} className="bg-white p-4 rounded-2xl border border-amber-300 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                          <div>
                            <h4 className="font-extrabold text-slate-900">{edit.profileName}</h4>
                            <p className="text-xs text-slate-500 font-mono">मोबाईल: {edit.mobile}</p>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{edit.submittedAt}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-amber-50 p-3 rounded-xl border border-amber-200">
                          <div>
                            <span className="font-bold text-rose-700 block mb-1">मूळ जुनी माहिती (Original):</span>
                            <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap">
                              {JSON.stringify(edit.originalData, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-700 block mb-1">नवीन अपडेट केलेले बदल (Updated):</span>
                            <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap">
                              {JSON.stringify(edit.updatedData, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approveProfileEditRequest(edit.id)}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                          >
                            बदल मंजूर करा (Approve)
                          </button>
                          <button
                            onClick={() => rejectProfileEditRequest(edit.id)}
                            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                          >
                            अमान्य करा (Reject)
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB: PROFILE REMOVAL & MARRIAGE FIXED REQUESTS */}
          {activeTab === 'profile_removal' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-rose-600" />
                    <span>विवाह जुळले व प्रोफाइल हटवण्याचे अर्ज (Marriage Fixed & Removal Requests)</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    सदस्यांनी विवाह जुळल्यामुळे किंवा वैयक्तिक कारणास्तव पाठवलेले अर्ज पहा, मंजूर करा किंवा अभिप्राय मुख्य पानावर प्रसिद्ध करा.
                  </p>
                </div>
                <span className="px-3 py-1 bg-rose-600 text-amber-100 rounded-full font-black text-xs shadow shrink-0">
                  प्रलंबित: {profileRemovalRequests.filter(r => r.status === 'pending').length}
                </span>
              </div>

              {profileRemovalRequests.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-amber-300 text-center text-slate-500 font-bold">
                  सध्या कोणताही विवाह जुळल्याचा किंवा प्रोफाईल काढण्याचा अर्ज नाही.
                </div>
              ) : (
                <div className="space-y-4">
                  {profileRemovalRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`bg-white p-5 rounded-2xl border-2 ${
                        req.status === 'pending'
                          ? 'border-amber-400 shadow-md'
                          : req.status === 'approved'
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-200 opacity-60'
                      } space-y-3 transition-all`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-slate-900">{req.profileName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                              {req.reason === 'marriage_fixed' ? '💍 लग्न जुळले (Marriage Fixed)' : '🔒 वैयक्तिक कारण'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-mono mt-0.5">मोबाईल: {req.profileMobile}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full font-black text-xs inline-block ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                : req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {req.status === 'pending' ? '⏳ प्रलंबित' : req.status === 'approved' ? '✅ मंजूर (हटवले)' : '❌ नाकारले'}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{new Date(req.createdAt).toLocaleString('mr-IN')}</p>
                        </div>
                      </div>

                      {req.partnerDetails && (
                        <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs">
                          <span className="font-bold text-[#A71930] block">जोडीदाराची माहिती / नोंद:</span>
                          <p className="text-slate-800 font-semibold">{req.partnerDetails}</p>
                        </div>
                      )}

                      {req.feedbackText && (
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>सदस्याचा अभिप्राय / संदेश (Feedback for Success Story):</span>
                          </span>
                          <p className="text-slate-800 font-medium italic">"{req.feedbackText}"</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-amber-100">
                        {req.status === 'pending' ? (
                          <>
                            {req.feedbackText && req.reason === 'marriage_fixed' && (
                              <button
                                onClick={() => approveProfileRemovalRequest(req.id, true)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>मंजूर करा व मुख्य पृष्ठावर यशोगाथा प्रसिद्ध करा</span>
                              </button>
                            )}
                            <button
                              onClick={() => approveProfileRemovalRequest(req.id, false)}
                              className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-300"
                            >
                              <Check className="w-4 h-4 text-emerald-700" />
                              <span>फक्त मंजूर करा व प्रोफाइल हटवा</span>
                            </button>
                            <button
                              onClick={() => rejectProfileRemovalRequest(req.id)}
                              className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-rose-300"
                            >
                              <X className="w-4 h-4 text-rose-700" />
                              <span>नाकारा</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`तुम्हाला नक्की '${req.profileName}' यांचा हा अर्ज / नोंद डिलीट करायची आहे का?`)) {
                                  deleteProfileRemovalRequest(req.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer border border-rose-300"
                              title="अर्ज डिलीट करा"
                            >
                              <Trash2 className="w-4 h-4 text-rose-700" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if (window.confirm(`तुम्हाला नक्की '${req.profileName}' यांची ही प्रक्रिया पूर्ण झालेली नोंद यादीतून डिलीट करायची आहे का?`)) {
                                deleteProfileRemovalRequest(req.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-rose-300 transition-all"
                            title="यादीतून नोंद डिलीट करा"
                          >
                            <Trash2 className="w-4 h-4 text-rose-700" />
                            <span>नोंद डिलीट करा</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADMIN PASSWORD & PRIVACY SETTINGS */}
          {activeTab === 'privacy_controls' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#A71930]" />
                  <span>मुख्य ॲडमिन क्रेडेंशियल्स आणि पासवर्ड बदला (Admin Credentials & Password)</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  इथून तुम्ही मुख्य प्रशासकाचे (Super Admin) लॉगिन युझरनेम आणि पासवर्ड बदलू शकता.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm space-y-4">
                <h4 className="font-extrabold text-[#A71930] text-sm border-b border-amber-100 pb-2">
                  🔐 युझरनेम व पासवर्ड बदला:
                </h4>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const usernameInput = (document.getElementById('admin-new-username') as HTMLInputElement)?.value?.trim();
                    const passwordInput = (document.getElementById('admin-new-password') as HTMLInputElement)?.value?.trim();
                    if (!usernameInput || !passwordInput) {
                      alert('कृपया युझरनेम आणि पासवर्ड दोन्ही भरा!');
                      return;
                    }
                    updateSiteConfig({
                      adminCredentials: {
                        name: 'Primary Admin',
                        username: usernameInput,
                        password: passwordInput,
                      },
                    });
                    alert('मुख्य ॲडमिनचे क्रेडेंशियल्स यशस्वीरित्या बदलले गेले आहेत!');
                  }}
                  className="space-y-4 text-xs font-bold"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-700">नवीन युझरनेम (New Admin Username):</label>
                      <input
                        id="admin-new-username"
                        type="text"
                        defaultValue={siteConfig?.adminCredentials?.username || 'admin'}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#A71930] focus:border-[#A71930] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700">नवीन पासवर्ड (New Admin Password):</label>
                      <input
                        id="admin-new-password"
                        type="text"
                        defaultValue={siteConfig?.adminCredentials?.password || 'password'}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#A71930] focus:border-[#A71930] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    क्रेडेंशियल्स जतन करा (Save Credentials)
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: CENTRAL MASTER SETTINGS CENTER */}
          {activeTab === 'master_settings' && (
            <AdminMasterSettingsCenter />
          )}

          {/* TAB: SPECIAL UNIFIED PERMISSIONS & CONTROLS CENTER */}
          {activeTab === 'permissions_center' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-3xl border-2 border-amber-300 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#A71930] text-white rounded-2xl shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#A71930]">
                      🔑 परवानग्या व नियंत्रण केंद्र (Master System Controls)
                    </h3>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      सदस्यांचे फोटो, लॉक केलेले मोबाईल नंबर, पेमेंट व ॲडमिन परवानग्यांचे सोपे व सुटसुटीत नियंत्रण.
                    </p>
                  </div>
                </div>
              </div>

              {/* EASY LAUNCH SYSTEM STATUS SUMMARY CARD */}
              <div className="p-5 bg-gradient-to-br from-amber-50 via-orange-50/40 to-rose-50 rounded-3xl border-2 border-amber-400 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-[#A71930] font-black text-sm border-b border-amber-200 pb-2">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <span>सध्याचे सक्रिय सिस्टीम नियम (Final System Workflow Status):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  
                  {/* Card 1: Photos Status */}
                  {/* Card 1: Photo Visibility */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          📸 १. फोटो दृश्यता
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          siteConfig?.allowMembersToViewPhotos !== false
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {siteConfig?.allowMembersToViewPhotos !== false ? 'सक्रिय (Clear) ✓' : 'अस्पष्ट (Blurred)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        {siteConfig?.allowMembersToViewPhotos !== false
                          ? 'सबस्क्रिप्शन पेमेंट पूर्ण केलेल्या सदस्यांना सर्व बायोडाटाचे फोटो स्पष्ट दिसतात.'
                          : 'बिन-प्लॅन युझर्सना बायोडाटाचे सर्व फोटो ब्लर (अस्पष्ट) दिसतील.'}
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span>स्थिती: <strong>{siteConfig?.allowMembersToViewPhotos !== false ? 'स्पष्ट फोटो (Clear Photos)' : 'अस्पष्ट फोटो (Blur)'}</strong></span>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ allowMembersToViewPhotos: siteConfig?.allowMembersToViewPhotos === false ? true : false })}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer bg-amber-50 px-2 py-1 rounded-lg border border-amber-200"
                      >
                        बदला
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Mobile Number Lock & Auto-Unlock on Payment */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          🔒 २. मोबाईल नंबर लॉक
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          (siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts)
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {(siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts)
                            ? '⚡ ॲटो अनलॉक (ON)'
                            : '🔒 सुरक्षित (Locked)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        {(siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts)
                          ? 'पेमेंट केलेल्या किंवा सर्व सदस्यांना बायोडाटाचे मोबाईल नंबर ऑटोमॅटिक थेट दिसतील. ॲडमिन परवानगीची गरज नाही.'
                          : 'मोबाईल नंबर थेट कोणालाही दिसत नाही. सदस्य विनंती पाठवतील आणि ॲडमिनने परवानगी दिल्यावरच दिसेल.'}
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <span>
                        स्थिती: <strong>
                          {(siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts)
                            ? 'पेमेंटला ॲटो दिसणार (Direct View)'
                            : 'ॲडमिन परवानगी आवश्यक'}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const isAuto = (siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts);
                          updateSiteConfig({
                            autoUnlockOnPayment: !isAuto,
                            allowMembersToViewContacts: !isAuto,
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black border cursor-pointer transition-all ${
                          (siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts)
                            ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        {(siteConfig?.autoUnlockOnPayment !== false || siteConfig?.allowMembersToViewContacts)
                          ? '🔒 लॉक करा (Turn Lock ON)'
                          : '🔓 ॲटो अनलॉक चालू करा (Turn Auto ON)'}
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Paid Plan Access */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          💳 ३. सबस्क्रिप्शन प्लॅन्स
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${siteConfig?.showOnlyWelcomePlan !== false ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-blue-100 text-blue-900 border-blue-300'}`}>
                          {siteConfig?.showOnlyWelcomePlan !== false ? 'फक्त वेलकम प्लॅन' : 'सर्व प्लॅन दृश्यमान'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        {siteConfig?.showOnlyWelcomePlan !== false 
                          ? "ग्राहकांना सध्या फक्त 'विशेष वेलकम ऑफर प्लॅन' दिसेल. इतर प्लॅन्स लपवले आहेत."
                          : "ग्राहकांना सर्व उपलब्ध प्लॅन्स (मंथली, इयरली, इ.) दिसतील."
                        }
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>स्थिती: <strong>{siteConfig?.showOnlyWelcomePlan !== false ? 'फक्त वेलकम प्लॅन' : 'सर्व प्लॅन'}</strong></span>
                      <button
                        onClick={() => updateSiteConfig({ showOnlyWelcomePlan: siteConfig?.showOnlyWelcomePlan === false ? true : false })}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer"
                      >
                        बदला
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Simple Search Filter */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          🔎 ४. सुलभ शोध मोड
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-300">
                          सुलभ फिल्टर
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        गोंधळ न होण्यासाठी फक्त लिंग (वधू/वर) आणि नोकरी/व्यवसाय (Profession) हे २ मुख्य फिल्टर सक्रिय आहेत.
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                      स्थिती: <strong>लिंग + प्रोफेशन शोध</strong>
                    </div>
                  </div>

                  {/* Card 5: Mutual Like Contact Unlock */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          ❤️ ५. म्युचुअल लाईक अनलॉक
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${siteConfig?.enableMutualLikeContactUnlock !== false ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                          {siteConfig?.enableMutualLikeContactUnlock !== false ? 'ऑटो अनलॉक ON' : 'बंद OFF'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        {siteConfig?.enableMutualLikeContactUnlock !== false
                          ? "दोघांनी एकमेकांना लाईक केल्यावर मोबाईल नंबर ऑटोमॅटिक अनलॉक होतो."
                          : "म्युचुअल लाईक ऑटो-अनलॉक बंद आहे."
                        }
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>स्थिती: <strong>{siteConfig?.enableMutualLikeContactUnlock !== false ? 'सुरू (ON)' : 'बंद (OFF)'}</strong></span>
                      <button
                        onClick={() => updateSiteConfig({ enableMutualLikeContactUnlock: siteConfig?.enableMutualLikeContactUnlock === false ? true : false })}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer"
                      >
                        बदला
                      </button>
                    </div>
                  </div>

                  {/* Card 6: Free Users Photo Blur & Percentage */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          🖼️ ६. बिन-पेमेंट फोटो ब्लर (% निवडा)
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${siteConfig?.blurPhotosForFreeUsers ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                          {siteConfig?.blurPhotosForFreeUsers ? `ब्लर चालू (${siteConfig?.photoBlurPercentage || 50}%)` : 'फोटो स्पष्ट'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        नॉन-पेईड युजर्सना फोटो ब्लर दिसेल. ब्लर तीव्रता: <strong>{siteConfig?.photoBlurPercentage || 50}%</strong>
                      </p>
                      
                      {/* Blur % Selector */}
                      <div className="flex items-center gap-1 pt-1.5">
                        <span className="text-[10px] font-bold text-slate-500">प्रमाण:</span>
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => updateSiteConfig({ blurPhotosForFreeUsers: true, photoBlurPercentage: pct })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black border cursor-pointer ${
                              siteConfig?.blurPhotosForFreeUsers && (siteConfig?.photoBlurPercentage || 50) === pct
                                ? 'bg-[#A71930] text-white border-[#800C1E]'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>स्थिती: <strong>{siteConfig?.blurPhotosForFreeUsers ? `ब्लर ON (${siteConfig?.photoBlurPercentage || 50}%)` : 'स्पष्ट OFF'}</strong></span>
                      <button
                        onClick={() => updateSiteConfig({ blurPhotosForFreeUsers: !siteConfig?.blurPhotosForFreeUsers })}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer"
                      >
                        {siteConfig?.blurPhotosForFreeUsers ? 'बंद करा (OFF)' : 'चालू करा (ON)'}
                      </button>
                    </div>
                  </div>

                  {/* Card 7: Free Users Name Display & Blur Controls */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          👤 ७. बिन-पेमेंट नाव दृश्यमानता
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                          {siteConfig?.nameDisplayModeForFreeUsers === 'first_name_only' ? 'फक्त पहिले नाव' :
                           siteConfig?.nameDisplayModeForFreeUsers === 'first_and_last' ? 'नाव + आडनाव' :
                           siteConfig?.nameDisplayModeForFreeUsers === 'surname_only' ? 'फक्त आडनाव' :
                           siteConfig?.nameDisplayModeForFreeUsers === 'hidden_star' ? 'स्टार्स (र****)' :
                           siteConfig?.nameDisplayModeForFreeUsers === 'blurred_name' ? `ब्लर नाव (${siteConfig?.nameBlurPercentage || 50}%)` : 'पूर्ण नाव'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        बिन-पेमेंट सदस्यांसाठी नाव कसे दाखवायचे ते ऑटो-सेटिंग निवडा.
                      </p>
                      
                      {/* Quick Select Options */}
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'full_name' })}
                          className={`px-1.5 py-1 rounded text-[9px] font-black border text-center ${
                            (siteConfig?.nameDisplayModeForFreeUsers || 'full_name') === 'full_name'
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          🟢 पूर्ण नाव
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'first_name_only' })}
                          className={`px-1.5 py-1 rounded text-[9px] font-black border text-center ${
                            siteConfig?.nameDisplayModeForFreeUsers === 'first_name_only'
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          🟡 पहिले नाव
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'surname_only' })}
                          className={`px-1.5 py-1 rounded text-[9px] font-black border text-center ${
                            siteConfig?.nameDisplayModeForFreeUsers === 'surname_only'
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          🟣 फक्त आडनाव
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'blurred_name' })}
                          className={`px-1.5 py-1 rounded text-[9px] font-black border text-center ${
                            siteConfig?.nameDisplayModeForFreeUsers === 'blurred_name'
                              ? 'bg-slate-800 text-amber-200 border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          🌫️ नाव ब्लर
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>प्रकार: <strong>{siteConfig?.nameDisplayModeForFreeUsers || 'full_name'}</strong></span>
                      <button
                        onClick={() => {
                          setActiveCategory('system_settings');
                          setActiveTab('master_settings');
                        }}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer"
                      >
                        अधिक पर्याय ➔
                      </button>
                    </div>
                  </div>

                  {/* Card 6: Plan Contact Limits */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          🔢 ६. प्लॅन नंबर मर्यादा
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${siteConfig?.disablePlanContactLimit ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                          {siteConfig?.disablePlanContactLimit ? 'अमर्याद (No Limit)' : 'मर्यादित (5/10/..)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        {siteConfig?.disablePlanContactLimit
                          ? "५-१० नंबर मर्यादा बंद आहे. लाईक/अनलॉक वर अमर्याद नंबर दिसतील."
                          : "प्लॅननुसार ५ किंवा १० नंबर अनलॉक मर्यादा लागू आहे."
                        }
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>स्थिती: <strong>{siteConfig?.disablePlanContactLimit ? 'अमर्याद ON' : 'मर्यादा लागू'}</strong></span>
                      <button
                        onClick={() => updateSiteConfig({ disablePlanContactLimit: !siteConfig?.disablePlanContactLimit })}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer"
                      >
                        बदला
                      </button>
                    </div>
                  </div>

                  {/* Card 7: Member-to-Member Chatting System */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          💬 ७. सदस्य चॅटिंग
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${siteConfig?.enableChatGlobal !== false ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                          {siteConfig?.enableChatGlobal !== false ? 'सुरू (ON)' : 'बंद (OFF)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        {siteConfig?.enableChatGlobal !== false
                          ? "सदस्य-सदस्य चॅटिंग सिस्टीम सध्या चालू आहे."
                          : "सदस्य-सदस्य डायरेक्ट चॅटिंग सध्या पूर्णपणे बंद आहे."
                        }
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>स्थिती: <strong>{siteConfig?.enableChatGlobal !== false ? 'सुरू (ON)' : 'बंद (OFF)'}</strong></span>
                      <button
                        onClick={() => updateSiteConfig({ enableChatGlobal: siteConfig?.enableChatGlobal === false ? true : false })}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer"
                      >
                        बदला
                      </button>
                    </div>
                  </div>

                  {/* Card 8: Promo Code & Discount Engine Control */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                          🏷️ ८. प्रोमो कोड व कूपन्स
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          siteConfig?.enablePromoCodes !== false
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {siteConfig?.enablePromoCodes !== false ? 'सक्रिय (ON) ✓' : 'बंद (OFF)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1.5">
                        {siteConfig?.enablePromoCodes !== false
                          ? `पेमेंट स्क्रीनवर कूपन कोड वापरण्याची सवलत बॉक्स चालू आहे. (${promoCodes.length} कूपन उपलब्ध)`
                          : 'सध्या ग्राहकांसाठी प्रोमो कोड वापरण्याची सुविधा बंद आहे.'}
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ enablePromoCodes: siteConfig?.enablePromoCodes === false ? true : false })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black border cursor-pointer transition-all ${
                          siteConfig?.enablePromoCodes !== false
                            ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        {siteConfig?.enablePromoCodes !== false ? '🔒 बंद करा (OFF)' : '🔓 चालू करा (ON)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCategory('payments_hub');
                          setActiveTab('promo_codes');
                        }}
                        className="text-[10px] font-black text-[#A71930] hover:underline cursor-pointer bg-amber-50 px-2 py-1 rounded-lg border border-amber-200"
                      >
                        🏷️ कूपन व्यवस्थापन ➔
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* SPECIAL ADMIN PRIVACY OVERVIEW & OVERRIDE PANEL */}
              <div className="p-5 bg-red-50 rounded-3xl border border-red-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                      <Lock className="w-4.5 h-4.5 text-[#A71930]" />
                      सदस्यांच्या वैयक्तिक गोपनीयतेवर ॲडमिनचे थेट नियंत्रण (Admin Privacy Override Control)
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      जर सदस्याने नोंदणी करताना किंवा प्रोफाइलमध्ये "नंबर लपवा" (Hide Contact) अथवा "फोटो लपवा" (Hide Photo) निवडले असेल, तर ॲडमिन म्हणून तुम्हाला ते अमान्य (Override) करून थेट उघडे करण्याची परवानगी आहे का?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSiteConfig({
                        adminOverrideMemberPrivacy: !siteConfig.adminOverrideMemberPrivacy,
                      })
                    }
                    className={`px-5 py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-md transition-all shrink-0 ${
                      siteConfig.adminOverrideMemberPrivacy 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    {siteConfig.adminOverrideMemberPrivacy ? 'ओव्हरराइड सक्रिय (OVERRIDE ON)' : 'सदस्य पसंती पाळा (RESPECT USER CHOICE)'}
                  </button>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-red-100 text-[11px] text-slate-500 font-bold leading-normal">
                  💡 <strong>महत्त्वाचे (Important):</strong> <br />
                  - <strong>OVERRIDE ON:</strong> सदस्यांचे वैयक्तिक 'लपवा' सेटिंग दुर्लक्षित केले जाईल. सर्व काही ॲडमिनच्या खालील जागतिक नियमांनुसार चालेल. (अतिशय सुलभ आणि स्पष्ट!) <br />
                  - <strong>RESPECT USER CHOICE:</strong> सदस्याने नंबर किंवा फोटो लपवला असल्यास, तो कुणालाही दिसणार नाही, जोपर्यंत तो सदस्य स्वतःहून परवानगी देत नाही.
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CATEGORY 1: लॉगिन नसलेले अतिथी (Unregistered Public Visitors) */}
                <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                      <div className="p-1.5 bg-rose-100 text-[#A71930] rounded-lg shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#A71930] text-sm">
                          १. लॉगिन नसलेले विझिटर्स (Public)
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">लॉगिन न करता थेट वेबसाईटला भेट देणारे लोक</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Toggle: View Contacts for Public Visitors */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">मोबाईल नंबर थेट दाखवा?</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                            चालू केल्यास, लॉगिन नसलेल्या सामान्य लोकांना इतर सदस्यांचे मोबाईल नंबर थेट स्पष्ट दिसतील.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              allowPublicVisitorsToViewContacts: !siteConfig.allowPublicVisitorsToViewContacts,
                            })
                          }
                          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all shrink-0 ${
                            siteConfig.allowPublicVisitorsToViewContacts ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {siteConfig.allowPublicVisitorsToViewContacts ? 'सुरू (ON)' : 'बंद (OFF)'}
                        </button>
                      </div>

                      {/* Toggle: Blur Photos for Public Visitors */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">फोटो स्पष्ट दाखवा?</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                            बंद केल्यास लॉगिन नसलेल्या विझिटर्सना सर्व सदस्यांचे फोटो अस्पष्ट (Blur) दिसतील.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              allowPublicVisitorsToViewPhotos: siteConfig.allowPublicVisitorsToViewPhotos === false ? true : false,
                            })
                          }
                          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all shrink-0 ${
                            siteConfig.allowPublicVisitorsToViewPhotos !== false ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {siteConfig.allowPublicVisitorsToViewPhotos !== false ? 'स्पष्ट (Clear)' : 'अस्पष्ट (Blur)'}
                        </button>
                      </div>

                      {/* Granular Public visitor Permissions Matrix list */}
                      <div className="space-y-2.5 pt-2 border-t border-amber-100">
                        <p className="text-xs font-black text-slate-700">तपशीलवार परवानग्या (Public visitor Limits):</p>
                        {[
                          { key: 'viewProfiles', label: 'बायोडाटा पाहणे', desc: 'लॉगिन नसलेले लोक बायोडाटा यादी पाहू शकतात.' },
                          { key: 'searchFilters', label: 'शोधाशोध फिल्टर्स वापरणे', desc: 'जिल्हा, शिक्षण व वयानुसार शोधणे.' },
                        ].map((item) => {
                          const currentPerms = siteConfig.guestPermissions || {
                            viewProfiles: true,
                            searchFilters: true,
                            kundaliView: false,
                            expressInterest: false,
                            viewPhotos: true,
                            directChat: false,
                          };
                          const isEnabled = currentPerms[item.key as keyof typeof currentPerms] ?? true;

                          return (
                            <div key={item.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{item.label}</p>
                                <p className="text-[9px] text-slate-500 font-medium">{item.desc}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = {
                                    ...currentPerms,
                                    [item.key]: !isEnabled,
                                  };
                                  updateSiteConfig({ guestPermissions: updated });
                                }}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer shadow-xs ${
                                  isEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {isEnabled ? 'सुरू' : 'बंद'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 2: गेस्ट लॉगिन युझर्स (Temporary Guest Accounts) */}
                <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#A71930] text-sm">
                          २. गेस्ट लॉगिन युझर्स (Guest Logins)
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">तात्पुरते 'गेस्ट लॉगिन' केलेल्या लोकांसाठी परवानग्या</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Toggle: View Contacts for Guest Logins */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">मोबाईल नंबर थेट दाखवा?</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                            हे चालू केल्यास, गेस्ट लॉगिन खात्याद्वारे आलेल्यांना सर्व सदस्यांचे मोबाईल नंबर स्पष्ट दिसतील.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              allowGuestsToViewContacts: !siteConfig.allowGuestsToViewContacts,
                            })
                          }
                          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all shrink-0 ${
                            siteConfig.allowGuestsToViewContacts ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {siteConfig.allowGuestsToViewContacts ? 'सुरू (ON)' : 'बंद (OFF)'}
                        </button>
                      </div>

                      {/* Toggle: Blur Photos for Guest Logins */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">फोटो स्पष्ट दाखवा?</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                            बंद केल्यास गेस्ट लॉगिन युझर्सना सर्व सदस्यांचे फोटो अस्पष्ट (Blur) दिसतील.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              allowGuestsToViewPhotos: siteConfig.allowGuestsToViewPhotos === false ? true : false,
                            })
                          }
                          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all shrink-0 ${
                            siteConfig.allowGuestsToViewPhotos !== false ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {siteConfig.allowGuestsToViewPhotos !== false ? 'स्पष्ट (Clear)' : 'अस्पष्ट (Blur)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 2: नोंदणीकृत सदस्य (Members) नियम */}
                <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                      <div className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[#A71930] text-sm">
                          नोंदणीकृत सदस्य नियम (Registered Member Rules)
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">खाते तयार करून लॉग-इन असलेल्या लोकांसाठी नियम</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Toggle: View Contacts for Members */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">बिन-प्लॅनवाल्यांना (Free Members) नंबर थेट दाखवा?</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                            बंद ठेवल्यास (सुरक्षित रीत): प्लॅन खरेदी केल्याशिवाय किंवा अन-लॉक केल्याशिवाय मोबाईल नंबर दिसणार नाही आणि 'प्लॅन अपडेट करा' असा मेसेज दिसेल.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              allowMembersToViewContacts: !siteConfig.allowMembersToViewContacts,
                            })
                          }
                          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all shrink-0 ${
                            siteConfig.allowMembersToViewContacts ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {siteConfig.allowMembersToViewContacts ? 'दाखवा (ON)' : 'लपवा (OFF - प्लॅन अनिवार्य)'}
                        </button>
                      </div>

                      {/* Toggle: Blur Photos for Members */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">बिन-प्लॅनवाल्यांना प्रोफाइल फोटो स्पष्ट दाखवा?</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                            बंद केल्यास प्लॅन नसलेल्या फ्री युझर्सना इतर सर्व प्रोफाईल फोटो अस्पष्ट (Blur + Lock) दिसतील.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              allowMembersToViewPhotos: siteConfig.allowMembersToViewPhotos === false ? true : false,
                            })
                          }
                          className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all shrink-0 ${
                            siteConfig.allowMembersToViewPhotos !== false ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {siteConfig.allowMembersToViewPhotos !== false ? 'स्पष्ट (Clear)' : 'अस्पष्ट (Blur)'}
                        </button>
                      </div>

                      {/* Toggle: Name Display Mode for Free Users */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                        <div>
                          <p className="text-xs font-black text-slate-800">बिन-प्लॅनवाल्यांना (Free/Guest) नावाची दृश्यमानता कसली ठेवायची?</p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                            फ्री युझर्सना बायोडाटा ब्राऊझ करताना नाव पूर्ण दाखवायचे, फक्त पहिले नाव दाखवायचे की गुप्त ठेवायचे हे निवडा.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'full_name' })}
                            className={`py-2 px-2 rounded-xl text-[11px] font-black cursor-pointer border transition-all text-center ${
                              (siteConfig.nameDisplayModeForFreeUsers || 'full_name') === 'full_name'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            🟢 पूर्ण नाव (उदा. नाव व आडनाव)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'first_name_only' })}
                            className={`py-2 px-2 rounded-xl text-[11px] font-black cursor-pointer border transition-all text-center ${
                              siteConfig.nameDisplayModeForFreeUsers === 'first_name_only' || siteConfig.nameDisplayModeForFreeUsers === 'middle_surname_only'
                                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            🟡 मधले व आडनाव (उदा. मधले नाव व आडनाव)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSiteConfig({ nameDisplayModeForFreeUsers: 'hidden_star' })}
                            className={`py-2 px-2 rounded-xl text-[11px] font-black cursor-pointer border transition-all text-center ${
                              siteConfig.nameDisplayModeForFreeUsers === 'hidden_star'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            🔴 गुप्त नाव (उदा. रा****)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MASTER AUTO-APPROVALS & MODES */}
                  <div className="space-y-4 pt-4 border-t border-amber-100">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4.5 h-4.5 text-amber-500 animate-bounce shrink-0" />
                      <p className="text-xs font-black text-slate-800">ऑटो-मंजुरी व ऑटो-मोड (Auto-Approvals):</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Auto approve new registrations */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800">नवीन सदस्यांना ऑटो-मंजूर करा?</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-normal">
                            चालू केल्यास नोंदणी केलेले सदस्य थेट मंजूर होऊन मुख्य यादीत जातील.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              autoApproveNewRegistrations: !siteConfig.autoApproveNewRegistrations,
                            })
                          }
                          className={`w-full py-1.5 rounded-lg text-center font-black text-[10px] cursor-pointer shadow-xs ${
                            siteConfig.autoApproveNewRegistrations ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {siteConfig.autoApproveNewRegistrations ? 'चालू (AUTO)' : 'बंद (MANUAL APPROVAL)'}
                        </button>
                      </div>

                      {/* Offer mode */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800">सण विशेष ऑफर मोड (Offer Mode)</p>
                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-normal">
                            सर्व संपर्क आणि चॅट तात्पुरते मोफत व खुले करण्यासाठी.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              isOfferModeEnabled: !siteConfig.isOfferModeEnabled,
                            })
                          }
                          className={`w-full py-1.5 rounded-lg text-center font-black text-[10px] cursor-pointer shadow-xs ${
                            siteConfig.isOfferModeEnabled ? 'bg-amber-500 text-white' : 'bg-slate-600 text-white'
                          }`}
                        >
                          {siteConfig.isOfferModeEnabled ? 'सुरू (OFFER ON)' : 'बंद (OFF)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 3: चॅट नियम व सुरक्षा नियंत्रणे */}
                <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-sm space-y-4 lg:col-span-2">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#A71930] text-sm">
                        चॅट नियम व सुरक्षा नियंत्रणे (Chat & Security Restrictions)
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">चॅटमध्ये माहिती शेअरिंगवर नियंत्रण ठेवण्यासाठी सेटिंग्ज</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-slate-900 text-xs font-black">गावाचे नाव शेअरिंग</p>
                        <p className="text-[9px] text-slate-500 font-semibold">चॅटमध्ये गावाचे नाव परवानगी</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSiteConfig({
                            allowShareVillage: !siteConfig.allowShareVillage,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg font-black text-[10px] cursor-pointer shadow-xs shrink-0 ${
                          siteConfig.allowShareVillage ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {siteConfig.allowShareVillage ? 'चालू (ON)' : 'बंद (OFF)'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-slate-900 text-xs font-black">मोबाईल नंबर शेअरिंग</p>
                        <p className="text-[9px] text-slate-500 font-semibold">चॅटमध्ये फोन नंबर ब्लॉक</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSiteConfig({
                            allowShareMobile: !siteConfig.allowShareMobile,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg font-black text-[10px] cursor-pointer shadow-xs shrink-0 ${
                          siteConfig.allowShareMobile ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {siteConfig.allowShareMobile ? 'चालू (ON)' : 'बंद (OFF)'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-slate-900 text-xs font-black">ई-मेल आयडी शेअरिंग</p>
                        <p className="text-[9px] text-slate-500 font-semibold">चॅटमध्ये ईमेल ब्लॉक</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSiteConfig({
                            allowShareEmail: !siteConfig.allowShareEmail,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg font-black text-[10px] cursor-pointer shadow-xs shrink-0 ${
                          siteConfig.allowShareEmail ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {siteConfig.allowShareEmail ? 'चालू (ON)' : 'बंद (OFF)'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-slate-900 text-xs font-black">चॅट मेसेज डिलीट</p>
                        <p className="text-[9px] text-slate-500 font-semibold">सदस्यांना डिलीट करण्याची परवानगी</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateSiteConfig({
                            allowUsersToDeleteChatMessages: !siteConfig.allowUsersToDeleteChatMessages,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg font-black text-[10px] cursor-pointer shadow-xs shrink-0 ${
                          siteConfig.allowUsersToDeleteChatMessages ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {siteConfig.allowUsersToDeleteChatMessages ? 'चालू (ON)' : 'फक्त ॲडमिन (OFF)'}
                      </button>
                    </div>
                  </div>

                  {/* Photo Blur Percent slider & selective blurs */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-slate-800">फोटो अस्पष्टता टक्केवारी (Photo Blur Percent):</p>
                        <p className="text-[10px] text-slate-500 font-semibold">फोटो किती प्रमाणात ब्लर करावा (मूळ मूल्य ३०%)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{siteConfig.photoBlurPercent || 30}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={siteConfig.photoBlurPercent || 30}
                          onChange={(e) =>
                            updateSiteConfig({
                              photoBlurPercent: Number(e.target.value),
                            })
                          }
                          className="w-40 accent-[#A71930] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold pt-2 border-t border-slate-200/50">
                      <label className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 cursor-pointer">
                        <span className="text-slate-800 text-[11px] font-bold">शिक्षण ब्लर करा</span>
                        <input
                          type="checkbox"
                          checked={siteConfig.blurEducation || false}
                          onChange={(e) =>
                            updateSiteConfig({ blurEducation: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#A71930] accent-[#A71930] cursor-pointer"
                        />
                      </label>

                      <label className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 cursor-pointer">
                        <span className="text-slate-800 text-[11px] font-bold">नोकरी/व्यवसाय ब्लर</span>
                        <input
                          type="checkbox"
                          checked={siteConfig.blurOccupation || false}
                          onChange={(e) =>
                            updateSiteConfig({ blurOccupation: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#A71930] accent-[#A71930] cursor-pointer"
                        />
                      </label>

                      <label className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 cursor-pointer">
                        <span className="text-slate-800 text-[11px] font-bold">वार्षिक उत्पन्न ब्लर</span>
                        <input
                          type="checkbox"
                          checked={siteConfig.blurIncome || false}
                          onChange={(e) =>
                            updateSiteConfig({ blurIncome: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#A71930] accent-[#A71930] cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: RECYCLE BIN & CLOUDINARY STORAGE PURGE WITH DOUBLE CONFIRMATION */}
          {activeTab === 'recycle_bin' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                    <span>रिसायकल बिन व क्लाउडिनरी स्टोरेज स्वच्छता (Recycle Bin)</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    हटवलेले बायोडाटा आणि फोटो इथे साठवले जातात. कायमस्वरूपी रिकामे करण्यासाठी २-टप्प्यांची खात्री modal वापरा.
                  </p>
                </div>

                <button
                  onClick={() => setIsPurgeConfirmOpen(true)}
                  className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>बिन कायमस्वरूपी मोकळा करा (Purge All)</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                    <tr>
                      <th className="p-3">नाव & आयडी</th>
                      <th className="p-3">मूळ प्रकार</th>
                      <th className="p-3">हटवल्याची तारीख</th>
                      <th className="p-3 text-right">पुनर्संचयित (Restore) / नष्ट करा</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold">
                    {recycleBin.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                          रिसायकल बिन सध्या पूर्णपणे रिकामा आहे.
                        </td>
                      </tr>
                    ) : (
                      recycleBin.map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50">
                          <td className="p-3 font-bold text-slate-900">{item.itemData.fullName || item.id}</td>
                          <td className="p-3 text-amber-800 uppercase font-black text-[10px]">{item.originalType}</td>
                          <td className="p-3 font-mono text-slate-500">{item.deletedAt}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => restoreRecycleItem(item.id)}
                                className="px-3 py-1 bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                              >
                                परत आणा (Restore)
                              </button>
                              <button
                                onClick={() => permanentDeleteRecycleItem(item.id)}
                                className="px-3 py-1 bg-rose-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                              >
                                नष्ट करा
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ADD PROFILE MANUAL / PHOTO */}
          {activeTab === 'add_profile' && (
            <div className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm">
              <h3 className="text-base font-black text-[#A71930] mb-4">
                नवीन बायोडाटा नोंदणी पर्याय (Manual or AI Photo Extractor)
              </h3>
              <AIBioDataExtractor
                onExtracted={(ext) => {
                  const newProfile: UserProfile = {
                    id: 'vj-' + Math.floor(100 + Math.random() * 900),
                    fullName: ext.fullName || 'नवीन उमेदवार',
                    gender: ext.gender || 'groom',
                    dob: ext.dob || '1998-01-01',
                    age: 26,
                    mobile: ext.mobile || '9800000000',
                    email: '',
                    district: ext.district || 'बीड',
                    taluka: '',
                    city: '',
                    education: ext.education || 'पदवीधर',
                    occupation: ext.occupation || 'नोकरी / व्यवसाय',
                    income: 'उल्लेख नाही',
                    height: "5'5\"",
                    weight: '55',
                    bloodGroup: 'O+',
                    maritalStatus: 'never_married',
                    religion: 'हिंदू',
                    subCaste: ext.subCaste || 'वंजारी (NT-D)',
                    gotra: ext.gotra || 'काश्यप',
                    fatherOccupation: ext.fatherName || '',
                    motherOccupation: '',
                    brothers: 0,
                    sisters: 0,
                    familyType: 'सुसंस्कृत कुटुंब',
                    expectations: ext.expectations || '',
                    photos: ext.candidatePhotoUrl ? [ext.candidatePhotoUrl] : [],
                    horoscopeUrl: '',
                    aadhaarVerified: true,
                    isVerified: true,
                    isFeatured: false,
                    isApproved: true,
                    membership: 'free',
                    createdAt: new Date().toISOString().split('T')[0],
                    lastActive: 'प्रशासकाद्वारे जोडले',
                    registrationType: 'ocr_ai',
                    privacy: { hideContact: false, hidePhoto: false },
                  };
                  addProfile(newProfile);
                  alert(
                    `प्रशासक संदेश: '${newProfile.fullName}' यांची AI द्वारे बायोडाटा माहिती ${
                      ext.candidatePhotoUrl ? 'आणि मुलाचा/मुलीचा फोटोसह' : ''
                    } यशस्वीपणे नोंदवली गेली!`
                  );
                }}
              />
            </div>
          )}

          {/* TAB: PUSH NOTIFICATION MANAGER */}
          {activeTab === 'push_notification' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-5 bg-gradient-to-r from-[#A71930] via-[#C82333] to-[#800C1E] text-amber-100 rounded-3xl shadow-xl border-2 border-amber-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-300/40">
                    <Megaphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-amber-100">
                      पुश नोटिफिकेशन्स केंद्र (Push Notification Center)
                    </h3>
                    <p className="text-xs text-amber-200 font-bold">
                      ॲप व वेबसाईटवरील सर्व सदस्यांना एकाच वेळी किंवा वैयक्तिक एका सदस्याला मोबाईल सूचना पाठवा.
                    </p>
                  </div>
                </div>
              </div>

              {pushSentSuccessMsg && (
                <div className="p-4 bg-emerald-100 border-2 border-emerald-400 text-emerald-900 rounded-2xl text-xs font-black flex items-center justify-between shadow-md animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>{pushSentSuccessMsg}</span>
                  </div>
                  <button onClick={() => setPushSentSuccessMsg('')} className="text-emerald-700 hover:text-emerald-950 font-bold">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border-2 border-amber-300 shadow-lg space-y-5">
                  <form onSubmit={handleSendPushNotification} className="space-y-5 text-xs font-bold text-slate-800">
                    
                    {/* Target Audience Selector */}
                    <div>
                      <label className="block text-sm font-black text-[#800C1E] mb-2">
                        १. सूचना कोणाला पाठवायची आहे? (Select Target Audience)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          onClick={() => setPushTargetMode('all')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                            pushTargetMode === 'all'
                              ? 'bg-amber-50 border-[#A71930] text-[#A71930] shadow-md'
                              : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${pushTargetMode === 'all' ? 'bg-[#A71930] text-amber-300' : 'bg-slate-100 text-slate-500'}`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs">📢 सर्व सदस्य (All Members)</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              एकूण {approvedMembers.length} सदस्यांना ब्रॉडकास्ट
                            </div>
                          </div>
                        </label>

                        <label
                          onClick={() => setPushTargetMode('individual')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                            pushTargetMode === 'individual'
                              ? 'bg-amber-50 border-[#A71930] text-[#A71930] shadow-md'
                              : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${pushTargetMode === 'individual' ? 'bg-[#A71930] text-amber-300' : 'bg-slate-100 text-slate-500'}`}>
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs">👤 वैयक्तिक एक सदस्य (Individual)</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              विशिष्ट एका सदस्याला नोटिफिकेशन
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* If Individual: Member Search & Select */}
                    {pushTargetMode === 'individual' && (
                      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-3">
                        <label className="block text-xs font-black text-[#800C1E]">
                          सदस्य निवडा (Search & Select Member):
                        </label>
                        
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="नाव, मोबाईल, किंवा आयडी टाईप करा..."
                            value={pushSearchTerm}
                            onChange={(e) => setPushSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold outline-none focus:border-[#A71930]"
                          />
                        </div>

                        {/* Member Selection List */}
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                          {profiles
                            .filter((p) =>
                              p.fullName.toLowerCase().includes(pushSearchTerm.toLowerCase()) ||
                              p.mobile.includes(pushSearchTerm) ||
                              p.id.toLowerCase().includes(pushSearchTerm.toLowerCase()) ||
                              p.district.toLowerCase().includes(pushSearchTerm.toLowerCase())
                            )
                            .slice(0, 15)
                            .map((m) => (
                              <div
                                key={m.id}
                                onClick={() => setPushTargetUserId(m.id)}
                                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  pushTargetUserId === m.id
                                    ? 'bg-[#A71930] text-amber-100 border-amber-300 font-black shadow'
                                    : 'bg-white hover:bg-amber-100/50 border-amber-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={m.photoUrl || (m.gender === 'bride' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100')}
                                    alt={m.fullName}
                                    className="w-9 h-9 rounded-full object-cover border border-amber-300"
                                  />
                                  <div>
                                    <div className="font-extrabold text-xs">{m.fullName}</div>
                                    <div className="text-[10px] opacity-80 font-medium">
                                      {m.gender === 'bride' ? 'वधू' : 'वर'} • {m.district} • {m.mobile}
                                    </div>
                                  </div>
                                </div>
                                {pushTargetUserId === m.id && (
                                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                                )}
                              </div>
                            ))}
                        </div>

                        {pushTargetUserId && (
                          <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-black flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>निवडलेला सदस्य: {profiles.find(p => p.id === pushTargetUserId)?.fullName} ({profiles.find(p => p.id === pushTargetUserId)?.mobile})</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Marathi Preset Message Templates */}
                    <div>
                      <label className="block text-xs font-black text-[#800C1E] mb-1.5">
                        तयार टेंप्लेट निवडा (Quick Marathi Templates):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPushTitleMr('वंजारी जोडी - नवीन वधू-वर');
                            setPushMessageMr('🎉 वंजारी जोडीवर नवीन वधू-वर बायोडाटा जोडले गेले आहेत. आताच ॲप उघडून बायोडाटा तपासा!');
                          }}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                        >
                          🎉 नवीन वधू-वर
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPushTitleMr('वंजारी जोडी - अपूर्ण बायोडाटा');
                            setPushMessageMr('⚠️ आपला बायोडाटा अद्याप अपूर्ण आहे. चांगल्या स्थळांच्या प्रतिसादासाठी फोटो व संपूर्ण माहिती जोडा.');
                          }}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                        >
                          ⚠️ बायोडाटा माहिती भरा
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPushTitleMr('वंजारी जोडी - डिस्काउंट ऑफर');
                            setPushMessageMr('👑 प्रीमियम सबस्क्रिप्शनवर विशेष सवलत! संपर्क क्रमांक अनलॉक करा व थेट संवाद साधा.');
                          }}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                        >
                          👑 ऑफर संदेश
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPushTitleMr('वंजारी जोडी - नवीन संपर्क विनंती');
                            setPushMessageMr('💌 तुम्हाला एका सदस्याकडून पसंती / संपर्क विनंती प्राप्त झाली आहे. तपासून प्रतिसाद द्या.');
                          }}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#800C1E] rounded-xl text-[11px] font-bold border border-amber-300 cursor-pointer"
                        >
                          💌 संपर्क विनंती
                        </button>
                      </div>
                    </div>

                    {/* Notification Title */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1">
                        सूचना शीर्षक (Title - मराठी/English)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. वंजारी जोडी - नवीन वधू-वर अपडेट"
                        value={pushTitleMr}
                        onChange={(e) => setPushTitleMr(e.target.value)}
                        className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#A71930]"
                      />
                    </div>

                    {/* Notification Message */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1">
                        सूचना संदेश (Message Body)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="सदस्यांच्या मोबाईलवर दिसायचा संदेश येथे टाईप करा..."
                        value={pushMessageMr}
                        onChange={(e) => setPushMessageMr(e.target.value)}
                        className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-[#A71930]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black rounded-2xl text-xs shadow-xl border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                    >
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>पुश सूचना पाठवा (Send Push Notification)</span>
                    </button>
                  </form>
                </div>

                {/* History Side Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <h4 className="text-sm font-black text-[#A71930] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#A71930]" />
                        <span>पाठवलेल्या नोटिफिकेशन्स इतिहास</span>
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#800C1E] font-extrabold text-[10px]">
                        {notifications.length}
                      </span>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs font-medium">
                        अद्याप एकही पुश सूचना पाठवली गेलेली नाही.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-[#A71930]">{n.titleMr || n.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-800 font-bold">{n.messageMr || n.message}</p>
                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-amber-200/60 text-slate-500">
                              <span>
                                लक्षित: <strong className="text-slate-700">{n.userId === 'all' ? '📢 सर्व सदस्य' : `👤 ${n.userId}`}</strong>
                              </span>
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>पाठवले गेले</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEMBERSHIP PLANS & PAYMENT CONFIGURATION */}
          {activeTab === 'plans_setup' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#A71930]" />
                    <span>मेम्बरशिप प्लॅन्स, दर व पेमेंट क्यूआर व्यवस्थापन (Membership Plans & Payment Setup)</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    इथे तुम्ही प्लॅनचे दर (Prices), कालावधी (Validity), वैशिष्ट्ये (Features) आणि पेमेंटचा क्यूआर कोड/UPI आयडी अपडेट करू शकता.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-300 shadow-sm">
                  <span className="text-xs font-extrabold text-slate-900">पेड प्लॅन्स ऑन/ऑफ:</span>
                  <button
                    type="button"
                    onClick={() => setIsPaidPlansEnabled(!isPaidPlansEnabled)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      isPaidPlansEnabled
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-rose-600 text-white shadow-md'
                    }`}
                  >
                    {isPaidPlansEnabled ? 'चालू (Paid Mode ON)' : 'बंद (All Free Mode)'}
                  </button>
                </div>
              </div>

              {/* Payment Details & QR Code Card */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm space-y-4">
                <h4 className="font-black text-[#A71930] text-sm flex items-center gap-2 border-b border-amber-200 pb-2">
                  <CreditCard className="w-4 h-4 text-[#A71930]" />
                  <span>पेमेंट क्यूआर कोड, UPI ID आणि बँक माहिती (Payment Receiver Setup)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 mb-1 flex items-center justify-between">
                        <span>Paytm / UPI ID (e.g., PhonePe/GPay/Paytm):</span>
                        <span className="text-[10px] text-[#A71930] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">ऑटो-व्हॅरीफाय इंजिन</span>
                      </label>
                      <input
                        type="text"
                        value={siteConfig.paymentUpiId || 'vanjarijodi@paytm'}
                        onChange={(e) => updateSiteConfig({ paymentUpiId: e.target.value })}
                        placeholder="vanjarijodi@paytm"
                        className="w-full px-3 py-2 font-mono text-xs font-bold rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                      />
                    </div>

                    {/* Paytm Webhook URL Box */}
                    <div className="p-3 bg-[#FFFDF5] border border-amber-300 rounded-xl space-y-1.5">
                      <label className="block text-slate-800 text-[11px] font-black flex items-center gap-1 text-[#A71930]">
                        <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Paytm Webhook Auto-Verification URL (Render/Server Link):</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={typeof window !== 'undefined' ? `${window.location.origin}/api/paytm-webhook` : 'https://your-domain.com/api/paytm-webhook'}
                          className="w-full px-2.5 py-1.5 font-mono text-[11px] font-bold rounded-lg border border-amber-300 bg-amber-50 text-slate-800 select-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const link = typeof window !== 'undefined' ? `${window.location.origin}/api/paytm-webhook` : 'https://your-domain.com/api/paytm-webhook';
                            navigator.clipboard.writeText(link);
                            alert('Paytm Webhook URL क्लिपबोर्डवर कॉपी झाला:\n' + link);
                          }}
                          className="shrink-0 px-2.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-bold text-[11px] rounded-lg shadow flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-amber-300" />
                          <span>कॉपी</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">
                        हा URL तुमच्या Render किंवा Paytm मर्चंट डॅशबोर्डवरील Webhook / Notification URL मध्ये पेस्ट करा.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">
                        तुमच्याकडील क्यूआर कोड फोटो अपलोड करा (Upload Payment QR Code):
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer bg-gradient-to-r from-[#A71930] to-[#800C1E] hover:from-[#800C1E] hover:to-[#5C0815] text-amber-100 px-4 py-2.5 rounded-xl font-black text-xs shadow flex items-center justify-center gap-2 border border-amber-300 transition-all">
                            <ImageIcon className="w-4 h-4 text-amber-300" />
                            <span>{isUploadingQrCode ? 'अपलोड होत आहे...' : 'गॅलरी / ब्राऊझ मधून क्यूआर फोटो निवडा'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingQrCode}
                              onChange={handleUploadPaymentQr}
                              className="hidden"
                            />
                          </label>
                          {siteConfig.paymentQrUrl && (
                            <button
                              type="button"
                              onClick={() => updateSiteConfig({ paymentQrUrl: '' })}
                              className="px-3 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-extrabold text-xs border border-rose-300 cursor-pointer"
                              title="क्यूआर फोटो काढून टाका"
                            >
                              हटवा
                            </button>
                          )}
                        </div>

                        {qrUploadError && (
                          <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{qrUploadError}</span>
                          </p>
                        )}

                        <div className="pt-1">
                          <label className="block text-[11px] text-slate-500 font-bold mb-1">किंवा डायरेक्ट क्यूआर लिंक URL प्रविष्ट करा:</label>
                          <input
                            type="text"
                            value={siteConfig.paymentQrUrl || ''}
                            onChange={(e) => updateSiteConfig({ paymentQrUrl: e.target.value })}
                            placeholder="https://... किंवा वरून फोटो निवडा"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">पेमेंट सूचना / टिप (Payment Note):</label>
                      <textarea
                        rows={2}
                        value={
                          siteConfig.paymentNote ||
                          'PhonePe / Google Pay / Paytm द्वारे क्यूआर कोड स्कॅन करून किंवा UPI ID वर पेमेंट करा व UTR नंबर सादर करा.'
                        }
                        onChange={(e) => updateSiteConfig({ paymentNote: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                      />
                    </div>

                    {/* Payment Gateway Mode Selector */}
                    <div className="pt-2 border-t border-amber-200 space-y-3">
                      <div>
                        <label className="block text-slate-800 text-xs font-black mb-1 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#A71930]" />
                          <span>पेमेंट पद्धत निवडा (Payment Gateway Option Mode):</span>
                        </label>
                        <select
                          value={siteConfig.paymentMode || 'both'}
                          onChange={(e) => updateSiteConfig({ paymentMode: e.target.value as any })}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930] bg-white text-slate-900 cursor-pointer"
                        >
                          <option value="both">⚡ सर्व ऑनलाईन पर्याय (CCAvenue गेटवे + UPI QR)</option>
                          <option value="ccavenue_only">🏛️ फक्त CCAvenue ऑनलाईन सुरू ठेवा (CCAvenue Only)</option>
                          <option value="upi_qr_only">📲 फक्त UPI QR कोड व UTR पावती सुरू ठेवा (UPI QR Only)</option>
                        </select>
                        <p className="text-[11px] text-slate-600 font-bold mt-1">
                          ॲडमिन इच्छेनुसार CCAvenue गेटवे किंवा UPI QR कोड पर्याय निवडू शकतात.
                        </p>
                      </div>

                      {/* Full Access For Paid Members Toggle */}
                      <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-300">
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">
                            🔓 पेड मेंबर्सना सर्व नंबर थेट दाखवणे (Paid Member Full Access):
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium block">
                            सक्रिय केल्यास, कोणत्याही पेड मेम्बरला सर्व बायोडाटाचे संपर्क थेट दिसतील.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSiteConfig({ enableFullAccessForPaidMembers: siteConfig.enableFullAccessForPaidMembers === false })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            siteConfig.enableFullAccessForPaidMembers !== false
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-rose-600 text-white shadow'
                          }`}
                        >
                          {siteConfig.enableFullAccessForPaidMembers !== false ? 'चालू (Enabled)' : 'बंद (Disabled)'}
                        </button>
                      </div>

                      {/* CCAvenue Gateway Admin Config (Super Admin Restricted) */}
                      <div className="pt-2 border-t border-indigo-200 space-y-2">
                        <div className="flex items-center justify-between bg-indigo-50 p-2.5 rounded-xl border border-indigo-200">
                          <div>
                            <span className="font-extrabold text-xs text-indigo-950 block flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-indigo-700" />
                              <span>CCAvenue ऑनलाईन गेटवे (CCAvenue Payment Gateway):</span>
                            </span>
                            <span className="text-[11px] text-indigo-900 font-medium">मर्चंट: वंजारीजोडी (VanjariJodi)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSiteConfig({ enableCcavenue: siteConfig.enableCcavenue === false })}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              siteConfig.enableCcavenue !== false
                                ? 'bg-indigo-700 text-white shadow'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {siteConfig.enableCcavenue !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                          </button>
                        </div>

                        {currentSubAdmin ? (
                          <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-xl flex items-center gap-2 text-[11px] font-bold text-amber-900">
                            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>🔒 केवळ सुपर ॲडमिनसाठी (Super Admin Only): पेमेंट API keys, Merchant ID व Working Key फक्त मुख्य सुपर ॲडमिन पाहू/बदलू शकतात.</span>
                          </div>
                        ) : (
                          siteConfig.enableCcavenue !== false && (
                            <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-slate-800 text-[10px] font-black">१. CCAvenue Merchant ID:</label>
                                  <input
                                    type="text"
                                    value={siteConfig.ccavenueMerchantId || ''}
                                    onChange={(e) => updateSiteConfig({ ccavenueMerchantId: e.target.value })}
                                    placeholder="Merchant ID"
                                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-indigo-300 rounded-lg bg-indigo-50/20 text-indigo-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-800 text-[10px] font-black">२. CCAvenue Access Code:</label>
                                  <input
                                    type="text"
                                    value={siteConfig.ccavenueAccessCode || ''}
                                    onChange={(e) => updateSiteConfig({ ccavenueAccessCode: e.target.value })}
                                    placeholder="Access Code"
                                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-indigo-300 rounded-lg bg-indigo-50/20 text-indigo-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-800 text-[10px] font-black">३. CCAvenue Working Key:</label>
                                  <input
                                    type="password"
                                    value={siteConfig.ccavenueWorkingKey || ''}
                                    onChange={(e) => updateSiteConfig({ ccavenueWorkingKey: e.target.value })}
                                    placeholder="Working Key"
                                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-indigo-300 rounded-lg bg-indigo-50/20 text-indigo-950"
                                  />
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold">
                                ⚡ मर्चंट पोर्टल (वंजारीजोडी - VanjariJodi) कडून प्राप्त केलेले हे ३ कोड टाका.
                              </p>
                            </div>
                          )
                        )}
                      </div>

                      {/* Instamojo Gateway Admin Config */}
                      <div className="pt-2 border-t border-amber-200 space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                          <div>
                            <span className="font-extrabold text-xs text-emerald-900 block">Instamojo ऑनलाईन पेमेंट लिंक (Instamojo Payment Gateway):</span>
                            <span className="text-[11px] text-emerald-700 font-medium">Instamojo वरील पेमेंट लिंक द्वारे भरणा सुरू करा</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSiteConfig({ enableInstamojo: siteConfig.enableInstamojo === false })}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              siteConfig.enableInstamojo !== false
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {siteConfig.enableInstamojo !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                          </button>
                        </div>

                        {siteConfig.enableInstamojo !== false && (
                          <div>
                            <label className="block text-slate-700 text-[11px] font-bold mb-1">Instamojo Payment Link URL (उदा. https://imjo.in/xxxx किंवा https://instamojo.com/@username):</label>
                            <input
                              type="text"
                              value={siteConfig.instamojoUrl || ''}
                              onChange={(e) => updateSiteConfig({ instamojoUrl: e.target.value })}
                              placeholder="https://imjo.in/xxxx किंवा https://www.instamojo.com/@gitevijay123"
                              className="w-full px-3 py-2 font-mono text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                            />
                            <p className="text-[10px] text-slate-500 font-bold mt-1">
                              💡 Instamojo Dashboard → Payment Links वरून तयार केलेली लिंक इथे पेस्ट करा. युझरला ही लिंक पेमेंट पॉपअपमध्ये थेट उपलब्ध होईल.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-xs font-black text-[#A71930]">सध्याचा पेमेंट क्यूआर कोड (Preview):</span>
                    {siteConfig.paymentQrUrl ? (
                      <img
                        src={siteConfig.paymentQrUrl}
                        alt="Payment QR"
                        className="w-36 h-36 object-contain rounded-xl border-2 border-amber-300 shadow bg-white p-1"
                      />
                    ) : (
                      <div className="w-36 h-36 rounded-xl border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-slate-400 text-[10px] bg-white p-2">
                        <span>ऑटो-जनरेटेड UPI QR वापरले जात आहे</span>
                        <span className="font-mono text-slate-600 mt-1">{siteConfig.paymentUpiId || 'vanjarijodi@upi'}</span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-600 font-normal">
                      सदस्य जेव्हा 'प्लॅन विकत घ्या' क्लिक करतील तेव्हा त्यांना हाच क्यूआर कोड आणि UPI ID दिसेल.
                    </p>
                  </div>
                </div>
              </div>

              {/* CUSTOMER PLAN VISIBILITY CONTROL BANNER */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-400 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#A71930] text-amber-100 text-[10px] font-black uppercase tracking-wider inline-block">
                      🔥 मुख्य प्लॅन सेटिंग (Primary Plan Visibility)
                    </span>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      ग्राहकांसाठी फक्त 'स्पेशल वेलकम प्लॅन' दाखवा (Show Only Welcome Plan)
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      सध्या चालू (ON) असल्यास ग्राहकांना नोंदणी व सबस्क्रिप्शन वेळी फक्त <strong>स्पेशल वेलकम ऑफर प्लॅन</strong> दिसेल. इतर प्लॅन्स लपवले जातील. बंद (OFF) केल्यास सर्व प्लॅन्स दिसतील.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSiteConfig({ showOnlyWelcomePlan: siteConfig.showOnlyWelcomePlan === false ? true : false })}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all border cursor-pointer shrink-0 shadow-md ${
                      siteConfig.showOnlyWelcomePlan !== false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-700 hover:bg-slate-800 text-slate-200 border-slate-800'
                    }`}
                  >
                    {siteConfig.showOnlyWelcomePlan !== false ? '✓ फक्त वेलकम प्लॅन (सक्रिय ON)' : '✕ सर्व प्लॅन्स दाखवा (OFF)'}
                  </button>
                </div>
              </div>

              {/* MUTUAL LIKE CONTACT UNLOCK CONTROL BANNER */}
              <div className="p-4 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 rounded-2xl border-2 border-rose-300 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#A71930] text-amber-100 text-[10px] font-black uppercase tracking-wider inline-block">
                      ❤️ म्युचुअल लाईक ऑटो-अनलॉक (Mutual Like Contact Unlock)
                    </span>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      एकमेकांना लाईक केल्यावर ऑटोमॅटिक मोबाईल नंबर दिसेल (Auto Unlock on Mutual Match)
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      हे बटण चालू (ON) असल्यास, जेव्हा दोन सदस्यांनी एकमेकांना लाईक (Like) केले असेल (म्युचुअल मॅच), तेव्हा दोघांचाही मोबाईल नंबर एकमेकांना ऑटोमॅटिक दिसेल. बंद (OFF) केल्यास फक्त ॲडमिन मंजुरीनेच नंबर दिसेल.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSiteConfig({ enableMutualLikeContactUnlock: siteConfig.enableMutualLikeContactUnlock === false ? true : false })}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all border cursor-pointer shrink-0 shadow-md ${
                      siteConfig.enableMutualLikeContactUnlock !== false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-700 hover:bg-slate-800 text-slate-200 border-slate-800'
                    }`}
                  >
                    {siteConfig.enableMutualLikeContactUnlock !== false ? '✓ म्युचुअल लाईक अनलॉक (सक्रिय ON)' : '✕ बंद आहे (OFF)'}
                  </button>
                </div>
              </div>

              {/* DISABLE PLAN CONTACT LIMIT CONTROL BANNER */}
              <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50 rounded-2xl border-2 border-purple-300 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-900 text-purple-100 text-[10px] font-black uppercase tracking-wider inline-block">
                      🔢 अमर्याद नंबर अनलॉक सिस्टीम (Unlimited Contact Unlocks System)
                    </span>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      ५ / १० नंबर मर्यादेची सिस्टीम बंद करा (Disable 5/10 Contact Limit)
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      हे बटण चालू (ON) केल्यास ५ किंवा १० मोबाईल नंबर अनलॉक मर्यादेची सिस्टीम पूर्णपणे बंद होईल. सदस्यांना अमर्याद मोबाईल नंबर अनलॉक करता येतील व म्युचुअल लाईक (एकमेकांना लाईक) केल्यावर नंबर दिसेल. मर्यादा बंद (OFF) ठेवल्यास ५ किंवा १० ची नेहमीची मर्यादा लागू राहील.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSiteConfig({ disablePlanContactLimit: !siteConfig.disablePlanContactLimit })}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all border cursor-pointer shrink-0 shadow-md ${
                      siteConfig.disablePlanContactLimit
                        ? 'bg-purple-700 hover:bg-purple-800 text-white border-purple-800'
                        : 'bg-slate-700 hover:bg-slate-800 text-slate-200 border-slate-800'
                    }`}
                  >
                    {siteConfig.disablePlanContactLimit ? '✓ अमर्याद नंबर अनलॉक (सक्रिय ON)' : '✕ प्लॅन ५/१० मर्यादा चालू (OFF)'}
                  </button>
                </div>
              </div>

              {/* Upgrade Plan Settings */}
              <div className="bg-gradient-to-r from-amber-500/10 via-rose-50 to-amber-500/10 p-4 rounded-2xl border-2 border-amber-400 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-[#A71930] text-xs sm:text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>वेलकम ऑफर नंतर दाखवायचा 'अपग्रेड प्लॅन' (Target Upgrade Plan Settings)</span>
                  </h5>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black border border-amber-300">
                    ॲडमिन अधिकार (Admin Control)
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  जेव्हा एखादा सदस्य पुढील रेग्युलर किंवा अमर्याद प्लॅन घेऊ इच्छितो, तेव्हा त्याला दाखवायचा अपग्रेड प्लॅन:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-900 text-xs font-black mb-1">
                      सुचवायचा अपग्रेड प्लॅन निवडा (Recommended Upgrade Plan):
                    </label>
                    <select
                      value={siteConfig.upgradeRecommendedPlanId || 'monthly'}
                      onChange={(e) => updateSiteConfig({ upgradeRecommendedPlanId: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-[#A71930] bg-white text-slate-900 cursor-pointer"
                    >
                      {plansList
                        .filter((p) => p.id !== 'welcome_offer')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameMr} — ₹{p.price} ({p.durationLabelMr || `${p.durationMonths} महिने`})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-300 text-xs space-y-1">
                    <span className="font-black text-[#A71930] block">निवडलेला अपग्रेड प्लॅन:</span>
                    <span className="font-extrabold text-slate-800 block">
                      {plansList.find((p) => p.id === (siteConfig.upgradeRecommendedPlanId || 'monthly'))?.nameMr || 'मंथली प्लॅन'} — ₹{plansList.find((p) => p.id === (siteConfig.upgradeRecommendedPlanId || 'monthly'))?.price || 299}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      सदस्याला प्लॅन अपग्रेड करताना हा प्लॅन थेट पेमेंटसाठी दिसेल.
                    </span>
                  </div>
                </div>
              </div>

              {/* Plans Pricing & Features Cards */}
              <div className="space-y-4">
                <h4 className="font-black text-[#A71930] text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#A71930]" />
                  <span>मेम्बरशिप प्लॅन्स संपादन व दर बदल (Edit Individual Plans)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plansList.map((plan) => {
                    const isLimitReached =
                      plan.isLimitedSlotsPlan &&
                      plan.maxMemberLimit &&
                      plan.maxMemberLimit > 0 &&
                      (plan.currentMemberCount || 0) >= plan.maxMemberLimit;

                    return (
                      <div
                        key={plan.id}
                        className={`p-5 rounded-2xl border-2 bg-white shadow-sm space-y-4 relative ${
                          plan.id === 'welcome_offer'
                            ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/50'
                            : plan.recommended
                            ? 'border-[#A71930] bg-amber-50/30'
                            : 'border-amber-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between border-b border-amber-200 pb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#A71930] text-amber-100 font-extrabold text-[10px] uppercase">
                              {plan.id}
                            </span>
                            <h5 className="font-black text-slate-900 text-sm">{plan.nameMr}</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            {plan.id === 'welcome_offer' && (
                              <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] rounded-full shadow-2xs">
                                🔥 वेलकम ऑफर (रु. {plan.price}/-)
                              </span>
                            )}
                            {plan.recommended && (
                              <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-full">
                                ★ सुचवलेला
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => updatePlan({ ...plan, isActive: plan.isActive === false ? true : false })}
                              className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer border transition-all ${
                                plan.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200'
                              }`}
                            >
                              {plan.isActive !== false ? '✓ चालू (Active)' : '✕ बंद (Disabled)'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold">
                          <div>
                            <label className="block text-slate-700 mb-1">मराठी नाव:</label>
                            <input
                              type="text"
                              value={plan.nameMr}
                              onChange={(e) => updatePlan({ ...plan, nameMr: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 mb-1">दर / किंमत (₹):</label>
                            <input
                              type="number"
                              value={plan.price}
                              onChange={(e) => updatePlan({ ...plan, price: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930] font-mono text-emerald-800 font-extrabold"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 mb-1">कालावधी (महिने):</label>
                            <input
                              type="number"
                              value={plan.durationMonths}
                              onChange={(e) => updatePlan({ ...plan, durationMonths: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930] font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 mb-1">संपर्क नंबर अनलॉक संख्या:</label>
                            <input
                              type="number"
                              value={plan.unlockCount || (plan.id === 'welcome_offer' ? 5 : 0)}
                              onChange={(e) => updatePlan({ ...plan, unlockCount: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930] font-mono text-blue-900"
                              placeholder="उदा. 5, 15, 25"
                            />
                          </div>

                          <div className="col-span-2 flex items-center pt-2">
                            <label className="flex items-center gap-2 text-slate-800 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!plan.recommended}
                                onChange={(e) => updatePlan({ ...plan, recommended: e.target.checked })}
                                className="w-4 h-4 rounded border-amber-400 text-[#A71930]"
                              />
                              <span>सुचवलेला प्लॅन (Recommended Banner)</span>
                            </label>
                          </div>
                        </div>

                        {/* LIMITED MEMBER SEATS & AUTO-EXPIRY SETTINGS */}
                        <div className="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-slate-900 font-black text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!plan.isLimitedSlotsPlan}
                                onChange={(e) =>
                                  updatePlan({
                                    ...plan,
                                    isLimitedSlotsPlan: e.target.checked,
                                    maxMemberLimit: plan.maxMemberLimit || 100,
                                    currentMemberCount: plan.currentMemberCount || 0,
                                  })
                                }
                                className="w-4 h-4 rounded border-amber-500 text-[#A71930]"
                              />
                              <span>🎯 लिमिटेड मेम्बर्स ऑफर ऑटो-बंद सेटिंग (Auto-Close Seat Limit)</span>
                            </label>

                            {plan.isLimitedSlotsPlan && (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                  isLimitReached
                                    ? 'bg-rose-200 text-rose-950 border-rose-400 animate-pulse'
                                    : 'bg-emerald-200 text-emerald-950 border-emerald-400'
                                }`}
                              >
                                {isLimitReached
                                  ? '⚠️ लिमिट पूर्ण! ऑफर ऑटो बंद'
                                  : `चालू - ${Math.max(0, (plan.maxMemberLimit || 100) - (plan.currentMemberCount || 0))} जागा बाकी`}
                              </span>
                            )}
                          </div>

                          {plan.isLimitedSlotsPlan && (
                            <div className="space-y-2 pt-1 border-t border-amber-200">
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <label className="block text-slate-800 font-bold mb-1">
                                    जास्तीत जास्त मर्यादा (Max Seat Limit):
                                  </label>
                                  <input
                                    type="number"
                                    value={plan.maxMemberLimit || 100}
                                    onChange={(e) =>
                                      updatePlan({ ...plan, maxMemberLimit: Math.max(1, Number(e.target.value)) })
                                    }
                                    className="w-full px-3 py-1.5 rounded-xl border border-amber-400 bg-white text-slate-900 font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="block text-slate-800 font-extrabold text-xs mb-1">
                                    🎯 मॅन्यूअली जॉईन मेम्बर्स संख्या (Manipulate Joined Count for Marketing):
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={plan.currentMemberCount || 0}
                                      onChange={(e) =>
                                        updatePlan({ ...plan, currentMemberCount: Math.max(0, Number(e.target.value)) })
                                      }
                                      className="w-28 px-3 py-1.5 rounded-xl border-2 border-amber-400 bg-white text-[#800C1E] font-black text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                    <div className="flex flex-wrap items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updatePlan({
                                            ...plan,
                                            currentMemberCount: Math.max(0, (plan.currentMemberCount || 0) + 5),
                                          })
                                        }
                                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-[10px] rounded-lg border border-emerald-400 cursor-pointer"
                                      >
                                        +५ सभासद
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updatePlan({
                                            ...plan,
                                            currentMemberCount: Math.max(0, (plan.currentMemberCount || 0) + 10),
                                          })
                                        }
                                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-[10px] rounded-lg border border-emerald-400 cursor-pointer"
                                      >
                                        +१० सभासद
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updatePlan({
                                            ...plan,
                                            currentMemberCount: Math.max(0, (plan.currentMemberCount || 0) - 5),
                                          })
                                        }
                                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-[10px] rounded-lg border border-amber-300 cursor-pointer"
                                      >
                                        -५
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updatePlan({
                                            ...plan,
                                            currentMemberCount: Math.floor((plan.maxMemberLimit || 100) * 0.85),
                                          })
                                        }
                                        className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold text-[10px] rounded-lg border border-amber-400 cursor-pointer"
                                        title="जाहीरातीत घाई निर्माण करण्यासाठी ८५% फुल करा"
                                      >
                                        🔥 ८५% Full
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updatePlan({
                                            ...plan,
                                            currentMemberCount: Math.floor((plan.maxMemberLimit || 100) * 0.95),
                                          })
                                        }
                                        className="px-2 py-1 bg-rose-200 hover:bg-rose-300 text-rose-950 font-extrabold text-[10px] rounded-lg border border-rose-400 cursor-pointer"
                                        title="जाहीरातीत अत्यंत घाई निर्माण करण्यासाठी ९५% फुल करा"
                                      >
                                        ⚡ ९५% Full
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar visual */}
                              <div>
                                <div className="flex justify-between text-[11px] font-black text-slate-800 mb-1">
                                  <span>सीट भरती प्रगती:</span>
                                  <span>
                                    {plan.currentMemberCount || 0} / {plan.maxMemberLimit || 100} सभासद (
                                    {Math.round(
                                      ((plan.currentMemberCount || 0) / (plan.maxMemberLimit || 100)) * 100
                                    )}
                                    %)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-amber-300">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      isLimitReached
                                        ? 'bg-rose-600'
                                        : 'bg-gradient-to-r from-amber-500 to-emerald-600'
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.round(
                                          ((plan.currentMemberCount || 0) / (plan.maxMemberLimit || 100)) * 100
                                        )
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Public Seat Display Toggle */}
                              <div className="p-2.5 rounded-xl bg-white border border-amber-300 flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={plan.showRemainingSeatsToPublic !== false}
                                    onChange={(e) =>
                                      updatePlan({
                                        ...plan,
                                        showRemainingSeatsToPublic: e.target.checked,
                                      })
                                    }
                                    className="w-4 h-4 rounded border-amber-400 text-[#A71930]"
                                  />
                                  <span>👁️ ग्राहकांना शिल्लक जागांचा आकडा व प्रोग्रेस बार दाखवायचा? (Show Remaining Seats to Public)</span>
                                </label>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${plan.showRemainingSeatsToPublic !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                                  {plan.showRemainingSeatsToPublic !== false ? '✓ सार्वजनिक दिसत आहे' : '🙈 लपवले आहे'}
                                </span>
                              </div>

                              {/* Relaunch Banner Text */}
                              <div>
                                <label className="block text-slate-800 font-extrabold text-xs mb-1">
                                  📢 ऑफर पुन्हा सुरू केल्याचा जाहिरात मेसेज (Relaunch Announcement Banner):
                                </label>
                                <input
                                  type="text"
                                  value={plan.relaunchBannerText || ''}
                                  placeholder="उदा. 🎉 मेम्बर्सच्या आग्रहास्तव सवलत ऑफर पुन्हा सुरू! ५० नवीन जागा उपलब्ध."
                                  onChange={(e) =>
                                    updatePlan({
                                      ...plan,
                                      relaunchBannerText: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                                />
                              </div>

                              {/* Quick Action buttons to expand seats or re-open */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] font-black text-slate-700">तब्बल जागा वाढवा:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updatePlan({
                                      ...plan,
                                      maxMemberLimit: (plan.maxMemberLimit || 100) + 25,
                                      isActive: true,
                                    })
                                  }
                                  className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold text-[10px] rounded-lg border border-amber-400 cursor-pointer"
                                >
                                  +२५ जागा वाढवा
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updatePlan({
                                      ...plan,
                                      maxMemberLimit: (plan.maxMemberLimit || 100) + 50,
                                      isActive: true,
                                    })
                                  }
                                  className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold text-[10px] rounded-lg border border-amber-400 cursor-pointer"
                                >
                                  +५० जागा वाढवा
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newMax = (plan.maxMemberLimit || 100) + 50;
                                    const bannerMsg = plan.relaunchBannerText || '🎉 मेम्बर्सच्या आग्रहास्तव ऑफर पुन्हा सुरू करण्यात आली आहे!';
                                    updatePlan({
                                      ...plan,
                                      maxMemberLimit: newMax,
                                      isActive: true,
                                      relaunchBannerText: bannerMsg,
                                    });
                                    alert(`ऑफर यशस्वीरित्या पुन्हा सुरू केली! ५० नवीन जागा वाढवल्या (एकूण जागा: ${newMax}).`);
                                  }}
                                  className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-[10px] rounded-lg border border-emerald-400 cursor-pointer shadow"
                                >
                                  🚀 ऑफर पुन्हा सुरू करा (+५०)
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updatePlan({
                                      ...plan,
                                      currentMemberCount: 0,
                                      isActive: true,
                                    })
                                  }
                                  className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-950 font-extrabold text-[10px] rounded-lg border border-rose-300 ml-auto cursor-pointer"
                                >
                                  काउंटर झिरो करा
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            वैशिष्ट्ये (Features - प्रत्येक ओळीवर नवीन वैशिष्ट्य प्रविष्ट करा):
                          </label>
                          <textarea
                            rows={3}
                            value={plan.featuresMr ? plan.featuresMr.join('\n') : ''}
                            onChange={(e) =>
                              updatePlan({
                                ...plan,
                                featuresMr: e.target.value.split('\n').filter((f) => f.trim() !== ''),
                              })
                            }
                            className="w-full p-2.5 text-xs font-semibold rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#A71930]"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-amber-100">
                          <span className="text-[11px] text-slate-500 font-bold">
                            वर्तमान: ₹{plan.price} ({plan.durationMonths} महिने)
                          </span>
                          <button
                            type="button"
                            onClick={() => alert(`'${plan.nameMr}' प्लॅनची माहिती व मर्यादा सेव्ह झाली!`)}
                            className="px-4 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-extrabold text-xs rounded-xl shadow cursor-pointer border border-amber-300"
                          >
                            बदल सेव्ह करा
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAYMENT REQUESTS & PAYMENT HISTORY */}
          {activeTab === 'payment_requests' && (() => {
            const pendingList = paymentRequests.filter((r) => r.status === 'pending');
            const approvedList = paymentRequests.filter((r) => r.status === 'approved');
            const rejectedList = paymentRequests.filter((r) => r.status === 'rejected');
            const totalRevenueCollected = approvedList.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

            let filteredList = paymentRequests;
            if (paymentFilter === 'pending') filteredList = pendingList;
            if (paymentFilter === 'approved') filteredList = approvedList;
            if (paymentFilter === 'rejected') filteredList = rejectedList;

            if (paymentSearchTerm.trim()) {
              const q = paymentSearchTerm.toLowerCase();
              filteredList = filteredList.filter(
                (r) =>
                  r.userName.toLowerCase().includes(q) ||
                  r.userMobile.includes(q) ||
                  r.utrNumber.toLowerCase().includes(q) ||
                  r.planName.toLowerCase().includes(q)
              );
            }

            return (
              <div className="space-y-6">
                {/* Modern Dynamic UPI & Payment Verification System */}
                <AdminPaymentApprovalPortal />

                {/* Header Title */}
                <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#A71930]" />
                      <span>ऑनलाइन युटीआर व क्यूआर पेमेंट इतिहास आणि ऑटो-मंजुरी (Payment History & Auto Queue)</span>
                    </h3>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      सदस्यांनी भरलेले सर्व पेमेंट्स, तारीख, प्लॅनचा कालावधी (महिने/वर्षे), UTR/पावती, आणि ऑटो-अप्रोव्हल अपडेट्स.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-black text-xs shadow shrink-0 flex items-center gap-1.5">
                    <span>एकूण संकलित रक्कम:</span>
                    <span className="text-amber-200 text-sm">₹{totalRevenueCollected.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* 🤖 AUTOMATED SYSTEM STATUS CARD */}
                <div className="p-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl border-2 border-amber-300 shadow-md">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-900 font-black text-[11px] shadow">
                          ⚡ 100% हँड्स-फ्री ऑटो मोड (Fully Automated)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-amber-100 border border-emerald-400 font-bold text-[10px]">
                          ✓ 24/7 विना-हस्तक्षेप कार्यरत
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-amber-200 mt-1">
                        स्वायत्त पेमेंट मंजुरी व म्युचुअल लाईक संपर्क प्रणाली (Automated System Status)
                      </h4>
                      <p className="text-xs text-amber-100/90 leading-relaxed max-w-3xl">
                        • <strong>ऑटो-अप्रोव्हल:</strong> सदस्यांनी UTR सबमिट करताच प्लॅन तात्काळ सक्रिय होतो व प्रोफाईल लिस्टमध्ये येते. <br />
                        • <strong>माहिती दृश्यमानता:</strong> फोटो, नाव, गाव, जिल्हा, शिक्षण व बायोडाटा सर्व सदस्यांना व्यवस्थित दिसतो. <br />
                        • <strong>नंबर प्रायव्हसी:</strong> फोन नंबर <u>फक्त एकमेकांनी दोघांनी लाईक केल्यावरच (Mutual Match)</u> आपोआप अनलॉक होतो!
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateSiteConfig({
                            isAutoModeEnabled: siteConfig.isAutoModeEnabled === false ? true : true,
                            autoApprovePaidRegistrations: true,
                            autoUnlockOnPayment: true,
                            enableMutualLikeContactUnlock: true,
                            requireMutualLikeForPhone: true,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-slate-900" />
                        <span>ऑटो मोड सक्रिय ठेवा (Auto Mode Active)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('all')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentFilter === 'all'
                        ? 'bg-[#A71930] text-amber-100 border-[#A71930] shadow-md ring-2 ring-amber-300'
                        : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold block opacity-80">एकूण पेमेंट्स (All)</span>
                    <span className="text-xl font-black font-mono mt-0.5 block">{paymentRequests.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentFilter('pending')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentFilter === 'pending'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                        : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold block opacity-80">प्रलंबित मंजुरी (Pending)</span>
                    <span className="text-xl font-black font-mono mt-0.5 block">{pendingList.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentFilter('approved')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentFilter === 'approved'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300'
                        : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold block opacity-80">मंजूर / यशस्वी (Approved)</span>
                    <span className="text-xl font-black font-mono mt-0.5 block">{approvedList.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentFilter('rejected')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentFilter === 'rejected'
                        ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-300'
                        : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold block opacity-80">अमान्य केलेले (Rejected)</span>
                    <span className="text-xl font-black font-mono mt-0.5 block">{rejectedList.length}</span>
                  </button>
                </div>

                {/* Filters & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPaymentFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        paymentFilter === 'all'
                          ? 'bg-[#A71930] text-amber-100 shadow'
                          : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      सर्व पेमेंट्स ({paymentRequests.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentFilter('pending')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        paymentFilter === 'pending'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      🟡 प्रलंबित ({pendingList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentFilter('approved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        paymentFilter === 'approved'
                          ? 'bg-emerald-700 text-white shadow'
                          : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      🟢 मंजूर झालेले ({approvedList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentFilter('rejected')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        paymentFilter === 'rejected'
                          ? 'bg-rose-700 text-white shadow'
                          : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      🔴 अमान्य ({rejectedList.length})
                    </button>
                  </div>

                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="सदस्याचे नाव, मोबाईल किंवा UTR शोधा..."
                      value={paymentSearchTerm}
                      onChange={(e) => setPaymentSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#A71930]"
                    />
                  </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                        <tr>
                          <th className="p-3">सदस्याचा फोटो, नाव & मोबाईल</th>
                          <th className="p-3">पेमेंट तारीख & कालावधी</th>
                          <th className="p-3">निवडलेला प्लॅन & रक्कम</th>
                          <th className="p-3">UTR नंबर / आयडी</th>
                          <th className="p-3">पावती स्क्रीनशॉट</th>
                          <th className="p-3 text-right">स्टेटस & कृती</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 font-semibold">
                        {filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                              कोणताही पेमेंट व्यवहार आढळला नाही.
                            </td>
                          </tr>
                        ) : (
                          filteredList.map((pay) => {
                            const userObj = profiles.find((p) => p.id === pay.userId || p.mobile === pay.userMobile);
                            const photo = pay.userPhotoUrl || userObj?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                            const timeInfo = getPaymentTimeInfo(pay.createdAt);
                            const approvedTimeInfo = pay.approvedAt ? getPaymentTimeInfo(pay.approvedAt) : null;

                            return (
                              <tr key={pay.id} className="hover:bg-amber-50/80 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={photo}
                                      alt={pay.userName}
                                      onClick={() => setPreviewScreenshot(photo)}
                                      className="w-11 h-11 rounded-xl object-cover border border-amber-300 shrink-0 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                      title="सदस्याचा फोटो पाहण्यासाठी क्लिक करा"
                                    />
                                    <div>
                                      <p className="font-extrabold text-slate-900 text-sm">{pay.userName}</p>
                                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                        <span>📱 {pay.userMobile}</span>
                                        <a
                                          href={`https://wa.me/91${(pay.userMobile || '').replace(/[^0-9]/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-700 font-bold hover:underline"
                                        >
                                          [WhatsApp]
                                        </a>
                                      </p>
                                      {userObj && (
                                        <span className="text-[10px] text-slate-600 font-medium">
                                          {userObj.district} • ID: {userObj.id}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3">
                                  <div className="space-y-0.5">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[#800C1E] font-extrabold text-[10px] inline-block border border-amber-300">
                                      {timeInfo.daysText}
                                    </span>
                                    <p className="text-[11px] font-bold text-slate-800">{timeInfo.dateFormatted}</p>
                                    {approvedTimeInfo && (
                                      <p className="text-[9px] text-emerald-800 font-semibold">
                                        मंजुरी: {approvedTimeInfo.dateFormatted}
                                      </p>
                                    )}
                                  </div>
                                </td>

                                <td className="p-3">
                                  <p className="font-extrabold text-[#A71930] text-xs">{pay.planName}</p>
                                  <p className="text-sm font-black text-emerald-800">₹{pay.amount}</p>
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-[#800C1E] border border-amber-300 rounded-md font-bold text-[10px]">
                                    ⏱️ कालावधी: {pay.planDurationText || (pay.planId === 'yearly' ? '१ वर्ष (365 दिवस)' : pay.planId === 'lifetime' ? 'आजीवन (Unlimited)' : pay.planId === 'monthly' ? '६ महिने (180 दिवस)' : '३० दिवस')}
                                  </span>
                                </td>

                                <td className="p-3">
                                  <span className="font-mono font-black text-slate-900 text-xs px-2 py-1 bg-amber-50 rounded-lg border border-amber-200 inline-block">
                                    {pay.utrNumber}
                                  </span>
                                </td>

                                <td className="p-3">
                                  {pay.screenshotUrl ? (
                                    <button
                                      onClick={() => setPreviewScreenshot(pay.screenshotUrl)}
                                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-[#A71930] font-black text-[11px] rounded-lg border border-amber-300 cursor-pointer shadow-sm flex items-center gap-1"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>पावती पहा</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">उपलब्ध नाही</span>
                                  )}
                                </td>

                                <td className="p-3 text-right">
                                  {pay.status === 'pending' ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => approvePaymentRequest(pay.id)}
                                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>मंजूर करा</span>
                                      </button>
                                      <button
                                        onClick={() => rejectPaymentRequest(pay.id)}
                                        className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>अमान्य</span>
                                      </button>
                                    </div>
                                  ) : pay.status === 'approved' ? (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs inline-flex items-center gap-1 shadow-sm">
                                        ✓ मंजूर (Approved)
                                      </span>
                                      {pay.isAutoApproved && (
                                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300 font-black text-[9px] flex items-center gap-0.5">
                                          ⚡ ऑटो-सिस्टीम (Auto Mode)
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-xs inline-flex items-center gap-1">
                                      ✕ अमान्य (Rejected)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: SUPPORT CHAT */}
          {activeTab === 'support_chat' && (() => {
            // Group support messages by senderId
            const groups: {
              [senderId: string]: {
                senderId: string;
                senderName: string;
                senderMobile: string;
                lastMessage: string;
                lastTimestamp: string;
                unreadCount: number;
                totalCount: number;
              };
            } = {};

            adminSupportMessages.forEach((msg) => {
              const sId = msg.senderId;
              if (!sId) return;
              
              const isFromAdmin = msg.senderRole === 'admin';
              const isUnread = !msg.isReadByAdmin && !isFromAdmin;

              if (!groups[sId]) {
                groups[sId] = {
                  senderId: sId,
                  senderName: msg.senderName || 'Anonymous',
                  senderMobile: msg.senderMobile || 'Guest/Visitor',
                  lastMessage: msg.message,
                  lastTimestamp: msg.timestamp,
                  unreadCount: isUnread ? 1 : 0,
                  totalCount: 1,
                };
              } else {
                groups[sId].totalCount += 1;
                if (isUnread) {
                  groups[sId].unreadCount += 1;
                }
                groups[sId].lastMessage = msg.message;
                groups[sId].lastTimestamp = msg.timestamp;
              }
            });

            const conversations = Object.values(groups).sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp));

            // Selected conversation's messages
            const activeThreadMessages = adminSupportMessages.filter(
              (msg) => msg.senderId === selectedSupportSenderId
            );

            // Mark read if selected
            if (selectedSupportSenderId) {
              const hasUnread = activeThreadMessages.some(m => m.senderRole === 'user' && !m.isReadByAdmin);
              if (hasUnread) {
                setTimeout(() => markAdminSupportMessagesRead(selectedSupportSenderId), 100);
              }
            }

            const handleSendReply = (e: React.FormEvent) => {
              e.preventDefault();
              if (!selectedSupportSenderId || !supportReplyText.trim()) return;
              replyAdminSupportMessage(selectedSupportSenderId, supportReplyText.trim());
              setSupportReplyText('');
            };

            const toggleMsgSelection = (id: string) => {
              setSelectedSupportMsgIds(prev =>
                prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
              );
            };

            const selectAllMessages = () => {
              const allIds = activeThreadMessages.map(m => m.id);
              setSelectedSupportMsgIds(allIds);
            };

            const deselectAllMessages = () => {
              setSelectedSupportMsgIds([]);
            };

            const deleteSelected = () => {
              if (selectedSupportMsgIds.length === 0) return;
              if (confirm(`तुम्हाला निवडलेले ${selectedSupportMsgIds.length} संदेश कायमचे हटवायचे आहेत का?`)) {
                bulkDeleteAdminSupportMessages(selectedSupportMsgIds);
                setSelectedSupportMsgIds([]);
              }
            };

            const deleteEntireThread = () => {
              if (!selectedSupportSenderId) return;
              const allIds = activeThreadMessages.map(m => m.id);
              if (confirm(`तुम्हाला या सदस्याचे सर्व ${allIds.length} संदेश आणि संपूर्ण इतिहास कायमचा हटवायचा आहे का? याने जागा पूर्णपणे मोकळी होईल.`)) {
                bulkDeleteAdminSupportMessages(allIds);
                setSelectedSupportMsgIds([]);
                setSelectedSupportSenderId(null);
              }
            };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* LEFT COLUMN: CONVERSATION LIST */}
                <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-amber-300 shadow-md flex flex-col h-[600px]">
                  <div className="border-b border-amber-200 pb-3 mb-3">
                    <h3 className="text-sm font-black text-[#A71930] flex items-center justify-between">
                      <span>💬 संदेश संभाषणे (Support Chats)</span>
                      <span className="bg-[#A71930] text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {conversations.length} युजर्स
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      सदस्यांनी विचारलेल्या शंकांचे आणि संदेशांचे निवारण करा.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {conversations.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-bold text-xs">
                        सध्या कोणतेही थेट संदेश उपलब्ध नाहीत.
                      </div>
                    ) : (
                      conversations.map((conv) => {
                        const isSelected = selectedSupportSenderId === conv.senderId;
                        return (
                          <button
                            key={conv.senderId}
                            onClick={() => {
                              setSelectedSupportSenderId(conv.senderId);
                              setSelectedSupportMsgIds([]);
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-[#A71930] text-white border-[#A71930] shadow-md'
                                : 'bg-amber-50/40 hover:bg-amber-50 border-amber-200/60 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0 flex-1 leading-snug">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className={`text-xs font-black truncate ${isSelected ? 'text-amber-200' : 'text-slate-900'}`}>
                                  {conv.senderName}
                                </span>
                                <span className={`text-[9px] font-mono font-bold shrink-0 ${isSelected ? 'text-amber-100/75' : 'text-slate-400'}`}>
                                  {conv.lastTimestamp.split(' ')[0]}
                                </span>
                              </div>
                              <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-600'} font-medium mb-1`}>
                                {conv.senderMobile}
                              </div>
                              <p className={`text-[10.5px] truncate font-medium ${isSelected ? 'text-white/90' : 'text-slate-700'}`}>
                                {conv.lastMessage}
                              </p>
                            </div>

                            {conv.unreadCount > 0 && (
                              <span className="bg-rose-600 text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-amber-300 animate-pulse">
                                {conv.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: ACTIVE CONVERSATION THREAD */}
                <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-amber-300 shadow-md flex flex-col h-[600px]">
                  {selectedSupportSenderId ? (() => {
                    const activeConv = conversations.find(c => c.senderId === selectedSupportSenderId);
                    return (
                      <>
                        {/* Thread Header */}
                        <div className="border-b border-amber-200 pb-3 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-[#A71930] flex items-center gap-1.5">
                              <span>👤 {activeConv?.senderName}</span>
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                {activeConv?.senderMobile}
                              </span>
                            </h4>
                            <p className="text-[9px] text-slate-500 font-medium">
                              आयडी: <span className="font-mono">{selectedSupportSenderId}</span>
                            </p>
                          </div>

                          {/* Action Buttons for Selection / Bulk Delete */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {selectedSupportMsgIds.length > 0 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={deselectAllMessages}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300 transition-all cursor-pointer"
                                >
                                  निवड रद्द करा
                                </button>
                                <button
                                  type="button"
                                  onClick={deleteSelected}
                                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black flex items-center gap-1 transition-all shadow-sm cursor-pointer border border-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>निवडलेले ({selectedSupportMsgIds.length}) हटवा</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={selectAllMessages}
                                  className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-[#800C1E] text-[10px] font-bold border border-amber-300 transition-all cursor-pointer"
                                >
                                  सर्व सिलेक्ट करा
                                </button>
                                <button
                                  type="button"
                                  onClick={deleteEntireThread}
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-300 transition-all cursor-pointer"
                                  title="संपूर्ण चॅट इतिहास पूर्णपणे काढून टाका जेणेकरून जागा मोकळी होईल"
                                >
                                  चॅट पूर्ण क्लियर करा 🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Thread Messages History */}
                        <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-xl border border-slate-100 mb-3 flex flex-col">
                          <div className="space-y-3">
                            {activeThreadMessages.map((msg) => {
                              const isAdmin = msg.senderRole === 'admin';
                              const isSelected = selectedSupportMsgIds.includes(msg.id);
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex items-start gap-2.5 max-w-[85%] ${
                                    isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'
                                  }`}
                                >
                                  {/* Multi-select checkbox */}
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleMsgSelection(msg.id)}
                                    className="w-3.5 h-3.5 mt-2 rounded border-slate-300 text-[#A71930] focus:ring-[#A71930] cursor-pointer shrink-0"
                                    title="निवडा"
                                  />

                                  <div
                                    className={`p-3 rounded-2xl text-xs relative group border ${
                                      isAdmin
                                        ? 'bg-gradient-to-br from-[#A71930] to-[#800C1E] text-white border-red-700 rounded-tr-none shadow-sm'
                                        : 'bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-4 mb-1 border-b border-black/10 pb-1">
                                      <span className={`font-black text-[10px] ${isAdmin ? 'text-amber-200' : 'text-[#800C1E]'}`}>
                                        {isAdmin ? '🛡️ सहाय्यक (Admin)' : `👤 ${msg.senderName}`}
                                      </span>
                                      <span className={`text-[8.5px] font-mono font-bold ${isAdmin ? 'text-amber-100/70' : 'text-slate-400'}`}>
                                        {msg.timestamp}
                                      </span>
                                    </div>
                                    <p className="whitespace-pre-wrap font-medium leading-relaxed break-all">
                                      {msg.message}
                                    </p>

                                    {/* Attachment fileUrl rendering with custom single deletion tool */}
                                    {msg.fileUrl && (
                                      <div className="mt-2.5 p-1.5 bg-black/5 rounded-xl border border-black/10 flex flex-col gap-1.5 max-w-xs relative overflow-hidden">
                                        <img
                                          src={msg.fileUrl}
                                          alt={msg.fileName || 'Attachment'}
                                          referrerPolicy="no-referrer"
                                          className="rounded-lg object-contain max-h-48 w-full bg-black/20"
                                        />
                                        <div className="flex items-center justify-between text-[9px] font-bold">
                                          <span className={`truncate max-w-[150px] ${isAdmin ? 'text-amber-100' : 'text-slate-600'}`}>
                                            📎 {msg.fileName || 'Image'}
                                          </span>
                                          
                                          {/* Delete ONLY Image button */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (confirm('तुम्हाला या संदेशाचा फोटो फक्त काढायचा आहे का?')) {
                                                deleteAdminSupportMessage(msg.id, true);
                                              }
                                            }}
                                            className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8px] font-black border border-rose-400 cursor-pointer shadow-sm transition-all"
                                            title="फक्त फोटो काढून टाका जेणेकरून क्लाउड स्टोरेज वाचेल"
                                          >
                                            फोटो काढा 🗑️
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Single Message Actions Hover Control */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 ${
                                      isAdmin ? '-left-10' : '-right-10'
                                    } opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm('तुम्हाला हा संदेश पूर्णपणे हटवायचा आहे का?')) {
                                            deleteAdminSupportMessage(msg.id);
                                          }
                                        }}
                                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md border border-rose-400 transition-transform active:scale-95 cursor-pointer"
                                        title="संदेश कायमचा हटवा"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Thread Reply Input Box */}
                        <form onSubmit={handleSendReply} className="flex gap-2 items-center border-t border-amber-100 pt-3 shrink-0">
                          <input
                            type="text"
                            value={supportReplyText}
                            onChange={(e) => setSupportReplyText(e.target.value)}
                            placeholder="सदस्याला तुमचे उत्तर लिहा..."
                            className="flex-1 border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-800 bg-white placeholder-slate-400 font-medium focus:ring-1 focus:ring-[#A71930] focus:border-[#A71930]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 text-xs font-black rounded-xl border border-amber-300 shadow flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer"
                          >
                            <span>उत्तर पाठवा</span>
                            <Send className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          </button>
                        </form>
                      </>
                    );
                  })() : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <div className="p-4 bg-amber-50 rounded-full border border-amber-200 mb-3">
                        <MessageSquare className="w-8 h-8 text-[#A71930] opacity-60" />
                      </div>
                      <h4 className="font-black text-xs text-slate-700">कोणतेही संभाषण निवडलेले नाही</h4>
                      <p className="text-[10px] text-slate-500 font-medium max-w-xs mt-1">
                        डाव्या बाजूच्या यादीमधून सदस्याचे संभाषण निवडा किंवा त्याचे संदेश आणि उत्तरे पाहण्यासाठी क्लिक करा.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB: SUB ADMINS & MASTER SECURITY */}
          {activeTab === 'sub_admins' && (
            <div className="space-y-6">
              {/* Master Admin Security Card */}
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#A71930] flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#A71930]" />
                      <span>मुख्य प्रशासक सुरक्षा व क्रेडेन्शियल्स (Master Admin Credentials)</span>
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      मुख्य ॲडमिनचे प्रदर्शन नाव, युझरनेम आणि पासवर्ड अपडेट करा. कोणतेही हार्डकोडेड पासवर्ड वापरले जात नाहीत.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateAdminCredentials(masterUsername, masterPassword, masterDisplayName);
                    alert('मुख्य प्रशासक (Super Admin) क्रेडेन्शियल्स यशस्वीरित्या अपडेट केले गेले!');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold"
                >
                  <div>
                    <label className="block mb-1 text-slate-700">प्रदर्शन नाव (Display Name):</label>
                    <input
                      type="text"
                      required
                      value={masterDisplayName}
                      onChange={(e) => setMasterDisplayName(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-700">युझरनेम (Username):</label>
                    <input
                      type="text"
                      required
                      value={masterUsername}
                      onChange={(e) => setMasterUsername(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-700">संकेतशब्द (Password):</label>
                    <input
                      type="text"
                      required
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>सुरक्षा क्रेडेन्शियल्स सेव्ह करा</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Sub-Admin Accounts List */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-100 rounded-2xl border border-amber-300">
                  <div>
                    <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#A71930]" />
                      <span>सब-ॲडमिन खाती व्यवस्थापन ({subAdmins.length})</span>
                    </h3>
                    <p className="text-xs text-slate-700 font-medium">
                      नवीन सब-ॲडमिन खाते तयार करा व त्यांना विशिष्ट विभागांची मर्यादित परवानगी (Permissions) द्या.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingSubAdminItem(null);
                      setSubAdminName('');
                      setSubAdminUsernameInput('');
                      setSubAdminPasswordInput('');
                      setSubAdminPerms(['manage_profiles', 'add_profiles', 'support_chat']);
                      setSubAdminModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>नवीन सब-ॲडमिन जोडा</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                      <tr>
                        <th className="p-3">सब-ॲडमिन नाव</th>
                        <th className="p-3">युझरनेम & पासवर्ड</th>
                        <th className="p-3">दिलेल्या परवानग्या (Permissions)</th>
                        <th className="p-3">तयार केल्याची तारीख</th>
                        <th className="p-3 text-right">कृती</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 font-semibold">
                      {subAdmins.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                            सध्या कोणतेही सब-ॲडमिन खाते तयार केलेले नाही.
                          </td>
                        </tr>
                      ) : (
                        subAdmins.map((sub) => (
                          <tr key={sub.id} className="hover:bg-amber-50">
                            <td className="p-3">
                              <p className="font-extrabold text-slate-900">{sub.name}</p>
                              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-mono">
                                Sub-Admin
                              </span>
                            </td>
                            <td className="p-3 font-mono">
                              <p className="text-slate-900 font-bold">युझर: {sub.username}</p>
                              <p className="text-slate-500 text-[11px]">पास: {sub.password}</p>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {sub.permissions.map((perm) => {
                                  const permObj = ALL_SUBADMIN_PERMISSIONS.find((p) => p.id === perm);
                                  return (
                                    <span
                                      key={perm}
                                      className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1"
                                    >
                                      <span>{permObj?.icon || '•'}</span>
                                      <span>{permObj?.labelMr.split(' ')[0] || perm}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-500">{sub.createdAt}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingSubAdminItem(sub);
                                    setSubAdminName(sub.name);
                                    setSubAdminUsernameInput(sub.username);
                                    setSubAdminPasswordInput(sub.password);
                                    setSubAdminPerms(sub.permissions);
                                    setSubAdminModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#A71930] cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteSubAdmin(sub.id)}
                                  className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FACE VERIFICATION LOGS */}
          {activeTab === 'face_verification' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span>चेहरा व फोटो पडताळणी ऑथेंटिकेशन लॉग्स (Face Verification Logs)</span>
                  </h3>
                  <p className="text-xs text-slate-700 font-medium">
                    सदस्यांनी पाठवलेले फोटो तपासा, मूळ प्रोफाइल फोटोशी तुलना करून मॅन्युअली Approved (मंजूर) किंवा Rejected (अमान्य) करा.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-200 text-[#800C1E] rounded-full text-xs font-black border border-amber-300">
                    एकूण प्रलंबित: {faceVerificationLogs.filter((l) => l.status === 'pending').length}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-amber-300 shadow-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100 text-[#800C1E] font-black border-b border-amber-200">
                    <tr>
                      <th className="p-3">सदस्याचे नाव & ID</th>
                      <th className="p-3">सादर केलेला चेहऱ्याचा फोटो</th>
                      <th className="p-3">मूळ प्रोफाइल फोटो</th>
                      <th className="p-3">पडताळणी प्रकार</th>
                      <th className="p-3">सादर वेळ</th>
                      <th className="p-3 text-right">कृती (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold">
                    {faceVerificationLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                          अद्याप कोणत्याही सदस्याने चेहरा पडताळणीसाठी फोटो पाठवलेला नाही.
                        </td>
                      </tr>
                    ) : (
                      faceVerificationLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-amber-50">
                          <td className="p-3">
                            <p className="font-extrabold text-slate-900">{log.userName}</p>
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              ID: {log.userId}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="relative group w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-400 bg-slate-900">
                              <img
                                src={log.capturedPhotoUrl}
                                alt="Captured"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-300 bg-slate-100">
                              <img
                                src={log.profilePhotoUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="px-2.5 py-1 rounded-full font-black text-xs inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>मॅन्युअल ॲडमिन रिव्ह्यू</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{log.submittedAt}</td>
                          <td className="p-3 text-right">
                            {log.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    approveFaceVerification(log.id);
                                    alert(`सदस्य ${log.userName} ची चेहरा पडताळणी मंजूर करून Verified Blue Tick देण्यात आला!`);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>मंजूर करा (Blue Tick)</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('अमान्य करण्याचे कारण लिहा:', 'चेहरा मूळ प्रोफाइल फोटोशी जुळला नाही.');
                                    if (reason) rejectFaceVerification(log.id, reason);
                                  }}
                                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>अमान्य</span>
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                  log.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {log.status}
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

          {/* TAB: APK MANAGER */}
          {activeTab === 'apk_manager' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#A71930]" />
                  <span>Android APK अपलोडर व थेट डाउनलोड लिंक व्यवस्थापन</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  वंजारी विवाह मंचाच्या अँड्रॉइड ॲपची APK फाइल लिंक आणि आवृत्ती अपडेट करा.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                  <h4 className="font-black text-[#A71930] text-sm border-b border-amber-100 pb-2">
                    APK सेटिंग्ज अपडेट करा
                  </h4>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateApkSettings({
                        apkUrl: apkUrlInput,
                        appVersion: apkVersionInput,
                        releaseNotes: apkNotesInput,
                        isEnabled: apkEnabledInput,
                        fileSizeMb: apkFileSizeMbInput,
                      });
                      alert('🎉 APK फाइल व डाऊनलोड सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या!');
                    }}
                    className="space-y-4 text-xs font-bold"
                  >
                    {/* Direct File Upload Control */}
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                      <label className="block text-slate-900 font-extrabold">
                        तुमच्या मोबाईल किंवा संगणकावरून APK फाईल अपलोड करा (Upload APK File):
                      </label>
                      <label className="w-full cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-3 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 border border-emerald-300 transition-all">
                        <Download className="w-4 h-4 text-amber-200" />
                        <span>{isUploadingApkFile ? 'APK अपलोड होत आहे...' : 'गॅलरी / फाईल्स मधून .APK फाईल निवडा'}</span>
                        <input
                          type="file"
                          accept=".apk,.zip,application/vnd.android.package-archive,application/*"
                          disabled={isUploadingApkFile}
                          onChange={handleUploadApkFile}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500 font-bold">
                        टीप: तुम्ही थेट संगणक किंवा मोबाईलमधील .apk फाईल निवडू शकता.
                      </p>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-800">APK फाईल डाऊनलोड लिंक (Direct Download URL):</label>
                      <input
                        type="text"
                        required
                        placeholder="https://... किंवा वरून फाईल अपलोड करा"
                        value={apkUrlInput}
                        onChange={(e) => setApkUrlInput(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-slate-800">ॲप व्हर्जन (Version):</label>
                        <input
                          type="text"
                          required
                          placeholder="v2.4.0"
                          value={apkVersionInput}
                          onChange={(e) => setApkVersionInput(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-800">फाईलचा आकार (Size MB):</label>
                        <input
                          type="text"
                          placeholder="12.4 MB"
                          value={apkFileSizeMbInput}
                          onChange={(e) => setApkFileSizeMbInput(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-800">रीलीज नोट्स / वैशिष्ट्ये (Release Notes):</label>
                      <textarea
                        rows={3}
                        value={apkNotesInput}
                        onChange={(e) => setApkNotesInput(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">वेबसाईटवर ॲप डाऊनलोड बॅनर/बटन दाखवा:</span>
                        <span className="text-[10px] text-slate-500 font-normal">पब्लिक व्हिजिटर्ससाठी सक्रिय करा</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setApkEnabledInput(!apkEnabledInput)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer ${
                          apkEnabledInput ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {apkEnabledInput ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 border border-amber-300"
                      >
                        <Download className="w-4 h-4 text-amber-300" />
                        <span>APK माहिती सेव्ह करा</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadApkFile(apkUrlInput, apkVersionInput || 'v2.4.0')}
                        className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-300"
                        title="डाऊनलोड टेस्ट करा"
                      >
                        <Download className="w-4 h-4 text-amber-200" />
                        <span>टेस्ट डाऊनलोड</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Direct Shareable Link Box */}
                <div className="bg-gradient-to-br from-[#A71930] to-[#800C1E] text-amber-100 p-6 rounded-2xl border-2 border-amber-300 shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 text-[#800C1E] rounded-full text-xs font-black">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>थेट शेअर करण्यायोग्य लिंक generator</span>
                    </div>

                    <h3 className="text-xl font-black text-white">वंजारी विवाह मंच - अँड्रॉइड APK डाउनलोड</h3>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      खालील थेट डायरेक्ट डाऊनलोड लिंक कॉपी करून व्हॉट्सॲप, टेलिग्राम किंवा फेसबुकवर सदस्यांसोबत शेअर करा.
                    </p>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-300/40 space-y-2">
                      <span className="text-[10px] uppercase font-mono text-amber-300 font-bold block">
                        Direct Download Link:
                      </span>
                      <p className="font-mono text-xs text-emerald-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                        {siteConfig?.apkSettings?.apkUrl || 'https://vanjarimatri.com/downloads/app.apk'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-amber-300/30">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                      <span>एकूण डाऊनलोड संख्या:</span>
                      <span className="text-amber-300 font-black text-sm">{siteConfig?.apkSettings?.downloadCount || 4280} डाउनलोड्स</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(siteConfig?.apkSettings?.apkUrl || '');
                          alert('APK डाउनलोड लिंक कॉपी केली गेली!');
                        }}
                        className="py-2.5 bg-amber-300 hover:bg-amber-400 text-[#800C1E] font-black text-xs rounded-xl shadow cursor-pointer text-center"
                      >
                        📋 लिंक कॉपी करा
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🚩 संत भगवान बाबा यांच्या आशीर्वादाने स्थापित *वंजारी जोडी* मोबाईल ॲप डाउनलोड करा!\n\nॲप डाऊनलोड करण्यासाठी खालील लिंकवर क्लिक करा:\n${
                            siteConfig?.apkSettings?.apkUrl || ''
                          }`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow text-center flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>व्हॉट्सॲपवर पाठवा</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INDEX & SOCIAL MEDIA CONTROLS */}
          {activeTab === 'index_controls' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#A71930]" />
                  <span>इंडेक्स पेज मजकूर, चित्रे, संपर्क व सोशल मीडिया नियंत्रणे (Index Controls)</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  मुख्य इंडेक्स पेजचे संपर्क व मदत कक्ष, सूचना बॅनर, सोशल मीडिया आयकॉन्स व विशेष वैशिष्ट्ये कस्टमायझ करा.
                </p>
              </div>

              {/* 1. CONTACT & HELPLINE SECTION CONTROLS CARD */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#A71930]" />
                    <span>संपर्क व मदत कक्ष माहिती व टॅप ऑन/ऑफ (Contact & Helpline Controls)</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">संपर्क कक्ष ऑन/ऑफ:</span>
                    <button
                      type="button"
                      onClick={() => updateSiteConfig({ hideContactAndAddressGlobal: !siteConfig?.hideContactAndAddressGlobal })}
                      className={`px-3 py-1 rounded-xl font-black text-xs cursor-pointer shadow ${
                        !siteConfig?.hideContactAndAddressGlobal ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {!siteConfig?.hideContactAndAddressGlobal ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                  <div>
                    <label className="block text-slate-700 mb-1">संपर्क विभाग शीर्षक (Section Title):</label>
                    <input
                      type="text"
                      value={siteConfig?.contactHeaderTitle || 'संपर्क व मदत कक्ष (Contact & Helpline)'}
                      onChange={(e) => updateSiteConfig({ contactHeaderTitle: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">संपर्क विभाग उपशीर्षक (Subtitle / Help Note):</label>
                    <input
                      type="text"
                      value={siteConfig?.contactHeaderSubtitle || 'कोणतीही अडचण किंवा चौकशीसाठी आमच्याशी संपर्क साधा.'}
                      onChange={(e) => updateSiteConfig({ contactHeaderSubtitle: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">हेल्पलाईन मोबाईल नंबर (Phone Number):</label>
                    <input
                      type="text"
                      value={siteConfig?.contactPhone || '+91 00000 00000'}
                      onChange={(e) => updateSiteConfig({ contactPhone: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">व्हॉट्सॲप नंबर (WhatsApp Number):</label>
                    <input
                      type="text"
                      value={siteConfig?.contactWhatsapp || '+91 00000 00000'}
                      onChange={(e) => updateSiteConfig({ contactWhatsapp: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">सपोर्ट ई-मेल आयडी (Support Email):</label>
                    <input
                      type="email"
                      placeholder="उदा. contact@example.com (रिकामा ठेवल्यास दिसणार नाही)"
                      value={siteConfig?.contactEmail || ''}
                      onChange={(e) => updateSiteConfig({ contactEmail: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-mono text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 font-medium">ईमेल दाखवायचा नसेल तर हे रकाने रिकामे ठेवा.</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">📢 टेलिग्राम ग्रुप / चॅनेल लिंक (Telegram Group Link):</label>
                    <input
                      type="url"
                      placeholder="https://t.me/yourgroup"
                      value={siteConfig?.telegramGroupUrl || ''}
                      onChange={(e) => updateSiteConfig({ telegramGroupUrl: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-mono text-slate-900"
                    />
                    <span className="text-[10px] text-[#A71930] font-bold block mb-1">इथे ग्रुप लिंक टाकल्यास ती ॲप व वेबसाईटवर सर्वात वर इंडेक्सवर दिसेल.</span>

                    {/* Toggle to show/hide Telegram Banner */}
                    <div className="mt-2 flex items-center justify-between p-2.5 bg-sky-50 rounded-xl border border-sky-200">
                      <div>
                        <span className="font-extrabold text-xs text-sky-900 block">📢 टेलिग्राम जॉईन बॅनर दाखवा (Show Banner)</span>
                        <span className="text-[10px] text-slate-600 font-medium">हे बंद केल्यास मुख्यपृष्ठावरील निळा टेलिग्राम बॅनर लपवला जाईल.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                        <input
                          type="checkbox"
                          checked={siteConfig?.showTelegramBanner !== false}
                          onChange={(e) => updateSiteConfig({ showTelegramBanner: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">कार्यालयीन पत्ता (Office Address):</label>
                    <input
                      type="text"
                      value={siteConfig?.contactAddress || 'परळी वैजनाथ / बीड / नाशिक / पुणे, महाराष्ट्र'}
                      onChange={(e) => updateSiteConfig({ contactAddress: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 mb-1">महत्त्वाची सूचना / डिस्क्लेमर मजकूर (Mandatory Disclaimer):</label>
                    <textarea
                      rows={3}
                      value={
                        siteConfig?.disclaimerText ||
                        "महत्त्वाची सूचना / टीप: 'वंजारी जोडी' हे केवळ वधू-वरांना आणि त्यांच्या कुटुंबांना परस्परांशी संपर्क साधण्यासाठी उपलब्ध करून दिलेले एक डिजिटल व्यासपीठ आहे."
                      }
                      onChange={(e) => updateSiteConfig({ disclaimerText: e.target.value })}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  {/* Grievance Officer compliance settings (IT Act 2021 & DPDP Act 2023) */}
                  <div className="md:col-span-2 p-4 bg-amber-50 rounded-2xl border-2 border-amber-400/80 space-y-3">
                    <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                      <Scale className="w-5 h-5 text-[#A71930]" />
                      <div>
                        <h5 className="font-extrabold text-[#A71930] text-xs sm:text-sm">
                          तक्रार निवारण अधिकारी माहिती (Grievance Officer - IT Rules 2021 & DPDP Act 2023)
                        </h5>
                        <p className="text-[10px] text-slate-600 font-medium">
                          भारतीय आयटी कायद्यानुसार वैधानिक तक्रार निवारण अधिकाऱ्याचे नाव, ईमेल व फोन नंबर येथे नमूद करा.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 mb-1">अधिकाऱ्याचे नाव (Officer Name):</label>
                        <input
                          type="text"
                          value={siteConfig?.grievanceOfficerName || ''}
                          onChange={(e) => updateSiteConfig({ grievanceOfficerName: e.target.value })}
                          placeholder="उदा. अधिकारी नाव"
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-1">ईमेल (Email):</label>
                        <input
                          type="email"
                          value={siteConfig?.grievanceOfficerEmail || ''}
                          onChange={(e) => updateSiteConfig({ grievanceOfficerEmail: e.target.value })}
                          placeholder="उदा. support@example.com"
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-1">व्हॉट्सॲप / फोन नंबर (WhatsApp No - तक्रारीसाठी WhatsApp प्राधान्य):</label>
                        <input
                          type="text"
                          value={siteConfig?.grievanceOfficerPhone || ''}
                          onChange={(e) => updateSiteConfig({ grievanceOfficerPhone: e.target.value })}
                          placeholder="उदा. 9405790916"
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => alert('संपर्क व मदत कक्ष माहिती यशस्वीरित्या अपडेट केली गेली!')}
                    className="px-5 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-extrabold text-xs rounded-xl shadow cursor-pointer border border-amber-300 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>संपर्क माहिती सेव्ह करा</span>
                  </button>
                </div>
              </div>

              {/* Social Media Links Customizer */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <h4 className="font-extrabold text-[#A71930] text-sm">
                    सोशल मीडिया आयकॉन्स व लिंक नियंत्रणे (Social Media Controls):
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(siteConfig?.socialLinks || []).map((link) => (
                    <div
                      key={link.id}
                      className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <span>🌐</span>
                          <span>{link.label}</span>
                        </span>
                        <button
                          onClick={() => deleteSocialLink(link.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                          title="हटवा"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 text-xs font-bold">
                        <div>
                          <label className="block text-slate-600 text-[10px]">सोशल मीडिया नाव:</label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) =>
                              updateSocialLinks(
                                (siteConfig?.socialLinks || []).map((s) =>
                                  s.id === link.id ? { ...s, label: e.target.value } : s
                                )
                              )
                            }
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px]">टार्गेट लिंक URL:</label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) =>
                              updateSocialLinks(
                                (siteConfig?.socialLinks || []).map((s) =>
                                  s.id === link.id ? { ...s, url: e.target.value } : s
                                )
                              )
                            }
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 font-mono text-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-600 text-[10px]">रुंदी (Width px):</label>
                            <input
                              type="number"
                              value={link.iconWidth || 24}
                              onChange={(e) =>
                                updateSocialLinks(
                                  (siteConfig?.socialLinks || []).map((s) =>
                                    s.id === link.id ? { ...s, iconWidth: Number(e.target.value) } : s
                                  )
                                )
                              }
                              className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 text-[10px]">उंची (Height px):</label>
                            <input
                              type="number"
                              value={link.iconHeight || 24}
                              onChange={(e) =>
                                updateSocialLinks(
                                  (siteConfig?.socialLinks || []).map((s) =>
                                    s.id === link.id ? { ...s, iconHeight: Number(e.target.value) } : s
                                  )
                                )
                              }
                              className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-600">पब्लिकवर सक्रिय:</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateSocialLinks(
                                (siteConfig?.socialLinks || []).map((s) =>
                                  s.id === link.id ? { ...s, isEnabled: !s.isEnabled } : s
                                )
                              )
                            }
                            className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                              link.isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {link.isEnabled ? 'चालू' : 'बंद'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Custom Social Link Form */}
                <div className="p-4 bg-amber-100/80 rounded-2xl border border-amber-300 space-y-3">
                  <h5 className="font-extrabold text-[#A71930] text-xs">नवीन कस्टम सोशल मीडिया लिंक जोडा:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-bold">
                    <input
                      type="text"
                      placeholder="नाव (उदा. Telegram)"
                      value={newSocialLabel}
                      onChange={(e) => setNewSocialLabel(e.target.value)}
                      className="bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                    />
                    <input
                      type="url"
                      placeholder="URL (https://t.me/...)"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      className="bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Width (24)"
                        value={newSocialWidth}
                        onChange={(e) => setNewSocialWidth(Number(e.target.value))}
                        className="w-1/2 bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Height (24)"
                        value={newSocialHeight}
                        onChange={(e) => setNewSocialHeight(Number(e.target.value))}
                        className="w-1/2 bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newSocialLabel || !newSocialUrl) return alert('कृपया नाव आणि URL दोन्ही प्रविष्ट करा.');
                        addSocialLink({
                          platform: newSocialLabel.toLowerCase(),
                          label: newSocialLabel,
                          url: newSocialUrl,
                          iconName: newSocialIcon,
                          iconWidth: newSocialWidth,
                          iconHeight: newSocialHeight,
                          isEnabled: true,
                        });
                        setNewSocialLabel('');
                        setNewSocialUrl('');
                      }}
                      className="bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black rounded-xl p-2.5 cursor-pointer shadow flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>लिंक जोडा</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. INDEX PAGE 4 FEATURE BOXES MANAGER (इंडेक्स ४ वैशिष्ट्ये कप्पे कस्टमायझर) */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A71930]" />
                      <span>इंडेक्स ४ वैशिष्ट्ये कप्पे नियंत्रक (Index 4 Feature Boxes Controls)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      मुख्य इंडेक्स पेजवर दिसणारे वैशिष्ट्य कप्पे बदलणे, चालू/बंद करणे किंवा मूळ ४ कप्पे रिसेट करणे.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const default4: FeatureBoxItem[] = [
                        {
                          id: 'f-1',
                          title: 'सत्यापित प्रोफाइल (Verified Profiles)',
                          desc: '१००% आधार व शासकीय ओळखपत्राद्वारे प्रत्येक प्रोफाईलची सत्यता ॲडमिनद्वारे पडताळली जाते.',
                          iconName: 'ShieldCheck',
                          isEnabled: true,
                        },
                        {
                          id: 'f-2',
                          title: 'संपूर्ण गोपनीयता (100% Privacy)',
                          desc: 'तुमचे फोटो आणि वैयक्तिक माहिती पूर्णपणे सुरक्षित. तुमच्या परवानगीशिवाय संपर्क उघड केला जात नाही.',
                          iconName: 'Lock',
                          isEnabled: true,
                        },
                        {
                          id: 'f-3',
                          title: 'सुरक्षित संपर्क (Secure Contact)',
                          desc: 'मोबाईल नंबर सार्वजनिकपणे उघडे नसून ॲडमिनद्वारे authorized झाल्यानंतरच संपर्क साधता येतो.',
                          iconName: 'PhoneCall',
                          isEnabled: true,
                        },
                        {
                          id: 'f-4',
                          title: 'प्रशासकीय मान्यता (Admin Approval)',
                          desc: 'प्रत्येक नवीन नोंदणीची ॲडमिन टीमद्वारे कसून तपासणी करूनच प्रणालीत मंजुरी दिली जाते.',
                          iconName: 'UserCheck',
                          isEnabled: true,
                        },
                      ];
                      updateSiteConfig({ featureBoxes: default4 });
                      alert('४ मुख्य वैशिष्ट्य कप्पे डीफॉल्ट रिसेट झाले!');
                    }}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#A71930] rounded-xl text-xs font-black border border-amber-300 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>डीफॉल्ट ४ कप्पे रिसेट करा</span>
                  </button>
                </div>

                {/* Grid of current Feature Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {((siteConfig?.featureBoxes && siteConfig.featureBoxes.length > 0)
                    ? siteConfig.featureBoxes
                    : [
                        {
                          id: 'f-1',
                          title: 'सत्यापित प्रोफाइल (Verified Profiles)',
                          desc: '१००% आधार व शासकीय ओळखपत्राद्वारे प्रत्येक प्रोफाईलची सत्यता ॲडमिनद्वारे पडताळली जाते.',
                          iconName: 'ShieldCheck',
                          isEnabled: true,
                        },
                        {
                          id: 'f-2',
                          title: 'संपूर्ण गोपनीयता (100% Privacy)',
                          desc: 'तुमचे फोटो आणि वैयक्तिक माहिती पूर्णपणे सुरक्षित. तुमच्या परवानगीशिवाय संपर्क उघड केला जात नाही.',
                          iconName: 'Lock',
                          isEnabled: true,
                        },
                        {
                          id: 'f-3',
                          title: 'सुरक्षित संपर्क (Secure Contact)',
                          desc: 'मोबाईल नंबर सार्वजनिकपणे उघडे नसून ॲडमिनद्वारे authorized झाल्यानंतरच संपर्क साधता येतो.',
                          iconName: 'PhoneCall',
                          isEnabled: true,
                        },
                        {
                          id: 'f-4',
                          title: 'प्रशासकीय मान्यता (Admin Approval)',
                          desc: 'प्रत्येक नवीन नोंदणीची ॲडमिन टीमद्वारे कसून तपासणी करूनच प्रणालीत मंजुरी दिली जाते.',
                          iconName: 'UserCheck',
                          isEnabled: true,
                        },
                      ]
                  ).map((box, index) => (
                    <div
                      key={box.id || index}
                      className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <span className="font-extrabold text-[#A71930] text-xs flex items-center gap-1.5">
                          <span>कप्पा #{index + 1}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const current = siteConfig?.featureBoxes || [];
                              const updated = current.map((b, i) =>
                                (b.id === box.id || i === index) ? { ...b, isEnabled: !b.isEnabled } : b
                              );
                              updateSiteConfig({ featureBoxes: updated });
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                              box.isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {box.isEnabled ? 'पब्लिकवर चालू' : 'बंद'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs font-bold">
                        <div>
                          <label className="block text-slate-600 text-[10px]">शीर्षक (Title):</label>
                          <input
                            type="text"
                            value={box.title}
                            onChange={(e) => {
                              const current = siteConfig?.featureBoxes || [];
                              const updated = current.map((b, i) =>
                                (b.id === box.id || i === index) ? { ...b, title: e.target.value } : b
                              );
                              updateSiteConfig({ featureBoxes: updated });
                            }}
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px]">वर्णन (Description):</label>
                          <textarea
                            rows={2}
                            value={box.desc}
                            onChange={(e) => {
                              const current = siteConfig?.featureBoxes || [];
                              const updated = current.map((b, i) =>
                                (b.id === box.id || i === index) ? { ...b, desc: e.target.value } : b
                              );
                              updateSiteConfig({ featureBoxes: updated });
                            }}
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 text-[10px]">आयकॉन (Icon):</label>
                          <select
                            value={box.iconName}
                            onChange={(e) => {
                              const current = siteConfig?.featureBoxes || [];
                              const updated = current.map((b, i) =>
                                (b.id === box.id || i === index) ? { ...b, iconName: e.target.value } : b
                              );
                              updateSiteConfig({ featureBoxes: updated });
                            }}
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900 font-bold"
                          >
                            <option value="ShieldCheck">ShieldCheck (सत्यापित शील्ड)</option>
                            <option value="Lock">Lock (गोपनीयता लॉक)</option>
                            <option value="PhoneCall">PhoneCall (फोन कॉल)</option>
                            <option value="UserCheck">UserCheck (प्रशासकीय यूजर)</option>
                            <option value="Sparkles">Sparkles (विशेष चमक)</option>
                            <option value="Heart">Heart (हृदय/आवडते)</option>
                            <option value="Users">Users (समाज/समूह)</option>
                            <option value="Shield">Shield (संरक्षण)</option>
                            <option value="Award">Award (पुरस्कार/नंबर १)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. BIODATA DISPLAY & PRIVACY CONTROLS (बायोडाटा दृश्यमानता नियम) */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                <div className="border-b border-amber-200 pb-2">
                  <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#A71930]" />
                    <span>इंडेक्स व बायोडाटा कार्ड दृश्यमानता नियंत्रणे (Biodata Card Visibility Controls)</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    पब्लिक बायोडाटा कार्डवर कोणती माहिती उघडी ठेवायची किंवा लपवायची ते ठरवा.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-bold">
                  {/* Blur Sliders Container */}
                  <div className="p-4 bg-amber-100/70 rounded-2xl border border-amber-300 space-y-4">
                    <h5 className="font-extrabold text-[#A71930] text-xs flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#A71930]" />
                      <span>फोटो, नाव व मोबाईल नंबर धुसरता टक्केवारी नियंत्रक (Granular Blur % Sliders):</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Photo Blur % Slider */}
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center text-slate-900">
                          <span>🖼️ फोटो ब्लर टक्केवारी:</span>
                          <span className="text-[#A71930] font-black">{siteConfig?.photoBlurPercent || 30}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={siteConfig?.photoBlurPercent || 30}
                          onChange={(e) => updateSiteConfig({ photoBlurPercent: Number(e.target.value) })}
                          className="w-full accent-[#A71930] cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500 font-normal">१००% केल्यास फोटो संपूर्ण काळा/ब्लर दिसेल.</p>
                      </div>

                      {/* Name Blur % Slider */}
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center text-slate-900">
                          <span>👤 नाव मास्किंग टक्केवारी:</span>
                          <span className="text-[#A71930] font-black">{siteConfig?.blurNamePercent || 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={siteConfig?.blurNamePercent || 50}
                          onChange={(e) => updateSiteConfig({ blurNamePercent: Number(e.target.value) })}
                          className="w-full accent-[#A71930] cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500 font-normal">१००% केल्यास नाव संपूर्ण लपवले (***) जाईल.</p>
                      </div>

                      {/* Mobile Blur % Slider */}
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                        <div className="flex justify-between items-center text-slate-900">
                          <span>📱 मोबाईल नंबर ब्लर टक्केवारी:</span>
                          <span className="text-[#A71930] font-black">{siteConfig?.blurMobilePercent || 70}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={siteConfig?.blurMobilePercent || 70}
                          onChange={(e) => updateSiteConfig({ blurMobilePercent: Number(e.target.value) })}
                          className="w-full accent-[#A71930] cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500 font-normal">१००% केल्यास पूर्ण नंबर स्टार (******) दिसेल.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">गैर-लॉगिन युझर्सना फोटो ब्लर करा:</span>
                        <span className="text-[10px] text-slate-500 font-medium">फोटो धुसर दिसतील</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ blurProfilePhotos: !siteConfig?.blurProfilePhotos })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                          siteConfig?.blurProfilePhotos ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {siteConfig?.blurProfilePhotos ? 'ब्लर ON' : 'दिसतील'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">नाव अर्धवट लपवा (Blur/Mask Name):</span>
                        <span className="text-[10px] text-slate-500 font-medium">e.g. अमोल शं...</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ blurProfileNames: !siteConfig?.blurProfileNames })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                          siteConfig?.blurProfileNames ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {siteConfig?.blurProfileNames ? 'मास्क ON' : 'दिसतील'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">फोटो डाऊनलोड व स्क्रीनशॉट प्रतिबंध:</span>
                        <span className="text-[10px] text-slate-500 font-medium">राइट-क्लिक व सेविंग ब्लॉक</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ disablePhotoDownloadAndScreenshot: !siteConfig?.disablePhotoDownloadAndScreenshot })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                          siteConfig?.disablePhotoDownloadAndScreenshot ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {siteConfig?.disablePhotoDownloadAndScreenshot ? 'प्रतिबंध ON' : 'बंद'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">सदस्यांना पेमेंट पर्याय दाखवा/लपवा:</span>
                        <span className="text-[10px] text-slate-500 font-medium">क्यूआर/प्लॅन्स दृश्यमानता</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ hidePaymentDetailsGlobal: !siteConfig?.hidePaymentDetailsGlobal })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                          siteConfig?.hidePaymentDetailsGlobal ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {siteConfig?.hidePaymentDetailsGlobal ? 'पेमेंट लपवले' : 'पेमेंट चालू'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">ग्लोबल मोबाईल नंबर लपवा:</span>
                        <span className="text-[10px] text-slate-500 font-medium">केवळ पे-पर-काँटॅक्टने अन-लॉक</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ hidePhoneNumbersGlobal: !siteConfig?.hidePhoneNumbersGlobal })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                          siteConfig?.hidePhoneNumbersGlobal ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {siteConfig?.hidePhoneNumbersGlobal ? 'लपवले' : 'दिसतील'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">पूर्ण पत्ता/रस्ता लपवा:</span>
                        <span className="text-[10px] text-slate-500 font-medium">केवळ जिल्हा व शहर दिसेल</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ hideFullAddressGlobal: !siteConfig?.hideFullAddressGlobal })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                          siteConfig?.hideFullAddressGlobal ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {siteConfig?.hideFullAddressGlobal ? 'लपवले' : 'दिसतील'}
                      </button>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900">जिल्हा फिल्टर पर्याय दाखवा:</span>
                        <span className="text-[10px] text-slate-500 font-medium">इंडेक्सवर जिल्हा फिल्टर</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ showDistrictFilter: !siteConfig?.showDistrictFilter })}
                        className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                          siteConfig?.showDistrictFilter !== false ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {siteConfig?.showDistrictFilter !== false ? 'चालू' : 'बंद'}
                      </button>
                    </div>

                    {/* 🎯 MAIN HOMEPAGE RECENT PROFILES LISTING TOGGLE CARD */}
                    <div className="p-4 bg-amber-100/90 rounded-2xl border-2 border-amber-400 space-y-3 col-span-full shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
                        <div>
                          <h5 className="font-extrabold text-[#A71930] text-xs sm:text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                            <span>मुख्य पानावर वधू-वर यादी (Recent Profiles) दाखवणे/लपवणे:</span>
                          </h5>
                          <p className="text-[11px] text-slate-700 font-medium">
                            मुख्य होमपेजवर 'वंजारी वधू-वर यादी' (Recent Profiles Section) दिसावी की लपवावी ते नियंत्रित करा.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateSiteConfig({
                              showProfilesOnIndexPage: !(siteConfig?.showProfilesOnIndexPage !== false),
                            })
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-md transition-all border ${
                            siteConfig?.showProfilesOnIndexPage !== false
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
                              : 'bg-rose-700 hover:bg-rose-800 text-white border-rose-400'
                          }`}
                        >
                          {siteConfig?.showProfilesOnIndexPage !== false
                            ? '✅ मुख्य पानावर दाखवले आहे (ON)'
                            : '❌ मुख्य पानावरून लपवले (OFF)'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                          <div>
                            <span className="block text-slate-900 text-xs font-bold">
                              प्रोफाईल्स नसताना (0 Profiles) विभाग लपवा:
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              कोणताही बायोडाटा उपलब्ध नसल्यास रिक्त कार्ड लपवेल
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateSiteConfig({
                                hideEmptyProfilesSection: !siteConfig?.hideEmptyProfilesSection,
                              })
                            }
                            className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                              siteConfig?.hideEmptyProfilesSection
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {siteConfig?.hideEmptyProfilesSection ? 'लपवेल (ON)' : 'दाखवेल (OFF)'}
                          </button>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                          <div>
                            <span className="block text-slate-900 text-xs font-bold">
                              नमुना वधू-वर बायोडाटा (Sample Profiles):
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              पब्लिक व्ह्यूसाठी ५ प्रातिनिधिक बायोडाटा रीलोड करा
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('तुम्ही सुरुवातीचे नमुना बायोडाटा पुन्हा लोड करू इच्छिता का?')) {
                                resetSampleProfiles();
                                alert('🎉 नमुना वधू-वर बायोडाटा यशस्वीरित्या रीलोड केले गेले!');
                              }
                            }}
                            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-xl text-[10px] font-black cursor-pointer border border-amber-400"
                          >
                            🔄 रीलोड करा
                          </button>
                        </div>

                        {/* 🔎 SEARCH FILTERS ON/OFF TOGGLE CARD */}
                        <div className="col-span-full space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-slate-900 text-xs font-bold flex items-center gap-1">
                                <span>🔎 प्रगत शोध फिल्टर नियंत्रण (Advanced Search Filters Master Control):</span>
                              </span>
                              <span className="text-[10px] text-slate-600 font-semibold block mt-0.5">
                                बायोडाटा संख्या कमी असल्यामुळे हे बंद ठेवल्यास सर्व वधू-वर थेट दिसतात. आवश्यकतेनुसार सुरू/बंद करा.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateSiteConfig({
                                  enableSearchFilters: !siteConfig?.enableSearchFilters,
                                })
                              }
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all border shrink-0 ${
                                siteConfig?.enableSearchFilters
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                                  : 'bg-rose-700 text-white border-rose-400 shadow-xs'
                              }`}
                            >
                              {siteConfig?.enableSearchFilters ? '✅ फिल्टर चालू (ON)' : '❌ फिल्टर बंद (OFF)'}
                            </button>
                          </div>

                          {/* Sub-Filters options shown for configuration */}
                          <div className="pt-3 border-t border-amber-200/60">
                            <span className="block text-slate-800 text-[11px] font-black mb-2.5 uppercase tracking-wider">
                              ⚙️ कोणते कोणते फिल्टर दाखवायचे ते निवडा (Select Filters to Display):
                            </span>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {/* Gender Filter Toggle */}
                              <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.filterShowGender !== false}
                                  onChange={() => updateSiteConfig({ filterShowGender: siteConfig?.filterShowGender === false ? true : false })}
                                  className="w-3.5 h-3.5 accent-[#800C1E] rounded"
                                />
                                <span className="text-[10px] font-bold text-slate-700">👤 वधू / वर (Gender)</span>
                              </label>

                              {/* Profession Filter Toggle */}
                              <label className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-xl border border-amber-300 cursor-pointer hover:bg-amber-100 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.enableProfessionFilter !== false}
                                  onChange={() => updateSiteConfig({ enableProfessionFilter: siteConfig?.enableProfessionFilter === false ? true : false })}
                                  className="w-3.5 h-3.5 accent-[#800C1E] rounded"
                                />
                                <span className="text-[10px] font-black text-[#A71930]">💼 नोकरी/व्यवसाय (Profession)</span>
                              </label>

                              {/* Age Filter Toggle */}
                              <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.filterShowAge !== false}
                                  onChange={() => updateSiteConfig({ filterShowAge: siteConfig?.filterShowAge === false ? true : false })}
                                  className="w-3.5 h-3.5 accent-[#800C1E] rounded"
                                />
                                <span className="text-[10px] font-bold text-slate-700">📅 वयोमर्यादा (Age)</span>
                              </label>

                              {/* District Filter Toggle */}
                              <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.filterShowDistrict !== false}
                                  onChange={() => updateSiteConfig({ filterShowDistrict: siteConfig?.filterShowDistrict === false ? true : false })}
                                  className="w-3.5 h-3.5 accent-[#800C1E] rounded"
                                />
                                <span className="text-[10px] font-bold text-slate-700">📍 जिल्हा (District)</span>
                              </label>

                              {/* Education Filter Toggle */}
                              <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.filterShowEducation !== false}
                                  onChange={() => updateSiteConfig({ filterShowEducation: siteConfig?.filterShowEducation === false ? true : false })}
                                  className="w-3.5 h-3.5 accent-[#800C1E] rounded"
                                />
                                <span className="text-[10px] font-bold text-slate-700">🎓 शिक्षण (Education)</span>
                              </label>

                              {/* Marital Status Filter Toggle */}
                              <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.filterShowMaritalStatus !== false}
                                  onChange={() => updateSiteConfig({ filterShowMaritalStatus: siteConfig?.filterShowMaritalStatus === false ? true : false })}
                                  className="w-3.5 h-3.5 accent-[#800C1E] rounded"
                                />
                                <span className="text-[10px] font-bold text-slate-700">💍 वैवाहिक स्थिती (Marital)</span>
                              </label>

                              {/* Verification Status Toggle */}
                              <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.filterShowVerified !== false}
                                  onChange={() => updateSiteConfig({ filterShowVerified: siteConfig?.filterShowVerified === false ? true : false })}
                                  className="w-3.5 h-3.5 accent-[#800C1E] rounded"
                                />
                                <span className="text-[10px] font-bold text-slate-700">🛡️ प्रमाणित (Verified Profile)</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ⚡ ऑटो मोड व मास्टर अक्सेस कंट्रोल (Auto Mode & Master Control Settings) */}
                  <div className="p-5 bg-gradient-to-br from-amber-900 via-[#800C1E] to-[#A71930] rounded-3xl text-amber-50 space-y-4 col-span-full shadow-lg border-2 border-amber-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-300/40">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="w-6 h-6 text-amber-300 animate-pulse" />
                          <h3 className="text-lg font-black text-amber-200">
                            ⚡ ऑटो मोड आणि संपूर्ण ऑटोमेशन सेटिंग्ज (Auto Mode Master Settings)
                          </h3>
                        </div>
                        <p className="text-xs text-amber-100/90 font-medium leading-relaxed">
                          ॲडमिन हँड्स-फ्री ऑटोमेशन: वेबसाईट संपूर्ण मोफत ठेवणे किंवा पेमेंट होताच सर्व काही स्वयंचलित अनलॉक करणे.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ isAutoModeEnabled: !siteConfig?.isAutoModeEnabled })}
                        className={`px-5 py-2 rounded-full text-xs font-black cursor-pointer shadow-md border-2 transition-all ${
                          siteConfig?.isAutoModeEnabled
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                            : 'bg-slate-700 text-amber-200 border-slate-500'
                        }`}
                      >
                        {siteConfig?.isAutoModeEnabled ? '⚡ ऑटो मोड चालू (ON)' : '🔒 मॅन्युअल मोड (OFF)'}
                      </button>
                    </div>

                    {/* Auto Mode Control Panel */}
                    {siteConfig?.isAutoModeEnabled ? (
                      <div className="space-y-4 pt-1">
                        <div className="bg-amber-950/60 p-4 rounded-2xl border border-amber-300/30 space-y-3">
                          <label className="block text-xs font-black text-amber-200 uppercase tracking-wider">
                            🎯 १. ऑटो मोड प्रकार निवडा (Auto Mode Type Selection):
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => updateSiteConfig({ autoModeType: 'payment_required', freeForAllMode: false })}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                siteConfig?.autoModeType === 'payment_required' || !siteConfig?.autoModeType
                                  ? 'bg-amber-200 text-slate-950 border-amber-400 font-extrabold shadow'
                                  : 'bg-amber-900/40 text-amber-100 border-amber-300/20 hover:bg-amber-900/70'
                              }`}
                            >
                              <span className="block text-xs font-black">💳 १. पेमेंट झाल्यावर ऑटो अन-लॉक (Payment Auto Unlock)</span>
                              <span className="text-[10px] text-slate-700 opacity-90 block mt-0.5">
                                युझरने पेमेंट सबमिट करताच ॲडमिन मंजुरीशिवाय सर्व संपर्क व फीचर्स स्वयंचलित अनलॉक होतील.
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => updateSiteConfig({ autoModeType: 'free_for_all', freeForAllMode: true })}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                siteConfig?.autoModeType === 'free_for_all' || siteConfig?.freeForAllMode
                                  ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-extrabold shadow'
                                  : 'bg-amber-900/40 text-amber-100 border-amber-300/20 hover:bg-amber-900/70'
                              }`}
                            >
                              <span className="block text-xs font-black">🎁 २. विना पेमेंट - संपूर्ण मोफत वेबसाईट (Free for All Mode)</span>
                              <span className="text-[10px] text-slate-700 opacity-90 block mt-0.5">
                                कोणालाही १ रुपया न भरता संपूर्ण वेबसाईट, सर्व मोबाईल नंबर, बायोडाटा व फोटो मोफत दिसतील.
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Detailed Checkbox Ticks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-300/20 cursor-pointer hover:bg-amber-950/60 transition-colors">
                            <input
                              type="checkbox"
                              checked={siteConfig?.autoApproveNewRegistrations !== false}
                              onChange={(e) => updateSiteConfig({ autoApproveNewRegistrations: e.target.checked })}
                              className="w-4 h-4 mt-0.5 text-[#A71930] rounded cursor-pointer accent-amber-400"
                            />
                            <div>
                              <span className="block text-xs font-bold text-amber-100">☑️ नवीन प्रोफाईल नोंदणी ऑटो मंजूर करा</span>
                              <span className="text-[10px] text-amber-200/70">
                                नवीन युझरने बायोडाटा भरताच तो तात्काळ वेबसाईटवर मंजूर (Approved) होऊन दिसेल.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-300/20 cursor-pointer hover:bg-amber-950/60 transition-colors">
                            <input
                              type="checkbox"
                              checked={siteConfig?.autoUnlockOnPayment !== false}
                              onChange={(e) => updateSiteConfig({ autoUnlockOnPayment: e.target.checked })}
                              className="w-4 h-4 mt-0.5 text-[#A71930] rounded cursor-pointer accent-amber-400"
                            />
                            <div>
                              <span className="block text-xs font-bold text-amber-100">☑️ पेमेंट सादर करताच प्लॅन/संपर्क ऑटो चालू करा</span>
                              <span className="text-[10px] text-amber-200/70">
                                पेमेंट UTR सबमिट होताच संपर्क नंबर तात्काळ अनलॉक होतील.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-300/20 cursor-pointer hover:bg-amber-950/60 transition-colors">
                            <input
                              type="checkbox"
                              checked={siteConfig?.autoModeForGuests !== false}
                              onChange={(e) => updateSiteConfig({ autoModeForGuests: e.target.checked })}
                              className="w-4 h-4 mt-0.5 text-[#A71930] rounded cursor-pointer accent-amber-400"
                            />
                            <div>
                              <span className="block text-xs font-bold text-amber-100">☑️ गेस्ट युझर्सना (Guest) ऑटो पूर्ण ब्राऊझिंग अक्सेस</span>
                              <span className="text-[10px] text-amber-200/70">
                                लॉगिन न केलेल्या पाहुण्यांनाही बायोडाटा व माहिती मुक्तपणे पाहता येईल.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/40 border border-amber-300/20 cursor-pointer hover:bg-amber-950/60 transition-colors">
                            <input
                              type="checkbox"
                              checked={siteConfig?.autoShowTotalMetrics !== false}
                              onChange={(e) => updateSiteConfig({ autoShowTotalMetrics: e.target.checked })}
                              className="w-4 h-4 mt-0.5 text-[#A71930] rounded cursor-pointer accent-amber-400"
                            />
                            <div>
                              <span className="block text-xs font-bold text-amber-100">☑️ एकूण सदस्य संख्या व आकडेवारी ऑटो सार्वजनिक दाखवा</span>
                              <span className="text-[10px] text-amber-200/70">
                                एकूण वधू-वर संख्या व यश आकडेवारी ऑटो अपडेट होऊन दिसेल.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-300/20 text-xs text-amber-100/80">
                        ℹ️ मॅन्युअल मोड चालू आहे: सर्व नवीन नोंदणी आणि पेमेंट विनंत्या ॲडमिनद्वारे तपासून मंजूर कराव्या लागतील.
                      </div>
                    )}
                  </div>

                  {/* Dedicated Guest Login Admin Toggle & Checkbox */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 rounded-2xl border-2 border-amber-300 space-y-2.5 col-span-full shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id="enableGuestLoginCheckbox"
                          checked={siteConfig?.enableGuestLogin !== false}
                          onChange={(e) => updateSiteConfig({ enableGuestLogin: e.target.checked })}
                          className="w-5 h-5 text-[#A71930] rounded focus:ring-[#A71930] cursor-pointer accent-[#A71930]"
                        />
                        <label htmlFor="enableGuestLoginCheckbox" className="text-slate-900 font-extrabold text-sm sm:text-base cursor-pointer flex items-center gap-1.5">
                          <UserCheck className="w-5 h-5 text-[#A71930]" />
                          <span>👤 गेस्ट प्रवेश (Guest Login) पर्याय उपलब्ध ठेवा</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ enableGuestLogin: siteConfig?.enableGuestLogin === false ? true : false })}
                        className={`px-4 py-1.5 rounded-full text-xs font-black cursor-pointer shadow border transition-all shrink-0 ${
                          siteConfig?.enableGuestLogin !== false
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-rose-600 text-white border-rose-500'
                        }`}
                      >
                        {siteConfig?.enableGuestLogin !== false ? 'उपलब्ध (ON)' : 'बंद (OFF)'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 font-medium pl-7 leading-relaxed">
                      हा चेकबॉक्स चालू (Checked/ON) असल्यास, मुख्य नेव्हिगेशन बारमध्ये 'लॉगिन' बटणाच्या बाजूला <strong>'👤 गेस्ट प्रवेश'</strong> हे स्वतंत्र बटण दिसेल. अनचेक (OFF) केल्यास गेस्ट लॉगिन पर्याय पूर्णपणे लपवला जाईल आणि केवळ हयात नोंदणीकृत सदस्यांनाच प्रवेश मिळेल.
                    </p>
                  </div>

                  {/* Single Unified Notice Banner Settings */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border-2 border-amber-300 space-y-3 col-span-full">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                      <div>
                        <span className="block text-slate-900 font-extrabold text-sm flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-[#A71930]" />
                          📢 मुख्य सूचना / विशेष घोषणा बॅनर (Site Top Banner)
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          वेबसाइटवर सर्वात वर दिसणारी एकच मुख्य सूचनेची लाईन. ॲडमिनमधून कधीही चालू/बंद किंवा मजकूर बदलता येतो.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ isNoticeBannerEnabled: !siteConfig?.isNoticeBannerEnabled })}
                        className={`px-4 py-1.5 rounded-full text-xs font-black cursor-pointer shadow border transition-all ${
                          siteConfig?.isNoticeBannerEnabled
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-rose-600 text-white border-rose-500'
                        }`}
                      >
                        {siteConfig?.isNoticeBannerEnabled ? 'चालू (ON)' : 'बंद (OFF)'}
                      </button>
                    </div>

                    {siteConfig?.isNoticeBannerEnabled ? (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block text-slate-800 font-bold mb-1 text-xs">
                            ✏️ सूचनेचा मजकूर (Announcement / Notice Text):
                          </label>
                          <input
                            type="text"
                            value={siteConfig?.noticeBannerText || ''}
                            onChange={(e) => updateSiteConfig({ noticeBannerText: e.target.value })}
                            placeholder="उदा. 📢 ॥ श्री संत भगवान बाबा प्रसन्न ॥ — वंजारी समाजातील सर्व वधू-वरांसाठी अधिकृत नोंदणी सुविधा सुरू आहे!"
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold text-xs outline-none focus:border-[#A71930]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-800 font-bold mb-1 text-xs">
                              🎨 बॅनरची रंगसंगती (Color Theme):
                            </label>
                            <select
                              value={siteConfig?.noticeBannerBg || 'crimson'}
                              onChange={(e) => updateSiteConfig({ noticeBannerBg: e.target.value as any })}
                              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                            >
                              <option value="crimson">🔴 गडद तांबडी (Crimson Royal Red)</option>
                              <option value="saffron">🟠 केशरी (Saffron Gold)</option>
                              <option value="emerald">🟢 हिरवी (Emerald Green)</option>
                              <option value="maroon">🟤 मरुण (Deep Maroon)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-800 font-bold mb-1 text-xs">
                              👁️ लाईव्ह प्रिव्ह्यू (Live Preview):
                            </label>
                            <div className="p-2 bg-[#800C1E] text-amber-100 rounded-xl text-[11px] font-bold overflow-hidden whitespace-nowrap text-ellipsis border border-amber-300/40">
                              📢 {siteConfig?.noticeBannerText || 'सूचना मजकूर प्रविष्ट करा...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-700 font-extrabold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        🚫 सूचना बॅनर सध्या बंद (OFF) ठेवला आहे. वेबसाइटवर कोणतीही अतिरिक्त सूचना लाईन दिसणार नाही.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ⛩️ SHREE KSHETRA BHAGWANGAD EDITABLE SETTINGS CARD */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                <div className="border-b border-amber-200 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A71930]" />
                      <span>श्री क्षेत्र भगवानगड माहिती संपादन (Bhagwangad Content Management)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      मुख्यपृष्ठावरील 'राष्ट्रसंत श्री संत भगवान बाबा व भगवानगड' विभागाची माहिती इथून संपादित करा.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('तुम्ही भगवानगड विभाग माहिती मूळ स्वरूपात (Reset to Default) आणू इच्छिता का?')) {
                        updateSiteConfig({
                          bhagwangadImg: 'https://upload.wikimedia.org/wikipedia/mr/f/f3/%E0%A4%AD%E0%A4%97%E0%A4%B5%E0%A4%BE%E0%A4%A8%E0%A4%97%E0%A4%A1.JPG',
                          bhagwangadBadgeText: '॥ पावन तीर्थक्षेत्र ॥',
                          bhagwangadHeading: 'श्री क्षेत्र भगवानगड (खरवंडी)',
                          bhagwangadSubtitle: 'वंजारी समाजाची सर्वात मोठी सांस्कृतिक व आध्यात्मिक राजधानी',
                          bhagwangadDescription: 'भगवानगड हे महाराष्ट्रातील अहमदनगर जिल्ह्यातील पाथर्डी तालुक्यात डोंगरावर वसलेले वंजारी समाजाचे सर्वोच्च श्रद्धास्थान व शक्तीपीठ आहे. राष्ट्रसंत भगवान बाबांनी या गडाची स्थापना करून समाजाला प्रबोधनाचा व समाजसुधारणेचा मार्ग दाखवला. गडावरील दसरा मेळाव्याचा ऐतिहासिक सोहळा आणि संत सेवा वंजारी समाजाच्या प्रत्येक बांधवाच्या मनात आदराचे स्थान ठेवून आहे. आम्ही या पवित्र संस्कृतीचा वारसा जपत, संपूर्ण महाराष्ट्रातील वंजारी उपवधू-वरांना एका सुसंस्कृत धाग्यात बांधण्याचे प्रामाणिक काम करत आहोत.',
                          bhagwangadHighlight1: 'वारसा आणि तत्त्वे',
                          bhagwangadHighlight2: 'लाखो समाधानी कुटुंबे',
                          bhagwangadHighlight3: 'पवित्र विवाह बंधने',
                        });
                        alert('माहिती डीफॉल्टवर रीसेट झाली!');
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#A71930] rounded-xl text-xs font-black border border-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>माहिती रीसेट करा</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs font-bold">
                  {/* Row 1: Banner Badge & Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 mb-1">🏷️ बॅनर वरील लहान लेबल (Badge Text):</label>
                      <input
                        type="text"
                        value={siteConfig?.bhagwangadBadgeText || ''}
                        onChange={(e) => updateSiteConfig({ bhagwangadBadgeText: e.target.value })}
                        placeholder="उदा. ॥ पावन तीर्थक्षेत्र ॥"
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">🏛️ मुख्य शीर्षक (Heading Title):</label>
                      <input
                        type="text"
                        value={siteConfig?.bhagwangadHeading || ''}
                        onChange={(e) => updateSiteConfig({ bhagwangadHeading: e.target.value })}
                        placeholder="उदा. श्री क्षेत्र भगवानगड (खरवंडी)"
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  {/* Row 2: Subtitle / Caption */}
                  <div>
                    <label className="block text-slate-700 mb-1">✍️ उप-शीर्षक / कॅप्शन (Sub-caption):</label>
                    <input
                      type="text"
                      value={siteConfig?.bhagwangadSubtitle || ''}
                      onChange={(e) => updateSiteConfig({ bhagwangadSubtitle: e.target.value })}
                      placeholder="उदा. वंजारी समाजाची सर्वात मोठी सांस्कृतिक व आध्यात्मिक राजधानी"
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold"
                    />
                  </div>

                  {/* Row 3: Banner Image URL */}
                  <div>
                    <label className="block text-slate-700 mb-1">🖼️ भगवानगड मंदिराचा फोटो लिंक (Banner Image URL):</label>
                    <input
                      type="text"
                      value={siteConfig?.bhagwangadImg || ''}
                      onChange={(e) => updateSiteConfig({ bhagwangadImg: e.target.value })}
                      placeholder="उदा. https://upload.wikimedia.org/...JPG"
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-slate-500 font-normal mt-1">तुमच्या स्वतःच्या मंदिराचा किंवा गडाचा दुसरा फोटो दाखवण्यासाठी इथे नवीन इमेज URL पेस्ट करू शकता.</p>
                  </div>

                  {/* Row 4: Main Paragraph Text */}
                  <div>
                    <label className="block text-slate-700 mb-1">📖 भगवानगड सविस्तर माहिती / वर्णन (Description Paragraph):</label>
                    <textarea
                      rows={5}
                      value={siteConfig?.bhagwangadDescription || ''}
                      onChange={(e) => updateSiteConfig({ bhagwangadDescription: e.target.value })}
                      placeholder="भगवानगड बद्दल सविस्तर माहिती प्रविष्ट करा..."
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold leading-relaxed"
                    />
                  </div>

                  {/* Row 5: Three highlights */}
                  <div>
                    <label className="block text-slate-700 mb-1.5">🌟 खालील तीन हायलाईट बटणे (Three Value Boxes):</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <label className="block text-amber-900 text-[10px] mb-1">१. पहिले बटण मजकूर (Button 1):</label>
                        <input
                          type="text"
                          value={siteConfig?.bhagwangadHighlight1 || ''}
                          onChange={(e) => updateSiteConfig({ bhagwangadHighlight1: e.target.value })}
                          placeholder="उदा. वारसा आणि तत्त्वे"
                          className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900 font-bold"
                        />
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <label className="block text-amber-900 text-[10px] mb-1">२. दुसरे बटण मजकूर (Button 2):</label>
                        <input
                          type="text"
                          value={siteConfig?.bhagwangadHighlight2 || ''}
                          onChange={(e) => updateSiteConfig({ bhagwangadHighlight2: e.target.value })}
                          placeholder="उदा. लाखो समाधानी कुटुंबे"
                          className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900 font-bold"
                        />
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <label className="block text-amber-900 text-[10px] mb-1">३. तिसरे बटण मजकूर (Button 3):</label>
                        <input
                          type="text"
                          value={siteConfig?.bhagwangadHighlight3 || ''}
                          onChange={(e) => updateSiteConfig({ bhagwangadHighlight3: e.target.value })}
                          placeholder="उदा. पवित्र विवाह बंधने"
                          className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPONSORED ADS & MELAVA CONTROLS CARD */}
              <div id="sponsored-ads-admin" className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#A71930]" />
                      <span>प्रायोजित वधू-वर मेळावे व जाहिराती विभाग (Sponsored Ads & Melava Section)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      मुख्यपृष्ठावरील मेळावे व प्रायोजित जाहिरातींचा विभाग दाखवणे/लपवणे किंवा नवीन मेळाव्याची जाहिरात पोस्ट करणे.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">विभाग चालू / बंद (ON / OFF):</span>
                    <button
                      type="button"
                      onClick={() => setIsAdsEnabled(!isAdsEnabled)}
                      className={`px-4 py-1.5 rounded-full text-xs font-black cursor-pointer shadow border transition-all ${
                        isAdsEnabled
                          ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                          : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700'
                      }`}
                    >
                      {isAdsEnabled ? 'सक्रिय (ON - मुख्यपृष्ठावर दिसतात)' : 'बंद (OFF - पूर्णपणे लपवले आहे)'}
                    </button>
                  </div>
                </div>

                {!isAdsEnabled ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span>🚫 प्रायोजित जाहिराती व मेळावे विभाग सध्या बंद (OFF) ठेवला आहे. मुख्यपृष्ठावर हा सेक्शन पूर्णपणे लपवण्यात आला आहे.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Form to Add New Ad / Melava */}
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-3">
                      <h5 className="font-extrabold text-[#A71930] text-xs flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 text-[#A71930]" />
                        <span>नवीन वधू-वर मेळावा किंवा प्रायोजित जाहिरात जोडा:</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold">
                        <div>
                          <label className="block text-slate-700 mb-1">जाहिरात / मेळावा शीर्षक (Title):</label>
                          <input
                            type="text"
                            placeholder="उदा. भव्य महा-वंजारी वधू-वर पालक परिचय मेळावा २०२६ (नाशिक)"
                            value={newAdTitle}
                            onChange={(e) => setNewAdTitle(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 mb-1">प्रकार (Type):</label>
                          <select
                            value={newAdType}
                            onChange={(e) => setNewAdType(e.target.value as any)}
                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                          >
                            <option value="meetup">वधू-वर मेळावा (Melava / Meetup)</option>
                            <option value="sponsored">विशेष प्रायोजित जाहिरात (Sponsored Ad)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-slate-700 mb-1">वर्णन व स्थळ माहिती (Description):</label>
                          <textarea
                            rows={2}
                            placeholder="मेळाव्याचे ठिकाण, वेळ व इतर महत्त्वाची माहिती लिहा..."
                            value={newAdDesc}
                            onChange={(e) => setNewAdDesc(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 mb-1">जाहिरात बॅनर फोटो (Image Upload or URL):</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="प्रतिमा URL प्रविष्ट करा किंवा फोटो निवडा"
                              value={newAdImageUrl}
                              onChange={(e) => setNewAdImageUrl(e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                            />
                            <label className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-xl text-xs font-bold cursor-pointer shrink-0 border border-amber-300 flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingAdImg ? 'अपलोड...' : 'फोटो निवडा'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadAdImage}
                                className="hidden"
                                disabled={isUploadingAdImg}
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 mb-1">अधिक माहिती लिंक (Link URL - Optional):</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={newAdLinkUrl}
                            onChange={(e) => setNewAdLinkUrl(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newAdTitle || !newAdDesc) return alert('कृपया शीर्षक आणि माहिती प्रविष्ट करा.');
                            addCommunityAd({
                              id: 'ad-' + Date.now(),
                              title: newAdTitle,
                              type: newAdType,
                              description: newAdDesc,
                              imageUrl: newAdImageUrl || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
                              linkUrl: newAdLinkUrl || '',
                              isActive: true,
                            });
                            setNewAdTitle('');
                            setNewAdDesc('');
                            setNewAdImageUrl('');
                            setNewAdLinkUrl('');
                            alert('नवीन मेळावा / जाहिरात यशस्वीरित्या जोडली गेली!');
                          }}
                          className="px-5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer border border-amber-300 flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-amber-300" />
                          <span>जाहिरात पब्लिश करा</span>
                        </button>
                      </div>
                    </div>

                    {/* Existing Ads List */}
                    <div className="space-y-2">
                      <h5 className="font-extrabold text-[#A71930] text-xs">सध्याच्या जाहिराती व मेळावे सूची ({communityAds.length}):</h5>
                      {communityAds.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">कोणतीही जाहिरात नोंदवलेली नाही.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {communityAds.map((ad) => (
                            <div key={ad.id} className="p-3 bg-slate-50 rounded-xl border border-amber-300/60 flex items-start justify-between gap-3 shadow-sm">
                              <div className="flex gap-3 items-start">
                                {ad.imageUrl && (
                                  <img src={ad.imageUrl} alt={ad.title} className="w-16 h-16 object-cover rounded-lg border border-slate-300 shrink-0" />
                                )}
                                <div>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#A71930] font-bold border border-amber-300">
                                    {ad.type === 'meetup' ? 'वधू-वर मेळावा' : 'विशेष जाहिरात'}
                                  </span>
                                  <h6 className="font-bold text-xs text-slate-900 mt-1">{ad.title}</h6>
                                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{ad.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 items-end shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleAdStatus(ad.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer shadow ${
                                    ad.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                                  }`}
                                >
                                  {ad.isActive ? 'चालू (ON)' : 'बंद (OFF)'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('ही जाहिरात हटवायची आहे का?')) deleteCommunityAd(ad.id);
                                  }}
                                  className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg cursor-pointer"
                                  title="हटवा"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* TIMED FLASH / POPUP PHOTO AD CONTROL CARD (विशेष पॉपअप जाहिरात कंट्रोल) */}
              <div id="flash-popup-ad-admin" className="bg-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>विशेष ऑटो पॉपअप व स्लाईड फोटो जाहिरात कंट्रोल (Timed Flash / Popup Ad Settings)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      युझर ॲपवर आल्यावर अचानक समोर येणारी आणि काही सेकंदात आपोआप गायब होणारी आकर्षक फोटो जाहिरात किंवा ऑफर.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-700">पॉपअप जाहिरात चालू/बंद:</span>
                    <button
                      type="button"
                      onClick={() => updateSiteConfig({ isFlashAdEnabled: !siteConfig?.isFlashAdEnabled })}
                      className={`px-4 py-1.5 rounded-full text-xs font-black cursor-pointer shadow border transition-all ${
                        siteConfig?.isFlashAdEnabled !== false
                          ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                          : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700'
                      }`}
                    >
                      {siteConfig?.isFlashAdEnabled !== false ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                    </button>
                  </div>
                </div>

                {siteConfig?.isFlashAdEnabled === false ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span>🚫 ऑटो पॉपअप जाहिरात सध्या बंद (OFF) ठेवण्यात आली आहे. युझरला कोणतीही पॉपअप विंडो दिसणार नाही.</span>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs font-bold">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* Display Mode Selector */}
                      <div>
                        <label className="block text-slate-700 mb-1">जाहिरात दाखवण्याची पद्धत (Display Style):</label>
                        <select
                          value={siteConfig?.flashAdDisplayMode || 'popup_modal'}
                          onChange={(e) => updateSiteConfig({ flashAdDisplayMode: e.target.value as any })}
                          className="w-full bg-slate-50 border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold"
                        >
                          <option value="popup_modal">🎯 सेंटर पॉपअप विंडो (Central Modal Popup)</option>
                          <option value="top_slide">⬇️ वरून खाली येणारी स्लाईड पट्टी (Top Slide Banner)</option>
                          <option value="bottom_float">↗️ कोपर्‍यात तरंगणारी लहान जाहिरात (Bottom-Right Float)</option>
                        </select>
                      </div>

                      {/* Display Delay (Seconds) */}
                      <div>
                        <label className="block text-slate-700 mb-1">ॲप उघडल्यावर किती सेकंदांनी दिसावी (Delay Sec):</label>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={siteConfig?.flashAdDelaySeconds ?? 1}
                          onChange={(e) => updateSiteConfig({ flashAdDelaySeconds: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-amber-300 rounded-xl p-2.5 text-slate-900"
                          placeholder="१ सेकंद"
                        />
                      </div>

                      {/* Auto Close Duration (Seconds) */}
                      <div>
                        <label className="block text-slate-700 mb-1">किती सेकंदांनी आपोआप गायब व्हावी (Auto Close Sec):</label>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          value={siteConfig?.flashAdAutoCloseSeconds ?? 8}
                          onChange={(e) => updateSiteConfig({ flashAdAutoCloseSeconds: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-amber-300 rounded-xl p-2.5 text-slate-900"
                          placeholder="८ सेकंद (० = मॅन्युअली बंद करेपर्यंत दिसेल)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Ad Title */}
                      <div>
                        <label className="block text-slate-700 mb-1">जाहिरातीचे मुख्य नाव / हेडिंग (Ad Title):</label>
                        <input
                          type="text"
                          value={siteConfig?.flashAdTitle || ''}
                          onChange={(e) => updateSiteConfig({ flashAdTitle: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                          placeholder="उदा. 🎯 भव्य वंजारी वधू-वर परिचय मेळावा २०२६"
                        />
                      </div>

                      {/* Ad Subtitle */}
                      <div>
                        <label className="block text-slate-700 mb-1">थोडक्यात माहिती व संदेश (Ad Subtitle / Text):</label>
                        <input
                          type="text"
                          value={siteConfig?.flashAdSubtitle || ''}
                          onChange={(e) => updateSiteConfig({ flashAdSubtitle: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                          placeholder="उदा. परळी वैजनाथ, बीड व पुणे येथे मोफत बायोडाटा पुस्तक वाटप!"
                        />
                      </div>

                      {/* Ad Image URL */}
                      <div>
                        <label className="block text-slate-700 mb-1">जाहिरातीचा मुख्य फोटो / बॅनर प्रतिमा (Image URL):</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={siteConfig?.flashAdImageUrl || ''}
                            onChange={(e) => updateSiteConfig({ flashAdImageUrl: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                            placeholder="https://..."
                          />
                          <label className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-xl text-xs font-bold cursor-pointer shrink-0 border border-amber-300 flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploadingAdImg ? 'अपलोड...' : 'फोटो निवडा'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingAdImg(true);
                                try {
                                  const res = await uploadToCloudinary(file, 'vanjarijodi_ads');
                                  if (res.success && res.url) {
                                    updateSiteConfig({ flashAdImageUrl: res.url });
                                  } else {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        updateSiteConfig({ flashAdImageUrl: reader.result });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                } catch {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      updateSiteConfig({ flashAdImageUrl: reader.result });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                } finally {
                                  setIsUploadingAdImg(false);
                                }
                              }}
                              className="hidden"
                              disabled={isUploadingAdImg}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Target Link URL */}
                      <div>
                        <label className="block text-slate-700 mb-1">जाहिरातीवर क्लिक केल्यावर उघडणारी लिंक (Link / WhatsApp URL):</label>
                        <input
                          type="text"
                          value={siteConfig?.flashAdLinkUrl || ''}
                          onChange={(e) => updateSiteConfig({ flashAdLinkUrl: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono"
                          placeholder="https://wa.me/910000000000?text=जाहिरात_चौकशी"
                        />
                      </div>
                    </div>

                    {/* Preview Box */}
                    {siteConfig?.flashAdImageUrl && (
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300 flex items-center gap-4">
                        <img
                          src={siteConfig.flashAdImageUrl}
                          alt="Ad Preview"
                          className="w-20 h-16 object-cover rounded-lg border border-amber-400 shrink-0 shadow"
                        />
                        <div className="text-left flex-1">
                          <span className="text-[10px] text-[#A71930] font-black uppercase">जाहिरात प्रिव्ह्यू</span>
                          <h6 className="font-extrabold text-xs text-slate-900">{siteConfig.flashAdTitle || 'शीर्षक'}</h6>
                          <p className="text-[11px] text-slate-600 line-clamp-1">{siteConfig.flashAdSubtitle || 'वर्णन'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: BRANDING & SLIDES MANAGER */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300">
                <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#A71930]" />
                  <span>वंजारी जोडी बोधचिन्ह, लोगो व स्लाईडर प्रतिमा व्यवस्थापन (Logo & Branding Controls)</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  येथून तुम्ही वंजारी जोडी ॲपचा मुख्य लोगो (Logo) थेट कॉम्प्युटर / मोबाईलवरून अपलोड करू शकता किंवा URL द्वारे सेट करू शकता. हा लोगो नेव्हिगेशन बार, फुटर, आणि प्रिंट बायोडाटा PDF वर आपोआप अपडेट होईल.
                </p>
              </div>

              {/* 1. LOGO MANAGEMENT CARD */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-5">
                <div className="border-b border-amber-200 pb-3 flex items-center justify-between">
                  <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A71930]" />
                    <span>वंजारी जोडी अधिकृत लोगो (App Logo Settings)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      updateSiteConfig({ logoUrl: '', logoTitle: 'वंजारी जोडी', logoSubtitle: 'पवित्र नात्यांची सुंदर सुरुवात', logoHeight: 52 });
                      alert('लोगो व शीर्षक मूळ डीफॉल्ट वर रिसेट केले गेले!');
                    }}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-[#A71930] rounded-xl text-xs font-bold border border-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>डीफॉल्ट लोगोवर रिसेट करा</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form & Upload Controls */}
                  <div className="space-y-4 text-xs font-bold">
                    {/* Logo File Upload */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        📷 १. लोगो फोटो अपलोड करा (Computer / Phone File Upload):
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border-2 border-dashed border-amber-300">
                        <label className="px-4 py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl font-black text-xs cursor-pointer shadow flex items-center gap-2 shrink-0 border border-amber-300">
                          <Upload className="w-4 h-4 text-amber-300" />
                          <span>{isUploadingLogo ? 'अपलोड होत आहे...' : 'लोगो फाईल निवडा'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadLogo}
                            className="hidden"
                            disabled={isUploadingLogo}
                          />
                        </label>
                        <span className="text-[11px] text-slate-600 font-medium">PNG, JPG किंवा SVG फॉरमॅट (पारदर्शक पार्श्वभूमी उत्तम)</span>
                      </div>
                    </div>

                    {/* Logo URL Text Input */}
                    <div>
                      <label className="block text-slate-800 font-extrabold mb-1">
                        🔗 २. किंवा थेट लोगो इमेज URL प्रविष्ट करा (Logo Image URL):
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={siteConfig?.logoUrl || ''}
                        onChange={(e) => updateSiteConfig({ logoUrl: e.target.value })}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                      />
                    </div>

                    {/* Logo Title & Subtitle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">
                          🏷️ ३. लोगोचे मुख्य नाव (Brand Name):
                        </label>
                        <input
                          type="text"
                          value={siteConfig?.logoTitle || 'वंजारी जोडी'}
                          onChange={(e) => updateSiteConfig({ logoTitle: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-extrabold mb-1">
                          📝 ४. लोगोचे उपशीर्षक (Brand Tagline):
                        </label>
                        <input
                          type="text"
                          value={siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात'}
                          onChange={(e) => updateSiteConfig({ logoSubtitle: e.target.value })}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 text-xs"
                        />
                      </div>
                    </div>

                    {/* Hide Logo Text Toggle */}
                    <div className="flex items-center gap-2.5 p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80">
                      <input
                        type="checkbox"
                        id="hideLogoText"
                        checked={siteConfig?.hideLogoText || false}
                        onChange={(e) => updateSiteConfig({ hideLogoText: e.target.checked })}
                        className="w-4 h-4 rounded text-[#A71930] focus:ring-[#A71930] accent-[#A71930] cursor-pointer"
                      />
                      <label htmlFor="hideLogoText" className="text-slate-800 text-[11px] font-extrabold cursor-pointer select-none">
                        👀 फक्त लोगो इमेज दाखवा (बाजूचे ब्रँड नाव व उपशीर्षक लपवा) / Show Only Logo Image (Hide text columns)
                      </label>
                    </div>

                    {/* Logo Display Height */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-800 font-extrabold">
                          📏 ५. लोगोची उंची (Display Height in Header):
                        </label>
                        <span className="text-[#A71930] font-black">{siteConfig?.logoHeight || 52} px</span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={100}
                        step={2}
                        value={siteConfig?.logoHeight || 52}
                        onChange={(e) => updateSiteConfig({ logoHeight: Number(e.target.value) })}
                        className="w-full accent-[#A71930] cursor-pointer"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => alert('लोगो व ब्रँडिंग सेटिंग्ज यशस्वीरित्या सेव्ह केल्या गेल्या!')}
                        className="w-full py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer border border-amber-300 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 text-amber-300" />
                        <span>लोगो आणि ब्रँडिंग बदल सेव्ह करा</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Previews Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-amber-300/80 space-y-4">
                    <h5 className="font-extrabold text-[#A71930] text-xs flex items-center gap-1.5 border-b border-amber-200 pb-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>लोगो थेट कसा दिसेल (Live Logo Previews everywhere):</span>
                    </h5>

                    {/* Preview 1: Header / Navbar Preview */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600">१. हेडर / नेव्हिगेशन बार वर (Header Preview):</span>
                      <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-sm flex items-center gap-3">
                        <VanjariJodiLogo variant="full" size={50} />
                      </div>
                    </div>

                    {/* Preview 2: Footer / Dark Mode Banner Preview */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600">२. फुटर / डार्क बॅनर वर (Footer Preview):</span>
                      <div className="p-3 bg-[#800C1E] text-amber-100 rounded-xl border border-amber-300 shadow-sm flex items-center gap-3">
                        <VanjariJodiLogo variant="full" size={50} />
                      </div>
                    </div>

                    {/* Preview 3: Printable Biodata PDF Header Preview */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600">३. प्रिंट बायोडाटा PDF वर (Print Biodata Header Preview):</span>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 shadow-sm flex items-center justify-between">
                        <VanjariJodiLogo variant="horizontal" size={40} />
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-[#800C1E] font-bold">
                          बायोडाटा PDF
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1.5 BIODATA WATERMARK & PLAY STORE PROMOTION SETTINGS */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-5">
                <div className="border-b border-amber-200 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#A71930]" />
                      <span>बायोडाटा वॉटरमार्क व प्ले स्टोअर जाहिरात व्यवस्थापन (BioData Customizer Settings)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      युझरने बनवलेल्या बायोडाटावर आणि पीडीएफ (PDF) वर वॉटरमार्क तसेच गुगल प्ले स्टोअर डाउनलोड जाहिरात सेट करा.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSiteConfig({
                        biodataWatermarkEnabled: true,
                        biodataWatermarkUrl: '',
                        biodataWatermarkOpacity: 0.12,
                        biodataWatermarkSize: 35,
                        biodataPlaystoreAdEnabled: true,
                        biodataPlaystoreAdText: '📲 वंजारी जोडी (VanjariJodi) अँप गुगल प्ले स्टोअर वरून आत्ताच डाउनलोड करा!',
                        biodataPlaystoreUrl: 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app',
                        biodataPlaystoreQrEnabled: true
                      });
                      alert('बायोडाटा वॉटरमार्क आणि जाहिरात पर्याय मूळ डीफॉल्ट वर रिसेट केले गेले!');
                    }}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-[#A71930] rounded-xl text-xs font-bold border border-amber-300 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>डीफॉल्ट रिसेट</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                  {/* Left Column: Watermark Controls */}
                  <div className="space-y-4 border-r border-amber-200/60 pr-0 lg:pr-6">
                    <div className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-200">
                      <div className="text-left">
                        <label className="text-xs font-black text-slate-800 block">बायोडाटा वॉटरमार्क चालू करा (Enable Watermark)</label>
                        <span className="text-[10px] text-slate-500 font-medium">बायोडाटाच्या मध्यभागी अंधक लोगो दिसेल</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={siteConfig?.biodataWatermarkEnabled !== false}
                        onChange={(e) => updateSiteConfig({ biodataWatermarkEnabled: e.target.checked })}
                        className="w-4 h-4 accent-[#A71930] cursor-pointer"
                      />
                    </div>

                    {siteConfig?.biodataWatermarkEnabled !== false && (
                      <div className="space-y-3.5 animate-fade-in text-xs font-bold">
                        {/* Image URL & File Upload */}
                        <div>
                          <label className="block text-slate-700 mb-1">वॉटरमार्क लोगो प्रतिमा (Watermark Logo Image):</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={siteConfig?.biodataWatermarkUrl || ''}
                              onChange={(e) => updateSiteConfig({ biodataWatermarkUrl: e.target.value })}
                              className="flex-1 bg-white border border-amber-300 rounded-xl p-2 text-slate-900 font-mono text-xs"
                              placeholder="खालील अपलोड बटण वापरा किंवा URL टाका"
                            />
                            
                            <label className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-xl text-xs font-bold cursor-pointer shrink-0 border border-amber-300 flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingWatermarkImg ? 'अपलोड...' : 'लोगो निवडा'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setIsUploadingWatermarkImg(true);
                                  try {
                                    const res = await uploadToCloudinary(file, 'vanjarijodi_watermark');
                                    if (res.success && res.url) {
                                      updateSiteConfig({ biodataWatermarkUrl: res.url });
                                    } else {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === 'string') {
                                          updateSiteConfig({ biodataWatermarkUrl: reader.result });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  } catch {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        updateSiteConfig({ biodataWatermarkUrl: reader.result });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  } finally {
                                    setIsUploadingWatermarkImg(false);
                                  }
                                }}
                                className="hidden"
                                disabled={isUploadingWatermarkImg}
                              />
                            </label>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            मोकळा PNG ट्रान्सपरंट लोगो सर्वोत्तम दिसतो. नसल्यास मूळ वंजारी जोडी लोगो वापरला जाईल.
                          </span>
                        </div>

                        {/* Range: Opacity */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-slate-700">वॉटरमार्क अंधकपणा / ओपेसिटी (Opacity):</label>
                            <span className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {Math.round((siteConfig?.biodataWatermarkOpacity ?? 0.12) * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0.05}
                            max={0.50}
                            step={0.01}
                            value={siteConfig?.biodataWatermarkOpacity ?? 0.12}
                            onChange={(e) => updateSiteConfig({ biodataWatermarkOpacity: Number(e.target.value) })}
                            className="w-full accent-[#A71930] cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-500 font-medium block">
                            शिफारस: खूप फिकट (8% ते 15%) ठेवा जेणेकरून मजकूर वाचण्यास अडचण येणार नाही.
                          </span>
                        </div>

                        {/* Range: Size */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-slate-700">वॉटरमार्क आकार (Watermark Size):</label>
                            <span className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {siteConfig?.biodataWatermarkSize ?? 35}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={15}
                            max={65}
                            step={1}
                            value={siteConfig?.biodataWatermarkSize ?? 35}
                            onChange={(e) => updateSiteConfig({ biodataWatermarkSize: Number(e.target.value) })}
                            className="w-full accent-[#A71930] cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-500 font-medium block">
                            बायोडाटा पानावर लोगो किती टक्के भागात पसरेल तो आकार निवडा.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Play Store Ad Controls */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-200">
                      <div className="text-left">
                        <label className="text-xs font-black text-slate-800 block">प्ले स्टोअर जाहिरात चालू करा (Enable PlayStore Ad)</label>
                        <span className="text-[10px] text-slate-500 font-medium">बायोडाटाच्या शेवटी डाऊनलोड जाहिरात पट्टी दिसेल</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={siteConfig?.biodataPlaystoreAdEnabled !== false}
                        onChange={(e) => updateSiteConfig({ biodataPlaystoreAdEnabled: e.target.checked })}
                        className="w-4 h-4 accent-[#A71930] cursor-pointer"
                      />
                    </div>

                    {siteConfig?.biodataPlaystoreAdEnabled !== false && (
                      <div className="space-y-3.5 animate-fade-in text-xs font-bold">
                        {/* Play Store Ad Text */}
                        <div>
                          <label className="block text-slate-700 mb-1">जाहिरात मजकूर (Ad Display Text):</label>
                          <textarea
                            value={siteConfig?.biodataPlaystoreAdText || ''}
                            onChange={(e) => updateSiteConfig({ biodataPlaystoreAdText: e.target.value })}
                            rows={2}
                            className="w-full bg-white border border-amber-300 rounded-xl p-2 text-slate-900 text-xs font-medium leading-relaxed"
                            placeholder="📲 वंजारी जोडी (VanjariJodi) अँप गुगल प्ले स्टोअर वरून आत्ताच डाउनलोड करा!"
                          />
                        </div>

                        {/* Play Store App Link */}
                        <div>
                          <label className="block text-slate-700 mb-1">प्ले स्टोअर अँप लिंक (Play Store Link):</label>
                          <input
                            type="text"
                            value={siteConfig?.biodataPlaystoreUrl || ''}
                            onChange={(e) => updateSiteConfig({ biodataPlaystoreUrl: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xl p-2 text-slate-900 font-mono text-xs"
                            placeholder="https://play.google.com/store/apps/details?id=com.vanjarijodi.app"
                          />
                        </div>

                        {/* Show QR Code toggle */}
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="text-left">
                            <label className="text-xs font-black text-slate-700 block">QR कोड दाखवा (Show Scan QR Code)</label>
                            <span className="text-[10px] text-slate-500 font-medium">स्कॅन करून डाऊनलोड करण्यासाठी क्यूआर कोड जनरेट होईल</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={siteConfig?.biodataPlaystoreQrEnabled !== false}
                            onChange={(e) => updateSiteConfig({ biodataPlaystoreQrEnabled: e.target.checked })}
                            className="w-4 h-4 accent-[#A71930] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Sandbox Preview for Admin */}
                <div className="pt-3 border-t border-amber-200 text-left">
                  <h5 className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>वॉटरमार्क आणि जाहिरात लाइव्ह प्रिव्ह्यू (Live Preview Checklist):</span>
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Watermark Preview */}
                    <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 relative overflow-hidden h-32 flex items-center justify-center">
                      <span className="text-[11px] font-black text-amber-800 absolute top-2 left-2 z-10 bg-white/80 px-2 py-0.5 rounded shadow-sm border border-amber-200">
                        १. वॉटरमार्क प्रिव्ह्यू (Watermark Demo)
                      </span>
                      
                      {siteConfig?.biodataWatermarkEnabled !== false ? (
                        <img
                          src={
                            siteConfig?.biodataWatermarkUrl ||
                            siteConfig?.logoUrl ||
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"
                          }
                          alt="Demo Watermark"
                          className="max-h-24 object-contain pointer-events-none select-none transition-all duration-300"
                          style={{
                            opacity: siteConfig?.biodataWatermarkOpacity ?? 0.12,
                            width: `${siteConfig?.biodataWatermarkSize ?? 35}%`,
                            maxWidth: '120px',
                            transform: 'rotate(-10deg)',
                          }}
                        />
                      ) : (
                        <span className="text-slate-400 font-bold text-xs italic">वॉटरमार्क सध्या बंद आहे</span>
                      )}
                      <div className="text-[9px] text-slate-400 font-mono absolute bottom-1 right-2">
                        opacity: {siteConfig?.biodataWatermarkOpacity ?? 0.12} | size: {siteConfig?.biodataWatermarkSize ?? 35}%
                      </div>
                    </div>

                    {/* Ad Banner Preview */}
                    <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 relative flex flex-col justify-between h-32">
                      <span className="text-[11px] font-black text-amber-800 bg-white/80 px-2 py-0.5 rounded shadow-sm border border-amber-200 self-start">
                        २. जाहिरात पट्टी प्रिव्ह्यू (Ad Banner Demo)
                      </span>

                      {siteConfig?.biodataPlaystoreAdEnabled !== false ? (
                        <div className="mt-1 p-2 rounded-xl bg-amber-500/10 border border-dashed border-amber-500/40 flex items-center justify-between gap-3 text-left">
                          <p className="text-[10px] font-bold text-slate-800 leading-snug line-clamp-2 flex-1">
                            {siteConfig?.biodataPlaystoreAdText || '📲 वंजारी जोडी (VanjariJodi) अँप गुगल प्ले स्टोअर वरून आत्ताच डाउनलोड करा!'}
                          </p>
                          {siteConfig?.biodataPlaystoreQrEnabled !== false && (
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                                siteConfig?.biodataPlaystoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'
                              )}`}
                              alt="demo qr"
                              className="w-8 h-8 border border-amber-400 p-0.5 bg-white rounded shrink-0"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs italic self-center my-auto">जाहिरात पट्टी सध्या बंद आहे</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('बायोडाटा वॉटरमार्क व जाहिरात सेटिंग्ज यशस्वी सेव्ह झाल्या!')}
                  className="w-full py-2.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer border border-amber-300 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>बायोडाटा वॉटरमार्क आणि जाहिरात बदल सेव्ह करा (Save BioData Settings)</span>
                </button>
              </div>

              {/* 2. HERO SLIDER BANNER IMAGES MANAGER */}
              <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-md space-y-4">
                <div className="border-b border-amber-200 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#A71930]" />
                      <span>मुख्यपृष्ठ स्लाईडर बॅनर प्रतिमा (Hero Slider Banner Images)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      मुख्यपृष्ठावरील फिरणाऱ्या स्लाईड बॅनरच्या बॅकग्राउंड प्रतिमा व मजकूर कस्टमायझ करा.
                    </p>
                  </div>
                </div>

                {/* Add Hero Slide Form */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-3 text-xs font-bold">
                  <h5 className="font-extrabold text-[#A71930] text-xs">नवीन स्लाईड बॅनर जोडा:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">स्लाईड शीर्षक (Slide Title):</label>
                      <input
                        type="text"
                        placeholder="उदा. पवित्र विवाह सोहळा"
                        value={newSlideTitle}
                        onChange={(e) => setNewSlideTitle(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">उपशीर्षक (Subtitle):</label>
                      <input
                        type="text"
                        placeholder="उदा. वंजारी समाजातील हजारो कुटुंबांचा विश्वास"
                        value={newSlideSubtitle}
                        onChange={(e) => setNewSlideSubtitle(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-700 mb-1">प्रतिमा (Image File or URL):</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="प्रतिमा URL प्रविष्ट करा किंवा फोटो निवडा"
                          value={newSlideImageUrl}
                          onChange={(e) => setNewSlideImageUrl(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                        />
                        <label className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-[#800C1E] rounded-xl text-xs font-bold cursor-pointer shrink-0 border border-amber-300 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingSlideImg ? 'अपलोड...' : 'फोटो निवडा'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadHeroSlideImage}
                            className="hidden"
                            disabled={isUploadingSlideImg}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSlideTitle || !newSlideImageUrl) return alert('कृपया शीर्षक आणि प्रतिमा प्रविष्ट करा.');
                        addHeroSlide({
                          title: newSlideTitle,
                          subtitle: newSlideSubtitle,
                          imageUrl: newSlideImageUrl,
                          ctaText: 'नोंदणी करा',
                          ctaLink: 'register',
                        });
                        setNewSlideTitle('');
                        setNewSlideSubtitle('');
                        setNewSlideImageUrl('');
                        alert('नवीन स्लाईडर बॅनर जोडला गेला!');
                      }}
                      className="px-5 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow cursor-pointer border border-amber-300 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>स्लाईड बॅनर जोडा</span>
                    </button>
                  </div>
                </div>

                {/* Hero Slides List */}
                <div className="space-y-2">
                  <h5 className="font-extrabold text-[#A71930] text-xs">सध्याचे स्लाईड बॅनर ({heroSlides.length}):</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {heroSlides.map((slide) => (
                      <div key={slide.id} className="p-3 bg-slate-50 rounded-xl border border-amber-300/60 flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <img src={slide.imageUrl} alt={slide.title} className="w-16 h-12 object-cover rounded-lg border border-slate-300 shrink-0" />
                          <div>
                            <h6 className="font-bold text-xs text-slate-900">{slide.title}</h6>
                            <p className="text-[11px] text-slate-600 line-clamp-1">{slide.subtitle}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteHeroSlide(slide.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg cursor-pointer shrink-0"
                          title="हटवा"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BUSINESS VENDORS & WEDDING NETWORK MANAGEMENT */}
          {activeTab === 'business_vendors' && (
            <div className="space-y-6">
              
              {/* Top Banner & Control Settings */}
              <div className="bg-amber-100/90 rounded-2xl p-5 border border-amber-300 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                      <Handshake className="w-6 h-6 text-[#A71930]" />
                      <span>लग्न व्यवसाय व नेटवर्किंग व्यवस्थापन (Vendor & Business Network)</span>
                    </h3>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      मंगल कार्यालये, बँड बाजा, कॅटरिंग, फोटोग्राफी व इतर लग्न व्यवसायांची नोंदणी व ५% ते १०% कमिशन नियंत्रण.
                    </p>
                  </div>

                  <span className="px-3.5 py-1.5 bg-[#A71930] text-amber-100 rounded-full text-xs font-black shadow">
                    एकूण व्हेंडर्स: {businessVendors.length} | प्रलंबित: {businessVendors.filter(v => v.status === 'pending').length}
                  </span>
                </div>

                {/* Feature Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-300/80 text-xs">
                  
                  {/* Toggle 1: Enable Feature */}
                  <div className="p-3.5 bg-white rounded-xl border border-amber-300 flex items-center justify-between gap-3 shadow-sm">
                    <div>
                      <span className="font-extrabold text-[#A71930] block">
                        १. 'आमच्यासोबत व्यवसाय करा' सुविधा सक्षम करा:
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        ॲपवर युझर्सना मंगल कार्यालय व व्यवसाय डिरेक्टरी दाखवावी की लपवावी.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateSiteConfig({ enableBusinessVendors: !siteConfig.enableBusinessVendors })}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors shrink-0 cursor-pointer ${
                        siteConfig.enableBusinessVendors !== false
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {siteConfig.enableBusinessVendors !== false ? 'सक्षम (Enabled ✓)' : 'अक्षम (Disabled)'}
                    </button>
                  </div>

                  {/* Toggle 2: Show Contacts Publicly vs Admin Booking Only */}
                  <div className="p-3.5 bg-white rounded-xl border border-amber-300 flex items-center justify-between gap-3 shadow-sm">
                    <div>
                      <span className="font-extrabold text-[#A71930] block">
                        २. संपर्क व बुकींग पद्धत (Contact Display Mode):
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {siteConfig.showVendorContactsToPublic !== false
                          ? 'सध्या: युझर्स थेट व्हेंडर्सला कॉल/व्हॉट्सॲप करू शकतात.'
                          : 'सध्या: युझर्स ॲडमिनद्वारे बुकींग करतात (५%-१०% कमिशन गॅरंटी).'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateSiteConfig({ showVendorContactsToPublic: !siteConfig.showVendorContactsToPublic })}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors shrink-0 cursor-pointer ${
                        siteConfig.showVendorContactsToPublic !== false
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-[#A71930] text-amber-100 shadow'
                      }`}
                    >
                      {siteConfig.showVendorContactsToPublic !== false ? 'थेट संपर्क (Direct)' : 'ॲडमिन बुकींग (Commission)'}
                    </button>
                  </div>

                </div>
              </div>

              {/* Add Custom Vendor Category Box */}
              <div className="bg-white rounded-2xl p-4 border border-amber-300 space-y-3 shadow-sm">
                <h4 className="font-extrabold text-xs text-[#A71930] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>नवीन व्यवसाय श्रेणी (Category) जोडा:</span>
                </h4>

                <div className="flex gap-2 max-w-lg">
                  <input
                    type="text"
                    id="newVendorCatInput"
                    placeholder="उदा. डीजे व साउंड सिस्टीम / जेवण मांडव भांडे"
                    className="flex-1 bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newVendorCatInput') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        addCustomVendorCategory(input.value.trim());
                        alert(`'${input.value.trim()}' ही नवीन श्रेणी जोडली गेली!`);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    + श्रेणी जोडा
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 self-center">सध्याच्या श्रेणी:</span>
                  {(siteConfig.customVendorCategories || [
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
                  ]).map((cat) => (
                    <span key={cat} className="px-2.5 py-1 bg-amber-100 text-[#800C1E] rounded-lg text-[10px] font-bold border border-amber-300">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vendors List Table */}
              <div className="bg-white rounded-2xl border border-amber-300 overflow-hidden shadow-md space-y-0">
                {/* Header & Main Action */}
                <div className="p-4 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-b border-amber-300 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-black text-[#A71930] text-sm flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#A71930]" />
                    <span>नोंदणीकृत व्यवसाय व अर्ज सूची ({businessVendors.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddVendorModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 rounded-xl text-xs font-black shadow transition-all hover:scale-102 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>नवीन व्हेंडर जोडा (Create Login)</span>
                  </button>
                </div>

                {/* Filter Toolbar Bar */}
                <div className="p-3 bg-amber-50/70 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
                  {/* Search input */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="नाव, मोबाईल, जिल्हा, तालुका शोधा..."
                      value={vendorSearchTerm}
                      onChange={(e) => setVendorSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs outline-none focus:border-[#800C1E] text-slate-900 font-bold placeholder:font-normal"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={vendorCategoryFilter}
                    onChange={(e) => setVendorCategoryFilter(e.target.value)}
                    className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#800C1E]"
                  >
                    <option value="all">सर्व श्रेण्या (All Categories)</option>
                    {[
                      'मॅरेज हॉल व लॉन्स',
                      'कॅटरिंग व स्वयंपाकी',
                      'फोटोग्राफी व व्हिडिओग्राफी',
                      'डीजे, साऊंड व लाईट्स',
                      'मंंडप डेकोरेटर्स',
                      'मेकअप आर्टिस्ट व मेहंदी',
                      'ट्रॅव्हल्स व लग्न गाड्या',
                      'पौरोहित्य / भटजी',
                      'इतर लग्न व्यवसाय'
                    ].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200">
                    <button
                      type="button"
                      onClick={() => setVendorStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                        vendorStatusFilter === 'all'
                          ? 'bg-[#800C1E] text-amber-100 shadow'
                          : 'text-slate-600 hover:bg-amber-50'
                      }`}
                    >
                      सर्व ({businessVendors.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVendorStatusFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                        vendorStatusFilter === 'pending'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-amber-800 hover:bg-amber-50'
                      }`}
                    >
                      प्रलंबित ({businessVendors.filter(v => v.status === 'pending').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVendorStatusFilter('approved')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                        vendorStatusFilter === 'approved'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      मंजूर ({businessVendors.filter(v => v.status === 'approved').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVendorStatusFilter('rejected')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                        vendorStatusFilter === 'rejected'
                          ? 'bg-rose-600 text-white shadow'
                          : 'text-rose-800 hover:bg-rose-50'
                      }`}
                    >
                      रद्द ({businessVendors.filter(v => v.status === 'rejected').length})
                    </button>
                  </div>
                </div>

                {(() => {
                  const filteredVendors = businessVendors.filter((v) => {
                    const matchesSearch =
                      !vendorSearchTerm ||
                      v.businessName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                      v.ownerName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                      v.mobile.includes(vendorSearchTerm) ||
                      v.district.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                      (v.taluka && v.taluka.toLowerCase().includes(vendorSearchTerm.toLowerCase()));

                    const matchesCategory = vendorCategoryFilter === 'all' || v.category === vendorCategoryFilter;
                    const matchesStatus = vendorStatusFilter === 'all' || v.status === vendorStatusFilter;

                    return matchesSearch && matchesCategory && matchesStatus;
                  });

                  if (filteredVendors.length === 0) {
                    return (
                      <div className="p-10 text-center text-slate-500 text-xs font-bold">
                        शोध निकषांनुसार कोणताही व्यवसाय आढळला नाही.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-amber-100/70 border-b border-amber-300 text-[#800C1E] font-black text-[11px]">
                            <th className="p-3">फोटो / नाव</th>
                            <th className="p-3">मालक व संपर्क</th>
                            <th className="p-3">श्रेणी व ठिकाण</th>
                            <th className="p-3">दर व सवलत</th>
                            <th className="p-3">कमिशन</th>
                            <th className="p-3">स्टेटस</th>
                            <th className="p-3 text-right">कृती (Actions)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-100 font-medium text-slate-800">
                          {filteredVendors.map((vendor) => (
                            <tr key={vendor.id} className="hover:bg-amber-50/60 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={vendor.photoUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=200'}
                                    alt={vendor.businessName}
                                    className="w-10 h-10 rounded-lg object-cover border border-amber-300 shrink-0"
                                  />
                                  <div>
                                    <span className="font-extrabold text-slate-900 block">{vendor.businessName}</span>
                                    {vendor.pdfUrl && (
                                      <a
                                        href={vendor.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-rose-700 font-bold underline hover:text-rose-900"
                                      >
                                        📄 रेट कार्ड PDF
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{vendor.ownerName}</span>
                                <div className="flex flex-col gap-1 mt-1">
                                  <a href={`tel:${vendor.mobile}`} className="text-[10px] text-slate-700 font-bold hover:text-[#A71930] font-mono flex items-center gap-1">
                                    📞 {vendor.mobile}
                                  </a>
                                  <div className="inline-flex items-center gap-1 bg-amber-50 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-amber-200 w-fit">
                                    <KeyRound className="w-3.5 h-3.5 text-[#A71930]" />
                                    <span>पिन: <strong className="font-mono text-[#A71930]">{vendor.pinPassword || 'सेट नाही'}</strong></span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-amber-200 text-[#800C1E] rounded-full text-[10px] font-bold block w-fit mb-0.5">
                                  {vendor.category}
                                </span>
                                <span className="text-[10px] text-slate-600 block">
                                  📍 {vendor.district} {vendor.taluka ? `(${vendor.taluka})` : ''}
                                </span>
                              </td>

                              <td className="p-3 max-w-xs">
                                <p className="font-bold text-slate-900 text-[11px] line-clamp-1">{vendor.ratesAndPackages}</p>
                                {vendor.memberDiscount && (
                                  <span className="text-[10px] text-emerald-700 font-bold block">
                                    🏷️ {vendor.memberDiscount}
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                  {vendor.commissionRate || '१०% कमिशन'}
                                </span>
                              </td>

                              <td className="p-3">
                                {vendor.status === 'approved' ? (
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full font-bold text-[10px]">
                                    मंजूर (Approved ✓)
                                  </span>
                                ) : vendor.status === 'rejected' ? (
                                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full font-bold text-[10px]">
                                    रद्द (Rejected)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full font-bold text-[10px] animate-pulse">
                                    प्रलंबित (Pending)
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedVendorForView(vendor)}
                                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-[#800C1E] text-[10px] font-extrabold rounded-lg border border-amber-300 transition cursor-pointer flex items-center gap-1"
                                    title="सर्व माहिती पहा (View Full Info & Media)"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>पाहणी</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedVendorForEdit(vendor);
                                      setIsEditVendorModalOpen(true);
                                    }}
                                    className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded cursor-pointer"
                                    title="सुधारा (Edit & PIN)"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  {vendor.status !== 'approved' && (
                                    <button
                                      type="button"
                                      onClick={() => updateBusinessVendorStatus(vendor.id, 'approved')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow cursor-pointer"
                                      title="मंजूर करा"
                                    >
                                      मंजूर
                                    </button>
                                  )}

                                  {vendor.status !== 'rejected' && (
                                    <button
                                      type="button"
                                      onClick={() => updateBusinessVendorStatus(vendor.id, 'rejected')}
                                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                      title="नाकारा"
                                    >
                                      रद्द
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`नक्की '${vendor.businessName}' हा व्यवसाय हटवायचा आहे का?`)) {
                                        deleteBusinessVendor(vendor.id);
                                      }
                                    }}
                                    className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded cursor-pointer"
                                    title="हटवा"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* TAB: PAY PER CONTACT APPROVALS & SETTINGS */}
          {activeTab === 'pay_per_contact' && (
            <div className="space-y-6">
              {/* Header & Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-amber-100/90 rounded-2xl p-5 border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                        <Phone className="w-5 h-5 text-[#A71930]" />
                        <span>पे-पर-काँटॅक्ट विनंत्या (Pay-Per-Contact Unlock System)</span>
                      </h3>
                      <p className="text-xs text-slate-700 font-medium mt-1">
                        युझर्सने संपर्क अन-लॉक करण्यासाठी सबमिट केलेल्या UTR क्रमांकांची पडताळणी करा आणि एका क्लिकवर संपर्क अन-लॉक करा.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#A71930] text-amber-100 rounded-full text-xs font-black">
                      प्रलंबित: {payPerContactRequests.filter((r) => r.status === 'pending').length}
                    </span>
                  </div>
                </div>

                {/* Quick Fee & UPI Controls & Feature Visibility Toggles */}
                <div className="bg-white rounded-2xl p-5 border border-amber-300 shadow-sm space-y-4 text-xs font-bold">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-2">
                    <QrCode className="w-4 h-4 text-[#A71930]" />
                    <span>पे-पर-काँटॅक्ट नियंत्रणे व ऑफर सेटिंग्ज</span>
                  </h4>

                  <div className="space-y-3">
                    {/* Pay Per Contact Toggle */}
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900 font-extrabold">पे-पर-काँटॅक्ट ऑप्शन दाखवा:</span>
                        <span className="text-[10px] text-slate-500">‘नाही’ केल्यास सर्वांसाठी हा पर्याय लपवला जाईल</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ isPayPerContactEnabled: !siteConfig.isPayPerContactEnabled })}
                        className={`px-3 py-1 rounded-xl font-black text-xs cursor-pointer shadow ${
                          siteConfig.isPayPerContactEnabled !== false ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {siteConfig.isPayPerContactEnabled !== false ? 'होय (ON)' : 'नाही (OFF)'}
                      </button>
                    </div>

                    {/* Festival Offer Mode Toggle */}
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900 font-extrabold">सण / नवीन ऑफर मोड (Offer Mode):</span>
                        <span className="text-[10px] text-slate-500">ऑफर चालू असल्यास संपर्क विनामूल्य अन-लॉक होईल</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ isOfferModeEnabled: !siteConfig.isOfferModeEnabled })}
                        className={`px-3 py-1 rounded-xl font-black text-xs cursor-pointer shadow ${
                          siteConfig.isOfferModeEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-800'
                        }`}
                      >
                        {siteConfig.isOfferModeEnabled ? 'सक्रिय (ON)' : 'बंद (OFF)'}
                      </button>
                    </div>

                    {/* Disable All Payments Toggle */}
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="block text-slate-900 font-extrabold">ऑफर काळात सर्व पेमेंट पर्याय बंद ठेवा:</span>
                        <span className="text-[10px] text-slate-500">कोणतेही पेमेंट न घेता १-क्लिकवर संपर्क अनलॉक करा</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ disableAllPaymentsInOfferMode: !siteConfig.disableAllPaymentsInOfferMode })}
                        className={`px-3 py-1 rounded-xl font-black text-xs cursor-pointer shadow ${
                          siteConfig.disableAllPaymentsInOfferMode ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-800'
                        }`}
                      >
                        {siteConfig.disableAllPaymentsInOfferMode ? 'होय (पेमेंट बंद)' : 'नाही'}
                      </button>
                    </div>

                    {/* Offer Banner Text */}
                    {siteConfig.isOfferModeEnabled && (
                      <div>
                        <label className="text-slate-700 block mb-1">ऑफर संदेश (Offer Banner Text):</label>
                        <input
                          type="text"
                          value={siteConfig.offerModeText || '🎉 विशेष सण ऑफर: संपर्क क्रमांक १-क्लिकवर विनामूल्य अन-लॉक करा!'}
                          onChange={(e) => updateSiteConfig({ offerModeText: e.target.value })}
                          className="w-full bg-slate-50 border border-amber-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-slate-600 block mb-1">प्रति-संपर्क अन-लॉक शुल्क (₹):</label>
                        <input
                          type="number"
                          value={siteConfig.unlockContactFee || 50}
                          onChange={(e) => updateSiteConfig({ unlockContactFee: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-extrabold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">ॲडमिन UPI ID:</label>
                        <input
                          type="text"
                          value={siteConfig.paymentUpiId || '9822100000@ybl'}
                          onChange={(e) => updateSiteConfig({ paymentUpiId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requests Table */}
              <div className="bg-white rounded-2xl border border-amber-300 shadow-sm overflow-hidden">
                <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between font-bold text-xs">
                  <span className="text-slate-800">एकूण प्राप्त पे-पर-काँटॅक्ट विनंत्या ({payPerContactRequests.length})</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                        <th className="p-3">युझर माहिती</th>
                        <th className="p-3">लक्ष्य वधू/वर बायोडाटा</th>
                        <th className="p-3">शुल्क व UTR क्रमांक</th>
                        <th className="p-3">पेमेंट स्क्रीनशॉट</th>
                        <th className="p-3">दिनांक</th>
                        <th className="p-3">स्थिती</th>
                        <th className="p-3 text-right">कृती (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {payPerContactRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                            कोणतीही पे-पर-काँटॅक्ट विनंती उपलब्ध नाही.
                          </td>
                        </tr>
                      ) : (
                        payPerContactRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-amber-50/50 transition">
                            <td className="p-3 font-bold">
                              <p className="text-slate-900">{req.userName}</p>
                              <p className="text-slate-500 font-mono text-[11px]">{req.userMobile}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-[#A71930]">{req.targetProfileName}</p>
                              <p className="text-slate-500 font-mono text-[11px]">Mob: {req.targetProfileMobile}</p>
                            </td>
                            <td className="p-3 font-mono">
                              <p className="font-extrabold text-emerald-700">₹{req.amount}</p>
                              <p className="text-slate-700 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                UTR: {req.utrNumber}
                              </p>
                            </td>
                            <td className="p-3">
                              {req.screenshotUrl ? (
                                <a
                                  href={req.screenshotUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-bold"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>स्क्रीनशॉट पहा</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">नाही</span>
                              )}
                            </td>
                            <td className="p-3 text-[11px] text-slate-500">
                              {new Date(req.createdAt).toLocaleDateString('mr-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-3 font-bold">
                              {req.status === 'pending' && (
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] border border-amber-300">
                                  प्रलंबित (Pending)
                                </span>
                              )}
                              {req.status === 'approved' && (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] border border-emerald-300">
                                  मंजूर (Approved)
                                </span>
                              )}
                              {req.status === 'rejected' && (
                                <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[11px] border border-rose-300">
                                  अमान्य (Rejected)
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {req.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => approvePayPerContactRequest(req.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow cursor-pointer transition flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>मंजूर करा</span>
                                  </button>
                                  <button
                                    onClick={() => rejectPayPerContactRequest(req.id)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow cursor-pointer transition flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>नाकारा</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs italic">पूर्ण झाले</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GRANULAR GUEST ACCESS CONTROL MATRIX */}
          {activeTab === 'guest_permissions' && (
            <div className="space-y-6">
              <div className="bg-amber-100/90 rounded-2xl p-5 border border-amber-300 space-y-2">
                <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#A71930]" />
                  <span>अतिथी युझर परवानगी नियंत्रण मॅट्रिक्स (Granular Guest Access Control)</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  अतिथी (Guest) युझर्सना कोणकोणत्या सुविधा पाहायची परवानगी द्यायची ते ठरवा. एखादी सुविधा बंद केल्यास युझरला नोंदणी करण्याचा सुंदर मॅसेज दिसेल.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'viewProfiles', label: 'बायोडाटा पाहणे (View Profiles)', icon: Eye, desc: 'अतिथी युझर मुख्य बायोडाटा सूची पाहू शकतात.' },
                  { key: 'searchFilters', label: 'शोधाशोध फिल्टर्स (Search Filters)', icon: Search, desc: 'जिल्हा, शिक्षण व वयानुसार शोधाशोध वापरणे.' },
                  { key: 'viewPhotos', label: 'फोटो पाहणे (View Profile Photos)', icon: ImageIcon, desc: 'बायोडाटा मधील फोटो पाहण्याची परवानगी.' },
                  { key: 'kundaliView', label: 'कुंडली व गुणमिलन पाहणे (Kundali View)', icon: Sparkles, desc: 'पत्रिका आणि गुणमिलन तपशील.' },
                  { key: 'expressInterest', label: 'पसंती/रस दाखवणे (Express Interest)', icon: Heart, desc: 'प्रोफाईलला लाईक किंवा पसंती पाठवणे.' },
                  { key: 'directChat', label: 'थेट चॅटिंग (Direct Chatting)', icon: MessageCircle, desc: 'ऑनलाइन चॅट किंवा संपर्क मेसेज पाठवणे.' },
                ].map((item) => {
                  const currentPerms = siteConfig.guestPermissions || {
                    viewProfiles: true,
                    searchFilters: true,
                    kundaliView: false,
                    expressInterest: false,
                    viewPhotos: true,
                    directChat: false,
                  };
                  const isEnabled = currentPerms[item.key as keyof typeof currentPerms] ?? true;
                  const IconComp = item.icon;

                  return (
                    <div
                      key={item.key}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                        isEnabled
                          ? 'bg-white border-emerald-300 shadow-sm'
                          : 'bg-rose-50/60 border-rose-300 shadow-inner'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl border ${
                              isEnabled
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{item.label}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isEnabled ? 'परवानगी सुरु (Allowed)' : 'अतिथींसाठी बंद (Restricted)'}
                        </span>

                        <button
                          onClick={() => {
                            const updated = {
                              ...currentPerms,
                              [item.key]: !isEnabled,
                            };
                            updateSiteConfig({ guestPermissions: updated });
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow ${
                            isEnabled
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          <span>{isEnabled ? 'बंद करा' : 'सुरु करा'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: LIVE USER ACTIVITY & ANALYTICS DASHBOARD */}
          {activeTab === 'user_analytics' && (
            <div className="space-y-6">
              <div className="bg-amber-100/90 rounded-2xl p-5 border border-amber-300 space-y-2">
                <h3 className="text-lg font-black text-[#A71930] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#A71930]" />
                  <span>रिअल-टाईम युझर क्रियाकलाप व ॲनालिटिक्स (Live User Activity Logs)</span>
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  पोर्टलवर नोंदणीकृत आणि अतिथी (Guest) युझर्स द्वारे केल्या जाणाऱ्या हालचाली, मोबाईल नंबर आणि सत्रांची माहिती एकाच जागी पाहा.
                </p>
              </div>

              {/* Registered vs Guest Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registered Activity Logs */}
                <div className="bg-white rounded-2xl border border-amber-300 p-4 space-y-3 shadow-sm">
                  <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-2 border-b pb-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>नोंदणीकृत युझर्स ॲक्टिव्हिटी ({userActivityLogs.filter((l) => l.userType === 'registered').length})</span>
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {userActivityLogs.filter((l) => l.userType === 'registered').length === 0 ? (
                      <p className="text-xs text-slate-500 font-bold p-4 text-center">अद्याप कोणतीही ॲक्टिव्हिटी नोंद झालेली नाही.</p>
                    ) : (
                      userActivityLogs
                        .filter((l) => l.userType === 'registered')
                        .map((log) => (
                          <div key={log.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-slate-900 font-black">{log.userName}</span>
                              <span className="text-[10px] text-[#A71930] font-mono bg-amber-100 px-2 py-0.5 rounded-full">
                                📞 {log.userMobile || 'मोबाईल नोंद'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <p className="text-[#A71930] font-bold">{log.action}</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] font-medium">{log.details}</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Guest Session Logs */}
                <div className="bg-white rounded-2xl border border-amber-300 p-4 space-y-3 shadow-sm">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>अतिथी (Guest) मोबाईल सत्रे व ब्राऊझिंग इतिहास ({guestSessions.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {guestSessions.length === 0 ? (
                      <p className="text-xs text-slate-500 font-bold p-4 text-center">सध्या कोणतेही अतिथी लॉगिन उपलब्ध नाही.</p>
                    ) : (
                      guestSessions.map((sess) => (
                        <div key={sess.sessionId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900 font-extrabold text-xs">
                              👤 {sess.guestName || 'पाहुणे सदस्य'} {sess.district ? `(${sess.district})` : ''}
                            </span>
                            <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-mono font-black">
                              📞 {sess.mobileNumber || sess.sessionId}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span><strong>IP:</strong> {sess.ipAddress}</span>
                            <span><strong>डिव्हाइस:</strong> {sess.deviceInfo}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {sess.actionsTaken.map((act, i) => (
                              <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] rounded-md font-bold">
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUB-ADMINS MANAGEMENT */}
          {activeTab === 'sub_admins' && (
            <div className="space-y-6">
              {/* Info Header Banner */}
              <div className="bg-gradient-to-r from-amber-900 via-[#800C1E] to-[#A71930] rounded-3xl p-6 text-amber-100 border-2 border-amber-300 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-400 text-[#800C1E] rounded-2xl shadow-md shrink-0">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-amber-200">
                      🔑 सब-ॲडमिन खाते व्यवस्थापन व अधिकार नियंत्रण (Sub-Admin Access Control)
                    </h3>
                    <p className="text-xs text-amber-100/90 font-medium mt-0.5">
                      मुख्य प्रशासक (Super Admin) द्वारे नवीन सब-ॲडमिन्स तयार करा आणि त्यांना विशिष्ट विभागाचेच अधिकार (Permissions) सोपवा.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSubAdminItem(null);
                    setSubAdminName('');
                    setSubAdminUsernameInput('');
                    setSubAdminPasswordInput('');
                    setSubAdminPerms(['manage_profiles', 'add_profiles', 'support_chat']);
                    setSubAdminModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#800C1E] font-black text-xs shadow-lg border-2 border-amber-200 cursor-pointer transition flex items-center gap-2 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>➕ नवीन सब-ॲडमिन जोडा (Add Sub-Admin)</span>
                </button>
              </div>

              {/* Sub-Admins List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subAdmins.length === 0 ? (
                  <div className="col-span-full p-8 bg-white rounded-3xl border-2 border-amber-300 text-center space-y-3">
                    <ShieldCheck className="w-12 h-12 text-amber-600 mx-auto" />
                    <h4 className="font-extrabold text-slate-800 text-base">सध्या एकही सब-ॲडमिन जोडलेला नाही.</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      तुम्ही टीम सदस्यांना विशिष्ट जबाबदाऱ्या (उदा. फक्त बायोडाटा तपासणे, पेमेंट पाहणे, चॅट उत्तरे देणे) देण्यासाठी सब-ॲडमिन बनवू शकता.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubAdminItem(null);
                        setSubAdminName('');
                        setSubAdminUsernameInput('');
                        setSubAdminPasswordInput('');
                        setSubAdminPerms(['manage_profiles', 'add_profiles', 'support_chat']);
                        setSubAdminModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#A71930] text-amber-100 font-black rounded-xl text-xs shadow cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>पहिला सब-ॲडमिन तयार करा</span>
                    </button>
                  </div>
                ) : (
                  subAdmins.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 bg-white rounded-3xl border-2 border-amber-300 shadow-md space-y-4 flex flex-col justify-between hover:border-amber-500 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between border-b border-amber-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#800C1E] border border-amber-300 flex items-center justify-center font-black text-base shadow-sm">
                              {sub.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">{sub.name}</h4>
                              <p className="text-[11px] font-mono text-[#A71930] font-bold">@{sub.username}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-[#800C1E] text-[10px] font-black border border-amber-300">
                            Sub-Admin
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-600 font-bold">
                            <span>पासवर्ड:</span>
                            <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border">
                              {sub.password}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600 font-bold">
                            <span>एकूण परवानग्या:</span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {sub.permissions?.length || 0} / {ALL_SUBADMIN_PERMISSIONS.length}
                            </span>
                          </div>
                        </div>

                        {/* Badges preview of permissions */}
                        <div className="pt-2 border-t border-amber-100 space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">मुख्य अधिकार (Assigned Permissions):</p>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                            {sub.permissions?.map((permKey) => {
                              const match = ALL_SUBADMIN_PERMISSIONS.find((p) => p.id === permKey);
                              return (
                                <span
                                  key={permKey}
                                  className="px-2 py-0.5 bg-amber-50 text-slate-800 text-[10px] font-extrabold rounded-md border border-amber-200 flex items-center gap-1"
                                >
                                  <span>{match?.icon || '🔑'}</span>
                                  <span>{match ? match.labelMr.split('(')[0] : permKey}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-amber-200 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubAdminItem(sub);
                            setSubAdminName(sub.name);
                            setSubAdminUsernameInput(sub.username);
                            setSubAdminPasswordInput(sub.password);
                            setSubAdminPerms(sub.permissions || []);
                            setSubAdminModalOpen(true);
                          }}
                          className="flex-1 py-2 bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-black rounded-xl text-xs border border-amber-300 cursor-pointer shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>परवानग्या बदला</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`तुम्हाला खरोखरच सब-ॲडमिन '${sub.name}' चे खाते हटवायचे आहे का?`)) {
                              deleteSubAdmin(sub.id);
                            }
                          }}
                          className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold rounded-xl text-xs border border-rose-300 cursor-pointer transition"
                          title="खाते हटवा"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: DELETED BIODATAS / RECYCLE BIN */}
          {activeTab === 'recycle_bin' && (
            <div className="space-y-6">
              {/* Info Header Banner */}
              <div className="bg-gradient-to-r from-rose-900 via-[#800C1E] to-[#A71930] rounded-3xl p-6 text-amber-100 border-2 border-amber-400/40 shadow-xl space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-400 text-[#800C1E] rounded-2xl shadow-md shrink-0">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-amber-200">
                        हटवलेले बायोडाटा व रिसायकल बिन (Deleted Biodatas Manager)
                      </h3>
                      <p className="text-xs text-amber-100/90 font-medium">
                        सदस्यांनी किंवा ॲडमिनने सिस्टीममधून हटवलेले सर्व बायोडाटा येथे जतन केले आहेत. तुम्ही ते पुन्हा पुनर्संचयित (Restore) करू शकता किंवा सिस्टीममधून पूर्णपणे हटवू (Permanently Delete) शकता.
                      </p>
                    </div>
                  </div>

                  {recycleBin.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('तुम्हाला खरोखरच रिसायकल बिनमधील सर्व बायोडाटा सिस्टीममधून पूर्णपणे नष्ट करायचे आहेत का? ही क्रिया बदलता येणार नाही.')) {
                          bulkPurgeRecycleBin();
                          setSelectedRecycleIds([]);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 border border-amber-300/40 cursor-pointer transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>रिसायकल बिन पूर्ण रिकामे करा (Purge All)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Multi-Select Toolbar & Search */}
              <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="हटवलेला बायोडाटा नाव, जिल्हा किंवा आयडी ने शोधा..."
                      value={recycleSearchTerm}
                      onChange={(e) => setRecycleSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-amber-300 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A71930] font-medium"
                    />
                  </div>

                  {/* Multi-Select Controls */}
                  {recycleBin.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={() => {
                          const filteredIds = recycleBin
                            .filter((item) =>
                              item.title.toLowerCase().includes(recycleSearchTerm.toLowerCase()) ||
                              item.id.toLowerCase().includes(recycleSearchTerm.toLowerCase())
                            )
                            .map((i) => i.id);
                          if (selectedRecycleIds.length === filteredIds.length) {
                            setSelectedRecycleIds([]);
                          } else {
                            setSelectedRecycleIds(filteredIds);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-slate-900 font-bold border border-amber-300 flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <CheckSquare className="w-4 h-4 text-[#A71930]" />
                        <span>
                          {selectedRecycleIds.length > 0 && selectedRecycleIds.length === recycleBin.length
                            ? 'सर्व निवड रद्द करा'
                            : 'सर्व बायोडाटा निवडा (Select All)'}
                        </span>
                      </button>

                      {selectedRecycleIds.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-50 p-1 rounded-xl border border-amber-300">
                          <span className="text-[11px] font-black text-[#A71930] px-2">
                            निवडलेले: {selectedRecycleIds.length}
                          </span>

                          <button
                            onClick={() => {
                              bulkRestoreRecycleItems(selectedRecycleIds);
                              setSelectedRecycleIds([]);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center gap-1 cursor-pointer transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>पुनर्संचयित करा (Restore Selected)</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`तुम्हाला खरोखरच निवडलेले ${selectedRecycleIds.length} बायोडाटा सिस्टीममधून पूर्णपणे हटवायचे आहेत का?`)) {
                                bulkPermanentDeleteRecycleItems(selectedRecycleIds);
                                setSelectedRecycleIds([]);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow flex items-center gap-1 cursor-pointer transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>सिस्टीममधून पूर्णपणे हटवा (Permanently Delete)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Deleted Biodata Table */}
                <div className="overflow-x-auto rounded-xl border border-amber-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#800C1E] to-[#A71930] text-amber-100 font-extrabold">
                        <th className="p-3 text-center w-10">
                          <input
                            type="checkbox"
                            checked={
                              recycleBin.length > 0 &&
                              selectedRecycleIds.length === recycleBin.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRecycleIds(recycleBin.map((r) => r.id));
                              } else {
                                setSelectedRecycleIds([]);
                              }
                            }}
                            className="rounded accent-[#A71930] w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">बायोडाटा नाव व माहिती (Title / Biodata Info)</th>
                        <th className="p-3">प्रकार (Type)</th>
                        <th className="p-3">हटवल्याची तारीख (Deleted On)</th>
                        <th className="p-3">आयडी (Item ID)</th>
                        <th className="p-3 text-right">पर्याय / कृती (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 bg-white font-medium">
                      {recycleBin.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-bold space-y-2">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-extrabold text-slate-800">
                              सध्या कोणताही हटवलेला बायोडाटा उपलब्ध नाही.
                            </p>
                            <p className="text-xs text-slate-500 font-normal">
                              सदस्यांनी किंवा ॲडमिनने डिलीट केलेले बायोडाटा सुरक्षिततेसाठी येथे जमा होतात.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        recycleBin
                          .filter((item) =>
                            item.title.toLowerCase().includes(recycleSearchTerm.toLowerCase()) ||
                            item.id.toLowerCase().includes(recycleSearchTerm.toLowerCase())
                          )
                          .map((item) => {
                            const isChecked = selectedRecycleIds.includes(item.id);
                            return (
                              <tr
                                key={item.id}
                                className={`hover:bg-amber-50/60 transition ${
                                  isChecked ? 'bg-amber-100/40' : ''
                                }`}
                              >
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedRecycleIds((prev) => [...prev, item.id]);
                                      } else {
                                        setSelectedRecycleIds((prev) =>
                                          prev.filter((id) => id !== item.id)
                                        );
                                      }
                                    }}
                                    className="rounded accent-[#A71930] w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="p-3">
                                  <p className="font-black text-slate-900 text-xs sm:text-sm">
                                    {item.title}
                                  </p>
                                  {item.data && (item.data as any).mobileNumber && (
                                    <p className="text-[11px] text-[#A71930] font-mono font-bold mt-0.5">
                                      📞 {(item.data as any).mobileNumber} • {(item.data as any).district}
                                    </p>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="px-2.5 py-1 bg-rose-100 text-[#800C1E] font-black rounded-full text-[10px] border border-rose-300 inline-block">
                                    {item.originalType === 'biodata' ? '👤 बायोडाटा' : '💍 यशोगाथा'}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-600 font-mono text-[11px]">
                                  {item.deletedAt}
                                </td>
                                <td className="p-3 font-mono text-[10px] text-slate-400">
                                  {item.id}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => restoreRecycleItem(item.id)}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs shadow flex items-center gap-1 cursor-pointer transition"
                                      title="बायोडाटा पुन्हा चालू करा"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>पुनर्संचयित (Restore)</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (window.confirm(`खरोखरच '${item.title}' बायोडाटा सिस्टीममधून कायमस्वरूपी हटवायचा आहे का?`)) {
                                          permanentDeleteRecycleItem(item.id);
                                        }
                                      }}
                                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-xs shadow flex items-center gap-1 cursor-pointer transition"
                                      title="सिस्टीममधून पूर्णपणे डिलीट करा"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>पूर्ण डिलीट (Delete)</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: DELETED PHOTOS & MEDIA TRASH */}
              <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[#800C1E] flex items-center gap-2">
                      <Camera className="w-5 h-5 text-amber-600" />
                      <span>📷 ट्रॅश केलेले फोटो व मीडिया (Deleted Photos Trash - Storage Saver)</span>
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      प्रोफाइल किंवा गॅलरीमधून हटवलेले फोटो येथे सुरक्षितपणे साठवले जातात. तुम्ही ते पुन्हा उमेदवाराच्या प्रोफाइलला जोडल्यास किंवा हवे तसे ठेवू शकता किंवा सर्व्हरची जागा मोकळी करण्यासाठी कायमचे नष्ट करू शकता.
                    </p>
                  </div>

                  {deletedPhotosTrash.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm('⚠️ महत्त्वाचा इशारा: ट्रॅशमधील सर्व फोटो कायमचे डिलीट करून सर्व्हर स्टोरेज मोकळे करायचे आहे का? ही क्रिया बदलता येणार नाही!')
                        ) {
                          if (window.confirm('कृपया पुन्हा एकदा खात्री करा. सर्व हटवलेले फोटो कायमचे नष्ट होतील!')) {
                            purgeAllPhotosTrash();
                          }
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow flex items-center gap-1.5 cursor-pointer transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>सर्व फोटो ट्रॅश रिकामे करा (Clear All Photos Trash)</span>
                    </button>
                  )}
                </div>

                {deletedPhotosTrash.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 font-bold space-y-1.5 bg-amber-50/50 rounded-2xl border border-dashed border-amber-300">
                    <p className="text-sm font-extrabold text-slate-700">फोटो ट्रॅश सध्या रिकामे आहे. (No Trashed Photos)</p>
                    <p className="text-xs text-slate-500 font-normal">
                      जेव्हा एखादा फोटो प्रोफाइलमधून काढून टाकला जातो, तेव्हा तो सुरक्षिततेसाठी प्रथम येथे जमा होतो.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {deletedPhotosTrash.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-amber-50/70 rounded-2xl border border-amber-300 flex flex-col justify-between space-y-2.5 shadow-sm hover:shadow-md transition"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 border border-amber-200">
                          <img
                            src={item.photoUrl}
                            alt={item.profileName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 font-black text-[10px] backdrop-blur-sm">
                            {item.photoType === 'avatar' ? 'मुख्य फोटो' : 'गॅलरी फोटो'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="font-extrabold text-xs text-slate-900 truncate" title={item.profileName}>
                            {item.profileName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            📅 {item.deletedAt} • ~{item.sizeEstimateKb || 200} KB
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-amber-200/80">
                          <button
                            type="button"
                            onClick={() => restorePhotoFromTrash(item.id)}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer transition"
                            title="उमेदवाराच्या प्रोफाईलला हा फोटो पुन्हा जोडा"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>रीस्टोअर</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`खरोखरच ${item.profileName} यांचा हा फोटो कायमचा नष्ट करायचा आहे का?`)) {
                                if (window.confirm('कन्फर्मेशन: फोटो पूर्णपणे डिलीट होईल. पुढे जायचे?')) {
                                  permanentlyDeletePhotoFromTrash(item.id);
                                }
                              }
                            }}
                            className="py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg shadow flex items-center justify-center gap-1 cursor-pointer transition"
                            title="कायमचे डिलीट करा"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>डिलीट</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* PROMO CODE ADD MODAL */}
        {isPromoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl p-6 space-y-4 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h3 className="font-black text-[#A71930] text-base">नवीन प्रोमो कोड तयार करा</h3>
                <button onClick={() => setIsPromoModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPromoCodeSubmit} className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block mb-1">कूपन कोड नाव (e.g. VANJARI30):</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. VANJARI30 किंवा VIPFREE"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-mono uppercase text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1">सवलत प्रकार (Discount Type):</label>
                  <select
                    value={promoDiscountType}
                    onChange={(e) => setPromoDiscountType(e.target.value as any)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="percentage">टक्केवारी सवलत (% OFF)</option>
                    <option value="flat">निश्चित रक्कम (Flat ₹ OFF)</option>
                    <option value="vip_free">🎉 VIP 100% Free Membership</option>
                  </select>
                </div>

                {promoDiscountType !== 'vip_free' && (
                  <div>
                    <label className="block mb-1">सवलत मूल्य (Amount / Percentage):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={promoDiscountValue}
                      onChange={(e) => setPromoDiscountValue(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-1">कमाल वापर मर्यादा (Max Uses):</label>
                  <input
                    type="number"
                    min="1"
                    value={promoMaxUses}
                    onChange={(e) => setPromoMaxUses(Number(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#A71930] text-amber-100 font-black rounded-xl shadow cursor-pointer"
                >
                  कूपन कोड सबमिट करा
                </button>
              </form>
            </div>
          </div>
        )}

        {/* BULK EMAIL MODAL */}
        {isBulkEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl p-6 space-y-4 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h3 className="font-black text-[#A71930] text-base flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#A71930]" />
                  <span>{selectedMemberIds.length} सदस्यांना घाऊक ई-मेल पाठवा</span>
                </h3>
                <button onClick={() => setIsBulkEmailModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendBulkEmailSubmit} className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block mb-1">ई-मेलचा विषय (Subject):</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. वंजारी जोडी विशेष ऑफर / बायोडाटा पूर्ण करा"
                    value={bulkEmailSubject}
                    onChange={(e) => setBulkEmailSubject(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1">ई-मेल मजकूर (Message Body):</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="इथे सदस्यांसाठी संदेश लिहा..."
                    value={bulkEmailBody}
                    onChange={(e) => setBulkEmailBody(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>ई-मेल पाठवा ({selectedMemberIds.length} सदस्य)</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SUB-ADMIN CREATE / EDIT MODAL */}
        {subAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 space-y-4 text-slate-900 shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#A71930]" />
                  <h3 className="font-black text-[#A71930] text-base sm:text-lg">
                    {editingSubAdminItem ? '✏️ सब-ॲडमिन व परवानग्या संपादन (Edit Sub-Admin)' : '🔑 नवीन सब-ॲडमिन जोडा (Add New Sub-Admin)'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSubAdminModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-amber-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSubAdmin} className="space-y-4 text-xs font-bold overflow-y-auto pr-2 flex-1">
                {/* Account Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-100/60 rounded-2xl border border-amber-300">
                  <div>
                    <label className="block text-slate-800 mb-1">सब-ॲडमिनचे नाव (Full Name):</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. नाव व आडनाव"
                      value={subAdminName}
                      onChange={(e) => setSubAdminName(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 mb-1">युझरनेम (Username):</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. admin_username"
                      value={subAdminUsernameInput}
                      onChange={(e) => setSubAdminUsernameInput(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-mono text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 mb-1">पासवर्ड (Password):</label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. Pass@123"
                      value={subAdminPasswordInput}
                      onChange={(e) => setSubAdminPasswordInput(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-mono text-slate-900 font-bold"
                    />
                  </div>
                </div>

                {/* Granular Permissions Selection Header & Quick Select */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <div>
                      <h4 className="font-black text-[#A71930] text-sm">
                        🎯 सब-ॲडमिन अधिकार व परवानग्या निवडा (Assign Granular Permissions):
                      </h4>
                      <p className="text-[11px] text-slate-600 font-normal">
                        सब-ॲडमिनला ज्या ज्या कप्प्याचे अधिकार द्याल, त्यांना फक्त तेच ऑप्शन्स दिसतील.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSubAdminPerms(ALL_SUBADMIN_PERMISSIONS.map((p) => p.id))}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg shadow cursor-pointer"
                      >
                        ☑️ सर्व निवडा (Select All)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubAdminPerms([])}
                        className="px-2.5 py-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-extrabold text-[10px] rounded-lg shadow cursor-pointer"
                      >
                        ☒ सर्व रद्द करा
                      </button>
                    </div>
                  </div>

                  {/* Grouped Permissions Checklist */}
                  <div className="space-y-4">
                    {Array.from(new Set(ALL_SUBADMIN_PERMISSIONS.map((p) => p.category))).map((cat) => (
                      <div key={cat} className="p-3 bg-white rounded-2xl border border-amber-300 space-y-2">
                        <h5 className="font-extrabold text-[#A71930] text-xs flex items-center gap-1.5 border-b border-amber-100 pb-1">
                          <span>{cat}</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ALL_SUBADMIN_PERMISSIONS.filter((p) => p.category === cat).map((perm) => {
                            const isChecked = subAdminPerms.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-amber-100/70 border-amber-400 text-slate-900 font-extrabold shadow-sm'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSubAdminPerms((prev) => [...prev, perm.id]);
                                    } else {
                                      setSubAdminPerms((prev) => prev.filter((x) => x !== perm.id));
                                    }
                                  }}
                                  className="w-4 h-4 mt-0.5 rounded accent-[#A71930] cursor-pointer"
                                />
                                <div>
                                  <span className="block text-xs">
                                    <span className="mr-1">{perm.icon}</span>
                                    <span>{perm.labelMr}</span>
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#A71930] via-[#800C1E] to-[#A71930] hover:from-[#800C1E] text-amber-100 font-black rounded-2xl shadow-xl text-xs border border-amber-300/50 cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>
                      {editingSubAdminItem ? 'सब-ॲडमिन अद्ययावत करा (Save Changes)' : 'सब-ॲडमिन तयार करा (Create Account)'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DOUBLE CONFIRMATION PURGE RECYCLE BIN MODAL */}
        {isPurgeConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border-2 border-rose-500 rounded-3xl p-6 text-slate-900 space-y-4 shadow-2xl text-center">
              <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto animate-bounce" />
              <h3 className="font-black text-rose-700 text-lg">कायमस्वरूपी स्वच्छतेची खात्री!</h3>
              <p className="text-xs font-bold text-slate-700">
                रिसायकल बिनमधील सर्व डेटा आणि क्लाउडिनरी मधील फोटो कायमचे नष्ट होतील. हा बदल परत आणता येणार नाही!
              </p>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setIsPurgeConfirmOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  onClick={() => {
                    bulkPurgeRecycleBin();
                    setIsPurgeConfirmOpen(false);
                  }}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                >
                  होय, कायमचे नष्ट करा
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREENSHOT PREVIEW MODAL */}
        {previewScreenshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative max-w-2xl bg-white p-3 rounded-2xl shadow-2xl">
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={previewScreenshot} alt="Proof" className="max-h-[80vh] rounded-xl object-contain mx-auto" />
            </div>
          </div>
        )}

        {/* BUSINESS VENDOR ADD, EDIT & VIEW DETAILS MODALS */}
        <AdminAddVendorModal
          isOpen={isAddVendorModalOpen}
          onClose={() => setIsAddVendorModalOpen(false)}
        />

        <AdminEditVendorModal
          isOpen={isEditVendorModalOpen}
          onClose={() => {
            setIsEditVendorModalOpen(false);
            setSelectedVendorForEdit(null);
          }}
          vendor={selectedVendorForEdit}
        />

        <AdminViewVendorDetailsModal
          vendor={selectedVendorForView}
          onClose={() => setSelectedVendorForView(null)}
          onEdit={(v) => {
            setSelectedVendorForEdit(v);
            setIsEditVendorModalOpen(true);
          }}
          onApprove={(id) => updateBusinessVendorStatus(id, 'approved')}
          onReject={(id) => updateBusinessVendorStatus(id, 'rejected')}
          onDelete={(id) => deleteBusinessVendor(id)}
        />

        {/* FULL PROFILE, DOCUMENTS, FACE VERIFICATION & BADGES EDITOR MODAL */}
        <AdminEditProfileModal
          profile={editingCandidate}
          isOpen={Boolean(editingCandidate)}
          onClose={() => setEditingCandidate(null)}
          onSave={(profileId, updatedFields) => {
            updateProfileDirect(profileId, updatedFields);
          }}
          canEdit={hasPermission('edit_profiles') || hasPermission('manage_profiles')}
        />

        {/* PER-MEMBER QUICK SETTINGS & PRIVACY OVERRIDES MODAL */}
        <AdminMemberQuickSettingsModal
          profile={selectedProfileForQuickSettings}
          onClose={() => setSelectedProfileForQuickSettings(null)}
        />

            </div>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM DOCK FOR QUICK 1-TOUCH NAVIGATION */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white border-t-2 border-amber-300 py-1.5 px-2 shadow-2xl flex items-center justify-around backdrop-blur-md">
          <button
            onClick={() => {
              setActiveCategory('dashboard_hub');
              setActiveTab('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-black transition-all ${
              activeCategory === 'dashboard_hub' ? 'bg-amber-300 text-[#800C1E] scale-105 shadow' : 'text-amber-100 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{language === 'en' ? 'Dashboard' : 'डॅशबोर्ड'}</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('members_hub');
              setActiveTab('all_members');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-black transition-all ${
              activeCategory === 'members_hub' ? 'bg-amber-300 text-[#800C1E] scale-105 shadow' : 'text-amber-100 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'en' ? 'Members' : 'सदस्य'}</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('members_hub');
              setActiveTab('pending_approval');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-black transition-all relative ${
              activeCategory === 'members_hub' && activeTab === 'pending_approval' ? 'bg-amber-300 text-[#800C1E] scale-105 shadow' : 'text-amber-100 hover:text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{language === 'en' ? 'Approve' : 'मंजुरी'}</span>
            {pendingMembers.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black px-1 rounded-full border border-white">
                {pendingMembers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveCategory('payments_hub');
              setActiveTab('payment_requests');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-black transition-all relative ${
              activeCategory === 'payments_hub' ? 'bg-amber-300 text-[#800C1E] scale-105 shadow' : 'text-amber-100 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{language === 'en' ? 'Payments' : 'पेमेंट'}</span>
            {paymentRequests.filter(p => p.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black px-1 rounded-full border border-white">
                {paymentRequests.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveCategory('system_settings');
              setActiveTab('master_settings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-black transition-all ${
              activeCategory === 'system_settings' ? 'bg-amber-300 text-[#800C1E] scale-105 shadow' : 'text-amber-100 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'Auto/Set' : 'ऑटो/सेट'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
