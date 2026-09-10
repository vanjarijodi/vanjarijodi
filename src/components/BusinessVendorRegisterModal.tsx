import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { uploadToCloudinary, validateFileSize } from '../utils/cloudinary';
import {
  X,
  Building2,
  Phone,
  User,
  MapPin,
  Tag,
  Percent,
  Upload,
  FileText,
  CheckCircle2,
  Plus,
  Loader2,
  Handshake,
  Sparkles,
  HelpCircle,
  Users,
  Utensils,
  DollarSign,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Check,
  Image as ImageIcon,
  Send
} from 'lucide-react';

export const BusinessVendorRegisterModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { siteConfig, addBusinessVendor, addCustomVendorCategory } = useApp();

  const defaultCategories = siteConfig.customVendorCategories || [
    '🍽️ जेवण व कॅटरिंग (साहित्यासह संपूर्ण जेवण)',
    '👨‍🍳 फक्त स्वयंपाकी / आचारी / महाराज (केवळ स्वयंपाक मजुरी)',
    '🍲 कॅटरिंग व स्वयंपाकी (दोन्ही सुविधा उपलब्ध)',
    'मंडप व स्टेज डेकोरेशन (Decoration)',
    'फुलवाले व पुष्प सजावट (Florist & Flowers)',
    'मंगल कार्यालय व विवाह लॉन्स (Halls & Lawns)',
    'फोटोग्राफी व व्हिडियोग्राफी (Photo & Video)',
    'बँड बाजा, सनई, डीजे व साउंड (Band & Sound)',
    'मांडव, खुर्च्या व भांडे भांडार (Chairs & Utensils)',
    'मेकअप आर्टिस्ट व मेहंदी (Makeup & Mehndi)',
    'पौरोहित्य / भटजी (Priest / Guruji)',
    'लग्नाची वाहने व ट्रॅव्हल्स (Wedding Cars)',
    'इतर विवाह व्हेंडर सेवा (Other Wedding Vendors)'
  ];

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState(defaultCategories[0]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Location
  const [district, setDistrict] = useState(MAHARASHTRA_DISTRICTS[0]);
  const [taluka, setTaluka] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapLocation, setGoogleMapLocation] = useState('');

  // Contact
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');

  // Category Specific Flags
  const isMangalKaryalaya = category.includes('मंगल कार्यालय') || category.includes('लॉन्स');
  const isCatering = category.includes('कॅटरिंग') || category.includes('स्वयंपाकी') || category.includes('जेवण') || category.includes('आचारी') || category.includes('महाराज');
  const isDecoration = category.includes('डेकोरेशन') || category.includes('मंडप');
  const isFlorist = category.includes('फुल') || category.includes('पुष्प');

  // Catering & Cooking Labor Specific State
  const isOnlyCookCategory = category.includes('फक्त स्वयंपाकी') || category.includes('आचारी') || category.includes('महाराज');
  const [cateringServiceType, setCateringServiceType] = useState<'cooking_only' | 'full_catering' | 'both'>(
    isOnlyCookCategory ? 'cooking_only' : 'both'
  );
  const [cookingLaborRate, setCookingLaborRate] = useState('');
  const [cookingLaborType, setCookingLaborType] = useState('प्रति माणूस / ताट मजुरी');
  const [cookingTeamSize, setCookingTeamSize] = useState('१ मुख्य महाराज + ४ मदतनीस');
  const [cookingServingStaff, setCookingServingStaff] = useState('होय - आमचे वाढपी पंगत वाढून देतील');
  const [specialDishes, setSpecialDishes] = useState('');
  
  const [hallType, setHallType] = useState('AC हॉल व लॉन दोन्ही');
  const [hallCapacity, setHallCapacity] = useState('५०० ते १००० लोक');
  const [roomsCount, setRoomsCount] = useState('४ खोल्या (२ AC + २ Non-AC)');
  const [diningHallAvailable, setDiningHallAvailable] = useState('होय - स्वतंत्र डायनिंग हॉल उपलब्ध');
  const [parkingCapacity, setParkingCapacity] = useState('१००+ गाड्या (विशाल पार्किंग)');
  
  // Amenities Checkboxes
  const [amenities, setAmenities] = useState<string[]>([
    '२४ तास जनरेटर बॅकअप',
    'वातानुकूलित (Full AC)',
    'सीसीटीव्ही सुरक्षा',
    'स्वच्छ वॉशरुम्स व चेंजिंग रूम्स'
  ]);

  // Rates, Tariffs & Packages (Primary User Requirement)
  const [hallRentDay, setHallRentDay] = useState('');
  const [perPlateRate, setPerPlateRate] = useState('');
  const [packageRate, setPackageRate] = useState('');
  const [advanceBookingAmount, setAdvanceBookingAmount] = useState('२५% ॲडव्हान्स');
  const [cancellationPolicy, setCancellationPolicy] = useState('१५ दिवस अगोदर कळविल्यास ५०% परतावा');
  const [memberDiscount, setMemberDiscount] = useState('वंजारी जोडी परिवारासाठी ५% ते १०% विशेष सवलत');
  const [commissionRate, setCommissionRate] = useState('१०% कमिशन');
  const [description, setDescription] = useState('');

  // Media
  const [photoUrl, setPhotoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

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
      // Fallback base64
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'photo') setPhotoUrl(reader.result);
          else setPdfUrl(reader.result);
        } else {
          setUploadError('अपलोड अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !mobile.trim()) {
      alert('कृपया आवश्यक सर्व माहिती (नाव, मालकाचे नाव व फोन नंबर) भरा.');
      return;
    }

    // Clean rates string
    let combinedRates = '';
    if (isMangalKaryalaya) {
      combinedRates = `हॉल भाडे: ${hallRentDay || 'चर्चेनुसार'} | प्रति ताट: ${perPlateRate || 'लागू नाही'} | पॅकेज: ${packageRate || 'उपलब्ध'}`;
    } else if (isCatering) {
      const parts: string[] = [];
      if (cateringServiceType === 'cooking_only' || cateringServiceType === 'both') {
        if (cookingLaborRate.trim()) {
          parts.push(`फक्त स्वयंपाक मजुरी: ${cookingLaborRate.trim()} (${cookingLaborType})`);
        } else {
          parts.push(`फक्त स्वयंपाक मजुरी उपलब्ध (सामान पार्टीचे)`);
        }
      }
      if (cateringServiceType === 'full_catering' || cateringServiceType === 'both') {
        if (perPlateRate.trim() || hallRentDay.trim()) {
          parts.push(`साहित्यासह जेवण: ${perPlateRate.trim() || hallRentDay.trim()}`);
        }
      }
      if (packageRate.trim()) {
        parts.push(`लग्न पॅकेज: ${packageRate.trim()}`);
      }
      combinedRates = parts.join(' | ') || hallRentDay || perPlateRate || 'दर फोनवर किंवा चर्चेनुसार उपलब्ध';
    } else {
      combinedRates = hallRentDay || perPlateRate || packageRate || 'दर फोनवर किंवा चर्चेनुसार उपलब्ध';
    }

    let finalCategory = category;
    if (isAddingNewCategory && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
      addCustomVendorCategory(finalCategory);
    }

    addBusinessVendor({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      category: finalCategory,
      district,
      taluka: taluka.trim(),
      address: address.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      alternatePhone: alternatePhone.trim(),
      ratesAndPackages: combinedRates,
      hallRentDay: hallRentDay.trim(),
      perPlateRate: perPlateRate.trim(),
      packageRate: packageRate.trim(),
      cateringServiceType: isCatering ? cateringServiceType : undefined,
      cookingLaborRate: isCatering ? cookingLaborRate.trim() : undefined,
      cookingLaborType: isCatering ? cookingLaborType : undefined,
      cookingTeamSize: isCatering ? cookingTeamSize.trim() : undefined,
      cookingServingStaff: isCatering ? cookingServingStaff : undefined,
      specialDishes: isCatering ? specialDishes.trim() : undefined,
      advanceBookingAmount: advanceBookingAmount.trim(),
      cancellationPolicy: cancellationPolicy.trim(),
      hallCapacity: isMangalKaryalaya ? hallCapacity : undefined,
      hallType: isMangalKaryalaya ? hallType : undefined,
      roomsCount: isMangalKaryalaya ? roomsCount : undefined,
      diningHallAvailable: isMangalKaryalaya ? diningHallAvailable : undefined,
      parkingCapacity: isMangalKaryalaya ? parkingCapacity : undefined,
      amenities: isMangalKaryalaya ? amenities : undefined,
      googleMapLocation: googleMapLocation.trim(),
      memberDiscount: memberDiscount.trim(),
      commissionRate: commissionRate.trim(),
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      pdfUrl,
      description: description.trim()
    });

    setIsSubmitted(true);
  };

  const handleSendToAdminTelegram = () => {
    const adminTg = (siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
    const serviceTypeDesc = isCatering
      ? (cateringServiceType === 'cooking_only'
          ? 'फक्त स्वयंपाक मजुरी (किराणा पार्टीचा)'
          : cateringServiceType === 'full_catering'
            ? 'साहित्यासह संपूर्ण कॅटरिंग'
            : 'स्वयंपाक मजुरी व कॅटरिंग दोन्ही')
      : '';

    const msg = encodeURIComponent(
      `*🏛️ नवीन मंगल कार्यालय / विवाह सेवा नोंदणी तपशील*\n\n` +
      `*कार्यालयाचे / व्यवसायाचे नाव:* ${businessName}\n` +
      `*श्रेणी (Category):* ${category}\n` +
      `*मालकाचे नाव:* ${ownerName}\n` +
      `*मोबाईल:* ${mobile}\n` +
      `*टेलिग्राम:* ${whatsapp || mobile}\n` +
      `*जिल्हा व तालुका:* ${district}, ${taluka}\n` +
      (isCatering && serviceTypeDesc ? `*सेवा प्रकार:* ${serviceTypeDesc}\n` : '') +
      (isCatering && cookingLaborRate ? `*स्वयंपाक मजुरी दर:* ${cookingLaborRate} (${cookingLaborType})\n` : '') +
      (isCatering && perPlateRate ? `*प्रति ताट दर:* ${perPlateRate}\n` : '') +
      (isMangalKaryalaya ? `*हॉल भाडे:* ${hallRentDay || 'माहिती दिलेली नाही'}\n*प्रति ताट दर:* ${perPlateRate || 'नाही'}\n*बैठक क्षमता:* ${hallCapacity}\n` : `*दर व पॅकेज:* ${hallRentDay || perPlateRate || packageRate}\n`) +
      `*सवलत:* ${memberDiscount}\n\n` +
      `कृपया आमची माहिती तपासून वंजारी जोडी विवाह डिरेक्टरीवर लाइव्ह करावी.`
    );
    window.open(`https://t.me/${adminTg}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl text-white overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-300">
                  🤝 व्हेंडर नोंदणी (Vendor Registration)
                </h2>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase">
                  दर व माहिती फॉर्म
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                जेवण (कॅटरिंग), डेकोरेशन, फुलवाले, मंगल कार्यालय व विवाह सेवा — दर व सविस्तर माहिती भरा
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {isSubmitted ? (
            <div className="text-center py-8 px-3 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400">
                आपली नोंदणी यशस्वीरीत्या प्राप्त झाली आहे!
              </h3>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                तुमच्या <span className="font-bold text-amber-300">"{businessName}"</span> कार्यालयाचे दर व माहिती आमच्याकडे सुरक्षितपणे नोंदवली गेली आहे. ॲडमिन पडताळणीनंतर ही माहिती वंजारी जोडी विवाह पोर्टलवर सक्रिय केली जाईल.
              </p>

              {/* Summary Card */}
              <div className="p-4 bg-slate-950 border border-amber-500/20 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="font-bold text-amber-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  नोंदवलेली प्राथमिक माहिती:
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                  <div><span className="text-slate-400">नाव:</span> {businessName}</div>
                  <div><span className="text-slate-400">कॅटेगरी:</span> {category}</div>
                  <div><span className="text-slate-400">मालक:</span> {ownerName}</div>
                  <div><span className="text-slate-400">मोबाईल:</span> {mobile}</div>
                  {hallRentDay && <div><span className="text-slate-400">हॉल भाडे:</span> {hallRentDay}</div>}
                  {perPlateRate && <div><span className="text-slate-400">प्रति ताट:</span> {perPlateRate}</div>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendToAdminTelegram}
                  className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border border-sky-400"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>ॲडमिनला टेलिग्रामवर माहिती पाठवा</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all border border-slate-700"
                >
                  ठीक आहे (बंद करा)
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
              
              {/* Informative Explanation Banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 rounded-2xl text-amber-200 text-xs flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white">नमस्कार!</span> आपण मंगल कार्यालय (Hall/Lawn), कॅटरिंग, बँड बाजा किंवा लग्न सेवेचे मालक आहात का? आपले <strong className="text-amber-300">दर (Rates), बैठक क्षमता व सुविधांची</strong> अचूक माहिती येथे भरा. वंजारी जोडी कुटुंबांना आपल्या कार्यालयाची थेट माहिती मिळेल व लग्नांची बुकींग्ज मिळतील.
                </div>
              </div>

              {/* 1. Category Selection */}
              <div className="space-y-2">
                <label className="block text-amber-300 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-400" />
                    व्यवसायाची / कार्यालयाची श्रेणी (Category) निवडा *
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">मंगल कार्यालय / लॉन / इतर सेवा</span>
                </label>

                {!isAddingNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategory(val);
                        if (val.includes('फक्त स्वयंपाकी') || val.includes('आचारी') || val.includes('महाराज')) {
                          setCateringServiceType('cooking_only');
                        } else if (val.includes('साहित्यासह संपूर्ण जेवण')) {
                          setCateringServiceType('full_catering');
                        } else if (val.includes('दोन्ही सुविधा')) {
                          setCateringServiceType('both');
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white outline-none font-bold text-xs sm:text-sm shadow-inner"
                    >
                      {defaultCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(true)}
                      className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      title="नवीन श्रेणी जोडा"
                    >
                      <Plus className="w-4 h-4" />
                      <span>नवीन जोडा</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="नवीन कॅटेगरीचे नाव लिहा (उदा. डिजे सिस्टीम, डेकोरेटर...)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-amber-500 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(false)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      रद्द करा
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Hall / Business Name & Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    {isMangalKaryalaya ? 'मंगल कार्यालयाचे / लॉनचे नाव *' : 'व्यवसायाचे / दुकानाचे नाव *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isMangalKaryalaya ? 'मंगल कार्यालय किंवा लॉनचे नाव प्रविष्ट करा' : 'व्यवसाय / फर्मचे नाव प्रविष्ट करा'}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    मालक / व्यवस्थापकाचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="मालक किंवा व्यवस्थापकाचे नाव प्रविष्ट करा"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* 3. Contact Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    संपर्क मोबाईल नंबर *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="१० अंकी मोबाईल नंबर"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    टेलिग्राम युझरनेम / संपर्क
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. @username किंवा टेलिग्राम नंबर"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1">
                    पर्यायी संपर्क नंबर
                  </label>
                  <input
                    type="tel"
                    placeholder="पर्यायी फोन नंबर प्रविष्ट करा"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* 4. Location: District, Taluka, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    जिल्हा निवडा *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1">
                    तालुका / शहर *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="तालुका किंवा शहर प्रविष्ट करा"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1">
                    गुगल मॅप्स लिंक (Google Map)
                  </label>
                  <input
                    type="text"
                    placeholder="गुगल मॅप्स लोकेशन लिंक (लागू असल्यास)"
                    value={googleMapLocation}
                    onChange={(e) => setGoogleMapLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-200 font-bold text-xs mb-1">
                  संपूर्ण पत्ता व लँडमार्क (Full Address) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="पत्ता व लँडमार्क प्रविष्ट करा"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              {/* 5. DEDICATED MANGAL KARYALAYA / HALL SPECIFICATIONS (Shown if Mangal Karyalaya selected) */}
              {isMangalKaryalaya && (
                <div className="p-4 bg-gradient-to-br from-amber-950/30 to-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <h4 className="font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      🏛️ मंगल कार्यालय / लॉन क्षमता व सुविधा तपशील
                    </h4>
                    <span className="text-[10px] text-amber-200/70">विस्तृत हॉल माहिती</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold text-xs mb-1">
                        हॉलचा प्रकार (Hall Type)
                      </label>
                      <select
                        value={hallType}
                        onChange={(e) => setHallType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="AC हॉल व लॉन दोन्ही">AC हॉल व लॉन दोन्ही</option>
                        <option value="फक्त AC हॉल">फक्त AC हॉल (Air Conditioned)</option>
                        <option value="नॉन-AC हॉल">नॉन-AC हॉल (Normal Hall)</option>
                        <option value="ओपन लॉन (Open Lawn / Garden)">ओपन लॉन (Open Lawn / Garden)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        बैठक / आसन क्षमता (Seating Capacity) *
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. ५०० ते १००० लोक / १५०० लोक"
                        value={hallCapacity}
                        onChange={(e) => setHallCapacity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" />
                        जेवणाचा हॉल (Dining Area)
                      </label>
                      <select
                        value={diningHallAvailable}
                        onChange={(e) => setDiningHallAvailable(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="होय - स्वतंत्र डायनिंग हॉल उपलब्ध">होय - स्वतंत्र डायनिंग हॉल उपलब्ध</option>
                        <option value="नाही - एकाच हॉलमध्ये व्यवस्था">नाही - एकाच हॉलमध्ये व्यवस्था</option>
                        <option value="ओपन लॉन जेवण व्यवस्था">ओपन लॉन जेवण व्यवस्था</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold text-xs mb-1">
                        खोल्यांची संख्या (Groom & Bride Rooms)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. ४ खोल्या (२ AC + २ Non-AC)"
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-bold text-xs mb-1">
                        पार्किंग सोय (Parking Capacity)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. १००+ चारचाकी व २००+ दुचाकी पार्किंग"
                        value={parkingCapacity}
                        onChange={(e) => setParkingCapacity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Amenities Checkboxes */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-slate-300 font-bold text-xs mb-2">
                      उपलब्ध सुविधा (सुविधांवर टिक करा):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        '२४ तास जनरेटर बॅकअप',
                        'वातानुकूलित (Full AC)',
                        'सीसीटीव्ही सुरक्षा',
                        'स्वच्छ वॉशरुम्स व चेंजिंग रूम्स',
                        'साउंड व माइक सिस्टीम',
                        'शुद्ध आरओ पिण्याचे पाणी',
                        'स्वतंत्र स्वयंपाक घर व शेगडी',
                        'सफाई व मदतनीस कर्मचारी'
                      ].map((item) => {
                        const checked = amenities.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleAmenity(item)}
                            className={`p-2 rounded-xl text-left text-[11px] font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                              checked
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] border ${checked ? 'bg-amber-400 text-slate-950 border-amber-400 font-black' : 'border-slate-600'}`}>
                              {checked && '✓'}
                            </span>
                            <span className="truncate">{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. PRIMARY USER REQUIREMENT: RATES, TARIFFS & CHARGES (दर व भाडे तपशील) */}
              <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <h4 className="font-black text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    💰 दर, भाडे व पॅकेज तपशील (Rates & Tariffs) *
                  </h4>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                    महत्त्वाचे
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  कृपया आपले दर स्पष्टपणे लिहा जेणेकरून लग्नकार्यासाठी विचारणाऱ्या ग्राहकांना अचूक कल्पना येईल:
                </p>

                {/* 🍲 CATERING & COOK SERVICE TYPE SELECTOR (फक्त स्वयंपाक मजुरी vs साहित्यासह कॅटरिंग) */}
                {isCatering && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-2xl space-y-2.5">
                    <label className="block text-amber-300 font-bold text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>🍲</span>
                        <span>जेवण / स्वयंपाक सेवेचा प्रकार निवडा (Service Option) *</span>
                      </span>
                      <span className="text-[10px] text-amber-200/80 font-normal">
                        आपण कोणती सुविधा देता?
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Option 1: Cooking Labor Only */}
                      <button
                        type="button"
                        onClick={() => setCateringServiceType('cooking_only')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          cateringServiceType === 'cooking_only'
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-base">👨‍🍳</span>
                          <span className="truncate">फक्त स्वयंपाक मजुरी</span>
                        </div>
                        <p className={`text-[10px] mt-1.5 leading-snug ${cateringServiceType === 'cooking_only' ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                          किराणा साहित्य व भाजीपाला ग्राहकांचे, आम्ही फक्त जेवण बनवतो (कुकिंग मजुरी).
                        </p>
                      </button>

                      {/* Option 2: Full Catering with Material */}
                      <button
                        type="button"
                        onClick={() => setCateringServiceType('full_catering')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          cateringServiceType === 'full_catering'
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-base">🍽️</span>
                          <span className="truncate">साहित्यासह संपूर्ण कॅटरिंग</span>
                        </div>
                        <p className={`text-[10px] mt-1.5 leading-snug ${cateringServiceType === 'full_catering' ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                          धान्य, किराणा, स्वयंपाक व वाढपी सर्व आमचे (प्रति ताट/प्लेट दर).
                        </p>
                      </button>

                      {/* Option 3: Both Options */}
                      <button
                        type="button"
                        onClick={() => setCateringServiceType('both')}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          cateringServiceType === 'both'
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-base">✨</span>
                          <span className="truncate">दोन्ही पर्याय उपलब्ध</span>
                        </div>
                        <p className={`text-[10px] mt-1.5 leading-snug ${cateringServiceType === 'both' ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                          ग्राहकांच्या मागणीनुसार फक्त स्वयंपाक मजुरी किंवा साहित्यासह जेवण दोन्ही करतो.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* 👨‍🍳 DEDICATED COOKING LABOR FIELDS (दिसणार जर फक्त स्वयंपाक मजुरी किंवा दोन्ही निवडले असेल) */}
                {isCatering && (cateringServiceType === 'cooking_only' || cateringServiceType === 'both') && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-400/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <span>👨‍🍳</span>
                        <span>फक्त स्वयंपाक मजुरीचे तपशील (Cooking Labor Rates):</span>
                      </span>
                      <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        किराणा ग्राहकांचा
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold text-xs mb-1">
                          मजुरी आकारण्याची पद्धत (Labor Type)
                        </label>
                        <select
                          value={cookingLaborType}
                          onChange={(e) => setCookingLaborType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none text-xs font-bold"
                        >
                          <option value="प्रति माणूस / ताट मजुरी">प्रति माणूस / ताट मजुरी (उदा. ₹३५ ते ₹५० / माणूस)</option>
                          <option value="प्रति क्विंटल धान्य मजुरी">प्रति क्विंटल धान्य मजुरी (उदा. ₹१,५०० ते ₹२,५०० / क्विंटल)</option>
                          <option value="एकरकमी लग्न स्वयंपाक मजुरी">एकरकमी लग्न स्वयंपाक मजुरी (उदा. ₹२०,००० ते ₹३५,०००)</option>
                          <option value="प्रति दिवस आचारी मजुरी">प्रति दिवस आचारी मजुरी (उदा. ₹३,००० / दिवस)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-200 font-bold text-xs mb-1">
                          स्वयंपाक मजुरी दर (रु. मध्ये) *
                        </label>
                        <input
                          type="text"
                          required={cateringServiceType === 'cooking_only'}
                          placeholder="उदा. ₹४० प्रति ताट किंवा ₹२,००० प्रति क्विंटल / एकरकमी ₹२५,०००"
                          value={cookingLaborRate}
                          onChange={(e) => setCookingLaborRate(e.target.value)}
                          className="w-full bg-slate-950 border border-amber-500/60 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold text-xs mb-1">
                          आचारी व मदतनीस टीम (Maharaj & Helpers Team)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. १ मुख्य आचारी (महाराज) + ४ मदतनीस"
                          value={cookingTeamSize}
                          onChange={(e) => setCookingTeamSize(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold text-xs mb-1">
                          पंगत वाढण्याची सोय (Serving Arrangement)
                        </label>
                        <select
                          value={cookingServingStaff}
                          onChange={(e) => setCookingServingStaff(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none text-xs"
                        >
                          <option value="होय - आमचे वाढपी पंगत वाढून देतील">होय - आमचे वाढपी पंगत वाढून देतील</option>
                          <option value="केवळ स्वयंपाक बनवणे (वाढपी ग्राहकांचे)">केवळ स्वयंपाक बनवणे (वाढपी ग्राहकांचे)</option>
                          <option value="वाढप्यांसाठी नाममात्र स्वतंत्र शुल्क राहील">वाढप्यांसाठी नाममात्र स्वतंत्र शुल्क राहील</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🍽️ FULL CATERING RATES (जर साहित्यासह कॅटरिंग किंवा दोन्ही निवडले असेल) */}
                {isCatering && (cateringServiceType === 'full_catering' || cateringServiceType === 'both') && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                        <span>🍽️</span>
                        <span>साहित्यासह संपूर्ण कॅटरिंग दर (Full Catering - Per Plate):</span>
                      </span>
                      <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        किराणा व वाढपी आमचे
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-200 font-bold text-xs mb-1">
                          प्रति ताट / प्रति प्लेट दर (Per Plate Rate) *
                        </label>
                        <input
                          type="text"
                          required={cateringServiceType === 'full_catering'}
                          placeholder="उदा. साधे व्हेज ₹२२०, स्पेशल व्हेज ₹३५०, नॉनव्हेज ₹४५०"
                          value={perPlateRate}
                          onChange={(e) => setPerPlateRate(e.target.value)}
                          className="w-full bg-slate-950 border border-emerald-500/60 focus:border-emerald-400 rounded-xl px-3 py-2 text-white outline-none font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold text-xs mb-1">
                          किमान ऑर्डर क्षमता (Min Order Capacity)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. किमान २०० ते २००० लोकांचे जेवण"
                          value={hallRentDay}
                          onChange={(e) => setHallRentDay(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 🍛 SPECIAL DISHES (फक्त कॅटरिंग व आचारी साठी) */}
                {isCatering && (
                  <div>
                    <label className="block text-slate-200 font-bold text-xs mb-1">
                      🍲 खास डिशेस व मेनू स्पेशालिटी (Menu Specialties):
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. पुरणपोळी, श्रीखंड, गुलाबजाम, बासुंदी, वांग्याची भाजी, डाळभात, मटण/चिकन स्पेशल"
                      value={specialDishes}
                      onChange={(e) => setSpecialDishes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none text-xs"
                    />
                  </div>
                )}

                {/* OTHER VENDORS (MANGAL KARYALAYA, DECORATION, FLORIST ETC.) */}
                {!isCatering && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-200 font-bold text-xs mb-1">
                        {isMangalKaryalaya
                          ? 'कार्यालयाचे / हॉलचे भाडे (प्रति दिवस / १ शिफ्ट) *'
                          : isDecoration
                            ? 'स्टेज व मंडप डेकोरेशन मूळ दर (Rates) *'
                            : isFlorist
                              ? 'वरमाला व ताजी फुले सजावट मूळ दर (Rates) *'
                              : 'कामाचे / सेवेचे मूळ दर (Rates) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          isMangalKaryalaya
                            ? 'उदा. रु. ३५,००० / १ दिवस (किंवा ₹५०,००० / शिफ्ट)'
                            : isDecoration
                              ? 'उदा. स्टेज डेकोरेशन ₹१५,००० ते ₹५०,०००'
                              : isFlorist
                                ? 'उदा. वरमाला जोडी ₹१,५००, लग्न गाडी ₹२,५००'
                                : 'उदा. रु. १५,००० / लग्न किंवा दिवस'
                        }
                        value={hallRentDay}
                        onChange={(e) => setHallRentDay(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-200 font-bold text-xs mb-1">
                        {isDecoration
                          ? 'संपूर्ण लग्न मंडप पॅकेज दर (Full Mandap Package)'
                          : isFlorist
                            ? 'स्टेज व मंडप संपूर्ण फुले पॅकेज दर'
                            : isMangalKaryalaya
                              ? 'जेवण दर (प्रति ताट - लागू असल्यास)'
                              : 'अतिरिक्त पॅकेज दर'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isDecoration
                            ? 'उदा. संपूर्ण लग्न पॅकेज रु. ७५,००० (स्टेज, गेट, विधी मंडप)'
                            : isFlorist
                              ? 'उदा. संपूर्ण फुले पॅकेज रु. २५,००० (वरमाला, स्टेज फुले, गाडी)'
                              : isMangalKaryalaya
                                ? 'उदा. रु. २२० ते ३५० प्रति ताट'
                                : 'उदा. रु. ५०,००० संपूर्ण लग्न'
                        }
                        value={perPlateRate}
                        onChange={(e) => setPerPlateRate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Packages & Advance Booking */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-200 font-bold text-xs mb-1">
                      {isCatering ? 'संपूर्ण लग्न जेवण एकत्रित बजेट (Full Catering Budget)' : 'एकत्रित संपूर्ण पॅकेज दर (Full Wedding Package)'}
                    </label>
                    <input
                      type="text"
                      placeholder={isCatering ? 'उदा. ५०० लोकांचे जेवण रु. १,२०,०००' : 'उदा. रु. १,५०,००० (हॉल + जेवण + मंडप)'}
                      value={packageRate}
                      onChange={(e) => setPackageRate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold text-xs mb-1">
                      बुकिंग ॲडव्हान्स रक्कम (Advance Amount)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. २५% ॲडव्हान्स किंवा रु. १०,००० टोकन"
                      value={advanceBookingAmount}
                      onChange={(e) => setAdvanceBookingAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-emerald-400" />
                      वंजारी जोडी कुटुंबांसाठी विशेष सवलत (Discount)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. वंजारी जोडी सदस्यांना ५% ते १०% सूट"
                      value={memberDiscount}
                      onChange={(e) => setMemberDiscount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold text-xs mb-1">
                      बुकिंग रद्द करण्याचे नियम (Cancellation Policy)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. १५ दिवस अगोदर कळविल्यास ५०% परतावा"
                      value={cancellationPolicy}
                      onChange={(e) => setCancellationPolicy(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Photos & Rate Card Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    कार्यालयाचा / हॉलचा फोटो
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-slate-950 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Upload className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-xs text-slate-300 truncate">
                      {photoUrl ? 'हॉल फोटो जोडला गेला ✓' : 'हॉल/कार्यालयाचा फोटो निवडा'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold text-xs mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    रेट कार्ड / माहितीपत्रक (PDF किंवा फोटो)
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-slate-950 border border-dashed border-slate-700 hover:border-rose-500 rounded-xl cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-xs text-slate-300 truncate">
                      {pdfUrl ? 'रेट कार्ड फाईल जोडली गेली ✓' : 'रेट कार्ड / ब्रोशर जोडा'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'pdf')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-400 font-bold">⚠️ {uploadError}</p>
              )}

              {/* 8. Additional Description / Rules */}
              <div>
                <label className="block text-slate-200 font-bold text-xs mb-1">
                  इतर विशेष माहिती किंवा नियम (Special Notes & Rules)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. रात्री १० वाजेपर्यंत ध्वनिक्षेपक परवानगी, जनरेटर डिझेल चार्जेस, विशेष रोषणाई, सनई चौघडा..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Building2 className="w-5 h-5 text-slate-950" />
                  <span>माहिती व दर नोंदणी अर्ज सादर करा (Submit Registration)</span>
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-1.5">
                  नोंदणी केल्यावर ही माहिती ॲडमिनकडे सुरक्षित जमा होईल व पडताळणीनंतर पोर्टलवर प्रसिद्ध केली जाईल.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
