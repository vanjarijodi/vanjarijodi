import React, { useState } from 'react';
import {
  Camera,
  Search,
  Filter,
  ZoomIn,
  Trash2,
  XCircle,
  CheckCircle2,
  Star,
  User,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { AdminPhotoModerationModal } from './AdminPhotoModerationModal';

export const AdminPhotoGalleryModerator: React.FC = () => {
  const {
    profiles,
    deleteMemberPhoto,
    setPrimaryPhoto,
    updateProfileDirect,
    sendPushNotification,
    logActivity,
    trashPhoto,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'avatars' | 'gallery' | 'selfie' | 'kyc_docs'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'bride' | 'groom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfileForModeration, setSelectedProfileForModeration] = useState<UserProfile | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; member: UserProfile } | null>(null);
  
  // Quick Reject
  const [rejectingItem, setRejectingItem] = useState<{
    member: UserProfile;
    photoUrl: string;
    photoType: 'avatar' | 'gallery' | 'selfie' | 'aadhaar_front' | 'aadhaar_back';
    index?: number;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('अस्पष्ट किंवा धुरकट फोटो (Blurry/Low Quality)');

  // Collect all photos with metadata
  interface PhotoItem {
    id: string;
    photoUrl: string;
    photoType: 'avatar' | 'gallery' | 'selfie' | 'aadhaar_front' | 'aadhaar_back';
    typeLabel: string;
    isPrimary: boolean;
    member: UserProfile;
    galleryIndex?: number;
  }

  const allPhotos: PhotoItem[] = [];

  profiles.forEach((member) => {
    // 1. Primary avatar
    if (member.photoUrl) {
      allPhotos.push({
        id: `${member.id}-avatar`,
        photoUrl: member.photoUrl,
        photoType: 'avatar',
        typeLabel: '🌟 मुख्य फोटो',
        isPrimary: true,
        member,
      });
    }

    // 2. Gallery photos
    if (member.photos && member.photos.length > 0) {
      member.photos.forEach((ph, idx) => {
        if (ph && ph !== member.photoUrl) {
          allPhotos.push({
            id: `${member.id}-gallery-${idx}`,
            photoUrl: ph,
            photoType: 'gallery',
            typeLabel: `🖼️ गॅलरी #${idx + 1}`,
            isPrimary: false,
            member,
            galleryIndex: idx,
          });
        }
      });
    }

    // 3. Selfie image
    if (member.selfie_image) {
      allPhotos.push({
        id: `${member.id}-selfie`,
        photoUrl: member.selfie_image,
        photoType: 'selfie',
        typeLabel: '🤳 सेल्फी KYC',
        isPrimary: false,
        member,
      });
    }

    // 4. Aadhaar Front & Back
    if (member.aadhaar_front_image) {
      allPhotos.push({
        id: `${member.id}-aadhaar-front`,
        photoUrl: member.aadhaar_front_image,
        photoType: 'aadhaar_front',
        typeLabel: '🆔 आधार फ्रंट',
        isPrimary: false,
        member,
      });
    }
    if (member.aadhaar_back_image) {
      allPhotos.push({
        id: `${member.id}-aadhaar-back`,
        photoUrl: member.aadhaar_back_image,
        photoType: 'aadhaar_back',
        typeLabel: '🆔 आधार बॅक',
        isPrimary: false,
        member,
      });
    }
  });

  // Filter photos
  const filteredPhotos = allPhotos.filter((item) => {
    if (filterType === 'avatars' && item.photoType !== 'avatar') return false;
    if (filterType === 'gallery' && item.photoType !== 'gallery') return false;
    if (filterType === 'selfie' && item.photoType !== 'selfie') return false;
    if (filterType === 'kyc_docs' && item.photoType !== 'aadhaar_front' && item.photoType !== 'aadhaar_back') return false;

    if (genderFilter !== 'all' && item.member.gender !== genderFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = item.member.fullName?.toLowerCase().includes(q);
      const matchesId = item.member.id?.toLowerCase().includes(q);
      const matchesMobile = item.member.mobile?.includes(q);
      const matchesDistrict = item.member.district?.toLowerCase().includes(q);
      if (!matchesName && !matchesId && !matchesMobile && !matchesDistrict) return false;
    }

    return true;
  });

  const handleQuickDelete = async (item: PhotoItem) => {
    if (!window.confirm(`खरोखर '${item.member.fullName}' यांचा हा फोटो हटवायचा आहे का?`)) return;

    if (item.photoType === 'gallery' && item.galleryIndex !== undefined) {
      deleteMemberPhoto(item.member.id, item.galleryIndex);
    } else if (item.photoType === 'avatar') {
      trashPhoto(item.member.id, item.photoUrl, 'avatar', item.member.fullName);
      const remaining = (item.member.photos || []).filter((p) => p !== item.photoUrl);
      await updateProfileDirect(item.member.id, {
        photoUrl: remaining[0] || '',
        photos: remaining,
      });
    } else if (item.photoType === 'selfie') {
      trashPhoto(item.member.id, item.photoUrl, 'gallery', item.member.fullName);
      await updateProfileDirect(item.member.id, {
        selfie_image: '',
      });
    } else if (item.photoType === 'aadhaar_front') {
      await updateProfileDirect(item.member.id, {
        aadhaar_front_image: '',
      });
    } else if (item.photoType === 'aadhaar_back') {
      await updateProfileDirect(item.member.id, {
        aadhaar_back_image: '',
      });
    }

    logActivity('Photo Removed', `'${item.member.fullName}' यांचा फोटो हटवला.`);
  };

  const handleConfirmQuickReject = async () => {
    if (!rejectingItem) return;
    const { member, photoUrl, photoType, index } = rejectingItem;

    if (photoType === 'gallery' && index !== undefined) {
      deleteMemberPhoto(member.id, index);
    } else if (photoType === 'avatar') {
      trashPhoto(member.id, photoUrl, 'avatar', member.fullName);
      const remaining = (member.photos || []).filter((p) => p !== photoUrl);
      await updateProfileDirect(member.id, {
        photoUrl: remaining[0] || '',
        photos: remaining,
        adminNotice: `आपला फोटो नाकारला: ${rejectionReason}`,
      });
    } else if (photoType === 'selfie') {
      await updateProfileDirect(member.id, {
        selfie_image: '',
        rejection_reason: `सेल्फी नाकारली: ${rejectionReason}`,
      });
    }

    sendPushNotification(
      member.id,
      '⚠️ फोटो नाकारण्यात आला (Photo Rejected)',
      `आपला फोटो नाकारण्यात आला आहे: "${rejectionReason}". कृपया स्पष्ट फोटो पुन्हा अपलोड करा.`
    );

    logActivity('Photo Rejected', `'${member.fullName}' यांचा फोटो नाकारला: ${rejectionReason}`);
    setRejectingItem(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#800C1E] text-white rounded-3xl shadow-lg border-2 border-amber-400 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400/20 rounded-2xl border border-amber-300/40 text-amber-200 shadow-md">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2">
                <span>📸 सर्व सदस्य फोटो गॅलरी व नियंत्रण केंद्र (All Photos Moderation)</span>
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                सदस्यांनी अपलोड केलेले सर्व मुख्य फोटो, गॅलरी, सेल्फी व आधार फोटो एकाच ठिकाणी तपासा, नाकारा किंवा बदला.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow">
              एकूण {filteredPhotos.length} फोटो
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-300 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="सदस्याचे नाव, मोबाईल, जिल्हा किंवा आयडी द्वारे शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-amber-300/50 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-amber-200/60 outline-none focus:bg-white/20"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition ${
                filterType === 'all'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              सर्व फोटो ({allPhotos.length})
            </button>
            <button
              onClick={() => setFilterType('avatars')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition ${
                filterType === 'avatars'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              🌟 मुख्य फोटो
            </button>
            <button
              onClick={() => setFilterType('gallery')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition ${
                filterType === 'gallery'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              🖼️ गॅलरी फोटो
            </button>
            <button
              onClick={() => setFilterType('selfie')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition ${
                filterType === 'selfie'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              🤳 सेल्फी KYC
            </button>
            <button
              onClick={() => setFilterType('kyc_docs')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition ${
                filterType === 'kyc_docs'
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/10 text-amber-100 hover:bg-white/20'
              }`}
            >
              🆔 आधार फोटो
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Photos */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-amber-300 space-y-2">
          <Camera className="w-12 h-12 text-amber-400 mx-auto opacity-60" />
          <p className="font-bold text-slate-700 text-sm">कोणतेही फोटो सापडले नाहीत.</p>
          <p className="text-xs text-slate-400">कृपया फिल्टर किंवा सर्च क्वेरी तपासा.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredPhotos.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border-2 border-amber-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-950">
                <img
                  src={item.photoUrl}
                  alt={item.member.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200 cursor-pointer"
                  onClick={() => setLightboxImage({ url: item.photoUrl, title: `${item.typeLabel} - ${item.member.fullName}`, member: item.member })}
                />
                
                {/* Type Tag Badge */}
                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-amber-300 font-black text-[10px] px-2 py-0.5 rounded-md">
                  {item.typeLabel}
                </span>

                {/* Hover Quick Action overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLightboxImage({ url: item.photoUrl, title: `${item.typeLabel} - ${item.member.fullName}`, member: item.member })}
                    className="p-2 bg-white/30 hover:bg-white text-slate-900 rounded-full cursor-pointer transition"
                    title="मोठा फोटो पहा"
                  >
                    <ZoomIn className="w-4 h-4 text-white hover:text-slate-900" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProfileForModeration(item.member)}
                    className="p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full cursor-pointer transition shadow"
                    title="या सदस्याचे सर्व फोटो मॅनेज करा"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Member Card Details */}
              <div className="p-2.5 space-y-2">
                <div>
                  <div className="font-black text-xs text-slate-900 truncate" title={item.member.fullName}>
                    {item.member.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {item.member.gender === 'bride' || (item.member.gender as any) === 'female' ? '👰 वधू' : '🤵 वर'} • {item.member.district}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProfileForModeration(item.member)}
                    className="py-1 px-1.5 bg-amber-50 hover:bg-amber-100 text-[#800C1E] border border-amber-300 rounded-lg text-[10px] font-black cursor-pointer transition text-center truncate"
                  >
                    सर्व फोटो
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectingItem({ member: item.member, photoUrl: item.photoUrl, photoType: item.photoType, index: item.galleryIndex })}
                    className="py-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-[10px] font-bold cursor-pointer transition text-center truncate"
                  >
                    नाकारा
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Photo Moderation Modal */}
      {selectedProfileForModeration && (
        <AdminPhotoModerationModal
          isOpen={Boolean(selectedProfileForModeration)}
          onClose={() => setSelectedProfileForModeration(null)}
          profile={selectedProfileForModeration}
        />
      )}

      {/* Lightbox Preview */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="max-w-3xl w-full flex flex-col items-center space-y-3">
            <div className="w-full flex items-center justify-between text-white px-2">
              <div>
                <h3 className="font-bold text-sm">{lightboxImage.title}</h3>
                <p className="text-xs text-amber-300">{lightboxImage.member.district} • {lightboxImage.member.mobile}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const m = lightboxImage.member;
                    setLightboxImage(null);
                    setSelectedProfileForModeration(m);
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                >
                  सर्व फोटो व्यवस्थापित करा
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <img
              src={lightboxImage.url}
              alt="Zoomed"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border-2 border-amber-400"
            />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border-2 border-amber-400 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <h3 className="font-black text-sm text-[#800C1E]">
                फोटो नाकारण्याचे कारण निवडा ({rejectingItem.member.fullName})
              </h3>
              <button onClick={() => setRejectingItem(null)} className="p-1 text-slate-500">✕</button>
            </div>
            <div className="space-y-2">
              {[
                'अस्पष्ट किंवा धुरकट फोटो (Blurry/Low Quality)',
                'ग्रुप फोटो किंवा इतर व्यक्तींचा फोटो (Group Photo)',
                'चेहरा स्पष्ट दिसत नाही (Face Not Clear/Covered)',
                'गैरलागू किंवा अयोग्य फोटो (Irrelevant/Inappropriate Content)',
                'फिल्टर जास्त असलेला किंवा अस्पष्ट फोटो (Heavy Filters)',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    rejectionReason === reason ? 'bg-amber-100 border-amber-500 text-amber-950' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="quickRejectReason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setRejectingItem(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
              >
                रद्द करा
              </button>
              <button
                onClick={handleConfirmQuickReject}
                className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black"
              >
                नाकारा व सूचना पाठवा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
