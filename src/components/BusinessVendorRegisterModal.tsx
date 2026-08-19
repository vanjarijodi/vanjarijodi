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
  HelpCircle
} from 'lucide-react';

export const BusinessVendorRegisterModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { siteConfig, addBusinessVendor, addCustomVendorCategory } = useApp();

  const defaultCategories = siteConfig.customVendorCategories || [
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
  const [category, setCategory] = useState(defaultCategories[0]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [district, setDistrict] = useState(MAHARASHTRA_DISTRICTS[0]);
  const [taluka, setTaluka] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ratesAndPackages, setRatesAndPackages] = useState('');
  const [memberDiscount, setMemberDiscount] = useState('वंजारी जोडी सदस्यांसाठी ५% विशेष सवलत');
  const [commissionRate, setCommissionRate] = useState('१०% कमिशन');
  const [description, setDescription] = useState('');

  const [photoUrl, setPhotoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

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
      ratesAndPackages: ratesAndPackages.trim(),
      memberDiscount: memberDiscount.trim(),
      commissionRate: commissionRate.trim(),
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
      pdfUrl,
      description: description.trim()
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl text-white overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300">
                आमच्यासोबत व्यवसाय करा (Vendor Registration)
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                मंगल कार्यालय, बँड बाजा, कॅटरिंग, फोटोग्राफी व लग्न व्यवसाय नोंदणी
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {isSubmitted ? (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400">
                तुमची व्यवसाय नोंदणी यशस्वी झाली!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                तुमच्या <span className="font-bold text-amber-300">"{businessName}"</span> व्यवसायाची नोंदणी आमच्याकडे प्राप्त झाली आहे. ॲडमिन पडताळणीनंतर तुमचा व्यवसाय वंजारी जोडी डिजिटल डिरेक्टरीवर लाइव्ह दिसेल.
              </p>

              <div className="p-4 bg-slate-950 border border-amber-500/20 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  व्यवसाय भागीदारीचे फायदे:
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                  <li>हजारो वंजारी कुटुंबांपर्यंत तुमच्या व्यवसायाची थेट पोहोच.</li>
                  <li>५% ते १०% कमिशन तत्त्वावर खात्रीशीर लग्न सोहळ्यांची बुकींग्ज.</li>
                  <li>वंजारी जोडी पोर्टलवर विशेष ओळख व रेट कार्ड प्रदर्शन.</li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer transition-all"
              >
                ठीक आहे (बंद करा)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {/* Informative Banner */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200 text-xs flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white">टीप:</span> तुम्ही मंगल कार्यालय, कॅटरिंग, बँड बाजा, फोटोग्राफी किंवा लग्न कार्य सेवेचे मालक आहात का? तुमची माहिती जोडा. वंजारी जोडी कुटुंबांना तुमच्या सेवेचा लाभ मिळेल व तुम्हाला ५% - १०% कमिशनवर व्यवसाय मिळेल.
                </div>
              </div>

              {/* 1. Category Dropdown & Custom Category */}
              <div className="space-y-2">
                <label className="block text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-400" />
                  व्यवसायाची श्रेणी (Category) निवडा *
                </label>

                {!isAddingNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none font-medium"
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
                      className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                      className="flex-1 bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500"
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

              {/* 2. Business Name & Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    व्यवसायाचे / दुकानाचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. व्यवसायाचे नाव"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    मालकाचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. मालकाचे पूर्ण नाव"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* 3. District & Taluka / Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    जिल्हा निवडा *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {MAHARASHTRA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">
                    तालुका / शहर *
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. तालुका / शहर"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1">
                  संपूर्ण पत्ता (Address)
                </label>
                <input
                  type="text"
                  placeholder="उदा. व्यवसायाचा संपूर्ण पत्ता"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              {/* 4. Mobile & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    संपर्क मोबाईल नंबर *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="उदा. 0000000000"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">
                    व्हॉट्सॲप नंबर
                  </label>
                  <input
                    type="tel"
                    placeholder="उदा. 0000000000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* 5. Rates, Packages, Discounts & Commission */}
              <div className="p-3.5 bg-slate-950 border border-amber-500/20 rounded-2xl space-y-3">
                <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1">
                  <Tag className="w-4 h-4 text-amber-400" />
                  दर, सवलत व कमिशन तपशील
                </h4>

                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">
                    तुमचे दर व पॅकेज माहिती (Rates & Packages) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="उदा. हॉल भाडे: रु. २५,००० / १ दिवस (AC सुविधा व ५०० खुर्च्या समाविष्ट) किंवा कॅटरिंग दर: रु. २५० प्रति ताट"
                    value={ratesAndPackages}
                    onChange={(e) => setRatesAndPackages(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold text-xs mb-1">
                      सदस्यांना विशेष सवलत / डिस्काउंट
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. वंजारी जोडी सदस्यांना ५% सूट"
                      value={memberDiscount}
                      onChange={(e) => setMemberDiscount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-emerald-400" />
                      कमिशन ऑफर (Commission)
                    </label>
                    <select
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white outline-none"
                    >
                      <option value="५% कमिशन">५% कमिशन</option>
                      <option value="१०% कमिशन">१०% कमिशन</option>
                      <option value="१५% कमिशन">१५% कमिशन</option>
                      <option value="फिक्स मानधन / सानुकूल कमिशन">फिक्स मानधन / सानुकूल</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. Photo & Brochure PDF Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    व्यवसाय/हॉल फोटो
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Upload className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-xs text-slate-300 truncate">
                      {photoUrl ? 'फोटो जोडला गेला ✓' : 'फोटो निवडा (Image)'}
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
                  <label className="block text-slate-300 font-bold text-xs mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    रेट कार्ड / ब्रोशर (PDF)
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-slate-950 border border-dashed border-slate-700 hover:border-rose-500 rounded-xl cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-xs text-slate-300 truncate">
                      {pdfUrl ? 'PDF जोडली गेली ✓' : 'रेट कार्ड PDF जोडा'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'pdf')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-400 font-bold">⚠️ {uploadError}</p>
              )}

              {/* 7. Additional Description */}
              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1">
                  इतर सोयी, सुविधा व माहिती
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. AC रुम्स उपलब्ध, पार्किंग क्षमता, विशेष रोषणाई, वाजंत्री, वैयक्तिक सुविधा..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Handshake className="w-5 h-5" />
                  <span>व्यवसाय नोंदणी अर्ज सादर करा</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
