import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { VANJARI_SUB_CASTES, VANJARI_CITIES, VanjariSubCasteSeoItem, VanjariCitySeoItem } from '../utils/seoData';
import {
  X,
  MapPin,
  Users,
  Search,
  Sparkles,
  Share2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  HelpCircle,
  ExternalLink,
  Filter,
  Flame,
  ArrowRight,
  Globe2,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { SmartBadgeRow } from './SmartBadgeRow';

interface ProgrammaticSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommunitySlug?: string;
  initialCitySlug?: string;
}

export const ProgrammaticSeoModal: React.FC<ProgrammaticSeoModalProps> = ({
  isOpen,
  onClose,
  initialCommunitySlug,
  initialCitySlug,
}) => {
  const { language, profiles, setSelectedProfileForModal, setSearchFilters, setCurrentView } = useApp();
  const isMr = language === 'mr';

  const [activeTab, setActiveTab] = useState<'subcastes' | 'cities'>(
    initialCitySlug ? 'cities' : 'subcastes'
  );
  const [selectedSubCasteSlug, setSelectedSubCasteSlug] = useState<string>(
    initialCommunitySlug || VANJARI_SUB_CASTES[0].slug
  );
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>(
    initialCitySlug || VANJARI_CITIES[0].slug
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const currentSubCaste: VanjariSubCasteSeoItem = useMemo(() => {
    return VANJARI_SUB_CASTES.find((c) => c.slug === selectedSubCasteSlug) || VANJARI_SUB_CASTES[0];
  }, [selectedSubCasteSlug]);

  const currentCity: VanjariCitySeoItem = useMemo(() => {
    return VANJARI_CITIES.find((c) => c.slug === selectedCitySlug) || VANJARI_CITIES[0];
  }, [selectedCitySlug]);

  // Filter profiles for active selection strictly for Vanjari Samaj
  const matchingProfiles = useMemo(() => {
    if (activeTab === 'subcastes') {
      const subNameEn = currentSubCaste.nameEn.toLowerCase();
      const subNameMr = currentSubCaste.nameMr.toLowerCase();
      return profiles.filter((p) => {
        const casteText = `${p.religion || ''} ${p.subCaste || ''} ${p.fullName || ''}`.toLowerCase();
        return (
          casteText.includes('vanjari') ||
          casteText.includes('वंजारी') ||
          casteText.includes(subNameEn) ||
          casteText.includes(subNameMr) ||
          currentSubCaste.majorGotrasSurnamesEn.some((sn) => casteText.includes(sn.toLowerCase())) ||
          currentSubCaste.majorGotrasSurnamesMr.some((sn) => casteText.includes(sn.toLowerCase()))
        );
      });
    } else {
      const cityKeyword = currentCity.nameEn.toLowerCase();
      const cityMrKeyword = currentCity.nameMr.toLowerCase();
      return profiles.filter((p) => {
        const loc = `${p.district || ''} ${p.city || ''} ${p.taluka || ''}`.toLowerCase();
        return (
          loc.includes(cityKeyword) ||
          loc.includes(cityMrKeyword) ||
          currentCity.landmarksEn.some((l) => loc.includes(l.toLowerCase())) ||
          currentCity.landmarksMr.some((l) => loc.includes(l.toLowerCase())) ||
          currentCity.vanjariTalukasEn.some((t) => loc.includes(t.toLowerCase())) ||
          currentCity.vanjariTalukasMr.some((t) => loc.includes(t.toLowerCase()))
        );
      });
    }
  }, [activeTab, currentSubCaste, currentCity, profiles]);

  if (!isOpen) return null;

  const handleApplyFilterAndExplore = () => {
    if (activeTab === 'subcastes') {
      setSearchFilters((prev) => ({
        ...prev,
        subCaste: currentSubCaste.nameEn.split(' ')[0],
      }));
    } else {
      setSearchFilters((prev) => ({
        ...prev,
        district: currentCity.nameMr.split(' ')[0],
      }));
    }
    onClose();
    setCurrentView('profiles');
  };

  const handleCopyShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vanjarijodi.web.app';
    const link =
      activeTab === 'subcastes'
        ? `${origin}/vanjari-matrimony/${currentSubCaste.slug}`
        : `${origin}/vanjari-matrimony/city/${currentCity.slug}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vanjarijodi.web.app';
    const link =
      activeTab === 'subcastes'
        ? `${origin}/vanjari-matrimony/${currentSubCaste.slug}`
        : `${origin}/vanjari-matrimony/city/${currentCity.slug}`;

    const title = activeTab === 'subcastes' ? currentSubCaste.nameMr : currentCity.nameMr;
    const text = `🚩 *${title} - वंजारी समाज वधू-वर सूचक केंद्र (Vanjari Jodi)* 🚩\n\nमहाराष्ट्र व जगभरातील १००% वंजारी समाजातील सत्यापित वधू-वर बायोडाटा, गोत्र-पत्रिका जुळवणी व मोफत नोंदणीसाठी खालील अधिकृत लिंकवर क्लिक करा:\n🔗 ${link}\n\n॥ श्री संत भगवान बाबा प्रसन्न ॥`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800C1E] via-[#A71930] to-[#600816] text-white p-5 sm:p-6 flex items-center justify-between relative shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Globe2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  🚩 १००% वंजारी समाज पोर्टल
                </span>
                <span className="text-xs text-amber-200 hidden sm:inline">
                  Google & Bing Certified Vanjari Directory Engine
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black font-serif mt-0.5">
                {isMr ? 'वंजारी समाज पोटजात व जिल्हानिहाय शोध केंद्र' : 'Vanjari Samaj Sub-Caste & District Directory'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs (Sub-castes vs Cities) */}
        <div className="bg-amber-50/80 px-5 py-3 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('subcastes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'subcastes'
                  ? 'bg-[#800C1E] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>{isMr ? '१. वंजारी पोटजाती (Vanjari Sub-Castes)' : '1. Vanjari Sub-Castes'}</span>
            </button>

            <button
              onClick={() => setActiveTab('cities')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'cities'
                  ? 'bg-[#800C1E] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{isMr ? '२. वंजारी बालेकिल्ले जिल्हे (Districts & Cities)' : '2. Key Districts & Belts'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Copy Page URL for Google Indexing"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (isMr ? 'कॉपी झाले!' : 'Copied!') : (isMr ? 'SEO लिंक कॉपी करा' : 'Copy SEO Link')}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isMr ? 'WhatsApp वर शेअर करा' : 'WhatsApp Share'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: Left Selection Rail + Right Landing View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Selection Rail */}
          <div className="md:col-span-4 space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              {activeTab === 'subcastes'
                ? isMr ? 'पोटजात निवडा (Select Sub-Caste)' : 'Select Vanjari Sub-Caste'
                : isMr ? 'जिल्हा निवडा (Select District)' : 'Select District'}
            </h3>

            <div className="space-y-1.5 max-h-[220px] md:max-h-[500px] overflow-y-auto pr-1">
              {activeTab === 'subcastes'
                ? VANJARI_SUB_CASTES.map((c) => {
                    const isSelected = c.slug === selectedSubCasteSlug;
                    return (
                      <button
                        key={c.slug}
                        onClick={() => setSelectedSubCasteSlug(c.slug)}
                        className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-[#800C1E] font-bold shadow-sm'
                            : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">{isMr ? c.nameMr : c.nameEn}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{isMr ? c.shortDescMr : c.shortDescEn}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#800C1E]' : 'text-slate-400'}`} />
                      </button>
                    );
                  })
                : VANJARI_CITIES.map((city) => {
                    const isSelected = city.slug === selectedCitySlug;
                    return (
                      <button
                        key={city.slug}
                        onClick={() => setSelectedCitySlug(city.slug)}
                        className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-[#800C1E] font-bold shadow-sm'
                            : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">{isMr ? city.nameMr : city.nameEn}</p>
                          <p className="text-[11px] text-slate-500">{isMr ? city.divisionMr : city.divisionEn}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#800C1E]' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* Right Programmatic SEO Rich Landing Page */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Landing Hero Card */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isMr ? '१००% वंजारी समाज पडताळणीकृत' : '100% Verified Vanjari Profiles'}</span>
                </span>
                <span className="text-xs font-extrabold text-[#800C1E] bg-amber-200 px-3 py-1 rounded-full">
                  🔥 {matchingProfiles.length} {isMr ? 'सक्रिय स्थळे उपलब्ध' : 'Profiles Active'}
                </span>
              </div>

              {/* H1 Title */}
              <h1 className="text-xl sm:text-3xl font-black text-[#800C1E] font-serif leading-tight">
                {activeTab === 'subcastes'
                  ? isMr
                    ? `${currentSubCaste.nameMr} - अधिकृत वधू-वर सूचक केंद्र`
                    : `${currentSubCaste.nameEn} Matrimonial Services & Profiles`
                  : isMr
                    ? `${currentCity.nameMr} वंजारी वधू-वर सूचक केंद्र | विवाह स्थळे`
                    : `${currentCity.nameEn} Vanjari Matrimony - Vadhu Var Profiles in ${currentCity.nameEn}`}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {activeTab === 'subcastes'
                  ? isMr
                    ? currentSubCaste.shortDescMr
                    : currentSubCaste.shortDescEn
                  : isMr
                    ? currentCity.descriptionMr
                    : currentCity.descriptionEn}
              </p>

              {/* Culture & Trad Section */}
              <div className="bg-white/80 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium">
                <p className="font-bold text-[#800C1E] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isMr ? '🚩 वंजारी परंपरा, गोत्र व कुळमहती:' : 'Vanjari Cultural Values & Matchmaking:'}</span>
                </p>
                <p>
                  {activeTab === 'subcastes'
                    ? isMr
                      ? currentSubCaste.cultureTraditionsMr
                      : currentSubCaste.cultureTraditionsEn
                    : isMr
                      ? `॥ श्री संत भगवान बाबा व वामनभाऊंच्या पावन आशीर्वादाने ${currentCity.nameMr} परिसरातील सर्व वंजारी बांधवांसाठी अधिकृत विवाह व्यासपीठ ॥`
                      : `Dedicated matrimonial services with blessings of Sant Bhagwan Baba for Vanjari families in ${currentCity.nameEn}.`}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleApplyFilterAndExplore}
                  className="px-5 py-2.5 rounded-xl bg-[#800C1E] hover:bg-[#9B1227] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer"
                >
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>
                    {isMr
                      ? `${activeTab === 'subcastes' ? currentSubCaste.nameMr : currentCity.nameMr} मधील सर्व स्थळे पहा`
                      : `View all ${activeTab === 'subcastes' ? currentSubCaste.nameEn : currentCity.nameEn} Profiles`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Popular Gotras / Talukas Badges */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>
                  {activeTab === 'subcastes'
                    ? isMr
                      ? 'प्रमुख वंजारी गोत्रे व आडनावे (Major Gotras & Surnames):'
                      : 'Major Vanjari Gotras & Surnames:'
                    : isMr
                      ? 'प्रमुख तालुके व वंजारी वस्त्या (Key Talukas & Localities):'
                      : 'Key Talukas & Localities:'}
                </span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeTab === 'subcastes'
                  ? (isMr ? currentSubCaste.majorGotrasSurnamesMr : currentSubCaste.majorGotrasSurnamesEn).map((sn, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-[#800C1E] border border-amber-300 shadow-2xs"
                      >
                        {sn}
                      </span>
                    ))
                  : (isMr ? currentCity.vanjariTalukasMr : currentCity.vanjariTalukasEn).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-[#800C1E] border border-amber-300 shadow-2xs"
                      >
                        {t}
                      </span>
                    ))}
              </div>
            </div>

            {/* Live Profile Previews */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#800C1E]" />
                  <span>
                    {isMr
                      ? `सत्यापित वंजारी वधू-वर स्थळे (${matchingProfiles.length})`
                      : `Verified Vanjari Profiles (${matchingProfiles.length})`}
                  </span>
                </h3>
              </div>

              {matchingProfiles.length === 0 ? (
                <div className="text-center py-8 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <p className="text-sm font-bold text-slate-600">
                    {isMr
                      ? 'या निवडीसाठी नवीन बायोडाटा पडताळणी प्रक्रियेत आहेत. मुख्य यादीतून इतर स्थळे शोधा.'
                      : 'New profiles are currently undergoing verification for this selection.'}
                  </p>
                  <button
                    onClick={handleApplyFilterAndExplore}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#800C1E] text-white text-xs font-bold"
                  >
                    {isMr ? 'सर्व वंजारी स्थळे पहा' : 'View All Vanjari Profiles'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingProfiles.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProfileForModal(p);
                        onClose();
                      }}
                      className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#800C1E] hover:shadow-md transition cursor-pointer flex gap-3 items-center group"
                    >
                      <img
                        src={p.photoUrl || (p.gender === 'Female' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
                        alt={p.fullName}
                        className="w-14 h-14 rounded-xl object-cover border border-amber-300 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#800C1E]">
                            {p.fullName}
                          </h4>
                          {p.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {p.age} वर्षे • {p.education}
                        </p>
                        <p className="text-[11px] font-semibold text-amber-800 truncate">
                          {p.occupation} • {p.city || p.district}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#800C1E] shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Structured FAQs for Google SEO Crawlers */}
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#800C1E] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>{isMr ? 'वारंवार विचारले जाणारे प्रश्न (Vanjari Matrimony FAQs):' : 'Frequently Asked Questions:'}</span>
              </h3>
              
              <div className="space-y-2">
                {(activeTab === 'subcastes' ? currentSubCaste.faqs : currentCity.faqs).map((faq, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-900 mb-1">
                      ❓ {isMr ? faq.qMr : faq.qEn}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      💡 {isMr ? faq.aMr : faq.aEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
