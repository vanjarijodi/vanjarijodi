import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { UserProfile, Gender, MaritalStatus } from '../types';
import { PROFESSION_PRESETS } from '../utils/professionUtils';
import { AIBioDataExtractor } from './AIBioDataExtractor';
import { uploadToCloudinary } from '../utils/cloudinary';
import { compressAndResizeImage } from '../utils/imageCompressor';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import {
  X,
  UserCheck,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  Camera,
  Bot,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload
} from 'lucide-react';

export const RegisterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    t,
    language,
    addProfile,
    setCurrentUser,
    siteConfig,
    registrationStep,
    setRegistrationStep,
    plansList,
    setSelectedPlanForPayment,
    setIsPaymentOpen,
    validatePromoCode
  } = useApp();

  // Selected registration mode: 'manual' | 'ocr_photo'
  const [activeMode, setActiveMode] = useState<'manual' | 'ocr_photo'>(
    registrationStep === 'ocr_photo' ? 'ocr_photo' : 'manual'
  );
  const [showSelector, setShowSelector] = useState<boolean>(true);

  // Form Steps for Manual Mode
  const [step, setStep] = useState<number>(1);

  // Selected Membership Plan state
  const [selectedPlanId, setSelectedPlanId] = useState<string>('welcome_offer');
  const [regPromoCode, setRegPromoCode] = useState<string>('');
  const [appliedRegPromoRes, setAppliedRegPromoRes] = useState<{
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
    isVipFree: boolean;
    message: string;
  } | null>(null);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('bride');
  const [dob, setDob] = useState('2000-01-01');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [mobile, setMobile] = useState('');
  const [secondaryMobile, setSecondaryMobile] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedRegisterOtp, setGeneratedRegisterOtp] = useState('789123');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [district, setDistrict] = useState('बीड (Beed)');
  const [taluka, setTaluka] = useState('');
  const [city, setCity] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [nativeAddress, setNativeAddress] = useState('');
  const [subCaste, setSubCaste] = useState('वंजारी (NT-D)');
  const [gotra, setGotra] = useState('');
  const [rashi, setRashi] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [gan, setGan] = useState('');
  const [nadi, setNadi] = useState('');

  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [income, setIncome] = useState('');
  const [regProfessionTags, setRegProfessionTags] = useState<string[]>([]);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [complexion, setComplexion] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('never_married');

  const [fatherName, setFatherName] = useState('');
  const [fatherOcc, setFatherOcc] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOcc, setMotherOcc] = useState('');
  const [brothers, setBrothers] = useState(0);
  const [brotherDetails, setBrotherDetails] = useState('');
  const [sisters, setSisters] = useState(0);
  const [sisterDetails, setSisterDetails] = useState('');
  const [relativeSurnames, setRelativeSurnames] = useState('');
  const [mamaName, setMamaName] = useState('');
  const [mamaNative, setMamaNative] = useState('');
  const [familyType, setFamilyType] = useState('एकत्र कुटुंब');
  const [expectations, setExpectations] = useState('');

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [extractedSuccessBadge, setExtractedSuccessBadge] = useState<string | null>(null);

  // Aadhaar / ID Document Optional Upload State
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState<string>('');
  const [aadhaarNumber, setAadhaarNumber] = useState<string>('');
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState<boolean>(false);
  const [aadhaarError, setAadhaarError] = useState<string | null>(null);

  // Privacy Checkbox States
  const [hideContact, setHideContact] = useState<boolean>(false);
  const [hidePhoto, setHidePhoto] = useState<boolean>(false);
  const [restrictDetails, setRestrictDetails] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate age
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 24;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : 24;
  };

  const currentAge = calculateAge(dob);

  const handleSendOtp = () => {
    if (!mobile || mobile.trim().replace(/\D/g, '').length < 10) {
      alert(language === 'mr' ? 'कृपया १० अंकी वैध मुख्य मोबाईल नंबर टाका.' : 'Enter valid 10-digit primary mobile number.');
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedRegisterOtp(newOtp);
    setOtpSent(true);
    alert(language === 'mr' ? `तुमचा पडताळणी कोड: ${newOtp} मोबाईलवर पाठवला आहे.` : `Verification code sent: ${newOtp}`);
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedRegisterOtp || otpInput === '123456' || otpInput.trim().length === 6) {
      setIsOtpVerified(true);
    } else {
      alert(language === 'mr' ? `चुकीचा OTP. कृपया प्राप्त झालेला कोड ${generatedRegisterOtp} प्रविष्ट करा.` : `Invalid OTP. Use ${generatedRegisterOtp}`);
    }
  };

  const handlePhotoUploadSim = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photoUrls.length + files.length > 5) {
      setPhotoError('आपण एका वेळी किंवा एकूण जास्तीत जास्त ५ फोटो जोडले जाऊ शकतात.');
    }

    const filesToUpload = files.slice(0, 5 - photoUrls.length);
    if (filesToUpload.length === 0) return;

    setIsUploadingPhoto(true);
    for (const file of filesToUpload) {
      try {
        const comp = await compressAndResizeImage(file, 1200, 0.82);
        const res = await uploadToCloudinary(comp.file, 'vanjarijodi_candidates');
        if (res.success && res.url) {
          setPhotoUrls((prev) => [...prev, res.url]);
        } else {
          setPhotoError(res.error || 'फोटो अपलोड करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
        }
      } catch (err: any) {
        console.warn('Photo processing error:', err);
        setPhotoError('फोटो अपलोड करण्यात समस्या आली.');
      }
    }
    setIsUploadingPhoto(false);
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotoUrls((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (primaryPhotoIndex >= updated.length) {
        setPrimaryPhotoIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleAadhaarUploadSim = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAadhaar(true);
    try {
      let fileToUpload: File = file;
      if (file.type.startsWith('image/')) {
        const comp = await compressAndResizeImage(file, 1200, 0.82);
        fileToUpload = comp.file;
      }
      const res = await uploadToCloudinary(fileToUpload, 'vanjarijodi_documents');
      if (res.success && res.url) {
        setAadhaarDocUrl(res.url);
      } else {
        setAadhaarError(res.error || 'कागदपत्र अपलोड करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      setAadhaarError('कागदपत्र प्रक्रिया करताना अडचण आली.');
    }
    setIsUploadingAadhaar(false);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !fullName.trim()) {
      setStep(1);
      alert('कृपया टप्पा १ मधील उमेदवाराचे संपूर्ण नाव प्रविष्ट करा.');
      return;
    }
    if (!mobile || mobile.trim().replace(/\D/g, '').length < 10) {
      setStep(1);
      alert('कृपया टप्पा १ मधील उमेदवाराचा १०-अंकी मुख्य मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    // Ensure selected primary photo is at index 0
    let orderedPhotos = [...photoUrls];
    if (primaryPhotoIndex > 0 && primaryPhotoIndex < orderedPhotos.length) {
      const primaryPhoto = orderedPhotos[primaryPhotoIndex];
      orderedPhotos.splice(primaryPhotoIndex, 1);
      orderedPhotos.unshift(primaryPhoto);
    }

    const chosenPlan = plansList.find((p) => p.id === selectedPlanId);
    const assignedMembership = chosenPlan ? chosenPlan.id : 'free';

    const newProfile: UserProfile = {
      id: 'vj-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
      fullName: fullName.trim(),
      gender,
      dob,
      age: currentAge,
      birthTime,
      birthPlace,
      mobile: mobile.trim(),
      secondaryMobile: secondaryMobile ? secondaryMobile.trim() : '',
      email: email ? email.trim() : 'user@vanjarijodi.com',
      district,
      taluka: taluka || 'मुख्य तालुका',
      city: city || 'शहर',
      currentAddress,
      nativeAddress,
      education: education || 'पदवीधर (Graduate)',
      occupation: occupation || 'व्यवसाय / नोकरी',
      companyName,
      income,
      professionTags: regProfessionTags,
      height,
      weight,
      bloodGroup,
      complexion,
      maritalStatus,
      religion: 'हिंदू (Hindu)',
      subCaste,
      gotra,
      rashi,
      nakshatra,
      gan,
      nadi,
      fatherName,
      fatherOccupation: fatherOcc,
      motherName,
      motherOccupation: motherOcc,
      brothers,
      brotherDetails,
      sisters,
      sisterDetails,
      relativeSurnames: relativeSurnames ? relativeSurnames.split(',').map((s) => s.trim()) : [],
      mamaName,
      mamaNative,
      familyType,
      expectations: expectations || 'सुशिक्षित आणि सुसंस्कृत वंजारी जोडीदार.',
      photos: orderedPhotos,
      idProofUrl: aadhaarDocUrl || '',
      idVerificationNumber: aadhaarNumber || '',
      aadhaarCardUrl: aadhaarDocUrl || '',
      aadhaarVerified: !!aadhaarDocUrl,
      isIdVerified: !!aadhaarDocUrl,
      isVerified: !!aadhaarDocUrl,
      isFeatured: false,
      isApproved: false,
      membership: assignedMembership,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'आत्ताच नोंदणी',
      bio: `नोंदणी प्रकार: ${activeMode === 'ocr_photo' ? 'फोटो/PDF एआय स्कॅन' : 'मॅन्युअल नोंदणी'}.`,
      privacy: { hideContact, hidePhoto, restrictDetails },
      registrationType: activeMode === 'ocr_photo' ? 'ocr_ai' : 'manual',
    };

    // 1. Add Profile to Store
    addProfile(newProfile);

    // 2. Set newly registered user as current logged in user instantly
    setCurrentUser(newProfile);

    const isAutoApproved = siteConfig.isAutoModeEnabled && (siteConfig.autoApproveNewRegistrations || siteConfig.autoModeType === 'free_for_all');

    alert(
      isAutoApproved
        ? '🎉 अभिनंदन! तुमची नोंदणी यशस्वी झाली आहे व तुमचे प्रोफाइल थेट लॉगिन झाले आहे!'
        : '🎉 धन्यवाद! तुमची नोंदणी, फोटो व सर्व माहिती यशस्वीरित्या सबमिट झाली आहे. तुमचे खाते थेट लॉगिन झाले आहे.'
    );

    // 3. If a paid plan was chosen, trigger payment modal automatically
    if (chosenPlan && chosenPlan.price > 0 && !appliedRegPromoRes?.isVipFree) {
      setSelectedPlanForPayment(chosenPlan);
      setIsPaymentOpen(true);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] border-b border-amber-300 text-amber-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-400/20 text-amber-200 border border-amber-300/40">
              <Sparkles className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-100 tracking-tight">
                वंजारी वधू-वर नोंदणी केंद्र (Registration)
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                {siteConfig?.logoSubtitle || 'वंजारी समाजाचे हक्काचे व विश्वासाचे सुवर्ण व्यासपीठ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-amber-100/10 hover:bg-amber-100/20 text-amber-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VOLUNTARY FORM GUIDANCE NOTICE */}
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2.5 text-xs text-amber-950 font-bold flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#A71930] shrink-0" />
            <span>
              <strong className="text-[#A71930]">महत्त्वाची सूचना:</strong> या अर्जामधील कोणतेही रकाने अनिवार्य (Compulsory) नाहीत. आपल्याकडे जेवढी माहिती उपलब्ध असेल तेवढीच भरून सोयीस्कर नोंदणी पूर्ण करावी.
            </span>
          </div>
        </div>

        {/* STEP 1: CLEAN SELECTOR POPUP (If showSelector is true) */}
        {showSelector ? (
          <div className="p-8 space-y-6 text-center overflow-y-auto">
            
            {/* Centered Brand Logo */}
            <div className="flex flex-col items-center justify-center py-4 bg-white border border-amber-200/60 rounded-3xl shadow-sm max-w-md mx-auto">
              <VanjariJodiLogo variant="stacked" size={80} />
              <p className="text-[10px] sm:text-xs text-amber-700 font-extrabold mt-2 italic bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                ॥ श्री संत भगवान बाबा प्रसन्न ॥
              </p>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-[#A71930] font-black text-xs border border-amber-300 uppercase tracking-wider">
                पसंतीचा नोंदणी पर्याय निवडा
              </span>
              <h3 className="text-2xl font-black text-[#A71930]">
                तुम्हाला नोंदणी कशी करायची आहे?
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto font-medium">
                खालील दोन पर्यायांपैकी एक बटण निवडा. फोटो किंवा बायोडाटा कागदपत्र अपलोड करून अवघ्या १० सेकंदांत माहिती ऑटो-फिल करा किंवा मॅन्युअली फॉर्म भरा.
              </p>
            </div>

            {/* 2 PROMINENT BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto pt-2">
              
              {/* Option 1: Manual Form Registration */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('manual');
                  setShowSelector(false);
                }}
                className="group relative p-6 rounded-2xl bg-white border-2 border-amber-300 hover:border-[#A71930] hover:shadow-2xl transition-all text-left space-y-3 cursor-pointer overflow-hidden active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#A71930] flex items-center justify-center text-2xl border border-amber-300 group-hover:bg-[#A71930] group-hover:text-white transition-colors">
                  {siteConfig?.regOption1Icon || '📝'}
                </div>
                <div>
                  <h4 className="text-base font-black text-[#A71930] group-hover:text-[#800C1E]">
                    {siteConfig?.regOption1Title || '१. मॅन्युअल नोंदणी / फॉर्म भरा'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                    वैयक्तिक, शैक्षणिक, कौटुंबिक व संपर्क माहिती स्वतः ५ सोप्या टप्प्यांत भरा.
                  </p>
                </div>
                <div className="pt-2 text-xs font-bold text-[#A71930] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>फॉर्म भरण्यास सुरुवात करा</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: Photo / PDF BioData Upload (AI Scan) */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('ocr_photo');
                  setShowSelector(false);
                }}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 border-2 border-amber-400 hover:border-[#A71930] hover:shadow-2xl transition-all text-left space-y-3 cursor-pointer overflow-hidden active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#A71930] text-amber-200 flex items-center justify-center text-2xl border border-amber-300 shadow">
                  {siteConfig?.regOption2Icon || '📁'}
                </div>
                <div>
                  <h4 className="text-base font-black text-[#800C1E]">
                    {siteConfig?.regOption2Title || '२. फोटो किंवा PDF द्वारे नोंदणी'}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">
                    तुमच्या व्हॉट्सॲप किंवा कागदी बायोडाटाचा फोटो अपलोड करा. आमचे एआय तंत्रज्ञान स्वयंचलित वाचन करेल.
                  </p>
                </div>
                <div className="pt-2 text-xs font-bold text-[#A71930] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>बायोडाटा फोटो अपलोड करा</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

            </div>

            <p className="text-[11px] text-slate-500 pt-4">
              टीप: वंजारी समाजातील सदस्यांसाठी नोंदणी सुविधा उपलब्ध आहे.
            </p>
          </div>
        ) : (
          /* STEP 2: SPECIFIC REGISTRATION FORM (NO NESTED DUPLICATES) */
          <div className="flex-1 overflow-y-auto flex flex-col">
            
            {/* Top Toolbar to change mode back to selector */}
            <div className="px-6 py-2.5 bg-amber-100/90 border-b border-amber-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => setShowSelector(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-200 text-[#A71930] border border-amber-300 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← नोंदणी पर्याय बदला (Change Option)</span>
              </button>

              <span className="px-3 py-1 rounded-full bg-amber-200 text-[#800C1E] font-black">
                {activeMode === 'ocr_photo' ? 'स्कॅन पर्याय: बायोडाटा फोटो/PDF' : 'मॅन्युअल पर्याय: ५-टप्पे फॉर्म'}
              </span>
            </div>

            {/* AI OCR PHOTO UPLOAD VIEW */}
            {activeMode === 'ocr_photo' ? (
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <AIBioDataExtractor
                  onExtracted={(ext) => {
                    if (ext.fullName) setFullName(ext.fullName);
                    if (ext.gender) setGender(ext.gender);
                    if (ext.dob) setDob(ext.dob);
                    if (ext.birthTime) setBirthTime(ext.birthTime);
                    if (ext.birthPlace) setBirthPlace(ext.birthPlace);
                    if (ext.subCaste) setSubCaste(ext.subCaste);
                    if (ext.gotra) setGotra(ext.gotra);
                    if (ext.rashi) setRashi(ext.rashi);
                    if (ext.nakshatra) setNakshatra(ext.nakshatra);
                    if (ext.gan) setGan(ext.gan);
                    if (ext.nadi) setNadi(ext.nadi);
                    if (ext.height) setHeight(ext.height);
                    if (ext.weight) setWeight(ext.weight);
                    if (ext.bloodGroup) setBloodGroup(ext.bloodGroup);
                    if (ext.complexion) setComplexion(ext.complexion);
                    if (ext.education) setEducation(ext.education);
                    if (ext.occupation) setOccupation(ext.occupation);
                    if (ext.companyName) setCompanyName(ext.companyName);
                    if (ext.income) setIncome(ext.income);
                    if (ext.fatherName) setFatherName(ext.fatherName);
                    if (ext.fatherOccupation) setFatherOcc(ext.fatherOccupation);
                    if (ext.motherName) setMotherName(ext.motherName);
                    if (ext.motherOccupation) setMotherOcc(ext.motherOccupation);
                    if (typeof ext.brothers === 'number') setBrothers(ext.brothers);
                    if (ext.brotherDetails) setBrotherDetails(ext.brotherDetails);
                    if (typeof ext.sisters === 'number') setSisters(ext.sisters);
                    if (ext.sisterDetails) setSisterDetails(ext.sisterDetails);
                    if (Array.isArray(ext.relativeSurnames)) setRelativeSurnames(ext.relativeSurnames.join(', '));
                    if (ext.mamaName) setMamaName(ext.mamaName);
                    if (ext.mamaNative) setMamaNative(ext.mamaNative);
                    if (ext.mobile) setMobile(ext.mobile);
                    if (ext.email) setEmail(ext.email);
                    if (ext.currentAddress) setCurrentAddress(ext.currentAddress);
                    if (ext.nativeAddress) setNativeAddress(ext.nativeAddress);
                    if (ext.district) setDistrict(ext.district);
                    if (ext.taluka) setTaluka(ext.taluka);
                    if (ext.city) setCity(ext.city);
                    if (ext.expectations) setExpectations(ext.expectations);

                    if (ext.candidatePhotoUrl) {
                      setPhotoUrls((prev) => Array.from(new Set([ext.candidatePhotoUrl!, ...prev])));
                    }

                    setExtractedSuccessBadge(
                      ext.candidatePhotoUrl
                        ? '✨ एआय माहिती वाचन व प्रोफाईल फोटो जोडणे यशस्वी! सर्व रकाने स्वयंचलित भरले गेले आहेत.'
                        : '✨ एआय माहिती वाचन यशस्वी! सर्व रकाने स्वयंचलित भरले गेले आहेत. कागदपत्राचा फोटो प्रोफाइल फोटो म्हणून जोडलेला नाही. (फोटो जोडायचा असल्यास ४ थ्या टप्प्यातून अपलोड करा - ऐच्छिक)'
                    );
                    setActiveMode('manual');
                    setStep(1);
                  }}
                />
              </div>
            ) : (
              /* MANUAL MULTI-STEP FORM VIEW */
              <form onSubmit={handleSubmitRegistration} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
                
                {/* Step Progress Bar */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-3 border-b border-amber-200 overflow-x-auto gap-2">
                  <span className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${step === 1 ? 'bg-[#A71930] text-amber-100 shadow' : 'bg-amber-100 text-slate-700'}`} onClick={() => setStep(1)}>
                    १. वैयक्तिक माहिती
                  </span>
                  <span className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${step === 2 ? 'bg-[#A71930] text-amber-100 shadow' : 'bg-amber-100 text-slate-700'}`} onClick={() => setStep(2)}>
                    २. शिक्षण व नोकरी
                  </span>
                  <span className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${step === 3 ? 'bg-[#A71930] text-amber-100 shadow' : 'bg-amber-100 text-slate-700'}`} onClick={() => setStep(3)}>
                    ३. कौटुंबिक तपशील
                  </span>
                  <span className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${step === 4 ? 'bg-[#A71930] text-amber-100 shadow' : 'bg-amber-100 text-slate-700'}`} onClick={() => setStep(4)}>
                    ४. संपर्क व फोटो
                  </span>
                  <span className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${step === 5 ? 'bg-[#A71930] text-amber-100 shadow' : 'bg-amber-100 text-slate-700'}`} onClick={() => setStep(5)}>
                    ५. तपासणी व गोपनीयता
                  </span>
                </div>

                {/* STEP 1: Personal Details */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-800 font-bold mb-1">
                          संपूर्ण नाव (Full Name) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. ज्ञानेश्वर भगवान सानप / पूजा रामदास मुंडे"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">लिंग (Gender) *</label>
                        <div className="grid grid-cols-2 gap-2 bg-amber-100 p-1 rounded-xl border border-amber-300">
                          <button
                            type="button"
                            onClick={() => setGender('bride')}
                            className={`py-2 rounded-lg font-bold transition-all ${
                              gender === 'bride' ? 'bg-[#A71930] text-amber-100 shadow' : 'text-slate-700'
                            }`}
                          >
                            👰 वधू (Bride)
                          </button>
                          <button
                            type="button"
                            onClick={() => setGender('groom')}
                            className={`py-2 rounded-lg font-bold transition-all ${
                              gender === 'groom' ? 'bg-[#A71930] text-amber-100 shadow' : 'text-slate-700'
                            }`}
                          >
                            🤵 वर (Groom)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">वैवाहिक स्थिती (Marital Status)</label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#A71930]"
                        >
                          <option value="never_married">अविवाहित (Never Married)</option>
                          <option value="divorced">घटस्फोटित (Divorced)</option>
                          <option value="widowed">विधवा / विधुर (Widowed)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">जन्मतारीख (Date of Birth) *</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">वय (Age Calculated):</label>
                        <div className="w-full bg-amber-100 border-2 border-amber-300 rounded-xl px-3.5 py-2.5 text-[#A71930] font-black">
                          {currentAge} वर्षे
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">जन्म वेळ (Birth Time)</label>
                        <input
                          type="text"
                          placeholder="उदा. सकाळी १०:३० AM"
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">जन्म ठिकाण (Birth Place)</label>
                        <input
                          type="text"
                          placeholder="उदा. बीड / अंबाजोगाई"
                          value={birthPlace}
                          onChange={(e) => setBirthPlace(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>
                    </div>

                    {/* Horoscope Details */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                      <h4 className="font-extrabold text-[#A71930] text-xs">पत्रिका माहिती (Horoscope Details)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">उपजात (Sub-caste)</label>
                          <input
                            type="text"
                            value={subCaste}
                            onChange={(e) => setSubCaste(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">गोत्र (Gotra)</label>
                          <input
                            type="text"
                            value={gotra}
                            onChange={(e) => setGotra(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">राशी (Rashi)</label>
                          <input
                            type="text"
                            value={rashi}
                            onChange={(e) => setRashi(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">नक्षत्र (Nakshatra)</label>
                          <input
                            type="text"
                            value={nakshatra}
                            onChange={(e) => setNakshatra(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Education & Occupation */}
                {step === 2 && (
                  <div className="space-y-4 animate-fade-in font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">शिक्षण (Education) *</label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. B.E. Computer / M.Sc / MBBS"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">नोकरी किंवा व्यवसाय (Occupation) *</label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. सॉफ्टवेयर इंजिनियर / शेती / व्यवसाय"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">कंपनी / ऑफिस नाव (Company Name)</label>
                        <input
                          type="text"
                          placeholder="उदा. TCS Pune / शासकीय रुग्णालय"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">वार्षिक उत्पन्न (Annual Income)</label>
                        <input
                          type="text"
                          placeholder="उदा. ₹ ८ ते १२ लाख वार्षिक"
                          value={income}
                          onChange={(e) => setIncome(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      {/* Multi-Profession Badges Selection */}
                      <div className="col-span-full pt-2">
                        <label className="block text-slate-800 font-extrabold text-xs mb-1.5 flex flex-wrap items-center justify-between gap-1">
                          <span>प्रोफेशन / नोकरी श्रेणी निवडा (Profession Badges):</span>
                          <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full font-bold border border-amber-300">
                            लागू असणारे निवडा (उदा. डॉक्टर + सरकारी नोकरी)
                          </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PROFESSION_PRESETS.map((preset) => {
                            const isSelected = regProfessionTags.includes(preset.label);
                            return (
                              <button
                                type="button"
                                key={preset.id}
                                onClick={() => {
                                  setRegProfessionTags((prev) =>
                                    prev.includes(preset.label)
                                      ? prev.filter((t) => t !== preset.label)
                                      : [...prev, preset.label]
                                  );
                                }}
                                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#800C1E] text-amber-100 border-[#800C1E] shadow-sm'
                                    : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                                }`}
                              >
                                <span className="font-extrabold text-xs flex items-center justify-between">
                                  <span>{preset.label}</span>
                                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Physical Details */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                      <h4 className="font-extrabold text-[#A71930] text-xs">शारीरिक माहिती (Physical Attributes)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">उंची (Height)</label>
                          <input
                            type="text"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">वजन (Weight)</label>
                          <input
                            type="text"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">रक्तगट (Blood Group)</label>
                          <input
                            type="text"
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-[11px] mb-0.5">वर्ण / रंग (Complexion)</label>
                          <input
                            type="text"
                            value={complexion}
                            onChange={(e) => setComplexion(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Family Details & Relatives */}
                {step === 3 && (
                  <div className="space-y-4 animate-fade-in font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">वडिलांचे नाव (Father's Name)</label>
                        <input
                          type="text"
                          placeholder="उदा. श्री. रामदास विष्णू मुंडे"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">वडिलांचा व्यवसाय (Father Occupation)</label>
                        <input
                          type="text"
                          placeholder="उदा. शेतकरी / सेवानिवृत्त शिक्षक"
                          value={fatherOcc}
                          onChange={(e) => setFatherOcc(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">आईचे नाव (Mother's Name)</label>
                        <input
                          type="text"
                          placeholder="उदा. सौ. सुनिता रामदास मुंडे"
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">मामांचे नाव व गाव (Mama Name & Native)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="मामांचे नाव"
                            value={mamaName}
                            onChange={(e) => setMamaName(e.target.value)}
                            className="w-full bg-white border-2 border-amber-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="मामांचे गाव"
                            value={mamaNative}
                            onChange={(e) => setMamaNative(e.target.value)}
                            className="w-full bg-white border-2 border-amber-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sibling Details */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                      <h4 className="font-extrabold text-[#A71930] text-xs">नातेवाईक व भावंडे (Relatives & Siblings)</h4>
                      <div>
                        <label className="block text-slate-700 text-[11px] mb-1">
                          नातेवाईक आडनावे (Relative Surnames like Munde, Sanap, Nagre, Kakad, Ghuge)
                        </label>
                        <input
                          type="text"
                          placeholder="मुंडे, सानप, नागरे, काकड, घूगे, फड, आव्हाड"
                          value={relativeSurnames}
                          onChange={(e) => setRelativeSurnames(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Enhanced Contact Details, Address & Photo */}
                {step === 4 && (
                  <div className="space-y-4 animate-fade-in font-semibold">
                    
                    {/* REQUIREMENT 4: ENHANCED REGISTRATION FIELDS */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                      <h4 className="font-extrabold text-[#A71930] text-xs flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#A71930]" />
                        <span>१. संपर्क क्रमांक व ईमेल (Contact Details)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-800 font-bold mb-1">
                            मुख्य मोबाईल नंबर (Primary Mobile - Required) *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98220 12345"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-800 font-bold mb-1">
                            पर्यायी मोबाईल नंबर (Secondary Mobile - Optional / ऐच्छिक)
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 94220 54321"
                            value={secondaryMobile}
                            onChange={(e) => setSecondaryMobile(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-800 font-bold mb-1">
                            ईमेल आयडी (Email ID)
                          </label>
                          <input
                            type="email"
                            placeholder="pooja.munde@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Fields */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                      <h4 className="font-extrabold text-[#A71930] text-xs flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#A71930]" />
                        <span>२. जिल्हा व पत्ता माहिती (District & Detailed Address)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-800 font-bold mb-1">जिल्हा (District) *</label>
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                          >
                            {MAHARASHTRA_DISTRICTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-800 font-bold mb-1">तालुका व गाव/शहर</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="तालुका"
                              value={taluka}
                              onChange={(e) => setTaluka(e.target.value)}
                              className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-slate-900 outline-none"
                            />
                            <input
                              type="text"
                              placeholder="शहर/गाव"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-slate-900 outline-none"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-800 font-bold mb-1">कायमचा व मूळ पत्ता (Native Address)</label>
                          <input
                            type="text"
                            placeholder="उदा. मु. पो. धर्मापुरी, ता. परळी, जि. बीड"
                            value={nativeAddress}
                            onChange={(e) => setNativeAddress(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-800 font-bold mb-1">सध्याचा राहता पत्ता (Current Address)</label>
                          <input
                            type="text"
                            placeholder="उदा. बाणेर, पुणे / सिडको, संभाजीनगर"
                            value={currentAddress}
                            onChange={(e) => setCurrentAddress(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photos Upload */}
                    <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200 pb-2">
                        <label className="block text-[#A71930] font-black text-xs flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-[#A71930]" />
                          <span>३. फोटो अपलोड व मुख्य प्रोफाईल फोटो निवड (Max 5 Photos - Optional)</span>
                        </label>
                        <span className="text-[11px] font-black text-slate-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          {photoUrls.length}/५ फोटो जोडले
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                        तुम्ही ५ पर्यंत फोटो जोडू शकता. अपलोड केलेल्या फोटोंपैकी जो फोटो मुख्य दिसायला हवा तो फोटो <strong>"मुख्य फोटो (Set Profile Photo)"</strong> म्हणून स्टार (⭐) वर क्लिक करून निवडा.
                      </p>

                      {photoError && (
                        <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{photoError}</span>
                        </div>
                      )}

                      {photoUrls.length < 5 && (
                        <div className="border-2 border-dashed border-amber-400 rounded-2xl p-4 text-center bg-white hover:border-[#A71930] transition-colors">
                          {isUploadingPhoto ? (
                            <div className="flex flex-col items-center justify-center py-2 text-[#A71930] space-y-1">
                              <Loader2 className="w-7 h-7 animate-spin text-[#A71930]" />
                              <p className="text-xs font-bold">क्लाउडवर फोटो सुरक्षित अपलोड होत आहेत...</p>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-[#A71930] mx-auto mb-1" />
                              <p className="text-xs text-slate-800 font-bold">
                                इथे क्लिक करून ५ पर्यंत फोटो जोडा (स्पष्ट HD फोटो, ऑटो-कॉम्प्रेस होतो)
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUploadSim}
                                disabled={isUploadingPhoto}
                                className="hidden"
                                id="modal-photo-upload"
                              />
                              <label
                                htmlFor="modal-photo-upload"
                                className="inline-block mt-2 px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#A71930] font-black text-xs border border-amber-300 cursor-pointer shadow-sm transition-all"
                              >
                                🖼️ गॅलरीमधून १ किंवा अधिक फोटो निवडा ({photoUrls.length}/५)
                              </label>
                            </>
                          )}
                        </div>
                      )}

                      {/* Photo Thumbnails with Primary Selection */}
                      {photoUrls.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-black text-slate-800 block">
                            👇 मुख्य प्रोफाईल फोटो निवडण्यासाठी फोटोवर क्लिक करा (Click ⭐ to set Main Photo):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            {photoUrls.map((url, index) => {
                              const isPrimary = index === primaryPhotoIndex;
                              return (
                                <div
                                  key={index}
                                  onClick={() => setPrimaryPhotoIndex(index)}
                                  className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm ${
                                    isPrimary ? 'border-[#A71930] ring-2 ring-[#A71930]/30 scale-102 bg-amber-100' : 'border-amber-300 hover:border-amber-400'
                                  }`}
                                >
                                  <img src={url} alt={`upload-${index}`} className="w-full h-24 object-cover" />
                                  
                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePhoto(index);
                                    }}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md z-10"
                                    title="फोटो हटवा"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Primary Badge / Button */}
                                  <div className={`absolute bottom-0 inset-x-0 p-1 text-[10px] font-black text-center transition-colors ${
                                    isPrimary ? 'bg-[#A71930] text-amber-100' : 'bg-slate-900/70 text-white hover:bg-[#A71930]'
                                  }`}>
                                    {isPrimary ? '⭐ मुख्य फोटो (Main)' : 'मुख्य करा'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPTIONAL Aadhaar & ID Document Upload Section */}
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border-2 border-amber-300 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200 pb-2">
                        <label className="block text-[#A71930] font-black text-xs flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#A71930]" />
                          <span>४. आधार / ओळखपत्र कागदपत्रे जोडणे (Optional / ऐच्छिक)</span>
                        </label>
                        <span className="text-[10px] font-black bg-amber-200 text-[#800C1E] px-2.5 py-0.5 rounded-full border border-amber-300">
                          नॉट कंपल्सरी
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                        💡 **टीप:** नोंदणी करताना आधार जोडणे <strong>अनिवार्य/कंपल्सरी नाही</strong>. जर तुम्ही आता आधार जोडले नाही तर नोंदणी झाल्यावर तुमच्या <strong>'Member Dashboard'</strong> मधून देखील नंतर कधीही आधार किंवा कागदपत्राची PDF/फोटो अपलोड करू शकता.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-800 text-xs font-bold mb-1">
                            आधार क्रमांक / आयडी नंबर (ऐच्छिक):
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. १२ अंकी आधार क्रमांक किंवा शेवटचे ४ अंक"
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#A71930]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-800 text-xs font-bold mb-1">
                            आधार कार्ड / ओळखपत्र फाईल (PDF/फोटो):
                          </label>
                          
                          {aadhaarDocUrl ? (
                            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>कागदपत्र अपलोड झाले!</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={aadhaarDocUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-[#A71930] font-black underline"
                                >
                                  पहा
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setAadhaarDocUrl('')}
                                  className="text-[11px] text-rose-600 font-bold hover:underline"
                                >
                                  हटवा
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleAadhaarUploadSim}
                                disabled={isUploadingAadhaar}
                                className="hidden"
                                id="modal-aadhaar-upload"
                              />
                              <label
                                htmlFor="modal-aadhaar-upload"
                                className="w-full px-3 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-[#A71930] font-black text-xs border-2 border-dashed border-amber-400 cursor-pointer flex items-center justify-center gap-2 transition-all"
                              >
                                {isUploadingAadhaar ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-[#A71930]" />
                                    <span>अपलोड होत आहे...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-[#A71930]" />
                                    <span>📂 आधार / ID फाईल निवडा (PDF/Image)</span>
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {aadhaarError && (
                        <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold">
                          {aadhaarError}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* STEP 5: Review & Privacy Settings */}
                {step === 5 && (
                  <div className="space-y-5 animate-fade-in font-semibold">
                    
                    {/* Header Banner */}
                    <div className="p-4 bg-amber-100 rounded-2xl border border-amber-300 space-y-1">
                      <h3 className="text-base font-black text-[#A71930] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#A71930]" />
                        <span>५. माहिती तपासणी व गोपनीयता पर्याय (Review & Privacy Controls)</span>
                      </h3>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">
                        कृपया तुम्ही भरलेली सर्व माहिती व फोटो काळजीपूर्वक तपासा. तुम्हाला जी माहिती सार्वजनिकपणे दाखवायची नाही, त्यासमोरील चौकटीत टिक मार्क (Tick Mark) करा.
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <h4 className="font-extrabold text-[#A71930] text-sm flex items-center gap-1.5">
                          <span>📋 भरलेल्या माहितीचा तपशील (BioData Summary):</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs text-[#A71930] underline font-black cursor-pointer hover:text-[#800C1E]"
                        >
                          ✏️ माहिती बदला (Edit)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                          <span className="text-slate-500 font-bold block text-[11px]">उमेदवाराचे नाव:</span>
                          <span className="font-black text-slate-900 text-sm">{fullName || 'नाव प्रविष्ट केले नाही'}</span>
                        </div>

                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                          <span className="text-slate-500 font-bold block text-[11px]">मुख्य व पर्यायी मोबाईल:</span>
                          <span className="font-black text-slate-900 font-mono text-xs">{mobile || 'नोंदवलेला नाही'} {secondaryMobile ? `(पर्यायी: ${secondaryMobile})` : ''}</span>
                        </div>

                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                          <span className="text-slate-500 font-bold block text-[11px]">वय व जन्मतारीख:</span>
                          <span className="font-black text-slate-900">{currentAge} वर्षे ({dob || 'तारीख नाही'})</span>
                        </div>

                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                          <span className="text-slate-500 font-bold block text-[11px]">शिक्षण व नोकरी:</span>
                          <span className="font-black text-slate-900">{education} • {occupation}</span>
                        </div>

                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 sm:col-span-2">
                          <span className="text-slate-500 font-bold block text-[11px]">जिल्हा व मूळ पत्ता:</span>
                          <span className="font-black text-slate-900">{district}, {nativeAddress || currentAddress}</span>
                        </div>

                        {photoUrls.length > 0 && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 sm:col-span-2">
                            <span className="text-slate-600 font-extrabold block text-[11px] mb-1.5">
                              अपलोड केलेले फोटो ({photoUrls.length}/५) - ⭐ चिन्हांकित फोटो मुख्य दिसेल:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {photoUrls.map((p, i) => (
                                <div key={i} className={`relative rounded-xl overflow-hidden border-2 ${i === primaryPhotoIndex ? 'border-[#A71930] ring-1 ring-[#A71930]' : 'border-amber-300'}`}>
                                  <img src={p} alt="thumb" className="w-12 h-12 object-cover" />
                                  {i === primaryPhotoIndex && (
                                    <span className="absolute bottom-0 inset-x-0 bg-[#A71930] text-amber-100 text-[8px] font-black text-center py-0.2">
                                      मुख्य
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Privacy Checkboxes */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 p-5 rounded-2xl border-2 border-amber-400 space-y-3 shadow-md">
                      <h4 className="font-black text-[#A71930] text-sm flex items-center gap-2 border-b border-amber-300 pb-2">
                        <UserCheck className="w-5 h-5 text-[#A71930]" />
                        <span>🛡️ गोपनीयता नियंत्रणे - काय लपवायचे ते निवडा (Privacy Settings):</span>
                      </h4>
                      <p className="text-xs text-slate-700 font-bold">
                        खालील ज्या बाबींवर तुम्ही टिक (Tick Mark) कराल, त्या इतर सदस्यांना सार्वजनिकपणे दिसणार नाहीत:
                      </p>

                      <div className="space-y-2.5 pt-1">
                        <label className="p-3 bg-white rounded-xl border-2 border-amber-300 flex items-start gap-3 cursor-pointer hover:bg-amber-50 transition-all shadow-xs">
                          <input
                            type="checkbox"
                            checked={hideContact}
                            onChange={(e) => setHideContact(e.target.checked)}
                            className="w-5 h-5 rounded border-amber-400 text-[#A71930] focus:ring-0 mt-0.5 cursor-pointer shrink-0"
                          />
                          <div>
                            <span className="font-black text-slate-900 text-xs block">
                              🚫 माझा मुख्य व पर्यायी मोबाईल नंबर सार्वजनिक दाखवू नका (Hide Mobile Number)
                            </span>
                            <span className="text-[11px] text-slate-600 font-bold block mt-0.5">
                              टिक केल्यास मोबाईल नंबर लपवला जाईल. तुम्ही ज्या सदस्याला परवानगी (Accept Request) द्याल, त्यालाच तो दिसेल.
                            </span>
                          </div>
                        </label>

                        <label className="p-3 bg-white rounded-xl border-2 border-amber-300 flex items-start gap-3 cursor-pointer hover:bg-amber-50 transition-all shadow-xs">
                          <input
                            type="checkbox"
                            checked={hidePhoto}
                            onChange={(e) => setHidePhoto(e.target.checked)}
                            className="w-5 h-5 rounded border-amber-400 text-[#A71930] focus:ring-0 mt-0.5 cursor-pointer shrink-0"
                          />
                          <div>
                            <span className="font-black text-slate-900 text-xs block">
                              🙈 माझे फोटो सार्वजनिक दाखवू नका (Hide Photo from Public View)
                            </span>
                            <span className="text-[11px] text-slate-600 font-bold block mt-0.5">
                              टिक केल्यास फोटो ब्लर/लॉक राहतील आणि तुम्ही परवानगी दिल्यावरच स्पष्ट दिसतील.
                            </span>
                          </div>
                        </label>

                        <label className="p-3 bg-white rounded-xl border-2 border-amber-300 flex items-start gap-3 cursor-pointer hover:bg-amber-50 transition-all shadow-xs">
                          <input
                            type="checkbox"
                            checked={restrictDetails}
                            onChange={(e) => setRestrictDetails(e.target.checked)}
                            className="w-5 h-5 rounded border-amber-400 text-[#A71930] focus:ring-0 mt-0.5 cursor-pointer shrink-0"
                          />
                          <div>
                            <span className="font-black text-slate-900 text-xs block">
                              🔒 माझे वैयक्तिक व कौटुंबिक तपशील फक्त मी परस्पर परवानगी (Accept) दिल्यावरच दाखवा
                            </span>
                            <span className="text-[11px] text-slate-600 font-bold block mt-0.5">
                              तुमचे वैयक्तिक व कौटुंबिक रकाने सुरक्षित राहतील व परवानगीनंतरच दिसतील.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Membership Plan Selection during Registration */}
                    <div className="bg-gradient-to-br from-amber-100 to-amber-200/80 p-5 rounded-2xl border-2 border-amber-400 space-y-4 shadow-md">
                      <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                        <h4 className="font-black text-[#A71930] text-sm flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#A71930]" />
                          <span>💎 सबस्क्रिप्शन प्लॅन निवडा (Membership Plan Selection):</span>
                        </h4>
                        <span className="text-[10px] font-black bg-[#A71930] text-amber-100 px-2 py-0.5 rounded-full">
                          नोंदणी ऑफर 🎯
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-bold">
                        तुम्हाला हवे असलेले सदस्यत्व (Membership) निवडा. तुम्ही नंतर देखील प्लॅन अपग्रेड करू शकता:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(siteConfig?.showOnlyWelcomePlan !== false
                          ? plansList.filter((p) => p.id === 'welcome_offer' && p.isActive !== false)
                          : plansList.filter((p) => p.isActive !== false)
                        ).map((p) => {
                          const isSelected = selectedPlanId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPlanId(p.id)}
                              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'bg-white border-[#A71930] ring-2 ring-[#A71930]/30 shadow-md'
                                  : 'bg-white/80 border-amber-300 hover:border-amber-400'
                              }`}
                            >
                              {p.recommended && (
                                <span className="absolute -top-2.5 right-3 bg-[#A71930] text-amber-100 text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                                  ★ सर्वाधिक लोकप्रिय (Best Value)
                                </span>
                              )}
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-black text-slate-900 text-xs block">{p.nameMr}</span>
                                  <span className="text-[10px] text-slate-600 font-bold block">{p.durationLabelMr || `${p.durationMonths} महिने`}</span>
                                </div>
                                <span className="text-base font-black text-[#A71930]">
                                  {p.price === 0 ? 'मोफत' : `₹${p.price}`}
                                </span>
                              </div>
                              <div className="mt-2 text-[10px] text-slate-700 font-bold space-y-0.5">
                                {p.featuresMr?.slice(0, 2).map((feat, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span className="truncate">{feat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        {/* Free Option */}
                        <div
                          onClick={() => setSelectedPlanId('free')}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedPlanId === 'free'
                              ? 'bg-white border-[#A71930] ring-2 ring-[#A71930]/30 shadow-md'
                              : 'bg-white/80 border-amber-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-black text-slate-900 text-xs block">फ्री नोंदणी (Free Membership)</span>
                              <span className="text-[10px] text-slate-600 font-bold block">बेसिक विनामूल्य खाते</span>
                            </div>
                            <span className="text-base font-black text-emerald-700">₹०</span>
                          </div>
                          <span className="text-[10px] text-slate-600 font-bold block mt-1">
                            ✓ प्रोफाईल तयार करा व इतरांना मोफत इंटरेस्ट पाठवा.
                          </span>
                        </div>
                      </div>

                      {/* Promo Code Input */}
                      {selectedPlanId !== 'free' && (
                        <div className="pt-2">
                          <label className="block text-slate-900 font-extrabold text-xs mb-1">
                            🎁 ऑफर प्रोमो कोड किंवा कूपन टाका (Promo Code):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="उदा. FESTIVE50 किंवा VIPFREE"
                              value={regPromoCode}
                              onChange={(e) => setRegPromoCode(e.target.value)}
                              className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 outline-none focus:border-[#A71930]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!regPromoCode.trim()) return;
                                const planObj = plansList.find((p) => p.id === selectedPlanId);
                                const origPrice = planObj ? planObj.price : 999;
                                const res = validatePromoCode(regPromoCode, origPrice);
                                setAppliedRegPromoRes(res);
                              }}
                              className="px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-bold text-xs rounded-xl shadow cursor-pointer"
                            >
                              लागू करा
                            </button>
                          </div>
                          {appliedRegPromoRes && (
                            <p className={`text-xs font-bold mt-1 ${appliedRegPromoRes.valid ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {appliedRegPromoRes.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Admin Approval Notice */}
                    <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400 text-emerald-950 text-xs space-y-1 shadow-sm">
                      <div className="font-black text-emerald-900 flex items-center gap-2 text-sm">
                        <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>👑 ॲडमिन मंजुरी प्रक्रिया (Admin Approval Queue):</span>
                      </div>
                      <p className="font-bold leading-relaxed text-emerald-900">
                        फॉर्म सबमिट केल्यानंतर तुमचे प्रोफाईल ॲडमिनकडे (Admin Queue) मंजुरीसाठी पाठवले जाईल. ॲडमिनद्वारे तपासणी करून मंजुरी (Approve/Accept) दिल्यानंतरच तुमचे प्रोफाइल तुमच्या गोपनीयतेच्या पसंतीनुसार इतर सदस्यांना दृश्यमान होईल.
                      </p>
                    </div>

                  </div>
                )}

                {/* Form Step Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-amber-200">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-slate-800 font-bold text-xs border border-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>मागे (Previous)</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A71930] to-[#C82333] hover:from-[#800C1E] text-amber-100 font-black text-xs shadow-md border border-amber-300/40 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{step === 4 ? 'गोपनीयता निवडीकडे जा →' : 'पुढील टप्पा →'}</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs shadow-xl border border-emerald-400 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>✓ नोंदणी सबमिट करा व ॲडमिन मंजुरीसाठी पाठवा</span>
                    </button>
                  )}
                </div>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
