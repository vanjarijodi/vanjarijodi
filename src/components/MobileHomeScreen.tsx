import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModernProfileCard } from './ModernProfileCard';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import {
  Search,
  Sparkles,
  ShieldCheck,
  FileText,
  Crown,
  MessageCircle,
  Send,
  ChevronRight,
  Filter,
  UserCheck,
  CheckCircle2,
  Users,
  User,
  LogOut
} from 'lucide-react';

export const MobileHomeScreen: React.FC = () => {
  const {
    profiles,
    currentUser,
    logout,
    setSearchFilters,
    setCurrentView,
    setIsLoginOpen,
    setLoginModalMode,
    setIsRegisterOpen,
    setIsKundaliModalOpen,
    setIsBioDataMakerOpen,
    setIsPaymentOpen,
    setIsRightDrawerOpen,
    siteConfig,
  } = useApp();

  const [searchDistrict, setSearchDistrict] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('all');

  // Filter profiles
  const allProfiles = profiles || [];
  
  // Recommended profiles (high match percentage or featured)
  const recommendedProfiles = allProfiles.slice(0, 6);
  
  // Verified profiles
  const verifiedProfiles = allProfiles
    .filter((p) => p.aadhaarVerified || p.isVerified)
    .slice(0, 6);

  // Latest profiles
  const latestProfiles = [...allProfiles].reverse().slice(0, 6);

  const handleGenderSelect = (gender: 'bride' | 'groom') => {
    setSearchFilters((prev: any) => ({
      ...prev,
      gender,
      district: searchDistrict || prev.district,
    }));
    setCurrentView('profiles');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFilters((prev: any) => ({
      ...prev,
      district: searchDistrict,
    }));
    setCurrentView('profiles');
  };

  const handleChipClick = (chipId: string) => {
    setActiveFilterChip(chipId);
    if (chipId === 'all') {
      setSearchFilters((prev: any) => ({ ...prev, gender: 'all', minEducation: '', occupationType: '' }));
    } else if (chipId === 'doctors') {
      setSearchFilters((prev: any) => ({ ...prev, minEducation: 'MBBS/MD/BAMS/BHMS' }));
      setCurrentView('profiles');
    } else if (chipId === 'engineers') {
      setSearchFilters((prev: any) => ({ ...prev, minEducation: 'BE/BTech/MCA' }));
      setCurrentView('profiles');
    } else if (chipId === 'govt') {
      setSearchFilters((prev: any) => ({ ...prev, occupationType: 'Government' }));
      setCurrentView('profiles');
    } else if (chipId === 'business') {
      setSearchFilters((prev: any) => ({ ...prev, occupationType: 'Business' }));
      setCurrentView('profiles');
    }
  };

  return (
    <div className="w-full space-y-4 px-3 pb-8 text-slate-800">
      
      {/* 2. LOGO + NOTIFICATION / PROFILE GREETING BANNER */}
      <div className="bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-[#800C1E] font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            {currentUser ? currentUser.fullName.charAt(0) : '॥'}
          </div>
          <div>
            <p className="text-[11px] text-amber-200 font-bold">
              {currentUser ? 'स्वागत आहे' : 'नमस्कार वंजारी बांधवांनो,'}
            </p>
            <h2 className="text-sm font-black truncate max-w-[180px]">
              {currentUser ? currentUser.fullName : 'वंजारी जोडी वधू-वर सूचक'}
            </h2>
          </div>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] transition active:scale-95 shadow-xs flex items-center gap-1"
              title="माझे प्रोफाईल उघडा"
            >
              <User className="w-3.5 h-3.5" />
              <span>प्रोफाईल</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('तुम्हाला खात्यातून लॉग आऊट करायचे आहे का?')) {
                  logout();
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/40 text-amber-200 font-black text-[11px] transition active:scale-95 border border-amber-300/30 flex items-center gap-1"
              title="खात्यातून बाहेर पडा (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span>लॉग आऊट</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setLoginModalMode('member_otp');
              setIsLoginOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition active:scale-95 shadow-xs"
          >
            लॉगिन करा
          </button>
        )}
      </div>

      {/* 3. TRUST / VERIFICATION MESSAGE */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-semibold text-amber-950 shadow-2xs">
        <div className="flex items-center gap-1.5 truncate">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">॥ श्री संत भगवान बाबा प्रसन्न ॥ • १००% आधार पडताळणी</span>
        </div>
        <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md font-black shrink-0">
          अधिकृत
        </span>
      </div>

      {/* 4. MAIN SEARCH SECTION */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 min-h-[44px]"
            >
              <option value="">महाराष्ट्र सर्व ३६ जिल्हे (All Districts)</option>
              {MAHARASHTRA_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsRightDrawerOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 border border-slate-200 text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="सर्व फिल्टर्स"
          >
            <Filter className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 min-h-[44px] active:scale-98 transition cursor-pointer"
        >
          <Search className="w-4 h-4 text-white" />
          <span>स्थळे शोधा (Search Matches)</span>
        </button>
      </form>

      {/* 5. "वर शोधा" / "वधू शोधा" QUICK TOUCH CARDS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* वधू शोधा */}
        <div
          onClick={() => handleGenderSelect('bride')}
          className="bg-gradient-to-br from-rose-50 to-rose-100/60 border border-rose-200 hover:border-rose-300 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition active:scale-95 shadow-2xs min-h-[64px]"
        >
          <div className="w-11 h-11 rounded-xl bg-white text-2xl flex items-center justify-center shadow-xs shrink-0 border border-rose-200">
            👰
          </div>
          <div>
            <h3 className="font-black text-xs text-[#800C1E]">वधू शोधा</h3>
            <p className="text-[10px] text-rose-700 font-semibold">Brides Profile</p>
          </div>
        </div>

        {/* वर शोधा */}
        <div
          onClick={() => handleGenderSelect('groom')}
          className="bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200 hover:border-blue-300 rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition active:scale-95 shadow-2xs min-h-[64px]"
        >
          <div className="w-11 h-11 rounded-xl bg-white text-2xl flex items-center justify-center shadow-xs shrink-0 border border-blue-200">
            🤵
          </div>
          <div>
            <h3 className="font-black text-xs text-[#0F4C81]">वर शोधा</h3>
            <p className="text-[10px] text-blue-700 font-semibold">Grooms Profile</p>
          </div>
        </div>
      </div>

      {/* 6. QUICK FILTERS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
            त्वरित वर्गीकरण
          </span>
          <button
            type="button"
            onClick={() => setCurrentView('profiles')}
            className="text-[11px] text-[#800C1E] font-bold flex items-center"
          >
            सर्व पहा <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
          {[
            { id: 'all', label: 'सर्व' },
            { id: 'doctors', label: '🩺 डॉक्टर / मेडिकल' },
            { id: 'engineers', label: '💻 इंजिनिअर / IT' },
            { id: 'govt', label: '🏛️ शासकीय सेवा' },
            { id: 'business', label: '💼 व्यवसाय' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 min-h-[36px] ${
                activeFilterChip === chip.id
                  ? 'bg-[#800C1E] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7. RECOMMENDED PROFILES */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="font-black text-sm text-slate-900">शिफारस केलेली स्थळे</h3>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('profiles')}
            className="text-xs text-[#800C1E] font-bold flex items-center"
          >
            सर्व ({allProfiles.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {recommendedProfiles.slice(0, 4).map((profile) => (
            <ModernProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </div>

      {/* 8. VERIFIED PROFILES (१००% आधार पडताळणीकृत स्थळे) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-sm text-slate-900">सत्यापित वधू-वर (Aadhaar Verified)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchFilters((prev: any) => ({ ...prev, verifiedOnly: true }));
              setCurrentView('profiles');
            }}
            className="text-xs text-emerald-700 font-bold flex items-center"
          >
            सर्व पहा <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {verifiedProfiles.slice(0, 2).map((profile) => (
            <ModernProfileCard key={`verified-${profile.id}`} profile={profile} />
          ))}
        </div>
      </div>

      {/* 9. LATEST PROFILES (नवीन नोंदणीकृत स्थळे) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-600" />
            <h3 className="font-black text-sm text-slate-900">नवीन नोंदणीकृत स्थळे</h3>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('profiles')}
            className="text-xs text-sky-700 font-bold flex items-center"
          >
            सर्व पहा <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {latestProfiles.slice(0, 2).map((profile) => (
            <ModernProfileCard key={`latest-${profile.id}`} profile={profile} />
          ))}
        </div>
      </div>

      {/* 10. KUNDALI MILAN CARD */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="font-black text-xs text-amber-950">३६ गुण कुंडली मिलन</h4>
          </div>
          <p className="text-[11px] text-amber-800">
            वधू-वर जन्मपत्रिका गुणमिलन व दोष विश्लेषण करा
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsKundaliModalOpen(true)}
          className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs shrink-0 transition active:scale-95 min-h-[44px]"
        >
          गुण जुळवा
        </button>
      </div>

      {/* 11. BIODATA MAKER CARD */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#800C1E]" />
            <h4 className="font-black text-xs text-slate-900">मराठी बायोडाटा मेकर</h4>
          </div>
          <p className="text-[11px] text-slate-600">
            सुंदर व आकर्षक लग्न बायोडाटा PDF डाऊनलोड करा
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBioDataMakerOpen(true)}
          className="px-3 py-2 bg-[#800C1E] hover:bg-[#A71930] text-amber-100 font-black text-xs rounded-xl shadow-xs shrink-0 transition active:scale-95 min-h-[44px]"
        >
          PDF बनवा
        </button>
      </div>

      {/* 12. PREMIUM SERVICE CARD */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-200 fill-amber-200" />
            <h4 className="font-black text-xs text-white">VIP सभासद योजना</h4>
          </div>
          <p className="text-[11px] text-amber-100">
            सर्वोत्तम स्थळ जुळवणी व सुरक्षित चॅट सहाय्य
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (currentUser) {
              setIsPaymentOpen(true);
            } else {
              setIsRegisterOpen(true);
            }
          }}
          className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-xl shadow-xs shrink-0 transition active:scale-95 min-h-[44px]"
        >
          योजना पहा
        </button>
      </div>

      {/* 13. HELP & SUPPORT */}
      <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-[#800C1E] flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-black text-slate-800 text-[11px]">काही अडचण किंवा मदत हवी आहे?</p>
            <p className="text-[10px] text-slate-500">अधिकृत वंजारी समाज टेलिग्राम सहाय्यता केंद्र</p>
          </div>
        </div>

        <a
          href={`https://t.me/${(siteConfig?.telegramUsername || 'Primemultiservice').replace(/^@/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-[#800C1E] hover:bg-[#A71930] text-amber-200 font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition active:scale-95 min-h-[40px]"
        >
          <Send className="w-3 h-3 text-amber-300" />
          <span>चॅट मदत</span>
        </a>
      </div>

    </div>
  );
};
