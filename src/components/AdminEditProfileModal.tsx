import React, { useState, useEffect } from 'react';
import { 
  X, Save, Trash2, Camera, Award, Shield, AlertCircle, Loader2, 
  FileText, CheckCircle2, Eye, ExternalLink, Sparkles, UserCheck, Check, ShieldCheck, Download,
  Tag, Plus, Bell, MessageCircle, Cloud, Upload, Send
} from 'lucide-react';
import { UserProfile, Gender, MaritalStatus, MembershipTier } from '../types';
import { uploadToCloudinary, compressAndResizeImage } from '../utils/cloudinary';
import { PROFESSION_PRESETS, PROFILE_TAG_PRESETS, TAG_CATEGORIES, getTagStyleClass } from '../utils/professionUtils';
import { useApp } from '../context/AppContext';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

interface AdminEditProfileModalProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileId: string, updatedFields: Partial<UserProfile>) => void;
  canEdit?: boolean;
  isSelfEdit?: boolean;
}

export const PRESET_BADGES = [
  { id: 'Verified', label: '✅ प्रमाणित प्रोफाईल (Verified Profile)' },
  { id: 'VIP', label: '🌟 व्ही.आय.पी. सदस्य (VIP Member)' },
  { id: 'Premium', label: '🏆 प्रीमियम जुळवणी (Premium Match)' },
  { id: 'Gold', label: '👑 गोल्ड मेंबर (Gold Member)' },
  { id: 'Diamond', label: '💎 डायमंड मेंबर (Diamond Member)' },
  { id: 'DocsVerified', label: '🛡️ दस्तावेज पडताळणी पूर्ण (Docs Verified)' },
  { id: 'Featured', label: '💫 विशेष शिफारस (Featured)' },
  { id: 'HighlyEducated', label: '🎓 उच्च शिक्षित (Highly Educated)' },
  { id: 'GovtServant', label: '💼 सरकारी नोकरी (Govt Employee)' },
  { id: 'Landowner', label: '🌾 शेती व जमीनदार (Landowner / Farmer)' },
];

