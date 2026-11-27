import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import { UserProfile, Gender, MaritalStatus } from '../types';
import { PROFESSION_PRESETS, EMPLOYMENT_SECTORS, PROFESSION_ROLES, PROFILE_TAG_PRESETS, getTagStyleClass } from '../utils/professionUtils';
import { AIBioDataExtractor } from './AIBioDataExtractor';
import { uploadToCloudinary } from '../utils/cloudinary';
import { uploadImageWithRetry } from '../services/imageUploadService';
import { compressAndResizeImage } from '../utils/imageCompressor';
import { getCleanReferralCode } from '../utils/referralUtils';
import { generateCleanMemberId } from '../utils/idUtils';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { LegalPoliciesModal, PolicyTabType } from './LegalPoliciesModal';
import { useModalScrollLock } from '../hooks/useModalScrollLock';
import { checkClientAccess } from '../utils/securityService';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { isGooglePlayReviewActive } from '../utils/playStorePaymentHelper';
import { safeParseJson } from '../utils/safeFetchJson';
import { signInWithGoogleVerified } from '../utils/googleAuthClient';
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
  Upload,
  Users,
  Crown,
  ShieldCheck,
  Gift,
} from 'lucide-react';

export const RegisterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    t,
    language,
    addProfile,
    currentUser,
    setCurrentUser,
    siteConfig,
    registrationStep,
    setRegistrationStep,
    plansList,
    setSelectedPlanForPayment,
    setIsPaymentOpen,
    validatePromoCode,
    profiles,
    updateProfileDirect,
    sendPushNotification
  } = useApp();

  // Selected registration mode: 'manual' | 'ocr_photo' | 'quick_biodata'
  const [activeMode, setActiveMode] = useState<'manual' | 'ocr_photo' | 'quick_biodata'>(
    registrationStep === 'ocr_photo'
      ? 'ocr_photo'
      : registrationStep === 'quick_biodata'
      ? 'quick_biodata'
      : 'manual'
  );
  const [showSelector, setShowSelector] = useState<boolean>(true);

  React.useEffect(() => {
    if (isOpen) {
      if (registrationStep === 'ocr_photo') {
        setActiveMode('ocr_photo');
        setShowSelector(false);
      } else if (registrationStep === 'quick_biodata') {
        setActiveMode('quick_biodata');
        setShowSelector(false);
      } else if (registrationStep === 'manual') {
        setActiveMode('manual');
        setShowSelector(false);
      }
    }
  }, [isOpen, registrationStep]);

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

  // Referral Code state (auto-read from URL param ?ref= or localStorage)
  const [referralCodeInput, setReferralCodeInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlRef = urlParams.get('ref');
        if (urlRef) {
          localStorage.setItem('vanjari_ref_code', urlRef.toUpperCase());
          return urlRef.toUpperCase();
        }
        return localStorage.getItem('vanjari_ref_code') || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('bride');
  const [dob, setDob] = useState('2000-01-01');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [mobile, setMobile] = useState('');
  const [secondaryMobile, setSecondaryMobile] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isGoogleVerifyingReg, setIsGoogleVerifyingReg] = useState(false);
  const [showRegEmailOtp, setShowRegEmailOtp] = useState(false);
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);
  const [regOtpCooldown, setRegOtpCooldown] = useState(0);
  const [regOtpError, setRegOtpError] = useState('');
  const [regOtpSuccess, setRegOtpSuccess] = useState('');

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

  // Direct Biodata Photo Upload State (Option 3: Quick Biodata for Normal Users)
  const [biodataSheetUrl, setBiodataSheetUrl] = useState<string>('');
  const [isUploadingBiodataSheet, setIsUploadingBiodataSheet] = useState<boolean>(false);
  const [biodataSheetError, setBiodataSheetError] = useState<string | null>(null);

  // Aadhaar / ID Document Optional Upload State (Front & Back)
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState<string>('');
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState<string>('');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState<string>('');
  const [isAadhaarMasked, setIsAadhaarMasked] = useState<boolean>(true);
  const [aadhaarNumber, setAadhaarNumber] = useState<string>('');
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState<boolean>(false);
  const [isUploadingAadhaarFront, setIsUploadingAadhaarFront] = useState<boolean>(false);
  const [isUploadingAadhaarBack, setIsUploadingAadhaarBack] = useState<boolean>(false);
  const [aadhaarError, setAadhaarError] = useState<string | null>(null);

  // Privacy & Terms Checkbox States
  const [hideContact, setHideContact] = useState<boolean>(false);
  const [hidePhoto, setHidePhoto] = useState<boolean>(false);
  const [restrictDetails, setRestrictDetails] = useState<boolean>(false);
  const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] = useState<boolean>(true);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTabType>('terms');

  // Registration Success Finished Screen State
  const [isSuccessFinished, setIsSuccessFinished] = useState<boolean>(false);
  const [registeredProfileData, setRegisteredProfileData] = useState<UserProfile | null>(null);
  const [savedChosenPlan, setSavedChosenPlan] = useState<any>(null);

  const handleModalClose = () => {
    setIsSuccessFinished(false);
    onClose();
  };

  useModalScrollLock(isOpen);

  React.useEffect(() => {
    if (regOtpCooldown <= 0) return;
    const timer = setInterval(() => {
      setRegOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [regOtpCooldown]);

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

  const handleGoogleVerifyReg = async () => {
    setRegOtpError('');
    setRegOtpSuccess('');
    const cleanPhone = (mobile || '').replace(/\D/g, '').slice(-10);

    const accessCheck = await checkClientAccess({
      deviceFingerprint: getDeviceFingerprint(),
      mobile: cleanPhone || undefined,
    });
    if (!accessCheck.allowed) {
      setRegOtpError(accessCheck.message || 'सुरक्षेच्या कारणास्तव तुमचे डिव्हाइस किंवा मोबाईल ब्लॉक करण्यात आला आहे.');
      return;
    }

    setIsGoogleVerifyingReg(true);
    try {
      const cleanMpin = (password || '').replace(/\D/g, '').slice(0, 4);
      const gRes = await signInWithGoogleVerified({
        mobileNumber: cleanPhone.length === 10 ? cleanPhone : undefined,
        mpin: cleanMpin.length === 4 ? cleanMpin : undefined,
      });
      if (!gRes.success || !gRes.email) {
        setRegOtpError(gRes.error || 'Google पडताळणी पूर्ण होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.');
        return;
      }
      setEmail(gRes.email);
      if (!fullName.trim() && gRes.displayName) {
        setFullName(gRes.displayName);
      }
      setIsOtpVerified(true);
      setOtpSent(false);
      setRegOtpSuccess(`✅ अभिनंदन! तुमचे Google खाते (${gRes.email}) १-क्लिकने यशस्वीरित्या पडताळले गेले आहे!`);
    } catch (err: any) {
      setRegOtpError('Google पडताळणी करताना अडचण आली: ' + (err?.message || ''));
    } finally {
      setIsGoogleVerifyingReg(false);
    }
  };

  const handleSendOtp = async () => {
    setRegOtpError('');
    setRegOtpSuccess('');
    const cleanPhone = (mobile || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setRegOtpError('कृपया ईमेल OTP मिळवण्यासाठी तुमचा वैध ईमेल पत्ता (उदा. name@gmail.com) टाका.');
      return;
    }

    // Pre-Registration Anti-Fraud & Blacklist Shield Check
    const accessCheck = await checkClientAccess({
      deviceFingerprint: getDeviceFingerprint(),
      mobile: cleanPhone || undefined,
    });
    if (!accessCheck.allowed) {
      setRegOtpError(accessCheck.message || 'सुरक्षेच्या कारणास्तव तुमचे डिव्हाइस किंवा मोबाईल ब्लॉक करण्यात आला आहे.');
      return;
    }

    setIsSendingRegOtp(true);
    try {
      const resp = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          mobile_number: cleanPhone || undefined,
          phone: cleanPhone || undefined,
          purpose: 'registration',
          deviceFingerprint: getDeviceFingerprint(),
        }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP पाठवताना सर्व्हर त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
      if (!resp.ok || !data?.success) {
        if (data?.cooldownSeconds) {
          setRegOtpCooldown(Number(data.cooldownSeconds));
        }
        setRegOtpError(
          data?.error || 'ईमेल OTP पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.'
        );
      } else {
        setOtpSent(true);
        setRegOtpCooldown(data.cooldownSeconds || 60);
        setRegOtpSuccess(data.message || `📧 ४-अंकी ईमेल OTP ${cleanEmail} वर पाठवला आहे.`);
      }
    } catch (err: any) {
      setRegOtpError('ईमेल OTP पाठवताना अडचण आली: ' + (err.message || ''));
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setRegOtpError('');
    setRegOtpSuccess('');
    const cleanPhone = (mobile || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setRegOtpError('कृपया वैध ईमेल पत्ता टाका.');
      return;
    }
    if (!otpInput || otpInput.trim().length !== 4) {
      setRegOtpError('कृपया ईमेलवर आलेला ४-अंकी OTP कोड टाका.');
      return;
    }

    setIsVerifyingRegOtp(true);
    try {
      const cleanMpin = password.replace(/\D/g, '').slice(0, 4);
      const resp = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          mobile_number: cleanPhone || undefined,
          phone: cleanPhone || undefined,
          otp: otpInput.trim(),
          mpin: cleanMpin.length === 4 ? cleanMpin : undefined,
        }),
      });
      const { data } = await safeParseJson(resp, 'ईमेल OTP पडताळणी करताना सर्व्हर त्रुटी आली.');
      if (!resp.ok || !data?.success) {
        setRegOtpError(data?.error || 'चुकीचा ईमेल OTP कोड! कृपया तपासून पुन्हा प्रयत्न करा.');
      } else {
        setIsOtpVerified(true);
        setRegOtpSuccess('✅ तुमचा ईमेल पत्ता OTP द्वारे यशस्वीरित्या व्हेरिफाय झाला आहे!');
        if (data.token) {
          localStorage.setItem('vanjari_auth_jwt_token', data.token);
          if (cleanPhone) localStorage.setItem('vj_auth_mobile_number', cleanPhone);
        }
      }
    } catch (err: any) {
      setRegOtpError('OTP पडताळणी करताना त्रुटी आली: ' + (err.message || ''));
    } finally {
      setIsVerifyingRegOtp(false);
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
        const res = await uploadImageWithRetry(file, 'profile');
        if (res.success && res.url) {
          setPhotoUrls((prev) => [...prev, res.url]);
        } else {
          setPhotoError(res.errorMr || res.error || 'फोटो अपलोड करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
        }
      } catch (err: any) {
        console.warn('Photo processing error:', err);
        setPhotoError('फोटो अपलोड करण्यात समस्या आली.');
      }
    }
    setIsUploadingPhoto(false);
  };

  const handleBiodataSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setBiodataSheetError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBiodataSheet(true);
    try {
      const res = await uploadImageWithRetry(file, 'profile');
      if (res.success && res.url) {
        setBiodataSheetUrl(res.url);
      } else {
        setBiodataSheetError(res.errorMr || res.error || 'बायोडाटा फोटो अपलोड करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      setBiodataSheetError('बायोडाटा फोटो अपलोड करण्यात समस्या आली.');
    }
    setIsUploadingBiodataSheet(false);
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
      const res = await uploadImageWithRetry(file, 'kyc');
      if (res.success && res.url) {
        setAadhaarDocUrl(res.url);
        if (!aadhaarFrontUrl) setAadhaarFrontUrl(res.url);
      } else {
        setAadhaarError(res.errorMr || res.error || 'कागदपत्र अपलोड करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      setAadhaarError('कागदपत्र प्रक्रिया करताना अडचण आली.');
    }
    setIsUploadingAadhaar(false);
  };

  const handleAadhaarFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAadhaarFront(true);
    try {
      const res = await uploadImageWithRetry(file, 'kyc');
      if (res.success && res.url) {
        setAadhaarFrontUrl(res.url);
        setAadhaarDocUrl(res.url);
      } else {
        setAadhaarError(res.errorMr || res.error || 'पुढील बाजूचा फोटो अपलोड करताना अडचण आली.');
      }
    } catch (err) {
      setAadhaarError('पुढील बाजूचा फोटो प्रक्रिया करताना अडचण आली.');
    }
    setIsUploadingAadhaarFront(false);
  };

  const handleAadhaarBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAadhaarBack(true);
    try {
      const res = await uploadImageWithRetry(file, 'kyc');
      if (res.success && res.url) {
        setAadhaarBackUrl(res.url);
      } else {
        setAadhaarError(res.errorMr || res.error || 'मागील बाजूचा फोटो अपलोड करताना अडचण आली.');
      }
    } catch (err) {
      setAadhaarError('मागील बाजूचा फोटो प्रक्रिया करताना अडचण आली.');
    }
    setIsUploadingAadhaarBack(false);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode !== 'quick_biodata' && !acceptedTermsAndConditions) {
      setStep(5);
      alert('कृपया नोंदणी पूर्ण करण्यासाठी नियम व अटी (Terms & Conditions) आणि गोपनीयता धोरण (Privacy Policy) मान्य चौकटीत टिक मार्क (Accept) करा.');
      return;
    }
    if (activeMode === 'quick_biodata' && !biodataSheetUrl && photoUrls.length === 0) {
      alert('कृपया तुमच्या बायोडाटा कागदाचा / कार्डचा फोटो निवडा आणि अपलोड करा.');
      return;
    }
    if (!fullName || !fullName.trim()) {
      if (activeMode === 'manual') setStep(1);
      alert('कृपया उमेदवाराचे संपूर्ण नाव (उदा. राहुल पाटील) प्रविष्ट करा.');
      return;
    }
    if (!mobile || mobile.trim().replace(/\D/g, '').length < 10) {
      if (activeMode === 'manual') setStep(1);
      alert('कृपया उमेदवाराचा १०-अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }

    // 🛡️ Final Anti-Fraud Blacklist Shield Check
    const accessCheck = await checkClientAccess({
      deviceFingerprint: getDeviceFingerprint(),
      mobile: mobile.trim(),
    });
    if (!accessCheck.allowed) {
      alert(accessCheck.message || 'सुरक्षेच्या कारणास्तव तुमचे डिव्हाइस किंवा मोबाईल ब्लॉक करण्यात आला आहे.');
      return;
    }

    // Ensure selected primary photo is at index 0
    let orderedPhotos = [...photoUrls];
    if (primaryPhotoIndex > 0 && primaryPhotoIndex < orderedPhotos.length) {
      const primaryPhoto = orderedPhotos[primaryPhotoIndex];
      orderedPhotos.splice(primaryPhotoIndex, 1);
      orderedPhotos.unshift(primaryPhoto);
    }
    // If user uploaded a Biodata Sheet and no separate portrait photo, use Biodata Sheet as photo (protected by blur until mutual like)
    if (orderedPhotos.length === 0 && biodataSheetUrl) {
      orderedPhotos = [biodataSheetUrl];
    }

    const chosenPlan = plansList.find((p) => p.id === selectedPlanId);
    const assignedMembership = chosenPlan ? chosenPlan.id : 'free';

    const finalAadhaarFront = aadhaarFrontUrl || aadhaarDocUrl || '';
    const finalAadhaarBack = aadhaarBackUrl || '';
    const hasAadhaar = !!(finalAadhaarFront || finalAadhaarBack);

    const cleanRefCode = referralCodeInput.trim().toUpperCase();
    let matchedReferrer: UserProfile | undefined = undefined;
    if (cleanRefCode) {
      matchedReferrer = profiles.find(
        (p) =>
          getCleanReferralCode(p).toUpperCase() === cleanRefCode ||
          p.referralCode?.toUpperCase() === cleanRefCode ||
          p.mobile === cleanRefCode
      );
    }

    const generatedMyRefCode = getCleanReferralCode({
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      id: 'vj-new'
    });

    const newProfile: UserProfile = {
      id: generateCleanMemberId(profiles),
      fullName: fullName.trim(),
      gender,
      dob,
      age: currentAge,
      birthTime,
      birthPlace,
      mobile: mobile.trim(),
      secondaryMobile: secondaryMobile ? secondaryMobile.trim() : '',
      email: email ? email.trim() : '',
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
      biodataPdfUrl: biodataSheetUrl || undefined,
      password: password.trim() || '1234',
      idProofUrl: finalAadhaarFront,
      aadhaarFrontUrl: finalAadhaarFront,
      aadhaarBackUrl: finalAadhaarBack,
      isAadhaarMasked: isAadhaarMasked,
      idVerificationNumber: aadhaarNumber || '',
      aadhaarCardUrl: finalAadhaarFront,
      aadhaarVerified: hasAadhaar,
      isIdVerified: hasAadhaar,
      isPhoneVerified: isOtpVerified,
      isVerified: true,
      isFeatured: false,
      isApproved: true,
      isProfileLive: true,
      membership: assignedMembership,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'आत्ताच नोंदणी',
      bio: `नोंदणी प्रकार: ${
        activeMode === 'quick_biodata'
          ? 'थेट बायोडाटा फोटो अपलोड (झटपट नोंदणी)'
          : activeMode === 'ocr_photo'
          ? 'फोटो/PDF एआय स्कॅन'
          : 'मॅन्युअल नोंदणी'
      }.`,
      privacy: { hideContact, hidePhoto, restrictDetails },
      registrationType: activeMode === 'ocr_photo' ? 'ocr_ai' : 'manual',
      referralCode: generatedMyRefCode,
      referredByCode: cleanRefCode || undefined,
      referredByName: matchedReferrer ? matchedReferrer.fullName : undefined,
      referredByMobile: matchedReferrer ? matchedReferrer.mobile : undefined,
      referralCount: 0,
      deviceFingerprint: getDeviceFingerprint()
    } as any;

    // Sync Login ID (Mobile) & Password/MPIN to Server Credentials Ledger so App & Website Login work seamlessly
    try {
      const cleanRegPhone = mobile.trim().replace(/\D/g, '').slice(-10);
      const rawPass = password.trim() || '1234';
      await fetch('/api/auth/set-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanRegPhone,
          passwordHash: rawPass,
          fullName: fullName.trim(),
          gender,
          planId: 'free',
          planName: 'मोफत बायोडाटा नोंदणी',
          sendSms: false,
        }),
      });
    } catch (err) {
      // Ignore network error during offline fallback
    }

    // 1. Add Profile to Store
    addProfile(newProfile);

    // 2. If referred by someone, increment referrer's count & send push notification
    if (matchedReferrer) {
      updateProfileDirect(matchedReferrer.id, {
        referralCount: (matchedReferrer.referralCount || 0) + 1
      });
      sendPushNotification(
        matchedReferrer.id,
        '🎉 नवीन रेफरल नोंदणी!',
        `अभिनंदन ${matchedReferrer.fullName}! तुमच्या रेफरल कोडवरून नवीन सदस्य ${newProfile.fullName} यांनी नोंदणी केली आहे!`
      );
    }

    // 3. Set newly registered user as current logged in user instantly
    setCurrentUser(newProfile);

    // 3. Transition to Registration Success Screen (Do NOT force payment modal overlay automatically)
    setRegisteredProfileData(newProfile);
    setSavedChosenPlan(chosenPlan);
    setIsSuccessFinished(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-hidden pt-safe pb-safe">
      <div className="relative w-full h-full sm:h-auto max-w-3xl bg-[#FFFDF5] border-0 sm:border-2 border-amber-400 rounded-none sm:rounded-3xl shadow-2xl text-slate-800 overflow-hidden sm:my-auto max-h-none sm:max-h-[92vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] border-b border-amber-300 text-amber-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-300/40 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-amber-100 tracking-tight leading-tight">
                वंजारी वधू-वर नोंदणी केंद्र (Registration)
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-200/90 font-medium truncate max-w-[220px] sm:max-w-none">
                {siteConfig?.logoSubtitle || 'वंजारी समाजाचे हक्काचे व विश्वासाचे सुवर्ण व्यासपीठ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-amber-100/10 hover:bg-amber-100/20 text-amber-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* VOLUNTARY FORM GUIDANCE NOTICE */}
        <div className="bg-amber-100/95 border-b border-amber-300 px-3 sm:px-5 py-1.5 text-[11px] sm:text-xs text-amber-950 font-bold flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 leading-snug">
            <AlertCircle className="w-3.5 h-3.5 text-[#A71930] shrink-0" />
            <span>
              <strong className="text-[#A71930]">🔒 गोपनीयता हमी:</strong> तुमचे पहिले नाव व मोबाईल नंबर लपवले जातात आणि <strong className="text-emerald-800 underline">फक्त एकमेकांना ❤️ लाईक केल्यावरच</strong> दिसतात!
            </span>
          </div>
        </div>

        {/* REGISTRATION SUCCESS & PLATFORM GUIDANCE SCREEN */}
        {isSuccessFinished ? (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto">
            {/* Celebration Header */}
            <div className="space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#800C1E] tracking-tight">
                🎉 अभिनंदन! तुमचा बायोडाटा तयार झाला आहे!
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-lg mx-auto leading-relaxed">
                तुमची नोंदणी व माहिती यशस्वीरित्या जतन झाली आहे. आता तुम्ही वंजारी जोडी पोर्टलवर उपलब्ध सर्व वधू-वर बायोडाटा (Profiles) पाहू शकता.
              </p>
            </div>

            {/* Saved Profile Card */}
            {registeredProfileData && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/80 p-4 rounded-2xl border-2 border-amber-300 flex items-center gap-4 text-left shadow-sm max-w-md mx-auto">
                <img
                  src={
                    registeredProfileData.photos?.[0] ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={registeredProfileData.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#800C1E] shadow"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    ✓ बायोडाटा सेव्ह झाला
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base truncate mt-1">
                    {registeredProfileData.fullName}
                  </h4>
                  <p className="text-xs text-slate-600 truncate">
                    {registeredProfileData.subCaste || 'वंजारी'} • {registeredProfileData.district || 'महाराष्ट्र'}
                  </p>
                </div>
              </div>
            )}

            {/* Platform Overview Guidance */}
            <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm space-y-3 text-left max-w-xl mx-auto">
              <div className="flex items-center gap-2 text-[#800C1E] font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>पुढील सोपे पर्याय (तुमच्या निवडीनुसार):</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2.5 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                  <span className="bg-[#800C1E] text-amber-100 font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    १
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold text-xs">
                      पसंतीच्या स्थळाला ❤️ लाईक करा (Mutual Like)
                    </strong>
                    <span>ज्या स्थळाला तुम्ही लाईक कराल आणि तेही तुम्हाला लाईक करतील (एकमेकांना लाईक केल्यावर), त्याचे पूर्ण नाव व मोबाईल नंबर लगेच दिसेल!</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                  <span className="bg-[#800C1E] text-amber-100 font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    २
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold text-xs">
                      इतर सर्व वधू-वर बायोडाटा पहा (Explore All Profiles)
                    </strong>
                    <span>पोर्टलवर वंजारी समाजातील १,०००+ हून अधिक बायोडाटा उपलब्ध आहेत. तुम्ही लगेच सर्व वधू-वर प्रोफाईल्स पाहू शकता.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 max-w-md mx-auto pt-1">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] hover:from-[#980e24] text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer border border-amber-300"
              >
                <Users className="w-5 h-5 text-amber-300" />
                <span>🔍 सर्व वधू-वर बायोडाटा पहा (Explore Profiles)</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        ) : showSelector ? (
          <div className="p-3.5 sm:p-6 space-y-3.5 text-center overflow-y-auto">
            
            {/* Short Title */}
            <div className="space-y-0.5">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-[#A71930] font-black text-xs border border-amber-300 uppercase tracking-wider">
                तुमच्या सोयीनुसार नोंदणी पर्याय निवडा (Choose Registration Option)
              </span>
            </div>

            {/* 3 PROMINENT REGISTRATION OPTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              
              {/* Option 1: Manual Form Registration */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('manual');
                  setShowSelector(false);
                }}
                className="group relative p-3.5 sm:p-5 rounded-2xl bg-white border-2 border-amber-300 hover:border-[#A71930] hover:shadow-xl transition-all text-left flex items-center gap-3 cursor-pointer active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#A71930] flex items-center justify-center text-xl border border-amber-300 group-hover:bg-[#A71930] group-hover:text-white transition-colors shrink-0">
                  {siteConfig?.regOption1Icon || '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-[#A71930] group-hover:text-[#800C1E] truncate">
                    {siteConfig?.regOption1Title || '१. मॅन्युअल नोंदणी / फॉर्म भरा'}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5 truncate">
                    माहिती स्वतः ५ सोप्या टप्प्यांत भरा
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A71930] shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Photo / PDF BioData Upload (AI Scan) */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('ocr_photo');
                  setShowSelector(false);
                }}
                className="group relative p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 border-2 border-amber-400 hover:border-[#A71930] hover:shadow-xl transition-all text-left flex items-center gap-3 cursor-pointer active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-[#A71930] text-amber-200 flex items-center justify-center text-xl border border-amber-300 shadow shrink-0">
                  {siteConfig?.regOption2Icon || '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-[#800C1E] truncate">
                    {siteConfig?.regOption2Title || '२. फोटो किंवा PDF द्वारे नोंदणी (AI स्कॅन)'}
                  </h4>
                  <p className="text-[10px] text-slate-700 font-medium leading-tight mt-0.5 truncate">
                    बायोडाटा फोटो किंवा PDF अपलोड करून ऑटो-स्कॅन करा
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A71930] shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 3: Direct BioData Photo Only (For Simple/Normal Users who don't know how to fill long forms) */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('quick_biodata');
                  setShowSelector(false);
                }}
                className="sm:col-span-2 group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/90 border-2 border-emerald-500 hover:border-emerald-700 hover:shadow-xl transition-all text-left flex items-center gap-3.5 cursor-pointer active:scale-95 shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl border-2 border-emerald-300 shadow-md shrink-0">
                  📸
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wide">
                      🌟 सर्वात सोपा पर्याय (सामान्य युझर्ससाठी)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold text-[10px]">
                      🔒 नाव व नंबर एकमेकांना लाईक केल्यावरच दिसतो
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-emerald-950 group-hover:text-emerald-800">
                    ३. फक्त बायोडाटा फोटो अपलोड करा (फॉर्म न भरता झटपट नोंदणी)
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-700 font-semibold leading-snug mt-0.5">
                    ज्यांना मोठा फॉर्म भरता येत नाही त्यांच्यासाठी: फक्त तुमच्या बायोडाटा कागदाचा फोटो, नाव आणि मोबाईल नंबर टाका — ३० सेकंदात नोंदणी पूर्ण!
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-700 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        ) : (
          /* STEP 2: SPECIFIC REGISTRATION FORM (NO NESTED DUPLICATES) */
          <div className="flex-1 overflow-y-auto flex flex-col">
            
            {/* Top Toolbar to change mode back to selector */}
            <div className="px-3 sm:px-6 py-1.5 bg-amber-100/90 border-b border-amber-200 flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setShowSelector(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-200 text-[#A71930] border border-amber-300 transition-all text-[11px] font-black cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← पर्याय बदला</span>
              </button>

              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-[#800C1E] font-black text-[10px] sm:text-xs">
                {activeMode === 'quick_biodata'
                  ? '📸 पर्याय ३: फक्त बायोडाटा फोटो अपलोड'
                  : activeMode === 'ocr_photo'
                  ? 'स्कॅन: फोटो/PDF'
                  : 'मॅन्युअल: ५-टप्पे फॉर्म'}
              </span>
            </div>

            {/* OPTION 3: QUICK BIODATA PHOTO UPLOAD VIEW FOR NORMAL USERS */}
            {activeMode === 'quick_biodata' ? (
              <form onSubmit={handleSubmitRegistration} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {/* Simple Privacy & How-It-Works Banner */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-emerald-900">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>📸 फक्त बायोडाटा फोटो अपलोड करा — मोठा फॉर्म भरण्याची गरज नाही!</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-700 font-semibold leading-relaxed">
                    🔒 <strong>तुमची गोपनीयता सुरक्षित:</strong> तुमचे <strong>पहिले नाव</strong> (उदा. <em>रा••• पाटील</em>), <strong>मोबाईल नंबर</strong> आणि <strong>बायोडाटा फोटो</strong> सुरुवातीला लपवले जातात. जेव्हा तुम्ही आणि समोरचे स्थळ <strong>एकमेकांना ❤️ लाईक (Mutual Like)</strong> कराल, तेव्हाच दोघांना एकमेकांचे पूर्ण नाव, बायोडाटा आणि मोबाईल नंबर दिसेल!
                  </p>
                </div>

                {/* 1. Upload Biodata Sheet Photo (Required) */}
                <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-3">
                  <label className="block text-slate-900 font-black text-xs sm:text-sm">
                    १. तुमच्या बायोडाटा कागदाचा / कार्डचा फोटो अपलोड करा <span className="text-red-600">*</span>
                  </label>
                  <p className="text-[11px] text-slate-600 font-medium">
                    तुमच्याकडे असलेल्या छापील किंवा लिहिलेल्या बायोडाटाचा मोबाईलने काढलेला स्पष्ट फोटो येथे निवडा.
                  </p>

                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-emerald-500 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 transition cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBiodataSheetUpload}
                      className="hidden"
                    />
                    {isUploadingBiodataSheet ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                        <span className="text-xs font-black text-emerald-800">बायोडाटा फोटो अपलोड होत आहे...</span>
                      </div>
                    ) : biodataSheetUrl ? (
                      <div className="space-y-2 w-full">
                        <div className="relative mx-auto w-36 h-44 rounded-xl overflow-hidden border-2 border-emerald-500 shadow">
                          <img src={biodataSheetUrl} alt="Biodata Sheet" className="w-full h-full object-cover" />
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                          <CheckCircle2 className="w-4 h-4" /> बायोडाटा फोटो जोडला गेला! (बदलण्यासाठी येथे टॅप करा)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="block text-xs sm:text-sm font-black text-emerald-950">
                          📄 बायोडाटा फोटो निवडण्यासाठी येथे टॅप करा
                        </span>
                        <span className="block text-[11px] text-slate-600 font-semibold">
                          (कॅमेरा किंवा गॅलरीमधून बायोडाटा फोटो निवडा)
                        </span>
                      </div>
                    )}
                  </label>

                  {biodataSheetError && (
                    <p className="text-xs font-bold text-red-600">{biodataSheetError}</p>
                  )}
                </div>

                {/* 2. Optional Candidate Portrait Photo */}
                <div className="p-4 rounded-2xl bg-white border-2 border-amber-200 shadow-xs space-y-2.5">
                  <label className="block text-slate-900 font-black text-xs sm:text-sm">
                    २. उमेदवाराचा स्वतःचा फोटो (ऐच्छिक / Optional)
                  </label>
                  <p className="text-[11px] text-slate-600 font-medium">
                    प्रोफाईलवर दाखवण्यासाठी उमेदवाराचा स्वतःचा १ फोटो असल्यास जोडा (नसल्यास फक्त बायोडाटा फोटो पुरेसा आहे).
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#800C1E] font-black text-xs border border-amber-300 cursor-pointer transition">
                      <Camera className="w-4 h-4" />
                      <span>{isUploadingPhoto ? 'अपलोड होत आहे...' : '📷 उमेदवाराचा फोटो जोडा'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUploadSim}
                        className="hidden"
                      />
                    </label>
                    {photoUrls.length > 0 && (
                      <div className="flex items-center gap-2">
                        <img
                          src={photoUrls[0]}
                          alt="Candidate"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500"
                        />
                        <span className="text-xs font-bold text-emerald-700">✓ फोटो जोडला</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Minimal Basic Details (Gender, Name, Mobile, District) */}
                <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-3.5">
                  <h4 className="font-black text-xs sm:text-sm text-[#800C1E]">
                    ३. फक्त खालील ४ मूलभूत माहिती भरा:
                  </h4>

                  {/* Gender */}
                  <div>
                    <label className="block text-slate-800 font-bold text-xs mb-1.5">
                      वधू की वर? (Gender) <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGender('bride')}
                        className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm border-2 transition cursor-pointer ${
                          gender === 'bride'
                            ? 'bg-[#A71930] text-white border-[#800C1E] shadow-sm'
                            : 'bg-amber-50 text-slate-800 border-amber-300'
                        }`}
                      >
                        👰 वधू (मुलगी / Bride)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('groom')}
                        className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm border-2 transition cursor-pointer ${
                          gender === 'groom'
                            ? 'bg-[#A71930] text-white border-[#800C1E] shadow-sm'
                            : 'bg-amber-50 text-slate-800 border-amber-300'
                        }`}
                      >
                        🤵 वर (मुलगा / Groom)
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-800 font-bold text-xs mb-1">
                      उमेदवाराचे नाव आणि आडनाव (Full Name) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="उदा. राहुल मुंडे / पूजा आंधळे"
                      className="w-full p-2.5 rounded-xl border-2 border-amber-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-[#A71930] outline-none"
                    />
                    <p className="text-[11px] text-emerald-800 font-bold mt-1">
                      🔒 तुमचे पहिले नाव गोपनीय राहील (उदा. रा••• मुंडे) आणि फक्त एकमेकांना ❤️ लाईक केल्यावरच पूर्ण नाव दिसेल.
                    </p>
                  </div>

                  {/* Mobile Number + Email OTP Verification + Password/MPIN */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1">
                        मोबाईल नंबर (१० अंकी — हाच तुमचा Login ID राहील) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="उदा. 9876543210"
                        className="w-full p-2.5 rounded-xl border-2 border-amber-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-[#A71930] outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-white border-2 border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-slate-800 font-black text-xs">
                          🔐 खाते पडताळणी (१-क्लिक Google — सर्वात सोपे) <span className="text-red-600">*</span>
                        </label>
                        {isOtpVerified && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>पडताळणी पूर्ण ✓</span>
                          </span>
                        )}
                      </div>

                      {!isOtpVerified ? (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={handleGoogleVerifyReg}
                            disabled={isGoogleVerifyingReg}
                            className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-300 hover:border-blue-500 text-slate-900 font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-60"
                          >
                            {isGoogleVerifyingReg ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                            )}
                            <span>
                              {isGoogleVerifyingReg
                                ? 'Google पडताळणी सुरू आहे...'
                                : 'गुगलने १-क्लिक पडताळा (OTP ची गरज नाही)'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowRegEmailOtp((prev) => !prev)}
                            className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-[#800C1E] underline cursor-pointer"
                          >
                            {showRegEmailOtp ? 'ईमेल OTP पर्याय लपवा' : 'किंवा ईमेल OTP ने पडताळणी करायची आहे?'}
                          </button>

                          {showRegEmailOtp && (
                            <div className="space-y-2 pt-1 border-t border-amber-200">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => {
                                    setEmail(e.target.value);
                                    setIsOtpVerified(false);
                                    setOtpSent(false);
                                    setRegOtpError('');
                                    setRegOtpSuccess('');
                                  }}
                                  placeholder="उदा. yourname@gmail.com"
                                  className="flex-1 p-2.5 rounded-xl border-2 border-amber-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-[#A71930] outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={isSendingRegOtp || regOtpCooldown > 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())}
                                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white font-black text-xs shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                  {isSendingRegOtp
                                    ? 'पाठवत आहे...'
                                    : regOtpCooldown > 0
                                    ? `पुन्हा पाठवा (${regOtpCooldown}s)`
                                    : otpSent
                                    ? '🔄 पुन्हा ईमेल OTP पाठवा'
                                    : '📧 ईमेल OTP पाठवा'}
                                </button>
                              </div>

                              {otpSent && (
                                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                                  <label className="block text-slate-800 font-bold text-xs">
                                    📧 ईमेलवर आलेला ४-अंकी OTP कोड टाका:
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="tel"
                                      maxLength={4}
                                      value={otpInput}
                                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                      placeholder="4-Digit OTP"
                                      className="flex-1 p-2 rounded-xl border-2 border-amber-400 bg-white text-center font-mono font-black text-sm tracking-widest text-slate-900"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleVerifyOtp}
                                      disabled={isVerifyingRegOtp || otpInput.length !== 4}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer disabled:opacity-50"
                                    >
                                      {isVerifyingRegOtp ? 'तपासत आहे...' : '✓ OTP तपासा'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
                          <span className="truncate">✅ {email || 'Google Account Verified'}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOtpVerified(false);
                              setRegOtpSuccess('');
                            }}
                            className="text-[11px] text-[#800C1E] underline shrink-0 cursor-pointer"
                          >
                            बदला
                          </button>
                        </div>
                      )}
                    </div>

                    {regOtpError && (
                      <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg font-bold">
                        {regOtpError}
                      </p>
                    )}
                    {regOtpSuccess && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold">
                        {regOtpSuccess}
                      </p>
                    )}

                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1">
                        🔐 लॉगिन पासवर्ड / ४-अंकी MPIN सेट करा (ॲप आणि वेबसाईट दोन्हीसाठी)
                      </label>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="उदा. 1234 किंवा तुमचा पासवर्ड"
                        className="w-full p-2.5 rounded-xl border-2 border-amber-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-[#A71930] outline-none"
                      />
                    </div>

                    <p className="text-[11px] text-emerald-800 font-bold mt-1">
                      🔒 तुमचा मोबाईल नंबर सुरक्षित राहील आणि फक्त एकमेकांना ❤️ लाईक (Mutual Like) केल्यावरच समोरच्याला दिसेल.
                    </p>
                  </div>

                  {/* District & Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1">
                        जिल्हा (District)
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full p-2.5 rounded-xl border-2 border-amber-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-[#A71930] outline-none"
                      >
                        {MAHARASHTRA_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-800 font-bold text-xs mb-1">
                        जन्मतारीख (किंवा अंदाजे वर्ष)
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full p-2.5 rounded-xl border-2 border-amber-300 bg-white text-slate-900 font-bold text-xs sm:text-sm focus:border-[#A71930] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Crisp 1-Line Legal Consent Checkbox */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-900">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedTermsAndConditions}
                      onChange={(e) => setAcceptedTermsAndConditions(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#800C1E] shrink-0 cursor-pointer"
                    />
                    <span>
                      मी १८+ वयाचा/ची असून स्वखुशीने माहिती देत आहे व{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setLegalModalTab('terms');
                          setIsLegalModalOpen(true);
                        }}
                        className="text-[#800C1E] underline font-black cursor-pointer"
                      >
                        अटी व गोपनीयता धोरणाशी
                      </button>{' '}
                      सहमत आहे. *
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border-2 border-emerald-300"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>✅ बायोडाटा अपलोड व झटपट नोंदणी पूर्ण करा</span>
                </button>
              </form>
            ) : activeMode === 'ocr_photo' ? (
              <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-3">
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
                      setPrimaryPhotoIndex(0);
                    }

                    setExtractedSuccessBadge(
                      ext.candidatePhotoUrl
                        ? '✨ बायोडाटा माहिती व उमेदवाराचा फोटो यशस्वीपणे भरला गेला आहे! कृपया तपासा.'
                        : '✨ बायोडाटा माहिती यशस्वीपणे भरली गेली आहे! आपण पुढील टप्प्यांमध्ये (टप्पा ४) किंवा नोंदणीनंतर कधीही स्वतःचा फोटो जोडू शकता.'
                    );
                    setActiveMode('manual');
                    setStep(1);
                  }}
                />
              </div>
            ) : (
              /* MANUAL MULTI-STEP FORM VIEW */
              <form onSubmit={handleSubmitRegistration} className="p-3 sm:p-6 overflow-y-auto space-y-3.5 text-xs sm:text-sm flex-1">
                
                {/* AI Extracted Success Banner */}
                {extractedSuccessBadge && (
                  <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center justify-between gap-2 shadow-xs text-emerald-950 text-xs font-black animate-fade-in">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{extractedSuccessBadge}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExtractedSuccessBadge(null)}
                      className="text-emerald-700 hover:text-emerald-950 font-bold px-1.5 py-0.5 rounded hover:bg-emerald-100 cursor-pointer text-xs"
                    >
                      ✕ बंद
                    </button>
                  </div>
                )}
                
                {/* Step Progress Bar */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-600 pb-2 border-b border-amber-200 overflow-x-auto gap-1.5 no-scrollbar">
                  <span className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${step === 1 ? 'bg-[#A71930] text-amber-100 shadow-xs' : 'bg-amber-100/80 text-slate-700'}`} onClick={() => setStep(1)}>
                    १. वैयक्तिक
                  </span>
                  <span className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${step === 2 ? 'bg-[#A71930] text-amber-100 shadow-xs' : 'bg-amber-100/80 text-slate-700'}`} onClick={() => setStep(2)}>
                    २. शिक्षण-नोकरी
                  </span>
                  <span className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${step === 3 ? 'bg-[#A71930] text-amber-100 shadow-xs' : 'bg-amber-100/80 text-slate-700'}`} onClick={() => setStep(3)}>
                    ३. कौटुंबिक
                  </span>
                  <span className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${step === 4 ? 'bg-[#A71930] text-amber-100 shadow-xs' : 'bg-amber-100/80 text-slate-700'}`} onClick={() => setStep(4)}>
                    ४. संपर्क-फोटो
                  </span>
                  <span className={`px-2 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${step === 5 ? 'bg-[#A71930] text-amber-100 shadow-xs' : 'bg-amber-100/80 text-slate-700'}`} onClick={() => setStep(5)}>
                    ५. सोयीस्कर
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
                          placeholder="उदा. नाव मधले नाव आडनाव"
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

                      {/* Multi-Profession Badges Selection - Categorized and Stacked */}
                      <div className="col-span-full pt-2 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-amber-200 pb-1.5">
                          <label className="text-slate-900 font-black text-xs sm:text-sm flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-[#A71930]" />
                            <span>नोकरीचे क्षेत्र व पद टॅग्ज (Profession & Job Sector Tags):</span>
                          </label>
                          <span className="text-[11px] text-amber-950 bg-amber-200/90 px-2.5 py-0.5 rounded-full font-black border border-amber-400">
                            एकापेक्षा जास्त टॅग्ज निवडू शकता (उदा. सरकारी नोकरी + डॉक्टर)
                          </span>
                        </div>

                        {/* PART 1: EMPLOYMENT SECTORS */}
                        <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-300/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#800C1E] flex items-center gap-1">
                              <span>१. नोकरीचे मुख्य क्षेत्र (Employment Sector)</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">शासकीय / खाजगी / व्यवसाय</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {EMPLOYMENT_SECTORS.map((sector) => {
                              const isSelected = regProfessionTags.includes(sector.label);
                              return (
                                <button
                                  type="button"
                                  key={sector.id}
                                  onClick={() => {
                                    setRegProfessionTags((prev) =>
                                      prev.includes(sector.label)
                                        ? prev.filter((t) => t !== sector.label)
                                        : [...prev, sector.label]
                                    );
                                  }}
                                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? 'bg-[#800C1E] text-amber-100 border-[#800C1E] shadow-sm ring-2 ring-amber-400'
                                      : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100/60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-black text-xs">
                                    <span>{sector.label}</span>
                                    {isSelected ? (
                                      <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                                    ) : (
                                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                                    )}
                                  </div>
                                  <span className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-amber-200/90' : 'text-slate-500'}`}>
                                    {sector.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* PART 2: DESIGNATIONS & SPECIFIC ROLES */}
                        <div className="bg-teal-50/50 p-3 rounded-2xl border border-teal-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-teal-950 flex items-center gap-1">
                              <span>२. विशिष्ट पद / प्रोफेशन रोल (Designation / Profession Role)</span>
                            </span>
                            <span className="text-[10px] text-teal-700 font-bold">डॉक्टर, इंजिनिअर, अधिकारी, शिक्षक, इ.</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {PROFESSION_ROLES.map((role) => {
                              const isSelected = regProfessionTags.includes(role.label);
                              return (
                                <button
                                  type="button"
                                  key={role.id}
                                  onClick={() => {
                                    setRegProfessionTags((prev) =>
                                      prev.includes(role.label)
                                        ? prev.filter((t) => t !== role.label)
                                        : [...prev, role.label]
                                    );
                                  }}
                                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? 'bg-teal-900 text-teal-100 border-teal-900 shadow-sm ring-2 ring-teal-400 font-black'
                                      : 'bg-white text-slate-800 border-teal-200 hover:bg-teal-100/50 font-bold'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs font-black">
                                    <span className="truncate">{role.label}</span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0 ml-1" />}
                                  </div>
                                  <span className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-teal-200' : 'text-slate-500'}`}>
                                    {role.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* PART 3: OTHER SPECIAL HIGHLIGHT TAGS */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                          <span className="text-xs font-black text-slate-800 block">
                            ३. इतर कौटुंबिक व जीवनशैली टॅग्ज (Lifestyle & Highlights):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {PROFILE_TAG_PRESETS.filter(p => p.category === 'education' || p.category === 'marital').map((preset) => {
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
                                  className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-sm ring-2 ring-amber-400'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>{preset.label}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* PART 4: LIVE STACKED PREVIEW */}
                        {regProfessionTags.length > 0 && (
                          <div className="p-3 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-2xl border-2 border-amber-400 shadow-xs space-y-1.5">
                            <span className="text-[11px] font-black text-[#800C1E] flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>प्रोफाईलवर अशा प्रकारे एकाखाली एक आकर्षक टॅग्ज दिसतील (Live Stack Preview):</span>
                            </span>
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              {regProfessionTags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`px-3 py-1 rounded-full text-xs font-black border shadow-xs flex items-center gap-1 ${getTagStyleClass(tag)}`}
                                >
                                  <span>{tag}</span>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRegProfessionTags(prev => prev.filter(t => t !== tag));
                                    }}
                                    className="ml-1 hover:text-rose-600 cursor-pointer font-bold"
                                    title="टॅग काढा"
                                  >
                                    ✕
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
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
                          placeholder="उदा. वडिलांचे पूर्ण नाव"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">वडिलांचा व्यवसाय (Father Occupation)</label>
                        <input
                          type="text"
                          placeholder="उदा. शेतकरी / नोकरी / व्यवसाय"
                          value={fatherOcc}
                          onChange={(e) => setFatherOcc(e.target.value)}
                          className="w-full bg-white border-2 border-amber-200 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">आईचे नाव (Mother's Name)</label>
                        <input
                          type="text"
                          placeholder="उदा. आईचे पूर्ण नाव"
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
                          नातेवाईक आडनावे (Relative Surnames)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. नातेसंबंधातील विविध आडनावे"
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
                        <div className="sm:col-span-2 space-y-2">
                          <label className="block text-slate-800 font-bold mb-1">
                            मुख्य मोबाईल नंबर (Primary Mobile — हाच तुमचा Login ID राहील) *
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              placeholder="9800000000"
                              value={mobile}
                              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                            />
                          </div>

                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="block text-slate-800 font-black text-xs">
                                🔐 खाते पडताळणी (१-क्लिक Google — OTP ची गरज नाही) <span className="text-red-600">*</span>
                              </label>
                              {isOtpVerified && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1 shrink-0">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>पडताळणी पूर्ण ✓</span>
                                </span>
                              )}
                            </div>

                            {!isOtpVerified ? (
                              <div className="space-y-2">
                                <button
                                  type="button"
                                  onClick={handleGoogleVerifyReg}
                                  disabled={isGoogleVerifyingReg}
                                  className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-300 hover:border-blue-500 text-slate-900 font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-60"
                                >
                                  {isGoogleVerifyingReg ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                  ) : (
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                  )}
                                  <span>
                                    {isGoogleVerifyingReg
                                      ? 'Google पडताळणी सुरू आहे...'
                                      : 'गुगलने १-क्लिक पडताळा (Continue with Google)'}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setShowRegEmailOtp((prev) => !prev)}
                                  className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-[#800C1E] underline cursor-pointer"
                                >
                                  {showRegEmailOtp ? 'ईमेल OTP पर्याय लपवा' : 'किंवा ईमेल OTP ने पडताळणी करायची आहे?'}
                                </button>

                                {showRegEmailOtp && (
                                  <div className="space-y-2 pt-1 border-t border-amber-200">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <input
                                        type="email"
                                        placeholder="yourname@gmail.com"
                                        value={email}
                                        onChange={(e) => {
                                          setEmail(e.target.value);
                                          setIsOtpVerified(false);
                                          setOtpSent(false);
                                          setRegOtpError('');
                                          setRegOtpSuccess('');
                                        }}
                                        className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isSendingRegOtp || regOtpCooldown > 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white font-black text-xs shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                                      >
                                        {isSendingRegOtp
                                          ? 'पाठवत आहे...'
                                          : regOtpCooldown > 0
                                          ? `पुन्हा पाठवा (${regOtpCooldown}s)`
                                          : otpSent
                                          ? '🔄 पुन्हा ईमेल OTP पाठवा'
                                          : '📧 ईमेल OTP पाठवा'}
                                      </button>
                                    </div>

                                    {otpSent && (
                                      <div className="p-3 rounded-xl bg-white border border-amber-300 space-y-2">
                                        <label className="block text-slate-800 font-bold text-xs">
                                          📧 ईमेलवर आलेला ४-अंकी OTP कोड टाका:
                                        </label>
                                        <div className="flex gap-2">
                                          <input
                                            type="tel"
                                            maxLength={4}
                                            value={otpInput}
                                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            placeholder="4-Digit OTP"
                                            className="flex-1 p-2 rounded-xl border-2 border-amber-400 bg-amber-50 text-center font-mono font-black text-sm tracking-widest text-slate-900"
                                          />
                                          <button
                                            type="button"
                                            onClick={handleVerifyOtp}
                                            disabled={isVerifyingRegOtp || otpInput.length !== 4}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer disabled:opacity-50"
                                          >
                                            {isVerifyingRegOtp ? 'तपासत आहे...' : '✓ OTP तपासा'}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
                                <span className="truncate">✅ {email || 'Google Account Verified'}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsOtpVerified(false);
                                    setRegOtpSuccess('');
                                  }}
                                  className="text-[11px] text-[#800C1E] underline shrink-0 cursor-pointer"
                                >
                                  बदला
                                </button>
                              </div>
                            )}
                          </div>

                          {regOtpError && (
                            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg font-bold">
                              {regOtpError}
                            </p>
                          )}
                          {regOtpSuccess && (
                            <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold">
                              {regOtpSuccess}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-slate-800 font-bold mb-1">
                            पर्यायी मोबाईल नंबर (Secondary Mobile - Optional / ऐच्छिक)
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98000 00000"
                            value={secondaryMobile}
                            onChange={(e) => setSecondaryMobile(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-800 font-bold mb-1">
                            ईमेल आयडी (Email ID)
                          </label>
                          <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:border-[#A71930]"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-800 font-bold mb-1 flex items-center justify-between">
                            <span>🔐 खात्याचा पासवर्ड (Set Account Password) *</span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">Live Login</span>
                          </label>
                          <input
                            type="text"
                            placeholder="तुमचा पासवर्ड सेट करा (उदा. vanjari@123)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-xs outline-none focus:border-[#A71930]"
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
                            placeholder="उदा. मु. पो. गाव, ता. तालुका, जि. जिल्हा"
                            value={nativeAddress}
                            onChange={(e) => setNativeAddress(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3.5 py-2 text-slate-900 outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-800 font-bold mb-1">सध्याचा राहता पत्ता (Current Address)</label>
                          <input
                            type="text"
                            placeholder="उदा. परिसर, शहर/जिल्हा"
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

                    {/* OPTIONAL Aadhaar & ID Document Upload Section (Front & Back) */}
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border-2 border-amber-300 space-y-3.5">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200 pb-2">
                        <label className="block text-[#A71930] font-black text-xs sm:text-sm flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#A71930]" />
                          <span>४. आधार / ओळखपत्र कागदपत्रे जोडणे (पुढील व मागील बाजू)</span>
                        </label>
                        <span className="text-[10px] font-black bg-amber-200 text-[#800C1E] px-2.5 py-0.5 rounded-full border border-amber-300">
                          ऐच्छिक / Optional
                        </span>
                      </div>

                      {/* Admin Configured Security Notice */}
                      {siteConfig.showMaskedAadhaarNotice !== false && (
                        <div className="p-3 bg-white/90 border-2 border-amber-300/80 rounded-xl text-[11px] sm:text-xs text-amber-950 font-semibold leading-relaxed shadow-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-base shrink-0">🛡️</span>
                            <div>
                              <strong className="text-[#800C1E] block mb-0.5">गोपनीयता व सुरक्षितता सूचना:</strong>
                              <span>{siteConfig.maskedAadhaarNoticeText || 'आपल्या गोपनीयतेसाठी व सुरक्षिततेसाठी कृपया पहिल्या ८ अंकांवर मास्क केलेले (Masked Aadhaar) किंवा केवळ शेवटचे ४ अंक दिसणारे आधार कार्ड अपलोड करा.'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-800 text-xs font-bold mb-1">
                            आधार क्रमांक / आयडी नंबर (ऐच्छिक):
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. XXXX XXXX 1234 किंवा शेवटचे ४ अंक"
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value)}
                            className="w-full bg-white border-2 border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#A71930]"
                          />
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/80 rounded-xl border border-amber-200 w-full">
                            <input
                              type="checkbox"
                              checked={isAadhaarMasked}
                              onChange={(e) => setIsAadhaarMasked(e.target.checked)}
                              className="w-4 h-4 text-[#A71930] rounded accent-[#A71930]"
                            />
                            <span className="text-[11px] font-bold text-slate-800">
                              🔒 माझे आधार कार्ड मास्क केलेले (Masked) आहे
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* FRONT & BACK UPLOAD GRIDS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* 1. FRONT SIDE */}
                        <div className="p-3 bg-white rounded-xl border-2 border-amber-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-100 text-[#800C1E] flex items-center justify-center text-[10px] font-black">१</span>
                              <span>आधार पुढील बाजू (Front Photo)</span>
                            </span>
                            {aadhaarFrontUrl && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-black">
                                ✓ अपलोड झाले
                              </span>
                            )}
                          </div>

                          {aadhaarFrontUrl ? (
                            <div className="relative rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50/50 p-2 flex items-center justify-between">
                              <img
                                src={aadhaarFrontUrl}
                                alt="Aadhaar Front"
                                className="w-14 h-10 object-cover rounded border border-emerald-400"
                              />
                              <div className="flex items-center gap-2">
                                <a
                                  href={aadhaarFrontUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-[#A71930] font-black underline"
                                >
                                  पहा
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAadhaarFrontUrl('');
                                    if (aadhaarDocUrl === aadhaarFrontUrl) setAadhaarDocUrl('');
                                  }}
                                  className="text-[11px] text-rose-600 font-bold hover:underline"
                                >
                                  हटवा
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleAadhaarFrontUpload}
                                disabled={isUploadingAadhaarFront}
                                className="hidden"
                                id="modal-aadhaar-front-upload"
                              />
                              <label
                                htmlFor="modal-aadhaar-front-upload"
                                className="w-full px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#A71930] font-black text-xs border-2 border-dashed border-amber-400 cursor-pointer flex items-center justify-center gap-2 transition-all"
                              >
                                {isUploadingAadhaarFront ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-[#A71930]" />
                                    <span>अपलोड होत आहे...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-[#A71930]" />
                                    <span>📸 पुढील बाजू निवडा</span>
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                        </div>

                        {/* 2. BACK SIDE */}
                        <div className="p-3 bg-white rounded-xl border-2 border-amber-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-100 text-[#800C1E] flex items-center justify-center text-[10px] font-black">२</span>
                              <span>आधार मागील बाजू (Back Photo)</span>
                            </span>
                            {aadhaarBackUrl && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-black">
                                ✓ अपलोड झाले
                              </span>
                            )}
                          </div>

                          {aadhaarBackUrl ? (
                            <div className="relative rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50/50 p-2 flex items-center justify-between">
                              <img
                                src={aadhaarBackUrl}
                                alt="Aadhaar Back"
                                className="w-14 h-10 object-cover rounded border border-emerald-400"
                              />
                              <div className="flex items-center gap-2">
                                <a
                                  href={aadhaarBackUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-[#A71930] font-black underline"
                                >
                                  पहा
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setAadhaarBackUrl('')}
                                  className="text-[11px] text-rose-600 font-bold hover:underline"
                                >
                                  हटवा
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleAadhaarBackUpload}
                                disabled={isUploadingAadhaarBack}
                                className="hidden"
                                id="modal-aadhaar-back-upload"
                              />
                              <label
                                htmlFor="modal-aadhaar-back-upload"
                                className="w-full px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#A71930] font-black text-xs border-2 border-dashed border-amber-400 cursor-pointer flex items-center justify-center gap-2 transition-all"
                              >
                                {isUploadingAadhaarBack ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-[#A71930]" />
                                    <span>अपलोड होत आहे...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-[#A71930]" />
                                    <span>📸 मागील बाजू निवडा</span>
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

                    {/* Referral Code Input Box */}
                    <div className="bg-gradient-to-r from-amber-50 via-rose-50/50 to-amber-50 p-4 rounded-2xl border-2 border-amber-300 space-y-2 shadow-sm">
                      <label className="block text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-[#A71930]" />
                        <span>रेफरल कोड (ऐच्छिक / Referral Code):</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="उदा. VJ-RAME-9876"
                          value={referralCodeInput}
                          onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 outline-none focus:border-[#A71930]"
                        />
                      </div>
                    </div>

                    {/* Crisp 1-Line Mandatory Legal Consent Checkbox */}
                    <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-400 shadow-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-900 font-bold">
                        <input
                          type="checkbox"
                          required
                          checked={acceptedTermsAndConditions}
                          onChange={(e) => setAcceptedTermsAndConditions(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#A71930] cursor-pointer shrink-0"
                        />
                        <span>
                          मी १८+ वयाचा/ची असून स्वखुशीने खरी माहिती देत आहे व{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLegalModalTab('terms');
                              setIsLegalModalOpen(true);
                            }}
                            className="text-[#A71930] underline font-black cursor-pointer"
                          >
                            अटी, नियम
                          </button>{' '}
                          आणि{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLegalModalTab('privacy');
                              setIsLegalModalOpen(true);
                            }}
                            className="text-[#A71930] underline font-black cursor-pointer"
                          >
                            गोपनीयता धोरणाशी
                          </button>{' '}
                          पूर्ण सहमत आहे. <span className="text-rose-600 font-black">*</span>
                        </span>
                      </label>
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

      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};
