import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { VanjariJodiLogo } from './VanjariJodiLogo';
import { Printer, X, Download, FileImage, FileText, ChevronDown, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { safeHtml2Canvas } from '../utils/safeHtml2Canvas';
import { jsPDF } from 'jspdf';
import { VerifiedBadge } from './VerifiedBadge';

export const PrintBiodataModal: React.FC<{
  profile: UserProfile | null;
  onClose: () => void;
}> = ({ profile, onClose }) => {
  const { siteConfig } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const exportPrintRef = useRef<HTMLDivElement>(null);

  if (!profile) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-900/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Top Action Bar */}
      <div className="fixed top-4 right-4 z-[110] flex items-center gap-2 print:hidden">
        
        {/* Download Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-xl border border-amber-300 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isGenerating ? 'तयार होत आहे...' : 'बायोडाटा डाउनलोड करा'}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-[120] text-slate-800">
              <button
                onClick={handleDownloadJpg}
                className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center gap-3 text-xs font-bold text-slate-800"
              >
                <FileImage className="w-4 h-4 text-emerald-600" />
                <span>JPG इमेज म्हणून डाउनलोड करा</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center gap-3 text-xs font-bold text-slate-800 border-t border-slate-100"
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
          className="px-5 py-2.5 rounded-full bg-[#A71930] hover:bg-[#800C1E] text-white text-xs font-bold shadow-xl border border-amber-300 flex items-center gap-2 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">प्रिंट / A4 PDF</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white text-slate-700 hover:bg-slate-100 shadow-xl border border-slate-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet Wrapper */}
      <div
        ref={printRef}
        className="w-full max-w-3xl bg-[#FFFDF5] border-2 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-800 my-auto print:border-none print:shadow-none print:p-0 print:w-full print:max-w-none print:bg-white relative overflow-hidden"
      >
        {/* Optional Admin Watermark Logo */}
        {siteConfig?.biodataWatermarkEnabled !== false && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden animate-fade-in"
            style={{ opacity: siteConfig?.biodataWatermarkOpacity ?? 0.12 }}
          >
            <img
              src={
                siteConfig?.biodataWatermarkUrl ||
                siteConfig?.logoUrl ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"
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

        <div className="relative z-10 space-y-0">
          {/* Print Header */}
          <div className="text-center pb-4 border-b-2 border-[#A71930]/30 space-y-1">
            <p className="text-xs sm:text-sm font-bold text-[#A71930] tracking-widest uppercase">
              {siteConfig?.topBarText || '॥ श्री संत भगवान बाबा प्रसन्न ॥'}
            </p>
            
            <div className="flex items-center justify-center gap-3 py-1">
              <VanjariJodiLogo variant="emblem" size={48} />
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

          {/* Profile Identity & Photo Banner */}
          <div className="mt-6 grid grid-cols-12 gap-6 items-center bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
            <div className="col-span-8 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-[#A71930] text-xs font-bold border border-amber-300">
                  आयडी: {profile.id} | वंजारी समाज ({profile.subCaste})
                </span>
                <VerifiedBadge profile={profile} size="sm" showLabel={true} />
              </div>

              <h2 className="text-2xl font-black text-[#A71930]">
                {profile.fullName}
              </h2>
              <p className="text-xs font-bold text-slate-600">
                जन्म तारीख / वय: {profile.dob} ({profile.age} वर्षे)
              </p>
              <p className="text-xs font-semibold text-slate-600">
                सध्याचे शहर / जिल्हा: {profile.city}, {profile.district}
              </p>
            </div>

            <div className="col-span-4 flex justify-end">
              <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-[#A71930] shadow-md bg-slate-100 p-1 relative">
                <img
                  src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt={profile.fullName}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute bottom-2 right-2 text-[8px] bg-black/60 text-amber-300 font-bold px-1 rounded">
                  वंजारी जोडी
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Personal Details */}
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-black text-white bg-[#A71930] px-4 py-1.5 rounded-xl inline-block border border-amber-300">
              १. वैयक्तिक माहिती (Personal Details)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-2xl border border-amber-200">
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

          {/* Section 2: Education & Profession */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-black text-white bg-[#A71930] px-4 py-1.5 rounded-xl inline-block border border-amber-300">
              २. शैक्षणिक व नोकरी माहिती (Education & Career)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 block font-medium">शिक्षण (Degree / Education):</span>
                <span className="font-extrabold text-slate-900 text-sm">{profile.education}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">नोकरी / व्यवसाय (Occupation):</span>
                <span className="font-extrabold text-[#A71930] text-sm">{profile.occupation}</span>
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
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-black text-white bg-[#A71930] px-4 py-1.5 rounded-xl inline-block border border-amber-300">
              ३. कौटुंबिक माहिती (Family Background)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-amber-200">
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
              <div className="col-span-2 pt-2 border-t border-amber-100">
                <span className="text-slate-500 block font-medium">नातेवाईक आडनावे (Relative Surnames):</span>
                <p className="font-bold text-amber-900 mt-1">
                  {profile.relativeSurnames && profile.relativeSurnames.length > 0
                    ? profile.relativeSurnames.join(', ')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Horoscope & Caste */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-black text-white bg-[#A71930] px-4 py-1.5 rounded-xl inline-block border border-amber-300">
              ४. धर्म, जात व गोत्र (Caste & Astro)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs bg-white p-4 rounded-2xl border border-amber-200">
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

          {/* Section 5: Address & Contact */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-black text-white bg-[#A71930] px-4 py-1.5 rounded-xl inline-block border border-amber-300">
              ५. संपर्क व पत्ता (Address & Contact)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-amber-200">
              <div>
                <span className="text-slate-500 block font-medium">कायमचा मूळ पत्ता:</span>
                <span className="font-bold text-slate-800">{profile.nativeAddress || `${profile.taluka}, जिल्हा: ${profile.district}`}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">सध्याचा पत्ता:</span>
                <span className="font-bold text-slate-800">{profile.currentAddress || profile.city}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">संपर्क मोबाईल नंबर:</span>
                <span className="font-extrabold text-[#A71930] text-sm">{profile.mobile}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">ईमेल पत्ता:</span>
                <span className="font-bold text-slate-800">{profile.email || 'उपलब्ध नाही'}</span>
              </div>
            </div>
          </div>

          {/* Play Store Promotion Block for Print */}
          {siteConfig?.biodataPlaystoreAdEnabled !== false && (
            <div className="mt-6 p-3 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 flex items-center justify-between gap-4 text-left">
              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
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
                    className="w-11 h-11 border border-amber-400 p-0.5 bg-white rounded shadow-sm"
                  />
                  <span className="text-[7px] font-black bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-sm tracking-tight uppercase">
                    Scan to Download
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Print Footer Disclaimer */}
          <div className="mt-8 pt-4 border-t border-amber-300 flex items-center justify-between text-[11px] text-slate-500 font-medium">
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
            minHeight: '1130px',
            padding: '40px 45px',
            backgroundColor: '#FFFDF5',
            fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif",
            boxSizing: 'border-box',
            border: '12px double #A71930',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="space-y-4 text-slate-900"
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
                  siteConfig?.logoUrl ||
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"
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

          <div style={{ position: 'relative', zIndex: 10 }} className="space-y-4">
            {/* Blessing Line & Brand Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(167, 25, 48, 0.2)', paddingBottom: '12px' }}>
              <p style={{ fontSize: '18px', fontWeight: 'normal', color: '#d97706', margin: 0, letterSpacing: '1px', fontFamily: "'Yatra One', serif" }}>
                {siteConfig?.topBarText || '॥ श्री संत भगवान बाबा प्रसन्न ॥'}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
                <VanjariJodiLogo variant="emblem" size={58} />
                <div style={{ textAlign: 'left' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: 'normal', color: '#A71930', margin: 0, lineHeight: '1.2', fontFamily: "'Yatra One', serif" }}>
                    {siteConfig?.logoTitle || 'वंजारी जोडी'}
                  </h1>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#d97706', margin: 0, fontFamily: "'Mukta', sans-serif" }}>
                    {siteConfig?.logoSubtitle || 'पवित्र नात्यांची सुंदर सुरुवात'} — अधिकृत बायोडाटा
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Profile Details (Name, Photo, ID, Subcaste) */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '16px' }}>
              <div style={{ flex: 1 }}>
                <div 
                  style={{ 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(167, 25, 48, 0.2)', 
                    backgroundColor: '#fef2f2',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#A71930', padding: '2px 8px', borderRadius: '99px', border: '1px solid #fecaca' }}>
                      आयडी: {profile.id}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fee2e2', color: '#A71930', padding: '2px 8px', borderRadius: '99px', border: '1px solid #fecaca' }}>
                      वंजारी समाज ({profile.subCaste})
                    </span>
                  </div>
                  
                  <h2 style={{ fontSize: '26px', fontWeight: 'normal', color: '#800C1E', margin: '0 0 6px 0', fontFamily: "'Yatra One', serif" }}>
                    {profile.fullName}
                  </h2>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                    🎂 जन्मतारीख / वय: <span style={{ color: '#A71930' }}>{profile.dob} ({profile.age} वर्षे)</span>
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', margin: '4px 0' }}>
                    📍 सध्याचे शहर / जिल्हा: <span style={{ color: '#A71930' }}>{profile.city}, {profile.district}</span>
                  </p>
                </div>
              </div>

              {/* Candidate Photo */}
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div 
                  style={{ 
                    width: '120px', 
                    height: '150px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '3px solid #d97706',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    padding: '3px',
                    position: 'relative'
                  }}
                >
                  <img
                    src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={profile.fullName}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
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
            <div style={{ marginTop: '16px' }}>
              <h3 
                style={{ 
                  fontSize: '13px', 
                  fontWeight: 900, 
                  color: '#fef3c7', 
                  backgroundColor: '#A71930',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                १. वैयक्तिक माहिती (Personal Details)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>उंची (Height):</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.height || '---'}</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>वजन (Weight):</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.weight || '---'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>रक्तगट (Blood Group):</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#A71930', fontWeight: 'bold' }}>{profile.bloodGroup || '---'}</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>रंग / वर्ण (Complexion):</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.complexion || 'गोरा'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>वैवाहिक स्थिती:</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#A71930', fontWeight: 'bold' }}>{profile.maritalStatus === 'never_married' ? 'अविवाहित' : profile.maritalStatus}</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>जन्म वेळ व स्थान:</td>
                    <td style={{ width: '25%', padding: '6px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.birthTime || '---'} ({profile.birthPlace || profile.district})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 2: शैक्षणिक व नोकरी */}
            <div style={{ marginTop: '14px' }}>
              <h3 
                style={{ 
                  fontSize: '13px', 
                  fontWeight: 900, 
                  color: '#fef3c7', 
                  backgroundColor: '#A71930',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                २. शैक्षणिक व नोकरी माहिती (Education & Career)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>शिक्षण (Education):</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.education || '---'}</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>नोकरी / व्यवसाय:</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.occupation || '---'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>वार्षिक उत्पन्न:</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#15803d', fontWeight: 'bold' }}>{profile.income || '---'}</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>नोकरीचे ठिकाण:</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.city}, {profile.district}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: कौटुंबिक माहिती */}
            <div style={{ marginTop: '14px' }}>
              <h3 
                style={{ 
                  fontSize: '13px', 
                  fontWeight: 900, 
                  color: '#fef3c7', 
                  backgroundColor: '#A71930',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ३. कौटुंबिक माहिती (Family Background)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>वडिलांचे नाव:</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.fatherName || '---'} ({profile.fatherOccupation || '---'})</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>आईचे नाव:</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.motherName || '---'} ({profile.motherOccupation || 'गृहणी'})</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>भाऊ व बहीण:</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.brothers || 0} भाऊ, {profile.sisters || 0} बहीण</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>मामांचे नाव व गाव:</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.mamaName || '---'} ({profile.mamaNative || '---'})</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>नातेवाईक आडनावे:</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#7c2d12', fontWeight: 'bold' }}>
                      {profile.relativeSurnames && profile.relativeSurnames.length > 0
                        ? profile.relativeSurnames.join(', ')
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: धर्म, जात व कुंडली */}
            <div style={{ marginTop: '14px' }}>
              <h3 
                style={{ 
                  fontSize: '13px', 
                  fontWeight: 900, 
                  color: '#fef3c7', 
                  backgroundColor: '#A71930',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ४. धर्म, जात व कुंडली (Caste & Astro)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>उपजात:</td>
                    <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#A71930', fontWeight: 'bold' }}>{profile.subCaste || '---'}</td>
                    <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>गोत्र (Gotra):</td>
                    <td style={{ width: '30%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.gotra || 'काश्यप'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '20%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>राशी (Rashi):</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.rashi || '---'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 5: संपर्क व पत्ता */}
            <div style={{ marginTop: '14px' }}>
              <h3 
                style={{ 
                  fontSize: '13px', 
                  fontWeight: 900, 
                  color: '#fef3c7', 
                  backgroundColor: '#A71930',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                ५. संपर्क व पत्ता (Address & Contact)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>कायमचा मूळ पत्ता:</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.nativeAddress || `${profile.taluka || ''}, जिल्हा: ${profile.district || ''}`}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>सध्याचा पत्ता:</td>
                    <td colSpan={3} style={{ padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.currentAddress || profile.city}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>मोबाईल नंबर:</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#A71930', fontWeight: 'bold' }}>{profile.mobile}</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', fontWeight: 'bold', color: '#A71930' }}>ईमेल पत्ता:</td>
                    <td style={{ width: '25%', padding: '5px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{profile.email || 'उपलब्ध नाही'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Google Play Store Ad Banner */}
            {siteConfig?.biodataPlaystoreAdEnabled !== false && (
              <div 
                style={{ 
                  marginTop: '18px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px dashed #d97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 900, color: '#7c2d12', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✨ वंजारी जोडी (VanjariJodi) अधिकृत विवाह मंच
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: '#475569', lineHeight: '1.4' }}>
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
                        width: '42px',
                        height: '42px',
                        border: '1px solid #d97706',
                        padding: '2px',
                        backgroundColor: '#fff',
                        borderRadius: '4px'
                      }}
                    />
                    <span style={{ fontSize: '7px', fontWeight: 900, backgroundColor: '#0f172a', color: '#fde047', padding: '1px 4px', borderRadius: '2px', textTransform: 'uppercase' }}>
                      Scan to Download
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div 
            style={{ 
              marginTop: '20px',
              paddingTop: '10px',
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