export const AdminEditProfileModal: React.FC<AdminEditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
  canEdit = true,
  isSelfEdit = false,
}) => {
  const { trashPhoto, sendPushNotification, siteConfig, currentUser, isAdminLoggedIn } = useApp();
  const isActualAdmin = Boolean((isAdminLoggedIn || currentUser?.isAdmin) && !isSelfEdit);
  const [activeSubTab, setActiveSubTab] = useState<
    'personal' | 'astrology' | 'location' | 'education' | 'family' | 'documents' | 'badge'
  >('personal');
  
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [photoReqSentMsg, setPhotoReqSentMsg] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [inspectDocUrl, setInspectDocUrl] = useState<{ url: string; title: string } | null>(null);

  // 1. Personal Details State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('bride');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(25);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('never_married');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [complexion, setComplexion] = useState('');
  const [religion, setReligion] = useState('हिंदू');
  const [subCaste, setSubCaste] = useState('वंजारी');
  const [bio, setBio] = useState('');

  // 2. Astrology / Kundali Details
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [gotra, setGotra] = useState('');
  const [rashi, setRashi] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [gan, setGan] = useState('');
  const [nadi, setNadi] = useState('');
  const [horoscopeUrl, setHoroscopeUrl] = useState('');

  // 3. Location & Contact
  const [mobile, setMobile] = useState('');
  const [secondaryMobile, setSecondaryMobile] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [city, setCity] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [nativeAddress, setNativeAddress] = useState('');

  // 4. Education & Occupation
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [income, setIncome] = useState('');
  const [professionTags, setProfessionTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  const handleAddCustomTagModal = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!professionTags.includes(trimmed)) {
      setProfessionTags(prev => [...prev, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTagModal = (tagLabel: string) => {
    setProfessionTags(prev => prev.filter(t => t !== tagLabel));
  };

  // 5. Family Details
  const [fatherName, setFatherName] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [brothers, setBrothers] = useState(0);
  const [brotherDetails, setBrotherDetails] = useState('');
  const [sisters, setSisters] = useState(0);
  const [sisterDetails, setSisterDetails] = useState('');
  const [mamaName, setMamaName] = useState('');
  const [mamaNative, setMamaNative] = useState('');
  const [familyType, setFamilyType] = useState('विभक्त');
  const [expectations, setExpectations] = useState('');

  // 6. Verification, Photos & Documents
  const [photos, setPhotos] = useState<string[]>([]);
  const [idProofUrl, setIdProofUrl] = useState('');
  const [idVerificationNumber, setIdVerificationNumber] = useState('');
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [isPhotoVerified, setIsPhotoVerified] = useState(false);
  const [isPremiumVerified, setIsPremiumVerified] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [faceVerifiedAt, setFaceVerifiedAt] = useState('');
  const [membership, setMembership] = useState<MembershipTier>('free');
  const [isApproved, setIsApproved] = useState(false);

  // Privacy State
  const [hideContact, setHideContact] = useState(false);
  const [hidePhoto, setHidePhoto] = useState(false);

  // 7. Badge & Visibility States
  const [assignedBadge, setAssignedBadge] = useState<string>('');
  const [customBadgeText, setCustomBadgeText] = useState<string>('');
  const [hideBadge, setHideBadge] = useState<boolean>(false);

  // Set initial form values when profile opens
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setGender(profile.gender || 'bride');
      setDob(profile.dob || '');
      setAge(profile.age || 25);
      setMaritalStatus(profile.maritalStatus || 'never_married');
      setHeight(profile.height || '');
      setWeight(profile.weight || '');
      setBloodGroup(profile.bloodGroup || '');
      setComplexion(profile.complexion || '');
      setReligion(profile.religion || 'हिंदू');
      setSubCaste(profile.subCaste || 'वंजारी');
      setBio(profile.bio || '');

      setBirthTime(profile.birthTime || '');
      setBirthPlace(profile.birthPlace || '');
      setGotra(profile.gotra || '');
      setRashi(profile.rashi || '');
      setNakshatra(profile.nakshatra || '');
      setGan(profile.gan || '');
      setNadi(profile.nadi || '');
      setHoroscopeUrl(profile.horoscopeUrl || '');

      setMobile(profile.mobile || (profile as any).mobileNumber || '');
      setSecondaryMobile(profile.secondaryMobile || '');
      setEmail(profile.email || '');
      setDistrict(profile.district || '');
      setTaluka(profile.taluka || '');
      setCity(profile.city || '');
      setCurrentAddress(profile.currentAddress || '');
      setNativeAddress(profile.nativeAddress || '');

      setEducation(profile.education || '');
      setOccupation(profile.occupation || '');
      setCompanyName(profile.companyName || '');
      setIncome(profile.income || '');
      setProfessionTags(profile.professionTags || []);

      setFatherName(profile.fatherName || '');
      setFatherOccupation(profile.fatherOccupation || '');
      setMotherName(profile.motherName || '');
      setMotherOccupation(profile.motherOccupation || '');
      setBrothers(profile.brothers || 0);
      setBrotherDetails(profile.brotherDetails || '');
      setSisters(profile.sisters || 0);
      setSisterDetails(profile.sisterDetails || '');
      setMamaName(profile.mamaName || '');
      setMamaNative(profile.mamaNative || '');
      setFamilyType(profile.familyType || 'विभक्त');
      setExpectations(profile.expectations || '');

      setPhotos(profile.photos || []);
      setIdProofUrl(profile.idProofUrl || profile.aadhaarCardUrl || '');
      setIdVerificationNumber(profile.idVerificationNumber || '');
      setAadhaarCardUrl(profile.aadhaarCardUrl || profile.idProofUrl || '');
      setIsVerified(Boolean(profile.isVerified));
      setIsIdVerified(Boolean(profile.isIdVerified || profile.aadhaarVerified));
      setIsPhotoVerified(Boolean(profile.isPhotoVerified));
      setIsPremiumVerified(Boolean(profile.isPremiumVerified));
      setIsFaceVerified(Boolean(profile.isFaceVerified));
      setFaceVerifiedAt(profile.faceVerifiedAt || '');
      setMembership(profile.membership || 'free');

      setHideContact(profile.privacy?.hideContact || false);
      setHidePhoto(profile.privacy?.hidePhoto || false);
      setHideBadge(Boolean(profile.hideBadge));

      // Initialize Badge State
      const currentBadge = profile.badge || profile.customBadge || '';
      const matchingPreset = PRESET_BADGES.find((b) => b.id === currentBadge);
      if (matchingPreset) {
        setAssignedBadge(matchingPreset.id);
        setCustomBadgeText('');
      } else if (currentBadge) {
        setAssignedBadge('Custom');
        setCustomBadgeText(currentBadge);
      } else {
        setAssignedBadge('');
        setCustomBadgeText('');
      }
    }
  }, [profile, isOpen]);

  useModalScrollLock(isOpen);

  if (!isOpen || !profile) return null;

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobValue = e.target.value;
    setDob(dobValue);
    if (dobValue) {
      const birthYear = new Date(dobValue).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear && birthYear > 1900 && birthYear <= currentYear) {
        setAge(currentYear - birthYear);
      }
    }
  };

  // Upload Profile Photos
  const handlePhotoUploadSim = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 8) {
      setPhotoError('आपण जास्तीत जास्त ८ फोटो जोडू शकता.');
    }

    const filesToUpload = files.slice(0, 8 - photos.length);
    if (filesToUpload.length === 0) return;

    setIsUploadingPhoto(true);
    for (const file of filesToUpload) {
      try {
        const comp = await compressAndResizeImage(file, 2400, 0.95);
        const fileToUpload = comp.file || file;
        const res = await uploadToCloudinary(fileToUpload, 'vanjarijodi_candidates');
        if (res.success && res.url) {
          setPhotos((prev) => [...prev, res.url]);
        } else {
          setPhotoError(res.error || 'फोटो अपलोड करताना अडचण आली.');
        }
      } catch {
        const res = await uploadToCloudinary(file, 'vanjarijodi_candidates');
        if (res.success && res.url) {
          setPhotos((prev) => [...prev, res.url]);
        } else {
          setPhotoError(res.error || 'फोटो अपलोड करताना अडचण आली.');
        }
      }
    }
    setIsUploadingPhoto(false);
  };

  // Upload Document (Aadhaar / Horoscope)
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetDoc: 'aadhaar' | 'horoscope') => {
    setDocError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    const res = await uploadToCloudinary(file, 'vanjarijodi_documents');
    setIsUploadingDoc(false);

    if (res.success && res.url) {
      if (targetDoc === 'aadhaar') {
        setIdProofUrl(res.url);
        setAadhaarCardUrl(res.url);
        setIsIdVerified(true);
      } else {
        setHoroscopeUrl(res.url);
      }
    } else {
      setDocError(res.error || 'दस्तावेज अपलोड करताना त्रुटी आली.');
    }
  };

  const removePhoto = (indexToRemove: number) => {
    const removedUrl = photos[indexToRemove];
    if (removedUrl && profile) {
      trashPhoto(profile.id, removedUrl, indexToRemove === 0 ? 'avatar' : 'gallery', fullName || profile.fullName);
    }
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const setPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const updated = [...prev];
      const primary = updated[index];
      updated.splice(index, 1);
      updated.unshift(primary);
      return updated;
    });
  };

  const handleSendTelegramPhotoRequest = () => {
    if (!profile) return;
    const currentCount = photos.length;
    const text = encodeURIComponent(
      `नमस्कार ${fullName || profile.fullName},\n\n` +
      `वंजारी जोडी मॅट्रिमोनी टिमकडून नम्र संदेश:\n` +
      `आपल्या बायोडाटावर सध्या फक्त ${currentCount} फोटो आहे(त).\n` +
      `इतर सदस्यांकडून १००% उत्तम प्रतिसाद मिळण्यासाठी व बायोडाटा परिपूर्ण दिसण्यासाठी कृपया किमान ५ सुंदर फोटो आपल्या प्रोफाइलवर नक्की अपलोड करावेत.\n\n` +
      `फोटो अपलोड करण्यासाठी लिंक: https://vanjarijodi.web.app/dashboard`
    );
    const targetTg = (profile.telegramUsername || siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
    window.open(`https://t.me/${targetTg}?text=${text}`, '_blank');
    setPhotoReqSentMsg('✅ सदस्याच्या टेलिग्रामवर फोटो मागणीचा मेसेज उघडला आहे!');
  };

  const handleSendInAppPhotoRequest = () => {
    if (!profile) return;
    sendPushNotification(
      profile.id,
      '📷 फोटो अपलोड करण्याची नम्र सूचना',
      `तुमच्या बायोडाटावर सध्या फक्त ${photos.length} फोटो आहे(त). चांगल्या स्थळांकडून प्रतिसादासाठी कृपया किमान ५ सुंदर फोटो अपलोड करा.`
    );
    setPhotoReqSentMsg('✅ सदस्याला अ‍ॅपमध्ये फोटो मागणीचे नोटिफिकेशन यशस्वीरीत्या पाठवले!');
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      alert('कृपया संपूर्ण नाव प्रविष्ट करा!');
      return;
    }
    if (!mobile.trim()) {
      alert('कृपया मोबाईल नंबर प्रविष्ट करा!');
      return;
    }

    let finalBadge = '';
    if (assignedBadge === 'Custom') {
      finalBadge = customBadgeText.trim();
    } else {
      finalBadge = assignedBadge;
    }

    const updatedFields: Partial<UserProfile> = {
      fullName,
      gender,
      dob,
      age: Number(age),
      maritalStatus,
      height,
      weight,
      bloodGroup,
      complexion,
      religion,
      subCaste,
      bio,

      birthTime,
      birthPlace,
      gotra,
      rashi,
      nakshatra,
      gan,
      nadi,
      horoscopeUrl,

      mobile,
      secondaryMobile,
      email,
      district,
      taluka,
      city,
      currentAddress,
      nativeAddress,

      education,
      occupation,
      companyName,
      income,
      professionTags,

      fatherName,
      fatherOccupation,
      motherName,
      motherOccupation,
      brothers: Number(brothers),
      brotherDetails,
      sisters: Number(sisters),
      sisterDetails,
      mamaName,
      mamaNative,
      familyType,
      expectations,

      photos,
      photoUrl: photos[0] || profile.photoUrl,
      idProofUrl,
      idVerificationNumber,
      aadhaarCardUrl,

      privacy: {
        ...(profile.privacy || { hideContact: false, hidePhoto: false }),
        hideContact,
        hidePhoto,
      }
    };

    // ONLY Authorized Admin can modify verification badges, flags, approval, and membership tier
    if (isActualAdmin) {
      updatedFields.aadhaarVerified = isIdVerified;
      updatedFields.isVerified = isVerified;
      updatedFields.isIdVerified = isIdVerified;
      updatedFields.isPhotoVerified = isPhotoVerified;
      updatedFields.isPremiumVerified = isPremiumVerified;
      updatedFields.isFaceVerified = isFaceVerified;
      updatedFields.faceVerifiedAt = isFaceVerified ? (faceVerifiedAt || new Date().toISOString()) : '';
      updatedFields.membership = membership;
      updatedFields.badge = finalBadge;
      updatedFields.customBadge = finalBadge;
      updatedFields.hideBadge = hideBadge;
      updatedFields.isApproved = isApproved;
    }

    onSave(profile.id, updatedFields);
    alert(
      isActualAdmin
        ? '✅ सदस्याची माहिती, दस्तावेज आणि बॅच यशस्वीरित्या अद्ययावत केले!'
        : '✅ तुमची प्रोफाईल माहिती यशस्वीरित्या सेव्ह झाली!'
    );
    onClose();
  };

  const visibleSubTabs = [
    { id: 'personal', label: '👤 वैयक्तिक माहिती' },
    { id: 'astrology', label: '🪐 कुंडली व पंचांग' },
    { id: 'location', label: '📍 पत्ता व संपर्क' },
    { id: 'education', label: '🎓 शिक्षण व नोकरी' },
    { id: 'family', label: '👨‍👩‍👦 कौटुंबिक माहिती' },
    { id: 'documents', label: isActualAdmin ? '📄 फोटो, दस्तावेज व पडताळणी' : '📷 फोटो व आधार दस्तावेज' },
    ...(isActualAdmin ? [{ id: 'badge', label: '🏅 विशेष बॅचेस व मेम्बरशिप' }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 z-50 overflow-hidden pt-safe pb-safe">
      <div className="bg-[#FFFDF5] w-full h-full sm:h-auto max-w-5xl rounded-none sm:rounded-3xl border-0 sm:border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col sm:my-auto max-h-none sm:max-h-[94vh] animate-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-b-2 border-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A71930] text-amber-200 flex items-center justify-center font-black shadow-md border border-amber-300">
              ✍️
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#A71930] flex items-center gap-2">
                <span>
                  {isActualAdmin
                    ? 'सदस्य प्रोफाईल व दस्तावेज संपादन कक्ष (Full Member Profile Editor)'
                    : 'माझी प्रोफाईल व बायोडाटा संपादन (Edit My Profile)'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-700 font-bold mt-0.5">
                {isActualAdmin ? (
                  <>आयडी: <span className="font-mono text-slate-900 font-black">{profile.id}</span> • नाव: <span className="text-slate-900 font-black">{profile.fullName}</span> • संपर्क: <span className="font-mono text-slate-900">{profile.mobile}</span></>
                ) : (
                  'तुमची वैयक्तिक माहिती, जन्मकुंडली, संपर्क, शिक्षण व फोटो अद्ययावत करा'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-400 text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tab Navigation */}
        <div className="bg-amber-100/60 border-b border-amber-300 p-2 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
          {visibleSubTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer border ${
                activeSubTab === tab.id
                  ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow-sm'
                  : 'bg-white/80 text-slate-700 border-amber-200 hover:bg-amber-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Permission Warning */}
        {!canEdit && (
          <div className="mx-4 mt-3 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-extrabold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>तुम्हाला सदस्य प्रोफाइल संपादित करण्याचे अधिकार नाहीत.</span>
          </div>
        )}

        {/* Modal Form Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: PERSONAL DETAILS */}
          {activeSubTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick Profile Photo Banner & Uploader in Personal Tab */}
              <div className="md:col-span-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#A71930] shadow bg-white shrink-0 relative">
                    <img
                      src={photos[0] || profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                      alt="primary-avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#A71930] flex items-center gap-1">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>मुख्य प्रोफाईल फोटो बदल (Primary Profile Photo)</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                      एकूण जोडलेले फोटो: {photos.length} / ८ | फोटो ऑटो एचडी व कॉम्प्रेस केले जातात.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs cursor-pointer shadow flex items-center gap-1.5 transition-all">
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                        <span>अपलोड होत आहे...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-amber-200" />
                        <span>नवीन फोटो जोडा / बदला</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUploadSim}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('documents')}
                    className="px-3.5 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-[#800C1E] font-extrabold text-xs border border-amber-400 shadow-xs cursor-pointer"
                  >
                    🖼️ गॅलरी फोटो व्यवस्थापित करा
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१. संपूर्ण नाव (Full Name) *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930] focus:ring-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">२. लिंग (Gender) *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                >
                  <option value="bride">वधू (Bride)</option>
                  <option value="groom">वर (Groom)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">३. जन्म तारीख (Date of Birth)</label>
                <input
                  type="date"
                  value={dob}
                  onChange={handleDobChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">४. वय (Age)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">५. वैवाहिक स्थिती (Marital Status)</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                >
                  <option value="never_married">कधीही लग्न झाले नाही (Never Married)</option>
                  <option value="divorced">घटस्फोटित (Divorced)</option>
                  <option value="widowed">विधूर / विधवा (Widowed)</option>
                  <option value="awaiting_divorce">घटस्फोट प्रलंबित (Awaiting Divorce)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">६. उंची (Height)</label>
                <input
                  type="text"
                  placeholder="उदा. 5 ft 6 in"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">७. वजन (Weight)</label>
                <input
                  type="text"
                  placeholder="उदा. 65 kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">८. रक्तगट (Blood Group)</label>
                <input
                  type="text"
                  placeholder="उदा. O+ve, B+ve"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">९. वर्ण / रंग (Complexion)</label>
                <input
                  type="text"
                  placeholder="गोरा, निमगोरा, गव्हाळ, सावळा"
                  value={complexion}
                  onChange={(e) => setComplexion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१०. धर्म (Religion)</label>
                <input
                  type="text"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">११. जात / उपजात (Sub Caste)</label>
                <input
                  type="text"
                  value={subCaste}
                  onChange={(e) => setSubCaste(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१२. थोडक्यात बायो / परिचय (Bio / Introduction)</label>
                <textarea
                  rows={2}
                  placeholder="सदस्याबद्दल थोडक्यात माहिती..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ASTROLOGY / KUNDALI */}
          {activeSubTab === 'astrology' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-100/60 rounded-2xl border border-amber-300">
                <h4 className="font-black text-[#A71930] text-xs flex items-center gap-1.5 mb-3">
                  🪐 पत्रिका व पंचांग माहिती (Horoscope & Astrology Details)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">जन्म वेळ (Birth Time)</label>
                    <input
                      type="text"
                      placeholder="उदा. सकाळी ०८:३०"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">जन्म ठिकाण (Birth Place)</label>
                    <input
                      type="text"
                      placeholder="उदा. पुणे, औरंगाबाद"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">गोत्र (Gotra)</label>
                    <input
                      type="text"
                      placeholder="उदा. काश्यप"
                      value={gotra}
                      onChange={(e) => setGotra(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">राशी (Rashi)</label>
                    <input
                      type="text"
                      placeholder="उदा. मेष, सिंह"
                      value={rashi}
                      onChange={(e) => setRashi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">नक्षत्र (Nakshatra)</label>
                    <input
                      type="text"
                      placeholder="उदा. रोहिणी, अश्विनी"
                      value={nakshatra}
                      onChange={(e) => setNakshatra(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">गण (Gan)</label>
                    <input
                      type="text"
                      placeholder="देव गण, मनुष्य गण, राक्षस गण"
                      value={gan}
                      onChange={(e) => setGan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">नाडी (Nadi)</label>
                    <input
                      type="text"
                      placeholder="आद्य, मध्य, अंत्य"
                      value={nadi}
                      onChange={(e) => setNadi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">कुंडली लिंक / फोटो URL (Horoscope Document URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={horoscopeUrl}
                        onChange={(e) => setHoroscopeUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-mono text-xs bg-white focus:border-[#A71930]"
                      />
                      {horoscopeUrl && (
                        <button
                          type="button"
                          onClick={() => setInspectDocUrl({ url: horoscopeUrl, title: 'कुंडली / पत्रिका' })}
                          className="px-3 py-2 bg-amber-300 hover:bg-amber-400 text-[#800C1E] font-extrabold text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                          <span>पहा</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION & CONTACT */}
          {activeSubTab === 'location' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१. प्राथमिक मोबाईल नंबर *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold font-mono text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">२. पर्यायी मोबाईल नंबर (Secondary Mobile)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={secondaryMobile}
                  onChange={(e) => setSecondaryMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold font-mono text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">३. ई-मेल आयडी (Email ID)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">४. जिल्हा (District)</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">५. तालुका (Taluka)</label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">६. शहर / गाव (City / Village)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-800 font-extrabold text-xs mb-1">७. सध्याचा रहिवासी पत्ता (Current Address)</label>
                <textarea
                  rows={2}
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-800 font-extrabold text-xs mb-1">८. मूळ गावचा पत्ता (Native Address)</label>
                <textarea
                  rows={2}
                  value={nativeAddress}
                  onChange={(e) => setNativeAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION & OCCUPATION */}
          {activeSubTab === 'education' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१. उच्च शिक्षण (Education Details)</label>
                <input
                  type="text"
                  placeholder="उदा. BE Computer, MBA, MD, B.Sc Agriculture"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">२. नोकरी / व्यवसाय (Occupation)</label>
                <input
                  type="text"
                  placeholder="उदा. सरकारी अधिकारी, आयटी इंजिनिअर, शेती व व्यवसाय"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">३. कंपनीचे नाव / ऑफिस (Company Name)</label>
                <input
                  type="text"
                  placeholder="उदा. TCS Pune, Govt Revenue Dept."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">४. वार्षिक उत्पन्न (Annual Income)</label>
                <input
                  type="text"
                  placeholder="उदा. ८ लाख प्रति वर्ष"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              {/* Multi-Tagging Section */}
              <div className="col-span-full pt-3 border-t border-amber-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#A71930]" />
                    <span>५. प्रोफाइल विशेष टॅग्ज व बॅजेस (Special Tags & Badges Selection):</span>
                  </label>
                  <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full font-bold border border-amber-300">
                    {professionTags.length} टॅग्ज निवडले
                  </span>
                </div>

                {/* Selected Tags Display */}
                {professionTags.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 space-y-1">
                    <span className="text-[10px] font-black text-slate-700 block">निवडलेले टॅग्ज:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {professionTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 ${getTagStyleClass(tag)}`}
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTagModal(tag)}
                            className="hover:text-rose-600 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Tag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="उदा. 🌟 विशेष शिफारस, 🏛️ MPSC अधिकारी, 🌾 ५० एकर शेती..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTagModal();
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTagModal}
                    className="shrink-0 px-4 py-2 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>टॅग जोडा</span>
                  </button>
                </div>

                {/* Tag Categories */}
                <div className="space-y-3 pt-1">
                  {TAG_CATEGORIES.map((cat) => {
                    const presets = PROFILE_TAG_PRESETS.filter((p) => p.category === cat.id);
                    return (
                      <div key={cat.id} className="space-y-1.5">
                        <span className="text-xs font-black text-[#800C1E] block">{cat.name}:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {presets.map((preset) => {
                            const isSelected = professionTags.includes(preset.label);
                            return (
                              <button
                                type="button"
                                key={preset.id}
                                onClick={() => {
                                  setProfessionTags((prev) =>
                                    prev.includes(preset.label)
                                      ? prev.filter((t) => t !== preset.label)
                                      : [...prev, preset.label]
                                  );
                                }}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#800C1E] text-amber-100 border-[#800C1E] shadow-xs'
                                    : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                                }`}
                              >
                                <span className="font-extrabold text-xs flex items-center justify-between">
                                  <span>{preset.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                                </span>
                                <span className={`text-[10px] mt-1 ${isSelected ? 'text-amber-200/80' : 'text-slate-500'}`}>
                                  {preset.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAMILY DETAILS */}
          {activeSubTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१. वडिलांचे नाव (Father's Name)</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">२. वडिलांचा व्यवसाय (Father's Occupation)</label>
                <input
                  type="text"
                  value={fatherOccupation}
                  onChange={(e) => setFatherOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">३. आईचे नाव (Mother's Name)</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">४. आईचा व्यवसाय (Mother's Occupation)</label>
                <input
                  type="text"
                  value={motherOccupation}
                  onChange={(e) => setMotherOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">५. भाऊ (Brothers Count)</label>
                <input
                  type="number"
                  value={brothers}
                  onChange={(e) => setBrothers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">६. भावांचा तपशील (Brother Details)</label>
                <input
                  type="text"
                  placeholder="उदा. १ भाऊ (विवाहित - नोकरी)"
                  value={brotherDetails}
                  onChange={(e) => setBrotherDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">७. बहीण (Sisters Count)</label>
                <input
                  type="number"
                  value={sisters}
                  onChange={(e) => setSisters(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">८. बहिणींचा तपशील (Sister Details)</label>
                <input
                  type="text"
                  value={sisterDetails}
                  onChange={(e) => setSisterDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">९. मामाचे नाव (Mama's Name)</label>
                <input
                  type="text"
                  value={mamaName}
                  onChange={(e) => setMamaName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१०. मामाचे मूळ गाव (Mama's Native)</label>
                <input
                  type="text"
                  value={mamaNative}
                  onChange={(e) => setMamaNative(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold text-xs mb-1">११. कुटुंब पद्धती (Family Type)</label>
                <select
                  value={familyType}
                  onChange={(e) => setFamilyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                >
                  <option value="एकत्रित">एकत्रित कुटुंब (Joint Family)</option>
                  <option value="विभक्त">विभक्त कुटुंब (Nuclear Family)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-800 font-extrabold text-xs mb-1">१२. अपेक्षा (Partner Expectations)</label>
                <textarea
                  rows={2}
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  className="w-full p-3 rounded-xl border border-amber-300 font-bold text-xs bg-white focus:border-[#A71930]"
                />
              </div>
            </div>
          )}

          {/* TAB 6: PHOTOS, DOCUMENTS & VERIFICATION INSPECTION */}
          {activeSubTab === 'documents' && (
            <div className="space-y-6">
              
              {/* Profile Photos Inspection & Management */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-300 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#A71930] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#A71930]" />
                      <span>गॅलरी फोटो व्यवस्थापन व क्लाउडनरी स्टोरेज (५ फोटो शिफारस - कमाल ८)</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      सर्व फोटो आपोआप क्लाउडनरी ऑनलाईन क्लाउडवर सेव्ह राहतील व एडमिनकडून डिलीट किंवा मुख्य फोटो बदलता येतील.
                    </p>
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border shadow-xs shrink-0 ${
                    photos.length >= 5 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-200 text-[#800C1E] border-amber-400'
                  }`}>
                    {photos.length} / ५ फोटो (कमाल ८)
                  </span>
                </div>

                {/* Photo Request Alert Banner if Photo Count < 5 */}
                {photos.length < 5 && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 font-black text-xs text-[#800C1E]">
                        <AlertCircle className="w-4 h-4 text-[#A71930] shrink-0" />
                        <span>फोटो कमी आहेत! (सध्या फक्त {photos.length} फोटो जोडले आहेत)</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700">
                        उत्तम प्रतिसादासाठी किमान ५ फोटो आवश्यक आहेत. सदस्याला फोटो अपलोडची सूचना पाठवा:
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleSendTelegramPhotoRequest}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>💬 टेलिग्राम मेसेज</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSendInAppPhotoRequest}
                        className="px-3 py-1.5 bg-[#A71930] hover:bg-[#800C1E] text-amber-100 font-black text-xs rounded-xl shadow flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-300" />
                        <span>🔔 अ‍ॅप अलर्ट पाठवा</span>
                      </button>
                    </div>
                  </div>
                )}

                {photoReqSentMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between">
                    <span>{photoReqSentMsg}</span>
                    <button type="button" onClick={() => setPhotoReqSentMsg(null)} className="text-emerald-700 font-black">✕</button>
                  </div>
                )}

                {photoError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}

                {/* Direct File Picker Input */}
                {photos.length < 8 && (
                  <div className="border-2 border-dashed border-amber-400 rounded-2xl p-3.5 text-center bg-white hover:border-[#A71930] transition-colors relative">
                    {isUploadingPhoto ? (
                      <div className="flex flex-col items-center justify-center py-2 text-[#A71930]">
                        <Loader2 className="w-6 h-6 animate-spin text-[#A71930] mb-1" />
                        <p className="text-xs font-black">फोटो क्लाउडनरी (Cloudinary) सर्व्हरवर सुरक्षित सेव्ह होत आहे...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-center sm:text-left space-y-0.5">
                          <p className="text-xs text-slate-800 font-black flex items-center gap-1">
                            <Cloud className="w-4 h-4 text-sky-600 inline" />
                            <span>नवीन फोटो अपलोड करा (कमाल ८ फोटो पर्यंत)</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            क्लाउडनरीवर फोटो ऑनलाईन सुरक्षित जतन होतात.
                          </p>
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUploadSim}
                            className="hidden"
                            id="admin-photo-upload-field-modal"
                          />
                          <label
                            htmlFor="admin-photo-upload-field-modal"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-[#800C1E] font-black text-xs border border-amber-400 cursor-pointer shadow-sm transition-transform active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#800C1E]" />
                            <span>🖼️ कॉम्प्युटरवरून फोटो निवडा</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5 Structured Photo Slot Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const url = photos[slotIdx];
                    const isPrimary = slotIdx === 0;
                    const slotLabels = [
                      '⭐ १. मुख्य फोटो (Main Avatar)',
                      '🖼️ २. फोटो क्र. २',
                      '🖼️ ३. फोटो क्र. ३',
                      '🖼️ ४. फोटो क्र. ४',
                      '🖼️ ५. फोटो क्र. ५'
                    ];

                    if (url) {
                      return (
                        <div
                          key={slotIdx}
                          className={`relative rounded-2xl overflow-hidden border-2 transition-all group flex flex-col justify-between ${
                            isPrimary ? 'border-[#A71930] ring-2 ring-[#A71930]/20 shadow-md bg-amber-50' : 'border-amber-300 bg-white shadow-xs'
                          }`}
                        >
                          {/* Image Thumbnail */}
                          <div className="relative h-36 bg-slate-900 overflow-hidden">
                            <img src={url} alt={`photo-${slotIdx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            
                            {/* Cloudinary Badge */}
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-cyan-300 text-[8px] font-black border border-cyan-500/40 flex items-center gap-1">
                              <Cloud className="w-2.5 h-2.5 text-cyan-400" />
                              <span>Cloudinary HD</span>
                            </span>

                            {/* Overlay Controls */}
                            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setInspectDocUrl({ url, title: `फोटो #${slotIdx + 1} (${fullName})` })}
                                className="p-1 rounded-full bg-slate-900/90 hover:bg-slate-900 text-amber-200 shadow"
                                title="मोठ्या आकारात पहा"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Slot Info & Buttons */}
                          <div className="p-2 space-y-1.5 bg-amber-50/60 border-t border-amber-200">
                            <p className="text-[10px] font-black text-slate-800 truncate">
                              {slotLabels[slotIdx]}
                            </p>
                            
                            <div className="flex items-center justify-between gap-1">
                              {!isPrimary ? (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryPhoto(slotIdx)}
                                  className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-[#800C1E] text-[9px] font-extrabold border border-amber-400 cursor-pointer"
                                  title="या फोटोला मुख्य फोटो बनवा"
                                >
                                  ⭐ मुख्य करा
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#A71930] text-amber-100 text-[9px] font-black">
                                  ⭐ मुख्य फोटो
                                </span>
                              )}

                              {/* Admin Single-Click Delete Option */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`फोटो #${slotIdx + 1} पूर्णपणे हटवायचा आहे का?`)) {
                                    removePhoto(slotIdx);
                                  }
                                }}
                                className="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 hover:text-rose-900 text-[9px] font-black border border-rose-300 flex items-center gap-0.5 cursor-pointer"
                                title="हा फोटो डिलीट करा"
                              >
                                <Trash2 className="w-3 h-3 text-rose-700" />
                                <span>डिलीट</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Empty Slot Uploader Box
                    return (
                      <div
                        key={slotIdx}
                        className="rounded-2xl border-2 border-dashed border-amber-300 bg-white p-3 text-center flex flex-col items-center justify-center space-y-2 min-h-[160px] hover:border-[#A71930] transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[#A71930]">
                          <Camera className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-700">
                          {slotLabels[slotIdx]}
                        </p>
                        <p className="text-[9px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          (रिकामी जागा)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUploadSim}
                          className="hidden"
                          id={`slot-upload-${slotIdx}`}
                        />
                        <label
                          htmlFor={`slot-upload-${slotIdx}`}
                          className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-[#800C1E] text-[10px] font-black border border-amber-400 cursor-pointer shadow-xs"
                        >
                          + फोटो जोडा
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Photos if more than 5 exist */}
                {photos.length > 5 && (
                  <div className="pt-3 border-t border-amber-200 space-y-2">
                    <p className="text-xs font-black text-[#A71930]">अतिरिक्त फोटो (फोटो क्र. ६ ते ८):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {photos.slice(5).map((url, extraIdx) => {
                        const actualIdx = 5 + extraIdx;
                        return (
                          <div key={actualIdx} className="relative rounded-xl overflow-hidden border border-amber-300 bg-white">
                            <img src={url} alt={`extra-${actualIdx}`} className="w-full h-24 object-cover" />
                            <div className="p-1.5 flex items-center justify-between bg-amber-50">
                              <span className="text-[9px] font-bold text-slate-700">फोटो #{actualIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`फोटो #${actualIdx + 1} डिलीट करायचा का?`)) removePhoto(actualIdx);
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Identity Proof / Aadhaar Document Inspector */}
              <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="font-extrabold text-xs text-[#A71930] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ओळखपत्र / आधार कार्ड पडताळणी (ID Proof / Govt Verification)</span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    isIdVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-400' : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {isIdVerified ? '✅ प्रमाणित (Verified)' : '⚠️ अप्रमाणित (Unverified)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">आधार / ओळखपत्र क्रमांक (Government ID Number)</label>
                    <input
                      type="text"
                      placeholder="उदा. XXXX-XXXX-4589"
                      value={idVerificationNumber}
                      onChange={(e) => setIdVerificationNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-mono font-bold text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">नवीन ओळखपत्र अपलोड (Upload ID Proof Document)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocUpload(e, 'aadhaar')}
                      className="w-full text-xs font-bold text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-200 file:text-[#800C1E] hover:file:bg-amber-300 cursor-pointer"
                    />
                  </div>
                </div>

                {docError && <p className="text-xs text-rose-600 font-bold">{docError}</p>}

                {/* Display Aadhaar Document Preview */}
                {idProofUrl || aadhaarCardUrl ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-amber-200 overflow-hidden border border-amber-400 shrink-0">
                        <img src={idProofUrl || aadhaarCardUrl} alt="Aadhaar ID" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-xs text-slate-900">शासकीय ओळखपत्र (ID Document)</p>
                        <p className="text-[11px] text-slate-600 font-mono">
                          {idVerificationNumber ? `क्रमांक: ${idVerificationNumber}` : 'दस्तऐवज प्रत उपलब्ध'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectDocUrl({ url: idProofUrl || aadhaarCardUrl, title: `शासकीय ओळखपत्र (${fullName})` })}
                        className="px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-[#800C1E] font-black text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>पहा (Inspect)</span>
                      </button>
                      <a
                        href={idProofUrl || aadhaarCardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-800"
                        title="नवीन टॅबमध्ये उघडा"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-bold italic">अद्याप आधार / ओळखपत्र अपलोड केलेले नाही.</p>
                )}
              </div>

              {/* Face Verification & Verification Badges - Admin Controls vs Member View */}
              {isActualAdmin ? (
                <>
                  {/* Face Verification & Selfie Inspection */}
                  <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <h4 className="font-extrabold text-xs text-[#A71930] flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span>फेस व्हेरीफिकेशन स्थिती व सेल्फी (Face Verification & Selfie Inspector)</span>
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFaceVerified}
                          onChange={(e) => {
                            setIsFaceVerified(e.target.checked);
                            if (e.target.checked && !faceVerifiedAt) {
                              setFaceVerifiedAt(new Date().toISOString());
                            }
                          }}
                          className="w-4 h-4 rounded text-[#A71930] focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-black text-slate-800">फेस व्हेरीफाईड घोषित करा</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-black text-blue-900">
                          👤
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-900">
                            फेस पडताळणी स्थिती: {isFaceVerified ? '✅ पूर्ण (Face Verified)' : '❌ अपूर्ण / प्रलंबित'}
                          </p>
                          {faceVerifiedAt && (
                            <p className="text-[10px] text-slate-500 font-bold">
                              प्रमाणित वेळ: {new Date(faceVerifiedAt).toLocaleString('mr-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Verification Flags */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-800 border-b pb-2">
                      🛡️ पडताळणी खुणा (Verification Badges Flags)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={isVerified}
                          onChange={(e) => setIsVerified(e.target.checked)}
                          className="w-4 h-4 rounded text-[#A71930] focus:ring-0"
                        />
                        <span className="text-xs font-bold text-slate-800">सामान्य प्रमाणित</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={isIdVerified}
                          onChange={(e) => setIsIdVerified(e.target.checked)}
                          className="w-4 h-4 rounded text-[#A71930] focus:ring-0"
                        />
                        <span className="text-xs font-bold text-slate-800">ID प्रमाणित</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={isPhotoVerified}
                          onChange={(e) => setIsPhotoVerified(e.target.checked)}
                          className="w-4 h-4 rounded text-[#A71930] focus:ring-0"
                        />
                        <span className="text-xs font-bold text-slate-800">फोटो प्रमाणित</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200">
                        <input
                          type="checkbox"
                          checked={isPremiumVerified}
                          onChange={(e) => setIsPremiumVerified(e.target.checked)}
                          className="w-4 h-4 rounded text-[#A71930] focus:ring-0"
                        />
                        <span className="text-xs font-bold text-slate-800">प्रीमियम प्रमाणित</span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                /* Member's Secure Verification Status (Read-only) */
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-xs border-b border-emerald-200/80 pb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>खाते पडताळणी स्थिती (Profile Verification Status)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="text-slate-600 font-bold">आधार / ओळखपत्र:</span>
                      <span className={`font-black ${isIdVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isIdVerified ? '✅ प्रमाणित (Verified)' : '⏳ पडताळणी प्रलंबित'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="text-slate-600 font-bold">प्रोफाईल फोटो:</span>
                      <span className={`font-black ${isPhotoVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isPhotoVerified ? '✅ प्रमाणित (Verified)' : '⏳ पडताळणी प्रलंबित'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    🛡️ आपण नवीन आधार कार्ड किंवा फोटो जोडल्यास सुरक्षिततेसाठी ॲडमिनद्वारे पडताळणी करून व्हेरिफाईड बॅज दिला जातो.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 7: BADGES & MEMBERSHIP SYSTEM (ADMIN ONLY) */}
          {activeSubTab === 'badge' && isActualAdmin && (
            <div className="space-y-5">
              
              {/* Membership Tier Picker */}
              <div className="p-4 bg-amber-100/70 rounded-2xl border-2 border-amber-300 space-y-3">
                <h4 className="font-black text-xs text-[#A71930] border-b border-amber-200 pb-1">
                  💳 सदस्यत्व प्लॅन (Membership Tier)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'free', label: 'FREE (मोफत)' },
                    { id: 'silver', label: 'SILVER (सिल्व्हर)' },
                    { id: 'gold', label: 'GOLD (गोल्ड)' },
                    { id: 'diamond', label: 'DIAMOND (डायमंड)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMembership(m.id as MembershipTier)}
                      className={`p-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        membership === m.id
                          ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow'
                          : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Badges Assignment */}
              <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border-2 border-amber-300 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#A71930] font-black text-sm">
                    <Award className="w-5 h-5 text-[#A71930] animate-bounce" />
                    <span>विशेष बॅज वितरण & दृश्यमानता (Special Badge Assignment & Control)</span>
                  </div>

                  {/* Hide Badge Toggle Option */}
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={hideBadge}
                      onChange={(e) => setHideBadge(e.target.checked)}
                      className="w-4 h-4 rounded text-[#A71930] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-black text-slate-800">
                      {hideBadge ? '🙈 बॅज लपवला आहे (Hidden)' : '👁️ बॅज दाखवा (Visible)'}
                    </span>
                  </label>
                </div>

                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                  या सदस्याच्या पेमेंट व आवश्यकतेनुसार ४-५ तयार बॅच किंवा स्वतःचे सानुकूल नाव देऊन सत्कार करा. बॅज लपवायचा असल्यास वरील चेकबॉक्स वापरा.
                </p>

                {/* Preset Badges Grid */}
                <div>
                  <label className="block text-slate-800 font-extrabold text-xs mb-2">तयार बॅचेस निवडा (Select Preset Badge):</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignedBadge('');
                        setCustomBadgeText('');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left border cursor-pointer ${
                        assignedBadge === '' ? 'bg-slate-800 text-white border-slate-900 font-black' : 'bg-white border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      ❌ कोणताही बॅज नाही (None)
                    </button>

                    {PRESET_BADGES.map((b) => {
                      const isSelected = assignedBadge === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setAssignedBadge(b.id);
                            setCustomBadgeText('');
                          }}
                          className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow-md ring-2 ring-[#A71930]/30'
                              : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <span>{b.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-300 shrink-0" />}
                        </button>
                      );
                    })}

                    {/* Custom Badge Option Button */}
                    <button
                      type="button"
                      onClick={() => setAssignedBadge('Custom')}
                      className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer flex items-center justify-between ${
                        assignedBadge === 'Custom'
                          ? 'bg-[#A71930] text-amber-100 border-amber-400 shadow-md ring-2 ring-[#A71930]/30'
                          : 'bg-white text-[#800C1E] border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <span>✍️ स्वतःचे नाव द्या (Custom Badge)...</span>
                      {assignedBadge === 'Custom' && <Check className="w-4 h-4 text-amber-300 shrink-0" />}
                    </button>
                  </div>
                </div>

                {/* Custom Badge Text Input */}
                {assignedBadge === 'Custom' && (
                  <div className="p-3 bg-white rounded-xl border border-amber-300 animate-in fade-in space-y-1">
                    <label className="block text-slate-800 font-extrabold text-xs">सानुकूल बॅज नाव (Custom Badge Name):</label>
                    <input
                      type="text"
                      maxLength={30}
                      placeholder="उदा. पाचोरा स्पेशल, डॉक्टर प्रोफाईल, विशेष शिफारस"
                      value={customBadgeText}
                      onChange={(e) => setCustomBadgeText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-black text-xs bg-white focus:border-[#A71930]"
                    />
                  </div>
                )}

                {/* Badge Live Preview */}
                <div className="p-3.5 bg-white rounded-2xl border border-amber-300 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-600">लाइव्ह बॅज कसा दिसेल (Live Badge Preview):</span>
                  <div>
                    {hideBadge ? (
                      <span className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                        🚫 बॅज सध्या प्रोफाईलवर लपवलेला आहे
                      </span>
                    ) : assignedBadge ? (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 text-[#800C1E] border-2 border-amber-400 font-black text-xs inline-flex items-center gap-1 shadow animate-pulse">
                        <Award className="w-4 h-4 text-[#A71930]" />
                        <span>
                          {assignedBadge === 'Custom'
                            ? (customBadgeText || 'सानुकूल बॅज')
                            : (PRESET_BADGES.find((b) => b.id === assignedBadge)?.label || assignedBadge)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">कोणताही बॅज नाही</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Global Privacy Controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800 border-b pb-2">
                  🔒 मोबाईल व फोटो गोपनीयता (Privacy Controls)
                </h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideContact}
                      onChange={(e) => setHideContact(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#A71930] focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-700">📱 मोबाईल नंबर लपवा (Hide Mobile)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hidePhoto}
                      onChange={(e) => setHidePhoto(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#A71930] focus:ring-0"
                    />
                    <span className="text-xs font-bold text-slate-700">📷 फोटो लपवा (Hide Photos)</span>
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-amber-100/70 border-t border-amber-300 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-slate-600 font-bold hidden sm:block">
            टीप: जतन केल्यावर सर्व बदल डेटाबेसमध्ये लगेच अद्ययावत होतील.
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-amber-400 bg-white hover:bg-amber-100 font-black text-xs text-slate-800 cursor-pointer shadow-xs"
            >
              रद्द करा
            </button>
            <button
              onClick={handleSave}
              disabled={!canEdit}
              className={`px-6 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md border ${
                canEdit
                  ? 'bg-emerald-700 hover:bg-emerald-800 border-emerald-600'
                  : 'bg-slate-400 border-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>बदल जतन करा (Save Changes)</span>
            </button>
          </div>
        </div>

      </div>

      {/* DOCUMENT & PHOTO LIGHTBOX INSPECTOR */}
      {inspectDocUrl && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden p-4 space-y-3 shadow-2xl border-2 border-amber-400 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-black text-sm text-[#A71930] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#A71930]" />
                <span>{inspectDocUrl.title}</span>
              </h4>
              <button
                onClick={() => setInspectDocUrl(null)}
                className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 rounded-2xl p-2 flex items-center justify-center min-h-[300px]">
              <img
                src={inspectDocUrl.url}
                alt={inspectDocUrl.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-md"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <a
                href={inspectDocUrl.url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 bg-amber-300 hover:bg-amber-400 text-[#800C1E] font-black text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>डाऊनलोड करा (Download Document)</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
