import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { Printer, X, Download, FileImage, FileText, ChevronDown, ShieldCheck, Sparkles, Lock, ArrowLeft } from 'lucide-react';
import { safeHtml2Canvas } from '../utils/safeHtml2Canvas';
import { jsPDF } from 'jspdf';
import { VerifiedBadge } from './VerifiedBadge';
import { getPhotoAccessStatus } from '../utils/photoAccess';

export const PrintBiodataModal: React.FC<{
  profile: UserProfile | null;
  onClose: () => void;
}> = ({ profile, onClose }) => {
  const { siteConfig, isContactAuthorizedForUser, currentUser, isAdminLoggedIn, isProfilePlanExpired } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const exportPrintRef = useRef<HTMLDivElement>(null);

  if (!profile) return null;

  // Strict check: Member can ONLY download/print their own biodata, or if logged in as Admin
  const isSelf = Boolean(
    currentUser && (
      currentUser.id === profile.id ||
      (currentUser.mobile && profile.mobile && currentUser.mobile === profile.mobile)
    )
  );
  const isUserAdmin = Boolean(currentUser?.isAdmin || isAdminLoggedIn);
  const canDownloadOrPrint = isSelf || isUserAdmin;

  if (!canDownloadOrPrint) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div className="bg-white rounded-3xl border-2 border-rose-300 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-rose-200">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">
              🔒 डाऊनलोड व प्रिंट प्रतिबंधित आहे
            </h3>
            <p className="text-xs text-slate-600 font-bold leading-relaxed">
              आपण फक्त <span className="text-[#800C1E] font-black">स्वतःच्या प्रोफाईलचा बायोडाटा</span> डाऊनलोड अथवा प्रिंट करू शकता. इतर सदस्यांच्या गोपनीयतेच्या सुरक्षेसाठी दुसऱ्या सदस्याचा बायोडाटा डाऊनलोड किंवा सेव्ह करण्यास सक्त मनाई आहे.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 font-medium text-left space-y-1">
            <p className="font-bold flex items-center gap-1 text-[#800C1E]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>गोपनीयता सुरक्षा नियम:</span>
            </p>
            <p>• सदस्य स्वतःचा बायोडाटा डाउनलोड/प्रिंट व शेअर करू शकतात.</p>
            <p>• दुसऱ्या सदस्यांची माहिती केवळ ॲपमध्ये पाहण्यासाठी सुरक्षित ठेवण्यात आली आहे.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:brightness-110 text-amber-100 font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span>← मागे जा (Go Back)</span>
          </button>
        </div>
      </div>
    );
  }

  // Strict Photo Access Verification (Paid members only)
  const photoAccess = getPhotoAccessStatus({
    currentUser,
    targetProfile: profile,
    isProfilePlanExpired,
    isMutualMatch: false,
    siteConfig,
  });
  const isPhotoBlurred = isSelf ? false : photoAccess.isBlurred;

  // Strict check for contact unlock / viewing authorization
  const isAuthorized = Boolean(
    currentUser && (
      currentUser.id === profile.id ||
      currentUser.isAdmin === true ||
      isAdminLoggedIn ||
      isContactAuthorizedForUser(profile.id)
    )
  );

  // Masked privacy strings if not authorized
  const displayMobile = isAuthorized
    ? (profile.mobile || 'माहिती उपलब्ध नाही')
    : profile.mobile
      ? `${profile.mobile.substring(0, 3)}*****${profile.mobile.substring(Math.max(0, profile.mobile.length - 2))} (🔒 संपर्क सुरक्षित)`
      : '🔒 केवळ अधिकृत अनलॉकमध्ये उपलब्ध';

  const displayEmail = isAuthorized
    ? (profile.email || 'उपलब्ध नाही')
    : profile.email
      ? `🔒 *****@${profile.email.split('@')[1] || 'gmail.com'}`
      : '🔒 गोपनीय';

  const displayNativeAddress = isAuthorized
    ? (profile.nativeAddress || `${profile.taluka ? profile.taluka + ', ' : ''}जिल्हा: ${profile.district || ''}`)
    : `तालुका: ${profile.taluka || '---'}, जिल्हा: ${profile.district || '---'} (🔒 घरचा सविस्तर पत्ता गोपनीय)`;

  const displayCurrentAddress = isAuthorized
    ? (profile.currentAddress || profile.city)
    : `शहर: ${profile.city || profile.district} (🔒 अचूक पत्ता गोपनीय)`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJpg = async () => {
    if (!exportPrintRef.current) return;
    setIsGenerating(true);
    setIsDropdownOpen(false);

    try {
      const canvas = await safeHtml2Canvas(exportPrintRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFDF5',
        logging: false
      });

      const image = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = image;
      link.download = `VanjariJodi_Biodata_${(profile?.fullName || 'Profile').replace(/\s+/g, '_')}.jpg`;
      link.click();
    } catch (err) {
      console.error('Error generating JPG biodata:', err);
      alert('बायोडाटा JPG डाउनलोड करताना त्रुटी आली. कृपया प्रिंट पर्याय वापरा.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!exportPrintRef.current) return;
    setIsGenerating(true);
    setIsDropdownOpen(false);

    try {
      const canvas = await safeHtml2Canvas(exportPrintRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFDF5',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
      pdf.save(`VanjariJodi_Biodata_${(profile?.fullName || 'Profile').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF biodata:', err);
      alert('बायोडाटा PDF डाउनलोड करताना त्रुटी आली. कृपया प्रिंट पर्याय वापरा.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Top Left Back Button */}
      <div className="fixed top-4 left-4 z-[110] print:hidden">
        <button
          onClick={onClose}
          className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white font-black text-xs shadow-xl border border-white/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title="मागे जा"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>मागे जा</span>
        </button>
      </div>

      {/* Top Action Bar */}
      <div className="fixed top-4 right-4 z-[110] flex items-center gap-2 print:hidden">
        
        {/* Download Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isGenerating}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-xl border border-amber-300 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isGenerating ? 'तयार होत आहे...' : 'बायोडाटा डाउनलोड करा'}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-[120] text-slate-800">
              <button
                onClick={handleDownloadJpg}
                className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center gap-3 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <FileImage className="w-4 h-4 text-emerald-600" />
                <span>JPG इमेज म्हणून डाउनलोड करा</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center gap-3 text-xs font-bold text-slate-800 border-t border-slate-100 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#A71930]" />
                <span>PDF दस्तऐवज म्हणून डाउनलोड करा</span>
              </button>
            </div>
          )}
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-full bg-[#A71930] hover:bg-[#800C1E] text-white text-xs font-bold shadow-xl border border-amber-300 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">प्रिंट / A4 PDF</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white text-slate-700 hover:bg-slate-100 shadow-xl border border-slate-300 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet Wrapper */}
      <div
        ref={printRef}
        className="w-full max-w-3xl bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl p-4 sm:p-8 shadow-2xl text-slate-800 my-auto print:border-none print:shadow-none print:p-0 print:w-full print:max-w-none print:bg-white relative overflow-hidden"
      >
        {/* Optional Admin Watermark Logo */}
        {siteConfig?.biodataWatermarkEnabled !== false && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
            style={{ opacity: siteConfig?.biodataWatermarkOpacity ?? 0.12 }}
          >
            <img
              src={
                siteConfig?.biodataWatermarkUrl ||
                "/vanjari-jodi-official-logo.png"
              }
              alt="Watermark Logo"
              referrerPolicy="no-referrer"
              className="object-contain"
              style={{
                width: `${siteConfig?.biodataWatermarkSize ?? 35}%`,
                maxWidth: '280px',
                transform: 'rotate(-15deg)',
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
              }}
            />
          </div>
        )}

        <div className="relative z-10 space-y-4">
          {/* Print Header */}
          <div className="text-center pb-3 border-b-2 border-[#A71930]/30 space-y-1">
            <p className="text-xs sm:text-sm font-extrabold text-[#A71930] tracking-wider uppercase">
              ॥ श्री संत भगवान बाबा प्रसन्न ॥
            </p>
            
            <div className="flex items-center justify-center gap-3 py-1">
              <VanjariJodiLogo variant="emblem" size={44} />
              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-[#A71930] tracking-tight">
                  {siteConfig?.logoTitle || 'वंजारी जोडी'}
                </h1>
                <p className="text-xs font-bold text-amber-800">
                  {siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात'} — अधिकृत बायोडाटा
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Security Alert Banner if Not Authorized */}
          {!isAuthorized && (
            <div className="p-2.5 bg-amber-100/90 border border-amber-300 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-950">
              <Lock className="w-4 h-4 text-[#A71930] shrink-0" />
              <span>
                🔒 <b>सुरक्षा टीप:</b> तुम्ही अद्याप या प्रोफाईलचा संपर्क अनलॉक केलेला नाही. त्यामुळे बायोडाटावरील मोबाईल नंबर व पत्ता सुरक्षित (Masked) आहे.
              </span>
            </div>
          )}

          {/* Profile Identity & Photo Banner */}
          <div className="grid grid-cols-12 gap-4 items-center bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
            <div className="col-span-8 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-[#A71930] text-[11px] font-extrabold border border-amber-300">
                  आयडी: {profile.id} | वंजारी समाज ({profile.subCaste})
                </span>
                <VerifiedBadge profile={profile} size="sm" showLabel={true} />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#A71930]">
                {profile.fullName}
              </h2>
              <p className="text-xs font-bold text-slate-700">
                जन्म तारीख / वय: {profile.dob} ({profile.age} वर्षे)
              </p>
              <p className="text-xs font-semibold text-slate-700">
                सध्याचे शहर / जिल्हा: {profile.city}, {profile.district}
              </p>
            </div>

            <div className="col-span-4 flex justify-end">
              <div className="w-28 h-36 rounded-2xl overflow-hidden border-2 border-[#A71930] shadow-md bg-slate-100 p-0.5 relative">
                <img
                  src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt={profile.fullName}
                  className={`w-full h-full object-cover rounded-xl ${isPhotoBlurred ? 'filter blur-md scale-110 opacity-70' : ''}`}
                />
                {isPhotoBlurred && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center">
                    <Lock className="w-6 h-6 text-amber-300 drop-shadow" />
                    <span className="text-[9px] text-amber-200 font-bold mt-1 leading-tight">केवळ सशुल्क सदस्यांसाठी</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 text-[8px] bg-black/70 text-amber-300 font-bold px-1 rounded">
                  वंजारी जोडी
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Personal Details */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-sm font-black text-white bg-[#A71930] px-3 py-1 rounded-lg inline-block border border-amber-300">
              १. वैयक्तिक माहिती (Personal Details)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-white p-3 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 block font-medium">उंची (Height):</span>
                <span className="font-bold text-slate-800">{profile.height}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">वजन (Weight):</span>
                <span className="font-bold text-slate-800">{profile.weight || 'उपलब्ध नाही'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">रक्तगट (Blood Group):</span>
                <span className="font-bold text-[#A71930]">{profile.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">रंग / वर्ण (Complexion):</span>
                <span className="font-bold text-slate-800">{profile.complexion || 'गोरा'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">वैवाहिक स्थिती:</span>
                <span className="font-bold text-[#A71930]">{profile.maritalStatus === 'never_married' ? 'अविवाहित' : profile.maritalStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">जन्म वेळ व स्थान:</span>
                <span className="font-bold text-slate-800">{profile.birthTime || 'सकाळी १०:३०'} ({profile.birthPlace || profile.district})</span>
              </div>
            </div>
          </div>

          {/* Section 2: Education & Career */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-sm font-black text-white bg-[#A71930] px-3 py-1 rounded-lg inline-block border border-amber-300">
              २. शैक्षणिक व नोकरी माहिती (Education & Career)
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-white p-3 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 block font-medium">शिक्षण (Degree / Education):</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{profile.education}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">नोकरी / व्यवसाय (Occupation):</span>
                <span className="font-extrabold text-[#A71930] text-xs sm:text-sm">{profile.occupation}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">वार्षिक उत्पन्न (Annual Income):</span>
                <span className="font-bold text-emerald-700">{profile.income}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">नोकरीचे ठिकाण (Work Location):</span>
                <span className="font-bold text-slate-800">{profile.city}, {profile.district}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Family Details */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-sm font-black text-white bg-[#A71930] px-3 py-1 rounded-lg inline-block border border-amber-300">
              ३. कौटुंबिक माहिती (Family Background)
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-white p-3 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 block font-medium">वडिलांचे नाव व व्यवसाय:</span>
                <span className="font-bold text-slate-900">{profile.fatherName || 'माहिती उपलब्ध'} ({profile.fatherOccupation})</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">आईचे नाव व व्यवसाय:</span>
                <span className="font-bold text-slate-900">{profile.motherName || 'माहिती उपलब्ध'} ({profile.motherOccupation})</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">भाऊ व बहीण:</span>
                <span className="font-bold text-slate-800">{profile.brothers} भाऊ, {profile.sisters} बहीण</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">मामांचे नाव व गाव:</span>
                <span className="font-bold text-slate-800">{profile.mamaName || 'माहिती उपलब्ध'} ({profile.mamaNative || profile.district})</span>
              </div>
              <div className="col-span-2 pt-1.5 border-t border-amber-100">
                <span className="text-slate-500 block font-medium">नातेवाईक आडनावे (Relative Surnames):</span>
                <p className="font-bold text-amber-900 mt-0.5">
                  {profile.relativeSurnames && profile.relativeSurnames.length > 0
                    ? profile.relativeSurnames.join(', ')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Horoscope & Caste */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-sm font-black text-white bg-[#A71930] px-3 py-1 rounded-lg inline-block border border-amber-300">
              ४. धर्म, जात व गोत्र (Caste & Astro)
            </h3>
            <div className="grid grid-cols-3 gap-2.5 text-xs bg-white p-3 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 block font-medium">उपजात (Sub Caste):</span>
                <span className="font-bold text-[#A71930]">{profile.subCaste}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">गोत्र (Gotra):</span>
                <span className="font-bold text-slate-800">{profile.gotra || 'काश्यप'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">राशी (Rashi):</span>
                <span className="font-bold text-slate-800">{profile.rashi || 'मकर'}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Address & Contact (WITH STRICT MASKING ENFORCEMENT) */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-sm font-black text-white bg-[#A71930] px-3 py-1 rounded-lg inline-block border border-amber-300">
              ५. संपर्क व पत्ता (Address & Contact)
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-white p-3 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 block font-medium">कायमचा मूळ पत्ता:</span>
                <span className="font-bold text-slate-800">{displayNativeAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">सध्याचा पत्ता:</span>
                <span className="font-bold text-slate-800">{displayCurrentAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">संपर्क मोबाईल नंबर:</span>
                <span className={`font-extrabold text-xs sm:text-sm ${isAuthorized ? 'text-[#A71930]' : 'text-slate-600 font-mono'}`}>
                  {displayMobile}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">ईमेल पत्ता:</span>
                <span className="font-bold text-slate-800">{displayEmail}</span>
              </div>
            </div>
          </div>

          {/* Play Store Promotion Block for Print */}
          {siteConfig?.biodataPlaystoreAdEnabled !== false && (
            <div className="p-2.5 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center justify-between gap-4 text-left">
              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>वंजारी जोडी (VanjariJodi) अधिकृत विवाह मंच</span>
                </p>
                <p className="text-xs font-bold text-slate-700 leading-snug">
                  {siteConfig?.biodataPlaystoreAdText || '📲 वंजारी जोडी (VanjariJodi) अँप गुगल प्ले स्टोअर वरून आत्ताच डाउनलोड करा!'}
                </p>
              </div>
              
              {siteConfig?.biodataPlaystoreQrEnabled !== false && (
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      siteConfig?.biodataPlaystoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'
                    )}`}
                    alt="Download QR"
                    className="w-10 h-10 border border-amber-400 p-0.5 bg-white rounded shadow-2xs"
                  />
                  <span className="text-[7px] font-black bg-slate-900 text-amber-300 px-1 py-0.5 rounded-xs uppercase">
                    Scan App
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Print Footer Disclaimer */}
          <div className="pt-2 border-t border-amber-300 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <p>© २०२६ {siteConfig?.logoTitle || 'वंजारी जोडी'} — vanjarijodi.web.app</p>
            <p className="font-bold text-[#A71930]">॥ संत भगवान बाबा आशीर्वाद ॥</p>
          </div>
        </div>

      </div>

      {/* HIDDEN HIGH-RES CONTAINER FOR HD QUALITY JPG & PDF DOWNLOAD (NO CLIPPING, NO CUTTING) */}
      <div style={{ position: 'fixed', left: '-1200px', top: '0', width: '800px', zIndex: -50, pointerEvents: 'none' }}>
        <div
          ref={exportPrintRef}
          style={{
            width: '800px',
            minHeight: '1050px',
            padding: '30px 35px',
            backgroundColor: '#FFFDF5',
            fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif",
            boxSizing: 'border-box',
            border: '10px double #A71930',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="text-slate-900"
        >
          {/* Watermark Logo */}
          {siteConfig?.biodataWatermarkEnabled !== false && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 0,
                opacity: siteConfig?.biodataWatermarkOpacity ?? 0.12,
              }}
            >
              <img
                src={
                  siteConfig?.biodataWatermarkUrl ||
                  "/vanjari-jodi-official-logo.png"
                }
                alt="Watermark Logo"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{
                  width: `${(siteConfig?.biodataWatermarkSize ?? 35) * 1.2}%`,
                  maxWidth: '320px',
                  transform: 'rotate(-15deg)',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
                }}
              />
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Blessing Line & Brand Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(167, 25, 48, 0.2)', paddingBottom: '10px', marginBottom: '14px' }}>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#A71930', margin: '0 0 4px 0', letterSpacing: '1px' }}>
                ॥ श्री संत भगवान बाबा प्रसन्न ॥
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                <VanjariJodiLogo variant="emblem" size={50} />
                <div style={{ textAlign: 'left' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: 'black', color: '#A71930', margin: 0, lineHeight: '1.2' }}>
                    {siteConfig?.logoTitle || 'वंजारी जोडी'}
                  </h1>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>
                    {siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात'} — अधिकृत बायोडाटा
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Security Notice if Not Authorized */}
            {!isAuthorized && (
              <div 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #f59e0b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#78350f',
                  marginBottom: '12px'
                }}
              >
                🔒 गोपनीयता सुरक्षा सूचना: वंजारी जोडी धोरणानुसार या बायोडाटाचे मूळ संपर्क क्रमांक व सविस्तर पत्ता सुरक्षित ठेवण्यात आले आहेत.
              </div>
            )}

            {/* Candidate Profile Details (Name, Photo, ID, Subcaste) */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <div 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(167, 25, 48, 0.2)', 
                    backgroundColor: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#A71930', padding: '2px 8px', borderRadius: '99px', border: '1px solid #fecaca' }}>
                      आयडी: {profile.id}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#A71930', padding: '2px 8px', borderRadius: '99px', border: '1px solid #fecaca' }}>
                      वंजारी समाज ({profile.subCaste})
                    </span>
                  </div>
                  
                  <h2 style={{ fontSize: '22px', fontWeight: 'black', color: '#800C1E', margin: '0 0 4px 0' }}>
                    {profile.fullName}
                  </h2>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', margin: '3px 0' }}>
                    🎂 जन्मतारीख / वय: <span style={{ color: '#A71930' }}>{profile.dob} ({profile.age} वर्षे)</span>
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', margin: '3px 0' }}>
                    📍 सध्याचे शहर / जिल्हा: <span style={{ color: '#A71930' }}>{profile.city}, {profile.district}</span>
                  </p>
                </div>
              </div>

              {/* Candidate Photo */}
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div 
                  style={{ 
                    width: '110px', 
                    height: '140px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '3px solid #d97706',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    padding: '2px',
                    position: 'relative'
                  }}
                >
                  <img
                    src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={profile.fullName}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      filter: isPhotoBlurred ? 'blur(10px)' : 'none',
                      opacity: isPhotoBlurred ? 0.65 : 1
                    }}
                  />
                  {isPhotoBlurred && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#fde047', fontWeight: 900 }}>🔒 फोटो लॉक</span>
                    </div>
                  )}
                </div>
                <span 
                  style={{ 
                    fontSize: '8px', 
                    fontWeight: 900, 
                    backgroundColor: '#000000bf', 
                    color: '#fde047', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginTop: '4px'
                  }}
                >
                  वंजारी जोडी
                </span>
              </div>
            </div>

            {/* Section 1: वैयक्तिक माहिती */}
            <div style={{ marginBottom: '12px' }}>
              <h3 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 900, 
                  color: '#ffffff', 
                  backgroundColor: '#A71930',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                १. वैयक्तिक माहिती (Personal Details)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>उंची (Height):</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.height || '---'}</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>वजन (Weight):</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.weight || '---'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>रक्तगट (Blood Group):</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#A71930', fontWeight: 'bold' }}>{profile.bloodGroup || '---'}</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>रंग / वर्ण (Complexion):</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.complexion || 'गोरा'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>वैवाहिक स्थिती:</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#A71930', fontWeight: 'bold' }}>{profile.maritalStatus === 'never_married' ? 'अविवाहित' : profile.maritalStatus}</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>जन्म वेळ व स्थान:</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.birthTime || '---'} ({profile.birthPlace || profile.district})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: शैक्षणिक व नोकरी */}
            <div style={{ marginBottom: '12px' }}>
              <h3 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 900, 
                  color: '#ffffff', 
                  backgroundColor: '#A71930',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                २. शैक्षणिक व नोकरी माहिती (Education & Career)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>शिक्षण (Education):</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.education || '---'}</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>नोकरी / व्यवसाय:</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.occupation || '---'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>वार्षिक उत्पन्न:</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{profile.income || '---'}</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>नोकरीचे ठिकाण:</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.city}, {profile.district}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: कौटुंबिक माहिती */}
            <div style={{ marginBottom: '12px' }}>
              <h3 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 900, 
                  color: '#ffffff', 
                  backgroundColor: '#A71930',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ३. कौटुंबिक माहिती (Family Background)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>वडिलांचे नाव:</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.fatherName || '---'} ({profile.fatherOccupation || '---'})</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>आईचे नाव:</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.motherName || '---'} ({profile.motherOccupation || 'गृहणी'})</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>भाऊ व बहीण:</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.brothers || 0} भाऊ, {profile.sisters || 0} बहीण</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>मामांचे नाव व गाव:</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.mamaName || '---'} ({profile.mamaNative || '---'})</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>नातेवाईक आडनावे:</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#7c2d12', fontWeight: 'bold' }}>
                      {profile.relativeSurnames && profile.relativeSurnames.length > 0
                        ? profile.relativeSurnames.join(', ')
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: धर्म, जात व कुंडली */}
            <div style={{ marginBottom: '12px' }}>
              <h3 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 900, 
                  color: '#ffffff', 
                  backgroundColor: '#A71930',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ४. धर्म, जात व कुंडली (Caste & Astro)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '20%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>उपजात:</td>
                    <td style={{ width: '30%', padding: '4px 0', fontSize: '12px', color: '#A71930', fontWeight: 'bold' }}>{profile.subCaste || '---'}</td>
                    <td style={{ width: '20%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>गोत्र (Gotra):</td>
                    <td style={{ width: '30%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.gotra || 'काश्यप'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '20%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>राशी (Rashi):</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{profile.rashi || '---'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 5: संपर्क व पत्ता (Masked if not authorized) */}
            <div style={{ marginBottom: '12px' }}>
              <h3 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 900, 
                  color: '#ffffff', 
                  backgroundColor: '#A71930',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  margin: '0 0 6px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ५. संपर्क व पत्ता (Address & Contact)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>कायमचा मूळ पत्ता:</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{displayNativeAddress}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>सध्याचा पत्ता:</td>
                    <td colSpan={3} style={{ padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{displayCurrentAddress}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>मोबाईल नंबर:</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: isAuthorized ? '#A71930' : '#475569', fontWeight: 'bold' }}>{displayMobile}</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', fontWeight: 'bold', color: '#A71930' }}>ईमेल पत्ता:</td>
                    <td style={{ width: '25%', padding: '4px 0', fontSize: '12px', color: '#1e293b', fontWeight: 'bold' }}>{displayEmail}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Google Play Store Ad Banner */}
            {siteConfig?.biodataPlaystoreAdEnabled !== false && (
              <div 
                style={{ 
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px dashed #d97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#7c2d12' }}>
                    ✨ वंजारी जोडी (VanjariJodi) अधिकृत विवाह मंच
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: '#475569', lineHeight: '1.3' }}>
                    {siteConfig?.biodataPlaystoreAdText || '📲 वंजारी जोडी (VanjariJodi) अँप गुगल प्ले स्टोअर वरून आत्ताच डाउनलोड करा!'}
                  </p>
                </div>
                
                {siteConfig?.biodataPlaystoreQrEnabled !== false && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                        siteConfig?.biodataPlaystoreUrl || 'https://play.google.com/store/apps/details?id=com.vanjarijodi.app'
                      )}`}
                      alt="Download QR"
                      crossOrigin="anonymous"
                      style={{
                        width: '38px',
                        height: '38px',
                        border: '1px solid #d97706',
                        padding: '1px',
                        backgroundColor: '#fff',
                        borderRadius: '4px'
                      }}
                    />
                    <span style={{ fontSize: '7px', fontWeight: 900, backgroundColor: '#0f172a', color: '#fde047', padding: '1px 4px', borderRadius: '2px', textTransform: 'uppercase' }}>
                      Scan App
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div 
            style={{ 
              marginTop: '14px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(167, 25, 48, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#64748b',
              position: 'relative',
              zIndex: 10
            }}
          >
            <p>© २०२६ {siteConfig?.logoTitle || 'वंजारी जोडी'} — vanjarijodi.web.app</p>
            <p style={{ color: '#A71930' }}>॥ संत भगवान बाबा आशीर्वाद ॥</p>
          </div>
        </div>
      </div>

    </div>
  );
};
