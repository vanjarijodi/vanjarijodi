import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { MAHARASHTRA_DISTRICTS } from '../data/initialData';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown,
  User,
  GraduationCap,
  MapPin,
  Image as ImageIcon,
  Calendar
} from 'lucide-react';

export const RightFilterDrawer: React.FC = () => {
  const {
    isRightDrawerOpen,
    setIsRightDrawerOpen,
    searchFilters,
    setSearchFilters,
    resetFilters,
    language,
    t,
    siteConfig
  } = useApp();

  const isEn = language === 'en';

  // Accordion active sections state
  const [activeSections, setActiveSections] = useState({
    gender: true,
    age: true,
    profession: true,
    location: true,
    education: true,
    photoOnly: true,
  });

  if (!isRightDrawerOpen) return null;

  const toggleSection = (section: keyof typeof activeSections) => {
    setActiveSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApply = () => {
    setIsRightDrawerOpen(false);
  };

  const handleReset = () => {
    resetFilters();
    alert(isEn ? 'Filters have been reset!' : 'फिल्टर रीसेट केले गेले आहेत!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsRightDrawerOpen(false)}
          className="absolute inset-0 bg-[#0E0103] backdrop-blur-sm"
          id="right-drawer-backdrop"
        />

        {/* Drawer container sliding from right */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="absolute inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col h-full border-l border-amber-200"
        >
          {/* Header area */}
          <div className="p-4 bg-gradient-to-r from-[#800C1E] to-[#A71930] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="font-extrabold text-sm tracking-wide text-amber-100">{isEn ? 'Search Filters' : 'शोध फिल्टर'}</h3>
                <p className="text-[10px] text-amber-200/80 font-bold">{isEn ? 'Find suitable profiles quickly' : 'योग्य वधू-वर जलद शोधा'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsRightDrawerOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
            
            {/* Info notice about simplified search */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 font-bold leading-relaxed flex items-start gap-2 shadow-2xs">
              <span className="text-base shrink-0">💡</span>
              <span>
                {isEn
                  ? 'Key filters for Gender and Profession are pre-configured for easy profile exploration.'
                  : 'सध्या बायोडाटा संख्येनुसार शोध सुलभ ठेवण्यासाठी लिंग (वधू/वर) व नोकरी/व्यवसाय (Profession) हे प्रमुख फिल्टर चालू ठेवण्यात आले आहेत.'}
              </span>
            </div>

            {/* 1. GENDER ACCORDION */}
            {siteConfig?.filterShowGender !== false && (
              <div className="border border-amber-200/80 rounded-2xl overflow-hidden shadow-xs bg-white">
                <button
                  onClick={() => toggleSection('gender')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-amber-50/40 flex items-center justify-between border-b border-amber-100 text-xs font-black text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'Looking For' : 'मी शोधत आहे (Looking For)'}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      activeSections.gender ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeSections.gender && (
                  <div className="p-4 bg-white space-y-2 animate-fadeIn">
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      <button
                        onClick={() => setSearchFilters((p) => ({ ...p, gender: 'all' }))}
                        className={`py-2 px-1 text-[11px] font-black rounded-lg transition-all ${
                          searchFilters.gender === 'all'
                            ? 'bg-[#A71930] text-white shadow'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isEn ? 'All' : 'दोन्ही'}
                      </button>
                      <button
                        onClick={() => setSearchFilters((p) => ({ ...p, gender: 'bride' }))}
                        className={`py-2 px-1 text-[11px] font-black rounded-lg transition-all ${
                          searchFilters.gender === 'bride'
                            ? 'bg-[#A71930] text-white shadow'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isEn ? '👰 Bride' : '👰 वधू'}
                      </button>
                      <button
                        onClick={() => setSearchFilters((p) => ({ ...p, gender: 'groom' }))}
                        className={`py-2 px-1 text-[11px] font-black rounded-lg transition-all ${
                          searchFilters.gender === 'groom'
                            ? 'bg-[#A71930] text-white shadow'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isEn ? '🤵 Groom' : '🤵 वर'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. PROFESSION / JOB ACCORDION (PRIMARY) */}
            <div className="border-2 border-[#A71930]/30 rounded-2xl overflow-hidden shadow-sm bg-white">
              <button
                onClick={() => toggleSection('profession')}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 flex items-center justify-between border-b border-amber-200 text-xs font-black text-[#A71930]"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#A71930]" />
                  <span>{isEn ? 'Profession / Occupation Filter' : 'नोकरी / व्यवसाय / पद (Profession Filter)'}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    activeSections.profession ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeSections.profession && (
                <div className="p-4 bg-white space-y-2.5 animate-fadeIn">
                  <span className="text-[11px] font-black text-slate-700 block">
                    {isEn ? 'Filter by occupation type:' : 'पद / नोकरी प्रकारानुसार प्रोफाइल शोधा:'}
                  </span>
                  <select
                    value={searchFilters.occupation}
                    onChange={(e) =>
                      setSearchFilters((p) => ({ ...p, occupation: e.target.value }))
                    }
                    className="w-full bg-amber-50/60 border-2 border-amber-300 rounded-xl px-3 py-2.5 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#A71930]"
                  >
                    <option value="">{isEn ? '-- All Occupations / Professions --' : '-- सर्व नोकरी / व्यवसाय (All Profiles) --'}</option>
                    <option value="govt">{isEn ? '🏛️ Government Job / Officer (MPSC / UPSC / State)' : '🏛️ सरकारी नोकरी / अधिकारी (Govt Job / MPSC / UPSC)'}</option>
                    <option value="doctor">{isEn ? '🩺 Doctor / Medical (MBBS / BAMS / MD / BHMS)' : '🩺 डॉक्टर / वैद्यकीय (Doctor / MBBS / BAMS / MD)'}</option>
                    <option value="engineer">{isEn ? '💻 Engineer / IT / Software' : '💻 इंजिनिअर / आयटी (Engineer / BE / Software)'}</option>
                    <option value="teacher">{isEn ? '👨‍🏫 Teacher / Professor / Lecturer' : '👨‍🏫 शिक्षक / प्राध्यापक (Teacher / Professor)'}</option>
                    <option value="business">{isEn ? '🏢 Business / Entrepreneur / Contractor' : '🏢 व्यवसाय / उद्योग (Business / Contractor)'}</option>
                    <option value="farmer">{isEn ? '🌾 Farmer / Agriculture' : '🌾 शेतकरी / कृषी (Farmer / Agriculture)'}</option>
                    <option value="lawyer_ca">{isEn ? '⚖️ Lawyer / CA / Advocate' : '⚖️ वकील / सीए (Lawyer / CA / Advocate)'}</option>
                    <option value="private">{isEn ? '💼 Private / Corporate Job' : '💼 कॉर्पोरेट / खाजगी नोकरी (Private Job)'}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Optional extra filters (only if explicitly enabled by admin) */}
            {siteConfig?.filterShowAge === true && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('age')}
                  className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-xs font-black text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'Age Range' : 'वयोमर्यादा (Age Range)'}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      activeSections.age ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeSections.age && (
                  <div className="p-4 bg-white space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 block mb-1">{isEn ? 'Min Age:' : 'किमान वय:'}</span>
                        <select
                          value={searchFilters.minAge}
                          onChange={(e) =>
                            setSearchFilters((p) => ({ ...p, minAge: Number(e.target.value) }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none"
                        >
                          {Array.from({ length: 40 }, (_, i) => 18 + i).map((num) => (
                            <option key={num} value={num}>
                              {num} {isEn ? 'yrs' : 'वर्ष'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-500 block mb-1">{isEn ? 'Max Age:' : 'कमाल वय:'}</span>
                        <select
                          value={searchFilters.maxAge}
                          onChange={(e) =>
                            setSearchFilters((p) => ({ ...p, maxAge: Number(e.target.value) }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none"
                        >
                          {Array.from({ length: 40 }, (_, i) => 18 + i).map((num) => (
                            <option key={num} value={num}>
                              {num} {isEn ? 'yrs' : 'वर्ष'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. DISTRICT / LOCATION ACCORDION */}
            {siteConfig?.filterShowDistrict !== false && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('location')}
                  className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-xs font-black text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'District / City' : 'जिल्हा / शहर (District)'}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      activeSections.location ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeSections.location && (
                  <div className="p-4 bg-white space-y-2 animate-fadeIn">
                    <div>
                      <span className="text-[10px] font-black text-slate-500 block mb-1">{isEn ? 'Select Maharashtra District:' : 'महाराष्ट्र जिल्हा निवडा:'}</span>
                      <select
                        value={searchFilters.district}
                        onChange={(e) =>
                          setSearchFilters((p) => ({ ...p, district: e.target.value }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="">{isEn ? '-- All Districts --' : '-- सर्व जिल्हे (All) --'}</option>
                        {MAHARASHTRA_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. EDUCATION ACCORDION */}
            {siteConfig?.filterShowEducation !== false && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('education')}
                  className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-xs font-black text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'Education' : 'शिक्षण (Education)'}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      activeSections.education ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeSections.education && (
                  <div className="p-4 bg-white space-y-2 animate-fadeIn">
                    <span className="text-[10px] font-black text-slate-500 block mb-1">{isEn ? 'Enter education keyword:' : 'शिक्षण शब्द प्रविष्ट करा:'}</span>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. BE, MBBS, MBA, MPSC, Class-1..." : "उदा. BE, MBBS, MBA, MPSC, Class-1..."}
                      value={searchFilters.education}
                      onChange={(e) =>
                        setSearchFilters((p) => ({ ...p, education: e.target.value }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#A71930]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 5. PHOTO ONLY ACCORDION */}
            {siteConfig?.filterShowVerified !== false && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleSection('photoOnly')}
                  className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 text-xs font-black text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#A71930]" />
                    <span>{isEn ? 'Profiles with Photo' : 'फोटो असलेले प्रोफाईल (Photo Only)'}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      activeSections.photoOnly ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeSections.photoOnly && (
                  <div className="p-4 bg-white animate-fadeIn">
                    <label className="flex items-center justify-between cursor-pointer p-1">
                      <span className="text-xs font-bold text-slate-700">{isEn ? 'Show profiles with photo only:' : 'केवळ फोटो असलेले बायोडाटा दाखवा:'}</span>
                      <input
                        type="checkbox"
                        checked={searchFilters.verifiedOnly}
                        onChange={(e) =>
                          setSearchFilters((p) => ({ ...p, verifiedOnly: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#A71930] rounded cursor-pointer"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
            <button
              onClick={handleReset}
              className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isEn ? 'Reset' : 'रीसेट करा'}</span>
            </button>

            <button
              onClick={handleApply}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#800C1E] to-[#A71930] hover:from-[#6B0918] hover:to-[#8E1427] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4.5 h-4.5 text-white" />
              <span>{isEn ? 'Apply' : 'लागू करा'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
