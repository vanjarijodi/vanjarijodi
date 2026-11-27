import React, { useState } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ZoomIn,
  Star,
  Upload,
  ShieldCheck,
  User,
  Send,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';

interface AdminPhotoModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export const AdminPhotoModerationModal: React.FC<AdminPhotoModerationModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const {
    deleteMemberPhoto,
    setPrimaryPhoto,
    addMemberPhoto,
    updateProfileDirect,
    sendPushNotification,
    logActivity,
    trashPhoto,
  } = useApp();

  const [previewZoomImage, setPreviewZoomImage] = useState<{ url: string; title: string } | null>(null);
  const [rejectingPhotoData, setRejectingPhotoData] = useState<{
    photoUrl: string;
    photoType: 'avatar' | 'gallery' | 'selfie' | 'aadhaar_front' | 'aadhaar_back';
    index?: number;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('अस्पष्ट किंवा धुरकट फोटो (Blurry/Low Quality)');
  const [customReason, setCustomReason] = useState<string>('');
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const showFeedback = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // 1. Set photo as primary avatar
  const handleMakePrimary = async (photoUrl: string, galleryIndex?: number) => {
    if (galleryIndex !== undefined && galleryIndex >= 0) {
      setPrimaryPhoto(profile.id, galleryIndex);
    } else {
      // Update directly
      const currentGallery = profile.photos || [];
      const updatedPhotos = [photoUrl, ...currentGallery.filter((p) => p !== photoUrl)];
      await updateProfileDirect(profile.id, {
        photoUrl: photoUrl,
        photos: updatedPhotos,
      });
    }

    logActivity(
      'Photo Set Primary',
      `ॲडमिनने '${profile.fullName}' यांचा मुख्य प्रोफाईल फोटो बदलला.`,
      'Admin'
    );
    showFeedback(`🌟 '${profile.fullName}' यांचा मुख्य फोटो यशस्वीरित्या सेट झाला!`);
  };

  // 2. Delete a photo permanently
  const handleDeletePhoto = async (
    photoUrl: string,
    photoType: 'avatar' | 'gallery' | 'selfie' | 'aadhaar_front' | 'aadhaar_back',
    galleryIndex?: number
  ) => {
    if (!window.confirm('खरोखर हा फोटो हटवायचा आहे का? हा फोटो हटवल्यानंतर सदस्याच्या प्रोफाईलवरून निघून जाईल.')) {
      return;
    }

    if (photoType === 'gallery' && galleryIndex !== undefined) {
      deleteMemberPhoto(profile.id, galleryIndex);
    } else if (photoType === 'avatar') {
      trashPhoto(profile.id, photoUrl, 'avatar', profile.fullName);
      const remaining = (profile.photos || []).filter((p) => p !== photoUrl);
      await updateProfileDirect(profile.id, {
        photoUrl: remaining[0] || '',
        photos: remaining,
      });
    } else if (photoType === 'selfie') {
      trashPhoto(profile.id, photoUrl, 'gallery', profile.fullName);
      await updateProfileDirect(profile.id, {
        selfie_image: '',
        verification_status: 'Pending Review',
      });
    } else if (photoType === 'aadhaar_front') {
      await updateProfileDirect(profile.id, {
        aadhaar_front_image: '',
      });
    } else if (photoType === 'aadhaar_back') {
      await updateProfileDirect(profile.id, {
        aadhaar_back_image: '',
      });
    }

    logActivity(
      'Photo Deleted',
      `ॲडमिनने '${profile.fullName}' यांचा फोटो (${photoType}) हटवला.`,
      'Admin'
    );
    showFeedback(`🗑️ फोटो यशस्वीरित्या हटवला!`);
  };

  // 3. Confirm Photo Rejection & Notify Member
  const handleConfirmRejectPhoto = async () => {
    if (!rejectingPhotoData) return;
    const finalReason = rejectionReason === 'इतर कारण (Other)' ? (customReason.trim() || 'अयोग्य फोटो') : rejectionReason;

    const { photoUrl, photoType, index } = rejectingPhotoData;

    // Delete the photo
    if (photoType === 'gallery' && index !== undefined) {
      deleteMemberPhoto(profile.id, index);
    } else if (photoType === 'avatar') {
      trashPhoto(profile.id, photoUrl, 'avatar', profile.fullName);
      const remaining = (profile.photos || []).filter((p) => p !== photoUrl);
      await updateProfileDirect(profile.id, {
        photoUrl: remaining[0] || '',
        photos: remaining,
        adminNotice: `आपला आधीचा फोटो नाकारण्यात आला आहे: ${finalReason}. कृपया नवीन स्पष्ट फोटो अपलोड करा.`,
      });
    } else if (photoType === 'selfie') {
      await updateProfileDirect(profile.id, {
        selfie_image: '',
        verification_status: 'Rejected',
        rejection_reason: `सेल्फी नाकारली: ${finalReason}`,
      });
    } else if (photoType === 'aadhaar_front' || photoType === 'aadhaar_back') {
      await updateProfileDirect(profile.id, {
        [photoType === 'aadhaar_front' ? 'aadhaar_front_image' : 'aadhaar_back_image']: '',
        verification_status: 'Rejected',
        rejection_reason: `आधार फोटो नाकारला: ${finalReason}`,
      });
    }

    // Send push notification & log
    sendPushNotification(
      profile.id,
      '⚠️ फोटो नाकारण्यात आला (Photo Rejected)',
      `आपला फोटो नाकारण्यात आला आहे: "${finalReason}". कृपया स्पष्ट व योग्य फोटो पुन्हा अपलोड करा.`
    );

    logActivity(
      'Photo Rejected',
      `ॲडमिनने '${profile.fullName}' यांचा फोटो नाकारला: ${finalReason}`,
      'Admin'
    );

    setRejectingPhotoData(null);
    setCustomReason('');
    showFeedback(`❌ फोटो नाकारला आणि सदस्याला सूचना पाठवण्यात आली.`);
  };

  // 4. Admin Direct Photo Upload
  const handleAdminAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrlInput.trim()) return;

    const res = addMemberPhoto(profile.id, newPhotoUrlInput.trim());
    if (res.success) {
      showFeedback('🎉 नवीन फोटो यशस्वीरित्या जोडला!');
      setNewPhotoUrlInput('');
      logActivity(
        'Admin Upload Photo',
        `ॲडमिनने '${profile.fullName}' यांच्या खात्यावर नवीन फोटो जोडला.`,
        'Admin'
      );
    } else {
      alert(res.message);
    }
  };

  // 5. File upload from device (base64 reader)
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 8 * 1024 * 1024) {
      alert('फोटोचा आकार ८ MB पेक्षा कमी असावा.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const b64 = uploadEvent.target?.result as string;
      if (b64) {
        const res = addMemberPhoto(profile.id, b64);
        if (res.success) {
          showFeedback('🎉 फोटो यशस्वीरित्या अपलोड झाला!');
          logActivity('Admin File Upload', `'${profile.fullName}' साठी नवीन फोटो अपलोड केला.`);
        } else {
          alert(res.message);
        }
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('फोटो वाचताना त्रुटी आली.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const galleryList = profile.photos || [];
  const primaryAvatar = profile.photoUrl || galleryList[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-amber-400 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>📸 सदस्य फोटो व्यवस्थापन व मॉडरेटर (Photo Moderation)</span>
              </h2>
              <p className="text-xs text-amber-200 font-bold">
                {profile.fullName} • आयडी: <span className="font-mono text-white">{profile.id}</span> • {profile.district} • {profile.mobile}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toast Feedback */}
        {actionNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-xs opacity-75 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Photos Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Section 1: Main Profile Photo (Avatar) */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>🌟 मुख्य प्रोफाईल फोटो (Primary Avatar)</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                वेबसाईट व शोध परिणामांवर हाच फोटो सर्वात आधी दिसतो
              </span>
            </div>

            {primaryAvatar ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3.5 rounded-xl border border-amber-200">
                <div className="relative group shrink-0">
                  <img
                    src={primaryAvatar}
                    alt={profile.fullName}
                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl border-2 border-[#800C1E] shadow-md cursor-pointer group-hover:opacity-90 transition"
                    onClick={() => setPreviewZoomImage({ url: primaryAvatar, title: `मुख्य प्रोफाईल फोटो: ${profile.fullName}` })}
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewZoomImage({ url: primaryAvatar, title: `मुख्य प्रोफाईल फोटो: ${profile.fullName}` })}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-2xl transition cursor-pointer"
                  >
                    <ZoomIn className="w-6 h-6" />
                  </button>
                  <span className="absolute -top-2 -left-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                    मुख्य फोटो
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{profile.fullName}</h4>
                    <p className="text-xs text-slate-600">
                      लिंग: {profile.gender === 'bride' || (profile.gender as any) === 'female' ? 'वधू (Bride)' : 'वर (Groom)'} • वय: {profile.age} वर्षे • {profile.education}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewZoomImage({ url: primaryAvatar, title: `मुख्य प्रोफाईल फोटो: ${profile.fullName}` })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                      <span>झूम करून पहा</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectingPhotoData({ photoUrl: primaryAvatar, photoType: 'avatar' })}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="फोटो नाकारा आणि सदस्याला सूचना पाठवा"
                    >
                      <XCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>फोटो नाकारा व कारण पाठवा</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(primaryAvatar, 'avatar')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="फोटो थेट काढून टाका"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>थेट हटवा</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-xl border border-dashed border-amber-300 text-slate-500 text-xs font-bold space-y-1">
                <ImageIcon className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
                <p>या सदस्याचा कोणताही मुख्य फोटो अपलोड केलेला नाही.</p>
                <p className="text-[11px] font-normal text-slate-400">खालील गॅलरीमधून फोटो मुख्य म्हणून सेट करा किंवा नवीन फोटो अपलोड करा.</p>
              </div>
            )}
          </div>

          {/* Section 2: Uploaded Gallery Photos */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>🖼️ इतर गॅलरी फोटो (Gallery Photos - एकूण {galleryList.length}/५)</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                सदस्याने स्वतःच्या प्रोफाईलसाठी जोडलेले सर्व फोटो
              </span>
            </div>

            {galleryList.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold space-y-1">
                <Camera className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                <p>या प्रोफाईलवर कोणतेही गॅलरी फोटो उपलब्ध नाहीत.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {galleryList.map((photoUrl, idx) => {
                  const isPrimary = photoUrl === primaryAvatar;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border-2 flex flex-col justify-between space-y-2.5 transition relative ${
                        isPrimary
                          ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="relative group overflow-hidden rounded-xl bg-slate-950">
                        <img
                          src={photoUrl}
                          alt={`गॅलरी फोटो ${idx + 1}`}
                          className="w-full h-44 object-cover cursor-pointer group-hover:scale-105 transition duration-200"
                          onClick={() => setPreviewZoomImage({ url: photoUrl, title: `गॅलरी फोटो #${idx + 1} (${profile.fullName})` })}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewZoomImage({ url: photoUrl, title: `गॅलरी फोटो #${idx + 1} (${profile.fullName})` })}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <ZoomIn className="w-6 h-6" />
                        </button>

                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
                          फोटो #{idx + 1}
                        </span>

                        {isPrimary && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                            🌟 मुख्य फोटो
                          </span>
                        )}
                      </div>

                      {/* Photo Moderation Buttons */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleMakePrimary(photoUrl, idx)}
                            className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
                          >
                            <Star className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                            <span>मुख्य प्रोफाईल फोटो बनवा</span>
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRejectingPhotoData({ photoUrl, photoType: 'gallery', index: idx })}
                            className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition"
                            title="फोटो नाकारा"
                          >
                            <XCircle className="w-3.5 h-3.5 text-amber-700" />
                            <span>नाकारा</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photoUrl, 'gallery', idx)}
                            className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition"
                            title="फोटो हटवा"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>हटवा</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Selfie & Aadhaar Verification Photos */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>🛡️ पडताळणी कागदपत्रे व सेल्फी (KYC & Verification Docs)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {profile.verification_status || 'Pending Review'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Selfie Image */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>🤳 सेल्फी / चेहरा फोटो:</span>
                  {profile.selfie_image ? (
                    <span className="text-[10px] text-emerald-600 font-bold">उपलब्ध</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">नाही</span>
                  )}
                </div>

                {profile.selfie_image ? (
                  <div className="space-y-2">
                    <img
                      src={profile.selfie_image}
                      alt="सेल्फी"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 cursor-pointer"
                      onClick={() => setPreviewZoomImage({ url: profile.selfie_image!, title: `सेल्फी पडताळणी: ${profile.fullName}` })}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(profile.selfie_image!)}
                        className="flex-1 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black cursor-pointer"
                      >
                        मुख्य बनवा
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(profile.selfie_image!, 'selfie')}
                        className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer"
                        title="सेल्फी हटवा"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[11px]">
                    सेल्फी अपलोड नाही
                  </div>
                )}
              </div>

              {/* 2. Aadhaar Front */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>🆔 आधार पुढची बाजू:</span>
                  {profile.aadhaar_front_image ? (
                    <span className="text-[10px] text-emerald-600 font-bold">उपलब्ध</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">नाही</span>
                  )}
                </div>

                {profile.aadhaar_front_image ? (
                  <div className="space-y-2">
                    <img
                      src={profile.aadhaar_front_image}
                      alt="आधार फ्रंट"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 cursor-pointer"
                      onClick={() => setPreviewZoomImage({ url: profile.aadhaar_front_image!, title: `आधार फ्रंट: ${profile.fullName}` })}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewZoomImage({ url: profile.aadhaar_front_image!, title: `आधार फ्रंट: ${profile.fullName}` })}
                        className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        झूम पहा
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(profile.aadhaar_front_image!, 'aadhaar_front')}
                        className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer"
                        title="आधार फ्रंट हटवा"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[11px]">
                    आधार फ्रंट नाही
                  </div>
                )}
              </div>

              {/* 3. Aadhaar Back */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>🆔 आधार मागील बाजू:</span>
                  {profile.aadhaar_back_image ? (
                    <span className="text-[10px] text-emerald-600 font-bold">उपलब्ध</span>
                  ) : (
                    <span className="text-[10px] text-slate-400">नाही</span>
                  )}
                </div>

                {profile.aadhaar_back_image ? (
                  <div className="space-y-2">
                    <img
                      src={profile.aadhaar_back_image}
                      alt="आधार बॅक"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 cursor-pointer"
                      onClick={() => setPreviewZoomImage({ url: profile.aadhaar_back_image!, title: `आधार बॅक: ${profile.fullName}` })}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewZoomImage({ url: profile.aadhaar_back_image!, title: `आधार बॅक: ${profile.fullName}` })}
                        className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        झूम पहा
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(profile.aadhaar_back_image!, 'aadhaar_back')}
                        className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer"
                        title="आधार बॅक हटवा"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[11px]">
                    आधार बॅक नाही
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Admin Direct Photo Upload */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>➕ ॲडमिनकडून सदस्यासाठी नवीन फोटो जोडा किंवा बदला (Admin Upload Photo)</span>
            </div>
            <p className="text-xs text-emerald-800">
              सदस्याने WhatsApp किंवा इतर माध्यमाद्वारे चांगला फोटो पाठवला असल्यास ॲडमिन थेट येथून तो फोटो प्रोफाईलमध्ये जोडू शकतात.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option A: Upload from Computer / Mobile */}
              <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  📁 मोबाईल किंवा संगणकावरून फोटो निवडा:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading || galleryList.length >= 5}
                  onChange={handleDeviceFileUpload}
                  className="w-full text-xs text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">JPG, PNG, WEBP (जास्तीत जास्त ८ MB)</span>
              </div>

              {/* Option B: Image URL */}
              <form onSubmit={handleAdminAddPhoto} className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  🌐 किंवा फोटो लिंक (URL) टाका:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPhotoUrlInput}
                    disabled={galleryList.length >= 5}
                    onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!newPhotoUrlInput.trim() || galleryList.length >= 5}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    जोडा
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 font-bold flex items-center gap-2">
            <span>💡 टीप:</span>
            <span className="text-[11px] font-normal">
              फोटो हटवल्यास किंवा नाकारल्यास सदस्याला तात्काळ Push Notification मिळते.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black rounded-xl text-xs transition cursor-pointer"
          >
            पूर्ण झाले (Close)
          </button>
        </div>

      </div>

      {/* Zoom In Fullscreen Lightbox Modal */}
      {previewZoomImage && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="max-w-3xl w-full flex flex-col items-center space-y-3">
            <div className="w-full flex items-center justify-between text-white px-2">
              <span className="font-bold text-sm">{previewZoomImage.title}</span>
              <button
                type="button"
                onClick={() => setPreviewZoomImage(null)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewZoomImage.url}
              alt="Zoomed"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border-2 border-amber-400"
            />
          </div>
        </div>
      )}

      {/* Reject Photo with Reason Modal */}
      {rejectingPhotoData && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border-2 border-amber-400 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2 text-[#800C1E] font-black text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>फोटो नाकारण्याचे कारण निवडा</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectingPhotoData(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              हा फोटो नाकारल्यास सदस्याच्या प्रोफाइलवरून फोटो निघून जाईल आणि सदस्याला निवडलेल्या कारणासह Push Notification पाठवले जाईल.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                कारणाचा प्रकार:
              </label>
              {[
                'अस्पष्ट किंवा धुरकट फोटो (Blurry/Low Quality)',
                'ग्रुप फोटो किंवा इतर व्यक्तींचा फोटो (Group Photo)',
                'चेहरा स्पष्ट दिसत नाही (Face Not Clear/Covered)',
                'गैरलागू किंवा अयोग्य फोटो (Irrelevant/Inappropriate Content)',
                'फिल्टर जास्त असलेला किंवा अस्पष्ट फोटो (Heavy Filters/Editing)',
                'इतर कारण (Other)',
              ].map((reasonOption) => (
                <label
                  key={reasonOption}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                    rejectionReason === reasonOption
                      ? 'bg-amber-100 border-amber-500 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectionReason === reasonOption}
                    onChange={() => setRejectionReason(reasonOption)}
                    className="text-[#800C1E]"
                  />
                  <span>{reasonOption}</span>
                </label>
              ))}
            </div>

            {rejectionReason === 'इतर कारण (Other)' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  स्पष्ट कारण लिहा:
                </label>
                <input
                  type="text"
                  placeholder="उदा. कृपया समोरचा सरळ पासपोर्ट साईझ फोटो अपलोड करावा..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRejectingPhotoData(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectPhoto}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <XCircle className="w-4 h-4" />
                <span>फोटो नाकारा व सूचना पाठवा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
